export type AtpeDimensionKey =
  | 'emotion'
  | 'corps'
  | 'conscience'
  | 'dynamique'
  | 'symbolique'

export type AtpeScores = {
  emotion: number
  corps: number
  conscience: number
  dynamique: number
  symbolique: number
}

export type AtpePartialScores = Partial<
  Record<AtpeDimensionKey, number | null | undefined>
>

export type AtpeInput = {
  id?: string | null
  emotion?: number | null
  emotional_score?: number | null
  corps?: number | null
  body_score?: number | null
  conscience?: number | null
  consciousness_score?: number | null
  dynamique?: number | null
  dynamic_score?: number | null
  symbolique?: number | null
  symbolic_score?: number | null
  global_score?: number | null
  session_number?: number | null
  created_at?: string | null
  patient_id?: string | null
}

export type AtpeClinicalLevel =
  | 'Très fragile'
  | 'Fragile'
  | 'Intermédiaire'
  | 'Favorable'
  | 'Très favorable'

export type AtpeProfileType =
  | 'Profil vulnérable global'
  | 'Profil émotionnel'
  | 'Profil corporel'
  | 'Profil réflexif'
  | 'Profil dynamique'
  | 'Profil symbolique'
  | 'Profil homogène'
  | 'Profil mixte'
  | 'Profil dissocié'

export type AtpeEvolutionTrend =
  | 'Première évaluation'
  | 'Amélioration significative'
  | 'Amélioration légère'
  | 'Stagnation'
  | 'Régression légère'
  | 'Régression significative'

export type AtpeClinicalAlert = {
  id: string
  level: 'info' | 'warning' | 'critical'
  title: string
  description: string
}

export type AtpeTherapeuticRecommendation = {
  id: string
  priority: 'low' | 'medium' | 'high'
  title: string
  rationale: string
}

export type AtpeExpertResult = {
  scores: AtpeScores
  global: number
  globalScore: number
  level: AtpeClinicalLevel
  profile: AtpeProfileType
  supportFactors: string[]
  alerts: AtpeClinicalAlert[]
  recommendations: AtpeTherapeuticRecommendation[]
  synthesis: string
  evolution: AtpeEvolutionTrend
  deltaGlobal: number | null
  dominantDimension: AtpeDimensionKey | null
  weakestDimension: AtpeDimensionKey | null
  balanceIndex: number
}

export type ExpertObservationInput = {
  posture?: 'stable' | 'voutee' | 'agitee' | null
  tonus?: 'bas' | 'moyen' | 'eleve' | null
  respiration?: 'courte' | 'ample' | 'bloquee' | 'modulee' | null
  micro_gestes?: 'absents' | 'presents' | 'riches' | null

  engagement_relationnel?: 'faible' | 'moyen' | 'bon' | null
  verbalisation?: 'faible' | 'moyenne' | 'bonne' | null
  latence?: 'faible' | 'moyenne' | 'forte' | null

  images_mentales?: boolean | null
  mouvement_corporel?: 'faible' | 'leger' | 'present' | null

  reaction_musique?: boolean | null
  relachement_tonique_musique?: boolean | null
  verbalisation_emotionnelle_musique?: boolean | null

  fatigue?: 'faible' | 'moyenne' | 'forte' | null
  attention?: 'stable' | 'fluctuante' | 'basse' | null
  sensibilite_stimuli_doux?: boolean | null

  notes?: string | null
}

export type ExpertDerivedProfile =
  | 'inhibé'
  | 'sensoriel fin'
  | 'visuo-kinesthésique'

export type ExpertRisk =
  | 'repli relationnel'
  | 'surcharge sensorielle'

export type ExpertProtocol = {
  cadre: {
    duree: string
    rythme: string
    environnement: string
    stimulation: string
  }
  mediations: {
    principale: string
    secondaire: string[]
    eviter: string[]
  }
  objectifs: string[]
}

export type ExpertRecommendationBundle = {
  profile_type: ExpertDerivedProfile
  protocol: ExpertProtocol
}

export type ExpertV1Result = {
  profiles: ExpertDerivedProfile[]
  risks: ExpertRisk[]
  dominantModality: string | null
  fatigueLevel: 'faible' | 'moyenne' | 'forte' | null
  engagementLevel: 'faible' | 'moyen' | 'bon' | null
  emotionalRegulation:
    | 'fragile'
    | 'modérée'
    | 'contenue'
    | 'soutenue par médiation'
    | null
  notes: string[]
  recommendations: ExpertRecommendationBundle[]
  synthesis: string
}

