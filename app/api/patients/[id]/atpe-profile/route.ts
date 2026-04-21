import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type RouteContext = {
  params: Promise<{ id: string }>
}

type PatientATPEProfileInsert =
  Database['public']['Tables']['patient_atpe_profiles']['Insert']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeEnum(
  value: unknown,
  allowed: readonly string[],
  fallback: string
): string {
  return typeof value === 'string' && allowed.includes(value)
    ? value
    : fallback
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
      .from('patient_atpe_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: `Lecture du profil impossible : ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur serveur inconnue.'

    const status = message === 'Patient introuvable.' ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id: patientId } = await context.params

  if (!isNonEmptyString(patientId)) {
    return NextResponse.json(
      { error: 'Identifiant patient manquant.' },
      { status: 400 }
    )
  }

  try {
    await ensurePatientExists(patientId)

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Payload invalide.' },
        { status: 400 }
      )
    }

    const allowedVerbalizationLevels = [
      'absente',
      'faible',
      'retenue',
      'flottante',
      'metaphorique',
      'spontanee',
      'reflexive',
    ] as const

    const allowedEmotionalIntensities = [
      'faible',
      'moderee',
      'forte',
      'flottante',
      'ambivalente',
    ] as const

    const allowedSensoryDominants = [
      'tactile',
      'visuelle',
      'auditive',
      'kinesthesique',
      'imaginaire',
      'mixte',
    ] as const

    const allowedTherapeuticPhases = [
      'accueil',
      'expression',
      'traversee',
      'reparation',
      'affirmation',
    ] as const

    const allowedToleranceLevels = [
      'fragile',
      'modere',
      'satisfaisant',
    ] as const

    const payload: PatientATPEProfileInsert = {
      patient_id: patientId,
      primary_condition_id: asNullableString((body as Record<string, unknown>).primary_condition_id),
      associated_condition_ids: asStringArray(
        (body as Record<string, unknown>).associated_condition_ids
      ),
      verbalization_level: sanitizeEnum(
        (body as Record<string, unknown>).verbalization_level,
        allowedVerbalizationLevels,
        'faible'
      ),
      emotional_intensity: sanitizeEnum(
        (body as Record<string, unknown>).emotional_intensity,
        allowedEmotionalIntensities,
        'moderee'
      ),
      sensory_dominant: sanitizeEnum(
        (body as Record<string, unknown>).sensory_dominant,
        allowedSensoryDominants,
        'mixte'
      ),
      therapeutic_phase: sanitizeEnum(
        (body as Record<string, unknown>).therapeutic_phase,
        allowedTherapeuticPhases,
        'accueil'
      ),
      tolerance_emotional_level: sanitizeEnum(
        (body as Record<string, unknown>).tolerance_emotional_level,
        allowedToleranceLevels,
        'modere'
      ),
      preferred_media_ids: asStringArray(
        (body as Record<string, unknown>).preferred_media_ids
      ),
      caution_media_ids: asStringArray(
        (body as Record<string, unknown>).caution_media_ids
      ),
      risk_flags: asStringArray((body as Record<string, unknown>).risk_flags),
      follow_up_points: asStringArray(
        (body as Record<string, unknown>).follow_up_points
      ),
      notes: asNullableString((body as Record<string, unknown>).notes),
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('patient_atpe_profiles')
      .upsert(payload, { onConflict: 'patient_id' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Enregistrement impossible : ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        data,
        message: 'Profil clinique ATPE enregistré.',
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur serveur inconnue.'

    const status = message === 'Patient introuvable.' ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}