export type AtpeFormat = 'individual' | 'group'

export type AtpePhase =
  | 'attitude_interieure'
  | 'creation'
  | 'dialogue_oeuvre'
  | 'partage'

export type AtpeDimensions = {
  frameContainment: number
  bodilyEngagement: number
  primarySymbolization: number
  secondarySymbolization: number
  relationalAvailability: number
  creativeMobility: number
  projectiveIntensity: number
  groupContainment: number
}

export type AtpeClinicalProfile = {
  symbolicProfile:
    | 'pré-symbolique dominant'
    | 'symbolisation primaire active'
    | 'symbolisation secondaire émergente'
    | 'symbolisation intégrative'
  relationalMode:
    | 'retrait'
    | 'appui prudent'
    | 'engagement fluctuant'
    | 'co-création possible'
  groupMode:
    | 'hors groupe'
    | 'fragile en groupe'
    | 'contenu par le groupe'
    | 'porté par le groupe'
  projectionMode:
    | 'faible'
    | 'modéré'
    | 'intense'
    | 'débordant'
}

export type ProjectionMarkers = {
  therapistFeelsConfusion: boolean
  therapistFeelsSuddenFatigue: boolean
  therapistFeelsPressure: boolean
  therapistFeelsIrritation: boolean
  therapistFeelsVoid: boolean
  patientRepeatsWithoutIntegration: boolean
  groupFeelsSameAffect: boolean
  tensionSpreadsQuickly: boolean
}

export type AtpeSessionAdvancedInput = {
  format: AtpeFormat
  mediumPrimary?: string | null
  mediumSecondary?: string | null
  atpePhaseDominant?: AtpePhase | null

  frameContainment?: number | null
  bodilyEngagement?: number | null

  decenteringLevel?: number | null
  centeringLevel?: number | null
  externalizationLevel?: number | null
  workDialogueLevel?: number | null
  sharingLevel?: number | null

  primarySymbolization?: number | null
  secondarySymbolization?: number | null
  relationalAvailability?: number | null
  creativeMobility?: number | null

  projectiveIntensity?: number | null
  groupCohesion?: number | null
  groupContainment?: number | null
  transferDiffraction?: number | null

  therapistPresenceQuality?: number | null
  patientEngagementLevel?: number | null

  markers?: Partial<ProjectionMarkers>
}

export type AtpeEngineOutput = {
  dimensions: AtpeDimensions
  profile: AtpeClinicalProfile
  hypotheses: string[]
  recommendations: {
    medium: string[]
    posture: string[]
    nextStep: string[]
  }
  alerts: {
    level: 'faible' | 'modéré' | 'élevé'
    items: string[]
  }
  narrative: string
}

function clamp(value: number | null | undefined, min = 0, max = 100): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(min, Math.min(max, value))
}

function avg(values: Array<number | null | undefined>): number {
  const clean = values
    .map((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null))
    .filter((v): v is number => v !== null)

  if (!clean.length) return 0
  return clean.reduce((sum, v) => sum + v, 0) / clean.length
}

function countTrue(values: boolean[]): number {
  return values.filter(Boolean).length
}

function normalizeInput(input: AtpeSessionAdvancedInput) {
  return {
    format: input.format,
    mediumPrimary: input.mediumPrimary ?? null,
    mediumSecondary: input.mediumSecondary ?? null,
    atpePhaseDominant: input.atpePhaseDominant ?? null,

    frameContainment: clamp(input.frameContainment),
    bodilyEngagement: clamp(input.bodilyEngagement),

    decenteringLevel: clamp(input.decenteringLevel),
    centeringLevel: clamp(input.centeringLevel),
    externalizationLevel: clamp(input.externalizationLevel),
    workDialogueLevel: clamp(input.workDialogueLevel),
    sharingLevel: clamp(input.sharingLevel),

    primarySymbolization: clamp(input.primarySymbolization),
    secondarySymbolization: clamp(input.secondarySymbolization),
    relationalAvailability: clamp(input.relationalAvailability),
    creativeMobility: clamp(input.creativeMobility),

    projectiveIntensity: clamp(input.projectiveIntensity),
    groupCohesion: clamp(input.groupCohesion),
    groupContainment: clamp(input.groupContainment),
    transferDiffraction: clamp(input.transferDiffraction),

    therapistPresenceQuality: clamp(input.therapistPresenceQuality),
    patientEngagementLevel: clamp(input.patientEngagementLevel),

    markers: {
      therapistFeelsConfusion: !!input.markers?.therapistFeelsConfusion,
      therapistFeelsSuddenFatigue: !!input.markers?.therapistFeelsSuddenFatigue,
      therapistFeelsPressure: !!input.markers?.therapistFeelsPressure,
      therapistFeelsIrritation: !!input.markers?.therapistFeelsIrritation,
      therapistFeelsVoid: !!input.markers?.therapistFeelsVoid,
      patientRepeatsWithoutIntegration:
        !!input.markers?.patientRepeatsWithoutIntegration,
      groupFeelsSameAffect: !!input.markers?.groupFeelsSameAffect,
      tensionSpreadsQuickly: !!input.markers?.tensionSpreadsQuickly,
    } satisfies ProjectionMarkers,
  }
}

