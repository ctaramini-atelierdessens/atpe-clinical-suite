import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { AtpeAdvancedRow } from '@/lib/patient-types'
import { buildProtocolPlanFromRow } from '@/lib/atpe-protocol'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const sessionId = searchParams.get('sessionId')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre patientId est requis.' },
        { status: 400 },
      )
    }

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

    if (!rows.length) {
      return NextResponse.json({
        success: true,
        data: {
          currentSessionId: '',
          plan: null,
          history: [],
        },
      })
    }

    const currentRow =
      (sessionId
        ? rows.find((row) => row.session_id === sessionId)
        : rows[0]) ?? rows[0]

    const plan = buildProtocolPlanFromRow(currentRow)

    const history = rows.slice(0, 10).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      createdAt: row.created_at,
      mediumPrimary: row.medium_primary,
      plan: buildProtocolPlanFromRow(row),
    }))

    return NextResponse.json({
      success: true,
      data: {
        currentSessionId: currentRow.session_id,
        plan,
        history,
      },
    })
  } catch (error) {
    console.error('GET /api/atpe-protocol error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de produire le protocole thérapeutique intelligent.',
      },
      { status: 500 },
    )
  }
}