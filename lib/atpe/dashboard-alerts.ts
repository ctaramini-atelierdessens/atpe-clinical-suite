import {
  getClinicalLevel,
  getRiskFlag,
  getTrajectoryTrend,
  type AtpeExpertCompatibleSession,
} from '@/lib/atpe/clinical-intelligence'
import {
  resolveAtpeClinicalMatrix,
  getAxisLabel,
  type AtpeClinicalAxis,
} from '@/lib/atpe/clinical-matrix'
import { analyzeAtpeTrajectory } from '@/lib/atpe/trajectory-analysis'

export type DashboardAlertLevel = 'critical' | 'high' | 'moderate' | 'info'

export type DashboardAlert = {
  id: string
  level: DashboardAlertLevel
  title: string
  message: string
  recommendation?: string
  related_axes?: AtpeClinicalAxis[]
}

export type DashboardAlertSession = AtpeExpertCompatibleSession & {
  id?: string
  created_at?: string | null
  session_number?: number
  atpe_phase_dominant?: string | null
  longitudinal_phase?:
    | 'installation'
    | 'mobilisation'
    | 'pivot'
    | 'consolidation'
    | null
  longitudinal_title?: string | null
}

export type DashboardAlertResult = {
  latest: DashboardAlertSession | null
  clinicalLevel: ReturnType<typeof getClinicalLevel> | null
  riskFlag: ReturnType<typeof getRiskFlag> | null
  trajectory: ReturnType<typeof getTrajectoryTrend>
  alerts: DashboardAlert[]
  matrix: ReturnType<typeof resolveAtpeClinicalMatrix> | null
  trajectoryAnalysis: ReturnType<typeof analyzeAtpeTrajectory> | null
}

function uniqueAxes(values: AtpeClinicalAxis[] | undefined): AtpeClinicalAxis[] {
  if (!values || values.length === 0) return []
  return Array.from(new Set(values))
}

function pushAlert(alerts: DashboardAlert[], alert: DashboardAlert) {
  alerts.push({
    ...alert,
    related_axes: uniqueAxes(alert.related_axes),
  })
}

