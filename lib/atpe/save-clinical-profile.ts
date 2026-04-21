import { getAppContext } from '@/lib/atpe/app-context'
import {
  runAtpeExpertV2,
  type ExpertObservationInput,
} from '@/lib/atpe-expert'

type SessionLike = {
  id: string
  patient_id: string
  organization_id?: string | null
  clinician_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  session_number?: number | null

  observation_json?: Record<string, unknown> | null
  expert_observation_json?: Record<string, unknown> | null
  notes?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// ✅ VERSION SAFE (compatible avec ta base actuelle)
function getSessionScores(session: SessionLike) {
  return {
    emotion: 50,
    corps: 50,
    conscience: 50,
    dynamique: 50,
    symbolique: 50,
    global: 50,
  }
}

function inferObservationFromScores(session: SessionLike): ExpertObservationInput {
  const scores = getSessionScores(session)

  return {
    posture: 'stable',
    tonus: 'moyen',
    respiration: 'modulee',
    micro_gestes: 'presents',

    engagement_relationnel: 'moyen',
    verbalisation: 'moyenne',
    latence: 'moyenne',

    images_mentales: true,
    mouvement_corporel: 'leger',

    reaction_musique: true,
    relachement_tonique_musique: true,
    verbalisation_emotionnelle_musique: true,

    fatigue: 'moyenne',
    attention: 'fluctuante',
    sensibilite_stimuli_doux: true,

    notes: `Auto-généré depuis séance ${session.session_number ?? 'N/A'}`,
  }
}

function mergeObservationSources(session: SessionLike): ExpertObservationInput {
  const inferred = inferObservationFromScores(session)

  const observationJson = isRecord(session.observation_json)
    ? session.observation_json
    : {}

  const expertObservationJson = isRecord(session.expert_observation_json)
    ? session.expert_observation_json
    : {}

  return {
    ...inferred,
    ...observationJson,
    ...expertObservationJson,
  } as ExpertObservationInput
}

function buildProfileTypeList(result: ReturnType<typeof runAtpeExpertV2>): string[] {
  const values = [
    ...result.profiles,
    result.entryMode ? `entrée:${result.entryMode}` : null,
    result.sessionStrategy ? `stratégie:${result.sessionStrategy}` : null,
  ].filter(Boolean) as string[]

  return Array.from(new Set(values))
}

function pickRiskLevel(result: ReturnType<typeof runAtpeExpertV2>): string {
  if (result.clinicalLoad === 'très élevée') return 'critical'
  if (result.clinicalLoad === 'élevée') return 'warning'
  return 'info'
}

export async function saveClinicalProfileFromSession(sessionId: string) {
  const { supabase } = await getAppContext()

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle<SessionLike>()

  if (sessionError) {
    throw new Error(`Erreur session: ${sessionError.message}`)
  }

  if (!session) {
    throw new Error(`Séance introuvable`)
  }

  const observation = mergeObservationSources(session)
  const result = runAtpeExpertV2(observation)

  const payload = {
    organization_id: session.organization_id ?? null,
    patient_id: session.patient_id,
    source: 'session_auto_v2',
    source_session_id: session.id,

    profile_type: buildProfileTypeList(result),
    risk_level: pickRiskLevel(result),
    dominant_modality: result.dominantModality ?? null,

    notes: observation.notes ?? null,
    observation_json: observation,

    output_json: {
      ...result,
      generated_at: new Date().toISOString(),
    },
  }

  const { data: existing } = await supabase
    .from('clinical_profiles')
    .select('id')
    .eq('source_session_id', session.id)
    .maybeSingle()

  if (existing?.id) {
    await supabase
      .from('clinical_profiles')
      .update(payload)
      .eq('id', existing.id)

    return { mode: 'updated', id: existing.id }
  }

  const { data: inserted } = await supabase
    .from('clinical_profiles')
    .insert(payload)
    .select('id')
    .maybeSingle()

  return { mode: 'inserted', id: inserted?.id }
}