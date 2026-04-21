import { computeAtpeExpertResult } from '@/lib/atpe-expert'

type SessionLike = {
  id: string
  session_number: number
  session_date?: string | null
  emotional_score: number
  body_score: number
  awareness_score: number
  dynamic_score: number
  symbolic_score: number
  regulation_score: number
  engagement_score: number
}

export type ClinicalAlertLevel = 'low' | 'medium' | 'high'

export type ClinicalAlert = {
  key: string
  level: ClinicalAlertLevel
  title: string
  message: string
}

function getLevelFromDelta(delta: number): ClinicalAlertLevel {
  if (delta <= -20) return 'high'
  if (delta <= -10) return 'medium'
  return 'low'
}

export function getClinicalAlerts(sessions: SessionLike[]): ClinicalAlert[] {
  if (!sessions || sessions.length === 0) {
    return []
  }

  const current = sessions[sessions.length - 1]
  const previous = sessions.length > 1 ? sessions[sessions.length - 2] : null

  const currentResult = computeAtpeExpertResult(
    {
      emotion: current.emotional_score,
      corps: current.body_score,
      conscience: current.awareness_score,
      dynamique: current.dynamic_score,
      symbolique: current.symbolic_score,
      regulation: current.regulation_score,
      engagement: current.engagement_score,
    },
    previous
      ? {
          emotion: previous.emotional_score,
          corps: previous.body_score,
          conscience: previous.awareness_score,
          dynamique: previous.dynamic_score,
          symbolique: previous.symbolic_score,
          regulation: previous.regulation_score,
          engagement: previous.engagement_score,
        }
      : null
  )

  const previousResult = previous
    ? computeAtpeExpertResult({
        emotion: previous.emotional_score,
        corps: previous.body_score,
        conscience: previous.awareness_score,
        dynamique: previous.dynamic_score,
        symbolique: previous.symbolic_score,
        regulation: previous.regulation_score,
        engagement: previous.engagement_score,
      })
    : null

  const alerts: ClinicalAlert[] = []

  if (previousResult) {
    const scoreDelta =
      (currentResult.scoreGlobal ?? 0) - (previousResult.scoreGlobal ?? 0)

    if (scoreDelta <= -10) {
      alerts.push({
        key: 'global-drop',
        level: getLevelFromDelta(scoreDelta),
        title: 'Rupture clinique globale',
        message: `Le score global diminue de ${Math.abs(scoreDelta)} points entre les deux dernières séances.`,
      })
    }

    if (scoreDelta >= 10) {
      alerts.push({
        key: 'global-improvement',
        level: 'low',
        title: 'Progression significative',
        message: `Le score global progresse de ${scoreDelta} points entre les deux dernières séances.`,
      })
    }

    if (Math.abs(scoreDelta) < 4) {
      alerts.push({
        key: 'stagnation',
        level: 'low',
        title: 'Stagnation clinique',
        message:
          'La variation du score global reste faible sur les deux dernières séances.',
      })
    }

    const regulationDelta =
      (current.regulation_score ?? 0) - (previous.regulation_score ?? 0)

    if (regulationDelta <= -2) {
      alerts.push({
        key: 'regulation-drop',
        level: regulationDelta <= -3 ? 'high' : 'medium',
        title: 'Baisse de régulation',
        message: `Le score de régulation baisse de ${Math.abs(regulationDelta)} point(s).`,
      })
    }

    const engagementDelta =
      (current.engagement_score ?? 0) - (previous.engagement_score ?? 0)

    if (engagementDelta <= -2) {
      alerts.push({
        key: 'engagement-drop',
        level: engagementDelta <= -3 ? 'high' : 'medium',
        title: 'Décrochage d’engagement',
        message: `Le score d’engagement baisse de ${Math.abs(engagementDelta)} point(s).`,
      })
    }
  }

  const poles = [
    currentResult.poleRegulation ?? 0,
    currentResult.poleAncrage ?? 0,
    currentResult.poleElaboration ?? 0,
  ]

  const poleMax = Math.max(...poles)
  const poleMin = Math.min(...poles)

  if (poleMax - poleMin >= 25) {
    alerts.push({
      key: 'pole-imbalance',
      level: poleMax - poleMin >= 35 ? 'high' : 'medium',
      title: 'Déséquilibre inter-pôles',
      message:
        'Un écart important apparaît entre les pôles cliniques de la dernière séance.',
    })
  }

  if ((currentResult.poleRegulation ?? 0) < 40) {
    alerts.push({
      key: 'low-regulation-pole',
      level: (currentResult.poleRegulation ?? 0) < 30 ? 'high' : 'medium',
      title: 'Fragilité de régulation',
      message:
        'Le pôle de régulation reste à un niveau bas sur la dernière séance.',
    })
  }

  return alerts
}