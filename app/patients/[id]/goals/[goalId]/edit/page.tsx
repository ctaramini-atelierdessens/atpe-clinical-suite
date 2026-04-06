import { notFound } from 'next/navigation'
import { GoalForm } from '@/components/forms/goal-form'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function EditGoalPage({ params }: { params: Promise<{ id: string; goalId: string }> }) {
  const { id, goalId } = await params
  const { supabase } = await getAppContext()
  const { data: goal } = await supabase
    .from('therapy_goals')
    .select('*, therapy_episodes!inner(patient_id)')
    .eq('id', goalId)
    .eq('therapy_episodes.patient_id', id)
    .maybeSingle()

  if (!goal) notFound()

  return <GoalForm patientId={id} goal={goal as any} />
}
