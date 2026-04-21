import { NextRequest, NextResponse } from 'next/server'
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib'
import {
  resolveAtpeCase,
  type ResolvedSession,
} from '@/lib/atpe/resolve-atpe-case'
import { computeAtpeExpertResult } from '@/lib/atpe/expert-engine'
import { mapSessionToExpertInput } from '@/lib/atpe/map-session-to-expert-input'
import {
  getClinicalLevel,
  getRiskFlag,
  getTrajectoryTrend,
  type AtpeExpertCompatibleSession,
} from '@/lib/atpe/clinical-intelligence'
import { matchAtpeProtocols } from '@/lib/atpe/protocol-matcher'
import {
  safeText,
  safeArray,
  safeNumber,
  formatShortDate,
  phaseLabel,
  longitudinalPhaseLabel,
} from '@/lib/atpe/format'

type PdfContext = {
  pdfDoc: PDFDocument
  page: PDFPage
  fontRegular: PDFFont
  fontBold: PDFFont
  width: number
  height: number
  margin: number
  y: number
  pageNumber: number
}

type DashboardAlertLevel = 'critical' | 'high' | 'moderate' | 'info'

type DashboardAlert = {
  id: string
  level: DashboardAlertLevel
  title: string
  message: string
  recommendation?: string
}

const COLORS = {
  text: rgb(0.15, 0.15, 0.18),
  muted: rgb(0.4, 0.43, 0.48),
  border: rgb(0.86, 0.88, 0.9),
  fill: rgb(0.97, 0.98, 0.99),
  accent: rgb(0.12, 0.18, 0.28),
  softBlue: rgb(0.94, 0.97, 1),
  softRed: rgb(1, 0.94, 0.94),
  softOrange: rgb(1, 0.96, 0.92),
  softAmber: rgb(1, 0.98, 0.9),
  softGreen: rgb(0.94, 0.98, 0.94),
}

function createPage(ctx: PdfContext) {
  const page = ctx.pdfDoc.addPage([595.28, 841.89])
  ctx.page = page
  ctx.width = page.getWidth()
  ctx.height = page.getHeight()
  ctx.margin = 48
  ctx.y = ctx.height - ctx.margin
  ctx.pageNumber += 1
  drawPageFooter(ctx)
}

function drawPageFooter(ctx: PdfContext) {
  const footerY = 24

  ctx.page.drawLine({
    start: { x: ctx.margin, y: footerY + 12 },
    end: { x: ctx.width - ctx.margin, y: footerY + 12 },
    thickness: 0.5,
    color: COLORS.border,
  })

  ctx.page.drawText(`Page ${ctx.pageNumber}`, {
    x: ctx.width - ctx.margin - 50,
    y: footerY,
    size: 9,
    font: ctx.fontRegular,
    color: COLORS.muted,
  })
}

function ensureSpace(ctx: PdfContext, requiredHeight: number) {
  if (ctx.y - requiredHeight < 48) {
    createPage(ctx)
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(candidate, size)

    if (width <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

function drawTextLine(
  ctx: PdfContext,
  text: string,
  options?: {
    size?: number
    bold?: boolean
    color?: ReturnType<typeof rgb>
    indent?: number
  }
) {
  const size = options?.size ?? 11
  const bold = options?.bold ?? false
  const color = options?.color ?? COLORS.text
  const indent = options?.indent ?? 0

  ensureSpace(ctx, size + 8)

  ctx.page.drawText(text, {
    x: ctx.margin + indent,
    y: ctx.y,
    size,
    font: bold ? ctx.fontBold : ctx.fontRegular,
    color,
  })

  ctx.y -= size + 4
}

function drawParagraph(
  ctx: PdfContext,
  text: string,
  options?: {
    size?: number
    bold?: boolean
    color?: ReturnType<typeof rgb>
    indent?: number
    lineGap?: number
  }
) {
  const size = options?.size ?? 11
  const bold = options?.bold ?? false
  const color = options?.color ?? COLORS.text
  const indent = options?.indent ?? 0
  const lineGap = options?.lineGap ?? 4
  const font = bold ? ctx.fontBold : ctx.fontRegular
  const maxWidth = ctx.width - ctx.margin * 2 - indent
  const lines = wrapText(text, font, size, maxWidth)

  for (const line of lines) {
    ensureSpace(ctx, size + lineGap + 2)
    ctx.page.drawText(line, {
      x: ctx.margin + indent,
      y: ctx.y,
      size,
      font,
      color,
    })
    ctx.y -= size + lineGap
  }

  ctx.y -= 4
}

function drawSectionTitle(ctx: PdfContext, title: string) {
  ensureSpace(ctx, 28)

  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y + 6 },
    end: { x: ctx.width - ctx.margin, y: ctx.y + 6 },
    thickness: 1,
    color: COLORS.border,
  })

  drawTextLine(ctx, title, {
    size: 15,
    bold: true,
    color: COLORS.accent,
  })

  ctx.y -= 4
}

