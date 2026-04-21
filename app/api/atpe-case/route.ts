import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  mmeOvCompleteCase,
  getMmeOvLatestSession,
  getMmeOvSession,
} from '@/lib/atpe/mme-ov-complete-case'

type PatientRow = {
  id: string
  display_name: string | null
  code: string | null
  initials: string | null
  status: string | null
  birth_year: number | null
  sex: string | null
  referral_source: string | null
  case_reference: string | null
  first_contact_on: string | null
  created_at: string | null
  updated_at: string | null
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function safeText(value: string | null | undefined, fallback = '—'): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function safeNumber(value: number | null | undefined, fallback: number | null = null) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date)
}

function buildPatientPayload(patient: PatientRow) {
  return {
    id: patient.id,
    display_name:
      patient.display_name || patient.code || patient.initials || 'Patient',
    code: safeText(patient.code),
    initials: safeText(patient.initials),
    status: safeText(patient.status),
    birth_year: safeNumber(patient.birth_year),
    sex: safeText(patient.sex),
    referral_source: safeText(patient.referral_source),
    case_reference: safeText(patient.case_reference),
    first_contact_on: formatDate(patient.first_contact_on),
    created_at: formatDate(patient.created_at),
    updated_at: formatDate(patient.updated_at),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const sessionNumberParam = searchParams.get('sessionNumber')

    if (!patientId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'patientId manquant',
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(
        `
          id,
          display_name,
          code,
          initials,
          status,
          birth_year,
          sex,
          referral_source,
          case_reference,
          first_contact_on,
          created_at,
          updated_at
        `
      )
      .eq('id', patientId)
      .maybeSingle<PatientRow>()

    if (patientError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Erreur lecture patient : ${patientError.message}`,
        },
        { status: 500 }
      )
    }

    if (!patient) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Patient introuvable',
        },
        { status: 404 }
      )
    }

    const sessionNumber =
      sessionNumberParam && !Number.isNaN(Number(sessionNumberParam))
        ? Number(sessionNumberParam)
        : null

    const selectedSession =
      typeof sessionNumber === 'number' ? getMmeOvSession(sessionNumber) : null

    const payload = {
      ok: true,
      generated_at: new Date().toISOString(),
      patient: buildPatientPayload(patient),
      case: {
        patientDisplayName: mmeOvCompleteCase.patientDisplayName,
        caseReference: mmeOvCompleteCase.caseReference,
        context: mmeOvCompleteCase.context,
        dominantMediations: mmeOvCompleteCase.dominantMediations,
        expressionAssessment: mmeOvCompleteCase.expressionAssessment,
        sessions: mmeOvCompleteCase.sessions,
        intermediateReview: mmeOvCompleteCase.intermediateReview,
        finalReview: mmeOvCompleteCase.finalReview,
        latestSession: getMmeOvLatestSession(),
        selectedSession,
      },
      meta: {
        totalSessions: mmeOvCompleteCase.sessions.length,
        hasSelectedSession: !!selectedSession,
        selectedSessionNumber: sessionNumber,
      },
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Erreur route atpe-case:', error)

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue route atpe-case',
      },
      { status: 500 }
    )
  }
}