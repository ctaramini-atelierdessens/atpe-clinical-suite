import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import {
  mmeOvCompleteSeed,
  MME_OV_PATIENT_ID,
} from '../lib/atpe/mme-ov-complete-seed'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

type ReferencePatient = {
  organization_id: string
  primary_clinician_id: string
}

async function getReferencePatient(): Promise<ReferencePatient> {
  const { data, error } = await supabase
    .from('patients')
    .select('organization_id, primary_clinician_id')
    .not('organization_id', 'is', null)
    .not('primary_clinician_id', 'is', null)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur lecture patient de référence : ${error.message}`)
  }

  if (!data?.organization_id || !data?.primary_clinician_id) {
    throw new Error(
      'Aucun patient de référence avec organization_id et primary_clinician_id trouvés.'
    )
  }

  return {
    organization_id: data.organization_id,
    primary_clinician_id: data.primary_clinician_id,
  }
}

async function verifyPatientExists(patientId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur vérification patient : ${error.message}`)
  }

  if (!data) {
    throw new Error(`Patient introuvable après seed : ${patientId}`)
  }
}

function buildPatientRow(reference: ReferencePatient) {
  return {
    id: mmeOvCompleteSeed.patient.id,
    organization_id: reference.organization_id,
    primary_clinician_id: reference.primary_clinician_id,
    code: mmeOvCompleteSeed.patient.code,
    initials: mmeOvCompleteSeed.patient.initials,
    birth_year: mmeOvCompleteSeed.patient.birth_year,
    sex: mmeOvCompleteSeed.patient.sex,
    referral_source: mmeOvCompleteSeed.patient.referral_source,
    case_reference: mmeOvCompleteSeed.patient.case_reference,
    status: mmeOvCompleteSeed.patient.status,
    first_contact_on: mmeOvCompleteSeed.patient.first_contact_on,
    deleted_at: null,
    deleted_by: null,
    display_name: mmeOvCompleteSeed.patient.display_name,
  }
}

async function seedPatient() {
  console.log('→ Seed patient Mme Odette Vayssié...')

  const reference = await getReferencePatient()
  const patientRow = buildPatientRow(reference)

  const { error } = await supabase
    .from('patients')
    .upsert(patientRow, { onConflict: 'id' })

  if (error) {
    throw new Error(`Erreur upsert patients : ${error.message}`)
  }

  console.log(`✅ Patient seedé : ${MME_OV_PATIENT_ID}`)
}

function buildAdvancedRows() {
  return mmeOvCompleteSeed.advanced_sessions.map((session) => ({
    id: session.id,
    patient_id: session.patient_id,
    group_id: null,
    session_id: `22222222-2222-4222-8222-${String(session.session_number).padStart(12, '0')}`,
    format: session.format,
    medium_primary: session.medium_primary,
    medium_secondary: session.medium_secondary,
    atpe_phase_dominant: session.atpe_phase_dominant,
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
    group_cohesion: null,
    group_containment: null,
    transfer_diffraction: null,
    therapist_presence_quality: session.therapist_presence_quality,
    patient_engagement_level: session.patient_engagement_level,
    therapist_feels_confusion: session.therapist_feels_confusion,
    therapist_feels_sudden_fatigue: session.therapist_feels_sudden_fatigue,
    therapist_feels_pressure: session.therapist_feels_pressure,
    therapist_feels_irritation: session.therapist_feels_irritation,
    therapist_feels_void: session.therapist_feels_void,
    patient_repeats_without_integration: session.patient_repeats_without_integration,
    group_feels_same_affect: session.group_feels_same_affect,
    tension_spreads_quickly: session.tension_spreads_quickly,
    therapist_countertransference_notes:
      session.therapist_countertransference_notes,
    clinical_hypotheses: session.clinical_hypotheses,
    next_step_recommendation: session.next_step_recommendation,
    created_at: session.created_at,
    updated_at: session.updated_at,
  }))
}

