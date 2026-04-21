import { NextResponse } from 'next/server'
import { getAppContext } from '@/lib/atpe/app-context'

function normalizeScore(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function computeGlobal(session: Record<string, unknown>): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const emotion = normalizeScore(session.emotion) ?? normalizeScore(session.emotional_score)
  const corps = normalizeScore(session.corps) ?? normalizeScore(session.body_score)
  const conscience =
    normalizeScore(session.conscience) ?? normalizeScore(session.consciousness_score)
  const dynamique =
    normalizeScore(session.dynamique) ?? normalizeScore(session.dynamic_score)
  const symbolique =
    normalizeScore(session.symbolique) ?? normalizeScore(session.symbolic_score)

  const values = [emotion, corps, conscience, dynamique, symbolique]
  if (!values.every((v) => typeof v === 'number')) return null

  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function computeTrendLabel(sessions: Record<string, unknown>[]) {
  if (sessions.length < 2) return 'Première évaluation'

  const latest = computeGlobal(sessions[0])
  const previous = computeGlobal(sessions[1])

  if (latest === null || previous === null) return 'Données insuffisantes'

  const delta = latest - previous

  if (delta >= 10) return 'Amélioration nette'
  if (delta >= 3) return 'Amélioration légère'
  if (delta <= -10) return 'Régression nette'
  if (delta <= -3) return 'Régression légère'
  return 'Stabilité'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    return new NextResponse('Organisation introuvable', { status: 404 })
  }

  const [{ data: patient, error: patientError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization.id)
        .maybeSingle(),
      supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', id)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false }),
    ])

  if (patientError || !patient) {
    return new NextResponse('Patient introuvable', { status: 404 })
  }

  const safeSessions = sessionsError || !Array.isArray(sessions) ? [] : sessions
  const latest = safeSessions[0] as Record<string, unknown> | undefined
  const latestGlobal = latest ? computeGlobal(latest) : null
  const trend = computeTrendLabel(safeSessions as Record<string, unknown>[])
  const latestNotes =
    typeof latest?.notes === 'string' && latest.notes.trim() ? latest.notes.trim() : '—'

  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Rapport clinique patient</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
          }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 28px; margin-bottom: 12px; }
          p { margin: 6px 0; }
          .muted { color: #6b7280; }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            margin-top: 12px;
          }
        </style>
      </head>
      <body>
        <h1>Rapport clinique ATPE</h1>
        <p class="muted">Document généré automatiquement</p>

        <h2>Patient</h2>
        <div class="card">
          <p><strong>Code :</strong> ${escapeHtml(String(patient.code ?? '—'))}</p>
          <p><strong>Initiales :</strong> ${escapeHtml(String(patient.initials ?? '—'))}</p>
          <p><strong>Année de naissance :</strong> ${escapeHtml(String(patient.birth_year ?? '—'))}</p>
          <p><strong>Sexe :</strong> ${escapeHtml(String(patient.sex ?? '—'))}</p>
        </div>

        <h2>Synthèse clinique</h2>
        <div class="card">
          <p><strong>Nombre de séances :</strong> ${safeSessions.length}</p>
          <p><strong>Dernier score global :</strong> ${latestGlobal !== null ? `${latestGlobal}/100` : '—'}</p>
          <p><strong>Tendance :</strong> ${escapeHtml(trend)}</p>
        </div>

        <h2>Dernières notes</h2>
        <div class="card">
          <p>${escapeHtml(latestNotes)}</p>
        </div>
      </body>
    </html>
  `

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}