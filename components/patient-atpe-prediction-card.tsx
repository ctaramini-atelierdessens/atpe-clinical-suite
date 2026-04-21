import {
  AtpePredictionResult,
  riskLevelLabel,
  trendLabel,
} from '@/lib/atpe-prediction-engine'

type PatientAtpePredictionCardProps = {
  prediction: AtpePredictionResult
  className?: string
}

function trendBadgeColor(trend: AtpePredictionResult['trend']) {
  switch (trend) {
    case 'improving':
      return 'bg-emerald-100 text-emerald-800'
    case 'stable':
      return 'bg-sky-100 text-sky-800'
    case 'fragile':
      return 'bg-amber-100 text-amber-800'
    case 'declining':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function riskBadgeColor(risk: AtpePredictionResult['riskLevel']) {
  switch (risk) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800'
    case 'moderate':
      return 'bg-amber-100 text-amber-800'
    case 'high':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function confidenceBadgeColor(confidence: AtpePredictionResult['confidence']) {
  switch (confidence) {
    case 'high':
      return 'bg-sky-100 text-sky-800'
    case 'moderate':
      return 'bg-slate-100 text-slate-800'
    case 'low':
      return 'bg-slate-200 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function PatientAtpePredictionCard({
  prediction,
  className = '',
}: PatientAtpePredictionCardProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Lecture prédictive</h2>
          <p className="mt-1 text-sm text-slate-500">
            Analyse longitudinale de la trajectoire clinique
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${trendBadgeColor(prediction.trend)}`}>
            Tendance : {trendLabel(prediction.trend)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${riskBadgeColor(
              prediction.riskLevel
            )}`}
          >
            Risque : {riskLevelLabel(prediction.riskLevel)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceBadgeColor(
              prediction.confidence
            )}`}
          >
            Confiance : {prediction.confidence}
          </span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pente globale
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {prediction.markers.globalSlope > 0 ? '+' : ''}
            {prediction.markers.globalSlope}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Variation récente
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {prediction.markers.recentDelta > 0 ? '+' : ''}
            {prediction.markers.recentDelta}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Volatilité
          </p>
          <p className="text-lg font-semibold text-slate-900">{prediction.markers.volatility}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Axe fragile récent
          </p>
          <p className="text-sm font-medium text-slate-900">
            {prediction.markers.weakestRecentAxis ?? 'Non disponible'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Interprétation
        </h3>

        <ul className="space-y-1 text-sm text-slate-700">
          {prediction.explanation.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 text-slate-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}