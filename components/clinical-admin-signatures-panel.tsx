'use client'

import React, { useEffect, useState } from 'react'

type SignatureRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  signature_type: string
  signer_name: string | null
  signer_role: string | null
  signature_status: string
  comment: string | null
  signed_at: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function ClinicalAdminSignaturesPanel() {
  const [items, setItems] = useState<SignatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/signatures')
      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de charger les signatures.')
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
        <p className="text-sm text-slate-500">Aucune signature enregistrée.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.signature_type}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.signer_name || 'Signataire inconnu'} · {item.signer_role || 'rôle non renseigné'}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(item.signed_at)}</p>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                Statut : <span className="font-semibold text-slate-900">{item.signature_status}</span>
              </p>

              {item.comment ? (
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.comment}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}