import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function saveAssessmentSummary(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()

  if (!patientId || !assessmentId) {
    redirect('/patients')
  }

  const status = String(formData.get('status') || '').trim() || 'draft'
  const priorKnowledgeSummary =
    String(formData.get('prior_knowledge_summary') || '').trim() || null
  const initialRecommendation =
    String(formData.get('initial_recommendation') || '').trim() || null
  const finalRecommendation =
    String(formData.get('final_recommendation') || '').trim() || null
  const initialObjectives =
    String(formData.get('initial_objectives') || '').trim() || null
  const proposedModalities =
    String(formData.get('proposed_modalities') || '').trim() || null
  const closedAtEnabled =
    String(formData.get('mark_closed') || '').trim() === 'on'

  const supabase = await createClient()

  const { error } = await supabase
    .from('expression_assessments')
    .update({
      status,
      prior_knowledge_summary: priorKnowledgeSummary,
      initial_recommendation: initialRecommendation,
      final_recommendation: finalRecommendation,
      initial_objectives: initialObjectives,
      proposed_modalities: proposedModalities,
      closed_at: closedAtEnabled ? new Date().toISOString() : null,
    })
    .eq('id', assessmentId)
    .eq('patient_id', patientId)

  if (error) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/summary?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(`/patients/${patientId}/expression-assessments`)
  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}/summary`)
  revalidatePath(`/patients/${patientId}`)

  redirect(`/patients/${patientId}/expression-assessments/${assessmentId}`)
}

export default async function AssessmentSummaryPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }, { data: interviews }, { data: sessions }, { data: objectives }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('expression_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('expression_assessment_interviews')
        .select('id')
        .eq('assessment_id', assessmentId),
      supabase
        .from('expression_assessment_sessions')
        .select('id')
        .eq('assessment_id', assessmentId),
      supabase
        .from('therapeutic_objectives')
        .select('id')
        .eq('patient_id', id)
        .eq('assessment_id', assessmentId),
    ])

  if (!patient || !assessment) {
    notFound()
  }

  const safePatient = patient as any
  const safeAssessment = assessment as any

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

        <p className="mt-3 text-sm text-slate-500">Synthèse finale du bilan</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Recommandation clinique
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible d’enregistrer la synthèse finale.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <form action={saveAssessmentSummary} className="space-y-6 xl:col-span-2">
          <input type="hidden" name="patient_id" value={id} />
          <input type="hidden" name="assessment_id" value={assessmentId} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Statut et clôture
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Statut du bilan</span>
                <select
                  name="status"
                  defaultValue={safeAssessment.status || 'draft'}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  <option value="draft">Brouillon</option>
                  <option value="intake_started">Entame du bilan</option>
                  <option value="discovery_in_progress">Découverte en cours</option>
                  <option value="final_interview_done">Entretien final réalisé</option>
                  <option value="trial_sessions">Séances d’essai</option>
                  <option value="recommended">Recommandé</option>
                  <option value="deferred">Différé</option>
                  <option value="refused">Refusé</option>
                  <option value="converted_to_care">Converti en prise en charge</option>
                </select>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 self-end">
                <input
                  type="checkbox"
                  name="mark_closed"
                  defaultChecked={!!safeAssessment.closed_at}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  Marquer ce bilan comme clôturé
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Synthèse clinique
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Résumé clinique préalable
                </span>
                <textarea
                  name="prior_knowledge_summary"
                  rows={5}
                  defaultValue={safeAssessment.prior_knowledge_summary || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Pré-recommandation
                </span>
                <textarea
                  name="initial_recommendation"
                  rows={4}
                  defaultValue={safeAssessment.initial_recommendation || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Recommandation finale
                </span>
                <textarea
                  name="final_recommendation"
                  rows={6}
                  defaultValue={safeAssessment.final_recommendation || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Indication thérapeutique
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Objectifs initiaux retenus
                </span>
                <textarea
                  name="initial_objectives"
                  rows={5}
                  defaultValue={safeAssessment.initial_objectives || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Cadre proposé / modalités de prise en charge
                </span>
                <textarea
                  name="proposed_modalities"
                  rows={6}
                  defaultValue={safeAssessment.proposed_modalities || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="grid gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
              >
                Enregistrer la synthèse finale
              </button>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Retour au bilan
              </Link>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Repères du bilan
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Entretiens :</span>{' '}
                {interviews?.length ?? 0}
              </p>
              <p>
                <span className="font-medium text-slate-900">Séances BE :</span>{' '}
                {sessions?.length ?? 0}
              </p>
              <p>
                <span className="font-medium text-slate-900">Objectifs :</span>{' '}
                {objectives?.length ?? 0}
              </p>
              <p>
                <span className="font-medium text-slate-900">Clôturé :</span>{' '}
                {safeAssessment.closed_at ? 'Oui' : 'Non'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Conseil</p>
            <p className="mt-2">
              Utilise cette page pour formuler la décision clinique finale du bilan,
              préciser l’indication et préparer la bascule éventuelle vers la prise en charge.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}