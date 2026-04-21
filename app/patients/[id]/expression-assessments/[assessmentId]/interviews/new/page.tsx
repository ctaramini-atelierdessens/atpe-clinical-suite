import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
  searchParams?: Promise<{ type?: string; error?: string }>
}

function normalizeInterviewType(value?: string) {
  switch (value) {
    case 'primo':
      return 'primo'
    case 'final':
      return 'final'
    case 'requester':
      return 'requester'
    case 'family':
      return 'family'
    case 'team':
      return 'team'
    default:
      return 'primo'
  }
}

function interviewTypeLabel(type: string) {
  switch (type) {
    case 'primo':
      return 'Primo-entretien'
    case 'final':
      return 'Entretien final'
    case 'requester':
      return 'Entretien avec le demandeur'
    case 'family':
      return 'Entretien avec la famille'
    case 'team':
      return 'Entretien avec l’équipe'
    default:
      return 'Entretien'
  }
}

async function createAssessmentInterview(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()

  if (!patientId || !assessmentId) {
    redirect(`/patients/${patientId}/expression-assessments`)
  }

  const interviewType = normalizeInterviewType(
    String(formData.get('interview_type') || '').trim()
  )

  const interviewDate = String(formData.get('interview_date') || '').trim()
  const durationRaw = String(formData.get('duration_minutes') || '').trim()
  const parsedDuration = Number.parseInt(durationRaw || '0', 10)
  const durationMinutes = Number.isNaN(parsedDuration) ? null : Math.max(0, parsedDuration)

  const reasonForConsultation = String(formData.get('reason_for_consultation') || '').trim()
  const expectations = String(formData.get('expectations') || '').trim()
  const artisticInterests = String(formData.get('artistic_interests') || '').trim()
  const artisticPractice = String(formData.get('artistic_practice') || '').trim()
  const clinicalObservations = String(formData.get('clinical_observations') || '').trim()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expression_assessment_interviews')
    .insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      interview_type: interviewType,
      interview_date: interviewDate || null,
      duration_minutes: durationMinutes,
      reason_for_consultation: reasonForConsultation || null,
      expectations: expectations || null,
      artistic_interests: artisticInterests || null,
      artistic_practice: artisticPractice || null,
      clinical_observations: clinicalObservations || null,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/interviews/new?type=${interviewType}&error=${encodeURIComponent(
        error?.message || 'Impossible de créer l’entretien.'
      )}`
    )
  }

  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)

  redirect(
    `/patients/${patientId}/expression-assessments/${assessmentId}`
  )
}

export default async function NewAssessmentInterviewPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const interviewType = normalizeInterviewType(
    typeof resolvedSearchParams?.type === 'string'
      ? resolvedSearchParams.type
      : undefined
  )
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string'
      ? resolvedSearchParams.error
      : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('expression_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('patient_id', id)
      .maybeSingle(),
  ])

  if (!patient || !assessment) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Impossible de charger le patient ou le bilan expressionnel.
      </div>
    )
  }

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

        <p className="mt-3 text-sm text-slate-500">Entretien du bilan expressionnel</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {interviewTypeLabel(interviewType)}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible de créer l’entretien.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <form action={createAssessmentInterview} className="space-y-6">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="interview_type" value={interviewType} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Informations générales
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Date</span>
                  <input
                    type="date"
                    name="interview_date"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Durée (minutes)</span>
                  <input
                    type="number"
                    name="duration_minutes"
                    min={0}
                    defaultValue={30}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Contenu clinique
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Raisons de la consultation
                  </span>
                  <textarea
                    name="reason_for_consultation"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Attentes
                  </span>
                  <textarea
                    name="expectations"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Intérêts artistiques
                  </span>
                  <textarea
                    name="artistic_interests"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Pratique artistique
                  </span>
                  <textarea
                    name="artistic_practice"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Observations cliniques
                  </span>
                  <textarea
                    name="clinical_observations"
                    rows={6}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Enregistrer l’entretien
                </button>

                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}`}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}