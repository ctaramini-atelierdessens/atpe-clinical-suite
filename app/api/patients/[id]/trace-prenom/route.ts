import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import {
  interpretTracePrenom,
  type TracePrenomInput,
} from '@/lib/atpe-clinical/interpretation'
import type { Database } from '@/lib/database.types'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type TracePrenomInsert =
  Database['public']['Tables']['trace_prenom_observations']['Insert']

type AllowedPressure = TracePrenomInput['pressure']
type AllowedContinuity = TracePrenomInput['continuity']
type AllowedSpatialOrganization = TracePrenomInput['spatialOrganization']
type AllowedRepetition = TracePrenomInput['repetition']
type AllowedHesitation = TracePrenomInput['hesitation']
type AllowedAnchoring = TracePrenomInput['anchoring']
type AllowedReadability = TracePrenomInput['readability']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isAllowedPressure(value: unknown): value is AllowedPressure {
  return value === 'faible' || value === 'moyenne' || value === 'forte'
}

function isAllowedContinuity(value: unknown): value is AllowedContinuity {
  return value === 'fluide' || value === 'retenue' || value === 'hachée'
}

function isAllowedSpatialOrganization(
  value: unknown
): value is AllowedSpatialOrganization {
  return value === 'organisee' || value === 'partielle' || value === 'chaotique'
}

function isAllowedRepetition(value: unknown): value is AllowedRepetition {
  return value === 'absente' || value === 'moderee' || value === 'marquee'
}

function isAllowedHesitation(value: unknown): value is AllowedHesitation {
  return value === 'faible' || value === 'moderee' || value === 'forte'
}

function isAllowedAnchoring(value: unknown): value is AllowedAnchoring {
  return value === 'bon' || value === 'fragile' || value === 'faible'
}

function isAllowedReadability(value: unknown): value is AllowedReadability {
  return value === 'bonne' || value === 'moyenne' || value === 'difficile'
}

function isTracePrenomInput(value: unknown): value is TracePrenomInput {
  if (!value || typeof value !== 'object') return false

  const input = value as Record<string, unknown>

  return (
    isAllowedPressure(input.pressure) &&
    isAllowedContinuity(input.continuity) &&
    isAllowedSpatialOrganization(input.spatialOrganization) &&
    isAllowedRepetition(input.repetition) &&
    isAllowedHesitation(input.hesitation) &&
    isAllowedAnchoring(input.anchoring) &&
    isAllowedReadability(input.readability)
  )
}

function sanitizeSessionId(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim() : null
}

function sanitizeClinicianNotes(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: `Lecture impossible : ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        data: data ?? null,
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

    const input = body?.input
    const sessionId = sanitizeSessionId(body?.sessionId)
    const clinicianNotes = sanitizeClinicianNotes(body?.clinicianNotes)

    if (!isTracePrenomInput(input)) {
      return NextResponse.json(
        { error: 'Données Trace-Prénom invalides.' },
        { status: 400 }
      )
    }

    const interpretation = interpretTracePrenom(input)

    const payload: TracePrenomInsert = {
      patient_id: patientId,
      session_id: sessionId,
      pressure: input.pressure,
      continuity: input.continuity,
      spatial_organization: input.spatialOrganization,
      repetition: input.repetition,
      hesitation: input.hesitation,
      anchoring: input.anchoring,
      readability: input.readability,
      engagement_delta: interpretation.engagementDelta,
      tension_delta: interpretation.tensionDelta,
      vulnerability_delta: interpretation.vulnerabilityDelta,
      symbolization_delta: interpretation.symbolizationDelta,
      clinical_text: interpretation.clinicalText,
      clinician_notes: clinicianNotes,
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trace_prenom_observations')
      .insert(payload)
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
        message: 'Observation Trace-Prénom enregistrée.',
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