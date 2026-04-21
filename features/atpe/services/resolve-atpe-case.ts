import { createClient } from '@/lib/supabase/server'
import { getPatientClinicalOverview } from '@/lib/atpe/clinical-services'

type Nullable<T> = T | null

type PatientRow = {
  id: string
  organization_id?: string | null
  primary_clinician_id?: string | null
  code?: string | null
  initials?: string | null
  birth_year?: number | null
  sex?: string | null
  referral_source?: string | null
  case_reference?: string | null
  status?: string | null
  first_contact_on?: string | null
  display_name?: string | null
}

type CaseSummaryRow = {
  id: string
  patient_id: string
  case_slug?: string | null
  title?: string | null
  setting?: string | null
  modality?: string | null
  dominant_case_theme?: string | null
  total_sessions?: number | null
  expression_assessment?: Record<string, unknown> | null
  intermediate_review?: Record<string, unknown> | null
  final_review?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
}

type AdvancedSessionRow = {
  id: string
  patient_id: string
  session_id?: string | null
  group_id?: string | null
  format?: string | null
  medium_primary?: string | null
  medium_secondary?: string | null
  atpe_phase_dominant?: string | null
  frame_containment?: number | null
  bodily_engagement?: number | null
  decentering_level?: number | null
  centering_level?: number | null
  externalization_level?: number | null
  work_dialogue_level?: number | null
  sharing_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  projective_intensity?: number | null
  group_cohesion?: number | null
  group_containment?: number | null
  transfer_diffraction?: number | null
  therapist_presence_quality?: number | null
  patient_engagement_level?: number | null
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
  created_at?: string | null
  updated_at?: string | null
}

type ResolvedPatient = {
  id: string
  organization_id: string | null
  primary_clinician_id: string | null
  code: string | null
  initials: string | null
  birth_year: number | null
  sex: string | null
  referral_source: string | null
  case_reference: string | null
  status: string | null
  first_contact_on: string | null
  display_name: string
}

type ResolvedCase = {
  case_slug: string
  title: string
  setting: string | null
  modality: string | null
  dominant_case_theme: string | null
  total_sessions: number
  expression_assessment: Record<string, unknown>
  intermediate_review: Record<string, unknown>
  final_review: Record<string, unknown>
  metadata: Record<string, unknown>
}

export type ResolvedSession = AdvancedSessionRow & {
  session_number: number
}

export type ResolveAtpeCaseResult = {
  patient: ResolvedPatient
  case: ResolvedCase
  sessions: ResolvedSession[]
  overview: Awaited<ReturnType<typeof getPatientClinicalOverview>> | null
  expression_assessment: Record<string, unknown> | null
  protocols: Array<Record<string, unknown>>
  protocol_execution: Array<Record<string, unknown>>
  goals: Array<Record<string, unknown>>
  goal_reviews: Array<Record<string, unknown>>
  active_alerts: Array<Record<string, unknown>>
  resolution: {
    summary_source: 'database' | 'seed_fallback'
    sessions_source: 'database' | 'seed_fallback'
    clinical_source: 'database' | 'unavailable'
    warning: string | null
  }
}

function safeText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function safeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function safeBool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function safeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function normalizePatient(patient: Nullable<PatientRow>): ResolvedPatient {
  return {
    id: patient?.id ?? 'unknown-patient',
    organization_id: patient?.organization_id ?? null,
    primary_clinician_id: patient?.primary_clinician_id ?? null,
    code: patient?.code ?? null,
    initials: patient?.initials ?? null,
    birth_year: patient?.birth_year ?? null,
    sex: patient?.sex ?? null,
    referral_source: patient?.referral_source ?? null,
    case_reference: patient?.case_reference ?? null,
    status: patient?.status ?? null,
    first_contact_on: patient?.first_contact_on ?? null,
    display_name: patient?.display_name ?? 'Patient',
  }
}

function buildResolvedCaseFromSummary(summary: CaseSummaryRow): ResolvedCase {
  return {
    case_slug: safeText(summary.case_slug) ?? 'case',
    title: safeText(summary.title) ?? 'Dossier ATPE',
    setting: safeText(summary.setting),
    modality: safeText(summary.modality),
    dominant_case_theme: safeText(summary.dominant_case_theme),
    total_sessions: safeNumber(summary.total_sessions) ?? 0,
    expression_assessment: safeRecord(summary.expression_assessment),
    intermediate_review: safeRecord(summary.intermediate_review),
    final_review: safeRecord(summary.final_review),
    metadata: safeRecord(summary.metadata),
  }
}

