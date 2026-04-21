import type { AtpeAdvancedRow } from '@/lib/patient-types'

export type SupervisionFlag = {
  level: 'info' | 'moderate' | 'high'
  code:
    | 'COUNTERTRANSFERENCE_LOAD'
    | 'PROJECTIVE_RECEPTION'
    | 'FRAME_VULNERABILITY'
    | 'GROUP_DEPOSIT'
    | 'INTERPRETATION_RISK'
    | 'SUPERVISION_PRIORITY'
  title: string
  description: string
}

export type SupervisionAnalysis = {
  therapistExperiences: string[]
  structuredReview: {
    perceivedAffects: string[]
    probableClinicalMeaning: string[]
    cautionPoints: string[]
    supervisionAxes: string[]
  }
  flags: SupervisionFlag[]
  suggestedNote: string
}

function pushIf(condition: boolean, target: string[], value: string) {
  if (condition) target.push(value)
}

export function analyzeSupervisionRow(row: AtpeAdvancedRow): SupervisionAnalysis {
  const therapistExperiences: string[] = []
  const perceivedAffects: string[] = []
  const probableClinicalMeaning: string[] = []
  const cautionPoints: string[] = []
  const supervisionAxes: string[] = []
  const flags: SupervisionFlag[] = []

  pushIf(row.therapist_feels_confusion, therapistExperiences, 'Confusion')
  pushIf(row.therapist_feels_sudden_fatigue, therapistExperiences, 'Fatigue soudaine')
  pushIf(row.therapist_feels_pressure, therapistExperiences, 'Pression')
  pushIf(row.therapist_feels_irritation, therapistExperiences, 'Irritation')
  pushIf(row.therapist_feels_void, therapistExperiences, 'Vide')

  pushIf(row.therapist_feels_confusion, perceivedAffects, 'Confusion contre-transférentielle')
  pushIf(row.therapist_feels_sudden_fatigue, perceivedAffects, 'Épuisement ou chute tonique soudaine')
  pushIf(row.therapist_feels_pressure, perceivedAffects, 'Pression interne ou poussée à agir')
  pushIf(row.therapist_feels_irritation, perceivedAffects, 'Irritation ou friction émotionnelle')
  pushIf(row.therapist_feels_void, perceivedAffects, 'Impression de vide ou de désaffectation')

  const therapistMarkerCount = [
    row.therapist_feels_confusion,
    row.therapist_feels_sudden_fatigue,
    row.therapist_feels_pressure,
    row.therapist_feels_irritation,
    row.therapist_feels_void,
  ].filter(Boolean).length

  if (therapistMarkerCount >= 2) {
    probableClinicalMeaning.push(
      'Présence possible d’une réception projective à élaborer en supervision.',
    )
    flags.push({
      level: 'moderate',
      code: 'COUNTERTRANSFERENCE_LOAD',
      title: 'Charge contre-transférentielle notable',
      description:
        'Plusieurs éprouvés thérapeutiques sont présents simultanément et méritent une reprise différée.',
    })
  }

  if (
    therapistMarkerCount >= 2 &&
    row.patient_repeats_without_integration
  ) {
    probableClinicalMeaning.push(
      'Hypothèse de projection non symbolisée avec répétition sans intégration.',
    )
    flags.push({
      level: 'high',
      code: 'PROJECTIVE_RECEPTION',
      title: 'Réception projective possible',
      description:
        'Les éprouvés du thérapeute associés à une répétition non intégrée suggèrent une charge projective à penser.',
    })
  }

  if ((row.frame_containment ?? 0) < 45) {
    cautionPoints.push(
      'Le cadre apparaît fragile. Éviter de sursolliciter la verbalisation ou l’interprétation.',
    )
    flags.push({
      level: 'moderate',
      code: 'FRAME_VULNERABILITY',
      title: 'Vulnérabilité du cadre',
      description:
        'Le niveau de contenance du cadre paraît insuffisant au regard de la séance.',
    })
  }

  if (row.group_feels_same_affect && row.tension_spreads_quickly) {
    probableClinicalMeaning.push(
      'Hypothèse prudente de dépôt projectif groupal ou de contagion affective rapide.',
    )
    supervisionAxes.push(
      'Explorer la fonction contenante réelle du groupe et la place du thérapeute dans la circulation affective.',
    )
    flags.push({
      level: 'moderate',
      code: 'GROUP_DEPOSIT',
      title: 'Dépôt projectif groupal possible',
      description:
        'Une diffusion rapide d’un même affect dans le groupe appelle une élaboration en supervision.',
    })
  }

  if (
    (row.projective_intensity ?? 0) >= 60 &&
    (row.frame_containment ?? 0) < 45
  ) {
    cautionPoints.push(
      'Différer les interprétations explicatives directes. Renforcer d’abord la contenance et la médiation.',
    )
    flags.push({
      level: 'high',
      code: 'INTERPRETATION_RISK',
      title: 'Risque interprétatif élevé',
      description:
        'La charge projective et la faiblesse du cadre rendent les interprétations prématurées potentiellement désorganisantes.',
    })
  }

  if (!supervisionAxes.length) {
    supervisionAxes.push(
      'Reprendre les éprouvés thérapeutiques séance après séance pour identifier leur stabilité, leur répétition ou leur transformation.',
    )
  }

  if (!cautionPoints.length) {
    cautionPoints.push(
      'Maintenir une lecture prudente, processuelle et non diagnostique des éprouvés thérapeutiques.',
    )
  }

  if (therapistMarkerCount >= 3 || flags.some((f) => f.level === 'high')) {
    flags.push({
      level: 'high',
      code: 'SUPERVISION_PRIORITY',
      title: 'À travailler prioritairement en supervision',
      description:
        'La séance présente plusieurs indices justifiant une reprise clinique prioritaire en supervision.',
    })
  }

  const suggestedNote = [
    'Reprise supervision :',
    therapistExperiences.length
      ? `Éprouvés thérapeutiques repérés : ${therapistExperiences.join(', ')}.`
      : 'Pas d’éprouvé thérapeutique majeur explicitement renseigné.',
    probableClinicalMeaning.length
      ? `Hypothèses prudentes : ${probableClinicalMeaning.join(' ')}`
      : 'Hypothèses prudentes : poursuivre l’observation longitudinale.',
    cautionPoints.length
      ? `Points de prudence : ${cautionPoints.join(' ')}`
      : '',
    supervisionAxes.length
      ? `Axes de supervision : ${supervisionAxes.join(' ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    therapistExperiences,
    structuredReview: {
      perceivedAffects,
      probableClinicalMeaning,
      cautionPoints,
      supervisionAxes,
    },
    flags,
    suggestedNote,
  }
}