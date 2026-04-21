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

export type AtpeAdvancedRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  session_id: string
  format: 'individual' | 'group'
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

  created_at: string
  updated_at?: string | null
}