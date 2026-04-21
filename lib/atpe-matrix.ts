export type MatrixReading = {
  clinical: string
  institutional: string
  puzzle: string
}

export type MatrixTrajectory = {
  key: string
  label: string
  from: string
  to: string
}

export type MatrixObjectiveRow = {
  key: string
  objective: string
  subObjectives: string[]
  indicators: string[]
  sensoryIndicators: string[]
  reading: MatrixReading
  weakSignals: string[]
  trajectories: MatrixTrajectory[]
}

export type MatrixAxis = {
  key: string
  label: string
  shortLabel: string
  description: string
  rows: MatrixObjectiveRow[]
}

export type GlobalTrajectory = {
  key: string
  label: string
  description: string
  axes: string[]
  markers: string[]
}

export type AtpeMatrix = {
  axes: MatrixAxis[]
  globalTrajectories: GlobalTrajectory[]
}

export const ATPE_MATRIX: AtpeMatrix = {
  axes: [
    {
      key: 'processus_interne',
      label: 'Axe 1 — Processus interne',
      shortLabel: 'Interne',
      description:
        'Présence, régulation émotionnelle, dynamique du désir, symbolisation, flexibilité défensive.',
      rows: [
        {
          key: 'presence',
          objective: 'Renforcer la présence à soi',
          subObjectives: [
            'Stabiliser l’ancrage corporel',
            'Maintenir une continuité attentionnelle',
            'Développer la disponibilité psychique',
            'Rester dans l’activité sans fuite',
          ],
          indicators: [
            'presence',
            'engagement',
            'continuite',
            'attention',
            'posture',
          ],
          sensoryIndicators: [
            'qualite_toucher',
            'rythme_respiratoire',
            'rapport_au_cycle',
            'reactivite_couleur',
          ],
          reading: {
            clinical:
              'Capacité à habiter son expérience et à devenir disponible pour la transformation thérapeutique.',
            institutional:
              'Attention soutenue, engagement dans l’activité, capacité à rester dans la tâche.',
            puzzle:
              'Le corps comme première couleur, le regard comme ancrage du paysage intérieur.',
          },
          weakSignals: [
            'Micro-relâchement des épaules',
            'Regard qui se pose sur l’œuvre',
            'Souffle plus ample',
            'Posture qui s’ajuste sans consigne',
          ],
          trajectories: [
            {
              key: 'dispersion_continuite',
              label: 'Dispersion vers continuité',
              from: 'Dispersion',
              to: 'Continuité',
            },
            {
              key: 'retrait_ancrage',
              label: 'Retrait vers ancrage',
              from: 'Retrait corporel',
              to: 'Ancrage',
            },
          ],
        },
        {
          key: 'regulation_emotionnelle',
          objective: 'Améliorer la régulation émotionnelle',
          subObjectives: [
            'Identifier les émotions',
            'Exprimer sans débordement',
            'Moduler l’intensité émotionnelle',
            'Tolérer un affect sans rupture',
          ],
          indicators: [
            'regulation_emotionnelle',
            'verbalisation_emotionnelle',
            'modulation_geste',
            'stabilite_affective',
          ],
          sensoryIndicators: [
            'reactivite_couleur',
            'rythme_respiratoire',
            'qualite_toucher',
          ],
          reading: {
            clinical:
              'Passage d’un affect brut à un affect modulé, supportable et transformable.',
            institutional:
              'Expression émotionnelle plus adaptée, réduction des débordements, stabilité tonique.',
            puzzle:
              'La couleur comme climat, le geste comme onde, le souffle comme régulateur.',
          },
          weakSignals: [
            'Micro-soupirs',
            'Variation de pression sur la matière',
            'Changement de saturation chromatique',
            'Ralentissement du geste après montée émotionnelle',
          ],
          trajectories: [
            {
              key: 'debordement_modulation',
              label: 'Débordement vers modulation',
              from: 'Débordement',
              to: 'Modulation',
            },
            {
              key: 'chaos_apaisement',
              label: 'Chaos vers apaisement',
              from: 'Chaos',
              to: 'Apaisement',
            },
          ],
        },
        {
          key: 'dynamique_desir',
          objective: 'Réactiver la dynamique du désir',
          subObjectives: [
            'Initier une action',
            'Faire des choix',
            'Persévérer dans l’activité',
            'Revenir spontanément à une œuvre',
          ],
          indicators: [
            'dynamique_desir',
            'initiative',
            'perseverance',
            'retour_oeuvre',
          ],
          sensoryIndicators: [
            'reactivite_couleur',
            'qualite_toucher',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Réactivation du mouvement vers, de l’élan vital et de la capacité à investir.',
            institutional:
              'Participation active, prise d’initiative, constance dans l’activité.',
            puzzle:
              'Le désir comme ligne de force, le médium comme appel intérieur.',
          },
          weakSignals: [
            'Main qui se tend vers un médium',
            'Regard qui s’illumine',
            'Micro-sourire en retrouvant une œuvre',
          ],
          trajectories: [
            {
              key: 'passivite_initiative',
              label: 'Passivité vers initiative',
              from: 'Passivité',
              to: 'Initiative',
            },
            {
              key: 'evitement_engagement',
              label: 'Évitement vers engagement',
              from: 'Évitement',
              to: 'Engagement',
            },
          ],
        },
        {
          key: 'symbolisation',
          objective: 'Favoriser la symbolisation',
          subObjectives: [
            'Donner forme au vécu',
            'Associer image et émotion',
            'Produire du sens',
            'Utiliser la métaphore ou le récit',
          ],
          indicators: [
            'symbolisation',
            'expression_narrative',
            'motifs_symboliques',
            'mise_en_sens',
          ],
          sensoryIndicators: [
            'motifs_symboliques',
            'reactivite_couleur',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Transformation du vécu en image, motif, récit ou métaphore partageable.',
            institutional:
              'Expression symbolique, verbalisation plus élaborée, cohérence narrative.',
            puzzle:
              'Le motif comme archétype, l’œuvre comme contenant, le récit comme chemin de sens.',
          },
          weakSignals: [
            'Apparition d’un personnage',
            'Répétition d’une forme',
            'Changement de ton en parlant de l’œuvre',
          ],
          trajectories: [
            {
              key: 'indicible_representation',
              label: 'Indicible vers représentation',
              from: 'Indicible',
              to: 'Représentation',
            },
            {
              key: 'motif_narratif',
              label: 'Forme vers motif narratif',
              from: 'Forme brute',
              to: 'Motif narratif',
            },
          ],
        },
        {
          key: 'flexibilite_defensive',
          objective: 'Assouplir les défenses',
          subObjectives: [
            'Réduire la rigidité',
            'Tolérer l’imprévu',
            'Accepter la transformation',
            'Transformer l’accident en ressource',
          ],
          indicators: [
            'flexibilite_defensive',
            'adaptation',
            'ajustement',
            'tolerance_imprevu',
          ],
          sensoryIndicators: [
            'qualite_toucher',
            'reactivite_couleur',
            'transformation_intermodale',
          ],
          reading: {
            clinical:
              'Passage d’une défense rigide à une défense plus souple et élaborative.',
            institutional:
              'Meilleure adaptation au cadre, plus grande tolérance à l’imprévu.',
            puzzle:
              'L’accident comme alchimie créative, l’imprévu comme matière de travail.',
          },
          weakSignals: [
            'Sourire face à un raté',
            'Geste moins crispé',
            'Acceptation d’une consigne ouverte',
          ],
          trajectories: [
            {
              key: 'controle_souplesse',
              label: 'Contrôle vers souplesse',
              from: 'Contrôle rigide',
              to: 'Souplesse',
            },
            {
              key: 'accident_ressource',
              label: 'Accident vers ressource',
              from: 'Accident subi',
              to: 'Accident ressource',
            },
          ],
        },
      ],
    },

    {
      key: 'processus_expressif',
      label: 'Axe 2 — Processus expressif',
      shortLabel: 'Expressif',
      description:
        'Expression plastique, narrative, sonore et corporelle ; modulation et structuration de l’expression.',
      rows: [
        {
          key: 'expression_plastique',
          objective: 'Développer l’expression plastique',
          subObjectives: [
            'Varier la palette',
            'Fluidifier le geste',
            'Investir l’espace',
            'Transformer la matière',
            'Structurer la composition',
          ],
          indicators: [
            'expression_plastique',
            'modulation_geste',
            'organisation_spatiale',
            'composition',
          ],
          sensoryIndicators: [
            'reactivite_couleur',
            'qualite_toucher',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Mise en forme visible de l’état interne, avec modulation du tonus émotionnel et de la structuration.',
            institutional:
              'Manipulation adaptée, production plus cohérente, engagement créatif renforcé.',
            puzzle:
              'Chroma-psyché, espace comme territoire psychique, matière comme corps du monde.',
          },
          weakSignals: [
            'Variation de pression',
            'Retour à une zone vide',
            'Geste qui s’ouvre',
          ],
          trajectories: [
            {
              key: 'palette_elargie',
              label: 'Palette restreinte vers palette élargie',
              from: 'Palette restreinte',
              to: 'Palette élargie',
            },
            {
              key: 'geste_fluide',
              label: 'Geste saccadé vers geste fluide',
              from: 'Geste saccadé',
              to: 'Geste fluide',
            },
            {
              key: 'espace_investi',
              label: 'Espace évité vers espace investi',
              from: 'Espace évité',
              to: 'Espace investi',
            },
          ],
        },
        {
          key: 'expression_narrative',
          objective: 'Développer l’expression narrative',
          subObjectives: [
            'Nommer',
            'Décrire',
            'Raconter',
            'Se positionner',
            'Symboliser par le langage',
          ],
          indicators: [
            'expression_narrative',
            'verbalisation',
            'narration',
            'subjectivation',
          ],
          sensoryIndicators: ['motifs_symboliques', 'reactivite_couleur'],
          reading: {
            clinical:
              'Passage du vécu implicite vers un récit plus partageable et subjectivé.',
            institutional:
              'Communication adaptée, capacité à décrire l’œuvre, meilleure expression des besoins.',
            puzzle:
              'Les mots comme pigments sonores, le récit comme pont entre intérieur et extérieur.',
          },
          weakSignals: [
            'Apparition d’un “je”',
            'Nuance du ton',
            'Regard adouci en décrivant une forme',
          ],
          trajectories: [
            {
              key: 'mutisme_mise_en_mots',
              label: 'Mutisme vers mise en mots',
              from: 'Mutisme',
              to: 'Mise en mots',
            },
            {
              key: 'recit_structure',
              label: 'Récit éclaté vers récit structuré',
              from: 'Récit éclaté',
              to: 'Récit structuré',
            },
            {
              key: 'description_metaphore',
              label: 'Description vers métaphore',
              from: 'Description simple',
              to: 'Métaphore',
            },
          ],
        },
        {
          key: 'expression_sonore',
          objective: 'Développer l’expression sonore',
          subObjectives: [
            'Oser vocaliser',
            'Moduler le volume et le timbre',
            'Utiliser le rythme',
            'Habiter le silence',
            'Improviser',
          ],
          indicators: [
            'expression_sonore',
            'rythme',
            'modulation_vocale',
            'audace_expressive',
          ],
          sensoryIndicators: ['rythme_respiratoire'],
          reading: {
            clinical:
              'Le sonore révèle la vitalité, la régulation émotionnelle et la capacité d’expression non verbale.',
            institutional:
              'Participation aux activités sonores, expression vocale plus adaptée.',
            puzzle:
              'Le son comme onde émotionnelle, le silence comme espace de respiration.',
          },
          weakSignals: [
            'Micro-hésitations vocales',
            'Souffle qui s’allonge',
            'Changement de rythme selon l’émotion',
          ],
          trajectories: [
            {
              key: 'silence_habite',
              label: 'Silence défensif vers silence habité',
              from: 'Silence défensif',
              to: 'Silence habité',
            },
            {
              key: 'voix_modulee',
              label: 'Voix retenue vers voix modulée',
              from: 'Voix retenue',
              to: 'Voix modulée',
            },
            {
              key: 'repetition_variation',
              label: 'Répétition vers variation',
              from: 'Répétition sonore',
              to: 'Variation sonore',
            },
          ],
        },
        {
          key: 'expression_corporelle',
          objective: 'Développer l’expression corporelle',
          subObjectives: [
            'Renforcer l’ancrage',
            'Augmenter l’amplitude',
            'Fluidifier la coordination',
            'Explorer l’espace',
            'Déployer la vitalité',
          ],
          indicators: [
            'expression_corporelle',
            'ancrage',
            'amplitude',
            'coordination',
            'vitalite',
          ],
          sensoryIndicators: [
            'rythme_respiratoire',
            'qualite_toucher',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Le corps devient support d’expression et non simple lieu de tension ou de retrait.',
            institutional:
              'Mobilité adaptée, engagement moteur, participation corporelle plus libre.',
            puzzle:
              'Le corps-paysage, le déplacement comme narration spatiale.',
          },
          weakSignals: [
            'Détente des épaules',
            'Pas plus assurés',
            'Ouverture du buste',
          ],
          trajectories: [
            {
              key: 'corps_explorateur',
              label: 'Corps figé vers corps explorateur',
              from: 'Corps figé',
              to: 'Corps explorateur',
            },
            {
              key: 'fermeture_amplitude',
              label: 'Fermeture vers amplitude',
              from: 'Fermeture',
              to: 'Amplitude',
            },
            {
              key: 'defensif_incarne',
              label: 'Geste défensif vers geste incarné',
              from: 'Geste défensif',
              to: 'Geste incarné',
            },
          ],
        },
      ],
    },

    {
      key: 'processus_relationnel',
      label: 'Axe 3 — Processus relationnel',
      shortLabel: 'Relationnel',
      description:
        'Alliance thérapeutique, communication relationnelle, positionnement, co-construction.',
      rows: [
        {
          key: 'alliance_therapeutique',
          objective: 'Construire l’alliance thérapeutique',
          subObjectives: [
            'Installer la confiance',
            'Renforcer le sentiment de sécurité',
            'Développer la co-présence',
            'Faciliter la synchronisation',
            'Accepter le cadre comme contenant',
          ],
          indicators: [
            'alliance_therapeutique',
            'confiance',
            'securite',
            'copresence',
            'respect_cadre',
          ],
          sensoryIndicators: ['rythme_respiratoire', 'rapport_au_cycle'],
          reading: {
            clinical:
              'Le lien thérapeutique devient suffisamment sécure pour soutenir un travail de transformation.',
            institutional:
              'Relation thérapeutique stable, engagement dans la séance, respect du cadre.',
            puzzle:
              'Pont chromatique, rythme commun, respiration du dispositif.',
          },
          weakSignals: [
            'Micro-sourire en te voyant',
            'Détente corporelle',
            'Regard qui te cherche',
          ],
          trajectories: [
            {
              key: 'mefiance_confiance',
              label: 'Méfiance vers confiance',
              from: 'Méfiance',
              to: 'Confiance',
            },
            {
              key: 'agitation_securite',
              label: 'Agitation vers sécurité',
              from: 'Agitation',
              to: 'Sécurité',
            },
          ],
        },
        {
          key: 'communication_relationnelle',
          objective: 'Développer la communication relationnelle',
          subObjectives: [
            'Utiliser le verbal',
            'Mobiliser le non verbal',
            'Partager un ressenti',
            'Utiliser le silence de façon ajustée',
            'Exprimer implicitement sans retrait massif',
          ],
          indicators: [
            'communication_relationnelle',
            'verbal',
            'non_verbal',
            'partage_affectif',
            'interaction',
          ],
          sensoryIndicators: [
            'qualite_toucher',
            'rythme_respiratoire',
            'motifs_symboliques',
          ],
          reading: {
            clinical:
              'Circulation plus fluide entre affect, corps, parole et lien.',
            institutional:
              'Interactions adaptées, expression des besoins, meilleure cohérence verbale/non verbale.',
            puzzle:
              'Le geste comme langage premier, le silence comme espace de résonance.',
          },
          weakSignals: [
            'Hochements de tête',
            'Orientation du buste',
            'Soupirs comme messages',
          ],
          trajectories: [
            {
              key: 'communication_fluide',
              label: 'Communication bloquée vers communication fluide',
              from: 'Communication bloquée',
              to: 'Communication fluide',
            },
            {
              key: 'silence_habite_relation',
              label: 'Silence figé vers silence habité',
              from: 'Silence figé',
              to: 'Silence habité',
            },
          ],
        },
        {
          key: 'positionnement',
          objective: 'Renforcer le positionnement',
          subObjectives: [
            'Dire oui',
            'Dire non',
            'Poser une limite',
            'Exprimer un besoin',
            'Faire un choix assumé',
          ],
          indicators: [
            'positionnement',
            'affirmation',
            'expression_besoins',
            'choix',
          ],
          sensoryIndicators: ['reactivite_couleur', 'qualite_toucher'],
          reading: {
            clinical:
              'Émergence d’un sujet capable d’exister dans la relation sans se dissoudre.',
            institutional:
              'Capacité à demander et refuser, autonomie dans les choix, expression claire des préférences.',
            puzzle:
              'Le non comme bord protecteur, le choix comme geste d’existence.',
          },
          weakSignals: [
            'Micro-retrait du buste',
            'Regard qui s’affirme',
            'Main hésitante puis posée',
          ],
          trajectories: [
            {
              key: 'soumission_affirmation',
              label: 'Soumission vers affirmation',
              from: 'Soumission',
              to: 'Affirmation',
            },
            {
              key: 'refus_brut_limite',
              label: 'Refus brut vers limite adaptée',
              from: 'Refus brut',
              to: 'Limite adaptée',
            },
          ],
        },
        {
          key: 'co_construction',
          objective: 'Favoriser la co-construction',
          subObjectives: [
            'Proposer',
            'Négocier',
            'Collaborer',
            'Partager',
            'S’ajuster',
          ],
          indicators: [
            'co_construction',
            'collaboration',
            'ajustement',
            'partage',
            'proposition',
          ],
          sensoryIndicators: ['rythme_respiratoire', 'motifs_symboliques'],
          reading: {
            clinical:
              'Créativité relationnelle et ajustement mutuel dans la rencontre thérapeutique.',
            institutional:
              'Participation collaborative, adaptation aux propositions, engagement dans la dynamique de groupe.',
            puzzle:
              'Tissage relationnel, danse du vivant, paysage partagé.',
          },
          weakSignals: [
            'Geste qui se synchronise',
            'Regard de co-présence',
            'Sourire face à la proposition',
          ],
          trajectories: [
            {
              key: 'isolement_collaboration',
              label: 'Isolement vers collaboration',
              from: 'Isolement',
              to: 'Collaboration',
            },
            {
              key: 'execution_proposition',
              label: 'Exécution vers proposition',
              from: 'Exécution passive',
              to: 'Proposition active',
            },
          ],
        },
      ],
    },

    {
      key: 'pluriexpressionnalite',
      label: 'Axe 4 — Pluriexpressionnalité',
      shortLabel: 'Intermodal',
      description:
        'Fluidité intermodale, cohérence intermodale, transformation intermodale, intégration sensorielle.',
      rows: [
        {
          key: 'fluidite_intermodale',
          objective: 'Développer la fluidité intermodale',
          subObjectives: [
            'Passer d’un médium à l’autre',
            'Tolérer le changement',
            'Explorer plusieurs supports',
            'Réduire les blocages de passage',
          ],
          indicators: [
            'fluidite_intermodale',
            'passage',
            'exploration_multimedias',
            'tolerance_changement',
          ],
          sensoryIndicators: [
            'rythme_respiratoire',
            'reactivite_couleur',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Plasticité psychique et capacité de franchissement entre les modalités d’expression.',
            institutional:
              'Adaptation aux changements, participation à plusieurs supports.',
            puzzle:
              'Le passage comme seuil initiatique, la mue expressive.',
          },
          weakSignals: [
            'Micro-hésitation avant un passage',
            'Regard vers un autre médium',
            'Souffle qui change avant la transition',
          ],
          trajectories: [
            {
              key: 'blocage_passage',
              label: 'Blocage vers passage',
              from: 'Blocage',
              to: 'Passage',
            },
            {
              key: 'refuge_pluralite',
              label: 'Refuge unique vers pluralité',
              from: 'Médium refuge unique',
              to: 'Pluralité de supports',
            },
          ],
        },
        {
          key: 'coherence_intermodale',
          objective: 'Créer une cohérence intermodale',
          subObjectives: [
            'Relier les productions',
            'Maintenir un fil',
            'Reconnaître des échos',
            'Harmoniser les modalités',
          ],
          indicators: [
            'coherence_intermodale',
            'continuite',
            'correspondances',
            'harmonisation',
          ],
          sensoryIndicators: [
            'motifs_symboliques',
            'reactivite_couleur',
            'rythme_respiratoire',
          ],
          reading: {
            clinical:
              'Intégration de l’expérience dans plusieurs langages avec continuité et cohérence.',
            institutional:
              'Continuité dans les productions, cohérence multisupport.',
            puzzle:
              'La trame, la résonance, le paysage intérieur unifié.',
          },
          weakSignals: [
            'Reprise d’un motif dans un autre support',
            'Micro-sourire en retrouvant un écho',
            'Regard qui fait lien entre deux productions',
          ],
          trajectories: [
            {
              key: 'dispersion_coherence_intermodale',
              label: 'Dispersion vers cohérence',
              from: 'Dispersion',
              to: 'Cohérence',
            },
            {
              key: 'juxtaposition_tissage',
              label: 'Juxtaposition vers tissage',
              from: 'Juxtaposition',
              to: 'Tissage',
            },
          ],
        },
        {
          key: 'transformation_intermodale',
          objective: 'Permettre la transformation intermodale',
          subObjectives: [
            'Déplacer un vécu',
            'Amplifier ou apaiser',
            'Ouvrir un nouvel accès',
            'Métaboliser par changement de support',
          ],
          indicators: [
            'transformation_intermodale',
            'deplacement',
            'amplification',
            'attenuation',
          ],
          sensoryIndicators: [
            'rythme_respiratoire',
            'reactivite_couleur',
            'qualite_toucher',
          ],
          reading: {
            clinical:
              'Un même vécu devient transformable grâce au changement de support.',
            institutional:
              'Capacité à utiliser différents supports pour exprimer un vécu.',
            puzzle:
              'Alchimie expressive, médium passeur, transmutation.',
          },
          weakSignals: [
            'Apaisement tonique au changement de médium',
            'Intensité qui se module',
            'Couleur qui s’éclaircit',
            'Geste qui s’ouvre dans un autre support',
          ],
          trajectories: [
            {
              key: 'tension_forme_transformee',
              label: 'Tension brute vers forme transformée',
              from: 'Tension brute',
              to: 'Forme transformée',
            },
            {
              key: 'conflit_deplacement',
              label: 'Conflit figé vers déplacement possible',
              from: 'Conflit figé',
              to: 'Déplacement possible',
            },
          ],
        },
        {
          key: 'integration_sensorielle',
          objective: 'Renforcer l’intégration sensorielle',
          subObjectives: [
            'Coordonner les sens',
            'Stabiliser un rythme',
            'Tolérer les stimulations',
            'Garder son centre',
          ],
          indicators: [
            'integration_sensorielle',
            'coordination_multisensorielle',
            'rythme_interne',
            'tolerance_sensorielle',
          ],
          sensoryIndicators: [
            'reactivite_couleur',
            'qualite_toucher',
            'rythme_respiratoire',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Unification psychocorporelle et stabilité interne dans la pluralité des stimulations.',
            institutional:
              'Participation multisensorielle adaptée, rythme plus stable.',
            puzzle:
              'Harmonie du vivant, orchestration sensible.',
          },
          weakSignals: [
            'Regard qui circule sans agitation',
            'Souffle-geste-voix synchronisés',
            'Maintien du centre malgré plusieurs stimulations',
          ],
          trajectories: [
            {
              key: 'morcellement_unite',
              label: 'Morcellement vers unité',
              from: 'Morcellement',
              to: 'Unité',
            },
            {
              key: 'debordement_coordination',
              label: 'Débordement sensoriel vers coordination',
              from: 'Débordement sensoriel',
              to: 'Coordination',
            },
          ],
        },
      ],
    },

    {
      key: 'indicateurs_institutionnels',
      label: 'Axe 5 — Indicateurs institutionnels',
      shortLabel: 'Institutionnel',
      description:
        'Participation, autonomie, communication sociale, bien-être observable, mobilisation cognitive.',
      rows: [
        {
          key: 'participation',
          objective: 'Renforcer la participation',
          subObjectives: [
            'Être présent',
            'Entrer dans le rituel',
            'S’engager dans l’activité',
            'Maintenir sa présence au fil de la séance',
            'Revenir d’une séance à l’autre',
          ],
          indicators: [
            'participation',
            'engagement',
            'presence',
            'continuite',
          ],
          sensoryIndicators: [
            'rapport_au_cycle',
            'rythme_respiratoire',
            'motifs_symboliques',
          ],
          reading: {
            clinical:
              'Mobilisation subjective dans le dispositif et capacité à y prendre place.',
            institutional:
              'Présence stable, participation active, engagement dans l’activité.',
            puzzle:
              'Entrée dans le cercle, première couleur du lien.',
          },
          weakSignals: [
            'Installation plus rapide',
            'Micro-sourire en entrant',
            'Moins de dispersion initiale',
          ],
          trajectories: [
            {
              key: 'retrait_participation',
              label: 'Retrait vers participation',
              from: 'Retrait',
              to: 'Participation',
            },
            {
              key: 'entree_fluide_rituel',
              label: 'Entrée difficile vers entrée fluide',
              from: 'Entrée difficile',
              to: 'Entrée fluide',
            },
          ],
        },
        {
          key: 'autonomie',
          objective: 'Développer l’autonomie',
          subObjectives: [
            'S’installer',
            'Choisir',
            'Manipuler',
            'Organiser',
            'Gérer rythme et demande d’aide',
          ],
          indicators: [
            'autonomie',
            'initiative',
            'choix',
            'auto_organisation',
          ],
          sensoryIndicators: [
            'qualite_toucher',
            'reactivite_couleur',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Affirmation du sujet capable d’agir, de choisir et de s’organiser.',
            institutional:
              'Autonomie dans les activités, initiative fonctionnelle, gestion adaptée.',
            puzzle:
              'Le choix comme affirmation chromatique, le rangement comme clôture.',
          },
          weakSignals: [
            'Main qui va vers un outil',
            'Regard qui cherche moins l’approbation',
            'Rangement plus organisé',
          ],
          trajectories: [
            {
              key: 'dependance_autonomie_row',
              label: 'Dépendance vers autonomie',
              from: 'Dépendance',
              to: 'Autonomie',
            },
            {
              key: 'hesitation_decision',
              label: 'Hésitation vers décision',
              from: 'Hésitation',
              to: 'Décision',
            },
          ],
        },
        {
          key: 'communication_sociale',
          objective: 'Améliorer la communication sociale',
          subObjectives: [
            'Établir un contact',
            'Interagir',
            'Partager',
            'Coopérer',
            'Trouver sa place dans le groupe',
          ],
          indicators: [
            'communication_sociale',
            'interaction',
            'cooperation',
            'presence_groupe',
          ],
          sensoryIndicators: ['rythme_respiratoire', 'qualite_toucher'],
          reading: {
            clinical:
              'Ouverture relationnelle et sécurité accrue dans le lien social.',
            institutional:
              'Interactions adaptées, participation au groupe, coopération.',
            puzzle:
              'Constellation vivante, tissage du groupe.',
          },
          weakSignals: [
            'Micro-regards vers l’autre',
            'Sourire discret',
            'Orientation du buste',
          ],
          trajectories: [
            {
              key: 'isolement_contact',
              label: 'Isolement vers contact',
              from: 'Isolement',
              to: 'Contact',
            },
            {
              key: 'coexistence_cooperation',
              label: 'Coexistence vers coopération',
              from: 'Coexistence passive',
              to: 'Coopération',
            },
          ],
        },
        {
          key: 'bien_etre_observable',
          objective: 'Augmenter le bien-être observable',
          subObjectives: [
            'Diminuer l’agitation',
            'Améliorer la détente',
            'Stabiliser le tonus',
            'Soutenir une expression affective positive',
          ],
          indicators: [
            'bien_etre_observable',
            'apaisement',
            'tonus',
            'expression_affective',
          ],
          sensoryIndicators: [
            'rythme_respiratoire',
            'qualite_toucher',
            'reactivite_couleur',
          ],
          reading: {
            clinical:
              'Apaisement transversal du fonctionnement avec meilleure stabilité du corps et de l’affect.',
            institutional:
              'Réduction de l’agitation, calme observable, affect positif.',
            puzzle:
              'Climat intérieur apaisé, météo du corps plus stable.',
          },
          weakSignals: [
            'Soupirs de détente',
            'Épaules relâchées',
            'Regard plus vivant',
          ],
          trajectories: [
            {
              key: 'agitation_apaisement',
              label: 'Agitation vers apaisement',
              from: 'Agitation',
              to: 'Apaisement',
            },
            {
              key: 'fermeture_detente',
              label: 'Fermeture vers détente',
              from: 'Fermeture',
              to: 'Détente',
            },
          ],
        },
        {
          key: 'mobilisation_cognitive',
          objective: 'Soutenir la mobilisation cognitive',
          subObjectives: [
            'Maintenir l’attention',
            'Mobiliser la mémoire',
            'Planifier',
            'Anticiper',
            'Résoudre un problème',
          ],
          indicators: [
            'mobilisation_cognitive',
            'attention',
            'memoire',
            'planification',
            'resolution_probleme',
          ],
          sensoryIndicators: ['motifs_symboliques', 'rapport_au_cycle'],
          reading: {
            clinical:
              'Structuration, mémoire procédurale et capacité d’organisation en progression.',
            institutional:
              'Attention soutenue, mémoire mobilisée, initiative cognitive.',
            puzzle:
              'Architecture intérieure, fil rouge, focalisation du geste.',
          },
          weakSignals: [
            'Reprise spontanée d’un geste',
            'Moins de demandes de répétition',
            'Meilleure orientation dans l’espace',
          ],
          trajectories: [
            {
              key: 'confusion_organisation',
              label: 'Confusion vers organisation',
              from: 'Confusion',
              to: 'Organisation',
            },
            {
              key: 'oubli_reprise',
              label: 'Oubli vers reprise',
              from: 'Oubli',
              to: 'Reprise',
            },
          ],
        },
      ],
    },

    {
      key: 'sensoriel_symbolique',
      label: 'Axe 6 — Sensoriel & symbolique',
      shortLabel: 'Sensoriel',
      description:
        'Réactivité aux couleurs, qualité du toucher, rythme respiratoire, motifs symboliques, rapport au cycle.',
      rows: [
        {
          key: 'sensorialite_incarnee',
          objective: 'Développer la sensorialité incarnée',
          subObjectives: [
            'Explorer',
            'Tolérer',
            'Différencier',
            'Moduler',
            'Habiter les sensations',
          ],
          indicators: [
            'qualite_toucher',
            'reactivite_couleur',
            'rythme_respiratoire',
          ],
          sensoryIndicators: [
            'qualite_toucher',
            'reactivite_couleur',
            'rythme_respiratoire',
          ],
          reading: {
            clinical:
              'Réappropriation du corps sensible et du rapport à la matière.',
            institutional:
              'Manipulation adaptée, tolérance sensorielle, engagement tactile et corporel.',
            puzzle:
              'Porte d’entrée du vivant, peau-monde, climat intérieur.',
          },
          weakSignals: [
            'Retrait du doigt',
            'Regard prolongé',
            'Soupir au contact',
            'Main qui s’ouvre',
          ],
          trajectories: [
            {
              key: 'evitement_exploration',
              label: 'Évitement vers exploration',
              from: 'Évitement',
              to: 'Exploration',
            },
            {
              key: 'crispation_modulation',
              label: 'Crispation vers modulation',
              from: 'Crispation',
              to: 'Modulation',
            },
          ],
        },
        {
          key: 'regulation_sensorielle',
          objective: 'Favoriser la régulation par les sens',
          subObjectives: [
            'Utiliser le souffle comme appui',
            'S’appuyer sur la couleur',
            'Moduler la pression',
            'Trouver un rythme régulateur',
          ],
          indicators: [
            'rythme_respiratoire',
            'reactivite_couleur',
            'qualite_toucher',
          ],
          sensoryIndicators: [
            'rythme_respiratoire',
            'reactivite_couleur',
            'qualite_toucher',
          ],
          reading: {
            clinical:
              'Les sens deviennent médiateurs de transformation plutôt que sources de débordement.',
            institutional:
              'Calme observable, stabilité tonique, participation plus ajustée.',
            puzzle:
              'Le souffle comme pinceau invisible, la couleur comme abri ou appel.',
          },
          weakSignals: [
            'Micro-soupirs',
            'Ralentissement du geste',
            'Variation de saturation',
            'Souffle qui s’allonge',
          ],
          trajectories: [
            {
              key: 'souffle_retenu_ample',
              label: 'Souffle retenu vers souffle ample',
              from: 'Souffle retenu',
              to: 'Souffle ample',
            },
            {
              key: 'agitation_regulation_sensorielle',
              label: 'Agitation vers régulation sensorielle',
              from: 'Agitation',
              to: 'Régulation sensorielle',
            },
          ],
        },
        {
          key: 'symbolisation_profonde',
          objective: 'Soutenir la symbolisation profonde',
          subObjectives: [
            'Identifier les motifs',
            'Relier les motifs au vécu',
            'Transformer un archétype',
            'Créer du sens symbolique',
          ],
          indicators: [
            'motifs_symboliques',
            'symbolisation',
            'mise_en_sens',
          ],
          sensoryIndicators: [
            'motifs_symboliques',
            'reactivite_couleur',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Passage du vécu brut à une forme symbolique plus élaborée.',
            institutional:
              'Expression symbolique, continuité dans les productions.',
            puzzle:
              'Totems, archétypes personnels, mue symbolique.',
          },
          weakSignals: [
            'Motif refuge',
            'Variation subtile du motif',
            'Regard particulier sur un signe',
            'Motif repris dans plusieurs supports',
          ],
          trajectories: [
            {
              key: 'motif_fige_vivant',
              label: 'Motif figé vers motif vivant',
              from: 'Motif figé',
              to: 'Motif vivant',
            },
            {
              key: 'symbole_opaque_sens',
              label: 'Symbole opaque vers sens partagé',
              from: 'Symbole opaque',
              to: 'Sens partagé',
            },
          ],
        },
        {
          key: 'temporalite_creative',
          objective: 'Structurer la temporalité créative',
          subObjectives: [
            'Commencer',
            'Rester',
            'Transformer',
            'Clôturer',
            'Revenir',
          ],
          indicators: ['rapport_au_cycle', 'continuite', 'engagement'],
          sensoryIndicators: ['rapport_au_cycle', 'rythme_respiratoire'],
          reading: {
            clinical:
              'Maturation psychique visible dans le rapport au temps de l’œuvre et à sa clôture.',
            institutional:
              'Capacité à terminer, engagement dans la durée, continuité.',
            puzzle:
              'Aube, midi, crépuscule, nuit, retour.',
          },
          weakSignals: [
            'Lissage final',
            'Rangement',
            'Regard qui boucle',
            'Apaisement en fin de séance',
          ],
          trajectories: [
            {
              key: 'difficulte_entree_fluide',
              label: 'Difficulté à commencer vers entrée fluide',
              from: 'Difficulté à commencer',
              to: 'Entrée fluide',
            },
            {
              key: 'fuite_cloture',
              label: 'Fuite vers clôture',
              from: 'Fuite',
              to: 'Clôture',
            },
          ],
        },
        {
          key: 'integration_incarnee',
          objective: 'Renforcer l’intégration incarnée',
          subObjectives: [
            'Coordonner souffle-geste-regard',
            'Unifier l’expérience sensible',
            'Maintenir une cohérence psychocorporelle',
            'Stabiliser la présence dans plusieurs canaux',
          ],
          indicators: [
            'integration_sensorielle',
            'coordination_multisensorielle',
            'presence',
            'coherence_intermodale',
          ],
          sensoryIndicators: [
            'reactivite_couleur',
            'qualite_toucher',
            'rythme_respiratoire',
            'motifs_symboliques',
            'rapport_au_cycle',
          ],
          reading: {
            clinical:
              'Subjectivation incarnée et unification progressive de l’expérience sensible et psychique.',
            institutional:
              'Participation multisensorielle adaptée, stabilité corporelle et continuité dans l’activité.',
            puzzle:
              'Harmonie du vivant, cartographie sensible unifiée.',
          },
          weakSignals: [
            'Synchronisation souffle-geste',
            'Regard qui circule sans agitation',
            'Maintien d’un centre corporel stable',
          ],
          trajectories: [
            {
              key: 'morcellement_orchestration',
              label: 'Morcellement vers orchestration sensible',
              from: 'Morcellement',
              to: 'Orchestration sensible',
            },
            {
              key: 'tension_continuite_incarnee',
              label: 'Tension vers continuité incarnée',
              from: 'Tension',
              to: 'Continuité incarnée',
            },
          ],
        },
      ],
    },
  ],

  globalTrajectories: [
    {
      key: 'fermeture_ouverture',
      label: 'De la fermeture à l’ouverture',
      description:
        'Le sujet s’autorise davantage à sentir, exprimer et explorer.',
      axes: ['processus_interne', 'processus_expressif', 'sensoriel_symbolique'],
      markers: [
        'Palette élargie',
        'Geste plus fluide',
        'Souffle plus ample',
        'Moins d’évitement',
      ],
    },
    {
      key: 'dispersion_coherence',
      label: 'De la dispersion à la cohérence',
      description:
        'Le fonctionnement devient plus organisé, plus continu et plus lisible.',
      axes: [
        'processus_interne',
        'processus_expressif',
        'pluriexpressionnalite',
        'indicateurs_institutionnels',
      ],
      markers: [
        'Production plus structurée',
        'Récit plus stable',
        'Passages intermodaux plus fluides',
      ],
    },
    {
      key: 'dependance_autonomie',
      label: 'De la dépendance à l’autonomie',
      description:
        'Le sujet devient auteur de ses choix, de son rythme et de son engagement.',
      axes: [
        'processus_relationnel',
        'indicateurs_institutionnels',
        'sensoriel_symbolique',
      ],
      markers: [
        'Choix affirmés',
        'Installation autonome',
        'Demande d’aide plus ajustée',
        'Clôture plus stable',
      ],
    },
    {
      key: 'indicible_symbolisation',
      label: 'De l’indicible à la symbolisation',
      description:
        'Le vécu brut se transforme en image, motif, geste, récit ou souffle.',
      axes: [
        'processus_interne',
        'processus_expressif',
        'pluriexpressionnalite',
        'sensoriel_symbolique',
      ],
      markers: [
        'Apparition de motifs',
        'Métaphores émergentes',
        'Transformation du thème',
        'Résonances intermodales',
      ],
    },
    {
      key: 'mefiance_alliance',
      label: 'De la méfiance à l’alliance',
      description:
        'Le lien thérapeutique devient contenant et sécurisant.',
      axes: ['processus_relationnel', 'indicateurs_institutionnels'],
      markers: [
        'Regard recherché',
        'Détente en présence du thérapeute',
        'Communication plus fluide',
      ],
    },
    {
      key: 'rigidite_plasticite',
      label: 'De la rigidité à la plasticité',
      description:
        'Le sujet tolère mieux l’imprévu, le changement et les transitions.',
      axes: ['processus_interne', 'pluriexpressionnalite', 'sensoriel_symbolique'],
      markers: [
        'Acceptation de l’accident',
        'Changement de médium',
        'Modulation des textures et couleurs',
      ],
    },
  ],
}

export function getMatrixAxis(axisKey: string) {
  return ATPE_MATRIX.axes.find((axis) => axis.key === axisKey)
}

export function getMatrixRow(axisKey: string, rowKey: string) {
  return ATPE_MATRIX.axes
    .find((axis) => axis.key === axisKey)
    ?.rows.find((row) => row.key === rowKey)
}

export function getAllMatrixAxes() {
  return ATPE_MATRIX.axes
}

export function getAllGlobalTrajectories() {
  return ATPE_MATRIX.globalTrajectories
}

export function getAxisLabels() {
  return ATPE_MATRIX.axes.map((axis) => ({
    key: axis.key,
    label: axis.label,
    shortLabel: axis.shortLabel,
  }))
}