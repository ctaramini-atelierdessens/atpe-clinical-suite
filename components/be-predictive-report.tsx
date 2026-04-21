import { buildPredictiveReport, type PredictiveSession } from '@/lib/atpe/be-predictive'

function levelClasses(level: 'Faible' | 'Modéré' | 'Élevé') {
  if (level === 'Élevé') return 'bg-red-50 text-red-700 border-red-200'
  if (level === 'Modéré') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

function scoreClasses(score: number) {
  if (score >= 65) return 'text-red-700'
  if (score >= 35) return 'text-amber-700'
  return 'text-emerald-700'
}

export function BEPredictiveReport({
  sessions,
}: {
  sessions: PredictiveSession[]
}) {
  const report = buildPredictiveReport(sessions ?? [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Risque de rupture thérapeutique</h3>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${levelClasses(report.ruptureRisk.level)}`}
            >
              {report.ruptureRisk.level}
            </span>
          </div>

          <p className={`text-3xl font-bold ${scoreClasses(report.ruptureRisk.score)}`}>
            {report.ruptureRisk.score}/100
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {report.ruptureRisk.reasons.map((reason, index) => (
              <li key={index} className="rounded-xl bg-slate-50 px-3 py-2">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Potentiel d’évolution</h3>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${levelClasses(report.evolutionPotential.level)}`}
            >
              {report.evolutionPotential.level}
            </span>
          </div>

          <p className={`text-3xl font-bold ${scoreClasses(report.evolutionPotential.score)}`}>
            {report.evolutionPotential.score}/100
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {report.evolutionPotential.reasons.map((reason, index) => (
              <li key={index} className="rounded-xl bg-slate-50 px-3 py-2">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <h3 className="text-lg font-semibold">Orientation automatique</h3>
        <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-brand-800">
          {report.orientation}
        </p>
      </div>

      <div className="rounded-2xl border p-5">
        <h3 className="text-lg font-semibold">Protocole recommandé</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {report.recommendedProtocol.map((item, index) => (
            <div key={index} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <h3 className="text-lg font-semibold">Synthèse prédictive</h3>
        <p className="mt-3 leading-7 text-slate-700">{report.synthesis}</p>
      </div>
    </div>
  )
}