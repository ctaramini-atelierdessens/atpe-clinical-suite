'use server'

import { revalidatePath } from 'next/cache'
import { getAppContext } from '@/lib/atpe/app-context'

type UserLike = { id: string }
type OrganizationLike = { id: string }
type MembershipLike = { role?: string | null }

function readString(value: FormDataEntryValue | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function canWrite(role?: string | null) {
  return ['owner', 'admin', 'clinician', 'editor'].includes(role ?? '')
}

async function ensureWriteAccess() {
  const ctx = await getAppContext()

  const user = (ctx.user ?? null) as UserLike | null
  const organization = (ctx.organization ?? null) as OrganizationLike | null
  const membership = (ctx.membership ?? null) as MembershipLike | null

  if (!user?.id) {
    throw new Error("Aucun utilisateur authentifié n'a été trouvé.")
  }

  if (!organization?.id) {
    throw new Error("Aucune organisation active n'a été trouvée.")
  }

  if (!membership || !canWrite(membership.role)) {
    throw new Error('Permissions insuffisantes.')
  }

  return {
    supabase: ctx.supabase,
    user,
    organization,
  }
}

function revalidatePatient(patientId: string) {
  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/pdf`)
  revalidatePath('/patients')
  revalidatePath('/reporting')
}

export async function validateExpressionAssessmentAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const patientId = readString(formData.get('patient_id'))
  if (!patientId) throw new Error('patient_id manquant')

  const validationNote = readString(formData.get('validation_note'))

  const { error } = await supabase
    .from('patient_expression_assessments')
    .update({
      is_locked: true,
      validated_at: new Date().toISOString(),
      validated_by: user.id,
      validation_note: validationNote,
    })
    .eq('patient_id', patientId)

  if (error) {
    throw new Error(`Impossible de valider le bilan expressionnel : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function unlockExpressionAssessmentAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const patientId = readString(formData.get('patient_id'))
  if (!patientId) throw new Error('patient_id manquant')

  const { error } = await supabase
    .from('patient_expression_assessments')
    .update({
      is_locked: false,
      validated_at: null,
      validated_by: null,
      validation_note: null,
    })
    .eq('patient_id', patientId)

  if (error) {
    throw new Error(`Impossible de déverrouiller le bilan expressionnel : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function validateGoalsAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const patientId = readString(formData.get('patient_id'))
  if (!patientId) throw new Error('patient_id manquant')

  const { error } = await supabase
    .from('patient_goals')
    .update({
      is_locked: true,
      validated_at: new Date().toISOString(),
      validated_by: user.id,
    })
    .eq('patient_id', patientId)

  if (error) {
    throw new Error(`Impossible de valider les objectifs : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function unlockGoalsAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const patientId = readString(formData.get('patient_id'))
  if (!patientId) throw new Error('patient_id manquant')

  const { error } = await supabase
    .from('patient_goals')
    .update({
      is_locked: false,
      validated_at: null,
      validated_by: null,
    })
    .eq('patient_id', patientId)

  if (error) {
    throw new Error(`Impossible de déverrouiller les objectifs : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function validateDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))
  const validationNote = readString(formData.get('validation_note'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .update({
      is_active: true,
      is_locked: true,
      status: 'validated',
      validated_at: new Date().toISOString(),
      validated_by: user.id,
      validation_note: validationNote,
      updated_by: user.id,
    })
    .eq('id', versionId)

  if (error) {
    throw new Error(`Impossible de valider la matrice : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function unlockDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .update({
      is_locked: false,
      status: 'draft',
      validated_at: null,
      validated_by: null,
      validation_note: null,
      updated_by: user.id,
    })
    .eq('id', versionId)

  if (error) {
    throw new Error(`Impossible de déverrouiller la matrice : ${error.message}`)
  }

  revalidatePatient(patientId)
}