function drawSubTitle(ctx: PdfContext, title: string) {
  drawTextLine(ctx, title, {
    size: 12,
    bold: true,
    color: COLORS.text,
  })
}

function drawBulletList(ctx: PdfContext, items: string[]) {
  for (const item of items) {
    drawParagraph(ctx, `- ${item}`, { size: 11, indent: 8 })
  }
}

function drawInfoBox(
  ctx: PdfContext,
  title: string,
  lines: string[],
  tone: 'default' | 'blue' | 'red' | 'orange' | 'amber' | 'green' = 'default'
) {
  const titleSize = 11
  const textSize = 10
  const width = ctx.width - ctx.margin * 2
  const padding = 10

  let boxHeight = padding * 2 + titleSize + 8
  for (const line of lines) {
    const wrapped = wrapText(line, ctx.fontRegular, textSize, width - padding * 2)
    boxHeight += wrapped.length * (textSize + 3)
  }
  boxHeight += 6

  ensureSpace(ctx, boxHeight + 8)

  const bgColor =
    tone === 'blue'
      ? COLORS.softBlue
      : tone === 'red'
        ? COLORS.softRed
        : tone === 'orange'
          ? COLORS.softOrange
          : tone === 'amber'
            ? COLORS.softAmber
            : tone === 'green'
              ? COLORS.softGreen
              : COLORS.fill

  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - boxHeight + 8,
    width,
    height: boxHeight,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: bgColor,
  })

  const savedY = ctx.y
  ctx.y -= 12

  ctx.page.drawText(title, {
    x: ctx.margin + padding,
    y: ctx.y,
    size: titleSize,
    font: ctx.fontBold,
    color: COLORS.accent,
  })

  ctx.y -= titleSize + 8

  for (const line of lines) {
    const wrapped = wrapText(line, ctx.fontRegular, textSize, width - padding * 2)

    for (const wrappedLine of wrapped) {
      ctx.page.drawText(wrappedLine, {
        x: ctx.margin + padding,
        y: ctx.y,
        size: textSize,
        font: ctx.fontRegular,
        color: COLORS.text,
      })
      ctx.y -= textSize + 3
    }
  }

  ctx.y = Math.min(ctx.y - 6, savedY - boxHeight - 8)
}

function drawMetricGrid(ctx: PdfContext, session: ResolvedSession) {
  const metrics = [
    `Containment : ${safeNumber(session.frame_containment)}`,
    `Engagement corporel : ${safeNumber(session.bodily_engagement)}`,
    `Décentration : ${safeNumber(session.decentering_level)}`,
    `Recentrement : ${safeNumber(session.centering_level)}`,
    `Externalisation : ${safeNumber(session.externalization_level)}`,
    `Dialogue avec l’œuvre : ${safeNumber(session.work_dialogue_level)}`,
    `Partage : ${safeNumber(session.sharing_level)}`,
    `Symbolisation primaire : ${safeNumber(session.primary_symbolization)}`,
    `Symbolisation secondaire : ${safeNumber(session.secondary_symbolization)}`,
    `Disponibilité relationnelle : ${safeNumber(session.relational_availability)}`,
    `Mobilité créative : ${safeNumber(session.creative_mobility)}`,
    `Intensité projective : ${safeNumber(session.projective_intensity)}`,
    `Présence thérapeute : ${safeNumber(session.therapist_presence_quality)}`,
    `Engagement patient : ${safeNumber(session.patient_engagement_level)}`,
  ]

  drawInfoBox(ctx, 'Données cliniques quantitatives', metrics)
}

async function buildPdfContext() {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const firstPage = pdfDoc.addPage([595.28, 841.89])

  const ctx: PdfContext = {
    pdfDoc,
    page: firstPage,
    fontRegular,
    fontBold,
    width: firstPage.getWidth(),
    height: firstPage.getHeight(),
    margin: 48,
    y: firstPage.getHeight() - 48,
    pageNumber: 1,
  }

  drawPageFooter(ctx)
  return ctx
}

