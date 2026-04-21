import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { PatientRow, SessionRow } from '@/lib/patient-types'

export function getPatientDisplayName(patient: PatientRow) {
  const fullName =
    typeof patient.full_name === 'string' ? patient.full_name.trim() : ''
  const firstName =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const lastName =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''

  if (fullName) return fullName
  if (firstName || lastName) return `${firstName} ${lastName}`.trim()
  return `Patient ${patient.id}`
}

export function getPatientReference(patient: PatientRow) {
  const candidates = [
    patient.patient_code,
    patient.code,
    patient.reference,
    patient.id,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return patient.id
}

export function formatPatientDate(value?: string | null) {
  if (!value) return 'Non renseigné'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseigné'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export async function getPatientById(patientId: string): Promise<PatientRow | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single()

  if (error || !data) {
    return null
  }

  return data as PatientRow
}

export async function getLatestSessionId(patientId: string): Promise<string | null> {
  const supabase = getSupabaseServerClient()
  const tableCandidates = ['sessions', 'therapy_sessions']

  for (const tableName of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, patient_id, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        const row = data[0] as SessionRow
        if (typeof row.id === 'string' && row.id.trim()) {
          return row.id
        }
      }
    } catch {
      // tolérance volontaire
    }
  }

  return null
}