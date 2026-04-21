export type AtpeAxisScores = {
  internalProcess: number
  expressiveProcess: number
  relationalProcess: number
  pluriexpressivity: number
  institutionalIndicators: number
  sensorialSymbolic: number
}

export type AtpeAxisWeights = {
  internalProcess: number
  expressiveProcess: number
  relationalProcess: number
  pluriexpressivity: number
  institutionalIndicators: number
  sensorialSymbolic: number
}

export type AtpeCompositeInterpretation =
  | 'Fragilité clinique marquée'
  | 'Équilibre clinique intermédiaire'
  | 'Dynamique clinique favorable'
  | 'Très bonne dynamique clinique'

export type AtpeCompositeScoreResult = {
  global: number
  weighted: {
    internalProcess: number
    expressiveProcess: number
    relationalProcess: number
    pluriexpressivity: number
    institutionalIndicators: number
    sensorialSymbolic: number
  }
  interpretation: AtpeCompositeInterpretation
  strengths: string[]
  vulnerabilities: string[]
  dominantAxis: keyof AtpeAxisScores
  weakestAxis: keyof AtpeAxisScores
}

export const DEFAULT_ATPE_WEIGHTS: AtpeAxisWeights = {
  internalProcess: 0.2,
  expressiveProcess: 0.15,
  relationalProcess: 0.2,
  pluriexpressivity: 0.15,
  institutionalIndicators: 0.1,
  sensorialSymbolic: 0.2,
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return Math.round(value)
}

function sanitizeScores(scores: AtpeAxisScores): AtpeAxisScores {
  return {
    internalProcess: clampScore(scores.internalProcess),
    expressiveProcess: clampScore(scores.expressiveProcess),
    relationalProcess: clampScore(scores.relationalProcess),
    pluriexpressivity: clampScore(scores.pluriexpressivity),
    institutionalIndicators: clampScore(scores.institutionalIndicators),
    sensorialSymbolic: clampScore(scores.sensorialSymbolic),
  }
}

function sanitizeWeights(weights: AtpeAxisWeights): AtpeAxisWeights {
  const raw = {
    internalProcess: Math.max(0, weights.internalProcess),
    expressiveProcess: Math.max(0, weights.expressiveProcess),
    relationalProcess: Math.max(0, weights.relationalProcess),
    pluriexpressivity: Math.max(0, weights.pluriexpressivity),
    institutionalIndicators: Math.max(0, weights.institutionalIndicators),
    sensorialSymbolic: Math.max(0, weights.sensorialSymbolic),
  }

  const total =
    raw.internalProcess +
    raw.expressiveProcess +
    raw.relationalProcess +
    raw.pluriexpressivity +
    raw.institutionalIndicators +
    raw.sensorialSymbolic

  if (total === 0) return DEFAULT_ATPE_WEIGHTS

  return {
    internalProcess: raw.internalProcess / total,
    expressiveProcess: raw.expressiveProcess / total,
    relationalProcess: raw.relationalProcess / total,
    pluriexpressivity: raw.pluriexpressivity / total,
    institutionalIndicators: raw.institutionalIndicators / total,
    sensorialSymbolic: raw.sensorialSymbolic / total,
  }
}

function getInterpretation(global: number): AtpeCompositeInterpretation {
  if (global < 40) return 'Fragilité clinique marquée'
  if (global < 60) return 'Équilibre clinique intermédiaire'
  if (global < 80) return 'Dynamique clinique favorable'
  return 'Très bonne dynamique clinique'
}

function getStrengths(scores: AtpeAxisScores): string[] {
  const strengths: string[] = []

  if (scores.internalProcess >= 70) {
    strengths.push('Bonne assise du processus interne')
  }

  if (scores.expressiveProcess >= 70) {
    strengths.push('Expression riche et mobilisable')
  }

  if (scores.relationalProcess >= 70) {
    strengths.push('Alliance et dynamique relationnelle soutenantes')
  }

  if (scores.pluriexpressivity >= 70) {
    strengths.push('Bonne fluidité intermodale')
  }

  if (scores.institutionalIndicators >= 70) {
    strengths.push('Participation et autonomie observables favorables')
  }

  if (scores.sensorialSymbolic >= 70) {
    strengths.push('Ancrage sensoriel et symbolisation solides')
  }

  return strengths
}

