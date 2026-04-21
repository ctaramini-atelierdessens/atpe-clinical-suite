'use client'

import { useEffect, useState } from 'react'

type VerificationResult = {
  ok?: boolean
  checksum?: string | null
  certified_at?: string | null
  locked_at?: string | null
  status?: string | null
}

type Props = {
  patientId: string
  versionId: string
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('fr-FR')
}

export function LockedExportVerificationCard({
  patientId,
  versionId,
}: Props) {
  const [data, setData] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/patients/${patientId}/export-versions/${versionId}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = await res.json()

        if (!cancelled) {
          setData(json)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossible de vérifier la version verrouillée.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [patientId, versionId])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Vérification export verrouillé</h2>
      <p className="mt-1 text-sm text-slate-500">
        Contrôle rapide du statut d’intégrité et de certification.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Vérification en cours…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-700">{error}</p>
      ) : !data ? (
        <p className="mt-4 text-sm text-slate-500">
          Aucune donnée de vérification disponible.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Statut
            </div>
            <div className="mt-2 text-sm font-medium">
              {data.status ?? (data.ok ? 'Intègre' : 'Non vérifié')}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Checksum
            </div>
            <div className="mt-2 break-all text-sm font-medium">
              {data.checksum ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Verrouillage
            </div>
            <div className="mt-2 text-sm font-medium">
              {formatDate(data.locked_at)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Certification
            </div>
            <div className="mt-2 text-sm font-medium">
              {formatDate(data.certified_at)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}