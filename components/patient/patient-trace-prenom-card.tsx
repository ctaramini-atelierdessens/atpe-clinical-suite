'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  interpretTracePrenom,
  type TracePrenomInput,
} from '@/lib/atpe-clinical/interpretation'
import type { Database } from '@/lib/database.types'

type TracePrenomObservationRow =
  Database['public']['Tables']['trace_prenom_observations']['Row']

type PatientTracePrenomCardProps = {
  patientId: string
  patientLabel?: string
  sessionId?: string | null
}

type SaveState =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

const defaultState: TracePrenomInput = {
  pressure: 'moyenne',
  continuity: 'fluide',
  spatialOrganization: 'organisee',
  repetition: 'absente',
  hesitation: 'faible',
  anchoring: 'bon',
  readability: 'bonne',
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function toFormState(
  record: Partial<TracePrenomObservationRow> | null | undefined
): TracePrenomInput {
  return {
    pressure:
      record?.pressure === 'faible' ||
      record?.pressure === 'moyenne' ||
      record?.pressure === 'forte'
        ? record.pressure
        : 'moyenne',

    continuity:
      record?.continuity === 'fluide' ||
      record?.continuity === 'retenue' ||
      record?.continuity === 'hachée'
        ? record.continuity
        : 'fluide',

    spatialOrganization:
      record?.spatial_organization === 'organisee' ||
      record?.spatial_organization === 'partielle' ||
      record?.spatial_organization === 'chaotique'
        ? record.spatial_organization
        : 'organisee',

    repetition:
      record?.repetition === 'absente' ||
      record?.repetition === 'moderee' ||
      record?.repetition === 'marquee'
        ? record.repetition
        : 'absente',

    hesitation:
      record?.hesitation === 'faible' ||
      record?.hesitation === 'moderee' ||
      record?.hesitation === 'forte'
        ? record.hesitation
        : 'faible',

    anchoring:
      record?.anchoring === 'bon' ||
      record?.anchoring === 'fragile' ||
      record?.anchoring === 'faible'
        ? record.anchoring
        : 'bon',

    readability:
      record?.readability === 'bonne' ||
      record?.readability === 'moyenne' ||
      record?.readability === 'difficile'
        ? record.readability
        : 'bonne',
  }
}

function asClinicalText(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

type SelectFieldProps = {
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

function SelectField({
  label,
  value,
  disabled = false,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <select
        className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

type DeltaCardProps = {
  label: string
  value: number
}

function DeltaCard({ label, value }: DeltaCardProps) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value >= 0 ? '+' : ''}
        {value}
      </p>
    </div>
  )
}

export function PatientTracePrenomCard({
  patientId,
  patientLabel,
  sessionId = null,
}: PatientTracePrenomCardProps) {
  const [form, setForm] = useState<TracePrenomInput>(defaultState)
  const [clinicianNotes, setClinicianNotes] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [linkedSessionId, setLinkedSessionId] = useState<string | null>(sessionId)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>({
    type: 'idle',
    message: '',
  })

  const result = useMemo(() => interpretTracePrenom(form), [form])

  useEffect(() => {
    setLinkedSessionId(sessionId ?? null)
  }, [sessionId])

  useEffect(() => {
    let isMounted = true

    async function loadLatestObservation() {
      setIsBootstrapping(true)

      try {
        const response = await fetch(`/api/patients/${patientId}/trace-prenom`, {
          method: 'GET',
          cache: 'no-store',
        })

        const json = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof json?.error === 'string'
              ? json.error
              : 'Chargement impossible de la dernière observation.'
          )
        }

        const data = (json?.data ?? null) as TracePrenomObservationRow | null

        if (!isMounted) return

        if (data) {
          setForm(toFormState(data))
          setClinicianNotes(
            typeof data.clinician_notes === 'string' ? data.clinician_notes : ''
          )
          setLastSavedAt(data.created_at ?? null)
          setLinkedSessionId(data.session_id ?? sessionId ?? null)
        }
      } catch (error) {
        if (!isMounted) return

        setSaveState({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Chargement impossible de la dernière observation.',
        })
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void loadLatestObservation()

    return () => {
      isMounted = false
    }
  }, [patientId, sessionId])

  async function handleSave() {
    if (!patientId.trim()) {
      setSaveState({
        type: 'error',
        message: 'Identifiant patient manquant.',
      })
      return
    }

    setSaveState({
      type: 'loading',
      message: 'Enregistrement en cours…',
    })

    try {
      const response = await fetch(`/api/patients/${patientId}/trace-prenom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: form,
          sessionId: linkedSessionId,
          clinicianNotes,
        }),
      })

      const json = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof json?.error === 'string'
            ? json.error
            : 'Enregistrement impossible.'
        )
      }

      const data = (json?.data ?? null) as TracePrenomObservationRow | null

      if (data) {
        setLastSavedAt(data.created_at ?? null)
        setLinkedSessionId(data.session_id ?? linkedSessionId)
      }

      setSaveState({
        type: 'success',
        message: 'Observation Trace-Prénom enregistrée.',
      })
    } catch (error) {
      setSaveState({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Enregistrement impossible.',
      })
    }
  }

  const generatedClinicalText = result.clinicalText
  const displayedPatientLabel = patientLabel || patientId

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Module Trace-Prénom
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Patient : {displayedPatientLabel}
          </p>
          {linkedSessionId ? (
            <p className="mt-1 text-xs text-slate-500">
              Séance liée : {linkedSessionId}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Aucune séance liée</p>
          )}
          {lastSavedAt ? (
            <p className="mt-1 text-xs text-slate-500">
              Dernière observation chargée : {formatDate(lastSavedAt)}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState.type === 'loading' || isBootstrapping}
          className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveState.type === 'loading' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {isBootstrapping ? (
        <div className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Chargement de la dernière observation…
        </div>
      ) : null}

      {saveState.type === 'success' ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {saveState.message}
        </div>
      ) : null}

      {saveState.type === 'error' ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {saveState.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Pression"
            value={form.pressure}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                pressure: value as TracePrenomInput['pressure'],
              }))
            }
            options={[
              { value: 'faible', label: 'Faible' },
              { value: 'moyenne', label: 'Moyenne' },
              { value: 'forte', label: 'Forte' },
            ]}
          />

          <SelectField
            label="Continuité"
            value={form.continuity}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                continuity: value as TracePrenomInput['continuity'],
              }))
            }
            options={[
              { value: 'fluide', label: 'Fluide' },
              { value: 'retenue', label: 'Retenue' },
              { value: 'hachée', label: 'Hachée' },
            ]}
          />

          <SelectField
            label="Organisation spatiale"
            value={form.spatialOrganization}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                spatialOrganization:
                  value as TracePrenomInput['spatialOrganization'],
              }))
            }
            options={[
              { value: 'organisee', label: 'Organisée' },
              { value: 'partielle', label: 'Partielle' },
              { value: 'chaotique', label: 'Chaotique' },
            ]}
          />

          <SelectField
            label="Répétition"
            value={form.repetition}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                repetition: value as TracePrenomInput['repetition'],
              }))
            }
            options={[
              { value: 'absente', label: 'Absente' },
              { value: 'moderee', label: 'Modérée' },
              { value: 'marquee', label: 'Marquée' },
            ]}
          />

          <SelectField
            label="Hésitation"
            value={form.hesitation}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                hesitation: value as TracePrenomInput['hesitation'],
              }))
            }
            options={[
              { value: 'faible', label: 'Faible' },
              { value: 'moderee', label: 'Modérée' },
              { value: 'forte', label: 'Forte' },
            ]}
          />

          <SelectField
            label="Ancrage"
            value={form.anchoring}
            disabled={isBootstrapping}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                anchoring: value as TracePrenomInput['anchoring'],
              }))
            }
            options={[
              { value: 'bon', label: 'Bon' },
              { value: 'fragile', label: 'Fragile' },
              { value: 'faible', label: 'Faible' },
            ]}
          />

          <div className="md:col-span-2">
            <SelectField
              label="Lisibilité"
              value={form.readability}
              disabled={isBootstrapping}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  readability: value as TracePrenomInput['readability'],
                }))
              }
              options={[
                { value: 'bonne', label: 'Bonne' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'difficile', label: 'Difficile' },
              ]}
            />
          </div>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-900">
              Notes clinicien
            </span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
              value={clinicianNotes}
              disabled={isBootstrapping}
              onChange={(e) => setClinicianNotes(e.target.value)}
              placeholder="Observations complémentaires, contexte, nuances cliniques…"
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DeltaCard label="Engagement" value={result.engagementDelta} />
            <DeltaCard label="Tension" value={result.tensionDelta} />
            <DeltaCard
              label="Vulnérabilité"
              value={result.vulnerabilityDelta}
            />
            <DeltaCard
              label="Symbolisation"
              value={result.symbolizationDelta}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Hypothèses générées
            </h3>

            <div className="mt-3 space-y-2">
              {generatedClinicalText.length > 0 ? (
                generatedClinicalText.map((item, index) => (
                  <div
                    key={`trace-prenom-generated-${index}`}
                    className="rounded-lg bg-white p-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucun signal clinique particulier avec la configuration actuelle.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Données prêtes à être enregistrées
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">Pression :</span>{' '}
                {form.pressure}
              </div>
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">Continuité :</span>{' '}
                {form.continuity}
              </div>
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">
                  Organisation :
                </span>{' '}
                {form.spatialOrganization}
              </div>
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">Répétition :</span>{' '}
                {form.repetition}
              </div>
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">Hésitation :</span>{' '}
                {form.hesitation}
              </div>
              <div className="rounded-lg bg-white p-3">
                <span className="font-medium text-slate-900">Ancrage :</span>{' '}
                {form.anchoring}
              </div>
              <div className="rounded-lg bg-white p-3 sm:col-span-2">
                <span className="font-medium text-slate-900">Lisibilité :</span>{' '}
                {form.readability}
              </div>
            </div>
          </div>

          {asClinicalText(generatedClinicalText).length > 0 ? (
            <div className="text-xs text-slate-500">
              Les hypothèses affichées sont des repères cliniques prudents à
              articuler avec l’observation globale.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}