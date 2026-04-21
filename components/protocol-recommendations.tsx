'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type PatientScores = {
  emotion: number
  body: number
  consciousness: number
  dynamic: number
  symbolic: number
}

type RecommendedProtocol = {
  id: string
  name: string
  slug: string
  category?: string | null
  source?: string | null
  duration?: string | null
  format?: string | null
  description?: string | null
  indications?: string | null
  fit_score: number
}

type Props = {
  patientScores: Partial<PatientScores>
}

function safeScore(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 0
}

export function ProtocolRecommendations({ patientScores }: Props) {
  const [protocols, setProtocols] = useState<RecommendedProtocol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const payload = useMemo(
    () => ({
      emotion: safeScore(patientScores.emotion),
      body: safeScore(patientScores.body),
      consciousness: safeScore(patientScores.consciousness),
      dynamic: safeScore(patientScores.dynamic),
      symbolic: safeScore(patientScores.symbolic),
    }),
    [
      patientScores.emotion,
      patientScores.body,
      patientScores.consciousness,
      patientScores.dynamic,
      patientScores.symbolic,
    ],
  )

  useEffect(() => {
    let cancelled = false

    async function loadRecommendations() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/protocols/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'Erreur de chargement')
        }

        if (!cancelled) {
          setProtocols(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
          setProtocols([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRecommendations()

    return () => {
      cancelled = true
    }
  }, [payload])

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Protocoles recommandés</h2>
        <ClinicalStatusBadge label="Moteur automatique" variant="automatic" />
      </div>

      <div className="mb-4 grid grid-cols-5 gap-2 text-center text-xs">
        <div className="rounded-xl border border-neutral-200 p-2">
          <div className="text-neutral-500">Émotion</div>
          <div className="mt-1 font-semibold">{payload.emotion}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-2">
          <div className="text-neutral-500">Corps</div>
          <div className="mt-1 font-semibold">{payload.body}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-2">
          <div className="text-neutral-500">Conscience</div>
          <div className="mt-1 font-semibold">{payload.consciousness}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-2">
          <div className="text-neutral-500">Dynamique</div>
          <div className="mt-1 font-semibold">{payload.dynamic}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-2">
          <div className="text-neutral-500">Symbolique</div>
          <div className="mt-1 font-semibold">{payload.symbolic}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">
          Chargement des protocoles recommandés...
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : protocols.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucun protocole disponible pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {protocols.map((protocol, index) => (
            <div
              key={protocol.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {index + 1}. {protocol.name}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {protocol.category ?? '—'} • {protocol.source ?? '—'}
                  </div>
                </div>

                <ClinicalStatusBadge
                  label={`Score ${Math.round(protocol.fit_score)}`}
                  variant="active"
                />
              </div>

              <div className="space-y-1 text-sm text-neutral-700">
                <p>
                  <strong>Durée :</strong> {protocol.duration ?? '—'}
                </p>
                <p>
                  <strong>Format :</strong> {protocol.format ?? '—'}
                </p>
                <p>
                  <strong>Indications :</strong> {protocol.indications ?? '—'}
                </p>
              </div>

              <div className="mt-3">
                <Link
                  href={`/protocols/${protocol.slug}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Ouvrir la fiche protocole
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}