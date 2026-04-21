'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { SupervisionJournalPanel } from '@/components/supervision-journal-panel'

type PatientLike = {
  id?: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  [key: string]: unknown
}

type SupervisionFlag = {
  level: 'info' | 'moderate' | 'high'
  code: string
  title: string
  description: string
}

type SupervisionResponse = {
  success: boolean
  data?: {
    current: {
      row: {
        session_id: string
        medium_primary: string | null
        therapist_countertransference_notes: string | null
      }
      analysis: {
        therapistExperiences: string[]
        structuredReview: {
          perceivedAffects: string[]
          probableClinicalMeaning: string[]
          cautionPoints: string[]
          supervisionAxes: string[]
        }
        flags: SupervisionFlag[]
        suggestedNote: string
      }
    } | null
    journal: Array<{
      id: string
      sessionId: string
      createdAt: string
      mediumPrimary: string | null
      note: string
      therapistExperiences: string[]
      flags: SupervisionFlag[]
      therapistCountertransferenceNotes: string | null
    }>
    supervisionFlags: SupervisionFlag[]
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

function flagTone(level: SupervisionFlag['level']) {
  if (level === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

function ListBlock({
  title,
  items,
  empty,
}: {
  title: string
  items: string[]
  empty: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
            >
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </div>
  )
}

export function PatientSupervisionPanel({
  patient,
  patientId,
  sessionId,
}: Props) {
  const [payload, setPayload] = useState<SupervisionResponse['data'] | null>(null)
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

        const response = await fetch(`/api/atpe-supervision?${params.toString()}`)
        const json = (await response.json()) as SupervisionResponse

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error || 'Impossible de charger la supervision clinique.')
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
    return <p className="text-sm text-slate-500">Chargement de la supervision clinique...</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!payload || !payload.current) {
    return (
      <p className="text-sm text-slate-500">
        Aucune donnée de supervision disponible pour le moment.
      </p>
    )
  }

  const analysis = payload.current.analysis

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Vue supervision clinique
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Reprise structurée des éprouvés thérapeutiques pour {patientName}.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Séance :</span>{' '}
          {payload.current.row.session_id}
          {payload.current.row.medium_primary
            ? ` — ${payload.current.row.medium_primary}`
            : ''}
        </p>
      </div>

      <ListBlock
        title="Éprouvés thérapeutiques repérés"
        items={analysis.therapistExperiences}
        empty="Aucun éprouvé majeur repéré."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ListBlock
          title="Affects perçus"
          items={analysis.structuredReview.perceivedAffects}
          empty="Aucun affect perçu renseigné."
        />
        <ListBlock
          title="Sens cliniques probables"
          items={analysis.structuredReview.probableClinicalMeaning}
          empty="Aucune hypothèse clinique prudente supplémentaire."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ListBlock
          title="Points de prudence"
          items={analysis.structuredReview.cautionPoints}
          empty="Aucun point de prudence spécifique."
        />
        <ListBlock
          title="Axes de supervision"
          items={analysis.structuredReview.supervisionAxes}
          empty="Aucun axe spécifique proposé."
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Drapeaux “à travailler en supervision”
        </p>
        <div className="mt-3 space-y-3">
          {analysis.flags.length ? (
            analysis.flags.map((flag, index) => (
              <div
                key={`${flag.code}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${flagTone(flag.level)}`}
                >
                  {flag.level === 'high'
                    ? 'Prioritaire'
                    : flag.level === 'moderate'
                    ? 'Vigilance'
                    : 'Info'}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {flag.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {flag.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucun drapeau automatique calculé.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Note structurée suggérée pour supervision
        </p>
        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {analysis.suggestedNote}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Journal supervision par séance
        </p>
        <div className="mt-4">
          <SupervisionJournalPanel items={payload.journal} />
        </div>
      </div>
    </div>
  )
}