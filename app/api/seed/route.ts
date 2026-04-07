import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const db = supabase as any

  const {
    data: { user },
  } = await db.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  const clinicianId = user.id
  const fullName = user.email ?? 'Utilisateur clinique'

  await db.from('profiles').upsert({
    id: clinicianId,
    full_name: fullName,
    global_role: 'clinician',
    updated_at: new Date().toISOString(),
  } as any)

  const { data: existingMembership } = await db
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', clinicianId)
    .maybeSingle()

  let organizationId = existingMembership?.organization_id as string | undefined

  if (!organizationId) {
    const organizationName = 'Cabinet ATPE Clinical Suite'
    const slug = 'atelier-des-sens'

    const { data: organization, error: organizationError } = await db
      .from('organizations')
      .insert({
        name: organizationName,
        slug,
        created_by: clinicianId,
      } as any)
      .select('id')
      .single()

    if (organizationError || !organization) {
      return NextResponse.json(
        { error: organizationError?.message ?? 'Création organisation impossible.' },
        { status: 500 },
      )
    }

    organizationId = organization.id

    const { error: membershipError } = await db
      .from('organization_memberships')
      .insert({
        organization_id: organizationId,
        user_id: clinicianId,
        role: 'owner',
      } as any)

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 },
      )
    }
  }

  const patientCode = 'PAT-CT-001'

  const { data: existingPatient } = await db
    .from('patients')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('code', patientCode)
    .maybeSingle()

  let patientId = existingPatient?.id as string | undefined

  if (!patientId) {
    const { data: patient, error: patientError } = await db
      .from('patients')
      .insert({
        organization_id: organizationId,
        primary_clinician_id: clinicianId,
        code: patientCode,
        display_name: 'Corinne Taramini',
        initials: 'CT',
        birth_year: 1980,
        status: 'active',
        referral_source: 'seed',
      } as any)
      .select('id')
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: patientError?.message ?? 'Création patient impossible.' },
        { status: 500 },
      )
    }

    patientId = patient.id
  }

  const { data: existingEpisode } = await db
    .from('therapy_episodes')
    .select('id')
    .eq('patient_id', patientId)
    .is('closed_on', null)
    .maybeSingle()

  let episodeId = existingEpisode?.id as string | undefined

  if (!episodeId) {
    const { data: episode, error: episodeError } = await db
      .from('therapy_episodes')
      .insert({
        organization_id: organizationId,
        patient_id: patientId,
        clinician_id: clinicianId,
        episode_label: 'Suivi ATPE initial',
        status: 'active',
        opened_on: new Date().toISOString().slice(0, 10),
      } as any)
      .select('id')
      .single()

    if (episodeError || !episode) {
      return NextResponse.json(
        { error: episodeError?.message ?? 'Création épisode impossible.' },
        { status: 500 },
      )
    }

    episodeId = episode.id
  }

  const { data: existingSession } = await db
    .from('sessions')
    .select('id')
    .eq('episode_id', episodeId)
    .eq('session_number', 1)
    .maybeSingle()

  if (!existingSession) {
    const { error: sessionError } = await db
      .from('sessions')
      .insert({
        organization_id: organizationId,
        patient_id: patientId,
        episode_id: episodeId,
        clinician_id: clinicianId,
        session_number: 1,
        session_date: new Date().toISOString().slice(0, 10),
        emotional_score: 0,
        regulation_score: 0,
        engagement_score: 0,
        note: 'Première séance ATPE',
      } as any)

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 },
      )
    }
  }

  const { data: existingConsent } = await db
    .from('patient_consents')
    .select('id')
    .eq('patient_id', patientId)
    .eq('consent_kind', 'care')
    .maybeSingle()

  if (!existingConsent) {
    const { error: consentError } = await db
      .from('patient_consents')
      .insert({
        patient_id: patientId,
        consent_kind: 'care',
        status: 'granted',
        recorded_at: new Date().toISOString().slice(0, 10),
        created_by: clinicianId,
      } as any)

    if (consentError) {
      return NextResponse.json(
        { error: consentError.message },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Jeu clinique métier inséré avec organisation, épisode, séance et consentement.',
    organizationId,
    patientId,
    episodeId,
    patientCode,
  })
}