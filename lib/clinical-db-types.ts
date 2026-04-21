export type ClinicalGroupType =
  | 'therapy_group'
  | 'art_therapy_group'
  | 'support_group'
  | 'mixed_group'

export type ClinicalGroupFormat = 'closed' | 'semi_open' | 'open'

export type ClinicalGroupStatus = 'active' | 'paused' | 'closed' | 'archived'

export type ClinicalGroupRow = {
  id: string
  organization_id: string | null
  clinician_id: string | null

  name: string
  code: string | null
  reference: string | null
  description: string | null

  group_type: ClinicalGroupType | null
  format: ClinicalGroupFormat | null
  status: ClinicalGroupStatus

  created_at: string
  updated_at: string
}

export type ClinicalGroupInsert = {
  organization_id?: string | null
  clinician_id?: string | null

  name: string
  code?: string | null
  reference?: string | null
  description?: string | null

  group_type?: ClinicalGroupType | null
  format?: ClinicalGroupFormat | null
  status?: ClinicalGroupStatus
}

export type ClinicalGroupUpdate = Partial<ClinicalGroupInsert>

export type ClinicalGroupMemberRole = 'member' | 'observer' | 'co_therapist'

export type ClinicalGroupMemberRow = {
  id: string
  group_id: string
  patient_id: string

  role: ClinicalGroupMemberRole

  joined_at: string
  left_at: string | null
  is_active: boolean

  notes: string | null

  created_at: string
  updated_at: string
}

export type ClinicalGroupMemberInsert = {
  group_id: string
  patient_id: string

  role?: ClinicalGroupMemberRole

  joined_at?: string
  left_at?: string | null
  is_active?: boolean

  notes?: string | null
}

export type ClinicalGroupMemberUpdate = Partial<ClinicalGroupMemberInsert>

export type GroupSessionStatus = 'planned' | 'completed' | 'cancelled'

export type GroupSessionRow = {
  id: string
  group_id: string

  session_code: string | null
  title: string | null
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null

  location: string | null
  medium_primary: string | null
  medium_secondary: string | null

  frame_notes: string | null
  session_notes: string | null

  status: GroupSessionStatus

  created_at: string
  updated_at: string
}

export type GroupSessionInsert = {
  group_id: string

  session_code?: string | null
  title?: string | null
  scheduled_at?: string | null
  started_at?: string | null
  ended_at?: string | null

  location?: string | null
  medium_primary?: string | null
  medium_secondary?: string | null

  frame_notes?: string | null
  session_notes?: string | null

  status?: GroupSessionStatus
}

export type GroupSessionUpdate = Partial<GroupSessionInsert>

export type AtpeFormat = 'individual' | 'group'

export type AtpePhaseDominant =
  | 'attitude_interieure'
  | 'creation'
  | 'dialogue_oeuvre'
  | 'partage'

export type AtpeAdvancedSessionRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  group_session_id: string | null
  session_id: string

  format: AtpeFormat

  medium_primary: string | null
  medium_secondary: string | null
  atpe_phase_dominant: AtpePhaseDominant | null

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

  therapist_feels_confusion: boolean
  therapist_feels_sudden_fatigue: boolean
  therapist_feels_pressure: boolean
  therapist_feels_irritation: boolean
  therapist_feels_void: boolean
  patient_repeats_without_integration: boolean
  group_feels_same_affect: boolean
  tension_spreads_quickly: boolean

  therapist_countertransference_notes: string | null
  clinical_hypotheses: string | null
  next_step_recommendation: string | null

  created_by: string | null
  created_at: string
  updated_at: string
}

export type AtpeAdvancedSessionInsert = {
  patient_id?: string | null
  group_id?: string | null
  group_session_id?: string | null
  session_id: string

  format: AtpeFormat

  medium_primary?: string | null
  medium_secondary?: string | null
  atpe_phase_dominant?: AtpePhaseDominant | null

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

  therapist_feels_confusion?: boolean
  therapist_feels_sudden_fatigue?: boolean
  therapist_feels_pressure?: boolean
  therapist_feels_irritation?: boolean
  therapist_feels_void?: boolean
  patient_repeats_without_integration?: boolean
  group_feels_same_affect?: boolean
  tension_spreads_quickly?: boolean

  therapist_countertransference_notes?: string | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null

  created_by?: string | null
}

