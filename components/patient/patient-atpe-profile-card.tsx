'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  labelEmotionalIntensity,
  labelSensoryDominant,
  labelTolerance,
  labelVerbalization,
  labelPhase,
} from '@/lib/atpe/referential'

type Condition = {
  id: string
  label: string
  family?: string
  description?: string | null
}

type Media = {
  id: string
  label: string
  category?: string
  sensory_dominant?: string
}

type Profile = {
  primary_condition_id: string | null
  associated_condition_ids: string[]
  verbalization_level: string
  emotional_intensity: string
  sensory_dominant: string
  therapeutic_phase: string
  tolerance_emotional_level: string
  preferred_media_ids: string[]
  caution_media_ids: string[]
  risk_flags: string[]
  follow_up_points: string[]
  notes: string | null
}

type ReferentialPayload = {
  conditions?: Condition[]
  media?: Media[]
}

type Props = {
  patientId: string
}

type SaveState =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

const EMPTY_PROFILE: Profile = {
  primary_condition_id: null,
  associated_condition_ids: [],
  verbalization_level: 'faible',
  emotional_intensity: 'moderee',
  sensory_dominant: 'mixte',
  therapeutic_phase: 'accueil',
  tolerance_emotional_level: 'modere',
  preferred_media_ids: [],
  caution_media_ids: [],
  risk_flags: [],
  follow_up_points: [],
  notes: '',
}

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)))
}

function linesToArray(value: string): string[] {
  return uniqueStrings(
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  )
}

function arrayToLines(value: string[] | null | undefined): string {
  return asArray(value).join('\n')
}

