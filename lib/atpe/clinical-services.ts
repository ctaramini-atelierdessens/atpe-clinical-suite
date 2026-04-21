import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/database.types"
import type {
  AtpeGlobalAlert,
  AtpeGlobalAlertInsert,
  AtpeSessionAdvanced,
  AtpeSessionAdvancedInsert,
  ClinicalAnalysis,
  ClinicalAnalysisInsert,
  CreateExpressionAssessmentPayload,
  CreateProtocolWithStepsPayload,
  EpisodeProtocolAssignment,
  EpisodeProtocolAssignmentInsert,
  ExpressionAssessment,
  PatientClinicalOverview,
  SessionClinicalBundle,
  SessionGoalReviewInsert,
  SessionObservationInsert,
  SessionProtocolExecutionInsert,
  SessionArtifactExtendedInsert,
  TherapyProtocol,
} from "@/types/atpe-consolidated"

type AnyDbClient = Awaited<ReturnType<typeof createClient>>
type JsonRecord = Record<string, unknown>

type SaveSessionClinicalBundlePayload = {
  sessionId: string
  patientId: string
  organizationId: string
  episodeId?: string | null
  observations?: SessionObservationInsert[]
  goalReviews?: SessionGoalReviewInsert[]
  protocolExecution?: SessionProtocolExecutionInsert[]
  artifacts?: SessionArtifactExtendedInsert[]
  analyses?: ClinicalAnalysisInsert[]
  alerts?: AtpeGlobalAlertInsert[]
  advancedAtpe?: AtpeSessionAdvancedInsert | null
}

type CreateAtpeAlertFromAnalysisPayload = {
  analysis: ClinicalAnalysisInsert
  alert: AtpeGlobalAlertInsert
}

class ServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = "ServiceError"
  }
}

function asAnyDb(client: AnyDbClient) {
  return client as any
}

function dedupeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

function normalizeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : []
}

async function getCurrentUserId(supabase: AnyDbClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new ServiceError("Impossible de récupérer l’utilisateur courant.", error)
  if (!user) throw new ServiceError("Utilisateur non authentifié.")

  return user.id
}

async function maybeAuditLog(
  supabase: AnyDbClient,
  payload: {
    organization_id: string
    actor_user_id?: string | null
    entity_type: string
    entity_id?: string | null
    action: string
    metadata?: JsonRecord
  }
) {
  try {
    const db = asAnyDb(supabase)
    await db.from("audit_logs").insert({
      organization_id: payload.organization_id,
      actor_user_id: payload.actor_user_id ?? null,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id ?? null,
      action: payload.action,
      metadata: payload.metadata ?? {},
    })
  } catch {
    // volontairement silencieux pour ne pas casser le flux métier
  }
}

/* =========================================================
   1) createExpressionAssessment
========================================================= */

export async function createExpressionAssessment(
  payload: CreateExpressionAssessmentPayload,
  client?: AnyDbClient
): Promise<ExpressionAssessment> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)

  const userId = await getCurrentUserId(supabase)

  const insertPayload = dedupeUndefined({
    patient_id: payload.patient_id,
    episode_id: payload.episode_id ?? null,
    organization_id: payload.organization_id,
    assessor_id: payload.assessor_id ?? userId,
    assessed_on: payload.assessed_on,
    expression_profile: payload.expression_profile ?? null,
    sensory_profile: payload.sensory_profile ?? null,
    body_relation: payload.body_relation ?? null,
    symbolic_capacity: payload.symbolic_capacity ?? null,
    relational_availability: payload.relational_availability ?? null,
    emotional_regulation: payload.emotional_regulation ?? null,
    preferred_media: payload.preferred_media ?? null,
    blocked_media: payload.blocked_media ?? null,
    preliminary_hypothesis: payload.preliminary_hypothesis ?? null,
    initial_recommendations: payload.initial_recommendations ?? null,
    raw_payload: payload.raw_payload ?? {},
  })

  const { data, error } = await db
    .from("expression_assessments")
    .insert(insertPayload)
    .select("*")
    .single()

  if (error || !data) {
    throw new ServiceError("Impossible de créer le bilan expressionnel préalable.", error)
  }

  await maybeAuditLog(supabase, {
    organization_id: payload.organization_id,
    actor_user_id: userId,
    entity_type: "expression_assessment",
    entity_id: data.id,
    action: "CREATE",
    metadata: {
      patient_id: payload.patient_id,
      episode_id: payload.episode_id ?? null,
    },
  })

  return data as ExpressionAssessment
}

/* =========================================================
   2) createProtocolWithSteps
========================================================= */

