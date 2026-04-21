import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createProtocolWithSteps } from "@/lib/atpe/clinical-services"
import type { CreateProtocolWithStepsPayload } from "@/types/atpe-consolidated"

export const runtime = "nodejs"

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details: details ?? null },
    { status: 400 }
  )
}

export async function POST(request: Request) {
  try {
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

    const body = (await request.json()) as Partial<CreateProtocolWithStepsPayload>

    if (!body?.protocol) return badRequest("protocol est requis.")
    if (!body.protocol.organization_id) return badRequest("protocol.organization_id est requis.")
    if (!body.protocol.title?.trim()) return badRequest("protocol.title est requis.")

    const result = await createProtocolWithSteps(
      {
        protocol: {
          organization_id: body.protocol.organization_id,
          title: body.protocol.title.trim(),
          description: body.protocol.description ?? null,
          modality: body.protocol.modality ?? null,
          target_indications: body.protocol.target_indications ?? null,
          contraindications: body.protocol.contraindications ?? null,
          expected_duration_weeks: body.protocol.expected_duration_weeks ?? null,
          status: body.protocol.status ?? "active",
          created_by: body.protocol.created_by ?? user.id,
          updated_by: body.protocol.updated_by ?? user.id,
        },
        steps: Array.isArray(body.steps) ? body.steps : [],
      },
      supabase
    )

    return NextResponse.json({
      ok: true,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Erreur serveur lors de la création du protocole.",
      },
      { status: 500 }
    )
  }
}