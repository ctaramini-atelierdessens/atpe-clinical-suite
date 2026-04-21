import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'
import { ReportingPdfDownloadButton } from '@/components/reporting-pdf-download-button'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type SessionRow = {
  id: string
  patient_id?: string | null
  organization_id?: string | null
  created_at?: string | null
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
  global_score?: number | null
}

type PatientRow = {
  id: string
  code?: string | null
  initials?: string | null
  sex?: string | null
  birth_year?: number | null
  archived_at?: string | null
}

type ExpressionAssessmentRow = {
  id: string
  patient_id?: string | null
  is_locked?: boolean | null
  validated_at?: string | null
}

type GoalRow = {
  id: string
  patient_id?: string | null
  time_horizon?: string | null
  is_locked?: boolean | null
  validated_at?: string | null
}

type MatrixVersionRow = {
  id: string
  patient_id?: string | null
  is_active?: boolean | null
  is_locked?: boolean | null
  validated_at?: string | null
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

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR')
}

function getPatientLatestSessionMap(sessions: SessionRow[]) {
  const map = new Map<string, SessionRow>()

  for (const session of sessions) {
    if (!session.patient_id) continue

    const current = map.get(session.patient_id)
    const currentDate = current?.created_at
      ? new Date(current.created_at).getTime()
      : 0
    const candidateDate = session.created_at
      ? new Date(session.created_at).getTime()
      : 0

    if (!current || candidateDate > currentDate) {
      map.set(session.patient_id, session)
    }
  }

  return map
}

function getPatientSessionGroups(sessions: SessionRow[]) {
  const map = new Map<string, SessionRow[]>()

  for (const session of sessions) {
    if (!session.patient_id) continue
    const list = map.get(session.patient_id) ?? []
    list.push(session)
    map.set(session.patient_id, list)
  }

  return map
}

function computeTrendLabel(values: number[]) {
  if (values.length < 2) return 'Première évaluation'
  const delta = values[0] - values[values.length - 1]
  if (delta >= 10) return 'Amélioration nette'
  if (delta >= 4) return 'Amélioration'
  if (delta <= -10) return 'Régression nette'
  if (delta <= -4) return 'Fragilisation'
  return 'Stable'
}

function getExpressionMap(items: ExpressionAssessmentRow[]) {
  const map = new Map<string, ExpressionAssessmentRow>()
  for (const item of items) {
    if (item.patient_id) {
      map.set(item.patient_id, item)
    }
  }
  return map
}

function getGoalsMap(items: GoalRow[]) {
  const map = new Map<string, GoalRow[]>()
  for (const item of items) {
    if (!item.patient_id) continue
    const list = map.get(item.patient_id) ?? []
    list.push(item)
    map.set(item.patient_id, list)
  }
  return map
}

function getActiveMatrixMap(items: MatrixVersionRow[]) {
  const map = new Map<string, MatrixVersionRow>()
  for (const item of items) {
    if (item.patient_id && item.is_active) {
      map.set(item.patient_id, item)
    }
  }
  return map
}

function horizonCount(goals: GoalRow[], horizon: string) {
  return goals.filter((goal) => goal.time_horizon === horizon).length
}

