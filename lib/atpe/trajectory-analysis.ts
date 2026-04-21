import { resolveAtpeClinicalMatrix, type AtpeSessionForMatrix } from '@/lib/atpe/clinical-matrix'

export type AtpeTrajectoryPattern =
  | 'insufficient_data'
  | 'stable_plateau'
  | 'slow_progress'
  | 'sustained_improvement'
  | 'gradual_decline'
  | 'sudden_drop'
  | 'therapeutic_rebound'
  | 'clinical_instability'

export type AtpeTrajectorySeverity = 'info' | 'moderate' | 'high'

export type AtpeTrajectoryPoint = {
  index: number
  session_number: number
  created_at: string | null
  global_score: number
  dominant_axis: ReturnType<typeof resolveAtpeClinicalMatrix>['dominantAxis']
  weakest_axis: ReturnType<typeof resolveAtpeClinicalMatrix>['weakestAxis']
}

export type AtpeTrajectoryEvent = {
  type: AtpeTrajectoryPattern
  severity: AtpeTrajectorySeverity
  title: string
  description: string
  start_index?: number
  end_index?: number
}

export type AtpeTrajectoryAnalysis = {
  pattern: AtpeTrajectoryPattern
  severity: AtpeTrajectorySeverity
  label: string
  summary: string
  delta_total: number
  delta_recent: number
  volatility: number
  slope: number
  points: AtpeTrajectoryPoint[]
  events: AtpeTrajectoryEvent[]
}

export type AtpeTrajectorySession = AtpeSessionForMatrix & {
  id?: string
  session_number?: number | null
  created_at?: string | null
}

function clamp(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function avg(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

function sortChronologically<T extends { created_at?: string | null }>(items: T[]) {
  return [...items].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })
}

function buildPoints(sessions: AtpeTrajectorySession[]): AtpeTrajectoryPoint[] {
  return sortChronologically(sessions).map((session, index) => {
    const matrix = resolveAtpeClinicalMatrix(session)

    return {
      index,
      session_number: session.session_number ?? index + 1,
      created_at: session.created_at ?? null,
      global_score: matrix.average,
      dominant_axis: matrix.dominantAxis,
      weakest_axis: matrix.weakestAxis,
    }
  })
}

function computeVolatility(scores: number[]) {
  if (scores.length < 2) return 0
  const diffs: number[] = []
  for (let i = 1; i < scores.length; i += 1) {
    diffs.push(Math.abs(scores[i] - scores[i - 1]))
  }
  return round(avg(diffs))
}

function computeSlope(scores: number[]) {
  if (scores.length < 2) return 0
  return round((scores[scores.length - 1] - scores[0]) / (scores.length - 1))
}

function countPositiveSteps(scores: number[]) {
  let count = 0
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] > scores[i - 1]) count += 1
  }
  return count
}

function countNegativeSteps(scores: number[]) {
  let count = 0
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] < scores[i - 1]) count += 1
  }
  return count
}

function findSuddenDrop(scores: number[]) {
  for (let i = 1; i < scores.length; i += 1) {
    const delta = scores[i] - scores[i - 1]
    if (delta <= -15) {
      return { index: i, delta }
    }
  }
  return null
}

function findTherapeuticRebound(scores: number[]) {
  if (scores.length < 3) return null
  for (let i = 2; i < scores.length; i += 1) {
    const d1 = scores[i - 1] - scores[i - 2]
    const d2 = scores[i] - scores[i - 1]
    if (d1 <= -10 && d2 >= 10) {
      return { index: i, drop: d1, rebound: d2 }
    }
  }
  return null
}

function isPlateau(scores: number[]) {
  if (scores.length < 3) return false
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  return max - min <= 6
}

function buildLabel(pattern: AtpeTrajectoryPattern) {
  switch (pattern) {
    case 'insufficient_data':
      return 'Données insuffisantes'
    case 'stable_plateau':
      return 'Plateau stable'
    case 'slow_progress':
      return 'Progression lente'
    case 'sustained_improvement':
      return 'Amélioration soutenue'
    case 'gradual_decline':
      return 'Régression progressive'
    case 'sudden_drop':
      return 'Rupture brutale'
    case 'therapeutic_rebound':
      return 'Rebond thérapeutique'
    case 'clinical_instability':
      return 'Instabilité clinique'
    default:
      return 'Trajectoire'
  }
}

function buildDefaultSummary(
  pattern: AtpeTrajectoryPattern,
  deltaTotal: number,
  deltaRecent: number,
  volatility: number
) {
  switch (pattern) {
    case 'insufficient_data':
      return "Le nombre de séances est insuffisant pour produire une lecture trajectorielle robuste."
    case 'stable_plateau':
      return `La trajectoire apparaît globalement stable, avec peu de variations significatives. Delta total ${deltaTotal >= 0 ? '+' : ''}${deltaTotal}, volatilité ${volatility}.`
    case 'slow_progress':
      return `Une amélioration progressive mais lente est observable. Delta total ${deltaTotal >= 0 ? '+' : ''}${deltaTotal}, évolution récente ${deltaRecent >= 0 ? '+' : ''}${deltaRecent}.`
    case 'sustained_improvement':
      return `La trajectoire montre une amélioration soutenue et relativement cohérente sur l’ensemble de la série. Delta total ${deltaTotal >= 0 ? '+' : ''}${deltaTotal}.`
    case 'gradual_decline':
      return `La trajectoire met en évidence une baisse progressive des capacités cliniques. Delta total ${deltaTotal >= 0 ? '+' : ''}${deltaTotal}, évolution récente ${deltaRecent >= 0 ? '+' : ''}${deltaRecent}.`
    case 'sudden_drop':
      return `Une rupture brutale est repérable sur la série, avec une baisse nette entre deux séances consécutives.`
    case 'therapeutic_rebound':
      return `Après une baisse significative, la trajectoire montre un rebond clinique notable.`
    case 'clinical_instability':
      return `La série est marquée par des oscillations cliniques importantes, suggérant une stabilité encore fragile.`
    default:
      return 'Trajectoire clinique analysée.'
  }
}

