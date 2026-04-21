import { NextRequest, NextResponse } from 'next/server'
import { resolveAtpeCase } from '@/features/atpe/services/resolve-atpe-case'
import {
  buildClinicalInsights,
  predictClinicalRisk,
  detectRelapse,
  generateAdvancedRecommendations,
} from '@/features/atpe/services/clinical-engine'
import { generateMdphSummary } from '@/features/atpe/services/mdph-generator'
import { createClinicalPdfBuffer } from '@/features/atpe/services/report-pdf'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('patientId')

  if (!id) {
    return NextResponse.json({ error: 'patientId manquant' }, { status: 400 })
  }

  const data = await resolveAtpeCase(id)

  const sessions = data.sessions ?? []
  const alerts = data.active_alerts ?? []

  const insights = buildClinicalInsights(sessions, alerts)
  const prediction = predictClinicalRisk(sessions, alerts)
  const relapse = detectRelapse(sessions)
  const recs = generateAdvancedRecommendations(sessions, alerts)
  const mdph = generateMdphSummary(data.patient, insights)

  const pdf = createClinicalPdfBuffer({
    clinicName: 'ATPE Clinical Suite',
    logoText: 'Plateforme clinique avancée',
    patientName: data.patient?.display_name ?? 'Patient',
    patientId: id,
    generatedAt: new Date().toLocaleString('fr-FR'),
    insights,
    prediction: prediction.message,
    relapse: relapse ? 'Rechute détectée' : 'Stable',
    recommendations: recs,
    mdphSummary: mdph,
    sessions,
  })

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=dossier-${id}.pdf`,
    },
  })
}