export function buildDashboardAlerts(
  latest: DashboardAlertSession,
  sessions: DashboardAlertSession[],
  trajectory: ReturnType<typeof getTrajectoryTrend>,
  riskFlag: ReturnType<typeof getRiskFlag>,
  clinicalLevel: ReturnType<typeof getClinicalLevel>
): DashboardAlert[] {
  const alerts: DashboardAlert[] = []
  const matrix = resolveAtpeClinicalMatrix(latest)
  const trajectoryAnalysis = analyzeAtpeTrajectory(sessions)

  const relationScore = matrix.axes.relation
  const somaScore = matrix.axes.soma
  const projectionScore = matrix.axes.projection
  const symbolisationScore = matrix.axes.symbolisation
  const identiteScore = matrix.axes.identite
  const transformationScore = matrix.axes.transformation

  // ===============================
  // ALERTES GLOBALES DE RISQUE
  // ===============================

  if (riskFlag.flag === 'critical') {
    pushAlert(alerts, {
      id: 'risk-critical',
      level: 'critical',
      title: 'Risque clinique critique',
      message:
        'Le niveau de risque calculé est critique sur la dernière séance. Le cadre paraît insuffisamment protecteur au regard de la charge clinique.',
      recommendation:
        'Réduire immédiatement la complexité, renforcer la contenance et réévaluer le rythme des séances.',
      related_axes: ['soma', 'relation'],
    })
  } else if (riskFlag.flag === 'high') {
    pushAlert(alerts, {
      id: 'risk-high',
      level: 'high',
      title: 'Risque clinique élevé',
      message:
        'La dernière séance présente plusieurs indicateurs de tension ou de fragilité clinique.',
      recommendation:
        'Renforcer le cadre, ralentir les sollicitations et surveiller l’évolution à court terme.',
      related_axes: ['soma', 'relation', 'transformation'],
    })
  }

  // ===============================
  // TRAJECTOIRE CLASSIQUE
  // ===============================

  if (trajectory.trend === 'declining') {
    pushAlert(alerts, {
      id: 'trajectory-declining',
      level: 'high',
      title: 'Trajectoire défavorable',
      message:
        'La trajectoire globale montre une baisse significative des capacités cliniques sur la série de séances.',
      recommendation:
        'Réévaluer les médiations, le rythme et le niveau d’exigence thérapeutique.',
      related_axes: [matrix.weakestAxis],
    })
  } else if (trajectory.trend === 'stable' && clinicalLevel.level === 'fragile') {
    pushAlert(alerts, {
      id: 'trajectory-fragile-stable',
      level: 'moderate',
      title: 'Stabilité fragile',
      message:
        'La trajectoire reste stable, mais sur un niveau clinique encore fragile.',
      recommendation:
        'Maintenir un cadre sobre et sécurisant sans augmenter la complexité.',
      related_axes: ['relation', 'soma'],
    })
  }

  // ===============================
  // TRAJECTOIRE EXPERTE
  // ===============================

  if (trajectoryAnalysis.pattern === 'sudden_drop') {
    pushAlert(alerts, {
      id: 'trajectory-sudden-drop',
      level: 'high',
      title: 'Rupture brutale de trajectoire',
      message:
        "L’analyse supervisionnelle repère une chute nette entre deux séances, suggérant une rupture du processus ou une désorganisation aiguë.",
      recommendation:
        'Revenir à une clinique de sécurisation, identifier le facteur de rupture et réduire temporairement la complexité des médiations.',
      related_axes: [matrix.weakestAxis, 'soma', 'relation'],
    })
  }

  if (trajectoryAnalysis.pattern === 'clinical_instability') {
    pushAlert(alerts, {
      id: 'trajectory-clinical-instability',
      level: 'high',
      title: 'Instabilité clinique',
      message:
        "La trajectoire présente des oscillations importantes sans direction stable, suggérant une base encore peu consolidée.",
      recommendation:
        'Stabiliser davantage le cadre, réduire les variations techniques et renforcer la continuité inter-séances.',
      related_axes: ['relation', 'soma', 'transformation'],
    })
  }

  if (trajectoryAnalysis.pattern === 'gradual_decline') {
    pushAlert(alerts, {
      id: 'trajectory-gradual-decline',
      level: 'high',
      title: 'Régression progressive',
      message:
        "L’analyse longitudinale met en évidence une baisse progressive des scores cliniques plutôt qu’un incident isolé.",
      recommendation:
        'Reprendre la stratégie thérapeutique globale, réévaluer la pertinence des protocoles et renforcer les axes les plus fragiles.',
      related_axes: [matrix.weakestAxis],
    })
  }

  if (
    trajectoryAnalysis.pattern === 'stable_plateau' &&
    trajectoryAnalysis.severity === 'moderate'
  ) {
    pushAlert(alerts, {
      id: 'trajectory-low-plateau',
      level: 'moderate',
      title: 'Plateau clinique bas',
      message:
        'La trajectoire est stable, mais à un niveau encore fragile. Il existe un risque de chronicisation de l’équilibre bas.',
      recommendation:
        'Chercher des micro-déplacements thérapeutiques sans rompre la stabilité acquise.',
      related_axes: [matrix.weakestAxis, 'relation'],
    })
  }

  if (trajectoryAnalysis.pattern === 'slow_progress') {
    pushAlert(alerts, {
      id: 'trajectory-slow-progress',
      level: 'info',
      title: 'Progression lente mais présente',
      message:
        "La trajectoire montre une amélioration modérée et progressive. Le processus avance, mais sans accélération majeure.",
      recommendation:
        'Poursuivre le travail en consolidant les appuis existants avant d’augmenter la complexité clinique.',
      related_axes: [matrix.dominantAxis],
    })
  }

  if (trajectoryAnalysis.pattern === 'therapeutic_rebound') {
    pushAlert(alerts, {
      id: 'trajectory-therapeutic-rebound',
      level: 'moderate',
      title: 'Rebond thérapeutique',
      message:
        'Après une baisse notable, la trajectoire montre un redressement clinique significatif. Ce rebond doit être consolidé.',
      recommendation:
        'Soutenir ce mouvement sans le surexploiter et privilégier les médiations qui ont restauré continuité et sécurité.',
      related_axes: [matrix.dominantAxis, matrix.weakestAxis],
    })
  }

  if (trajectoryAnalysis.pattern === 'sustained_improvement') {
    pushAlert(alerts, {
      id: 'trajectory-sustained-improvement',
      level: 'info',
      title: 'Amélioration soutenue',
      message:
        "La trajectoire clinique montre une amélioration cohérente et répétée sur plusieurs séances.",
      recommendation:
        'Poursuivre le cadre actuel en ouvrant progressivement vers l’intégration ou la transférabilité.',
      related_axes: [matrix.dominantAxis, 'transformation'],
    })
  }

  // ===============================
  // AXES CLINIQUES
  // ===============================

  if (relationScore < 45) {
    pushAlert(alerts, {
      id: 'axis-relation-fragile',
      level: relationScore < 30 ? 'high' : 'moderate',
      title: 'Alliance relationnelle fragile',
      message: `Le score de ${getAxisLabel('relation').toLowerCase()} est bas (${relationScore}/100). Le lien thérapeutique ou groupal semble encore peu consolidé.`,
      recommendation:
        'Privilégier des protocoles d’entrée en relation, des médiations simples et une présence thérapeutique très ajustée.',
      related_axes: ['relation'],
    })
  }

  if (somaScore < 45) {
    pushAlert(alerts, {
      id: 'axis-soma-fragile',
      level: somaScore < 30 ? 'high' : 'moderate',
      title: 'Régulation corporelle insuffisante',
      message: `Le score de ${getAxisLabel('soma').toLowerCase()} est bas (${somaScore}/100). L’ancrage, la contenance et la régulation par le corps semblent insuffisants.`,
      recommendation:
        'Revenir à des médiations sensorielles et corporelles très contenantes, avec peu de complexité symbolique.',
      related_axes: ['soma'],
    })
  }

  if (projectionScore < 40 && (latest.projective_intensity ?? 0) >= 40) {
    pushAlert(alerts, {
      id: 'axis-projection-overload',
      level: 'high',
      title: 'Projection intense mais peu intégrée',
      message: `Le score de ${getAxisLabel('projection').toLowerCase()} est faible (${projectionScore}/100) alors que l’intensité projective est élevée.`,
      recommendation:
        'Limiter les médiations trop ouvertes, renforcer le cadre et privilégier des dispositifs de contenance avant toute élaboration interprétative.',
      related_axes: ['projection', 'soma', 'relation'],
    })
  }

  if (symbolisationScore < 45) {
    pushAlert(alerts, {
      id: 'axis-symbolisation-fragile',
      level: symbolisationScore < 30 ? 'high' : 'moderate',
      title: 'Symbolisation insuffisante',
      message: `Le score de ${getAxisLabel('symbolisation').toLowerCase()} est bas (${symbolisationScore}/100). Les productions semblent encore peu transformables en formes porteuses de sens.`,
      recommendation:
        'Soutenir davantage le passage de la trace à la forme, puis de la forme au sens, sans forcer la mise en mots.',
      related_axes: ['symbolisation'],
    })
  }

  if (identiteScore < 45) {
    pushAlert(alerts, {
      id: 'axis-identity-fragile',
      level: identiteScore < 30 ? 'high' : 'moderate',
      title: 'Intégration de soi fragile',
      message: `Le score de ${getAxisLabel('identite').toLowerCase()} est bas (${identiteScore}/100). La cohérence interne ou le sentiment de soi restent peu stabilisés.`,
      recommendation:
        'Privilégier les protocoles de centration, d’image de soi, de différenciation des parts et de sécurisation identitaire.',
      related_axes: ['identite', 'relation'],
    })
  }

  if (transformationScore < 45 && matrix.dominantAxis !== 'transformation') {
    pushAlert(alerts, {
      id: 'axis-transformation-limited',
      level: 'moderate',
      title: 'Transformation encore limitée',
      message: `Le score de ${getAxisLabel('transformation').toLowerCase()} est bas (${transformationScore}/100). Le passage d’une expérience à une véritable mutation psychique semble encore peu disponible.`,
      recommendation:
        'Ne pas précipiter les protocoles de passage ou de clôture. Consolider d’abord les axes de base avant d’engager un travail transformationnel plus profond.',
      related_axes: ['transformation', matrix.weakestAxis],
    })
  }

  // ===============================
  // CROISEMENTS CLINIQUES EXPERTS
  // ===============================

  if (relationScore < 45 && somaScore < 45) {
    pushAlert(alerts, {
      id: 'cross-alliance-containment',
      level: 'high',
      title: 'Lien et contenance conjointement fragiles',
      message:
        'Le lien thérapeutique et la régulation corporelle sont tous deux fragiles. Le patient risque de ne pas pouvoir s’appuyer suffisamment ni sur le cadre, ni sur la relation.',
      recommendation:
        'Ralentir, ritualiser davantage les débuts et fins de séance, et privilégier les médiations de présence, de rythme et d’appui concret.',
      related_axes: ['relation', 'soma'],
    })
  }

  if (symbolisationScore < 45 && projectionScore >= 55) {
    pushAlert(alerts, {
      id: 'cross-projection-symbolisation-gap',
      level: 'moderate',
      title: 'Projection disponible mais élaboration insuffisante',
      message:
        'L’activité projective semble présente, mais la transformation en forme symbolique reste encore limitée.',
      recommendation:
        'Introduire des temps de reprise, de regard, de nomination ou de transformation progressive des productions.',
      related_axes: ['projection', 'symbolisation'],
    })
  }

  if (identiteScore < 45 && transformationScore >= 60) {
    pushAlert(alerts, {
      id: 'cross-transformation-too-fast',
      level: 'moderate',
      title: 'Transformation plus rapide que l’intégration de soi',
      message:
        'Le processus de transformation semble plus mobilisé que la consolidation identitaire. Il existe un risque de mouvement trop rapide pour la base psychique actuelle.',
      recommendation:
        'Renforcer les protocoles de centration, d’image de soi et de cohérence interne avant d’intensifier le passage transformationnel.',
      related_axes: ['identite', 'transformation'],
    })
  }

  // ===============================
  // SIGNAUX EXISTANTS CONSERVÉS
  // ===============================

  if ((latest.patient_engagement_level ?? 0) < 50) {
    pushAlert(alerts, {
      id: 'engagement-low',
      level: 'moderate',
      title: 'Engagement faible',
      message:
        'Le niveau d’engagement patient observé reste bas sur la dernière séance.',
      recommendation:
        'Privilégier des médiations simples, des relances courtes et un rythme plus lent.',
      related_axes: ['relation'],
    })
  }

  if ((latest.frame_containment ?? 0) < 60) {
    pushAlert(alerts, {
      id: 'containment-low',
      level: 'high',
      title: 'Contenance du cadre insuffisante',
      message:
        'Le score de contenance est faible sur la dernière séance.',
      recommendation:
        'Renforcer les repères, la prévisibilité et les limites du cadre thérapeutique.',
      related_axes: ['soma', 'relation'],
    })
  }

  if ((latest.projective_intensity ?? 0) >= 40) {
    pushAlert(alerts, {
      id: 'projective-high',
      level: 'high',
      title: 'Intensité projective élevée',
      message:
        'L’intensité projective observée augmente le risque de surcharge ou de débordement.',
      recommendation:
        'Éviter les interprétations précoces et privilégier une fonction contenante.',
      related_axes: ['projection', 'soma'],
    })
  }

  if (
    latest.therapist_feels_confusion ||
    latest.therapist_feels_pressure ||
    latest.therapist_feels_irritation ||
    latest.therapist_feels_void ||
    latest.therapist_feels_sudden_fatigue
  ) {
    pushAlert(alerts, {
      id: 'countertransference-signal',
      level: 'moderate',
      title: 'Signal contre-transférentiel',
      message:
        'La dernière séance comporte un ou plusieurs marqueurs contre-transférentiels significatifs.',
      recommendation:
        'Mettre en reprise clinique la séance et vérifier l’ajustement du cadre.',
      related_axes: ['relation', 'projection', 'soma'],
    })
  }

  // ===============================
  // AUCUNE ALERTE MAJEURE
  // ===============================

  if (alerts.length === 0) {
    pushAlert(alerts, {
      id: 'no-major-alert',
      level: 'info',
      title: 'Pas d’alerte clinique majeure',
      message:
        'Aucune alerte majeure n’est détectée sur la dernière séance au regard des seuils du dashboard, de la matrice clinique et de la trajectoire expert.',
      recommendation:
        'Poursuivre le suivi avec le même niveau de stabilité clinique.',
      related_axes: [matrix.dominantAxis],
    })
  }

  return alerts
}

