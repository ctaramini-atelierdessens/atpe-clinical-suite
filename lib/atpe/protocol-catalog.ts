export type AtpeProtocolCategory =
  | 'containment'
  | 'sensorial'
  | 'mobilisation'
  | 'symbolization'
  | 'integration'
  | 'closure'

export type AtpeProtocol = {
  slug: string
  title: string
  short_title: string
  category: AtpeProtocolCategory
  clinical_intent: string
  indication: string[]
  contraindication: string[]
  target_phases: Array<
    'attitude_interieure' | 'creation' | 'dialogue_oeuvre' | 'partage'
  >
  target_risk_levels: Array<'low' | 'moderate' | 'high' | 'critical'>
  target_clinical_levels: Array<
    'very_fragile' | 'fragile' | 'intermediate' | 'good' | 'very_good'
  >
  mediations: string[]
  session_structure: string[]
  expected_effects: string[]
  precautions: string[]
  therapist_posture: string[]
  progression_markers: string[]
  fallback_if_overload: string[]
}

export const ATPE_PROTOCOLS: AtpeProtocol[] = [
  {
    slug: 'protocole-contenance-minimale',
    title: 'Protocole de contenance minimale',
    short_title: 'Contenance minimale',
    category: 'containment',
    clinical_intent:
      'Rétablir un niveau minimal de sécurité interne et de stabilité du cadre.',
    indication: [
      'risque clinique élevé',
      'cadre peu contenant',
      'fragilité importante',
      'désorganisation possible à la relance',
    ],
    contraindication: [
      'surcharge symbolique',
      'propositions trop complexes',
      'variation rapide des médiations',
    ],
    target_phases: ['attitude_interieure'],
    target_risk_levels: ['high', 'critical'],
    target_clinical_levels: ['very_fragile', 'fragile'],
    mediations: [
      'silence structuré',
      'présence contenante',
      'repères sensoriels simples',
      'micro-gestes',
    ],
    session_structure: [
      'ouverture très stable',
      'temps de présence sans exigence de production',
      'médiation minimale et répétable',
      'clôture sobre et prévisible',
    ],
    expected_effects: [
      'diminution de la surcharge',
      'renforcement de la sécurité du cadre',
      'stabilisation de la présence',
    ],
    precautions: [
      'ne pas interpréter prématurément',
      'éviter toute montée d’intensité',
      'limiter les choix',
    ],
    therapist_posture: [
      'présence calme',
      'rythme lent',
      'neutralité contenante',
    ],
    progression_markers: [
      'tolérance accrue à la continuité',
      'diminution des signes de tension',
      'engagement minimal mais stable',
    ],
    fallback_if_overload: [
      'retour au silence',
      'réduction immédiate de la stimulation',
      'raccourcissement de la séance',
    ],
  },
  {
    slug: 'protocole-accrochage-sensoriel',
    title: 'Protocole d’accrochage sensoriel minimal',
    short_title: 'Accrochage sensoriel',
    category: 'sensorial',
    clinical_intent:
      'Soutenir un engagement initial à partir d’appuis sensoriels peu coûteux.',
    indication: [
      'engagement faible',
      'difficulté d’entrée en séance',
      'contact fragile avec l’expérience',
    ],
    contraindication: [
      'intensité sonore trop forte',
      'multiplication des médiations',
    ],
    target_phases: ['attitude_interieure', 'creation'],
    target_risk_levels: ['low', 'moderate', 'high'],
    target_clinical_levels: ['very_fragile', 'fragile', 'intermediate'],
    mediations: [
      'son tenu',
      'respiration',
      'geste simple',
      'variation sensorielle minimale',
    ],
    session_structure: [
      'accueil avec médiation unique',
      'temps d’accordage sensoriel',
      'petite variation répétable',
      'retour au calme',
    ],
    expected_effects: [
      'entrée plus facile dans la séance',
      'augmentation de l’engagement minimal',
      'meilleure continuité attentionnelle',
    ],
    precautions: [
      'éviter la complexité',
      'laisser du temps',
      'ne pas sur-solliciter verbalement',
    ],
    therapist_posture: [
      'guidage léger',
      'attente active',
      'observation fine',
    ],
    progression_markers: [
      'engagement plus rapide',
      'présence plus stable',
      'tolérance à une légère variation',
    ],
    fallback_if_overload: [
      'retour à une seule médiation',
      'réduction du temps actif',
      'mise en pause contenante',
    ],
  },
  {
    slug: 'protocole-mobilisation-creative',
    title: 'Protocole de mobilisation créative sécurisée',
    short_title: 'Mobilisation créative',
    category: 'mobilisation',
    clinical_intent:
      'Relancer la créativité sans rompre la stabilité clinique acquise.',
    indication: [
      'stabilité intermédiaire ou bonne',
      'engagement présent',
      'capacité de variation sans débordement',
    ],
    contraindication: [
      'risque élevé',
      'cadre insuffisamment contenant',
    ],
    target_phases: ['creation', 'dialogue_oeuvre'],
    target_risk_levels: ['low', 'moderate'],
    target_clinical_levels: ['intermediate', 'good'],
    mediations: [
      'son + geste',
      'choix A/B',
      'variations maîtrisées',
      'petite improvisation contenue',
    ],
    session_structure: [
      'ancrage initial',
      'proposition de variation simple',
      'moment de reprise',
      'mise en forme légère',
    ],
    expected_effects: [
      'augmentation de la mobilité créative',
      'enrichissement de l’expérience',
      'consolidation de l’autonomie',
    ],
    precautions: [
      'ne pas augmenter trop vite la nouveauté',
      'maintenir des repères constants',
    ],
    therapist_posture: [
      'stimulation modérée',
      'soutien des nuances',
      'fonction de régulation',
    ],
    progression_markers: [
      'choix plus assumés',
      'variations tolérées',
      'plaisir discret mais stable',
    ],
    fallback_if_overload: [
      'retour à une forme connue',
      'réduction des options',
      'recentrement corporel',
    ],
  },
  {
    slug: 'protocole-dialogue-oeuvre',
    title: 'Protocole de dialogue avec l’œuvre',
    short_title: 'Dialogue avec l’œuvre',
    category: 'symbolization',
    clinical_intent:
      'Soutenir la transformation d’une production ou expérience en appui symbolique.',
    indication: [
      'présence stable',
      'capacité de reprise de l’expérience',
      'début de symbolisation',
    ],
    contraindication: [
      'surinterprétation',
      'sollicitations trop abstraites',
    ],
    target_phases: ['dialogue_oeuvre', 'partage'],
    target_risk_levels: ['low', 'moderate'],
    target_clinical_levels: ['intermediate', 'good', 'very_good'],
    mediations: [
      'retour sur trace',
      'geste rejoué',
      'écoute de production',
      'mise en lien légère',
    ],
    session_structure: [
      'reprise d’une trace ou forme',
      'temps de regard ou d’écoute',
      'mise en mots minimale',
      'conclusion intégrative',
    ],
    expected_effects: [
      'augmentation de la symbolisation secondaire',
      'meilleure appropriation subjective',
      'mise à distance contenue',
    ],
    precautions: [
      'ne pas forcer le sens',
      'respecter les latences',
      'éviter les lectures intrusives',
    ],
    therapist_posture: [
      'co-lecture prudente',
      'attention aux nuances',
      'interprétation retenue',
    ],
    progression_markers: [
      'retour spontané sur l’expérience',
      'liens plus cohérents',
      'meilleure continuité psychique',
    ],
    fallback_if_overload: [
      'revenir à la sensation',
      'stopper la mise en mots',
      'réancrer dans le cadre',
    ],
  },
  {
    slug: 'protocole-integration',
    title: 'Protocole d’intégration et d’intériorisation',
    short_title: 'Intégration',
    category: 'integration',
    clinical_intent:
      'Favoriser l’incorporation stable des acquis et leur disponibilité interne.',
    indication: [
      'phase de consolidation',
      'stabilité silencieuse',
      'autorégulation émergente',
    ],
    contraindication: [
      'volonté de performance',
      'accélération artificielle',
    ],
    target_phases: ['dialogue_oeuvre', 'partage'],
    target_risk_levels: ['low', 'moderate'],
    target_clinical_levels: ['good', 'very_good'],
    mediations: [
      'rituel stable',
      'silence habité',
      'geste incorporé',
      'présence minimale',
    ],
    session_structure: [
      'entrée connue',
      'temps d’expérience peu commenté',
      'reprise très légère',
      'clôture stable',
    ],
    expected_effects: [
      'intégration profonde',
      'stabilité auto-portée',
      'moindre dépendance au cadre externe',
    ],
    precautions: [
      'ne pas recomplexifier inutilement',
      'éviter la démonstration',
    ],
    therapist_posture: [
      'présence discrète',
      'retenue clinique',
      'soutien non intrusif',
    ],
    progression_markers: [
      'fonctionnement auto-porté',
      'présence plus dense',
      'régulation peu coûteuse',
    ],
    fallback_if_overload: [
      'réintroduire des repères simples',
      'raccourcir le temps expérientiel',
      'retour au cadre constant',
    ],
  },
  {
    slug: 'protocole-cloture-transferabilite',
    title: 'Protocole de clôture et transférabilité',
    short_title: 'Clôture et transférabilité',
    category: 'closure',
    clinical_intent:
      'Transformer la fin du suivi en continuité transférable hors cadre.',
    indication: [
      'fin de cycle',
      'acquis stabilisés',
      'autonomie mobilisable',
    ],
    contraindication: [
      'clôture précipitée',
      'surintellectualisation de la séparation',
    ],
    target_phases: ['partage'],
    target_risk_levels: ['low', 'moderate'],
    target_clinical_levels: ['good', 'very_good'],
    mediations: [
      'rituel de clôture',
      'reprise synthétique',
      'trace mémorisable',
      'repère transférable',
    ],
    session_structure: [
      'rappel du chemin parcouru',
      'mise en évidence des ressources acquises',
      'repérage de ce qui peut être emporté hors séance',
      'clôture stable et non dramatique',
    ],
    expected_effects: [
      'continuité hors dispositif',
      'appropriation des acquis',
      'fin vécue sans rupture majeure',
    ],
    precautions: [
      'éviter la brutalité',
      'ne pas produire une clôture trop chargée',
    ],
    therapist_posture: [
      'présence synthétique',
      'appui sur le déjà acquis',
      'non-dépendance',
    ],
    progression_markers: [
      'capacité à nommer les ressources',
      'stabilité jusqu’à la fin',
      'absence d’effondrement ou d’agrippement',
    ],
    fallback_if_overload: [
      'reprendre un repère connu',
      'différer la clôture si nécessaire',
      'revenir à une séance de consolidation',
    ],
  },
]

export function getProtocolBySlug(slug: string) {
  return ATPE_PROTOCOLS.find((protocol) => protocol.slug === slug) ?? null
}

export function getProtocolsByCategory(category: AtpeProtocolCategory) {
  return ATPE_PROTOCOLS.filter((protocol) => protocol.category === category)
}