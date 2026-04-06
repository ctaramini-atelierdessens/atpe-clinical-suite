import Link from 'next/link'
import { SectionCard } from '@/components/section-card'
import { getAppContext } from '@/lib/atpe/app-context'
import { ReviewRequestList } from '@/components/review-workflow'

export default async function ReviewsPage() {
  const { supabase, membership } = await getAppContext()
  const [{ data: requests }, { data: patients }] = await Promise.all([
    supabase.from('clinical_review_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('patients').select('id, code'),
  ])

  const patientMap = new Map((patients ?? []).map((patient) => [patient.id, patient.code]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Revues superviseur</h1>
        <p className="mt-2 text-sm text-slate-500">Pilotage global des demandes de validation clinique.</p>
      </div>

      <SectionCard title="Workflow en cours" description="Accès superviseur centralisé à l’ensemble des dossiers soumis.">
        <div className="space-y-6">
          {(requests ?? []).map((request) => (
            <div key={request.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Patient {patientMap.get(request.patient_id) ?? request.patient_id}</h2>
                  <p className="text-sm text-slate-500">Session liée : {request.session_id ?? 'non précisée'}</p>
                </div>
                <Link href={`/patients/${request.patient_id}`} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  Ouvrir le dossier
                </Link>
              </div>
              <ReviewRequestList items={[request] as any} role={membership?.role} patientId={request.patient_id} />
            </div>
          ))}
          {!requests?.length ? <p className="text-sm text-slate-500">Aucune revue clinique active.</p> : null}
        </div>
      </SectionCard>
    </div>
  )
}
