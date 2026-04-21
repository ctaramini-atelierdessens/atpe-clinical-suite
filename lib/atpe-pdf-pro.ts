import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

export type PdfProMetric = {
  label: string
  value: number
}

export type PdfProSignature = {
  signerName?: string | null
  signerRole?: string | null
  signedAt?: string | null
  status?: string | null
  comment?: string | null
}

export type PdfProSection = {
  title: string
  body: string
}

export type GenerateClinicalPdfProArgs = {
  title: string
  subtitle?: string
  patientName?: string
  patientReference?: string
  sessionId?: string | null
  sections: PdfProSection[]
  metrics?: PdfProMetric[]
  signature?: PdfProSignature | null
  outputPath: string
}

function ensureDir(filePath: string) {
  return fs.promises.mkdir(path.dirname(filePath), { recursive: true })
}

function drawHeader(doc: PDFKit.PDFDocument, args: GenerateClinicalPdfProArgs) {
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right
  const top = doc.page.margins.top

  doc.save()
  doc
    .rect(doc.page.margins.left, top - 24, pageWidth, 50)
    .fillOpacity(0.08)
    .fill('#334155')
  doc.restore()

  doc.fillOpacity(1)
  doc.fillColor('#0f172a')
  doc.fontSize(18).text(args.title, doc.page.margins.left, top - 10, {
    width: pageWidth,
    align: 'left',
  })

  const subtitleParts = [
    args.subtitle,
    args.patientName ? `Patient: ${args.patientName}` : null,
    args.patientReference ? `Réf: ${args.patientReference}` : null,
    args.sessionId ? `Session: ${args.sessionId}` : null,
  ].filter(Boolean)

  if (subtitleParts.length) {
    doc
      .fontSize(9)
      .fillColor('#475569')
      .text(subtitleParts.join(' · '), doc.page.margins.left, top + 14, {
        width: pageWidth,
        align: 'left',
      })
  }

  doc.moveDown(2)
  doc.fillColor('#111827')
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const y = doc.page.height - doc.page.margins.bottom + 12
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right

  doc
    .fontSize(8)
    .fillColor('#64748b')
    .text(
      `ATPE Clinical Suite · Page ${doc.page.number}`,
      doc.page.margins.left,
      y,
      {
        width: pageWidth,
        align: 'center',
      },
    )

  doc.fillColor('#111827')
}

function setupPageHooks(doc: PDFKit.PDFDocument, args: GenerateClinicalPdfProArgs) {
  doc.on('pageAdded', () => {
    drawHeader(doc, args)
    drawFooter(doc)
  })
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.8)
  doc
    .fontSize(13)
    .fillColor('#0f172a')
    .text(title, {
      underline: false,
    })
  doc.moveDown(0.25)
  doc
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#cbd5e1')
    .stroke()
  doc.moveDown(0.5)
  doc.fillColor('#111827')
}

function normalBody(doc: PDFKit.PDFDocument, body: string) {
  doc.fontSize(10).fillColor('#111827').text(body, {
    align: 'left',
    lineGap: 4,
  })
}

function drawMetricCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  metric: PdfProMetric,
) {
  doc.save()
  doc.roundedRect(x, y, width, height, 8).fillOpacity(0.08).fill('#94a3b8')
  doc.restore()

  doc.fillOpacity(1)
  doc.fillColor('#475569').fontSize(8).text(metric.label, x + 10, y + 8, {
    width: width - 20,
  })
  doc.fillColor('#0f172a').fontSize(16).text(`${metric.value}/100`, x + 10, y + 22, {
    width: width - 20,
  })
}

function drawMetrics(doc: PDFKit.PDFDocument, metrics: PdfProMetric[]) {
  if (!metrics.length) return

  sectionTitle(doc, 'Indicateurs cliniques')

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right
  const gap = 10
  const columns = 3
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns
  const cardHeight = 46

  metrics.forEach((metric, index) => {
    const col = index % columns
    if (index > 0 && col === 0) {
      doc.moveDown(4.8)
    }

    const currentY = doc.y
    const rowIndex = Math.floor(index / columns)
    const baseY = currentY + rowIndex * 0
    const x = doc.page.margins.left + col * (cardWidth + gap)

    drawMetricCard(doc, x, baseY, cardWidth, cardHeight, metric)
  })

  const rows = Math.ceil(metrics.length / columns)
  doc.y += rows * (cardHeight + 12)
}

function drawBarChart(doc: PDFKit.PDFDocument, metrics: PdfProMetric[]) {
  if (!metrics.length) return

  sectionTitle(doc, 'Graphique clinique synthétique')

  const chartX = doc.page.margins.left
  const chartY = doc.y + 8
  const chartWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right
  const chartHeight = 140
  const barGap = 12
  const bars = metrics.slice(0, 6)
  const barWidth = (chartWidth - barGap * (bars.length - 1)) / Math.max(bars.length, 1)

  doc.save()
  doc.roundedRect(chartX, chartY, chartWidth, chartHeight, 10).strokeColor('#e2e8f0').stroke()
  doc.restore()

  bars.forEach((metric, index) => {
    const x = chartX + index * (barWidth + barGap)
    const barMaxHeight = 82
    const value = Math.max(0, Math.min(100, metric.value))
    const h = (value / 100) * barMaxHeight
    const barY = chartY + 28 + (barMaxHeight - h)

    doc.save()
    doc.roundedRect(x, barY, barWidth, h, 6).fill('#334155')
    doc.restore()

    doc.fillColor('#0f172a').fontSize(8).text(`${value}`, x, chartY + 12, {
      width: barWidth,
      align: 'center',
    })

    doc.fillColor('#475569').fontSize(7).text(metric.label, x, chartY + 114, {
      width: barWidth,
      align: 'center',
    })
  })

  doc.y = chartY + chartHeight + 8
}

function drawSignature(doc: PDFKit.PDFDocument, signature?: PdfProSignature | null) {
  if (!signature) return

  sectionTitle(doc, 'Signature clinique')

  const lines = [
    `Signataire : ${signature.signerName || 'Non renseigné'}`,
    `Rôle : ${signature.signerRole || 'Non renseigné'}`,
    `Statut : ${signature.status || 'Non renseigné'}`,
    `Date : ${signature.signedAt || 'Non renseignée'}`,
    signature.comment ? `Commentaire : ${signature.comment}` : null,
  ].filter(Boolean)

  doc.save()
  doc.roundedRect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 72, 10).fillOpacity(0.06).fill('#64748b')
  doc.restore()

  doc.fillOpacity(1)
  doc.fillColor('#111827').fontSize(10).text(lines.join('\n'), doc.page.margins.left + 12, doc.y + 10, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 24,
    lineGap: 4,
  })

  doc.y += 84
}

export async function generateClinicalPdfPro(args: GenerateClinicalPdfProArgs) {
  await ensureDir(args.outputPath)

  return new Promise<string>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 72,
        bottom: 56,
        left: 52,
        right: 52,
      },
      bufferPages: true,
    })

    const stream = fs.createWriteStream(args.outputPath)
    doc.pipe(stream)

    setupPageHooks(doc, args)
    drawHeader(doc, args)
    drawFooter(doc)

    if (args.metrics?.length) {
      drawMetrics(doc, args.metrics)
      drawBarChart(doc, args.metrics)
    }

    for (const section of args.sections) {
      sectionTitle(doc, section.title)
      normalBody(doc, section.body)
      doc.moveDown(0.4)
    }

    drawSignature(doc, args.signature)

    doc.end()

    stream.on('finish', () => resolve(args.outputPath))
    stream.on('error', reject)
  })
}