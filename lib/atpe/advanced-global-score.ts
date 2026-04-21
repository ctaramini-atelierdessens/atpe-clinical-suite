export type NullableNumber = number | null | undefined

export type TracePrenomInput = {
  engagement?: NullableNumber
  tension?: NullableNumber
  vulnerabilite?: NullableNumber
  symbolisation?: NullableNumber
  anchoring?: NullableNumber
  continuity?: NullableNumber
}

export type DialogueColoreInput = {
  contact?: NullableNumber
  engagement?: NullableNumber
  continuity?: NullableNumber
  rupture?: NullableNumber
  emotionalExpression?: NullableNumber
  inhibition?: NullableNumber
  symbolicEmergence?: NullableNumber
}

export type DiamandalaInput = {
  synchronization?: NullableNumber
  adaptation?: NullableNumber
  centerApproach?: NullableNumber
  centerAvoidance?: NullableNumber
  centerIntegration?: NullableNumber
  structureOrganization?: NullableNumber
}

export type ExpressionPrimitiveInput = {
  anchoring?: NullableNumber
  coordination?: NullableNumber
  groupEngagement?: NullableNumber
  rhythmIntegration?: NullableNumber
  symbolicExpression?: NullableNumber
  structureLevel?: NullableNumber
  expressionLevel?: NullableNumber
}

export type ColorInput = {
  preferredColors?: string[] | null
  rejectedColors?: string[] | null
}

export type VoiceInput = {
  tone?: 'stable' | 'cassé' | 'monotone' | 'chaotique' | null
  rhythm?: 'fluide' | 'saccadé' | null
  intensity?: 'faible' | 'forte' | 'variable' | null
  emotionalLoad?: NullableNumber
  bodyConnection?: NullableNumber
  envelope?: 'solide' | 'fragile' | 'perméable' | null
  mirrorQuality?: 'bon' | 'instable' | 'pathologique' | null
  archaicExpression?: 'inhibé' | 'présent' | 'débordant' | null
  vocalEmotion?:
    | 'amour'
    | 'colère'
    | 'tristesse'
    | 'vide'
    | 'joie'
    | 'apaisement'
    | null
  verbalEmotion?:
    | 'amour'
    | 'colère'
    | 'tristesse'
    | 'vide'
    | 'joie'
    | 'apaisement'
    | null
}

export type MandalaInput = {
  centerStrength?: NullableNumber
  boundaryIntegrity?: NullableNumber
  symmetry?: NullableNumber
  openness?: NullableNumber
}

export type AdvancedGlobalScoreInput = {
  tracePrenom?: TracePrenomInput | null
  dialogueColore?: DialogueColoreInput | null
  diamandala?: DiamandalaInput | null
  expressionPrimitive?: ExpressionPrimitiveInput | null
  color?: ColorInput | null
  voice?: VoiceInput | null
  mandala?: MandalaInput | null
}

export type ScoreBreakdown = {
  bodyAnchoring: number | null
  relationEngagement: number | null
  symbolization: number | null
  affectColor: number | null
  voiceEnvelope: number | null
  integrationCentering: number | null
}

export type AdvancedGlobalScoreResult = {
  globalScore: number | null
  confidenceScore: number
  clinicalLevel:
    | 'très fragile'
    | 'fragile'
    | 'intermédiaire'
    | 'structuré'
    | 'intégré'
    | 'indisponible'
  subscores: ScoreBreakdown
  alerts: string[]
  strengths: string[]
  recommendations: string[]
  missingModules: string[]
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Math.round(value)
}

function avg(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function scoreFromFive(value: NullableNumber): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return clamp((value / 5) * 100)
}

function inverseScoreFromFive(value: NullableNumber): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return clamp(100 - (value / 5) * 100)
}

function colorNeedScore(input?: ColorInput | null): number | null {
  if (!input) return null

  const preferred = (input.preferredColors ?? []).map((c) => c.toLowerCase())
  const rejected = (input.rejectedColors ?? []).map((c) => c.toLowerCase())

  let score = 50

  const fundamentals = ['blue', 'green', 'red', 'yellow', 'bleu', 'vert', 'rouge', 'jaune']
  const auxiliary = ['violet', 'brown', 'marron', 'black', 'noir', 'gray', 'grey', 'gris']

  const rejectedFundamentals = rejected.filter((c) => fundamentals.includes(c)).length
  const preferredAuxiliaries = preferred.filter((c) => auxiliary.includes(c)).length

  score -= rejectedFundamentals * 10
  score -= preferredAuxiliaries * 5

  if (preferred.includes('blue') || preferred.includes('bleu')) score += 8
  if (preferred.includes('yellow') || preferred.includes('jaune')) score += 6
  if (preferred.includes('red') || preferred.includes('rouge')) score += 4
  if (preferred.includes('green') || preferred.includes('vert')) score += 4

  return clamp(score)
}

