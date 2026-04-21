import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExpressionAssessmentDashboard } from '@/components/expression-assessment-dashboard'
import { ExpressionAssessmentTimeline } from '@/components/expression-assessment-timeline'
import { ExpressionAssessmentClinicalAnalysis } from '@/components/expression-assessment-clinical-analysis'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string }>
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
      return "Séances d'essai"
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

export default async function ExpressionAssessmentDetailPage({ params }: PageProps) {
  const { id, assessmentId } = await params
  const supabase = await createClient()

  const [
    { data: patient },
    { data: assessment },
    { data: interviews },
    { data: sessions },
    { data: objectives },
    { count: discoveryObservationsCount },
    { count: musicResponsesCount },
    { count: generalObservationsCount },
    { data: latestGeneralObservation },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('expression_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('patient_id', id)
      .maybeSingle(),
    supabase
      .from('expression_assessment_interviews')
      .select('id, interview_type, interview_date, duration_minutes, created_at')
      .eq('assessment_id', assessmentId)
      .order('interview_date', { ascending: true }),
    supabase
      .from('expression_assessment_sessions')
      .select('id, session_type, session_date, duration_minutes, session_number, created_at')
      .eq('assessment_id', assessmentId)
      .order('session_number', { ascending: true, nullsFirst: false })
      .order('session_date', { ascending: true }),
    supabase
      .from('therapeutic_objectives')
      .select('id')
      .eq('patient_id', id)
      .eq('assessment_id', assessmentId),
    supabase
      .from('discovery_media_observations')
      .select('id', { count: 'exact', head: true })
      .in(
        'assessment_session_id',
        ((sessions ?? []) as any[]).map((s: any) => s.id).length
          ? ((sessions ?? []) as any[]).map((s: any) => s.id)
          : ['00000000-0000-0000-0000-000000000000']
      ),
    supabase
      .from('music_receptivity_responses')
      .select('id', { count: 'exact', head: true })
      .in(
        'assessment_session_id',
        ((sessions ?? []) as any[]).map((s: any) => s.id).length
          ? ((sessions ?? []) as any[]).map((s: any) => s.id)
          : ['00000000-0000-0000-0000-000000000000']
      ),
    supabase
      .from('general_observations')
      .select('id', { count: 'exact', head: true })
      .in(
        'assessment_session_id',
        ((sessions ?? []) as any[]).map((s: any) => s.id).length
          ? ((sessions ?? []) as any[]).map((s: any) => s.id)
          : ['00000000-0000-0000-0000-000000000000']
      ),
    supabase
      .from('general_observations')
      .select(
        'arrival_attitude, during_session_attitude, end_session_attitude, relation_to_therapist, relation_to_group, communication_quality, verbalization_level, free_notes'
      )
      .in(
        'assessment_session_id',
        ((sessions ?? []) as any[]).map((s: any) => s.id).length
          ? ((sessions ?? []) as any[]).map((s: any) => s.id)
          : ['00000000-0000-0000-0000-000000000000']
      )
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!assessment) {
    notFound()
  }

  const safePatient = patient as any
  const safeAssessment = assessment as any

  const patientName =
    safePatient?.code ||
    safePatient?.initials ||
    safePatient?.display_name ||
    safePatient?.last_name ||
    safePatient?.first_name ||
    'Patient'

  return (
    <div className="space-y-6">
      <ExpressionAssessmentDashboard
        assessment={safeAssessment}
        interviewsCount={interviews?.length ?? 0}
        sessionsCount={sessions?.length ?? 0}
        objectivesCount={objectives?.length ?? 0}
      />

      <ExpressionAssessmentClinicalAnalysis
        assessment={safeAssessment}
        interviews={(interviews ?? []) as any}
        sessions={(sessions ?? []) as any}
        objectivesCount={objectives?.length ?? 0}
        discoveryObservationsCount={discoveryObservationsCount ?? 0}
        musicResponsesCount={musicResponsesCount ?? 0}
        generalObservationsCount={generalObservationsCount ?? 0}
        latestGeneralObservation={(latestGeneralObservation as any) || null}
      />

      <ExpressionAssessmentTimeline
        assessment={safeAssessment}
        interviews={(interviews ?? []) as any}
        sessions={(sessions ?? []) as any}
      />

      <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-cyan-900">
              Comparatif bilan → suivi ATPE
            </h2>
            <p className="mt-2 text-sm text-cyan-800">
              Vérifie la continuité clinique entre ce bilan expressionnel et la prise en charge engagée.
            </p>
          </div>

          <Link
            href={`/patients/${id}/expression-assessments/${assessmentId}/compare`}
            className="rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-800"
          >
            Ouvrir le comparatif
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-sky-900">
              Comparatif clinique intelligent
            </h2>
            <p className="mt-2 text-sm text-sky-800">
              Analyse automatiquement l’alignement entre le bilan, les objectifs réellement repris et l’évolution des séances ATPE.
            </p>
          </div>

          <Link
            href={`/patients/${id}/expression-assessments/${assessmentId}/smart-compare`}
            className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-medium text-white hover:bg-sky-800"
          >
            Ouvrir le comparatif intelligent
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/patients/${id}/expression-assessments`}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                ← Retour aux bilans expressionnels
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500">Bilan expressionnel</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {patientName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Statut actuel : {labelStatus(safeAssessment.status)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/patients/${id}/expression-assessments/${assessmentId}/convert`}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
            >
              Convertir en prise en charge
            </Link>

            <Link
              href={`/patients/${id}/expression-assessments/${assessmentId}/pdf`}
              target="_blank"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Export PDF
            </Link>

            <Link
              href={`/patients/${id}/expression-assessments/${assessmentId}/edit`}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Modifier le bilan
            </Link>

            <Link
              href={`/patients/${id}/expression-assessments/${assessmentId}/interviews/new`}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Ajouter un entretien
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">
              Objectifs initiaux du bilan
            </h2>
            <p className="mt-2 text-sm text-indigo-800">
              {objectives?.length ?? 0} objectif(s) enregistré(s) pour ce bilan.
            </p>
          </div>

          <Link
            href={`/patients/${id}/expression-assessments/${assessmentId}/objectives`}
            className="rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-800"
          >
            Ouvrir les objectifs
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-amber-900">
              Synthèse finale et recommandation clinique
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              {safeAssessment.final_recommendation
                ? 'Une recommandation finale est déjà renseignée.'
                : 'Aucune recommandation finale encore saisie.'}
            </p>
          </div>

          <Link
            href={`/patients/${id}/expression-assessments/${assessmentId}/summary`}
            className="rounded-2xl bg-amber-700 px-4 py-3 text-sm font-medium text-white hover:bg-amber-800"
          >
            Ouvrir la synthèse finale
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Vue d’ensemble</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Demande
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Date :</span>{' '}
                    {safeAssessment.request_date || 'Non renseignée'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Demandeur :</span>{' '}
                    {safeAssessment.requested_by || 'Non renseigné'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Type :</span>{' '}
                    {safeAssessment.request_type || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Parcours du bilan
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Entretiens :</span>{' '}
                    {interviews?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Séances BE :</span>{' '}
                    {sessions?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Séances d'essai :</span>{' '}
                    {safeAssessment.trial_sessions_required
                      ? `${safeAssessment.trial_sessions_count ?? 0} prévues`
                      : 'Non prévues'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Connaissance préalable
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeAssessment.prior_knowledge_summary || 'Aucun résumé encore saisi.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Objectifs initiaux
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeAssessment.initial_objectives || 'Aucun objectif initial encore saisi.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Modalités proposées
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeAssessment.proposed_modalities || 'Aucune modalité encore saisie.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Entretiens</h2>
              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/interviews/new`}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Ajouter
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {!interviews?.length ? (
                <p className="text-sm text-slate-500">Aucun entretien enregistré.</p>
              ) : (
                interviews.map((interview: any) => (
                  <div
                    key={interview.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {interview.interview_type}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {interview.interview_date || 'Date non renseignée'}
                          {interview.duration_minutes
                            ? ` · ${interview.duration_minutes} min`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Séances du bilan</h2>
              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/new`}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Ajouter
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {!sessions?.length ? (
                <p className="text-sm text-slate-500">Aucune séance enregistrée.</p>
              ) : (
                sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {session.session_type}
                          {session.session_number ? ` · n°${session.session_number}` : ''}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {session.session_date || 'Date non renseignée'}
                          {session.duration_minutes
                            ? ` · ${session.duration_minutes} min`
                            : ''}
                        </p>
                      </div>

                      <Link
                        href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${session.id}`}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        Ouvrir
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Recommandations</h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pré-recommandation
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeAssessment.initial_recommendation || 'Non renseignée'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommandation finale
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeAssessment.final_recommendation || 'Non renseignée'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2>

            <div className="mt-4 grid gap-3">
              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/interviews/new?type=primo`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Nouveau primo-entretien
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/new?type=discovery`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Nouvelle séance découverte
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/new?type=music_receptivity`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Nouvelle réceptivité musicale
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/interviews/new?type=final`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Nouvel entretien final
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/objectives`}
                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-100"
              >
                Ouvrir les objectifs initiaux
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/summary`}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 hover:bg-amber-100"
              >
                Ouvrir la synthèse finale
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}