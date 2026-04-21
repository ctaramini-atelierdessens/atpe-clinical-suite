import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PATIENT_ID = '7f4c2d1e-6b7a-4b8d-9c3e-1f2a3b4c5d6e'

const rows = [
  {
    id: '11111111-1111-4111-8111-111111111001',
    patient_id: PATIENT_ID,
    group_id: null,
    session_id: '22222222-2222-4222-8222-222222222001',
    format: 'individual',
    medium_primary: 'accueil sonore',
    medium_secondary: 'présence contenante',

    // ✅ CORRIGÉ
    atpe_phase_dominant: 'attitude_interieure',

    frame_containment: 72,
    bodily_engagement: 44,
    decentering_level: 28,
    centering_level: 38,
    externalization_level: 20,
    work_dialogue_level: 12,
    sharing_level: 8,
    primary_symbolization: 18,
    secondary_symbolization: 8,
    relational_availability: 42,
    creative_mobility: 14,
    projective_intensity: 18,

    therapist_presence_quality: 82,
    patient_engagement_level: 52,

    therapist_feels_confusion: false,
    therapist_feels_sudden_fatigue: false,
    therapist_feels_pressure: false,
    therapist_feels_irritation: false,
    therapist_feels_void: false,

    patient_repeats_without_integration: true,

    therapist_countertransference_notes:
      'Entrée prudente, besoin d’un cadre simple et très fiable.',

    clinical_hypotheses:
      'Début de sécurisation, engagement encore fragile.',

    next_step_recommendation:
      'Conserver une grande stabilité du cadre.',

    created_at: '2025-11-20T10:00:00.000Z',
    updated_at: '2025-11-20T10:45:00.000Z',
  },

  {
    id: '11111111-1111-4111-8111-111111111002',
    patient_id: PATIENT_ID,
    group_id: null,
    session_id: '22222222-2222-4222-8222-222222222002',
    format: 'individual',
    medium_primary: 'son tenu',
    medium_secondary: 'silence',

    atpe_phase_dominant: 'creation',

    frame_containment: 76,
    bodily_engagement: 48,
    decentering_level: 30,
    centering_level: 42,
    externalization_level: 22,
    work_dialogue_level: 14,
    sharing_level: 10,
    primary_symbolization: 20,
    secondary_symbolization: 10,
    relational_availability: 48,
    creative_mobility: 18,
    projective_intensity: 16,

    therapist_presence_quality: 84,
    patient_engagement_level: 58,

    therapist_feels_confusion: false,
    therapist_feels_sudden_fatigue: false,
    therapist_feels_pressure: false,
    therapist_feels_irritation: false,
    therapist_feels_void: false,

    patient_repeats_without_integration: true,

    therapist_countertransference_notes:
      'Disponibilité progressive.',

    clinical_hypotheses:
      'Engagement en augmentation.',

    next_step_recommendation:
      'Poursuivre sans changement.',

    created_at: '2025-11-24T10:00:00.000Z',
    updated_at: '2025-11-24T10:45:00.000Z',
  },

  {
    id: '11111111-1111-4111-8111-111111111003',
    patient_id: PATIENT_ID,
    group_id: null,
    session_id: '22222222-2222-4222-8222-222222222003',
    format: 'individual',
    medium_primary: 'son + geste',
    medium_secondary: 'variation',

    atpe_phase_dominant: 'dialogue_oeuvre',

    frame_containment: 80,
    bodily_engagement: 60,
    decentering_level: 40,
    centering_level: 60,
    externalization_level: 30,
    work_dialogue_level: 20,
    sharing_level: 14,
    primary_symbolization: 28,
    secondary_symbolization: 14,
    relational_availability: 60,
    creative_mobility: 24,
    projective_intensity: 12,

    therapist_presence_quality: 86,
    patient_engagement_level: 66,

    therapist_feels_confusion: false,
    therapist_feels_sudden_fatigue: false,
    therapist_feels_pressure: false,
    therapist_feels_irritation: false,
    therapist_feels_void: false,

    patient_repeats_without_integration: false,

    therapist_countertransference_notes:
      'Processus plus fluide.',

    clinical_hypotheses:
      'Début de transformation.',

    next_step_recommendation:
      'Stabiliser.',

    created_at: '2025-11-26T10:00:00.000Z',
    updated_at: '2025-11-26T10:45:00.000Z',
  },

  {
    id: '11111111-1111-4111-8111-111111111004',
    patient_id: PATIENT_ID,
    group_id: null,
    session_id: '22222222-2222-4222-8222-222222222004',
    format: 'individual',
    medium_primary: 'cadre constant',
    medium_secondary: 'intégration',

    atpe_phase_dominant: 'partage',

    frame_containment: 90,
    bodily_engagement: 80,
    decentering_level: 60,
    centering_level: 85,
    externalization_level: 45,
    work_dialogue_level: 40,
    sharing_level: 35,
    primary_symbolization: 50,
    secondary_symbolization: 30,
    relational_availability: 85,
    creative_mobility: 45,
    projective_intensity: 10,

    therapist_presence_quality: 92,
    patient_engagement_level: 90,

    therapist_feels_confusion: false,
    therapist_feels_sudden_fatigue: false,
    therapist_feels_pressure: false,
    therapist_feels_irritation: false,
    therapist_feels_void: false,

    patient_repeats_without_integration: false,

    therapist_countertransference_notes:
      'Stabilité globale.',

    clinical_hypotheses:
      'Intégration en cours.',

    next_step_recommendation:
      'Maintenir.',

    created_at: '2025-11-28T10:00:00.000Z',
    updated_at: '2025-11-28T10:45:00.000Z',
  },
]

async function main() {
  console.log('→ Seed atpe_session_advanced...')

  const { error } = await supabase
    .from('atpe_session_advanced')
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }

  console.log('✅ Seed terminé sans erreur')
}

main()