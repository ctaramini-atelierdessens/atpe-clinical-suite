import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type ExportFormat = 'txt' | 'json' | 'pdf' | 'docx'
type ExportStatus = 'generated' | 'downloaded' | 'archived'
type ExportType =
  | 'therapeutic_summary'
  | 'supervision_note'
  | 'longitudinal_summary'
  | 'protocol_sheet'
  | 'group_summary'
  | 'custom'

function isValidExportFormat(value: unknown): value is ExportFormat {
  return ['txt', 'json', 'pdf', 'docx'].includes(String(value))
}

function isValidExportStatus(value: unknown): value is ExportStatus {
  return ['generated', 'downloaded', 'archived'].includes(String(value))
}

function isValidExportType(value: unknown): value is ExportType {
  return [
    'therapeutic_summary',
    'supervision_note',
    'longitudinal_summary',
    'protocol_sheet',
    'group_summary',
    'custom',
  ].includes(String(value))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const groupId = searchParams.get('groupId')
    const sessionAdvancedId = searchParams.get('atpeSessionAdvancedId')
    const exportType = searchParams.get('exportType')
    const status = searchParams.get('status')
    const limitParam = searchParams.get('limit')

    let query = supabase
      .from('atpe_export_logs')
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

    if (exportType && isValidExportType(exportType)) {
      query = query.eq('export_type', exportType)
    }

    if (status && isValidExportStatus(status)) {
      query = query.eq('status', status)
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
    console.error('GET /api/clinical/exports-log error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les logs d’export.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const exportType = body?.export_type
    const exportFormat = body?.export_format ?? 'txt'
    const exportStatus = body?.status ?? 'generated'

    if (!isValidExportType(exportType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ export_type est requis et invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidExportFormat(exportFormat)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ export_format est invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidExportStatus(exportStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ status est invalide.',
        },
        { status: 400 },
      )
    }

    const metadata =
      body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
        ? body.metadata
        : {}

    const payload = {
      patient_id:
        typeof body?.patient_id === 'string' && body.patient_id.trim()
          ? body.patient_id.trim()
          : null,
      group_id:
        typeof body?.group_id === 'string' && body.group_id.trim()
          ? body.group_id.trim()
          : null,
      atpe_session_advanced_id:
        typeof body?.atpe_session_advanced_id === 'string' &&
        body.atpe_session_advanced_id.trim()
          ? body.atpe_session_advanced_id.trim()
          : null,
      export_type: exportType,
      filename:
        typeof body?.filename === 'string' && body.filename.trim()
          ? body.filename.trim()
          : null,
      exported_by:
        typeof body?.exported_by === 'string' && body.exported_by.trim()
          ? body.exported_by.trim()
          : null,
      export_format: exportFormat,
      status: exportStatus,
      content_snapshot:
        typeof body?.content_snapshot === 'string' ? body.content_snapshot : null,
      metadata,
    }

    const { data, error } = await supabase
      .from('atpe_export_logs')
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
    console.error('POST /api/clinical/exports-log error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible d’enregistrer le log d’export.',
      },
      { status: 500 },
    )
  }
}