import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string; sessionId: string }>
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
      return type
  }
}

export default async function AssessmentSessionDetailPage({ params }: PageProps) {
  const { id, assessmentId, sessionId } = await params
  const supabase = await createClient()

  const [
    { data: patient },
    { data: session },
    { data: discoveryCount },
    { data: musicCount },
    { data: generalObservation },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('expression_assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('assessment_id', assessmentId)
      .eq('patient_id', id)
      .maybeSingle(),
    supabase
      .from('discovery_media_observations')
      .select('id', { count: 'exact', head: true })
      .eq('assessment_session_id', sessionId),
    supabase
      .from('music_receptivity_responses')
      .select('id', { count: 'exact', head: true })
      .eq('assessment_session_id', sessionId),
    supabase
      .from('general_observations')
      .select('id')
      .eq('assessment_session_id', sessionId)
      .eq('patient_id', id)
      .maybeSingle(),
  ])

  if (!session) {
    notFound()
  }

  const safePatient = patient as any
  const safeSession = session as any

  const patientLabel =
    safePatient?.code ||
    safePatient?.initials ||
    safePatient?.display_name ||
    safePatient?.last_name ||
    safePatient?.first_name ||
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

        <p className="mt-3 text-sm text-slate-500">Séance du bilan expressionnel</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {sessionTypeLabel(safeSession.session_type)}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Informations générales
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {sessionTypeLabel(safeSession.session_type)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeSession.session_date || 'Non renseignée'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Durée
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {safeSession.duration_minutes
                    ? `${safeSession.duration_minutes} min`
                    : 'Non renseignée'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Numéro de séance
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {safeSession.session_number || 'Non renseigné'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Cadre et déroulé
            </h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes de contexte
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {safeSession.context_notes || 'Non renseigné'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Synthèse clinique
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {safeSession.clinical_summary || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6">
            <h2 className="text-lg font-semibold text-violet-900">
              Observation générale
            </h2>
            <p className="mt-2 text-sm text-violet-800">
              {generalObservation?.id
                ? 'Une fiche d’observation générale a déjà été enregistrée.'
                : 'Aucune fiche d’observation générale enregistrée pour cette séance.'}
            </p>

            <div className="mt-4">
              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}/observation`}
                className="inline-flex rounded-2xl bg-violet-700 px-4 py-3 text-sm font-medium text-white hover:bg-violet-800"
              >
                Ouvrir la fiche d’observation
              </Link>
            </div>
          </div>

          {safeSession.session_type === 'discovery' ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-lg font-semibold text-emerald-900">
                Grille découverte pluriexpressionnelle
              </h2>
              <p className="mt-2 text-sm text-emerald-800">
                {discoveryCount?.count ?? 0} observation(s) média enregistrée(s).
              </p>

              <div className="mt-4">
                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}/discovery`}
                  className="inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Ouvrir la grille découverte
                </Link>
              </div>
            </div>
          ) : null}

          {safeSession.session_type === 'music_receptivity' ? (
            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
              <h2 className="text-lg font-semibold text-sky-900">
                Grille de réceptivité musicale
              </h2>
              <p className="mt-2 text-sm text-sky-800">
                {musicCount?.count ?? 0} réponse(s) enregistrée(s).
              </p>

              <div className="mt-4">
                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}/music-receptivity`}
                  className="inline-flex rounded-2xl bg-sky-700 px-4 py-3 text-sm font-medium text-white hover:bg-sky-800"
                >
                  Ouvrir la grille réceptivité musicale
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="grid gap-3">
              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Retour au bilan
              </Link>

              <Link
                href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/new?type=${safeSession.session_type}`}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-700"
              >
                Ajouter une autre séance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}