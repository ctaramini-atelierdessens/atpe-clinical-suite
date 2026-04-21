import type { AtpeAdvancedRow } from '@/lib/patient-types'

export type GroupFlag = {
  level: 'info' | 'moderate' | 'high'
  code:
    | 'GROUP_COHESION_LOW'
    | 'GROUP_COHESION_HIGH'
    | 'GROUP_TENSION_HIGH'
    | 'AFFECT_DIFFUSION'
    | 'GROUP_CONTAINMENT_LOW'
    | 'GROUP_CONTAINMENT_ACTIVE'
    | 'PROJECTIVE_DEPOSIT_POSSIBLE'
    | 'DETOXIFIED_RETURN_POSSIBLE'
  title: string
  description: string
}

export type GroupAnalysis = {
  metrics: {
    cohesion: number
    tension: number
    affectiveDiffusion: number
    groupContainment: number
    transferDiffraction: number
    projectiveLoad: number
  }
  groupMode:
    | 'groupe fragile'
    | 'groupe instable'
    | 'groupe contenant'
    | 'groupe transformateur'
  probableProcesses: string[]
  detoxifiedReturn: {
    possible: boolean
    rationale: string
    recommendation: string
  }
  flags: GroupFlag[]
  narrative: string
  sessionSummary: string
}

