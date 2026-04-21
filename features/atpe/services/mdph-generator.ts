type PatientLike = {
  display_name?: string | null
}

type InsightsLike = {
  score?: number
  trend?: string
  risk?: string
  label?: string
}

export function generateMdphSummary(
  patient: PatientLike,
  insights: InsightsLike
) {
  const patientName =
    typeof patient?.display_name === 'string' && patient.display_name.trim()
      ? patient.display_name.trim()
      : 'Le patient'

  const score = typeof insights?.score === 'number' ? insights.score : '—'
  const trend = insights?.trend ?? 'indéterminée'
  const risk = insights?.risk ?? 'non renseigné'
  const label = insights?.label ?? 'situation clinique à préciser'

  return `Synthèse clinique :

${patientName} présente une évolution actuellement caractérisée par ${trend}.

Le score clinique global observé est de ${score}/100, avec un niveau de risque évalué à ${risk}.

L’analyse clinique met en évidence : ${label}.

Cette situation justifie la poursuite de l’accompagnement thérapeutique, avec ajustement du cadre et des modalités si nécessaire, selon l’évolution clinique et fonctionnelle observée.`
}