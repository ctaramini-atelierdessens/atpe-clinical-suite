import { getSupabaseServerClient } from '@/lib/supabase-server'
import type {
  AtpeClinicalSignatureRow,
  AtpeExportLogRow,
  AtpeProtocolMediaRow,
  AtpeProtocolPlanRow,
  AtpeSupervisionEntryRow,
  AtpeSupervisionFlagRow,
  ClinicalGroupMemberRow,
  ClinicalGroupRow,
  GroupSessionRow,
} from '@/lib/clinical-db-types'

function sanitizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function sanitizePositiveInteger(value: unknown): number | null {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.floor(parsed)
}

type ListClinicalGroupsOptions = {
  id?: string | null
  organizationId?: string | null
  clinicianId?: string | null
  code?: string | null
  reference?: string | null
  name?: string | null
  status?: 'active' | 'paused' | 'closed' | 'archived' | null
  groupType?:
    | 'therapy_group'
    | 'art_therapy_group'
    | 'support_group'
    | 'mixed_group'
    | null
  format?: 'closed' | 'semi_open' | 'open' | null
  limit?: number | null
}

export async function listClinicalGroups(
  options: ListClinicalGroupsOptions = {},
): Promise<ClinicalGroupRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('clinical_groups')
    .select('*')
    .order('created_at', { ascending: false })

  const id = sanitizeString(options.id)
  const organizationId = sanitizeString(options.organizationId)
  const clinicianId = sanitizeString(options.clinicianId)
  const code = sanitizeString(options.code)
  const reference = sanitizeString(options.reference)
  const name = sanitizeString(options.name)
  const limit = sanitizePositiveInteger(options.limit)

  if (id) query = query.eq('id', id)
  if (organizationId) query = query.eq('organization_id', organizationId)
  if (clinicianId) query = query.eq('clinician_id', clinicianId)
  if (code) query = query.eq('code', code)
  if (reference) query = query.eq('reference', reference)
  if (name) query = query.ilike('name', `%${name}%`)
  if (options.status) query = query.eq('status', options.status)
  if (options.groupType) query = query.eq('group_type', options.groupType)
  if (options.format) query = query.eq('format', options.format)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as ClinicalGroupRow[]
}

export async function getClinicalGroupById(
  groupId: string,
): Promise<ClinicalGroupRow | null> {
  const supabase = getSupabaseServerClient()
  const safeGroupId = sanitizeString(groupId)

  if (!safeGroupId) return null

  const { data, error } = await supabase
    .from('clinical_groups')
    .select('*')
    .eq('id', safeGroupId)
    .single()

  if (error || !data) return null
  return data as ClinicalGroupRow
}

type ListClinicalGroupMembersOptions = {
  groupId?: string | null
  patientId?: string | null
  isActive?: boolean | null
  role?: 'member' | 'observer' | 'co_therapist' | null
  limit?: number | null
}

export async function listClinicalGroupMembers(
  options: ListClinicalGroupMembersOptions = {},
): Promise<ClinicalGroupMemberRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('clinical_group_members')
    .select('*')
    .order('joined_at', { ascending: false })

  const groupId = sanitizeString(options.groupId)
  const patientId = sanitizeString(options.patientId)
  const limit = sanitizePositiveInteger(options.limit)

  if (groupId) query = query.eq('group_id', groupId)
  if (patientId) query = query.eq('patient_id', patientId)
  if (typeof options.isActive === 'boolean') query = query.eq('is_active', options.isActive)
  if (options.role) query = query.eq('role', options.role)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as ClinicalGroupMemberRow[]
}

type ListGroupSessionsOptions = {
  groupId?: string | null
  sessionCode?: string | null
  status?: 'planned' | 'completed' | 'cancelled' | null
  location?: string | null
  mediumPrimary?: string | null
  fromDate?: string | null
  toDate?: string | null
  limit?: number | null
}

export async function listGroupSessions(
  options: ListGroupSessionsOptions = {},
): Promise<GroupSessionRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('group_sessions')
    .select('*')
    .order('scheduled_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const groupId = sanitizeString(options.groupId)
  const sessionCode = sanitizeString(options.sessionCode)
  const location = sanitizeString(options.location)
  const mediumPrimary = sanitizeString(options.mediumPrimary)
  const fromDate = sanitizeString(options.fromDate)
  const toDate = sanitizeString(options.toDate)
  const limit = sanitizePositiveInteger(options.limit)

  if (groupId) query = query.eq('group_id', groupId)
  if (sessionCode) query = query.eq('session_code', sessionCode)
  if (options.status) query = query.eq('status', options.status)
  if (location) query = query.ilike('location', `%${location}%`)
  if (mediumPrimary) query = query.ilike('medium_primary', `%${mediumPrimary}%`)
  if (fromDate) query = query.gte('scheduled_at', fromDate)
  if (toDate) query = query.lte('scheduled_at', toDate)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as GroupSessionRow[]
}

