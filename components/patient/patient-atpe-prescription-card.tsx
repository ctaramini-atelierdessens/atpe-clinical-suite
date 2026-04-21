'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  labelPhase,
  labelScope,
  labelSensoryDominant,
} from '@/lib/atpe/referential'

type Condition = {
  id?: string
  label?: string
  description?: string | null
}

type MediaEntity = {
  id?: string
  label?: string
  category?: string
  sensory_dominant?: string
  description?: string | null
}

type ProtocolEntity = {
  id?: string
  label?: string
  phase?: string
  emotional_scope?: string
  summary?: string
  duration_min?: number
  duration_max?: number
  verbalization_style?: string
  closure_ritual?: string | null
}

type MediaRule = {
  id: string
  therapeutic_goal?: string
  caution_level?: string
  notes?: string | null
  media?: MediaEntity | null
}

type ProtocolRule = {
  id: string
  caution_points?: string[]
  watchpoints?: string[]
  team_relay?: Record<string, string> | null
  protocol?: ProtocolEntity | null
}

type Profile = {
  patient_id?: string
  primary_condition_id?: string | null
  therapeutic_phase?: string
  verbalization_level?: string
  emotional_intensity?: string
  sensory_dominant?: string
  tolerance_emotional_level?: string
  risk_flags?: string[]
  follow_up_points?: string[]
}

type PrescriptionPayload = {
  profile?: Profile | null
  condition?: Condition | null
  media?: MediaRule[]
  protocols?: ProtocolRule[]
  watchpoints?: string[]
  attention_points?: string[]
}

type Props = {
  patientId: string
}

