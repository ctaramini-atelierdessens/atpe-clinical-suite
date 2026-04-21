import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { AtpeAdvancedRow } from '@/lib/patient-types'
import { analyzeGroupRow, compareGroupRows } from '@/lib/atpe-group'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const groupId = searchParams.get('groupId')
    const patientId = searchParams.get('patientId')
    const sessionId = searchParams.get('sessionId')

    if (!groupId && !patientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le paramètre groupId ou patientId est requis.',
        },
        { status: 400 },
      )
    }

    let query = supabase
      .from('atpe_session_advanced')
      .select('*')
      .eq('format', 'group')
      .order('created_at', { ascending: false })

    if (groupId) {
      query = query.eq('group_id', groupId)
    } else if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    const { data, error } = await query

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
          sessions: [],
          current: null,
          previous: null,
          comparison: null,
        },
      })
    }

    let currentIndex = 0
    if (sessionId) {
      const foundIndex = rows.findIndex((row) => row.session_id === sessionId)
      if (foundIndex >= 0) {
        currentIndex = foundIndex
      }
    }

    const currentRow = rows[currentIndex]
    const previousRow = rows[currentIndex + 1] ?? null

    const currentAnalysis = analyzeGroupRow(currentRow)
    const comparison = compareGroupRows(currentRow, previousRow)

    return NextResponse.json({
      success: true,
      data: {
        sessions: rows.map((row) => ({
          id: row.session_id,
          label: row.medium_primary
            ? `${row.session_id} — ${row.medium_primary}`
            : row.session_id,
          createdAt: row.created_at,
        })),
        current: {
          row: currentRow,
          analysis: currentAnalysis,
        },
        previous: previousRow
          ? {
              row: previousRow,
              analysis: comparison.previousAnalysis,
            }
          : null,
        comparison: {
          deltas: comparison.deltas,
          narrative: comparison.comparisonNarrative,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/atpe-group-session error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger la lecture groupe / intersubjectivité.',
      },
      { status: 500 },
    )
  }
}