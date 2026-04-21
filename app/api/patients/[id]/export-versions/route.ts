import { createClient } from '@/lib/supabase/server'
import { buildClinicalPdf } from '@/lib/exports/pdf-clinical'
import type { AtpeInput } from '@/lib/atpe-expert'

type RouteContext = {
  params: Promise<{ id: string }>
}

type ExportVersionRow = {
  id: string
  version_number?: number | null
  file_url?: string | null
  checksum?: string | null
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
    const { id } = await context.params
    const supabase = await createClient()

    const [{ data: auth }, { data: patient }, { data: sessions }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('active_patient_sessions')
        .select('*')
        .eq('patient_id', id)
        .order('session_number', { ascending: true }),
    ])

    if (!patient) {
      return Response.json({ error: 'Patient introuvable.' }, { status: 404 })
    }

    const {
      data: latestVersion,
      error: latestVersionError,
    } = await supabase
      .from('patient_export_versions')
      .select('version_number')
      .eq('patient_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestVersionError) {
      return Response.json(
        { error: latestVersionError.message },
        { status: 500 },
      )
    }

    const versionNumber = (latestVersion?.version_number ?? 0) + 1

    const pdf = await buildClinicalPdf({
      patient,
      sessions: Array.isArray(sessions) ? (sessions as AtpeInput[]) : [],
    })

    const storagePath = `patients/${id}/exports/v${versionNumber}/${pdf.fileName}`

    const upload = await supabase.storage
      .from('exports')
      .upload(storagePath, pdf.pdfBytes, {
        contentType: pdf.contentType,
        upsert: false,
      })

    if (upload.error) {
      return Response.json({ error: upload.error.message }, { status: 500 })
    }

    const {
      data: publicUrlData,
    } = supabase.storage.from('exports').getPublicUrl(storagePath)

    const user = auth.user
    const createdByName = normalizeName(user)
    const createdByEmail = normalizeEmail(user?.email)

    const insertPayload = {
      patient_id: id,
      version_number: versionNumber,
      format: 'pdf',
      status: 'locked',
      created_by_name: createdByName,
      created_by_email: createdByEmail,
      file_url: publicUrlData.publicUrl,
      checksum: pdf.checksum,
      locked_at: new Date().toISOString(),
    }

    const { data: inserted, error: insertError } = await supabase
      .from('patient_export_versions')
      .insert(insertPayload)
      .select('*')
      .single<ExportVersionRow>()

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    await supabase.from('patient_audit_logs').insert({
      patient_id: id,
      action: 'export_locked',
      entity_type: 'patient_export_version',
      entity_id: inserted.id,
      actor_name: createdByName,
      actor_email: createdByEmail,
      details: `Version exportee v${versionNumber} creee et verrouillee.`,
      metadata: {
        format: 'pdf',
        checksum: pdf.checksum,
        file_url: publicUrlData.publicUrl,
      },
    })

    return Response.json(
      {
        ok: true,
        item: inserted,
      },
      { status: 201 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Creation export impossible.'
    return Response.json({ error: message }, { status: 500 })
  }
}