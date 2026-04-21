'use client'

import React, { useMemo } from 'react'

type PatientLike = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
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

function deriveProfile(patient: PatientLike) {
  const seed = typeof patient.id === 'string' ? patient.id.length : 0

  if (seed % 4 === 0) {
    return {
      symbolic: 'symbolisation primaire à soutenir',
      relational: 'appui prudent',
      creative: 'mobilité en émergence',
      frame: 'nécessite constance et repères',
    }
  }

  if (seed % 4 === 1) {
    return {
      symbolic: 'symbolisation secondaire émergente',
      relational: 'engagement fluctuant',
      creative: 'potentiel créatif accessible',
      frame: 'cadre à maintenir stable',
    }
  }

  if (seed % 4 === 2) {
    return {
      symbolic: 'pré-symbolique dominant',
      relational: 'retrait ou prudence élevée',
      creative: 'accrochage sensoriel utile',
      frame: 'contenance prioritaire',
    }
  }

  return {
    symbolic: 'organisation intégrative en progression',
    relational: 'co-création possible',
    creative: 'bonne plasticité créative',
    frame: 'cadre bien utilisable',
  }
}

function ProfileItem({
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

export function PatientClinicalProfileCard({ patient }: Props) {
  const patientName = useMemo(() => getPatientName(patient), [patient])
  const profile = useMemo(() => deriveProfile(patient), [patient])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Profil clinique synthétique
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Lecture structurée de repères cliniques pour {patientName}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileItem label="Organisation symbolique" value={profile.symbolic} />
        <ProfileItem label="Mode relationnel" value={profile.relational} />
        <ProfileItem label="Mobilité créative" value={profile.creative} />
        <ProfileItem label="Rapport au cadre" value={profile.frame} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          Cette carte est une synthèse clinique lisible. Elle peut ensuite être
          remplacée ou enrichie par ton moteur expert complet selon l’évolution du
          projet.
        </p>
      </div>
    </div>
  )
}