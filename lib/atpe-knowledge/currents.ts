export type ATPECurrent = {
  id: string
  name: string
  period: string
  summary: string
  keyIdeas: string[]
  clinicalTranslation: string
}

export const atpeCurrents: ATPECurrent[] = [
  {
    id: 'psychanalytique',
    name: 'Courant psychanalytique',
    period: 'XXe siècle',
    summary:
      "Met au premier plan l’inconscient, la symbolisation, les conflits internes, la sublimation et les effets transférentiels.",
    keyIdeas: [
      'inconscient',
      'symbole',
      'sublimation',
      'transfert',
      'élaboration',
    ],
    clinicalTranslation:
      "Lecture des productions comme voies d’accès indirectes au fonctionnement psychique.",
  },
  {
    id: 'jungien',
    name: 'Approche jungienne',
    period: 'XXe siècle',
    summary:
      "Insiste sur les images, les archétypes, les oppositions psychiques et le processus d’individuation.",
    keyIdeas: [
      'archétypes',
      'inconscient collectif',
      'image symbolique',
      'individuation',
    ],
    clinicalTranslation:
      "Permet une lecture symbolique des motifs, formes et transformations.",
  },
  {
    id: 'humaniste',
    name: 'Courant humaniste',
    period: 'XXe siècle',
    summary:
      "Met l’accent sur le potentiel créateur, l’expérience vécue et la croissance de la personne.",
    keyIdeas: ['créativité', 'expérience', 'croissance', 'subjectivité'],
    clinicalTranslation:
      "Soutient la posture thérapeutique non jugeante et le développement des ressources.",
  },
  {
    id: 'developpemental',
    name: 'Courant développemental',
    period: 'XXe-XXIe siècle',
    summary:
      "S’intéresse aux étapes du développement et à la maturation des capacités expressives et relationnelles.",
    keyIdeas: ['développement', 'maturation', 'stades', 'évolution'],
    clinicalTranslation:
      "Utile pour situer les acquisitions, fragilités et progressions.",
  },
]