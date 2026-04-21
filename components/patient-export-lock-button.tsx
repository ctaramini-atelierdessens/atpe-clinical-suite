'use client'

import { useState } from 'react'

type Props = {
  patientId: string
}

export function PatientExportLockButton({ patientId }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLock() {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`/api/patients/${patientId}/export-versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'lock_export' }),
      })

      if (!res.ok) {
        let detail = `HTTP ${res.status}`

        try {
          const json = await res.json()
          detail = json?.error || json?.message || json?.details || detail
        } catch {
          // no-op
        }

        throw new Error(detail)
      }

      setMessage('Version exportée et verrouillage demandés avec succès.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de verrouiller la version exportée.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Verrouillage export</h2>
      <p className="mt-1 text-sm text-slate-500">
        Gèle une version exportée du dossier pour traçabilité et conservation.
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleLock}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verrouillage en cours…' : 'Créer et verrouiller une version'}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-emerald-700">{message}</p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-rose-700">{error}</p>
      ) : null}
    </section>
  )
}