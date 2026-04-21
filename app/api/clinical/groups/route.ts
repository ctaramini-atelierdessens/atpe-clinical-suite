import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type GroupType =
  | 'therapy_group'
  | 'art_therapy_group'
  | 'support_group'
  | 'mixed_group'

type GroupFormat = 'closed' | 'semi_open' | 'open'
type GroupStatus = 'active' | 'paused' | 'closed' | 'archived'

function isValidGroupType(value: unknown): value is GroupType {
  return [
    'therapy_group',
    'art_therapy_group',
    'support_group',
    'mixed_group',
  ].includes(String(value))
}

function isValidGroupFormat(value: unknown): value is GroupFormat {
  return ['closed', 'semi_open', 'open'].includes(String(value))
}

function isValidGroupStatus(value: unknown): value is GroupStatus {
  return ['active', 'paused', 'closed', 'archived'].includes(String(value))
}

function sanitizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    const organizationId = searchParams.get('organizationId')
    const clinicianId = searchParams.get('clinicianId')
    const code = searchParams.get('code')
    const reference = searchParams.get('reference')
    const name = searchParams.get('name')
    const status = searchParams.get('status')
    const groupType = searchParams.get('groupType')
    const format = searchParams.get('format')
    const limitParam = searchParams.get('limit')

    let query = supabase
      .from('clinical_groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (id) {
      query = query.eq('id', id)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (clinicianId) {
      query = query.eq('clinician_id', clinicianId)
    }

    if (code) {
      query = query.eq('code', code)
    }

    if (reference) {
      query = query.eq('reference', reference)
    }

    if (name) {
      query = query.ilike('name', `%${name}%`)
    }

    if (status && isValidGroupStatus(status)) {
      query = query.eq('status', status)
    }

    if (groupType && isValidGroupType(groupType)) {
      query = query.eq('group_type', groupType)
    }

    if (format && isValidGroupFormat(format)) {
      query = query.eq('format', format)
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
    console.error('GET /api/clinical/groups error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les groupes.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const name = sanitizeString(body?.name)
    const groupType = body?.group_type
    const format = body?.format
    const status = body?.status ?? 'active'

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ name est requis.',
        },
        { status: 400 },
      )
    }

    if (groupType !== null && groupType !== undefined && !isValidGroupType(groupType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ group_type est invalide.',
        },
        { status: 400 },
      )
    }

    if (format !== null && format !== undefined && !isValidGroupFormat(format)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ format est invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidGroupStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ status est invalide.',
        },
        { status: 400 },
      )
    }

    const payload = {
      organization_id: sanitizeString(body?.organization_id),
      clinician_id: sanitizeString(body?.clinician_id),
      name,
      code: sanitizeString(body?.code),
      reference: sanitizeString(body?.reference),
      description:
        typeof body?.description === 'string' ? body.description : null,
      group_type: isValidGroupType(groupType) ? groupType : null,
      format: isValidGroupFormat(format) ? format : null,
      status,
    }

    const { data, error } = await supabase
      .from('clinical_groups')
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
    console.error('POST /api/clinical/groups error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de créer le groupe.',
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

    if ('organization_id' in body) {
      updates.organization_id = sanitizeString(body.organization_id)
    }

    if ('clinician_id' in body) {
      updates.clinician_id = sanitizeString(body.clinician_id)
    }

    if ('name' in body) {
      const name = sanitizeString(body.name)
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le champ name ne peut pas être vide.',
          },
          { status: 400 },
        )
      }
      updates.name = name
    }

    if ('code' in body) {
      updates.code = sanitizeString(body.code)
    }

    if ('reference' in body) {
      updates.reference = sanitizeString(body.reference)
    }

    if ('description' in body) {
      updates.description =
        typeof body.description === 'string' ? body.description : null
    }

    if ('group_type' in body) {
      if (body.group_type === null || body.group_type === '') {
        updates.group_type = null
      } else if (!isValidGroupType(body.group_type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le champ group_type est invalide.',
          },
          { status: 400 },
        )
      } else {
        updates.group_type = body.group_type
      }
    }

    if ('format' in body) {
      if (body.format === null || body.format === '') {
        updates.format = null
      } else if (!isValidGroupFormat(body.format)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le champ format est invalide.',
          },
          { status: 400 },
        )
      } else {
        updates.format = body.format
      }
    }

    if ('status' in body) {
      if (!isValidGroupStatus(body.status)) {
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

    const { data, error } = await supabase
      .from('clinical_groups')
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
    console.error('PATCH /api/clinical/groups error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de mettre à jour le groupe.',
      },
      { status: 500 },
    )
  }
}