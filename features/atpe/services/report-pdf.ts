type ReportData = {
  clinicName: string
  logoText?: string
  patientName: string
  patientId: string
  generatedAt: string

  insights: {
    score: number
    trend: string
    risk: string
    label: string
  }

  prediction: string
  relapse: string
  recommendations: string[]
  mdphSummary: string

  sessions?: any[]
}

function esc(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrap(text: string, max = 90) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const out: string[] = []
  let line = ''

  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (t.length <= max) line = t
    else {
      if (line) out.push(line)
      line = w
    }
  }

  if (line) out.push(line)
  return out
}

function buildLines(data: ReportData) {
  const lines: string[] = []

  lines.push(data.clinicName)
  lines.push(data.logoText ?? '')
  lines.push('')

  lines.push(`Patient : ${data.patientName}`)
  lines.push(`ID : ${data.patientId}`)
  lines.push(`Date : ${data.generatedAt}`)
  lines.push('')

  lines.push('=== SYNTHÈSE CLINIQUE ===')
  lines.push(`Score : ${data.insights.score}`)
  lines.push(`Tendance : ${data.insights.trend}`)
  lines.push(`Risque : ${data.insights.risk}`)
  lines.push(`Lecture : ${data.insights.label}`)
  lines.push('')

  lines.push('=== PRÉDICTION ===')
  lines.push(`Projection : ${data.prediction}`)
  lines.push(`Rechute : ${data.relapse}`)
  lines.push('')

  lines.push('=== RECOMMANDATIONS ===')
  data.recommendations.forEach((r) => lines.push(`• ${r}`))
  lines.push('')

  lines.push('=== SYNTHÈSE MDPH ===')
  wrap(data.mdphSummary, 95).forEach((l) => lines.push(l))
  lines.push('')

  if (data.sessions?.length) {
    lines.push('=== HISTORIQUE DES SÉANCES ===')

    data.sessions.slice(-10).forEach((s: any, i: number) => {
      lines.push(
        `Séance ${i + 1} - Engagement: ${
          s.patient_engagement_level ?? 0
        } / Symbolisation: ${s.primary_symbolization ?? 0}`
      )
    })
  }

  return lines
}

export function createClinicalPdfBuffer(data: ReportData): Buffer {
  const pageHeight = 842
  const marginTop = 780
  const marginBottom = 60
  const lineHeight = 16

  const lines = buildLines(data)

  const pages: string[][] = []
  let currentPage: string[] = []
  let y = marginTop

  for (const line of lines) {
    if (y < marginBottom) {
      pages.push(currentPage)
      currentPage = []
      y = marginTop
    }
    currentPage.push(line)
    y -= lineHeight
  }

  if (currentPage.length) pages.push(currentPage)

  let pdf = '%PDF-1.4\n'
  const objects: string[] = []
  const offsets: number[] = [0]

  // FONT
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  // PAGES
  const kids: string[] = []

  pages.forEach((pageLines, i) => {
    const content: string[] = []
    content.push('BT')
    content.push('/F1 12 Tf')

    let y = marginTop

    pageLines.forEach((l) => {
      content.push(`1 0 0 1 50 ${y} Tm (${esc(l)}) Tj`)
      y -= lineHeight
    })

    // footer page number
    content.push(
      `1 0 0 1 50 40 Tm (Page ${i + 1}/${pages.length}) Tj`
    )

    content.push('ET')

    const stream = content.join('\n')

    const contentObjIndex = 5 + i * 2
    const pageObjIndex = 6 + i * 2

    objects[contentObjIndex] = `<< /Length ${Buffer.byteLength(
      stream
    )} >>\nstream\n${stream}\nendstream`

    objects[pageObjIndex] =
      `<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 4 0 R >> >> ` +
      `/Contents ${contentObjIndex} 0 R >>`

    kids.push(`${pageObjIndex} 0 R`)
  })

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${
    pages.length
  } >>`

  // BUILD PDF
  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue
    offsets[i] = Buffer.byteLength(pdf)
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xref = Buffer.byteLength(pdf)

  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let i = 1; i < objects.length; i++) {
    if (!offsets[i]) continue
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  return Buffer.from(pdf)
}