'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAppContext, insertAuditLog } from '@/lib/atpe/app-context'
import { canCreateOrEdit, canExport, canSoftDelete, canReview, canUploadDocuments } from '@/lib/atpe/rbac'

function asNullable(value: FormDataEntryValue | null) {
  const str = value?.toString().trim() ?? ''
  return str.length ? str : null
}

function asInt(value: FormDataEntryValue | null) {
  const str = value?.toString().trim() ?? ''
  if (!str) return null
  const num = Number(str)
  return Number.isFinite(num) ? num : null
}

async function ensureWriteAccess() {
  const ctx = await getAppContext()
  if (!ctx.organization || !ctx.membership || !canCreateOrEdit(ctx.membership.role)) {
    throw new Error('Permissions insuffisantes pour modifier les données cliniques.')
  }
  return ctx
}

async function ensureExportAccess() {
  const ctx = await getAppContext()
  if (!ctx.organization || !ctx.membership || !canExport(ctx.membership.role)) {
    throw new Error('Permissions insuffisantes pour exporter les données.')
  }
  return ctx
}

async function getActiveEpisodeId(patientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('therapy_episodes')
    .select('id')
    .eq('patient_id', patientId)
    .order('opened_on', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

export async function createPatientAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')

  const patientPayload = {
    organization_id: organization.id,
    primary_clinician_id: user.id,
    code: String(formData.get('code') ?? '').trim(),
    initials: asNullable(formData.get('initials')),
    birth_year: asInt(formData.get('birth_year')),
    sex: asNullable(formData.get('sex')),
    referral_source: asNullable(formData.get('referral_source')),
    case_reference: asNullable(formData.get('case_reference')),
    status: String(formData.get('status') ?? 'active') as 'active' | 'paused' | 'closed',
    first_contact_on: asNullable(formData.get('first_contact_on')),
  }

  const { data: patient, error: patientError } = await supabase.from('patients').insert(patientPayload).select('*').single()
  if (patientError || !patient) throw new Error(patientError?.message ?? 'Erreur création patient')

  const episodePayload = {
    organization_id: organization.id,
    patient_id: patient.id,
    clinician_id: user.id,
    episode_label: String(formData.get('episode_label') ?? 'Suivi principal').trim(),
    referral_reason: asNullable(formData.get('referral_reason')),
    therapeutic_frame: asNullable(formData.get('therapeutic_frame')),
    clinical_indication: asNullable(formData.get('clinical_indication')),
    objectives_summary: asNullable(formData.get('objectives_summary')),
    status: String(formData.get('episode_status') ?? 'active') as 'draft' | 'active' | 'completed' | 'suspended',
    opened_on: String(formData.get('opened_on') ?? new Date().toISOString().slice(0, 10)),
    closed_on: asNullable(formData.get('closed_on')),
  }

  const { data: episode, error: episodeError } = await supabase.from('therapy_episodes').insert(episodePayload).select('id').single()
  if (episodeError) throw new Error(episodeError.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'patient',
    entityId: patient.id,
    action: 'create',
    metadata: { code: patient.code, episodeId: episode?.id ?? null },
  })

  revalidatePath('/')
  revalidatePath('/patients')
  redirect(`/patients/${patient.id}`)
}

