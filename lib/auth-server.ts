import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

import type { ClinicalRole, ClinicalUserProfileRow } from '@/lib/auth-types'
import { getRolePermissions } from '@/lib/auth-permissions'

type ClinicalSession = {
  user: User
  profile: ClinicalUserProfileRow
  permissions: ReturnType<typeof getRolePermissions>
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  return { url, anonKey }
}

function getSupabaseServerClient() {
  const { url, anonKey } = getEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // En Server Component, on ne modifie pas les cookies ici.
      },
      remove(_name: string, _options: CookieOptions) {
        // En Server Component, on ne modifie pas les cookies ici.
      },
    },
  })
}

export async function getClinicalUserProfileByUserId(
  userId: string,
): Promise<ClinicalUserProfileRow | null> {
  if (!userId || typeof userId !== 'string') {
    return null
  }

  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('clinical_user_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as ClinicalUserProfileRow
}

export async function getRequiredAuthUser(options?: {
  redirectTo?: string
}): Promise<User> {
  const supabase = getSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect(options?.redirectTo ?? '/login')
  }

  return user
}

export async function getOptionalClinicalSession(): Promise<ClinicalSession | null> {
  const supabase = getSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const profile = await getClinicalUserProfileByUserId(user.id)

  if (!profile) {
    return null
  }

  return {
    user,
    profile,
    permissions: getRolePermissions(profile.role),
  }
}

export async function requireClinicalAuth(options?: {
  redirectTo?: string
}): Promise<ClinicalSession> {
  const user = await getRequiredAuthUser(options)
  const profile = await getClinicalUserProfileByUserId(user.id)

  if (!profile) {
    redirect(options?.redirectTo ?? '/login')
  }

  return {
    user,
    profile,
    permissions: getRolePermissions(profile.role),
  }
}

export async function requireClinicalRole(
  role: ClinicalRole | ClinicalRole[],
  options?: {
    redirectTo?: string
    unauthorizedRedirectTo?: string
  },
): Promise<ClinicalSession> {
  const session = await requireClinicalAuth({
    redirectTo: options?.redirectTo ?? '/login',
  })

  const allowedRoles = Array.isArray(role) ? role : [role]

  if (!allowedRoles.includes(session.profile.role)) {
    redirect(options?.unauthorizedRedirectTo ?? '/')
  }

  return session
}

export async function requireAdminClinicalRole(options?: {
  redirectTo?: string
  unauthorizedRedirectTo?: string
}) {
  return requireClinicalRole('admin', options)
}

export async function requireSupervisorOrAdminRole(options?: {
  redirectTo?: string
  unauthorizedRedirectTo?: string
}) {
  return requireClinicalRole(['supervisor', 'admin'], options)
}

export async function requireTherapistSupervisorOrAdminRole(options?: {
  redirectTo?: string
  unauthorizedRedirectTo?: string
}) {
  return requireClinicalRole(['therapist', 'supervisor', 'admin'], options)
}