function drawDocumentHeader(
  ctx: PdfContext,
  title: string,
  patientName: string,
  subtitle?: string
) {
  drawTextLine(ctx, title, {
    size: 22,
    bold: true,
    color: COLORS.accent,
  })

  drawTextLine(ctx, patientName, {
    size: 14,
    bold: true,
    color: COLORS.text,
  })

  if (subtitle) {
    drawTextLine(ctx, subtitle, {
      size: 10,
      color: COLORS.muted,
    })
  }

  ctx.y -= 8
}

function latestSessionToExpertInput(session: ResolvedSession) {
  return {
    frame_containment: session.frame_containment,
    bodily_engagement: session.bodily_engagement,
    decentering_level: session.decentering_level,
    centering_level: session.centering_level,
    externalization_level: session.externalization_level,
    work_dialogue_level: session.work_dialogue_level,
    sharing_level: session.sharing_level,
    primary_symbolization: session.primary_symbolization,
    secondary_symbolization: session.secondary_symbolization,
    relational_availability: session.relational_availability,
    creative_mobility: session.creative_mobility,
    projective_intensity: session.projective_intensity,
    therapist_presence_quality: session.therapist_presence_quality,
    patient_engagement_level: session.patient_engagement_level,
    therapist_feels_confusion: session.therapist_feels_confusion,
    therapist_feels_sudden_fatigue: session.therapist_feels_sudden_fatigue,
    therapist_feels_pressure: session.therapist_feels_pressure,
    therapist_feels_irritation: session.therapist_feels_irritation,
    therapist_feels_void: session.therapist_feels_void,
    patient_repeats_without_integration:
      session.patient_repeats_without_integration,
    group_feels_same_affect: session.group_feels_same_affect,
    tension_spreads_quickly: session.tension_spreads_quickly,
  }
}

function buildDashboardAlerts(
  latest: ResolvedSession,
  trajectory: ReturnType<typeof getTrajectoryTrend>,
  riskFlag: ReturnType<typeof getRiskFlag>,
  clinicalLevel: ReturnType<typeof getClinicalLevel>
): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  if (riskFlag.flag === 'critical') {
    alerts.push({
      id: 'risk-critical',
      level: 'critical',
      title: 'Risque clinique critique',
      message:
        'Le niveau de risque calculé est critique sur la dernière séance.',
      recommendation:
        'Réduire immédiatement la complexité, renforcer la contenance et réévaluer le rythme des séances.',
    })
  } else if (riskFlag.flag === 'high') {
    alerts.push({
      id: 'risk-high',
      level: 'high',
      title: 'Risque clinique élevé',
      message:
        'La dernière séance présente plusieurs indicateurs de tension ou de fragilité clinique.',
      recommendation:
        'Renforcer le cadre, ralentir les sollicitations et surveiller l’évolution à court terme.',
    })
  }

  if (trajectory.trend === 'declining') {
    alerts.push({
      id: 'trajectory-declining',
      level: 'high',
      title: 'Trajectoire défavorable',
      message:
        'La trajectoire globale montre une baisse significative des capacités cliniques.',
      recommendation:
        'Réévaluer les médiations, le rythme et le niveau d’exigence thérapeutique.',
    })
  } else if (trajectory.trend === 'stable' && clinicalLevel.level === 'fragile') {
    alerts.push({
      id: 'trajectory-fragile-stable',
      level: 'moderate',
      title: 'Stabilité fragile',
      message:
        'La trajectoire reste stable, mais sur un niveau clinique encore fragile.',
      recommendation:
        'Maintenir un cadre sobre et sécurisant sans augmenter la complexité.',
    })
  }

  if ((latest.patient_engagement_level ?? 0) < 50) {
    alerts.push({
      id: 'engagement-low',
      level: 'moderate',
      title: 'Engagement faible',
      message:
        'Le niveau d’engagement patient observé reste bas sur la dernière séance.',
      recommendation:
        'Privilégier des médiations simples, des relances courtes et un rythme plus lent.',
    })
  }

  if ((latest.frame_containment ?? 0) < 60) {
    alerts.push({
      id: 'containment-low',
      level: 'high',
      title: 'Contenance du cadre insuffisante',
      message: 'Le score de contenance est faible sur la dernière séance.',
      recommendation:
        'Renforcer les repères, la prévisibilité et les limites du cadre thérapeutique.',
    })
  }

  if ((latest.projective_intensity ?? 0) >= 40) {
    alerts.push({
      id: 'projective-high',
      level: 'high',
      title: 'Intensité projective élevée',
      message:
        'L’intensité projective observée augmente le risque de surcharge ou de débordement.',
      recommendation:
        'Éviter les interprétations précoces et privilégier une fonction contenante.',
    })
  }

  if (
    latest.therapist_feels_confusion ||
    latest.therapist_feels_pressure ||
    latest.therapist_feels_irritation ||
    latest.therapist_feels_void ||
    latest.therapist_feels_sudden_fatigue
  ) {
    alerts.push({
      id: 'countertransference-signal',
      level: 'moderate',
      title: 'Signal contre-transférentiel',
      message:
        'La dernière séance comporte un ou plusieurs marqueurs contre-transférentiels significatifs.',
      recommendation:
        'Mettre en reprise clinique la séance et vérifier l’ajustement du cadre.',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'no-major-alert',
      level: 'info',
      title: 'Pas d’alerte clinique majeure',
      message:
        'Aucune alerte majeure n’est détectée sur la dernière séance au regard des seuils du dashboard.',
      recommendation:
        'Poursuivre le suivi avec le même niveau de stabilité clinique.',
    })
  }

  return alerts
}

