import { notFound } from 'next/navigation'
import Link from 'next/link'

import { PatientGlobalDashboard } from '@/components/patient-global-dashboard'
import { PatientClinicalProfileCard } from '@/components/patient-clinical-profile-card'
import { PatientClinicalAlerts } from '@/components/patient-clinical-alerts'
import { PatientGlobalScore } from '@/components/patient-global-score'
import { PatientInitialAssessmentCard } from '@/components/patient-initial-assessment-card'
import { PatientProgressChart } from '@/components/patient-progress-chart'

import { BEExpertReport } from '@/components/be-expert-report'
import { BELongitudinalReport } from '@/components/be-longitudinal-report'

import { ExportButtons } from '@/components/export-buttons'
import { PatientPdfDownloadButton } from '@/components/patient-pdf-download-button'

import { AuditLogList } from '@/components/audit-log-list'
import { DocumentVaultList } from '@/components/document-vault'
import { PatientAccessLogList } from '@/components/patient-access-log-list'
import { PatientExportLockButton } from '@/components/patient-export-lock-button'
import { PatientExportVersionsList } from '@/components/patient-export-versions-list'

import { getAppContext } from '@/lib/atpe/app-context'
import type { AtpeInput } from '@/lib/atpe-expert'

type PageProps = {
  params: Promise<{ id: string }>
}

type PatientDocument = {
  id: string
  title?: string | null
  mime_type?: string | null
  file_name?: string | null
  created_at?: string | null
  storage_bucket?: string | null
  storage_path?: string | null
}

type AuditLogItem = {
  id: string
  action?: string | null
  entity_type?: string | null
  entity_id?: string | null
  created_at?: string | null
  actor_name?: string | null
  actor_email?: string | null
  details?: string | null
  metadata?: Record<string, unknown> | null
}

type AccessLog = {
  id: string
  accessed_at?: string | null
  accessor_name?: string | null
  accessor_email?: string | null
  action?: string | null
  source?: string | null
  ip_address?: string | null
  user_agent?: string | null
}

type ExportVersion = {
  id: string
  version_number?: number | null
  format?: string | null
  status?: string | null
  created_at?: string | null
  locked_at?: string | null
  certified_at?: string | null
  created_by_name?: string | null
  created_by_email?: string | null
  file_url?: string | null
  checksum?: string | null
}

async function safeSelect<T>(
  promise: Promise<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  try {
    const { data } = await promise
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function getPatientData(id: string) {
  const { supabase } = await getAppContext()

  const [{ data: patient }, { data: sessions }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('active_patient_sessions')
      .select('*')
      .eq('patient_id', id)
      .order('session_number', { ascending: true }),
  ])

  const [
    documents,
    auditLogsPrimary,
    auditLogsFallback,
    accessLogsPrimary,
    accessLogsFallback,
    exportVersions,
  ] = await Promise.all([
    safeSelect<PatientDocument>(
      supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ),

    safeSelect<AuditLogItem>(
      supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_id', id)
        .order('created_at', { ascending: false }),
    ),

    safeSelect<AuditLogItem>(
      supabase
        .from('patient_audit_logs')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ),

    safeSelect<AccessLog>(
      supabase
        .from('patient_access_logs')
        .select('*')
        .eq('patient_id', id)
        .order('accessed_at', { ascending: false }),
    ),

    safeSelect<AccessLog>(
      supabase
        .from('access_logs')
        .select('*')
        .eq('patient_id', id)
        .order('accessed_at', { ascending: false }),
    ),

    safeSelect<ExportVersion>(
      supabase
        .from('patient_export_versions')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ),
  ])

  const auditLogs =
    auditLogsPrimary.length > 0 ? auditLogsPrimary : auditLogsFallback

  const accessLogs =
    accessLogsPrimary.length > 0 ? accessLogsPrimary : accessLogsFallback

  return {
    patient,
    sessions: Array.isArray(sessions) ? (sessions as AtpeInput[]) : [],
    documents,
    auditLogs,
    accessLogs,
    exportVersions,
  }
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params
  const {
    patient,
    sessions,
    documents,
    auditLogs,
    accessLogs,
    exportVersions,
  } = await getPatientData(id)

  if (!patient) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Dossier patient — {patient.code ?? 'Patient'}
          </h1>
          <p className="text-sm text-neutral-600">
            Vue clinique globale et analyse ATPE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/patients"
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
          >
            Retour
          </Link>

          <PatientPdfDownloadButton patientId={id} />
        </div>
      </div>

      <PatientGlobalDashboard patientId={id} sessions={sessions} />

      <div className="grid gap-6 lg:grid-cols-3">
        <PatientGlobalScore patientId={id} sessions={sessions} />
        <PatientClinicalAlerts patientId={id} sessions={sessions} />
        <PatientClinicalProfileCard patientId={id} />
      </div>

      <PatientInitialAssessmentCard patientId={id} />

      <PatientProgressChart patientId={id} sessions={sessions} />

      <BEExpertReport patientId={id} sessions={sessions} />

      <BELongitudinalReport patientId={id} sessions={sessions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ExportButtons patientId={id} />
        <PatientExportLockButton patientId={id} />
      </div>

      <PatientExportVersionsList
        patientId={id}
        initialItems={exportVersions}
      />

      <DocumentVaultList items={documents} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AuditLogList items={auditLogs} />
        <PatientAccessLogList items={accessLogs} />
      </div>
    </main>
  )
}