export type ExpertToleranceLevel = 'très basse' | 'basse' | 'modérée' | 'bonne'
export type ExpertRelationalAvailability =
  | 'très limitée'
  | 'prudente'
  | 'accessible'
  | 'bonne'
export type ExpertEntryMode =
  | 'sensoriel'
  | 'musical'
  | 'visuel'
  | 'corporel léger'
  | 'relationnel contenant'
export type ExpertClinicalLoad =
  | 'très élevée'
  | 'élevée'
  | 'modérée'
  | 'contenue'
export type ExpertSessionStrategy =
  | 'sécurisation et contenance'
  | 'régulation douce'
  | 'engagement progressif'
  | 'élaboration symbolique'
  | 'soutien relationnel médiatisé'

export type ExpertV2Result = {
  profiles: ExpertDerivedProfile[]
  risks: ExpertRisk[]
  dominantModality: string | null
  fatigueLevel: 'faible' | 'moyenne' | 'forte' | null
  engagementLevel: 'faible' | 'moyen' | 'bon' | null
  emotionalRegulation:
    | 'fragile'
    | 'modérée'
    | 'contenue'
    | 'soutenue par médiation'
    | null
  toleranceLevel: ExpertToleranceLevel
  relationalAvailability: ExpertRelationalAvailability
  entryMode: ExpertEntryMode
  clinicalLoad: ExpertClinicalLoad
  sessionStrategy: ExpertSessionStrategy
  contraindications: string[]
  notes: string[]
  recommendations: ExpertRecommendationBundle[]
  synthesis: string
  therapistFocus: string[]
}

const DIMENSIONS: AtpeDimensionKey[] = [
  'emotion',
  'corps',
  'conscience',
  'dynamique',
  'symbolique',
]

const DIMENSION_LABELS: Record<AtpeDimensionKey, string> = {
  emotion: 'Émotion',
  corps: 'Corps',
  conscience: 'Conscience',
  dynamique: 'Dynamique',
  symbolique: 'Symbolique',
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function uniqueStrings<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values))
}

export function normalizeAtpeScore(value: unknown, fallback = 0): number {
  const numeric = toFiniteNumber(value)
  return numeric === null ? fallback : clampScore(numeric)
}

export function normalizeAtpeScores(
  input?: AtpePartialScores | null,
): AtpeScores {
  return {
    emotion: normalizeAtpeScore(input?.emotion),
    corps: normalizeAtpeScore(input?.corps),
    conscience: normalizeAtpeScore(input?.conscience),
    dynamique: normalizeAtpeScore(input?.dynamique),
    symbolique: normalizeAtpeScore(input?.symbolique),
  }
}

export function mapSessionToAtpeScores(input?: AtpeInput | null): AtpeScores {
  return {
    emotion: normalizeAtpeScore(input?.emotion ?? input?.emotional_score),
    corps: normalizeAtpeScore(input?.corps ?? input?.body_score),
    conscience: normalizeAtpeScore(
      input?.conscience ?? input?.consciousness_score,
    ),
    dynamique: normalizeAtpeScore(input?.dynamique ?? input?.dynamic_score),
    symbolique: normalizeAtpeScore(input?.symbolique ?? input?.symbolic_score),
  }
}

export function computeAtpeDimensionScores(
  input?: AtpeInput | AtpePartialScores | null,
): AtpeScores {
  const maybeSessionLike = input as AtpeInput | null | undefined

  const hasSessionAliases =
    maybeSessionLike?.emotional_score !== undefined ||
    maybeSessionLike?.body_score !== undefined ||
    maybeSessionLike?.consciousness_score !== undefined ||
    maybeSessionLike?.dynamic_score !== undefined ||
    maybeSessionLike?.symbolic_score !== undefined

  return hasSessionAliases
    ? mapSessionToAtpeScores(maybeSessionLike)
    : normalizeAtpeScores(input as AtpePartialScores | null | undefined)
}

export function computeAtpeExpertScores(
  input?: AtpeInput | AtpePartialScores | null,
): AtpeScores {
  return computeAtpeDimensionScores(input)
}

export function computeAtpeGlobalScore(
  input?: AtpeInput | AtpePartialScores | null,
): number {
  const scores = computeAtpeDimensionScores(input)
  const values = DIMENSIONS.map((key) => scores[key])
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return clampScore(average)
}

export function computeBEGlobalScore(
  input?: AtpeInput | AtpePartialScores | null,
): number {
  return computeAtpeGlobalScore(input)
}

export function getClinicalLevelLabel(score: number): AtpeClinicalLevel {
  if (score >= 80) return 'Très favorable'
  if (score >= 60) return 'Favorable'
  if (score >= 40) return 'Intermédiaire'
  if (score >= 20) return 'Fragile'
  return 'Très fragile'
}

