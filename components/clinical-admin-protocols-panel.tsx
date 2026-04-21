'use client'

import React, { useEffect, useState } from 'react'

type ProtocolRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  source_session_id: string
  frame_intensity: string
  next_session_type: string
  verbalization: string
  therapist_posture: string[]
  narrative: string | null
  created_at: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function ClinicalAdminProtocolsPanel() {
  const [items, setItems] = useState<ProtocolRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/protocols')
      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de charger les protocoles.')
      }

      setItems(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur de chargement.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : !items.length ? (
        <p className="text-sm text-slate-500">Aucun protocole enregistré.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.next_session_type}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Séance source : {item.source_session_id}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                  Cadre : <span className="font-semibold text-slate-900">{item.frame_intensity}</span>
                </div>
                <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                  Verbalisation : <span className="font-semibold text-slate-900">{item.verbalization}</span>
                </div>
                <div className="rounded-xl bg-white p-3 text-sm text-slate-700">
                  Patient : <span className="font-semibold text-slate-900">{item.patient_id || '—'}</span>
                </div>
              </div>

              {item.narrative ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.narrative}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}