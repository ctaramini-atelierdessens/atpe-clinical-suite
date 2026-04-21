import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'

type PatientRow = {
  id: string
  code?: string | null
  initials?: string | null
  birth_year?: number | null
  sex?: string | null
  archived_at?: string | null
}

export default async function MobilePatientsPage() {
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    redirect('/mobile')
  }

  const { data: patients } = await supabase
    .from('patients')
    .select('id, code, initials, birth_year, sex, archived_at')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  const safePatients = Array.isArray(patients) ? (patients as PatientRow[]) : []
  const activePatients = safePatients.filter((patient) => !patient.archived_at)

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Patients</h1>
        <Link
          href="/mobile"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        >
          Retour
        </Link>
      </div>

      {activePatients.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 text-sm text-neutral-500 shadow-sm">
          Aucun patient actif.
        </div>
      ) : (
        <div className="space-y-3">
          {activePatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/mobile/patients/${patient.id}`}
              className="block rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="font-semibold">{patient.code ?? '—'}</div>
              <div className="mt-1 text-sm text-neutral-600">
                {patient.initials ?? '—'} • {patient.birth_year ?? '—'} • {patient.sex ?? '—'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}