export async function updatePatientAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const episodeId = asNullable(formData.get('episode_id'))

  const { error: patientError } = await supabase
    .from('patients')
    .update({
      code: String(formData.get('code') ?? '').trim(),
      initials: asNullable(formData.get('initials')),
      birth_year: asInt(formData.get('birth_year')),
      sex: asNullable(formData.get('sex')),
      referral_source: asNullable(formData.get('referral_source')),
      case_reference: asNullable(formData.get('case_reference')),
      status: String(formData.get('status') ?? 'active') as 'active' | 'paused' | 'closed',
      first_contact_on: asNullable(formData.get('first_contact_on')),
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId)

  if (patientError) throw new Error(patientError.message)

  if (episodeId) {
    const { error: episodeError } = await supabase
      .from('therapy_episodes')
      .update({
        episode_label: String(formData.get('episode_label') ?? 'Suivi principal').trim(),
        referral_reason: asNullable(formData.get('referral_reason')),
        therapeutic_frame: asNullable(formData.get('therapeutic_frame')),
        clinical_indication: asNullable(formData.get('clinical_indication')),
        objectives_summary: asNullable(formData.get('objectives_summary')),
        status: String(formData.get('episode_status') ?? 'active') as 'draft' | 'active' | 'completed' | 'suspended',
        opened_on: String(formData.get('opened_on') ?? new Date().toISOString().slice(0, 10)),
        closed_on: asNullable(formData.get('closed_on')),
        updated_at: new Date().toISOString(),
      })
      .eq('id', episodeId)

    if (episodeError) throw new Error(episodeError.message)
  }

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'patient',
    entityId: patientId,
    action: 'update',
    metadata: { scope: 'patient+episode' },
  })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/edit`)
  revalidatePath('/patients')
  redirect(`/patients/${patientId}`)
}

export async function softDeletePatientAction(formData: FormData) {
  const { supabase, user, organization, membership } = await ensureWriteAccess()
  if (!organization || !membership || !canSoftDelete(membership.role)) throw new Error('Suppression logique non autorisée.')
  const patientId = String(formData.get('patient_id'))
  const reason = asNullable(formData.get('reason'))
  const now = new Date().toISOString()

  const { error } = await supabase.from('patients').update({ deleted_at: now, deleted_by: user.id, updated_at: now }).eq('id', patientId)
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'patient',
    entityId: patientId,
    action: 'delete',
    metadata: { mode: 'soft', reason },
  })

  revalidatePath('/patients')
  redirect('/patients')
}

export async function createSessionAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const episodeId = (await getActiveEpisodeId(patientId)) ?? String(formData.get('episode_id') ?? '')

  const payload = {
    organization_id: organization.id,
    patient_id: patientId,
    episode_id: episodeId,
    clinician_id: user.id,
    session_number: Number(formData.get('session_number') ?? 1),
    session_date: String(formData.get('session_date') ?? new Date().toISOString().slice(0, 10)),
    duration_minutes: asInt(formData.get('duration_minutes')),
    setting_type: String(formData.get('setting_type') ?? 'cabinet') as any,
    mediation_type: String(formData.get('mediation_type') ?? 'mixte') as any,
    frame_quality: String(formData.get('frame_quality') ?? 'stable') as any,
    emotional_score: Number(formData.get('emotional_score') ?? 0),
    body_score: Number(formData.get('body_score') ?? 0),
    awareness_score: Number(formData.get('awareness_score') ?? 0),
    dynamic_score: Number(formData.get('dynamic_score') ?? 0),
    symbolic_score: Number(formData.get('symbolic_score') ?? 0),
    regulation_score: Number(formData.get('regulation_score') ?? 0),
    engagement_score: Number(formData.get('engagement_score') ?? 0),
    note: asNullable(formData.get('note')),
    clinical_summary: asNullable(formData.get('clinical_summary')),
    therapist_hypothesis: asNullable(formData.get('therapist_hypothesis')),
  }

  const { data: session, error } = await supabase.from('sessions').insert(payload).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'session',
    entityId: session?.id,
    action: 'create',
    metadata: { patientId, session_number: payload.session_number },
  })

  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

async function storeSessionVersionIfNeeded(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, sessionId: string, changeReason: string | null, nextValues: { note: string | null; clinical_summary: string | null; therapist_hypothesis: string | null }) {
  const { data: previous } = await supabase
    .from('sessions')
    .select('note, clinical_summary, therapist_hypothesis')
    .eq('id', sessionId)
    .maybeSingle()

  if (!previous) return false

  const changed =
    (previous.note ?? null) !== nextValues.note ||
    (previous.clinical_summary ?? null) !== nextValues.clinical_summary ||
    (previous.therapist_hypothesis ?? null) !== nextValues.therapist_hypothesis

  if (!changed) return false

  const { data: latestVersion } = await supabase
    .from('session_note_versions')
    .select('version_number')
    .eq('session_id', sessionId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  await supabase.from('session_note_versions').insert({
    session_id: sessionId,
    version_number: (latestVersion?.version_number ?? 0) + 1,
    previous_note: previous.note,
    previous_clinical_summary: previous.clinical_summary,
    previous_therapist_hypothesis: previous.therapist_hypothesis,
    change_reason: changeReason,
    edited_by: userId,
  })
  return true
}

export async function updateSessionAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const sessionId = String(formData.get('session_id'))

  const nextNotes = {
    note: asNullable(formData.get('note')),
    clinical_summary: asNullable(formData.get('clinical_summary')),
    therapist_hypothesis: asNullable(formData.get('therapist_hypothesis')),
  }

  const versioned = await storeSessionVersionIfNeeded(supabase, user.id, sessionId, asNullable(formData.get('change_reason')), nextNotes)

  const { error } = await supabase
    .from('sessions')
    .update({
      session_number: Number(formData.get('session_number') ?? 1),
      session_date: String(formData.get('session_date') ?? new Date().toISOString().slice(0, 10)),
      duration_minutes: asInt(formData.get('duration_minutes')),
      setting_type: String(formData.get('setting_type') ?? 'cabinet') as any,
      mediation_type: String(formData.get('mediation_type') ?? 'mixte') as any,
      frame_quality: String(formData.get('frame_quality') ?? 'stable') as any,
      emotional_score: Number(formData.get('emotional_score') ?? 0),
      body_score: Number(formData.get('body_score') ?? 0),
      awareness_score: Number(formData.get('awareness_score') ?? 0),
      dynamic_score: Number(formData.get('dynamic_score') ?? 0),
      symbolic_score: Number(formData.get('symbolic_score') ?? 0),
      regulation_score: Number(formData.get('regulation_score') ?? 0),
      engagement_score: Number(formData.get('engagement_score') ?? 0),
      note: nextNotes.note,
      clinical_summary: nextNotes.clinical_summary,
      therapist_hypothesis: nextNotes.therapist_hypothesis,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'session',
    entityId: sessionId,
    action: 'update',
    metadata: { patientId, clinical_note_versioned: versioned },
  })

  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

export async function softDeleteSessionAction(formData: FormData) {
  const { supabase, user, organization, membership } = await ensureWriteAccess()
  if (!organization || !membership || !canSoftDelete(membership.role)) throw new Error('Suppression logique non autorisée.')
  const patientId = String(formData.get('patient_id'))
  const sessionId = String(formData.get('session_id'))
  const reason = asNullable(formData.get('reason'))
  const now = new Date().toISOString()

  const { error } = await supabase.from('sessions').update({ deleted_at: now, deleted_by: user.id, updated_at: now }).eq('id', sessionId)
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'session',
    entityId: sessionId,
    action: 'delete',
    metadata: { mode: 'soft', patientId, reason },
  })

  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

export async function createGoalAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const episodeId = (await getActiveEpisodeId(patientId)) ?? String(formData.get('episode_id') ?? '')

  const payload = {
    episode_id: episodeId,
    title: String(formData.get('title') ?? '').trim(),
    description: asNullable(formData.get('description')),
    priority: String(formData.get('priority') ?? 'medium') as 'low' | 'medium' | 'high',
    status: String(formData.get('status') ?? 'planned') as 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed',
    target_review_date: asNullable(formData.get('target_review_date')),
  }

  const { data: goal, error } = await supabase.from('therapy_goals').insert(payload).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({ organizationId: organization.id, actorUserId: user.id, entityType: 'therapy_goal', entityId: goal?.id, action: 'create', metadata: { patientId } })
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}/goals`)
}

