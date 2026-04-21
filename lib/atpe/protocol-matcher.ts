import {
  ATPE_PROTOCOL_LIBRARY,
  AtpePriorityAxis,
  AtpeProtocolRecord,
} from './protocol-library'

export type AtpeMatcherRiskLevel = 'low' | 'moderate' | 'high'

export type MatchAtpeProtocolsInput = {
  profile?: string | null
  priorityAxes?: string[] | null
  weakestAxis?: string | null
  riskLevel?: AtpeMatcherRiskLevel | null
  query?: string | null
  limit?: number
}

export type AtpeClinicalLevel = {
  value: 'faible' | 'modéré' | 'élevé'
  label: string
  color: string
}

export type AtpeProtocolMatch = AtpeProtocolRecord & {
  score: number
  reasons: string[]
  clinicalLevel: AtpeClinicalLevel
  matchPercent: number
  summary: string
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function normalizeAxes(value: string[] | null | undefined): string[] {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item)).filter(Boolean)
    : []
}

function safeIncludes(list: string[] | undefined, value: string): boolean {
  return (list ?? []).includes(value)
}

function axisLooksLike(axis: string, expected: AtpePriorityAxis): boolean {
  const normalized = normalizeText(axis)

  switch (expected) {
    case 'internal_process':
      return normalized.includes('internal') || normalized.includes('interne')
    case 'expressive_process':
      return normalized.includes('express') || normalized.includes('expression')
    case 'relational_process':
      return normalized.includes('relation')
    case 'pluriexpressivity':
      return normalized.includes('pluri')
    case 'institutional_indicators':
      return normalized.includes('institution')
    case 'sensorial_symbolic':
      return normalized.includes('sensor') || normalized.includes('symbol')
    default:
      return false
  }
}

function getClinicalLevel(score: number): AtpeClinicalLevel {
  if (score >= 14) {
    return {
      value: 'élevé',
      label: 'Élevé',
      color: 'text-emerald-700 bg-emerald-50',
    }
  }

  if (score >= 8) {
    return {
      value: 'modéré',
      label: 'Modéré',
      color: 'text-amber-700 bg-amber-50',
    }
  }

  return {
    value: 'faible',
    label: 'Faible',
    color: 'text-slate-700 bg-slate-50',
  }
}

function toMatchPercent(score: number): number {
  // plafond volontairement simple pour obtenir un pourcentage lisible
  const maxReferenceScore = 18
  const raw = Math.round((score / maxReferenceScore) * 100)
  if (raw < 0) return 0
  if (raw > 100) return 100
  return raw
}

function buildSummary(params: {
  protocol: AtpeProtocolRecord
  score: number
  reasons: string[]
}): string {
  const { protocol, score, reasons } = params
  const level = getClinicalLevel(score)

  if (!reasons.length) {
    return `Compatibilité ${level.label.toLowerCase()} avec le protocole ${protocol.title}.`
  }

  return `Compatibilité ${level.label.toLowerCase()} avec le protocole ${protocol.title} : ${reasons
    .slice(0, 3)
    .join(', ')}.`
}

