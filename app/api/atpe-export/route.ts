import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { AtpeAdvancedRow, PatientRow } from '@/lib/patient-types'
import {
  buildGroupSummaryExport,
  buildLongitudinalExport,
  buildProtocolExport,
  buildSupervisionExport,
  buildTherapeuticSummaryExport,
} from '@/lib/atpe-export'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const sessionId = searchParams.get('sessionId')
    const exportType = searchParams.get('type')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre patientId est requis.' },
        { status: 400 },
      )
    }

    if (
      !exportType ||
      ![
        'therapeutic_summary',
        'supervision_note',
        'longitudinal_summary',
        'protocol_sheet',
        'group_summary',
      ].includes(exportType)
    ) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre type est invalide.' },
        { status: 400 },
      )
    }

    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    const patient = (patientData ?? null) as PatientRow | null

    const { data, error } = await supabase
      .from('atpe_session_advanced')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      )
    }

    const rows = (data ?? []) as AtpeAdvancedRow[]

    const currentRow =
      (sessionId
        ? rows.find((row) => row.session_id === sessionId)
        : rows[0]) ?? null

    const currentIndex = currentRow
      ? rows.findIndex((row) => row.id === currentRow.id)
      : -1

    const previousRow =
      currentIndex >= 0 ? rows[currentIndex + 1] ?? null : rows[1] ?? null

    let filename = 'export.txt'
    let content = ''

    switch (exportType) {
      case 'therapeutic_summary':
        filename = `synthese-therapeutique-${patientId}.txt`
        content = buildTherapeuticSummaryExport({
          patient,
          currentRow,
          previousRow,
        })
        break
      case 'supervision_note':
        filename = `note-supervision-${patientId}.txt`
        content = buildSupervisionExport({
          patient,
          currentRow,
        })
        break
      case 'longitudinal_summary':
        filename = `synthese-longitudinale-${patientId}.txt`
        content = buildLongitudinalExport({
          patient,
          currentRow,
          previousRow,
        })
        break
      case 'protocol_sheet':
        filename = `fiche-protocole-${patientId}.txt`
        content = buildProtocolExport({
          patient,
          currentRow,
        })
        break
      case 'group_summary':
        filename = `synthese-groupe-${patientId}.txt`
        content = buildGroupSummaryExport({
          patient,
          currentRow,
        })
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Type non supporté.' },
          { status: 400 },
        )
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('GET /api/atpe-export error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de générer l’export clinique.',
      },
      { status: 500 },
    )
  }
}