export function computeAtpeDimensions(
  rawInput: AtpeSessionAdvancedInput,
): AtpeDimensions {
  const input = normalizeInput(rawInput)

  const frameContainment = avg([
    input.frameContainment,
    input.therapistPresenceQuality,
  ])

  const bodilyEngagement = avg([
    input.bodilyEngagement,
    input.decenteringLevel,
    input.externalizationLevel,
    input.patientEngagementLevel,
  ])

  const primarySymbolization = avg([
    input.primarySymbolization,
    input.externalizationLevel,
    input.decenteringLevel,
    input.bodilyEngagement,
  ])

  const secondarySymbolization = avg([
    input.secondarySymbolization,
    input.workDialogueLevel,
    input.sharingLevel,
    input.centeringLevel,
  ])

  const relationalAvailability = avg([
    input.relationalAvailability,
    input.sharingLevel,
    input.therapistPresenceQuality,
  ])

  const creativeMobility = avg([
    input.creativeMobility,
    input.decenteringLevel,
    input.centeringLevel,
    input.externalizationLevel,
    input.workDialogueLevel,
  ])

  const markerLoad = countTrue([
    input.markers.therapistFeelsConfusion,
    input.markers.therapistFeelsSuddenFatigue,
    input.markers.therapistFeelsPressure,
    input.markers.therapistFeelsIrritation,
    input.markers.therapistFeelsVoid,
    input.markers.patientRepeatsWithoutIntegration,
    input.markers.groupFeelsSameAffect,
    input.markers.tensionSpreadsQuickly,
  ])

  const projectiveIntensity = clamp(
    avg([
      input.projectiveIntensity,
      input.transferDiffraction,
      markerLoad * 12.5,
    ]),
  )

  const groupContainment =
    input.format === 'group'
      ? avg([input.groupContainment, input.groupCohesion, input.frameContainment])
      : 0

  return {
    frameContainment: Math.round(frameContainment),
    bodilyEngagement: Math.round(bodilyEngagement),
    primarySymbolization: Math.round(primarySymbolization),
    secondarySymbolization: Math.round(secondarySymbolization),
    relationalAvailability: Math.round(relationalAvailability),
    creativeMobility: Math.round(creativeMobility),
    projectiveIntensity: Math.round(projectiveIntensity),
    groupContainment: Math.round(groupContainment),
  }
}

export function buildClinicalProfile(
  rawInput: AtpeSessionAdvancedInput,
  dimensions: AtpeDimensions,
): AtpeClinicalProfile {
  const input = normalizeInput(rawInput)

  let symbolicProfile: AtpeClinicalProfile['symbolicProfile'] =
    'pré-symbolique dominant'

  if (
    dimensions.primarySymbolization >= 45 &&
    dimensions.secondarySymbolization < 45
  ) {
    symbolicProfile = 'symbolisation primaire active'
  }

  if (
    dimensions.primarySymbolization >= 50 &&
    dimensions.secondarySymbolization >= 45
  ) {
    symbolicProfile = 'symbolisation secondaire émergente'
  }

  if (
    dimensions.primarySymbolization >= 60 &&
    dimensions.secondarySymbolization >= 60 &&
    input.workDialogueLevel >= 55 &&
    input.sharingLevel >= 55
  ) {
    symbolicProfile = 'symbolisation intégrative'
  }

  let relationalMode: AtpeClinicalProfile['relationalMode'] = 'retrait'

  if (dimensions.relationalAvailability >= 30) {
    relationalMode = 'appui prudent'
  }
  if (dimensions.relationalAvailability >= 50) {
    relationalMode = 'engagement fluctuant'
  }
  if (
    dimensions.relationalAvailability >= 65 &&
    dimensions.creativeMobility >= 60
  ) {
    relationalMode = 'co-création possible'
  }

  let groupMode: AtpeClinicalProfile['groupMode'] = 'hors groupe'

  if (input.format === 'group') {
    groupMode = 'fragile en groupe'
    if (dimensions.groupContainment >= 45) {
      groupMode = 'contenu par le groupe'
    }
    if (
      dimensions.groupContainment >= 70 &&
      input.groupCohesion >= 65 &&
      input.transferDiffraction >= 40
    ) {
      groupMode = 'porté par le groupe'
    }
  }

  let projectionMode: AtpeClinicalProfile['projectionMode'] = 'faible'
  if (dimensions.projectiveIntensity >= 30) projectionMode = 'modéré'
  if (dimensions.projectiveIntensity >= 55) projectionMode = 'intense'
  if (
    dimensions.projectiveIntensity >= 75 ||
    (dimensions.projectiveIntensity >= 55 && dimensions.frameContainment < 40)
  ) {
    projectionMode = 'débordant'
  }

  return {
    symbolicProfile,
    relationalMode,
    groupMode,
    projectionMode,
  }
}

