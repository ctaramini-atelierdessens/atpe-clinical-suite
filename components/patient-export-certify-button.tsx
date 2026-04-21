'use client'

import { useState } from 'react'

type Props = {
  patientId: string
  versionId: string
}

export function PatientExportCertifyButton({
  patientId,
  versionId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCertify() {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(
        `/api/patients/${patientId}/export-versions/${versionId}/certify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'certify_export' }),
        },
      )

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

      setMessage('Version certifiée avec succès.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de certifier la version.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCertify}
      disabled={loading}
      className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      title={message ?? error ?? 'Certifier la version'}
    >
      {loading ? 'Certification…' : 'Certifier'}
    </button>
  )
}