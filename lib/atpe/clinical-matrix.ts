export type AtpeClinicalAxis =
  | 'relation'
  | 'soma'
  | 'projection'
  | 'symbolisation'
  | 'identite'
  | 'transformation'

export type AtpeClinicalLevel =
  | 'very_fragile'
  | 'fragile'
  | 'intermediate'
  | 'good'
  | 'very_good'

export type AtpeProgressState =
  | 'entry'
  | 'stabilization'
  | 'mobilisation'
  | 'symbolisation'
  | 'integration'
  | 'transformation'

export type AtpeAxisScoreMap = Record<AtpeClinicalAxis, number>

export type AtpeAxisDescriptor = {
  key: AtpeClinicalAxis
  label: string
  shortLabel: string
  description: string
}

export type AtpeProgressDescriptor = {
  key: AtpeProgressState
  label: string
  description: string
}

export type AtpeClinicalLevelDescriptor = {
  key: AtpeClinicalLevel
  label: string
  min: number
  max: number
  description: string
}

export type AtpeSessionForMatrix = {
  frame_containment?: number | null
  bodily_engagement?: number | null
  decentering_level?: number | null
  centering_level?: number | null
  externalization_level?: number | null
  work_dialogue_level?: number | null
  sharing_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  projective_intensity?: number | null
  therapist_presence_quality?: number | null
  patient_engagement_level?: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
  atpe_phase_dominant?: string | null
  longitudinal_phase?:
    | 'installation'
    | 'mobilisation'
    | 'pivot'
    | 'consolidation'
    | null
  dominant_clinical_theme?: string | null
  clinical_status?: string | null
  therapeutic_focus?: string | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null
}

export type AtpeMatrixScoreResult = {
  axes: AtpeAxisScoreMap
  average: number
  dominantAxis: AtpeClinicalAxis
  weakestAxis: AtpeClinicalAxis
  globalLevel: AtpeClinicalLevel
  progressionState: AtpeProgressState
}

export const ATPE_CLINICAL_AXES: AtpeAxisDescriptor[] = [
  {
    key: 'relation',
    label: 'Relation / Alliance',
    shortLabel: 'Relation',
    description:
      'Qualité du lien, capacité d’être avec l’autre, sécurité relationnelle, disponibilité intersubjective et inscription dans le groupe ou la rencontre thérapeutique.',
  },
  {
    key: 'soma',
    label: 'Corps / Soma / Régulation',
    shortLabel: 'Soma',
    description:
      'Conscience corporelle, ancrage, régulation, contenance, lien à la sensation et capacité à habiter le corps sans débordement majeur.',
  },
  {
    key: 'projection',
    label: 'Projection / Imaginaire',
    shortLabel: 'Projection',
    description:
      'Capacité de jeu, déplacement imaginaire, projection dans l’objet, le sable, le récit, l’image ou la médiation sans désorganisation excessive.',
  },
  {
    key: 'symbolisation',
    label: 'Symbolisation / Forme',
    shortLabel: 'Symbolisation',
    description:
      'Capacité à faire advenir une forme, à transformer une trace en représentation porteuse de sens, puis à soutenir un dialogue avec l’œuvre.',
  },
  {
    key: 'identite',
    label: 'Identité / Intégration de soi',
    shortLabel: 'Identité',
    description:
      'Cohérence interne, sentiment de soi, capacité à reconnaître différentes parts de soi et à soutenir une forme d’unification psychique.',
  },
  {
    key: 'transformation',
    label: 'Transformation / Rite / Passage',
    shortLabel: 'Transformation',
    description:
      'Capacité à traverser un passage, ritualiser une intention, transformer une forme initiale et intégrer psychiquement un avant / après.',
  },
]

export const ATPE_PROGRESS_STATES: AtpeProgressDescriptor[] = [
  {
    key: 'entry',
    label: 'Entrée / sécurisation',
    description:
      'Le patient a besoin avant tout d’un cadre contenant, d’appuis simples, d’une baisse de la charge et d’un accès progressif à la relation et à la médiation.',
  },
  {
    key: 'stabilization',
    label: 'Stabilisation',
    description:
      'Le travail vise la continuité, la régulation, la fiabilité du cadre, la contenance émotionnelle et corporelle, avec peu de complexité formelle.',
  },
  {
    key: 'mobilisation',
    label: 'Mobilisation / projection',
    description:
      'Le patient peut commencer à investir des médiations, jouer, déplacer, projeter et s’engager plus activement dans l’expérience créative.',
  },
  {
    key: 'symbolisation',
    label: 'Symbolisation / élaboration',
    description:
      'Les formes deviennent porteuses de sens, les traces s’organisent, l’expérience peut être reprise, regardée et partiellement mise en mots.',
  },
  {
    key: 'integration',
    label: 'Intégration',
    description:
      'Le patient consolide des acquisitions, relie davantage les expériences entre elles et peut intérioriser ce qui a été traversé en séance.',
  },
  {
    key: 'transformation',
    label: 'Transformation / passage',
    description:
      'Le patient peut soutenir un véritable travail de mutation symbolique, de ritualisation, de clôture ou de passage identitaire.',
  },
]

