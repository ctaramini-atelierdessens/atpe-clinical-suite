import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveSessionClinicalBundle } from "@/lib/atpe/clinical-services"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details: details ?? null },
    { status: 400 }
  )
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: sessionId } = await context.params

    if (!sessionId) {
      return badRequest("session id manquant.")
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "Authentification requise." },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      patientId?: string
      organizationId?: string
      episodeId?: string | null
      observations?: any[]
      goalReviews?: any[]
      protocolExecution?: any[]
      artifacts?: any[]
      analyses?: any[]
      alerts?: any[]
      advancedAtpe?: any | null
    }

    if (!body?.patientId) return badRequest("patientId est requis.")
    if (!body?.organizationId) return badRequest("organizationId est requis.")

    const saved = await saveSessionClinicalBundle(
      {
        sessionId,
        patientId: body.patientId,
        organizationId: body.organizationId,
        episodeId: body.episodeId ?? null,
        observations: body.observations ?? [],
        goalReviews: body.goalReviews ?? [],
        protocolExecution: body.protocolExecution ?? [],
        artifacts: body.artifacts ?? [],
        analyses: body.analyses ?? [],
        alerts: body.alerts ?? [],
        advancedAtpe: body.advancedAtpe ?? null,
      },
      supabase
    )

    return NextResponse.json({
      ok: true,
      data: saved,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Erreur serveur lors de l’enregistrement du bundle clinique.",
      },
      { status: 500 }
    )
  }
}