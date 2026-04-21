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

function readNumber(value: FormDataEntryValue | null | undefined): number | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function readBoolean(value: FormDataEntryValue | null | undefined): boolean | null {
  if (typeof value !== 'string') return null
  if (value === 'true' || value === '1' || value === 'on') return true
  if (value === 'false' || value === '0') return false
  return null
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
    throw new Error('Permissions insuffisantes pour modifier la matrice diagnostique.')
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

export async function createDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase, user, organization } = await ensureWriteAccess()

  const patientId = readString(formData.get('patient_id'))
  if (!patientId) {
    throw new Error('patient_id manquant')
  }

  const title = readString(formData.get('title')) ?? 'Matrice diagnostique'
  const notes = readString(formData.get('notes'))
  const activate = readBoolean(formData.get('is_active')) ?? false

  const { data: versionRows, error: versionCountError } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .select('version_number')
    .eq('patient_id', patientId)
    .order('version_number', { ascending: false })
    .limit(1)

  if (versionCountError) {
    throw new Error(
      `Impossible de calculer le numéro de version : ${versionCountError.message}`,
    )
  }

  const nextVersionNumber =
    Array.isArray(versionRows) && versionRows.length > 0
      ? ((versionRows[0]?.version_number as number | null) ?? 0) + 1
      : 1

  const payload = {
    organization_id: organization.id,
    patient_id: patientId,
    title,
    notes,
    status: 'draft',
    is_active: activate,
    version_number: nextVersionNumber,
    created_by: user.id,
    updated_by: user.id,
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .insert(payload)

  if (error) {
    throw new Error(
      `Impossible de créer la version de matrice : ${error.message}`,
    )
  }

  revalidatePatient(patientId)
}

export async function updateDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const payload = {
    title: readString(formData.get('title')) ?? 'Matrice diagnostique',
    notes: readString(formData.get('notes')),
    status: readString(formData.get('status')) ?? 'draft',
    is_active: readBoolean(formData.get('is_active')) ?? false,
    updated_by: user.id,
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .update(payload)
    .eq('id', versionId)

  if (error) {
    throw new Error(
      `Impossible de modifier la version de matrice : ${error.message}`,
    )
  }

  revalidatePatient(patientId)
}

export async function activateDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase, user } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .update({
      is_active: true,
      status: 'validated',
      updated_by: user.id,
    })
    .eq('id', versionId)

  if (error) {
    throw new Error(`Impossible d'activer cette version : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function deleteDiagnosticMatrixVersionAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_versions')
    .delete()
    .eq('id', versionId)

  if (error) {
    throw new Error(`Impossible de supprimer la version : ${error.message}`)
  }

  revalidatePatient(patientId)
}

export async function createDiagnosticMatrixRowAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const versionId = readString(formData.get('version_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!versionId || !patientId) {
    throw new Error('version_id ou patient_id manquant')
  }

  const payload = {
    matrix_version_id: versionId,
    dimension: readString(formData.get('dimension')) ?? 'globale',
    priority: readString(formData.get('priority')) ?? 'moyenne',
    position: readNumber(formData.get('position')) ?? 0,
    initial_finding: readString(formData.get('initial_finding')),
    short_objective: readString(formData.get('short_objective')),
    short_subobjectives: readString(formData.get('short_subobjectives')),
    medium_objective: readString(formData.get('medium_objective')),
    medium_subobjectives: readString(formData.get('medium_subobjectives')),
    long_objective: readString(formData.get('long_objective')),
    long_subobjectives: readString(formData.get('long_subobjectives')),
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_rows')
    .insert(payload)

  if (error) {
    throw new Error(
      `Impossible de créer la ligne de matrice : ${error.message}`,
    )
  }

  revalidatePatient(patientId)
}

export async function updateDiagnosticMatrixRowAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const rowId = readString(formData.get('row_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!rowId || !patientId) {
    throw new Error('row_id ou patient_id manquant')
  }

  const payload = {
    dimension: readString(formData.get('dimension')) ?? 'globale',
    priority: readString(formData.get('priority')) ?? 'moyenne',
    position: readNumber(formData.get('position')) ?? 0,
    initial_finding: readString(formData.get('initial_finding')),
    short_objective: readString(formData.get('short_objective')),
    short_subobjectives: readString(formData.get('short_subobjectives')),
    medium_objective: readString(formData.get('medium_objective')),
    medium_subobjectives: readString(formData.get('medium_subobjectives')),
    long_objective: readString(formData.get('long_objective')),
    long_subobjectives: readString(formData.get('long_subobjectives')),
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_rows')
    .update(payload)
    .eq('id', rowId)

  if (error) {
    throw new Error(
      `Impossible de modifier la ligne de matrice : ${error.message}`,
    )
  }

  revalidatePatient(patientId)
}

export async function deleteDiagnosticMatrixRowAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const rowId = readString(formData.get('row_id'))
  const patientId = readString(formData.get('patient_id'))

  if (!rowId || !patientId) {
    throw new Error('row_id ou patient_id manquant')
  }

  const { error } = await supabase
    .from('patient_diagnostic_matrix_rows')
    .delete()
    .eq('id', rowId)

  if (error) {
    throw new Error(
      `Impossible de supprimer la ligne de matrice : ${error.message}`,
    )
  }

  revalidatePatient(patientId)
}