function buildFallbackCaseFromSeed(): ResolvedCase {
  return {
    case_slug: 'fallback-case',
    title: 'Dossier ATPE (fallback)',
    setting: null,
    modality: null,
    dominant_case_theme: null,
    total_sessions: 0,
    expression_assessment: {},
    intermediate_review: {},
    final_review: {},
    metadata: {
      source: 'seed_fallback',
    },
  }
}

function normalizeAdvancedSession(
  session: AdvancedSessionRow,
  sessionNumber: number
): ResolvedSession {
  return {
    id: session.id,
    patient_id: session.patient_id,
    session_id: session.session_id ?? null,
    group_id: session.group_id ?? null,
    format: safeText(session.format),
    medium_primary: safeText(session.medium_primary),
    medium_secondary: safeText(session.medium_secondary),
    atpe_phase_dominant: safeText(session.atpe_phase_dominant),
    frame_containment: safeNumber(session.frame_containment),
    bodily_engagement: safeNumber(session.bodily_engagement),
    decentering_level: safeNumber(session.decentering_level),
    centering_level: safeNumber(session.centering_level),
    externalization_level: safeNumber(session.externalization_level),
    work_dialogue_level: safeNumber(session.work_dialogue_level),
    sharing_level: safeNumber(session.sharing_level),
    primary_symbolization: safeNumber(session.primary_symbolization),
    secondary_symbolization: safeNumber(session.secondary_symbolization),
    relational_availability: safeNumber(session.relational_availability),
    creative_mobility: safeNumber(session.creative_mobility),
    projective_intensity: safeNumber(session.projective_intensity),
    group_cohesion: safeNumber(session.group_cohesion),
    group_containment: safeNumber(session.group_containment),
    transfer_diffraction: safeNumber(session.transfer_diffraction),
    therapist_presence_quality: safeNumber(session.therapist_presence_quality),
    patient_engagement_level: safeNumber(session.patient_engagement_level),
    therapist_feels_confusion: safeBool(session.therapist_feels_confusion),
    therapist_feels_sudden_fatigue: safeBool(session.therapist_feels_sudden_fatigue),
    therapist_feels_pressure: safeBool(session.therapist_feels_pressure),
    therapist_feels_irritation: safeBool(session.therapist_feels_irritation),
    therapist_feels_void: safeBool(session.therapist_feels_void),
    patient_repeats_without_integration: safeBool(session.patient_repeats_without_integration),
    group_feels_same_affect: safeBool(session.group_feels_same_affect),
    tension_spreads_quickly: safeBool(session.tension_spreads_quickly),
    therapist_countertransference_notes: safeText(session.therapist_countertransference_notes),
    clinical_hypotheses: safeText(session.clinical_hypotheses),
    next_step_recommendation: safeText(session.next_step_recommendation),
    created_at: safeText(session.created_at),
    updated_at: safeText(session.updated_at),
    session_number: sessionNumber,
  }
}

function buildLongitudinalSessionsFallback(): ResolvedSession[] {
  return []
}

function sortSessionsChronologically(sessions: ResolvedSession[]): ResolvedSession[] {
  return [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })
}

async function fetchPatient(supabase: any, patientId: string): Promise<PatientRow | null> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      organization_id,
      primary_clinician_id,
      code,
      initials,
      birth_year,
      sex,
      referral_source,
      case_reference,
      status,
      first_contact_on,
      display_name
    `)
    .eq('id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur lecture patient : ${error.message}`)
  }

  return data ?? null
}

async function fetchCaseSummary(
  supabase: any,
  patientId: string
): Promise<{ data: CaseSummaryRow | null; warning: string | null }> {
  const { data, error } = await supabase
    .from('atpe_case_summaries')
    .select('*')
    .eq('patient_id', patientId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      warning: `Résumé de cas indisponible : ${error.message}`,
    }
  }

  return {
    data: (data ?? null) as CaseSummaryRow | null,
    warning: null,
  }
}

async function fetchAdvancedSessions(
  supabase: any,
  patientId: string
): Promise<AdvancedSessionRow[]> {
  const { data, error } = await supabase
    .from('atpe_session_advanced')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('Erreur lecture atpe_session_advanced :', error.message)
    return []
  }

  return (data ?? []) as AdvancedSessionRow[]
}

