'use client'

import React, { useMemo } from 'react'

type PatientLike = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  email?: string | null
  created_at?: string | null
  patient_code?: string | null
  code?: string | null
  reference?: string | null
  status?: string | null
  organization_id?: string | null
  clinician_id?: string | null
  [key: string]: unknown
}

type Props = {
  patient: PatientLike
}

function getDisplayName(patient: PatientLike) {
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const combined = `${first} ${last}`.trim()
  if (combined) return combined
  if (typeof patient.id === 'string' && patient.id.trim()) return `Patient ${patient.id}`
  return 'Patient'
}

function getReference(patient: PatientLike) {
  const candidates = [
    patient.patient_code,
    patient.code,
    patient.reference,
    patient.id,
  ]
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return 'Non renseignée'
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

export function PatientGlobalDashboard({ patient }: Props) {
  const displayName = useMemo(() => getDisplayName(patient), [patient])
  const reference = useMemo(() => getReference(patient), [patient])

  const status =
    typeof patient.status === 'string' && patient.status.trim()
      ? patient.status.trim()
      : 'Actif / non précisé'

  const email =
    typeof patient.email === 'string' && patient.email.trim()
      ? patient.email.trim()
      : 'Non renseigné'

  const createdAt = formatDate(
    typeof patient.created_at === 'string' ? patient.created_at : null,
  )

  const organization =
    typeof patient.organization_id === 'string' && patient.organization_id.trim()
      ? patient.organization_id.trim()
      : 'Non renseignée'

  const clinician =
    typeof patient.clinician_id === 'string' && patient.clinician_id.trim()
      ? patient.clinician_id.trim()
      : 'Non renseigné'

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">{displayName}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Vue d’ensemble patient avec repères administratifs et cliniques de base.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Référence" value={reference} />
        <MetricCard label="Statut" value={status} />
        <MetricCard label="Créé le" value={createdAt} />
        <MetricCard label="Email" value={email} />
        <MetricCard label="Organisation" value={organization} />
        <MetricCard label="Clinicien" value={clinician} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          Ce bloc constitue un tableau de bord patient stable et tolérant aux champs
          incomplets. Il sert d’ancrage visuel avant les modules cliniques plus
          avancés.
        </p>
      </div>
    </div>
  )
}