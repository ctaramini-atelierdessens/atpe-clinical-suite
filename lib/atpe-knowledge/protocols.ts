export type ATPEProtocolField =
  | 'pressure'
  | 'continuity'
  | 'spatialOrganization'
  | 'repetition'
  | 'hesitation'
  | 'anchoring'
  | 'readability'

export type ATPEProtocol = {
  id: string
  name: string
  objective: string
  observedFields: ATPEProtocolField[]
  interpretationGuide: {
    field: ATPEProtocolField
    value: string
    hypothesis: string
  }[]
}

export const atpeProtocols: ATPEProtocol[] = [
  {
    id: 'trace-prenom',
    name: 'Trace-Prénom',
    objective:
      "Explorer l’engagement, la présence de soi, l’inscription identitaire, la dynamique du trait et certains modes d’organisation.",
    observedFields: [
      'pressure',
      'continuity',
      'spatialOrganization',
      'repetition',
      'hesitation',
      'anchoring',
      'readability',
    ],
    interpretationGuide: [
      {
        field: 'pressure',
        value: 'forte',
        hypothesis:
          "Peut évoquer une tension interne, un contrôle important ou une intensité d’investissement.",
      },
      {
        field: 'pressure',
        value: 'faible',
        hypothesis:
          "Peut évoquer une retenue, une inhibition, une faible mobilisation ou une prudence marquée.",
      },
      {
        field: 'repetition',
        value: 'marquee',
        hypothesis:
          "Peut signaler une boucle, une fixation, un besoin de maîtrise ou une difficulté de relance.",
      },
      {
        field: 'spatialOrganization',
        value: 'chaotique',
        hypothesis:
          "Peut renvoyer à une fragilité d’organisation ou à une surcharge interne.",
      },
      {
        field: 'continuity',
        value: 'fluide',
        hypothesis:
          "Peut témoigner d’une circulation plus souple du geste et d’une continuité d’engagement.",
      },
      {
        field: 'hesitation',
        value: 'forte',
        hypothesis:
          "Peut évoquer une insécurité, une auto-surveillance ou une difficulté à s’autoriser.",
      },
    ],
  },
]