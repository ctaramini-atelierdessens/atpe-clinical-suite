export const THERAPEUTIC_PHASES = [
  'accueil',
  'expression',
  'traversee',
  'reparation',
  'affirmation',
] as const

export const EMOTIONAL_SCOPES = [
  'activation',
  'regulation',
  'reparation',
  'exploration',
  'expression',
] as const

export const VERBALIZATION_LEVELS = [
  'absente',
  'faible',
  'retenue',
  'flottante',
  'metaphorique',
  'spontanee',
  'reflexive',
] as const

export const EMOTIONAL_INTENSITIES = [
  'faible',
  'moderee',
  'forte',
  'flottante',
  'ambivalente',
] as const

export const SENSORY_DOMINANTS = [
  'tactile',
  'visuelle',
  'auditive',
  'kinesthesique',
  'imaginaire',
  'mixte',
] as const

export const TOLERANCE_LEVELS = [
  'fragile',
  'modere',
  'satisfaisant',
] as const

export type TherapeuticPhase = (typeof THERAPEUTIC_PHASES)[number]
export type EmotionalScope = (typeof EMOTIONAL_SCOPES)[number]
export type VerbalizationLevel = (typeof VERBALIZATION_LEVELS)[number]
export type EmotionalIntensity = (typeof EMOTIONAL_INTENSITIES)[number]
export type SensoryDominant = (typeof SENSORY_DOMINANTS)[number]
export type ToleranceLevel = (typeof TOLERANCE_LEVELS)[number]

function fallbackLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function isTherapeuticPhase(value: unknown): value is TherapeuticPhase {
  return (
    typeof value === 'string' &&
    THERAPEUTIC_PHASES.includes(value as TherapeuticPhase)
  )
}

export function isEmotionalScope(value: unknown): value is EmotionalScope {
  return (
    typeof value === 'string' &&
    EMOTIONAL_SCOPES.includes(value as EmotionalScope)
  )
}

export function isVerbalizationLevel(
  value: unknown
): value is VerbalizationLevel {
  return (
    typeof value === 'string' &&
    VERBALIZATION_LEVELS.includes(value as VerbalizationLevel)
  )
}

export function isEmotionalIntensity(
  value: unknown
): value is EmotionalIntensity {
  return (
    typeof value === 'string' &&
    EMOTIONAL_INTENSITIES.includes(value as EmotionalIntensity)
  )
}

export function isSensoryDominant(value: unknown): value is SensoryDominant {
  return (
    typeof value === 'string' &&
    SENSORY_DOMINANTS.includes(value as SensoryDominant)
  )
}

export function isToleranceLevel(value: unknown): value is ToleranceLevel {
  return (
    typeof value === 'string' &&
    TOLERANCE_LEVELS.includes(value as ToleranceLevel)
  )
}

export function labelPhase(value: string) {
  switch (value) {
    case 'accueil':
      return 'Accueil'
    case 'expression':
      return 'Expression'
    case 'traversee':
      return 'Traversée'
    case 'reparation':
      return 'Réparation'
    case 'affirmation':
      return 'Affirmation'
    default:
      return fallbackLabel(value)
  }
}

export function labelScope(value: string) {
  switch (value) {
    case 'activation':
      return 'Activation'
    case 'regulation':
      return 'Régulation'
    case 'reparation':
      return 'Réparation'
    case 'exploration':
      return 'Exploration'
    case 'expression':
      return 'Expression'
    default:
      return fallbackLabel(value)
  }
}

export function labelVerbalization(value: string) {
  switch (value) {
    case 'absente':
      return 'Absente'
    case 'faible':
      return 'Faible'
    case 'retenue':
      return 'Retenue'
    case 'flottante':
      return 'Flottante'
    case 'metaphorique':
      return 'Métaphorique'
    case 'spontanee':
      return 'Spontanée'
    case 'reflexive':
      return 'Réflexive'
    default:
      return fallbackLabel(value)
  }
}

export function labelEmotionalIntensity(value: string) {
  switch (value) {
    case 'faible':
      return 'Faible'
    case 'moderee':
      return 'Modérée'
    case 'forte':
      return 'Forte'
    case 'flottante':
      return 'Flottante'
    case 'ambivalente':
      return 'Ambivalente'
    default:
      return fallbackLabel(value)
  }
}

export function labelSensoryDominant(value: string) {
  switch (value) {
    case 'tactile':
      return 'Tactile'
    case 'visuelle':
      return 'Visuelle'
    case 'auditive':
      return 'Auditive'
    case 'kinesthesique':
      return 'Kinesthésique'
    case 'imaginaire':
      return 'Imaginaire'
    case 'mixte':
      return 'Mixte'
    default:
      return fallbackLabel(value)
  }
}

export function labelTolerance(value: string) {
  switch (value) {
    case 'fragile':
      return 'Fragile'
    case 'modere':
      return 'Modéré'
    case 'satisfaisant':
      return 'Satisfaisant'
    default:
      return fallbackLabel(value)
  }
}