export async function resolveAtpeCase(patientId: string): Promise<ResolveAtpeCaseResult> {
  const supabase = await createClient()

  const patient = await fetchPatient(supabase, patientId)
  const caseSummaryResult = await fetchCaseSummary(supabase, patientId)
  const advancedSessions = await fetchAdvancedSessions(supabase, patientId)

  const resolvedCase = caseSummaryResult.data
    ? buildResolvedCaseFromSummary(caseSummaryResult.data)
    : buildFallbackCaseFromSeed()

  const resolvedSessions = sortSessionsChronologically(
    advancedSessions.length > 0
      ? advancedSessions.map((session, index) =>
          normalizeAdvancedSession(session, index + 1)
        )
      : buildLongitudinalSessionsFallback()
  )

  let overview: Awaited<ReturnType<typeof getPatientClinicalOverview>> | null = null
  let latestExpressionAssessment: Record<string, unknown> | null = null
  let activeProtocols: Array<Record<string, unknown>> = []
  let protocolExecution: Array<Record<string, unknown>> = []
  let goals: Array<Record<string, unknown>> = []
  let goalReviews: Array<Record<string, unknown>> = []
  let activeAlerts: Array<Record<string, unknown>> = []

  try {
    overview = await getPatientClinicalOverview(patientId, supabase)
  } catch (error) {
    console.warn('Overview clinique indisponible :', error)
  }

  try {
    const { data, error } = await supabase
      .from('latest_expression_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) {
      console.warn('Erreur lecture latest_expression_assessments :', error)
    } else {
      latestExpressionAssessment = (data ?? null) as Record<string, unknown> | null
    }
  } catch (error) {
    console.warn('Bilan expressionnel indisponible :', error)
  }

  try {
    const activeEpisodeId = overview?.active_episode_id ?? null

    if (activeEpisodeId) {
      const { data, error } = await supabase
        .from('episode_protocol_assignments')
        .select(`
          id,
          status,
          assigned_on,
          rationale,
          therapy_protocols (
            id,
            title,
            description,
            modality,
            target_indications
          )
        `)
        .eq('episode_id', activeEpisodeId)
        .eq('status', 'active')

      if (error) {
        console.warn('Erreur lecture protocoles actifs :', error)
      } else {
        activeProtocols = data ?? []
      }
    }
  } catch (error) {
    console.warn('Protocoles actifs indisponibles :', error)
  }

  try {
    const sessionIds = resolvedSessions
      .map((s) => s.session_id)
      .filter((v): v is string => typeof v === 'string' && v.length > 0)

    if (sessionIds.length > 0) {
      const { data, error } = await supabase
        .from('session_protocol_execution')
        .select(`
          *,
          protocol_steps (
            id,
            step_order,
            title,
            description,
            expected_outcome,
            media_suggestion
          )
        `)
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Erreur lecture exécution protocole :', error)
      } else {
        protocolExecution = data ?? []
      }
    }
  } catch (error) {
    console.warn('Exécution protocole indisponible :', error)
  }

  try {
    const activeEpisodeId = overview?.active_episode_id ?? null

    if (activeEpisodeId) {
      const { data, error } = await supabase
        .from('therapy_goals')
        .select('*')
        .eq('episode_id', activeEpisodeId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Erreur lecture objectifs actifs :', error)
      } else {
        goals = data ?? []
      }
    }
  } catch (error) {
    console.warn('Objectifs actifs indisponibles :', error)
  }

  try {
    const sessionIds = resolvedSessions
      .map((s) => s.session_id)
      .filter((v): v is string => typeof v === 'string' && v.length > 0)

    if (sessionIds.length > 0) {
      const { data, error } = await supabase
        .from('session_goal_reviews')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Erreur lecture revues objectifs :', error)
      } else {
        goalReviews = data ?? []
      }
    }
  } catch (error) {
    console.warn('Revues objectifs indisponibles :', error)
  }

  try {
    const { data, error } = await supabase
      .from('active_atpe_alerts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.warn('Erreur lecture active_atpe_alerts :', error)
    } else {
      activeAlerts = data ?? []
    }
  } catch (error) {
    console.warn('Alertes actives indisponibles :', error)
  }

  return {
    patient: normalizePatient(patient),
    case: resolvedCase,
    sessions: resolvedSessions,
    overview,
    expression_assessment:
      latestExpressionAssessment ??
      (Object.keys(resolvedCase.expression_assessment).length > 0
        ? resolvedCase.expression_assessment
        : null),
    protocols: activeProtocols,
    protocol_execution: protocolExecution,
    goals,
    goal_reviews: goalReviews,
    active_alerts: activeAlerts,
    resolution: {
      summary_source: caseSummaryResult.data ? 'database' : 'seed_fallback',
      sessions_source: advancedSessions.length > 0 ? 'database' : 'seed_fallback',
      clinical_source: overview ? 'database' : 'unavailable',
      warning: caseSummaryResult.warning,
    },
  }
}