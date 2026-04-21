import { notFound } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'

import { ClinicalStatusBadge } from '@/components/clinical-status-badge'
import { PatientExpertV2Card } from '@/components/patient-expert-v2-card'
import { PatientRadar } from '@/components/patient-radar'
import { PatientGlobalEvolutionCard } from '@/components/patient-global-evolution-card'
import { PatientLongitudinalInsights } from '@/components/patient-longitudinal-insights'
import { PatientDimensionalInsights } from '@/components/patient-dimensional-insights'
import { PatientDimensionalRecommendations } from '@/components/patient-dimensional-recommendations'
import { PatientTherapeuticPlan } from '@/components/patient-therapeutic-plan'
import { PatientSupervisionIntelligent } from '@/components/patient-supervision-intelligent'
import { PatientInstitutionalSummary } from '@/components/patient-institutional-summary'
import { PatientExpressionalSummary } from '@/components/patient-expressional-summary'
import { PatientExpressionalSummaryVersionView } from '@/components/patient-expressional-summary-version-view'
import { PatientGoalsVersionView } from '@/components/patient-goals-version-view'
import { PatientInitialDiagnosticMatrix } from '@/components/patient-initial-diagnostic-matrix'
import { PatientDiagnosticMatrixVersionView } from '@/components/patient-diagnostic-matrix-version-view'

type PageProps = {
  params: Promise<{ id: string }>
}

type MatrixVersionRow = {
  id: string
  title?: string | null
  status?: string | null
  is_active?: boolean | null
  version_number?: number | null
  notes?: string | null
  is_locked?: boolean | null
  validated_at?: string | null
  validated_by?: string | null
  validation_note?: string | null
}

type MatrixRow = {
  id: string
  matrix_version_id: string
  dimension?: string | null
  priority?: string | null
  position?: number | null
  initial_finding?: string | null
  short_objective?: string | null
  short_subobjectives?: string | null
  medium_objective?: string | null
  medium_subobjectives?: string | null
  long_objective?: string | null
  long_subobjectives?: string | null
}

type ExpressionAssessmentRow = {
  expression_summary?: string | null
  expression_profile?: string | null
  preferred_mediations?: string | null
  vigilance_points?: string | null
  clinician_notes?: string | null
  is_locked?: boolean | null
  validated_at?: string | null
  validated_by?: string | null
  validation_note?: string | null
}

type GoalRow = {
  id: string
  dimension?: string | null
  priority?: string | null
  time_horizon?: string | null
  objective_text?: string | null
  position?: number | null
  is_locked?: boolean | null
  validated_at?: string | null
  validated_by?: string | null
}

type SubitemRow = {
  id: string
  goal_id: string
  text?: string | null
  position?: number | null
  is_completed?: boolean | null
}

function todayLabel() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date())
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-FR')
}

function hasSavedExpressionData(
  assessment: ExpressionAssessmentRow | null,
): boolean {
  if (!assessment) return false

  return Boolean(
    assessment.expression_summary ||
      assessment.expression_profile ||
      assessment.preferred_mediations ||
      assessment.vigilance_points ||
      assessment.clinician_notes,
  )
}