export function buildHypotheses(
  rawInput: AtpeSessionAdvancedInput,
  dimensions: AtpeDimensions,
): string[] {
  const input = normalizeInput(rawInput)
  const hypotheses: string[] = []

  if (
    input.decenteringLevel >= 60 &&
    input.centeringLevel < 40
  ) {
    hypotheses.push(
      "Décentration forte avec centration fragile : mobilisation expressive utile, encore peu stabilisée sur le plan élaboratif.",
    )
  }

  if (
    input.workDialogueLevel < 40 &&
    input.sharingLevel >= 60
  ) {
    hypotheses.push(
      "Partage verbal relativement élevé malgré un dialogue faible avec l'œuvre : possible intellectualisation prématurée.",
    )
  }

  if (
    dimensions.projectiveIntensity >= 60 &&
    dimensions.frameContainment < 45
  ) {
    hypotheses.push(
      'Intensité projective élevée dans un cadre peu contenant : risque de débordement transférentiel ou de surcharge du dispositif.',
    )
  }

  if (
    input.format === 'group' &&
    dimensions.groupContainment >= 60
  ) {
    hypotheses.push(
      'Le groupe semble exercer une fonction contenante susceptible de transformer les dépôts psychiques en matériau plus représentable.',
    )
  }

  const therapistMarkerCount = countTrue([
    input.markers.therapistFeelsConfusion,
    input.markers.therapistFeelsSuddenFatigue,
    input.markers.therapistFeelsPressure,
    input.markers.therapistFeelsIrritation,
    input.markers.therapistFeelsVoid,
  ])

  if (therapistMarkerCount >= 2) {
    hypotheses.push(
      'Les éprouvés contre-transférentiels signalés peuvent correspondre à une réception projective à élaborer en supervision plutôt qu’à interpréter immédiatement.',
    )
  }

  if (
    input.markers.patientRepeatsWithoutIntegration &&
    dimensions.primarySymbolization >= 40 &&
    dimensions.secondarySymbolization < 45
  ) {
    hypotheses.push(
      'Répétition sans intégration claire : possible projection non symbolisée ou symbolisation encore incomplète.',
    )
  }

  if (
    input.markers.groupFeelsSameAffect &&
    input.markers.tensionSpreadsQuickly
  ) {
    hypotheses.push(
      'Diffusion rapide d’un même affect dans le groupe : hypothèse prudente de dépôt projectif groupal.',
    )
  }

  if (!hypotheses.length) {
    hypotheses.push(
      'Le tableau actuel suggère un processus en cours sans indicateur majeur de rupture. Poursuivre l’observation longitudinale.',
    )
  }

  return hypotheses
}