export type AtpeAdvancedSessionUpdate = Partial<AtpeAdvancedSessionInsert>

export type SupervisionPriorityLevel = 'low' | 'standard' | 'high' | 'urgent'

export type AtpeSupervisionEntryRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  atpe_session_advanced_id: string | null

  supervision_date: string
  supervisor_id: string | null
  clinician_id: string | null

  session_context: string | null
  therapist_experiences: string[]
  perceived_affects: string[]
  probable_clinical_meaning: string[]
  caution_points: string[]
  supervision_axes: string[]

  suggested_note: string | null
  free_notes: string | null

  priority_level: SupervisionPriorityLevel

  created_at: string
  updated_at: string
}

export type AtpeSupervisionEntryInsert = {
  patient_id?: string | null
  group_id?: string | null
  atpe_session_advanced_id?: string | null

  supervision_date?: string
  supervisor_id?: string | null
  clinician_id?: string | null

  session_context?: string | null
  therapist_experiences?: string[]
  perceived_affects?: string[]
  probable_clinical_meaning?: string[]
  caution_points?: string[]
  supervision_axes?: string[]

  suggested_note?: string | null
  free_notes?: string | null

  priority_level?: SupervisionPriorityLevel
}

export type AtpeSupervisionEntryUpdate = Partial<AtpeSupervisionEntryInsert>

export type SupervisionFlagLevel = 'info' | 'moderate' | 'high'

export type AtpeSupervisionFlagRow = {
  id: string
  supervision_entry_id: string

  level: SupervisionFlagLevel
  code: string
  title: string
  description: string

  created_at: string
}

export type AtpeSupervisionFlagInsert = {
  supervision_entry_id: string

  level: SupervisionFlagLevel
  code: string
  title: string
  description: string
}

export type ProtocolFrameIntensity = 'faible' | 'modérée' | 'soutenue' | 'renforcée'

export type ProtocolNextSessionType =
  | 'séance contenante'
  | 'séance de relance créative'
  | 'séance de transformation symbolique'
  | 'séance de reprise groupale'
  | 'séance de consolidation'

export type ProtocolVerbalization =
  | 'très limitée'
  | 'courte et cadrée'
  | 'progressive'
  | 'élaborative prudente'

export type AtpeProtocolPlanRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  atpe_session_advanced_id: string | null

  source_session_id: string
  frame_intensity: ProtocolFrameIntensity
  next_session_type: ProtocolNextSessionType
  verbalization: ProtocolVerbalization

  therapist_posture: string[]
  narrative: string | null

  attitude_interieure: string | null
  creation_step: string | null
  dialogue_oeuvre: string | null
  partage_step: string | null

  is_active: boolean

  created_by: string | null
  created_at: string
  updated_at: string
}

export type AtpeProtocolPlanInsert = {
  patient_id?: string | null
  group_id?: string | null
  atpe_session_advanced_id?: string | null

  source_session_id: string
  frame_intensity: ProtocolFrameIntensity
  next_session_type: ProtocolNextSessionType
  verbalization: ProtocolVerbalization

  therapist_posture?: string[]
  narrative?: string | null

  attitude_interieure?: string | null
  creation_step?: string | null
  dialogue_oeuvre?: string | null
  partage_step?: string | null

  is_active?: boolean

  created_by?: string | null
}

export type AtpeProtocolPlanUpdate = Partial<AtpeProtocolPlanInsert>

export type AtpeProtocolMediaRow = {
  id: string
  protocol_plan_id: string

  label: string
  reason: string
  sort_order: number

  created_at: string
}

export type AtpeProtocolMediaInsert = {
  protocol_plan_id: string
  label: string
  reason: string
  sort_order?: number
}

export type AtpeProtocolMediaUpdate = Partial<AtpeProtocolMediaInsert>

export type AtpeExportType =
  | 'therapeutic_summary'
  | 'supervision_note'
  | 'longitudinal_summary'
  | 'protocol_sheet'
  | 'group_summary'
  | 'custom'

export type AtpeExportFormat = 'txt' | 'json' | 'pdf' | 'docx'

export type AtpeExportStatus = 'generated' | 'downloaded' | 'archived'

