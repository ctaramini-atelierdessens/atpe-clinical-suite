import type { AtpeAdvancedSessionInput } from './expert-engine'

export type AtpeSessionAdvancedRow = {
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
}

export function mapSessionToExpertInput(
  row: AtpeSessionAdvancedRow
): AtpeAdvancedSessionInput {
  return {
    frame_containment: row.frame_containment,
    bodily_engagement: row.bodily_engagement,
    decentering_level: row.decentering_level,
    centering_level: row.centering_level,
    externalization_level: row.externalization_level,
    work_dialogue_level: row.work_dialogue_level,
    sharing_level: row.sharing_level,
    primary_symbolization: row.primary_symbolization,
    secondary_symbolization: row.secondary_symbolization,
    relational_availability: row.relational_availability,
    creative_mobility: row.creative_mobility,
    projective_intensity: row.projective_intensity,
    therapist_presence_quality: row.therapist_presence_quality,
    patient_engagement_level: row.patient_engagement_level,
    therapist_feels_confusion: row.therapist_feels_confusion,
    therapist_feels_sudden_fatigue: row.therapist_feels_sudden_fatigue,
    therapist_feels_pressure: row.therapist_feels_pressure,
    therapist_feels_irritation: row.therapist_feels_irritation,
    therapist_feels_void: row.therapist_feels_void,
    patient_repeats_without_integration: row.patient_repeats_without_integration,
    group_feels_same_affect: row.group_feels_same_affect,
    tension_spreads_quickly: row.tension_spreads_quickly,
  }
}