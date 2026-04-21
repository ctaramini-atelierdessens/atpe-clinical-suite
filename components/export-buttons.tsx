'use client'

import React, { useMemo, useState } from 'react'

type PatientLike = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  patient_code?: string | null
  code?: string | null
  reference?: string | null
  email?: string | null
  created_at?: string | null
  [key: string]: unknown
}

type Props = {
  patient?: PatientLike
  patientId?: string
  sessionId?: string
}

function getPatientName(patient?: PatientLike) {
  if (!patient) return 'Patient'
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first = typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last = typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const full = `${first} ${last}`.trim()
  return full || 'Patient'
}

function getPatientReference(patient?: PatientLike, patientId?: string) {
  const candidates = [
    patient?.patient_code,
    patient?.code,
    patient?.reference,
    patientId,
    patient?.id,
  ]
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return 'inconnu'
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function downloadJsonFile(filename: string, data: unknown) {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function ExportButtons({ patient, patientId, sessionId }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const patientName = useMemo(() => getPatientName(patient), [patient])
  const patientReference = useMemo(
    () => getPatientReference(patient, patientId),
    [patient, patientId],
  )

  function handleClinicalSummaryExport() {
    const content = [
      'SYNTHÈSE CLINIQUE ATPE',
      '',
      `Patient : ${patientName}`,
      `Référence : ${patientReference}`,
      `ID patient : ${patientId || patient?.id || 'non renseigné'}`,
      `Session : ${sessionId || 'non renseignée'}`,
      `Email : ${
        typeof patient?.email === 'string' && patient.email.trim()
          ? patient.email
          : 'non renseigné'
      }`,
      `Date de création dossier : ${
        typeof patient?.created_at === 'string' ? patient.created_at : 'non renseignée'
      }`,
      '',
      'Cette exportation est une base de synthèse. Elle peut être complétée ensuite avec les modules cliniques, les observations avancées et les éléments de suivi.',
    ].join('\n')

    downloadTextFile(`synthese-clinique-${patientReference}.txt`, content)
    setMessage('Synthèse clinique exportée.')
  }

  function handleTechnicalExport() {
    const payload = {
      exported_at: new Date().toISOString(),
      patient_name: patientName,
      patient_reference: patientReference,
      patient_id: patientId || patient?.id || null,
      session_id: sessionId || null,
      patient: patient ?? null,
    }

    downloadJsonFile(`export-technique-${patientReference}.json`, payload)
    setMessage('Export technique JSON généré.')
  }

  function handleQuickCopy() {
    const content = [
      `Patient : ${patientName}`,
      `Référence : ${patientReference}`,
      `Patient ID : ${patientId || patient?.id || 'non renseigné'}`,
      `Session ID : ${sessionId || 'non renseignée'}`,
    ].join('\n')

    navigator.clipboard
      .writeText(content)
      .then(() => {
        setMessage('Résumé rapide copié dans le presse-papiers.')
      })
      .catch(() => {
        setMessage('Copie impossible, mais les exports fichier restent disponibles.')
      })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={handleClinicalSummaryExport}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Export synthèse .txt
        </button>

        <button
          type="button"
          onClick={handleTechnicalExport}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Export technique .json
        </button>

        <button
          type="button"
          onClick={handleQuickCopy}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Copier résumé rapide
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Patient :</span> {patientName}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-slate-900">Référence :</span> {patientReference}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-slate-900">Session :</span> {sessionId || 'non renseignée'}
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
    </div>
  )
}