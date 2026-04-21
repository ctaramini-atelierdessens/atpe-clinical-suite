'use client'

import React, { useMemo, useState } from 'react'

type PatientLike = {
  id?: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  [key: string]: unknown
}

type Props = {
  patient?: PatientLike
  patientId: string
  sessionId?: string
}

type ExportType =
  | 'therapeutic_summary'
  | 'supervision_note'
  | 'longitudinal_summary'
  | 'protocol_sheet'
  | 'group_summary'

function getPatientName(patient?: PatientLike) {
  if (!patient) return 'Patient'

  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }

  const first =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''

  return `${first} ${last}`.trim() || 'Patient'
}

function labelFor(type: ExportType) {
  switch (type) {
    case 'therapeutic_summary':
      return 'Synthèse thérapeutique structurée'
    case 'supervision_note':
      return 'Note de supervision'
    case 'longitudinal_summary':
      return 'Synthèse longitudinale'
    case 'protocol_sheet':
      return 'Fiche protocole séance suivante'
    case 'group_summary':
      return 'Synthèse de groupe'
    default:
      return 'Export'
  }
}

function buildParams(patientId: string, sessionId: string | undefined, type: ExportType) {
  const params = new URLSearchParams({
    patientId,
    type,
  })

  if (sessionId) {
    params.set('sessionId', sessionId)
  }

  return params
}

function triggerBrowserDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function extractFilenameFromDisposition(
  disposition: string | null,
  fallback: string,
) {
  if (!disposition) return fallback

  const utf8Match = disposition.match(/filename\*\=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return fallback
    }
  }

  const classicMatch = disposition.match(/filename="([^"]+)"/i)
  if (classicMatch?.[1]) {
    return classicMatch[1]
  }

  return fallback
}

export function PatientClinicalExportPanel({
  patient,
  patientId,
  sessionId,
}: Props) {
  const [downloadingTxt, setDownloadingTxt] = useState<ExportType | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<ExportType | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const patientName = useMemo(() => getPatientName(patient), [patient])

  async function handleTxtDownload(type: ExportType) {
    try {
      setDownloadingTxt(type)
      setMessage(null)

      const params = buildParams(patientId, sessionId, type)
      const response = await fetch(`/api/atpe-export?${params.toString()}`)

      if (!response.ok) {
        const maybeJson = await response.json().catch(() => null)
        throw new Error(
          maybeJson?.error || 'Impossible de télécharger l’export texte.',
        )
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const disposition = response.headers.get('Content-Disposition')
      const filename = extractFilenameFromDisposition(
        disposition,
        `${type}.txt`,
      )

      triggerBrowserDownload(url, filename)
      URL.revokeObjectURL(url)

      setMessage(`${labelFor(type)} téléchargée en TXT.`)
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Erreur de téléchargement TXT.',
      )
    } finally {
      setDownloadingTxt(null)
    }
  }

  async function handlePdfDownload(type: ExportType) {
    try {
      setDownloadingPdf(type)
      setMessage(null)

      const params = buildParams(patientId, sessionId, type)
      const response = await fetch(`/api/atpe-export-pdf?${params.toString()}`)

      if (!response.ok) {
        const maybeJson = await response.json().catch(() => null)
        throw new Error(
          maybeJson?.error || 'Impossible de télécharger le PDF clinique.',
        )
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const disposition = response.headers.get('Content-Disposition')
      const filename = extractFilenameFromDisposition(
        disposition,
        `${type}.pdf`,
      )

      triggerBrowserDownload(url, filename)
      URL.revokeObjectURL(url)

      setMessage(`${labelFor(type)} téléchargée en PDF.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur PDF.')
    } finally {
      setDownloadingPdf(null)
    }
  }

  const items: ExportType[] = [
    'therapeutic_summary',
    'supervision_note',
    'longitudinal_summary',
    'protocol_sheet',
    'group_summary',
  ]

  const isBusy = downloadingTxt !== null || downloadingPdf !== null

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Export clinique avancé
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Exports thérapeutiques structurés pour {patientName}.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((type) => {
          const isTxtLoading = downloadingTxt === type
          const isPdfLoading = downloadingPdf === type

          return (
            <div
              key={type}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {labelFor(type)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleTxtDownload(type)}
                  disabled={isBusy}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTxtLoading ? 'TXT…' : 'TXT'}
                </button>

                <button
                  type="button"
                  onClick={() => void handlePdfDownload(type)}
                  disabled={isBusy}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPdfLoading ? 'PDF…' : 'PDF'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Patient :</span>{' '}
          {patientName}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-slate-900">Session :</span>{' '}
          {sessionId || 'non renseignée'}
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