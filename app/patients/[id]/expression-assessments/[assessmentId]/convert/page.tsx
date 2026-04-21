import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAppContext } from '@/lib/atpe/app-context'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function convertAssessmentToCare(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()
  const organizationId = String(formData.get('organization_id') || '').trim()
  const clinicianId = String(formData.get('clinician_id') || '').trim()

  if (!patientId || !assessmentId) {
    redirect('/patients')
  }

  if (!organizationId) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
        'organization_id manquant dans le formulaire.'
      )}`
    )
  }

  if (!clinicianId) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
        'clinician_id manquant dans le formulaire.'
      )}`
    )
  }

  const episodeLabel =
    String(formData.get('episode_label') || '').trim() || 'Prise en charge ATPE'
  const openedOn = String(formData.get('opened_on') || '').trim()
  const status = String(formData.get('episode_status') || '').trim() || 'active'
  const therapeuticFrame =
    String(formData.get('therapeutic_frame') || '').trim() || null
  const clinicalIndication =
    String(formData.get('clinical_indication') || '').trim() || null
  const objectivesSummary =
    String(formData.get('objectives_summary') || '').trim() || null
  const importObjectives =
    String(formData.get('import_objectives') || '').trim() === 'on'

  const { supabase } = await getAppContext()

  const { data: assessment, error: assessmentError } = await supabase
    .from('expression_assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (assessmentError || !assessment) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
        assessmentError?.message || 'Bilan introuvable.'
      )}`
    )
  }

  const safeAssessment = assessment as any

  const { data: episode, error: episodeError } = await supabase
    .from('therapy_episodes')
    .insert({
      organization_id: organizationId,
      clinician_id: clinicianId,
      patient_id: patientId,
      episode_label: episodeLabel,
      opened_on: openedOn || new Date().toISOString().slice(0, 10),
      status,
      therapeutic_frame: therapeuticFrame || safeAssessment.proposed_modalities || null,
      clinical_indication:
        clinicalIndication || safeAssessment.final_recommendation || null,
      objectives_summary:
        objectivesSummary || safeAssessment.initial_objectives || null,
    })
    .select('id')
    .single()

  if (episodeError || !episode?.id) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
        episodeError?.message || "Impossible de créer l'épisode thérapeutique."
      )}`
    )
  }

  if (importObjectives) {
    const { data: objectives } = await supabase
      .from('therapeutic_objectives')
      .select('*')
      .eq('patient_id', patientId)
      .eq('assessment_id', assessmentId)

    if (objectives?.length) {
      const payload = objectives.map((objective: any) => ({
        organization_id: organizationId,
        episode_id: episode.id,
        title: objective.title,
        description: objective.description,
        priority: 'medium',
        status: 'active',
      }))

      const { error: goalsError } = await supabase
        .from('therapy_goals')
        .insert(payload)

      if (goalsError) {
        redirect(
          `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
            goalsError.message
          )}`
        )
      }
    }
  }

  const { error: updateAssessmentError } = await supabase
    .from('expression_assessments')
    .update({
      status: 'converted_to_care',
      closed_at: new Date().toISOString(),
    })
    .eq('id', assessmentId)
    .eq('patient_id', patientId)

  if (updateAssessmentError) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/convert?error=${encodeURIComponent(
        updateAssessmentError.message
      )}`
    )
  }

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/expression-assessments`)
  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  revalidatePath(`/patients/${patientId}/goals`)

  redirect(`/patients/${patientId}`)
}

export default async function ConvertAssessmentPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const { supabase, organization, user } = await getAppContext()

  const [{ data: patient }, { data: assessment }, { data: objectives }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('expression_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('therapeutic_objectives')
        .select('id, title')
        .eq('patient_id', id)
        .eq('assessment_id', assessmentId),
    ])

  if (!patient || !assessment) {
    notFound()
  }

  if (!organization?.id) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          Impossible de convertir le bilan : aucune organisation active n’est disponible.
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          Impossible de convertir le bilan : aucun utilisateur clinique actif n’est disponible.
        </div>
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour au bilan expressionnel
        </Link>

        <p className="mt-3 text-sm text-slate-500">Conversion vers la prise en charge</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Convertir le bilan en suivi ATPE
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible de convertir le bilan.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <form action={convertAssessmentToCare} className="space-y-6 xl:col-span-2">
          <input type="hidden" name="patient_id" value={id} />
          <input type="hidden" name="assessment_id" value={assessmentId} />
          <input type="hidden" name="organization_id" value={organization.id} />
          <input type="hidden" name="clinician_id" value={user.id} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Paramètres de l’épisode thérapeutique
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Libellé de l’épisode
                </span>
                <input
                  type="text"
                  name="episode_label"
                  defaultValue="Prise en charge ATPE"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Date d’ouverture
                  </span>
                  <input
                    type="date"
                    name="opened_on"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Statut de l’épisode
                  </span>
                  <select
                    name="episode_status"
                    defaultValue="active"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="planned">Plannifié</option>
                    <option value="active">Actif</option>
                    <option value="paused">En pause</option>
                    <option value="closed">Clos</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Cadre thérapeutique
                </span>
                <textarea
                  name="therapeutic_frame"
                  rows={4}
                  defaultValue={safeAssessment.proposed_modalities || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Indication clinique
                </span>
                <textarea
                  name="clinical_indication"
                  rows={4}
                  defaultValue={safeAssessment.final_recommendation || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Résumé des objectifs
                </span>
                <textarea
                  name="objectives_summary"
                  rows={4}
                  defaultValue={safeAssessment.initial_objectives || ''}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Reprise des objectifs
            </h2>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                name="import_objectives"
                defaultChecked
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                Importer les objectifs initiaux du bilan dans les objectifs thérapeutiques du suivi
              </span>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="grid gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
              >
                Convertir en prise en charge
              </button>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </Link>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Données reprises
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Organisation :</span>{' '}
                {organization.id}
              </p>
              <p>
                <span className="font-medium text-slate-900">Clinicien :</span>{' '}
                {user.id}
              </p>
              <p>
                <span className="font-medium text-slate-900">Recommandation finale :</span>{' '}
                {safeAssessment.final_recommendation ? 'Présente' : 'Absente'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Modalités proposées :</span>{' '}
                {safeAssessment.proposed_modalities ? 'Présentes' : 'Absentes'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Objectifs du bilan :</span>{' '}
                {objectives?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
            <p className="font-medium">Résultat attendu</p>
            <p className="mt-2">
              Cette action crée un épisode thérapeutique, peut reprendre les objectifs initiaux,
              puis met le bilan en statut <strong>converted_to_care</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}