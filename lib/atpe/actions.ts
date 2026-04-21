'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'
import { saveClinicalProfileFromSession } from '@/lib/atpe/save-clinical-profile'

type BaseAppContext = Awaited<ReturnType<typeof getAppContext>>

type OrganizationLike = {
  id: string
  slug?: string | null
  name?: string | null
  created_at?: string | null
}

type MembershipLike = {
  id?: string | null
  organization_id?: string | null
  user_id?: string | null
  role?: string | null
  organization?: OrganizationLike | null
}

type UserLike = {
  id: string
  email?: string | null
}

type WriteContext = BaseAppContext & {
  user: UserLike
  organization: OrganizationLike
  membership: MembershipLike
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
  if (value === 'true' || value === 'on' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return null
}

function clampScore(value: number | null): number | null {
  if (value === null) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeNullableText(value: string | null): string | null {
  return value && value.trim().length > 0 ? value.trim() : null
}

function canCreateOrEdit(role?: string | null): boolean {
  return ['owner', 'admin', 'clinician', 'editor'].includes(role ?? '')
}

function buildSessionObservationJson(formData: FormData) {
  const observation = {
    posture: readString(formData.get('posture')),
    tonus: readString(formData.get('tonus')),
    respiration: readString(formData.get('respiration')),
    micro_gestes: readString(formData.get('micro_gestes')),

    engagement_relationnel: readString(formData.get('engagement_relationnel')),
    verbalisation: readString(formData.get('verbalisation')),
    latence: readString(formData.get('latence')),

    images_mentales: readBoolean(formData.get('images_mentales')),
    mouvement_corporel: readString(formData.get('mouvement_corporel')),

    reaction_musique: readBoolean(formData.get('reaction_musique')),
    relachement_tonique_musique: readBoolean(
      formData.get('relachement_tonique_musique'),
    ),
    verbalisation_emotionnelle_musique: readBoolean(
      formData.get('verbalisation_emotionnelle_musique'),
    ),

    fatigue: readString(formData.get('fatigue')),
    attention: readString(formData.get('attention')),
    sensibilite_stimuli_doux: readBoolean(
      formData.get('sensibilite_stimuli_doux'),
    ),

    notes: readString(formData.get('notes')),
  }

  return Object.fromEntries(
    Object.entries(observation).filter(([, value]) => value !== null),
  )
}

function getActiveOrganizationHints(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  const activeOrganizationId =
    cookieStore.get('active_organization_id')?.value ??
    cookieStore.get('organization_id')?.value ??
    null

  const activeOrganizationSlug =
    cookieStore.get('active_organization_slug')?.value ??
    cookieStore.get('organization_slug')?.value ??
    null

  return { activeOrganizationId, activeOrganizationSlug }
}

function hasOrganizationAccess(
  memberships: MembershipLike[],
  requestedOrganizationId: string,
): boolean {
  return memberships.some(
    (membership) =>
      membership.organization_id === requestedOrganizationId ||
      membership.organization?.id === requestedOrganizationId,
  )
}

async function ensureWriteAccess(): Promise<WriteContext> {
  const ctx = await getAppContext()
  const cookieStore = await cookies()
  const { activeOrganizationId, activeOrganizationSlug } =
    getActiveOrganizationHints(cookieStore)

  const {
    data: { user },
    error: userError,
  } = await ctx.supabase.auth.getUser()

  if (userError) {
    throw new Error(
      `Impossible de récupérer l'utilisateur courant : ${userError.message}`,
    )
  }

  if (!user?.id) {
    throw new Error("Aucun utilisateur authentifié n'a été trouvé.")
  }

  const { data: membershipsData, error: membershipError } = await ctx.supabase
    .from('organization_members')
    .select(
      `
      id,
      organization_id,
      user_id,
      role,
      organization:organizations (
        id,
        slug,
        name,
        created_at
      )
      `,
    )
    .eq('user_id', user.id)

  if (membershipError) {
    throw new Error(
      `Impossible de vérifier les permissions d'organisation : ${membershipError.message}`,
    )
  }

  const memberships = Array.isArray(membershipsData)
    ? (membershipsData as MembershipLike[])
    : []

  if (!memberships.length) {
    throw new Error(
      "Aucune appartenance d'organisation n'a été trouvée pour cet utilisateur.",
    )
  }

  let membership: MembershipLike | null = null

  if (activeOrganizationId) {
    membership =
      memberships.find((item) => item.organization_id === activeOrganizationId) ??
      null
  }

  if (!membership && activeOrganizationSlug) {
    membership =
      memberships.find(
        (item) => item.organization?.slug === activeOrganizationSlug,
      ) ?? null
  }

  if (!membership && ctx.organization?.id) {
    membership =
      memberships.find((item) => item.organization_id === ctx.organization.id) ??
      null
  }

  if (!membership) {
    membership = memberships[0] ?? null
  }

  const organization = membership?.organization ?? null

  if (!organization?.id) {
    throw new Error("Aucune organisation active n'a été trouvée.")
  }

  if (!canCreateOrEdit(membership?.role)) {
    throw new Error('Permissions insuffisantes pour modifier les données cliniques.')
  }

  return {
    ...ctx,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    organization,
    membership,
  }
}

export async function switchOrganizationAction(formData: FormData) {
  const ctx = await getAppContext()

  const {
    data: { user },
  } = await ctx.supabase.auth.getUser()

  const organizationId =
    readString(formData.get('organization_id')) ??
    readString(formData.get('organizationId')) ??
    readString(formData.get('id'))

  const organizationSlug =
    readString(formData.get('organization_slug')) ??
    readString(formData.get('organizationSlug')) ??
    readString(formData.get('slug'))

  if (!organizationId && !organizationSlug) {
    throw new Error("Impossible de changer d'organisation : identifiant manquant.")
  }

  let memberships: MembershipLike[] = []

  if (user?.id) {
    const { data } = await ctx.supabase
      .from('organization_members')
      .select(
        `
        id,
        organization_id,
        user_id,
        role,
        organization:organizations (
          id,
          slug,
          name,
          created_at
        )
        `,
      )
      .eq('user_id', user.id)

    memberships = Array.isArray(data) ? (data as MembershipLike[]) : []
  }

  const cookieStore = await cookies()

  if (organizationId) {
    const allowed = memberships.length
      ? hasOrganizationAccess(memberships, organizationId)
      : true

    if (!allowed) {
      throw new Error("Organisation non autorisée pour l'utilisateur courant.")
    }

    cookieStore.set('organization_id', organizationId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })
    cookieStore.set('active_organization_id', organizationId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })
  }

  if (organizationSlug) {
    cookieStore.set('organization_slug', organizationSlug, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })
    cookieStore.set('active_organization_slug', organizationSlug, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/patients')

  redirect('/patients')
}

export async function createPatientAction(formData: FormData) {
  const { supabase, organization, user } = await ensureWriteAccess()

  const payload = {
    organization_id: organization.id,
    primary_clinician_id: user.id,
    code:
      readString(formData.get('code')) ??
      `PAT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    initials: readString(formData.get('initials')),
    birth_year: readNumber(formData.get('birth_year')),
    sex: readString(formData.get('sex')),
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(payload)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur création patient : ${error.message}`)
  }

  if (!data?.id) {
    throw new Error("Le patient a été créé mais son identifiant est introuvable.")
  }

  revalidatePath('/patients')
  redirect('/patients')
}

