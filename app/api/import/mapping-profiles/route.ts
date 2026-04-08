import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  const { data: membership } = await (supabase as any)
  .from('organization_memberships')
  .select('organization_id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: true })
  .limit(1)
  .maybeSingle()

const organizationId = membership?.organization_id as string | undefined
  if (!organizationId) {
    return NextResponse.json({ error: 'Aucune organisation active.' }, { status: 400 })
  }

  const body = await request.json()
  const profileId = body?.id ?? null

  const payload = {
    organization_id: organizationId,
    profile_name: String(body?.profile_name ?? '').trim(),
    profile_scope: String(body?.profile_scope ?? 'organization').trim(),
    config_json: body?.config_json ?? {},
    created_by: user.id,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  if (!payload.profile_name) {
    return NextResponse.json({ error: 'Nom de profil manquant.' }, { status: 400 })
  }

  const query = profileId
    ? (supabase as any)
        .from('import_mapping_profiles')
        .update(payload as any)
        .eq('id', profileId)
        .select('*')
        .single()
    : (supabase as any)
        .from('import_mapping_profiles')
        .insert(payload as any)
        .select('*')
        .single()

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, profile: data })
}