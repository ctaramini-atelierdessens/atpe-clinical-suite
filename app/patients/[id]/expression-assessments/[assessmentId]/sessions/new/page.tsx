import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
  searchParams?: Promise<{ type?: string; error?: string }>
}

function normalizeSessionType(value?: string) {
  switch (value) {
    case 'discovery':
      return 'discovery'
    case 'music_receptivity':
      return 'music_receptivity'
    case 'trial_group':
      return 'trial_group'
    case 'trial_individual':
      return 'trial_individual'
    case 'other':
      return 'other'
    default:
      return 'discovery'
  }
}

function sessionTypeLabel(type: string) {
  switch (type) {
    case 'discovery':
      return 'Séance découverte pluriexpressionnelle'
    case 'music_receptivity':
      return 'Séance de réceptivité musicale'
    case 'trial_group':
      return 'Séance d’essai en groupe'
    case 'trial_individual':
      return 'Séance d’essai individuelle'
    case 'other':
      return 'Autre séance du bilan'
    default:
      return 'Séance du bilan expressionnel'
  }
}

async function createAssessmentSession(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()

  if (!patientId || !assessmentId) {
    redirect('/patients')
  }

  const sessionType = normalizeSessionType(
    String(formData.get('session_type') || '').trim()
  )

  const sessionDate = String(formData.get('session_date') || '').trim()
  const durationRaw = String(formData.get('duration_minutes') || '').trim()
  const sessionNumberRaw = String(formData.get('session_number') || '').trim()
  const contextNotes = String(formData.get('context_notes') || '').trim()
  const clinicalSummary = String(formData.get('clinical_summary') || '').trim()

  const parsedDuration = Number.parseInt(durationRaw || '0', 10)
  const parsedSessionNumber = Number.parseInt(sessionNumberRaw || '0', 10)

  const durationMinutes = Number.isNaN(parsedDuration)
    ? null
    : Math.max(0, parsedDuration)

  const sessionNumber = Number.isNaN(parsedSessionNumber)
    ? null
    : Math.max(1, parsedSessionNumber)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expression_assessment_sessions')
    .insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      session_type: sessionType,
      session_date: sessionDate || null,
      duration_minutes: durationMinutes,
      session_number: sessionNumber,
      context_notes: contextNotes || null,
      clinical_summary: clinicalSummary || null,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/new?type=${sessionType}&error=${encodeURIComponent(
        error?.message || 'Impossible de créer la séance du bilan.'
      )}`
    )
  }

  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${data.id}`
  )

  redirect(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${data.id}`
  )
}

export default async function NewAssessmentSessionPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const sessionType = normalizeSessionType(
    typeof resolvedSearchParams?.type === 'string'
      ? resolvedSearchParams.type
      : undefined
  )

  const errorMessage =
    typeof resolvedSearchParams?.error === 'string'
      ? resolvedSearchParams.error
      : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }, { data: existingSessions }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('expression_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('expression_assessment_sessions')
        .select('session_number')
        .eq('assessment_id', assessmentId)
        .order('session_number', { ascending: false })
        .limit(1),
    ])

  if (!patient || !assessment) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Impossible de charger le patient ou le bilan expressionnel.
      </div>
    )
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

  const nextSessionNumber =
    existingSessions &&
    existingSessions.length > 0 &&
    existingSessions[0]?.session_number
      ? Number(existingSessions[0].session_number) + 1
      : 1

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour au bilan expressionnel
        </Link>

        <p className="mt-3 text-sm text-slate-500">Séances du bilan expressionnel</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {sessionTypeLabel(sessionType)}
        </h1>
        <p className="mt-2 text-sm text-slate-600">Patient : {patientLabel}</p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible de créer la séance du bilan.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <form action={createAssessmentSession} className="space-y-6">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="session_type" value={sessionType} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Informations générales
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Date de la séance
                  </span>
                  <input
                    type="date"
                    name="session_date"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Durée (minutes)
                  </span>
                  <input
                    type="number"
                    name="duration_minutes"
                    min={0}
                    defaultValue={sessionType === 'music_receptivity' ? 60 : 45}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Numéro de séance dans le bilan
                  </span>
                  <input
                    type="number"
                    name="session_number"
                    min={1}
                    defaultValue={nextSessionNumber}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Cadre et déroulé
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Notes de contexte
                  </span>
                  <textarea
                    name="context_notes"
                    rows={6}
                    placeholder="Cadre, consigne, dispositif, médias proposés, état d’arrivée..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Synthèse clinique initiale
                  </span>
                  <textarea
                    name="clinical_summary"
                    rows={6}
                    placeholder="Résumé clinique de la séance, premiers repérages, investissement, résistances..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Repères</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Type :</span>{' '}
                  {sessionTypeLabel(sessionType)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Statut du bilan :</span>{' '}
                  {safeAssessment.status || 'draft'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Date du bilan :</span>{' '}
                  {safeAssessment.request_date || 'Non renseignée'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Créer la séance du bilan
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