export async function updatePatientAction(formData: FormData) {
  const { supabase, organization } = await ensureWriteAccess()

  const id = readString(formData.get('id'))
  if (!id) {
    throw new Error('ID patient manquant')
  }

  const payload = {
    organization_id: organization.id,
    code: readString(formData.get('code')),
    initials: readString(formData.get('initials')),
    birth_year: readNumber(formData.get('birth_year')),
    sex: readString(formData.get('sex')),
  }

  const { error } = await supabase.from('patients').update(payload).eq('id', id)

  if (error) {
    throw new Error(`Erreur update patient : ${error.message}`)
  }

  revalidatePath('/patients')
  redirect('/patients')
}

export async function createSessionAction(formData: FormData) {
  const { supabase, organization, user } = await ensureWriteAccess()

  const patientId =
    readString(formData.get('patient_id')) ??
    readString(formData.get('patientId'))

  if (!patientId) {
    throw new Error('Impossible de créer la séance : patient_id manquant.')
  }

  const emotion = clampScore(
    readNumber(formData.get('emotion')) ??
      readNumber(formData.get('emotional_score')),
  )
  const corps = clampScore(
    readNumber(formData.get('corps')) ?? readNumber(formData.get('body_score')),
  )
  const conscience = clampScore(
    readNumber(formData.get('conscience')) ??
      readNumber(formData.get('consciousness_score')),
  )
  const dynamique = clampScore(
    readNumber(formData.get('dynamique')) ??
      readNumber(formData.get('dynamic_score')),
  )
  const symbolique = clampScore(
    readNumber(formData.get('symbolique')) ??
      readNumber(formData.get('symbolic_score')),
  )

  const computedGlobal =
    emotion !== null &&
    corps !== null &&
    conscience !== null &&
    dynamique !== null &&
    symbolique !== null
      ? Math.round((emotion + corps + conscience + dynamique + symbolique) / 5)
      : null

  const global =
    clampScore(readNumber(formData.get('global_score'))) ?? computedGlobal

  const notes = normalizeNullableText(readString(formData.get('notes')))
  const observationJson = buildSessionObservationJson(formData)

  const payload = {
    organization_id: organization.id,
    clinician_id: user.id,
    patient_id: patientId,
    session_number:
      readNumber(formData.get('session_number')) ??
      readNumber(formData.get('sessionNumber')),
    emotion,
    emotional_score: emotion,
    corps,
    body_score: corps,
    conscience,
    consciousness_score: conscience,
    dynamique,
    dynamic_score: dynamique,
    symbolique,
    symbolic_score: symbolique,
    global_score: global,
    notes,
    observation_json:
      Object.keys(observationJson).length > 0 ? observationJson : null,
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(payload)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur création séance : ${error.message}`)
  }

  if (data?.id) {
    await saveClinicalProfileFromSession(data.id)
  }

  revalidatePath('/patients')
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

export async function updateSessionAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const sessionId =
    readString(formData.get('session_id')) ??
    readString(formData.get('sessionId')) ??
    readString(formData.get('id'))

  const patientId =
    readString(formData.get('patient_id')) ??
    readString(formData.get('patientId'))

  if (!sessionId) {
    throw new Error('Impossible de mettre à jour la séance : session_id manquant.')
  }

  const emotion = clampScore(
    readNumber(formData.get('emotion')) ??
      readNumber(formData.get('emotional_score')),
  )
  const corps = clampScore(
    readNumber(formData.get('corps')) ?? readNumber(formData.get('body_score')),
  )
  const conscience = clampScore(
    readNumber(formData.get('conscience')) ??
      readNumber(formData.get('consciousness_score')),
  )
  const dynamique = clampScore(
    readNumber(formData.get('dynamique')) ??
      readNumber(formData.get('dynamic_score')),
  )
  const symbolique = clampScore(
    readNumber(formData.get('symbolique')) ??
      readNumber(formData.get('symbolic_score')),
  )

  const computedGlobal =
    emotion !== null &&
    corps !== null &&
    conscience !== null &&
    dynamique !== null &&
    symbolique !== null
      ? Math.round((emotion + corps + conscience + dynamique + symbolique) / 5)
      : null

  const global =
    clampScore(readNumber(formData.get('global_score'))) ?? computedGlobal

  const notes = normalizeNullableText(readString(formData.get('notes')))
  const observationJson = buildSessionObservationJson(formData)

  const payload = {
    session_number:
      readNumber(formData.get('session_number')) ??
      readNumber(formData.get('sessionNumber')),
    emotion,
    emotional_score: emotion,
    corps,
    body_score: corps,
    conscience,
    consciousness_score: conscience,
    dynamique,
    dynamic_score: dynamique,
    symbolique,
    symbolic_score: symbolique,
    global_score: global,
    notes,
    observation_json:
      Object.keys(observationJson).length > 0 ? observationJson : null,
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(payload)
    .eq('id', sessionId)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur update séance : ${error.message}`)
  }

  if (data?.id) {
    await saveClinicalProfileFromSession(data.id)
  }

  if (patientId) {
    revalidatePath(`/patients/${patientId}`)
    redirect(`/patients/${patientId}`)
  }

  if (data?.patient_id) {
    revalidatePath(`/patients/${data.patient_id}`)
    redirect(`/patients/${data.patient_id}`)
  }

  revalidatePath('/patients')
}