export async function createProtocolWithSteps(
  payload: CreateProtocolWithStepsPayload,
  client?: AnyDbClient
): Promise<{
  protocol: TherapyProtocol
  steps: Array<{
    id: string
    protocol_id: string
    step_order: number
    title: string
    description: string | null
    expected_outcome: string | null
    media_suggestion: string | null
    created_at: string
  }>
}> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)

  const userId = await getCurrentUserId(supabase)

  const protocolInsert = dedupeUndefined({
    ...payload.protocol,
    created_by: payload.protocol.created_by ?? userId,
    updated_by: payload.protocol.updated_by ?? userId,
  })

  const { data: protocol, error: protocolError } = await db
    .from("therapy_protocols")
    .insert(protocolInsert)
    .select("*")
    .single()

  if (protocolError || !protocol) {
    throw new ServiceError("Impossible de créer le protocole thérapeutique.", protocolError)
  }

  const orderedSteps = normalizeArray(payload.steps)
    .sort((a, b) => a.step_order - b.step_order)
    .map((step) => ({
      protocol_id: protocol.id,
      step_order: step.step_order,
      title: step.title,
      description: step.description ?? null,
      expected_outcome: step.expected_outcome ?? null,
      media_suggestion: step.media_suggestion ?? null,
    }))

  let createdSteps: Array<{
    id: string
    protocol_id: string
    step_order: number
    title: string
    description: string | null
    expected_outcome: string | null
    media_suggestion: string | null
    created_at: string
  }> = []

  if (orderedSteps.length > 0) {
    const { data: stepRows, error: stepError } = await db
      .from("protocol_steps")
      .insert(orderedSteps)
      .select("*")

    if (stepError) {
      throw new ServiceError(
        "Le protocole a été créé mais les étapes n’ont pas pu être enregistrées.",
        stepError
      )
    }

    createdSteps = (stepRows ?? []) as typeof createdSteps
  }

  await maybeAuditLog(supabase, {
    organization_id: protocol.organization_id,
    actor_user_id: userId,
    entity_type: "therapy_protocol",
    entity_id: protocol.id,
    action: "CREATE",
    metadata: {
      steps_count: createdSteps.length,
      title: protocol.title,
    },
  })

  return {
    protocol: protocol as TherapyProtocol,
    steps: createdSteps,
  }
}

/* =========================================================
   3) saveSessionClinicalBundle
========================================================= */

