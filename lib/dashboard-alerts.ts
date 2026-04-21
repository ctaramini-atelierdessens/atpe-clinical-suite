import { AtpeCompositeScoreResult, AtpeAxisScores, axisLabel } from '@/lib/atpe-composite-score'
import { AtpePredictionResult } from '@/lib/atpe-prediction-engine'

export type DashboardAlertLevel = 'info' | 'warning' | 'critical' | 'success'

export type DashboardAlertCategory =
  | 'profile'
  | 'composite'
  | 'prediction'
  | 'axis'
  | 'trajectory'
  | 'engagement'
  | 'regulation'
  | 'relationship'
  | 'symbolization'

export type DashboardAlert = {
  id: string
  level: DashboardAlertLevel
  category: DashboardAlertCategory
  title: string
  message: string
  recommendation?: string
}

export type BuildDashboardAlertsInput = {
  profile?: string | null
  composite: AtpeCompositeScoreResult
  prediction?: AtpePredictionResult | null
  axisScores: AtpeAxisScores
  sessionsCount?: number
}

function pushAlert(
  alerts: DashboardAlert[],
  alert: DashboardAlert
) {
  const exists = alerts.some((item) => item.id === alert.id)
  if (!exists) {
    alerts.push(alert)
  }
}

function getLowAxes(axisScores: AtpeAxisScores, threshold = 40): Array<keyof AtpeAxisScores> {
  return (Object.entries(axisScores) as Array<[keyof AtpeAxisScores, number]>)
    .filter(([, score]) => score < threshold)
    .map(([axis]) => axis)
}

function getHighAxes(axisScores: AtpeAxisScores, threshold = 70): Array<keyof AtpeAxisScores> {
  return (Object.entries(axisScores) as Array<[keyof AtpeAxisScores, number]>)
    .filter(([, score]) => score >= threshold)
    .map(([axis]) => axis)
}

function buildProfileAlerts(profile: string | null | undefined, alerts: DashboardAlert[]) {
  switch (profile) {
    case 'Inhibition émotionnelle profonde':
      pushAlert(alerts, {
        id: 'profile-inhibition',
        level: 'warning',
        category: 'profile',
        title: 'Inhibition émotionnelle profonde',
        message:
          'Le profil actuel évoque un retrait émotionnel important, avec risque de faible engagement, d’appauvrissement expressif et de symbolisation ralentie.',
        recommendation:
          'Privilégier un cadre doux, des médiations peu saturées, un rythme lent et des relances centrées sur la nuance plutôt que sur la performance.',
      })
      break

    case 'Dissociation corporelle-relationnelle':
      pushAlert(alerts, {
        id: 'profile-dissociation',
        level: 'warning',
        category: 'profile',
        title: 'Dissociation corporelle-relationnelle',
        message:
          'Le profil actuel suggère une fragilité de l’ancrage corporel et du lien, avec risque de retrait, de déconnexion et de rupture de continuité en séance.',
        recommendation:
          'Renforcer les appuis corporels, stabiliser le cadre, favoriser des médiations d’ancrage et une co-présence non intrusive.',
      })
      break

    case 'Débordement émotionnel non intégré':
      pushAlert(alerts, {
        id: 'profile-debordement',
        level: 'critical',
        category: 'profile',
        title: 'Débordement émotionnel non intégré',
        message:
          'Le profil actuel évoque une intensité émotionnelle mal contenue, avec risque de surcharge, de désorganisation et de difficulté de clôture.',
        recommendation:
          'Structurer fortement la séance, fractionner les temps, contenir l’intensité et prévoir une clôture sécurisée.',
      })
      break

    default:
      break
  }
}

function buildCompositeAlerts(
  composite: AtpeCompositeScoreResult,
  alerts: DashboardAlert[]
) {
  if (composite.global < 40) {
    pushAlert(alerts, {
      id: 'composite-critical',
      level: 'critical',
      category: 'composite',
      title: 'Fragilité clinique marquée',
      message:
        'Le score composite global est bas, ce qui indique une vulnérabilité clinique importante sur plusieurs dimensions du fonctionnement.',
      recommendation:
        'Renforcer le cadre, simplifier les objectifs de séance et privilégier les appuis les plus sécurisants avant toute complexification.',
    })
  } else if (composite.global < 60) {
    pushAlert(alerts, {
      id: 'composite-warning',
      level: 'warning',
      category: 'composite',
      title: 'Équilibre clinique intermédiaire',
      message:
        'Le score composite indique un fonctionnement partiellement mobilisable mais encore fragile ou irrégulier selon les axes.',
      recommendation:
        'Soutenir les axes déjà porteurs tout en évitant de sursolliciter les dimensions les plus fragiles.',
    })
  } else if (composite.global >= 80) {
    pushAlert(alerts, {
      id: 'composite-strong',
      level: 'success',
      category: 'composite',
      title: 'Très bonne dynamique clinique',
      message:
        'Le score composite traduit une dynamique globale favorable avec plusieurs ressources déjà consolidées.',
      recommendation:
        'Poursuivre en consolidant la continuité, la symbolisation et la transférabilité des acquis.',
    })
  }

  if (composite.vulnerabilities.length >= 3) {
    pushAlert(alerts, {
      id: 'composite-multi-vulnerabilities',
      level: 'critical',
      category: 'composite',
      title: 'Fragilités multiples',
      message:
        'Plusieurs zones de vulnérabilité sont simultanément présentes, ce qui augmente le risque de désorganisation ou d’instabilité clinique.',
      recommendation:
        'Réduire le niveau de complexité thérapeutique et hiérarchiser les priorités cliniques.',
    })
  }

  if (composite.strengths.length >= 3) {
    pushAlert(alerts, {
      id: 'composite-strengths',
      level: 'success',
      category: 'composite',
      title: 'Plusieurs points d’appui mobilisables',
      message:
        'Le tableau clinique présente plusieurs ressources significatives sur lesquelles l’accompagnement peut s’appuyer.',
      recommendation:
        'Utiliser les axes forts comme leviers de soutien pour travailler les dimensions plus fragiles.',
    })
  }
}

