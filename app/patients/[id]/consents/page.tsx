import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocumentUploadForm, DocumentVaultList } from '@/components/document-vault'
import { ConsentForm, ConsentSignatureForm, ConsentSignatureList } from '@/components/forms/consent-form'
import { SectionCard } from '@/components/section-card'
import { getAppContext, insertAuditLog, insertPatientAccessLog } from '@/lib/atpe/app-context'

export default async function PatientConsentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, organization, user } = await getAppContext()
  const [{ data: patient }, { data: consents }] = await Promise.all([
    supabase.from('patients').select('id, code').eq('id', id).maybeSingle(),
    supabase.from('patient_consents').select('*').eq('patient_id', id).order('recorded_at', { ascending: false }),
  ])
  if (!patient) notFound()
const safePatient = patient as any

  if (organization) {
    await Promise.all([
      insertPatientAccessLog({
        organizationId: organization.id,
        patientId: id,
        actorUserId: user.id,
        accessScope: 'patient_consents',
        route: `/patients/${id}/consents`,
      }),
      insertAuditLog({
        organizationId: organization.id,
        actorUserId: user.id,
        entityType: 'patient_consents',
        entityId: id,
        action: 'read',
        metadata: { route: `/patients/${id}/consents` },
      }),
    ])
  }

  const consentIds = ((consents ?? []) as any[]).map((consent: any) => consent.id)
  const [{ data: signatures }, { data: documents }] = await Promise.all([
    consentIds.length
      ? supabase.from('consent_signatures').select('*').in('consent_id', consentIds).order('signed_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    supabase.from('patient_documents').select('*').eq('patient_id', id).eq('category', 'consent_signed_attachment').order('created_at', { ascending: false }),
  ])

  const firstConsentId = ((consents ?? []) as any[])[0]?.id ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Patient</p>
          <h1 className="text-3xl font-semibold tracking-tight">Consentements â€” {safePatient.code}</h1>
        </div>
        <Link href={`/patients/${id}`} className="rounded-2xl border border-slate-300 px-4 py-2 font-medium text-slate-700">
          Retour dossier
        </Link>
      </div>
      <ConsentForm patientId={id} />
      {firstConsentId ? <ConsentSignatureForm patientId={id} consentId={firstConsentId} /> : null}
      {firstConsentId ? <DocumentUploadForm patientId={id} consentId={firstConsentId} defaultCategory="consent_signed_attachment" /> : null}
      <SectionCard title="Ã‰tats de consentement" description="Un Ã©tat courant par type de consentement.">
        <div className="grid gap-3 md:grid-cols-2">
          {((consents ?? []) as any[]).map((consent: any) => (
            <div key={consent.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-800">{consent.consent_kind}</span>
                <span className="badge bg-slate-100 text-slate-700">{consent.status}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">EnregistrÃ© le {new Date(consent.recorded_at).toLocaleString('fr-FR')}</p>
              {consent.expires_at ? <p className="mt-1 text-xs text-slate-500">Expire le {new Date(consent.expires_at).toLocaleString('fr-FR')}</p> : null}
              {consent.note ? <p className="mt-3 text-sm text-slate-600">{consent.note}</p> : null}
            </div>
          ))}
          {!consents?.length ? <p className="text-sm text-slate-500">Aucun consentement saisi.</p> : null}
        </div>
      </SectionCard>
      <SectionCard title="Signatures de consentement" description="Trace textuelle ou visuelle des signatures associÃ©es.">
        <ConsentSignatureList items={(signatures ?? []) as any} />
      </SectionCard>
      <SectionCard title="PiÃ¨ces jointes signÃ©es" description="Documents sÃ©curisÃ©s liÃ©s aux consentements et conservÃ©s dans le coffre documentaire.">
        <DocumentVaultList items={(documents ?? []) as any} />
      </SectionCard>
    </div>
  )
}