function getVulnerabilities(scores: AtpeAxisScores): string[] {
  const vulnerabilities: string[] = []

  if (scores.internalProcess < 40) {
    vulnerabilities.push('Fragilité du processus interne')
  }

  if (scores.expressiveProcess < 40) {
    vulnerabilities.push('Expression peu accessible ou peu structurée')
  }

  if (scores.relationalProcess < 40) {
    vulnerabilities.push('Fragilité du lien et de la co-présence')
  }

  if (scores.pluriexpressivity < 40) {
    vulnerabilities.push('Rigidité ou difficulté de passage intermodal')
  }

  if (scores.institutionalIndicators < 40) {
    vulnerabilities.push('Participation et autonomie limitées')
  }

  if (scores.sensorialSymbolic < 40) {
    vulnerabilities.push('Fragilité sensorielle et symbolique')
  }

  return vulnerabilities
}

function getDominantAxis(scores: AtpeAxisScores): keyof AtpeAxisScores {
  const entries = Object.entries(scores) as [keyof AtpeAxisScores, number][]
  return entries.reduce((best, current) => (current[1] > best[1] ? current : best))[0]
}

function getWeakestAxis(scores: AtpeAxisScores): keyof AtpeAxisScores {
  const entries = Object.entries(scores) as [keyof AtpeAxisScores, number][]
  return entries.reduce((worst, current) => (current[1] < worst[1] ? current : worst))[0]
}

export function computeAtpeCompositeScore(
  inputScores: AtpeAxisScores,
  customWeights?: Partial<AtpeAxisWeights>
): AtpeCompositeScoreResult {
  const scores = sanitizeScores(inputScores)

  const weights = sanitizeWeights({
    ...DEFAULT_ATPE_WEIGHTS,
    ...customWeights,
  })

  const weighted = {
    internalProcess: Number((scores.internalProcess * weights.internalProcess).toFixed(2)),
    expressiveProcess: Number((scores.expressiveProcess * weights.expressiveProcess).toFixed(2)),
    relationalProcess: Number((scores.relationalProcess * weights.relationalProcess).toFixed(2)),
    pluriexpressivity: Number((scores.pluriexpressivity * weights.pluriexpressivity).toFixed(2)),
    institutionalIndicators: Number(
      (scores.institutionalIndicators * weights.institutionalIndicators).toFixed(2)
    ),
    sensorialSymbolic: Number(
      (scores.sensorialSymbolic * weights.sensorialSymbolic).toFixed(2)
    ),
  }

  const global = Math.round(
    weighted.internalProcess +
      weighted.expressiveProcess +
      weighted.relationalProcess +
      weighted.pluriexpressivity +
      weighted.institutionalIndicators +
      weighted.sensorialSymbolic
  )

  return {
    global,
    weighted,
    interpretation: getInterpretation(global),
    strengths: getStrengths(scores),
    vulnerabilities: getVulnerabilities(scores),
    dominantAxis: getDominantAxis(scores),
    weakestAxis: getWeakestAxis(scores),
  }
}

export function axisLabel(axis: keyof AtpeAxisScores): string {
  switch (axis) {
    case 'internalProcess':
      return 'Processus interne'
    case 'expressiveProcess':
      return 'Processus expressif'
    case 'relationalProcess':
      return 'Processus relationnel'
    case 'pluriexpressivity':
      return 'Pluriexpressionnalité'
    case 'institutionalIndicators':
      return 'Indicateurs institutionnels'
    case 'sensorialSymbolic':
      return 'Sensoriel & symbolique'
    default:
      return axis
  }
}