export async function saveSessionClinicalBundle(
  payload: SaveSessionClinicalBundlePayload,
  client?: AnyDbClient
): Promise<SessionClinicalBundle> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)

  const userId = await getCurrentUserId(supabase)

  const observationsPayload = normalizeArray(payload.observations).map((item) => ({
    session_id: payload.sessionId,
    observation_type: item.observation_type,
    content: item.content,
    intensity: item.intensity ?? null,
    valence: item.valence ?? null,
    observed_by: item.observed_by ?? userId,
  }))

  const goalReviewsPayload = normalizeArray(payload.goalReviews).map((item) => ({
    session_id: payload.sessionId,
    goal_id: item.goal_id ?? null,
    subgoal_id: item.subgoal_id ?? null,
    work_intensity: item.work_intensity ?? null,
    progress_level: item.progress_level ?? null,
    review_note: item.review_note ?? null,
    reviewed_by: item.reviewed_by ?? userId,
  }))

  const protocolExecutionPayload = normalizeArray(payload.protocolExecution).map((item) => ({
    session_id: payload.sessionId,
    assignment_id: item.assignment_id,
    protocol_step_id: item.protocol_step_id ?? null,
    execution_status: item.execution_status ?? "done",
    execution_note: item.execution_note ?? null,
    response_quality: item.response_quality ?? null,
    created_by: item.created_by ?? userId,
  }))

  const artifactsPayload = normalizeArray(payload.artifacts).map((item) => ({
    session_id: payload.sessionId,
    artifact_type: item.artifact_type,
    title: item.title,
    storage_path: item.storage_path ?? null,
    note: item.note ?? null,
    media_role: item.media_role ?? null,
    linked_goal_id: item.linked_goal_id ?? null,
    linked_protocol_id: item.linked_protocol_id ?? null,
    clinical_relevance: item.clinical_relevance ?? null,
    visibility_scope: item.visibility_scope ?? "clinical_team",
  }))

  const analysesPayload = normalizeArray(payload.analyses).map((item) => ({
    patient_id: payload.patientId,
    episode_id: item.episode_id ?? payload.episodeId ?? null,
    session_id: payload.sessionId,
    organization_id: item.organization_id ?? payload.organizationId,
    analysis_type: item.analysis_type,
    title: item.title,
    summary: item.summary ?? null,
    clinical_interpretation: item.clinical_interpretation ?? null,
    hypotheses: item.hypotheses ?? null,
    recommendations: item.recommendations ?? null,
    authored_by: item.authored_by ?? userId,
  }))

  const alertsPayload = normalizeArray(payload.alerts).map((item) => ({
    organization_id: item.organization_id ?? payload.organizationId,
    patient_id: item.patient_id ?? payload.patientId,
    episode_id: item.episode_id ?? payload.episodeId ?? null,
    session_id: item.session_id ?? payload.sessionId,
    atpe_session_id: item.atpe_session_id ?? null,
    level: item.level,
    category: item.category,
    label: item.label,
    detail: item.detail ?? null,
    source: item.source ?? "manual_bundle",
    is_active: item.is_active ?? true,
    acknowledged_by: item.acknowledged_by ?? null,
    acknowledged_at: item.acknowledged_at ?? null,
    resolved_at: item.resolved_at ?? null,
    metadata: item.metadata ?? {},
  }))

  const advancedPayload = payload.advancedAtpe
    ? {
        patient_id: payload.advancedAtpe.patient_id ?? payload.patientId,
        session_id: payload.advancedAtpe.session_id ?? payload.sessionId,
        group_id: payload.advancedAtpe.group_id ?? null,
        group_session_id: payload.advancedAtpe.group_session_id ?? null,
        format: payload.advancedAtpe.format ?? null,
        medium_primary: payload.advancedAtpe.medium_primary ?? null,
        medium_secondary: payload.advancedAtpe.medium_secondary ?? null,
        atpe_phase_dominant: payload.advancedAtpe.atpe_phase_dominant ?? null,
        frame_containment: payload.advancedAtpe.frame_containment ?? null,
        bodily_engagement: payload.advancedAtpe.bodily_engagement ?? null,
        decentering_level: payload.advancedAtpe.decentering_level ?? null,
        centering_level: payload.advancedAtpe.centering_level ?? null,
        externalization_level: payload.advancedAtpe.externalization_level ?? null,
        work_dialogue_level: payload.advancedAtpe.work_dialogue_level ?? null,
        sharing_level: payload.advancedAtpe.sharing_level ?? null,
        primary_symbolization: payload.advancedAtpe.primary_symbolization ?? null,
        secondary_symbolization: payload.advancedAtpe.secondary_symbolization ?? null,
        relational_availability: payload.advancedAtpe.relational_availability ?? null,
        creative_mobility: payload.advancedAtpe.creative_mobility ?? null,
        projective_intensity: payload.advancedAtpe.projective_intensity ?? null,
        group_cohesion: payload.advancedAtpe.group_cohesion ?? null,
        group_containment: payload.advancedAtpe.group_containment ?? null,
        transfer_diffraction: payload.advancedAtpe.transfer_diffraction ?? null,
        therapist_presence_quality: payload.advancedAtpe.therapist_presence_quality ?? null,
        patient_engagement_level: payload.advancedAtpe.patient_engagement_level ?? null,
        therapist_feels_confusion: payload.advancedAtpe.therapist_feels_confusion ?? null,
        therapist_feels_sudden_fatigue:
          payload.advancedAtpe.therapist_feels_sudden_fatigue ?? null,
        therapist_feels_pressure: payload.advancedAtpe.therapist_feels_pressure ?? null,
        therapist_feels_irritation: payload.advancedAtpe.therapist_feels_irritation ?? null,
        therapist_feels_void: payload.advancedAtpe.therapist_feels_void ?? null,
        patient_repeats_without_integration:
          payload.advancedAtpe.patient_repeats_without_integration ?? null,
        group_feels_same_affect: payload.advancedAtpe.group_feels_same_affect ?? null,
        tension_spreads_quickly: payload.advancedAtpe.tension_spreads_quickly ?? null,
        therapist_countertransference_notes:
          payload.advancedAtpe.therapist_countertransference_notes ?? null,
        clinical_hypotheses: payload.advancedAtpe.clinical_hypotheses ?? null,
        next_step_recommendation: payload.advancedAtpe.next_step_recommendation ?? null,
        created_by: payload.advancedAtpe.created_by ?? userId,
      }
    : null

  const createdObservations =
    observationsPayload.length > 0
      ? (
          await db
            .from("session_observations")
            .insert(observationsPayload)
            .select("*")
        ).data ?? []
      : []

  const createdGoalReviews =
    goalReviewsPayload.length > 0
      ? (
          await db
            .from("session_goal_reviews")
            .insert(goalReviewsPayload)
            .select("*")
        ).data ?? []
      : []

  const createdProtocolExecution =
    protocolExecutionPayload.length > 0
      ? (
          await db
            .from("session_protocol_execution")
            .insert(protocolExecutionPayload)
            .select("*")
        ).data ?? []
      : []

  const createdArtifacts =
    artifactsPayload.length > 0
      ? (
          await db
            .from("session_artifacts")
            .insert(artifactsPayload)
            .select("*")
        ).data ?? []
      : []

  const createdAnalyses =
    analysesPayload.length > 0
      ? (
          await db
            .from("clinical_analyses")
            .insert(analysesPayload)
            .select("*")
        ).data ?? []
      : []

  let createdAdvancedAtpe: AtpeSessionAdvanced | null = null
  if (advancedPayload) {
    const { data, error } = await db
      .from("atpe_session_advanced")
      .insert(advancedPayload)
      .select("*")
      .single()

    if (error || !data) {
      throw new ServiceError("Impossible d’enregistrer l’analyse ATPE avancée.", error)
    }

    createdAdvancedAtpe = data as AtpeSessionAdvanced
  }

  const finalAlertsPayload = alertsPayload.map((alert) => ({
    ...alert,
    atpe_session_id: alert.atpe_session_id ?? createdAdvancedAtpe?.id ?? null,
  }))

  const createdAlerts =
    finalAlertsPayload.length > 0
      ? (
          await db
            .from("atpe_global_alerts")
            .insert(finalAlertsPayload)
            .select("*")
        ).data ?? []
      : []

  await maybeAuditLog(supabase, {
    organization_id: payload.organizationId,
    actor_user_id: userId,
    entity_type: "session_bundle",
    entity_id: payload.sessionId,
    action: "UPDATE",
    metadata: {
      observations: createdObservations.length,
      goal_reviews: createdGoalReviews.length,
      protocol_execution: createdProtocolExecution.length,
      artifacts: createdArtifacts.length,
      analyses: createdAnalyses.length,
      alerts: createdAlerts.length,
      advanced_atpe: Boolean(createdAdvancedAtpe),
    },
  })

  return {
    session_id: payload.sessionId,
    observations: createdObservations as any[],
    goal_reviews: createdGoalReviews as any[],
    protocol_execution: createdProtocolExecution as any[],
    artifacts: createdArtifacts as any[],
    advanced_atpe: createdAdvancedAtpe,
    analyses: createdAnalyses as ClinicalAnalysis[],
    alerts: createdAlerts as AtpeGlobalAlert[],
    supervision_notes: [],
  }
}

