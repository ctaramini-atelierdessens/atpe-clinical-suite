import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeHtml(value: string | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function nl2br(value: string | null | undefined) {
  return escapeHtml(value).replace(/\n/g, '<br/>')
}

function labelStatus(status: string | null | undefined) {
  switch (status) {
    case 'draft':
      return 'Brouillon'
    case 'intake_started':
      return 'Entame du bilan'
    case 'discovery_in_progress':
      return 'Découverte en cours'
    case 'final_interview_done':
      return 'Entretien final réalisé'
    case 'trial_sessions':
      return "Séances d'essai"
    case 'recommended':
      return 'Recommandé'
    case 'deferred':
      return 'Différé'
    case 'refused':
      return 'Refusé'
    case 'converted_to_care':
      return 'Converti en prise en charge'
    default:
      return status || 'Non renseigné'
  }
}

function interviewTypeLabel(type: string | null | undefined) {
  switch (type) {
    case 'primo':
      return 'Primo-entretien'
    case 'final':
      return 'Entretien final'
    case 'requester':
      return 'Entretien avec le demandeur'
    case 'family':
      return 'Entretien avec la famille'
    case 'team':
      return "Entretien avec l'équipe"
    default:
      return type || 'Entretien'
  }
}

function sessionTypeLabel(type: string | null | undefined) {
  switch (type) {
    case 'discovery':
      return 'Séance découverte pluriexpressionnelle'
    case 'music_receptivity':
      return 'Séance de réceptivité musicale'
    case 'trial_group':
      return "Séance d'essai en groupe"
    case 'trial_individual':
      return "Séance d'essai individuelle"
    case 'other':
      return 'Autre séance du bilan'
    default:
      return type || 'Séance'
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; assessmentId: string }> }
) {
  const { id, assessmentId } = await context.params
  const supabase = await createClient()

  const [
    { data: patient },
    { data: assessment },
    { data: interviews },
    { data: sessions },
    { data: objectives },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('expression_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('patient_id', id)
      .maybeSingle(),
    supabase
      .from('expression_assessment_interviews')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('interview_date', { ascending: true }),
    supabase
      .from('expression_assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('session_number', { ascending: true, nullsFirst: false })
      .order('session_date', { ascending: true }),
    supabase
      .from('therapeutic_objectives')
      .select(`
        *,
        objective_items (
          id,
          label,
          item_order,
          polarity
        )
      `)
      .eq('patient_id', id)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true }),
  ])

  if (!patient || !assessment) {
    return new NextResponse('Bilan introuvable.', { status: 404 })
  }

  const safePatient = patient as any
  const safeAssessment = assessment as any
  const safeInterviews = (interviews ?? []) as any[]
  const safeSessions = (sessions ?? []) as any[]
  const safeObjectives = (objectives ?? []) as any[]

  const patientLabel =
    safePatient.code ||
    safePatient.initials ||
    safePatient.display_name ||
    safePatient.last_name ||
    safePatient.first_name ||
    'Patient'

  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Bilan expressionnel</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 16mm 18mm 16mm;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      font-size: 12px;
      line-height: 1.45;
    }

    h1, h2, h3 {
      margin: 0;
    }

    .cover {
      border: 1px solid #cbd5e1;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 22px;
      background: #f8fafc;
    }

    .eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 8px;
    }

    .title {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 13px;
      color: #475569;
    }

    .meta-grid {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .meta-card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px;
      background: white;
    }

    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }

    .section {
      margin-top: 22px;
      page-break-inside: avoid;
    }

    .section h2 {
      font-size: 16px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }

    .small {
      color: #475569;
      font-size: 11px;
    }

    .label {
      font-weight: 700;
      color: #0f172a;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 999px;
      background: #e2e8f0;
      color: #334155;
      font-size: 11px;
      margin-right: 6px;
      margin-bottom: 6px;
    }

    ul {
      margin: 8px 0 0 18px;
      padding: 0;
    }

    li {
      margin: 4px 0;
    }

    .empty {
      color: #64748b;
      font-style: italic;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="eyebrow">Module préalable ATPE</div>
    <div class="title">Bilan expressionnel</div>
    <div class="subtitle">Document de synthèse clinique imprimable</div>

    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Patient</div>
        <div>${escapeHtml(patientLabel)}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Statut du bilan</div>
        <div>${escapeHtml(labelStatus(safeAssessment.status))}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Date de la demande</div>
        <div>${escapeHtml(safeAssessment.request_date || 'Non renseignée')}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Demandeur</div>
        <div>${escapeHtml(safeAssessment.requested_by || 'Non renseigné')}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>1. Données générales du bilan</h2>
    <div class="card">
      <p><span class="label">Type de demande :</span> ${escapeHtml(safeAssessment.request_type || 'Non renseigné')}</p>
      <p><span class="label">Séances d'essai prévues :</span> ${
        safeAssessment.trial_sessions_required
          ? `${escapeHtml(String(safeAssessment.trial_sessions_count ?? 0))}`
          : 'Non'
      }</p>
      <p><span class="label">Clôture du bilan :</span> ${escapeHtml(safeAssessment.closed_at || 'Non clôturé')}</p>
    </div>
  </div>

  <div class="section">
    <h2>2. Élaboration clinique initiale</h2>
    <div class="card">
      <p class="label">Connaissance préalable</p>
      <p>${nl2br(safeAssessment.prior_knowledge_summary || 'Non renseignée')}</p>
    </div>
    <div class="card">
      <p class="label">Pré-recommandation</p>
      <p>${nl2br(safeAssessment.initial_recommendation || 'Non renseignée')}</p>
    </div>
    <div class="card">
      <p class="label">Objectifs initiaux rédigés dans le bilan</p>
      <p>${nl2br(safeAssessment.initial_objectives || 'Non renseignés')}</p>
    </div>
    <div class="card">
      <p class="label">Modalités proposées</p>
      <p>${nl2br(safeAssessment.proposed_modalities || 'Non renseignées')}</p>
    </div>
  </div>

  <div class="section">
    <h2>3. Entretiens du bilan</h2>
    ${
      safeInterviews.length
        ? safeInterviews
            .map(
              (item) => `
      <div class="card">
        <div>
          <span class="badge">${escapeHtml(interviewTypeLabel(item.interview_type))}</span>
          <span class="badge">${escapeHtml(item.interview_date || 'Date non renseignée')}</span>
          <span class="badge">${escapeHtml(item.duration_minutes ? `${item.duration_minutes} min` : 'Durée non renseignée')}</span>
        </div>
        <p><span class="label">Raisons de la consultation :</span> ${nl2br(item.reason_for_consultation || 'Non renseigné')}</p>
        <p><span class="label">Attentes :</span> ${nl2br(item.expectations || 'Non renseigné')}</p>
        <p><span class="label">Intérêts artistiques :</span> ${nl2br(item.artistic_interests || 'Non renseigné')}</p>
        <p><span class="label">Pratique artistique :</span> ${nl2br(item.artistic_practice || 'Non renseigné')}</p>
        <p><span class="label">Observations cliniques :</span> ${nl2br(item.clinical_observations || 'Non renseigné')}</p>
      </div>
    `
            )
            .join('')
        : `<div class="card"><p class="empty">Aucun entretien enregistré.</p></div>`
    }
  </div>

  <div class="section">
    <h2>4. Séances du bilan</h2>
    ${
      safeSessions.length
        ? safeSessions
            .map(
              (item) => `
      <div class="card">
        <div>
          <span class="badge">${escapeHtml(sessionTypeLabel(item.session_type))}</span>
          <span class="badge">${escapeHtml(item.session_number ? `n°${item.session_number}` : 'Sans numéro')}</span>
          <span class="badge">${escapeHtml(item.session_date || 'Date non renseignée')}</span>
          <span class="badge">${escapeHtml(item.duration_minutes ? `${item.duration_minutes} min` : 'Durée non renseignée')}</span>
        </div>
        <p><span class="label">Notes de contexte :</span> ${nl2br(item.context_notes || 'Non renseigné')}</p>
        <p><span class="label">Synthèse clinique :</span> ${nl2br(item.clinical_summary || 'Non renseigné')}</p>
      </div>
    `
            )
            .join('')
        : `<div class="card"><p class="empty">Aucune séance enregistrée.</p></div>`
    }
  </div>

  <div class="section page-break">
    <h2>5. Objectifs thérapeutiques initiaux</h2>
    ${
      safeObjectives.length
        ? safeObjectives
            .map(
              (objective) => `
      <div class="card">
        <p><span class="label">Titre :</span> ${escapeHtml(objective.title || 'Sans titre')}</p>
        <p><span class="label">Type :</span> ${escapeHtml(objective.objective_type || 'Non renseigné')}</p>
        <p><span class="label">Statut :</span> ${escapeHtml(objective.status || 'Non renseigné')}</p>
        <p><span class="label">Direction :</span> ${escapeHtml(objective.directionality || 'Non renseignée')}</p>
        <p><span class="label">Description :</span> ${nl2br(objective.description || 'Non renseignée')}</p>
        <p class="label">Items observables</p>
        ${
          objective.objective_items?.length
            ? `<ul>${[...objective.objective_items]
                .sort((a: any, b: any) => a.item_order - b.item_order)
                .map((item: any) => `<li>${escapeHtml(item.label)}</li>`)
                .join('')}</ul>`
            : `<p class="empty">Aucun item observable.</p>`
        }
      </div>
    `
            )
            .join('')
        : `<div class="card"><p class="empty">Aucun objectif enregistré.</p></div>`
    }
  </div>

  <div class="section">
    <h2>6. Recommandation finale et conclusion</h2>
    <div class="card">
      <p class="label">Recommandation finale</p>
      <p>${nl2br(safeAssessment.final_recommendation || 'Non renseignée')}</p>
    </div>

    <div class="card">
      <p class="label">Cadre proposé / modalités</p>
      <p>${nl2br(safeAssessment.proposed_modalities || 'Non renseignées')}</p>
    </div>

    <div class="card">
      <p class="label">Statut final du bilan</p>
      <p>${escapeHtml(labelStatus(safeAssessment.status))}</p>
    </div>
  </div>
</body>
</html>
`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="bilan-expressionnel-${assessmentId}.html"`,
    },
  })
}