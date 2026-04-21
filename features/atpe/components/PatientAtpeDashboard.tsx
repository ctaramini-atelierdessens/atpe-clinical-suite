'use client'

import {
  computeClinicalGlobalScore,
  getClinicalLevel,
  getRiskFlag,
  getTrajectoryTrend,
  clinicalLevelClass,
  riskFlagClass,
  trajectoryTrendClass,
  type AtpeExpertCompatibleSession,
} from '@/lib/atpe/clinical-intelligence'
import {
  safeArray,
  safeText,
  formatShortDate,
  phaseLabel,
  clampPercent,
  truncateText,
} from '@/lib/atpe/format'

type SessionRow = AtpeExpertCompatibleSession & {
  id: string
  created_at: string | null
  updated_at?: string | null
  atpe_phase_dominant: string | null
  medium_primary: string | null
  medium_secondary?: string | null
  format?: string | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null
}

type Props = {
  sessions: SessionRow[] | null | undefined
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function mostFrequentPhase(sessions: SessionRow[]) {
  const counts = new Map<string, number>()

  for (const session of sessions) {
    const label = phaseLabel(session.atpe_phase_dominant)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  let bestLabel = '—'
  let bestCount = -1

  for (const [label, count] of counts.entries()) {
    if (count > bestCount) {
      bestLabel = label
      bestCount = count
    }
  }

  return bestLabel
}

function statCard(label: string, value: string, helper?: string) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
    </div>
  )
}

export function PatientAtpeDashboard({ sessions }: Props) {
  const safeSessions = safeArray(sessions)

  if (safeSessions.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tableau de bord ATPE</h2>
        <p className="mt-3 text-sm text-slate-600">
          Aucune séance disponible pour générer le tableau de bord.
        </p>
      </section>
    )
  }

  const chronological = [...safeSessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })

  const latest = chronological[chronological.length - 1]
  const first = chronological[0]

  if (!latest || !first) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tableau de bord ATPE</h2>
        <p className="mt-3 text-sm text-slate-600">
          Les données de séance sont incomplètes.
        </p>
      </section>
    )
  }

  const clinicalLevel = getClinicalLevel(latest)
  const riskFlag = getRiskFlag(latest)
  const trajectory = getTrajectoryTrend(chronological)

  const allScores = chronological
    .map((session) => computeClinicalGlobalScore(session))
    .filter(isFiniteNumber)
  const averageScore = average(allScores)

  const avgEngagement = average(
    chronological
      .map((session) => session.patient_engagement_level)
      .filter(isFiniteNumber)
  )

  const avgContainment = average(
    chronological
      .map((session) => session.frame_containment)
      .filter(isFiniteNumber)
  )

  const dominantPhase = mostFrequentPhase(chronological)

  const chartData = chronological.map((session, index) => ({
    label: `S${index + 1}`,
    score: clampPercent(computeClinicalGlobalScore(session)),
    date: formatShortDate(session.created_at),
  }))

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tableau de bord ATPE</h2>
          <p className="mt-1 text-sm text-slate-500">
            Du {formatShortDate(first.created_at)} au {formatShortDate(latest.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${clinicalLevelClass(
              clinicalLevel.level
            )}`}
          >
            {clinicalLevel.label}
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${riskFlagClass(
              riskFlag.flag
            )}`}
          >
            {riskFlag.label}
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${trajectoryTrendClass(
              trajectory.trend
            )}`}
          >
            {trajectory.label}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCard('Séances', String(chronological.length))}
        {statCard('Score moyen', `${averageScore}/100`)}
        {statCard('Score actuel', `${clinicalLevel.score}/100`)}
        {statCard('Engagement moyen', `${avgEngagement}/100`)}
        {statCard('Containment moyen', `${avgContainment}/100`)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Synthèse clinique</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{clinicalLevel.rationale}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{trajectory.rationale}</p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Points de pilotage</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div>
              <span className="font-medium">Phase dominante la plus fréquente :</span>{' '}
              {dominantPhase}
            </div>
            <div>
              <span className="font-medium">Dernier médium principal :</span>{' '}
              {safeText(latest.medium_primary)}
            </div>
            <div>
              <span className="font-medium">Dernier médium secondaire :</span>{' '}
              {safeText(latest.medium_secondary)}
            </div>
            <div>
              <span className="font-medium">Risque actuel :</span> {riskFlag.label}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Évolution globale</h3>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${trajectoryTrendClass(
              trajectory.trend
            )}`}
          >
            {trajectory.label} · {trajectory.delta >= 0 ? '+' : ''}
            {trajectory.delta}
          </span>
        </div>

        <div className="mt-4 flex min-h-[160px] items-end gap-2 rounded-xl bg-slate-50 p-4">
          {chartData.map((item) => (
            <div
              key={`${item.label}-${item.date}`}
              className="flex flex-1 flex-col items-center gap-2"
              title={`${item.label} · ${item.date} · ${item.score}/100`}
            >
              <div className="text-[10px] text-slate-500">{item.score}</div>
              <div className="flex w-full items-end justify-center">
                <div
                  className="w-full max-w-[28px] rounded-t bg-slate-900"
                  style={{ height: `${Math.max(10, item.score)}px` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Dernières hypothèses cliniques
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {truncateText(latest.clinical_hypotheses, 320)}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Dernière recommandation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {truncateText(latest.next_step_recommendation, 320)}
          </p>
        </div>
      </div>
    </section>
  )
}