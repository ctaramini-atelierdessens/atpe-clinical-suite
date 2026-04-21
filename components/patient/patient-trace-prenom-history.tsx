'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/lib/database.types'

type TracePrenomObservationRow =
  Database['public']['Tables']['trace_prenom_observations']['Row']

type PatientTracePrenomHistoryProps = {
  patientId: string
}

type LoadState =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function deltaLabel(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value}`
}

function asClinicalText(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

type DeltaBadgeProps = {
  label: string
  value: number
}

function DeltaBadge({ label, value }: DeltaBadgeProps) {
  return (
    <div className="rounded-xl bg-slate-100 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {deltaLabel(value)}
      </p>
    </div>
  )
}

type HistoryItemCardProps = {
  item: TracePrenomObservationRow
  index: number
  total: number
}

function HistoryItemCard({ item, index, total }: HistoryItemCardProps) {
  const clinicalText = asClinicalText(item.clinical_text)

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Passation {total - index}
          </h3>
          <p className="text-sm text-slate-600">
            Enregistrée le {formatDate(item.created_at)}
          </p>
        </div>

        <div className="text-sm text-slate-500">
          {item.session_id ? `Séance liée : ${item.session_id}` : 'Sans séance liée'}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Pression</p>
          <p className="mt-1 text-slate-700">{item.pressure}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Continuité</p>
          <p className="mt-1 text-slate-700">{item.continuity}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Organisation spatiale</p>
          <p className="mt-1 text-slate-700">{item.spatial_organization}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Répétition</p>
          <p className="mt-1 text-slate-700">{item.repetition}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Hésitation</p>
          <p className="mt-1 text-slate-700">{item.hesitation}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Ancrage</p>
          <p className="mt-1 text-slate-700">{item.anchoring}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Lisibilité</p>
          <p className="mt-1 text-slate-700">{item.readability}</p>
        </div>

        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">Mis à jour</p>
          <p className="mt-1 text-slate-700">{formatDate(item.updated_at)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DeltaBadge label="Engagement" value={item.engagement_delta} />
        <DeltaBadge label="Tension" value={item.tension_delta} />
        <DeltaBadge label="Vulnérabilité" value={item.vulnerability_delta} />
        <DeltaBadge label="Symbolisation" value={item.symbolization_delta} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Hypothèses cliniques
          </h4>

          <div className="mt-3 space-y-2">
            {clinicalText.length > 0 ? (
              clinicalText.map((text, idx) => (
                <div
                  key={`${item.id}-clinical-${idx}`}
                  className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
                >
                  {text}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucune hypothèse enregistrée.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Notes clinicien
          </h4>

          {item.clinician_notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
              {item.clinician_notes}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Aucune note complémentaire.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export function PatientTracePrenomHistory({
  patientId,
}: PatientTracePrenomHistoryProps) {
  const [items, setItems] = useState<TracePrenomObservationRow[]>([])
  const [state, setState] = useState<LoadState>({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let mounted = true

    async function loadHistory() {
      setState({
        type: 'loading',
        message: 'Chargement de l’historique…',
      })

      try {
        const response = await fetch(
          `/api/patients/${patientId}/trace-prenom/history`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        )

        const json = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof json?.error === 'string'
              ? json.error
              : 'Chargement impossible de l’historique.'
          )
        }

        const data = Array.isArray(json?.data) ? json.data : []

        if (!mounted) return

        setItems(data as TracePrenomObservationRow[])
        setState({
          type: 'success',
          message: '',
        })
      } catch (error) {
        if (!mounted) return

        setState({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Chargement impossible de l’historique.',
        })
      }
    }

    void loadHistory()

    return () => {
      mounted = false
    }
  }, [patientId])

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Historique Trace-Prénom
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Ensemble des passations enregistrées pour ce patient.
        </p>
      </div>

      {state.type === 'loading' ? (
        <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          {state.message}
        </div>
      ) : null}

      {state.type === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {state.type !== 'loading' && items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucune observation Trace-Prénom enregistrée pour le moment.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <HistoryItemCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}