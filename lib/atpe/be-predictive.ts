export type PredictiveSession = {
  id?: string
  session_number?: number | null
  emotional_score?: number | null
  body_score?: number | null
  symbolic_score?: number | null
  regulation_score?: number | null
  dynamic_score?: number | null
  engagement_score?: number | null
  awareness_score?: number | null
  clinical_summary?: string | null
}

export type PredictiveReport = {
  ruptureRisk: {
    score: number
    level: 'Faible' | 'Modéré' | 'Élevé'
    reasons: string[]
  }
  evolutionPotential: {
    score: number
    level: 'Faible' | 'Modéré' | 'Élevé'
    reasons: string[]
  }
  orientation: string
  recommendedProtocol: string[]
  synthesis: string
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function avg(values: number[]) {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function getTrend(values: number[]) {
  if (values.length < 2) return 0
  const first = values[0]
  const last = values[values.length - 1]
  return last - first
}

function getLast<T>(arr: T[]) {
  return arr.length ? arr[arr.length - 1] : undefined
}

export function buildPredictiveReport(rawSessions: PredictiveSession[]): PredictiveReport {
  const sessions = (rawSessions ?? []).filter(Boolean)

  const emotional = sessions.map((s) => safeNumber(s.emotional_score))
  const body = sessions.map((s) => safeNumber(s.body_score))
  const symbolic = sessions.map((s) => safeNumber(s.symbolic_score))
  const regulation = sessions.map((s) => safeNumber(s.regulation_score))
  const dynamic = sessions.map((s) => safeNumber(s.dynamic_score))
  const engagement = sessions.map((s) => safeNumber(s.engagement_score))
  const awareness = sessions.map((s) => safeNumber(s.awareness_score))

  const meanEmotional = avg(emotional)
  const meanBody = avg(body)
  const meanSymbolic = avg(symbolic)
  const meanRegulation = avg(regulation)
  const meanDynamic = avg(dynamic)
  const meanEngagement = avg(engagement)
  const meanAwareness = avg(awareness)

  const regulationTrend = getTrend(regulation)
  const engagementTrend = getTrend(engagement)
  const symbolicTrend = getTrend(symbolic)
  const dynamicTrend = getTrend(dynamic)

  const lastSession = getLast(sessions)
  const lastRegulation = safeNumber(lastSession?.regulation_score)
  const lastEngagement = safeNumber(lastSession?.engagement_score)
  const lastDynamic = safeNumber(lastSession?.dynamic_score)
  const lastSymbolic = safeNumber(lastSession?.symbolic_score)

  const ruptureReasons: string[] = []
  let ruptureRaw = 0

  if (sessions.length <= 2) {
    ruptureRaw += 15
    ruptureReasons.push('historique clinique encore court, stabilité du lien à confirmer')
  }

  if (meanEngagement < 4) {
    ruptureRaw += 20
    ruptureReasons.push('engagement moyen faible')
  }

  if (meanRegulation < 4) {
    ruptureRaw += 20
    ruptureReasons.push('régulation émotionnelle fragile')
  }

  if (engagementTrend < 0) {
    ruptureRaw += 15
    ruptureReasons.push('baisse progressive de l’engagement')
  }

  if (regulationTrend < 0) {
    ruptureRaw += 15
    ruptureReasons.push('diminution de la capacité de régulation')
  }

  if (lastEngagement <= 3) {
    ruptureRaw += 10
    ruptureReasons.push('dernier niveau d’engagement bas')
  }

  if (lastRegulation <= 3) {
    ruptureRaw += 10
    ruptureReasons.push('dernier niveau de régulation bas')
  }

  if (!ruptureReasons.length) {
    ruptureReasons.push('indicateurs relationnels et autorégulateurs globalement stables')
  }

  const ruptureScore = clamp(ruptureRaw)
  const ruptureLevel: 'Faible' | 'Modéré' | 'Élevé' =
    ruptureScore >= 65 ? 'Élevé' : ruptureScore >= 35 ? 'Modéré' : 'Faible'

  const evolutionReasons: string[] = []
  let evolutionRaw = 0

  evolutionRaw += meanDynamic * 5
  evolutionRaw += meanSymbolic * 4
  evolutionRaw += meanAwareness * 3
  evolutionRaw += meanBody * 2
  evolutionRaw += Math.max(0, dynamicTrend) * 5
  evolutionRaw += Math.max(0, symbolicTrend) * 5
  evolutionRaw += Math.max(0, engagementTrend) * 4
  evolutionRaw += Math.max(0, regulationTrend) * 4

  if (sessions.length >= 4) {
    evolutionRaw += 8
    evolutionReasons.push('matériau clinique suffisamment étayé pour observer une trajectoire')
  }

  if (meanDynamic >= 6) {
    evolutionReasons.push('dynamique d’initiative favorable')
  }

  if (meanSymbolic >= 6) {
    evolutionReasons.push('capacité symbolique mobilisable')
  }

  if (meanAwareness >= 5) {
    evolutionReasons.push('niveau de conscience de soi exploitable')
  }

  if (dynamicTrend > 0) {
    evolutionReasons.push('progression de l’initiative au fil des séances')
  }

  if (symbolicTrend > 0) {
    evolutionReasons.push('progression de l’élaboration symbolique')
  }

  if (lastDynamic >= 6 && lastSymbolic >= 6) {
    evolutionReasons.push('dernière séance cliniquement porteuse')
  }

  if (!evolutionReasons.length) {
    evolutionReasons.push('potentiel présent mais nécessitant un cadre très soutenant')
  }

  const evolutionScore = clamp(evolutionRaw / 2)
  const evolutionLevel: 'Faible' | 'Modéré' | 'Élevé' =
    evolutionScore >= 65 ? 'Élevé' : evolutionScore >= 35 ? 'Modéré' : 'Faible'

  let orientation = 'Poursuite du suivi ATPE standard'
  const recommendedProtocol: string[] = []

  if (ruptureLevel === 'Élevé') {
    orientation = 'Suivi sécurisé et remobilisation thérapeutique prioritaire'
    recommendedProtocol.push(
      'cadre très contenant avec objectifs courts et explicites',
      'fréquence régulière et rituels d’entrée / clôture',
      'médiations de sécurisation corporelle et sensorielle',
      'évaluation rapprochée de l’alliance thérapeutique'
    )
  } else if (evolutionLevel === 'Élevé') {
    orientation = 'Intensification progressive vers un travail symbolique approfondi'
    recommendedProtocol.push(
      'augmenter progressivement les temps d’élaboration',
      'introduire des médiations créatives plus ouvertes',
      'travailler la mise en récit et la continuité subjective',
      'consolider l’autonomie thérapeutique entre les séances'
    )
  } else {
    orientation = 'Poursuite structurée avec consolidation des acquis'
    recommendedProtocol.push(
      'maintenir une structure stable de séance',
      'alterner appui corporel, expression émotionnelle et symbolisation',
      'renforcer les repères de progression visibles',
      'réévaluer le profil après quelques séances supplémentaires'
    )
  }

  if (meanRegulation < 5) {
    recommendedProtocol.push('inclure systématiquement un volet de co-régulation émotionnelle')
  }

  if (meanBody < 5) {
    recommendedProtocol.push('renforcer les médiations corporelles, rythmiques ou sensori-motrices')
  }

  if (meanSymbolic < 5) {
    recommendedProtocol.push('favoriser les supports concrets avant les élaborations abstraites')
  }

  const synthesis =
    ruptureLevel === 'Élevé'
      ? `Le moteur prédictif met en évidence un risque de rupture thérapeutique ${ruptureLevel.toLowerCase()} (${ruptureScore}/100). Le tableau suggère de prioriser la sécurisation du cadre, la relance de l’engagement et le soutien des capacités de régulation avant toute intensification du travail symbolique.`
      : evolutionLevel === 'Élevé'
        ? `Le moteur prédictif met en évidence un potentiel d’évolution ${evolutionLevel.toLowerCase()} (${evolutionScore}/100), avec des indicateurs favorables d’initiative, de symbolisation et de continuité clinique. Une montée progressive en complexité thérapeutique paraît indiquée.`
        : `Le moteur prédictif indique un profil intermédiaire : risque de rupture ${ruptureLevel.toLowerCase()} (${ruptureScore}/100) et potentiel d’évolution ${evolutionLevel.toLowerCase()} (${evolutionScore}/100). Le cadre doit rester structuré, avec consolidation des acquis et réévaluation régulière.`

  return {
    ruptureRisk: {
      score: ruptureScore,
      level: ruptureLevel,
      reasons: ruptureReasons,
    },
    evolutionPotential: {
      score: evolutionScore,
      level: evolutionLevel,
      reasons: evolutionReasons,
    },
    orientation,
    recommendedProtocol: Array.from(new Set(recommendedProtocol)),
    synthesis,
  }
}