async function seedAdvancedSessions() {
  console.log('→ Seed atpe_session_advanced...')

  const rows = buildAdvancedRows()

  const { error } = await supabase
    .from('atpe_session_advanced')
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    throw new Error(`Erreur upsert atpe_session_advanced : ${error.message}`)
  }

  console.log(`✅ ${rows.length} séances avancées seedées`)
}

function buildCaseSummaryRow() {
  return {
    id: '33333333-3333-4333-8333-333333333001',
    patient_id: mmeOvCompleteSeed.patient.id,
    case_slug: mmeOvCompleteSeed.metadata.case_slug,
    title: `${mmeOvCompleteSeed.patient.display_name} — dossier ATPE complet`,
    setting: mmeOvCompleteSeed.metadata.setting,
    modality: mmeOvCompleteSeed.metadata.modality,
    dominant_case_theme: mmeOvCompleteSeed.metadata.dominant_case_theme,
    total_sessions: mmeOvCompleteSeed.metadata.total_sessions,
    expression_assessment: mmeOvCompleteSeed.expression_assessment,
    intermediate_review: mmeOvCompleteSeed.intermediate_review,
    final_review: mmeOvCompleteSeed.final_review,
    metadata: {
      ...mmeOvCompleteSeed.metadata,
      patient_id: mmeOvCompleteSeed.patient.id,
      patient_display_name: mmeOvCompleteSeed.patient.display_name,
      patient_code: mmeOvCompleteSeed.patient.code,
      patient_initials: mmeOvCompleteSeed.patient.initials,
      sessions_seeded: mmeOvCompleteSeed.advanced_sessions.length,
      source: 'seed-mme-ov-complete-case.ts',
      first_contact_on: mmeOvCompleteSeed.patient.first_contact_on,
    },
  }
}

async function seedCaseSummary() {
  console.log('→ Seed atpe_case_summaries...')

  const row = buildCaseSummaryRow()

  const { error } = await supabase
    .from('atpe_case_summaries')
    .upsert(row, { onConflict: 'id' })

  if (error) {
    throw new Error(`Erreur upsert atpe_case_summaries : ${error.message}`)
  }

  console.log('✅ atpe_case_summaries seedée')
}

async function verifyCaseSummaryExists(patientId: string) {
  const { data, error } = await supabase
    .from('atpe_case_summaries')
    .select('id, patient_id, case_slug')
    .eq('patient_id', patientId)
    .eq('case_slug', mmeOvCompleteSeed.metadata.case_slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur vérification atpe_case_summaries : ${error.message}`)
  }

  if (!data) {
    throw new Error(
      `Résumé de cas introuvable après seed pour patient_id=${patientId}`
    )
  }
}

async function verifyAdvancedSessionsCount(patientId: string) {
  const { count, error } = await supabase
    .from('atpe_session_advanced')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId)

  if (error) {
    throw new Error(
      `Erreur vérification atpe_session_advanced : ${error.message}`
    )
  }

  if ((count ?? 0) < mmeOvCompleteSeed.advanced_sessions.length) {
    throw new Error(
      `Nombre de séances insuffisant après seed : ${count ?? 0}/${mmeOvCompleteSeed.advanced_sessions.length}`
    )
  }
}

async function main() {
  console.log('→ Seed complet cas Mme Odette Vayssié...')

  await seedPatient()
  await verifyPatientExists(MME_OV_PATIENT_ID)

  await seedAdvancedSessions()
  await verifyAdvancedSessionsCount(MME_OV_PATIENT_ID)

  await seedCaseSummary()
  await verifyCaseSummaryExists(MME_OV_PATIENT_ID)

  console.log('✅ Seed complet terminé sans erreur')
}

main().catch((error) => {
  console.error('❌ Erreur seed complet Mme Odette Vayssié :')
  console.error(error)
  process.exit(1)
})