export function resolveDashboardAlerts(
  sessions: DashboardAlertSession[] | null | undefined
): DashboardAlertResult {
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const latest = safeSessions.length > 0 ? safeSessions[safeSessions.length - 1] : null
  const trajectory = getTrajectoryTrend(safeSessions)
  const trajectoryAnalysis = safeSessions.length > 0 ? analyzeAtpeTrajectory(safeSessions) : null

  if (!latest) {
    return {
      latest: null,
      clinicalLevel: null,
      riskFlag: null,
      trajectory,
      matrix: null,
      trajectoryAnalysis,
      alerts: [
        {
          id: 'no-session',
          level: 'info',
          title: 'Aucune séance disponible',
          message:
            'Aucune séance n’est disponible pour produire des alertes cliniques automatiques.',
          recommendation:
            'Compléter au moins une séance pour activer les alertes.',
          related_axes: [],
        },
      ],
    }
  }

  const clinicalLevel = getClinicalLevel(latest)
  const riskFlag = getRiskFlag(latest)
  const matrix = resolveAtpeClinicalMatrix(latest)
  const alerts = buildDashboardAlerts(
    latest,
    safeSessions,
    trajectory,
    riskFlag,
    clinicalLevel
  )

  return {
    latest,
    clinicalLevel,
    riskFlag,
    trajectory,
    matrix,
    trajectoryAnalysis,
    alerts,
  }
}

