'use client'

import React, { useMemo } from 'react'

type PatientLike = {
  id?: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  created_at?: string | null
  [key: string]: unknown
}

type Props = {
  patient: PatientLike
}

function getPatientName(patient: PatientLike) {
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (typeof patient.id === 'string' && patient.id.trim()) return `Patient ${patient.id}`
  return 'Patient'
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

function deriveAssessment(patient: PatientLike) {
  const seed = typeof patient.id === 'string' ? patient.id.length : 0

  if (seed % 3 === 0) {
    return {
      indication: 'Médiation contenante avec progression graduée',
      entryPoint: 'sensoriel et corporel',
      vigilance: 'risque de débordement si verbalisation trop rapide',
      objective: 'soutenir la symbolisation primaire',
    }
  }

  if (seed % 3 === 1) {
    return {
      indication: 'Dispositif mixte avec reprise symbolique progressive',
      entryPoint: 'création puis dialogue avec l’œuvre',
      vigilance: 'engagement fluctuant nécessitant régularité',
      objective: 'soutenir le passage vers symbolisation secondaire',
    }
  }

  return {
    indication: 'Cadre stable avec potentiel de co-création',
    entryPoint: 'médium expressif et partage structuré',
    vigilance: 'préserver le cadre pour éviter la dispersion',
    objective: 'consolider intégration et mobilité créative',
  }
}

function Item({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function PatientInitialAssessmentCard({ patient }: Props) {
  const patientName = useMemo(() => getPatientName(patient), [patient])
  const assessment = useMemo(() => deriveAssessment(patient), [patient])
  const createdAt = formatDate(
    typeof patient.created_at === 'string' ? patient.created_at : null,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Évaluation initiale
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Repères d’entrée pour {patientName}. Dossier créé le {createdAt}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Item label="Indication initiale" value={assessment.indication} />
        <Item label="Point d’entrée thérapeutique" value={assessment.entryPoint} />
        <Item label="Point de vigilance" value={assessment.vigilance} />
        <Item label="Objectif prioritaire" value={assessment.objective} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          Cette carte donne une base d’évaluation initiale stable. Tu pourras la
          raccorder ensuite à de vraies données de bilan, d’anamnèse ou de séances.
        </p>
      </div>
    </div>
  )
}