import crypto from 'crypto'

export type AtpeVersionSnapshot = {
  sessionId: string
  patientId: string
  sessionDate?: string | null
  profile?: string | null
  compositeScore: number
  predictionTrend?: string | null
  axisScores: {
    internalProcess: number
    expressiveProcess: number
    relationalProcess: number
    pluriexpressivity: number
    institutionalIndicators: number
    sensorialSymbolic: number
  }
  summaryText: string
  alerts?: Array<{
    level: string
    title: string
    message: string
  }>
  protocol?: {
    title: string
    subtitle?: string
    primaryGoals?: string[]
    mediations?: string[]
  }
}

export type AtpeSessionVersionRecord = {
  id: string
  session_id: string
  patient_id: string
  version_number: number
  snapshot: AtpeVersionSnapshot
  clinical_summary_text?: string | null
  composite_score?: number | null
  profile?: string | null
  prediction_trend?: string | null
  signed_by?: string | null
  signed_at?: string | null
  is_locked: boolean
  pdf_locked: boolean
  hash?: string | null
  created_at: string
}

export type AtpeVersionDiff = {
  profileChanged: boolean
  compositeDelta: number
  predictionChanged: boolean
  axisDeltas: {
    internalProcess: number
    expressiveProcess: number
    relationalProcess: number
    pluriexpressivity: number
    institutionalIndicators: number
    sensorialSymbolic: number
  }
  summaryChanged: boolean
}

export function buildVersionHash(snapshot: AtpeVersionSnapshot): string {
  const normalized = JSON.stringify(snapshot)
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

export function buildVersionPayload(params: {
  sessionId: string
  patientId: string
  versionNumber: number
  snapshot: AtpeVersionSnapshot
  signerName?: string | null
  lockPdf?: boolean
}) {
  const hash = buildVersionHash(params.snapshot)

  return {
    session_id: params.sessionId,
    patient_id: params.patientId,
    version_number: params.versionNumber,
    snapshot: params.snapshot,
    clinical_summary_text: params.snapshot.summaryText,
    composite_score: params.snapshot.compositeScore,
    profile: params.snapshot.profile ?? null,
    prediction_trend: params.snapshot.predictionTrend ?? null,
    signed_by: params.signerName ?? null,
    signed_at: params.signerName ? new Date().toISOString() : null,
    is_locked: true,
    pdf_locked: !!params.lockPdf,
    hash,
  }
}

export function compareVersions(
  previous: AtpeVersionSnapshot,
  next: AtpeVersionSnapshot
): AtpeVersionDiff {
  return {
    profileChanged: (previous.profile ?? null) !== (next.profile ?? null),
    compositeDelta: next.compositeScore - previous.compositeScore,
    predictionChanged:
      (previous.predictionTrend ?? null) !== (next.predictionTrend ?? null),
    axisDeltas: {
      internalProcess:
        next.axisScores.internalProcess - previous.axisScores.internalProcess,
      expressiveProcess:
        next.axisScores.expressiveProcess - previous.axisScores.expressiveProcess,
      relationalProcess:
        next.axisScores.relationalProcess - previous.axisScores.relationalProcess,
      pluriexpressivity:
        next.axisScores.pluriexpressivity - previous.axisScores.pluriexpressivity,
      institutionalIndicators:
        next.axisScores.institutionalIndicators -
        previous.axisScores.institutionalIndicators,
      sensorialSymbolic:
        next.axisScores.sensorialSymbolic - previous.axisScores.sensorialSymbolic,
    },
    summaryChanged: previous.summaryText !== next.summaryText,
  }
}

export function summarizeVersionDiff(diff: AtpeVersionDiff): string[] {
  const items: string[] = []

  if (diff.profileChanged) items.push('Changement de profil clinique')
  if (diff.predictionChanged) items.push('Changement de tendance prédictive')
  if (diff.compositeDelta !== 0) {
    items.push(
      `Variation du score composite : ${diff.compositeDelta > 0 ? '+' : ''}${diff.compositeDelta}`
    )
  }

  const axisEntries = Object.entries(diff.axisDeltas).filter(([, delta]) => delta !== 0)
  for (const [axis, delta] of axisEntries) {
    items.push(`${axis} : ${delta > 0 ? '+' : ''}${delta}`)
  }

  if (diff.summaryChanged) items.push('Résumé clinique modifié')

  return items.length ? items : ['Aucune différence significative détectée']
}