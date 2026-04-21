'use client'

import Link from 'next/link'
import { useState } from 'react'

type PatientAtpeActionsBarProps = {
  patientId: string
  summaryText: string
  className?: string
  printLabel?: string
  copyLabel?: string
  backLabel?: string
}

export function PatientAtpeActionsBar({
  patientId,
  summaryText,
  className = '',
  printLabel = 'Impression / PDF',
  copyLabel = 'Copier le résumé clinique',
  backLabel = 'Retour dossier patient',
}: PatientAtpeActionsBarProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error('Impossible de copier le résumé clinique :', error)
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-center ${className}`}
    >
      <Link
        href={`/patients/${patientId}`}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        {backLabel}
      </Link>

      <Link
        href={`/patients/${patientId}/atpe/print`}
        target="_blank"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {printLabel}
      </Link>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {copied ? 'Résumé copié' : copyLabel}
      </button>
    </div>
  )
}