export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      atpe_case_summaries: {
        Row: {
          id: string
          patient_id: string
          case_slug: string
          title: string
          setting: string | null
          modality: string | null
          dominant_case_theme: string | null
          total_sessions: number
          expression_assessment: Json
          intermediate_review: Json
          final_review: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          patient_id: string
          case_slug: string
          title: string
          setting?: string | null
          modality?: string | null
          dominant_case_theme?: string | null
          total_sessions?: number
          expression_assessment?: Json
          intermediate_review?: Json
          final_review?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          case_slug?: string
          title?: string
          setting?: string | null
          modality?: string | null
          dominant_case_theme?: string | null
          total_sessions?: number
          expression_assessment?: Json
          intermediate_review?: Json
          final_review?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}