export default async function ReportingPage() {
  const { supabase, organization } = await getAppContext()

  if (!organization?.id) {
    redirect('/patients')
  }

  const [
    { data: patients, error: patientsError },
    { data: sessions, error: sessionsError },
    { data: expressionAssessments, error: expressionError },
    { data: goals, error: goalsError },
    { data: matrixVersions, error: matrixError },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*')
      .eq('organization_id', organization.id)
      .order('code', { ascending: true }),

    supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('patient_expression_assessments')
      .select('*')
      .eq('organization_id', organization.id),

    supabase
      .from('patient_goals')
      .select('*')
      .eq('organization_id', organization.id)
      .order('time_horizon', { ascending: true })
      .order('position', { ascending: true }),

    supabase
      .from('patient_diagnostic_matrix_versions')
      .select('*')
      .eq('organization_id', organization.id),
  ])

  const safePatients =
    patientsError || !Array.isArray(patients) ? [] : (patients as PatientRow[])

  const safeSessions =
    sessionsError || !Array.isArray(sessions) ? [] : (sessions as SessionRow[])

  const safeExpressionAssessments =
    expressionError || !Array.isArray(expressionAssessments)
      ? []
      : (expressionAssessments as ExpressionAssessmentRow[])

  const safeGoals =
    goalsError || !Array.isArray(goals) ? [] : (goals as GoalRow[])

  const safeMatrixVersions =
    matrixError || !Array.isArray(matrixVersions)
      ? []
      : (matrixVersions as MatrixVersionRow[])

  const latestSessionMap = getPatientLatestSessionMap(safeSessions)
  const patientGroups = getPatientSessionGroups(safeSessions)
  const expressionMap = getExpressionMap(safeExpressionAssessments)
  const goalsMap = getGoalsMap(safeGoals)
  const activeMatrixMap = getActiveMatrixMap(safeMatrixVersions)

  const activePatients = safePatients.filter((patient) => !patient.archived_at)

  const latestGlobals = Array.from(latestSessionMap.values())
    .map(computeGlobal)
    .filter((v): v is number => typeof v === 'number')

  const averageLatestGlobal = average(latestGlobals)

  const fragilePatients = activePatients.filter((patient) => {
    const latest = latestSessionMap.get(patient.id)
    const score = latest ? computeGlobal(latest) : null
    return score !== null && score < 40
  })

  const patientsWithValidatedExpression = activePatients.filter((patient) => {
    const item = expressionMap.get(patient.id)
    return Boolean(item?.is_locked || item?.validated_at)
  })

  const patientsWithGoals = activePatients.filter((patient) => {
    const list = goalsMap.get(patient.id) ?? []
    return list.length > 0
  })

  const patientsWithLockedGoals = activePatients.filter((patient) => {
    const list = goalsMap.get(patient.id) ?? []
    return list.length > 0 && list.every((goal) => Boolean(goal.is_locked))
  })

  const patientsWithActiveMatrix = activePatients.filter((patient) =>
    activeMatrixMap.has(patient.id),
  )

  const patientsWithLockedMatrix = activePatients.filter((patient) => {
    const matrix = activeMatrixMap.get(patient.id)
    return Boolean(matrix?.is_locked)
  })

  const patientRows = activePatients.map((patient) => {
    const patientSessions = (patientGroups.get(patient.id) ?? []).sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })

    const values = patientSessions
      .map(computeGlobal)
      .filter((v): v is number => typeof v === 'number')

    const latestGlobal = values[0] ?? null
    const trend = computeTrendLabel(values)

    const expression = expressionMap.get(patient.id) ?? null
    const patientGoals = goalsMap.get(patient.id) ?? []
    const matrix = activeMatrixMap.get(patient.id) ?? null

    return {
      patient,
      sessionCount: patientSessions.length,
      latestGlobal,
      trend,
      lastSessionDate: patientSessions[0]?.created_at ?? null,
      hasValidatedExpression: Boolean(expression?.is_locked || expression?.validated_at),
      hasGoals: patientGoals.length > 0,
      goalsLocked: patientGoals.length > 0 && patientGoals.every((goal) => Boolean(goal.is_locked)),
      goalsCourt: horizonCount(patientGoals, 'court'),
      goalsMoyen: horizonCount(patientGoals, 'moyen'),
      goalsLong: horizonCount(patientGoals, 'long'),
      hasActiveMatrix: Boolean(matrix),
      matrixLocked: Boolean(matrix?.is_locked),
    }
  })

  const allGoals = safeGoals
  const totalCourtGoals = horizonCount(allGoals, 'court')
  const totalMoyenGoals = horizonCount(allGoals, 'moyen')
  const totalLongGoals = horizonCount(allGoals, 'long')

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Direction / reporting multi-patients</h1>
          <p className="text-sm text-neutral-600">
            Vue agrégée clinique, institutionnelle et de validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/patients"
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
          >
            Retour aux patients
          </Link>

          <ReportingPdfDownloadButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Patients actifs</div>
          <div className="mt-2 text-3xl font-bold">{activePatients.length}</div>
          <div className="mt-2 text-sm text-neutral-600">
            Dossiers suivis actuellement
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Moyenne globale récente</div>
          <div className="mt-2 text-3xl font-bold">
            {averageLatestGlobal !== null ? `${averageLatestGlobal}/100` : '—'}
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            Dernière lecture clinique agrégée
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Patients fragiles</div>
          <div className="mt-2 text-3xl font-bold">{fragilePatients.length}</div>
          <div className="mt-2 text-sm text-neutral-600">
            Score global récent &lt; 40
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Séances enregistrées</div>
          <div className="mt-2 text-3xl font-bold">{safeSessions.length}</div>
          <div className="mt-2 text-sm text-neutral-600">
            Historique clinique total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Validation clinique</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Bilans expressionnels validés</span>
              <span className="font-semibold">
                {patientsWithValidatedExpression.length}/{activePatients.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Patients avec objectifs</span>
              <span className="font-semibold">
                {patientsWithGoals.length}/{activePatients.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Objectifs verrouillés</span>
              <span className="font-semibold">
                {patientsWithLockedGoals.length}/{activePatients.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Matrices actives</span>
              <span className="font-semibold">
                {patientsWithActiveMatrix.length}/{activePatients.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Matrices verrouillées</span>
              <span className="font-semibold">
                {patientsWithLockedMatrix.length}/{activePatients.length}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Objectifs par horizon</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Court terme</span>
              <span className="font-semibold">{totalCourtGoals}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Moyen terme</span>
              <span className="font-semibold">{totalMoyenGoals}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Long terme</span>
              <span className="font-semibold">{totalLongGoals}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Lecture direction</h2>
          <p className="text-sm leading-6 text-neutral-700">
            L’organisation suit actuellement {activePatients.length} patient(s).
            {fragilePatients.length > 0
              ? ` ${fragilePatients.length} situation(s) présentent une fragilité clinique récente.`
              : ' Aucune fragilité globale majeure n’est actuellement repérée.'}{' '}
            Les validations cliniques progressent avec{' '}
            {patientsWithValidatedExpression.length} bilan(s) expressionnel(s)
            validé(s), {patientsWithLockedGoals.length} dossier(s) avec objectifs
            verrouillés et {patientsWithLockedMatrix.length} matrice(s)
            diagnostique(s) verrouillée(s).
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Tableau de bord multi-patients</h2>
            <p className="text-sm text-neutral-500">
              Vue consolidée patient / validation / suivi
            </p>
          </div>
        </div>

        {patientRows.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucune donnée patient disponible.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Séances</th>
                  <th className="px-3 py-2">Dernier global</th>
                  <th className="px-3 py-2">Tendance</th>
                  <th className="px-3 py-2">Bilan expressionnel</th>
                  <th className="px-3 py-2">Objectifs</th>
                  <th className="px-3 py-2">Matrice</th>
                  <th className="px-3 py-2">Dernière séance</th>
                  <th className="px-3 py-2">Accès</th>
                </tr>
              </thead>
              <tbody>
                {patientRows.map((row) => (
                  <tr key={row.patient.id} className="border-b align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium">{row.patient.code ?? '—'}</div>
                      <div className="text-neutral-500">
                        {row.patient.initials ?? '—'}
                      </div>
                    </td>

                    <td className="px-3 py-3">{row.sessionCount}</td>

                    <td className="px-3 py-3">
                      {row.latestGlobal !== null ? `${row.latestGlobal}/100` : '—'}
                    </td>

                    <td className="px-3 py-3">{row.trend}</td>

                    <td className="px-3 py-3">
                      {row.hasValidatedExpression ? (
                        <ClinicalStatusBadge
                          label="Validé"
                          variant="validated"
                        />
                      ) : (
                        <ClinicalStatusBadge
                          label="Automatique"
                          variant="automatic"
                        />
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        {row.hasGoals ? (
                          <>
                            {row.goalsLocked ? (
                              <ClinicalStatusBadge
                                label="Verrouillés"
                                variant="validated"
                              />
                            ) : (
                              <ClinicalStatusBadge
                                label="Enregistrés"
                                variant="draft"
                              />
                            )}

                            <div className="text-xs text-neutral-500">
                              C:{row.goalsCourt} / M:{row.goalsMoyen} / L:{row.goalsLong}
                            </div>
                          </>
                        ) : (
                          <ClinicalStatusBadge
                            label="Aucun"
                            variant="neutral"
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      {row.hasActiveMatrix ? (
                        row.matrixLocked ? (
                          <div className="flex flex-col gap-1">
                            <ClinicalStatusBadge
                              label="Active"
                              variant="active"
                            />
                            <ClinicalStatusBadge
                              label="Verrouillée"
                              variant="validated"
                            />
                          </div>
                        ) : (
                          <ClinicalStatusBadge
                            label="Active"
                            variant="active"
                          />
                        )
                      ) : (
                        <ClinicalStatusBadge
                          label="Automatique"
                          variant="automatic"
                        />
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {formatDate(row.lastSessionDate)}
                    </td>

                    <td className="px-3 py-3">
                      <Link
                        href={`/patients/${row.patient.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}