function getRankedDimensions(scores: AtpeScores) {
  return DIMENSIONS.map((key) => ({ key, value: scores[key] })).sort(
    (a, b) => b.value - a.value,
  )
}

export function getProfileType(
  input?: AtpeInput | AtpePartialScores | null,
): AtpeProfileType {
  const scores = computeAtpeDimensionScores(input)
  const ranked = getRankedDimensions(scores)
  const highest = ranked[0]
  const lowest = ranked[ranked.length - 1]

  if (!highest || !lowest) return 'Profil mixte'
  if (highest.value < 35) return 'Profil vulnérable global'
  if (highest.value - lowest.value >= 35) return 'Profil dissocié'
  if (highest.value - lowest.value <= 10) return 'Profil homogène'

  switch (highest.key) {
    case 'emotion':
      return 'Profil émotionnel'
    case 'corps':
      return 'Profil corporel'
    case 'conscience':
      return 'Profil réflexif'
    case 'dynamique':
      return 'Profil dynamique'
    case 'symbolique':
      return 'Profil symbolique'
    default:
      return 'Profil mixte'
  }
}

export function buildSupportFactors(
  input?: AtpeInput | AtpePartialScores | null,
): string[] {
  const scores = computeAtpeDimensionScores(input)
  const factors: string[] = []

  if (scores.emotion >= 60) factors.push('Mobilisation émotionnelle')
  if (scores.corps >= 60) factors.push('Ancrage corporel')
  if (scores.conscience >= 60) factors.push('Capacité réflexive')
  if (scores.dynamique >= 60) factors.push('Élan dynamique')
  if (scores.symbolique >= 60) factors.push('Ressources symboliques')

  const average = computeAtpeGlobalScore(scores)
  if (!factors.length && average >= 40) {
    factors.push('Stabilité clinique relative')
  }

  if (scores.conscience >= 55 && scores.symbolique >= 55) {
    factors.push("Capacité d'élaboration")
  }

  return factors
}

export function computeBalanceIndex(
  input?: AtpeInput | AtpePartialScores | null,
): number {
  const scores = computeAtpeDimensionScores(input)
  const values = DIMENSIONS.map((key) => scores[key])
  const max = Math.max(...values)
  const min = Math.min(...values)
  return clampScore(100 - (max - min))
}

export function computeEvolutionTrend(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): { trend: AtpeEvolutionTrend; deltaGlobal: number | null } {
  if (!latest || !previous) {
    return { trend: 'Première évaluation', deltaGlobal: null }
  }

  const latestGlobal =
    toFiniteNumber((latest as AtpeInput)?.global_score) ??
    computeAtpeGlobalScore(latest)
  const previousGlobal =
    toFiniteNumber((previous as AtpeInput)?.global_score) ??
    computeAtpeGlobalScore(previous)

  const delta = latestGlobal - previousGlobal

  if (delta >= 15) {
    return { trend: 'Amélioration significative', deltaGlobal: delta }
  }
  if (delta >= 5) {
    return { trend: 'Amélioration légère', deltaGlobal: delta }
  }
  if (delta <= -15) {
    return { trend: 'Régression significative', deltaGlobal: delta }
  }
  if (delta <= -5) {
    return { trend: 'Régression légère', deltaGlobal: delta }
  }

  return { trend: 'Stagnation', deltaGlobal: delta }
}