export type AtpeExportLogRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  atpe_session_advanced_id: string | null

  export_type: AtpeExportType
  filename: string | null
  exported_by: string | null
  export_format: AtpeExportFormat

  status: AtpeExportStatus

  content_snapshot: string | null
  metadata: Record<string, unknown>

  created_at: string
}

export type AtpeExportLogInsert = {
  patient_id?: string | null
  group_id?: string | null
  atpe_session_advanced_id?: string | null

  export_type: AtpeExportType
  filename?: string | null
  exported_by?: string | null
  export_format?: AtpeExportFormat

  status?: AtpeExportStatus

  content_snapshot?: string | null
  metadata?: Record<string, unknown>
}

export type AtpeExportLogUpdate = Partial<AtpeExportLogInsert>

export type AtpeSignatureType =
  | 'clinical_summary'
  | 'supervision_validation'
  | 'protocol_validation'
  | 'group_summary_validation'
  | 'export_validation'

export type AtpeSignatureStatus = 'signed' | 'revoked' | 'superseded'

export type AtpeClinicalSignatureRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  atpe_session_advanced_id: string | null

  signature_type: AtpeSignatureType

  signer_id: string | null
  signer_name: string | null
  signer_role: string | null

  signature_status: AtpeSignatureStatus

  signed_payload: Record<string, unknown>
  comment: string | null

  signed_at: string
  created_at: string
}

export type AtpeClinicalSignatureInsert = {
  patient_id?: string | null
  group_id?: string | null
  atpe_session_advanced_id?: string | null

  signature_type: AtpeSignatureType

  signer_id?: string | null
  signer_name?: string | null
  signer_role?: string | null

  signature_status?: AtpeSignatureStatus

  signed_payload?: Record<string, unknown>
  comment?: string | null

  signed_at?: string
}

export type AtpeClinicalSignatureUpdate = Partial<AtpeClinicalSignatureInsert>

export type AtpeChangeActionType =
  | 'insert'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'signature'
  | 'export'

export type AtpeChangeHistoryRow = {
  id: string

  entity_type: string
  entity_id: string

  action_type: AtpeChangeActionType

  actor_id: string | null
  actor_name: string | null

  before_snapshot: Record<string, unknown> | null
  after_snapshot: Record<string, unknown> | null
  diff_snapshot: Record<string, unknown> | null

  note: string | null
  created_at: string
}

export type AtpeChangeHistoryInsert = {
  entity_type: string
  entity_id: string

  action_type: AtpeChangeActionType

  actor_id?: string | null
  actor_name?: string | null

  before_snapshot?: Record<string, unknown> | null
  after_snapshot?: Record<string, unknown> | null
  diff_snapshot?: Record<string, unknown> | null

  note?: string | null
}

export type AtpeRecordVersionRow = {
  id: string

  entity_type: string
  entity_id: string
  version_number: number

  payload: Record<string, unknown>
  created_by: string | null
  created_at: string
}

export type AtpeRecordVersionInsert = {
  entity_type: string
  entity_id: string
  version_number: number

  payload: Record<string, unknown>
  created_by?: string | null
}

export type AtpeActivityType =
  | 'session_created'
  | 'session_updated'
  | 'supervision_created'
  | 'protocol_generated'
  | 'export_generated'
  | 'signature_added'
  | 'group_session_created'
  | 'group_session_updated'

export type AtpeActivityLogRow = {
  id: string

  patient_id: string | null
  group_id: string | null
  session_id: string | null

  activity_type: AtpeActivityType
  description: string
  actor_id: string | null
  metadata: Record<string, unknown>

  created_at: string
}

export type AtpeActivityLogInsert = {
  patient_id?: string | null
  group_id?: string | null
  session_id?: string | null

  activity_type: AtpeActivityType
  description: string
  actor_id?: string | null
  metadata?: Record<string, unknown>
}

export type PatientRow = {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  code?: string | null
  patient_code?: string | null
  reference?: string | null
  email?: string | null
  created_at?: string | null
  updated_at?: string | null
  organization_id?: string | null
  clinician_id?: string | null
  status?: string | null
  [key: string]: unknown
}

export type SessionRow = {
  id: string
  patient_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}