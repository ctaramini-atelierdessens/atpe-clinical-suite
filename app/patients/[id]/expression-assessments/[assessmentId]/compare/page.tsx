import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExpressionAssessmentCareComparison } from '@/components/expression-assessment-care-comparison'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
}

export default async function AssessmentComparePage({ params }: PageProps) {
  const { id, assessmentId } = await params
  const supabase = await createClient()

  const [
    { data: patient },
    { data: assessment },
    { data: assessmentObjectives },
    { data: episode },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('expression_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('patient_id', id)
      .maybeSingle(),
    supabase
      .from('therapeutic_objectives')
      .select('id, title, description')
      .eq('patient_id', id)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true }),
    supabase
      .from('therapy_episodes')
      .select('*')
      .eq('patient_id', id)
      .order('opened_on', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!patient || !assessment) {
    notFound()
  }

  const episodeId = (episode as any)?.id

  const therapyGoalsResponse = episodeId
    ? await supabase
        .from('therapy_goals')
        .select('id, title, description, status, priority')
        .eq('episode_id', episodeId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
    : { data: [] as any[] }

  const safePatient = patient as any
  const patientLabel =
    safePatient.code ||
    safePatient.initials ||
    safePatient.display_name ||
    safePatient.last_name ||
    safePatient.first_name ||
    'Patient'

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour au bilan expressionnel
        </Link>

        <p className="mt-3 text-sm text-slate-500">
          Comparatif bilan / prise en charge
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Continuité clinique BE → ATPE
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      <ExpressionAssessmentCareComparison
        assessment={assessment as any}
        episode={(episode as any) || null}
        assessmentObjectives={(assessmentObjectives ?? []) as any}
        therapyGoals={(therapyGoalsResponse.data ?? []) as any}
      />
    </div>
  )
}