function alertTone(level: DashboardAlertLevel): 'red' | 'orange' | 'amber' | 'blue' {
  switch (level) {
    case 'critical':
      return 'red'
    case 'high':
      return 'orange'
    case 'moderate':
      return 'amber'
    case 'info':
    default:
      return 'blue'
  }
}

function drawAlertsSection(
  ctx: PdfContext,
  alerts: DashboardAlert[],
  latest: ResolvedSession,
  clinicalLevel: ReturnType<typeof getClinicalLevel>,
  riskFlag: ReturnType<typeof getRiskFlag>,
  trajectory: ReturnType<typeof getTrajectoryTrend>
) {
  drawSectionTitle(ctx, 'Alertes automatiques')

  drawInfoBox(
    ctx,
    'Synthèse automatique',
    [
      `Niveau clinique global : ${clinicalLevel.label} (${clinicalLevel.score}/100)`,
      `Niveau de risque : ${riskFlag.label} (${riskFlag.score}/100)`,
      `Trajectoire : ${trajectory.label} (delta ${trajectory.delta >= 0 ? '+' : ''}${trajectory.delta})`,
      `Dernière séance : ${formatShortDate(latest.created_at)} - ${safeText(latest.longitudinal_title)}`,
    ],
    alerts[0]?.level === 'critical'
      ? 'red'
      : alerts[0]?.level === 'high'
        ? 'orange'
        : alerts[0]?.level === 'moderate'
          ? 'amber'
          : 'blue'
  )

  alerts.forEach((alert, index) => {
    drawInfoBox(
      ctx,
      `${index + 1}. ${alert.title}`,
      [
        alert.message,
        alert.recommendation
          ? `Recommandation : ${alert.recommendation}`
          : 'Recommandation : —',
      ],
      alertTone(alert.level)
    )
  })
}