type LoadState =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown, fallback = 'Non renseigné') {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

function prettyText(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function cautionLabel(value: string | undefined) {
  switch (value) {
    case 'high':
      return 'Élevée'
    case 'medium':
      return 'Moyenne'
    case 'low':
      return 'Faible'
    default:
      return 'Non précisée'
  }
}

function durationLabel(min?: number, max?: number) {
  const validMin = typeof min === 'number' && Number.isFinite(min) ? min : null
  const validMax = typeof max === 'number' && Number.isFinite(max) ? max : null

  if (validMin !== null && validMax !== null) {
    return `${validMin}-${validMax} min`
  }

  if (validMin !== null) return `${validMin} min`
  if (validMax !== null) return `${validMax} min`

  return 'Durée non renseignée'
}

type AttentionChipProps = {
  text: string
  variant?: 'warning' | 'neutral' | 'soft'
}

function AttentionChip({ text, variant = 'neutral' }: AttentionChipProps) {
  const className =
    variant === 'warning'
      ? 'bg-amber-50 text-amber-900'
      : variant === 'soft'
      ? 'bg-slate-100 text-slate-700'
      : 'bg-white text-slate-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {text}
    </span>
  )
}

type MediaCardProps = {
  item: MediaRule
}

function MediaCard({ item }: MediaCardProps) {
  const media = item.media

  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {asString(media?.label, 'Médiation non renseignée')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {asString(item.therapeutic_goal, 'Objectif thérapeutique non renseigné')}
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
          Caution : {cautionLabel(item.caution_level)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <AttentionChip
          text={`Catégorie : ${prettyText(asString(media?.category, 'inconnue'))}`}
          variant="soft"
        />
        <AttentionChip
          text={`Dominante : ${labelSensoryDominant(asString(media?.sensory_dominant, 'mixte'))}`}
          variant="soft"
        />
      </div>

      {media?.description ? (
        <p className="mt-3 text-xs text-slate-500">{media.description}</p>
      ) : null}

      {item.notes ? <p className="mt-2 text-xs text-slate-500">{item.notes}</p> : null}
    </article>
  )
}

type ProtocolCardProps = {
  item: ProtocolRule
}

function ProtocolCard({ item }: ProtocolCardProps) {
  const protocol = item.protocol
  const cautionPoints = asStringArray(item.caution_points)
  const watchpoints = asStringArray(item.watchpoints)
  const teamRelay =
    item.team_relay && typeof item.team_relay === 'object' ? item.team_relay : {}

  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {asString(protocol?.label, 'Protocole non renseigné')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {asString(protocol?.summary, 'Résumé non renseigné')}
          </p>
        </div>

        <div className="text-xs text-slate-500">
          {durationLabel(protocol?.duration_min, protocol?.duration_max)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <AttentionChip
          text={`Phase : ${labelPhase(asString(protocol?.phase, 'accueil'))}`}
          variant="soft"
        />
        <AttentionChip
          text={`Portée : ${labelScope(asString(protocol?.emotional_scope, 'regulation'))}`}
          variant="soft"
        />
        <AttentionChip
          text={`Verbalisation : ${prettyText(asString(protocol?.verbalization_style, 'non renseignée'))}`}
          variant="soft"
        />
      </div>

      {protocol?.closure_ritual ? (
        <p className="mt-3 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Clôture :</span>{' '}
          {protocol.closure_ritual}
        </p>
      ) : null}

      {cautionPoints.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Vigilances de protocole
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {cautionPoints.map((point) => (
              <AttentionChip key={`caution-${item.id}-${point}`} text={point} variant="warning" />
            ))}
          </div>
        </div>
      ) : null}

      {watchpoints.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Watchpoints
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {watchpoints.map((point) => (
              <AttentionChip key={`watch-${item.id}-${point}`} text={point} />
            ))}
          </div>
        </div>
      ) : null}

      {Object.keys(teamRelay).length > 0 ? (
        <div className="mt-3 rounded-xl bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Relais équipe
          </p>
          <div className="mt-2 space-y-1">
            {Object.entries(teamRelay).map(([key, value]) => (
              <p key={`${item.id}-${key}`} className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{prettyText(key)} :</span>{' '}
                {String(value)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function PatientATPEPrescriptionCard({ patientId }: Props) {
  const [payload, setPayload] = useState<PrescriptionPayload | null>(null)
  const [state, setState] = useState<LoadState>({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      setState({
        type: 'loading',
        message: 'Chargement des recommandations cliniques…',
      })

      try {
        const response = await fetch(`/api/patients/${patientId}/atpe-prescription`, {
          cache: 'no-store',
        })

        const json = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof json?.error === 'string'
              ? json.error
              : 'Chargement impossible.'
          )
        }

        if (!mounted) return

        setPayload((json?.data ?? null) as PrescriptionPayload | null)
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
              : 'Chargement impossible.',
        })
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [patientId])

  const media = useMemo(() => asArray(payload?.media), [payload])
  const protocols = useMemo(() => asArray(payload?.protocols), [payload])
  const attentionPoints = useMemo(
    () => asStringArray(payload?.attention_points),
    [payload]
  )

  const profile = payload?.profile ?? null
  const condition = payload?.condition ?? null

  const hasNoProfile = !profile
  const hasNoCondition = !!profile && !profile.primary_condition_id

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Prescription clinique ATPE
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Médias à privilégier, protocoles adaptés, points à surveiller et relais d’équipe.
        </p>
      </div>

      {state.type === 'loading' ? (
        <div className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          {state.message}
        </div>
      ) : null}

      {state.type === 'error' ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {state.type !== 'error' && hasNoProfile ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aucun profil clinique ATPE n’est encore enregistré pour ce patient.
          Renseigne d’abord le bloc <span className="font-medium">Profil clinique ATPE</span>.
        </div>
      ) : null}

      {state.type !== 'error' && !hasNoProfile && hasNoCondition ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Le profil ATPE existe, mais aucune pathologie principale n’est encore renseignée.
        </div>
      ) : null}

      {payload && !hasNoProfile && !hasNoCondition ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Condition repère
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {asString(condition?.label, 'Non renseignée')}
              </p>
              {condition?.description ? (
                <p className="mt-2 text-sm text-slate-600">{condition.description}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Repères de profil
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <AttentionChip
                  text={`Phase : ${labelPhase(asString(profile?.therapeutic_phase, 'accueil'))}`}
                  variant="soft"
                />
                <AttentionChip
                  text={`Verbalisation : ${prettyText(asString(profile?.verbalization_level, 'faible'))}`}
                  variant="soft"
                />
                <AttentionChip
                  text={`Intensité : ${prettyText(asString(profile?.emotional_intensity, 'moderee'))}`}
                  variant="soft"
                />
                <AttentionChip
                  text={`Sensoriel : ${labelSensoryDominant(asString(profile?.sensory_dominant, 'mixte'))}`}
                  variant="soft"
                />
                <AttentionChip
                  text={`Tolérance : ${prettyText(asString(profile?.tolerance_emotional_level, 'modere'))}`}
                  variant="soft"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Médiations à privilégier
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {media.length > 0 ? (
                media.map((item) => <MediaCard key={item.id} item={item} />)
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune recommandation média disponible pour le moment.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Protocoles adaptés
            </h3>

            <div className="mt-3 space-y-3">
              {protocols.length > 0 ? (
                protocols.map((item) => <ProtocolCard key={item.id} item={item} />)
              ) : (
                <p className="text-sm text-slate-500">
                  Aucun protocole recommandé disponible pour le moment.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Attentions cliniques du jour
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {attentionPoints.length > 0 ? (
                attentionPoints.map((point) => (
                  <AttentionChip key={point} text={point} variant="warning" />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucun point particulier renseigné.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}