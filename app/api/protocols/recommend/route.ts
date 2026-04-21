import { NextResponse } from 'next/server'
import { getAppContext } from '@/lib/atpe/app-context'
import { recommendProtocols } from '@/lib/protocol-engine'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { supabase, organization } = await getAppContext()

    if (!organization?.id) {
      return NextResponse.json(
        { error: 'Aucune organisation active.' },
        { status: 400 },
      )
    }

    const { data: protocols, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Impossible de charger les protocoles : ${error.message}` },
        { status: 500 },
      )
    }

    const recommended = recommendProtocols(body ?? {}, protocols ?? [])

    return NextResponse.json(recommended)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}