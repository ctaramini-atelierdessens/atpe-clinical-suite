'use client'

import { useMemo, useState } from 'react'

type PatientPdfDownloadButtonProps = {
  patientId?: string | null
  label?: string
  className?: string
}

type DownloadState = {
  type: 'idle' | 'success' | 'error'
  message: string
}

function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = sanitizeFilename(filename)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

function parseFilenameFromHeader(
  contentDisposition: string | null,
  fallback: string
) {
  if (!contentDisposition) return fallback

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return fallback
    }
  }

  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  if (asciiMatch?.[1]) {
    return asciiMatch[1]
  }

  return fallback
}

async function safeReadErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json()
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message
      }
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error
      }
    }

    const text = await response.text()
    if (text.trim()) return text
  } catch {
    return ''
  }

  return ''
}

function getPdfEndpoint(patientId: string) {
  return `/api/patients/${patientId}/export/pdf`
}

function getFallbackFilename(patientId: string) {
  return `patient-${patientId}.pdf`
}

export function PatientPdfDownloadButton({
  patientId,
  label = 'Télécharger PDF',
  className = '',
}: PatientPdfDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState<DownloadState>({
    type: 'idle',
    message: '',
  })

  const hasPatientId = useMemo(
    () => typeof patientId === 'string' && patientId.trim().length > 0,
    [patientId]
  )

  async function handleDownload() {
    if (!hasPatientId || !patientId) {
      setState({
        type: 'error',
        message: 'Téléchargement impossible : identifiant patient manquant.',
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setState({ type: 'idle', message: '' })

    try {
      const response = await fetch(getPdfEndpoint(patientId), {
        method: 'GET',
        headers: {
          Accept: 'application/pdf, application/octet-stream',
        },
      })

      if (!response.ok) {
        const message = await safeReadErrorMessage(response)
        throw new Error(
          message || `Erreur PDF (${response.status} ${response.statusText}).`
        )
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('Le PDF généré est vide.')
      }

      const filename = parseFilenameFromHeader(
        response.headers.get('content-disposition'),
        getFallbackFilename(patientId)
      )

      triggerDownload(blob, filename)

      setState({
        type: 'success',
        message: 'Téléchargement PDF terminé.',
      })
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Impossible de télécharger le PDF.'

      setState({
        type: 'error',
        message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={!hasPatientId || isLoading}
        className={[
          'inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition',
          !hasPatientId || isLoading
            ? 'cursor-not-allowed bg-slate-300 text-slate-600'
            : 'bg-slate-900 text-white hover:bg-slate-800',
          className,
        ].join(' ')}
      >
        {isLoading ? 'Téléchargement…' : label}
      </button>

      {!hasPatientId ? (
        <p className="text-xs text-amber-700">
          Identifiant patient manquant : téléchargement désactivé.
        </p>
      ) : null}

      {state.type === 'success' ? (
        <p className="text-xs text-emerald-700">{state.message}</p>
      ) : null}

      {state.type === 'error' ? (
        <p className="text-xs text-red-700">{state.message}</p>
      ) : null}
    </div>
  )
}