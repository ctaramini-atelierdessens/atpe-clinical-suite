'use client'

import React, { useEffect, useState } from 'react'
import { PatientSessionSelector } from '@/components/patient-session-selector'
import { GroupSessionSummary } from '@/components/group-session-summary'

type Props = {
  patientId?: string
  groupId?: string | null
  sessionId?: string
}

type SessionOption = {
  id: string
  label: string
  createdAt?: string | null
}

type ApiData = {
  sessions: SessionOption[]
  current: null | {
    row: {
      session_id: string
      medium_primary: string | null
    }
    analysis: {
      metrics: {
        cohesion: number
        tension: number
        affectiveDiffusion: number
        groupContainment: number
        transferDiffraction: number
        projectiveLoad: number
      }
      groupMode: string
      probableProcesses: string[]
      detoxifiedReturn: {
        possible: boolean
        rationale: string
        recommendation: string
      }
      flags: Array<{
        level: 'info' | 'moderate' | 'high'
        code: string
        title: string
        description: string
      }>
      narrative: string
      sessionSummary: string
    }
  }
  previous: null | {
    row: {
      session_id: string
      medium_primary: string | null
    }
    analysis: {
      metrics: {
        cohesion: number
        tension: number
        affectiveDiffusion: number
        groupContainment: number
        transferDiffraction: number
        projectiveLoad: number
      }
      groupMode: string
    } | null
  }
  comparison: null | {
    deltas: null | {
      cohesion: number
      tension: number
      affectiveDiffusion: number
      groupContainment: number
      projectiveLoad: number
    }
    narrative: string
  }
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}/100</p>
    </div>
  )
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`
}

export function GroupIntersubjectivityPanel({
  patientId,
  groupId = null,
  sessionId,
}: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessionId ?? '')
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!patientId && !groupId) {
        setLoading(false)
        setData(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (patientId) params.set('patientId', patientId)
        if (groupId) params.set('groupId', groupId)
        if (selectedSessionId) params.set('sessionId', selectedSessionId)

        const response = await fetch(`/api/atpe-group-session?${params.toString()}`)
        const json = await response.json()

        if (!response.ok || !json?.success) {
          throw new Error(
            json?.error || 'Impossible de charger la lecture groupale.',
          )
        }

        if (!cancelled) {
          setData(json.data as ApiData)
          if (!selectedSessionId && json.data?.current?.row?.session_id) {
            setSelectedSessionId(json.data.current.row.session_id)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement.')
          setData(null)
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
  }, [patientId, groupId, selectedSessionId])

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement de la vue groupe…</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!data || !data.current) {
    return (
      <p className="text-sm text-slate-500">
        Aucune séance de groupe disponible pour le moment.
      </p>
    )
  }

  const current = data.current.analysis

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Vue groupe / intersubjectivité
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Lecture de cohésion, tension, diffusion affective, contenance et dépôts projectifs groupaux.
        </p>
      </div>

      <PatientSessionSelector
        sessions={data.sessions}
        value={selectedSessionId}
        onChange={setSelectedSessionId}
        title="Séance de groupe"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Cohésion" value={current.metrics.cohesion} />
        <MetricCard label="Tension" value={current.metrics.tension} />
        <MetricCard
          label="Diffusion affective"
          value={current.metrics.affectiveDiffusion}
        />
        <MetricCard
          label="Contenance groupale"
          value={current.metrics.groupContainment}
        />
        <MetricCard
          label="Diffraction du transfert"
          value={current.metrics.transferDiffraction}
        />
        <MetricCard
          label="Charge projective"
          value={current.metrics.projectiveLoad}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Mode groupal</p>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {current.groupMode}
        </p>
      </div>

      {data.comparison ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Comparaison interséances
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {data.comparison.narrative}
          </p>

          {data.comparison.deltas ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Cohésion : <span className="font-semibold text-slate-900">{signed(data.comparison.deltas.cohesion)}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Tension : <span className="font-semibold text-slate-900">{signed(data.comparison.deltas.tension)}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Diffusion : <span className="font-semibold text-slate-900">{signed(data.comparison.deltas.affectiveDiffusion)}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Contenance : <span className="font-semibold text-slate-900">{signed(data.comparison.deltas.groupContainment)}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Projectif : <span className="font-semibold text-slate-900">{signed(data.comparison.deltas.projectiveLoad)}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <GroupSessionSummary
        summary={current.sessionSummary}
        narrative={current.narrative}
        probableProcesses={current.probableProcesses}
        flags={current.flags}
        detoxifiedReturn={current.detoxifiedReturn}
      />
    </div>
  )
}