import type { AtpeAdvancedRow } from '@/lib/patient-types'
import type {
  AtpeSessionAdvancedInput,
  AtpeClinicalProfile,
  AtpeDimensions,
} from '@/lib/atpe-engine-v2'
import {
  buildAlerts,
  buildClinicalProfile,
  buildHypotheses,
  buildRecommendations,
  computeAtpeDimensions,
} from '@/lib/atpe-engine-v2'

export type LongitudinalDelta = {
  current: number
  previous: number
  delta: number
}

export type LongitudinalFlag = {
  level: 'info' | 'moderate' | 'high'
  code:
    | 'FRAME_DROP'
    | 'FRAME_GAIN'
    | 'PRIMARY_PROGRESS'
    | 'SECONDARY_PROGRESS'
    | 'SECONDARY_DROP'
    | 'PROJECTIVE_SURGE'
    | 'PROJECTIVE_DROP'
    | 'RELATIONAL_PROGRESS'
    | 'RELATIONAL_DROP'
    | 'GROUP_CONTAINMENT_GAIN'
    | 'GROUP_CONTAINMENT_DROP'
    | 'EXPRESSION_ELABORATION_GAP'
    | 'NO_PREVIOUS_SESSION'
  title: string
  description: string
}

export type LongitudinalAnalysis = {
  currentDimensions: AtpeDimensions
  previousDimensions: AtpeDimensions | null
  currentProfile: AtpeClinicalProfile
  previousProfile: AtpeClinicalProfile | null
  deltas: {
    frameContainment: LongitudinalDelta | null
    bodilyEngagement: LongitudinalDelta | null
    primarySymbolization: LongitudinalDelta | null
    secondarySymbolization: LongitudinalDelta | null
    relationalAvailability: LongitudinalDelta | null
    creativeMobility: LongitudinalDelta | null
    projectiveIntensity: LongitudinalDelta | null
    groupContainment: LongitudinalDelta | null
  }
  narrative: string
  flags: LongitudinalFlag[]
  hypotheses: string[]
  alerts: string[]
  recommendations: string[]
}

export function advancedRowToInput(row: AtpeAdvancedRow): AtpeSessionAdvancedInput {
  return {
    format: row.format,
    mediumPrimary: row.medium_primary,
    mediumSecondary: row.medium_secondary,
    atpePhaseDominant: row.atpe_phase_dominant,

    frameContainment: row.frame_containment,
    bodilyEngagement: row.bodily_engagement,

    decenteringLevel: row.decentering_level,
    centeringLevel: row.centering_level,
    externalizationLevel: row.externalization_level,
    workDialogueLevel: row.work_dialogue_level,
    sharingLevel: row.sharing_level,

    primarySymbolization: row.primary_symbolization,
    secondarySymbolization: row.secondary_symbolization,
    relationalAvailability: row.relational_availability,
    creativeMobility: row.creative_mobility,

    projectiveIntensity: row.projective_intensity,
    groupCohesion: row.group_cohesion,
    groupContainment: row.group_containment,
    transferDiffraction: row.transfer_diffraction,

    therapistPresenceQuality: row.therapist_presence_quality,
    patientEngagementLevel: row.patient_engagement_level,

    markers: {
      therapistFeelsConfusion: row.therapist_feels_confusion,
      therapistFeelsSuddenFatigue: row.therapist_feels_sudden_fatigue,
      therapistFeelsPressure: row.therapist_feels_pressure,
      therapistFeelsIrritation: row.therapist_feels_irritation,
      therapistFeelsVoid: row.therapist_feels_void,
      patientRepeatsWithoutIntegration: row.patient_repeats_without_integration,
      groupFeelsSameAffect: row.group_feels_same_affect,
      tensionSpreadsQuickly: row.tension_spreads_quickly,
    },
  }
}

function round(value: number) {
  return Math.round(value)
}

function makeDelta(current: number, previous: number): LongitudinalDelta {
  return {
    current: round(current),
    previous: round(previous),
    delta: round(current - previous),
  }
}

function deltaWord(delta: number, positive = 'en hausse', negative = 'en baisse') {
  if (delta > 0) return positive
  if (delta < 0) return negative
  return 'stable'
}

function addSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`
}

function buildFlags(args: {
  currentDimensions: AtpeDimensions
  previousDimensions: AtpeDimensions | null
}): LongitudinalFlag[] {
  const { currentDimensions, previousDimensions } = args
  const flags: LongitudinalFlag[] = []

  if (!previousDimensions) {
    flags.push({
      level: 'info',
      code: 'NO_PREVIOUS_SESSION',
      title: 'Pas de séance antérieure comparable',
      description:
        'La lecture longitudinale repose uniquement sur la séance actuelle, sans point de comparaison précédent.',
    })
    return flags
  }

  const frameDelta = currentDimensions.frameContainment - previousDimensions.frameContainment
  const primaryDelta =
    currentDimensions.primarySymbolization - previousDimensions.primarySymbolization
  const secondaryDelta =
    currentDimensions.secondarySymbolization - previousDimensions.secondarySymbolization
  const projectiveDelta =
    currentDimensions.projectiveIntensity - previousDimensions.projectiveIntensity
  const relationalDelta =
    currentDimensions.relationalAvailability - previousDimensions.relationalAvailability
  const groupDelta =
    currentDimensions.groupContainment - previousDimensions.groupContainment

  if (frameDelta <= -15) {
    flags.push({
      level: 'high',
      code: 'FRAME_DROP',
      title: 'Baisse notable de la contenance du cadre',
      description:
        "Le cadre apparaît significativement moins contenant qu'à la séance précédente.",
    })
  } else if (frameDelta >= 15) {
    flags.push({
      level: 'info',
      code: 'FRAME_GAIN',
      title: 'Renforcement du cadre',
      description:
        'Le niveau de contenance du cadre apparaît en progression nette.',
    })
  }

  if (primaryDelta >= 12) {
    flags.push({
      level: 'info',
      code: 'PRIMARY_PROGRESS',
      title: 'Progression de la symbolisation primaire',
      description:
        "L'engagement dans la forme, la trace ou l’extériorisation paraît plus mobilisable.",
    })
  }

  if (secondaryDelta >= 12) {
    flags.push({
      level: 'info',
      code: 'SECONDARY_PROGRESS',
      title: 'Progression de la symbolisation secondaire',
      description:
        'Le passage vers une élaboration plus réfléchie semble plus accessible.',
    })
  } else if (secondaryDelta <= -12) {
    flags.push({
      level: 'moderate',
      code: 'SECONDARY_DROP',
      title: 'Recul de la symbolisation secondaire',
      description:
        "L'élaboration verbale ou représentative paraît moins disponible qu'à la séance précédente.",
    })
  }

  if (projectiveDelta >= 15) {
    flags.push({
      level: 'high',
      code: 'PROJECTIVE_SURGE',
      title: 'Hausse de la charge projective',
      description:
        'L’intensité projective monte nettement et appelle une vigilance accrue sur la contenance.',
    })
  } else if (projectiveDelta <= -15) {
    flags.push({
      level: 'info',
      code: 'PROJECTIVE_DROP',
      title: 'Diminution de la tension projective',
      description:
        'La charge projective semble moins envahissante que lors de la séance précédente.',
    })
  }

  if (relationalDelta >= 12) {
    flags.push({
      level: 'info',
      code: 'RELATIONAL_PROGRESS',
      title: 'Ouverture relationnelle en progression',
      description:
        'La disponibilité relationnelle paraît plus soutenue ou plus stable.',
    })
  } else if (relationalDelta <= -12) {
    flags.push({
      level: 'moderate',
      code: 'RELATIONAL_DROP',
      title: 'Repli relationnel relatif',
      description:
        'La disponibilité relationnelle semble moins accessible dans la séance actuelle.',
    })
  }

  if (groupDelta >= 12) {
    flags.push({
      level: 'info',
      code: 'GROUP_CONTAINMENT_GAIN',
      title: 'Progression de la contenance groupale',
      description:
        'Le groupe paraît mieux soutenir et contenir les mouvements psychiques.',
    })
  } else if (groupDelta <= -12) {
    flags.push({
      level: 'moderate',
      code: 'GROUP_CONTAINMENT_DROP',
      title: 'Affaiblissement de la contenance groupale',
      description:
        'Le groupe paraît moins opérant comme appui de transformation ou de régulation.',
    })
  }

  if (
    currentDimensions.primarySymbolization >= 55 &&
    currentDimensions.secondarySymbolization <= 35
  ) {
    flags.push({
      level: 'moderate',
      code: 'EXPRESSION_ELABORATION_GAP',
      title: 'Écart expression / élaboration',
      description:
        "L'expression reste plus mobilisable que l’élaboration secondaire, ce qui invite à soutenir la reprise avant l’interprétation.",
    })
  }

  return flags
}

function buildNarrative(args: {
  currentSessionId: string
  previousSessionId: string | null
  currentDimensions: AtpeDimensions
  previousDimensions: AtpeDimensions | null
  currentProfile: AtpeClinicalProfile
  previousProfile: AtpeClinicalProfile | null
  flags: LongitudinalFlag[]
}) {
  const {
    currentSessionId,
    previousSessionId,
    currentDimensions,
    previousDimensions,
    currentProfile,
    previousProfile,
    flags,
  } = args

  if (!previousDimensions) {
    return `Séance ${currentSessionId} analysée sans comparaison antérieure. Le cadre est coté à ${currentDimensions.frameContainment}/100, la symbolisation primaire à ${currentDimensions.primarySymbolization}/100, la symbolisation secondaire à ${currentDimensions.secondarySymbolization}/100, et l’intensité projective à ${currentDimensions.projectiveIntensity}/100. Le profil dominant est actuellement ${currentProfile.symbolicProfile}, avec un mode relationnel ${currentProfile.relationalMode}.`
  }

  const frameDelta = round(currentDimensions.frameContainment - previousDimensions.frameContainment)
  const primaryDelta = round(
    currentDimensions.primarySymbolization - previousDimensions.primarySymbolization,
  )
  const secondaryDelta = round(
    currentDimensions.secondarySymbolization - previousDimensions.secondarySymbolization,
  )
  const projectiveDelta = round(
    currentDimensions.projectiveIntensity - previousDimensions.projectiveIntensity,
  )
  const relationalDelta = round(
    currentDimensions.relationalAvailability - previousDimensions.relationalAvailability,
  )

  const lines: string[] = []

  lines.push(
    `Comparaison ${currentSessionId} / ${previousSessionId}. Le cadre est ${deltaWord(frameDelta, 'en progression', 'en recul')} (${addSigned(frameDelta)}), la symbolisation primaire est ${deltaWord(primaryDelta)} (${addSigned(primaryDelta)}), la symbolisation secondaire est ${deltaWord(secondaryDelta)} (${addSigned(secondaryDelta)}), la disponibilité relationnelle est ${deltaWord(relationalDelta)} (${addSigned(relationalDelta)}), et l’intensité projective est ${deltaWord(projectiveDelta, 'en hausse', 'en baisse')} (${addSigned(projectiveDelta)}).`,
  )

  if (previousProfile) {
    lines.push(
      `Le profil symbolique passe de ${previousProfile.symbolicProfile} à ${currentProfile.symbolicProfile}, tandis que le mode relationnel évolue de ${previousProfile.relationalMode} à ${currentProfile.relationalMode}.`,
    )
  }

  const highFlags = flags.filter((flag) => flag.level === 'high')
  if (highFlags.length) {
    lines.push(
      `Point de vigilance principal : ${highFlags[0].title.toLowerCase()}.`,
    )
  }

  return lines.join(' ')
}

export function analyzeLongitudinalComparison(args: {
  currentRow: AtpeAdvancedRow
  previousRow: AtpeAdvancedRow | null
  currentSessionId: string
  previousSessionId: string | null
}): LongitudinalAnalysis {
  const currentInput = advancedRowToInput(args.currentRow)
  const previousInput = args.previousRow ? advancedRowToInput(args.previousRow) : null

  const currentDimensions = computeAtpeDimensions(currentInput)
  const previousDimensions = previousInput ? computeAtpeDimensions(previousInput) : null

  const currentProfile = buildClinicalProfile(currentInput, currentDimensions)
  const previousProfile =
    previousInput && previousDimensions
      ? buildClinicalProfile(previousInput, previousDimensions)
      : null

  const flags = buildFlags({
    currentDimensions,
    previousDimensions,
  })

  const hypotheses = buildHypotheses(currentInput, currentDimensions)
  const recommendations = buildRecommendations(
    currentInput,
    currentDimensions,
    currentProfile,
  )
  const alerts = buildAlerts(currentDimensions, currentProfile)

  return {
    currentDimensions,
    previousDimensions,
    currentProfile,
    previousProfile,
    deltas: {
      frameContainment: previousDimensions
        ? makeDelta(
            currentDimensions.frameContainment,
            previousDimensions.frameContainment,
          )
        : null,
      bodilyEngagement: previousDimensions
        ? makeDelta(
            currentDimensions.bodilyEngagement,
            previousDimensions.bodilyEngagement,
          )
        : null,
      primarySymbolization: previousDimensions
        ? makeDelta(
            currentDimensions.primarySymbolization,
            previousDimensions.primarySymbolization,
          )
        : null,
      secondarySymbolization: previousDimensions
        ? makeDelta(
            currentDimensions.secondarySymbolization,
            previousDimensions.secondarySymbolization,
          )
        : null,
      relationalAvailability: previousDimensions
        ? makeDelta(
            currentDimensions.relationalAvailability,
            previousDimensions.relationalAvailability,
          )
        : null,
      creativeMobility: previousDimensions
        ? makeDelta(
            currentDimensions.creativeMobility,
            previousDimensions.creativeMobility,
          )
        : null,
      projectiveIntensity: previousDimensions
        ? makeDelta(
            currentDimensions.projectiveIntensity,
            previousDimensions.projectiveIntensity,
          )
        : null,
      groupContainment: previousDimensions
        ? makeDelta(
            currentDimensions.groupContainment,
            previousDimensions.groupContainment,
          )
        : null,
    },
    narrative: buildNarrative({
      currentSessionId: args.currentSessionId,
      previousSessionId: args.previousSessionId,
      currentDimensions,
      previousDimensions,
      currentProfile,
      previousProfile,
      flags,
    }),
    flags,
    hypotheses,
    alerts: alerts.items,
    recommendations: [
      ...recommendations.medium,
      ...recommendations.posture,
      ...recommendations.nextStep,
    ],
  }
}