function drawPreferredProtocolSection(
  ctx: PdfContext,
  sessions: ResolvedSession[]
) {
  const protocolMatch = matchAtpeProtocols(sessions, 3)
  const preferred = protocolMatch.recommended[0] ?? null

  drawSectionTitle(ctx, 'Protocole actuellement privilégié')

  if (!preferred) {
    drawInfoBox(
      ctx,
      'Aucune recommandation protocolaire',
      [
        'Aucun protocole automatique n’a pu être proposé à partir des données disponibles.',
      ],
      'blue'
    )
    return
  }

  drawInfoBox(
    ctx,
    preferred.protocol.title,
    [
      `Niveau de confiance : ${
        preferred.confidence === 'high'
          ? 'élevé'
          : preferred.confidence === 'medium'
            ? 'moyen'
            : 'faible'
      }`,
      `Score de recommandation : ${preferred.score}`,
      `Intention clinique : ${preferred.protocol.clinical_intent}`,
      `Rationale : ${preferred.rationale}`,
    ],
    preferred.confidence === 'high'
      ? 'green'
      : preferred.confidence === 'medium'
        ? 'amber'
        : 'blue'
  )

  drawSubTitle(ctx, 'Raisons principales')
  drawBulletList(
    ctx,
    preferred.reasons.map((reason) => {
      switch (reason) {
        case 'risk_level':
          return 'Compatibilité avec le niveau de risque actuel'
        case 'clinical_level':
          return 'Compatibilité avec le niveau clinique global'
        case 'phase':
          return 'Compatibilité avec la phase dominante observée'
        case 'trajectory':
          return 'Compatibilité avec la trajectoire clinique'
        case 'engagement':
          return 'Pertinent au regard du niveau d’engagement'
        case 'containment':
          return 'Pertinent au regard du niveau de contenance'
        case 'projective_intensity':
          return 'Pertinent au regard de l’intensité projective'
        case 'countertransference':
          return 'Pertinent au regard des signaux contre-transférentiels'
        case 'closure':
          return 'Adapté à une phase de clôture / transférabilité'
        case 'consolidation':
          return 'Adapté à un moment de consolidation'
        case 'default_support':
          return 'Compatibilité clinique générale'
        default:
          return reason
      }
    })
  )

  drawSubTitle(ctx, 'Médiations proposées')
  drawBulletList(ctx, preferred.protocol.mediations.slice(0, 5))

  drawSubTitle(ctx, 'Précautions')
  drawBulletList(ctx, preferred.protocol.precautions.slice(0, 4))
}

function drawDetailedSession(ctx: PdfContext, session: ResolvedSession, index: number) {
  drawSectionTitle(
    ctx,
    `Séance ${session.session_number ?? index + 1} - ${formatShortDate(
      session.created_at
    )} - ${phaseLabel(session.atpe_phase_dominant)}`
  )

  drawInfoBox(ctx, 'Repères de séance', [
    `Intitulé : ${safeText(session.longitudinal_title)}`,
    `Format : ${safeText(session.format)}`,
    `Médium principal : ${safeText(session.medium_primary)}`,
    `Médium secondaire : ${safeText(session.medium_secondary)}`,
    `Phase longitudinale : ${longitudinalPhaseLabel(session.longitudinal_phase)}`,
  ])

  drawSubTitle(ctx, 'Thème clinique dominant')
  drawParagraph(ctx, safeText(session.dominant_clinical_theme))

  drawSubTitle(ctx, 'Statut clinique')
  drawParagraph(ctx, safeText(session.clinical_status))

  drawSubTitle(ctx, 'Focalisation thérapeutique')
  drawParagraph(ctx, safeText(session.therapeutic_focus))

  drawSubTitle(ctx, 'Lecture clinique')
  drawParagraph(ctx, safeText(session.clinical_reading))

  drawSubTitle(ctx, 'Effets clés')
  drawBulletList(ctx, safeArray(session.key_effects))

  drawSubTitle(ctx, 'Hypothèses cliniques')
  drawParagraph(ctx, safeText(session.clinical_hypotheses))

  drawSubTitle(ctx, 'Recommandation pour la suite')
  drawParagraph(ctx, safeText(session.next_step_recommendation))

  drawSubTitle(ctx, 'Notes contre-transférentielles')
  drawParagraph(ctx, safeText(session.therapist_countertransference_notes))

  drawMetricGrid(ctx, session)
}

