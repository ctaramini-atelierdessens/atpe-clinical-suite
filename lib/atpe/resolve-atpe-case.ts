import { createClient } from '@supabase/supabase-js'
import { mmeOvCompleteSeed } from '@/lib/atpe/mme-ov-complete-seed'

export type PatientRow = {
  id: string
  display_name: string | null
  code: string | null
  initials: string | null
  status: string | null
  birth_year: number | null
  sex: string | null
  referral_source: string | null
  case_reference: string | null
  first_contact_on: string | null
  created_at: string | null
  updated_at: string | null
}

export type CaseSummaryRow = {
  id: string
  patient_id: string
  case_slug: string
  title: string
  setting: string | null
  modality: string | null
  dominant_case_theme: string | null
  total_sessions: number
  expression_assessment: Record<string, unknown> | null
  intermediate_review: Record<string, unknown> | null
  final_review: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type AdvancedSessionRow = {
  id: string
  patient_id: string
  group_id: string | null
  session_id: string | null
  format: string | null
  medium_primary: string | null
  medium_secondary: string | null
  atpe_phase_dominant:
    | 'attitude_interieure'
    | 'creation'
    | 'dialogue_oeuvre'
    | 'partage'
    | null
  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  patient_engagement_level: number | null
  therapist_feels_confusion: boolean | null
  therapist_feels_sudden_fatigue: boolean | null
  therapist_feels_pressure: boolean | null
  therapist_feels_irritation: boolean | null
  therapist_feels_void: boolean | null
  patient_repeats_without_integration: boolean | null
  group_feels_same_affect: boolean | null
  tension_spreads_quickly: boolean | null
  therapist_countertransference_notes: string | null
  clinical_hypotheses: string | null
  next_step_recommendation: string | null
  created_at: string | null
  updated_at: string | null
}

export type ResolvedCase = {
  source: 'database_summary' | 'seed_fallback'
  case_slug: string
  title: string
  setting: string | null
  modality: string | null
  dominant_case_theme: string | null
  total_sessions: number
  expression_assessment: {
    indication?: string
    resources?: string[]
    vulnerabilities?: string[]
    objective?: string
    recommended_frame?: string[]
    dominant_mediations?: string[]
    clinical_focus?: string
  }
  intermediate_review: {
    title?: string
    summary?: string
    main_evolutions?: string[]
    team_implications?: string[]
  }
  final_review: {
    title?: string
    summary?: string
    major_transformations?: string[]
    team_recommendations?: string[]
    clinical_signature?: string
  }
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type ResolvedSession = {
  id: string
  session_number?: number
  created_at: string | null
  updated_at?: string | null
  format: string | null
  medium_primary: string | null
  medium_secondary?: string | null
  atpe_phase_dominant: string | null
  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  patient_engagement_level: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
  therapist_countertransference_notes?: string | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null
  longitudinal_title?: string
  longitudinal_phase?: 'installation' | 'mobilisation' | 'pivot' | 'consolidation'
  dominant_clinical_theme?: string
  clinical_status?: string
  therapeutic_focus?: string
  key_effects?: string[]
  clinical_reading?: string
}

export type ResolvedAtpeCasePayload = {
  patient: {
    id: string
    display_name: string
    code: string
    initials: string
    status: string
    birth_year: number | null
    sex: string
    referral_source: string
    case_reference: string
    first_contact_on: string
    created_at: string
    updated_at: string
  }
  case: ResolvedCase
  sessions: ResolvedSession[]
  resolution: {
    summary_source: 'database' | 'seed_fallback'
    sessions_source: 'database' | 'seed_fallback'
    warning: string | null
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function safeText(value: string | null | undefined, fallback = '—') {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date)
}

function normalizePatient(patient: PatientRow) {
  return {
    id: patient.id,
    display_name:
      patient.display_name || patient.code || patient.initials || 'Patient',
    code: safeText(patient.code),
    initials: safeText(patient.initials),
    status: safeText(patient.status),
    birth_year: patient.birth_year ?? null,
    sex: safeText(patient.sex),
    referral_source: safeText(patient.referral_source),
    case_reference: safeText(patient.case_reference),
    first_contact_on: formatDate(patient.first_contact_on),
    created_at: formatDate(patient.created_at),
    updated_at: formatDate(patient.updated_at),
  }
}

function buildFallbackCaseFromSeed(): ResolvedCase {
  return {
    source: 'seed_fallback',
    case_slug: mmeOvCompleteSeed.metadata.case_slug,
    title: `${mmeOvCompleteSeed.patient.display_name} — dossier ATPE complet`,
    setting: mmeOvCompleteSeed.metadata.setting,
    modality: mmeOvCompleteSeed.metadata.modality,
    dominant_case_theme: mmeOvCompleteSeed.metadata.dominant_case_theme,
    total_sessions: mmeOvCompleteSeed.metadata.total_sessions,
    expression_assessment: mmeOvCompleteSeed.expression_assessment,
    intermediate_review: mmeOvCompleteSeed.intermediate_review,
    final_review: mmeOvCompleteSeed.final_review,
    metadata: mmeOvCompleteSeed.metadata,
  }
}

function buildResolvedCaseFromSummary(summary: CaseSummaryRow): ResolvedCase {
  return {
    source: 'database_summary',
    case_slug: summary.case_slug,
    title: summary.title,
    setting: summary.setting,
    modality: summary.modality,
    dominant_case_theme: summary.dominant_case_theme,
    total_sessions: summary.total_sessions,
    expression_assessment: summary.expression_assessment ?? {},
    intermediate_review: summary.intermediate_review ?? {},
    final_review: summary.final_review ?? {},
    metadata: summary.metadata ?? {},
    created_at: summary.created_at,
    updated_at: summary.updated_at,
  }
}

function buildLongitudinalSessionsFallback(): ResolvedSession[] {
  return mmeOvCompleteSeed.advanced_sessions.map((session) => ({
    id: session.id,
    session_number: session.session_number,
    created_at: session.created_at,
    updated_at: session.updated_at,
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
    therapist_countertransference_notes: session.therapist_countertransference_notes,
    clinical_hypotheses: session.clinical_hypotheses,
    next_step_recommendation: session.next_step_recommendation,
    longitudinal_title: session.longitudinal_title,
    longitudinal_phase: session.longitudinal_phase,
    dominant_clinical_theme: session.dominant_clinical_theme,
    clinical_status: session.clinical_status,
    therapeutic_focus: session.therapeutic_focus,
    key_effects: session.key_effects,
    clinical_reading: session.clinical_reading,
  }))
}

function sortSessionsChronologically<
  T extends { created_at: string | null; session_number?: number }
>(sessions: T[]): T[] {
  return [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0

    if (da !== db) return da - db

    const sa = typeof a.session_number === 'number' ? a.session_number : 0
    const sb = typeof b.session_number === 'number' ? b.session_number : 0

    return sa - sb
  })
}

function enrichSessionsWithSeedNarrative(
  sessions: Array<ResolvedSession & { session_number: number }>
): ResolvedSession[] {
  const seedByNumber = new Map(
    mmeOvCompleteSeed.advanced_sessions.map((seedSession) => [
      seedSession.session_number,
      seedSession,
    ])
  )

  return sessions.map((session) => {
    const seedSession = seedByNumber.get(session.session_number)

    if (!seedSession) return session

    return {
      ...session,
      longitudinal_title: seedSession.longitudinal_title,
      longitudinal_phase: seedSession.longitudinal_phase,
      dominant_clinical_theme: seedSession.dominant_clinical_theme,
      clinical_status: seedSession.clinical_status,
      therapeutic_focus: seedSession.therapeutic_focus,
      key_effects: seedSession.key_effects,
      clinical_reading: seedSession.clinical_reading,
    }
  })
}

async function readPatient(
  supabase: ReturnType<typeof createClient>,
  patientId: string
) {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      display_name,
      code,
      initials,
      status,
      birth_year,
      sex,
      referral_source,
      case_reference,
      first_contact_on,
      created_at,
      updated_at
    `)
    .eq('id', patientId)
    .maybeSingle<PatientRow>()

  if (error) {
    throw new Error(`Erreur lecture patient : ${error.message}`)
  }

  return data ?? null
}

async function readCaseSummary(
  supabase: ReturnType<typeof createClient>,
  patientId: string
) {
  const { data, error } = await supabase
    .from('atpe_case_summaries')
    .select(`
      id,
      patient_id,
      case_slug,
      title,
      setting,
      modality,
      dominant_case_theme,
      total_sessions,
      expression_assessment,
      intermediate_review,
      final_review,
      metadata,
      created_at,
      updated_at
    `)
    .eq('patient_id', patientId)
    .eq('case_slug', mmeOvCompleteSeed.metadata.case_slug)
    .maybeSingle<CaseSummaryRow>()

  if (error) {
    const ignorableCodes = new Set(['PGRST205', 'PGRST204', '42P01'])

    if (ignorableCodes.has(error.code ?? '')) {
      return { data: null, warning: error.message }
    }

    throw new Error(`Erreur lecture atpe_case_summaries : ${error.message}`)
  }

  return {
    data: data ?? null,
    warning: null as string | null,
  }
}

async function readAdvancedSessions(
  supabase: ReturnType<typeof createClient>,
  patientId: string
) {
  const { data, error } = await supabase
    .from('atpe_session_advanced')
    .select(`
      id,
      patient_id,
      group_id,
      session_id,
      format,
      medium_primary,
      medium_secondary,
      atpe_phase_dominant,
      frame_containment,
      bodily_engagement,
      decentering_level,
      centering_level,
      externalization_level,
      work_dialogue_level,
      sharing_level,
      primary_symbolization,
      secondary_symbolization,
      relational_availability,
      creative_mobility,
      projective_intensity,
      therapist_presence_quality,
      patient_engagement_level,
      therapist_feels_confusion,
      therapist_feels_sudden_fatigue,
      therapist_feels_pressure,
      therapist_feels_irritation,
      therapist_feels_void,
      patient_repeats_without_integration,
      group_feels_same_affect,
      tension_spreads_quickly,
      therapist_countertransference_notes,
      clinical_hypotheses,
      next_step_recommendation,
      created_at,
      updated_at
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })
    .returns<AdvancedSessionRow[]>()

  if (error) {
    throw new Error(`Erreur lecture atpe_session_advanced : ${error.message}`)
  }

  return Array.isArray(data) ? data : []
}

