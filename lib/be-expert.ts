
import type { BEClinicalScores, BEExpertReportData } from '@/components/be-expert-report'

export type ClinicalLevel = 'très faible' | 'faible' | 'modéré' | 'bon' | 'élevé'

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return Math.round(value)
}

export function getClinicalLevelLabel(score: number): ClinicalLevel {
  const safeScore = clampScore(score)

  if (safeScore <= 20) return 'très faible'
  if (safeScore <= 40) return 'faible'
  if (safeScore <= 60) return 'modéré'
  if (safeScore <= 80) return 'bon'
  return 'élevé'
}

export function computeBEGlobalScore(scores: BEClinicalScores): number {
  const values = [
    scores.emotionalExpression,
    scores.bodyEngagement,
    scores.relationalAvailability,
    scores.symbolicCapacity,
    scores.regulationCapacity,
    scores.initiativeCreativity,
  ].map(clampScore)

  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round(total / values.length)
}

export function getProfileType(scores: BEClinicalScores): {
  title: string
  summary: string
} {
  const expr = clampScore(scores.emotionalExpression)
  const body = clampScore(scores.bodyEngagement)
  const rel = clampScore(scores.relationalAvailability)
  const sym = clampScore(scores.symbolicCapacity)
  const reg = clampScore(scores.regulationCapacity)
  const init = clampScore(scores.initiativeCreativity)

  const global = computeBEGlobalScore(scores)

  if (global < 30) {
    return {
      title: 'Profil d’inhibition majeure',
      summary:
        "Le bilan met en évidence un fonctionnement globalement freiné, avec une mobilisation limitée des ressources expressives, relationnelles et symboliques. L’engagement dans le cadre demeure fragile et nécessite un accompagnement très contenant.",
    }
  }

  if (reg < 40 && expr < 50) {
    return {
      title: 'Profil de vulnérabilité régulatoire',
      summary:
        "Le fonctionnement observé montre une difficulté centrale de régulation, avec un risque de débordement, d’épuisement ou de retrait dès que la sollicitation expressive augmente. La priorité thérapeutique concerne la sécurisation, l’ajustement du rythme et la fiabilisation du cadre.",
    }
  }

  if (expr >= 60 && body >= 60 && sym < 45) {
    return {
      title: 'Profil expressif peu symbolisé',
      summary:
        "Le sujet manifeste une capacité d’engagement sensible et corporel relativement accessible, mais la mise en forme symbolique, l’élaboration et l’intégration restent encore incomplètes. Le travail thérapeutique devra soutenir le passage de l’éprouvé à la représentation.",
    }
  }

  if (rel >= 60 && reg >= 60 && init >= 60) {
    return {
      title: 'Profil de mobilisation thérapeutique favorable',
      summary:
        "Le bilan montre une disponibilité suffisante pour engager un travail thérapeutique structuré. Les ressources de régulation, de lien et d’initiative constituent une base favorable pour un accompagnement approfondi et évolutif.",
    }
  }

  return {
    title: 'Profil clinique mixte avec hétérogénéité fonctionnelle',
    summary:
      "Le bilan fait apparaître un fonctionnement contrasté, avec coexistence de zones de ressources et de zones de fragilité. L’enjeu clinique est de s’appuyer sur les capacités déjà accessibles tout en ajustant finement les sollicitations dans les secteurs plus vulnérables.",
  }
}

export function buildSupportFactors(scores: BEClinicalScores): string[] {
  const items: string[] = []

  if (clampScore(scores.relationalAvailability) >= 60) {
    items.push("Disponibilité relationnelle permettant l’installation d’une alliance thérapeutique exploitable.")
  }

  if (clampScore(scores.regulationCapacity) >= 60) {
    items.push("Capacité de régulation suffisante pour soutenir un travail progressif sans désorganisation majeure.")
  }

  if (clampScore(scores.bodyEngagement) >= 60) {
    items.push("Engagement corporel mobilisable, ouvrant un accès concret au travail d’expression et de présence.")
  }

  if (clampScore(scores.emotionalExpression) >= 60) {
    items.push("Accès relativement possible à l’expression émotionnelle, même si celle-ci peut encore nécessiter une médiation.")
  }

  if (clampScore(scores.symbolicCapacity) >= 60) {
    items.push("Potentiel de symbolisation permettant une élaboration plus fine de l’expérience vécue.")
  }

  if (clampScore(scores.initiativeCreativity) >= 60) {
    items.push("Présence d’initiatives et d’élans créatifs favorisant l’appropriation subjective du processus.")
  }

  if (items.length === 0) {
    items.push("Existence d’un minimum de disponibilité clinique permettant d’envisager un travail d’amorce, à condition de maintenir un cadre très contenant.")
  }

  return items
}

