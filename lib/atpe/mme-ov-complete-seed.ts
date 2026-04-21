export type AtpePhaseDominant =
  | 'attitude_interieure'
  | 'creation'
  | 'dialogue_oeuvre'
  | 'partage'

export type MmeOvPatientSeed = {
  id: string
  display_name: string
  code: string
  initials: string
  birth_year: number
  sex: string
  referral_source: string
  case_reference: string
  status: string
  first_contact_on: string
}

export type MmeOvExpressionAssessmentSeed = {
  indication: string
  resources: string[]
  vulnerabilities: string[]
  objective: string
  recommended_frame: string[]
  dominant_mediations: string[]
  clinical_focus: string
}

export type MmeOvAdvancedSessionSeed = {
  id: string
  patient_id: string
  session_number: number
  created_at: string
  updated_at: string
  format: 'individual' | 'group' | string
  medium_primary: string
  medium_secondary: string
  atpe_phase_dominant: AtpePhaseDominant
  frame_containment: number
  bodily_engagement: number
  decentering_level: number
  centering_level: number
  externalization_level: number
  work_dialogue_level: number
  sharing_level: number
  primary_symbolization: number
  secondary_symbolization: number
  relational_availability: number
  creative_mobility: number
  projective_intensity: number
  therapist_presence_quality: number
  patient_engagement_level: number
  therapist_feels_confusion: boolean
  therapist_feels_sudden_fatigue: boolean
  therapist_feels_pressure: boolean
  therapist_feels_irritation: boolean
  therapist_feels_void: boolean
  patient_repeats_without_integration: boolean
  group_feels_same_affect: boolean
  tension_spreads_quickly: boolean
  therapist_countertransference_notes: string
  clinical_hypotheses: string
  next_step_recommendation: string
  longitudinal_title: string
  longitudinal_phase:
    | 'installation'
    | 'mobilisation'
    | 'pivot'
    | 'consolidation'
  dominant_clinical_theme: string
  clinical_status: string
  therapeutic_focus: string
  key_effects: string[]
  clinical_reading: string
}

export type MmeOvIntermediateReviewSeed = {
  title: string
  summary: string
  main_evolutions: string[]
  team_implications: string[]
}

export type MmeOvFinalReviewSeed = {
  title: string
  summary: string
  major_transformations: string[]
  team_recommendations: string[]
  clinical_signature: string
}

export type MmeOvCompleteSeed = {
  patient: MmeOvPatientSeed
  expression_assessment: MmeOvExpressionAssessmentSeed
  advanced_sessions: MmeOvAdvancedSessionSeed[]
  intermediate_review: MmeOvIntermediateReviewSeed
  final_review: MmeOvFinalReviewSeed
  metadata: {
    case_slug: string
    total_sessions: number
    setting: string
    modality: string
    dominant_case_theme: string
    export_ready: boolean
  }
}

export const MME_OV_PATIENT_ID = '7f4c2d1e-6b7a-4b8d-9c3e-1f2a3b4c5d6e'

