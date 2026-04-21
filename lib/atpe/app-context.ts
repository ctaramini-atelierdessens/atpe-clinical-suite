import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

type OrganizationRow = {
  id: string
  slug?: string | null
  name?: string | null
  created_at?: string | null
}

type MembershipRow = {
  id?: string | null
  organization_id?: string | null
  user_id?: string | null
  role?: string | null
}

type MembershipWithOrganization = MembershipRow & {
  organization?: OrganizationRow | null
}

type UserLike = {
  id: string
  email?: string | null
}

function uniq<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

export async function getAppContext() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const activeOrganizationId =
    cookieStore.get('active_organization_id')?.value ??
    cookieStore.get('organization_id')?.value ??
    null

  const activeOrganizationSlug =
    cookieStore.get('active_organization_slug')?.value ??
    cookieStore.get('organization_slug')?.value ??
    null

  let organization: OrganizationRow | null = null
  let membership: MembershipWithOrganization | null = null
  let memberships: MembershipWithOrganization[] = []
  let organizations: OrganizationRow[] = []

  if (user?.id) {
    const { data: membershipRows, error: membershipError } = await supabase
      .from('organization_members')
      .select('id, organization_id, user_id, role')
      .eq('user_id', user.id)

    if (membershipError) {
      throw new Error(
        `Impossible de charger les appartenances d'organisation : ${membershipError.message}`,
      )
    }

    const rawMemberships = Array.isArray(membershipRows)
      ? (membershipRows as MembershipRow[])
      : []

    const organizationIds = uniq(
      rawMemberships
        .map((item) => item.organization_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    )

    let organizationRows: OrganizationRow[] = []

    if (organizationIds.length > 0) {
      const { data: orgRows, error: orgError } = await supabase
        .from('organizations')
        .select('id, slug, name, created_at')
        .in('id', organizationIds)

      if (orgError) {
        throw new Error(
          `Impossible de charger les organisations : ${orgError.message}`,
        )
      }

      organizationRows = Array.isArray(orgRows)
        ? (orgRows as OrganizationRow[])
        : []
    }

    organizations = organizationRows

    const organizationMap = new Map(
      organizationRows.map((org) => [org.id, org] as const),
    )

    memberships = rawMemberships.map((item) => ({
      ...item,
      organization: item.organization_id
        ? organizationMap.get(item.organization_id) ?? null
        : null,
    }))

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

    if (!membership && memberships.length > 0) {
      membership = memberships[0] ?? null
    }

    organization = membership?.organization ?? null
  }

  if (!organization && activeOrganizationId) {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, slug, name, created_at')
      .eq('id', activeOrganizationId)
      .maybeSingle<OrganizationRow>()

    if (error) {
      throw new Error(
        `Impossible de charger l'organisation active par id : ${error.message}`,
      )
    }

    organization = data ?? null
  }

  if (!organization && activeOrganizationSlug) {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, slug, name, created_at')
      .eq('slug', activeOrganizationSlug)
      .maybeSingle<OrganizationRow>()

    if (error) {
      throw new Error(
        `Impossible de charger l'organisation active par slug : ${error.message}`,
      )
    }

    organization = data ?? null
  }

  return {
    supabase,
    user: (user as UserLike | null) ?? null,
    organization,
    membership,
    memberships,
    organizations,
  }
}