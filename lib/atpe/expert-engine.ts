export type AtpePhaseDominant =
  | 'attitude_interieure'
  | 'creation'
  | 'dialogue_oeuvre'
  | 'partage'

export type AtpeAdvancedSessionInput = {
  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  patient_engagement_level: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
}

export type AtpeExpertResult = {
  phase_dominant: AtpePhaseDominant
  phase_scores: Record<AtpePhaseDominant, number>
  clinical_stability: 'fragile' | 'intermediate' | 'stable'
  vigilance_level: 'low' | 'moderate' | 'high'
  clinical_orientation: string
  next_step_recommendation: string
}

function n(value: number | null | undefined): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

function b(value: boolean | null | undefined): boolean {
  return value === true
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function computeAtpeExpertResult(
  input: AtpeAdvancedSessionInput
): AtpeExpertResult {
  const frame = n(input.frame_containment)
  const bodily = n(input.bodily_engagement)
  const decentering = n(input.decentering_level)
  const centering = n(input.centering_level)
  const externalization = n(input.externalization_level)
  const dialogue = n(input.work_dialogue_level)
  const sharing = n(input.sharing_level)
  const primary = n(input.primary_symbolization)
  const secondary = n(input.secondary_symbolization)
  const relational = n(input.relational_availability)
  const mobility = n(input.creative_mobility)
  const projective = n(input.projective_intensity)
  const therapistPresence = n(input.therapist_presence_quality)
  const patientEngagement = n(input.patient_engagement_level)

  const ctLoad =
    (b(input.therapist_feels_confusion) ? 8 : 0) +
    (b(input.therapist_feels_sudden_fatigue) ? 8 : 0) +
    (b(input.therapist_feels_pressure) ? 8 : 0) +
    (b(input.therapist_feels_irritation) ? 8 : 0) +
    (b(input.therapist_feels_void) ? 8 : 0) +
    (b(input.patient_repeats_without_integration) ? 10 : 0) +
    (b(input.group_feels_same_affect) ? 8 : 0) +
    (b(input.tension_spreads_quickly) ? 10 : 0)

  const attitudeInterieure = clamp(
    centering * 0.32 +
      frame * 0.22 +
      relational * 0.14 +
      therapistPresence * 0.1 +
      patientEngagement * 0.08 +
      Math.max(0, 100 - externalization) * 0.07 +
      Math.max(0, 100 - sharing) * 0.07
  )

  const creation = clamp(
    externalization * 0.22 +
      mobility * 0.22 +
      primary * 0.16 +
      bodily * 0.12 +
      decentering * 0.1 +
      patientEngagement * 0.08 +
      frame * 0.1
  )

  const dialogueOeuvre = clamp(
    dialogue * 0.3 +
      secondary * 0.2 +
      primary * 0.12 +
      externalization * 0.12 +
      centering * 0.1 +
      relational * 0.08 +
      frame * 0.08
  )

  const partage = clamp(
    sharing * 0.3 +
      relational * 0.22 +
      secondary * 0.16 +
      frame * 0.12 +
      centering * 0.08 +
      patientEngagement * 0.06 +
      therapistPresence * 0.06
  )

  const phase_scores: Record<AtpePhaseDominant, number> = {
    attitude_interieure: attitudeInterieure,
    creation,
    dialogue_oeuvre: dialogueOeuvre,
    partage,
  }

  const phase_dominant = (Object.entries(phase_scores).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? 'attitude_interieure') as AtpePhaseDominant

  const stabilityScore =
    frame * 0.28 +
    centering * 0.2 +
    relational * 0.15 +
    therapistPresence * 0.15 +
    patientEngagement * 0.12 +
    Math.max(0, 100 - projective) * 0.1 -
    ctLoad * 0.8

  const vigilanceScore =
    projective * 0.45 +
    ctLoad * 1.5 +
    Math.max(0, 60 - frame) * 0.3 +
    Math.max(0, 50 - centering) * 0.25

  const clinical_stability =
    stabilityScore >= 75
      ? 'stable'
      : stabilityScore >= 55
        ? 'intermediate'
        : 'fragile'

  const vigilance_level =
    vigilanceScore >= 60 ? 'high' : vigilanceScore >= 35 ? 'moderate' : 'low'

  const clinical_orientation = buildClinicalOrientation(
    phase_dominant,
    clinical_stability,
    vigilance_level
  )

  const next_step_recommendation = buildRecommendation(
    phase_dominant,
    clinical_stability,
    vigilance_level
  )

  return {
    phase_dominant,
    phase_scores,
    clinical_stability,
    vigilance_level,
    clinical_orientation,
    next_step_recommendation,
  }
}

function buildClinicalOrientation(
  phase: AtpePhaseDominant,
  stability: AtpeExpertResult['clinical_stability'],
  vigilance: AtpeExpertResult['vigilance_level']
): string {
  if (vigilance === 'high') {
    return 'Le travail doit prioritairement préserver la contenance, limiter les sollicitations et maintenir un cadre de sécurité élevé.'
  }

  if (phase === 'attitude_interieure') {
    return stability === 'stable'
      ? 'La séance s’organise autour d’une intériorité suffisamment régulée, avec une présence calme, contenue et peu coûteuse.'
      : 'La séance nécessite un soutien accru de présence, de rythme et de sécurité interne.'
  }

  if (phase === 'creation') {
    return 'Le processus privilégie l’émergence, la mise en forme et la transformation primaire à partir d’un engagement sensorimoteur encore soutenu par le cadre.'
  }

  if (phase === 'dialogue_oeuvre') {
    return 'Le processus permet une élaboration plus construite à partir de la production ou du geste, avec un travail de mise en lien et de symbolisation secondaire.'
  }

  return 'Le processus autorise un partage ou une circulation vers l’autre sans désorganisation notable.'
}

function buildRecommendation(
  phase: AtpePhaseDominant,
  stability: AtpeExpertResult['clinical_stability'],
  vigilance: AtpeExpertResult['vigilance_level']
): string {
  if (vigilance === 'high') {
    return 'Réduire la complexité, renforcer les repères, ralentir le rythme et différer toute relance interprétative.'
  }

  if (phase === 'attitude_interieure') {
    return stability === 'stable'
      ? 'Maintenir un cadre discret, stable, prévisible et peu intrusif.'
      : 'Renforcer la stabilité du cadre, soutenir l’autorégulation et préserver les temps de silence.'
  }

  if (phase === 'creation') {
    return 'Soutenir l’émergence sans surcharger, avec variations limitées et médiations simples.'
  }

  if (phase === 'dialogue_oeuvre') {
    return 'Favoriser le dialogue avec la production ou le geste sans imposer une interprétation prématurée.'
  }

  return 'Accompagner le partage avec prudence, en protégeant la continuité subjective et la qualité de présence.'
}