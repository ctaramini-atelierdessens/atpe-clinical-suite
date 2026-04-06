import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

async function resolveOrganization(supabase: any, userId: string) {
  const { data } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
  return data?.[0]?.organization_id ?? null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })

  const organizationId = await resolveOrganization(supabase, user.id)
  if (!organizationId) return NextResponse.json({ error: 'Aucune organisation active.' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const profileName = String(body?.profileName ?? '').trim()
  const config = body?.config
  const profileScope = body?.profileScope === 'personal' ? 'personal' : 'organization'
  const profileId = body?.profileId ? String(body.profileId) : null

  if (!profileName) return NextResponse.json({ error: 'Nom de profil requis.' }, { status: 400 })
  if (!config || typeof config !== 'object') return NextResponse.json({ error: 'Configuration invalide.' }, { status: 400 })

  const payload = {
    organization_id: organizationId,
    profile_name: profileName,
    profile_scope: profileScope,
    config_json: config,
    created_by: user.id,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  const query = profileId
    ? supabase.from('import_mapping_profiles').update(payload).eq('id', profileId).select('*').single()
    : supabase.from('import_mapping_profiles').insert(payload).select('*').single()

  const { data, error } = await query
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Sauvegarde impossible.' }, { status: 500 })
  return NextResponse.json({ ok: true, profile: data })
}
