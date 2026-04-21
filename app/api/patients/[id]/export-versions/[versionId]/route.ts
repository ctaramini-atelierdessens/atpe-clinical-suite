import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string; versionId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id, versionId } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('patient_export_versions')
      .select('*')
      .eq('patient_id', id)
      .eq('id', versionId)
      .maybeSingle()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Version introuvable.' }, { status: 404 })
    }

    return Response.json(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lecture version impossible.'
    return Response.json({ error: message }, { status: 500 })
  }
}