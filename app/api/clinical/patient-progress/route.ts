import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre patientId est requis.' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('atpe_session_advanced')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      rows: Array.isArray(data) ? data : [],
    })
  } catch (error) {
    console.error('GET /api/clinical/patient-progress error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger la progression clinique.',
      },
      { status: 500 },
    )
  }
}