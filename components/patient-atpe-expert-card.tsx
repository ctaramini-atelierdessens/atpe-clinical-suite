'use client'

import {
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
  truncateText,
  formatShortDate,
} from '@/lib/atpe/format'

type Props = {
  sessions: AtpeExpertCompatibleSession[] | null | undefined
}

export function PatientAtpeExpertCard({ sessions }: Props) {
  const safeSessions = safeArray(sessions)

  if (safeSessions.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Analyse experte ATPE
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Aucune donnée disponible pour calculer l’analyse clinique.
        </p>
      </section>
    )
  }

  const latest = safeSessions[safeSessions.length - 1]

  const clinicalLevel = getClinicalLevel(latest)
  const riskFlag = getRiskFlag(latest)
  const trajectory = getTrajectoryTrend(safeSessions)

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Analyse experte ATPE
        </h2>

        <span className="text-xs text-slate-500">
          Basé sur la dernière séance (
          {formatShortDate(latest.created_at)})
        </span>
      </div>

      {/* SCORE GLOBAL */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">
            Niveau clinique global
          </div>

          <div
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${clinicalLevelClass(
              clinicalLevel.level
            )}`}
          >
            {clinicalLevel.label}
          </div>

          <div className="mt-2 text-xl font-semibold text-slate-900">
            {clinicalLevel.score} / 100
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {truncateText(clinicalLevel.rationale, 160)}
          </p>
        </div>

        {/* RISQUE */}
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Niveau de risque</div>

          <div
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${riskFlagClass(
              riskFlag.flag
            )}`}
          >
            {riskFlag.label}
          </div>

          <div className="mt-2 text-xl font-semibold text-slate-900">
            {riskFlag.score} / 100
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {truncateText(riskFlag.rationale, 160)}
          </p>
        </div>

        {/* TRAJECTOIRE */}
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">
            Trajectoire clinique
          </div>

          <div
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${trajectoryTrendClass(
              trajectory.trend
            )}`}
          >
            {trajectory.label}
          </div>

          <div className="mt-2 text-xl font-semibold text-slate-900">
            Δ {trajectory.delta}
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {truncateText(trajectory.rationale, 160)}
          </p>
        </div>
      </div>

      {/* DÉTAILS SYNTHÉTIQUES */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Lecture clinique synthétique
          </h3>

          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              • Score global : <strong>{clinicalLevel.score}/100</strong>
            </li>
            <li>
              • Risque clinique : <strong>{riskFlag.label}</strong>
            </li>
            <li>
              • Trajectoire : <strong>{trajectory.label}</strong>
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Interprétation dynamique
          </h3>

          <p className="mt-2 text-sm text-slate-700 leading-6">
            {trajectory.trend === 'improving' &&
              'La dynamique du suivi montre une progression. Le cadre et les médiations soutiennent l’évolution.'}

            {trajectory.trend === 'stable' &&
              'La dynamique reste stable. Le travail clinique se consolide sans rupture majeure.'}

            {trajectory.trend === 'declining' &&
              'La dynamique montre une fragilisation. Une réévaluation du cadre ou du rythme est recommandée.'}
          </p>
        </div>
      </div>
    </section>
  )
}