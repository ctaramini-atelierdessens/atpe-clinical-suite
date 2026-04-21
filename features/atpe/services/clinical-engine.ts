export type ClinicalSession = {
  patient_engagement_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  frame_containment?: number | null
  created_at?: string | null
}

export type ClinicalAlert = {
  level?: string | null
}

/* ------------------ UTILS ------------------ */

function safe(value: number | null | undefined) {
  return typeof value === 'number' ? value : 0
}

function avg(arr: number[]) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/* ------------------ SCORE ------------------ */

export function computeClinicalScore(
  sessions: ClinicalSession[],
  alerts: ClinicalAlert[]
) {
  if (!sessions.length) return 50

  const engagement = avg(
    sessions.map((s) => safe(s.patient_engagement_level))
  )

  const symbolisation = avg(
    sessions.map(
      (s) =>
        (safe(s.primary_symbolization) +
          safe(s.secondary_symbolization)) /
        2
    )
  )

  const containment = avg(
    sessions.map((s) => safe(s.frame_containment))
  )

  const alertPenalty = alerts.length * 8

  const score =
    20 +
    engagement * 0.4 +
    symbolisation * 0.3 +
    containment * 0.3 -
    alertPenalty

  return Math.max(0, Math.min(100, Math.round(score)))
}

/* ------------------ TREND ------------------ */

export function computeClinicalTrend(sessions: ClinicalSession[]) {
  if (sessions.length < 2) return 'indeterminate'

  const first =
    safe(sessions[0].patient_engagement_level) +
    safe(sessions[0].primary_symbolization)

  const last =
    safe(sessions[sessions.length - 1].patient_engagement_level) +
    safe(sessions[sessions.length - 1].primary_symbolization)

  const delta = last - first

  if (delta > 5) return 'progression'
  if (delta < -5) return 'rupture'
  return 'stagnation'
}

/* ------------------ RISK ------------------ */

export function computeClinicalRisk(alerts: ClinicalAlert[]) {
  if (!alerts.length) return 'low'

  if (alerts.some((a) => a.level === 'critical')) return 'critical'
  if (alerts.some((a) => a.level === 'high')) return 'high'
  if (alerts.length > 2) return 'moderate'

  return 'low'
}

/* ------------------ INSIGHTS ------------------ */

export function buildClinicalInsights(
  sessions: ClinicalSession[],
  alerts: ClinicalAlert[]
) {
  const score = computeClinicalScore(sessions, alerts)
  const trend = computeClinicalTrend(sessions)
  const risk = computeClinicalRisk(alerts)

  let label = 'Situation stable'

  if (trend === 'progression') label = 'Progression thérapeutique'
  if (trend === 'rupture') label = 'Risque de rupture'
  if (trend === 'stagnation') label = 'Stagnation clinique'

  return { score, trend, risk, label }
}

/* ------------------ PHASE 12 ------------------ */

export function detectCriticalMoments(sessions: ClinicalSession[]) {
  const points: any[] = []

  for (let i = 1; i < sessions.length; i++) {
    const prev =
      safe(sessions[i - 1].patient_engagement_level) +
      safe(sessions[i - 1].primary_symbolization)

    const curr =
      safe(sessions[i].patient_engagement_level) +
      safe(sessions[i].primary_symbolization)

    const delta = curr - prev

    if (Math.abs(delta) > 8) {
      points.push({
        index: i,
        type: delta > 0 ? 'progression' : 'rupture',
      })
    }
  }

  return points
}

export function detectClinicalPatterns(
  sessions: ClinicalSession[],
  alerts: ClinicalAlert[]
) {
  const trend = computeClinicalTrend(sessions)
  const risk = computeClinicalRisk(alerts)

  if (trend === 'rupture' || risk === 'critical') {
    return {
      pattern: 'rupture_risk',
      message: 'Risque de rupture thérapeutique',
    }
  }

  if (trend === 'stagnation') {
    return {
      pattern: 'stagnation',
      message: 'Stagnation prolongée',
    }
  }

  if (trend === 'progression') {
    return {
      pattern: 'positive',
      message: 'Bonne dynamique thérapeutique',
    }
  }

  return {
    pattern: 'stable',
    message: 'État clinique stable',
  }
}

/* ------------------ PHASE 15 ------------------ */

export function predictClinicalRisk(
  sessions: ClinicalSession[],
  alerts: ClinicalAlert[]
) {
  if (sessions.length < 3) {
    return { risk: 'unknown', message: 'Pas assez de données' }
  }

  const last = sessions.slice(-3)

  const values = last.map(
    (s) =>
      safe(s.patient_engagement_level) +
      safe(s.primary_symbolization)
  )

  const trend = values[2] - values[0]

  if (trend < -5)
    return {
      risk: 'high',
      message: 'Risque de dégradation',
    }

  if (trend > 5)
    return {
      risk: 'low',
      message: 'Progression confirmée',
    }

  return {
    risk: 'moderate',
    message: 'Évolution incertaine',
  }
}

export function detectRelapse(sessions: ClinicalSession[]) {
  if (sessions.length < 4) return false

  const s = sessions.slice(-4)

  return (
    safe(s[1].patient_engagement_level) >
      safe(s[0].patient_engagement_level) &&
    safe(s[3].patient_engagement_level) <
      safe(s[2].patient_engagement_level)
  )
}

export function generateAdvancedRecommendations(
  sessions: ClinicalSession[],
  alerts: ClinicalAlert[]
) {
  const pred = predictClinicalRisk(sessions, alerts)
  const relapse = detectRelapse(sessions)

  if (relapse)
    return [
      'Renforcer le cadre immédiatement',
      'Revenir à une médiation connue',
    ]

  if (pred.risk === 'high')
    return ['Stabiliser le patient', 'Réduire complexité']

  if (pred.risk === 'low')
    return ['Augmenter la symbolisation', 'Autonomisation']

  return ['Observer et maintenir']
}