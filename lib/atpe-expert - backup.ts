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
        "La dynamique est basse ; proposer des séquences courtes, progressives et motivantes.",
    })
  }

  if (scores.conscience < 40 && scores.symbolique >= 50) {
    recommendations.push({
      id: 'meaning-making',
      priority: 'medium',
      title: "Accompagner la mise en sens",
      rationale:
        "Les ressources symboliques existent mais demandent un étayage pour être élaborées verbalement.",
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
        "Une régression notable invite à reconsidérer le rythme, les objectifs ou les conditions de prise en charge.",
    })
  }

  if (scores.conscience >= 60 && scores.symbolique >= 60) {
    recommendations.push({
      id: 'deepen-symbolic-work',
      priority: 'low',
      title: 'Approfondir le travail symbolique',
      rationale:
        "Le patient semble disposer d'une bonne capacité de recul et d'élaboration.",
    })
  }

  return recommendations
}

export function buildAtpeExpertSynthesis(
  latest?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): string {
  const scores = computeAtpeDimensionScores(latest)
  const globalScore =
    toFiniteNumber((latest as AtpeInput | undefined | null)?.global_score) ??
    computeAtpeGlobalScore(scores)
  const level = getClinicalLevelLabel(globalScore)
  const profile = getProfileType(scores)
  const supports = buildSupportFactors(scores)
  const alerts = buildClinicalAlerts(latest, previous)
  const { trend, deltaGlobal } = computeEvolutionTrend(latest, previous)
  const ranked = getRankedDimensions(scores)
  const dominant = ranked[0]
  const weakest = ranked[ranked.length - 1]

  const parts: string[] = []

  parts.push(
    `Le profil clinique actuel se situe à un niveau ${level.toLowerCase()}, avec un score global de ${globalScore}/100.`,
  )

  parts.push(`L'organisation dominante évoque un ${profile.toLowerCase()}.`)

  if (trend !== 'Première évaluation' && deltaGlobal !== null) {
    parts.push(
      `Par rapport à la séance précédente, la dynamique d'évolution correspond à : ${trend.toLowerCase()} (${deltaGlobal >= 0 ? '+' : ''}${deltaGlobal} points).`,
    )
  } else {
    parts.push("Il s'agit d'une première lecture comparative ou d'une séance sans antériorité exploitable.")
  }

  if (dominant) {
    parts.push(
      `La dimension la plus soutenue est ${DIMENSION_LABELS[
        dominant.key
      ].toLowerCase()} (${dominant.value}/100).`,
    )
  }

  if (weakest) {
    parts.push(
      `La zone la plus fragile concerne ${DIMENSION_LABELS[
        weakest.key
      ].toLowerCase()} (${weakest.value}/100).`,
    )
  }

  if (supports.length) {
    parts.push(`Les principaux appuis repérables sont : ${supports.join(', ')}.`)
  }

  if (alerts.length) {
    parts.push(
      `Points de vigilance : ${alerts
        .map((alert) => alert.title.toLowerCase())
        .join(', ')}.`,
    )
  }

  return parts.join(' ')
}

export function computeAtpeExpertResult(
  input?: AtpeInput | AtpePartialScores | null,
  previous?: AtpeInput | AtpePartialScores | null,
): AtpeExpertResult {
  const scores = computeAtpeDimensionScores(input)
  const globalScore =
    toFiniteNumber((input as AtpeInput | undefined | null)?.global_score) ??
    computeAtpeGlobalScore(scores)
  const level = getClinicalLevelLabel(globalScore)
  const profile = getProfileType(scores)
  const supportFactors = buildSupportFactors(scores)
  const alerts = buildClinicalAlerts(input, previous)
  const recommendations = buildTherapeuticRecommendations(input, previous)
  const synthesis = buildAtpeExpertSynthesis(input, previous)
  const { trend, deltaGlobal } = computeEvolutionTrend(input, previous)
  const ranked = getRankedDimensions(scores)
  const dominantDimension = ranked[0]?.key ?? null
  const weakestDimension = ranked[ranked.length - 1]?.key ?? null
  const balanceIndex = computeBalanceIndex(scores)

  return {
    scores,
    global: globalScore,
    globalScore,
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

export function getProfileLabel(
  input?: AtpeInput | AtpePartialScores | null,
): string {
  return getProfileType(input)
}

export function getDimensionLabel(key: AtpeDimensionKey): string {
  return DIMENSION_LABELS[key]
}

export function listDimensionEntries(
  input?: AtpeInput | AtpePartialScores | null,
) {
  const scores = computeAtpeDimensionScores(input)

  return DIMENSIONS.map((key) => ({
    key,
    label: DIMENSION_LABELS[key],
    value: scores[key],
  }))
}