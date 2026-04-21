import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type PageProps = {
  params: Promise<{ id: string }>
}

type PatientRow = {
  id: string
  code?: string | null
  initials?: string | null
  birth_year?: number | null
  sex?: string | null
}

type SessionRow = {
  id: string
  patient_id?: string | null
  created_at?: string | null
  session_number?: number | null
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
  notes?: string | null
}

type ExpressionAssessmentRow = {
  expression_summary?: string | null
  is_locked?: boolean | null
}

type GoalRow = {
  id: string
  is_locked?: boolean | null
}

type MatrixVersionRow = {
  id: string
  is_active?: boolean | null
  is_locked?: boolean | null
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

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR')
}

export default async function MobilePatientPage({ params }: PageProps) {
  const { id } = await params
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    notFound()
  }

  const [
    { data: patient, error: patientError },
    { data: sessions },
    { data: expressionAssessment },
    { data: goals },
    { data: matrixVersions },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('id, code, initials, birth_year, sex')
      .eq('id', id)
      .eq('organization_id', organization.id)
      .maybeSingle(),

    supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', id)
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('patient_expression_assessments')
      .select('expression_summary, is_locked')
      .eq('patient_id', id)
      .maybeSingle(),

    supabase
      .from('patient_goals')
      .select('id, is_locked')
      .eq('patient_id', id),

    supabase
      .from('patient_diagnostic_matrix_versions')
      .select('id, is_active, is_locked')
      .eq('patient_id', id)
      .eq('is_active', true)
      .maybeSingle(),
  ])

  if (patientError || !patient) {
    notFound()
  }

  const safeSessions = Array.isArray(sessions) ? (sessions as SessionRow[]) : []
  const latest = safeSessions[0] ?? null
  const latestGlobal = latest ? computeGlobal(latest) : null

  const savedExpression =
    (expressionAssessment as ExpressionAssessmentRow | null) ?? null
  const safeGoals = Array.isArray(goals) ? (goals as GoalRow[]) : []
  const activeMatrix =
    (matrixVersions as MatrixVersionRow | null) ?? null

  const hasExpression = Boolean(savedExpression?.expression_summary)
  const goalsLocked =
    safeGoals.length > 0 ? safeGoals.every((goal) => Boolean(goal.is_locked)) : false

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/mobile/patients"
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        >
          Retour
        </Link>

        <Link
          href={`/mobile/patients/${id}/session/new`}
          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"
        >
          Nouvelle séance
        </Link>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="text-2xl font-bold">{patient.code ?? 'Patient'}</div>
        <div className="mt-1 text-sm text-neutral-600">
          {patient.initials ?? '—'} • {patient.birth_year ?? '—'} • {patient.sex ?? '—'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-500">Dernier global</div>
          <div className="mt-2 text-2xl font-bold">
            {latestGlobal !== null ? `${latestGlobal}/100` : '—'}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-500">Séances</div>
          <div className="mt-2 text-2xl font-bold">{safeSessions.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
        <div className="text-sm font-semibold">Statut clinique</div>

        <div className="flex flex-wrap gap-2">
          {hasExpression ? (
            <ClinicalStatusBadge
              label={savedExpression?.is_locked ? 'Bilan verrouillé' : 'Bilan saisi'}
              variant={savedExpression?.is_locked ? 'validated' : 'draft'}
            />
          ) : (
            <ClinicalStatusBadge
              label="Bilan automatique"
              variant="automatic"
            />
          )}

          {safeGoals.length > 0 ? (
            <ClinicalStatusBadge
              label={goalsLocked ? 'Objectifs verrouillés' : 'Objectifs saisis'}
              variant={goalsLocked ? 'validated' : 'draft'}
            />
          ) : (
            <ClinicalStatusBadge
              label="Objectifs automatiques"
              variant="automatic"
            />
          )}

          {activeMatrix ? (
            <ClinicalStatusBadge
              label={activeMatrix.is_locked ? 'Matrice active verrouillée' : 'Matrice active'}
              variant={activeMatrix.is_locked ? 'validated' : 'active'}
            />
          ) : (
            <ClinicalStatusBadge
              label="Matrice automatique"
              variant="automatic"
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">Bilan expressionnel</div>
        <p className="text-sm text-neutral-600">
          {savedExpression?.expression_summary ?? 'Aucun bilan enregistré.'}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">Dernières séances</div>

        {safeSessions.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune séance enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {safeSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-neutral-200 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    Séance {session.session_number ?? '—'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(session.created_at)}
                  </div>
                </div>

                <div className="mt-2 text-sm text-neutral-600">
                  Global : {computeGlobal(session) !== null ? `${computeGlobal(session)}/100` : '—'}
                </div>

                {session.notes ? (
                  <div className="mt-2 text-sm text-neutral-500 line-clamp-3">
                    {session.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Link
          href={`/patients/${id}`}
          className="block rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-center text-sm font-medium text-neutral-900"
        >
          Ouvrir la fiche complète
        </Link>

        <Link
          href={`/patients/${id}/pdf`}
          className="block rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-center text-sm font-medium text-neutral-900"
        >
          Ouvrir le PDF premium
        </Link>
      </div>
    </main>
  )
}