function buildPredictionAlerts(
  prediction: AtpePredictionResult | null | undefined,
  alerts: DashboardAlert[]
) {
  if (!prediction) return

  if (prediction.trend === 'declining') {
    pushAlert(alerts, {
      id: 'prediction-declining',
      level: 'critical',
      category: 'prediction',
      title: 'Dégradation longitudinale',
      message:
        'La trajectoire longitudinale montre une baisse significative, avec risque de rupture de continuité ou de désengagement progressif.',
      recommendation:
        'Réévaluer rapidement le cadre, les médiations choisies et les conditions de sécurité clinique.',
    })
  }

  if (prediction.trend === 'fragile') {
    pushAlert(alerts, {
      id: 'prediction-fragile',
      level: 'warning',
      category: 'prediction',
      title: 'Équilibre longitudinal fragile',
      message:
        'La trajectoire apparaît instable ou partiellement compensée, avec risque de décrochage malgré une stabilité apparente.',
      recommendation:
        'Surveiller les variations inter-séances et éviter toute augmentation trop rapide de la charge thérapeutique.',
    })
  }

  if (prediction.riskLevel === 'high') {
    pushAlert(alerts, {
      id: 'prediction-high-risk',
      level: 'critical',
      category: 'trajectory',
      title: 'Risque longitudinal élevé',
      message:
        'Les marqueurs prédictifs signalent une trajectoire à haut risque, notamment en termes de baisse globale ou d’irrégularité clinique.',
      recommendation:
        'Mettre en place une surveillance rapprochée et des ajustements thérapeutiques plus sécurisants.',
    })
  }

  if (prediction.markers.volatility >= 12) {
    pushAlert(alerts, {
      id: 'prediction-volatility',
      level: 'warning',
      category: 'trajectory',
      title: 'Forte volatilité inter-séances',
      message:
        'Les variations d’une séance à l’autre sont importantes, ce qui évoque une instabilité clinique ou une faible consolidation des acquis.',
      recommendation:
        'Renforcer les rituels, les repères constants et la stabilité des médiations principales.',
    })
  }

  if (prediction.markers.recentDelta <= -6) {
    pushAlert(alerts, {
      id: 'prediction-recent-drop',
      level: 'warning',
      category: 'trajectory',
      title: 'Décrochage récent',
      message:
        'La dernière évolution est défavorable, même si la trajectoire globale n’est pas encore effondrée.',
      recommendation:
        'Relire attentivement les dernières séances pour identifier un facteur de rupture, de surcharge ou de désajustement.',
    })
  }

  if (prediction.trend === 'improving' && prediction.riskLevel === 'low') {
    pushAlert(alerts, {
      id: 'prediction-improving',
      level: 'success',
      category: 'prediction',
      title: 'Amélioration en cours',
      message:
        'La trajectoire montre une progression globale cohérente et relativement consolidée.',
      recommendation:
        'Poursuivre les appuis qui fonctionnent et travailler la stabilisation des acquis dans la durée.',
    })
  }
}