export async function getGroupSessionById(
  groupSessionId: string,
): Promise<GroupSessionRow | null> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(groupSessionId)

  if (!safeId) return null

  const { data, error } = await supabase
    .from('group_sessions')
    .select('*')
    .eq('id', safeId)
    .single()

  if (error || !data) return null
  return data as GroupSessionRow
}

type ListSupervisionEntriesOptions = {
  patientId?: string | null
  groupId?: string | null
  sessionAdvancedId?: string | null
  supervisorId?: string | null
  clinicianId?: string | null
  priorityLevel?: 'low' | 'standard' | 'high' | 'urgent' | null
  limit?: number | null
}

export async function listSupervisionEntries(
  options: ListSupervisionEntriesOptions = {},
): Promise<AtpeSupervisionEntryRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('atpe_supervision_entries')
    .select('*')
    .order('supervision_date', { ascending: false })

  const patientId = sanitizeString(options.patientId)
  const groupId = sanitizeString(options.groupId)
  const sessionAdvancedId = sanitizeString(options.sessionAdvancedId)
  const supervisorId = sanitizeString(options.supervisorId)
  const clinicianId = sanitizeString(options.clinicianId)
  const limit = sanitizePositiveInteger(options.limit)

  if (patientId) query = query.eq('patient_id', patientId)
  if (groupId) query = query.eq('group_id', groupId)
  if (sessionAdvancedId) query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
  if (supervisorId) query = query.eq('supervisor_id', supervisorId)
  if (clinicianId) query = query.eq('clinician_id', clinicianId)
  if (options.priorityLevel) query = query.eq('priority_level', options.priorityLevel)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as AtpeSupervisionEntryRow[]
}

export async function getSupervisionEntryById(
  supervisionEntryId: string,
): Promise<AtpeSupervisionEntryRow | null> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(supervisionEntryId)

  if (!safeId) return null

  const { data, error } = await supabase
    .from('atpe_supervision_entries')
    .select('*')
    .eq('id', safeId)
    .single()

  if (error || !data) return null
  return data as AtpeSupervisionEntryRow
}

export async function listSupervisionFlags(
  supervisionEntryId: string,
): Promise<AtpeSupervisionFlagRow[]> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(supervisionEntryId)

  if (!safeId) return []

  const { data, error } = await supabase
    .from('atpe_supervision_flags')
    .select('*')
    .eq('supervision_entry_id', safeId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as AtpeSupervisionFlagRow[]
}

type ListProtocolPlansOptions = {
  patientId?: string | null
  groupId?: string | null
  sessionAdvancedId?: string | null
  sourceSessionId?: string | null
  isActive?: boolean | null
  frameIntensity?: 'faible' | 'modérée' | 'soutenue' | 'renforcée' | null
  nextSessionType?:
    | 'séance contenante'
    | 'séance de relance créative'
    | 'séance de transformation symbolique'
    | 'séance de reprise groupale'
    | 'séance de consolidation'
    | null
  verbalization?:
    | 'très limitée'
    | 'courte et cadrée'
    | 'progressive'
    | 'élaborative prudente'
    | null
  limit?: number | null
}

export async function listProtocolPlans(
  options: ListProtocolPlansOptions = {},
): Promise<AtpeProtocolPlanRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('atpe_protocol_plans')
    .select('*')
    .order('created_at', { ascending: false })

  const patientId = sanitizeString(options.patientId)
  const groupId = sanitizeString(options.groupId)
  const sessionAdvancedId = sanitizeString(options.sessionAdvancedId)
  const sourceSessionId = sanitizeString(options.sourceSessionId)
  const limit = sanitizePositiveInteger(options.limit)

  if (patientId) query = query.eq('patient_id', patientId)
  if (groupId) query = query.eq('group_id', groupId)
  if (sessionAdvancedId) query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
  if (sourceSessionId) query = query.eq('source_session_id', sourceSessionId)
  if (typeof options.isActive === 'boolean') query = query.eq('is_active', options.isActive)
  if (options.frameIntensity) query = query.eq('frame_intensity', options.frameIntensity)
  if (options.nextSessionType) query = query.eq('next_session_type', options.nextSessionType)
  if (options.verbalization) query = query.eq('verbalization', options.verbalization)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as AtpeProtocolPlanRow[]
}

