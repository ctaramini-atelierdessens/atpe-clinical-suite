import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GoalForm } from '@/components/forms/goal-form'
import { SectionCard } from '@/components/section-card'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function PatientGoalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getAppContext()

  const [{ data: patient }, { data: episode }] = await Promise.all([
    supabase.from('patients').select('id, code').eq('id', id).maybeSingle(),
    supabase.from('therapy_episodes').select('id, episode_label').eq('patient_id', id).order('opened_on', { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!patient) notFound()

  const { data: goals } = episode
    ? await supabase.from('therapy_goals').select('*').eq('episode_id', safeEpisode.id).order('created_at', { ascending: false })
    : { data: [] as any[] }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Patient</p>
          <h1 className="text-3xl font-semibold tracking-tight">Objectifs thÃ©rapeutiques â€” {patient.code}</h1>
          {episode ? <p className="mt-2 text-sm text-slate-500">Ã‰pisode : {episode.episode_label}</p> : null}
        </div>
        <Link href={`/patients/${id}`} className="rounded-2xl border border-slate-300 px-4 py-2 font-medium text-slate-700">
          Retour dossier
        </Link>
      </div>
      <GoalForm patientId={id} />
      <SectionCard title="Objectifs existants" description="Ã‰dition Ã©cran par Ã©cran via le lien dÃ©diÃ©.">
        <div className="space-y-3">
          {(goals ?? []).map((goal) => (
            <div key={goal.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">PrioritÃ© {goal.priority} Â· Statut {goal.status}</p>
                </div>
                <Link href={`/patients/${id}/goals/${goal.id}/edit`} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  Ã‰diter
                </Link>
              </div>
              {goal.description ? <p className="mt-3 text-sm text-slate-600">{goal.description}</p> : null}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}


