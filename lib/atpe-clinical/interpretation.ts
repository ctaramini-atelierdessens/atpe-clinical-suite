export type TracePrenomInput = {
  pressure: 'faible' | 'moyenne' | 'forte'
  continuity: 'fluide' | 'retenue' | 'hachée'
  spatialOrganization: 'organisee' | 'partielle' | 'chaotique'
  repetition: 'absente' | 'moderee' | 'marquee'
  hesitation: 'faible' | 'moderee' | 'forte'
  anchoring: 'bon' | 'fragile' | 'faible'
  readability: 'bonne' | 'moyenne' | 'difficile'
}

export type TracePrenomClinicalBridge = {
  engagementDelta: number
  tensionDelta: number
  vulnerabilityDelta: number
  symbolizationDelta: number
  clinicalText: string[]
}

export function interpretTracePrenom(
  input: TracePrenomInput
): TracePrenomClinicalBridge {
  let engagementDelta = 0
  let tensionDelta = 0
  let vulnerabilityDelta = 0
  let symbolizationDelta = 0
  const clinicalText: string[] = []

  if (input.pressure === 'forte') {
    tensionDelta += 15
    clinicalText.push("Pression marquée pouvant évoquer une tension interne ou un fort contrôle.")
  }

  if (input.pressure === 'faible') {
    vulnerabilityDelta += 10
    engagementDelta -= 5
    clinicalText.push("Pression faible pouvant renvoyer à une retenue ou une mobilisation limitée.")
  }

  if (input.continuity === 'fluide') {
    engagementDelta += 10
    clinicalText.push("Continuité fluide du trait suggérant une circulation plus souple de l’engagement.")
  }

  if (input.continuity === 'hachée') {
    vulnerabilityDelta += 10
    clinicalText.push("Trait haché suggérant une discontinuité ou une tension dans l’inscription du geste.")
  }

  if (input.spatialOrganization === 'chaotique') {
    vulnerabilityDelta += 20
    clinicalText.push("Organisation spatiale chaotique pouvant signaler une surcharge ou une fragilité d’organisation.")
  }

  if (input.repetition === 'marquee') {
    tensionDelta += 10
    vulnerabilityDelta += 10
    clinicalText.push("Répétition marquée évoquant une boucle, une fixation ou un besoin de maîtrise.")
  }

  if (input.hesitation === 'forte') {
    vulnerabilityDelta += 15
    clinicalText.push("Hésitation importante pouvant évoquer une auto-surveillance ou une insécurité.")
  }

  if (input.anchoring === 'bon') {
    engagementDelta += 8
    clinicalText.push("Bon ancrage suggérant une meilleure présence et une inscription plus assurée.")
  }

  if (input.readability === 'bonne') {
    symbolizationDelta += 5
    clinicalText.push("Lisibilité correcte compatible avec une mise en forme relativement accessible.")
  }

  return {
    engagementDelta,
    tensionDelta,
    vulnerabilityDelta,
    symbolizationDelta,
    clinicalText,
  }
}