import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { AtpeAdvancedRow } from '@/lib/patient-types'
import { analyzeSupervisionRow } from '@/lib/atpe-supervision'

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

    let query = supabase
      .from('atpe_session_advanced')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

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
          current: null,
          journal: [],
          supervisionFlags: [],
        },
      })
    }

    const currentRow =
      (sessionId
        ? rows.find((row) => row.session_id === sessionId)
        : rows[0]) ?? rows[0]

    const currentAnalysis = analyzeSupervisionRow(currentRow)

    const journal = rows.map((row) => {
      const analysis = analyzeSupervisionRow(row)
      return {
        id: row.id,
        sessionId: row.session_id,
        createdAt: row.created_at,
        mediumPrimary: row.medium_primary,
        note: analysis.suggestedNote,
        therapistExperiences: analysis.therapistExperiences,
        flags: analysis.flags,
        therapistCountertransferenceNotes: row.therapist_countertransference_notes,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        current: {
          row: currentRow,
          analysis: currentAnalysis,
        },
        journal,
        supervisionFlags: currentAnalysis.flags,
      },
    })
  } catch (error) {
    console.error('GET /api/atpe-supervision error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les données de supervision clinique.',
      },
      { status: 500 },
    )
  }
}