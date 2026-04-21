export type ATPEConcept = {
  id: string
  label: string
  category:
    | 'psychanalyse'
    | 'jungien'
    | 'symbolique'
    | 'clinique'
    | 'historique'
    | 'protocole'
  definition: string
  clinicalMeaning: string
  atpeUse: string
  keywords: string[]
}

export const atpeConcepts: ATPEConcept[] = [
  {
    id: 'inconscient',
    label: 'Inconscient',
    category: 'psychanalyse',
    definition:
      "Ensemble de contenus psychiques non immédiatement accessibles à la conscience, mais actifs dans les représentations, les affects et les conduites.",
    clinicalMeaning:
      "Peut se manifester dans la production, le geste, les répétitions, les images et les associations verbales.",
    atpeUse:
      "Sert de base à la lecture indirecte des productions sans réduction diagnostique.",
    keywords: ['inconscient', 'production', 'image', 'geste', 'associations'],
  },
  {
    id: 'symbolisation',
    label: 'Symbolisation',
    category: 'symbolique',
    definition:
      "Processus par lequel une expérience interne peut prendre forme dans une image, une matière, un geste ou une parole.",
    clinicalMeaning:
      "Indique une capacité à transformer l’éprouvé en représentation partageable.",
    atpeUse:
      "Nourrit le score de symbolisation et les hypothèses de transformation psychique.",
    keywords: ['symbole', 'forme', 'image', 'représentation', 'transformation'],
  },
  {
    id: 'sublimation',
    label: 'Sublimation',
    category: 'psychanalyse',
    definition:
      "Transformation d’une tension pulsionnelle ou affective en élaboration créative, représentative ou culturellement recevable.",
    clinicalMeaning:
      "Permet d’observer comment une tension peut devenir trace, forme, composition ou narration.",
    atpeUse:
      "Sert à repérer les passages de décharge brute à mise en forme contenue.",
    keywords: ['sublimation', 'pulsion', 'création', 'transformation', 'forme'],
  },
  {
    id: 'archetype',
    label: 'Archétype',
    category: 'jungien',
    definition:
      "Organisation symbolique fondamentale susceptible d’apparaître dans les images, les récits et les formes.",
    clinicalMeaning:
      "Peut éclairer des motifs récurrents, oppositions et figures symboliques.",
    atpeUse:
      "Alimente les lectures symboliques prudentes dans les productions.",
    keywords: ['jung', 'archétype', 'motif', 'image', 'symbolique'],
  },
  {
    id: 'individuation',
    label: 'Individuation',
    category: 'jungien',
    definition:
      "Processus de différenciation et d’intégration psychique orienté vers une plus grande cohérence interne.",
    clinicalMeaning:
      "Peut être repéré dans les transformations progressives des formes, récits et positions subjectives.",
    atpeUse:
      "Sert de repère longitudinal dans le suivi thérapeutique.",
    keywords: ['jung', 'individuation', 'intégration', 'transformation'],
  },
]