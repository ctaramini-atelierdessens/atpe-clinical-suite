
import { notFound } from 'next/navigation'
import { SessionForm } from '@/components/forms/session-form'
import { SoftDeleteSessionButton } from '@/components/delete-buttons'
import { getAppContext } from '@/lib/atpe/app-context'
import { canSoftDelete } from '@/lib/atpe/rbac'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params
  const { supabase, membership } = await getAppContext()
  const { data: session } = await supabase.from('sessions').select('*').eq('id', sessionId).eq('patient_id', id).maybeSingle()
  if (!session) notFound()
  return (
    <div className="space-y-6">
      <SessionForm patientId={id} session={session} />
      {canSoftDelete(membership?.role) ? <SoftDeleteSessionButton patientId={id} sessionId={sessionId} /> : null}
    </div>
  )
}
