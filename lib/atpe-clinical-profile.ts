export type SavedObjective = {
  axisKey: string
  rowKey: string
  objective: string
}

export type PatientInitialAssessmentData = {
  patient_id: string
  clinical_intent: string | null
  main_goals: string | null
  vigilance_points: string | null
  selected_axes: string[] | null
  selected_objectives: SavedObjective[] | null
}

export type ClinicalPriorityFlags = {
  regulationPriority: boolean
  relationalPriority: boolean
  sensoryPriority: boolean
  expressivePriority: boolean
  symbolicPriority: boolean
  autonomyPriority: boolean
  participationPriority: boolean
  intermodalPriority: boolean
}

export type PatientClinicalProfile = {
  hasAssessment: boolean
  activeAxes: string[]
  selectedObjectives: SavedObjective[]
  priorities: ClinicalPriorityFlags
  focusAreas: string[]
  vigilanceKeywords: string[]
  intentKeywords: string[]
  summary: string
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function extractKeywords(text: string | null | undefined) {
  if (!text) return []

  return Array.from(
    new Set(
      normalize(text)
        .split(/[^a-z0-9]+/g)
        .filter((item) => item.length >= 4)
    )
  )
}

function hasAny(haystack: string[], needles: string[]) {
  return needles.some((needle) => haystack.includes(needle))
}

export function buildPatientClinicalProfile(
  assessment: PatientInitialAssessmentData | null | undefined
): PatientClinicalProfile {
  if (!assessment) {
    return {
      hasAssessment: false,
      activeAxes: [],
      selectedObjectives: [],
      priorities: {
        regulationPriority: false,
        relationalPriority: false,
        sensoryPriority: false,
        expressivePriority: false,
        symbolicPriority: false,
        autonomyPriority: false,
        participationPriority: false,
        intermodalPriority: false,
      },
      focusAreas: [],
      vigilanceKeywords: [],
      intentKeywords: [],
      summary: 'Aucun bilan initial enregistré.',
    }
  }

  const activeAxes = assessment.selected_axes ?? []
  const selectedObjectives = assessment.selected_objectives ?? []

  const objectiveTexts = selectedObjectives.map((item) => normalize(item.objective))
  const intentKeywords = extractKeywords(assessment.clinical_intent)
  const goalKeywords = extractKeywords(assessment.main_goals)
  const vigilanceKeywords = extractKeywords(assessment.vigilance_points)

  const allKeywords = Array.from(
    new Set([...intentKeywords, ...goalKeywords, ...vigilanceKeywords])
  )

  const regulationPriority =
    activeAxes.includes('processus_interne') &&
    (objectiveTexts.some((t) => t.includes('regulation')) ||
      hasAny(allKeywords, [
        'regulation',
        'emotion',
        'emotionnelle',
        'debordement',
        'apaisement',
      ]))

  const relationalPriority =
    activeAxes.includes('processus_relationnel') ||
    hasAny(allKeywords, [
      'alliance',
      'relation',
      'relationnelle',
      'communication',
      'positionnement',
      'cooperation',
      'groupe',
    ])

  const sensoryPriority =
    activeAxes.includes('sensoriel_symbolique') ||
    hasAny(allKeywords, [
      'sensoriel',
      'sensorielle',
      'souffle',
      'tactile',
      'matiere',
      'couleur',
      'ancrage',
    ])

  const expressivePriority =
    activeAxes.includes('processus_expressif') ||
    hasAny(allKeywords, [
      'expressif',
      'expression',
      'corporel',
      'corporelle',
      'plastique',
      'sonore',
      'narratif',
    ])

  const symbolicPriority =
    objectiveTexts.some((t) => t.includes('symbol')) ||
    hasAny(allKeywords, [
      'symbolisation',
      'symbolique',
      'metaphore',
      'motif',
      'totem',
      'recit',
    ])

  const autonomyPriority =
    activeAxes.includes('indicateurs_institutionnels') &&
    hasAny(allKeywords, ['autonomie', 'choix', 'initiative', 'decision'])

  const participationPriority =
    activeAxes.includes('indicateurs_institutionnels') &&
    hasAny(allKeywords, ['participation', 'engagement', 'presence', 'rituel'])

  const intermodalPriority =
    activeAxes.includes('pluriexpressionnalite') ||
    hasAny(allKeywords, [
      'intermodal',
      'intermodale',
      'pluriexpressionnel',
      'pluriexpressionnalite',
      'medium',
      'modalite',
      'passage',
      'transformation',
    ])

  const focusAreas = Array.from(
    new Set(
      [
        regulationPriority ? 'régulation émotionnelle' : null,
        relationalPriority ? 'alliance / relation' : null,
        sensoryPriority ? 'sensorialité / ancrage' : null,
        expressivePriority ? 'expression / médiations' : null,
        symbolicPriority ? 'symbolisation' : null,
        autonomyPriority ? 'autonomie' : null,
        participationPriority ? 'participation' : null,
        intermodalPriority ? 'pluriexpressionnalité' : null,
      ].filter(Boolean) as string[]
    )
  )

  const summary =
    focusAreas.length > 0
      ? `Priorités cliniques actives : ${focusAreas.join(', ')}.`
      : 'Bilan initial présent, sans priorité clinique interprétable automatiquement.'

  return {
    hasAssessment: true,
    activeAxes,
    selectedObjectives,
    priorities: {
      regulationPriority,
      relationalPriority,
      sensoryPriority,
      expressivePriority,
      symbolicPriority,
      autonomyPriority,
      participationPriority,
      intermodalPriority,
    },
    focusAreas,
    vigilanceKeywords,
    intentKeywords,
    summary,
  }
}