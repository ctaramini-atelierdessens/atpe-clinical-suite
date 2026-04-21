/* =========================================================
   ATPE CONSOLIDATED V2 - TYPESCRIPT TYPES
   Complément métier à database.ts généré depuis Supabase
   ========================================================= */

export type UUID = string
export type ISODate = string
export type ISODateTime = string

/* ---------------------------------------------------------
   ENUMS / LITERALS
--------------------------------------------------------- */

export type ConditionStatus = "active" | "resolved" | "historical" | "suspected"
export type ConditionCategory = "diagnostic" | "hypothesis" | "associated_factor" | "history"

export type SubgoalStatus = "planned" | "in_progress" | "achieved" | "paused" | "closed"
export type GoalPriority = "low" | "medium" | "high"

export type ProtocolAssignmentStatus = "active" | "paused" | "completed" | "stopped"
export type ProtocolExecutionStatus = "done" | "partial" | "skipped" | "contraindicated"

export type AnalysisType =
  | "session"
  | "intermediate"
  | "final"
  | "supervision"
  | "alert"
  | "synthesis"

export type AtpeAlertLevel = "low" | "moderate" | "high" | "critical"
export type SupervisionNoteStatus = "open" | "reviewed" | "integrated" | "closed"

export type ArtifactMediaRole =
  | "production_patient"
  | "support_therapeute"
  | "piece_analyse"
  | "export"
  | "other"

export type ArtifactVisibilityScope =
  | "clinical_team"
  | "supervisor_only"
  | "patient_shareable"
  | "restricted"

export type SessionObservationType =
  | "verbal"
  | "corporel"
  | "emotionnel"
  | "symbolique"
  | "relationnel"
  | "cadre"
  | "transfert"
  | "contre_transfert"
  | "other"

export type ObservationValence = "negative" | "neutral" | "positive" | "mixed"

export type TherapyProtocolStatus = "draft" | "active" | "archived"

export type AtpeFormat = "individual" | "group" | "family" | "institutional" | string

/* ---------------------------------------------------------
   SHARED HELPERS
--------------------------------------------------------- */

export interface AuditFields {
  created_at: ISODateTime
  updated_at?: ISODateTime
}

export interface UserStamped {
  created_by?: UUID | null
  updated_by?: UUID | null
}

export interface OrganizationScoped {
  organization_id: UUID
}

