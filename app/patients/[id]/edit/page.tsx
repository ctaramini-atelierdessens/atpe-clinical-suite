
import { notFound } from 'next/navigation'
import { PatientForm } from '@/components/forms/patient-form'
import { SoftDeletePatientButton } from '@/components/delete-buttons'
import { getAppContext } from '@/lib/atpe/app-context'
import { canSoftDelete } from '@/lib/atpe/rbac'

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, membership } = await getAppContext()

  const [{ data: patient }, { data: episode }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase.from('therapy_episodes').select('*').eq('patient_id', id).order('opened_on', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (!patient) notFound()

  return (
    <div className="space-y-6">
      <PatientForm patient={patient} episode={episode} />
      {canSoftDelete(membership?.role) ? <SoftDeletePatientButton patientId={id} /> : null}
    </div>
  )
}
