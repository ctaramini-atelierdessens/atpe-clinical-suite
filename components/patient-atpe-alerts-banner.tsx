import { DashboardAlert } from '@/lib/dashboard-alerts'

type PatientAtpeAlertsBannerProps = {
  alerts: DashboardAlert[]
  className?: string
  maxItems?: number
}

function containerColor(level: DashboardAlert['level']) {
  switch (level) {
    case 'critical':
      return 'border-rose-200 bg-rose-50'
    case 'warning':
      return 'border-amber-200 bg-amber-50'
    case 'success':
      return 'border-emerald-200 bg-emerald-50'
    case 'info':
    default:
      return 'border-sky-200 bg-sky-50'
  }
}

function badgeColor(level: DashboardAlert['level']) {
  switch (level) {
    case 'critical':
      return 'bg-rose-100 text-rose-800'
    case 'warning':
      return 'bg-amber-100 text-amber-800'
    case 'success':
      return 'bg-emerald-100 text-emerald-800'
    case 'info':
    default:
      return 'bg-sky-100 text-sky-800'
  }
}

function levelLabel(level: DashboardAlert['level']) {
  switch (level) {
    case 'critical':
      return 'Critique'
    case 'warning':
      return 'Vigilance'
    case 'success':
      return 'Point d’appui'
    case 'info':
    default:
      return 'Info'
  }
}

export function PatientAtpeAlertsBanner({
  alerts,
  className = '',
  maxItems = 6,
}: PatientAtpeAlertsBannerProps) {
  if (!alerts.length) {
    return (
      <section
        className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm ${className}`}
      >
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Stable
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Aucune alerte clinique majeure</h2>
            <p className="mt-1 text-sm text-slate-700">
              Le tableau actuel ne fait pas remonter de signal critique prioritaire.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const visibleAlerts = alerts.slice(0, maxItems)
  const criticalCount = alerts.filter((a) => a.level === 'critical').length
  const warningCount = alerts.filter((a) => a.level === 'warning').length

  return (
    <section className={`space-y-3 ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Alertes cliniques</h2>
            <p className="mt-1 text-sm text-slate-500">
              Synthèse des signaux prioritaires à surveiller
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {criticalCount > 0 ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </span>
            ) : null}

            {warningCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                {warningCount} vigilance{warningCount > 1 ? 's' : ''}
              </span>
            ) : null}

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {alerts.length} signal{alerts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-4 shadow-sm ${containerColor(alert.level)}`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor(alert.level)}`}>
                {levelLabel(alert.level)}
              </span>

              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
                {alert.category}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
            <p className="mt-1 text-sm text-slate-700">{alert.message}</p>

            {alert.recommendation ? (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Piste clinique :</span> {alert.recommendation}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}