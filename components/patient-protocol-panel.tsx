'use client'

import React, { useEffect, useMemo, useState } from 'react'

type PatientLike = {
  id?: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  [key: string]: unknown
}

type ProtocolPlan = {
  frameIntensity: 'faible' | 'modérée' | 'soutenue' | 'renforcée'
  nextSessionType:
    | 'séance contenante'
    | 'séance de relance créative'
    | 'séance de transformation symbolique'
    | 'séance de reprise groupale'
    | 'séance de consolidation'
  verbalization:
    | 'très limitée'
    | 'courte et cadrée'
    | 'progressive'
    | 'élaborative prudente'
  therapistPosture: string[]
  mediumRecommendations: Array<{
    label: string
    reason: string
  }>
  atpeProtocol: {
    attitudeInterieure: string
    creation: string
    dialogueOeuvre: string
    partage: string
  }
  narrative: string
}

type ProtocolResponse = {
  success: boolean
  data?: {
    currentSessionId: string
    plan: ProtocolPlan | null
    history: Array<{
      id: string
      sessionId: string
      createdAt: string
      mediumPrimary: string | null
      plan: ProtocolPlan
    }>
  }
  error?: string
}

type Props = {
  patient?: PatientLike
  patientId: string
  sessionId?: string
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

function badgeTone(value: string) {
  if (value === 'renforcée' || value === 'très limitée') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (value === 'soutenue' || value === 'courte et cadrée') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

export function PatientProtocolPanel({
  patient,
  patientId,
  sessionId,
}: Props) {
  const [payload, setPayload] = useState<ProtocolResponse['data'] | null>(null)
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
        if (sessionId) {
          params.set('sessionId', sessionId)
        }

        const response = await fetch(`/api/atpe-protocol?${params.toString()}`)
        const json = (await response.json()) as ProtocolResponse

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error || 'Impossible de charger le protocole.')
        }

        if (!cancelled) {
          setPayload(json.data)
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
  }, [patientId, sessionId])

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement du protocole thérapeutique…</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!payload || !payload.plan) {
    return (
      <p className="text-sm text-slate-500">
        Aucun protocole disponible pour le moment.
      </p>
    )
  }

  const plan = payload.plan

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Protocole thérapeutique intelligent
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Recommandation de séance suivante pour {patientName}.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {plan.narrative}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Type de séance suivante
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {plan.nextSessionType}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Intensité de cadre
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(
                plan.frameIntensity,
              )}`}
            >
              {plan.frameIntensity}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Verbalisation conseillée
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(
                plan.verbalization,
              )}`}
            >
              {plan.verbalization}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Recommandations de médium
          </p>
          <div className="mt-3 space-y-3">
            {plan.mediumRecommendations.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Posture thérapeutique suggérée
          </p>
          <div className="mt-3 space-y-2">
            {plan.therapistPosture.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Protocole ATPE automatique – séance suivante
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              1. Attitude intérieure
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {plan.atpeProtocol.attitudeInterieure}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              2. Création
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {plan.atpeProtocol.creation}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              3. Dialogue avec l’œuvre
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {plan.atpeProtocol.dialogueOeuvre}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              4. Partage
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {plan.atpeProtocol.partage}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Historique récent des protocoles calculés
        </p>
        <div className="mt-4 space-y-3">
          {payload.history.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {item.sessionId}
                {item.mediumPrimary ? ` — ${item.mediumPrimary}` : ''}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {item.plan.nextSessionType} · cadre {item.plan.frameIntensity} · verbalisation {item.plan.verbalization}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}