/* =========================================================
   4) createAtpeAlertFromAnalysis
========================================================= */

export async function createAtpeAlertFromAnalysis(
  payload: CreateAtpeAlertFromAnalysisPayload,
  client?: AnyDbClient
): Promise<{
  analysis: ClinicalAnalysis
  alert: AtpeGlobalAlert
  link: { id: string; analysis_id: string; alert_id: string; created_at: string }
}> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)

  const userId = await getCurrentUserId(supabase)

  const analysisInsert = dedupeUndefined({
    ...payload.analysis,
    authored_by: payload.analysis.authored_by ?? userId,
  })

  const { data: analysis, error: analysisError } = await db
    .from("clinical_analyses")
    .insert(analysisInsert)
    .select("*")
    .single()

  if (analysisError || !analysis) {
    throw new ServiceError("Impossible de créer l’analyse clinique.", analysisError)
  }

  const alertInsert = dedupeUndefined({
    ...payload.alert,
    organization_id: payload.alert.organization_id ?? payload.analysis.organization_id,
    patient_id: payload.alert.patient_id ?? payload.analysis.patient_id,
    episode_id: payload.alert.episode_id ?? payload.analysis.episode_id ?? null,
    session_id: payload.alert.session_id ?? payload.analysis.session_id ?? null,
    source: payload.alert.source ?? "analysis_linked",
    metadata: {
      ...(payload.alert.metadata ?? {}),
      linked_analysis_id: analysis.id,
    },
  })

  const { data: alert, error: alertError } = await db
    .from("atpe_global_alerts")
    .insert(alertInsert)
    .select("*")
    .single()

  if (alertError || !alert) {
    throw new ServiceError("Impossible de créer l’alerte ATPE.", alertError)
  }

  const { data: link, error: linkError } = await db
    .from("analysis_alert_links")
    .insert({
      analysis_id: analysis.id,
      alert_id: alert.id,
    })
    .select("*")
    .single()

  if (linkError || !link) {
    throw new ServiceError("Impossible de lier l’analyse et l’alerte.", linkError)
  }

  await maybeAuditLog(supabase, {
    organization_id: alert.organization_id,
    actor_user_id: userId,
    entity_type: "atpe_alert",
    entity_id: alert.id,
    action: "CREATE",
    metadata: {
      analysis_id: analysis.id,
      patient_id: alert.patient_id,
      level: alert.level,
      category: alert.category,
    },
  })

  return {
    analysis: analysis as ClinicalAnalysis,
    alert: alert as AtpeGlobalAlert,
    link,
  }
}

