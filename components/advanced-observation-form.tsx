'use client'

import React, { useMemo, useState } from 'react'
import {
  AtpeEngineOutput,
  AtpeSessionAdvancedInput,
  runAtpeEngineV2,
} from '@/lib/atpe-engine-v2'

type Props = {
  patientId: string
  sessionId: string
  groupId?: string | null
  onSaved?: (payload: { saved: any; engine: AtpeEngineOutput }) => void
}

type FormState = {
  format: 'individual' | 'group'
  medium_primary: string
  medium_secondary: string
  atpe_phase_dominant:
    | ''
    | 'attitude_interieure'
    | 'creation'
    | 'dialogue_oeuvre'
    | 'partage'

  frame_containment: number
  bodily_engagement: number

  decentering_level: number
  centering_level: number
  externalization_level: number
  work_dialogue_level: number
  sharing_level: number

  primary_symbolization: number
  secondary_symbolization: number
  relational_availability: number
  creative_mobility: number

  projective_intensity: number
  group_cohesion: number
  group_containment: number
  transfer_diffraction: number

  therapist_presence_quality: number
  patient_engagement_level: number

  therapist_feels_confusion: boolean
  therapist_feels_sudden_fatigue: boolean
  therapist_feels_pressure: boolean
  therapist_feels_irritation: boolean
  therapist_feels_void: boolean
  patient_repeats_without_integration: boolean
  group_feels_same_affect: boolean
  tension_spreads_quickly: boolean

  therapist_countertransference_notes: string
  clinical_hypotheses: string
  next_step_recommendation: string
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}/100</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

