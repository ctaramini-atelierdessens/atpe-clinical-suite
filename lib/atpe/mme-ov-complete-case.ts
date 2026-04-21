export type MmeOvBeSummary = {
  indication: string
  resources: string[]
  vulnerabilities: string[]
  objective: string
  recommendedFrame: string[]
}

export type MmeOvSessionSummary = {
  sessionNumber: number
  title: string
  phase: 'installation' | 'mobilisation' | 'pivot' | 'consolidation'
  dominantClinicalTheme: string
  clinicalStatus: string
  therapeuticFocus: string
  keyEffects: string[]
  clinicalReading: string
}

export type MmeOvIntermediateReview = {
  title: string
  summary: string
  mainEvolutions: string[]
  teamImplications: string[]
}

export type MmeOvFinalReview = {
  title: string
  summary: string
  majorTransformations: string[]
  teamRecommendations: string[]
  clinicalSignature: string
}

export type MmeOvCompleteCase = {
  patientDisplayName: string
  caseReference: string
  context: string
  dominantMediations: string[]
  expressionAssessment: MmeOvBeSummary
  sessions: MmeOvSessionSummary[]
  intermediateReview: MmeOvIntermediateReview
  finalReview: MmeOvFinalReview
}

export const mmeOvCompleteCase: MmeOvCompleteCase = {
  patientDisplayName: 'Mme Odette Vayssié',
  caseReference: 'ATPE-ODV-001',
  context:
    "Suivi individuel en art-thérapie pluriexpressionnelle en EHPAD, à médiation musicale dominante, dans un cadre stable, lent, sécurisant et peu intrusif.",
  dominantMediations: ['musique', 'geste', 'couleur'],

  expressionAssessment: {
    indication:
      "Le bilan expressionnel conclut à la pertinence d’un accompagnement individuel en art-thérapie pluriexpressionnelle, à dominante musicale, dans un cadre stable, lent et peu stimulant.",
    resources: [
      'sensibilité auditive marquée',
      'mémoire implicite musicale mobilisable',
      'régulation par le souffle',
      'micro-gestuelle fine disponible',
      'attention soutenue dans un cadre calme',
    ],
    vulnerabilities: [
      'fatigabilité importante',
      'lenteur d’engagement',
      'sensibilité émotionnelle',
      'risque de surcharge sensorielle',
      'retrait relationnel relatif',
    ],
    objective:
      "Soutenir l’émergence d’une expression non verbale et d’une présence plus incarnée à travers un dispositif articulant musique, geste et couleur.",
    recommendedFrame: [
      'cadre individuel',
      'séances courtes et modulables',
      'environnement calme et prévisible',
      'faible surcharge sensorielle',
      'présence contenante, non intrusive',
    ],
  },

  sessions: [
    {
      sessionNumber: 1,
      title:
        'Ouverture du processus thérapeutique : compatibilité sujet-cadre',
      phase: 'installation',
      dominantClinicalTheme: 'compatibilité initiale avec le cadre',
      clinicalStatus:
        "Entrée immédiate dans le dispositif, sans défense massive ni coût psychique visible.",
      therapeuticFocus:
        "Vérifier qu’une entrée en travail est possible sans surcharge ni contrainte.",
      keyEffects: [
        'engagement spontané',
        'continuité simple',
        'première confiance implicite',
      ],
      clinicalReading:
        "La séance installe les conditions de possibilité du processus thérapeutique.",
    },
    {
      sessionNumber: 2,
      title:
        "Émergence de l’alliance thérapeutique et début de subjectivation",
      phase: 'installation',
      dominantClinicalTheme: 'passage du faire à l’expérience vécue',
      clinicalStatus:
        "L’expérience commence à être perçue et pensée comme telle.",
      therapeuticFocus:
        "Soutenir la continuité tout en laissant émerger une perception interne du vécu.",
      keyEffects: [
        'début de verbalisation subjective',
        'alliance implicite plus nette',
        'régulation maintenue',
      ],
      clinicalReading:
        "Le sujet commence à reconnaître son vécu sans rupture de continuité.",
    },
    {
      sessionNumber: 3,
      title: "Apparition d’un signe de soi",
      phase: 'installation',
      dominantClinicalTheme: 'inscription identitaire minimale',
      clinicalStatus:
        "Émergence d’un signe subjectif contenu et compatible avec la régulation.",
      therapeuticFocus:
        "Permettre une manifestation de soi sans surcharge émotionnelle.",
      keyEffects: [
        'expression de soi minimale',
        'stabilité du cadre préservée',
        'continuité sans débordement',
      ],
      clinicalReading:
        "Le sujet peut apparaître dans l’expérience sans se désorganiser.",
    },
    {
      sessionNumber: 4,
      title: 'La limite devient organisatrice',
      phase: 'installation',
      dominantClinicalTheme: 'apparition de la fatigabilité',
      clinicalStatus:
        "Le processus doit désormais intégrer une limite interne réelle.",
      therapeuticFocus:
        "Faire de la limite un organisateur plutôt qu’un obstacle.",
      keyEffects: [
        'ralentissement de l’engagement',
        'pauses nécessaires',
        'maintien du lien malgré la discontinuité',
      ],
      clinicalReading:
        "La fatigue n’interrompt pas le travail, elle en devient un repère clinique structurant.",
    },
    {
      sessionNumber: 5,
      title: 'Intégration de la fatigabilité',
      phase: 'mobilisation',
      dominantClinicalTheme: 'rythmicité interne émergente',
      clinicalStatus:
        "L’alternance engagement-pause-reprise devient organisatrice.",
      therapeuticFocus:
        "Permettre un engagement rythmé compatible avec les capacités réelles.",
      keyEffects: [
        'meilleure tolérance de la fatigue',
        'reprises plus cohérentes',
        'autorégulation temporelle naissante',
      ],
      clinicalReading:
        "La séance transforme la limite en organisateur temporel du processus.",
    },
    {
      sessionNumber: 6,
      title: 'Reconstruction du fonctionnement',
      phase: 'mobilisation',
      dominantClinicalTheme: 'continuité retrouvée',
      clinicalStatus:
        "Le fonctionnement se reconstruit à partir de la limite intégrée.",
      therapeuticFocus:
        "Soutenir une continuité reconstruite, fiable et peu coûteuse.",
      keyEffects: [
        'engagement plus continu',
        'diminution des pauses',
        'meilleure coordination générale',
      ],
      clinicalReading:
        "Il ne s’agit pas d’un retour en arrière, mais d’une nouvelle continuité plus ajustée.",
    },
    {
      sessionNumber: 7,
      title: 'Continuité minimale stable',
      phase: 'mobilisation',
      dominantClinicalTheme: 'économie d’engagement',
      clinicalStatus:
        "Le peu devient cliniquement suffisant et stable.",
      therapeuticFocus:
        "Valider un engagement minimal mais durable sans intensification artificielle.",
      keyEffects: [
        'stabilité à bas niveau d’intensité',
        'absence de fatigue marquée',
        'autonomie en consolidation',
      ],
      clinicalReading:
        "La présence peut désormais tenir sans appui sur l’intensité ni la nouveauté.",
    },
    {
      sessionNumber: 8,
      title: 'Consolidation du fonctionnement',
      phase: 'mobilisation',
      dominantClinicalTheme: 'fiabilisation silencieuse',
      clinicalStatus:
        "Ce qui était possible devient fiable, reproductible et intégré.",
      therapeuticFocus:
        "Stabiliser les acquis avant toute transformation qualitative.",
      keyEffects: [
        'fonctionnement stable',
        'régulation plus intégrée',
        'absence d’événement spectaculaire mais solidité accrue',
      ],
      clinicalReading:
        "Étape silencieuse mais stratégique avant le pivot du suivi.",
    },
    {
      sessionNumber: 9,
      title: 'Émergence du violon intérieur',
      phase: 'pivot',
      dominantClinicalTheme: 'internalisation du support thérapeutique',
      clinicalStatus:
        "Le support cesse d’être seulement externe et commence à être porté de l’intérieur.",
      therapeuticFocus:
        "Protéger l’émergence d’une autorégulation interne sans la réexternaliser.",
      keyEffects: [
        'geste du violon intérieur',
        'autorégulation plus autonome',
        'transformation qualitative du rapport à l’expérience',
      ],
      clinicalReading:
        "Moment charnière du suivi, articulant musique, corps et relation dans une continuité interne nouvelle.",
    },
    {
      sessionNumber: 10,
      title: "Stabilisation de l’autorégulation",
      phase: 'consolidation',
      dominantClinicalTheme: 'autonomie stable',
      clinicalStatus:
        "L’autonomie émergente se maintient sans désancrage ni dépendance accrue au cadre.",
      therapeuticFocus:
        "Maintenir une autonomie fiable, calme et non démonstrative.",
      keyEffects: [
        'continuité autonome',
        'régulation constante',
        'cadre devenu support discret',
      ],
      clinicalReading:
        "Le pivot de la séance 9 se confirme et se stabilise.",
    },
    {
      sessionNumber: 11,
      title: 'Enrichissement du processus',
      phase: 'consolidation',
      dominantClinicalTheme: 'complexification maîtrisée',
      clinicalStatus:
        "Le processus devient capable de nuance sans perte de stabilité.",
      therapeuticFocus:
        "Permettre un enrichissement de l’expérience sans surcharge.",
      keyEffects: [
        'variations plus fines',
        'geste plus nuancé',
        'stabilité conservée',
      ],
      clinicalReading:
        "La régulation devient matrice de développement et non simple défense.",
    },
    {
      sessionNumber: 12,
      title: 'Approfondissement et densification',
      phase: 'consolidation',
      dominantClinicalTheme: 'présence plus dense',
      clinicalStatus:
        "L’expérience se creuse davantage qu’elle ne s’élargit.",
      therapeuticFocus:
        "Soutenir une intensité fine, contenue et incarnée.",
      keyEffects: [
        'présence densifiée',
        'geste plus précis',
        'régulation subtile mais mature',
      ],
      clinicalReading:
        "Le processus gagne en profondeur sans coût psychique supplémentaire.",
    },
    {
      sessionNumber: 13,
      title: 'Intégration incorporée',
      phase: 'consolidation',
      dominantClinicalTheme: 'fonctionnement auto-porté',
      clinicalStatus:
        "Le fonctionnement devient disponible sans effort visible.",
      therapeuticFocus:
        "Observer ce qui tient lorsque plus rien n’a besoin d’être produit.",
      keyEffects: [
        'stabilité implicite',
        'économie psychique optimale',
        'autonomie silencieuse',
      ],
      clinicalReading:
        "Le fonctionnement n’a plus besoin d’être soutenu activement pour exister.",
    },
    {
      sessionNumber: 14,
      title: 'Appropriation consciente',
      phase: 'consolidation',
      dominantClinicalTheme: 'mise en lien consciente des acquis',
      clinicalStatus:
        "Ce qui était incorporé devient reconnaissable, nommable et volontairement mobilisable.",
      therapeuticFocus:
        "Permettre une réflexivité légère sans couper l’expérience incarnée.",
      keyEffects: [
        'capacité à nommer certains éléments',
        'autorégulation consciente',
        'processus transmissible et mobilisable',
      ],
      clinicalReading:
        "Mme O. V. peut commencer à s’appuyer volontairement sur son propre ajustement.",
    },
    {
      sessionNumber: 15,
      title: 'Clôture et autonomie hors cadre',
      phase: 'consolidation',
      dominantClinicalTheme: 'transférabilité des acquis',
      clinicalStatus:
        "La fin est vécue sans rupture, avec stabilité émotionnelle et appropriation des ressources.",
      therapeuticFocus:
        "Transformer la séparation en continuité plutôt qu’en perte.",
      keyEffects: [
        'présence stable jusqu’au bout',
        'absence d’effondrement ou d’agrippement',
        'autonomie transférable hors dispositif',
      ],
      clinicalReading:
        "Le travail ne s’arrête pas au cadre ; il devient continuité possible hors séance.",
    },
  ],

  intermediateReview: {
    title: 'Bilan intermédiaire',
    summary:
      "Les premières séances mettent en évidence une dynamique d’évolution progressive : meilleure continuité de présence, ouverture corporelle et émergence d’une expressivité non verbale dans un cadre contenant.",
    mainEvolutions: [
      'meilleure continuité de présence',
      'ouverture corporelle progressive',
      'stabilisation de l’attention musicale',
      'relation thérapeutique plus fluide et sécurisée',
    ],
    teamImplications: [
      'favoriser un environnement calme et structuré',
      'privilégier les médiations musicales douces',
      'respecter le rythme lent et les temps de latence',
      'soutenir la présence sans sur-sollicitation',
    ],
  },

  finalReview: {
    title: 'Bilan final',
    summary:
      "Le suivi met en évidence une transformation clinique progressive et profonde : passage d’un fonctionnement initialement soutenu par le cadre à un fonctionnement progressivement auto-porté, puis mobilisable de manière volontaire et transférable hors du dispositif.",
    majorTransformations: [
      'compatibilité stable avec le cadre thérapeutique',
      'émergence d’un vécu subjectif puis d’un signe de soi',
      'intégration de la fatigabilité comme organisateur',
      'reconstruction d’une continuité ajustée et moins coûteuse',
      'émergence puis stabilisation d’une autorégulation interne',
      'appropriation consciente des acquis',
      'transférabilité des ressources hors cadre',
    ],
    teamRecommendations: [
      'maintenir un cadre calme, prévisible et peu stimulant',
      'privilégier les temps relationnels individualisés',
      'utiliser la musique comme appui de régulation',
      'respecter la fatigabilité et éviter la surcharge',
    ],
    clinicalSignature:
      "Au fil des quinze séances, ce qui nécessitait d’abord un cadre externe est devenu progressivement une ressource interne, stable, incorporée puis consciemment mobilisable.",
  },
}

export function getMmeOvSession(sessionNumber: number) {
  return mmeOvCompleteCase.sessions.find(
    (session) => session.sessionNumber === sessionNumber
  ) ?? null
}

export function getMmeOvLatestSession() {
  return mmeOvCompleteCase.sessions[mmeOvCompleteCase.sessions.length - 1] ?? null
}