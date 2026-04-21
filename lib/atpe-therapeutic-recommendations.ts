import { computeAtpeExpertResult, getProfileLabel, getTrendLabel } from '@/lib/atpe-expert'
import { getClinicalAlerts } from '@/lib/atpe-clinical-insights'

type SessionLike = {
  id: string
  session_number: number
  session_date?: string | null
  emotional_score: number
  body_score: number
  awareness_score: number
  dynamic_score: number
  symbolic_score: number
  regulation_score: number
  engagement_score: number
}

export type TherapeuticRecommendation = {
  key: string
  priority: 'high' | 'medium' | 'low'
  title: string
  rationale: string
  action: string
}

export type TherapeuticRecommendationBundle = {
  summary: string
  recommendations: TherapeuticRecommendation[]
}

function addRec(
  list: TherapeuticRecommendation[],
  rec: TherapeuticRecommendation
) {
  if (!list.find((item) => item.key === rec.key)) {
    list.push(rec)
  }
}

export function getTherapeuticRecommendations(
  sessions: SessionLike[]
): TherapeuticRecommendationBundle {
  if (!sessions || sessions.length === 0) {
    return {
      summary: 'Aucune recommandation disponible faute de séances exploitables.',
      recommendations: [],
    }
  }

  const current = sessions[sessions.length - 1]
  const previous = sessions.length > 1 ? sessions[sessions.length - 2] : null

  const result = computeAtpeExpertResult(
    {
      emotion: current.emotional_score,
      corps: current.body_score,
      conscience: current.awareness_score,
      dynamique: current.dynamic_score,
      symbolique: current.symbolic_score,
      regulation: current.regulation_score,
      engagement: current.engagement_score,
    },
    previous
      ? {
          emotion: previous.emotional_score,
          corps: previous.body_score,
          conscience: previous.awareness_score,
          dynamique: previous.dynamic_score,
          symbolique: previous.symbolic_score,
          regulation: previous.regulation_score,
          engagement: previous.engagement_score,
        }
      : null
  )

  const alerts = getClinicalAlerts(sessions)
  const recommendations: TherapeuticRecommendation[] = []

  const regulationLow = (result.poleRegulation ?? 0) < 40
  const ancrageLow = (result.poleAncrage ?? 0) < 45
  const elaborationLow = (result.poleElaboration ?? 0) < 45
  const regulationVeryLow = (result.poleRegulation ?? 0) < 30
  const engagementLow = current.engagement_score <= 4
  const bodyLow = current.body_score <= 4
  const symbolicLow = current.symbolic_score <= 4
  const awarenessLow = current.awareness_score <= 4
  const emotionLow = current.emotional_score <= 4

  if (regulationLow || regulationVeryLow) {
    addRec(recommendations, {
      key: 'secure-frame',
      priority: regulationVeryLow ? 'high' : 'medium',
      title: 'Renforcer le cadre de régulation',
      rationale:
        'Le pôle de régulation apparaît fragile sur la dernière séance.',
      action:
        'Stabiliser le cadre, réduire la complexité, favoriser les repères constants, ritualiser l’entrée et la clôture de séance.',
    })
  }

  if (engagementLow) {
    addRec(recommendations, {
      key: 'support-engagement',
      priority: 'high',
      title: 'Soutenir l’engagement thérapeutique',
      rationale:
        'L’engagement observé reste bas et expose à un risque de décrochage.',
      action:
        'Proposer des objectifs micro-progressifs, des médiations plus accessibles et une alliance thérapeutique fortement étayée.',
    })
  }

  if (bodyLow || ancrageLow) {
    addRec(recommendations, {
      key: 'body-grounding',
      priority: 'medium',
      title: 'Renforcer l’ancrage corporel',
      rationale:
        'Les indicateurs corporels et/ou d’ancrage restent insuffisamment consolidés.',
      action:
        'Privilégier des médiations sensori-motrices, rythmiques, contenant le corps et favorisant la présence à soi.',
    })
  }

  if (symbolicLow || elaborationLow) {
    addRec(recommendations, {
      key: 'symbolic-support',
      priority: 'medium',
      title: 'Soutenir l’élaboration symbolique',
      rationale:
        'La capacité de transformation symbolique semble encore limitée ou instable.',
      action:
        'Introduire des médiations facilitant la représentation progressive, sans forçage interprétatif, avec verbalisation contenante.',
    })
  }

  if (awarenessLow || emotionLow) {
    addRec(recommendations, {
      key: 'emotional-mentalization',
      priority: 'medium',
      title: 'Soutenir la mise en conscience émotionnelle',
      rationale:
        'L’accès à l’expérience émotionnelle et à sa mise en conscience paraît partiel.',
      action:
        'Favoriser la nomination, le repérage des vécus et l’explicitation progressive des éprouvés dans un cadre sécurisé.',
    })
  }

  if (alerts.find((a) => a.key === 'global-drop')) {
    addRec(recommendations, {
      key: 'slow-down-after-drop',
      priority: 'high',
      title: 'Ralentir après rupture clinique',
      rationale:
        'Une baisse globale significative a été détectée entre les deux dernières séances.',
      action:
        'Réduire l’exigence transformatrice, revenir aux appuis de base et réévaluer la charge thérapeutique à court terme.',
    })
  }

  if (alerts.find((a) => a.key === 'regulation-drop')) {
    addRec(recommendations, {
      key: 'repair-regulation',
      priority: 'high',
      title: 'Prioriser la restauration de la régulation',
      rationale:
        'Une baisse récente de régulation constitue un signal clinique prioritaire.',
      action:
        'Travailler d’abord la sécurité interne et externe avant toute mobilisation élaborative plus poussée.',
    })
  }

  if (alerts.find((a) => a.key === 'engagement-drop')) {
    addRec(recommendations, {
      key: 'repair-alliance',
      priority: 'high',
      title: 'Réévaluer l’alliance et l’accessibilité du dispositif',
      rationale:
        'La baisse de l’engagement peut traduire une difficulté d’ajustement du dispositif.',
      action:
        'Explorer les freins, ajuster les médiations, réintroduire du choix et sécuriser la participation du patient.',
    })
  }

  if (alerts.find((a) => a.key === 'stagnation')) {
    addRec(recommendations, {
      key: 'work-stagnation',
      priority: 'low',
      title: 'Travailler la stagnation sans rupture de cadre',
      rationale:
        'L’évolution récente paraît peu marquée.',
      action:
        'Conserver les acquis du cadre tout en introduisant une légère variation de médiation, de rythme ou de focalisation clinique.',
    })
  }

  if (alerts.find((a) => a.key === 'pole-imbalance')) {
    addRec(recommendations, {
      key: 'rebalance-poles',
      priority: 'medium',
      title: 'Rééquilibrer les pôles cliniques',
      rationale:
        'Un écart important entre pôles suggère un développement hétérogène.',
      action:
        'Soutenir prioritairement le pôle le plus bas sans désorganiser les pôles déjà plus efficients.',
    })
  }

  if (result.tendance === 'amelioration' || alerts.find((a) => a.key === 'global-improvement')) {
    addRec(recommendations, {
      key: 'consolidate-gains',
      priority: 'low',
      title: 'Consolider les acquis récents',
      rationale:
        'Une amélioration récente est repérable et mérite d’être stabilisée.',
      action:
        'Maintenir les conditions ayant permis la progression avant d’augmenter le niveau d’exigence thérapeutique.',
    })
  }

  if (recommendations.length === 0) {
    addRec(recommendations, {
      key: 'maintain-course',
      priority: 'low',
      title: 'Poursuivre le cap thérapeutique actuel',
      rationale:
        'Les données ne mettent pas en évidence de point de rupture majeur immédiat.',
      action:
        'Maintenir le cadre actuel, surveiller l’évolution longitudinale et réévaluer régulièrement les priorités.',
    })
  }

  const summary =
    `Profil actuel : ${getProfileLabel(result.profil)}. ` +
    `Tendance : ${getTrendLabel(result.tendance)}. ` +
    `La priorisation thérapeutique doit s’orienter vers ` +
    `${recommendations[0]?.title?.toLowerCase() ?? 'la poursuite du travail en cours'}.`

  const priorityOrder = { high: 0, medium: 1, low: 2 }

  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  return {
    summary,
    recommendations,
  }
}