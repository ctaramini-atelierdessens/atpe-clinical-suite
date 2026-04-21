export type TherapeuticSummaryPayload = {
  patientDisplayName: string
  totalSessions: number
}

export function buildMmeOvTherapeuticSummary({
  patientDisplayName,
  totalSessions,
}: TherapeuticSummaryPayload) {
  return {
    title: `Synthèse thérapeutique ATPE – ${patientDisplayName}`,
    expressionAssessment:
      "Le bilan expressionnel conclut à une indication favorable d’accompagnement individuel en art-thérapie pluriexpressionnelle, à dominante musicale, dans un cadre stable, lent, sécurisant et peu intrusif. Les appuis principaux repérés sont la sensibilité auditive, la régulation par le souffle, la continuité gestuelle discrète et la possibilité d’une présence relationnelle contenue.",
    intermediateReview:
      "Le suivi montre une progression régulière depuis une compatibilité initiale avec le cadre vers une continuité plus fiable. Après l’intégration de la fatigabilité comme organisateur du processus, les séances intermédiaires mettent en évidence une stabilisation de l’engagement, une meilleure économie psychique et une présence plus continue.",
    finalReview:
      "Le point de bascule clinique se situe en séance 9 avec l’émergence du violon intérieur, compris comme internalisation du support thérapeutique. Les séances 10 à 13 confirment la stabilisation, l’approfondissement puis l’intégration silencieuse du fonctionnement. La séance 14 marque l’appropriation consciente des acquis, et la séance 15 valide leur transférabilité hors du cadre thérapeutique.",
    recommendations: [
      'Maintenir un environnement calme, prévisible et peu stimulant.',
      'Respecter la fatigabilité et les temps de silence ou de repos.',
      'Privilégier des médiations musicales douces, à faible surcharge sensorielle.',
      'Soutenir la continuité de présence sans relance intrusive ni sur-sollicitation.',
    ],
    longitudinalMilestones: [
      { label: 'Bilan expressionnel', value: 'Indication favorable ATPE individuelle' },
      { label: 'Séances 1 à 3', value: 'Installation du cadre et premiers signes de subjectivation' },
      { label: 'Séances 4 à 5', value: 'Fatigabilité intégrée comme organisateur thérapeutique' },
      { label: 'Séances 6 à 8', value: 'Reconstruction et consolidation du fonctionnement' },
      { label: 'Séance 9', value: 'Émergence du violon intérieur' },
      { label: 'Séances 10 à 13', value: 'Stabilisation, enrichissement, intégration' },
      { label: 'Séances 14 à 15', value: 'Appropriation consciente et transférabilité' },
    ],
    metadata: {
      totalSessions,
      dominantCaseTheme: 'Violon intérieur / autorégulation / continuité interne',
    },
  }
}