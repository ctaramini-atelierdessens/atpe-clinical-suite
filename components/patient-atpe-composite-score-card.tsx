import { AtpeCompositeScoreResult, AtpeAxisScores, axisLabel } from '@/lib/atpe-composite-score'

type PatientAtpeCompositeScoreCardProps = {
  composite: AtpeCompositeScoreResult
  axisScores: AtpeAxisScores
  className?: string
}

function interpretationColor(interpretation: AtpeCompositeScoreResult['interpretation']) {
  switch (interpretation) {
    case 'Fragilité clinique marquée':
      return 'bg-rose-100 text-rose-800'
    case 'Équilibre clinique intermédiaire':
      return 'bg-amber-100 text-amber-800'
    case 'Dynamique clinique favorable':
      return 'bg-emerald-100 text-emerald-800'
    case 'Très bonne dynamique clinique':
      return 'bg-sky-100 text-sky-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function scoreBarColor(score: number) {
  if (score < 40) return 'bg-rose-500'
  if (score < 60) return 'bg-amber-500'
  if (score < 80) return 'bg-emerald-500'
  return 'bg-sky-500'
}

export function PatientAtpeCompositeScoreCard({
  composite,
  axisScores,
  className = '',
}: PatientAtpeCompositeScoreCardProps) {
  const orderedAxes: Array<keyof AtpeAxisScores> = [
    'internalProcess',
    'expressiveProcess',
    'relationalProcess',
    'pluriexpressivity',
    'institutionalIndicators',
    'sensorialSymbolic',
  ]

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Score composite ATPE</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lecture structurée des 6 axes cliniques
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="text-3xl font-bold text-slate-900">{composite.global}/100</div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${interpretationColor(
              composite.interpretation
            )}`}
          >
            {composite.interpretation}
          </span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-medium text-slate-800">Axe dominant</p>
          <p className="text-sm text-slate-700">{axisLabel(composite.dominantAxis)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-medium text-slate-800">Axe le plus fragile</p>
          <p className="text-sm text-slate-700">{axisLabel(composite.weakestAxis)}</p>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Détail par axe
        </h3>

        <div className="space-y-3">
          {orderedAxes.map((axisKey) => {
            const score = axisScores[axisKey]

            return (
              <div key={axisKey}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{axisLabel(axisKey)}</span>
                  <span className="text-sm font-semibold text-slate-900">{score}/100</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${scoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Points d’appui
          </h3>

          {composite.strengths.length ? (
            <ul className="space-y-1 text-sm text-slate-700">
              {composite.strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Aucun point d’appui saillant identifié.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fragilités repérées
          </h3>

          {composite.vulnerabilities.length ? (
            <ul className="space-y-1 text-sm text-slate-700">
              {composite.vulnerabilities.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Pas de fragilité majeure détectée.</p>
          )}
        </div>
      </div>
    </section>
  )
}