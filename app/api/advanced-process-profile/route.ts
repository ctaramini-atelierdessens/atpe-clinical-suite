import { NextRequest, NextResponse } from 'next/server'
import {
  AtpeSessionAdvancedInput,
  runAtpeEngineV2,
} from '@/lib/atpe-engine-v2'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AtpeSessionAdvancedInput

    if (!body || !body.format) {
      return NextResponse.json(
        { error: 'Le champ "format" est requis.' },
        { status: 400 },
      )
    }

    const result = runAtpeEngineV2(body)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('advanced-process-profile POST error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de calculer le profil avancé.',
      },
      { status: 500 },
    )
  }
}