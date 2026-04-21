import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type SaveInitialAssessmentBody = {
  patientId: string
  clinicalIntent: string
  mainGoals: string
  vigilancePoints: string
  selectedAxes: string[]
  selectedObjectives: Array<{
    axisKey: string
    rowKey: string
    objective: string
  }>
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function isValidBody(body: unknown): body is SaveInitialAssessmentBody {
  if (!body || typeof body !== 'object') return false

  const value = body as Record<string, unknown>

  return (
    typeof value.patientId === 'string' &&
    typeof value.clinicalIntent === 'string' &&
    typeof value.mainGoals === 'string' &&
    typeof value.vigilancePoints === 'string' &&
    Array.isArray(value.selectedAxes) &&
    Array.isArray(value.selectedObjectives)
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')?.trim()

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId est obligatoire.' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    const { data, error } = await supabase
      .from('patient_initial_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        {
          error: 'Erreur lors du chargement du bilan initial.',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      assessment: data ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur inconnue.'

    return NextResponse.json(
      {
        error: 'Impossible de traiter la requête.',
        details: message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!isValidBody(body)) {
      return NextResponse.json(
        { error: 'Corps de requête invalide.' },
        { status: 400 }
      )
    }

    if (!body.patientId.trim()) {
      return NextResponse.json(
        { error: 'patientId est obligatoire.' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    const payload = {
      patient_id: body.patientId,
      clinical_intent: body.clinicalIntent,
      main_goals: body.mainGoals,
      vigilance_points: body.vigilancePoints,
      selected_axes: body.selectedAxes,
      selected_objectives: body.selectedObjectives,
    }

    const { data, error } = await supabase
      .from('patient_initial_assessments')
      .upsert(payload, { onConflict: 'patient_id' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        {
          error: "Erreur lors de l'enregistrement du bilan initial.",
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      assessment: data,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur inconnue.'

    return NextResponse.json(
      {
        error: 'Impossible de traiter la requête.',
        details: message,
      },
      { status: 500 }
    )
  }
}