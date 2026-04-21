'use client'

import { useMemo } from 'react'

type AssessmentLike = {
  status?: string | null
  request_date?: string | null
  requested_by?: string | null
  request_type?: string | null
  prior_knowledge_summary?: string | null
  initial_recommendation?: string | null
  final_recommendation?: string | null
  initial_objectives?: string | null
  proposed_modalities?: string | null
  trial_sessions_required?: boolean | null
  trial_sessions_count?: number | null
  closed_at?: string | null
}

type InterviewLike = {
  id: string
  interview_type?: string | null
  reason_for_consultation?: string | null
  expectations?: string | null
  artistic_interests?: string | null
  artistic_practice?: string | null
  clinical_observations?: string | null
}

type SessionLike = {
  id: string
  session_type?: string | null
  session_number?: number | null
  clinical_summary?: string | null
  context_notes?: string | null
}

type GeneralObservationLike = {
  arrival_attitude?: string | null
  during_session_attitude?: string | null
  end_session_attitude?: string | null
  relation_to_therapist?: string | null
  relation_to_group?: string | null
  communication_quality?: string | null
  verbalization_level?: string | null
  media_used?: string | null
  response_to_production?: string | null
  free_notes?: string | null
}

type Props = {
  patientLabel: string
  assessment: AssessmentLike
  interviews: InterviewLike[]
  sessions: SessionLike[]
  objectivesCount: number
  discoveryObservationsCount: number
  musicResponsesCount: number
  generalObservationsCount: number
  latestGeneralObservation?: GeneralObservationLike | null
}

function normalizeText(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function includesAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word))
}

function uniqueLines(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))]
}

function buildProfileText(args: {
  interviews: InterviewLike[]
  sessions: SessionLike[]
  discoveryCount: number
  musicCount: number
  latestObservation?: GeneralObservationLike | null
}) {
  const observationText = normalizeText(
    [
      args.latestObservation?.arrival_attitude,
      args.latestObservation?.during_session_attitude,
      args.latestObservation?.end_session_attitude,
      args.latestObservation?.relation_to_therapist,
      args.latestObservation?.relation_to_group,
      args.latestObservation?.free_notes,
    ]
      .filter(Boolean)
      .join(' ')
  )

  if (
    args.discoveryCount > 0 &&
    args.musicCount > 0 &&
    args.sessions.length >= 2
  ) {
    return "Le bilan met en évidence un profil capable d'investir plusieurs médiations, avec des points d'appui différenciés sur les versants sensoriels, expressifs et relationnels."
  }

  if (
    args.latestObservation?.verbalization_level === 'little' ||
    args.latestObservation?.communication_quality === 'altered'
  ) {
    return "Le profil repéré semble privilégier des voies d'accès indirectes, médiatisées et peu centrées sur l'élaboration verbale spontanée."
  }

  if (
    includesAny(observationText, ['retrait', 'reserve', 'evit', 'distance'])
  ) {
    return "Le fonctionnement observé suggère un profil marqué par la réserve, nécessitant un cadre suffisamment contenant pour soutenir l'engagement progressif."
  }

  return "Le profil clinique apparaît en structuration, avec des éléments suffisamment repérables pour orienter la suite du travail thérapeutique."
}

function buildSupportFactors(args: {
  assessment: AssessmentLike
  interviews: InterviewLike[]
  discoveryCount: number
  musicCount: number
  objectivesCount: number
  latestObservation?: GeneralObservationLike | null
}) {
  const factors: string[] = []

  if (args.interviews.length >= 2) {
    factors.push("La pluralité des entretiens permet une base de compréhension clinique plus nuancée.")
  }

  if (args.discoveryCount > 0) {
    factors.push("Les séances de découverte pluriexpressionnelle ont permis d'identifier des médiations potentiellement investissables.")
  }

  if (args.musicCount > 0) {
    factors.push("La réceptivité musicale constitue un appui possible pour l'accès émotionnel, associatif ou sensoriel.")
  }

  if (args.objectivesCount > 0) {
    factors.push("Les objectifs initiaux du bilan offrent déjà des repères opératoires pour structurer le suivi.")
  }

  if (args.latestObservation?.relation_to_therapist) {
    factors.push("La relation au thérapeute a été suffisamment repérée pour soutenir l'ajustement du cadre.")
  }

  if (args.assessment.final_recommendation) {
    factors.push("La recommandation finale du bilan est déjà formulée, ce qui clarifie l'indication thérapeutique.")
  }

  return uniqueLines(factors).slice(0, 6)
}

function buildVigilanceFactors(args: {
  assessment: AssessmentLike
  sessionsCount: number
  generalObservationsCount: number
  latestObservation?: GeneralObservationLike | null
}) {
  const points: string[] = []

  const observationText = normalizeText(
    [
      args.latestObservation?.arrival_attitude,
      args.latestObservation?.during_session_attitude,
      args.latestObservation?.end_session_attitude,
      args.latestObservation?.relation_to_therapist,
      args.latestObservation?.relation_to_group,
      args.latestObservation?.free_notes,
      args.latestObservation?.response_to_production,
    ]
      .filter(Boolean)
      .join(' ')
  )

  if (
    args.latestObservation?.communication_quality === 'altered' ||
    args.latestObservation?.verbalization_level === 'little'
  ) {
    points.push("L'accès verbal paraît fragile ou limité, ce qui invite à privilégier un travail indirect par médiation.")
  }

  if (
    includesAny(observationText, [
      'angoiss',
      'retrait',
      'evit',
      'opposition',
      'agitation',
      'fatigue',
      'refus',
    ])
  ) {
    points.push("Des mouvements de retrait, de surcharge ou d'évitement restent à surveiller dans la mise en place du cadre.")
  }

  if (args.sessionsCount < 2) {
    points.push("Le nombre de séances exploratoires reste limité pour stabiliser certains repérages cliniques.")
  }

  if (args.generalObservationsCount === 0) {
    points.push("L'absence d'observation générale structurée réduit la finesse de certaines inférences cliniques.")
  }

  if (!args.assessment.final_recommendation) {
    points.push("La recommandation finale n'est pas encore pleinement consolidée dans le dossier.")
  }

  return uniqueLines(points).slice(0, 6)
}

