'use client'

import { useMemo, useState } from 'react'
import { AtpeCompositeScoreResult } from '@/lib/atpe-composite-score'
import { buildAtpeClinicalSummaryExport } from '@/lib/atpe-clinical-summary-export'
import { DashboardAlert } from '@/lib/dashboard-alerts'
import { AtpeProtocol } from '@/lib/atpe-protocol-engine'
import { AtpePredictionResult } from '@/lib/atpe-prediction-engine'

type PatientAtpeClinicalSummaryExportProps = {
  patientName?: string | null
  sessionDateLabel?: string | null
  profile?: string | null
  composite: AtpeCompositeScoreResult
  prediction: AtpePredictionResult
  protocol: AtpeProtocol
  alerts?: DashboardAlert[]
  sessionsCount?: number
  className?: string
  title?: string
}

export function PatientAtpeClinicalSummaryExport({
  patientName,
  sessionDateLabel,
  profile,
  composite,
  prediction,
  protocol,
  alerts = [],
  sessionsCount,
  className = '',
  title = 'Export texte structuré',
}: PatientAtpeClinicalSummaryExportProps) {
  const [copied, setCopied] = useState(false)

  const exportText = useMemo(
    () =>
      buildAtpeClinicalSummaryExport({
        patientName,
        sessionDateLabel,
        profile,
        composite,
        prediction,
        protocol,
        alerts,
        sessionsCount,
      }),
    [
      patientName,
      sessionDateLabel,
      profile,
      composite,
      prediction,
      protocol,
      alerts,
      sessionsCount,
    ]
  )

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error('Impossible de copier le texte clinique :', error)
    }
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Texte prêt à copier-coller dans un dossier, un compte rendu ou un PDF
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {copied ? 'Copié' : 'Copier le texte'}
        </button>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
          {exportText}
        </pre>
      </div>
    </section>
  )
}