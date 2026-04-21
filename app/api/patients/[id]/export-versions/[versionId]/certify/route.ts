import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string; versionId: string }>
}

function normalizeEmail(email?: string | null) {
  return email ?? null
}

function normalizeName(user: any) {
  return (
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    'Utilisateur'
  )
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id, versionId } = await context.params
    const supabase = await createClient()

    const [{ data: auth }, { data: version, error: readError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('patient_export_versions')
        .select('*')
        .eq('patient_id', id)
        .eq('id', versionId)
        .maybeSingle(),
    ])

    if (readError) {
      return Response.json({ error: readError.message }, { status: 500 })
    }

    if (!version) {
      return Response.json({ error: 'Version introuvable.' }, { status: 404 })
    }

    if (!version.locked_at) {
      return Response.json(
        { error: 'La version doit etre verrouillee avant certification.' },
        { status: 400 },
      )
    }

    const certifiedAt = new Date().toISOString()

    const { data: updated, error: updateError } = await supabase
      .from('patient_export_versions')
      .update({
        status: 'certified',
        certified_at: certifiedAt,
      })
      .eq('patient_id', id)
      .eq('id', versionId)
      .select('*')
      .single()

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    const user = auth.user
    await supabase.from('patient_audit_logs').insert({
      patient_id: id,
      action: 'export_certified',
      entity_type: 'patient_export_version',
      entity_id: versionId,
      actor_name: normalizeName(user),
      actor_email: normalizeEmail(user?.email),
      details: `Version exportee ${version.version_number ?? ''} certifiee.`,
      metadata: {
        certified_at: certifiedAt,
        checksum: version.checksum ?? null,
      },
    })

    return Response.json({ ok: true, item: updated })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Certification impossible.'
    return Response.json({ error: message }, { status: 500 })
  }
}