export function buildClinicalAlerts(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): AtpeClinicalAlert[] {
  const latestScores = computeAtpeDimensionScores(latest)
  const latestGlobal =
    toFiniteNumber((latest as AtpeInput | undefined | null)?.global_score) ??
    computeAtpeGlobalScore(latestScores)

  const previousGlobal =
    previous
      ? toFiniteNumber((previous as AtpeInput | undefined | null)?.global_score) ??
        computeAtpeGlobalScore(previous)
      : null

  const alerts: AtpeClinicalAlert[] = []

  if (latestGlobal < 40) {
    alerts.push({
      id: 'low-global-score',
      level: latestGlobal < 20 ? 'critical' : 'warning',
      title: 'Vigilance clinique',
      description:
        'Le score global récent paraît bas et justifie une attention clinique renforcée.',
    })
  }

  if (previousGlobal !== null && latestGlobal < previousGlobal - 15) {
    alerts.push({
      id: 'global-score-drop',
      level: 'warning',
      title: 'Régression notable',
      description:
        'Une baisse importante du score global apparaît entre les deux dernières séances.',
    })
  }

  const fragileDimensions = DIMENSIONS.filter((key) => latestScores[key] < 30)

  if (fragileDimensions.length >= 2) {
    alerts.push({
      id: 'multiple-fragilities',
      level: 'warning',
      title: 'Fragilités multiples',
      description: `Plusieurs dimensions apparaissent fragiles : ${fragileDimensions
        .map((key) => DIMENSION_LABELS[key].toLowerCase())
        .join(', ')}.`,
    })
  }

  if (latestScores.dynamique < 25 && latestScores.corps < 25) {
    alerts.push({
      id: 'withdrawal-risk',
      level: 'critical',
      title: 'Retrait / inhibition',
      description:
        "L'ancrage corporel et la dynamique sont très bas, ce qui peut traduire un état de retrait marqué.",
    })
  }

  if (latestScores.emotion >= 75 && latestScores.conscience < 35) {
    alerts.push({
      id: 'emotional-overflow',
      level: 'warning',
      title: 'Débordement émotionnel possible',
      description:
        "La mobilisation émotionnelle paraît élevée tandis que la mise en sens reste basse.",
    })
  }

  if (latestScores.symbolique >= 65 && latestScores.conscience >= 65) {
    alerts.push({
      id: 'good-reflective-resource',
      level: 'info',
      title: "Ressources d'élaboration",
      description:
        'Les dimensions symbolique et réflexive constituent un appui thérapeutique mobilisable.',
    })
  }

  const balance = computeBalanceIndex(latestScores)
  if (balance < 55) {
    alerts.push({
      id: 'profile-imbalance',
      level: 'info',
      title: 'Déséquilibre inter-dimensionnel',
      description:
        'Le profil présente des écarts marqués entre dimensions fortes et fragiles.',
    })
  }

  return alerts
}

export function buildTherapeuticRecommendations(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): AtpeTherapeuticRecommendation[] {
  const scores = computeAtpeDimensionScores(latest)
  const alerts = buildClinicalAlerts(latest, previous)
  const recommendations: AtpeTherapeuticRecommendation[] = []

  if (scores.corps < 40) {
    recommendations.push({
      id: 'body-grounding',
      priority: 'high',
      title: 'Renforcer les médiations corporelles',
      rationale:
        "L'ancrage corporel apparaît fragile ; privilégier des dispositifs contenant, rythmiques et sensoriels.",
    })
  }

  if (scores.dynamique < 40) {
    recommendations.push({
      id: 'activation-support',
      priority: 'high',
      title: "Soutenir l'élan et l'engagement",
      rationale:
        'La dynamique est basse ; proposer des séquences courtes, progressives et motivantes.',
    })
  }

  if (scores.conscience < 40 && scores.symbolique >= 50) {
    recommendations.push({
      id: 'meaning-making',
      priority: 'medium',
      title: 'Accompagner la mise en sens',
      rationale:
        'Les ressources symboliques existent mais demandent un étayage pour être élaborées verbalement.',
    })
  }

  if (scores.emotion >= 70 && scores.conscience < 35) {
    recommendations.push({
      id: 'emotion-containment',
      priority: 'high',
      title: "Contenir avant d'interpréter",
      rationale:
        'La charge émotionnelle semble haute ; privilégier la régulation et la sécurité avant le travail analytique.',
    })
  }

  if (alerts.some((a) => a.id === 'global-score-drop')) {
    recommendations.push({
      id: 'review-setting',
      priority: 'high',
      title: 'Réévaluer le cadre thérapeutique',
      rationale:
        'Une régression notable invite à reconsidérer le rythme, la fréquence ou le niveau de sollicitation proposé.',
    })
  }

  if (scores.symbolique >= 60) {
    recommendations.push({
      id: 'symbolic-support',
      priority: 'medium',
      title: 'Mobiliser les supports symboliques',
      rationale:
        'La dimension symbolique peut soutenir le travail thérapeutique via images, métaphores et productions médiatisées.',
    })
  }

  if (scores.emotion < 35 && scores.corps < 35 && scores.dynamique < 35) {
    recommendations.push({
      id: 'containment-first',
      priority: 'high',
      title: 'Prioriser contenance et sécurité',
      rationale:
        'Quand plusieurs dimensions de base sont basses, la priorité va à la stabilité relationnelle et au contenant clinique.',
    })
  }

  return recommendations
}

