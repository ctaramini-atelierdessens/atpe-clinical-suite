import type { AtpeAdvancedRow } from '@/lib/patient-types'
import type {
  AtpeClinicalProfile,
  AtpeSessionAdvancedInput,
} from '@/lib/atpe-engine-v2'
import {
  buildClinicalProfile,
  computeAtpeDimensions,
} from '@/lib/atpe-engine-v2'

export type ProtocolFrameIntensity = 'faible' | 'modérée' | 'soutenue' | 'renforcée'
export type ProtocolSessionType =
  | 'séance contenante'
  | 'séance de relance créative'
  | 'séance de transformation symbolique'
  | 'séance de reprise groupale'
  | 'séance de consolidation'

export type ProtocolVerbalization =
  | 'très limitée'
  | 'courte et cadrée'
  | 'progressive'
  | 'élaborative prudente'

export type ProtocolMediumRecommendation = {
  label: string
  reason: string
}

export type ProtocolPlan = {
  frameIntensity: ProtocolFrameIntensity
  nextSessionType: ProtocolSessionType
  verbalization: ProtocolVerbalization
  therapistPosture: string[]
  mediumRecommendations: ProtocolMediumRecommendation[]
  atpeProtocol: {
    attitudeInterieure: string
    creation: string
    dialogueOeuvre: string
    partage: string
  }
  narrative: string
}