function voiceEnvelopeScore(input?: VoiceInput | null): number | null {
  if (!input) return null

  const emotion = scoreFromFive(input.emotionalLoad)
  const body = scoreFromFive(input.bodyConnection)

  let envelope = 50
  if (input.envelope === 'solide') envelope += 20
  if (input.envelope === 'fragile') envelope -= 20
  if (input.envelope === 'perméable') envelope -= 10

  if (input.mirrorQuality === 'bon') envelope += 15
  if (input.mirrorQuality === 'instable') envelope -= 10
  if (input.mirrorQuality === 'pathologique') envelope -= 25

  if (input.tone === 'stable') envelope += 8
  if (input.tone === 'cassé') envelope -= 12
  if (input.tone === 'monotone') envelope -= 8
  if (input.tone === 'chaotique') envelope -= 18

  if (input.rhythm === 'fluide') envelope += 7
  if (input.rhythm === 'saccadé') envelope -= 10

  if (input.archaicExpression === 'présent') envelope += 5
  if (input.archaicExpression === 'inhibé') envelope -= 8
  if (input.archaicExpression === 'débordant') envelope -= 12

  const congruence =
    input.vocalEmotion && input.verbalEmotion
      ? input.vocalEmotion === input.verbalEmotion
        ? 100
        : 45
      : null

  return clamp(avg([emotion, body, envelope, congruence]) ?? envelope)
}

function mandalaIntegrationScore(input?: MandalaInput | null): number | null {
  if (!input) return null
  return avg([
    scoreFromFive(input.centerStrength),
    scoreFromFive(input.boundaryIntegrity),
    scoreFromFive(input.symmetry),
    scoreFromFive(input.openness),
  ])
}

function bodyAnchoringScore(input: AdvancedGlobalScoreInput): number | null {
  return avg([
    scoreFromFive(input.tracePrenom?.anchoring),
    scoreFromFive(input.expressionPrimitive?.anchoring),
    scoreFromFive(input.expressionPrimitive?.coordination),
    scoreFromFive(input.tracePrenom?.continuity),
  ])
}

function relationEngagementScore(input: AdvancedGlobalScoreInput): number | null {
  return avg([
    scoreFromFive(input.dialogueColore?.contact),
    scoreFromFive(input.dialogueColore?.engagement),
    scoreFromFive(input.dialogueColore?.continuity),
    inverseScoreFromFive(input.dialogueColore?.rupture),
    scoreFromFive(input.diamandala?.synchronization),
    scoreFromFive(input.diamandala?.adaptation),
    scoreFromFive(input.expressionPrimitive?.groupEngagement),
  ])
}

function symbolizationScore(input: AdvancedGlobalScoreInput): number | null {
  return avg([
    scoreFromFive(input.tracePrenom?.symbolisation),
    scoreFromFive(input.dialogueColore?.symbolicEmergence),
    scoreFromFive(input.expressionPrimitive?.symbolicExpression),
  ])
}

function integrationCenteringScore(input: AdvancedGlobalScoreInput): number | null {
  return avg([
    scoreFromFive(input.diamandala?.centerApproach),
    inverseScoreFromFive(input.diamandala?.centerAvoidance),
    scoreFromFive(input.diamandala?.centerIntegration),
    scoreFromFive(input.diamandala?.structureOrganization),
    mandalaIntegrationScore(input.mandala),
  ])
}

function computeConfidence(subscores: ScoreBreakdown): number {
  const total = Object.keys(subscores).length
  const present = Object.values(subscores).filter((v) => typeof v === 'number').length
  return round((present / total) * 100)
}

function weightedMean(subscores: ScoreBreakdown): number | null {
  const weights: Record<keyof ScoreBreakdown, number> = {
    bodyAnchoring: 0.2,
    relationEngagement: 0.2,
    symbolization: 0.15,
    affectColor: 0.1,
    voiceEnvelope: 0.15,
    integrationCentering: 0.2,
  }

  let totalWeight = 0
  let total = 0

  for (const key of Object.keys(weights) as Array<keyof ScoreBreakdown>) {
    const value = subscores[key]
    if (typeof value === 'number') {
      total += value * weights[key]
      totalWeight += weights[key]
    }
  }

  if (!totalWeight) return null
  return total / totalWeight
}

