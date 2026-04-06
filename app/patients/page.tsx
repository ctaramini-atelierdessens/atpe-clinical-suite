import Link from 'next/link'
import { getAppContext } from '@/lib/atpe/app-context'
import { PatientList } from '@/components/patient-list'
import { PatientFilters } from '@/components/patient-filters'
import { canCreateOrEdit } from '@/lib/atpe/rbac'

export default async function PatientsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {}
  const q = typeof params.q === 'string' ? params.q : ''
  const status = typeof params.status === 'string' ? params.status : 'all'
  const mine = typeof params.mine === 'string' ? params.mine : 'all'
  const archived = typeof params.archived === 'string' ? params.archived : 'active'

  const { supabase, user, membership } = await getAppContext()
  let query = archived === 'active'
    ? supabase.from('active_patients').select('*').order('created_at', { ascending: false })
    : supabase.from('patients').select('*').order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status as any)
  if (mine === 'mine') query = query.eq('primary_clinician_id', user.id)
  if (archived === 'only') query = query.not('deleted_at', 'is', null)
  if (q) query = query.or(`code.ilike.%${q}%,initials.ilike.%${q}%,case_reference.ilike.%${q}%,referral_source.ilike.%${q}%`)

  const { data: patients } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Patients</h1>
          <p className="mt-2 text-sm text-slate-500">Recherche multicritère, vue active SQL dédiée et filtrage production sur Supabase.</p>
        </div>
        {canCreateOrEdit(membership?.role) ? (
          <Link href="/patients/new" className="rounded-2xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700">Créer un patient</Link>
        ) : null}
      </div>
      <PatientFilters q={q} status={status} mine={mine} archived={archived} />
      <PatientList patients={patients ?? []} />
    </div>
  )
}
