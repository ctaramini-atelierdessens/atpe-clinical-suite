import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function createObjective(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()

  if (!patientId || !assessmentId) {
    redirect('/patients')
  }

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const objectiveType = String(formData.get('objective_type') || '').trim() || 'initial'
  const status = String(formData.get('status') || '').trim() || 'active'
  const directionality = String(formData.get('directionality') || '').trim() || null
  const startDate = String(formData.get('start_date') || '').trim()

  const item1 = String(formData.get('item_1') || '').trim()
  const item2 = String(formData.get('item_2') || '').trim()
  const item3 = String(formData.get('item_3') || '').trim()
  const item4 = String(formData.get('item_4') || '').trim()

  if (!title) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/objectives?error=${encodeURIComponent(
        'Le titre de l’objectif est obligatoire.'
      )}`
    )
  }

  const supabase = await createClient()

  const { data: objective, error: objectiveError } = await supabase
    .from('therapeutic_objectives')
    .insert({
      patient_id: patientId,
      assessment_id: assessmentId,
      title,
      description: description || null,
      objective_type: objectiveType,
      status,
      directionality: directionality || null,
      start_date: startDate || null,
    })
    .select('id')
    .single()

  if (objectiveError || !objective?.id) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/objectives?error=${encodeURIComponent(
        objectiveError?.message || 'Impossible de créer l’objectif.'
      )}`
    )
  }

  const items = [item1, item2, item3, item4]
    .map((label, index) => ({
      label,
      item_order: index + 1,
    }))
    .filter((item) => item.label.length > 0)

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('objective_items').insert(
      items.map((item) => ({
        objective_id: objective.id,
        label: item.label,
        item_order: item.item_order,
        polarity: 'positive',
      }))
    )

    if (itemsError) {
      redirect(
        `/patients/${patientId}/expression-assessments/${assessmentId}/objectives?error=${encodeURIComponent(
          itemsError.message
        )}`
      )
    }
  }

  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}/objectives`)
  revalidatePath(`/patients/${patientId}/goals`)

  redirect(`/patients/${patientId}/expression-assessments/${assessmentId}/objectives`)
}

export default async function AssessmentObjectivesPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const supabase = await createClient()

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
        .select(`
          *,
          objective_items (
            id,
            label,
            item_order,
            polarity
          )
        `)
        .eq('patient_id', id)
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false }),
    ])

  if (!patient || !assessment) {
    notFound()
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

        <p className="mt-3 text-sm text-slate-500">Objectifs initiaux du bilan</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Objectifs thérapeutiques
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible d’enregistrer l’objectif.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <form action={createObjective} className="space-y-6 xl:col-span-2">
          <input type="hidden" name="patient_id" value={id} />
          <input type="hidden" name="assessment_id" value={assessmentId} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Nouvel objectif
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Titre de l’objectif
                </span>
                <input
                  type="text"
                  name="title"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Description clinique
                </span>
                <textarea
                  name="description"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Type</span>
                  <select
                    name="objective_type"
                    defaultValue="initial"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="initial">Initial</option>
                    <option value="global">Global</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="revised">Révisé</option>
                    <option value="other">Autre</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Statut</span>
                  <select
                    name="status"
                    defaultValue="active"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="active">Actif</option>
                    <option value="paused">En pause</option>
                    <option value="achieved">Atteint</option>
                    <option value="abandoned">Abandonné</option>
                    <option value="archived">Archivé</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Direction</span>
                  <select
                    name="directionality"
                    defaultValue=""
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Non renseignée</option>
                    <option value="increase">Augmenter</option>
                    <option value="decrease">Diminuer</option>
                    <option value="stabilize">Stabiliser</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Date de départ
                </span>
                <input
                  type="date"
                  name="start_date"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Items observables
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Ajoute idéalement 3 à 4 items concrets, observables et additionnables.
            </p>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Item 1</span>
                <input
                  type="text"
                  name="item_1"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Item 2</span>
                <input
                  type="text"
                  name="item_2"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Item 3</span>
                <input
                  type="text"
                  name="item_3"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Item 4</span>
                <input
                  type="text"
                  name="item_4"
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
                Enregistrer l’objectif
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
              Objectifs enregistrés
            </h2>

            <div className="mt-4 space-y-4">
              {!objectives?.length ? (
                <p className="text-sm text-slate-500">
                  Aucun objectif encore enregistré pour ce bilan.
                </p>
              ) : (
                objectives.map((objective: any) => (
                  <div
                    key={objective.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {objective.title}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {objective.status}
                      </span>
                    </div>

                    {objective.description ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {objective.description}
                      </p>
                    ) : null}

                    <div className="mt-3 space-y-2">
                      {(objective.objective_items || [])
                        .sort((a: any, b: any) => a.item_order - b.item_order)
                        .map((item: any) => (
                          <div
                            key={item.id}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                          >
                            {item.item_order}. {item.label}
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}