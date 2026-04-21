import { notFound } from 'next/navigation'
import { SessionForm } from '@/components/forms/session-form'
import { SoftDeleteSessionButton } from '@/components/delete-buttons'
import { getAppContext } from '@/lib/atpe/app-context'
import { canSoftDelete } from '@/lib/atpe/rbac'

type PageProps = {
  params: Promise<{
    id: string
    sessionId: string
  }>
}

export default async function EditSessionPage({ params }: PageProps) {
  const resolvedParams = await params
  const patientId =
    typeof resolvedParams.id === 'string' ? resolvedParams.id.trim() : ''
  const sessionId =
    typeof resolvedParams.sessionId === 'string'
      ? resolvedParams.sessionId.trim()
      : ''

  if (!patientId || !sessionId) {
    notFound()
  }

  const { supabase, membership } = await getAppContext()

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) {
    console.error('EditSessionPage query error:', error)
    notFound()
  }

  if (!session) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <SessionForm patientId={patientId} session={session} />

      {canSoftDelete(membership?.role) ? (
        <SoftDeleteSessionButton
          patientId={patientId}
          sessionId={sessionId}
        />
      ) : null}
    </div>
  )
}