async function generateTherapeuticSummaryPdf(patientId: string) {
  const resolved = await resolveAtpeCase(patientId)
  const ctx = await buildPdfContext()
  const sessions = safeArray(resolved.sessions)
  const latest = sessions[sessions.length - 1] ?? null

  const expert = latest
    ? computeAtpeExpertResult(
        mapSessionToExpertInput(latestSessionToExpertInput(latest))
      )
    : null

  const clinicalLevel = latest
    ? getClinicalLevel(latest as AtpeExpertCompatibleSession)
    : null
  const riskFlag = latest
    ? getRiskFlag(latest as AtpeExpertCompatibleSession)
    : null
  const trajectory = getTrajectoryTrend(sessions as AtpeExpertCompatibleSession[])
  const alerts =
    latest && clinicalLevel && riskFlag
      ? buildDashboardAlerts(latest, trajectory, riskFlag, clinicalLevel)
      : []

  drawDocumentHeader(
    ctx,
    'Synthèse thérapeutique ATPE',
    resolved.patient.display_name,
    `Résumé : ${resolved.resolution.summary_source} - Séances : ${resolved.resolution.sessions_source}`
  )

  drawInfoBox(ctx, 'Identification', [
    `Patient : ${resolved.patient.display_name}`,
    `Code : ${resolved.patient.code}`,
    `Initiales : ${resolved.patient.initials}`,
    `Statut : ${resolved.patient.status}`,
    `Référence dossier : ${resolved.patient.case_reference}`,
  ])

  if (latest && clinicalLevel && riskFlag) {
    drawAlertsSection(ctx, alerts, latest, clinicalLevel, riskFlag, trajectory)
  }

  drawPreferredProtocolSection(ctx, sessions)

  drawSectionTitle(ctx, 'Bilan expressionnel préalable')
  drawInfoBox(
    ctx,
    'Étape préliminaire avant l’entrée en suivi ATPE',
    [
      `Indication : ${safeText(resolved.case.expression_assessment?.indication)}`,
      `Objectif : ${safeText(resolved.case.expression_assessment?.objective)}`,
      `Focalisation clinique : ${safeText(
        resolved.case.expression_assessment?.clinical_focus
      )}`,
    ],
    'blue'
  )

  drawSubTitle(ctx, 'Ressources repérées')
  drawBulletList(ctx, safeArray(resolved.case.expression_assessment?.resources))

  drawSubTitle(ctx, 'Points de vigilance')
  drawBulletList(
    ctx,
    safeArray(resolved.case.expression_assessment?.vulnerabilities)
  )

  drawSubTitle(ctx, 'Cadre recommandé')
  drawBulletList(
    ctx,
    safeArray(resolved.case.expression_assessment?.recommended_frame)
  )

  drawSectionTitle(ctx, 'Repères du suivi chronologique')
  drawBulletList(
    ctx,
    sessions.map(
      (session, index) =>
        `Séance ${session.session_number ?? index + 1} - ${formatShortDate(
          session.created_at
        )} - ${safeText(session.longitudinal_title)}`
    )
  )

  if (latest) {
    drawSectionTitle(ctx, 'Dernière séance observée')
    drawInfoBox(ctx, 'Derniers éléments disponibles', [
      `Date : ${formatShortDate(latest.created_at)}`,
      `Phase dominante enregistrée : ${phaseLabel(latest.atpe_phase_dominant)}`,
      `Intitulé : ${safeText(latest.longitudinal_title)}`,
      `Thème clinique dominant : ${safeText(latest.dominant_clinical_theme)}`,
      `Statut clinique : ${safeText(latest.clinical_status)}`,
      `Focalisation thérapeutique : ${safeText(latest.therapeutic_focus)}`,
      `Lecture clinique : ${safeText(latest.clinical_reading)}`,
      `Effets clés : ${safeArray(latest.key_effects).join(' ; ') || '—'}`,
      `Hypothèses cliniques : ${safeText(latest.clinical_hypotheses)}`,
      `Recommandation : ${safeText(latest.next_step_recommendation)}`,
    ])
  }

  if (expert) {
    drawSectionTitle(ctx, 'Lecture experte automatique')
    drawInfoBox(ctx, 'Moteur expert ATPE', [
      `Phase dominante calculée : ${phaseLabel(expert.phase_dominant)}`,
      `Stabilité clinique : ${expert.clinical_stability}`,
      `Vigilance : ${expert.vigilance_level}`,
      `Orientation : ${expert.clinical_orientation}`,
      `Prochaine étape : ${expert.next_step_recommendation}`,
    ])
  }

  drawSectionTitle(ctx, 'Bilan intermédiaire')
  drawParagraph(ctx, safeText(resolved.case.intermediate_review?.summary))
  drawBulletList(
    ctx,
    safeArray(resolved.case.intermediate_review?.main_evolutions)
  )

  drawSectionTitle(ctx, 'Bilan final')
  drawParagraph(ctx, safeText(resolved.case.final_review?.summary))
  drawSubTitle(ctx, 'Recommandations équipe')
  drawBulletList(
    ctx,
    safeArray(resolved.case.final_review?.team_recommendations)
  )

  drawSectionTitle(ctx, 'Signature clinique')
  drawParagraph(ctx, safeText(resolved.case.final_review?.clinical_signature), {
    bold: true,
  })

  return await ctx.pdfDoc.save()
}