export async function getProtocolPlanById(
  protocolPlanId: string,
): Promise<AtpeProtocolPlanRow | null> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(protocolPlanId)

  if (!safeId) return null

  const { data, error } = await supabase
    .from('atpe_protocol_plans')
    .select('*')
    .eq('id', safeId)
    .single()

  if (error || !data) return null
  return data as AtpeProtocolPlanRow
}

export async function listProtocolMedia(
  protocolPlanId: string,
): Promise<AtpeProtocolMediaRow[]> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(protocolPlanId)

  if (!safeId) return []

  const { data, error } = await supabase
    .from('atpe_protocol_media')
    .select('*')
    .eq('protocol_plan_id', safeId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as AtpeProtocolMediaRow[]
}

type ListExportLogsOptions = {
  patientId?: string | null
  groupId?: string | null
  sessionAdvancedId?: string | null
  exportType?:
    | 'therapeutic_summary'
    | 'supervision_note'
    | 'longitudinal_summary'
    | 'protocol_sheet'
    | 'group_summary'
    | 'custom'
    | null
  status?: 'generated' | 'downloaded' | 'archived' | null
  limit?: number | null
}

export async function listExportLogs(
  options: ListExportLogsOptions = {},
): Promise<AtpeExportLogRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('atpe_export_logs')
    .select('*')
    .order('created_at', { ascending: false })

  const patientId = sanitizeString(options.patientId)
  const groupId = sanitizeString(options.groupId)
  const sessionAdvancedId = sanitizeString(options.sessionAdvancedId)
  const limit = sanitizePositiveInteger(options.limit)

  if (patientId) query = query.eq('patient_id', patientId)
  if (groupId) query = query.eq('group_id', groupId)
  if (sessionAdvancedId) query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
  if (options.exportType) query = query.eq('export_type', options.exportType)
  if (options.status) query = query.eq('status', options.status)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as AtpeExportLogRow[]
}

export async function getExportLogById(
  exportLogId: string,
): Promise<AtpeExportLogRow | null> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(exportLogId)

  if (!safeId) return null

  const { data, error } = await supabase
    .from('atpe_export_logs')
    .select('*')
    .eq('id', safeId)
    .single()

  if (error || !data) return null
  return data as AtpeExportLogRow
}

type ListClinicalSignaturesOptions = {
  patientId?: string | null
  groupId?: string | null
  sessionAdvancedId?: string | null
  signatureType?:
    | 'clinical_summary'
    | 'supervision_validation'
    | 'protocol_validation'
    | 'group_summary_validation'
    | 'export_validation'
    | null
  signatureStatus?: 'signed' | 'revoked' | 'superseded' | null
  signerId?: string | null
  limit?: number | null
}

export async function listClinicalSignatures(
  options: ListClinicalSignaturesOptions = {},
): Promise<AtpeClinicalSignatureRow[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('atpe_clinical_signatures')
    .select('*')
    .order('signed_at', { ascending: false })

  const patientId = sanitizeString(options.patientId)
  const groupId = sanitizeString(options.groupId)
  const sessionAdvancedId = sanitizeString(options.sessionAdvancedId)
  const signerId = sanitizeString(options.signerId)
  const limit = sanitizePositiveInteger(options.limit)

  if (patientId) query = query.eq('patient_id', patientId)
  if (groupId) query = query.eq('group_id', groupId)
  if (sessionAdvancedId) query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
  if (options.signatureType) query = query.eq('signature_type', options.signatureType)
  if (options.signatureStatus) query = query.eq('signature_status', options.signatureStatus)
  if (signerId) query = query.eq('signer_id', signerId)
  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as AtpeClinicalSignatureRow[]
}

export async function getClinicalSignatureById(
  signatureId: string,
): Promise<AtpeClinicalSignatureRow | null> {
  const supabase = getSupabaseServerClient()
  const safeId = sanitizeString(signatureId)

  if (!safeId) return null

  const { data, error } = await supabase
    .from('atpe_clinical_signatures')
    .select('*')
    .eq('id', safeId)
    .single()

  if (error || !data) return null
  return data as AtpeClinicalSignatureRow
}