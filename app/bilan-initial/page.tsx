'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ATPE_MATRIX } from '@/lib/atpe-matrix'

type SelectedRowsState = Record<string, Record<string, boolean>>

type SavedObjective = {
  axisKey: string
  rowKey: string
  objective: string
}

type AssessmentResponse = {
  ok: boolean
  assessment: {
    patient_id: string
    clinical_intent: string | null
    main_goals: string | null
    vigilance_points: string | null
    selected_axes: string[] | null
    selected_objectives: SavedObjective[] | null
  } | null
}

const SYNC_KEY = 'atpe:patient-initial-assessment-updated'

function buildInitialSelection() {
  const result: SelectedRowsState = {}

  for (const axis of ATPE_MATRIX.axes) {
    result[axis.key] = {}
    for (const row of axis.rows) {
      result[axis.key][row.key] = false
    }
  }

  return result
}

function buildInitialAxesState() {
  return Object.fromEntries(
    ATPE_MATRIX.axes.map((axis) => [axis.key, true])
  ) as Record<string, boolean>
}

export default function BilanInitialPage() {
  const searchParams = useSearchParams()
  const initialPatientIdFromQuery = searchParams.get('patientId') ?? ''

  const [patientId, setPatientId] = useState(initialPatientIdFromQuery)
  const [selectedAxes, setSelectedAxes] =
    useState<Record<string, boolean>>(buildInitialAxesState)
  const [selectedRows, setSelectedRows] =
    useState<SelectedRowsState>(buildInitialSelection)

  const [clinicalIntent, setClinicalIntent] = useState('')
  const [mainGoals, setMainGoals] = useState('')
  const [vigilancePoints, setVigilancePoints] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  function resetForm() {
    setSelectedAxes(buildInitialAxesState())
    setSelectedRows(buildInitialSelection())
    setClinicalIntent('')
    setMainGoals('')
    setVigilancePoints('')
    setSaveMessage(null)
    setSaveError(null)
  }

  function applyLoadedAssessment(assessment: AssessmentResponse['assessment']) {
    if (!assessment) {
      resetForm()
      return
    }

    const nextAxes = Object.fromEntries(
      ATPE_MATRIX.axes.map((axis) => [
        axis.key,
        Array.isArray(assessment.selected_axes)
          ? assessment.selected_axes.includes(axis.key)
          : true,
      ])
    ) as Record<string, boolean>

    const nextRows = buildInitialSelection()

    if (Array.isArray(assessment.selected_objectives)) {
      for (const item of assessment.selected_objectives) {
        if (nextRows[item.axisKey] && item.rowKey in nextRows[item.axisKey]) {
          nextRows[item.axisKey][item.rowKey] = true
        }
      }
    }

    setSelectedAxes(nextAxes)
    setSelectedRows(nextRows)
    setClinicalIntent(assessment.clinical_intent ?? '')
    setMainGoals(assessment.main_goals ?? '')
    setVigilancePoints(assessment.vigilance_points ?? '')
  }

  async function handleLoadAssessment(patientIdOverride?: string) {
    setSaveMessage(null)
    setSaveError(null)

    const effectivePatientId = (patientIdOverride ?? patientId).trim()

    if (!effectivePatientId) {
      setSaveError('Le patientId est obligatoire pour charger un bilan.')
      return
    }

    try {
      setIsLoadingAssessment(true)

      const response = await fetch(
        `/api/patient-initial-assessments?patientId=${encodeURIComponent(
          effectivePatientId
        )}`,
        { cache: 'no-store' }
      )

      const result = (await response.json()) as AssessmentResponse & {
        error?: string
        details?: string
      }

      if (!response.ok) {
        throw new Error(
          result?.details || result?.error || 'Erreur lors du chargement.'
        )
      }

      applyLoadedAssessment(result.assessment)

      if (result.assessment) {
        setSaveMessage('Bilan initial chargé avec succès.')
      } else {
        setSaveMessage(
          'Aucun bilan existant pour ce patient. Formulaire vierge chargé.'
        )
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur inconnue.'
      setSaveError(message)
      setSaveMessage(null)
    } finally {
      setIsLoadingAssessment(false)
    }
  }

  useEffect(() => {
    if (initialPatientIdFromQuery.trim()) {
      setPatientId(initialPatientIdFromQuery)
      handleLoadAssessment(initialPatientIdFromQuery)
    }
  }, [initialPatientIdFromQuery])

  function toggleAxis(axisKey: string) {
    setSelectedAxes((prev) => ({
      ...prev,
      [axisKey]: !prev[axisKey],
    }))
  }

  function toggleRow(axisKey: string, rowKey: string) {
    setSelectedRows((prev) => ({
      ...prev,
      [axisKey]: {
        ...prev[axisKey],
        [rowKey]: !prev[axisKey]?.[rowKey],
      },
    }))
  }

  function selectAllRowsForAxis(axisKey: string, value: boolean) {
    const axis = ATPE_MATRIX.axes.find((item) => item.key === axisKey)
    if (!axis) return

    setSelectedRows((prev) => ({
      ...prev,
      [axisKey]: Object.fromEntries(axis.rows.map((row) => [row.key, value])),
    }))
  }

  const selectedSummary = useMemo(() => {
    return ATPE_MATRIX.axes
      .filter((axis) => selectedAxes[axis.key])
      .map((axis) => {
        const selectedAxisRows = axis.rows.filter(
          (row) => selectedRows[axis.key]?.[row.key]
        )

        return {
          axisKey: axis.key,
          axisLabel: axis.label,
          rows: selectedAxisRows.map((row) => ({
            rowKey: row.key,
            objective: row.objective,
          })),
        }
      })
      .filter((item) => item.rows.length > 0)
  }, [selectedAxes, selectedRows])

  const totalSelectedRows = useMemo(() => {
    return ATPE_MATRIX.axes.reduce((count, axis) => {
      return (
        count +
        axis.rows.filter((row) => selectedRows[axis.key]?.[row.key]).length
      )
    }, 0)
  }, [selectedRows])

  const selectedAxesList = useMemo(() => {
    return ATPE_MATRIX.axes
      .filter((axis) => selectedAxes[axis.key])
      .map((axis) => axis.key)
  }, [selectedAxes])

  const selectedObjectivesPayload = useMemo(() => {
    return selectedSummary.flatMap((axis) =>
      axis.rows.map((row) => ({
        axisKey: axis.axisKey,
        rowKey: row.rowKey,
        objective: row.objective,
      }))
    )
  }, [selectedSummary])

  function broadcastAssessmentSync() {
    if (!patientId.trim()) return

    const payload = {
      patientId: patientId.trim(),
      updatedAt: Date.now(),
    }

    try {
      window.localStorage.setItem(SYNC_KEY, JSON.stringify(payload))
    } catch {
      // ignore storage failures
    }

    window.dispatchEvent(
      new CustomEvent('atpe:patient-initial-assessment-updated', {
        detail: payload,
      })
    )
  }

  async function handleSave() {
    setSaveMessage(null)
    setSaveError(null)

    if (!patientId.trim()) {
      setSaveError('Le patientId est obligatoire.')
      return
    }

    if (selectedObjectivesPayload.length === 0) {
      setSaveError('Sélectionne au moins un objectif avant d’enregistrer.')
      return
    }

    try {
      setIsSaving(true)

      const response = await fetch('/api/patient-initial-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId.trim(),
          clinicalIntent,
          mainGoals,
          vigilancePoints,
          selectedAxes: selectedAxesList,
          selectedObjectives: selectedObjectivesPayload,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.details || result?.error || 'Erreur lors de la sauvegarde.'
        )
      }

      broadcastAssessmentSync()
      setSaveMessage('Bilan initial enregistré avec succès.')
      setSaveError(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur inconnue.'
      setSaveError(message)
      setSaveMessage(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Configuration clinique</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Bilan initial ATPE
            </h1>
            <p className="mt-3 max-w-4xl text-sm text-slate-600">
              Cet écran permet de sélectionner, dès le bilan expressionnel préalable,
              les axes et objectifs prioritaires à suivre pour le patient.
            </p>
          </div>

          {patientId.trim() ? (
            <Link
              href={`/patients/${encodeURIComponent(patientId.trim())}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              ← Retour fiche patient
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <label className="text-sm font-semibold text-slate-900">
          ID du patient
        </label>
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
          placeholder="Ex. 0f3c012f-7f6a-4b63-8048-1a69b8105401"
        />
        <p className="mt-2 text-xs text-slate-500">
          Utilise l’identifiant UUID réel du patient.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleLoadAssessment()}
            disabled={isLoadingAssessment}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            {isLoadingAssessment ? 'Chargement…' : 'Charger le bilan existant'}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
          >
            Réinitialiser le formulaire
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {ATPE_MATRIX.axes.map((axis) => {
            const axisEnabled = selectedAxes[axis.key]
            const selectedCount = axis.rows.filter(
              (row) => selectedRows[axis.key]?.[row.key]
            ).length

            return (
              <div
                key={axis.key}
                className="rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <input
                        id={`axis-${axis.key}`}
                        type="checkbox"
                        checked={!!axisEnabled}
                        onChange={() => toggleAxis(axis.key)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <label
                        htmlFor={`axis-${axis.key}`}
                        className="text-lg font-semibold text-slate-900"
                      >
                        {axis.label}
                      </label>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {axis.description}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {selectedCount} objectif(s) sélectionné(s)
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => selectAllRowsForAxis(axis.key, true)}
                    className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Tout sélectionner
                  </button>

                  <button
                    type="button"
                    onClick={() => selectAllRowsForAxis(axis.key, false)}
                    className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Tout désélectionner
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {axis.rows.map((row) => (
                    <div
                      key={row.key}
                      className={`rounded-2xl border p-4 ${
                        axisEnabled
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id={`${axis.key}-${row.key}`}
                          type="checkbox"
                          checked={!!selectedRows[axis.key]?.[row.key]}
                          onChange={() => toggleRow(axis.key, row.key)}
                          disabled={!axisEnabled}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`${axis.key}-${row.key}`}
                            className="font-semibold text-slate-900"
                          >
                            {row.objective}
                          </label>

                          <div className="mt-3 grid gap-3 lg:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Sous-objectifs
                              </div>
                              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                {row.subObjectives.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Indicateurs
                              </div>
                              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                {row.indicators.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lecture clinique
                              </div>
                              <p className="mt-2 text-sm text-slate-700">
                                {row.reading.clinical}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lecture institutionnelle
                              </div>
                              <p className="mt-2 text-sm text-slate-700">
                                {row.reading.institutional}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lecture PUZZLE
                              </div>
                              <p className="mt-2 text-sm text-slate-700">
                                {row.reading.puzzle}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Indicateurs sensoriels associés
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {row.sensoryIndicators.map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Signaux faibles
                              </div>
                              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                {row.weakSignals.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Trajectoires de progression
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {row.trajectories.map((trajectory) => (
                                <span
                                  key={trajectory.key}
                                  className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700"
                                >
                                  {trajectory.from} → {trajectory.to}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Synthèse du bilan initial
            </h2>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">
                  Axes actifs :
                </span>{' '}
                {
                  ATPE_MATRIX.axes.filter((axis) => selectedAxes[axis.key]).length
                }
              </div>
              <div className="mt-2">
                <span className="font-semibold text-slate-900">
                  Objectifs retenus :
                </span>{' '}
                {totalSelectedRows}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedSummary.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aucun objectif sélectionné pour le moment.
                </p>
              ) : (
                selectedSummary.map((item) => (
                  <div
                    key={item.axisLabel}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="font-semibold text-slate-900">
                      {item.axisLabel}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {item.rows.map((row) => (
                        <li key={row.objective}>• {row.objective}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <label className="text-sm font-semibold text-slate-900">
              Intention clinique initiale
            </label>
            <textarea
              value={clinicalIntent}
              onChange={(e) => setClinicalIntent(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="Ex. sécuriser l’alliance, soutenir la régulation, observer la dynamique intermodale..."
            />

            <label className="mt-4 block text-sm font-semibold text-slate-900">
              Objectifs thérapeutiques prioritaires
            </label>
            <textarea
              value={mainGoals}
              onChange={(e) => setMainGoals(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="Ex. ancrage corporel, symbolisation, autonomie, participation..."
            />

            <label className="mt-4 block text-sm font-semibold text-slate-900">
              Points de vigilance
            </label>
            <textarea
              value={vigilancePoints}
              onChange={(e) => setVigilancePoints(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="Ex. évitement sensoriel, fragilité relationnelle, débordement émotionnel..."
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSaving ? 'Enregistrement…' : 'Enregistrer le bilan initial'}
            </button>

            {saveMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {saveMessage}
              </div>
            ) : null}

            {saveError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {saveError}
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  )
}