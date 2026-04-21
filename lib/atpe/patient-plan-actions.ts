'use server'


type OrganizationLike = {
    id: string
}

type MembershipLike = {
    role?: string | null
}

type UserLike = {
    id: string
}

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
        throw new Error('Permissions insuffisantes pour modifier ces données.')
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

export async function upsertPatientExpressionalAssessmentAction(
    formData: FormData,
) {
    const { supabase, user, organization } = await ensureWriteAccess()

    const patientId = readString(formData.get('patient_id'))
    if (!patientId) {
        throw new Error('patient_id manquant')
    }

    const payload = {
        organization_id: organization.id,
        patient_id: patientId,
        expression_summary: readString(formData.get('expression_summary')),
        expression_profile: readString(formData.get('expression_profile')),
        preferred_mediations: readString(formData.get('preferred_mediations')),
        vigilance_points: readString(formData.get('vigilance_points')),
        clinician_notes: readString(formData.get('clinician_notes')),
        updated_by: user.id,
        created_by: user.id,
    }

    const { error } = await supabase
        .from('patient_expression_assessments')
        .upsert(payload, {
            onConflict: 'patient_id',
        })

    if (error) {
        throw new Error(
            `Impossible d'enregistrer le bilan expressionnel : ${error.message}`,
        )
    }

    revalidatePatient(patientId)
}

export async function createPatientGoalAction(formData: FormData) {
    const { supabase, user, organization } = await ensureWriteAccess()

    const patientId = readString(formData.get('patient_id'))
    if (!patientId) {
        throw new Error('patient_id manquant')
    }

    const payload = {
        organization_id: organization.id,
        patient_id: patientId,
        dimension: readString(formData.get('dimension')) ?? 'globale',
        priority: readString(formData.get('priority')) ?? 'moyenne',
        time_horizon: readString(formData.get('time_horizon')) ?? 'court',
        objective_text: readString(formData.get('objective_text')) ?? '',
        position: readNumber(formData.get('position')) ?? 0,
        created_by: user.id,
        updated_by: user.id,
    }

    if (!payload.objective_text) {
        throw new Error("Le texte de l'objectif est obligatoire.")
    }

    const { error } = await supabase.from('patient_goals').insert(payload)

    if (error) {
        throw new Error(`Impossible de créer l'objectif : ${error.message}`)
    }

    revalidatePatient(patientId)
}

export async function updatePatientGoalAction(formData: FormData) {
    const { supabase, user } = await ensureWriteAccess()

    const goalId = readString(formData.get('goal_id'))
    const patientId = readString(formData.get('patient_id'))

    if (!goalId || !patientId) {
        throw new Error('goal_id ou patient_id manquant')
    }

    const payload = {
        dimension: readString(formData.get('dimension')) ?? 'globale',
        priority: readString(formData.get('priority')) ?? 'moyenne',
        time_horizon: readString(formData.get('time_horizon')) ?? 'court',
        objective_text: readString(formData.get('objective_text')) ?? '',
        position: readNumber(formData.get('position')) ?? 0,
        updated_by: user.id,
    }

    if (!payload.objective_text) {
        throw new Error("Le texte de l'objectif est obligatoire.")
    }

    const { error } = await supabase
        .from('patient_goals')
        .update(payload)
        .eq('id', goalId)

    if (error) {
        throw new Error(`Impossible de modifier l'objectif : ${error.message}`)
    }

    revalidatePatient(patientId)
}

export async function deletePatientGoalAction(formData: FormData) {
    const { supabase } = await ensureWriteAccess()

    const goalId = readString(formData.get('goal_id'))
    const patientId = readString(formData.get('patient_id'))

    if (!goalId || !patientId) {
        throw new Error('goal_id ou patient_id manquant')
    }

    const { error } = await supabase.from('patient_goals').delete().eq('id', goalId)

    if (error) {
        throw new Error(`Impossible de supprimer l'objectif : ${error.message}`)
    }

    revalidatePatient(patientId)
}

export async function createPatientGoalSubitemAction(formData: FormData) {
    const { supabase } = await ensureWriteAccess()

    const goalId = readString(formData.get('goal_id'))
    const patientId = readString(formData.get('patient_id'))

    if (!goalId || !patientId) {
        throw new Error('goal_id ou patient_id manquant')
    }

    const payload = {
        goal_id: goalId,
        text: readString(formData.get('text')) ?? '',
        position: readNumber(formData.get('position')) ?? 0,
        is_completed: readBoolean(formData.get('is_completed')) ?? false,
    }

    if (!payload.text) {
        throw new Error('Le texte du sous-objectif est obligatoire.')
    }

    const { error } = await supabase.from('patient_goal_subitems').insert(payload)

    if (error) {
        throw new Error(
            `Impossible de créer le sous-objectif : ${error.message}`,
        )
    }

    revalidatePatient(patientId)
}

export async function updatePatientGoalSubitemAction(formData: FormData) {
    const { supabase } = await ensureWriteAccess()

    const subitemId = readString(formData.get('subitem_id'))
    const patientId = readString(formData.get('patient_id'))

    if (!subitemId || !patientId) {
        throw new Error('subitem_id ou patient_id manquant')
    }

    const payload = {
        text: readString(formData.get('text')) ?? '',
        position: readNumber(formData.get('position')) ?? 0,
        is_completed: readBoolean(formData.get('is_completed')) ?? false,
    }

    if (!payload.text) {
        throw new Error('Le texte du sous-objectif est obligatoire.')
    }

    const { error } = await supabase
        .from('patient_goal_subitems')
        .update(payload)
        .eq('id', subitemId)

    if (error) {
        throw new Error(
            `Impossible de modifier le sous-objectif : ${error.message}`,
        )
    }

    revalidatePatient(patientId)
}

export async function deletePatientGoalSubitemAction(formData: FormData) {
    const { supabase } = await ensureWriteAccess()

    const subitemId = readString(formData.get('subitem_id'))
    const patientId = readString(formData.get('patient_id'))

    if (!subitemId || !patientId) {
        throw new Error('subitem_id ou patient_id manquant')
    }

    const { error } = await supabase
        .from('patient_goal_subitems')
        .delete()
        .eq('id', subitemId)

    if (error) {
        throw new Error(
            `Impossible de supprimer le sous-objectif : ${error.message}`,
        )
    }

    revalidatePatient(patientId)
}