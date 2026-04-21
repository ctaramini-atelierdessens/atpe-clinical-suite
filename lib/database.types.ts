export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          organization_id: string | null
          clinician_id: string | null
          code: string | null
          patient_code: string | null
          full_name: string | null
          display_name: string | null
          name: string | null
          initials: string | null
          first_name: string | null
          last_name: string | null
          birth_date: string | null
          status: string | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          code?: string | null
          patient_code?: string | null
          full_name?: string | null
          display_name?: string | null
          name?: string | null
          initials?: string | null
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          status?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          code?: string | null
          patient_code?: string | null
          full_name?: string | null
          display_name?: string | null
          name?: string | null
          initials?: string | null
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          status?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }

      sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          organization_id: string | null
          clinician_id: string | null
          patient_id: string
          therapy_episode_id: string | null
          session_date: string | null
          status: string | null
          title: string | null
          notes: string | null
          media: string | null
          media_used: string[] | null
          duration_minutes: number | null
          emotional_score: number | null
          body_score: number | null
          symbolic_score: number | null
          relational_score: number | null
          global_score: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          patient_id: string
          therapy_episode_id?: string | null
          session_date?: string | null
          status?: string | null
          title?: string | null
          notes?: string | null
          media?: string | null
          media_used?: string[] | null
          duration_minutes?: number | null
          emotional_score?: number | null
          body_score?: number | null
          symbolic_score?: number | null
          relational_score?: number | null
          global_score?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          patient_id?: string
          therapy_episode_id?: string | null
          session_date?: string | null
          status?: string | null
          title?: string | null
          notes?: string | null
          media?: string | null
          media_used?: string[] | null
          duration_minutes?: number | null
          emotional_score?: number | null
          body_score?: number | null
          symbolic_score?: number | null
          relational_score?: number | null
          global_score?: number | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      audit_logs: {
        Row: {
          id: string
          created_at: string | null
          patient_id: string | null
          session_id: string | null
          user_id: string | null
          action: string | null
          event: string | null
          label: string | null
          description: string | null
          details: string | null
          message: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          patient_id?: string | null
          session_id?: string | null
          user_id?: string | null
          action?: string | null
          event?: string | null
          label?: string | null
          description?: string | null
          details?: string | null
          message?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          patient_id?: string | null
          session_id?: string | null
          user_id?: string | null
          action?: string | null
          event?: string | null
          label?: string | null
          description?: string | null
          details?: string | null
          message?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }

      patient_documents: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          uploaded_by: string | null
          title: string | null
          name: string | null
          filename: string | null
          file_url: string | null
          storage_path: string | null
          content_type: string | null
          size_bytes: number | null
          description: string | null
          category: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          uploaded_by?: string | null
          title?: string | null
          name?: string | null
          filename?: string | null
          file_url?: string | null
          storage_path?: string | null
          content_type?: string | null
          size_bytes?: number | null
          description?: string | null
          category?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          uploaded_by?: string | null
          title?: string | null
          name?: string | null
          filename?: string | null
          file_url?: string | null
          storage_path?: string | null
          content_type?: string | null
          size_bytes?: number | null
          description?: string | null
          category?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'patient_documents_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      clinical_alerts: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          session_id: string | null
          severity: string | null
          status: string | null
          title: string | null
          label: string | null
          name: string | null
          description: string | null
          message: string | null
          details: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          session_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          label?: string | null
          name?: string | null
          description?: string | null
          message?: string | null
          details?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          session_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          label?: string | null
          name?: string | null
          description?: string | null
          message?: string | null
          details?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'clinical_alerts_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      patient_access_logs: {
        Row: {
          id: string
          created_at: string | null
          patient_id: string
          user_id: string | null
          actor_name: string | null
          user_name: string | null
          email: string | null
          action: string | null
          event: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          patient_id: string
          user_id?: string | null
          actor_name?: string | null
          user_name?: string | null
          email?: string | null
          action?: string | null
          event?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          patient_id?: string
          user_id?: string | null
          actor_name?: string | null
          user_name?: string | null
          email?: string | null
          action?: string | null
          event?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'patient_access_logs_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      initial_assessments: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          summary: string | null
          clinical_summary: string | null
          notes: string | null
          content: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          summary?: string | null
          clinical_summary?: string | null
          notes?: string | null
          content?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          summary?: string | null
          clinical_summary?: string | null
          notes?: string | null
          content?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'initial_assessments_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      trace_prenom_observations: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          session_id: string | null
          organization_id: string | null
          clinician_id: string | null
          pressure: string | null
          continuity: string | null
          organization: string | null
          repetition: string | null
          hesitation: string | null
          anchoring: string | null
          readability: string | null
          notes: string | null
          clinician_notes: string | null
          engagement_score: number | null
          tension_score: number | null
          vulnerability_score: number | null
          symbolization_score: number | null
          anchoring_score: number | null
          continuity_score: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          session_id?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          pressure?: string | null
          continuity?: string | null
          organization?: string | null
          repetition?: string | null
          hesitation?: string | null
          anchoring?: string | null
          readability?: string | null
          notes?: string | null
          clinician_notes?: string | null
          engagement_score?: number | null
          tension_score?: number | null
          vulnerability_score?: number | null
          symbolization_score?: number | null
          anchoring_score?: number | null
          continuity_score?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          session_id?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          pressure?: string | null
          continuity?: string | null
          organization?: string | null
          repetition?: string | null
          hesitation?: string | null
          anchoring?: string | null
          readability?: string | null
          notes?: string | null
          clinician_notes?: string | null
          engagement_score?: number | null
          tension_score?: number | null
          vulnerability_score?: number | null
          symbolization_score?: number | null
          anchoring_score?: number | null
          continuity_score?: number | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'trace_prenom_observations_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      patient_atpe_profiles: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          profile_label: string | null
          label: string | null
          primary_profile: string | null
          summary: string | null
          clinical_summary: string | null
          interpretation: string | null
          primary_condition_id: string | null
          global_score: number | null
          cohesion_score: number | null
          integration_score: number | null
          regulation_score: number | null
          risk_flags: string[] | null
          follow_up_points: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          profile_label?: string | null
          label?: string | null
          primary_profile?: string | null
          summary?: string | null
          clinical_summary?: string | null
          interpretation?: string | null
          primary_condition_id?: string | null
          global_score?: number | null
          cohesion_score?: number | null
          integration_score?: number | null
          regulation_score?: number | null
          risk_flags?: string[] | null
          follow_up_points?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          profile_label?: string | null
          label?: string | null
          primary_profile?: string | null
          summary?: string | null
          clinical_summary?: string | null
          interpretation?: string | null
          primary_condition_id?: string | null
          global_score?: number | null
          cohesion_score?: number | null
          integration_score?: number | null
          regulation_score?: number | null
          risk_flags?: string[] | null
          follow_up_points?: string[] | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'patient_atpe_profiles_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: true
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      dialogue_colore_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          contact: number | null
          engagement: number | null
          continuity: number | null
          rupture: number | null
          opposition: number | null
          complementarity: number | null
          emotional_expression: number | null
          inhibition: number | null
          intensity: number | null
          symbolic_emergence: number | null
          coherence: number | null
          affirmation: number | null
          instability: number | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          contact?: number | null
          engagement?: number | null
          continuity?: number | null
          rupture?: number | null
          opposition?: number | null
          complementarity?: number | null
          emotional_expression?: number | null
          inhibition?: number | null
          intensity?: number | null
          symbolic_emergence?: number | null
          coherence?: number | null
          affirmation?: number | null
          instability?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          contact?: number | null
          engagement?: number | null
          continuity?: number | null
          rupture?: number | null
          opposition?: number | null
          complementarity?: number | null
          emotional_expression?: number | null
          inhibition?: number | null
          intensity?: number | null
          symbolic_emergence?: number | null
          coherence?: number | null
          affirmation?: number | null
          instability?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'dialogue_colore_sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      diamandala_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          synchronization: number | null
          adaptation: number | null
          center_approach: number | null
          center_avoidance: number | null
          center_integration: number | null
          structure_organization: number | null
          coherence: number | null
          complexity: number | null
          color_expression: number | null
          emotional_intensity: number | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          synchronization?: number | null
          adaptation?: number | null
          center_approach?: number | null
          center_avoidance?: number | null
          center_integration?: number | null
          structure_organization?: number | null
          coherence?: number | null
          complexity?: number | null
          color_expression?: number | null
          emotional_intensity?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          synchronization?: number | null
          adaptation?: number | null
          center_approach?: number | null
          center_avoidance?: number | null
          center_integration?: number | null
          structure_organization?: number | null
          coherence?: number | null
          complexity?: number | null
          color_expression?: number | null
          emotional_intensity?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'diamandala_sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      ep_observations: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          session_id: string | null
          organization_id: string | null
          clinician_id: string | null
          anchoring: number | null
          coordination: number | null
          group_engagement: number | null
          rhythm_integration: number | null
          symbolic_expression: number | null
          structure_level: number | null
          expression_level: number | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          session_id?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          anchoring?: number | null
          coordination?: number | null
          group_engagement?: number | null
          rhythm_integration?: number | null
          symbolic_expression?: number | null
          structure_level?: number | null
          expression_level?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          session_id?: string | null
          organization_id?: string | null
          clinician_id?: string | null
          anchoring?: number | null
          coordination?: number | null
          group_engagement?: number | null
          rhythm_integration?: number | null
          symbolic_expression?: number | null
          structure_level?: number | null
          expression_level?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'ep_observations_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      color_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          preferred_colors: string[] | null
          rejected_colors: string[] | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          preferred_colors?: string[] | null
          rejected_colors?: string[] | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          preferred_colors?: string[] | null
          rejected_colors?: string[] | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'color_sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      voice_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          tone: string | null
          rhythm: string | null
          intensity: string | null
          emotional_load: number | null
          body_connection: number | null
          envelope: string | null
          mirror_quality: string | null
          archaic_expression: string | null
          vocal_emotion: string | null
          verbal_emotion: string | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          tone?: string | null
          rhythm?: string | null
          intensity?: string | null
          emotional_load?: number | null
          body_connection?: number | null
          envelope?: string | null
          mirror_quality?: string | null
          archaic_expression?: string | null
          vocal_emotion?: string | null
          verbal_emotion?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          tone?: string | null
          rhythm?: string | null
          intensity?: string | null
          emotional_load?: number | null
          body_connection?: number | null
          envelope?: string | null
          mirror_quality?: string | null
          archaic_expression?: string | null
          vocal_emotion?: string | null
          verbal_emotion?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'voice_sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      mandala_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          patient_id: string
          organization_id: string | null
          clinician_id: string | null
          center_strength: number | null
          boundary_integrity: number | null
          symmetry: number | null
          openness: number | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id: string
          organization_id?: string | null
          clinician_id?: string | null
          center_strength?: number | null
          boundary_integrity?: number | null
          symmetry?: number | null
          openness?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          patient_id?: string
          organization_id?: string | null
          clinician_id?: string | null
          center_strength?: number | null
          boundary_integrity?: number | null
          symmetry?: number | null
          openness?: number | null
          notes?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'mandala_sessions_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          }
        ]
      }

      atpe_conditions: {
        Row: {
          id: string
          created_at: string | null
          slug: string | null
          label: string | null
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }

      atpe_media: {
        Row: {
          id: string
          created_at: string | null
          slug: string | null
          label: string | null
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }

      atpe_protocols: {
        Row: {
          id: string
          created_at: string | null
          slug: string | null
          label: string | null
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }

      atpe_condition_media_rules: {
        Row: {
          id: string
          created_at: string | null
          condition_id: string
          media_id: string
          priority: number | null
          indications: string[] | null
          caution_points: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          condition_id: string
          media_id: string
          priority?: number | null
          indications?: string[] | null
          caution_points?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          condition_id?: string
          media_id?: string
          priority?: number | null
          indications?: string[] | null
          caution_points?: string[] | null
          metadata?: Json | null
        }
        Relationships: []
      }

      atpe_condition_protocol_rules: {
        Row: {
          id: string
          created_at: string | null
          condition_id: string
          protocol_id: string
          priority: number | null
          indications: string[] | null
          caution_points: string[] | null
          watchpoints: string[] | null
          team_relay: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          condition_id: string
          protocol_id: string
          priority?: number | null
          indications?: string[] | null
          caution_points?: string[] | null
          watchpoints?: string[] | null
          team_relay?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          condition_id?: string
          protocol_id?: string
          priority?: number | null
          indications?: string[] | null
          caution_points?: string[] | null
          watchpoints?: string[] | null
          team_relay?: Json | null
          metadata?: Json | null
        }
        Relationships: []
      }

      atpe_watchpoints: {
        Row: {
          id: string
          created_at: string | null
          slug: string | null
          label: string | null
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          slug?: string | null
          label?: string | null
          description?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}