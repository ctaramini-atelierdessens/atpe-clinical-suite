export type AtpePredictionTrend = 'improving' | 'stable' | 'fragile' | 'declining'
export type AtpePredictionRiskLevel = 'low' | 'moderate' | 'high'

export type AtpePredictionPoint = {
  date: string
  globalScore: number
  internalProcess?: number
  expressiveProcess?: number
  relationalProcess?: number
  pluriexpressivity?: number
  institutionalIndicators?: number
  sensorialSymbolic?: number
}

export type AtpePredictionResult = {
  trend: AtpePredictionTrend
  riskLevel: AtpePredictionRiskLevel
  explanation: string[]
  confidence: 'low' | 'moderate' | 'high'
  markers: {
    globalSlope: number
    volatility: number
    recentDelta: number
    weakestRecentAxis?: string
  }
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return Math.round(value)
}

function sanitizePoints(points: AtpePredictionPoint[]): AtpePredictionPoint[] {
  return [...points]
    .map((point) => ({
      ...point,
      globalScore: clampScore(point.globalScore),
      internalProcess:
        point.internalProcess === undefined ? undefined : clampScore(point.internalProcess),
      expressiveProcess:
        point.expressiveProcess === undefined ? undefined : clampScore(point.expressiveProcess),
      relationalProcess:
        point.relationalProcess === undefined ? undefined : clampScore(point.relationalProcess),
      pluriexpressivity:
        point.pluriexpressivity === undefined ? undefined : clampScore(point.pluriexpressivity),
      institutionalIndicators:
        point.institutionalIndicators === undefined
          ? undefined
          : clampScore(point.institutionalIndicators),
      sensorialSymbolic:
        point.sensorialSymbolic === undefined ? undefined : clampScore(point.sensorialSymbolic),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function computeSlope(values: number[]): number {
  if (values.length < 2) return 0
  return values[values.length - 1] - values[0]
}

function computeRecentDelta(values: number[]): number {
  if (values.length < 2) return 0
  return values[values.length - 1] - values[values.length - 2]
}

function computeVolatility(values: number[]): number {
  if (values.length < 2) return 0

  let total = 0
  for (let i = 1; i < values.length; i += 1) {
    total += Math.abs(values[i] - values[i - 1])
  }

  return Number((total / (values.length - 1)).toFixed(2))
}

function getWeakestRecentAxis(points: AtpePredictionPoint[]): string | undefined {
  const last = points[points.length - 1]
  if (!last) return undefined

  const axes: [string, number | undefined][] = [
    ['Processus interne', last.internalProcess],
    ['Processus expressif', last.expressiveProcess],
    ['Processus relationnel', last.relationalProcess],
    ['Pluriexpressionnalité', last.pluriexpressivity],
    ['Indicateurs institutionnels', last.institutionalIndicators],
    ['Sensoriel & symbolique', last.sensorialSymbolic],
  ].filter((item): item is [string, number] => typeof item[1] === 'number')

  if (!axes.length) return undefined

  return axes.reduce((worst, current) => (current[1] < worst[1] ? current : worst))[0]
}

function getConfidence(pointsCount: number, volatility: number): 'low' | 'moderate' | 'high' {
  if (pointsCount < 3) return 'low'
  if (pointsCount >= 5 && volatility < 8) return 'high'
  return 'moderate'
}

export function predictAtpeTrajectory(
  rawPoints: AtpePredictionPoint[]
): AtpePredictionResult {
  const points = sanitizePoints(rawPoints)

  if (points.length === 0) {
    return {
      trend: 'stable',
      riskLevel: 'low',
      explanation: ['Aucune donnée longitudinale disponible.'],
      confidence: 'low',
      markers: {
        globalSlope: 0,
        volatility: 0,
        recentDelta: 0,
      },
    }
  }

  const globalValues = points.map((point) => point.globalScore)
  const globalSlope = computeSlope(globalValues)
  const recentDelta = computeRecentDelta(globalValues)
  const volatility = computeVolatility(globalValues)
  const weakestRecentAxis = getWeakestRecentAxis(points)

  const explanation: string[] = []
  let trend: AtpePredictionTrend = 'stable'
  let riskLevel: AtpePredictionRiskLevel = 'low'

  if (globalSlope >= 10 && recentDelta >= 0) {
    trend = 'improving'
    riskLevel = 'low'
    explanation.push('Progression globale visible sur la période.')
    if (recentDelta >= 5) {
      explanation.push('La dernière séance confirme la dynamique favorable.')
    }
  } else if (globalSlope <= -10) {
    trend = 'declining'
    riskLevel = 'high'
    explanation.push('Baisse globale significative sur la période observée.')
    if (recentDelta < 0) {
      explanation.push('La dynamique récente reste orientée à la baisse.')
    }
  } else if (Math.abs(globalSlope) < 5 && volatility >= 8) {
    trend = 'fragile'
    riskLevel = 'moderate'
    explanation.push('Stabilité apparente, mais forte variabilité inter-séances.')
  } else if (recentDelta <= -6) {
    trend = 'fragile'
    riskLevel = 'moderate'
    explanation.push('Décrochage récent malgré une trajectoire globale non effondrée.')
  } else {
    trend = 'stable'
    riskLevel = 'low'
    explanation.push('Évolution globalement stable sans signal de rupture majeur.')
  }

  if (weakestRecentAxis) {
    explanation.push(`Axe le plus fragile en dernière séance : ${weakestRecentAxis}.`)
  }

  if (volatility >= 12) {
    if (trend !== 'declining') {
      trend = 'fragile'
    }
    if (riskLevel === 'low') {
      riskLevel = 'moderate'
    }
    explanation.push('La trajectoire montre une forte instabilité clinique.')
  }

  return {
    trend,
    riskLevel,
    explanation,
    confidence: getConfidence(points.length, volatility),
    markers: {
      globalSlope,
      volatility,
      recentDelta,
      weakestRecentAxis,
    },
  }
}

export function trendLabel(trend: AtpePredictionTrend): string {
  switch (trend) {
    case 'improving':
      return 'Amélioration'
    case 'stable':
      return 'Stabilité'
    case 'fragile':
      return 'Équilibre fragile'
    case 'declining':
      return 'Dégradation'
    default:
      return trend
  }
}

export function riskLevelLabel(riskLevel: AtpePredictionRiskLevel): string {
  switch (riskLevel) {
    case 'low':
      return 'Faible'
    case 'moderate':
      return 'Modéré'
    case 'high':
      return 'Élevé'
    default:
      return riskLevel
  }
}