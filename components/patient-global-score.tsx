'use client'

import { useEffect, useMemo, useState } from 'react'

type AdvancedRow = {
  frame_containment?: number | null
  bodily_engagement?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  patient_engagement_level?: number | null
}

type Props = {
  patientId?: string
  patient?: {
    id?: string
  }
}

function clamp(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function computeGlobal(row?: AdvancedRow | null) {
  if (!row) return 0

  const values = [
    clamp(row.frame_containment),
    clamp(row.bodily_engagement),
    clamp(row.primary_symbolization),
    clamp(row.secondary_symbolization),
    clamp(row.relational_availability),
    clamp(row.creative_mobility),
    clamp(row.patient_engagement_level),
  ]

  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

function getLabel(score: number) {
  if (score >= 80) return 'Très stabilisé'
  if (score >= 65) return 'Stabilisé'
  if (score >= 50) return 'En progression'
  if (score >= 35) return 'Fragile mais mobilisable'
  return 'Très fragile'
}

export function PatientGlobalScore({ patientId, patient }: Props) {
  const resolvedPatientId = patientId || patient?.id || ''
  const [latestRow, setLatestRow] = useState<AdvancedRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!resolvedPatientId) {
        setLatestRow(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const response = await fetch(
          `/api/clinical/patient-progress?patientId=${encodeURIComponent(resolvedPatientId)}`,
          { cache: 'no-store' },
        )

        if (!response.ok) {
          if (active) {
            setLatestRow(null)
          }
          return
        }

        const json = await response.json()
        const rows = Array.isArray(json?.rows) ? json.rows : []
        const last = rows[rows.length - 1] ?? null

        if (active) {
          setLatestRow(last)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [resolvedPatientId])

  const score = useMemo(() => computeGlobal(latestRow), [latestRow])
  const label = getLabel(score)

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Chargement du score global...
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        Score global clinique
      </p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-bold tracking-tight text-slate-900">
            {score}/100
          </p>
          <p className="mt-2 text-sm text-slate-600">{label}</p>
        </div>

        <div className="h-24 w-24 rounded-full border-8 border-slate-200 bg-slate-50" />
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}