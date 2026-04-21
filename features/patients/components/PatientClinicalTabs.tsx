'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PatientAtpeDashboard } from '@/features/atpe/components/PatientAtpeDashboard'
import { PatientAtpeExpertCard } from '@/features/atpe/components/PatientAtpeExpertCard'

function safeText(value: unknown, fallback = '—') {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback = '—') {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback
}

function formatDate(value: unknown, fallback = '—') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR')
}

function ClinicalField({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {safeText(value)}
      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function AlertBadge({ level }: { level: unknown }) {
  const normalized = typeof level === 'string' ? level.toLowerCase() : 'unknown'

  const styles =
    normalized === 'high' || normalized === 'critical'
      ? 'border-red-200 bg-red-100 text-red-700'
      : normalized === 'moderate'
      ? 'border-amber-200 bg-amber-100 text-amber-700'
      : normalized === 'low'
      ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
      : 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {safeText(level)}
    </span>
  )
}

function StatusBadge({ value }: { value: unknown }) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'unknown'

  const styles =
    normalized === 'active' || normalized === 'done' || normalized === 'planned'
      ? 'border-blue-200 bg-blue-100 text-blue-700'
      : normalized === 'paused'
      ? 'border-amber-200 bg-amber-100 text-amber-700'
      : normalized === 'closed' || normalized === 'completed'
      ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
      : 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {safeText(value)}
    </span>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function SummaryBadge({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  )
}

function SessionTimeline({ sessions }: { sessions: any[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-slate-500">Aucune séance disponible.</p>
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="absolute left-4 top-4 h-full w-px bg-slate-200" />
          <div className="relative flex items-start gap-4">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-slate-900" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Séance {safeNumber(session.session_number)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(session.created_at)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                    {safeText(session.atpe_phase_dominant)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                    {safeText(session.medium_primary)}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="Containment" value={safeNumber(session.frame_containment)} />
                <MiniStat label="Engagement" value={safeNumber(session.patient_engagement_level)} />
                <MiniStat label="Symbolisation I" value={safeNumber(session.primary_symbolization)} />
                <MiniStat label="Symbolisation II" value={safeNumber(session.secondary_symbolization)} />
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <ClinicalField label="Hypothèses cliniques" value={session.clinical_hypotheses} />
                <ClinicalField label="Étape suivante" value={session.next_step_recommendation} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ClinicalSummary({
  overview,
  alerts,
  sessions,
  clinicalInsights,
}: {
  overview: any
  alerts: any[]
  sessions: any[]
  clinicalInsights: {
    score: number
    trend: string
    risk: string
    label: string
  }
}) {
  const engagementLevel =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum, s) =>
              sum +
              (typeof s?.patient_engagement_level === 'number'
                ? s.patient_engagement_level
                : 0),
            0
          ) / sessions.length
        ).toString()
      : '—'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Synthèse clinique</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {safeText(
              clinicalInsights.label ||
                overview?.latest_analysis?.title ||
                overview?.latest_expression_assessment?.preliminary_hypothesis ||
                'Synthèse clinique en cours'
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SummaryBadge label="Score" value={String(clinicalInsights.score)} />
          <SummaryBadge label="Risque" value={safeText(clinicalInsights.risk)} />
          <SummaryBadge label="Engagement" value={engagementLevel} />
          <SummaryBadge label="Évolution" value={safeText(clinicalInsights.trend)} />
        </div>
      </div>
    </div>
  )
}

const tabs = [
  { key: 'overview', label: 'Vue d’ensemble' },
  { key: 'sessions', label: 'Séances' },
  { key: 'protocols', label: 'Protocoles' },
  { key: 'goals', label: 'Objectifs' },
  { key: 'alerts', label: 'Alertes' },
] as const

type TabKey = (typeof tabs)[number]['key']

type Props = {
  sessions: any[]
  overview: any
  expressionAssessment: any
  protocols: any[]
  protocolExecution: any[]
  goals: any[]
  goalReviews: any[]
  alerts: any[]
  caseData: any
  clinicalInsights: {
    score: number
    trend: string
    risk: string
    label: string
  }
}

export function PatientClinicalTabs({
  sessions,
  overview,
  expressionAssessment,
  protocols,
  protocolExecution,
  goals,
  goalReviews,
  alerts,
  caseData,
  clinicalInsights,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawTab = searchParams.get('tab')
  const activeTab: TabKey = tabs.some((t) => t.key === rawTab)
    ? (rawTab as TabKey)
    : 'overview'

  function setTab(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  const normalizedExpression = useMemo(
    () => (expressionAssessment ?? {}) as Record<string, unknown>,
    [expressionAssessment]
  )

  return (
    <div className="space-y-6">
      <ClinicalSummary
        overview={overview}
        alerts={alerts}
        sessions={sessions}
        clinicalInsights={clinicalInsights}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTab(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <PatientAtpeDashboard
              sessions={sessions}
              overview={overview}
              expressionAssessment={expressionAssessment}
              protocols={protocols}
              activeAlerts={alerts}
            />

            <PatientAtpeExpertCard
              sessions={sessions}
              activeAlerts={alerts}
              protocols={protocols}
              expressionAssessment={expressionAssessment}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Bilan expressionnel préalable"
              subtitle="Éléments structurés issus de la demande et de l’évaluation initiale"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ClinicalField label="Statut" value={normalizedExpression.status} />
                <ClinicalField label="Type de demande" value={normalizedExpression.request_type} />
                <ClinicalField label="Date de demande" value={formatDate(normalizedExpression.request_date)} />
                <ClinicalField label="Demandé par" value={normalizedExpression.requested_by} />
                <ClinicalField label="Indication" value={normalizedExpression.indication_text} />
                <ClinicalField label="Connaissances préalables" value={normalizedExpression.prior_knowledge_summary} />
                <ClinicalField label="Recommandation initiale" value={normalizedExpression.initial_recommendation} />
                <ClinicalField label="Recommandation finale" value={normalizedExpression.final_recommendation} />
                <ClinicalField label="Objectifs initiaux" value={normalizedExpression.initial_objectives} />
                <ClinicalField label="Modalités proposées" value={normalizedExpression.proposed_modalities} />
              </div>
            </SectionCard>

            <SectionCard
              title="Synthèse de cas"
              subtitle="Vue générale du dossier et de son orientation"
            >
              <div className="space-y-4">
                <ClinicalField label="Titre" value={caseData.title} />
                <ClinicalField label="Cadre" value={caseData.setting} />
                <ClinicalField label="Modalité" value={caseData.modality} />
                <ClinicalField label="Thématique dominante" value={caseData.dominant_case_theme} />
                <ClinicalField label="Nombre total de séances" value={caseData.total_sessions} />
              </div>
            </SectionCard>
          </section>
        </div>
      ) : null}

      {activeTab === 'sessions' ? (
        <SectionCard
          title="Timeline clinique des séances"
          subtitle="Vue chronologique synthétique du parcours thérapeutique"
        >
          <SessionTimeline sessions={sessions} />
        </SectionCard>
      ) : null}

      {activeTab === 'protocols' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Protocoles actifs"
            subtitle="Protocoles thérapeutiques attribués au parcours"
          >
            {protocols.length > 0 ? (
              <div className="space-y-3">
                {protocols.map((protocol: any) => (
                  <div key={protocol.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-medium text-slate-900">
                        {safeText(protocol.therapy_protocols?.title)}
                      </div>
                      <StatusBadge value={protocol.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <div>Modalité : {safeText(protocol.therapy_protocols?.modality)}</div>
                      <div>Justification : {safeText(protocol.rationale)}</div>
                      <div>Attribué le : {formatDate(protocol.assigned_on)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun protocole actif.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Exécution du protocole"
            subtitle="Traçabilité des étapes engagées au fil des séances"
          >
            {protocolExecution.length > 0 ? (
              <div className="space-y-3">
                {protocolExecution.map((row: any) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-medium text-slate-900">
                        {safeText(row.protocol_steps?.title)}
                      </div>
                      <StatusBadge value={row.execution_status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <div>Étape : {safeText(row.protocol_steps?.step_order)}</div>
                      <div>Qualité de réponse : {safeText(row.response_quality)}</div>
                      <div>Note : {safeText(row.execution_note)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune exécution de protocole enregistrée.</p>
            )}
          </SectionCard>
        </section>
      ) : null}

      {activeTab === 'goals' ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Objectifs actifs"
            subtitle="Objectifs thérapeutiques actuellement suivis"
          >
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal: any) => (
                  <div key={goal.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-medium text-slate-900">{safeText(goal.title)}</div>
                      <StatusBadge value={goal.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <div>Description : {safeText(goal.description)}</div>
                      <div>Priorité : {safeText(goal.priority)}</div>
                      <div>Révision cible : {formatDate(goal.target_review_date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun objectif actif.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Revues d’objectifs par séance"
            subtitle="Suivi de l’intensité de travail et de la progression"
          >
            {goalReviews.length > 0 ? (
              <div className="space-y-3">
                {goalReviews.map((review: any) => (
                  <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-2 text-sm text-slate-600">
                      <div>Intensité de travail : {safeText(review.work_intensity)}</div>
                      <div>Progression : {safeText(review.progress_level)}</div>
                      <div>Note : {safeText(review.review_note)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune revue d’objectif disponible.</p>
            )}
          </SectionCard>
        </section>
      ) : null}

      {activeTab === 'alerts' ? (
        <SectionCard
          title="Alertes actives"
          subtitle="Signaux cliniques et alertes dynamiques"
        >
          {alerts.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">
                      {safeText(alert.label)}
                    </div>
                    <AlertBadge level={alert.level} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div>Catégorie : {safeText(alert.category)}</div>
                    <div>Détail : {safeText(alert.detail)}</div>
                    <div>Source : {safeText(alert.source)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune alerte active.</p>
          )}
        </SectionCard>
      ) : null}
    </div>
  )
}