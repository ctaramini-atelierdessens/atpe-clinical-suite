'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { PatientSessionSelector } from '@/components/patient-session-selector'

type PatientLike = {
  id?: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  [key: string]: unknown
}

type ComparisonDimension = {
  current: number
  previous: number
  delta: number
}

type ComparisonFlag = {
  level: 'info' | 'moderate' | 'high'
  code: string
  title: string
  description: string
}

type ComparisonProfile = {
  symbolicProfile: string
  relationalMode: string
  groupMode: string
  projectionMode: string
}

type ComparisonResponse = {
  success: boolean
  data?: {
    patientId: string
    currentSessionId: string
    previousSessionId: string | null
    narrative: string
    sessions: Array<{
      id: string
      label: string
      createdAt?: string | null
    }>
    dimensions: {
      frameContainment: ComparisonDimension | null
      bodilyEngagement: ComparisonDimension | null
      primarySymbolization: ComparisonDimension | null
      secondarySymbolization: ComparisonDimension | null
      relationalAvailability: ComparisonDimension | null
      creativeMobility: ComparisonDimension | null
      projectiveIntensity: ComparisonDimension | null
      groupContainment: ComparisonDimension | null
    }
    currentProfile: ComparisonProfile | null
    previousProfile: ComparisonProfile | null
    hypotheses: string[]
    alerts: string[]
    recommendations: string[]
    flags: ComparisonFlag[]
  }
  error?: string
}

type Props = {
  patient?: PatientLike
  patientId: string
  initialSessionId?: string
}

function getPatientName(patient?: PatientLike) {
  if (!patient) return 'Patient'
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (typeof patient.id === 'string' && patient.id.trim()) return `Patient ${patient.id}`
  return 'Patient'
}

function deltaLabel(delta: number) {
  if (delta > 0) return `+${delta}`
  return `${delta}`
}

function deltaTone(delta: number) {
  if (delta > 0) return 'text-emerald-700'
  if (delta < 0) return 'text-rose-700'
  return 'text-slate-600'
}

function flagTone(level: ComparisonFlag['level']) {
  if (level === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

function DimensionCard({
  label,
  dimension,
}: {
  label: string
  dimension: ComparisonDimension | null
}) {
  if (!dimension) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-sm text-slate-500">Données insuffisantes</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 space-y-1 text-sm">
        <p className="text-slate-700">
          Actuel : <span className="font-semibold text-slate-900">{dimension.current}/100</span>
        </p>
        <p className="text-slate-700">
          Précédent : <span className="font-semibold text-slate-900">{dimension.previous}/100</span>
        </p>
        <p className={deltaTone(dimension.delta)}>
          Écart : <span className="font-semibold">{deltaLabel(dimension.delta)}</span>
        </p>
      </div>
    </div>
  )
}

function ProfileCard({
  title,
  profile,
}: {
  title: string
  profile: ComparisonProfile | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {!profile ? (
        <p className="mt-3 text-sm text-slate-500">Profil indisponible.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 p-3">
            Symbolique : <span className="font-semibold text-slate-900">{profile.symbolicProfile}</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            Relationnel : <span className="font-semibold text-slate-900">{profile.relationalMode}</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            Groupal : <span className="font-semibold text-slate-900">{profile.groupMode}</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            Projectif : <span className="font-semibold text-slate-900">{profile.projectionMode}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function PatientLongitudinalSummary({
  patient,
  patientId,
  initialSessionId,
}: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId ?? '')
  const [payload, setPayload] = useState<ComparisonResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const patientName = useMemo(() => getPatientName(patient), [patient])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!patientId) {
        setLoading(false)
        setPayload(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ patientId })
        if (selectedSessionId) {
          params.set('sessionId', selectedSessionId)
        }

        const response = await fetch(`/api/atpe-advanced-compare?${params.toString()}`)
        const json = (await response.json()) as ComparisonResponse

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error || 'Impossible de charger la synthèse longitudinale.')
        }

        if (!cancelled) {
          setPayload(json.data)
          if (!selectedSessionId && json.data.currentSessionId) {
            setSelectedSessionId(json.data.currentSessionId)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement.')
          setPayload(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [patientId, selectedSessionId])

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement de la synthèse longitudinale...</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!payload) {
    return (
      <p className="text-sm text-slate-500">
        Aucune donnée longitudinale disponible pour le moment.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Synthèse longitudinale renforcée
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Comparaison séance actuelle / séance précédente pour {patientName}.
        </p>
      </div>

      <PatientSessionSelector
        sessions={payload.sessions}
        value={selectedSessionId}
        onChange={setSelectedSessionId}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {payload.narrative}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DimensionCard label="Cadre" dimension={payload.dimensions.frameContainment} />
        <DimensionCard label="Engagement corporel" dimension={payload.dimensions.bodilyEngagement} />
        <DimensionCard label="Symb. primaire" dimension={payload.dimensions.primarySymbolization} />
        <DimensionCard label="Symb. secondaire" dimension={payload.dimensions.secondarySymbolization} />
        <DimensionCard label="Relationnel" dimension={payload.dimensions.relationalAvailability} />
        <DimensionCard label="Créativité" dimension={payload.dimensions.creativeMobility} />
        <DimensionCard label="Projectif" dimension={payload.dimensions.projectiveIntensity} />
        <DimensionCard label="Contenance groupale" dimension={payload.dimensions.groupContainment} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileCard title="Profil actuel" profile={payload.currentProfile} />
        <ProfileCard title="Profil précédent" profile={payload.previousProfile} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Drapeaux cliniques automatiques</p>
        <div className="mt-3 space-y-3">
          {payload.flags.length ? (
            payload.flags.map((flag, index) => (
              <div
                key={`${flag.code}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${flagTone(flag.level)}`}>
                    {flag.level === 'high'
                      ? 'Alerte forte'
                      : flag.level === 'moderate'
                      ? 'Vigilance'
                      : 'Information'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{flag.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{flag.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucun drapeau calculé.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Hypothèses</p>
          <div className="mt-3 space-y-2">
            {payload.hypotheses.length ? (
              payload.hypotheses.map((item, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucune hypothèse supplémentaire.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Alertes</p>
          <div className="mt-3 space-y-2">
            {payload.alerts.length ? (
              payload.alerts.map((item, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aucune alerte majeure.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Recommandations</p>
          <div className="mt-3 space-y-2">
            {payload.recommendations.length ? (
              payload.recommendations.map((item, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Pas de recommandation calculée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}