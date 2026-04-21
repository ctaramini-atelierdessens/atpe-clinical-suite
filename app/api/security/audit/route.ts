import { NextRequest, NextResponse } from 'next/server'
import { logSecurityAudit } from '@/lib/security-audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.accessType || !body?.description) {
      return NextResponse.json(
        { success: false, error: 'accessType et description sont requis.' },
        { status: 400 },
      )
    }

    await logSecurityAudit({
      actorId: typeof body.actorId === 'string' ? body.actorId : null,
      patientId: typeof body.patientId === 'string' ? body.patientId : null,
      groupId: typeof body.groupId === 'string' ? body.groupId : null,
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
      accessType: body.accessType,
      description: body.description,
      metadata:
        body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
          ? body.metadata
          : {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/security/audit error:', error)

    return NextResponse.json(
      { success: false, error: 'Impossible d’enregistrer l’audit.' },
      { status: 500 },
    )
  }
}