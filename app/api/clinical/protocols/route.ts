import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type FrameIntensity = 'faible' | 'modérée' | 'soutenue' | 'renforcée'
type NextSessionType =
  | 'séance contenante'
  | 'séance de relance créative'
  | 'séance de transformation symbolique'
  | 'séance de reprise groupale'
  | 'séance de consolidation'
type Verbalization =
  | 'très limitée'
  | 'courte et cadrée'
  | 'progressive'
  | 'élaborative prudente'

function isValidFrameIntensity(value: unknown): value is FrameIntensity {
  return ['faible', 'modérée', 'soutenue', 'renforcée'].includes(String(value))
}

function isValidNextSessionType(value: unknown): value is NextSessionType {
  return [
    'séance contenante',
    'séance de relance créative',
    'séance de transformation symbolique',
    'séance de reprise groupale',
    'séance de consolidation',
  ].includes(String(value))
}

function isValidVerbalization(value: unknown): value is Verbalization {
  return [
    'très limitée',
    'courte et cadrée',
    'progressive',
    'élaborative prudente',
  ].includes(String(value))
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

type ProtocolMediaInput = {
  label?: unknown
  reason?: unknown
  sort_order?: unknown
}

function sanitizeProtocolMedia(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const media = item as ProtocolMediaInput
      const label = sanitizeString(media?.label)
      const reason = sanitizeString(media?.reason)
      const sortOrder =
        typeof media?.sort_order === 'number' && Number.isFinite(media.sort_order)
          ? media.sort_order
          : 0

      if (!label || !reason) return null

      return {
        label,
        reason,
        sort_order: sortOrder,
      }
    })
    .filter(
      (
        item,
      ): item is {
        label: string
        reason: string
        sort_order: number
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
    const sourceSessionId = searchParams.get('sourceSessionId')
    const isActiveParam = searchParams.get('isActive')
    const frameIntensity = searchParams.get('frameIntensity')
    const nextSessionType = searchParams.get('nextSessionType')
    const verbalization = searchParams.get('verbalization')
    const limitParam = searchParams.get('limit')
    const includeMedia = searchParams.get('includeMedia') === 'true'

    let query = supabase
      .from('atpe_protocol_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    if (sessionAdvancedId) {
      query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
    }

    if (sourceSessionId) {
      query = query.eq('source_session_id', sourceSessionId)
    }

    if (isActiveParam === 'true') {
      query = query.eq('is_active', true)
    } else if (isActiveParam === 'false') {
      query = query.eq('is_active', false)
    }

    if (frameIntensity && isValidFrameIntensity(frameIntensity)) {
      query = query.eq('frame_intensity', frameIntensity)
    }

    if (nextSessionType && isValidNextSessionType(nextSessionType)) {
      query = query.eq('next_session_type', nextSessionType)
    }

    if (verbalization && isValidVerbalization(verbalization)) {
      query = query.eq('verbalization', verbalization)
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

    if (!includeMedia || !rows.length) {
      return NextResponse.json({
        success: true,
        data: rows,
      })
    }

    const planIds = rows.map((row) => row.id).filter(Boolean)

    const { data: mediaRows, error: mediaError } = await supabase
      .from('atpe_protocol_media')
      .select('*')
      .in('protocol_plan_id', planIds)
      .order('sort_order', { ascending: true })

    if (mediaError) {
      return NextResponse.json(
        {
          success: false,
          error: mediaError.message,
        },
        { status: 500 },
      )
    }

    const mediaByPlanId = new Map<string, any[]>()

    for (const media of mediaRows ?? []) {
      const protocolPlanId = media.protocol_plan_id as string
      const existing = mediaByPlanId.get(protocolPlanId) ?? []
      existing.push(media)
      mediaByPlanId.set(protocolPlanId, existing)
    }

    const enrichedRows = rows.map((row) => ({
      ...row,
      media: mediaByPlanId.get(row.id) ?? [],
    }))

    return NextResponse.json({
      success: true,
      data: enrichedRows,
    })
  } catch (error) {
    console.error('GET /api/clinical/protocols error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les protocoles.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const frameIntensity = body?.frame_intensity
    const nextSessionType = body?.next_session_type
    const verbalization = body?.verbalization

    if (!isValidFrameIntensity(frameIntensity)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ frame_intensity est requis et invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidNextSessionType(nextSessionType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ next_session_type est requis et invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidVerbalization(verbalization)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ verbalization est requis et invalide.',
        },
        { status: 400 },
      )
    }

    const sourceSessionId = sanitizeString(body?.source_session_id)
    if (!sourceSessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ source_session_id est requis.',
        },
        { status: 400 },
      )
    }

    const therapistPosture = sanitizeStringArray(body?.therapist_posture)
    const media = sanitizeProtocolMedia(body?.media)

    const payload = {
      patient_id: sanitizeString(body?.patient_id),
      group_id: sanitizeString(body?.group_id),
      atpe_session_advanced_id: sanitizeString(body?.atpe_session_advanced_id),
      source_session_id: sourceSessionId,
      frame_intensity: frameIntensity,
      next_session_type: nextSessionType,
      verbalization,
      therapist_posture: therapistPosture,
      narrative:
        typeof body?.narrative === 'string' ? body.narrative : null,
      attitude_interieure:
        typeof body?.attitude_interieure === 'string'
          ? body.attitude_interieure
          : null,
      creation_step:
        typeof body?.creation_step === 'string' ? body.creation_step : null,
      dialogue_oeuvre:
        typeof body?.dialogue_oeuvre === 'string' ? body.dialogue_oeuvre : null,
      partage_step:
        typeof body?.partage_step === 'string' ? body.partage_step : null,
      is_active:
        typeof body?.is_active === 'boolean' ? body.is_active : true,
      created_by: sanitizeString(body?.created_by),
    }

    const { data, error } = await supabase
      .from('atpe_protocol_plans')
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

    if (media.length > 0) {
      const mediaPayload = media.map((item) => ({
        protocol_plan_id: data.id,
        label: item.label,
        reason: item.reason,
        sort_order: item.sort_order,
      }))

      const { error: mediaInsertError } = await supabase
        .from('atpe_protocol_media')
        .insert(mediaPayload)

      if (mediaInsertError) {
        return NextResponse.json(
          {
            success: false,
            error: mediaInsertError.message,
          },
          { status: 500 },
        )
      }
    }

    const { data: mediaRows, error: mediaFetchError } = await supabase
      .from('atpe_protocol_media')
      .select('*')
      .eq('protocol_plan_id', data.id)
      .order('sort_order', { ascending: true })

    if (mediaFetchError) {
      return NextResponse.json(
        {
          success: false,
          error: mediaFetchError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        media: mediaRows ?? [],
      },
    })
  } catch (error) {
    console.error('POST /api/clinical/protocols error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible d’enregistrer le protocole.',
      },
      { status: 500 },
    )
  }
}