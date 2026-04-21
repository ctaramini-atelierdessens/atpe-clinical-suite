import { computeAtpeExpertResult } from '@/lib/atpe/expert-engine'
import { mapSessionToExpertInput } from '@/lib/atpe/map-session-to-expert-input'

export type AtpeExpertCompatibleSession = {
  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  patient_engagement_level: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
  created_at?: string | null
}

export type ClinicalLevel =
  | 'very_fragile'
  | 'fragile'
  | 'intermediate'
  | 'good'
  | 'very_good'

export type RiskFlag =
  | 'critical'
  | 'high'
  | 'moderate'
  | 'low'

export type TrajectoryTrend =
  | 'improving'
  | 'stable'
  | 'declining'

export type ClinicalLevelResult = {
  level: ClinicalLevel
  score: number
  label: string
  rationale: string
}

export type RiskFlagResult = {
  flag: RiskFlag
  score: number
  label: string
  rationale: string
}

export type TrajectoryTrendResult = {
  trend: TrajectoryTrend
  delta: number
  startScore: number
  endScore: number
  label: string
  rationale: string
}

function n(value: number | null | undefined): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

function b(value: boolean | null | undefined): boolean {
  return value === true
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getExpert(session: AtpeExpertCompatibleSession) {
  return computeAtpeExpertResult(mapSessionToExpertInput(session))
}

export function computeClinicalGlobalScore(
  session: AtpeExpertCompatibleSession
): number {
  const frame = n(session.frame_containment)
  const centering = n(session.centering_level)
  const relational = n(session.relational_availability)
  const engagement = n(session.patient_engagement_level)
  const presence = n(session.therapist_presence_quality)
  const secondary = n(session.secondary_symbolization)
  const dialogue = n(session.work_dialogue_level)
  const projective = n(session.projective_intensity)

  const raw =
    frame * 0.22 +
    centering * 0.18 +
    relational * 0.16 +
    engagement * 0.16 +
    presence * 0.1 +
    secondary * 0.08 +
    dialogue * 0.06 +
    Math.max(0, 100 - projective) * 0.04

  return clamp(raw)
}

export function getClinicalLevel(
  session: AtpeExpertCompatibleSession
): ClinicalLevelResult {
  const expert = getExpert(session)
  const globalScore = computeClinicalGlobalScore(session)

  let level: ClinicalLevel
  let label: string

  if (globalScore >= 85) {
    level = 'very_good'
    label = 'Très bon niveau clinique'
  } else if (globalScore >= 70) {
    level = 'good'
    label = 'Bon niveau clinique'
  } else if (globalScore >= 55) {
    level = 'intermediate'
    label = 'Niveau clinique intermédiaire'
  } else if (globalScore >= 40) {
    level = 'fragile'
    label = 'Niveau clinique fragile'
  } else {
    level = 'very_fragile'
    label = 'Niveau clinique très fragile'
  }

  const rationale =
    expert.clinical_stability === 'stable'
      ? 'Le niveau clinique est soutenu par une contenance, une régulation et une disponibilité relationnelle suffisamment consolidées.'
      : expert.clinical_stability === 'intermediate'
        ? 'Le niveau clinique reste utilisable mais encore inégal, avec besoin de soutien du cadre et de prudence dans les relances.'
        : 'Le niveau clinique reste fragile et demande une priorité donnée à la sécurité du cadre, au ralentissement et à la réduction de la complexité.'

  return {
    level,
    score: globalScore,
    label,
    rationale,
  }
}

export function getRiskFlag(
  session: AtpeExpertCompatibleSession
): RiskFlagResult {
  const expert = getExpert(session)

  const ctLoad =
    (b(session.therapist_feels_confusion) ? 10 : 0) +
    (b(session.therapist_feels_sudden_fatigue) ? 10 : 0) +
    (b(session.therapist_feels_pressure) ? 10 : 0) +
    (b(session.therapist_feels_irritation) ? 10 : 0) +
    (b(session.therapist_feels_void) ? 10 : 0) +
    (b(session.patient_repeats_without_integration) ? 12 : 0) +
    (b(session.group_feels_same_affect) ? 8 : 0) +
    (b(session.tension_spreads_quickly) ? 15 : 0)

  const projective = n(session.projective_intensity)
  const frameWeakness = Math.max(0, 60 - n(session.frame_containment))
  const engagementWeakness = Math.max(0, 50 - n(session.patient_engagement_level))

  const riskScore = clamp(
    projective * 0.45 +
      ctLoad * 1.2 +
      frameWeakness * 0.8 +
      engagementWeakness * 0.4 +
      (expert.vigilance_level === 'high'
        ? 15
        : expert.vigilance_level === 'moderate'
          ? 7
          : 0)
  )

  let flag: RiskFlag
  let label: string

  if (riskScore >= 75) {
    flag = 'critical'
    label = 'Risque critique'
  } else if (riskScore >= 55) {
    flag = 'high'
    label = 'Risque élevé'
  } else if (riskScore >= 30) {
    flag = 'moderate'
    label = 'Risque modéré'
  } else {
    flag = 'low'
    label = 'Risque faible'
  }

  let rationale =
    'Aucun indicateur majeur de désorganisation immédiate n’est repéré.'

  if (flag === 'critical') {
    rationale =
      'Le niveau de risque impose une réduction immédiate de la complexité, un renforcement de la contenance et une surveillance clinique rapprochée.'
  } else if (flag === 'high') {
    rationale =
      'Plusieurs indicateurs convergent vers un risque clinique important : intensité projective, charge contre-transférentielle ou fragilité du cadre.'
  } else if (flag === 'moderate') {
    rationale =
      'Des signaux de vigilance sont présents, sans rupture majeure, mais demandent prudence, rythme lent et limitation des sollicitations.'
  }

  return {
    flag,
    score: riskScore,
    label,
    rationale,
  }
}

export function getTrajectoryTrend(
  sessions: AtpeExpertCompatibleSession[] | null | undefined
): TrajectoryTrendResult {
  const safeSessions = Array.isArray(sessions) ? sessions : []

  if (safeSessions.length === 0) {
    return {
      trend: 'stable',
      delta: 0,
      startScore: 0,
      endScore: 0,
      label: 'Stabilité',
      rationale: 'Aucune séance disponible pour analyser la trajectoire.',
    }
  }

  const chronological = [...safeSessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })

  const startScore = computeClinicalGlobalScore(chronological[0])
  const endScore = computeClinicalGlobalScore(
    chronological[chronological.length - 1]
  )
  const delta = endScore - startScore

  let trend: TrajectoryTrend
  let label: string
  let rationale: string

  if (delta >= 8) {
    trend = 'improving'
    label = 'Progression'
    rationale =
      'La trajectoire montre une amélioration globale des capacités de contenance, d’engagement et de régulation.'
  } else if (delta <= -8) {
    trend = 'declining'
    label = 'Fragilisation'
    rationale =
      'La trajectoire montre une baisse globale des capacités cliniques et appelle une réévaluation du cadre ou des médiations.'
  } else {
    trend = 'stable'
    label = 'Stabilité'
    rationale =
      'La trajectoire reste globalement stable, sans progression marquée ni dégradation significative.'
  }

  return {
    trend,
    delta,
    startScore,
    endScore,
    label,
    rationale,
  }
}

export function clinicalLevelClass(level: ClinicalLevel): string {
  switch (level) {
    case 'very_good':
      return 'bg-green-100 text-green-700'
    case 'good':
      return 'bg-emerald-100 text-emerald-700'
    case 'intermediate':
      return 'bg-amber-100 text-amber-700'
    case 'fragile':
      return 'bg-orange-100 text-orange-700'
    case 'very_fragile':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function riskFlagClass(flag: RiskFlag): string {
  switch (flag) {
    case 'low':
      return 'bg-green-100 text-green-700'
    case 'moderate':
      return 'bg-amber-100 text-amber-700'
    case 'high':
      return 'bg-orange-100 text-orange-700'
    case 'critical':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function trajectoryTrendClass(trend: TrajectoryTrend): string {
  switch (trend) {
    case 'improving':
      return 'bg-green-100 text-green-700'
    case 'stable':
      return 'bg-slate-100 text-slate-700'
    case 'declining':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}