export function buildAtpeSynthesis(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): string {
  const scores = computeAtpeDimensionScores(latest)
  const global = computeAtpeGlobalScore(scores)
  const level = getClinicalLevelLabel(global)
  const profile = getProfileType(scores)
  const { trend, deltaGlobal } = computeEvolutionTrend(latest, previous)
  const ranked = getRankedDimensions(scores)

  const strongest = ranked[0]
  const weakest = ranked[ranked.length - 1]

  const deltaText =
    deltaGlobal === null
      ? 'Aucune comparaison antérieure n’est disponible.'
      : `L’évolution globale est de ${deltaGlobal > 0 ? '+' : ''}${Math.round(
          deltaGlobal,
        )} points.`

  return [
    `Le profil actuel se situe à un niveau ${level.toLowerCase()} avec un score global de ${global}/100.`,
    `Le fonctionnement s’organise principalement autour d’un ${profile.toLowerCase()}.`,
    strongest
      ? `La dimension la plus soutenue est ${DIMENSION_LABELS[
          strongest.key
        ].toLowerCase()} (${strongest.value}/100).`
      : null,
    weakest
      ? `La dimension la plus fragile est ${DIMENSION_LABELS[
          weakest.key
        ].toLowerCase()} (${weakest.value}/100).`
      : null,
    `Tendance récente : ${trend.toLowerCase()}.`,
    deltaText,
  ]
    .filter(Boolean)
    .join(' ')
}

export function runAtpeExpertAnalysis(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): AtpeExpertResult {
  const scores = computeAtpeDimensionScores(latest)
  const global = computeAtpeGlobalScore(scores)
  const level = getClinicalLevelLabel(global)
  const profile = getProfileType(scores)
  const supportFactors = buildSupportFactors(scores)
  const alerts = buildClinicalAlerts(latest, previous)
  const recommendations = buildTherapeuticRecommendations(latest, previous)
  const synthesis = buildAtpeSynthesis(latest, previous)
  const { trend, deltaGlobal } = computeEvolutionTrend(latest, previous)
  const ranked = getRankedDimensions(scores)
  const dominantDimension = ranked[0]?.key ?? null
  const weakestDimension = ranked[ranked.length - 1]?.key ?? null
  const balanceIndex = computeBalanceIndex(scores)

  return {
    scores,
    global,
    globalScore: global,
    level,
    profile,
    supportFactors,
    alerts,
    recommendations,
    synthesis,
    evolution: trend,
    deltaGlobal,
    dominantDimension,
    weakestDimension,
    balanceIndex,
  }
}

const EXPERT_PROTOCOLS: Record<ExpertDerivedProfile, ExpertProtocol> = {
  inhibé: {
    cadre: {
      duree: '30-45 min',
      rythme: 'lent',
      environnement: 'calme, stable',
      stimulation: 'faible',
    },
    mediations: {
      principale: 'musique',
      secondaire: ['dessin paysage', 'sensoriel doux'],
      eviter: ['multi-stimulation', 'tâches complexes'],
    },
    objectifs: [
      'maintenir lien relationnel',
      'prévenir isolement',
      'favoriser engagement progressif',
    ],
  },
  'sensoriel fin': {
    cadre: {
      duree: '30-45 min',
      rythme: 'lent',
      environnement: 'faible charge sensorielle',
      stimulation: 'douce',
    },
    mediations: {
      principale: 'musique',
      secondaire: ['souffle', 'micro-geste', 'pastels doux'],
      eviter: ['contrastes forts', 'enchaînements rapides'],
    },
    objectifs: [
      'soutenir la régulation tonico-émotionnelle',
      'préserver la continuité sensorielle',
      'respecter les seuils de tolérance',
    ],
  },
  'visuo-kinesthésique': {
    cadre: {
      duree: '30-45 min',
      rythme: 'progressif',
      environnement: 'stable',
      stimulation: 'imagée et contenue',
    },
    mediations: {
      principale: 'musique',
      secondaire: ['paysages', 'couleur bleue', 'trace sobre'],
      eviter: ['abstraction forcée', 'consignes complexes'],
    },
    objectifs: [
      'soutenir les images mentales',
      'favoriser la symbolisation',
      'renforcer la continuité identitaire',
    ],
  },
}

export function deriveExpertProfiles(
  input?: ExpertObservationInput | null,
): ExpertDerivedProfile[] {
  if (!input) return []

  const profiles: ExpertDerivedProfile[] = []

  if (
    input.engagement_relationnel === 'faible' &&
    input.verbalisation === 'faible' &&
    input.latence === 'forte'
  ) {
    profiles.push('inhibé')
  }

  if (
    (input.micro_gestes === 'presents' || input.micro_gestes === 'riches') &&
    input.respiration === 'modulee' &&
    input.sensibilite_stimuli_doux === true
  ) {
    profiles.push('sensoriel fin')
  }

  if (input.images_mentales === true && input.mouvement_corporel === 'leger') {
    profiles.push('visuo-kinesthésique')
  }

  return uniqueStrings(profiles)
}

