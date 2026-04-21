import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PATIENT_ID = '7f4c2d1e-6b7a-4b8d-9c3e-1f2a3b4c5d6e'

async function main() {
  console.log('→ Seed patient Odette Vayssié...')

  const { data: existingPatient, error: existingPatientError } = await supabase
    .from('patients')
    .select('id')
    .eq('id', PATIENT_ID)
    .maybeSingle()

  if (existingPatientError) {
    console.error('❌ Erreur lecture patient existant:', existingPatientError)
    process.exit(1)
  }

  if (existingPatient) {
    console.log('✅ Patient déjà présent, aucune création nécessaire')
    console.log(`✅ UUID patient : ${PATIENT_ID}`)
    return
  }

  const { data: referencePatient, error: referenceError } = await supabase
    .from('patients')
    .select('organization_id, primary_clinician_id')
    .not('organization_id', 'is', null)
    .not('primary_clinician_id', 'is', null)
    .limit(1)
    .maybeSingle()

  if (referenceError) {
    console.error('❌ Erreur lecture patient de référence:', referenceError)
    process.exit(1)
  }

  if (!referencePatient?.organization_id || !referencePatient?.primary_clinician_id) {
    console.error(
      "❌ Impossible de créer le patient : aucun organization_id / primary_clinician_id de référence trouvé dans la table patients."
    )
    process.exit(1)
  }

  const row = {
    id: PATIENT_ID,
    organization_id: referencePatient.organization_id,
    primary_clinician_id: referencePatient.primary_clinician_id,
    code: 'ODV01',
    initials: 'OV',
    birth_year: 1940,
    sex: 'F',
    referral_source: 'Seed clinique Odette Vayssié',
    case_reference: 'ATPE-ODV-001',
    status: 'active',
    first_contact_on: '2025-11-20',
    deleted_at: null,
    deleted_by: null,
    display_name: 'Odette Vayssié',
  }

  const { error: insertError } = await supabase
    .from('patients')
    .upsert(row, { onConflict: 'id' })

  if (insertError) {
    console.error('❌ Erreur création patient Odette Vayssié:', insertError)
    process.exit(1)
  }

  console.log('✅ Patient Odette Vayssié créé / mis à jour')
  console.log(`✅ UUID patient : ${PATIENT_ID}`)
}

main().catch((error) => {
  console.error('❌ Erreur inattendue seed Odette Vayssié:', error)
  process.exit(1)
})