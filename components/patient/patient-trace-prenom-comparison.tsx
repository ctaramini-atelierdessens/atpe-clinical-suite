'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Database } from '@/lib/database.types'

type TracePrenomObservationRow =
  Database['public']['Tables']['trace_prenom_observations']['Row']

type PatientTracePrenomComparisonProps = {
  patientId: string
}

type LoadState =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function deltaLabel(value: number) {
  return `${value >= 0 ? '+' : ''}${value}`
}

function changeLabel(previous: string, current: string) {
  if (previous === current) return 'Stable'
  return `${previous} → ${current}`
}

function asClinicalText(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

function buildComparisonNarrative(
  previous: TracePrenomObservationRow,
  current: TracePrenomObservationRow
) {
  const lines: string[] = []

  const engagementShift = current.engagement_delta - previous.engagement_delta
  const tensionShift = current.tension_delta - previous.tension_delta
  const vulnerabilityShift =
    current.vulnerability_delta - previous.vulnerability_delta
  const symbolizationShift =
    current.symbolization_delta - previous.symbolization_delta

  if (engagementShift > 0) {
    lines.push("L’engagement apparaît en progression sur la dernière passation.")
  } else if (engagementShift < 0) {
    lines.push("L’engagement apparaît en retrait par rapport à la passation précédente.")
  }

  if (tensionShift > 0) {
    lines.push("La tension semble augmenter sur la dernière passation.")
  } else if (tensionShift < 0) {
    lines.push("La tension semble diminuer sur la dernière passation.")
  }

  if (vulnerabilityShift > 0) {
    lines.push("La vulnérabilité clinique paraît plus marquée.")
  } else if (vulnerabilityShift < 0) {
    lines.push("La vulnérabilité clinique paraît en recul.")
  }

  if (symbolizationShift > 0) {
    lines.push("La symbolisation semble plus accessible dans la dernière passation.")
  } else if (symbolizationShift < 0) {
    lines.push("La symbolisation paraît moins mobilisable que précédemment.")
  }

  if (previous.continuity !== current.continuity) {
    lines.push(
      `La continuité du trait évolue de ${previous.continuity} vers ${current.continuity}.`
    )
  }

  if (previous.spatial_organization !== current.spatial_organization) {
    lines.push(
      `L’organisation spatiale évolue de ${previous.spatial_organization} vers ${current.spatial_organization}.`
    )
  }

  if (previous.repetition !== current.repetition) {
    lines.push(
      `Le niveau de répétition évolue de ${previous.repetition} vers ${current.repetition}.`
    )
  }

  if (lines.length === 0) {
    lines.push(
      'Les deux dernières passations apparaissent globalement stables, sans variation marquée sur les indicateurs principaux.'
    )
  }

  return lines
}

type MetricComparisonCardProps = {
  label: string
  previousValue: number
  currentValue: number
}

function MetricComparisonCard({
  label,
  previousValue,
  currentValue,
}: MetricComparisonCardProps) {
  const delta = currentValue - previousValue

  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span>Avant</span>
          <span className="font-semibold text-slate-900">
            {deltaLabel(previousValue)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Maintenant</span>
          <span className="font-semibold text-slate-900">
            {deltaLabel(currentValue)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Écart</span>
          <span className="font-semibold text-slate-900">
            {deltaLabel(delta)}
          </span>
        </div>
      </div>
    </article>
  )
}

type VariableComparisonCardProps = {
  label: string
  previousValue: string
  currentValue: string
}

function VariableComparisonCard({
  label,
  previousValue,
  currentValue,
}: VariableComparisonCardProps) {
  const changed = previousValue !== currentValue

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">
        {changeLabel(previousValue, currentValue)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {changed ? 'Variation observée' : 'Pas de variation'}
      </p>
    </article>
  )
}

export function PatientTracePrenomComparison({
  patientId,
}: PatientTracePrenomComparisonProps) {
  const [items, setItems] = useState<TracePrenomObservationRow[]>([])
  const [state, setState] = useState<LoadState>({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let mounted = true

    async function loadHistory() {
      setState({
        type: 'loading',
        message: 'Chargement du comparatif…',
      })

      try {
        const response = await fetch(
          `/api/patients/${patientId}/trace-prenom/history`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        )

        const json = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof json?.error === 'string'
              ? json.error
              : 'Chargement impossible du comparatif.'
          )
        }

        const data = Array.isArray(json?.data) ? json.data : []

        if (!mounted) return

        setItems(data as TracePrenomObservationRow[])
        setState({
          type: 'success',
          message: '',
        })
      } catch (error) {
        if (!mounted) return

        setState({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Chargement impossible du comparatif.',
        })
      }
    }

    void loadHistory()

    return () => {
      mounted = false
    }
  }, [patientId])

  const comparison = useMemo(() => {
    if (items.length < 2) return null

    const current = items[0]
    const previous = items[1]

    return {
      current,
      previous,
      narrative: buildComparisonNarrative(previous, current),
      currentClinicalText: asClinicalText(current.clinical_text),
      previousClinicalText: asClinicalText(previous.clinical_text),
    }
  }, [items])

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Comparatif des 2 dernières passations
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Évolution automatique entre la dernière passation et la précédente.
        </p>
      </div>

      {state.type === 'loading' ? (
        <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          {state.message}
        </div>
      ) : null}

      {state.type === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {state.type !== 'loading' && !comparison ? (
        <p className="text-sm text-slate-500">
          Au moins deux observations sont nécessaires pour afficher un comparatif.
        </p>
      ) : null}

      {comparison ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Passation précédente
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {formatDate(comparison.previous.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Dernière passation
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {formatDate(comparison.current.created_at)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricComparisonCard
              label="Engagement"
              previousValue={comparison.previous.engagement_delta}
              currentValue={comparison.current.engagement_delta}
            />
            <MetricComparisonCard
              label="Tension"
              previousValue={comparison.previous.tension_delta}
              currentValue={comparison.current.tension_delta}
            />
            <MetricComparisonCard
              label="Vulnérabilité"
              previousValue={comparison.previous.vulnerability_delta}
              currentValue={comparison.current.vulnerability_delta}
            />
            <MetricComparisonCard
              label="Symbolisation"
              previousValue={comparison.previous.symbolization_delta}
              currentValue={comparison.current.symbolization_delta}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Variations des variables observées
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <VariableComparisonCard
                label="Pression"
                previousValue={comparison.previous.pressure}
                currentValue={comparison.current.pressure}
              />
              <VariableComparisonCard
                label="Continuité"
                previousValue={comparison.previous.continuity}
                currentValue={comparison.current.continuity}
              />
              <VariableComparisonCard
                label="Organisation spatiale"
                previousValue={comparison.previous.spatial_organization}
                currentValue={comparison.current.spatial_organization}
              />
              <VariableComparisonCard
                label="Répétition"
                previousValue={comparison.previous.repetition}
                currentValue={comparison.current.repetition}
              />
              <VariableComparisonCard
                label="Hésitation"
                previousValue={comparison.previous.hesitation}
                currentValue={comparison.current.hesitation}
              />
              <VariableComparisonCard
                label="Ancrage"
                previousValue={comparison.previous.anchoring}
                currentValue={comparison.current.anchoring}
              />
              <VariableComparisonCard
                label="Lisibilité"
                previousValue={comparison.previous.readability}
                currentValue={comparison.current.readability}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Lecture clinique comparative
            </h3>

            <div className="mt-3 space-y-2">
              {comparison.narrative.map((line, index) => (
                <div
                  key={`comparison-line-${index}`}
                  className="rounded-lg bg-white p-3 text-sm text-slate-700"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Hypothèses précédentes
              </h3>
              <div className="mt-3 space-y-2">
                {comparison.previousClinicalText.length > 0 ? (
                  comparison.previousClinicalText.map((text, index) => (
                    <div
                      key={`previous-clinical-${index}`}
                      className="rounded-lg bg-white p-3 text-sm text-slate-700"
                    >
                      {text}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucune hypothèse enregistrée.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Hypothèses actuelles
              </h3>
              <div className="mt-3 space-y-2">
                {comparison.currentClinicalText.length > 0 ? (
                  comparison.currentClinicalText.map((text, index) => (
                    <div
                      key={`current-clinical-${index}`}
                      className="rounded-lg bg-white p-3 text-sm text-slate-700"
                    >
                      {text}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucune hypothèse enregistrée.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}