export function deriveExpertRisks(
  input?: ExpertObservationInput | null,
): ExpertRisk[] {
  if (!input) return []

  const risks: ExpertRisk[] = []

  if (input.fatigue === 'forte' && input.attention === 'fluctuante') {
    risks.push('repli relationnel')
  }

  if (input.fatigue === 'forte' && input.sensibilite_stimuli_doux === true) {
    risks.push('surcharge sensorielle')
  }

  return uniqueStrings(risks)
}

export function deriveDominantModality(
  input?: ExpertObservationInput | null,
): string | null {
  if (!input) return null

  if (
    input.reaction_musique === true &&
    input.relachement_tonique_musique === true &&
    input.verbalisation_emotionnelle_musique === true
  ) {
    return 'musique'
  }

  if (input.images_mentales === true) {
    return 'visuel'
  }

  if (input.micro_gestes === 'presents' || input.micro_gestes === 'riches') {
    return 'sensoriel'
  }

  return null
}

export function deriveEmotionalRegulation(
  input?: ExpertObservationInput | null,
): ExpertV1Result['emotionalRegulation'] {
  if (!input) return null

  if (
    input.reaction_musique === true &&
    input.relachement_tonique_musique === true
  ) {
    return 'soutenue par médiation'
  }

  if (input.verbalisation === 'faible' && input.latence === 'forte') {
    return 'contenue'
  }

  if (input.fatigue === 'forte' && input.attention === 'fluctuante') {
    return 'fragile'
  }

  return 'modérée'
}

export function buildExpertNotes(
  input?: ExpertObservationInput | null,
  profiles: ExpertDerivedProfile[] = [],
  risks: ExpertRisk[] = [],
  dominantModality?: string | null,
): string[] {
  if (!input) return []

  const notes: string[] = []

  if (input.fatigue === 'forte') {
    notes.push('Fatigabilité importante nécessitant un cadre lent et peu stimulant.')
  }

  if (input.sensibilite_stimuli_doux === true) {
    notes.push('Sensibilité sensorielle marquée avec nécessité de contrôler la charge des stimuli.')
  }

  if (input.reaction_musique === true || dominantModality === 'musique') {
    notes.push('Réactivité musicale utilisable comme médiation principale de régulation.')
  }

  if (input.micro_gestes === 'presents' || input.micro_gestes === 'riches') {
    notes.push('Présence de micro-gestes disponibles comme point d’entrée thérapeutique fin.')
  }

  if (input.images_mentales === true) {
    notes.push('Appui possible sur les images mentales, notamment les paysages et les repères visuels contenus.')
  }

  if (profiles.includes('inhibé')) {
    notes.push('Le profil évoque une inhibition relationnelle avec besoin de progressivité et de sécurité.')
  }

  if (profiles.includes('sensoriel fin')) {
    notes.push('Le fonctionnement sensoriel fin doit être respecté avec des médiations douces et graduées.')
  }

  if (profiles.includes('visuo-kinesthésique')) {
    notes.push('Le profil visuo-kinesthésique soutient les médiations associant image, souffle et mouvement léger.')
  }

  if (risks.includes('repli relationnel')) {
    notes.push('Risque de repli relationnel en cas de fatigue ou de surcharge attentionnelle.')
  }

  if (risks.includes('surcharge sensorielle')) {
    notes.push('Risque de surcharge sensorielle si le cadre devient trop contrasté ou trop rapide.')
  }

  return uniqueStrings(notes)
}

export function buildExpertRecommendations(
  profiles: ExpertDerivedProfile[],
): ExpertRecommendationBundle[] {
  return profiles.map((profile) => ({
    profile_type: profile,
    protocol: EXPERT_PROTOCOLS[profile],
  }))
}

export function buildExpertSynthesis(
  input?: ExpertObservationInput | null,
): string {
  if (!input) {
    return 'Aucune observation clinique experte disponible.'
  }

  const profiles = deriveExpertProfiles(input)
  const risks = deriveExpertRisks(input)
  const dominantModality = deriveDominantModality(input)

  const parts: string[] = []

  if (profiles.length) {
    parts.push(`Profils repérés : ${profiles.join(', ')}.`)
  } else {
    parts.push('Aucun profil expert spécifique n’a été automatiquement repéré.')
  }

  if (dominantModality) {
    parts.push(`Modalité dominante probable : ${dominantModality}.`)
  }

  if (input.fatigue) {
    parts.push(`Niveau de fatigue observé : ${input.fatigue}.`)
  }

  if (input.engagement_relationnel) {
    parts.push(`Engagement relationnel : ${input.engagement_relationnel}.`)
  }

  if (risks.length) {
    parts.push(`Risques de vigilance : ${risks.join(', ')}.`)
  }

  if (
    input.reaction_musique === true &&
    input.relachement_tonique_musique === true
  ) {
    parts.push('La musique semble avoir un effet de relâchement tonique et de soutien régulateur.')
  }

  if (input.images_mentales === true) {
    parts.push('Les images mentales paraissent mobilisables dans le travail thérapeutique.')
  }

  return parts.join(' ')
}