export function getAlertContainerClass(level: DashboardAlertLevel) {
  switch (level) {
    case 'critical':
      return 'border-red-300 bg-red-50 text-red-900'
    case 'high':
      return 'border-orange-300 bg-orange-50 text-orange-900'
    case 'moderate':
      return 'border-amber-300 bg-amber-50 text-amber-900'
    case 'info':
    default:
      return 'border-blue-300 bg-blue-50 text-blue-900'
  }
}

export function getAlertBadgeClass(level: DashboardAlertLevel) {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'moderate':
      return 'bg-amber-100 text-amber-800'
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export function getGlobalAlertTone(alerts: DashboardAlert[]) {
  if (alerts.some((a) => a.level === 'critical')) {
    return {
      container: 'border-red-300 bg-red-50 text-red-900',
      badge: 'bg-red-100 text-red-800',
      label: 'Alerte critique',
    }
  }

  if (alerts.some((a) => a.level === 'high')) {
    return {
      container: 'border-orange-300 bg-orange-50 text-orange-900',
      badge: 'bg-orange-100 text-orange-800',
      label: 'Vigilance élevée',
    }
  }

  if (alerts.some((a) => a.level === 'moderate')) {
    return {
      container: 'border-amber-300 bg-amber-50 text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
      label: 'Vigilance clinique',
    }
  }

  return {
    container: 'border-blue-300 bg-blue-50 text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    label: 'Information clinique',
  }
}

export function alertLevelLabel(level: DashboardAlertLevel) {
  switch (level) {
    case 'critical':
      return 'Critique'
    case 'high':
      return 'Élevée'
    case 'moderate':
      return 'Modérée'
    case 'info':
    default:
      return 'Info'
  }
}

export function pdfAlertTone(
  level: DashboardAlertLevel
): 'red' | 'orange' | 'amber' | 'blue' {
  switch (level) {
    case 'critical':
      return 'red'
    case 'high':
      return 'orange'
    case 'moderate':
      return 'amber'
    case 'info':
    default:
      return 'blue'
  }
}

export function formatRelatedAxesLabel(
  axes: AtpeClinicalAxis[] | null | undefined
): string {
  const safeAxes = uniqueAxes(axes ?? [])
  if (safeAxes.length === 0) return '—'
  return safeAxes.map((axis) => getAxisLabel(axis)).join(', ')
}