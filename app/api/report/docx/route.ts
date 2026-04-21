import { NextRequest, NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from 'docx'

import { resolveAtpeCase } from '@/features/atpe/services/resolve-atpe-case'
import {
  buildClinicalInsights,
  predictClinicalRisk,
  detectRelapse,
  generateAdvancedRecommendations,
} from '@/features/atpe/services/clinical-engine'
import { generateMdphSummary } from '@/features/atpe/services/mdph-generator'

function safeText(value: unknown, fallback = '—') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function formatDateTime(date: Date) {
  return date.toLocaleString('fr-FR')
}

function bulletParagraph(text: string) {
  return new Paragraph({
    text,
    bullet: {
      level: 0,
    },
    spacing: {
      after: 120,
    },
  })
}

function sectionTitle(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: {
      before: 240,
      after: 120,
    },
  })
}

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.json(
      { error: 'patientId manquant' },
      { status: 400 }
    )
  }

  try {
    const data = await resolveAtpeCase(patientId)

    const patient = data.patient ?? {}
    const sessions = Array.isArray(data.sessions) ? data.sessions : []
    const alerts = Array.isArray(data.active_alerts) ? data.active_alerts : []

    const insights = buildClinicalInsights(sessions, alerts)
    const prediction = predictClinicalRisk(sessions, alerts)
    const relapse = detectRelapse(sessions)
    const recommendations = generateAdvancedRecommendations(sessions, alerts)
    const mdphSummary = generateMdphSummary(patient, insights)

    const recentSessions = sessions.slice(-10)

    const doc = new Document({
      creator: 'ATPE Clinical Suite',
      title: `Rapport clinique - ${safeText((patient as any).display_name, 'Patient')}`,
      description: 'Rapport clinique ATPE exporté en DOCX',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'RAPPORT CLINIQUE ATPE',
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              spacing: {
                after: 240,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Patient : ${safeText((patient as any).display_name, 'Patient')}`,
                  bold: true,
                }),
              ],
              spacing: { after: 120 },
            }),

            new Paragraph({
              text: `Identifiant : ${patientId}`,
              spacing: { after: 120 },
            }),

            new Paragraph({
              text: `Date de génération : ${formatDateTime(new Date())}`,
              spacing: { after: 240 },
            }),

            sectionTitle('Synthèse clinique'),

            new Paragraph({
              text: `Score clinique : ${String(insights.score)}`,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Tendance : ${safeText(insights.trend)}`,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Risque : ${safeText(insights.risk)}`,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Lecture clinique : ${safeText(insights.label)}`,
              spacing: { after: 120 },
            }),

            sectionTitle('Prédiction clinique'),

            new Paragraph({
              text: `Projection : ${safeText(prediction.message)}`,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Rechute : ${relapse ? 'Rechute détectée' : 'Pas de rechute détectée'}`,
              spacing: { after: 120 },
            }),

            sectionTitle('Recommandations thérapeutiques'),

            ...(recommendations.length > 0
              ? recommendations.map((rec) => bulletParagraph(rec))
              : [new Paragraph({ text: 'Aucune recommandation.' })]),

            sectionTitle('Synthèse automatique MDPH'),

            ...mdphSummary
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map(
                (line) =>
                  new Paragraph({
                    text: line,
                    spacing: { after: 120 },
                  })
              ),

            sectionTitle('Historique des séances'),

            ...(recentSessions.length > 0
              ? recentSessions.map((session: any, index: number) => {
                  const engagement =
                    typeof session?.patient_engagement_level === 'number'
                      ? session.patient_engagement_level
                      : '—'

                  const primary =
                    typeof session?.primary_symbolization === 'number'
                      ? session.primary_symbolization
                      : '—'

                  const secondary =
                    typeof session?.secondary_symbolization === 'number'
                      ? session.secondary_symbolization
                      : '—'

                  const containment =
                    typeof session?.frame_containment === 'number'
                      ? session.frame_containment
                      : '—'

                  return new Paragraph({
                    text:
                      `Séance ${session?.session_number ?? index + 1} — ` +
                      `Engagement : ${engagement} | ` +
                      `Symbolisation I : ${primary} | ` +
                      `Symbolisation II : ${secondary} | ` +
                      `Containment : ${containment}`,
                    spacing: { after: 120 },
                  })
                })
              : [new Paragraph({ text: 'Aucune séance disponible.' })]),

            sectionTitle('Signature'),

            new Paragraph({
              text: 'Thérapeute : ______________________________',
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: 'Signature : _______________________________',
              spacing: { after: 120 },
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="rapport-clinique-${patientId}.docx"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Erreur génération DOCX clinique :', error)

    return NextResponse.json(
      { error: 'Impossible de générer le DOCX' },
      { status: 500 }
    )
  }
}