export function buildVigilanceFactors(scores: BEClinicalScores): string[] {
  const items: string[] = []

  if (clampScore(scores.regulationCapacity) < 45) {
    items.push("Fragilité de régulation avec risque de débordement, de retrait ou de rupture de continuité en cas de sollicitation excessive.")
  }

  if (clampScore(scores.relationalAvailability) < 45) {
    items.push("Alliance thérapeutique potentiellement lente à construire, nécessitant prudence, stabilité et lisibilité du cadre.")
  }

  if (clampScore(scores.symbolicCapacity) < 45) {
    items.push("Faible capacité d’élaboration symbolique, pouvant limiter la mise en sens verbale ou représentative du vécu.")
  }

  if (clampScore(scores.bodyEngagement) < 45) {
    items.push("Mobilisation corporelle réduite ou prudente, pouvant freiner l’investissement des médiations sensibles.")
  }

  if (clampScore(scores.emotionalExpression) < 45) {
    items.push("Accès émotionnel restreint, avec risque d’inhibition, de banalisation ou d’évitement des éprouvés.")
  }

  if (clampScore(scores.initiativeCreativity) < 45) {
    items.push("Faible spontanéité ou difficulté d’initiative, suggérant un besoin de guidage structurant.")
  }

  if (items.length === 0) {
    items.push("Aucun facteur de vigilance majeur ne domine le tableau, mais une surveillance clinique ordinaire reste nécessaire pour ajuster le rythme thérapeutique.")
  }

  return items
}

export function buildTherapeuticIndication(scores: BEClinicalScores): string {
  const reg = clampScore(scores.regulationCapacity)
  const sym = clampScore(scores.symbolicCapacity)
  const rel = clampScore(scores.relationalAvailability)
  const expr = clampScore(scores.emotionalExpression)
  const body = clampScore(scores.bodyEngagement)

  if (reg < 45) {
    return "Une indication d’accompagnement art-thérapeutique à visée prioritairement contenante et régulatrice paraît pertinente. Le travail devra s’organiser autour d’un cadre stable, prévisible et sécurisant, avec des médiations graduées, peu intrusives, favorisant avant tout l’apaisement, la continuité de présence et la tolérance progressive aux éprouvés."
  }

  if (sym < 45 && expr >= 50) {
    return "Une indication d’art-thérapie centrée sur la transformation de l’éprouvé en formes partageables semble particulièrement adaptée. Les médiations devront soutenir le passage entre ressenti, trace, représentation et mise en sens, sans forcer la verbalisation mais en accompagnant progressivement l’élaboration."
  }

  if (rel >= 60 && body >= 60 && expr >= 55) {
    return "Une prise en charge art-thérapeutique structurée peut être indiquée dans une perspective de consolidation, d’approfondissement et d’intégration. Le sujet semble en mesure de bénéficier d’un travail mobilisant le corps, la créativité, la relation et la symbolisation dans un processus évolutif."
  }

  return "L’indication art-thérapeutique apparaît pertinente sous une forme progressive et ajustée. Le travail devra s’appuyer sur les ressources déjà accessibles tout en maintenant une vigilance sur les zones de fragilité, afin de soutenir une mobilisation durable sans majorer les défenses ni provoquer de rupture du processus."
}

export function buildNarrative(data: BEExpertReportData): string {
  const { patientName, context, observations, scores } = data

  const global = computeBEGlobalScore(scores)
  const profile = getProfileType(scores)

  const expr = getClinicalLevelLabel(scores.emotionalExpression)
  const body = getClinicalLevelLabel(scores.bodyEngagement)
  const rel = getClinicalLevelLabel(scores.relationalAvailability)
  const sym = getClinicalLevelLabel(scores.symbolicCapacity)
  const reg = getClinicalLevelLabel(scores.regulationCapacity)
  const init = getClinicalLevelLabel(scores.initiativeCreativity)

  const globalDescription =
    global >= 60
      ? 'globalement mobilisable, malgré des ajustements encore nécessaires'
      : global >= 45
      ? 'partiellement accessible, avec plusieurs points d’appui mais aussi des fragilités notables'
      : 'fragile, nécessitant un cadre particulièrement contenant et progressif'

  return `
Le bilan expressionnel de ${patientName} met en évidence un niveau global de fonctionnement clinique ${getClinicalLevelLabel(global)}, avec un profil marqué par une organisation ${profile.title.toLowerCase()}.
L’analyse croisée des dimensions émotionnelle, corporelle, relationnelle, symbolique, régulatoire et créative montre une dynamique ${globalDescription}.

Sur le plan émotionnel, l’expression apparaît ${expr}, tandis que l’engagement corporel se situe à un niveau ${body}.
La disponibilité relationnelle est ${rel}, ce qui renseigne directement sur les conditions d’installation de l’alliance thérapeutique.
La capacité de symbolisation est ${sym}, indiquant le degré possible d’élaboration et de mise en sens.
Enfin, les capacités de régulation (${reg}) et d’initiative créative (${init}) orientent fortement les choix thérapeutiques.

${profile.summary}
${context ? `Le contexte clinique rapporté confirme que ${context}.` : ''}
${observations ? `Les observations complémentaires vont dans le même sens : ${observations}.` : ''}
  `.trim()
}

export function buildConclusion(data: BEExpertReportData): string {
  const global = computeBEGlobalScore(data.scores)

  return `En conclusion, le bilan expressionnel de ${data.patientName} soutient la pertinence d’une démarche art-thérapeutique ajustée au profil observé. Le fonctionnement global se situe à un niveau ${getClinicalLevelLabel(global)}, avec des ressources mobilisables mais aussi des points de vigilance qui justifient une conduite clinique nuancée. L’intérêt du suivi sera de consolider les appuis déjà présents, de sécuriser les zones les plus fragiles et de favoriser, dans la durée, une transformation progressive des éprouvés en formes plus intégrées, plus représentables et plus partageables.`
}