export default async function PatientPdfPage({ params }: PageProps) {
  const { id } = await params
  const { supabase, organization, user } = await getAppContext()

  if (!organization?.id) {
    notFound()
  }

  const [
    { data: patient },
    { data: sessions },
    { data: activeMatrixVersion },
    { data: expressionAssessment },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organization.id)
      .maybeSingle(),

    supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', id)
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('patient_diagnostic_matrix_versions')
      .select('*')
      .eq('patient_id', id)
      .eq('is_active', true)
      .maybeSingle(),

    supabase
      .from('patient_expression_assessments')
      .select('*')
      .eq('patient_id', id)
      .maybeSingle(),

    supabase
      .from('patient_goals')
      .select('*')
      .eq('patient_id', id)
      .order('time_horizon', { ascending: true })
      .order('position', { ascending: true }),
  ])

  if (!patient) {
    notFound()
  }

  const safeSessions = Array.isArray(sessions) ? sessions : []
  const activeVersion =
    (activeMatrixVersion as MatrixVersionRow | null) ?? null
  const savedExpression =
    (expressionAssessment as ExpressionAssessmentRow | null) ?? null
  const savedGoals = Array.isArray(goals) ? (goals as GoalRow[]) : []

  let activeVersionRows: MatrixRow[] = []

  if (activeVersion?.id) {
    const { data: rows } = await supabase
      .from('patient_diagnostic_matrix_rows')
      .select('*')
      .eq('matrix_version_id', activeVersion.id)
      .order('position', { ascending: true })

    activeVersionRows = Array.isArray(rows) ? (rows as MatrixRow[]) : []
  }

  const goalIds = savedGoals.map((goal) => goal.id)

  const { data: goalSubitems } =
    goalIds.length > 0
      ? await supabase
          .from('patient_goal_subitems')
          .select('*')
          .in('goal_id', goalIds)
          .order('position', { ascending: true })
      : { data: [] }

  const safeGoalSubitems = Array.isArray(goalSubitems)
    ? (goalSubitems as SubitemRow[])
    : []

  const subitemsByGoalId = safeGoalSubitems.reduce<Record<string, SubitemRow[]>>(
    (acc, item) => {
      if (!acc[item.goal_id]) {
        acc[item.goal_id] = []
      }
      acc[item.goal_id].push(item)
      return acc
    },
    {},
  )

  const hasSavedExpression = hasSavedExpressionData(savedExpression)
  const hasSavedGoals = savedGoals.length > 0
  const goalsLocked =
    savedGoals.length > 0 ? savedGoals.every((goal) => Boolean(goal.is_locked)) : false
  const goalsValidatedAt =
    savedGoals.length > 0 ? savedGoals[0]?.validated_at ?? null : null
  const goalsValidatedBy =
    savedGoals.length > 0 ? savedGoals[0]?.validated_by ?? null : null

  return (
    <main className="pdf-premium mx-auto max-w-5xl space-y-8 bg-white px-10 py-10 text-black print:max-w-none print:px-0 print:py-0">
      <section className="rounded-2xl border border-neutral-300 px-8 py-8">
        <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Rapport clinique institutionnel premium
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Synthèse clinique ATPE
            </h1>
            <p className="text-sm text-neutral-600">
              Document de travail pour réunion clinique, supervision et coordination institutionnelle
            </p>
          </div>

          <div className="min-w-[220px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
            <div className="font-semibold text-neutral-900">
              {organization.name ?? 'Structure clinique'}
            </div>
            <div className="mt-2 text-neutral-600">
              Date de génération : {todayLabel()}
            </div>
            <div className="text-neutral-600">
              Référent export : {user?.email ?? '—'}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Code patient
            </div>
            <div className="mt-1 text-lg font-semibold">
              {patient.code ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Initiales
            </div>
            <div className="mt-1 text-lg font-semibold">
              {patient.initials ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Année de naissance
            </div>
            <div className="mt-1 text-lg font-semibold">
              {patient.birth_year ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Sexe
            </div>
            <div className="mt-1 text-lg font-semibold">
              {patient.sex ?? '—'}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-300 p-6">
        <h2 className="mb-4 text-xl font-bold">Résumé exécutif</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Patient</div>
            <div className="mt-1 font-medium">
              {patient.code ?? '—'} — {patient.initials ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Séances analysées</div>
            <div className="mt-1 font-medium">{safeSessions.length}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Cadre</div>
            <div className="mt-1 font-medium">
              Rapport clinique premium pour supervision et coordination
            </div>
          </div>
        </div>
      </section>

      <section className="pdf-section space-y-6">
        <div className="pdf-section-title">Profil clinique</div>
        <PatientExpertV2Card patientId={id} />
        <PatientRadar
          emotion={safeSessions[0]?.emotion}
          corps={safeSessions[0]?.corps}
          conscience={safeSessions[0]?.conscience}
          dynamique={safeSessions[0]?.dynamique}
          symbolique={safeSessions[0]?.symbolique}
        />
      </section>

      <section className="pdf-section space-y-6">
        <div className="pdf-section-title">Évolution clinique</div>
        <PatientGlobalEvolutionCard sessions={safeSessions} />
        <PatientLongitudinalInsights sessions={safeSessions} />
        <PatientDimensionalInsights sessions={safeSessions} />
      </section>

      <section className="pdf-section space-y-4">
        <div className="pdf-section-title">Lecture décisionnelle</div>

        <div className="flex flex-wrap items-center gap-2">
          {hasSavedGoals ? (
            <ClinicalStatusBadge
              label="Version validée"
              variant="validated"
            />
          ) : (
            <ClinicalStatusBadge
              label="Version automatique"
              variant="automatic"
            />
          )}

          {goalsLocked ? (
            <ClinicalStatusBadge
              label="Verrouillé"
              variant="active"
            />
          ) : null}
        </div>

        {hasSavedGoals ? (
          <>
            <PatientGoalsVersionView
              goals={savedGoals}
              subitemsByGoalId={subitemsByGoalId}
            />

            <div className="rounded-xl border border-neutral-200 p-4 text-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-neutral-500">Statut</div>
                  <div className="font-medium">
                    {goalsLocked
                      ? 'Version validée et verrouillée'
                      : 'Version enregistrée modifiable'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Date de validation</div>
                  <div className="font-medium">{formatDateTime(goalsValidatedAt)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Validé par</div>
                  <div className="font-medium">{goalsValidatedBy ?? '—'}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <PatientDimensionalRecommendations sessions={safeSessions} />
            <PatientTherapeuticPlan sessions={safeSessions} />
          </>
        )}
      </section>

      <section className="pdf-section space-y-4">
        <div className="pdf-section-title">Supervision et institution</div>

        <PatientSupervisionIntelligent sessions={safeSessions} />
        <PatientInstitutionalSummary sessions={safeSessions} />

        <div className="flex flex-wrap items-center gap-2">
          {hasSavedExpression ? (
            <ClinicalStatusBadge
              label="Version validée"
              variant="validated"
            />
          ) : (
            <ClinicalStatusBadge
              label="Version automatique"
              variant="automatic"
            />
          )}

          {savedExpression?.is_locked ? (
            <ClinicalStatusBadge
              label="Verrouillé"
              variant="active"
            />
          ) : null}
        </div>

        {hasSavedExpression ? (
          <>
            <PatientExpressionalSummaryVersionView
              assessment={savedExpression as ExpressionAssessmentRow}
            />

            <div className="rounded-xl border border-neutral-200 p-4 text-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-neutral-500">Statut</div>
                  <div className="font-medium">
                    {savedExpression?.is_locked
                      ? 'Version validée et verrouillée'
                      : 'Version enregistrée modifiable'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Date de validation</div>
                  <div className="font-medium">
                    {formatDateTime(savedExpression?.validated_at ?? null)}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Validé par</div>
                  <div className="font-medium">
                    {savedExpression?.validated_by ?? '—'}
                  </div>
                </div>
              </div>

              {savedExpression?.validation_note ? (
                <div className="mt-4">
                  <div className="text-neutral-500">Note de validation</div>
                  <div className="mt-1 font-medium">
                    {savedExpression.validation_note}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <PatientExpressionalSummary sessions={safeSessions} />
        )}
      </section>

      <section className="pdf-section space-y-4">
        <div className="pdf-section-title">Diagnostic initial structuré</div>

        <div className="flex flex-wrap items-center gap-2">
          {activeVersion ? (
            <>
              <ClinicalStatusBadge
                label="Version validée"
                variant="validated"
              />
              <ClinicalStatusBadge
                label="Version active"
                variant="active"
              />
              {activeVersion.is_locked ? (
                <ClinicalStatusBadge
                  label="Verrouillé"
                  variant="active"
                />
              ) : null}
            </>
          ) : (
            <ClinicalStatusBadge
              label="Version automatique"
              variant="automatic"
            />
          )}
        </div>

        {activeVersion ? (
          <>
            <PatientDiagnosticMatrixVersionView
              version={activeVersion}
              rows={activeVersionRows}
            />

            <div className="rounded-xl border border-neutral-200 p-4 text-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-neutral-500">Statut</div>
                  <div className="font-medium">
                    {activeVersion.is_locked
                      ? 'Version validée et verrouillée'
                      : 'Version active modifiable'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Date de validation</div>
                  <div className="font-medium">
                    {formatDateTime(activeVersion.validated_at ?? null)}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Validé par</div>
                  <div className="font-medium">
                    {activeVersion.validated_by ?? '—'}
                  </div>
                </div>
              </div>

              {activeVersion.validation_note ? (
                <div className="mt-4">
                  <div className="text-neutral-500">Note de validation</div>
                  <div className="mt-1 font-medium">
                    {activeVersion.validation_note}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <PatientInitialDiagnosticMatrix sessions={safeSessions} />
        )}
      </section>

      <footer className="rounded-2xl border border-neutral-300 px-8 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-neutral-800">
              Signature clinique
            </div>
            <div className="mt-3 h-16 rounded-lg border border-dashed border-neutral-300" />
            <div className="mt-2 text-xs text-neutral-500">
              Nom, fonction, signature
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-neutral-800">
              Mention institutionnelle
            </div>
            <p className="mt-2 text-xs leading-6 text-neutral-600">
              Ce document constitue une synthèse clinique de travail destinée à
              la concertation professionnelle, à la supervision et à la coordination
              de l’accompagnement. Son usage doit rester inscrit dans le cadre
              institutionnel, éthique et confidentiel de la prise en charge.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}