export interface PatientScoped {
  patient_id: UUID
  episode_id?: UUID | null
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

/* ---------------------------------------------------------
   1) PATHOLOGIES / CONDITIONS
--------------------------------------------------------- */

export interface PatientCondition extends AuditFields, UserStamped, OrganizationScoped {
  id: UUID
  patient_id: UUID
  episode_id: UUID | null
  label: string
  category: ConditionCategory
  severity: string | null
  status: ConditionStatus
  source: string | null
  note: string | null
  identified_on: ISODate | null
  resolved_on: ISODate | null
  coded_reference: string | null
}

export interface PatientConditionInsert extends OrganizationScoped {
  patient_id: UUID
  episode_id?: UUID | null
  label: string
  category?: ConditionCategory
  severity?: string | null
  status?: ConditionStatus
  source?: string | null
  note?: string | null
  identified_on?: ISODate | null
  resolved_on?: ISODate | null
  coded_reference?: string | null
  created_by?: UUID | null
  updated_by?: UUID | null
}

export interface PatientConditionUpdate {
  episode_id?: UUID | null
  label?: string
  category?: ConditionCategory
  severity?: string | null
  status?: ConditionStatus
  source?: string | null
  note?: string | null
  identified_on?: ISODate | null
  resolved_on?: ISODate | null
  coded_reference?: string | null
  updated_by?: UUID | null
}

/* ---------------------------------------------------------
   2) SOUS-OBJECTIFS
--------------------------------------------------------- */

export interface TherapySubgoal extends AuditFields, UserStamped {
  id: UUID
  goal_id: UUID
  title: string
  description: string | null
  priority: GoalPriority
  status: SubgoalStatus
  target_review_date: ISODate | null
}

export interface TherapySubgoalInsert {
  goal_id: UUID
  title: string
  description?: string | null
  priority?: GoalPriority
  status?: SubgoalStatus
  target_review_date?: ISODate | null
  created_by?: UUID | null
  updated_by?: UUID | null
}

export interface TherapySubgoalUpdate {
  title?: string
  description?: string | null
  priority?: GoalPriority
  status?: SubgoalStatus
  target_review_date?: ISODate | null
  updated_by?: UUID | null
}

export interface SessionGoalReview {
  id: UUID
  session_id: UUID
  goal_id: UUID | null
  subgoal_id: UUID | null
  work_intensity: number | null
  progress_level: number | null
  review_note: string | null
  reviewed_by: UUID | null
  created_at: ISODateTime
}

export interface SessionGoalReviewInsert {
  session_id: UUID
  goal_id?: UUID | null
  subgoal_id?: UUID | null
  work_intensity?: number | null
  progress_level?: number | null
  review_note?: string | null
  reviewed_by?: UUID | null
}

export interface SessionGoalReviewUpdate {
  goal_id?: UUID | null
  subgoal_id?: UUID | null
  work_intensity?: number | null
  progress_level?: number | null
  review_note?: string | null
  reviewed_by?: UUID | null
}

/* ---------------------------------------------------------
   3) PROTOCOLES
--------------------------------------------------------- */

export interface TherapyProtocol extends AuditFields, UserStamped, OrganizationScoped {
  id: UUID
  title: string
  description: string | null
  modality: string | null
  target_indications: string | null
  contraindications: string | null
  expected_duration_weeks: number | null
  status: TherapyProtocolStatus
}

export interface TherapyProtocolInsert extends OrganizationScoped {
  title: string
  description?: string | null
  modality?: string | null
  target_indications?: string | null
  contraindications?: string | null
  expected_duration_weeks?: number | null
  status?: TherapyProtocolStatus
  created_by?: UUID | null
  updated_by?: UUID | null
}

export interface TherapyProtocolUpdate {
  title?: string
  description?: string | null
  modality?: string | null
  target_indications?: string | null
  contraindications?: string | null
  expected_duration_weeks?: number | null
  status?: TherapyProtocolStatus
  updated_by?: UUID | null
}

export interface ProtocolStep {
  id: UUID
  protocol_id: UUID
  step_order: number
  title: string
  description: string | null
  expected_outcome: string | null
  media_suggestion: string | null
  created_at: ISODateTime
}

export interface ProtocolStepInsert {
  protocol_id: UUID
  step_order: number
  title: string
  description?: string | null
  expected_outcome?: string | null
  media_suggestion?: string | null
}

export interface ProtocolStepUpdate {
  step_order?: number
  title?: string
  description?: string | null
  expected_outcome?: string | null
  media_suggestion?: string | null
}

export interface EpisodeProtocolAssignment extends AuditFields {
  id: UUID
  episode_id: UUID
  protocol_id: UUID
  assigned_by: UUID | null
  assigned_on: ISODate
  status: ProtocolAssignmentStatus
  rationale: string | null
}

export interface EpisodeProtocolAssignmentInsert {
  episode_id: UUID
  protocol_id: UUID
  assigned_by?: UUID | null
  assigned_on?: ISODate
  status?: ProtocolAssignmentStatus
  rationale?: string | null
}

export interface EpisodeProtocolAssignmentUpdate {
  assigned_by?: UUID | null
  assigned_on?: ISODate
  status?: ProtocolAssignmentStatus
  rationale?: string | null
}

export interface SessionProtocolExecution {
  id: UUID
  session_id: UUID
  assignment_id: UUID
  protocol_step_id: UUID | null
  execution_status: ProtocolExecutionStatus
  execution_note: string | null
  response_quality: number | null
  created_by: UUID | null
  created_at: ISODateTime
}

export interface SessionProtocolExecutionInsert {
  session_id: UUID
  assignment_id: UUID
  protocol_step_id?: UUID | null
  execution_status?: ProtocolExecutionStatus
  execution_note?: string | null
  response_quality?: number | null
  created_by?: UUID | null
}

export interface SessionProtocolExecutionUpdate {
  protocol_step_id?: UUID | null
  execution_status?: ProtocolExecutionStatus
  execution_note?: string | null
  response_quality?: number | null
  created_by?: UUID | null
}

/* ---------------------------------------------------------
   4) BILAN EXPRESSIONNEL PRÉALABLE
--------------------------------------------------------- */

export interface ExpressionAssessment extends AuditFields, OrganizationScoped {
  id: UUID
  patient_id: UUID
  episode_id: UUID | null
  assessor_id: UUID | null
  assessed_on: ISODate
  expression_profile: string | null
  sensory_profile: string | null
  body_relation: string | null
  symbolic_capacity: string | null
  relational_availability: string | null
  emotional_regulation: string | null
  preferred_media: string | null
  blocked_media: string | null
  preliminary_hypothesis: string | null
  initial_recommendations: string | null
  raw_payload: Record<string, JsonValue>
}

export interface ExpressionAssessmentInsert extends OrganizationScoped {
  patient_id: UUID
  episode_id?: UUID | null
  assessor_id?: UUID | null
  assessed_on?: ISODate
  expression_profile?: string | null
  sensory_profile?: string | null
  body_relation?: string | null
  symbolic_capacity?: string | null
  relational_availability?: string | null
  emotional_regulation?: string | null
  preferred_media?: string | null
  blocked_media?: string | null
  preliminary_hypothesis?: string | null
  initial_recommendations?: string | null
  raw_payload?: Record<string, JsonValue>
}

export interface ExpressionAssessmentUpdate {
  assessor_id?: UUID | null
  assessed_on?: ISODate
  expression_profile?: string | null
  sensory_profile?: string | null
  body_relation?: string | null
  symbolic_capacity?: string | null
  relational_availability?: string | null
  emotional_regulation?: string | null
  preferred_media?: string | null
  blocked_media?: string | null
  preliminary_hypothesis?: string | null
  initial_recommendations?: string | null
  raw_payload?: Record<string, JsonValue>
}

/* ---------------------------------------------------------
   5) OBSERVATIONS DE SÉANCE
--------------------------------------------------------- */

export interface SessionObservation {
  id: UUID
  session_id: UUID
  observation_type: SessionObservationType
  content: string
  intensity: number | null
  valence: ObservationValence | null
  observed_by: UUID | null
  created_at: ISODateTime
}

export interface SessionObservationInsert {
  session_id: UUID
  observation_type: SessionObservationType
  content: string
  intensity?: number | null
  valence?: ObservationValence | null
  observed_by?: UUID | null
}

export interface SessionObservationUpdate {
  observation_type?: SessionObservationType
  content?: string
  intensity?: number | null
  valence?: ObservationValence | null
  observed_by?: UUID | null
}

/* ---------------------------------------------------------
   6) ANALYSES CLINIQUES
--------------------------------------------------------- */

export interface ClinicalAnalysis extends AuditFields, OrganizationScoped {
  id: UUID
  patient_id: UUID
  episode_id: UUID | null
  session_id: UUID | null
  analysis_type: AnalysisType
  title: string
  summary: string | null
  clinical_interpretation: string | null
  hypotheses: string | null
  recommendations: string | null
  authored_by: UUID | null
}

export interface ClinicalAnalysisInsert extends OrganizationScoped {
  patient_id: UUID
  episode_id?: UUID | null
  session_id?: UUID | null
  analysis_type: AnalysisType
  title: string
  summary?: string | null
  clinical_interpretation?: string | null
  hypotheses?: string | null
  recommendations?: string | null
  authored_by?: UUID | null
}

export interface ClinicalAnalysisUpdate {
  episode_id?: UUID | null
  session_id?: UUID | null
  analysis_type?: AnalysisType
  title?: string
  summary?: string | null
  clinical_interpretation?: string | null
  hypotheses?: string | null
  recommendations?: string | null
  authored_by?: UUID | null
}

/* ---------------------------------------------------------
   7) ATPE AVANCÉ
--------------------------------------------------------- */

export interface AtpeSessionAdvanced extends AuditFields {
  id: UUID
  patient_id: UUID
  session_id: UUID | null
  group_id: UUID | null
  group_session_id: UUID | null
  format: string | null
  medium_primary: string | null
  medium_secondary: string | null
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
  group_cohesion: number | null
  group_containment: number | null
  transfer_diffraction: number | null
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

