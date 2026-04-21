import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string; sessionId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function saveGeneralObservation(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()
  const sessionId = String(formData.get('session_id') || '').trim()

  if (!patientId || !assessmentId || !sessionId) {
    redirect('/patients')
  }

  const payload = {
    patient_id: patientId,
    assessment_session_id: sessionId,

    arrival_attitude: String(formData.get('arrival_attitude') || '').trim() || null,
    during_session_attitude:
      String(formData.get('during_session_attitude') || '').trim() || null,
    end_session_attitude: String(formData.get('end_session_attitude') || '').trim() || null,

    instruction_text: String(formData.get('instruction_text') || '').trim() || null,
    instruction_respected: (() => {
      const v = String(formData.get('instruction_respected') || '').trim()
      if (!v) return null
      return v === 'yes'
    })(),
    instruction_mode: String(formData.get('instruction_mode') || '').trim() || null,

    behavior_adapted:
      String(formData.get('behavior_adapted') || '').trim() === ''
        ? null
        : String(formData.get('behavior_adapted') || '').trim() === 'yes',
    initiative:
      String(formData.get('initiative') || '').trim() === ''
        ? null
        : String(formData.get('initiative') || '').trim() === 'yes',
    concentration:
      String(formData.get('concentration') || '').trim() === ''
        ? null
        : String(formData.get('concentration') || '').trim() === 'yes',
    stays_in_place:
      String(formData.get('stays_in_place') || '').trim() === ''
        ? null
        : String(formData.get('stays_in_place') || '').trim() === 'yes',
    displacement_level: String(formData.get('displacement_level') || '').trim() || null,

    relation_to_group: String(formData.get('relation_to_group') || '').trim() || null,
    relation_to_therapist:
      String(formData.get('relation_to_therapist') || '').trim() || null,

    communication_quality:
      String(formData.get('communication_quality') || '').trim() || null,
    verbalization_level: String(formData.get('verbalization_level') || '').trim() || null,
    verbalization_content_self:
      String(formData.get('verbalization_content_self') || '').trim() || null,
    verbalization_content_family:
      String(formData.get('verbalization_content_family') || '').trim() || null,
    verbalization_content_others:
      String(formData.get('verbalization_content_others') || '').trim() || null,

    media_used: String(formData.get('media_used') || '').trim() || null,
    production_completed:
      String(formData.get('production_completed') || '').trim() === ''
        ? null
        : String(formData.get('production_completed') || '').trim() === 'yes',
    production_destroyed:
      String(formData.get('production_destroyed') || '').trim() === ''
        ? null
        : String(formData.get('production_destroyed') || '').trim() === 'yes',
    production_offered:
      String(formData.get('production_offered') || '').trim() === ''
        ? null
        : String(formData.get('production_offered') || '').trim() === 'yes',
    chose_title: String(formData.get('chose_title') || '').trim() || null,
    signed_work: String(formData.get('signed_work') || '').trim() || null,
    satisfaction_level: String(formData.get('satisfaction_level') || '').trim() || null,
    response_to_production:
      String(formData.get('response_to_production') || '').trim() || null,

    free_notes: String(formData.get('free_notes') || '').trim() || null,
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('general_observations')
    .select('id')
    .eq('assessment_session_id', sessionId)
    .eq('patient_id', patientId)
    .maybeSingle()

  let error = null as { message: string } | null

  if (existing?.id) {
    const result = await supabase
      .from('general_observations')
      .update(payload)
      .eq('id', existing.id)

    error = result.error
  } else {
    const result = await supabase.from('general_observations').insert(payload)
    error = result.error
  }

  if (error) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/observation?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}`
  )
  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/observation`
  )

  redirect(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/observation`
  )
}

function yesNoDefault(value: boolean | null | undefined) {
  if (value === true) return 'yes'
  if (value === false) return 'no'
  return ''
}

export default async function GeneralObservationPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId, sessionId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }, { data: session }, { data: observation }] =
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
        .from('general_observations')
        .select('*')
        .eq('assessment_session_id', sessionId)
        .eq('patient_id', id)
        .maybeSingle(),
    ])

  if (!patient || !assessment || !session) {
    notFound()
  }

  const safePatient = patient as any
  const obs = (observation as any) || {}

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
          href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour à la séance
        </Link>

        <p className="mt-3 text-sm text-slate-500">Observation générale</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Fiche d’observation clinique
        </h1>
        <p className="mt-2 text-sm text-slate-600">Patient : {patientLabel}</p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible d’enregistrer l’observation.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <form action={saveGeneralObservation} className="space-y-6">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="session_id" value={sessionId} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Attitude générale
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Attitude à l’arrivée
                  </span>
                  <textarea
                    name="arrival_attitude"
                    rows={3}
                    defaultValue={obs.arrival_attitude || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Attitude pendant la séance
                  </span>
                  <textarea
                    name="during_session_attitude"
                    rows={3}
                    defaultValue={obs.during_session_attitude || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Attitude en fin de séance
                  </span>
                  <textarea
                    name="end_session_attitude"
                    rows={3}
                    defaultValue={obs.end_session_attitude || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Consigne et comportement
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Consigne / dispositif
                  </span>
                  <textarea
                    name="instruction_text"
                    rows={3}
                    defaultValue={obs.instruction_text || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Consigne respectée
                    </span>
                    <select
                      name="instruction_respected"
                      defaultValue={yesNoDefault(obs.instruction_respected)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Mode de réponse à la consigne
                    </span>
                    <select
                      name="instruction_mode"
                      defaultValue={obs.instruction_mode || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="literal">À la lettre</option>
                      <option value="developed">Développée</option>
                      <option value="misunderstood">Incomprise</option>
                      <option value="refusal">Refus</option>
                      <option value="other">Autre</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Comportement adapté</span>
                    <select
                      name="behavior_adapted"
                      defaultValue={yesNoDefault(obs.behavior_adapted)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Initiative</span>
                    <select
                      name="initiative"
                      defaultValue={yesNoDefault(obs.initiative)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Concentration</span>
                    <select
                      name="concentration"
                      defaultValue={yesNoDefault(obs.concentration)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Reste en place</span>
                    <select
                      name="stays_in_place"
                      defaultValue={yesNoDefault(obs.stays_in_place)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Niveau de déplacement
                    </span>
                    <select
                      name="displacement_level"
                      defaultValue={obs.displacement_level || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="none">Aucun</option>
                      <option value="little">Peu</option>
                      <option value="often">Souvent</option>
                      <option value="very_often">Très souvent</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Relation et parole
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Relation au groupe
                  </span>
                  <textarea
                    name="relation_to_group"
                    rows={3}
                    defaultValue={obs.relation_to_group || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Relation au thérapeute
                  </span>
                  <textarea
                    name="relation_to_therapist"
                    rows={3}
                    defaultValue={obs.relation_to_therapist || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Qualité de la communication
                    </span>
                    <select
                      name="communication_quality"
                      defaultValue={obs.communication_quality || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="adapted">Adaptée</option>
                      <option value="altered">Altérée</option>
                      <option value="mixed">Mixte</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Niveau de verbalisation
                    </span>
                    <select
                      name="verbalization_level"
                      defaultValue={obs.verbalization_level || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="little">Peu</option>
                      <option value="moderate">Modérée</option>
                      <option value="much">Importante</option>
                      <option value="logorrhea">Logorrhée</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Contenu verbal : soi
                  </span>
                  <textarea
                    name="verbalization_content_self"
                    rows={2}
                    defaultValue={obs.verbalization_content_self || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Contenu verbal : famille
                  </span>
                  <textarea
                    name="verbalization_content_family"
                    rows={2}
                    defaultValue={obs.verbalization_content_family || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Contenu verbal : autres
                  </span>
                  <textarea
                    name="verbalization_content_others"
                    rows={2}
                    defaultValue={obs.verbalization_content_others || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Rapport à la production
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Médias utilisés
                  </span>
                  <textarea
                    name="media_used"
                    rows={2}
                    defaultValue={obs.media_used || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Production terminée</span>
                    <select
                      name="production_completed"
                      defaultValue={yesNoDefault(obs.production_completed)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Production détruite</span>
                    <select
                      name="production_destroyed"
                      defaultValue={yesNoDefault(obs.production_destroyed)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Production offerte</span>
                    <select
                      name="production_offered"
                      defaultValue={yesNoDefault(obs.production_offered)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Non renseigné</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Niveau de satisfaction</span>
                    <input
                      type="text"
                      name="satisfaction_level"
                      defaultValue={obs.satisfaction_level || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Titre choisi</span>
                    <input
                      type="text"
                      name="chose_title"
                      defaultValue={obs.chose_title || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Signature</span>
                    <input
                      type="text"
                      name="signed_work"
                      defaultValue={obs.signed_work || ''}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Réponse à la production
                  </span>
                  <textarea
                    name="response_to_production"
                    rows={4}
                    defaultValue={obs.response_to_production || ''}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Notes libres
                  </span>
                  <textarea
                    name="free_notes"
                    rows={5}
                    defaultValue={obs.free_notes || ''}
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
                  Enregistrer l’observation
                </button>

                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retour à la séance
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p className="font-medium text-slate-900">État de la fiche</p>
              <p className="mt-2">
                {observation ? 'Une observation existe déjà pour cette séance.' : 'Aucune observation encore enregistrée.'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}