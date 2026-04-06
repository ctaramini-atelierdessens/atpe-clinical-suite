import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinicianId = user.id
  const fullName = user.email ?? 'Utilisateur clinique'

  await supabase.from('profiles').upsert({
    id: clinicianId,
    full_name: fullName,
    global_role: 'clinician',
    updated_at: new Date().toISOString(),
  })

  const { data: existingMembership } = await supabase
    .from('organization_memberships')
    .select('organization_id, role')
    .eq('user_id', clinicianId)
    .limit(1)
    .maybeSingle()

  let organizationId = existingMembership?.organization_id

  if (!organizationId) {
    const organizationName = 'Cabinet ATPE Clinical Suite'
    const slug = `${slugify(organizationName)}-${clinicianId.slice(0, 8)}`

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug,
        created_by: clinicianId,
      })
      .select('id')
      .single()

    if (organizationError || !organization) {
      return NextResponse.json({ error: organizationError?.message ?? 'Erreur création organisation' }, { status: 500 })
    }

    organizationId = organization.id

    const { error: membershipError } = await supabase.from('organization_memberships').insert({
      organization_id: organizationId,
      user_id: clinicianId,
      role: 'owner',
    })

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 })
    }
  }

  await supabase.from('organization_security_policies').upsert({
    organization_id: organizationId,
    default_retention_days: 2555,
    signed_consent_retention_days: 3650,
    documents_bucket: 'clinical-documents',
    consent_signatures_bucket: 'clinical-documents',
    supervisor_notification_channel: 'in_app',
    updated_at: new Date().toISOString(),
  })

  const { data: existingPatients } = await supabase.from('patients').select('id').eq('organization_id', organizationId).limit(1)
  if (existingPatients && existingPatients.length > 0) {
    return NextResponse.json({ ok: true, message: 'Base déjà remplie avec le schéma clinique métier.' })
  }

  const { data: patientRows, error: patientsError } = await supabase
    .from('patients')
    .insert([
      {
        organization_id: organizationId,
        primary_clinician_id: clinicianId,
        code: 'ATPE-OV-001',
        initials: 'OV',
        birth_year: 1976,
        sex: 'F',
        referral_source: 'Orientation thérapeutique interne',
        case_reference: 'DOS-ATPE-2026-001',
        status: 'active',
        first_contact_on: '2026-01-12',
      },
      {
        organization_id: organizationId,
        primary_clinician_id: clinicianId,
        code: 'ATPE-MB-002',
        initials: 'MB',
        birth_year: 1982,
        sex: 'F',
        referral_source: 'Médecin traitant',
        case_reference: 'DOS-ATPE-2026-002',
        status: 'paused',
        first_contact_on: '2026-02-03',
      },
    ])
    .select('*')

  if (patientsError || !patientRows) {
    return NextResponse.json({ error: patientsError?.message ?? 'Erreur patients' }, { status: 500 })
  }

  const episodesPayload = patientRows.map((patient, index) => ({
    organization_id: organizationId,
    patient_id: patient.id,
    clinician_id: clinicianId,
    episode_label: index === 0 ? 'Suivi art-thérapeutique principal' : 'Stabilisation et réengagement',
    referral_reason:
      index === 0
        ? 'Troubles de la continuité psychocorporelle, besoin de médiation symbolique progressive'
        : 'Reprise de suivi après phase de retrait et besoin de réaccrochage corporel',
    therapeutic_frame: '1 séance hebdomadaire, médiation principale mixte, cadre stable et descriptif',
    clinical_indication:
      index === 0
        ? 'Renforcer régulation, engagement et inscription symbolique sans automatisation décisionnelle'
        : 'Soutenir reprise d’investissement et continuité minimale stable',
    objectives_summary:
      index === 0
        ? 'Améliorer la continuité, la régulation et la capacité de représentation'
        : 'Stabiliser les acquis et favoriser le retour à la participation',
    status: 'active',
    opened_on: index === 0 ? '2026-01-12' : '2026-02-03',
  }))

  const { data: episodeRows, error: episodeError } = await supabase.from('therapy_episodes').insert(episodesPayload).select('*')
  if (episodeError || !episodeRows) {
    return NextResponse.json({ error: episodeError?.message ?? 'Erreur épisodes' }, { status: 500 })
  }

  const firstPatient = patientRows[0]
  const firstEpisode = episodeRows.find((episode) => episode.patient_id === firstPatient.id)

  if (!firstEpisode) {
    return NextResponse.json({ error: 'Épisode principal introuvable' }, { status: 500 })
  }

  await supabase.from('patient_consents').insert([
    {
      patient_id: firstPatient.id,
      consent_kind: 'care',
      status: 'granted',
      note: 'Consentement au suivi art-thérapeutique enregistré.',
      created_by: clinicianId,
    },
    {
      patient_id: firstPatient.id,
      consent_kind: 'data_processing',
      status: 'granted',
      note: 'Information RGPD remise et consentement traitement documenté.',
      created_by: clinicianId,
    },
  ])

  await supabase.from('therapy_goals').insert([
    {
      episode_id: firstEpisode.id,
      title: 'Stabiliser la continuité psychocorporelle',
      description: 'Soutenir une continuité minimale stable séance après séance.',
      priority: 'high',
      status: 'in_progress',
      target_review_date: '2026-06-30',
    },
    {
      episode_id: firstEpisode.id,
      title: 'Renforcer engagement et symbolisation',
      description: 'Favoriser l’investissement dans la médiation et l’élaboration symbolique.',
      priority: 'medium',
      status: 'in_progress',
      target_review_date: '2026-06-30',
    },
  ])

  const sessions = Array.from({ length: 8 }, (_, index) => ({
    organization_id: organizationId,
    patient_id: firstPatient.id,
    episode_id: firstEpisode.id,
    clinician_id: clinicianId,
    session_number: index + 1,
    session_date: new Date(Date.now() - (8 - index) * 86400000 * 7).toISOString().slice(0, 10),
    duration_minutes: 55,
    setting_type: 'cabinet',
    mediation_type: index < 3 ? 'mixte' : 'musique',
    frame_quality: index < 2 ? 'fragile' : 'stable',
    emotional_score: 3 + Math.min(index, 4),
    body_score: 4 + Math.min(index, 4),
    awareness_score: 3 + Math.min(index, 5),
    dynamic_score: 2 + Math.min(index, 5),
    symbolic_score: 3 + Math.min(index, 5),
    regulation_score: 4 + Math.min(index, 4),
    engagement_score: 4 + Math.min(index, 4),
    note: 'Trace descriptive de séance, sans recommandation automatisée.',
    clinical_summary:
      index < 4
        ? 'Consolidation progressive du cadre, émergence d’une continuité plus stable.'
        : 'Stabilisation des acquis avec engagement plus fiable dans la médiation.',
    therapist_hypothesis: 'Hypothèse descriptive de progression de la régulation et de l’engagement.',
  }))

  const checklist = [
    ['0-30', 'Réglementaire', 'Rédiger usage prévu', 'Critique', 'Validé', 'Fiche usage prévu v1'],
    ['0-30', 'Architecture', 'Cartographier l’architecture technique', 'Critique', 'En cours', 'Schéma architecture'],
    ['30-60', 'RGPD', 'Réaliser AIPD', 'Critique', 'À faire', 'Rapport AIPD'],
    ['30-60', 'Sécurité', 'Déployer audit logs', 'Critique', 'À faire', 'Journal d’audit'],
    ['60-90', 'Pré-CE', 'Cartographier modules à risque DM', 'Haute', 'À faire', 'Cartographie DM'],
  ].map(([phase, workstream, task, priority, status, deliverable]) => ({
    organization_id: organizationId,
    phase,
    workstream,
    task,
    priority,
    status,
    deliverable,
    owner: fullName,
  }))

  const risks = [
    {
      organization_id: organizationId,
      title: 'Erreur de saisie clinique',
      cause: 'Champ descriptif incomplet ou séance non relue',
      impact: 'Lecture longitudinale biaisée',
      probability: 3,
      severity: 4,
      mitigation: 'Validation des champs + revue clinique + historique des modifications',
      residual_risk: 'Modéré',
      status: 'Sous contrôle',
    },
    {
      organization_id: organizationId,
      title: 'Export non sécurisé',
      cause: 'PDF partagé hors canal prévu',
      impact: 'Atteinte à la confidentialité',
      probability: 2,
      severity: 5,
      mitigation: 'Journalisation, politique d’export et restriction par rôle',
      residual_risk: 'Modéré à faible si journalisé',
      status: 'Ouvert',
    },
  ]

  const [{ error: sessionsError }, { error: checklistError }, { error: risksError }, { error: auditError }] = await Promise.all([
    supabase.from('sessions').insert(sessions as never),
    supabase.from('checklist_items').insert(checklist as never),
    supabase.from('risk_items').insert(risks as never),
    supabase.from('audit_logs').insert({
      organization_id: organizationId,
      actor_user_id: clinicianId,
      entity_type: 'seed',
      action: 'create',
      metadata: { source: 'api_seed', schema: 'clinical_v6' },
    } as never),
  ])

  if (sessionsError || checklistError || risksError || auditError) {
    return NextResponse.json(
      {
        error: sessionsError?.message ?? checklistError?.message ?? risksError?.message ?? auditError?.message ?? 'Erreur seed',
      },
      { status: 500 },
    )
  }

  

await supabase.from('patient_access_logs').insert({
  organization_id: organizationId,
  patient_id: firstPatient.id,
  actor_user_id: clinicianId,
  access_scope: 'seed_bootstrap',
  route: '/api/seed',
} as never)

const { data: insertedSessions } = await supabase.from('sessions').select('id').eq('patient_id', firstPatient.id).order('session_number', { ascending: false }).limit(1)
const latestSessionId = insertedSessions?.[0]?.id ?? null

await supabase.from('clinical_review_requests').insert({
  organization_id: organizationId,
  patient_id: firstPatient.id,
  session_id: latestSessionId,
  requested_by: clinicianId,
  status: 'submitted',
  request_note: 'Relire la dernière note clinique et valider la cohérence du résumé longitudinal.',
  submitted_at: new Date().toISOString(),
} as never)
return NextResponse.json({ ok: true, message: 'Jeu clinique métier inséré avec organisation, épisodes, consentements et séances.' })
}