export function advancedRowToProtocolInput(
  row: AtpeAdvancedRow,
): AtpeSessionAdvancedInput {
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

function recommendFrameIntensity(args: {
  frameContainment: number
  projectiveIntensity: number
  groupContainment: number
}): ProtocolFrameIntensity {
  const { frameContainment, projectiveIntensity, groupContainment } = args

  if (frameContainment < 40 || projectiveIntensity >= 70) {
    return 'renforcée'
  }
  if (frameContainment < 55 || groupContainment < 35 || projectiveIntensity >= 55) {
    return 'soutenue'
  }
  if (frameContainment < 70) {
    return 'modérée'
  }
  return 'faible'
}

function recommendSessionType(args: {
  profile: AtpeClinicalProfile
  primary: number
  secondary: number
  projective: number
  format: 'individual' | 'group'
  creative: number
  groupContainment: number
}): ProtocolSessionType {
  const { profile, primary, secondary, projective, format, creative, groupContainment } = args

  if (projective >= 65 || profile.projectionMode === 'débordant') {
    return 'séance contenante'
  }

  if (format === 'group' && groupContainment >= 55) {
    return 'séance de reprise groupale'
  }

  if (primary >= 50 && secondary < 45) {
    return 'séance de transformation symbolique'
  }

  if (creative >= 60 && profile.relationalMode !== 'retrait') {
    return 'séance de relance créative'
  }

  return 'séance de consolidation'
}

function recommendVerbalization(args: {
  secondary: number
  projective: number
  frameContainment: number
}): ProtocolVerbalization {
  const { secondary, projective, frameContainment } = args

  if (projective >= 65 || frameContainment < 45) {
    return 'très limitée'
  }
  if (secondary < 40) {
    return 'courte et cadrée'
  }
  if (secondary < 60) {
    return 'progressive'
  }
  return 'élaborative prudente'
}

function recommendMediums(args: {
  profile: AtpeClinicalProfile
  primary: number
  secondary: number
  projective: number
  creative: number
  format: 'individual' | 'group'
}): ProtocolMediumRecommendation[] {
  const { primary, secondary, projective, creative, format } = args
  const mediums: ProtocolMediumRecommendation[] = []

  if (projective >= 60) {
    mediums.push({
      label: 'Médium sensoriel contenant',
      reason:
        'Pour soutenir la décharge sans surcharger l’élaboration interprétative.',
    })
    mediums.push({
      label: 'Travail de matière ou trace simple',
      reason:
        'Pour offrir une forme stable à des éprouvés encore peu métabolisés.',
    })
  }

  if (primary >= 45 && secondary < 50) {
    mediums.push({
      label: 'Transcréation courte',
      reason:
        'Pour favoriser le passage de l’éprouvé vers une forme plus symbolisable.',
    })
  }

  if (secondary >= 50) {
    mediums.push({
      label: 'Médium mixte création + reprise narrative',
      reason:
        'Pour soutenir une symbolisation secondaire émergente sans la brusquer.',
    })
  }

  if (creative >= 60) {
    mediums.push({
      label: 'Improvisation guidée',
      reason:
        'Pour mobiliser la créativité tout en gardant une structure thérapeutique nette.',
    })
  }

  if (format === 'group') {
    mediums.push({
      label: 'Créer-ensemble séquencé',
      reason:
        'Pour utiliser le groupe comme appui de contenance et de transformation.',
    })
  }

  if (!mediums.length) {
    mediums.push({
      label: 'Médium simple et stable',
      reason:
        'Pour maintenir un niveau de complexité compatible avec l’état clinique du moment.',
    })
  }

  return mediums
}

function recommendPosture(args: {
  frameIntensity: ProtocolFrameIntensity
  verbalization: ProtocolVerbalization
  projective: number
  format: 'individual' | 'group'
}): string[] {
  const { frameIntensity, verbalization, projective, format } = args
  const posture = new Set<string>()

  if (frameIntensity === 'renforcée' || frameIntensity === 'soutenue') {
    posture.add('Maintenir des consignes simples, constantes et peu nombreuses')
    posture.add('Renforcer la permanence temporelle et spatiale du cadre')
  }

  if (verbalization === 'très limitée' || verbalization === 'courte et cadrée') {
    posture.add("Différer l'interprétation explicative et privilégier la contenance")
    posture.add("Soutenir la mise en forme avant la mise en mots")
  }

  if (projective >= 55) {
    posture.add('Travailler les éprouvés thérapeutiques en supervision')
  }

  if (format === 'group') {
    posture.add('Structurer les tours de parole et protéger le contenant groupal')
  }

  if (!posture.size) {
    posture.add('Maintenir une présence stable, souple et non intrusive')
  }

  return Array.from(posture)
}

function buildAtpeProtocol(args: {
  nextSessionType: ProtocolSessionType
  verbalization: ProtocolVerbalization
  frameIntensity: ProtocolFrameIntensity
  profile: AtpeClinicalProfile
}): ProtocolPlan['atpeProtocol'] {
  const { nextSessionType, verbalization, frameIntensity, profile } = args

  const attitudeInterieure =
    frameIntensity === 'renforcée'
      ? 'Installer un temps de recentrage bref, sécurisant, avec rappel explicite du cadre.'
      : 'Installer un temps de disponibilité intérieure simple, stable et non intrusif.'

  const creation =
    nextSessionType === 'séance contenante'
      ? 'Proposer une création courte, sensorielle, peu interprétée, avec appui sur la matière ou la trace.'
      : nextSessionType === 'séance de relance créative'
      ? 'Proposer une improvisation guidée ou une production libre cadrée pour relancer la mobilité créative.'
      : nextSessionType === 'séance de transformation symbolique'
      ? 'Proposer une médiation permettant de transformer l’éprouvé en forme partageable.'
      : nextSessionType === 'séance de reprise groupale'
      ? 'Proposer un créer-ensemble séquencé avec structure temporelle nette.'
      : 'Proposer une séance simple de consolidation avec continuité de médium.'

  const dialogueOeuvre =
    verbalization === 'très limitée'
      ? "Limiter le dialogue avec l’œuvre à quelques repères descriptifs et sensoriels."
      : verbalization === 'courte et cadrée'
      ? "Ouvrir un dialogue bref avec l’œuvre, centré sur la forme, les appuis et les écarts."
      : verbalization === 'progressive'
      ? "Soutenir une reprise progressive entre éprouvé, forme et signification émergente."
      : "Soutenir une élaboration prudente articulant création, vécu et sens."

  const partage =
    profile.groupMode === 'contenu par le groupe' || profile.groupMode === 'porté par le groupe'
      ? 'Organiser un partage groupal court, contenant et symbolisant, sans forcer l’exposition.'
      : 'Proposer un temps de partage limité, sécurisé, respectant la tolérance du sujet à la mise en mots.'

  return {
    attitudeInterieure,
    creation,
    dialogueOeuvre,
    partage,
  }
}

export function buildProtocolPlanFromRow(row: AtpeAdvancedRow): ProtocolPlan {
  const input = advancedRowToProtocolInput(row)
  const dimensions = computeAtpeDimensions(input)
  const profile = buildClinicalProfile(input, dimensions)

  const frameIntensity = recommendFrameIntensity({
    frameContainment: dimensions.frameContainment,
    projectiveIntensity: dimensions.projectiveIntensity,
    groupContainment: dimensions.groupContainment,
  })

  const nextSessionType = recommendSessionType({
    profile,
    primary: dimensions.primarySymbolization,
    secondary: dimensions.secondarySymbolization,
    projective: dimensions.projectiveIntensity,
    format: row.format,
    creative: dimensions.creativeMobility,
    groupContainment: dimensions.groupContainment,
  })

  const verbalization = recommendVerbalization({
    secondary: dimensions.secondarySymbolization,
    projective: dimensions.projectiveIntensity,
    frameContainment: dimensions.frameContainment,
  })

  const mediumRecommendations = recommendMediums({
    profile,
    primary: dimensions.primarySymbolization,
    secondary: dimensions.secondarySymbolization,
    projective: dimensions.projectiveIntensity,
    creative: dimensions.creativeMobility,
    format: row.format,
  })

  const therapistPosture = recommendPosture({
    frameIntensity,
    verbalization,
    projective: dimensions.projectiveIntensity,
    format: row.format,
  })

  const atpeProtocol = buildAtpeProtocol({
    nextSessionType,
    verbalization,
    frameIntensity,
    profile,
  })

  const narrative = [
    `Protocole recommandé : ${nextSessionType}.`,
    `Intensité de cadre : ${frameIntensity}.`,
    `Verbalisation conseillée : ${verbalization}.`,
    `Le profil actuel est ${profile.symbolicProfile} avec un mode relationnel ${profile.relationalMode}.`,
  ].join(' ')

  return {
    frameIntensity,
    nextSessionType,
    verbalization,
    therapistPosture,
    mediumRecommendations,
    atpeProtocol,
    narrative,
  }
}