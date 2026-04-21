import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string }>
}

function labelStatus(status: string) {
  switch (status) {
    case 'draft':
      return 'Brouillon'
    case 'intake_started':
      return 'Entame du bilan'
    case 'discovery_in_progress':
      return 'Découverte en cours'
    case 'final_interview_done':
      return 'Entretien final réalisé'
    case 'trial_sessions':
      return 'Séances d’essai'
    case 'recommended':
      return 'Recommandé'
    case 'deferred':
      return 'Différé'
    case 'refused':
      return 'Refusé'
    case 'converted_to_care':
      return 'Converti en prise en charge'
    default:
      return status
  }
}

function labelRequestType(type: string | null) {
  switch (type) {
    case 'individual':
      return 'Individuel'
    case 'group':
      return 'Groupe'
    case 'mixed':
      return 'Mixte'
    case 'undetermined':
      return 'À déterminer'
    default:
      return type || 'Non renseigné'
  }
}

export default async function PatientExpressionAssessmentsPage({
  params,
}: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: patient, error: patientError }, { data: assessments, error }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),

      supabase
        .from('expression_assessments')
        .select(`
          id,
          created_at,
          request_date,
          requested_by,
          request_type,
          status,
          initial_recommendation,
          final_recommendation,
          initial_objectives,
          proposed_modalities,
          trial_sessions_required,
          trial_sessions_count
        `)
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ])

  if (patientError || !patient) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Impossible de charger le patient.
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Erreur lors du chargement des bilans expressionnels.</p>
          <p className="mt-2 text-sm">{error.message}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Cause probable</p>
          <p className="mt-2">
            La table <code>expression_assessments</code> n’existe peut-être pas encore dans
            Supabase, ou le schéma n’a pas encore été appliqué.
          </p>
        </div>
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/patients/${id}`}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Retour à la fiche patient
            </Link>

            <p className="mt-3 text-sm text-slate-500">Module préalable ATPE</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Bilans expressionnels
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Patient : {patientLabel}
            </p>
          </div>

          <Link
            href={`/patients/${id}/expression-assessments/new`}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Nouveau bilan expressionnel
          </Link>
        </div>
      </div>

      {!assessments?.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Aucun bilan expressionnel n’est encore enregistré pour ce patient.
          </p>

          <div className="mt-4">
            <Link
              href={`/patients/${id}/expression-assessments/new`}
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Créer le premier bilan expressionnel
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/patients/${id}/expression-assessments/${assessment.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bilan expressionnel
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {assessment.request_date
                        ? `Demande du ${assessment.request_date}`
                        : 'Demande sans date renseignée'}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      Statut : {labelStatus(assessment.status)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      Type : {labelRequestType(assessment.request_type)}
                    </span>

                    {assessment.requested_by ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Demandeur : {assessment.requested_by}
                      </span>
                    ) : null}
                  </div>

                  {assessment.final_recommendation ? (
                    <p className="max-w-3xl text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        Recommandation finale :
                      </span>{' '}
                      {assessment.final_recommendation}
                    </p>
                  ) : assessment.initial_recommendation ? (
                    <p className="max-w-3xl text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        Pré-recommandation :
                      </span>{' '}
                      {assessment.initial_recommendation}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Aucune recommandation encore renseignée.
                    </p>
                  )}
                </div>

                <div className="min-w-[220px] rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cadre proposé
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-900">Essais :</span>{' '}
                      {assessment.trial_sessions_required
                        ? `oui (${assessment.trial_sessions_count})`
                        : 'non'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Objectifs :</span>{' '}
                      {assessment.initial_objectives ? 'renseignés' : 'non renseignés'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Modalités :</span>{' '}
                      {assessment.proposed_modalities ? 'renseignées' : 'non renseignées'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}