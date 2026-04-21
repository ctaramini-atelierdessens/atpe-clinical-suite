import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

async function ensurePatientExists(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(`Vérification patient impossible : ${error.message}`)
  }

  if (!data) {
    throw new Error('Patient introuvable.')
  }
}

export async function GET(_: Request, context: RouteContext) {
  const { id: patientId } = await context.params

  if (!isNonEmptyString(patientId)) {
    return NextResponse.json(
      { error: 'Identifiant patient manquant.' },
      { status: 400 }
    )
  }

  try {
    await ensurePatientExists(patientId)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trace_prenom_observations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Lecture de l’historique impossible : ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        data: Array.isArray(data) ? data : [],
      },
      { status: 200 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur serveur inconnue.'

    const status = message === 'Patient introuvable.' ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}