function buildTherapeuticIndication(args: {
  assessment: AssessmentLike
  sessionsCount: number
  objectivesCount: number
  discoveryCount: number
  musicCount: number
}) {
  if (args.assessment.status === 'converted_to_care') {
    return "L'indication ATPE apparaît confirmée, le bilan ayant déjà débouché sur une conversion vers la prise en charge."
  }

  if (
    args.assessment.final_recommendation &&
    args.sessionsCount >= 2 &&
    args.objectivesCount >= 1
  ) {
    return "L'indication ATPE apparaît argumentée par la convergence entre les éléments recueillis en entretien, les observations de séance et les objectifs déjà formulés."
  }

  if (args.discoveryCount > 0 || args.musicCount > 0) {
    return "L'indication ATPE paraît probable, les médiations explorées ayant déjà montré un intérêt clinique, tout en demandant encore confirmation."
  }

  return "L'indication thérapeutique reste prudente à ce stade et gagnerait à être consolidée par des éléments cliniques complémentaires."
}

function buildNarrativeReport(args: Props) {
  const profileText = buildProfileText({
    interviews: args.interviews,
    sessions: args.sessions,
    discoveryCount: args.discoveryObservationsCount,
    musicCount: args.musicResponsesCount,
    latestObservation: args.latestGeneralObservation,
  })

  const supportFactors = buildSupportFactors({
    assessment: args.assessment,
    interviews: args.interviews,
    discoveryCount: args.discoveryObservationsCount,
    musicCount: args.musicResponsesCount,
    objectivesCount: args.objectivesCount,
    latestObservation: args.latestGeneralObservation,
  })

  const vigilanceFactors = buildVigilanceFactors({
    assessment: args.assessment,
    sessionsCount: args.sessions.length,
    generalObservationsCount: args.generalObservationsCount,
    latestObservation: args.latestGeneralObservation,
  })

  const indication = buildTherapeuticIndication({
    assessment: args.assessment,
    sessionsCount: args.sessions.length,
    objectivesCount: args.objectivesCount,
    discoveryCount: args.discoveryObservationsCount,
    musicCount: args.musicResponsesCount,
  })

  const intro = `Le bilan expressionnel de ${args.patientLabel} s'inscrit dans une demande ${
    args.assessment.request_type ? `de type ${args.assessment.request_type}` : 'clinique'
  } ${
    args.assessment.requested_by
      ? `adressée par ${args.assessment.requested_by}`
      : ''
  }. Il comprend ${args.interviews.length} entretien(s) et ${args.sessions.length} séance(s) d'exploration clinique.`

  const mediations = `Les médiations explorées comprennent ${
    args.discoveryObservationsCount > 0
      ? `la découverte pluriexpressionnelle (${args.discoveryObservationsCount} observation(s))`
      : 'pas de découverte pluriexpressionnelle documentée'
  }${
    args.musicResponsesCount > 0
      ? ` ainsi que la réceptivité musicale (${args.musicResponsesCount} réponse(s))`
      : ''
  }.`

  const observationLayer =
    args.generalObservationsCount > 0
      ? "L'observation générale structurée permet d'affiner la lecture du rapport au cadre, au thérapeute, à la parole et à la production."
      : "La couche d'observation générale reste peu documentée, ce qui limite partiellement la finesse descriptive du rapport."

  const objectivesLayer =
    args.objectivesCount > 0
      ? `Le bilan a permis de dégager ${args.objectivesCount} objectif(s) thérapeutique(s) initial(aux), offrant déjà une base de travail pour la suite du suivi.`
      : "Les objectifs thérapeutiques initiaux restent encore peu structurés dans le dossier."

  const conclusion = args.assessment.final_recommendation
    ? `Au total, ce bilan permet de soutenir la conclusion suivante : ${args.assessment.final_recommendation}`
    : "Au total, le bilan permet déjà plusieurs repérages utiles, tout en appelant encore une consolidation de la formulation conclusive."

  return {
    intro,
    profileText,
    mediations,
    observationLayer,
    objectivesLayer,
    supportFactors,
    vigilanceFactors,
    indication,
    conclusion,
  }
}

export function ExpressionAssessmentExpertReport(props: Props) {
  const report = useMemo(() => buildNarrativeReport(props), [props])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Rapport narratif expert</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Rapport expert automatique
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
          Synthèse rédigée
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Synthèse narrative
          </div>

          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <p>{report.intro}</p>
            <p>{report.profileText}</p>
            <p>{report.mediations}</p>
            <p>{report.observationLayer}</p>
            <p>{report.objectivesLayer}</p>
            <p>{report.indication}</p>
            <p>{report.conclusion}</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Facteurs d'appui
            </div>
            <div className="mt-3 space-y-2">
              {!report.supportFactors.length ? (
                <p className="text-sm text-slate-500">
                  Aucun facteur d'appui automatique majeur n'est isolé.
                </p>
              ) : (
                report.supportFactors.map((item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Facteurs de vigilance
            </div>
            <div className="mt-3 space-y-2">
              {!report.vigilanceFactors.length ? (
                <p className="text-sm text-slate-500">
                  Aucun facteur de vigilance automatique majeur n'est isolé.
                </p>
              ) : (
                report.vigilanceFactors.map((item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {item}
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