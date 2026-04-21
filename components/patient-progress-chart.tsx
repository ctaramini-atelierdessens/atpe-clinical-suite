'use client'

import { useEffect, useMemo, useState } from 'react'

type AdvancedRow = {
  id: string
  session_id: string
  created_at?: string | null
  frame_containment?: number | null
  bodily_engagement?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  patient_engagement_level?: number | null
}

type Props = {
  patientId: string
  sessionId?: string
  patient?: {
    full_name?: string | null
    first_name?: string | null
    last_name?: string | null
  }
}

function getLabel(row: AdvancedRow, index: number) {
  if (row.created_at) {
    const d = new Date(row.created_at)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      })
    }
  }

  return `S${index + 1}`
}

function clamp(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((v): v is number => typeof v === 'number')
  if (!valid.length) return 0
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
}

export function PatientProgressChart({ patientId }: Props) {
  const [rows, setRows] = useState<AdvancedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/clinical/patient-progress?patientId=${encodeURIComponent(patientId)}`,
          { cache: 'no-store' },
        )

        if (!response.ok) {
          const maybeJson = await response.json().catch(() => null)
          throw new Error(
            maybeJson?.error || 'Impossible de charger les données de progression.',
          )
        }

        const json = await response.json()

        if (!active) return

        setRows(Array.isArray(json?.rows) ? json.rows : [])
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : 'Erreur de chargement du graphique.',
        )
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
  }, [patientId])

  const chartData = useMemo(() => {
    return rows.map((row, index) => {
      const global = average([
        clamp(row.frame_containment),
        clamp(row.bodily_engagement),
        clamp(row.primary_symbolization),
        clamp(row.secondary_symbolization),
        clamp(row.relational_availability),
        clamp(row.creative_mobility),
        clamp(row.patient_engagement_level),
      ])

      return {
        ...row,
        label: getLabel(row, index),
        global,
        frame: clamp(row.frame_containment),
        body: clamp(row.bodily_engagement),
        primary: clamp(row.primary_symbolization),
        secondary: clamp(row.secondary_symbolization),
        relation: clamp(row.relational_availability),
        creativity: clamp(row.creative_mobility),
        engagement: clamp(row.patient_engagement_level),
      }
    })
  }, [rows])

  const latest = chartData[chartData.length - 1] ?? null
  const maxValue = 100

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Chargement de la progression clinique...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Aucune donnée avancée disponible pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {latest ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Score global
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {latest.global}/100
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Cadre
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {latest.frame}/100
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Symbolisation
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {average([latest.primary, latest.secondary])}/100
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Relation
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {latest.relation}/100
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end gap-3 overflow-x-auto pb-2">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="flex min-w-[70px] flex-col items-center gap-2"
            >
              <div className="flex h-56 items-end">
                <div
                  className="w-10 rounded-t-2xl bg-slate-800 transition-all"
                  style={{
                    height: `${(item.global / maxValue) * 220}px`,
                  }}
                  title={`${item.global}/100`}
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-medium text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.global}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Cadre', value: latest?.frame ?? 0 },
          { label: 'Corps', value: latest?.body ?? 0 },
          { label: 'Symb. primaire', value: latest?.primary ?? 0 },
          { label: 'Symb. secondaire', value: latest?.secondary ?? 0 },
          { label: 'Relation', value: latest?.relation ?? 0 },
          { label: 'Créativité', value: latest?.creativity ?? 0 },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {metric.value}/100
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}