async function generateFullCasePdf(patientId: string) {
  const resolved = await resolveAtpeCase(patientId)
  const ctx = await buildPdfContext()
  const sessions = safeArray(resolved.sessions)

  drawDocumentHeader(
    ctx,
    'Dossier clinique complet ATPE',
    resolved.patient.display_name,
    `Résumé : ${resolved.resolution.summary_source} - Séances : ${resolved.resolution.sessions_source}`
  )

  drawInfoBox(ctx, 'Identification', [
    `Patient : ${resolved.patient.display_name}`,
    `Code : ${resolved.patient.code}`,
    `Initiales : ${resolved.patient.initials}`,
    `Statut : ${resolved.patient.status}`,
    `Premier contact : ${resolved.patient.first_contact_on}`,
    `Source d’orientation : ${resolved.patient.referral_source}`,
  ])

  drawSectionTitle(ctx, 'Vue d’ensemble clinique')
  drawInfoBox(ctx, 'Résumé de cas', [
    `Référence : ${safeText(resolved.case.case_slug)}`,
    `Cadre : ${safeText(resolved.case.setting)}`,
    `Modalité : ${safeText(resolved.case.modality)}`,
    `Thème dominant : ${safeText(resolved.case.dominant_case_theme)}`,
    `Nombre de séances : ${String(resolved.case.total_sessions)}`,
  ])

  drawSectionTitle(ctx, 'Bilan expressionnel préalable')
  drawInfoBox(
    ctx,
    'Étape préliminaire avant l’entrée en suivi ATPE',
    [
      `Indication : ${safeText(resolved.case.expression_assessment?.indication)}`,
      `Objectif : ${safeText(resolved.case.expression_assessment?.objective)}`,
      `Focalisation clinique : ${safeText(
        resolved.case.expression_assessment?.clinical_focus
      )}`,
    ],
    'blue'
  )

  drawSubTitle(ctx, 'Ressources repérées')
  drawBulletList(ctx, safeArray(resolved.case.expression_assessment?.resources))

  drawSubTitle(ctx, 'Fragilités et vigilance')
  drawBulletList(
    ctx,
    safeArray(resolved.case.expression_assessment?.vulnerabilities)
  )

  drawSubTitle(ctx, 'Cadre recommandé')
  drawBulletList(
    ctx,
    safeArray(resolved.case.expression_assessment?.recommended_frame)
  )

  drawSectionTitle(ctx, 'Suivi détaillé des séances classées chronologiquement')

  sessions.forEach((session, index) => {
    drawDetailedSession(ctx, session, index)
  })

  drawSectionTitle(ctx, 'Bilan intermédiaire')
  drawParagraph(ctx, safeText(resolved.case.intermediate_review?.summary))
  drawSubTitle(ctx, 'Évolutions principales')
  drawBulletList(
    ctx,
    safeArray(resolved.case.intermediate_review?.main_evolutions)
  )
  drawSubTitle(ctx, 'Implications pour l’équipe')
  drawBulletList(
    ctx,
    safeArray(resolved.case.intermediate_review?.team_implications)
  )

  drawSectionTitle(ctx, 'Bilan final')
  drawParagraph(ctx, safeText(resolved.case.final_review?.summary))
  drawSubTitle(ctx, 'Transformations majeures')
  drawBulletList(
    ctx,
    safeArray(resolved.case.final_review?.major_transformations)
  )
  drawSubTitle(ctx, 'Recommandations équipe')
  drawBulletList(
    ctx,
    safeArray(resolved.case.final_review?.team_recommendations)
  )

  drawSectionTitle(ctx, 'Signature clinique')
  drawParagraph(ctx, safeText(resolved.case.final_review?.clinical_signature), {
    bold: true,
  })

  return await ctx.pdfDoc.save()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const type = searchParams.get('type') ?? 'therapeutic_summary'

    if (!patientId) {
      return NextResponse.json(
        { ok: false, error: 'patientId manquant' },
        { status: 400 }
      )
    }

    let pdfBytes: Uint8Array
    let filename: string

    if (type === 'full_case') {
      pdfBytes = await generateFullCasePdf(patientId)
      filename = `dossier-atpe-complet-${patientId}.pdf`
    } else {
      pdfBytes = await generateTherapeuticSummaryPdf(patientId)
      filename = `synthese-therapeutique-atpe-${patientId}.pdf`
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Erreur route atpe-export-pdf:', error)

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue export PDF ATPE',
      },
      { status: 500 }
    )
  }
}