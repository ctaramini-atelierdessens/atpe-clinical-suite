export interface PatientScores {
  emotion: number
  body: number
  consciousness: number
  dynamic: number
  symbolic: number
}

export interface ProtocolRecord {
  id: string
  name: string
  slug: string
  category?: string | null
  source?: string | null
  duration?: string | null
  format?: string | null
  description?: string | null
  indications?: string | null
  contraindications?: string | null
  emotional_level: number
  body_level: number
  consciousness_level: number
  dynamic_level: number
  symbolic_level: number
  is_active?: boolean | null
}

export interface RecommendedProtocol extends ProtocolRecord {
  fit_score: number
  emotional_gap: number
  body_gap: number
  consciousness_gap: number
  dynamic_gap: number
  symbolic_gap: number
}

function clampScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function normalizePatientScores(
  input: Partial<PatientScores>,
): PatientScores {
  return {
    emotion: clampScore(input.emotion),
    body: clampScore(input.body),
    consciousness: clampScore(input.consciousness),
    dynamic: clampScore(input.dynamic),
    symbolic: clampScore(input.symbolic),
  }
}

export function scoreProtocolFit(
  patient: PatientScores,
  protocol: ProtocolRecord,
): RecommendedProtocol {
  const emotionalGap = Math.abs(patient.emotion - clampScore(protocol.emotional_level))
  const bodyGap = Math.abs(patient.body - clampScore(protocol.body_level))
  const consciousnessGap = Math.abs(
    patient.consciousness - clampScore(protocol.consciousness_level),
  )
  const dynamicGap = Math.abs(patient.dynamic - clampScore(protocol.dynamic_level))
  const symbolicGap = Math.abs(patient.symbolic - clampScore(protocol.symbolic_level))

  const totalGap =
    emotionalGap + bodyGap + consciousnessGap + dynamicGap + symbolicGap

  return {
    ...protocol,
    fit_score: 500 - totalGap,
    emotional_gap: emotionalGap,
    body_gap: bodyGap,
    consciousness_gap: consciousnessGap,
    dynamic_gap: dynamicGap,
    symbolic_gap: symbolicGap,
  }
}

export function recommendProtocols(
  patient: Partial<PatientScores>,
  protocols: ProtocolRecord[],
  limit = 3,
): RecommendedProtocol[] {
  const normalizedPatient = normalizePatientScores(patient)

  return protocols
    .filter((protocol) => protocol.is_active !== false)
    .map((protocol) => scoreProtocolFit(normalizedPatient, protocol))
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, limit)
}