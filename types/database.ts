export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; created_by: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; created_by?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; created_by?: string | null; created_at?: string }
      }
      profiles: {
        Row: { id: string; full_name: string | null; global_role: 'platform_admin' | 'clinician'; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; global_role?: 'platform_admin' | 'clinician'; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; global_role?: 'platform_admin' | 'clinician'; created_at?: string; updated_at?: string }
      }
      organization_memberships: {
        Row: { id: string; organization_id: string; user_id: string; role: 'owner' | 'admin' | 'clinician' | 'supervisor' | 'reader'; created_at: string }
        Insert: { id?: string; organization_id: string; user_id: string; role?: 'owner' | 'admin' | 'clinician' | 'supervisor' | 'reader'; created_at?: string }
        Update: { id?: string; organization_id?: string; user_id?: string; role?: 'owner' | 'admin' | 'clinician' | 'supervisor' | 'reader'; created_at?: string }
      }
      patients: {
        Row: {
          id: string; organization_id: string; primary_clinician_id: string; code: string; display_name: string | null; initials: string | null; birth_year: number | null;
          sex: string | null; referral_source: string | null; case_reference: string | null; status: 'active' | 'paused' | 'closed';
          first_contact_on: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; organization_id: string; primary_clinician_id: string; code: string; display_name?: string | null; initials?: string | null; birth_year?: number | null;
          sex?: string | null; referral_source?: string | null; case_reference?: string | null; status?: 'active' | 'paused' | 'closed';
          first_contact_on?: string | null; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; organization_id?: string; primary_clinician_id?: string; code?: string; display_name?: string | null; initials?: string | null; birth_year?: number | null;
          sex?: string | null; referral_source?: string | null; case_reference?: string | null; status?: 'active' | 'paused' | 'closed';
          first_contact_on?: string | null; created_at?: string; updated_at?: string
        }
      }
      patient_consents: {
        Row: { id: string; patient_id: string; consent_kind: 'care' | 'data_processing' | 'image_audio' | 'research'; status: 'granted' | 'refused' | 'withdrawn' | 'expired'; recorded_at: string; expires_at: string | null; note: string | null; created_by: string | null }
        Insert: { id?: string; patient_id: string; consent_kind: 'care' | 'data_processing' | 'image_audio' | 'research'; status?: 'granted' | 'refused' | 'withdrawn' | 'expired'; recorded_at?: string; expires_at?: string | null; note?: string | null; created_by?: string | null }
        Update: { id?: string; patient_id?: string; consent_kind?: 'care' | 'data_processing' | 'image_audio' | 'research'; status?: 'granted' | 'refused' | 'withdrawn' | 'expired'; recorded_at?: string; expires_at?: string | null; note?: string | null; created_by?: string | null }
      }

      consent_signatures: {
        Row: { id: string; consent_id: string; signer_name: string; signer_role: string; signature_mode: 'typed' | 'drawn'; signature_text: string | null; signature_data_url: string | null; signed_at: string; created_by: string | null; created_at: string; signature_level: 'simple' | 'advanced'; signer_email: string | null; signer_identifier: string | null; witness_name: string | null; signed_document_hash: string | null; evidence: Json }
        Insert: { id?: string; consent_id: string; signer_name: string; signer_role?: string; signature_mode?: 'typed' | 'drawn'; signature_text?: string | null; signature_data_url?: string | null; signed_at?: string; created_by?: string | null; created_at?: string; signature_level?: 'simple' | 'advanced'; signer_email?: string | null; signer_identifier?: string | null; witness_name?: string | null; signed_document_hash?: string | null; evidence?: Json }
        Update: { id?: string; consent_id?: string; signer_name?: string; signer_role?: string; signature_mode?: 'typed' | 'drawn'; signature_text?: string | null; signature_data_url?: string | null; signed_at?: string; created_by?: string | null; created_at?: string; signature_level?: 'simple' | 'advanced'; signer_email?: string | null; signer_identifier?: string | null; witness_name?: string | null; signed_document_hash?: string | null; evidence?: Json }
      }
      therapy_episodes: {
        Row: { id: string; organization_id: string; patient_id: string; clinician_id: string; episode_label: string; referral_reason: string | null; therapeutic_frame: string | null; clinical_indication: string | null; objectives_summary: string | null; status: 'draft' | 'active' | 'completed' | 'suspended'; opened_on: string; closed_on: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; patient_id: string; clinician_id: string; episode_label?: string; referral_reason?: string | null; therapeutic_frame?: string | null; clinical_indication?: string | null; objectives_summary?: string | null; status?: 'draft' | 'active' | 'completed' | 'suspended'; opened_on?: string; closed_on?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; patient_id?: string; clinician_id?: string; episode_label?: string; referral_reason?: string | null; therapeutic_frame?: string | null; clinical_indication?: string | null; objectives_summary?: string | null; status?: 'draft' | 'active' | 'completed' | 'suspended'; opened_on?: string; closed_on?: string | null; created_at?: string; updated_at?: string }
      }
      therapy_goals: {
        Row: { id: string; episode_id: string; title: string; description: string | null; priority: 'low' | 'medium' | 'high'; status: 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed'; target_review_date: string | null; created_at: string; updated_at: string; deleted_at: string | null; deleted_by: string | null }
        Insert: { id?: string; episode_id: string; title: string; description?: string | null; priority?: 'low' | 'medium' | 'high'; status?: 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed'; target_review_date?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null; deleted_by?: string | null }
        Update: { id?: string; episode_id?: string; title?: string; description?: string | null; priority?: 'low' | 'medium' | 'high'; status?: 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed'; target_review_date?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null; deleted_by?: string | null }
      }
      sessions: {
        Row: { id: string; organization_id: string; patient_id: string; episode_id: string; clinician_id: string; session_number: number; session_date: string; duration_minutes: number | null; setting_type: 'cabinet' | 'institution' | 'domicile' | 'teleconsultation' | 'other'; mediation_type: 'arts_plastiques' | 'musique' | 'ecriture' | 'corps_mouvement' | 'mixte' | 'other'; frame_quality: 'stable' | 'fragile' | 'rupture'; emotional_score: number; body_score: number; awareness_score: number; dynamic_score: number; symbolic_score: number; regulation_score: number; engagement_score: number; note: string | null; clinical_summary: string | null; therapist_hypothesis: string | null; created_at: string; updated_at: string; deleted_at: string | null; deleted_by: string | null }
        Insert: { id?: string; organization_id: string; patient_id: string; episode_id: string; clinician_id: string; session_number: number; session_date: string; duration_minutes?: number | null; setting_type?: 'cabinet' | 'institution' | 'domicile' | 'teleconsultation' | 'other'; mediation_type?: 'arts_plastiques' | 'musique' | 'ecriture' | 'corps_mouvement' | 'mixte' | 'other'; frame_quality?: 'stable' | 'fragile' | 'rupture'; emotional_score?: number; body_score?: number; awareness_score?: number; dynamic_score?: number; symbolic_score?: number; regulation_score?: number; engagement_score?: number; note?: string | null; clinical_summary?: string | null; therapist_hypothesis?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null; deleted_by?: string | null }
        Update: { id?: string; organization_id?: string; patient_id?: string; episode_id?: string; clinician_id?: string; session_number?: number; session_date?: string; duration_minutes?: number | null; setting_type?: 'cabinet' | 'institution' | 'domicile' | 'teleconsultation' | 'other'; mediation_type?: 'arts_plastiques' | 'musique' | 'ecriture' | 'corps_mouvement' | 'mixte' | 'other'; frame_quality?: 'stable' | 'fragile' | 'rupture'; emotional_score?: number; body_score?: number; awareness_score?: number; dynamic_score?: number; symbolic_score?: number; regulation_score?: number; engagement_score?: number; note?: string | null; clinical_summary?: string | null; therapist_hypothesis?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null; deleted_by?: string | null }
      }

      session_note_versions: {
        Row: { id: string; session_id: string; version_number: number; previous_note: string | null; previous_clinical_summary: string | null; previous_therapist_hypothesis: string | null; change_reason: string | null; edited_by: string | null; edited_at: string }
        Insert: { id?: string; session_id: string; version_number: number; previous_note?: string | null; previous_clinical_summary?: string | null; previous_therapist_hypothesis?: string | null; change_reason?: string | null; edited_by?: string | null; edited_at?: string }
        Update: { id?: string; session_id?: string; version_number?: number; previous_note?: string | null; previous_clinical_summary?: string | null; previous_therapist_hypothesis?: string | null; change_reason?: string | null; edited_by?: string | null; edited_at?: string }
      }
      session_artifacts: {
        Row: { id: string; session_id: string; artifact_type: string; title: string; storage_path: string | null; note: string | null; created_at: string }
        Insert: { id?: string; session_id: string; artifact_type: string; title: string; storage_path?: string | null; note?: string | null; created_at?: string }
        Update: { id?: string; session_id?: string; artifact_type?: string; title?: string; storage_path?: string | null; note?: string | null; created_at?: string }
      }

      patient_documents: {
        Row: { id: string; organization_id: string; patient_id: string; consent_id: string | null; category: 'clinical_document' | 'consent_signed_attachment' | 'identity' | 'other'; title: string; file_name: string; mime_type: string | null; byte_size: number | null; storage_bucket: string; storage_path: string; uploaded_by: string | null; created_at: string; retention_policy_label: string | null; retention_until: string | null; archived_at: string | null; archived_by: string | null }
        Insert: { id?: string; organization_id: string; patient_id: string; consent_id?: string | null; category?: 'clinical_document' | 'consent_signed_attachment' | 'identity' | 'other'; title: string; file_name: string; mime_type?: string | null; byte_size?: number | null; storage_bucket?: string; storage_path: string; uploaded_by?: string | null; created_at?: string; retention_policy_label?: string | null; retention_until?: string | null; archived_at?: string | null; archived_by?: string | null }
        Update: { id?: string; organization_id?: string; patient_id?: string; consent_id?: string | null; category?: 'clinical_document' | 'consent_signed_attachment' | 'identity' | 'other'; title?: string; file_name?: string; mime_type?: string | null; byte_size?: number | null; storage_bucket?: string; storage_path?: string; uploaded_by?: string | null; created_at?: string; retention_policy_label?: string | null; retention_until?: string | null; archived_at?: string | null; archived_by?: string | null }
      }
      patient_access_logs: {
        Row: { id: string; organization_id: string; patient_id: string; actor_user_id: string | null; access_scope: string; route: string; accessed_at: string }
        Insert: { id?: string; organization_id: string; patient_id: string; actor_user_id?: string | null; access_scope: string; route: string; accessed_at?: string }
        Update: { id?: string; organization_id?: string; patient_id?: string; actor_user_id?: string | null; access_scope?: string; route?: string; accessed_at?: string }
      }
      clinical_review_requests: {
        Row: { id: string; organization_id: string; patient_id: string; session_id: string | null; requested_by: string | null; assigned_supervisor_id: string | null; status: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'rejected'; request_note: string | null; supervisor_note: string | null; submitted_at: string | null; reviewed_at: string | null; reviewed_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; patient_id: string; session_id?: string | null; requested_by?: string | null; assigned_supervisor_id?: string | null; status?: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'rejected'; request_note?: string | null; supervisor_note?: string | null; submitted_at?: string | null; reviewed_at?: string | null; reviewed_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; patient_id?: string; session_id?: string | null; requested_by?: string | null; assigned_supervisor_id?: string | null; status?: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'rejected'; request_note?: string | null; supervisor_note?: string | null; submitted_at?: string | null; reviewed_at?: string | null; reviewed_by?: string | null; created_at?: string; updated_at?: string }
      }

      organization_security_policies: {
        Row: { id: string; organization_id: string; default_retention_days: number; signed_consent_retention_days: number; documents_bucket: string; consent_signatures_bucket: string; supervisor_notification_channel: string; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; default_retention_days?: number; signed_consent_retention_days?: number; documents_bucket?: string; consent_signatures_bucket?: string; supervisor_notification_channel?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; default_retention_days?: number; signed_consent_retention_days?: number; documents_bucket?: string; consent_signatures_bucket?: string; supervisor_notification_channel?: string; created_at?: string; updated_at?: string }
      }
      supervisor_notifications: {
        Row: { id: string; organization_id: string; patient_id: string | null; review_request_id: string | null; recipient_user_id: string; channel: string; title: string; body: string | null; status: 'unread' | 'read' | 'archived'; created_at: string; read_at: string | null }
        Insert: { id?: string; organization_id: string; patient_id?: string | null; review_request_id?: string | null; recipient_user_id: string; channel?: string; title: string; body?: string | null; status?: 'unread' | 'read' | 'archived'; created_at?: string; read_at?: string | null }
        Update: { id?: string; organization_id?: string; patient_id?: string | null; review_request_id?: string | null; recipient_user_id?: string; channel?: string; title?: string; body?: string | null; status?: 'unread' | 'read' | 'archived'; created_at?: string; read_at?: string | null }
      }

import_jobs: {
  Row: { id: string; organization_id: string; uploaded_by: string | null; file_name: string; mime_type: string | null; storage_bucket: string; storage_path: string; row_count: number | null; success_count: number | null; error_count: number | null; status: 'uploaded' | 'processed' | 'processed_with_errors' | 'failed'; summary: Json; created_at: string; processed_at: string | null }
  Insert: { id?: string; organization_id: string; uploaded_by?: string | null; file_name: string; mime_type?: string | null; storage_bucket?: string; storage_path: string; row_count?: number | null; success_count?: number | null; error_count?: number | null; status?: 'uploaded' | 'processed' | 'processed_with_errors' | 'failed'; summary?: Json; created_at?: string; processed_at?: string | null }
  Update: { id?: string; organization_id?: string; uploaded_by?: string | null; file_name?: string; mime_type?: string | null; storage_bucket?: string; storage_path?: string; row_count?: number | null; success_count?: number | null; error_count?: number | null; status?: 'uploaded' | 'processed' | 'processed_with_errors' | 'failed'; summary?: Json; created_at?: string; processed_at?: string | null }
}
import_row_results: {
  Row: { id: string; import_job_id: string; row_number: number; external_row_id: string | null; patient_code: string | null; patient_id: string | null; status: 'success' | 'warning' | 'error'; message: string | null; payload: Json; created_at: string }
  Insert: { id?: string; import_job_id: string; row_number: number; external_row_id?: string | null; patient_code?: string | null; patient_id?: string | null; status: 'success' | 'warning' | 'error'; message?: string | null; payload?: Json; created_at?: string }
  Update: { id?: string; import_job_id?: string; row_number?: number; external_row_id?: string | null; patient_code?: string | null; patient_id?: string | null; status?: 'success' | 'warning' | 'error'; message?: string | null; payload?: Json; created_at?: string }
}
patient_metric_snapshots: {
  Row: { id: string; organization_id: string; patient_id: string; source_type: 'excel_import' | 'manual'; source_job_id: string | null; snapshot_date: string; current_score: number | null; progression_percent: number | null; duration_days: number | null; imported_name: string | null; imported_age: number | null; raw_payload: Json; created_at: string }
  Insert: { id?: string; organization_id: string; patient_id: string; source_type: 'excel_import' | 'manual'; source_job_id?: string | null; snapshot_date?: string; current_score?: number | null; progression_percent?: number | null; duration_days?: number | null; imported_name?: string | null; imported_age?: number | null; raw_payload?: Json; created_at?: string }
  Update: { id?: string; organization_id?: string; patient_id?: string; source_type?: 'excel_import' | 'manual'; source_job_id?: string | null; snapshot_date?: string; current_score?: number | null; progression_percent?: number | null; duration_days?: number | null; imported_name?: string | null; imported_age?: number | null; raw_payload?: Json; created_at?: string }
}
      checklist_items: {
        Row: { id: string; organization_id: string; phase: '0-30' | '30-60' | '60-90'; workstream: string; task: string; priority: 'Critique' | 'Haute' | 'Moyenne' | 'Basse'; status: 'À faire' | 'En cours' | 'Bloqué' | 'Validé'; deliverable: string | null; owner: string | null; due_date: string | null; evidence: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; phase: '0-30' | '30-60' | '60-90'; workstream: string; task: string; priority?: 'Critique' | 'Haute' | 'Moyenne' | 'Basse'; status?: 'À faire' | 'En cours' | 'Bloqué' | 'Validé'; deliverable?: string | null; owner?: string | null; due_date?: string | null; evidence?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; phase?: '0-30' | '30-60' | '60-90'; workstream?: string; task?: string; priority?: 'Critique' | 'Haute' | 'Moyenne' | 'Basse'; status?: 'À faire' | 'En cours' | 'Bloqué' | 'Validé'; deliverable?: string | null; owner?: string | null; due_date?: string | null; evidence?: string | null; created_at?: string }
      }
      risk_items: {
        Row: { id: string; organization_id: string; title: string; cause: string | null; impact: string | null; probability: number; severity: number; mitigation: string | null; residual_risk: string | null; status: 'Ouvert' | 'Sous contrôle' | 'Clos'; created_at: string }
        Insert: { id?: string; organization_id: string; title: string; cause?: string | null; impact?: string | null; probability?: number; severity?: number; mitigation?: string | null; residual_risk?: string | null; status?: 'Ouvert' | 'Sous contrôle' | 'Clos'; created_at?: string }
        Update: { id?: string; organization_id?: string; title?: string; cause?: string | null; impact?: string | null; probability?: number; severity?: number; mitigation?: string | null; residual_risk?: string | null; status?: 'Ouvert' | 'Sous contrôle' | 'Clos'; created_at?: string }
      }
      audit_logs: {
        Row: { id: string; organization_id: string | null; actor_user_id: string | null; entity_type: string; entity_id: string | null; action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login'; metadata: Json; created_at: string }
        Insert: { id?: string; organization_id?: string | null; actor_user_id?: string | null; entity_type: string; entity_id?: string | null; action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login'; metadata?: Json; created_at?: string }
        Update: { id?: string; organization_id?: string | null; actor_user_id?: string | null; entity_type?: string; entity_id?: string | null; action?: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login'; metadata?: Json; created_at?: string }
      }
      data_exports: {
        Row: { id: string; organization_id: string; actor_user_id: string | null; export_type: 'pdf' | 'csv' | 'json' | 'xlsx'; entity_type: string; entity_id: string | null; destination: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; actor_user_id?: string | null; export_type: 'pdf' | 'csv' | 'json' | 'xlsx'; entity_type: string; entity_id?: string | null; destination?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; actor_user_id?: string | null; export_type?: 'pdf' | 'csv' | 'json' | 'xlsx'; entity_type?: string; entity_id?: string | null; destination?: string | null; created_at?: string }
      }
    }
    
Views: {
  active_patients: { Row: Database['public']['Tables']['patients']['Row'] }
  active_patient_sessions: { Row: Database['public']['Tables']['sessions']['Row'] }
  documents_retention_due: { Row: Database['public']['Tables']['patient_documents']['Row'] }
  latest_patient_metric_snapshots: { Row: Database['public']['Tables']['patient_metric_snapshots']['Row'] }
}
    
Functions: {
      current_org_id: { Args: Record<string, never>; Returns: string }
      current_membership_role: { Args: { org_id: string }; Returns: Database['public']['Enums']['membership_role'] }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      has_min_role: { Args: { org_id: string; min_role: Database['public']['Enums']['membership_role'] }; Returns: boolean }
      can_export_org_data: { Args: { org_id: string }; Returns: boolean }
      can_manage_patient: { Args: { patient_uuid: string }; Returns: boolean }
      can_read_patient: { Args: { patient_uuid: string }; Returns: boolean }
    }
    Enums: {
      membership_role: 'owner' | 'admin' | 'clinician' | 'supervisor' | 'reader'
      patient_status: 'active' | 'paused' | 'closed'
      episode_status: 'draft' | 'active' | 'completed' | 'suspended'
      goal_priority: 'low' | 'medium' | 'high'
      goal_status: 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed'
      consent_kind: 'care' | 'data_processing' | 'image_audio' | 'research'
      consent_status: 'granted' | 'refused' | 'withdrawn' | 'expired'
      checklist_phase: '0-30' | '30-60' | '60-90'
      priority_level: 'Critique' | 'Haute' | 'Moyenne' | 'Basse'
      task_status: 'À faire' | 'En cours' | 'Bloqué' | 'Validé'
      risk_status: 'Ouvert' | 'Sous contrôle' | 'Clos'
      audit_action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login'
      document_category: 'clinical_document' | 'consent_signed_attachment' | 'identity' | 'other'
      review_status: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'rejected'
      notification_status: 'unread' | 'read' | 'archived'
      import_status: 'uploaded' | 'processed' | 'processed_with_errors' | 'failed'
    }
  }
}
