import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('patient_export_versions')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ items: Array.isArray(data) ? data : [] })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lecture des versions impossible.'
    return Response.json({ error: message }, { status: 500 })
  }
}