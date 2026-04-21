import { axisLabel, AtpeCompositeScoreResult } from '@/lib/atpe-composite-score'
import { DashboardAlert } from '@/lib/dashboard-alerts'
import { AtpeProtocol } from '@/lib/atpe-protocol-engine'
import {
  AtpePredictionResult,
  riskLevelLabel,
  trendLabel,
} from '@/lib/atpe-prediction-engine'

export type AtpeClinicalSummaryExportInput = {
  patientName?: string | null
  sessionDateLabel?: string | null
  profile?: string | null
  composite: AtpeCompositeScoreResult
  prediction: AtpePredictionResult
  protocol: AtpeProtocol
  alerts?: DashboardAlert[]
  sessionsCount?: number
}

function profileLabel(profile?: string | null) {
  return profile ?? 'Soutien intégratif'
}

function sentenceCase(text: string) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function pickPriorityAlerts(alerts: DashboardAlert[] = [], max = 3): DashboardAlert[] {
  const levelRank: Record<DashboardAlert['level'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
    success: 3,
  }

  return [...alerts]
    .sort((a, b) => levelRank[a.level] - levelRank[b.level])
    .slice(0, max)
}

function joinAsBullets(items: string[]): string {
  if (!items.length) return '- Aucun élément renseigné'
  return items.map((item) => `- ${item}`).join('\n')
}

export function buildAtpeClinicalSummaryExport(
  input: AtpeClinicalSummaryExportInput
): string {
  const {
    patientName,
    sessionDateLabel,
    profile,
    composite,
    prediction,
    protocol,
    alerts = [],
    sessionsCount,
  } = input

  const name = patientName || 'Patient'
  const selectedAlerts = pickPriorityAlerts(alerts, 3)

  const introLine = [
    `Résumé clinique ATPE`,
    patientName ? `Patient : ${name}` : null,
    sessionDateLabel ? `Référence : ${sessionDateLabel}` : null,
    typeof sessionsCount === 'number'
      ? `Nombre de séances prises en compte : ${sessionsCount}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const synthesis =
    `${name} présente actuellement un profil clinique dominant de type « ${profileLabel(
      profile
    )} ». ` +
    `Le score composite ATPE est de ${composite.global}/100, correspondant à ${composite.interpretation.toLowerCase()}. ` +
    `L’axe le plus mobilisable est ${axisLabel(composite.dominantAxis).toLowerCase()}, ` +
    `tandis que la principale zone de fragilité concerne ${axisLabel(
      composite.weakestAxis
    ).toLowerCase()}. ` +
    `La trajectoire longitudinale est actuellement orientée vers une ${trendLabel(
      prediction.trend
    ).toLowerCase()}, avec un niveau de risque ${riskLevelLabel(
      prediction.riskLevel
    ).toLowerCase()}. ` +
    `L’orientation thérapeutique recommandée s’appuie sur le protocole « ${protocol.title} ».`

  const text = [
    introLine,
    '',
    `1. Synthèse clinique`,
    synthesis,
    '',
    `2. Indicateurs structurants`,
    `- Profil clinique : ${profileLabel(profile)}`,
    `- Score composite : ${composite.global}/100 (${composite.interpretation})`,
    `- Tendance longitudinale : ${trendLabel(prediction.trend)}`,
    `- Niveau de risque : ${riskLevelLabel(prediction.riskLevel)}`,
    `- Axe dominant : ${axisLabel(composite.dominantAxis)}`,
    `- Axe le plus fragile : ${axisLabel(composite.weakestAxis)}`,
    '',
    `3. Points d’appui cliniques`,
    joinAsBullets(
      composite.strengths.length
        ? composite.strengths
        : ['Pas de point d’appui saillant actuellement identifié']
    ),
    '',
    `4. Fragilités prioritaires`,
    joinAsBullets(
      composite.vulnerabilities.length
        ? composite.vulnerabilities
        : ['Aucune fragilité majeure prioritaire actuellement repérée']
    ),
    '',
    `5. Orientation thérapeutique recommandée`,
    `- Protocole : ${protocol.title}`,
    `- Intention clinique : ${sentenceCase(protocol.clinicalIntent)}`,
    `- Objectifs principaux :`,
    joinAsBullets(protocol.primaryGoals),
    '',
    `6. Médiations recommandées`,
    joinAsBullets(protocol.mediations),
    '',
    `7. Vigilances`,
    joinAsBullets(protocol.vigilance),
    '',
    `8. Signaux de vigilance prioritaires`,
    selectedAlerts.length
      ? selectedAlerts
          .map(
            (alert) =>
              `- ${alert.title} : ${alert.message}${
                alert.recommendation ? ` | Piste clinique : ${alert.recommendation}` : ''
              }`
          )
          .join('\n')
      : '- Aucun signal prioritaire particulier',
    '',
    `9. Formulation clinique prête à intégrer`,
    `${name} présente actuellement un fonctionnement clinique dominé par un profil de type ${profileLabel(
      profile
    )}, avec un score composite ATPE de ${composite.global}/100. ` +
      `Le registre le plus mobilisable concerne ${axisLabel(
        composite.dominantAxis
      ).toLowerCase()}, tandis que la principale fragilité concerne ${axisLabel(
        composite.weakestAxis
      ).toLowerCase()}. ` +
      `La trajectoire observée est actuellement orientée vers une ${trendLabel(
        prediction.trend
      ).toLowerCase()}, avec un risque ${riskLevelLabel(
        prediction.riskLevel
      ).toLowerCase()}. ` +
      `L’accompagnement thérapeutique peut s’appuyer prioritairement sur le protocole ${protocol.title}, en privilégiant ${protocol.primaryGoals
        .slice(0, 2)
        .join(' et ')}.`,
  ].join('\n')

  return text.trim()
}