export function AdvancedObservationForm({
  patientId,
  sessionId,
  groupId = null,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>({
    format: 'individual',
    medium_primary: '',
    medium_secondary: '',
    atpe_phase_dominant: 'creation',

    frame_containment: 70,
    bodily_engagement: 50,

    decentering_level: 50,
    centering_level: 50,
    externalization_level: 50,
    work_dialogue_level: 50,
    sharing_level: 50,

    primary_symbolization: 50,
    secondary_symbolization: 40,
    relational_availability: 50,
    creative_mobility: 50,

    projective_intensity: 30,
    group_cohesion: 40,
    group_containment: 40,
    transfer_diffraction: 20,

    therapist_presence_quality: 70,
    patient_engagement_level: 50,

    therapist_feels_confusion: false,
    therapist_feels_sudden_fatigue: false,
    therapist_feels_pressure: false,
    therapist_feels_irritation: false,
    therapist_feels_void: false,
    patient_repeats_without_integration: false,
    group_feels_same_affect: false,
    tension_spreads_quickly: false,

    therapist_countertransference_notes: '',
    clinical_hypotheses: '',
    next_step_recommendation: '',
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const liveInput: AtpeSessionAdvancedInput = useMemo(
    () => ({
      format: form.format,
      mediumPrimary: form.medium_primary || null,
      mediumSecondary: form.medium_secondary || null,
      atpePhaseDominant:
        form.atpe_phase_dominant === '' ? null : form.atpe_phase_dominant,

      frameContainment: form.frame_containment,
      bodilyEngagement: form.bodily_engagement,

      decenteringLevel: form.decentering_level,
      centeringLevel: form.centering_level,
      externalizationLevel: form.externalization_level,
      workDialogueLevel: form.work_dialogue_level,
      sharingLevel: form.sharing_level,

      primarySymbolization: form.primary_symbolization,
      secondarySymbolization: form.secondary_symbolization,
      relationalAvailability: form.relational_availability,
      creativeMobility: form.creative_mobility,

      projectiveIntensity: form.projective_intensity,
      groupCohesion: form.group_cohesion,
      groupContainment: form.group_containment,
      transferDiffraction: form.transfer_diffraction,

      therapistPresenceQuality: form.therapist_presence_quality,
      patientEngagementLevel: form.patient_engagement_level,

      markers: {
        therapistFeelsConfusion: form.therapist_feels_confusion,
        therapistFeelsSuddenFatigue: form.therapist_feels_sudden_fatigue,
        therapistFeelsPressure: form.therapist_feels_pressure,
        therapistFeelsIrritation: form.therapist_feels_irritation,
        therapistFeelsVoid: form.therapist_feels_void,
        patientRepeatsWithoutIntegration:
          form.patient_repeats_without_integration,
        groupFeelsSameAffect: form.group_feels_same_affect,
        tensionSpreadsQuickly: form.tension_spreads_quickly,
      },
    }),
    [form],
  )

  const liveResult = useMemo(() => runAtpeEngineV2(liveInput), [liveInput])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/atpe-advanced-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          group_id: groupId,
          session_id: sessionId,
          ...form,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.error || 'Impossible d’enregistrer l’observation.',
        )
      }

      setMessage('Observation thérapeutique avancée enregistrée avec succès.')

      if (onSaved) {
        onSaved({
          saved: payload.data,
          engine: payload.engine,
        })
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Une erreur inconnue est survenue.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="1. Dispositif">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Format"
            value={form.format}
            onChange={(v) => patch('format', v as FormState['format'])}
            options={[
              { value: 'individual', label: 'Individuel' },
              { value: 'group', label: 'Groupe' },
            ]}
          />

          <Input
            label="Médium principal"
            value={form.medium_primary}
            onChange={(v) => patch('medium_primary', v)}
            placeholder="Peinture, collage, écriture..."
          />

          <Input
            label="Médium secondaire"
            value={form.medium_secondary}
            onChange={(v) => patch('medium_secondary', v)}
            placeholder="Optionnel"
          />

          <Select
            label="Phase ATPE dominante"
            value={form.atpe_phase_dominant}
            onChange={(v) =>
              patch(
                'atpe_phase_dominant',
                v as FormState['atpe_phase_dominant'],
              )
            }
            options={[
              { value: 'attitude_interieure', label: 'Attitude intérieure' },
              { value: 'creation', label: 'Création' },
              { value: 'dialogue_oeuvre', label: "Dialogue avec l'œuvre" },
              { value: 'partage', label: 'Partage' },
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Slider
            label="Contenance du cadre"
            value={form.frame_containment}
            onChange={(v) => patch('frame_containment', v)}
          />
          <Slider
            label="Qualité de présence thérapeutique"
            value={form.therapist_presence_quality}
            onChange={(v) => patch('therapist_presence_quality', v)}
          />
        </div>
      </Section>

      <Section title="2. Processus symbolisant">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Slider
            label="Engagement corporel"
            value={form.bodily_engagement}
            onChange={(v) => patch('bodily_engagement', v)}
          />
          <Slider
            label="Niveau d’engagement du patient"
            value={form.patient_engagement_level}
            onChange={(v) => patch('patient_engagement_level', v)}
          />
          <Slider
            label="Décentration"
            value={form.decentering_level}
            onChange={(v) => patch('decentering_level', v)}
          />
          <Slider
            label="Centration"
            value={form.centering_level}
            onChange={(v) => patch('centering_level', v)}
          />
          <Slider
            label="Extériorisation"
            value={form.externalization_level}
            onChange={(v) => patch('externalization_level', v)}
          />
          <Slider
            label="Dialogue avec l’œuvre"
            value={form.work_dialogue_level}
            onChange={(v) => patch('work_dialogue_level', v)}
          />
          <Slider
            label="Partage"
            value={form.sharing_level}
            onChange={(v) => patch('sharing_level', v)}
          />
          <Slider
            label="Symbolisation primaire"
            value={form.primary_symbolization}
            onChange={(v) => patch('primary_symbolization', v)}
          />
          <Slider
            label="Symbolisation secondaire"
            value={form.secondary_symbolization}
            onChange={(v) => patch('secondary_symbolization', v)}
          />
          <Slider
            label="Disponibilité relationnelle"
            value={form.relational_availability}
            onChange={(v) => patch('relational_availability', v)}
          />
          <Slider
            label="Mobilité créative"
            value={form.creative_mobility}
            onChange={(v) => patch('creative_mobility', v)}
          />
        </div>
      </Section>

      <Section title="3. Champ projectif et groupal">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Slider
            label="Intensité projective"
            value={form.projective_intensity}
            onChange={(v) => patch('projective_intensity', v)}
          />
          <Slider
            label="Cohésion groupale"
            value={form.group_cohesion}
            onChange={(v) => patch('group_cohesion', v)}
          />
          <Slider
            label="Contenance du groupe"
            value={form.group_containment}
            onChange={(v) => patch('group_containment', v)}
          />
          <Slider
            label="Diffraction du transfert"
            value={form.transfer_diffraction}
            onChange={(v) => patch('transfer_diffraction', v)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Checkbox
            label="Le thérapeute ressent de la confusion"
            checked={form.therapist_feels_confusion}
            onChange={(v) => patch('therapist_feels_confusion', v)}
          />
          <Checkbox
            label="Fatigue soudaine"
            checked={form.therapist_feels_sudden_fatigue}
            onChange={(v) => patch('therapist_feels_sudden_fatigue', v)}
          />
          <Checkbox
            label="Pression ressentie"
            checked={form.therapist_feels_pressure}
            onChange={(v) => patch('therapist_feels_pressure', v)}
          />
          <Checkbox
            label="Irritation ressentie"
            checked={form.therapist_feels_irritation}
            onChange={(v) => patch('therapist_feels_irritation', v)}
          />
          <Checkbox
            label="Ressenti de vide"
            checked={form.therapist_feels_void}
            onChange={(v) => patch('therapist_feels_void', v)}
          />
          <Checkbox
            label="Le patient répète sans intégrer"
            checked={form.patient_repeats_without_integration}
            onChange={(v) => patch('patient_repeats_without_integration', v)}
          />
          <Checkbox
            label="Le groupe ressent le même affect"
            checked={form.group_feels_same_affect}
            onChange={(v) => patch('group_feels_same_affect', v)}
          />
          <Checkbox
            label="La tension se diffuse rapidement"
            checked={form.tension_spreads_quickly}
            onChange={(v) => patch('tension_spreads_quickly', v)}
          />
        </div>
      </Section>

      <Section title="4. Notes cliniques">
        <div className="grid gap-4 xl:grid-cols-3">
          <TextArea
            label="Notes contre-transférentielles"
            value={form.therapist_countertransference_notes}
            onChange={(v) => patch('therapist_countertransference_notes', v)}
            rows={6}
          />
          <TextArea
            label="Hypothèses cliniques complémentaires"
            value={form.clinical_hypotheses}
            onChange={(v) => patch('clinical_hypotheses', v)}
            rows={6}
          />
          <TextArea
            label="Recommandation de prochaine étape"
            value={form.next_step_recommendation}
            onChange={(v) => patch('next_step_recommendation', v)}
            rows={6}
          />
        </div>
      </Section>

      <Section title="5. Prévisualisation moteur V2">
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            {liveResult.narrative}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Profil symbolique
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {liveResult.profile.symbolicProfile}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mode relationnel
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {liveResult.profile.relationalMode}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mode groupal
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {liveResult.profile.groupMode}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mode projectif
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {liveResult.profile.projectionMode}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Enregistrement en cours...' : 'Enregistrer l’observation avancée'}
        </button>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>
    </form>
  )
}