function prettyText(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

type MultiSelectItem = {
  id: string
  label: string
  helper?: string
}

type MultiSelectProps = {
  label: string
  items: MultiSelectItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  emptyLabel: string
}

function MultiSelectChecklist({
  label,
  items,
  selectedIds,
  onToggle,
  emptyLabel,
}: MultiSelectProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>

      {items.length === 0 ? (
        <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-2 rounded-xl border bg-white p-3">
          {items.map((item) => {
            const checked = selectedIds.includes(item.id)

            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">
                    {item.label}
                  </span>
                  {item.helper ? (
                    <span className="block text-xs text-slate-500">
                      {item.helper}
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PatientATPEProfileCard({ patientId }: Props) {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [riskFlagsText, setRiskFlagsText] = useState('')
  const [followUpPointsText, setFollowUpPointsText] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let mounted = true

    async function boot() {
      setIsBootstrapping(true)

      try {
        const [profileRes, refRes] = await Promise.all([
          fetch(`/api/patients/${patientId}/atpe-profile`, {
            cache: 'no-store',
          }),
          fetch('/api/atpe/referential', {
            cache: 'no-store',
          }),
        ])

        const profileJson = await profileRes.json().catch(() => null)
        const refJson = await refRes.json().catch(() => null)

        if (!mounted) return

        if (!refRes.ok) {
          throw new Error(
            typeof refJson?.error === 'string'
              ? refJson.error
              : 'Chargement du référentiel impossible.'
          )
        }

        const refData = (refJson?.data ?? {}) as ReferentialPayload
        const conditionsData = asArray(refData.conditions)
        const mediaData = asArray(refData.media)

        setConditions(conditionsData)
        setMedia(mediaData)

        if (!profileRes.ok) {
          throw new Error(
            typeof profileJson?.error === 'string'
              ? profileJson.error
              : 'Chargement du profil impossible.'
          )
        }

        const incoming = (profileJson?.data ?? null) as Partial<Profile> | null

        if (incoming) {
          const safeProfile: Profile = {
            ...EMPTY_PROFILE,
            ...incoming,
            associated_condition_ids: asArray(incoming.associated_condition_ids),
            preferred_media_ids: asArray(incoming.preferred_media_ids),
            caution_media_ids: asArray(incoming.caution_media_ids),
            risk_flags: asArray(incoming.risk_flags),
            follow_up_points: asArray(incoming.follow_up_points),
            notes: typeof incoming.notes === 'string' ? incoming.notes : '',
          }

          setProfile(safeProfile)
          setRiskFlagsText(arrayToLines(safeProfile.risk_flags))
          setFollowUpPointsText(arrayToLines(safeProfile.follow_up_points))
        } else {
          setProfile(EMPTY_PROFILE)
          setRiskFlagsText('')
          setFollowUpPointsText('')
        }

        setSaveState({
          type: 'idle',
          message: '',
        })
      } catch (error) {
        if (!mounted) return

        setSaveState({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'Chargement impossible.',
        })
      } finally {
        if (mounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void boot()

    return () => {
      mounted = false
    }
  }, [patientId])

  const associatedConditionItems = useMemo<MultiSelectItem[]>(
    () =>
      conditions.map((condition) => ({
        id: condition.id,
        label: condition.label,
        helper: condition.family ? prettyText(condition.family) : undefined,
      })),
    [conditions]
  )

  const mediaItems = useMemo<MultiSelectItem[]>(
    () =>
      media.map((item) => ({
        id: item.id,
        label: item.label,
        helper: item.sensory_dominant
          ? labelSensoryDominant(item.sensory_dominant)
          : undefined,
      })),
    [media]
  )

  function toggleId(key: 'associated_condition_ids' | 'preferred_media_ids' | 'caution_media_ids', id: string) {
    setProfile((prev) => {
      const current = prev[key]
      const exists = current.includes(id)

      return {
        ...prev,
        [key]: exists ? current.filter((item) => item !== id) : [...current, id],
      }
    })
  }

  async function save() {
    setSaveState({
      type: 'loading',
      message: 'Enregistrement du profil ATPE…',
    })

    try {
      const payload: Profile = {
        ...profile,
        risk_flags: linesToArray(riskFlagsText),
        follow_up_points: linesToArray(followUpPointsText),
        notes:
          typeof profile.notes === 'string' && profile.notes.trim().length > 0
            ? profile.notes
            : '',
      }

      const response = await fetch(`/api/patients/${patientId}/atpe-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof json?.error === 'string'
            ? json.error
            : 'Enregistrement impossible.'
        )
      }

      setProfile((prev) => ({
        ...prev,
        risk_flags: payload.risk_flags,
        follow_up_points: payload.follow_up_points,
      }))

      setSaveState({
        type: 'success',
        message: 'Profil clinique ATPE enregistré.',
      })
    } catch (error) {
      setSaveState({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Enregistrement impossible.',
      })
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Profil clinique ATPE
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pathologie repère, phase thérapeutique, verbalisation, intensité, dominantes et vigilance.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={isBootstrapping || saveState.type === 'loading'}
          className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveState.type === 'loading' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {isBootstrapping ? (
        <div className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Chargement du profil clinique ATPE…
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
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Pathologie principale
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.primary_condition_id ?? ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  primary_condition_id: e.target.value || null,
                }))
              }
            >
              <option value="">Non renseignée</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Phase thérapeutique
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.therapeutic_phase}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  therapeutic_phase: e.target.value,
                }))
              }
            >
              <option value="accueil">{labelPhase('accueil')}</option>
              <option value="expression">{labelPhase('expression')}</option>
              <option value="traversee">{labelPhase('traversee')}</option>
              <option value="reparation">{labelPhase('reparation')}</option>
              <option value="affirmation">{labelPhase('affirmation')}</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Verbalisation
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.verbalization_level}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  verbalization_level: e.target.value,
                }))
              }
            >
              <option value="absente">{labelVerbalization('absente')}</option>
              <option value="faible">{labelVerbalization('faible')}</option>
              <option value="retenue">{labelVerbalization('retenue')}</option>
              <option value="flottante">{labelVerbalization('flottante')}</option>
              <option value="metaphorique">{labelVerbalization('metaphorique')}</option>
              <option value="spontanee">{labelVerbalization('spontanee')}</option>
              <option value="reflexive">{labelVerbalization('reflexive')}</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Intensité émotionnelle
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.emotional_intensity}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  emotional_intensity: e.target.value,
                }))
              }
            >
              <option value="faible">{labelEmotionalIntensity('faible')}</option>
              <option value="moderee">{labelEmotionalIntensity('moderee')}</option>
              <option value="forte">{labelEmotionalIntensity('forte')}</option>
              <option value="flottante">{labelEmotionalIntensity('flottante')}</option>
              <option value="ambivalente">{labelEmotionalIntensity('ambivalente')}</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Dominante sensorielle
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.sensory_dominant}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  sensory_dominant: e.target.value,
                }))
              }
            >
              <option value="mixte">{labelSensoryDominant('mixte')}</option>
              <option value="tactile">{labelSensoryDominant('tactile')}</option>
              <option value="visuelle">{labelSensoryDominant('visuelle')}</option>
              <option value="auditive">{labelSensoryDominant('auditive')}</option>
              <option value="kinesthesique">{labelSensoryDominant('kinesthesique')}</option>
              <option value="imaginaire">{labelSensoryDominant('imaginaire')}</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Tolérance émotionnelle
            </span>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.tolerance_emotional_level}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  tolerance_emotional_level: e.target.value,
                }))
              }
            >
              <option value="fragile">{labelTolerance('fragile')}</option>
              <option value="modere">{labelTolerance('modere')}</option>
              <option value="satisfaisant">{labelTolerance('satisfaisant')}</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <MultiSelectChecklist
              label="Pathologies associées"
              items={associatedConditionItems}
              selectedIds={profile.associated_condition_ids}
              onToggle={(id) => toggleId('associated_condition_ids', id)}
              emptyLabel="Aucune pathologie référentielle disponible."
            />
          </div>

          <div className="md:col-span-2">
            <MultiSelectChecklist
              label="Médiations à privilégier"
              items={mediaItems}
              selectedIds={profile.preferred_media_ids}
              onToggle={(id) => toggleId('preferred_media_ids', id)}
              emptyLabel="Aucune médiation référentielle disponible."
            />
          </div>

          <div className="md:col-span-2">
            <MultiSelectChecklist
              label="Médiations à doser / surveiller"
              items={mediaItems}
              selectedIds={profile.caution_media_ids}
              onToggle={(id) => toggleId('caution_media_ids', id)}
              emptyLabel="Aucune médiation référentielle disponible."
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Flags de risque
            </span>
            <textarea
              className="min-h-[110px] w-full rounded-xl border px-3 py-2 text-sm"
              value={riskFlagsText}
              onChange={(e) => setRiskFlagsText(e.target.value)}
              placeholder={'Un item par ligne\nEx. risque de sidération\nEx. surstimulation sensorielle'}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Points de suivi
            </span>
            <textarea
              className="min-h-[110px] w-full rounded-xl border px-3 py-2 text-sm"
              value={followUpPointsText}
              onChange={(e) => setFollowUpPointsText(e.target.value)}
              placeholder={'Un item par ligne\nEx. maintenir cadre très stable\nEx. préserver rituel de clôture'}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">
              Notes cliniques
            </span>
            <textarea
              className="min-h-[140px] w-full rounded-xl border px-3 py-2 text-sm"
              value={profile.notes ?? ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Hypothèses, ajustements de cadre, attention aux déclencheurs, indications de médiation…"
            />
          </label>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Synthèse rapide du profil
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                Phase : {labelPhase(profile.therapeutic_phase)}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                Verbalisation : {labelVerbalization(profile.verbalization_level)}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                Intensité : {labelEmotionalIntensity(profile.emotional_intensity)}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                Sensoriel : {labelSensoryDominant(profile.sensory_dominant)}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                Tolérance : {labelTolerance(profile.tolerance_emotional_level)}
              </span>
            </div>

            {linesToArray(riskFlagsText).length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Risques repérés
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {linesToArray(riskFlagsText).map((item) => (
                    <span
                      key={`risk-${item}`}
                      className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {linesToArray(followUpPointsText).length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Points de suivi
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {linesToArray(followUpPointsText).map((item) => (
                    <span
                      key={`followup-${item}`}
                      className="rounded-full bg-white px-3 py-1 text-xs text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}