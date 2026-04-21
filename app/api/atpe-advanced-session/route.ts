import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runAtpeEngineV2 } from '@/lib/atpe-engine-v2'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const groupId = searchParams.get('groupId')
    const sessionId = searchParams.get('sessionId')

    let query = supabase
      .from('atpe_session_advanced')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (patientId) query = query.eq('patient_id', patientId)
    if (groupId) query = query.eq('group_id', groupId)
    if (sessionId) query = query.eq('session_id', sessionId)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    })
  } catch (error) {
    console.error('GET /api/atpe-advanced-session error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de récupérer les séances avancées.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      patient_id,
      group_id,
      session_id,
      format,
      medium_primary,
      medium_secondary,
      atpe_phase_dominant,

      frame_containment,
      bodily_engagement,

      decentering_level,
      centering_level,
      externalization_level,
      work_dialogue_level,
      sharing_level,

      primary_symbolization,
      secondary_symbolization,
      relational_availability,
      creative_mobility,

      projective_intensity,
      group_cohesion,
      group_containment,
      transfer_diffraction,

      therapist_presence_quality,
      patient_engagement_level,

      therapist_feels_confusion,
      therapist_feels_sudden_fatigue,
      therapist_feels_pressure,
      therapist_feels_irritation,
      therapist_feels_void,
      patient_repeats_without_integration,
      group_feels_same_affect,
      tension_spreads_quickly,

      therapist_countertransference_notes,
      clinical_hypotheses,
      next_step_recommendation,
    } = body ?? {}

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Le champ session_id est requis.' },
        { status: 400 },
      )
    }

    if (!format || !['individual', 'group'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Le champ format est requis.' },
        { status: 400 },
      )
    }

    const engineInput = {
      format,
      mediumPrimary: medium_primary ?? null,
      mediumSecondary: medium_secondary ?? null,
      atpePhaseDominant: atpe_phase_dominant ?? null,

      frameContainment: frame_containment ?? null,
      bodilyEngagement: bodily_engagement ?? null,

      decenteringLevel: decentering_level ?? null,
      centeringLevel: centering_level ?? null,
      externalizationLevel: externalization_level ?? null,
      workDialogueLevel: work_dialogue_level ?? null,
      sharingLevel: sharing_level ?? null,

      primarySymbolization: primary_symbolization ?? null,
      secondarySymbolization: secondary_symbolization ?? null,
      relationalAvailability: relational_availability ?? null,
      creativeMobility: creative_mobility ?? null,

      projectiveIntensity: projective_intensity ?? null,
      groupCohesion: group_cohesion ?? null,
      groupContainment: group_containment ?? null,
      transferDiffraction: transfer_diffraction ?? null,

      therapistPresenceQuality: therapist_presence_quality ?? null,
      patientEngagementLevel: patient_engagement_level ?? null,

      markers: {
        therapistFeelsConfusion: !!therapist_feels_confusion,
        therapistFeelsSuddenFatigue: !!therapist_feels_sudden_fatigue,
        therapistFeelsPressure: !!therapist_feels_pressure,
        therapistFeelsIrritation: !!therapist_feels_irritation,
        therapistFeelsVoid: !!therapist_feels_void,
        patientRepeatsWithoutIntegration: !!patient_repeats_without_integration,
        groupFeelsSameAffect: !!group_feels_same_affect,
        tensionSpreadsQuickly: !!tension_spreads_quickly,
      },
    } as const

    const engineResult = runAtpeEngineV2(engineInput)

    const insertPayload = {
      patient_id: patient_id ?? null,
      group_id: group_id ?? null,
      session_id,

      format,
      medium_primary: medium_primary ?? null,
      medium_secondary: medium_secondary ?? null,
      atpe_phase_dominant: atpe_phase_dominant ?? null,

      frame_containment: frame_containment ?? null,
      bodily_engagement: bodily_engagement ?? null,

      decentering_level: decentering_level ?? null,
      centering_level: centering_level ?? null,
      externalization_level: externalization_level ?? null,
      work_dialogue_level: work_dialogue_level ?? null,
      sharing_level: sharing_level ?? null,

      primary_symbolization: primary_symbolization ?? null,
      secondary_symbolization: secondary_symbolization ?? null,
      relational_availability: relational_availability ?? null,
      creative_mobility: creative_mobility ?? null,

      projective_intensity: projective_intensity ?? null,
      group_cohesion: group_cohesion ?? null,
      group_containment: group_containment ?? null,
      transfer_diffraction: transfer_diffraction ?? null,

      therapist_presence_quality: therapist_presence_quality ?? null,
      patient_engagement_level: patient_engagement_level ?? null,

      therapist_feels_confusion: !!therapist_feels_confusion,
      therapist_feels_sudden_fatigue: !!therapist_feels_sudden_fatigue,
      therapist_feels_pressure: !!therapist_feels_pressure,
      therapist_feels_irritation: !!therapist_feels_irritation,
      therapist_feels_void: !!therapist_feels_void,
      patient_repeats_without_integration: !!patient_repeats_without_integration,
      group_feels_same_affect: !!group_feels_same_affect,
      tension_spreads_quickly: !!tension_spreads_quickly,

      therapist_countertransference_notes:
        therapist_countertransference_notes ?? null,
      clinical_hypotheses:
        clinical_hypotheses ??
        engineResult.hypotheses.join('\n\n'),
      next_step_recommendation:
        next_step_recommendation ??
        engineResult.recommendations.nextStep.join('\n'),
    }

    const { data, error } = await supabase
      .from('atpe_session_advanced')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
      engine: engineResult,
    })
  } catch (error) {
    console.error('POST /api/atpe-advanced-session error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible d’enregistrer l’observation thérapeutique avancée.',
      },
      { status: 500 },
    )
  }
}