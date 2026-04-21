import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeAdvancedGlobalScore } from '@/lib/atpe/advanced-global-score'

type RouteContext = {
  params: Promise<{ id: string }>
}

function firstOrNull<T>(value: T[] | null | undefined): T | null {
  return Array.isArray(value) && value.length > 0 ? value[0] : null
}

export async function GET(_: Request, context: RouteContext) {
  const { id: patientId } = await context.params

  if (!patientId) {
    return NextResponse.json({ error: 'Identifiant patient manquant.' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const [
      traceResult,
      dcResult,
      dmResult,
      epResult,
      colorResult,
      voiceResult,
      mandalaResult,
    ] = await Promise.all([
      supabase
        .from('trace_prenom_observations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('dialogue_colore_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('diamandala_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('ep_observations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('color_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('voice_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),

      supabase
        .from('mandala_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    const errors = [
      traceResult.error,
      dcResult.error,
      dmResult.error,
      epResult.error,
      colorResult.error,
      voiceResult.error,
      mandalaResult.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.map((e) => e?.message).join(' | ') },
        { status: 500 }
      )
    }

    const trace = firstOrNull(traceResult.data)
    const dc = firstOrNull(dcResult.data)
    const dm = firstOrNull(dmResult.data)
    const ep = firstOrNull(epResult.data)
    const color = firstOrNull(colorResult.data)
    const voice = firstOrNull(voiceResult.data)
    const mandala = firstOrNull(mandalaResult.data)

    const result = computeAdvancedGlobalScore({
      tracePrenom: trace
        ? {
            engagement: trace.engagement_score ?? trace.engagement ?? null,
            tension: trace.tension_score ?? trace.tension ?? null,
            vulnerabilite: trace.vulnerability_score ?? trace.vulnerabilite ?? null,
            symbolisation: trace.symbolization_score ?? trace.symbolisation ?? null,
            anchoring: trace.anchoring_score ?? trace.ancrage_score ?? null,
            continuity: trace.continuity_score ?? trace.continuite_score ?? null,
          }
        : null,

      dialogueColore: dc
        ? {
            contact: dc.contact ?? null,
            engagement: dc.engagement ?? null,
            continuity: dc.continuity ?? null,
            rupture: dc.rupture ?? null,
            emotionalExpression: dc.emotional_expression ?? null,
            inhibition: dc.inhibition ?? null,
            symbolicEmergence: dc.symbolic_emergence ?? null,
          }
        : null,

      diamandala: dm
        ? {
            synchronization: dm.synchronization ?? null,
            adaptation: dm.adaptation ?? null,
            centerApproach: dm.center_approach ?? null,
            centerAvoidance: dm.center_avoidance ?? null,
            centerIntegration: dm.center_integration ?? null,
            structureOrganization: dm.structure_organization ?? null,
          }
        : null,

      expressionPrimitive: ep
        ? {
            anchoring: ep.anchoring ?? null,
            coordination: ep.coordination ?? null,
            groupEngagement: ep.group_engagement ?? null,
            rhythmIntegration: ep.rhythm_integration ?? null,
            symbolicExpression: ep.symbolic_expression ?? null,
            structureLevel: ep.structure_level ?? null,
            expressionLevel: ep.expression_level ?? null,
          }
        : null,

      color: color
        ? {
            preferredColors: color.preferred_colors ?? [],
            rejectedColors: color.rejected_colors ?? [],
          }
        : null,

      voice: voice
        ? {
            tone: voice.tone ?? null,
            rhythm: voice.rhythm ?? null,
            intensity: voice.intensity ?? null,
            emotionalLoad: voice.emotional_load ?? null,
            bodyConnection: voice.body_connection ?? null,
            envelope: voice.envelope ?? null,
            mirrorQuality: voice.mirror_quality ?? null,
            archaicExpression: voice.archaic_expression ?? null,
            vocalEmotion: voice.vocal_emotion ?? null,
            verbalEmotion: voice.verbal_emotion ?? null,
          }
        : null,

      mandala: mandala
        ? {
            centerStrength: mandala.center_strength ?? null,
            boundaryIntegrity: mandala.boundary_integrity ?? null,
            symmetry: mandala.symmetry ?? null,
            openness: mandala.openness ?? null,
          }
        : null,
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur serveur inconnue.',
      },
      { status: 500 }
    )
  }
}