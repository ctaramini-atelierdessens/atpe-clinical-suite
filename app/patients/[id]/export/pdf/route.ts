import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getAppContext } from '@/lib/atpe/app-context'
import { createTrackedExportLog } from '@/lib/atpe/actions'
import { canExport } from '@/lib/atpe/rbac'

function wrapText(text: string, maxChars = 95) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = `${current} ${word}`.trim()
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const { supabase, membership } = await getAppContext()
  if (!canExport(membership?.role)) return new NextResponse('Forbidden', { status: 403 })

  const [{ data: patient }, { data: sessions }, { data: episode }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase.from('sessions').select('*').eq('patient_id', id).is('deleted_at', null).order('session_number', { ascending: true }),
    supabase.from('therapy_episodes').select('*').eq('patient_id', id).order('opened_on', { ascending: false }).limit(1).maybeSingle(),
  ])
  if (!patient) return new NextResponse('Not found', { status: 404 })
const safePatient = patient as any
  await createTrackedExportLog({ entityType: 'patient', entityId: id, exportType: 'pdf', destination: 'server-pdf', metadata: { sessions: sessions?.length ?? 0 } })

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  let page = pdf.addPage([595.28, 841.89])
  let y = 800

  const write = (text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {}) => {
    const size = opts.size ?? 11
    const lineGap = opts.gap ?? 4
    const lines = wrapText(text, size > 16 ? 60 : 95)
    for (const line of lines) {
      if (y < 60) {
        page = pdf.addPage([595.28, 841.89])
        y = 800
      }
      page.drawText(line, {
        x: 42,
        y,
        size,
        font: opts.bold ? bold : font,
        color: rgb(opts.color?.[0] ?? 0.07, opts.color?.[1] ?? 0.09, opts.color?.[2] ?? 0.17),
      })
      y -= size + lineGap
    }
  }

  write(`Dossier clinique ATPE â€” ${safePatient.code}`, { size: 20, bold: true, color: [0.11, 0.21, 0.55], gap: 8 })
  write(`Export serveur PDF descriptif sans recommandation automatisÃ©e`, { size: 10, color: [0.3, 0.35, 0.45], gap: 10 })
  write(`Initiales: ${safePatient.initials ?? 'â€”'} Â· Statut: ${safePatient.status} Â· Premier contact: ${safePatient.first_contact_on ?? 'â€”'}`, { size: 11, gap: 6 })
  if (episode) {
    write(`Ã‰pisode: ${episode.episode_label} Â· ${episode.status}`, { size: 11, gap: 6 })
    if (episode.objectives_summary) write(`Objectifs: ${episode.objectives_summary}`, { size: 11, gap: 6 })
  }

  y -= 8
  write('Timeline clinique multi-sÃ©ances', { size: 15, bold: true, color: [0.11, 0.21, 0.55], gap: 8 })

  for (const session of sessions ?? []) {
    write(`SÃ©ance ${session.session_number} â€” ${session.session_date}`, { size: 12, bold: true, gap: 4 })
    write(`Cadre ${session.setting_type} Â· MÃ©diation ${session.mediation_type} Â· QualitÃ© du cadre ${session.frame_quality}`, { size: 10, color: [0.3, 0.35, 0.45], gap: 4 })
    write(`Ã‰motion ${session.emotional_score}/10 Â· Corps ${session.body_score}/10 Â· Conscience ${session.awareness_score}/10 Â· Dynamique ${session.dynamic_score}/10 Â· Symbolique ${session.symbolic_score}/10 Â· RÃ©gulation ${session.regulation_score}/10 Â· Engagement ${session.engagement_score}/10`, { size: 10, gap: 4 })
    if (session.clinical_summary) write(`RÃ©sumÃ© clinique: ${session.clinical_summary}`, { size: 10, gap: 4 })
    if (session.note) write(`Note libre: ${session.note}`, { size: 10, gap: 4 })
    if (session.therapist_hypothesis) write(`HypothÃ¨se thÃ©rapeute: ${session.therapist_hypothesis}`, { size: 10, gap: 6 })
    y -= 6
  }

  const bytes = await pdf.save()
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="dossier-${safePatient.code}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}