  created_by: UUID | null
}

export interface AtpeSessionAdvancedInsert {
  patient_id: UUID
  session_id?: UUID | null
  group_id?: UUID | null
  group_session_id?: UUID | null
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

  created_by?: UUID | null
}

export interface AtpeSessionAdvancedUpdate {
  session_id?: UUID | null
  group_id?: UUID | null
  group_session_id?: UUID | null
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
}

export interface AtpeSessionVersion {
  id: UUID
  atpe_session_id: UUID
  version_number: number
  snapshot: Record<string, JsonValue>
  change_reason: string | null
  locked_by: UUID | null
  created_at: ISODateTime
}

export interface AtpeSessionVersionInsert {
  atpe_session_id: UUID
  version_number: number
  snapshot?: Record<string, JsonValue>
  change_reason?: string | null
  locked_by?: UUID | null
}

export interface AtpeSessionVersionUpdate {
  snapshot?: Record<string, JsonValue>
  change_reason?: string | null
  locked_by?: UUID | null
}

export interface AtpeSupervisionNote extends AuditFields, OrganizationScoped {
  id: UUID
  patient_id: UUID
  episode_id: UUID | null
  session_id: UUID | null
  atpe_session_id: UUID | null
  supervision_date: ISODate
  note: string
  supervisor_id: UUID | null
  status: SupervisionNoteStatus
}

export interface AtpeSupervisionNoteInsert extends OrganizationScoped {
  patient_id: UUID
  episode_id?: UUID | null
  session_id?: UUID | null
  atpe_session_id?: UUID | null
  supervision_date?: ISODate
  note: string
  supervisor_id?: UUID | null
  status?: SupervisionNoteStatus
}

export interface AtpeSupervisionNoteUpdate {
  episode_id?: UUID | null
  session_id?: UUID | null
  atpe_session_id?: UUID | null
  supervision_date?: ISODate
  note?: string
  supervisor_id?: UUID | null
  status?: SupervisionNoteStatus
}

export interface AtpeGlobalAlert {
  id: UUID
  organization_id: UUID
  patient_id: UUID
  episode_id: UUID | null
  session_id: UUID | null
  atpe_session_id: UUID | null
  level: AtpeAlertLevel
  category: string
  label: string
  detail: string | null
  source: string
  is_active: boolean
  acknowledged_by: UUID | null
  acknowledged_at: ISODateTime | null
  resolved_at: ISODateTime | null
  metadata: Record<string, JsonValue>
  created_at: ISODateTime
}

export interface AtpeGlobalAlertInsert extends OrganizationScoped {
  patient_id: UUID
  episode_id?: UUID | null
  session_id?: UUID | null
  atpe_session_id?: UUID | null
  level: AtpeAlertLevel
  category: string
  label: string
  detail?: string | null
  source?: string
  is_active?: boolean
  acknowledged_by?: UUID | null
  acknowledged_at?: ISODateTime | null
  resolved_at?: ISODateTime | null
  metadata?: Record<string, JsonValue>
}

export interface AtpeGlobalAlertUpdate {
  episode_id?: UUID | null
  session_id?: UUID | null
  atpe_session_id?: UUID | null
  level?: AtpeAlertLevel
  category?: string
  label?: string
  detail?: string | null
  source?: string
  is_active?: boolean
  acknowledged_by?: UUID | null
  acknowledged_at?: ISODateTime | null
  resolved_at?: ISODateTime | null
  metadata?: Record<string, JsonValue>
}

export interface AtpeCaseSummary extends AuditFields {
  id: UUID
  patient_id: UUID
  case_slug: string
  title: string
  setting: string | null
  modality: string | null
  dominant_case_theme: string | null
  total_sessions: number | null
  expression_assessment: Record<string, JsonValue>
  intermediate_review: Record<string, JsonValue>
  final_review: Record<string, JsonValue>
  metadata: Record<string, JsonValue>
}

export interface AtpeCaseSummaryInsert {
  patient_id: UUID
  case_slug: string
  title: string
  setting?: string | null
  modality?: string | null
  dominant_case_theme?: string | null
  total_sessions?: number | null
  expression_assessment?: Record<string, JsonValue>
  intermediate_review?: Record<string, JsonValue>
  final_review?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
}

export interface AtpeCaseSummaryUpdate {
  case_slug?: string
  title?: string
  setting?: string | null
  modality?: string | null
  dominant_case_theme?: string | null
  total_sessions?: number | null
  expression_assessment?: Record<string, JsonValue>
  intermediate_review?: Record<string, JsonValue>
  final_review?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
}

export interface AnalysisAlertLink {
  id: UUID
  analysis_id: UUID
  alert_id: UUID
  created_at: ISODateTime
}

export interface AnalysisAlertLinkInsert {
  analysis_id: UUID
  alert_id: UUID
}

/* ---------------------------------------------------------
   8) ENRICHISSEMENT DES ARTEFACTS EXISTANTS
--------------------------------------------------------- */

export interface SessionArtifactExtended {
  id: UUID
  session_id: UUID
  artifact_type: string
  title: string
  storage_path: string | null
  note: string | null
  media_role: ArtifactMediaRole | null
  linked_goal_id: UUID | null
  linked_protocol_id: UUID | null
  clinical_relevance: string | null
  visibility_scope: ArtifactVisibilityScope
  created_at: ISODateTime
}

export interface SessionArtifactExtendedInsert {
  session_id: UUID
  artifact_type: string
  title: string
  storage_path?: string | null
  note?: string | null
  media_role?: ArtifactMediaRole | null
  linked_goal_id?: UUID | null
  linked_protocol_id?: UUID | null
  clinical_relevance?: string | null
  visibility_scope?: ArtifactVisibilityScope
}

export interface SessionArtifactExtendedUpdate {
  artifact_type?: string
  title?: string
  storage_path?: string | null
  note?: string | null
  media_role?: ArtifactMediaRole | null
  linked_goal_id?: UUID | null
  linked_protocol_id?: UUID | null
  clinical_relevance?: string | null
  visibility_scope?: ArtifactVisibilityScope
}

/* ---------------------------------------------------------
   9) AGGRÉGATS MÉTIER POUR L'UI / SERVICES
--------------------------------------------------------- */

export interface PatientClinicalOverview {
  patient_id: UUID
  active_conditions: PatientCondition[]
  latest_expression_assessment: ExpressionAssessment | null
  active_episode_id: UUID | null
  active_goals_count: number
  active_subgoals_count: number
  active_alerts_count: number
  latest_analysis: ClinicalAnalysis | null
}

export interface SessionClinicalBundle {
  session_id: UUID
  observations: SessionObservation[]
  goal_reviews: SessionGoalReview[]
  protocol_execution: SessionProtocolExecution[]
  artifacts: SessionArtifactExtended[]
  advanced_atpe: AtpeSessionAdvanced | null
  analyses: ClinicalAnalysis[]
  alerts: AtpeGlobalAlert[]
  supervision_notes: AtpeSupervisionNote[]
}

export interface AtpeCaseWorkspace {
  patient_id: UUID
  episode_id: UUID | null
  case_summary: AtpeCaseSummary | null
  expression_assessment: ExpressionAssessment | null
  conditions: PatientCondition[]
  protocols: TherapyProtocol[]
  goals: Array<{
    goal_id: UUID
    title: string
    subgoals: TherapySubgoal[]
  }>
  sessions: SessionClinicalBundle[]
}

/* ---------------------------------------------------------
   10) PAYLOADS FORMULAIRES PRATIQUES
--------------------------------------------------------- */

export interface CreateProtocolWithStepsPayload {
  protocol: TherapyProtocolInsert
  steps: ProtocolStepInsert[]
}

export interface CreateSessionBundlePayload {
  observations?: SessionObservationInsert[]
  goal_reviews?: SessionGoalReviewInsert[]
  protocol_execution?: SessionProtocolExecutionInsert[]
  analyses?: ClinicalAnalysisInsert[]
  alerts?: AtpeGlobalAlertInsert[]
  advanced_atpe?: AtpeSessionAdvancedInsert | null
}

export interface CreateExpressionAssessmentPayload
  extends Omit<ExpressionAssessmentInsert, "raw_payload"> {
  raw_payload?: Record<string, JsonValue>
}

export interface CreateAtpeAlertFromAnalysisPayload {
  analysis: ClinicalAnalysisInsert
  alert: AtpeGlobalAlertInsert
}

/* ---------------------------------------------------------
   11) HELPERS DE VALIDATION LÉGÈRE
--------------------------------------------------------- */

export const SCORE_FIELDS = [
  "frame_containment",
  "bodily_engagement",
  "decentering_level",
  "centering_level",
  "externalization_level",
  "work_dialogue_level",
  "sharing_level",
  "primary_symbolization",
  "secondary_symbolization",
  "relational_availability",
  "creative_mobility",
  "projective_intensity",
  "group_cohesion",
  "group_containment",
  "transfer_diffraction",
  "therapist_presence_quality",
  "patient_engagement_level",
] as const

export type AtpeScoreField = (typeof SCORE_FIELDS)[number]

export function isPercentLike(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && value <= 100
}

export function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}