export async function updateGoalAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const goalId = String(formData.get('goal_id'))

  const { error } = await supabase.from('therapy_goals').update({
    title: String(formData.get('title') ?? '').trim(),
    description: asNullable(formData.get('description')),
    priority: String(formData.get('priority') ?? 'medium') as 'low' | 'medium' | 'high',
    status: String(formData.get('status') ?? 'planned') as 'planned' | 'in_progress' | 'achieved' | 'paused' | 'closed',
    target_review_date: asNullable(formData.get('target_review_date')),
    updated_at: new Date().toISOString(),
  }).eq('id', goalId)
  if (error) throw new Error(error.message)

  await insertAuditLog({ organizationId: organization.id, actorUserId: user.id, entityType: 'therapy_goal', entityId: goalId, action: 'update', metadata: { patientId } })
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}/goals`)
}

export async function upsertConsentAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const consentKind = String(formData.get('consent_kind')) as 'care' | 'data_processing' | 'image_audio' | 'research'

  const payload = {
    patient_id: patientId,
    consent_kind: consentKind,
    status: String(formData.get('status') ?? 'granted') as 'granted' | 'refused' | 'withdrawn' | 'expired',
    recorded_at: String(formData.get('recorded_at') ?? new Date().toISOString()),
    expires_at: asNullable(formData.get('expires_at')),
    note: asNullable(formData.get('note')),
    created_by: user.id,
  }

  const { data: consent, error } = await supabase.from('patient_consents').upsert(payload, { onConflict: 'patient_id,consent_kind' }).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'consent',
    entityId: consent?.id ?? null,
    action: 'update',
    metadata: { patientId, consent_kind: consentKind },
  })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/consents`)
  redirect(`/patients/${patientId}/consents`)
}