export const ATPE_CLINICAL_LEVELS: AtpeClinicalLevelDescriptor[] = [
  {
    key: 'very_fragile',
    label: 'Très fragile',
    min: 0,
    max: 24,
    description:
      'Le fonctionnement clinique est très vulnérable. Le besoin prioritaire porte sur la sécurité, la contenance et la réduction de la charge.',
  },
  {
    key: 'fragile',
    label: 'Fragile',
    min: 25,
    max: 44,
    description:
      'Le patient peut s’engager mais reste facilement débordé, désorganisé ou coupé de lui-même selon les médiations et le contexte.',
  },
  {
    key: 'intermediate',
    label: 'Intermédiaire',
    min: 45,
    max: 64,
    description:
      'Le patient dispose d’appuis réels, peut mobiliser certaines ressources et entrer dans un travail d’élaboration à condition d’être soutenu.',
  },
  {
    key: 'good',
    label: 'Bon',
    min: 65,
    max: 84,
    description:
      'Le patient présente un niveau clinique suffisamment stable pour soutenir un travail créatif, symbolique et relationnel plus développé.',
  },
  {
    key: 'very_good',
    label: 'Très bon',
    min: 85,
    max: 100,
    description:
      'Le patient peut généralement soutenir l’intégration, la transformation, la nuance et une relative autonomie dans l’expérience thérapeutique.',
  },
]

export const EMPTY_ATPE_AXIS_SCORES: AtpeAxisScoreMap = {
  relation: 0,
  soma: 0,
  projection: 0,
  symbolisation: 0,
  identite: 0,
  transformation: 0,
}

