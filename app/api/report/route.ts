type ReportData = {
  title: string
  patientName: string
  patientId: string
  generatedAt: string
  score: number | string
  trend: string
  risk: string
  label: string
  prediction: string
  relapse: string
  recommendations: string[]
  mdphSummary: string
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

function section(title: string, lines: string[]) {
  return [title, ''].concat(lines).concat([''])
}

export function createClinicalPdfBuffer(data: ReportData): Buffer {
  const lines: string[] = []

  // HEADER
  lines.push(data.title)
  lines.push('')
  lines.push(`Patient : ${data.patientName}`)
  lines.push(`Identifiant : ${data.patientId}`)
  lines.push(`Date : ${data.generatedAt}`)
  lines.push('')

  // SYNTHÈSE
  lines.push(
    ...section('SYNTHÈSE CLINIQUE', [
      `Score : ${data.score}`,
      `Tendance : ${data.trend}`,
      `Risque : ${data.risk}`,
      `Lecture : ${data.label}`,
    ])
  )

  // PRÉDICTION
  lines.push(
    ...section('PRÉDICTION CLINIQUE', [
      `Projection : ${data.prediction}`,
      `Rechute : ${data.relapse}`,
    ])
  )

  // RECOMMANDATIONS
  lines.push(
    ...section(
      'RECOMMANDATIONS THÉRAPEUTIQUES',
      data.recommendations.map((r) => `• ${r}`)
    )
  )

  // MDPH
  lines.push(
    ...section(
      'SYNTHÈSE MDPH',
      wrap(data.mdphSummary, 95)
    )
  )

  // --- PDF ---
  const left = 50
  let y = 780
  const lh = 16

  const content: string[] = []
  content.push('BT')
  content.push('/F1 12 Tf')

  for (const l of lines) {
    if (y < 60) break
    content.push(`1 0 0 1 ${left} ${y} Tm (${esc(l)}) Tj`)
    y -= lh
  }

  content.push('ET')

  const stream = content.join('\n')

  const objs: string[] = []

  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objs[3] =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>'
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objs[5] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]

  for (let i = 1; i < objs.length; i++) {
    offsets[i] = Buffer.byteLength(pdf)
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`
  }

  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n`

  for (let i = 1; i < objs.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  return Buffer.from(pdf)
}