/* =========================================================
   5) getPatientClinicalOverview
========================================================= */

export async function getPatientClinicalOverview(
  patientId: string,
  client?: AnyDbClient
): Promise<PatientClinicalOverview> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)

  const [
    conditionsRes,
    expressionRes,
    episodeRes,
    goalsRes,
    subgoalsRes,
    alertsRes,
    analysesRes,
  ] = await Promise.all([
    db
      .from("active_patient_conditions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),

    db
      .from("latest_expression_assessments")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle(),

    db
      .from("therapy_episodes")
      .select("id")
      .eq("patient_id", patientId)
      .is("closed_on", null)
      .order("opened_on", { ascending: false })
      .limit(1)
      .maybeSingle(),

    db
      .from("therapy_goals")
      .select("id", { count: "exact", head: true })
      .in("status", ["planned", "in_progress", "paused"])
      .in(
        "episode_id",
        (
          await db
            .from("therapy_episodes")
            .select("id")
            .eq("patient_id", patientId)
        ).data?.map((row: { id: string }) => row.id) ?? []
      ),

    db
      .from("therapy_subgoals")
      .select("id, goal_id", { count: "exact" })
      .order("created_at", { ascending: false }),

    db
      .from("active_atpe_alerts")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId),

    db
      .from("clinical_analyses")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (conditionsRes.error) {
    throw new ServiceError("Impossible de lire les pathologies/conditions actives.", conditionsRes.error)
  }

  if (expressionRes.error) {
    throw new ServiceError("Impossible de lire le dernier bilan expressionnel.", expressionRes.error)
  }

  if (episodeRes.error) {
    throw new ServiceError("Impossible de lire l’épisode actif.", episodeRes.error)
  }

  if (goalsRes.error) {
    throw new ServiceError("Impossible de lire les objectifs actifs.", goalsRes.error)
  }

  if (subgoalsRes.error) {
    throw new ServiceError("Impossible de lire les sous-objectifs.", subgoalsRes.error)
  }

  if (alertsRes.error) {
    throw new ServiceError("Impossible de lire les alertes actives.", alertsRes.error)
  }

  if (analysesRes.error) {
    throw new ServiceError("Impossible de lire la dernière analyse clinique.", analysesRes.error)
  }

  const activeEpisodeId = episodeRes.data?.id ?? null
  const activeGoalIds =
    activeEpisodeId
      ? (
          await db
            .from("therapy_goals")
            .select("id")
            .eq("episode_id", activeEpisodeId)
            .in("status", ["planned", "in_progress", "paused"])
        ).data?.map((row: { id: string }) => row.id) ?? []
      : []

  const activeSubgoalsCount = (subgoalsRes.data ?? []).filter(
    (row: { goal_id: string; status?: string }) => activeGoalIds.includes(row.goal_id)
  ).length

  return {
    patient_id: patientId,
    active_conditions: (conditionsRes.data ?? []) as any[],
    latest_expression_assessment: (expressionRes.data ?? null) as ExpressionAssessment | null,
    active_episode_id: activeEpisodeId,
    active_goals_count: goalsRes.count ?? activeGoalIds.length,
    active_subgoals_count: activeSubgoalsCount,
    active_alerts_count: alertsRes.count ?? 0,
    latest_analysis: (analysesRes.data ?? null) as ClinicalAnalysis | null,
  }
}

/* =========================================================
   BONUS: helper d’assignation de protocole
========================================================= */

export async function assignProtocolToEpisode(
  payload: EpisodeProtocolAssignmentInsert,
  client?: AnyDbClient
): Promise<EpisodeProtocolAssignment> {
  const supabase = client ?? (await createClient())
  const db = asAnyDb(supabase)
  const userId = await getCurrentUserId(supabase)

  const { data, error } = await db
    .from("episode_protocol_assignments")
    .insert({
      ...payload,
      assigned_by: payload.assigned_by ?? userId,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw new ServiceError("Impossible d’assigner le protocole à l’épisode.", error)
  }

  return data as EpisodeProtocolAssignment
}