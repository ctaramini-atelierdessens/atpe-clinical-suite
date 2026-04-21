'use client'

import { useEffect, useMemo, useState } from 'react'

type ExportVersion = {
  id: string
  version_number?: number | null
  format?: string | null
  status?: string | null
  created_at?: string | null
  locked_at?: string | null
  certified_at?: string | null
  created_by_name?: string | null
  created_by_email?: string | null
  file_url?: string | null
  checksum?: string | null
}

type Props = {
  patientId: string
  initialItems?: ExportVersion[] | null
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('fr-FR')
}

export function PatientExportVersionsList({
  patientId,
  initialItems = [],
}: Props) {
  const [items, setItems] = useState<ExportVersion[]>(
    Array.isArray(initialItems) ? initialItems : [],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/patients/${patientId}/export-versions/list`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = await res.json()
        const nextItems = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
            ? json.items
            : Array.isArray(json?.data)
              ? json.data
              : []

        if (!cancelled) {
          setItems(nextItems)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossible de charger les versions exportées.',
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
  }, [patientId])

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items],
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Versions exportées</h2>
          <p className="mt-1 text-sm text-slate-500">
            Historique des versions verrouillées ou générées du dossier.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {safeItems.length} version{safeItems.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Chargement des versions…</p>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
          Impossible de charger les versions : {error}
        </div>
      ) : !safeItems.length ? (
        <p className="mt-4 text-sm text-slate-500">
          Aucune version exportée disponible.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Format</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Création</th>
                <th className="px-3 py-2">Verrouillage</th>
                <th className="px-3 py-2">Certification</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.map((item) => (
                <tr
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <td className="px-3 py-3 text-sm font-medium">
                    {item.version_number ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {item.format ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {item.status ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {formatDate(item.locked_at)}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {formatDate(item.certified_at)}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {item.file_url ? (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ouvrir
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}