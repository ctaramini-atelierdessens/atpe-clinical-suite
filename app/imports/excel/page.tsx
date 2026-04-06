import { ExcelImportPanel } from '@/components/excel-import-panel'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function ExcelImportPage() {
  const { supabase, organization } = await getAppContext()

  const [{ data: jobs }, { data: rowResults }, { data: mappingProfiles }] = await Promise.all([
    organization
      ? supabase.from('import_jobs').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(12)
      : Promise.resolve({ data: [] as any[] }),
    organization
      ? supabase.from('import_row_results').select('id, import_job_id, row_number, status, message, patient_id, patient_code').order('created_at', { ascending: false }).limit(100)
      : Promise.resolve({ data: [] as any[] }),
    organization
      ? supabase.from('import_mapping_profiles').select('id, profile_name, profile_scope, config_json, created_at, updated_at').eq('organization_id', organization.id).order('updated_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const latestJobId = jobs?.[0]?.id
  const latestRows = (rowResults ?? []).filter((row: any) => row.import_job_id === latestJobId)

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Import structuré v9</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Import clinique production → Supabase</h1>
            <p className="mt-3 max-w-4xl text-sm text-slate-500">
              Cette version ajoute la sauvegarde des profils de mapping depuis l’interface, un dry run incrémental et une résolution assistée des doublons avant validation finale.
            </p>
          </div>
        </div>
      </section>

      <ExcelImportPanel jobs={(jobs ?? []) as any[]} latestRows={(latestRows ?? []) as any[]} mappingProfiles={(mappingProfiles ?? []) as any[]} />
    </div>
  )
}
