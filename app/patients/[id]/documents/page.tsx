import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocumentUploadForm, DocumentVaultList } from '@/components/document-vault'
import { SectionCard } from '@/components/section-card'
import { getAppContext, insertAuditLog, insertPatientAccessLog } from '@/lib/atpe/app-context'

export default async function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, organization, user } = await getAppContext()

  const [{ data: patient }, { data: documents }] = await Promise.all([
    supabase.from('patients').select('id, code').eq('id', id).maybeSingle(),
    supabase.from('patient_documents').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
  ])

  if (!patient) notFound()
const safePatient = patient as any

  if (organization) {
    await Promise.all([
      insertPatientAccessLog({
        organizationId: organization.id,
        patientId: id,
        actorUserId: user.id,
        accessScope: 'patient_documents',
        route: `/patients/${id}/documents`,
      }),
      insertAuditLog({
        organizationId: organization.id,
        actorUserId: user.id,
        entityType: 'patient_documents',
        entityId: id,
        action: 'read',
        metadata: { route: `/patients/${id}/documents` },
      }),
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Patient</p>
          <h1 className="text-3xl font-semibold tracking-tight">Coffre documentaire â€” {safePatient.code}</h1>
        </div>
        <Link href={`/patients/${id}`} className="rounded-2xl border border-slate-300 px-4 py-2 font-medium text-slate-700">
          Retour dossier
        </Link>
      </div>

      <DocumentUploadForm patientId={id} />

      <SectionCard title="Documents du dossier" description="Inventaire des fichiers stockÃ©s dans le bucket sÃ©curisÃ©.">
        <DocumentVaultList items={(documents ?? []) as any} />
      </SectionCard>
    </div>
  )
}