function clamp(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`
}

export function analyzeGroupRow(row: AtpeAdvancedRow): GroupAnalysis {
  const cohesion = clamp(row.group_cohesion)
  const groupContainment = clamp(row.group_containment)
  const transferDiffraction = clamp(row.transfer_diffraction)
  const projectiveLoad = clamp(row.projective_intensity)

  const affectiveDiffusion = clamp(
    (row.group_feels_same_affect ? 50 : 0) +
      (row.tension_spreads_quickly ? 35 : 0) +
      Math.round(transferDiffraction * 0.15),
  )

  const tension = clamp(
    Math.round(
      projectiveLoad * 0.45 +
        affectiveDiffusion * 0.35 +
        Math.max(0, 60 - groupContainment) * 0.2,
    ),
  )

  let groupMode: GroupAnalysis['groupMode'] = 'groupe fragile'

  if (groupContainment >= 45 || cohesion >= 45) {
    groupMode = 'groupe instable'
  }
  if (groupContainment >= 60 && cohesion >= 55) {
    groupMode = 'groupe contenant'
  }
  if (
    groupContainment >= 70 &&
    cohesion >= 65 &&
    affectiveDiffusion <= 65 &&
    projectiveLoad <= 70
  ) {
    groupMode = 'groupe transformateur'
  }

  const probableProcesses: string[] = []
  const flags: GroupFlag[] = []

  if (cohesion < 40) {
    flags.push({
      level: 'moderate',
      code: 'GROUP_COHESION_LOW',
      title: 'Cohésion groupale faible',
      description:
        "Le groupe paraît peu unifié ou peu soutenant comme contenant psychique commun.",
    })
    probableProcesses.push(
      'Le groupe fonctionne davantage comme juxtaposition d’individus que comme enveloppe groupale opérante.',
    )
  } else if (cohesion >= 70) {
    flags.push({
      level: 'info',
      code: 'GROUP_COHESION_HIGH',
      title: 'Bonne cohésion groupale',
      description:
        'Le groupe semble pouvoir soutenir les mouvements psychiques et les liaisons intersubjectives.',
    })
  }

  if (tension >= 70) {
    flags.push({
      level: 'high',
      code: 'GROUP_TENSION_HIGH',
      title: 'Tension groupale élevée',
      description:
        'La tension groupale est haute et peut exposer à une contagion affective ou à un débordement.',
    })
    probableProcesses.push(
      'Le groupe semble traversé par une charge émotionnelle importante nécessitant davantage de contenance et de structure.',
    )
  }

  if (affectiveDiffusion >= 60) {
    flags.push({
      level: 'moderate',
      code: 'AFFECT_DIFFUSION',
      title: 'Diffusion affective notable',
      description:
        'Un affect circule rapidement entre les membres ou se partage en chaîne groupale.',
    })
    probableProcesses.push(
      'Diffusion affective groupale compatible avec une circulation transférentielle élargie ou un dépôt psychique partagé.',
    )
  }

  if (groupContainment < 45) {
    flags.push({
      level: 'high',
      code: 'GROUP_CONTAINMENT_LOW',
      title: 'Contenance groupale insuffisante',
      description:
        'Le groupe ne paraît pas suffisamment opérant comme fonction contenante au regard de la séance.',
    })
    probableProcesses.push(
      'La fonction contenante groupale semble fragile, ce qui peut limiter la transformation psychique collective.',
    )
  } else if (groupContainment >= 65) {
    flags.push({
      level: 'info',
      code: 'GROUP_CONTAINMENT_ACTIVE',
      title: 'Contenance groupale active',
      description:
        'Le groupe paraît capable de recevoir, métaboliser partiellement et redistribuer les mouvements affectifs.',
    })
    probableProcesses.push(
      'Le groupe peut faire office de contenant, d’appui de figuration et de transformation.',
    )
  }

  if (
    projectiveLoad >= 55 &&
    affectiveDiffusion >= 55 &&
    (row.group_feels_same_affect || row.tension_spreads_quickly)
  ) {
    flags.push({
      level: 'high',
      code: 'PROJECTIVE_DEPOSIT_POSSIBLE',
      title: 'Dépôt projectif groupal possible',
      description:
        'La combinaison de charge projective, diffusion affective et partage d’affects évoque une hypothèse prudente de dépôt groupal.',
    })
    probableProcesses.push(
      'Présence possible d’un dépôt projectif groupal à penser en termes de circulation, réception et transformation.',
    )
  }

  const detoxifiedReturnPossible =
    groupContainment >= 60 && cohesion >= 55 && tension <= 70

  const detoxifiedReturn = {
    possible: detoxifiedReturnPossible,
    rationale: detoxifiedReturnPossible
      ? 'Le groupe paraît suffisamment contenant pour transformer partiellement les dépôts psychiques en matériau plus assimilable.'
      : 'La restitution groupale transformante reste limitée car la cohésion, la contenance ou le niveau de tension ne sont pas encore assez favorables.',
    recommendation: detoxifiedReturnPossible
      ? 'Favoriser une restitution groupale courte, cadrée, symbolisante et non intrusive.'
      : 'Renforcer le cadre, structurer les temps de parole et privilégier d’abord la contenance avant toute restitution élaborative.',
  }

  if (detoxifiedReturnPossible) {
    flags.push({
      level: 'info',
      code: 'DETOXIFIED_RETURN_POSSIBLE',
      title: 'Restitution groupale détoxifiée envisageable',
      description:
        'Le groupe paraît en mesure de soutenir une reprise symbolisante et partiellement transformante.',
    })
  }

  if (!probableProcesses.length) {
    probableProcesses.push(
      'Le fonctionnement groupal actuel ne montre pas d’indice majeur de transformation ou de rupture. Poursuivre l’observation.',
    )
  }

  const narrative = [
    `Le groupe est actuellement lu comme ${groupMode}.`,
    `Cohésion ${cohesion}/100, tension ${tension}/100, diffusion affective ${affectiveDiffusion}/100, contenance groupale ${groupContainment}/100.`,
    detoxifiedReturn.rationale,
  ].join(' ')

  const sessionSummary = [
    `Synthèse de séance de groupe : le niveau de cohésion est coté à ${cohesion}/100 et la contenance groupale à ${groupContainment}/100.`,
    tension >= 70
      ? 'La tension groupale est élevée et justifie un maintien ferme du cadre.'
      : 'La tension groupale reste dans une zone cliniquement exploitable.',
    affectiveDiffusion >= 60
      ? 'Une diffusion affective groupale notable est repérée.'
      : 'La diffusion affective reste contenue.',
    detoxifiedReturnPossible
      ? 'Une restitution groupale détoxifiée paraît possible sous forme courte et cadrée.'
      : 'La restitution groupale transformante doit être différée au profit de la contenance.',
  ].join(' ')

  return {
    metrics: {
      cohesion,
      tension,
      affectiveDiffusion,
      groupContainment,
      transferDiffraction,
      projectiveLoad,
    },
    groupMode,
    probableProcesses,
    detoxifiedReturn,
    flags,
    narrative,
    sessionSummary,
  }
}

export function compareGroupRows(current: AtpeAdvancedRow, previous: AtpeAdvancedRow | null) {
  const currentAnalysis = analyzeGroupRow(current)
  const previousAnalysis = previous ? analyzeGroupRow(previous) : null

  const deltas = previousAnalysis
    ? {
        cohesion: currentAnalysis.metrics.cohesion - previousAnalysis.metrics.cohesion,
        tension: currentAnalysis.metrics.tension - previousAnalysis.metrics.tension,
        affectiveDiffusion:
          currentAnalysis.metrics.affectiveDiffusion -
          previousAnalysis.metrics.affectiveDiffusion,
        groupContainment:
          currentAnalysis.metrics.groupContainment -
          previousAnalysis.metrics.groupContainment,
        projectiveLoad:
          currentAnalysis.metrics.projectiveLoad - previousAnalysis.metrics.projectiveLoad,
      }
    : null

  const comparisonNarrative = previousAnalysis
    ? `Comparaison de groupe : cohésion ${signed(deltas!.cohesion)}, tension ${signed(deltas!.tension)}, diffusion affective ${signed(deltas!.affectiveDiffusion)}, contenance groupale ${signed(deltas!.groupContainment)}, charge projective ${signed(deltas!.projectiveLoad)}.`
    : 'Aucune séance groupale antérieure comparable disponible.'

  return {
    currentAnalysis,
    previousAnalysis,
    deltas,
    comparisonNarrative,
  }
}