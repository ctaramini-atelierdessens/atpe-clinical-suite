import { notFound } from 'next/navigation'
import { SessionForm } from '@/components/forms/session-form'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getAppContext()
  const { data: patient } = await supabase.from('patients').select('id').eq('id', id).maybeSingle()
  if (!patient) notFound()
  return <SessionForm patientId={id} />
}