export async function createReviewRequestAction(formData: FormData) {
  const { supabase, organization, user } = await ensureWriteAccess()

  const patientId =
    readString(formData.get('patient_id')) ??
    readString(formData.get('patientId'))

  const reviewerId =
    readString(formData.get('reviewer_id')) ??
    readString(formData.get('reviewerId')) ??
    readString(formData.get('target_user_id')) ??
    readString(formData.get('targetUserId'))

  if (!patientId || !reviewerId) {
    throw new Error('Paramètres manquants pour la demande de revue')
  }

  const payload = {
    organization_id: organization.id,
    patient_id: patientId,
    requester_user_id: user.id,
    reviewer_user_id: reviewerId,
    status: 'pending',
    message:
      readString(formData.get('message')) ??
      readString(formData.get('notes')),
  }

  const { error } = await supabase.from('review_requests').insert(payload)

  if (error) {
    throw new Error(`Erreur review : ${error.message}`)
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}

export async function decideReviewRequestAction(formData: FormData) {
  const { supabase } = await ensureWriteAccess()

  const id =
    readString(formData.get('id')) ??
    readString(formData.get('review_request_id')) ??
    readString(formData.get('reviewRequestId'))

  const decision =
    readString(formData.get('decision')) ??
    readString(formData.get('status'))

  if (!id || !decision) {
    throw new Error('Paramètres manquants pour la décision de revue')
  }

  const { error } = await supabase
    .from('review_requests')
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
      decision_note:
        readString(formData.get('decision_note')) ??
        readString(formData.get('decisionNote')) ??
        readString(formData.get('message')),
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Erreur décision review : ${error.message}`)
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}