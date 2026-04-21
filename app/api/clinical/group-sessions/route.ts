import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type GroupSessionStatus = 'planned' | 'completed' | 'cancelled'

function isValidGroupSessionStatus(value: unknown): value is GroupSessionStatus {
  return ['planned', 'completed', 'cancelled'].includes(String(value))
}

function sanitizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function sanitizeDateTime(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return value
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const groupId = searchParams.get('groupId')
    const sessionCode = searchParams.get('sessionCode')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const mediumPrimary = searchParams.get('mediumPrimary')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const limitParam = searchParams.get('limit')

    let query = supabase
      .from('group_sessions')
      .select('*')
      .order('scheduled_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    if (sessionCode) {
      query = query.eq('session_code', sessionCode)
    }

    if (status && isValidGroupSessionStatus(status)) {
      query = query.eq('status', status)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (mediumPrimary) {
      query = query.ilike('medium_primary', `%${mediumPrimary}%`)
    }

    if (fromDate) {
      const validFromDate = sanitizeDateTime(fromDate)
      if (validFromDate) {
        query = query.gte('scheduled_at', validFromDate)
      }
    }

    if (toDate) {
      const validToDate = sanitizeDateTime(toDate)
      if (validToDate) {
        query = query.lte('scheduled_at', validToDate)
      }
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

    return NextResponse.json({
      success: true,
      data: data ?? [],
    })
  } catch (error) {
    console.error('GET /api/clinical/group-sessions error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les séances de groupe.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const groupId = sanitizeString(body?.group_id)
    const status = body?.status ?? 'planned'

    if (!groupId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ group_id est requis.',
        },
        { status: 400 },
      )
    }

    if (!isValidGroupSessionStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ status est invalide.',
        },
        { status: 400 },
      )
    }

    const payload = {
      group_id: groupId,
      session_code: sanitizeString(body?.session_code),
      title: sanitizeString(body?.title),
      scheduled_at: sanitizeDateTime(body?.scheduled_at),
      started_at: sanitizeDateTime(body?.started_at),
      ended_at: sanitizeDateTime(body?.ended_at),
      location: sanitizeString(body?.location),
      medium_primary: sanitizeString(body?.medium_primary),
      medium_secondary: sanitizeString(body?.medium_secondary),
      frame_notes:
        typeof body?.frame_notes === 'string' ? body.frame_notes : null,
      session_notes:
        typeof body?.session_notes === 'string' ? body.session_notes : null,
      status,
    }

    const { data, error } = await supabase
      .from('group_sessions')
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

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('POST /api/clinical/group-sessions error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de créer la séance de groupe.',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const id = sanitizeString(body?.id)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ id est requis.',
        },
        { status: 400 },
      )
    }

    const updates: Record<string, unknown> = {}

    if ('group_id' in body) {
      updates.group_id = sanitizeString(body.group_id)
    }

    if ('session_code' in body) {
      updates.session_code = sanitizeString(body.session_code)
    }

    if ('title' in body) {
      updates.title = sanitizeString(body.title)
    }

    if ('scheduled_at' in body) {
      updates.scheduled_at = sanitizeDateTime(body.scheduled_at)
    }

    if ('started_at' in body) {
      updates.started_at = sanitizeDateTime(body.started_at)
    }

    if ('ended_at' in body) {
      updates.ended_at = sanitizeDateTime(body.ended_at)
    }

    if ('location' in body) {
      updates.location = sanitizeString(body.location)
    }

    if ('medium_primary' in body) {
      updates.medium_primary = sanitizeString(body.medium_primary)
    }

    if ('medium_secondary' in body) {
      updates.medium_secondary = sanitizeString(body.medium_secondary)
    }

    if ('frame_notes' in body) {
      updates.frame_notes =
        typeof body.frame_notes === 'string' ? body.frame_notes : null
    }

    if ('session_notes' in body) {
      updates.session_notes =
        typeof body.session_notes === 'string' ? body.session_notes : null
    }

    if ('status' in body) {
      if (!isValidGroupSessionStatus(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le champ status est invalide.',
          },
          { status: 400 },
        )
      }
      updates.status = body.status
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucune mise à jour valide fournie.',
        },
        { status: 400 },
      )
    }

    if ('group_id' in updates && !updates.group_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ group_id ne peut pas être vide.',
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('group_sessions')
      .update(updates)
      .eq('id', id)
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

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('PATCH /api/clinical/group-sessions error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de mettre à jour la séance de groupe.',
      },
      { status: 500 },
    )
  }
}