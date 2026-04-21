import { getSupabaseServerClient } from '@/lib/supabase-server'

export type AuditAccessType =
  | 'patient_access'
  | 'group_access'
  | 'clinical_admin_access'
  | 'export_access'
  | 'signature_access'

export async function logSecurityAudit(args: {
  actorId?: string | null
  patientId?: string | null
  groupId?: string | null
  sessionId?: string | null
  accessType: AuditAccessType
  description: string
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = getSupabaseServerClient()

    await supabase.from('atpe_activity_log').insert({
      patient_id: args.patientId ?? null,
      group_id: args.groupId ?? null,
      session_id: args.sessionId ?? null,
      activity_type: 'session_updated',
      description: `[${args.accessType}] ${args.description}`,
      actor_id: args.actorId ?? null,
      metadata: args.metadata ?? {},
    })
  } catch (error) {
    console.error('logSecurityAudit error:', error)
  }
}