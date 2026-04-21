'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdvancedObservationForm } from '@/components/advanced-observation-form'
import { AdvancedProcessDashboard } from '@/components/advanced-process-dashboard'
import {
  AtpeEngineOutput,
  AtpeSessionAdvancedInput,
  runAtpeEngineV2,
} from '@/lib/atpe-engine-v2'

type AdvancedRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  session_id: string
  format: 'individual' | 'group'
  medium_primary: string | null
  medium_secondary: string | null
  atpe_phase_dominant:
    | 'attitude_interieure'
    | 'creation'
    | 'dialogue_oeuvre'
    | 'partage'
    | null

  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null

  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null

  projective_intensity: number | null
  group_cohesion: number | null
  group_containment: number | null
  transfer_diffraction: number | null

  therapist_presence_quality: number | null
  patient_engagement_level: number | null

  therapist_feels_confusion: boolean
  therapist_feels_sudden_fatigue: boolean
  therapist_feels_pressure: boolean
  therapist_feels_irritation: boolean
  therapist_feels_void: boolean
  patient_repeats_without_integration: boolean
  group_feels_same_affect: boolean
  tension_spreads_quickly: boolean

  therapist_countertransference_notes: string | null
  clinical_hypotheses: string | null
  next_step_recommendation: string | null

  created_at: string
}

type Props = {
  patientId: string
  sessionId?: string
  groupId?: string | null
}

function rowToInput(row: AdvancedRow): AtpeSessionAdvancedInput {
  return {
    format: row.format,
    mediumPrimary: row.medium_primary,
    mediumSecondary: row.medium_secondary,
    atpePhaseDominant: row.atpe_phase_dominant,

    frameContainment: row.frame_containment,
    bodilyEngagement: row.bodily_engagement,

    decenteringLevel: row.decentering_level,
    centeringLevel: row.centering_level,
    externalizationLevel: row.externalization_level,
    workDialogueLevel: row.work_dialogue_level,
    sharingLevel: row.sharing_level,

    primarySymbolization: row.primary_symbolization,
    secondarySymbolization: row.secondary_symbolization,
    relationalAvailability: row.relational_availability,
    creativeMobility: row.creative_mobility,

    projectiveIntensity: row.projective_intensity,
    groupCohesion: row.group_cohesion,
    groupContainment: row.group_containment,
    transferDiffraction: row.transfer_diffraction,

    therapistPresenceQuality: row.therapist_presence_quality,
    patientEngagementLevel: row.patient_engagement_level,

    markers: {
      therapistFeelsConfusion: row.therapist_feels_confusion,
      therapistFeelsSuddenFatigue: row.therapist_feels_sudden_fatigue,
      therapistFeelsPressure: row.therapist_feels_pressure,
      therapistFeelsIrritation: row.therapist_feels_irritation,
      therapistFeelsVoid: row.therapist_feels_void,
      patientRepeatsWithoutIntegration:
        row.patient_repeats_without_integration,
      groupFeelsSameAffect: row.group_feels_same_affect,
      tensionSpreadsQuickly: row.tension_spreads_quickly,
    },
  }
}

export function PatientAdvancedProcessPanel({
  patientId,
  sessionId,
  groupId = null,
}: Props) {
  const [rows, setRows] = useState<AdvancedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const effectiveSessionId = sessionId ?? `advanced-${patientId}`

  async function loadRows() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ patientId })
      const response = await fetch(`/api/atpe-advanced-session?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.error || 'Impossible de charger les observations avancées.',
        )
      }

      setRows(payload.data ?? [])
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erreur de chargement.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [patientId])

  const latest = rows[0] ?? null

  const latestInput = useMemo(() => {
    return latest ? rowToInput(latest) : null
  }, [latest])

  const latestResult: AtpeEngineOutput | null = useMemo(() => {
    return latestInput ? runAtpeEngineV2(latestInput) : null
  }, [latestInput])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Observation thérapeutique avancée
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Saisie clinique, lecture moteur V2, dynamique projective et groupale.
        </p>
      </div>

      <AdvancedObservationForm
        patientId={patientId}
        sessionId={effectiveSessionId}
        groupId={groupId}
        onSaved={() => {
          void loadRows()
        }}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Dernière synthèse enregistrée
        </h3>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : !latest || !latestInput || !latestResult ? (
          <p className="text-sm text-slate-500">
            Aucune observation avancée enregistrée pour le moment.
          </p>
        ) : (
          <AdvancedProcessDashboard input={latestInput} result={latestResult} />
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Historique récent
        </h3>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : !rows.length ? (
          <p className="text-sm text-slate-500">
            Aucun historique avancé disponible.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.medium_primary || 'Médium non renseigné'} —{' '}
                      {row.atpe_phase_dominant || 'phase non renseignée'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Session : {row.session_id}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(row.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                    Cadre : {row.frame_containment ?? 0}/100
                  </div>
                  <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                    Symbolisation primaire : {row.primary_symbolization ?? 0}/100
                  </div>
                  <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                    Symbolisation secondaire : {row.secondary_symbolization ?? 0}/100
                  </div>
                  <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                    Intensité projective : {row.projective_intensity ?? 0}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}