export async function addConsentSignatureAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const patientId = String(formData.get('patient_id'))
  const consentId = String(formData.get('consent_id'))

  const payload = {
    consent_id: consentId,
    signer_name: String(formData.get('signer_name') ?? '').trim(),
    signer_role: String(formData.get('signer_role') ?? 'patient').trim(),
    signer_email: asNullable(formData.get('signer_email')),
    signer_identifier: asNullable(formData.get('signer_identifier')),
    signature_mode: String(formData.get('signature_mode') ?? 'typed'),
    signature_level: String(formData.get('signature_level') ?? 'advanced'),
    signature_text: asNullable(formData.get('signature_text')),
    signature_data_url: asNullable(formData.get('signature_data_url')),
    witness_name: asNullable(formData.get('witness_name')),
    signed_document_hash: asNullable(formData.get('signed_document_hash')),
    evidence: {
      attestation: asNullable(formData.get('attestation')),
      device_label: asNullable(formData.get('device_label')),
    },
    signed_at: String(formData.get('signed_at') ?? new Date().toISOString()),
    created_by: user.id,
  }

  const { data: signature, error } = await supabase.from('consent_signatures').insert(payload).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'consent_signature',
    entityId: signature?.id ?? null,
    action: 'create',
    metadata: { patientId, consentId, signer_role: payload.signer_role, signature_level: payload.signature_level },
  })

  revalidatePath(`/patients/${patientId}/consents`)
  redirect(`/patients/${patientId}/consents`)
}

export async function createTrackedExportLog(args: { entityType: string; entityId?: string | null; exportType: 'pdf' | 'csv' | 'json' | 'xlsx'; destination?: string | null; metadata?: Record<string, unknown> }) {
  const { supabase, user, organization } = await ensureExportAccess()
  if (!organization) throw new Error('Aucune organisation disponible.')

  await supabase.from('data_exports').insert({
    organization_id: organization.id,
    actor_user_id: user.id,
    export_type: args.exportType,
    entity_type: args.entityType,
    entity_id: args.entityId ?? null,
    destination: args.destination ?? null,
  })

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: `${args.entityType}_export`,
    entityId: args.entityId ?? null,
    action: 'export',
    metadata: { exportType: args.exportType, destination: args.destination ?? null, ...(args.metadata ?? {}) },
  })
}


export async function uploadPatientDocumentAction(formData: FormData) {
  const { supabase, user, organization, membership } = await ensureWriteAccess()
  if (!organization || !membership || !canUploadDocuments(membership.role)) {
    throw new Error('Téléversement documentaire non autorisé.')
  }

  const patientId = String(formData.get('patient_id') ?? '')
  const consentId = asNullable(formData.get('consent_id'))
  const category = String(formData.get('category') ?? 'clinical_document')
  const title = String(formData.get('title') ?? '').trim()
  const file = formData.get('file')

  const { data: policy } = await supabase
    .from('organization_security_policies')
    .select('default_retention_days, signed_consent_retention_days')
    .eq('organization_id', organization.id)
    .maybeSingle()

  const retentionDays =
    category === 'consent_signed_attachment'
      ? policy?.signed_consent_retention_days ?? 3650
      : policy?.default_retention_days ?? 2555

  const retentionUntil = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString()

  if (!(file instanceof File) || !file.size) {
    throw new Error('Aucun fichier transmis.')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const storagePath = `${organization.id}/${patientId}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('clinical-documents')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) throw new Error(uploadError.message)

  const payload = {
    organization_id: organization.id,
    patient_id: patientId,
    consent_id: consentId,
    category,
    title: title || file.name,
    file_name: file.name,
    mime_type: file.type || 'application/octet-stream',
    byte_size: file.size,
    storage_bucket: 'clinical-documents',
    storage_path: storagePath,
    uploaded_by: user.id,
    retention_policy_label: category === 'consent_signed_attachment' ? 'signed-consent-default' : 'clinical-document-default',
    retention_until: retentionUntil,
  }

  const { data: document, error } = await supabase.from('patient_documents').insert(payload).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'patient_document',
    entityId: document?.id ?? null,
    action: 'create',
    metadata: { patientId, consentId, category, storagePath, fileName: file.name, retentionUntil },
  })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/documents`)
  revalidatePath(`/patients/${patientId}/consents`)
  redirect(consentId ? `/patients/${patientId}/consents` : `/patients/${patientId}/documents`)
}

