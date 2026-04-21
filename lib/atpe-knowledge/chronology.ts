export type ATPETimelineItem = {
  id: string
  period: string
  title: string
  description: string
}

export const atpeTimeline: ATPETimelineItem[] = [
  {
    id: 'pre-modern',
    period: 'Antiquité – Moyen Âge',
    title: 'Fonctions rituelles, symboliques et sacrées de l’art',
    description:
      "L’art n’est pas encore thérapeutique au sens clinique moderne, mais il joue déjà une fonction expressive et symbolique majeure.",
  },
  {
    id: 'psychiatry-19',
    period: 'XIXe siècle',
    title: 'Observation des productions en contexte psychiatrique',
    description:
      "Les productions de patients commencent à être observées comme révélatrices d’un fonctionnement interne.",
  },
  {
    id: 'psychoanalysis-20',
    period: 'Début XXe siècle',
    title: 'Apports psychanalytiques',
    description:
      "L’inconscient, la symbolisation et la sublimation transforment le regard sur la création.",
  },
  {
    id: 'formalization',
    period: 'Années 1940–1960',
    title: 'Naissance et structuration de l’art-thérapie',
    description:
      "Les médiations artistiques prennent une place plus affirmée dans les institutions de soin.",
  },
  {
    id: 'professionalization',
    period: 'Années 1970–2000',
    title: 'Diversification des courants',
    description:
      "Les approches psychanalytiques, humanistes et développementales se structurent davantage.",
  },
  {
    id: 'contemporary',
    period: 'Période contemporaine',
    title: 'Hybridation des approches',
    description:
      "L’art-thérapie dialogue avec le trauma, le corps, les neurosciences et les pratiques intégratives.",
  },
]