export function scoreProtocol(
  protocol: AtpeProtocolRecord,
  input: MatchAtpeProtocolsInput
): AtpeProtocolMatch {
  const profile = normalizeText(input.profile)
  const weakestAxis = normalizeText(input.weakestAxis)
  const riskLevel = input.riskLevel ?? null
  const query = normalizeText(input.query)
  const priorityAxes = normalizeAxes(input.priorityAxes)

  const reasons: string[] = []
  let score = 0

  const primaryAxes = protocol.primary_axes ?? []
  const secondaryAxes = protocol.secondary_axes ?? []
  const targets = protocol.targets ?? []
  const tags = protocol.tags ?? []
  const indications = protocol.indications ?? []
  const goals = protocol.goals ?? []
  const mediations = protocol.mediations ?? []

  if (profile.includes('inhibition') && safeIncludes(targets, 'inhibition')) {
    score += 5
    reasons.push('Correspond au profil inhibition')
  }

  if (
    (profile.includes('débordement') || profile.includes('debordement')) &&
    safeIncludes(targets, 'debordement')
  ) {
    score += 5
    reasons.push('Correspond au profil débordement')
  }

  if (profile.includes('dissociation') && safeIncludes(targets, 'dissociation')) {
    score += 5
    reasons.push('Correspond au profil dissociation')
  }

  if (profile.includes('retrait') && safeIncludes(targets, 'retrait')) {
    score += 4
    reasons.push('Correspond au retrait observé')
  }

  if (
    profile.includes('relation') &&
    safeIncludes(targets, 'fragilite_relationnelle')
  ) {
    score += 3
    reasons.push('Cible une fragilité relationnelle')
  }

  if (
    (profile.includes('symbol') || weakestAxis.includes('symbol')) &&
    safeIncludes(targets, 'fragilite_symbolique')
  ) {
    score += 3
    reasons.push('Cible une fragilité symbolique')
  }

  const primaryAxisMatches = primaryAxes.filter((axis) =>
    priorityAxes.some((priorityAxis) => axisLooksLike(priorityAxis, axis))
  )

  if (primaryAxisMatches.length > 0) {
    score += primaryAxisMatches.length * 3
    reasons.push('Recoupe les axes cliniques prioritaires')
  }

  const secondaryAxisMatches = secondaryAxes.filter((axis) =>
    priorityAxes.slice(0, 3).some((priorityAxis) => axisLooksLike(priorityAxis, axis))
  )

  if (secondaryAxisMatches.length > 0) {
    score += secondaryAxisMatches.length * 2
    reasons.push('Appui secondaire sur les axes prioritaires')
  }

  if (weakestAxis) {
    if (axisLooksLike(weakestAxis, 'internal_process') && protocol.category === 'ancrage') {
      score += 2
      reasons.push('Pertinent pour une fragilité du processus interne')
    }

    if (
      axisLooksLike(weakestAxis, 'expressive_process') &&
      protocol.category === 'expression'
    ) {
      score += 2
      reasons.push('Pertinent pour une fragilité expressive')
    }

    if (
      axisLooksLike(weakestAxis, 'relational_process') &&
      protocol.category === 'relation'
    ) {
      score += 2
      reasons.push('Pertinent pour une fragilité relationnelle')
    }

    if (
      axisLooksLike(weakestAxis, 'sensorial_symbolic') &&
      protocol.category === 'symbolisation'
    ) {
      score += 2
      reasons.push('Pertinent pour une fragilité sensorielle / symbolique')
    }
  }

  if (riskLevel === 'high' && protocol.intensity === 'faible') {
    score += 2
    reasons.push('Faible intensité adaptée à un risque élevé')
  }

  if (riskLevel === 'moderate' && protocol.intensity !== 'élevée') {
    score += 1
    reasons.push('Intensité compatible avec un risque modéré')
  }

  if (riskLevel === 'low' && protocol.intensity === 'modérée') {
    score += 1
    reasons.push('Intensité compatible avec un risque faible')
  }

  if (query) {
    const haystack = [
      protocol.title,
      protocol.subtitle,
      protocol.clinicalIntent,
      ...targets,
      ...tags,
      ...indications,
      ...goals,
      ...mediations,
    ]
      .join(' ')
      .toLowerCase()

    if (haystack.includes(query)) {
      score += 2
      reasons.push('Correspond à la recherche textuelle')
    }
  }

  if (safeIncludes(targets, 'general')) {
    score += 1
  }

  return {
    ...protocol,
    score,
    reasons,
    clinicalLevel: getClinicalLevel(score),
    matchPercent: toMatchPercent(score),
    summary: buildSummary({ protocol, score, reasons }),
  }
}

export function matchAtpeProtocols(
  input: MatchAtpeProtocolsInput
): AtpeProtocolMatch[] {
  const limit = input.limit ?? 6

  return ATPE_PROTOCOL_LIBRARY
    .map((protocol) => scoreProtocol(protocol, input))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function getBestAtpeProtocolMatch(
  input: MatchAtpeProtocolsInput
): AtpeProtocolMatch | null {
  return matchAtpeProtocols({ ...input, limit: 1 })[0] ?? null
}