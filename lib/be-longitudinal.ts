import type { BEClinicalScores } from '@/components/be-expert-report'

export interface SessionLite {
  session_number: number
  emotional_score?: number | null
  body_score?: number | null
  awareness_score?: number | null
  dynamic_score?: number | null
  symbolic_score?: number | null
  regulation_score?: number | null
  engagement_score?: number | null
  clinical_summary?: string | null
  note?: string | null
}

export interface TrajectoryResult {
  trend: 'insuffisant' | 'amélioration' | 'dégradation' | 'stable'
  text: string
}

function average(values: number[]) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function to10(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 10) return 10
  return value
}

function to100(value?: number | null) {
  return Math.round(to10(value) * 10)
}

export function computeSessionScores(session: SessionLite): BEClinicalScores {
  const emotional = to100(session.emotional_score)
  const body = to100(session.body_score)
  const awareness = to10(session.awareness_score)
  const dynamic = to100(session.dynamic_score)
  const symbolic = to100(session.symbolic_score)
  const regulation = to100(session.regulation_score)
  const engagement = to10(session.engagement_score)

  return {
    emotionalExpression: emotional,
    bodyEngagement: body,
    relationalAvailability: Math.round(((awareness + engagement) / 2) * 10),
    symbolicCapacity: symbolic,
    regulationCapacity: regulation,
    initiativeCreativity: dynamic,
  }
}

export function computeGlobalSessionScore(session: SessionLite) {
  const scores = computeSessionScores(session)
  return average(Object.values(scores))
}

export function computeTrajectory(sessions: SessionLite[]): TrajectoryResult {
  const safeSessions = [...(sessions ?? [])]
    .filter((session) => session && typeof session.session_number === 'number')
    .sort((a, b) => a.session_number - b.session_number)

  if (safeSessions.length < 2) {
    return {
      trend: 'insuffisant',
      text: "Le nombre de séances reste insuffisant pour établir une trajectoire clinique fiable. Une lecture longitudinale plus consistante nécessitera davantage de points d’observation.",
    }
  }

  const firstGlobal = computeGlobalSessionScore(safeSessions[0])
  const lastGlobal = computeGlobalSessionScore(
    safeSessions[safeSessions.length - 1]
  )
  const delta = lastGlobal - firstGlobal

  if (delta > 10) {
    return {
      trend: 'amélioration',
      text: "Une amélioration progressive du fonctionnement se dégage de la comparaison des séances, avec un renforcement global des capacités d’engagement, de régulation et d’élaboration.",
    }
  }

  if (delta < -10) {
    return {
      trend: 'dégradation',
      text: "Une fragilisation progressive du fonctionnement apparaît dans le temps, suggérant un besoin de réajustement du cadre thérapeutique, du rythme et des médiations proposées.",
    }
  }

  return {
    trend: 'stable',
    text: "Le fonctionnement apparaît globalement stable sur la période observée, avec des variations cliniques présentes mais sans bascule évolutive majeure à ce stade.",
  }
}

export function buildLongitudinalNarrative(sessions: SessionLite[]) {
  const safeSessions = [...(sessions ?? [])]
    .filter((session) => session && typeof session.session_number === 'number')
    .sort((a, b) => a.session_number - b.session_number)

  const trajectory = computeTrajectory(safeSessions)

  if (!safeSessions.length) {
    return "Aucune séance exploitable n’est actuellement disponible pour produire une analyse longitudinale du processus thérapeutique."
  }

  const first = safeSessions[0]
  const last = safeSessions[safeSessions.length - 1]

  const firstScore = computeGlobalSessionScore(first)
  const lastScore = computeGlobalSessionScore(last)

  return `
L’analyse longitudinale du processus thérapeutique met en évidence une dynamique ${trajectory.trend}.
${trajectory.text}

La comparaison entre la première séance exploitable (séance ${first.session_number}, score global estimé à ${firstScore}/100) et la dernière séance analysée (séance ${last.session_number}, score global estimé à ${lastScore}/100) permet de situer l’évolution générale du fonctionnement dans le temps.

Sur l’ensemble des séances, on observe des variations des capacités d’engagement, de régulation, de disponibilité relationnelle et de symbolisation. Ces variations traduisent l’ajustement progressif du patient au cadre thérapeutique, ainsi que la manière dont les ressources et les fragilités se redistribuent au fil du suivi.

L’enjeu clinique principal réside désormais dans la consolidation des acquis, la stabilisation des modalités de fonctionnement les plus favorables et la prévention des ruptures de continuité dans le processus thérapeutique.
  `.trim()
}

export function buildLongitudinalConclusion(sessions: SessionLite[]) {
  const safeSessions = [...(sessions ?? [])]
    .filter((session) => session && typeof session.session_number === 'number')
    .sort((a, b) => a.session_number - b.session_number)

  if (!safeSessions.length) {
    return "En l’absence de séances exploitables, aucune conclusion évolutive fiable ne peut encore être formulée."
  }

  const trajectory = computeTrajectory(safeSessions)

  return `Au terme de cette analyse longitudinale, la trajectoire du patient s’inscrit dans une dynamique ${trajectory.trend}. Le travail thérapeutique gagnera à s’appuyer sur cette évolution pour ajuster le cadre, soutenir les ressources émergentes, renforcer les appuis cliniques déjà présents et sécuriser les zones de fragilité encore actives.`
}