export function runAtpeExpertV1(
  input?: ExpertObservationInput | null,
): ExpertV1Result {
  const profiles = deriveExpertProfiles(input)
  const risks = deriveExpertRisks(input)
  const dominantModality = deriveDominantModality(input)
  const fatigueLevel = input?.fatigue ?? null
  const engagementLevel = input?.engagement_relationnel ?? null
  const emotionalRegulation = deriveEmotionalRegulation(input)
  const recommendations = buildExpertRecommendations(profiles)
  const notes = buildExpertNotes(input, profiles, risks, dominantModality)
  const synthesis = buildExpertSynthesis(input)

  return {
    profiles,
    risks,
    dominantModality,
    fatigueLevel,
    engagementLevel,
    emotionalRegulation,
    notes,
    recommendations,
    synthesis,
  }
}

export function deriveToleranceLevel(
  input?: ExpertObservationInput | null,
): ExpertToleranceLevel {
  if (!input) return 'modérée'

  if (
    input.fatigue === 'forte' &&
    input.sensibilite_stimuli_doux === true &&
    input.attention === 'fluctuante'
  ) {
    return 'très basse'
  }

  if (
    input.fatigue === 'forte' ||
    input.sensibilite_stimuli_doux === true ||
    input.attention === 'fluctuante'
  ) {
    return 'basse'
  }

  if (input.fatigue === 'moyenne') {
    return 'modérée'
  }

  return 'bonne'
}

export function deriveRelationalAvailability(
  input?: ExpertObservationInput | null,
): ExpertRelationalAvailability {
  if (!input) return 'prudente'

  if (
    input.engagement_relationnel === 'faible' &&
    input.verbalisation === 'faible' &&
    input.latence === 'forte'
  ) {
    return 'très limitée'
  }

  if (
    input.engagement_relationnel === 'faible' ||
    input.verbalisation === 'faible'
  ) {
    return 'prudente'
  }

  if (input.engagement_relationnel === 'moyen') {
    return 'accessible'
  }

  return 'bonne'
}

export function deriveEntryMode(
  input?: ExpertObservationInput | null,
): ExpertEntryMode {
  if (!input) return 'relationnel contenant'

  if (
    input.reaction_musique === true &&
    input.relachement_tonique_musique === true
  ) {
    return 'musical'
  }

  if (input.micro_gestes === 'presents' || input.micro_gestes === 'riches') {
    return 'sensoriel'
  }

  if (input.images_mentales === true) {
    return 'visuel'
  }

  if (input.mouvement_corporel === 'leger') {
    return 'corporel léger'
  }

  return 'relationnel contenant'
}

export function deriveClinicalLoad(
  input?: ExpertObservationInput | null,
): ExpertClinicalLoad {
  if (!input) return 'modérée'

  const burdenScore =
    (input.fatigue === 'forte' ? 2 : input.fatigue === 'moyenne' ? 1 : 0) +
    (input.attention === 'fluctuante' || input.attention === 'basse' ? 1 : 0) +
    (input.sensibilite_stimuli_doux === true ? 1 : 0) +
    (input.engagement_relationnel === 'faible' ? 1 : 0)

  if (burdenScore >= 4) return 'très élevée'
  if (burdenScore >= 3) return 'élevée'
  if (burdenScore >= 2) return 'modérée'
  return 'contenue'
}

export function deriveSessionStrategy(
  input?: ExpertObservationInput | null,
): ExpertSessionStrategy {
  const tolerance = deriveToleranceLevel(input)
  const relational = deriveRelationalAvailability(input)
  const entry = deriveEntryMode(input)

  if (tolerance === 'très basse') {
    return 'sécurisation et contenance'
  }

  if (entry === 'musical' || entry === 'sensoriel') {
    return 'régulation douce'
  }

  if (relational === 'très limitée' || relational === 'prudente') {
    return 'soutien relationnel médiatisé'
  }

  if (input?.images_mentales === true) {
    return 'élaboration symbolique'
  }

  return 'engagement progressif'
}

