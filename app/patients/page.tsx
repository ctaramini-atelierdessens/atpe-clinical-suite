import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { PatientRow } from '@/lib/clinical-db-types'

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getPatientDisplayName(patient: PatientRow) {
  const fullName =
    typeof patient.full_name === 'string' ? patient.full_name.trim() : ''
  const firstName =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const lastName =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''

  if (fullName) return fullName
  if (firstName || lastName) return `${firstName} ${lastName}`.trim()

  return (
    patient.patient_code ||
    patient.code ||
    patient.reference ||
    patient.id
  )
}

function getPatientReference(patient: PatientRow) {
  const candidates = [
    patient.patient_code,
    patient.code,
    patient.reference,
    patient.id,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return patient.id
}

async function listPatients(): Promise<PatientRow[]> {
  try {
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('PatientsPage listPatients error:', error)
      return []
    }

    return Array.isArray(data) ? (data as PatientRow[]) : []
  } catch (error) {
    console.error('PatientsPage unexpected error:', error)
    return []
  }
}

export default async function PatientsPage() {
  const patients = await listPatients()

  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Patients
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Dossiers patients
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Accès aux fiches patients, à la lecture clinique avancée, à la
          supervision, aux protocoles et aux exports.
        </p>
      </section>

      {!patients.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Aucun patient disponible pour le moment.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {patients.map((patient) => {
            const displayName = getPatientDisplayName(patient)
            const reference = getPatientReference(patient)

            return (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {displayName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {typeof patient.email === 'string' && patient.email.trim()
                        ? patient.email
                        : 'Email non renseigné'}
                    </p>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {typeof patient.status === 'string' && patient.status.trim()
                      ? patient.status
                      : 'actif'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Référence
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {reference}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Créé le
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(
                        typeof patient.created_at === 'string'
                          ? patient.created_at
                          : null,
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}