export async function createReviewRequestAction(formData: FormData) {
  const { supabase, user, organization, membership } = await ensureWriteAccess()
  if (!organization || !membership || !canCreateOrEdit(membership.role)) {
    throw new Error('Création de workflow de validation non autorisée.')
  }

  const patientId = String(formData.get('patient_id') ?? '')
  const sessionId = asNullable(formData.get('session_id'))
  const requestNote = asNullable(formData.get('request_note'))
  const assignedSupervisorId = asNullable(formData.get('assigned_supervisor_id'))

  const payload = {
    organization_id: organization.id,
    patient_id: patientId,
    session_id: sessionId,
    requested_by: user.id,
    assigned_supervisor_id: assignedSupervisorId,
    status: 'submitted',
    request_note: requestNote,
    submitted_at: new Date().toISOString(),
  }

  const { data: review, error } = await supabase.from('clinical_review_requests').insert(payload).select('id').single()
  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'clinical_review_request',
    entityId: review?.id ?? null,
    action: 'create',
    metadata: { patientId, sessionId, assignedSupervisorId, status: 'submitted' },
  })

  if (review?.id && assignedSupervisorId) {
    await supabase.from('supervisor_notifications').insert({
      organization_id: organization.id,
      patient_id: patientId,
      review_request_id: review.id,
      recipient_user_id: assignedSupervisorId,
      channel: 'in_app',
      title: 'Nouvelle demande de validation clinique',
      body: requestNote ?? 'Une revue clinique a été soumise pour validation superviseur.',
      status: 'unread',
    })
  }

  revalidatePath('/reviews')
  revalidatePath('/notifications')
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

export async function decideReviewRequestAction(formData: FormData) {
  const { supabase, user, organization, membership } = await getAppContext()
  if (!organization || !membership || !canReview(membership.role)) {
    throw new Error('Validation superviseur non autorisée.')
  }

  const reviewId = String(formData.get('review_id') ?? '')
  const patientId = String(formData.get('patient_id') ?? '')
  const decision = String(formData.get('decision') ?? 'approved')
  const supervisorNote = asNullable(formData.get('supervisor_note'))

  const { error } = await supabase
    .from('clinical_review_requests')
    .update({
      status: decision,
      supervisor_note: supervisorNote,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)

  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'clinical_review_request',
    entityId: reviewId,
    action: 'update',
    metadata: { patientId, decision, supervisorNote },
  })

  const notificationTitle =
    decision === 'approved'
      ? 'Validation superviseur approuvée'
      : decision === 'changes_requested'
        ? 'Modifications superviseur demandées'
        : 'Validation superviseur rejetée'

  const { data: reviewRow } = await supabase
    .from('clinical_review_requests')
    .select('requested_by')
    .eq('id', reviewId)
    .maybeSingle()

  if (reviewRow?.requested_by) {
    await supabase.from('supervisor_notifications').insert({
      organization_id: organization.id,
      patient_id: patientId,
      review_request_id: reviewId,
      recipient_user_id: reviewRow.requested_by,
      channel: 'in_app',
      title: notificationTitle,
      body: supervisorNote ?? 'Une décision superviseur a été enregistrée.',
      status: 'unread',
    })
  }

  revalidatePath('/reviews')
  revalidatePath('/notifications')
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}


export async function switchOrganizationAction(formData: FormData) {
  const { memberships } = await getAppContext()
  const organizationId = String(formData.get('organization_id') ?? '')
  const isAllowed = memberships.some((membership) => membership.organization_id === organizationId)
  if (!isAllowed) throw new Error('Organisation non autorisée pour cet utilisateur.')

  const cookieStore = await cookies()
  cookieStore.set('atpe_active_org_id', organizationId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
  })

  revalidatePath('/')
  redirect('/')
}

export async function markNotificationReadAction(formData: FormData) {
  const { supabase, user, organization } = await getAppContext()
  if (!organization) throw new Error('Aucune organisation disponible.')
  const notificationId = String(formData.get('notification_id') ?? '')

  const { error } = await supabase
    .from('supervisor_notifications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_user_id', user.id)

  if (error) throw new Error(error.message)

  await insertAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'supervisor_notification',
    entityId: notificationId,
    action: 'update',
    metadata: { status: 'read' },
  })

  revalidatePath('/notifications')
  redirect('/notifications')
}
