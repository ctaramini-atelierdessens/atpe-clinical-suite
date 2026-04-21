import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { AtpeAdvancedRow } from '@/lib/patient-types'
import { analyzeLongitudinalComparison } from '@/lib/atpe-longitudinal'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const requestedSessionId = searchParams.get('sessionId')

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
          patientId,
          currentSessionId: '',
          previousSessionId: null,
          narrative: 'Aucune séance avancée disponible.',
          sessions: [],
          dimensions: {
            frameContainment: null,
            bodilyEngagement: null,
            primarySymbolization: null,
            secondarySymbolization: null,
            relationalAvailability: null,
            creativeMobility: null,
            projectiveIntensity: null,
            groupContainment: null,
          },
          currentProfile: null,
          previousProfile: null,
          hypotheses: [],
          alerts: [],
          recommendations: [],
          flags: [],
        },
      })
    }

    const sessions = rows.map((row) => ({
      id: row.session_id,
      label: row.medium_primary
        ? `${row.session_id} — ${row.medium_primary}`
        : row.session_id,
      createdAt: row.created_at,
    }))

    let currentIndex = 0

    if (requestedSessionId) {
      const foundIndex = rows.findIndex((row) => row.session_id === requestedSessionId)
      if (foundIndex >= 0) {
        currentIndex = foundIndex
      }
    }

    const currentRow = rows[currentIndex]
    const previousRow = rows[currentIndex + 1] ?? null

    const analysis = analyzeLongitudinalComparison({
      currentRow,
      previousRow,
      currentSessionId: currentRow.session_id,
      previousSessionId: previousRow?.session_id ?? null,
    })

    return NextResponse.json({
      success: true,
      data: {
        patientId,
        currentSessionId: currentRow.session_id,
        previousSessionId: previousRow?.session_id ?? null,
        narrative: analysis.narrative,
        sessions,
        dimensions: analysis.deltas,
        currentProfile: analysis.currentProfile,
        previousProfile: analysis.previousProfile,
        hypotheses: analysis.hypotheses,
        alerts: analysis.alerts,
        recommendations: analysis.recommendations,
        flags: analysis.flags,
      },
    })
  } catch (error) {
    console.error('GET /api/atpe-advanced-compare error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de produire la comparaison longitudinale enrichie.',
      },
      { status: 500 },
    )
  }
}