export function buildRecommendations(
  rawInput: AtpeSessionAdvancedInput,
  dimensions: AtpeDimensions,
  profile: AtpeClinicalProfile,
) {
  const input = normalizeInput(rawInput)

  const medium = new Set<string>()
  const posture = new Set<string>()
  const nextStep = new Set<string>()

  if (dimensions.primarySymbolization < 45) {
    medium.add('Médium sensoriel et contenant')
    medium.add('Travail de matière, trace, rythme ou appui corporel')
    posture.add('Renforcer le cadre et la permanence du dispositif')
    posture.add('Soutenir avant de solliciter l’élaboration verbale')
    nextStep.add('Favoriser une médiation transitionnelle courte')
  }

  if (
    dimensions.primarySymbolization >= 45 &&
    dimensions.secondarySymbolization < 55
  ) {
    medium.add('Médium de transcréation simple')
    medium.add('Improvisation guidée à faible charge interprétative')
    posture.add("Soutenir le passage de l'éprouvé vers la forme")
    posture.add("Privilégier le dialogue avec l'œuvre avant l'analyse")
    nextStep.add("Inscrire un temps de reprise après création")
  }

  if (dimensions.secondarySymbolization >= 55) {
    medium.add('Médium mixte avec reprise narrative ou symbolique')
    posture.add('Autoriser une verbalisation plus construite')
    posture.add('Maintenir une interprétation créative prudente')
    nextStep.add('Relier production, ressenti et partage groupal ou individuel')
  }

  if (profile.projectionMode === 'intense' || profile.projectionMode === 'débordant') {
    medium.add('Médiation transitionnelle sécurisante')
    posture.add("Différer l'explication et privilégier la contenance")
    posture.add('Reprendre les éprouvés thérapeutiques en supervision')
    nextStep.add('Alléger la charge interprétative de la séance suivante')
  }

  if (input.format === 'group') {
    if (dimensions.groupContainment < 45) {
      posture.add('Resserer le cadre groupal et les consignes')
      nextStep.add('Structurer davantage les tours de parole et les temps')
    } else {
      medium.add('Créer-ensemble ou co-création séquencée')
      posture.add('Utiliser le groupe comme appui de symbolisation')
      nextStep.add('Favoriser une restitution groupale détoxifiée et assimilable')
    }
  }

  return {
    medium: Array.from(medium),
    posture: Array.from(posture),
    nextStep: Array.from(nextStep),
  }
}

export function buildAlerts(
  dimensions: AtpeDimensions,
  profile: AtpeClinicalProfile,
): { level: 'faible' | 'modéré' | 'élevé'; items: string[] } {
  const items: string[] = []

  if (dimensions.frameContainment < 40) {
    items.push('Cadre faiblement contenant')
  }

  if (
    dimensions.projectiveIntensity >= 60 &&
    dimensions.frameContainment < 45
  ) {
    items.push('Tension projective élevée avec risque de débordement')
  }

  if (
    dimensions.primarySymbolization >= 50 &&
    dimensions.secondarySymbolization < 35
  ) {
    items.push('Écart important entre expression et élaboration')
  }

  if (
    profile.groupMode === 'fragile en groupe' &&
    dimensions.projectiveIntensity >= 50
  ) {
    items.push('Fragilité groupale face à une intensité projective notable')
  }

  if (!items.length) {
    return { level: 'faible', items: ['Pas d’alerte clinique majeure détectée.'] }
  }

  if (items.length >= 3 || profile.projectionMode === 'débordant') {
    return { level: 'élevé', items }
  }

  return { level: 'modéré', items }
}

export function buildNarrative(
  dimensions: AtpeDimensions,
  profile: AtpeClinicalProfile,
  recommendations: ReturnType<typeof buildRecommendations>,
): string {
  const symbolic =
    profile.symbolicProfile === 'pré-symbolique dominant'
      ? 'avec prédominance pré-symbolique'
      : `avec profil de ${profile.symbolicProfile}`

  const relational = `Sur le plan relationnel, le mode dominant est : ${profile.relationalMode}.`
  const group =
    profile.groupMode === 'hors groupe'
      ? 'Le travail se situe hors dynamique groupale.'
      : `Au plan groupal, le sujet apparaît ${profile.groupMode}.`

  const projection = `La dynamique projective est ${profile.projectionMode}.`
  const recommendation =
    recommendations.nextStep[0] ??
    'Poursuivre le travail en maintenant cadre, médiation et reprise clinique.'

  return `Profil actuel : ${symbolic}. Le cadre est coté à ${dimensions.frameContainment}/100 et la mobilité créative à ${dimensions.creativeMobility}/100. ${relational} ${group} ${projection} Recommandation prioritaire : ${recommendation}.`
}

export function runAtpeEngineV2(input: AtpeSessionAdvancedInput): AtpeEngineOutput {
  const dimensions = computeAtpeDimensions(input)
  const profile = buildClinicalProfile(input, dimensions)
  const hypotheses = buildHypotheses(input, dimensions)
  const recommendations = buildRecommendations(input, dimensions, profile)
  const alerts = buildAlerts(dimensions, profile)
  const narrative = buildNarrative(dimensions, profile, recommendations)

  return {
    dimensions,
    profile,
    hypotheses,
    recommendations,
    alerts,
    narrative,
  }
}