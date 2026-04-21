'use client'

import { useMemo } from 'react'

type DashboardProps = {
  assessment: {
    id: string
    status?: string | null
    request_date?: string | null
    initial_recommendation?: string | null
    final_recommendation?: string | null
    initial_objectives?: string | null
    proposed_modalities?: string | null
    closed_at?: string | null
    trial_sessions_required?: boolean | null
    trial_sessions_count?: number | null
  }
  interviewsCount: number
  sessionsCount: number
  objectivesCount: number
}

function labelStatus(status?: string | null) {
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
      return status || 'Non renseigné'
  }
}

function getProgressScore(args: {
  interviewsCount: number
  sessionsCount: number
  objectivesCount: number
  finalRecommendation?: string | null
  proposedModalities?: string | null
  closedAt?: string | null
}) {
  let score = 0

  if (args.interviewsCount > 0) score += 20
  if (args.sessionsCount > 0) score += 25
  if (args.objectivesCount > 0) score += 20
  if (args.finalRecommendation) score += 20
  if (args.proposedModalities) score += 10
  if (args.closedAt) score += 5

  return Math.min(score, 100)
}

function getClinicalStatus(args: {
  status?: string | null
  progressScore: number
  finalRecommendation?: string | null
  objectivesCount: number
  sessionsCount: number
}) {
  if (args.status === 'converted_to_care') {
    return {
      label: 'Bilan converti en prise en charge',
      description:
        'Le bilan a débouché sur une entrée effective dans le suivi thérapeutique.',
    }
  }

  if (args.status === 'recommended' && args.finalRecommendation) {
    return {
      label: 'Indication posée',
      description:
        'La recommandation clinique finale est formulée et le cadre thérapeutique paraît défini.',
    }
  }

  if (args.progressScore >= 70 && args.sessionsCount > 0 && args.objectivesCount > 0) {
    return {
      label: 'Bilan cliniquement avancé',
      description:
        'Les données recueillies permettent déjà une lecture clinique structurée et une orientation argumentée.',
    }
  }

  if (args.progressScore >= 40) {
    return {
      label: 'Bilan en structuration',
      description:
        'Le recueil clinique est engagé mais nécessite encore des compléments avant conclusion.',
    }
  }

  return {
    label: 'Bilan au stade initial',
    description:
      'Le bilan reste préliminaire et demande encore des entretiens, des séances ou une synthèse plus complète.',
  }
}

export function ExpressionAssessmentDashboard({
  assessment,
  interviewsCount,
  sessionsCount,
  objectivesCount,
}: DashboardProps) {
  const dashboard = useMemo(() => {
    const progressScore = getProgressScore({
      interviewsCount,
      sessionsCount,
      objectivesCount,
      finalRecommendation: assessment.final_recommendation,
      proposedModalities: assessment.proposed_modalities,
      closedAt: assessment.closed_at,
    })

    const clinicalStatus = getClinicalStatus({
      status: assessment.status,
      progressScore,
      finalRecommendation: assessment.final_recommendation,
      objectivesCount,
      sessionsCount,
    })

    const summaryReady = Boolean(
      assessment.final_recommendation ||
        assessment.proposed_modalities ||
        assessment.closed_at
    )

    return {
      progressScore,
      clinicalStatus,
      summaryReady,
      statusLabel: labelStatus(assessment.status),
      trialsPlanned: assessment.trial_sessions_required
        ? assessment.trial_sessions_count ?? 0
        : 0,
    }
  }, [assessment, interviewsCount, sessionsCount, objectivesCount])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Vue consolidée du bilan</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Dashboard bilan expressionnel
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
            Statut : {dashboard.statusLabel}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Statut clinique synthétique
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {dashboard.clinicalStatus.label}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {dashboard.clinicalStatus.description}
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Avancement
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {dashboard.progressScore}%
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Niveau global de complétude du bilan
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Entretiens
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {interviewsCount}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Entretiens enregistrés
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Séances
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {sessionsCount}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Séances du bilan enregistrées
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objectifs
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {objectivesCount}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Objectifs thérapeutiques initiaux
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Synthèse finale
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {dashboard.summaryReady ? 'Présente' : 'Absente'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recommandation finale
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {assessment.final_recommendation ? 'Renseignée' : 'Non renseignée'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Modalités proposées
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {assessment.proposed_modalities ? 'Renseignées' : 'Non renseignées'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Séances d’essai
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {assessment.trial_sessions_required
                ? `${dashboard.trialsPlanned} prévue(s)`
                : 'Non prévues'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}