function clampScore(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function avg(values: Array<number | null | undefined>): number {
  const normalized = values.map((value) => clampScore(value))
  if (normalized.length === 0) return 0
  return Math.round(
    normalized.reduce((sum, value) => sum + value, 0) / normalized.length
  )
}

function penaltyFromFlags(session: AtpeSessionForMatrix): number {
  let penalty = 0

  if (session.therapist_feels_confusion) penalty += 4
  if (session.therapist_feels_sudden_fatigue) penalty += 4
  if (session.therapist_feels_pressure) penalty += 5
  if (session.therapist_feels_irritation) penalty += 4
  if (session.therapist_feels_void) penalty += 4
  if (session.patient_repeats_without_integration) penalty += 6
  if (session.group_feels_same_affect) penalty += 3
  if (session.tension_spreads_quickly) penalty += 5

  return penalty
}

function applyPenalty(score: number, penalty: number) {
  return clampScore(score - penalty)
}

export function getAxisLabel(axis: AtpeClinicalAxis): string {
  return (
    ATPE_CLINICAL_AXES.find((item) => item.key === axis)?.label ?? axis
  )
}

export function getAxisShortLabel(axis: AtpeClinicalAxis): string {
  return (
    ATPE_CLINICAL_AXES.find((item) => item.key === axis)?.shortLabel ?? axis
  )
}

export function getProgressStateLabel(state: AtpeProgressState): string {
  return (
    ATPE_PROGRESS_STATES.find((item) => item.key === state)?.label ?? state
  )
}

export function getClinicalLevelLabel(level: AtpeClinicalLevel): string {
  return (
    ATPE_CLINICAL_LEVELS.find((item) => item.key === level)?.label ?? level
  )
}

export function clinicalLevelClass(level: AtpeClinicalLevel): string {
  switch (level) {
    case 'very_fragile':
      return 'bg-red-100 text-red-800'
    case 'fragile':
      return 'bg-orange-100 text-orange-800'
    case 'intermediate':
      return 'bg-amber-100 text-amber-800'
    case 'good':
      return 'bg-blue-100 text-blue-800'
    case 'very_good':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function progressStateClass(state: AtpeProgressState): string {
  switch (state) {
    case 'entry':
      return 'bg-red-100 text-red-800'
    case 'stabilization':
      return 'bg-orange-100 text-orange-800'
    case 'mobilisation':
      return 'bg-amber-100 text-amber-800'
    case 'symbolisation':
      return 'bg-blue-100 text-blue-800'
    case 'integration':
      return 'bg-emerald-100 text-emerald-800'
    case 'transformation':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function getClinicalLevelFromScore(score: number): AtpeClinicalLevel {
  const safeScore = clampScore(score)

  if (safeScore <= 24) return 'very_fragile'
  if (safeScore <= 44) return 'fragile'
  if (safeScore <= 64) return 'intermediate'
  if (safeScore <= 84) return 'good'
  return 'very_good'
}

export function getProgressStateFromAverage(score: number): AtpeProgressState {
  const safeScore = clampScore(score)

  if (safeScore <= 24) return 'entry'
  if (safeScore <= 44) return 'stabilization'
  if (safeScore <= 59) return 'mobilisation'
  if (safeScore <= 74) return 'symbolisation'
  if (safeScore <= 89) return 'integration'
  return 'transformation'
}

export function computeAtpeAxisScores(
  session: AtpeSessionForMatrix | null | undefined
): AtpeAxisScoreMap {
  if (!session) {
    return { ...EMPTY_ATPE_AXIS_SCORES }
  }

  const penalty = penaltyFromFlags(session)

  const relation = applyPenalty(
    avg([
      session.relational_availability,
      session.sharing_level,
      session.therapist_presence_quality,
      session.patient_engagement_level,
      session.frame_containment,
    ]),
    penalty
  )

  const soma = applyPenalty(
    avg([
      session.frame_containment,
      session.bodily_engagement,
      session.centering_level,
      session.therapist_presence_quality,
      session.patient_engagement_level,
    ]),
    penalty
  )

  const projection = applyPenalty(
    avg([
      session.externalization_level,
      session.creative_mobility,
      session.decentering_level,
      session.patient_engagement_level,
      100 - clampScore(session.projective_intensity),
    ]),
    penalty
  )

  const symbolisation = applyPenalty(
    avg([
      session.primary_symbolization,
      session.secondary_symbolization,
      session.work_dialogue_level,
      session.externalization_level,
      session.creative_mobility,
    ]),
    penalty
  )

  const identite = applyPenalty(
    avg([
      session.centering_level,
      session.secondary_symbolization,
      session.relational_availability,
      session.creative_mobility,
      session.patient_engagement_level,
    ]),
    penalty
  )

  const transformation = applyPenalty(
    avg([
      session.decentering_level,
      session.centering_level,
      session.creative_mobility,
      session.secondary_symbolization,
      session.work_dialogue_level,
      session.sharing_level,
    ]),
    penalty
  )

  return {
    relation,
    soma,
    projection,
    symbolisation,
    identite,
    transformation,
  }
}

export function getDominantAxis(scores: AtpeAxisScoreMap): AtpeClinicalAxis {
  let bestAxis: AtpeClinicalAxis = 'relation'
  let bestScore = -1

  for (const axis of Object.keys(scores) as AtpeClinicalAxis[]) {
    if (scores[axis] > bestScore) {
      bestAxis = axis
      bestScore = scores[axis]
    }
  }

  return bestAxis
}

export function getWeakestAxis(scores: AtpeAxisScoreMap): AtpeClinicalAxis {
  let weakestAxis: AtpeClinicalAxis = 'relation'
  let weakestScore = Number.POSITIVE_INFINITY

  for (const axis of Object.keys(scores) as AtpeClinicalAxis[]) {
    if (scores[axis] < weakestScore) {
      weakestAxis = axis
      weakestScore = scores[axis]
    }
  }

  return weakestAxis
}

export function getAverageAxisScore(scores: AtpeAxisScoreMap): number {
  const values = Object.values(scores)
  if (values.length === 0) return 0

  return clampScore(
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  )
}

export function resolveAtpeClinicalMatrix(
  session: AtpeSessionForMatrix | null | undefined
): AtpeMatrixScoreResult {
  const axes = computeAtpeAxisScores(session)
  const average = getAverageAxisScore(axes)
  const dominantAxis = getDominantAxis(axes)
  const weakestAxis = getWeakestAxis(axes)
  const globalLevel = getClinicalLevelFromScore(average)
  const progressionState = getProgressStateFromAverage(average)

  return {
    axes,
    average,
    dominantAxis,
    weakestAxis,
    globalLevel,
    progressionState,
  }
}

export function isAxisFragile(
  scores: AtpeAxisScoreMap,
  axis: AtpeClinicalAxis,
  threshold = 45
): boolean {
  return clampScore(scores[axis]) < threshold
}

export function isAxisStrong(
  scores: AtpeAxisScoreMap,
  axis: AtpeClinicalAxis,
  threshold = 65
): boolean {
  return clampScore(scores[axis]) >= threshold
}

export function getFragileAxes(
  scores: AtpeAxisScoreMap,
  threshold = 45
): AtpeClinicalAxis[] {
  return (Object.keys(scores) as AtpeClinicalAxis[]).filter((axis) =>
    isAxisFragile(scores, axis, threshold)
  )
}

export function getStrongAxes(
  scores: AtpeAxisScoreMap,
  threshold = 65
): AtpeClinicalAxis[] {
  return (Object.keys(scores) as AtpeClinicalAxis[]).filter((axis) =>
    isAxisStrong(scores, axis, threshold)
  )
}

export function matchProtocolsByPriorityAxes(
  scores: AtpeAxisScoreMap
): AtpeClinicalAxis[] {
  return [...(Object.keys(scores) as AtpeClinicalAxis[])].sort(
    (a, b) => scores[a] - scores[b]
  )
}

export function getRecommendedClinicalState(
  session: AtpeSessionForMatrix | null | undefined
): {
  level: AtpeClinicalLevel
  progression: AtpeProgressState
  priorityAxes: AtpeClinicalAxis[]
} {
  const matrix = resolveAtpeClinicalMatrix(session)

  return {
    level: matrix.globalLevel,
    progression: matrix.progressionState,
    priorityAxes: matchProtocolsByPriorityAxes(matrix.axes),
  }
}