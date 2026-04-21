import { NextRequest, NextResponse } from 'next/server'
import { resolveAtpeCase } from '@/lib/atpe/resolve-atpe-case'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'patientId manquant',
        },
        { status: 400 }
      )
    }

    const payload = await resolveAtpeCase(patientId)

    return NextResponse.json(
      {
        ok: true,
        generated_at: new Date().toISOString(),
        ...payload,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur route atpe-case-resolved:', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Erreur inconnue route atpe-case-resolved'

    if (message.toLowerCase().includes('patient introuvable')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Patient introuvable',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    )
  }
}