function clinicalLevelFromScore(score: number | null): AdvancedGlobalScoreResult['clinicalLevel'] {
  if (score === null) return 'indisponible'
  if (score < 35) return 'très fragile'
  if (score < 50) return 'fragile'
  if (score < 65) return 'intermédiaire'
  if (score < 80) return 'structuré'
  return 'intégré'
}

export function computeAdvancedGlobalScore(
  input: AdvancedGlobalScoreInput
): AdvancedGlobalScoreResult {
  const subscores: ScoreBreakdown = {
    bodyAnchoring: bodyAnchoringScore(input),
    relationEngagement: relationEngagementScore(input),
    symbolization: symbolizationScore(input),
    affectColor: colorNeedScore(input.color),
    voiceEnvelope: voiceEnvelopeScore(input.voice),
    integrationCentering: integrationCenteringScore(input),
  }

  const globalScoreRaw = weightedMean(subscores)
  const globalScore = globalScoreRaw === null ? null : round(globalScoreRaw)
  const confidenceScore = computeConfidence(subscores)

  const alerts: string[] = []
  const strengths: string[] = []
  const recommendations: string[] = []
  const missingModules: string[] = []

  if (subscores.bodyAnchoring !== null && subscores.bodyAnchoring < 45) {
    alerts.push("Fragilité de l'ancrage corporel et de la continuité d'inscription.")
    recommendations.push("Renforcer les médiations d’ancrage, de rythme lent et de structuration corporelle.")
  } else if (subscores.bodyAnchoring !== null && subscores.bodyAnchoring >= 70) {
    strengths.push("Bon appui corporel et continuité de l'engagement.")
  }

  if (subscores.relationEngagement !== null && subscores.relationEngagement < 45) {
    alerts.push('Difficulté d’entrée en relation, d’ajustement ou de co-régulation.')
    recommendations.push("Privilégier des dispositifs de co-création sécurisés et progressifs.")
  } else if (subscores.relationEngagement !== null && subscores.relationEngagement >= 70) {
    strengths.push('Bonne disponibilité relationnelle et ajustement satisfaisant.')
  }

  if (subscores.symbolization !== null && subscores.symbolization < 45) {
    alerts.push('Symbolisation encore fragile ou peu accessible.')
    recommendations.push("Passer par des médiations indirectes, contenantes et peu interprétatives.")
  } else if (subscores.symbolization !== null && subscores.symbolization >= 70) {
    strengths.push('Capacité de symbolisation bien engagée.')
  }

  if (subscores.affectColor !== null && subscores.affectColor < 45) {
    alerts.push('Tensions possibles autour des besoins fondamentaux et des compensations affectives.')
    recommendations.push("Explorer progressivement les palettes symboliques et les oppositions chromatiques.")
  } else if (subscores.affectColor !== null && subscores.affectColor >= 70) {
    strengths.push('Rapport chromatique relativement intégré et souple.')
  }

  if (subscores.voiceEnvelope !== null && subscores.voiceEnvelope < 45) {
    alerts.push("Enveloppe vocale fragile, affect peu contenu ou faible congruence voix/parole.")
    recommendations.push("Introduire un travail de voix contenante : souffle, vibration, émission simple et écoute réciproque.")
  } else if (subscores.voiceEnvelope !== null && subscores.voiceEnvelope >= 70) {
    strengths.push('Voix relativement incarnée, contenante et congruente.')
  }

  if (subscores.integrationCentering !== null && subscores.integrationCentering < 45) {
    alerts.push('Difficulté de centration, d’approche du centre ou de tenue des limites.')
    recommendations.push("Soutenir les dispositifs de mandala, diamandala et compositions centrées très guidées.")
  } else if (subscores.integrationCentering !== null && subscores.integrationCentering >= 70) {
    strengths.push('Bonne dynamique de centration et d’intégration.')
  }

  for (const [key, value] of Object.entries(subscores)) {
    if (value === null) missingModules.push(key)
  }

  if (confidenceScore < 50) {
    recommendations.push("Compléter les modules manquants avant toute lecture clinique trop affirmative.")
  }

  if (globalScore !== null && globalScore < 35) {
    recommendations.push("Prioriser la sécurisation, la contenance et les médiations les moins intrusives.")
  }

  if (globalScore !== null && globalScore >= 65) {
    recommendations.push("Le patient semble pouvoir soutenir des dispositifs davantage intégratifs et élaboratifs.")
  }

  return {
    globalScore,
    confidenceScore,
    clinicalLevel: clinicalLevelFromScore(globalScore),
    subscores: Object.fromEntries(
      Object.entries(subscores).map(([k, v]) => [k, v === null ? null : round(v)])
    ) as ScoreBreakdown,
    alerts,
    strengths,
    recommendations: Array.from(new Set(recommendations)),
    missingModules,
  }
}