export async function resolveAtpeCase(
  patientId: string
): Promise<ResolvedAtpeCasePayload> {
  const supabase = getSupabaseAdmin()

  const patient = await readPatient(supabase, patientId)

  if (!patient) {
    throw new Error('Patient introuvable')
  }

  const caseSummaryResult = await readCaseSummary(supabase, patientId)
  const advancedSessions = await readAdvancedSessions(supabase, patientId)

  const resolvedCase = caseSummaryResult.data
    ? buildResolvedCaseFromSummary(caseSummaryResult.data)
    : buildFallbackCaseFromSeed()

  const baseSessions = sortSessionsChronologically(
    advancedSessions.length > 0
      ? advancedSessions.map((session, index) => ({
          ...session,
          session_number: index + 1,
        }))
      : buildLongitudinalSessionsFallback()
  )

  const resolvedSessions =
    advancedSessions.length > 0
      ? enrichSessionsWithSeedNarrative(
          baseSessions as Array<ResolvedSession & { session_number: number }>
        )
      : baseSessions

  return {
    patient: normalizePatient(patient),
    case: resolvedCase,
    sessions: resolvedSessions,
    resolution: {
      summary_source: caseSummaryResult.data ? 'database' : 'seed_fallback',
      sessions_source: advancedSessions.length > 0 ? 'database' : 'seed_fallback',
      warning: caseSummaryResult.warning,
    },
  }
}