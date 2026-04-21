// lib/atpe/atelier-des-sens-matrix.ts

// ===============================
// TYPES
// ===============================

export type ATPEAxisId =
  | 'internal_process'
  | 'expressive_process'
  | 'relational_process'
  | 'pluri_expression'
  | 'institutional'
  | 'sensory_symbolic'

export type ATPELevel = 0 | 1 | 2 | 3 | 4

export interface ATPEIndicator {
  id: string
  label: string
  description: string
}

export interface ATPESignal {
  id: string
  label: string
}

export interface ATPETrajectory {
  from: ATPELevel
  to: ATPELevel
  description: string
}

export interface ATPEObjective {
  id: string
  label: string
  indicators: ATPEIndicator[]
  signals: ATPESignal[]
  trajectories: ATPETrajectory[]
}

export interface ATPEAxis {
  id: ATPEAxisId
  label: string
  description: string
  objectives: ATPEObjective[]
}

// ===============================
// MATRIX ATELIER DES SENS
// ===============================

export const ATPE_ATELIER_DES_SENS_MATRIX: ATPEAxis[] = [
  // ===============================
  // 1. PROCESSUS INTERNE
  // ===============================
  {
    id: 'internal_process',
    label: 'Processus interne',
    description: 'Présence à soi, régulation émotionnelle, désir et symbolisation',
    objectives: [
      {
        id: 'presence',
        label: 'Présence à soi',
        indicators: [
          {
            id: 'body_relax',
            label: 'Relâchement corporel',
            description: 'Diminution des tensions visibles (épaules, mâchoire)',
          },
          {
            id: 'gaze_anchor',
            label: 'Regard posé',
            description: 'Capacité à soutenir un regard ou une attention',
          },
          {
            id: 'breath',
            label: 'Respiration',
            description: 'Respiration plus ample et régulière',
          },
        ],
        signals: [
          { id: 'micro_pause', label: 'Micro-temps de pause' },
          { id: 'slowing', label: 'Ralentissement du geste' },
        ],
        trajectories: [
          {
            from: 0,
            to: 2,
            description: 'Passage de dispersion à une présence intermittente',
          },
          {
            from: 2,
            to: 4,
            description: 'Installation d’une présence stable et consciente',
          },
        ],
      },
      {
        id: 'emotion_regulation',
        label: 'Régulation émotionnelle',
        indicators: [
          {
            id: 'gesture_variation',
            label: 'Variation du geste',
            description: 'Capacité à moduler pression, rythme ou intensité',
          },
          {
            id: 'color_modulation',
            label: 'Variation des couleurs',
            description: 'Utilisation différenciée des teintes',
          },
        ],
        signals: [
          { id: 'less_impulsivity', label: 'Diminution de l’impulsivité' },
          { id: 'pause_before_action', label: 'Temps avant action' },
        ],
        trajectories: [
          {
            from: 1,
            to: 3,
            description: 'Passage de décharge à régulation partielle',
          },
          {
            from: 3,
            to: 4,
            description: 'Capacité à contenir et transformer',
          },
        ],
      },
    ],
  },

  // ===============================
  // 2. PROCESSUS EXPRESSIF
  // ===============================
  {
    id: 'expressive_process',
    label: 'Processus expressif',
    description: 'Capacité à produire, transformer et enrichir une expression',
    objectives: [
      {
        id: 'plastic_expression',
        label: 'Expression plastique',
        indicators: [
          {
            id: 'material_use',
            label: 'Utilisation des matériaux',
            description: 'Exploration variée des supports et médiums',
          },
          {
            id: 'composition',
            label: 'Organisation visuelle',
            description: 'Structuration de l’espace graphique',
          },
        ],
        signals: [
          { id: 'new_material', label: 'Essai de nouveaux matériaux' },
          { id: 'rework', label: 'Reprise d’une production' },
        ],
        trajectories: [
          {
            from: 0,
            to: 2,
            description: 'De la trace brute à une forme organisée',
          },
          {
            from: 2,
            to: 4,
            description: 'Construction d’un langage plastique personnel',
          },
        ],
      },
    ],
  },

  // ===============================
  // 3. PROCESSUS RELATIONNEL
  // ===============================
  {
    id: 'relational_process',
    label: 'Processus relationnel',
    description: 'Lien à l’autre, alliance thérapeutique et communication',
    objectives: [
      {
        id: 'therapeutic_alliance',
        label: 'Alliance thérapeutique',
        indicators: [
          {
            id: 'engagement',
            label: 'Engagement',
            description: 'Participation active aux séances',
          },
          {
            id: 'interaction',
            label: 'Interaction',
            description: 'Échanges avec le thérapeute',
          },
        ],
        signals: [
          { id: 'eye_contact', label: 'Contact visuel' },
          { id: 'shared_attention', label: 'Attention conjointe' },
        ],
        trajectories: [
          {
            from: 0,
            to: 2,
            description: 'De retrait à contact intermittent',
          },
          {
            from: 2,
            to: 4,
            description: 'Relation stable et coopérative',
          },
        ],
      },
    ],
  },

  // ===============================
  // 4. PLURI-EXPRESSION
  // ===============================
  {
    id: 'pluri_expression',
    label: 'Pluriexpressionnalité',
    description: 'Capacité à mobiliser plusieurs modes d’expression',
    objectives: [
      {
        id: 'intermodality',
        label: 'Fluidité intermodale',
        indicators: [
          {
            id: 'modality_switch',
            label: 'Changement de modalité',
            description: 'Passage entre dessin, parole, geste…',
          },
        ],
        signals: [
          { id: 'spontaneous_switch', label: 'Changement spontané' },
        ],
        trajectories: [
          {
            from: 1,
            to: 3,
            description: 'Capacité à passer d’un médium à un autre',
          },
        ],
      },
    ],
  },

  // ===============================
  // 5. INSTITUTIONNEL
  // ===============================
  {
    id: 'institutional',
    label: 'Indicateurs institutionnels',
    description: 'Participation, autonomie et insertion',
    objectives: [
      {
        id: 'participation',
        label: 'Participation',
        indicators: [
          {
            id: 'presence_sessions',
            label: 'Présence',
            description: 'Assiduité aux séances',
          },
        ],
        signals: [
          { id: 'initiative', label: 'Prise d’initiative' },
        ],
        trajectories: [
          {
            from: 0,
            to: 2,
            description: 'Participation irrégulière à régulière',
          },
        ],
      },
    ],
  },

  // ===============================
  // 6. SENSORIEL / SYMBOLIQUE
  // ===============================
  {
    id: 'sensory_symbolic',
    label: 'Sensoriel et symbolique',
    description: 'Relation à la matière, aux sensations et à la symbolisation',
    objectives: [
      {
        id: 'sensory_engagement',
        label: 'Engagement sensoriel',
        indicators: [
          {
            id: 'material_contact',
            label: 'Contact matière',
            description: 'Exploration tactile et sensorielle',
          },
        ],
        signals: [
          { id: 'sensory_curiosity', label: 'Curiosité sensorielle' },
        ],
        trajectories: [
          {
            from: 0,
            to: 3,
            description: 'De retrait sensoriel à exploration active',
          },
        ],
      },
    ],
  },
]

// ===============================
// HELPERS
// ===============================

export function getAxisById(id: ATPEAxisId): ATPEAxis | undefined {
  return ATPE_ATELIER_DES_SENS_MATRIX.find((a) => a.id === id)
}

export function getAllObjectives(): ATPEObjective[] {
  return ATPE_ATELIER_DES_SENS_MATRIX.flatMap((a) => a.objectives)
}

export function getIndicatorsByAxis(id: ATPEAxisId): ATPEIndicator[] {
  const axis = getAxisById(id)
  if (!axis) return []
  return axis.objectives.flatMap((o) => o.indicators)
}