import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string; sessionId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function createMusicReceptivityResponse(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()
  const sessionId = String(formData.get('session_id') || '').trim()

  if (!patientId || !assessmentId || !sessionId) {
    redirect(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  }

  const workIndexRaw = String(formData.get('work_index') || '').trim()
  const parsedWorkIndex = Number.parseInt(workIndexRaw || '', 10)
  const workIndex = Number.isNaN(parsedWorkIndex) ? null : parsedWorkIndex

  if (!workIndex || workIndex < 1 || workIndex > 10) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/music-receptivity?error=${encodeURIComponent(
        'Le numéro d’œuvre doit être compris entre 1 et 10.'
      )}`
    )
  }

  const workLabel = String(formData.get('work_label') || '').trim()
  const remarks = String(formData.get('remarks') || '').trim()

  const payload = {
    assessment_session_id: sessionId,
    work_index: workIndex,
    work_label: workLabel || null,

    s1_olfactory_auditory:
      String(formData.get('s1_olfactory_auditory') || '').trim() === 'on',
    s2_visual_simple:
      String(formData.get('s2_visual_simple') || '').trim() === 'on',
    s3_tactile_cenesthetic:
      String(formData.get('s3_tactile_cenesthetic') || '').trim() === 'on',
    s4_motor_body:
      String(formData.get('s4_motor_body') || '').trim() === 'on',

    c1_intellectual_cultural:
      String(formData.get('c1_intellectual_cultural') || '').trim() === 'on',
    c2_visual_complex:
      String(formData.get('c2_visual_complex') || '').trim() === 'on',
    c3_memory:
      String(formData.get('c3_memory') || '').trim() === 'on',
    c4_affective_feeling:
      String(formData.get('c4_affective_feeling') || '').trim() === 'on',

    d1_value_judgment:
      String(formData.get('d1_value_judgment') || '').trim() === 'on',
    d4_rationalization_generalization:
      String(formData.get('d4_rationalization_generalization') || '').trim() === 'on',

    remarks: remarks || null,
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('music_receptivity_responses')
    .upsert(payload, {
      onConflict: 'assessment_session_id,work_index',
    })

  if (error) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/music-receptivity?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}`
  )
  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/music-receptivity`
  )

  redirect(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/music-receptivity`
  )
}

export default async function MusicReceptivityPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId, sessionId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }, { data: session }, { data: responses }] =
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
        .select('*')
        .eq('id', sessionId)
        .eq('assessment_id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('music_receptivity_responses')
        .select('*')
        .eq('assessment_session_id', sessionId)
        .order('work_index', { ascending: true }),
    ])

  if (!patient || !assessment || !session) {
    notFound()
  }

  const safePatient = patient as any
  const safeSession = session as any

  const patientLabel =
    safePatient.code ||
    safePatient.initials ||
    safePatient.display_name ||
    safePatient.last_name ||
    safePatient.first_name ||
    'Patient'

  if (safeSession.session_type !== 'music_receptivity') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Cette grille est réservée aux séances de type <strong>music_receptivity</strong>.
        </div>

        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
          className="inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Retour à la séance
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour à la séance
        </Link>

        <p className="mt-3 text-sm text-slate-500">Grille de réceptivité musicale</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Réponses par œuvre
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible d’enregistrer la réponse.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <form action={createMusicReceptivityResponse} className="space-y-6">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="session_id" value={sessionId} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Œuvre observée
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Numéro d’œuvre
                  </span>
                  <input
                    type="number"
                    name="work_index"
                    min={1}
                    max={10}
                    defaultValue={1}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Libellé de l’œuvre
                  </span>
                  <input
                    type="text"
                    name="work_label"
                    placeholder="Titre, compositeur, repère..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Réponses sensorielles
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="s1_olfactory_auditory" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">S1 olfactive / auditive</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="s2_visual_simple" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">S2 visuelle simple</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="s3_tactile_cenesthetic" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">S3 tactile / cénesthésique</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="s4_motor_body" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">S4 motrice / corporelle</span>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Réponses complexes
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="c1_intellectual_cultural" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">C1 intellectuelle / culturelle</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="c2_visual_complex" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">C2 visuelle complexe</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="c3_memory" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">C3 mémoire / souvenirs</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="c4_affective_feeling" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">C4 affective / ressentie</span>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Réponses défensives
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="d1_value_judgment" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">D1 jugement de valeur</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="d4_rationalization_generalization"
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    D4 rationalisation / généralisation
                  </span>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">
                  Remarques cliniques
                </span>
                <textarea
                  name="remarks"
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Enregistrer la réponse
                </button>

                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retour à la séance
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Réponses enregistrées
              </h2>

              <div className="mt-4 space-y-3">
                {!responses?.length ? (
                  <p className="text-sm text-slate-500">
                    Aucune réponse musicale enregistrée.
                  </p>
                ) : (
                  responses.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Œuvre {item.work_index}
                        {item.work_label ? ` — ${item.work_label}` : ''}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        S: {[
                          item.s1_olfactory_auditory ? 'S1' : null,
                          item.s2_visual_simple ? 'S2' : null,
                          item.s3_tactile_cenesthetic ? 'S3' : null,
                          item.s4_motor_body ? 'S4' : null,
                        ].filter(Boolean).join(', ') || '—'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        C: {[
                          item.c1_intellectual_cultural ? 'C1' : null,
                          item.c2_visual_complex ? 'C2' : null,
                          item.c3_memory ? 'C3' : null,
                          item.c4_affective_feeling ? 'C4' : null,
                        ].filter(Boolean).join(', ') || '—'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        D: {[
                          item.d1_value_judgment ? 'D1' : null,
                          item.d4_rationalization_generalization ? 'D4' : null,
                        ].filter(Boolean).join(', ') || '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}