export const mmeOvCompleteSeed: MmeOvCompleteSeed = {
  patient: {
    id: MME_OV_PATIENT_ID,
    display_name: 'Mme Odette Vayssié',
    code: 'ODV01',
    initials: 'OV',
    birth_year: 1940,
    sex: 'F',
    referral_source: 'Seed clinique Odette Vayssié',
    case_reference: 'ATPE-ODV-001',
    status: 'active',
    first_contact_on: '2025-11-20',
  },

  expression_assessment: {
    indication:
      'Le bilan expressionnel conclut à la pertinence d’un accompagnement individuel en art-thérapie pluriexpressionnelle, à dominante musicale, dans un cadre stable, lent, sécurisant et peu intrusif.',
    resources: [
      'sensibilité auditive marquée',
      'mémoire implicite musicale mobilisable',
      'régulation possible par le souffle et l’écoute',
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
      'Soutenir l’émergence d’une expression non verbale et d’une présence plus incarnée à travers un dispositif articulant musique, geste et couleur.',
    recommended_frame: [
      'cadre individuel',
      'séances courtes et modulables',
      'environnement calme et prévisible',
      'faible surcharge sensorielle',
      'présence contenante, non intrusive',
    ],
    dominant_mediations: ['musique', 'geste', 'couleur'],
    clinical_focus:
      'Permettre le passage d’un appui externe contenant vers une autorégulation interne progressivement incorporée puis transférable hors cadre.',
  },

  advanced_sessions: [
    {
      id: '11111111-1111-4111-8111-111111111001',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 1,
      created_at: '2025-11-20T10:00:00.000Z',
      updated_at: '2025-11-20T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'accueil sonore',
      medium_secondary: 'présence contenante',
      atpe_phase_dominant: 'attitude_interieure',
      frame_containment: 72,
      bodily_engagement: 44,
      decentering_level: 28,
      centering_level: 38,
      externalization_level: 20,
      work_dialogue_level: 12,
      sharing_level: 8,
      primary_symbolization: 18,
      secondary_symbolization: 8,
      relational_availability: 42,
      creative_mobility: 14,
      projective_intensity: 18,
      therapist_presence_quality: 82,
      patient_engagement_level: 52,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: true,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Entrée prudente, besoin d’un cadre simple et très fiable.',
      clinical_hypotheses:
        'Début de sécurisation, engagement encore fragile.',
      next_step_recommendation:
        'Conserver une grande stabilité du cadre et limiter les sollicitations.',
      longitudinal_title:
        'Ouverture du processus thérapeutique : compatibilité sujet-cadre',
      longitudinal_phase: 'installation',
      dominant_clinical_theme: 'compatibilité initiale avec le cadre',
      clinical_status:
        'Entrée immédiate dans le dispositif, sans défense massive ni coût psychique visible.',
      therapeutic_focus:
        'Vérifier qu’une entrée en travail est possible sans surcharge ni contrainte.',
      key_effects: [
        'engagement spontané',
        'continuité simple',
        'première confiance implicite',
      ],
      clinical_reading:
        'La séance installe les conditions de possibilité du processus thérapeutique.',
    },
    {
      id: '11111111-1111-4111-8111-111111111002',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 2,
      created_at: '2025-11-24T10:00:00.000Z',
      updated_at: '2025-11-24T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'son tenu',
      medium_secondary: 'silence',
      atpe_phase_dominant: 'creation',
      frame_containment: 76,
      bodily_engagement: 48,
      decentering_level: 30,
      centering_level: 42,
      externalization_level: 22,
      work_dialogue_level: 14,
      sharing_level: 10,
      primary_symbolization: 20,
      secondary_symbolization: 10,
      relational_availability: 48,
      creative_mobility: 18,
      projective_intensity: 16,
      therapist_presence_quality: 84,
      patient_engagement_level: 58,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: true,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Disponibilité progressive, appui transférentiel calme.',
      clinical_hypotheses:
        'L’alliance thérapeutique commence à se constituer à partir d’une perception interne plus stable.',
      next_step_recommendation:
        'Poursuivre sans changement brutal et soutenir la continuité minimale.',
      longitudinal_title:
        'Émergence de l’alliance thérapeutique et début de subjectivation',
      longitudinal_phase: 'installation',
      dominant_clinical_theme: 'passage du faire à l’expérience vécue',
      clinical_status:
        'L’expérience commence à être perçue et reconnue comme expérience singulière.',
      therapeutic_focus:
        'Soutenir la continuité tout en laissant émerger une perception interne du vécu.',
      key_effects: [
        'début de verbalisation subjective',
        'alliance implicite plus nette',
        'régulation maintenue',
      ],
      clinical_reading:
        'Le sujet commence à reconnaître son vécu sans rupture de continuité.',
    },
    {
      id: '11111111-1111-4111-8111-111111111003',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 3,
      created_at: '2025-11-26T10:00:00.000Z',
      updated_at: '2025-11-26T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'son + geste',
      medium_secondary: 'variation',
      atpe_phase_dominant: 'dialogue_oeuvre',
      frame_containment: 80,
      bodily_engagement: 60,
      decentering_level: 40,
      centering_level: 60,
      externalization_level: 30,
      work_dialogue_level: 20,
      sharing_level: 14,
      primary_symbolization: 28,
      secondary_symbolization: 14,
      relational_availability: 60,
      creative_mobility: 24,
      projective_intensity: 12,
      therapist_presence_quality: 86,
      patient_engagement_level: 66,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Processus plus fluide, contre-transfert léger et disponible.',
      clinical_hypotheses:
        'Début d’une transformation discrète avec apparition d’un signe de soi.',
      next_step_recommendation:
        'Stabiliser sans intensifier, laisser se développer le geste propre.',
      longitudinal_title: 'Apparition d’un signe de soi',
      longitudinal_phase: 'installation',
      dominant_clinical_theme: 'inscription identitaire minimale',
      clinical_status:
        'Émergence d’un signe subjectif contenu, compatible avec la régulation.',
      therapeutic_focus:
        'Permettre une manifestation de soi sans surcharge émotionnelle.',
      key_effects: [
        'expression de soi minimale',
        'stabilité du cadre préservée',
        'continuité sans débordement',
      ],
      clinical_reading:
        'Le sujet peut apparaître dans l’expérience sans se désorganiser.',
    },
    {
      id: '11111111-1111-4111-8111-111111111004',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 4,
      created_at: '2025-11-28T10:00:00.000Z',
      updated_at: '2025-11-28T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'cadre constant',
      medium_secondary: 'repos intégré',
      atpe_phase_dominant: 'attitude_interieure',
      frame_containment: 78,
      bodily_engagement: 52,
      decentering_level: 38,
      centering_level: 58,
      externalization_level: 26,
      work_dialogue_level: 18,
      sharing_level: 12,
      primary_symbolization: 24,
      secondary_symbolization: 12,
      relational_availability: 58,
      creative_mobility: 22,
      projective_intensity: 12,
      therapist_presence_quality: 86,
      patient_engagement_level: 60,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'La limite de fatigabilité devient cliniquement lisible.',
      clinical_hypotheses:
        'La fatigabilité doit être intégrée comme organisateur du processus, et non comme échec.',
      next_step_recommendation:
        'Respecter les pauses et ne pas confondre ralentissement et désengagement.',
      longitudinal_title: 'La limite devient organisatrice',
      longitudinal_phase: 'installation',
      dominant_clinical_theme: 'apparition de la fatigabilité',
      clinical_status:
        'Le processus doit désormais intégrer une limite interne réelle.',
      therapeutic_focus:
        'Faire de la limite un organisateur plutôt qu’un obstacle.',
      key_effects: [
        'ralentissement de l’engagement',
        'pauses nécessaires',
        'maintien du lien malgré la discontinuité',
      ],
      clinical_reading:
        'La fatigue n’interrompt pas le travail, elle en devient un repère structurant.',
    },
    {
      id: '11111111-1111-4111-8111-111111111005',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 5,
      created_at: '2025-12-01T10:00:00.000Z',
      updated_at: '2025-12-01T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'silence + cadre',
      medium_secondary: 'tempo régulier',
      atpe_phase_dominant: 'attitude_interieure',
      frame_containment: 82,
      bodily_engagement: 60,
      decentering_level: 40,
      centering_level: 62,
      externalization_level: 28,
      work_dialogue_level: 22,
      sharing_level: 18,
      primary_symbolization: 30,
      secondary_symbolization: 16,
      relational_availability: 64,
      creative_mobility: 28,
      projective_intensity: 12,
      therapist_presence_quality: 88,
      patient_engagement_level: 70,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'La séance tient avec moins d’étayage actif.',
      clinical_hypotheses:
        'La contenance commence à être partiellement intériorisée.',
      next_step_recommendation:
        'Soutenir la continuité sans augmenter les exigences.',
      longitudinal_title: 'Intégration de la fatigabilité',
      longitudinal_phase: 'mobilisation',
      dominant_clinical_theme: 'rythmicité interne émergente',
      clinical_status:
        'L’alternance engagement-pause-reprise devient organisatrice.',
      therapeutic_focus:
        'Permettre un engagement rythmé compatible avec les capacités réelles.',
      key_effects: [
        'meilleure tolérance de la fatigue',
        'reprises plus cohérentes',
        'autorégulation temporelle naissante',
      ],
      clinical_reading:
        'La limite devient organisateur temporel du processus.',
    },
    {
      id: '11111111-1111-4111-8111-111111111006',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 6,
      created_at: '2025-12-01T11:00:00.000Z',
      updated_at: '2025-12-01T11:45:00.000Z',
      format: 'individual',
      medium_primary: 'son + silence',
      medium_secondary: 'cadre minimal',
      atpe_phase_dominant: 'creation',
      frame_containment: 84,
      bodily_engagement: 62,
      decentering_level: 44,
      centering_level: 68,
      externalization_level: 30,
      work_dialogue_level: 26,
      sharing_level: 20,
      primary_symbolization: 32,
      secondary_symbolization: 18,
      relational_availability: 68,
      creative_mobility: 30,
      projective_intensity: 10,
      therapist_presence_quality: 88,
      patient_engagement_level: 74,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Plus de fluidité, peu de coût contre-transférentiel.',
      clinical_hypotheses:
        'Capacité de création encore modeste mais désormais stable.',
      next_step_recommendation:
        'Autoriser de petites variations, sans rupture de cadre.',
      longitudinal_title: 'Reconstruction du fonctionnement',
      longitudinal_phase: 'mobilisation',
      dominant_clinical_theme: 'continuité retrouvée',
      clinical_status:
        'Le fonctionnement se reconstruit à partir de la limite intégrée.',
      therapeutic_focus:
        'Soutenir une continuité reconstruite, fiable et peu coûteuse.',
      key_effects: [
        'engagement plus continu',
        'diminution des pauses',
        'meilleure coordination générale',
      ],
      clinical_reading:
        'Nouvelle continuité plus ajustée, pas simple retour en arrière.',
    },
    {
      id: '11111111-1111-4111-8111-111111111007',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 7,
      created_at: '2025-12-02T10:00:00.000Z',
      updated_at: '2025-12-02T10:45:00.000Z',
      format: 'individual',
      medium_primary: 'silence régulateur',
      medium_secondary: 'présence calme',
      atpe_phase_dominant: 'creation',
      frame_containment: 84,
      bodily_engagement: 64,
      decentering_level: 46,
      centering_level: 72,
      externalization_level: 32,
      work_dialogue_level: 28,
      sharing_level: 22,
      primary_symbolization: 34,
      secondary_symbolization: 18,
      relational_availability: 72,
      creative_mobility: 30,
      projective_intensity: 10,
      therapist_presence_quality: 88,
      patient_engagement_level: 80,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Le peu devient cliniquement suffisant.',
      clinical_hypotheses:
        'Continuité minimale stable, sans intensité excessive.',
      next_step_recommendation:
        'Valider la sobriété et éviter la sur-sollicitation.',
      longitudinal_title: 'Continuité minimale stable',
      longitudinal_phase: 'mobilisation',
      dominant_clinical_theme: 'économie d’engagement',
      clinical_status:
        'Le peu devient cliniquement suffisant et stable.',
      therapeutic_focus:
        'Valider un engagement minimal mais durable sans intensification artificielle.',
      key_effects: [
        'stabilité à bas niveau d’intensité',
        'absence de fatigue marquée',
        'autonomie en consolidation',
      ],
      clinical_reading:
        'La présence peut tenir sans appui sur l’intensité ni la nouveauté.',
    },
    {
      id: '11111111-1111-4111-8111-111111111008',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 8,
      created_at: '2025-12-02T11:00:00.000Z',
      updated_at: '2025-12-02T11:50:00.000Z',
      format: 'individual',
      medium_primary: 'son + silence',
      medium_secondary: 'pauses régulatrices',
      atpe_phase_dominant: 'dialogue_oeuvre',
      frame_containment: 86,
      bodily_engagement: 66,
      decentering_level: 48,
      centering_level: 76,
      externalization_level: 34,
      work_dialogue_level: 30,
      sharing_level: 26,
      primary_symbolization: 36,
      secondary_symbolization: 20,
      relational_availability: 76,
      creative_mobility: 32,
      projective_intensity: 10,
      therapist_presence_quality: 90,
      patient_engagement_level: 82,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Stabilité haute sans événement spectaculaire.',
      clinical_hypotheses:
        'Acquis fiabilisés avant transformation qualitative.',
      next_step_recommendation:
        'Maintenir le cadre et éviter toute nouveauté perturbatrice.',
      longitudinal_title: 'Consolidation du fonctionnement',
      longitudinal_phase: 'mobilisation',
      dominant_clinical_theme: 'fiabilisation silencieuse',
      clinical_status:
        'Ce qui était possible devient fiable, reproductible et intégré.',
      therapeutic_focus:
        'Stabiliser les acquis avant toute transformation qualitative.',
      key_effects: [
        'fonctionnement stable',
        'régulation plus intégrée',
        'solidité accrue sans spectaculaire',
      ],
      clinical_reading:
        'Étape silencieuse mais stratégique avant le pivot du suivi.',
    },
    {
      id: '11111111-1111-4111-8111-111111111009',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 9,
      created_at: '2025-12-10T10:00:00.000Z',
      updated_at: '2025-12-10T10:50:00.000Z',
      format: 'individual',
      medium_primary: 'son + rituel',
      medium_secondary: 'violon intérieur',
      atpe_phase_dominant: 'creation',
      frame_containment: 90,
      bodily_engagement: 76,
      decentering_level: 58,
      centering_level: 84,
      externalization_level: 44,
      work_dialogue_level: 42,
      sharing_level: 34,
      primary_symbolization: 48,
      secondary_symbolization: 28,
      relational_availability: 82,
      creative_mobility: 40,
      projective_intensity: 12,
      therapist_presence_quality: 92,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Moment pivot, support interne émergent.',
      clinical_hypotheses:
        'Émergence du violon intérieur, autorégulation interne en cours.',
      next_step_recommendation:
        'Ne pas interpréter immédiatement, protéger l’intériorisation.',
      longitudinal_title: 'Émergence du violon intérieur',
      longitudinal_phase: 'pivot',
      dominant_clinical_theme: 'internalisation du support thérapeutique',
      clinical_status:
        'Le support cesse d’être seulement externe et commence à être porté de l’intérieur.',
      therapeutic_focus:
        'Protéger l’émergence d’une autorégulation interne sans la réexternaliser.',
      key_effects: [
        'geste du violon intérieur',
        'autorégulation plus autonome',
        'transformation qualitative du rapport à l’expérience',
      ],
      clinical_reading:
        'Moment charnière du suivi, articulant musique, corps et relation dans une continuité interne nouvelle.',
    },
    {
      id: '11111111-1111-4111-8111-111111111010',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 10,
      created_at: '2025-12-15T10:00:00.000Z',
      updated_at: '2025-12-15T10:50:00.000Z',
      format: 'individual',
      medium_primary: 'son + silence',
      medium_secondary: 'cadre discret',
      atpe_phase_dominant: 'attitude_interieure',
      frame_containment: 90,
      bodily_engagement: 78,
      decentering_level: 60,
      centering_level: 86,
      externalization_level: 42,
      work_dialogue_level: 40,
      sharing_level: 32,
      primary_symbolization: 50,
      secondary_symbolization: 30,
      relational_availability: 84,
      creative_mobility: 42,
      projective_intensity: 10,
      therapist_presence_quality: 92,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Autorégulation fiable, peu coûteuse.',
      clinical_hypotheses:
        'Stabilisation de l’autonomie sans dépendance au cadre.',
      next_step_recommendation:
        'Laisser le cadre en arrière-plan.',
      longitudinal_title: 'Stabilisation de l’autorégulation',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'autonomie stable',
      clinical_status:
        'L’autonomie émergente se maintient sans désancrage ni dépendance accrue au cadre.',
      therapeutic_focus:
        'Maintenir une autonomie fiable, calme et non démonstrative.',
      key_effects: [
        'continuité autonome',
        'régulation constante',
        'cadre devenu support discret',
      ],
      clinical_reading:
        'Le pivot de la séance 9 se confirme et se stabilise.',
    },
    {
      id: '11111111-1111-4111-8111-111111111011',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 11,
      created_at: '2025-12-17T10:00:00.000Z',
      updated_at: '2025-12-17T10:40:00.000Z',
      format: 'individual',
      medium_primary: 'choix A/B',
      medium_secondary: 'variations maîtrisées',
      atpe_phase_dominant: 'dialogue_oeuvre',
      frame_containment: 90,
      bodily_engagement: 80,
      decentering_level: 62,
      centering_level: 86,
      externalization_level: 46,
      work_dialogue_level: 42,
      sharing_level: 36,
      primary_symbolization: 52,
      secondary_symbolization: 32,
      relational_availability: 86,
      creative_mobility: 44,
      projective_intensity: 10,
      therapist_presence_quality: 92,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Complexité mieux contenue.',
      clinical_hypotheses:
        'Enrichissement du processus sans perte de régulation.',
      next_step_recommendation:
        'Soutenir les nuances sans surcharger.',
      longitudinal_title: 'Enrichissement du processus',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'complexification maîtrisée',
      clinical_status:
        'Le processus devient capable de nuance sans perte de stabilité.',
      therapeutic_focus:
        'Permettre un enrichissement de l’expérience sans surcharge.',
      key_effects: [
        'variations plus fines',
        'geste plus nuancé',
        'stabilité conservée',
      ],
      clinical_reading:
        'La régulation devient matrice de développement et non simple défense.',
    },
    {
      id: '11111111-1111-4111-8111-111111111012',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 12,
      created_at: '2025-12-22T10:00:00.000Z',
      updated_at: '2025-12-22T10:40:00.000Z',
      format: 'individual',
      medium_primary: 'silence + geste',
      medium_secondary: 'présence dense',
      atpe_phase_dominant: 'dialogue_oeuvre',
      frame_containment: 92,
      bodily_engagement: 82,
      decentering_level: 64,
      centering_level: 88,
      externalization_level: 48,
      work_dialogue_level: 44,
      sharing_level: 36,
      primary_symbolization: 54,
      secondary_symbolization: 34,
      relational_availability: 88,
      creative_mobility: 44,
      projective_intensity: 10,
      therapist_presence_quality: 94,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Présence plus fine, plus habitée.',
      clinical_hypotheses:
        'Approfondissement du processus et densification de l’expérience.',
      next_step_recommendation:
        'Respecter le rythme, ne pas complexifier davantage.',
      longitudinal_title: 'Approfondissement et densification',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'présence plus dense',
      clinical_status:
        'L’expérience se creuse davantage qu’elle ne s’élargit.',
      therapeutic_focus:
        'Soutenir une intensité fine, contenue et incarnée.',
      key_effects: [
        'présence densifiée',
        'geste plus précis',
        'régulation subtile mais mature',
      ],
      clinical_reading:
        'Le processus gagne en profondeur sans coût psychique supplémentaire.',
    },
    {
      id: '11111111-1111-4111-8111-111111111013',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 13,
      created_at: '2025-12-23T10:00:00.000Z',
      updated_at: '2025-12-23T10:40:00.000Z',
      format: 'individual',
      medium_primary: 'rituel stable',
      medium_secondary: 'fonctionnement incorporé',
      atpe_phase_dominant: 'partage',
      frame_containment: 92,
      bodily_engagement: 84,
      decentering_level: 66,
      centering_level: 90,
      externalization_level: 46,
      work_dialogue_level: 42,
      sharing_level: 34,
      primary_symbolization: 54,
      secondary_symbolization: 36,
      relational_availability: 88,
      creative_mobility: 42,
      projective_intensity: 10,
      therapist_presence_quality: 94,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Le fonctionnement devient auto-porté.',
      clinical_hypotheses:
        'Intégration profonde et silencieuse du processus.',
      next_step_recommendation:
        'Maintenir une présence minimale et non intrusive.',
      longitudinal_title: 'Intégration incorporée',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'fonctionnement auto-porté',
      clinical_status:
        'Le fonctionnement devient disponible sans effort visible.',
      therapeutic_focus:
        'Observer ce qui tient lorsque plus rien n’a besoin d’être produit.',
      key_effects: [
        'stabilité implicite',
        'économie psychique optimale',
        'autonomie silencieuse',
      ],
      clinical_reading:
        'Le fonctionnement n’a plus besoin d’être soutenu activement pour exister.',
    },
    {
      id: '11111111-1111-4111-8111-111111111014',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 14,
      created_at: '2026-01-19T10:00:00.000Z',
      updated_at: '2026-01-19T10:40:00.000Z',
      format: 'individual',
      medium_primary: 'cadre constant',
      medium_secondary: 'stabilité confirmée',
      atpe_phase_dominant: 'partage',
      frame_containment: 92,
      bodily_engagement: 84,
      decentering_level: 68,
      centering_level: 90,
      externalization_level: 48,
      work_dialogue_level: 44,
      sharing_level: 36,
      primary_symbolization: 56,
      secondary_symbolization: 38,
      relational_availability: 90,
      creative_mobility: 44,
      projective_intensity: 10,
      therapist_presence_quality: 94,
      patient_engagement_level: 90,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Appropriation plus consciente des acquis.',
      clinical_hypotheses:
        'Reconnaissance subjective du processus.',
      next_step_recommendation:
        'Accompagner sans réintroduire de dépendance.',
      longitudinal_title: 'Appropriation consciente',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'mise en lien consciente des acquis',
      clinical_status:
        'Ce qui était incorporé devient reconnaissable, nommable et volontairement mobilisable.',
      therapeutic_focus:
        'Permettre une réflexivité légère sans couper l’expérience incarnée.',
      key_effects: [
        'capacité à nommer certains éléments',
        'autorégulation consciente',
        'processus transmissible et mobilisable',
      ],
      clinical_reading:
        'Mme O. V. commence à s’appuyer volontairement sur son propre ajustement.',
    },
    {
      id: '11111111-1111-4111-8111-111111111015',
      patient_id: MME_OV_PATIENT_ID,
      session_number: 15,
      created_at: '2026-01-20T10:00:00.000Z',
      updated_at: '2026-01-20T10:40:00.000Z',
      format: 'individual',
      medium_primary: 'cadre constant',
      medium_secondary: 'synthèse finale',
      atpe_phase_dominant: 'partage',
      frame_containment: 94,
      bodily_engagement: 86,
      decentering_level: 70,
      centering_level: 92,
      externalization_level: 50,
      work_dialogue_level: 46,
      sharing_level: 40,
      primary_symbolization: 58,
      secondary_symbolization: 40,
      relational_availability: 90,
      creative_mobility: 46,
      projective_intensity: 10,
      therapist_presence_quality: 95,
      patient_engagement_level: 92,
      therapist_feels_confusion: false,
      therapist_feels_sudden_fatigue: false,
      therapist_feels_pressure: false,
      therapist_feels_irritation: false,
      therapist_feels_void: false,
      patient_repeats_without_integration: false,
      group_feels_same_affect: false,
      tension_spreads_quickly: false,
      therapist_countertransference_notes:
        'Clôture paisible, stabilité transférable.',
      clinical_hypotheses:
        'Intégration finale et ouverture vers une autonomie hors cadre.',
      next_step_recommendation:
        'Fin de cycle sécurisée, transmission synthétique à l’équipe.',
      longitudinal_title: 'Clôture et autonomie hors cadre',
      longitudinal_phase: 'consolidation',
      dominant_clinical_theme: 'transférabilité des acquis',
      clinical_status:
        'La fin est vécue sans rupture, avec stabilité émotionnelle et appropriation des ressources.',
      therapeutic_focus:
        'Transformer la séparation en continuité plutôt qu’en perte.',
      key_effects: [
        'présence stable jusqu’au bout',
        'absence d’effondrement ou d’agrippement',
        'autonomie transférable hors dispositif',
      ],
      clinical_reading:
        'Le travail ne s’arrête pas au cadre ; il devient continuité possible hors séance.',
    },
  ],

  intermediate_review: {
    title: 'Bilan intermédiaire',
    summary:
      'Les premières séances mettent en évidence une évolution progressive : meilleure continuité de présence, ouverture corporelle plus stable et émergence d’une expressivité non verbale contenue dans un cadre fiable.',
    main_evolutions: [
      'meilleure continuité de présence',
      'ouverture corporelle progressive',
      'stabilisation de l’attention musicale',
      'relation thérapeutique plus fluide et sécurisée',
      'meilleure tolérance de la fatigabilité',
    ],
    team_implications: [
      'favoriser un environnement calme et structuré',
      'privilégier les médiations musicales douces',
      'respecter le rythme lent et les temps de latence',
      'soutenir la présence sans sur-sollicitation',
    ],
  },

  final_review: {
    title: 'Bilan final',
    summary:
      'Le suivi met en évidence une transformation clinique progressive et profonde : passage d’un fonctionnement d’abord soutenu par le cadre à un fonctionnement progressivement auto-porté, puis mobilisable de manière plus volontaire et transférable hors du dispositif.',
    major_transformations: [
      'compatibilité stable avec le cadre thérapeutique',
      'émergence d’un vécu subjectif puis d’un signe de soi',
      'intégration de la fatigabilité comme organisateur',
      'reconstruction d’une continuité ajustée et moins coûteuse',
      'émergence puis stabilisation d’une autorégulation interne',
      'appropriation plus consciente des acquis',
      'transférabilité des ressources hors cadre',
    ],
    team_recommendations: [
      'maintenir un cadre calme, prévisible et peu stimulant',
      'privilégier les temps relationnels individualisés',
      'utiliser la musique comme appui de régulation',
      'respecter la fatigabilité et éviter la surcharge',
    ],
    clinical_signature:
      'Au fil des quinze séances, ce qui nécessitait d’abord un cadre externe est devenu progressivement une ressource interne, stable, incorporée puis plus consciemment mobilisable.',
  },

  metadata: {
    case_slug: 'mme-ov-complete-case',
    total_sessions: 15,
    setting: 'EHPAD',
    modality: 'ATPE individuelle',
    dominant_case_theme: 'Violon intérieur / autorégulation / continuité interne',
    export_ready: true,
  },
}

export function getMmeOvAdvancedSession(sessionNumber: number) {
  return (
    mmeOvCompleteSeed.advanced_sessions.find(
      (session) => session.session_number === sessionNumber
    ) ?? null
  )
}

export function getMmeOvLatestAdvancedSession() {
  return (
    mmeOvCompleteSeed.advanced_sessions[
      mmeOvCompleteSeed.advanced_sessions.length - 1
    ] ?? null
  )
}