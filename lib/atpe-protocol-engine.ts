export type AtpeProtocolId =
  | 'protocol_inhibition_emotionnelle'
  | 'protocol_dissociation'
  | 'protocol_debordement'
  | 'protocol_general_support'

export type AtpeProtocolGoal =
  | 'Renforcer la présence à soi'
  | 'Améliorer la régulation émotionnelle'
  | 'Réactiver la dynamique du désir'
  | 'Favoriser la symbolisation'
  | 'Assouplir les défenses'
  | 'Développer l’expression plastique'
  | 'Développer l’expression narrative'
  | 'Développer l’expression sonore'
  | 'Développer l’expression corporelle'
  | 'Structurer l’expression'
  | 'Construire l’alliance thérapeutique'
  | 'Développer la communication relationnelle'
  | 'Renforcer le positionnement'
  | 'Favoriser la co-construction'
  | 'Stabiliser la relation au cadre'
  | 'Développer la fluidité intermodale'
  | 'Créer une cohérence intermodale'
  | 'Permettre la transformation intermodale'
  | 'Renforcer l’intégration sensorielle'
  | 'Favoriser la continuité trans-séance'
  | 'Renforcer la participation'
  | 'Développer l’autonomie'
  | 'Améliorer la communication sociale'
  | 'Augmenter le bien-être observable'
  | 'Soutenir la mobilisation cognitive'
  | 'Développer la sensorialité incarnée'
  | 'Favoriser la régulation par les sens'
  | 'Soutenir la symbolisation profonde'
  | 'Structurer la temporalité créative'
  | 'Renforcer l’intégration incarnée'

export type AtpeProtocolPhase = {
  opening: string[]
  deployment: string[]
  closure: string[]
}

export type AtpeProtocol = {
  id: AtpeProtocolId
  title: string
  subtitle: string
  clinicalIntent: string
  primaryGoals: AtpeProtocolGoal[]
  secondaryGoals: AtpeProtocolGoal[]
  mediations: string[]
  sensoryAnchors: {
    colors: string[]
    textures: string[]
    gestures: string[]
    sensations: string[]
  }
  structure: AtpeProtocolPhase
  observationTargets: string[]
  vigilance: string[]
  progressionIndicators: string[]
  weakSignals: string[]
  transverseTrajectories: string[]
  recommendedDurationMinutes: number
  recommendedFormat: 'individuel' | 'groupe' | 'mixte'
}

