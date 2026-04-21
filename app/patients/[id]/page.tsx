import { resolveAtpeCase } from '@/features/atpe/services/resolve-atpe-case'
import { PatientAtpeSourceBadge } from '@/features/atpe/components/PatientAtpeSourceBadge'
import { PatientClinicalTabs } from '@/features/patients/components/PatientClinicalTabs'

type PageProps = {
  params: Promise<{ id: string }>
}

function safeText(value: unknown, fallback = '—') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function deriveSource(
  summarySource?: string | null,
  sessionsSource?: string | null,
  clinicalSource?: string | null
): 'database' | 'seed_fallback' | 'mixed' | 'unavailable' | 'unknown' {
  const s1 = summarySource ?? 'unknown'
  const s2 = sessionsSource ?? 'unknown'
  const s3 = clinicalSource ?? 'unknown'

  if (s3 === 'unavailable' && s1 === 'unknown' && s2 === 'unknown') {
    return 'unavailable'
  }

  const normalized = [s1, s2, s3].filter(
    (value) => value === 'database' || value === 'seed_fallback'
  )

  if (normalized.length === 0) {
    return s3 === 'unavailable' ? 'unavailable' : 'unknown'
  }

  const unique = new Set(normalized)

  if (unique.size === 1) {
    return normalized[0] as 'database' | 'seed_fallback'
  }

  return 'mixed'
}

function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: 'default' | 'good' | 'warn' | 'accent'
}) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-200 bg-emerald-50'
      : tone === 'warn'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'accent'
      ? 'border-blue-200 bg-blue-50'
      : 'border-slate-200 bg-white'

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params
  const data = await resolveAtpeCase(id)

  const patient = data.patient
  const caseData = data.case
  const sessions = Array.isArray(data.sessions) ? data.sessions : []
  const protocols = Array.isArray(data.protocols) ? data.protocols : []
  const protocolExecution = Array.isArray(data.protocol_execution) ? data.protocol_execution : []
  const goals = Array.isArray(data.goals) ? data.goals : []
  const goalReviews = Array.isArray(data.goal_reviews) ? data.goal_reviews : []
  const alerts = Array.isArray(data.active_alerts) ? data.active_alerts : []

  const source = deriveSource(
    data.resolution?.summary_source,
    data.resolution?.sessions_source,
    data.resolution?.clinical_source
  )

  const overviewForDashboard = data.overview
    ? {
        ...data.overview,
        latest_expression_assessment:
          data.expression_assessment ??
          data.overview.latest_expression_assessment ??
          null,
      }
    : null

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {safeText(patient.display_name, 'Patient')}
                </h1>
                <PatientAtpeSourceBadge source={source} />
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                <div><span className="font-medium text-slate-700">Référence dossier :</span> {safeText(patient.case_reference)}</div>
                <div><span className="font-medium text-slate-700">Code :</span> {safeText(patient.code)}</div>
                <div><span className="font-medium text-slate-700">Statut :</span> {safeText(patient.status)}</div>
                <div><span className="font-medium text-slate-700">Modalité :</span> {safeText(caseData.modality)}</div>
                <div><span className="font-medium text-slate-700">Cadre :</span> {safeText(caseData.setting)}</div>
                <div><span className="font-medium text-slate-700">Thématique dominante :</span> {safeText(caseData.dominant_case_theme)}</div>
              </div>
            </div>

            <div className="grid min-w-[240px] gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <MetricCard label="Séances ATPE" value={sessions.length} tone="accent" />
              <MetricCard label="Objectifs actifs" value={data.overview?.active_goals_count ?? goals.length} />
              <MetricCard label="Sous-objectifs actifs" value={data.overview?.active_subgoals_count ?? 0} />
              <MetricCard label="Alertes actives" value={data.overview?.active_alerts_count ?? alerts.length} tone={alerts.length > 0 ? 'warn' : 'good'} />
            </div>
          </div>

          {data.resolution?.warning ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {data.resolution.warning}
            </div>
          ) : null}
        </section>

        <PatientClinicalTabs
          sessions={sessions}
          overview={overviewForDashboard}
          expressionAssessment={data.expression_assessment}
          protocols={protocols}
          protocolExecution={protocolExecution}
          goals={goals}
          goalReviews={goalReviews}
          alerts={alerts}
          caseData={caseData}
        />
      </div>
    </main>
  )
}