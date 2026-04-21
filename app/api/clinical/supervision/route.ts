import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type PriorityLevel = 'low' | 'standard' | 'high' | 'urgent'
type FlagLevel = 'info' | 'moderate' | 'high'

function isValidPriorityLevel(value: unknown): value is PriorityLevel {
  return ['low', 'standard', 'high', 'urgent'].includes(String(value))
}

function isValidFlagLevel(value: unknown): value is FlagLevel {
  return ['info', 'moderate', 'high'].includes(String(value))
}

function sanitizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

type SupervisionFlagInput = {
  level?: unknown
  code?: unknown
  title?: unknown
  description?: unknown
}

function sanitizeFlags(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const flag = item as SupervisionFlagInput
      const level = flag?.level
      const code = sanitizeString(flag?.code)
      const title = sanitizeString(flag?.title)
      const description = sanitizeString(flag?.description)

      if (!isValidFlagLevel(level) || !code || !title || !description) {
        return null
      }

      return {
        level,
        code,
        title,
        description,
      }
    })
    .filter(
      (
        item,
      ): item is {
        level: FlagLevel
        code: string
        title: string
        description: string
      } => item !== null,
    )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const groupId = searchParams.get('groupId')
    const sessionAdvancedId = searchParams.get('atpeSessionAdvancedId')
    const supervisorId = searchParams.get('supervisorId')
    const clinicianId = searchParams.get('clinicianId')
    const priorityLevel = searchParams.get('priorityLevel')
    const includeFlags = searchParams.get('includeFlags') === 'true'
    const limitParam = searchParams.get('limit')

    let query = supabase
      .from('atpe_supervision_entries')
      .select('*')
      .order('supervision_date', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    if (sessionAdvancedId) {
      query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
    }

    if (supervisorId) {
      query = query.eq('supervisor_id', supervisorId)
    }

    if (clinicianId) {
      query = query.eq('clinician_id', clinicianId)
    }

    if (priorityLevel && isValidPriorityLevel(priorityLevel)) {
      query = query.eq('priority_level', priorityLevel)
    }

    if (limitParam) {
      const parsedLimit = Number(limitParam)
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit)
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    const rows = data ?? []

    if (!includeFlags || !rows.length) {
      return NextResponse.json({
        success: true,
        data: rows,
      })
    }

    const supervisionIds = rows.map((row) => row.id).filter(Boolean)

    const { data: flagRows, error: flagError } = await supabase
      .from('atpe_supervision_flags')
      .select('*')
      .in('supervision_entry_id', supervisionIds)
      .order('created_at', { ascending: true })

    if (flagError) {
      return NextResponse.json(
        {
          success: false,
          error: flagError.message,
        },
        { status: 500 },
      )
    }

    const flagsByEntryId = new Map<string, any[]>()

    for (const flag of flagRows ?? []) {
      const entryId = flag.supervision_entry_id as string
      const existing = flagsByEntryId.get(entryId) ?? []
      existing.push(flag)
      flagsByEntryId.set(entryId, existing)
    }

    const enrichedRows = rows.map((row) => ({
      ...row,
      flags: flagsByEntryId.get(row.id) ?? [],
    }))

    return NextResponse.json({
      success: true,
      data: enrichedRows,
    })
  } catch (error) {
    console.error('GET /api/clinical/supervision error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les supervisions.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const priorityLevel = body?.priority_level ?? 'standard'

    if (!isValidPriorityLevel(priorityLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ priority_level est invalide.',
        },
        { status: 400 },
      )
    }

    const supervisionDate =
      typeof body?.supervision_date === 'string' && body.supervision_date.trim()
        ? body.supervision_date
        : new Date().toISOString()

    const payload = {
      patient_id: sanitizeString(body?.patient_id),
      group_id: sanitizeString(body?.group_id),
      atpe_session_advanced_id: sanitizeString(body?.atpe_session_advanced_id),
      supervision_date: supervisionDate,
      supervisor_id: sanitizeString(body?.supervisor_id),
      clinician_id: sanitizeString(body?.clinician_id),
      session_context:
        typeof body?.session_context === 'string' ? body.session_context : null,
      therapist_experiences: sanitizeStringArray(body?.therapist_experiences),
      perceived_affects: sanitizeStringArray(body?.perceived_affects),
      probable_clinical_meaning: sanitizeStringArray(
        body?.probable_clinical_meaning,
      ),
      caution_points: sanitizeStringArray(body?.caution_points),
      supervision_axes: sanitizeStringArray(body?.supervision_axes),
      suggested_note:
        typeof body?.suggested_note === 'string' ? body.suggested_note : null,
      free_notes:
        typeof body?.free_notes === 'string' ? body.free_notes : null,
      priority_level: priorityLevel,
    }

    const flags = sanitizeFlags(body?.flags)

    const { data, error } = await supabase
      .from('atpe_supervision_entries')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    if (flags.length > 0) {
      const flagPayload = flags.map((flag) => ({
        supervision_entry_id: data.id,
        level: flag.level,
        code: flag.code,
        title: flag.title,
        description: flag.description,
      }))

      const { error: flagInsertError } = await supabase
        .from('atpe_supervision_flags')
        .insert(flagPayload)

      if (flagInsertError) {
        return NextResponse.json(
          {
            success: false,
            error: flagInsertError.message,
          },
          { status: 500 },
        )
      }
    }

    const { data: flagRows, error: flagFetchError } = await supabase
      .from('atpe_supervision_flags')
      .select('*')
      .eq('supervision_entry_id', data.id)
      .order('created_at', { ascending: true })

    if (flagFetchError) {
      return NextResponse.json(
        {
          success: false,
          error: flagFetchError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        flags: flagRows ?? [],
      },
    })
  } catch (error) {
    console.error('POST /api/clinical/supervision error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de créer l’entrée de supervision.',
      },
      { status: 500 },
    )
  }
}