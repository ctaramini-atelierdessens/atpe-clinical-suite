'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type CurrentView = 'patient' | 'atpe' | 'protocols'

type Props = {
  patientId: string
  currentView: CurrentView
  showBackToPatients?: boolean
  showBackToPatient?: boolean
  className?: string
}

function isActive(currentView: CurrentView, target: CurrentView) {
  return currentView === target
}

function navLinkClass(active: boolean) {
  return active
    ? 'inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
    : 'inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
}

export function PatientClinicalNav({
  patientId,
  currentView,
  showBackToPatients = false,
  showBackToPatient = false,
  className = '',
}: Props) {
  const pathname = usePathname()

  const patientHref = `/patients/${patientId}`
  const atpeHref = `/patients/${patientId}/atpe`
  const protocolsHref = `/protocols`
  const pdfSummaryHref = `/api/atpe-export-pdf?patientId=${patientId}&type=therapeutic_summary`
  const pdfFullHref = `/api/atpe-export-pdf?patientId=${patientId}&type=full_case`

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {(showBackToPatients || showBackToPatient) && (
        <div className="flex flex-wrap gap-2">
          {showBackToPatients && (
            <Link
              href="/patients"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Retour aux patients
            </Link>
          )}

          {showBackToPatient && pathname !== patientHref && (
            <Link
              href={patientHref}
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Retour à la fiche patient
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={patientHref}
          className={navLinkClass(isActive(currentView, 'patient'))}
        >
          Fiche patient
        </Link>

        <Link
          href={atpeHref}
          className={navLinkClass(isActive(currentView, 'atpe'))}
        >
          Dossier ATPE
        </Link>

        <Link
          href={protocolsHref}
          className={navLinkClass(isActive(currentView, 'protocols'))}
        >
          Protocoles
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={pdfSummaryHref}
          target="_blank"
          className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          PDF synthèse
        </Link>

        <Link
          href={pdfFullHref}
          target="_blank"
          className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          PDF dossier complet
        </Link>
      </div>
    </div>
  )
}