export function analyzeAtpeTrajectory(
  sessions: AtpeTrajectorySession[] | null | undefined
): AtpeTrajectoryAnalysis {
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const points = buildPoints(safeSessions)
  const scores = points.map((point) => clamp(point.global_score))

  if (scores.length < 2) {
    return {
      pattern: 'insufficient_data',
      severity: 'info',
      label: buildLabel('insufficient_data'),
      summary: buildDefaultSummary('insufficient_data', 0, 0, 0),
      delta_total: 0,
      delta_recent: 0,
      volatility: 0,
      slope: 0,
      points,
      events: [],
    }
  }

  const deltaTotal = clamp(scores[scores.length - 1]) - clamp(scores[0])
  const deltaRecent =
    scores.length >= 3
      ? clamp(scores[scores.length - 1]) - clamp(scores[scores.length - 3])
      : clamp(scores[scores.length - 1]) - clamp(scores[scores.length - 2])

  const volatility = computeVolatility(scores)
  const slope = computeSlope(scores)
  const positives = countPositiveSteps(scores)
  const negatives = countNegativeSteps(scores)
  const suddenDrop = findSuddenDrop(scores)
  const rebound = findTherapeuticRebound(scores)
  const plateau = isPlateau(scores)

  const events: AtpeTrajectoryEvent[] = []

  if (suddenDrop) {
    events.push({
      type: 'sudden_drop',
      severity: 'high',
      title: 'Rupture brutale',
      description: `Une baisse de ${Math.abs(suddenDrop.delta)} points est repérée entre deux séances consécutives.`,
      start_index: suddenDrop.index - 1,
      end_index: suddenDrop.index,
    })
  }

  if (rebound) {
    events.push({
      type: 'therapeutic_rebound',
      severity: 'moderate',
      title: 'Rebond thérapeutique',
      description: `Après une chute initiale, un rebond de ${rebound.rebound} points est observé.`,
      start_index: rebound.index - 1,
      end_index: rebound.index,
    })
  }

  let pattern: AtpeTrajectoryPattern = 'stable_plateau'
  let severity: AtpeTrajectorySeverity = 'info'

  if (suddenDrop) {
    pattern = 'sudden_drop'
    severity = 'high'
  } else if (rebound) {
    pattern = 'therapeutic_rebound'
    severity = 'moderate'
  } else if (volatility >= 10 && Math.abs(deltaTotal) < 10) {
    pattern = 'clinical_instability'
    severity = 'high'
  } else if (plateau) {
    pattern = 'stable_plateau'
    severity = 'info'
  } else if (deltaTotal >= 18 && positives >= negatives + 1 && slope >= 4) {
    pattern = 'sustained_improvement'
    severity = 'info'
  } else if (deltaTotal >= 8 && slope > 1) {
    pattern = 'slow_progress'
    severity = 'info'
  } else if (deltaTotal <= -12 && negatives >= positives) {
    pattern = 'gradual_decline'
    severity = 'high'
  } else if (deltaTotal > 0) {
    pattern = 'slow_progress'
    severity = 'info'
  } else if (deltaTotal < 0) {
    pattern = 'gradual_decline'
    severity = 'moderate'
  }

  if (pattern === 'stable_plateau' && scores[scores.length - 1] < 45) {
    severity = 'moderate'
    events.push({
      type: 'stable_plateau',
      severity: 'moderate',
      title: 'Plateau bas',
      description:
        'La trajectoire est stable, mais à un niveau clinique encore fragile.',
    })
  }

  if (pattern === 'slow_progress' && deltaRecent <= 0 && scores.length >= 4) {
    events.push({
      type: 'slow_progress',
      severity: 'moderate',
      title: 'Progression freinée',
      description:
        "Une amélioration globale existe, mais l'évolution récente montre un ralentissement ou une stagnation.",
    })
  }

  if (pattern === 'sustained_improvement') {
    events.push({
      type: 'sustained_improvement',
      severity: 'info',
      title: 'Amélioration soutenue',
      description:
        'La série montre une amélioration cohérente et répétée au fil des séances.',
    })
  }

  if (pattern === 'gradual_decline') {
    events.push({
      type: 'gradual_decline',
      severity,
      title: 'Régression progressive',
      description:
        'La baisse clinique se construit au fil des séances plutôt que par une rupture unique.',
    })
  }

  if (pattern === 'clinical_instability') {
    events.push({
      type: 'clinical_instability',
      severity: 'high',
      title: 'Instabilité clinique',
      description:
        'Les fluctuations importantes suggèrent une stabilité encore insuffisante du processus.',
    })
  }

  return {
    pattern,
    severity,
    label: buildLabel(pattern),
    summary: buildDefaultSummary(pattern, deltaTotal, deltaRecent, volatility),
    delta_total: round(deltaTotal),
    delta_recent: round(deltaRecent),
    volatility,
    slope,
    points,
    events,
  }
}