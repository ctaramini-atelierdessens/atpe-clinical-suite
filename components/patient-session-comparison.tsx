'use client'

import { useEffect, useState } from 'react'

type Metric = {
  key: string
  label: string
  currentValue: number
  previousValue: number
  diff: number
  direction: 'up' | 'down' | 'stable'
}

type Alert = {
  level: 'info' | 'warning' | 'critical'
  title: string
  message: string
}

type Props = {
  patientId: string
  sessionId?: string
}

function formatDiff(value: number) {
  if (value > 0) return `+${value}`
  return `${value}`
}

function badgeClass(level: Alert['level']) {
  if (level === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (level === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

function arrow(direction: Metric['direction']) {
  if (direction === 'up') return '↑'
  if (direction === 'down') return '↓'
  return '→'
}

export function PatientSessionComparison({ patientId, sessionId }: Props) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [narrative, setNarrative] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({ patientId })
        if (sessionId) params.set('sessionId', sessionId)

        const response = await fetch(
          `/api/clinical/session-comparison?${params.toString()}`,
          { cache: 'no-store' },
        )

        if (!response.ok) {
          const maybeJson = await response.json().catch(() => null)
          throw new Error(
            maybeJson?.error || 'Impossible de charger la comparaison clinique.',
          )
        }

        const json = await response.json()

        if (!active) return

        setMetrics(Array.isArray(json?.metrics) ? json.metrics : [])
        setAlerts(Array.isArray(json?.alerts) ? json.alerts : [])
        setNarrative(typeof json?.narrative === 'string' ? json.narrative : '')
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : 'Erreur de comparaison clinique.',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [patientId, sessionId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Chargement de la comparaison intelligente...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Comparaison intelligente séance N / N-1
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {narrative || 'Aucune synthèse narrative disponible.'}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-slate-900">{metric.label}</p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  N
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {metric.currentValue}/100
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  N-1
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  {metric.previousValue}/100
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Écart
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {arrow(metric.direction)} {formatDiff(metric.diff)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!alerts.length ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Aucun drapeau clinique automatique majeur détecté.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.title}-${index}`}
              className={`rounded-2xl border p-4 text-sm ${badgeClass(alert.level)}`}
            >
              <p className="font-semibold">{alert.title}</p>
              <p className="mt-1 leading-6">{alert.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}