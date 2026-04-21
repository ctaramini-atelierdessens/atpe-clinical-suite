import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getAppContext } from '@/lib/atpe/app-context'

type SessionRow = {
  id: string
  patient_id?: string | null
  organization_id?: string | null
  created_at?: string | null
  emotion?: number | null
  emotional_score?: number | null
  corps?: number | null
  body_score?: number | null
  conscience?: number | null
  consciousness_score?: number | null
  dynamique?: number | null
  dynamic_score?: number | null
  symbolique?: number | null
  symbolic_score?: number | null
  global_score?: number | null
}

type PatientRow = {
  id: string
  code?: string | null
  initials?: string | null
}

function normalizeScore(
  primary?: number | null,
  fallback?: number | null,
): number | null {
  const value =
    typeof primary === 'number'
      ? primary
      : typeof fallback === 'number'
      ? fallback
      : null

  if (value === null || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

function computeGlobal(session: SessionRow): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const values = [
    normalizeScore(session.emotion, session.emotional_score),
    normalizeScore(session.corps, session.body_score),
    normalizeScore(session.conscience, session.consciousness_score),
    normalizeScore(session.dynamique, session.dynamic_score),
    normalizeScore(session.symbolique, session.symbolic_score),
  ]

  if (!values.every((v) => typeof v === 'number')) return null
  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function getPatientLatestSessionMap(sessions: SessionRow[]) {
  const map = new Map<string, SessionRow>()

  for (const session of sessions) {
    if (!session.patient_id) continue

    const current = map.get(session.patient_id)
    const currentDate = current?.created_at
      ? new Date(current.created_at).getTime()
      : 0
    const candidateDate = session.created_at
      ? new Date(session.created_at).getTime()
      : 0

    if (!current || candidateDate > currentDate) {
      map.set(session.patient_id, session)
    }
  }

  return map
}

function getPatientSessionGroups(sessions: SessionRow[]) {
  const map = new Map<string, SessionRow[]>()

  for (const session of sessions) {
    if (!session.patient_id) continue
    const list = map.get(session.patient_id) ?? []
    list.push(session)
    map.set(session.patient_id, list)
  }

  return map
}

function computeTrendLabel(values: number[]) {
  if (values.length < 2) return 'Première évaluation'
  const delta = values[0] - values[values.length - 1]
  if (delta >= 10) return 'Amélioration nette'
  if (delta >= 4) return 'Amélioration'
  if (delta <= -10) return 'Régression nette'
  if (delta <= -4) return 'Fragilisation'
  return 'Stable'
}

function wrapText(text: string, maxLength = 90): string[] {
  if (!text) return ['—']

  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxLength) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length ? lines : ['—']
}

export async function GET() {
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    return new NextResponse('Organisation introuvable', { status: 404 })
  }

  const [
    { data: patients, error: patientsError },
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*')
      .eq('organization_id', organization.id)
      .order('code', { ascending: true }),
    supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false }),
  ])

  const safePatients =
    patientsError || !Array.isArray(patients) ? [] : (patients as PatientRow[])

  const safeSessions =
    sessionsError || !Array.isArray(sessions) ? [] : (sessions as SessionRow[])

  const latestSessionMap = getPatientLatestSessionMap(safeSessions)
  const patientGroups = getPatientSessionGroups(safeSessions)

  const latestGlobals = Array.from(latestSessionMap.values())
    .map(computeGlobal)
    .filter((v): v is number => typeof v === 'number')

  const averageLatestGlobal = average(latestGlobals)

  const activePatients = safePatients.filter((patient) =>
    latestSessionMap.has(patient.id),
  )

  const fragilePatients = activePatients.filter((patient) => {
    const latest = latestSessionMap.get(patient.id)
    const score = latest ? computeGlobal(latest) : null
    return score !== null && score < 40
  })

  const patientRows = safePatients.map((patient) => {
    const patientSessions = (patientGroups.get(patient.id) ?? []).sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })

    const values = patientSessions
      .map(computeGlobal)
      .filter((v): v is number => typeof v === 'number')

    return {
      code: patient.code ?? '—',
      initials: patient.initials ?? '—',
      sessionCount: patientSessions.length,
      latestGlobal: values[0] ?? null,
      trend: computeTrendLabel(values),
    }
  })

  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([595.28, 841.89])
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { height } = page.getSize()

  let y = height - 50
  const left = 50
  const lineGap = 16

  function ensurePage() {
    if (y < 70) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = page.getSize().height - 50
    }
  }

  function drawLine(text: string, bold = false, size = 11) {
    ensurePage()
    page.drawText(text, {
      x: left,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0.12, 0.12, 0.12),
    })
    y -= lineGap
  }

  function drawParagraph(text: string) {
    const lines = wrapText(text, 85)
    for (const line of lines) {
      drawLine(line, false, 11)
    }
  }

  drawLine('Reporting direction — synthèse institutionnelle', true, 18)
  y -= 6
  drawLine(`Patients suivis : ${safePatients.length}`)
  drawLine(`Patients actifs : ${activePatients.length}`)
  drawLine(
    `Moyenne globale récente : ${
      averageLatestGlobal !== null ? `${averageLatestGlobal}/100` : '—'
    }`,
  )
  drawLine(`Patients fragiles : ${fragilePatients.length}`)
  y -= 8

  drawLine('Lecture institutionnelle', true, 14)
  drawParagraph(
    `L’organisation suit actuellement ${safePatients.length} patient(s), dont ${activePatients.length} avec au moins une séance exploitable. La moyenne globale récente est de ${
      averageLatestGlobal !== null ? `${averageLatestGlobal}/100` : '—'
    }. ${fragilePatients.length > 0 ? `${fragilePatients.length} patient(s) présentent un niveau global fragile nécessitant une vigilance renforcée.` : 'Aucun patient ne se situe actuellement dans une zone de fragilité globale majeure.'}`,
  )

  y -= 8
  drawLine('Tableau de bord multi-patients', true, 14)

  for (const row of patientRows) {
    drawLine(
      `${row.code} | ${row.initials} | séances: ${row.sessionCount} | dernier global: ${
        row.latestGlobal !== null ? `${row.latestGlobal}/100` : '—'
      } | tendance: ${row.trend}`,
      false,
      10,
    )
  }

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="reporting-direction.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}