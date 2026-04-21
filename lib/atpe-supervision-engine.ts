export type SupervisionPatientPoint = {
  patientId: string
  patientName: string
  profile?: string | null
  compositeScore: number
  predictionTrend: 'improving' | 'stable' | 'fragile' | 'declining'
  riskLevel: 'low' | 'moderate' | 'high'
  axisScores: {
    internalProcess: number
    expressiveProcess: number
    relationalProcess: number
    pluriexpressivity: number
    institutionalIndicators: number
    sensorialSymbolic: number
  }
}

export type SupervisionAlert = {
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
}

export type SupervisionSummary = {
  totalPatients: number
  averageCompositeScore: number
  profileDistribution: Record<string, number>
  trendDistribution: Record<string, number>
  fragileAxes: Array<{ axis: string; count: number }>
  alerts: SupervisionAlert[]
}

const AXIS_LABELS: Record<string, string> = {
  internalProcess: 'Processus interne',
  expressiveProcess: 'Processus expressif',
  relationalProcess: 'Processus relationnel',
  pluriexpressivity: 'Pluriexpressionnalité',
  institutionalIndicators: 'Indicateurs institutionnels',
  sensorialSymbolic: 'Sensoriel & symbolique',
}

export function buildSupervisionSummary(
  patients: SupervisionPatientPoint[]
): SupervisionSummary {
  const totalPatients = patients.length
  const averageCompositeScore =
    totalPatients === 0
      ? 0
      : Math.round(
          patients.reduce((sum, p) => sum + p.compositeScore, 0) / totalPatients
        )

  const profileDistribution: Record<string, number> = {}
  const trendDistribution: Record<string, number> = {
    improving: 0,
    stable: 0,
    fragile: 0,
    declining: 0,
  }

  const axisCounts: Record<string, number> = {
    internalProcess: 0,
    expressiveProcess: 0,
    relationalProcess: 0,
    pluriexpressivity: 0,
    institutionalIndicators: 0,
    sensorialSymbolic: 0,
  }

  for (const patient of patients) {
    const profile = patient.profile ?? 'Soutien intégratif'
    profileDistribution[profile] = (profileDistribution[profile] ?? 0) + 1
    trendDistribution[patient.predictionTrend] += 1

    for (const [axis, score] of Object.entries(patient.axisScores)) {
      if (score < 40) axisCounts[axis] += 1
    }
  }

  const fragileAxes = Object.entries(axisCounts)
    .map(([axis, count]) => ({
      axis: AXIS_LABELS[axis] ?? axis,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const alerts: SupervisionAlert[] = []

  if (patients.some((p) => p.riskLevel === 'high')) {
    alerts.push({
      severity: 'critical',
      title: 'Patients à haut risque',
      message:
        'Au moins un patient présente un niveau de risque élevé nécessitant une vigilance rapprochée.',
    })
  }

  if (trendDistribution.declining >= 2) {
    alerts.push({
      severity: 'warning',
      title: 'Dégradations multiples',
      message:
        'Plusieurs patients présentent actuellement une trajectoire en dégradation.',
    })
  }

  if (fragileAxes[0] && fragileAxes[0].count >= Math.ceil(totalPatients / 3)) {
    alerts.push({
      severity: 'warning',
      title: 'Fragilité transversale dominante',
      message: `L’axe le plus souvent fragile est : ${fragileAxes[0].axis}.`,
    })
  }

  if (averageCompositeScore >= 70 && trendDistribution.declining === 0) {
    alerts.push({
      severity: 'info',
      title: 'Dynamique globale favorable',
      message:
        'Le niveau global observé est plutôt favorable à l’échelle du portefeuille suivi.',
    })
  }

  return {
    totalPatients,
    averageCompositeScore,
    profileDistribution,
    trendDistribution,
    fragileAxes,
    alerts,
  }
}