function buildAxisAlerts(axisScores: AtpeAxisScores, alerts: DashboardAlert[]) {
  const lowAxes = getLowAxes(axisScores)
  const highAxes = getHighAxes(axisScores)

  for (const axis of lowAxes) {
    const label = axisLabel(axis)

    pushAlert(alerts, {
      id: `axis-low-${axis}`,
      level: 'warning',
      category: 'axis',
      title: `Fragilité sur l’axe ${label}`,
      message:
        `Le score de l’axe ${label} est bas, ce qui signale une vulnérabilité spécifique dans ce registre clinique.`,
      recommendation:
        `Adapter la séance pour renforcer progressivement l’axe ${label} sans mettre le patient en surcharge.`,
    })
  }

  for (const axis of highAxes) {
    const label = axisLabel(axis)

    pushAlert(alerts, {
      id: `axis-high-${axis}`,
      level: 'info',
      category: 'axis',
      title: `Appui sur l’axe ${label}`,
      message:
        `L’axe ${label} constitue actuellement une ressource mobilisable dans le travail thérapeutique.`,
      recommendation:
        `S’appuyer sur ${label} comme levier pour soutenir les dimensions plus fragiles.`,
    })
  }

  if (lowAxes.length >= 2) {
    pushAlert(alerts, {
      id: 'axis-multiple-low',
      level: 'critical',
      category: 'axis',
      title: 'Plusieurs axes faibles simultanés',
      message:
        'Au moins deux axes cliniques présentent des scores bas, augmentant le risque de fragilité transversale.',
      recommendation:
        'Prioriser les objectifs, réduire la complexité de séance et renforcer les repères constants.',
    })
  }

  if (
    axisScores.relationalProcess < 40 &&
    axisScores.internalProcess < 40
  ) {
    pushAlert(alerts, {
      id: 'axis-engagement-risk',
      level: 'critical',
      category: 'engagement',
      title: 'Risque de désengagement thérapeutique',
      message:
        'La combinaison d’une fragilité du processus interne et du processus relationnel expose à un risque de retrait ou de faible mobilisation.',
      recommendation:
        'Renforcer l’alliance, l’ancrage et la lisibilité du cadre avant d’augmenter les exigences thérapeutiques.',
    })
  }

  if (
    axisScores.sensorialSymbolic < 40 &&
    axisScores.expressiveProcess < 40
  ) {
    pushAlert(alerts, {
      id: 'axis-symbolization-risk',
      level: 'warning',
      category: 'symbolization',
      title: 'Fragilité expressive et symbolique',
      message:
        'L’accès à l’expression et à la symbolisation paraît limité, avec risque de vécu peu transformable ou peu partageable.',
      recommendation:
        'Privilégier des médiations sensorielles simples, progressives et peu interprétatives.',
    })
  }

  if (
    axisScores.expressiveProcess >= 70 &&
    axisScores.sensorialSymbolic < 40
  ) {
    pushAlert(alerts, {
      id: 'axis-expression-without-integration',
      level: 'warning',
      category: 'regulation',
      title: 'Expression plus forte que l’intégration',
      message:
        'L’expression semble mobilisable, mais l’ancrage sensoriel-symbolique reste fragile, ce qui peut exposer à une expression peu intégrée.',
      recommendation:
        'Ajouter davantage de contenance, de reprise et de stabilisation après les temps expressifs.',
    })
  }

  if (
    axisScores.relationalProcess >= 70 &&
    axisScores.institutionalIndicators < 40
  ) {
    pushAlert(alerts, {
      id: 'axis-transfer-gap',
      level: 'info',
      category: 'trajectory',
      title: 'Écart entre alliance et transfert fonctionnel',
      message:
        'Le lien thérapeutique semble porteur, mais cela ne se traduit pas encore clairement dans les indicateurs institutionnels ou fonctionnels.',
      recommendation:
        'Travailler la transférabilité des acquis hors séance et la continuité dans le quotidien.',
    })
  }
}

function buildSessionsCountAlerts(
  sessionsCount: number | undefined,
  alerts: DashboardAlert[]
) {
  if (typeof sessionsCount !== 'number') return

  if (sessionsCount <= 2) {
    pushAlert(alerts, {
      id: 'sessions-low-count',
      level: 'info',
      category: 'trajectory',
      title: 'Lecture encore précoce',
      message:
        'Le nombre de séances disponibles reste limité, ce qui invite à interpréter la trajectoire avec prudence.',
      recommendation:
        'Consolider encore le suivi avant de tirer des conclusions trop définitives sur la trajectoire.',
    })
  }

  if (sessionsCount >= 8) {
    pushAlert(alerts, {
      id: 'sessions-good-depth',
      level: 'info',
      category: 'trajectory',
      title: 'Trajectoire suffisamment documentée',
      message:
        'Le nombre de séances permet une lecture longitudinale plus solide et plus interprétable.',
      recommendation:
        'Utiliser cette profondeur de suivi pour comparer les phases, les ruptures et les leviers efficaces.',
    })
  }
}

export function buildDashboardAlerts({
  profile,
  composite,
  prediction,
  axisScores,
  sessionsCount,
}: BuildDashboardAlertsInput): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  buildProfileAlerts(profile, alerts)
  buildCompositeAlerts(composite, alerts)
  buildPredictionAlerts(prediction, alerts)
  buildAxisAlerts(axisScores, alerts)
  buildSessionsCountAlerts(sessionsCount, alerts)

  const levelOrder: Record<DashboardAlertLevel, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    success: 3,
  }

  return alerts.sort((a, b) => {
    const byLevel = levelOrder[a.level] - levelOrder[b.level]
    if (byLevel !== 0) return byLevel
    return a.title.localeCompare(b.title)
  })
}