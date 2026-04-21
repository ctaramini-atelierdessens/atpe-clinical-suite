import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buildClinicalInsights } from '@/features/atpe/services/clinical-engine'

type PatientRow = {
  id: string
  display_name?: string | null
}

type AlertRow = {
  id: string
  patient_id?: string | null
  level?: string | null
  label?: string | null
  detail?: string | null
  created_at?: string | null
}

type SessionRow = {
  id: string
  patient_id?: string | null
  patient_engagement_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  frame_containment?: number | null
  created_at?: string | null
}

function safeText(value: unknown, fallback = '—') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function formatDate(value: unknown, fallback = '—') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR')
}

async function getDashboardData() {
  const supabase = await createClient()

  const [{ data: patients }, { data: alerts }, { data: sessions }] = await Promise.all([
    supabase.from('patients').select('id, display_name').order('display_name', { ascending: true }),
    supabase
      .from('active_atpe_alerts')
      .select('id, patient_id, level, label, detail, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('atpe_session_advanced')
      .select(
        'id, patient_id, patient_engagement_level, primary_symbolization, secondary_symbolization, frame_containment, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return {
    patients: (patients ?? []) as PatientRow[],
    alerts: (alerts ?? []) as AlertRow[],
    sessions: (sessions ?? []) as SessionRow[],
  }
}

function DashboardCard({
  title,
  value,
  description,
  tone = 'default',
}: {
  title: string
  value: string
  description: string
  tone?: 'default' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 bg-red-50'
      : 'border-slate-200 bg-white'

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{description}</div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score > 70
      ? 'bg-emerald-100 text-emerald-700'
      : score > 40
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'

  return (
    <div className={`rounded-lg px-2 py-1 text-xs font-medium ${color}`}>
      {score}
    </div>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  const color =
    risk === 'critical'
      ? 'bg-red-100 text-red-700'
      : risk === 'high'
      ? 'bg-amber-100 text-amber-700'
      : risk === 'moderate'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-emerald-100 text-emerald-700'

  return (
    <div className={`rounded-lg px-2 py-1 text-xs font-medium ${color}`}>
      {risk}
    </div>
  )
}

export default async function ClinicalHome() {
  const data = await getDashboardData()

  const criticalAlerts = data.alerts.filter(
    (a) => a.level === 'high' || a.level === 'critical'
  )

  const patientsWithInsights = data.patients.map((p) => {
    const patientSessions = data.sessions.filter((s) => s.patient_id === p.id)
    const patientAlerts = data.alerts.filter((a) => a.patient_id === p.id)
    const insights = buildClinicalInsights(patientSessions, patientAlerts)

    return {
      ...p,
      insights,
      sessionsCount: patientSessions.length,
      alertsCount: patientAlerts.length,
    }
  })

  patientsWithInsights.sort((a, b) => b.insights.score - a.insights.score)

  const globalScore =
    patientsWithInsights.length > 0
      ? Math.round(
          patientsWithInsights.reduce((sum, p) => sum + p.insights.score, 0) /
            patientsWithInsights.length
        )
      : 0

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Cockpit clinique
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vue d’ensemble des patients, alertes et activité thérapeutique.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <DashboardCard
            title="Patients"
            value={String(data.patients.length)}
            description="Suivis actifs"
          />

          <DashboardCard
            title="Alertes critiques"
            value={String(criticalAlerts.length)}
            description="Risque élevé"
            tone={criticalAlerts.length > 0 ? 'danger' : 'default'}
          />

          <DashboardCard
            title="Séances récentes"
            value={String(data.sessions.length)}
            description="Activité récente"
          />

          <DashboardCard
            title="Score global"
            value={String(globalScore)}
            description="Indice clinique"
            tone={globalScore < 60 ? 'danger' : 'default'}
          />
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Alertes critiques
          </h2>

          <div className="mt-4 space-y-2">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm"
                >
                  <div className="font-medium text-slate-900">
                    {safeText(a.label)}
                  </div>
                  <div className="mt-1 text-slate-600">
                    {safeText(a.detail)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">
                Aucune alerte critique.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Patients par priorité clinique
          </h2>

          <div className="mt-4 divide-y">
            {patientsWithInsights.length > 0 ? (
              patientsWithInsights.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="block py-4 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {safeText(p.display_name, 'Patient')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.insights.label}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Séances : {p.sessionsCount} · Alertes : {p.alertsCount}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ScoreBadge score={p.insights.score} />
                      <RiskBadge risk={p.insights.risk} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-sm text-slate-500">
                Aucun patient trouvé.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Activité récente
          </h2>

          <div className="mt-4 space-y-3">
            {data.sessions.length > 0 ? (
              data.sessions.slice(0, 10).map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border bg-slate-50 p-3 text-sm"
                >
                  <div className="font-medium text-slate-900">
                    Séance ATPE
                  </div>
                  <div className="mt-1 text-slate-600">
                    Date : {formatDate(s.created_at)}
                  </div>
                  <div className="text-slate-600">
                    Engagement : {typeof s.patient_engagement_level === 'number' ? s.patient_engagement_level : '—'}
                  </div>
                  <div className="text-slate-600">
                    Symbolisation I : {typeof s.primary_symbolization === 'number' ? s.primary_symbolization : '—'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">
                Aucune activité récente.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}