export function getProtocolFromProfile(profile: string | null | undefined): AtpeProtocol {
  switch (profile) {
    case 'Inhibition émotionnelle profonde':
      return {
        id: 'protocol_inhibition_emotionnelle',
        title: 'Protocole de réouverture émotionnelle progressive',
        subtitle: 'Présence, nuance, réengagement sensible',
        clinicalIntent:
          "Réactiver la présence à soi, soutenir une expression sécurisée, réintroduire des nuances dans l'expérience émotionnelle et permettre une symbolisation progressive sans surstimulation.",
        primaryGoals: [
          'Renforcer la présence à soi',
          'Améliorer la régulation émotionnelle',
          'Réactiver la dynamique du désir',
          'Développer l’expression plastique',
        ],
        secondaryGoals: [
          'Favoriser la symbolisation',
          'Développer la sensorialité incarnée',
          'Structurer la temporalité créative',
          'Augmenter le bien-être observable',
        ],
        mediations: [
          'Travail sensoriel doux',
          'Couleurs peu saturées puis nuancées',
          'Encres légères / pastels / matières enveloppantes',
          'Gestes lents et continus',
          'Musique contenante ou silence habité',
        ],
        sensoryAnchors: {
          colors: ['gris colorés', 'bleu doux', 'vert apaisé', 'ocre clair'],
          textures: ['souple', 'fluide', 'légère', 'enveloppante'],
          gestures: ['poser', 'effleurer', 'superposer', 'laisser apparaître'],
          sensations: ['apaisement', 'respiration', 'retour progressif', 'sécurisation'],
        },
        structure: {
          opening: [
            'Accueil ritualisé et stable',
            'Temps bref d’ancrage corporel ou respiratoire',
            'Présentation de 2 à 3 choix maximum',
            'Entrée sans exigence de performance',
          ],
          deployment: [
            'Travail de traces simples et continues',
            'Superpositions légères ou reprises progressives',
            'Accompagnement verbal minimal centré sur la nuance',
            'Relance douce par la couleur, la texture ou le rythme',
          ],
          closure: [
            'Observation calme de la production',
            'Repérage d’une nuance, d’une zone ou d’un changement',
            'Mise en mots simple si possible',
            'Rituel de fin stable et non brusque',
          ],
        },
        observationTargets: [
          'Latence avant engagement',
          'Qualité de la présence corporelle',
          'Continuité du geste',
          'Capacité de choix',
          'Apparition de nuances émotionnelles',
          'Tolérance à rester dans l’activité',
        ],
        vigilance: [
          'Ne pas surstimuler',
          'Ne pas exiger une verbalisation rapide',
          'Éviter les consignes trop ouvertes au départ',
          'Éviter les contrastes sensoriels trop brusques',
        ],
        progressionIndicators: [
          'Temps d’engagement plus long',
          'Moins de retrait',
          'Choix plus affirmés',
          'Nuances colorées ou gestuelles plus présentes',
          'Capacité à revenir sur une production',
        ],
        weakSignals: [
          'Micro-relâchement des épaules',
          'Regard qui se pose davantage',
          'Souffle moins coupé',
          'Main qui revient spontanément au support',
        ],
        transverseTrajectories: [
          'De la fermeture à l’ouverture',
          'De la passivité à l’initiative',
          'De l’indicible à la symbolisation',
        ],
        recommendedDurationMinutes: 45,
        recommendedFormat: 'individuel',
      }

    case 'Dissociation corporelle-relationnelle':
      return {
        id: 'protocol_dissociation',
        title: 'Protocole d’ancrage corporel et de reliance',
        subtitle: 'Corps, présence, lien, continuité',
        clinicalIntent:
          'Réunifier le corps, la présence et le lien, réduire le retrait et soutenir une expérience progressive d’ancrage, de contact au support et de co-présence thérapeutique non intrusive.',
        primaryGoals: [
          'Renforcer la présence à soi',
          'Développer l’expression corporelle',
          'Construire l’alliance thérapeutique',
          'Renforcer l’intégration incarnée',
        ],
        secondaryGoals: [
          'Développer la communication relationnelle',
          'Renforcer le positionnement',
          'Stabiliser la relation au cadre',
          'Renforcer l’intégration sensorielle',
        ],
        mediations: [
          'Exercices d’ancrage',
          'Grand format ou support engageant corporellement',
          'Travail en miroir souple',
          'Gestes bilatéraux simples',
          'Repérage souffle-geste-regard',
        ],
        sensoryAnchors: {
          colors: ['terre', 'ocre', 'bleu-gris', 'vert calme'],
          textures: ['stable', 'granuleuse douce', 'dense', 'tenante'],
          gestures: ['appuyer', 'relier', 'étirer', 'stabiliser'],
          sensations: ['ancrage', 'tenue', 'présence', 'reliance'],
        },
        structure: {
          opening: [
            'Installation dans un espace stable et lisible',
            'Repérage du corps et des appuis',
            'Entrée par le contact au support',
            'Possibilité de commencer sans parole',
          ],
          deployment: [
            'Gestes d’appui, d’ouverture et de liaison',
            'Travail du rythme corporel et de la continuité',
            'Alternance entre expérience individuelle et repère relationnel',
            'Relances centrées sur le corps, le souffle et la sensation',
          ],
          closure: [
            'Retour au souffle',
            'Repérage d’une sensation corporelle dominante',
            'Observation de la posture de fin',
            'Clôture lente et contenante',
          ],
        },
        observationTargets: [
          'Qualité de l’installation',
          'Rapport au support',
          'Posture et tonicité',
          'Qualité du regard',
          'Capacité à rester en lien sans rupture',
          'Tolérance à la co-présence',
        ],
        vigilance: [
          'Éviter l’intrusion relationnelle',
          'Ne pas imposer le miroir ou le parallèle trop tôt',
          'Ne pas brusquer le rapport au corps',
          'Tolérer les phases de retrait ou de gel',
        ],
        progressionIndicators: [
          'Posture plus engagée',
          'Regard plus stable',
          'Moins d’évitement du support',
          'Lien thérapeutique plus continu',
          'Présence corporelle plus lisible',
        ],
        weakSignals: [
          'Main posée plus franchement',
          'Micro-ajustement du buste vers le support',
          'Souffle un peu plus ample',
          'Moins de rupture dans le geste',
        ],
        transverseTrajectories: [
          'Du retrait corporel à l’ancrage',
          'De la méfiance à l’alliance',
          'Du morcellement à l’unité',
        ],
        recommendedDurationMinutes: 50,
        recommendedFormat: 'individuel',
      }

    case 'Débordement émotionnel non intégré':
      return {
        id: 'protocol_debordement',
        title: 'Protocole de contenance et de modulation émotionnelle',
        subtitle: 'Cadre, transformation, régulation',
        clinicalIntent:
          "Transformer l'intensité émotionnelle en forme supportable, contenue et modulable, en soutenant la régulation, la structuration et la reprise après décharge.",
        primaryGoals: [
          'Améliorer la régulation émotionnelle',
          'Assouplir les défenses',
          'Structurer l’expression',
          'Favoriser la régulation par les sens',
        ],
        secondaryGoals: [
          'Permettre la transformation intermodale',
          'Renforcer l’intégration sensorielle',
          'Stabiliser la relation au cadre',
          'Augmenter le bien-être observable',
        ],
        mediations: [
          'Cadres spatiaux',
          'Séquences courtes et visibles',
          'Alternance décharge / reprise',
          'Contenants symboliques',
          'Rythmes et structuration',
        ],
        sensoryAnchors: {
          colors: ['rouge modulé', 'bleu profond', 'vert de réparation', 'gris de reprise'],
          textures: ['résistante', 'contenante', 'transformable', 'épaisse'],
          gestures: ['décharger', 'recouvrir', 'rassembler', 'moduler'],
          sensations: ['intensité contenue', 'reprise', 'apaisement progressif', 'stabilisation'],
        },
        structure: {
          opening: [
            'Cadre explicite et verbalisation des étapes',
            'Réduction du nombre de stimuli',
            'Ancrage respiratoire bref',
            'Définition claire des limites spatiales et temporelles',
          ],
          deployment: [
            'Temps d’expression intense mais contenu',
            'Temps de transformation, recouvrement ou organisation',
            'Soutien aux variations plutôt qu’au tout-ou-rien',
            'Possibilité de changement de médium si saturation',
          ],
          closure: [
            'Lecture simple des variations d’intensité',
            'Retour à un niveau d’activation plus bas',
            'Stabilisation sensorielle et relationnelle',
            'Clôture contenante, non précipitée',
          ],
        },
        observationTargets: [
          'Intensité du geste',
          'Tolérance à la consigne',
          'Passage ou non du chaos à une forme',
          'Capacité à moduler',
          'Possibilité de revenir au calme',
          'Tolérance à la fin de séance',
        ],
        vigilance: [
          'Éviter la liberté totale au départ',
          'Éviter l’accumulation de stimulations',
          'Ne pas laisser la séance se terminer sur une décharge brute',
          'Sécuriser fortement la clôture',
        ],
        progressionIndicators: [
          'Baisse des gestes explosifs',
          'Passage du chaos à une forme',
          'Verbalisation ou repérage de nuances',
          'Capacité à reprendre une trace',
          'Retour au calme plus accessible',
        ],
        weakSignals: [
          'Pression du geste qui diminue',
          'Respiration qui ralentit',
          'Moins de saturation du support',
          'Apparition d’un mouvement de reprise',
        ],
        transverseTrajectories: [
          'Du chaos à la forme',
          'Du débordement à la modulation',
          'De la rigidité à la plasticité',
        ],
        recommendedDurationMinutes: 50,
        recommendedFormat: 'individuel',
      }

    default:
      return {
        id: 'protocol_general_support',
        title: 'Protocole ATPE de soutien intégratif',
        subtitle: 'Cadre, présence, expression, lien',
        clinicalIntent:
          'Soutenir la présence, l’expression, la relation et la symbolisation dans un cadre sécurisant et modulable, avec adaptation progressive au profil clinique observé.',
        primaryGoals: [
          'Renforcer la participation',
          'Structurer l’expression',
          'Stabiliser la relation au cadre',
          'Renforcer la sensorialité incarnée',
        ],
        secondaryGoals: [
          'Construire l’alliance thérapeutique',
          'Réactiver la dynamique du désir',
          'Favoriser la symbolisation',
          'Améliorer le bien-être observable',
        ],
        mediations: [
          'Couleur',
          'Matière',
          'Geste',
          'Récit',
          'Cadre temporel en trois temps',
        ],
        sensoryAnchors: {
          colors: ['bleu-gris', 'ocre', 'vert tendre', 'jaune doux'],
          textures: ['stable', 'vivante', 'souple', 'organique'],
          gestures: ['poser', 'explorer', 'relier', 'transformer'],
          sensations: ['sécurité', 'présence', 'continuité', 'ouverture'],
        },
        structure: {
          opening: [
            'Accueil et repères de début',
            'Temps d’ancrage',
            'Choix du médium selon disponibilité clinique',
          ],
          deployment: [
            'Exploration guidée du geste, de la matière ou de la couleur',
            'Soutien à la transformation',
            'Accompagnement ajusté à la dynamique observée',
          ],
          closure: [
            'Observation de la production',
            'Repérage d’un élément significatif',
            'Clôture ritualisée',
          ],
        },
        observationTargets: [
          'Présence',
          'Engagement',
          'Qualité du geste',
          'Capacité de choix',
          'Lien thérapeutique',
          'Tolérance au cycle de séance',
        ],
        vigilance: [
          'Toujours adapter au niveau de fatigabilité',
          'Ne pas surcharger les propositions',
          'Maintenir une structure suffisamment lisible',
        ],
        progressionIndicators: [
          'Participation plus stable',
          'Continuité dans l’activité',
          'Choix plus personnels',
          'Production plus structurée',
          'Meilleur apaisement de fin de séance',
        ],
        weakSignals: [
          'Regard plus présent',
          'Installation plus rapide',
          'Souffle plus régulier',
          'Retour spontané au support',
        ],
        transverseTrajectories: [
          'De la fermeture à l’ouverture',
          'De la dispersion à la cohérence',
          'De l’indicible à la symbolisation',
        ],
        recommendedDurationMinutes: 45,
        recommendedFormat: 'mixte',
      }
  }
}

export function getProtocolBadgeColor(protocolId: AtpeProtocolId): string {
  switch (protocolId) {
    case 'protocol_inhibition_emotionnelle':
      return 'bg-sky-100 text-sky-800'
    case 'protocol_dissociation':
      return 'bg-amber-100 text-amber-800'
    case 'protocol_debordement':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}