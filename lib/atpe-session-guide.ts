import { AtpeProtocol } from './atpe-protocol-engine'

export type SessionPhase = 'opening' | 'deployment' | 'closure'

export type SessionGuideStep = {
  phase: SessionPhase
  title: string
  objective: string
  instructions: string[]
  observationTargets: string[]
  adjustmentIfNeeded: string[]
  successMarkers: string[]
}

export type SessionGuide = {
  protocolTitle: string
  protocolIntent: string
  estimatedDurationMinutes: number
  steps: SessionGuideStep[]
}

function getOpeningObjective(protocol: AtpeProtocol): string {
  if (protocol.id === 'protocol_inhibition_emotionnelle') {
    return 'Sécuriser l’entrée en séance et favoriser une première présence sans pression.'
  }

  if (protocol.id === 'protocol_dissociation') {
    return 'Installer l’ancrage corporel et une co-présence thérapeutique non intrusive.'
  }

  if (protocol.id === 'protocol_debordement') {
    return 'Réduire la désorganisation initiale et poser un cadre de contenance clair.'
  }

  return 'Créer les conditions de sécurité, de disponibilité et d’entrée dans le travail thérapeutique.'
}

function getDeploymentObjective(protocol: AtpeProtocol): string {
  if (protocol.id === 'protocol_inhibition_emotionnelle') {
    return 'Soutenir la réouverture sensorielle, la nuance émotionnelle et l’engagement progressif.'
  }

  if (protocol.id === 'protocol_dissociation') {
    return 'Renforcer la continuité corps-support-relation et soutenir le sentiment de présence.'
  }

  if (protocol.id === 'protocol_debordement') {
    return 'Permettre une expression suffisamment intense mais contenue, puis sa transformation.'
  }

  return 'Déployer le processus thérapeutique par l’exploration, la transformation et la structuration.'
}

function getClosureObjective(protocol: AtpeProtocol): string {
  if (protocol.id === 'protocol_inhibition_emotionnelle') {
    return 'Consolider une expérience de présence et repérer une nuance ou un déplacement.'
  }

  if (protocol.id === 'protocol_dissociation') {
    return 'Rassembler l’expérience corporelle et stabiliser la fin sans rupture brusque.'
  }

  if (protocol.id === 'protocol_debordement') {
    return 'Ramener l’intensité à un niveau plus supportable et sécuriser la séparation.'
  }

  return 'Intégrer la séance, soutenir la mise en sens et stabiliser la fin.'
}

function getDefaultOpeningAdjustments(): string[] {
  return [
    'Réduire le nombre de choix',
    'Renforcer le rituel d’entrée',
    'Ralentir le tempo de la séance',
    'Passer par une consigne plus concrète',
  ]
}

function getDefaultDeploymentAdjustments(): string[] {
  return [
    'Fractionner le temps de travail',
    'Revenir à un médium plus contenant',
    'Ajouter une structure spatiale',
    'Passer d’un canal saturé à un autre médium',
  ]
}

function getDefaultClosureAdjustments(): string[] {
  return [
    'Allonger le temps de clôture',
    'Soutenir la mise en mots par une question très simple',
    'Revenir à un appui respiratoire ou sensoriel',
    'Stabiliser avec un rituel de fin constant',
  ]
}

export function buildSessionGuide(protocol: AtpeProtocol): SessionGuide {
  const openingStep: SessionGuideStep = {
    phase: 'opening',
    title: 'Ouverture de séance',
    objective: getOpeningObjective(protocol),
    instructions: protocol.structure.opening,
    observationTargets: [
      'Qualité de l’entrée dans la séance',
      'Posture',
      'Souffle',
      'Regard',
      'Disponibilité au cadre',
      ...protocol.observationTargets.slice(0, 2),
    ],
    adjustmentIfNeeded: getDefaultOpeningAdjustments(),
    successMarkers: [
      'Installation plus fluide',
      'Présence corporelle plus lisible',
      'Moins de tension ou de dispersion initiale',
      'Acceptation d’un premier contact au support',
    ],
  }

  const deploymentStep: SessionGuideStep = {
    phase: 'deployment',
    title: 'Déploiement thérapeutique',
    objective: getDeploymentObjective(protocol),
    instructions: protocol.structure.deployment,
    observationTargets: [
      'Qualité du geste',
      'Tolérance à la matière et à la couleur',
      'Continuité de l’engagement',
      'Variations émotionnelles',
      'Rapport à la transformation',
      ...protocol.observationTargets.slice(2, 5),
    ],
    adjustmentIfNeeded: getDefaultDeploymentAdjustments(),
    successMarkers: [
      'Capacité à poursuivre l’activité',
      'Nuance ou modulation plus présentes',
      'Transformation d’une trace ou d’un état',
      'Stabilité relationnelle suffisante pendant le travail',
    ],
  }

  const closureStep: SessionGuideStep = {
    phase: 'closure',
    title: 'Clôture et intégration',
    objective: getClosureObjective(protocol),
    instructions: protocol.structure.closure,
    observationTargets: [
      'Capacité à terminer',
      'Apaisement final',
      'Tolérance à la séparation',
      'Observation ou verbalisation de l’expérience',
      'Stabilité post-séance immédiate',
    ],
    adjustmentIfNeeded: getDefaultClosureAdjustments(),
    successMarkers: [
      'Clôture sans rupture brutale',
      'Repérage d’un élément significatif',
      'Diminution de l’activation ou meilleure cohérence finale',
      'Sortie de séance plus stable',
    ],
  }

  return {
    protocolTitle: protocol.title,
    protocolIntent: protocol.clinicalIntent,
    estimatedDurationMinutes: protocol.recommendedDurationMinutes,
    steps: [openingStep, deploymentStep, closureStep],
  }
}