export function deriveContraindications(
  input?: ExpertObservationInput | null,
): string[] {
  if (!input) return []

  const contraindications: string[] = []

  if (input.sensibilite_stimuli_doux === true) {
    contraindications.push('Éviter les contrastes sensoriels forts.')
  }

  if (input.fatigue === 'forte') {
    contraindications.push('Éviter les séances trop longues ou trop denses.')
  }

  if (input.attention === 'fluctuante' || input.attention === 'basse') {
    contraindications.push('Éviter les consignes multiples et les enchaînements rapides.')
  }

  if (
    input.engagement_relationnel === 'faible' &&
    input.verbalisation === 'faible'
  ) {
    contraindications.push('Éviter la verbalisation forcée ou prématurée.')
  }

  if (input.latence === 'forte') {
    contraindications.push('Respecter les temps de silence et de latence.')
  }

  return uniqueStrings(contraindications)
}

export function deriveTherapistFocus(
  input?: ExpertObservationInput | null,
): string[] {
  if (!input) return []

  const focus: string[] = []

  if (input.fatigue === 'forte') {
    focus.push('Surveiller les seuils de fatigabilité pendant toute la séance.')
  }

  if (input.reaction_musique === true) {
    focus.push('Utiliser la musique comme vecteur principal de régulation et de contact.')
  }

  if (input.micro_gestes === 'presents' || input.micro_gestes === 'riches') {
    focus.push('Observer et soutenir les micro-initiatives corporelles fines.')
  }

  if (input.images_mentales === true) {
    focus.push('S’appuyer sur les images mentales comme support de continuité interne.')
  }

  if (
    input.engagement_relationnel === 'faible' &&
    input.latence === 'forte'
  ) {
    focus.push('Maintenir une présence stable sans sur-sollicitation.')
  }

  return uniqueStrings(focus)
}

export function buildExpertV2Synthesis(
  input?: ExpertObservationInput | null,
): string {
  if (!input) {
    return 'Aucune observation clinique experte disponible.'
  }

  const profiles = deriveExpertProfiles(input)
  const risks = deriveExpertRisks(input)
  const tolerance = deriveToleranceLevel(input)
  const relational = deriveRelationalAvailability(input)
  const entry = deriveEntryMode(input)
  const load = deriveClinicalLoad(input)
  const strategy = deriveSessionStrategy(input)

  return [
    profiles.length
      ? `Profils dominants : ${profiles.join(', ')}.`
      : 'Aucun profil expert dominant n’a été détecté.',
    `Tolérance clinique estimée : ${tolerance}.`,
    `Disponibilité relationnelle : ${relational}.`,
    `Mode d’entrée thérapeutique prioritaire : ${entry}.`,
    `Charge clinique actuelle : ${load}.`,
    `Stratégie de séance recommandée : ${strategy}.`,
    risks.length ? `Risques principaux : ${risks.join(', ')}.` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

export function runAtpeExpertV2(
  input?: ExpertObservationInput | null,
): ExpertV2Result {
  const profiles = deriveExpertProfiles(input)
  const risks = deriveExpertRisks(input)
  const dominantModality = deriveDominantModality(input)
  const fatigueLevel = input?.fatigue ?? null
  const engagementLevel = input?.engagement_relationnel ?? null
  const emotionalRegulation = deriveEmotionalRegulation(input)
  const toleranceLevel = deriveToleranceLevel(input)
  const relationalAvailability = deriveRelationalAvailability(input)
  const entryMode = deriveEntryMode(input)
  const clinicalLoad = deriveClinicalLoad(input)
  const sessionStrategy = deriveSessionStrategy(input)
  const contraindications = deriveContraindications(input)
  const therapistFocus = deriveTherapistFocus(input)
  const recommendations = buildExpertRecommendations(profiles)
  const notes = buildExpertNotes(input, profiles, risks, dominantModality)
  const synthesis = buildExpertV2Synthesis(input)

  return {
    profiles,
    risks,
    dominantModality,
    fatigueLevel,
    engagementLevel,
    emotionalRegulation,
    toleranceLevel,
    relationalAvailability,
    entryMode,
    clinicalLoad,
    sessionStrategy,
    contraindications,
    notes,
    recommendations,
    synthesis,
    therapistFocus,
  }
}

export function getDimensionLabel(key: AtpeDimensionKey): string {
  return DIMENSION_LABELS[key] ?? key
}

export function listDimensionEntries(
  input?: AtpeInput | AtpePartialScores | null,
): Array<{
  key: AtpeDimensionKey
  label: string
  value: number
}> {
  const scores = computeAtpeDimensionScores(input)

  return DIMENSIONS.map((key) => ({
    key,
    label: getDimensionLabel(key),
    value: scores[key],
  }))
}

export function computeAtpeExpertResult(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): AtpeExpertResult {
  return runAtpeExpertAnalysis(latest, previous)
}