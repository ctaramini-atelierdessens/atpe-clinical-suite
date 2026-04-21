export type ProjectionSession = {
  created_at?: string | null
  patient_engagement_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  frame_containment?: number | null
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function sortSessionsChronologically<T extends { created_at?: string | null }>(
  sessions: T[]
) {
  return [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })
}

function computeCompositeScore(session: ProjectionSession) {
  const engagement = safeNumber(session.patient_engagement_level)
  const primary = safeNumber(session.primary_symbolization)
  const secondary = safeNumber(session.secondary_symbolization)
  const containment = safeNumber(session.frame_containment)

  const symbolizationAverage = (primary + secondary) / 2

  return Math.round(
    engagement * 0.4 +
      symbolizationAverage * 0.4 +
      containment * 0.2
  )
}

export function buildProjectionHistory(
  sessions: ProjectionSession[],
  maxPoints = 5
) {
  const ordered = sortSessionsChronologically(sessions).slice(-maxPoints)

  return ordered.map((session, index) => ({
    label: `S${index + 1}`,
    score: computeCompositeScore(session),
  }))
}

export function projectNextSessions(
  sessions: ProjectionSession[],
  horizon = 3
) {
  const ordered = sortSessionsChronologically(sessions)

  if (ordered.length < 3) {
    return {
      points: [] as Array<{ step: string; predictedScore: number }>,
      message: 'Données insuffisantes pour projection',
      slope: 0,
    }
  }

  const recent = ordered.slice(-5)
  const y = recent.map((session) => computeCompositeScore(session))
  const x = recent.map((_, index) => index)

  const n = y.length
  const sumX = x.reduce((acc, value) => acc + value, 0)
  const sumY = y.reduce((acc, value) => acc + value, 0)
  const sumXY = x.reduce((acc, value, index) => acc + value * y[index], 0)
  const sumX2 = x.reduce((acc, value) => acc + value * value, 0)

  const denominator = n * sumX2 - sumX * sumX
  const slope =
    denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const intercept = (sumY - slope * sumX) / n

  const lastIndex = x[x.length - 1]

  const points = Array.from({ length: horizon }).map((_, index) => {
    const futureIndex = lastIndex + 1 + index
    const predictedScore = clamp(
      Math.round(slope * futureIndex + intercept),
      0,
      100
    )

    return {
      step: `+${index + 1}`,
      predictedScore,
    }
  })

  let message = 'Projection stable'

  if (slope < -2) {
    message = 'Tendance négative projetée'
  } else if (slope > 2) {
    message = 'Tendance positive projetée'
  }

  return {
    points,
    message,
    slope,
  }
}