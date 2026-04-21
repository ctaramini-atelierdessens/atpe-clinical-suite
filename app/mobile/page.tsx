import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'

type PatientRow = {
  id: string
  code?: string | null
  initials?: string | null
  archived_at?: string | null
}

type SessionRow = {
  id: string
  patient_id?: string | null
  created_at?: string | null
  global_score?: number | null
  emotion?: number | null
  emotional_score?: number | null
  corps?: number | null
  body_score?: number | null
  conscience?: number | null
  consciousness_score?: number | null
  dynamique?: number | null
  dynamic_score?: number | null
  symbolique?: number | null
  symbolic_score?: number | null
}

function normalizeScore(
  primary?: number | null,
  fallback?: number | null,
): number | null {
  const value =
    typeof primary === 'number'
      ? primary
      : typeof fallback === 'number'
      ? fallback
      : null

  if (value === null || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

function computeGlobal(session: SessionRow): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const values = [
    normalizeScore(session.emotion, session.emotional_score),
    normalizeScore(session.corps, session.body_score),
    normalizeScore(session.conscience, session.consciousness_score),
    normalizeScore(session.dynamique, session.dynamic_score),
    normalizeScore(session.symbolique, session.symbolic_score),
  ]

  if (!values.every((v) => typeof v === 'number')) return null
  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export default async function MobileHomePage() {
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    redirect('/patients')
  }

  const [{ data: patients }, { data: sessions }] = await Promise.all([
    supabase
      .from('patients')
      .select('id, code, initials, archived_at')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const safePatients = Array.isArray(patients) ? (patients as PatientRow[]) : []
  const safeSessions = Array.isArray(sessions) ? (sessions as SessionRow[]) : []

  const activePatients = safePatients.filter((patient) => !patient.archived_at)
  const averageGlobal = average(
    safeSessions
      .map(computeGlobal)
      .filter((v): v is number => typeof v === 'number'),
  )

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="text-sm text-neutral-500">
          {organization.name ?? 'Organisation'}
        </div>
        <h1 className="mt-1 text-2xl font-bold">ATPE Mobile Terrain</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Accès rapide aux patients, aux séances et aux synthèses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-500">Patients actifs</div>
          <div className="mt-2 text-2xl font-bold">{activePatients.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-500">Global récent</div>
          <div className="mt-2 text-2xl font-bold">
            {averageGlobal !== null ? `${averageGlobal}/100` : '—'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/mobile/patients"
          className="block rounded-2xl bg-blue-600 px-4 py-4 text-center text-sm font-medium text-white"
        >
          Ouvrir les patients
        </Link>

        <Link
          href="/patients/new"
          className="block rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-center text-sm font-medium text-neutral-900"
        >
          Nouveau patient
        </Link>

        <Link
          href="/reporting"
          className="block rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-center text-sm font-medium text-neutral-900"
        >
          Reporting complet
        </Link>
      </div>
    </main>
  )
}