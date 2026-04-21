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

async function main() {
  console.log('→ Inspection table patients...')

  const { data, error } = await supabase.from('patients').select('*').limit(1)

  if (error) {
    console.error('❌ Erreur lecture patients:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('⚠️ Table patients lisible, mais aucune ligne trouvée.')
    console.log(
      '➡️ Envoie-moi ce message + le nom exact des colonnes si tu les vois dans Supabase.'
    )
    return
  }

  const firstRow = data[0]

  console.log('✅ Exemple de ligne trouvée dans patients :')
  console.log(JSON.stringify(firstRow, null, 2))

  console.log('\n✅ Colonnes détectées :')
  console.log(Object.keys(firstRow))
}

main().catch((error) => {
  console.error('❌ Erreur inattendue inspect patients:', error)
  process.exit(1)
})