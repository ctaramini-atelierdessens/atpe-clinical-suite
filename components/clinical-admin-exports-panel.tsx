'use client'

import React, { useEffect, useState } from 'react'

type ExportRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  export_type: string
  filename: string | null
  export_format: string
  status: string
  created_at: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function ClinicalAdminExportsPanel() {
  const [items, setItems] = useState<ExportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/exports-log?patientId=')
      const json = await response.json()

      if (response.ok && json?.success) {
        setItems(Array.isArray(json.data) ? json.data : [])
        return
      }

      setItems([])
      setMessage('Le listing global des logs d’export nécessite soit un endpoint global, soit un patientId ciblé.')
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

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {!items.length ? (
        <p className="text-sm text-slate-500">
          Aucun log affichable ici en mode global avec l’endpoint actuel.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.export_type}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.filename || 'Sans nom de fichier'}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                Format : <span className="font-semibold text-slate-900">{item.export_format}</span> ·
                Statut : <span className="font-semibold text-slate-900"> {item.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}