'use client'

import {
  computeClinicalGlobalScore,
  getTrajectoryTrend,
  type AtpeExpertCompatibleSession,
} from '@/lib/atpe/clinical-intelligence'
import {
  safeArray,
  safeText,
  formatShortDate,
  phaseLabel,
  truncateText,
} from '@/lib/atpe/format'

type SessionRow = AtpeExpertCompatibleSession & {
  id: string
  created_at: string | null
  atpe_phase_dominant: string | null
  medium_primary: string | null
  medium_secondary?: string | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null
}

type Props = {
  sessions: SessionRow[] | null | undefined
}

function trendClass(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return 'bg-green-100 text-green-700'
    case 'declining':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function buildMilestones(sessions: SessionRow[]) {
  if (sessions.length === 0) return []

  const chronological = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })

  const first = chronological[0]
  const mid = chronological[Math.floor(chronological.length / 2)] ?? chronological[0]
  const last = chronological[chronological.length - 1]

  return [
    {
      title: 'Début du suivi',
      date: formatShortDate(first.created_at),
      text: `Installation du cadre clinique à partir d’une phase dominante ${phaseLabel(
        first.atpe_phase_dominant
      ).toLowerCase()}.`,
    },
    {
      title: 'Milieu du suivi',
      date: formatShortDate(mid.created_at),
      text:
        'Consolidation progressive avec montée des capacités de régulation, de symbolisation et d’engagement.',
    },
    {
      title: 'État actuel',
      date: formatShortDate(last.created_at),
      text: `Dernière phase dominante enregistrée : ${phaseLabel(
        last.atpe_phase_dominant
      )}.`,
    },
  ]
}

function groupByPhase(sessions: SessionRow[]) {
  const phaseMap = new Map<string, { count: number; avgScore: number }>()

  for (const session of sessions) {
    const key = phaseLabel(session.atpe_phase_dominant)
    const previous = phaseMap.get(key) ?? { count: 0, avgScore: 0 }
    const score = computeClinicalGlobalScore(session)

    const nextCount = previous.count + 1
    const nextAvg = (previous.avgScore * previous.count + score) / nextCount

    phaseMap.set(key, {
      count: nextCount,
      avgScore: Math.round(nextAvg),
    })
  }

  return Array.from(phaseMap.entries()).map(([phase, data]) => ({
    phase,
    count: data.count,
    avgScore: data.avgScore,
  }))
}

export function PatientAtpeLongitudinalSummary({ sessions }: Props) {
  const safeSessions = safeArray(sessions)

  if (safeSessions.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Synthèse longitudinale
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Aucune séance disponible pour générer une trajectoire clinique.
        </p>
      </section>
    )
  }

  const chronological = [...safeSessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })

  const chartData = chronological.map((session, index) => ({
    label: `S${index + 1}`,
    date: formatShortDate(session.created_at),
    score: computeClinicalGlobalScore(session),
    phase: phaseLabel(session.atpe_phase_dominant),
  }))

  const trajectory = getTrajectoryTrend(safeSessions)
  const milestones = buildMilestones(safeSessions)
  const phaseGroups = groupByPhase(safeSessions)
  const latest = chronological[chronological.length - 1] ?? null

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Synthèse longitudinale
        </h2>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${trendClass(
            trajectory.trend
          )}`}
        >
          {trajectory.label} · {trajectory.delta >= 0 ? '+' : ''}
          {trajectory.delta}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Score initial</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {trajectory.startScore}/100
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Score actuel</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {trajectory.endScore}/100
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Nombre de séances</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {safeSessions.length}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Lecture clinique globale
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {trajectory.rationale}
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Courbe d’évolution
        </h3>

        <div className="mt-4 flex min-h-[180px] items-end gap-2 rounded-xl bg-slate-50 p-4">
          {chartData.map((item) => (
            <div
              key={`${item.label}-${item.date}`}
              className="flex flex-1 flex-col items-center gap-2"
              title={`${item.label} · ${item.date} · ${item.phase} · ${item.score}/100`}
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
            Jalons cliniques
          </h3>
          <div className="mt-4 space-y-4">
            {milestones.map((milestone) => (
              <div key={`${milestone.title}-${milestone.date}`} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-slate-500">{milestone.date}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {truncateText(milestone.text, 220)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Répartition par phases dominantes
          </h3>
          <div className="mt-4 space-y-3">
            {phaseGroups.map((group) => (
              <div key={group.phase} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {group.phase}
                  </span>
                  <span className="text-xs text-slate-500">
                    {group.count} séance{group.count > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Score moyen : {group.avgScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Dernière recommandation enregistrée
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {safeText(latest?.next_step_recommendation)}
        </p>
      </div>
    </section>
  )
}