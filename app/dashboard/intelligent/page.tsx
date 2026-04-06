
import { IntelligentDashboard } from '@/components/intelligent-dashboard'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function IntelligentDashboardPage() {
  const { supabase, organization } = await getAppContext()

  const [{ data: patients }, { data: consents }, { data: sessions }, { data: reviews }, { data: imports }, { data: snapshots }] = await Promise.all([
    organization ? supabase.from('active_patients').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('patient_consents').select('*').order('recorded_at', { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('active_patient_sessions').select('*').order('session_date', { ascending: false }).limit(500) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('clinical_review_requests').select('*').order('created_at', { ascending: false }).limit(200) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('import_jobs').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(12) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('patient_metric_snapshots').select('*').eq('organization_id', organization.id).order('snapshot_date', { ascending: false }).limit(500) : Promise.resolve({ data: [] as any[] }),
  ])

  return (
    <IntelligentDashboard
      patients={(patients ?? []) as any[]}
      consents={(consents ?? []) as any[]}
      sessions={(sessions ?? []) as any[]}
      reviews={(reviews ?? []) as any[]}
      imports={(imports ?? []) as any[]}
      snapshots={(snapshots ?? []) as any[]}
    />
  )
}
