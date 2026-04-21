import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PatientAtpeClinicalSummary } from '@/components/patient-atpe-clinical-summary'
import { PatientAtpeDashboard } from '@/components/patient-atpe-dashboard'
import {
  AtpeAxisScores,
  computeAtpeCompositeScore,
} from '@/lib/atpe-composite-score'
import { analyzeAtpe } from '@/lib/atpe-expert-engine'
import { buildDashboardAlerts } from '@/lib/dashboard-alerts'
import { getProtocolFromProfile } from '@/lib/atpe-protocol-engine'
import {
  AtpePredictionPoint,
  predictAtpeTrajectory,
} from '@/lib/atpe-prediction-engine'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

type PatientRow = {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
}

type AtpeSessionRow = {
  id: string
  patient_id: string

  session_date?: string | null
  date?: string | null
  created_at?: string | null

  corps_score?: number | null
  body_score?: number | null

  emotion_score?: number | null
  emotional_score?: number | null

  conscience_score?: number | null
  awareness_score?: number | null

  relation_score?: number | null
  relational_score?: number | null

  symbolique_score?: number | null
  symbolic_score?: number | null

  internal_process_score?: number | null
  expressive_process_score?: number | null
  relational_process_score?: number | null
  pluriexpressivity_score?: number | null
  institutional_indicators_score?: number | null
  sensorial_symbolic_score?: number | null

  global_score?: number | null
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function average(values: number[]): number {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function getPatientDisplayName(patient: PatientRow | null): string {
  if (!patient) return 'Patient'
  if (patient.full_name) return patient.full_name

  const fullName = [patient.first_name, patient.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || 'Patient'
}

function getSessionDate(session: AtpeSessionRow): string {
  return (
    session.session_date ??
    session.date ??
    session.created_at ??
    new Date().toISOString()
  )
}

function normalizeCoreScores(session: AtpeSessionRow) {
  return {
    corps: safeNumber(session.corps_score ?? session.body_score),
    emotion: safeNumber(session.emotion_score ?? session.emotional_score),
    conscience: safeNumber(session.conscience_score ?? session.awareness_score),
    relation: safeNumber(session.relation_score ?? session.relational_score),
    symbolique: safeNumber(session.symbolique_score ?? session.symbolic_score),
  }
}

function normalizeAxisScores(session: AtpeSessionRow): {
  internalProcessScore: number
  expressiveProcessScore: number
  relationalProcessScore: number
  pluriexpressivityScore: number
  institutionalIndicatorsScore: number
  sensorialSymbolicScore: number
} {
  const core = normalizeCoreScores(session)

  const internalProcess =
    typeof session.internal_process_score === 'number'
      ? session.internal_process_score
      : average([core.corps, core.emotion, core.conscience])

  const expressiveProcess =
    typeof session.expressive_process_score === 'number'
      ? session.expressive_process_score
      : average([core.emotion, core.symbolique])

  const relationalProcess =
    typeof session.relational_process_score === 'number'
      ? session.relational_process_score
      : average([core.relation, core.conscience])

  const pluriexpressivity =
    typeof session.pluriexpressivity_score === 'number'
      ? session.pluriexpressivity_score
      : average([core.symbolique, core.emotion, core.relation])

  const institutionalIndicators =
    typeof session.institutional_indicators_score === 'number'
      ? session.institutional_indicators_score
      : average([core.relation, core.conscience])

  const sensorialSymbolic =
    typeof session.sensorial_symbolic_score === 'number'
      ? session.sensorial_symbolic_score
      : average([core.corps, core.symbolique])

  return {
    internalProcessScore: safeNumber(internalProcess),
    expressiveProcessScore: safeNumber(expressiveProcess),
    relationalProcessScore: safeNumber(relationalProcess),
    pluriexpressivityScore: safeNumber(pluriexpressivity),
    institutionalIndicatorsScore: safeNumber(institutionalIndicators),
    sensorialSymbolicScore: safeNumber(sensorialSymbolic),
  }
}

function computeGlobalScore(session: AtpeSessionRow): number {
  if (typeof session.global_score === 'number' && Number.isFinite(session.global_score)) {
    return Math.round(session.global_score)
  }

  const axes = normalizeAxisScores(session)

  return average([
    axes.internalProcessScore,
    axes.expressiveProcessScore,
    axes.relationalProcessScore,
    axes.pluriexpressivityScore,
    axes.institutionalIndicatorsScore,
    axes.sensorialSymbolicScore,
  ])
}

function toCompositeAxisScores(axisScores: {
  internalProcessScore: number
  expressiveProcessScore: number
  relationalProcessScore: number
  pluriexpressivityScore: number
  institutionalIndicatorsScore: number
  sensorialSymbolicScore: number
}): AtpeAxisScores {
  return {
    internalProcess: axisScores.internalProcessScore,
    expressiveProcess: axisScores.expressiveProcessScore,
    relationalProcess: axisScores.relationalProcessScore,
    pluriexpressivity: axisScores.pluriexpressivityScore,
    institutionalIndicators: axisScores.institutionalIndicatorsScore,
    sensorialSymbolic: axisScores.sensorialSymbolicScore,
  }
}

async function getPatient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string
) {
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, full_name')
    .eq('id', patientId)
    .maybeSingle<PatientRow>()

  if (error) {
    console.error('Erreur récupération patient:', error)
    return null
  }

  return data
}

async function getAtpeSessions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string
): Promise<AtpeSessionRow[]> {
  const { data, error } = await supabase
    .from('atpe_sessions')
    .select(
      `
        id,
        patient_id,
        session_date,
        date,
        created_at,
        corps_score,
        body_score,
        emotion_score,
        emotional_score,
        conscience_score,
        awareness_score,
        relation_score,
        relational_score,
        symbolique_score,
        symbolic_score,
        internal_process_score,
        expressive_process_score,
        relational_process_score,
        pluriexpressivity_score,
        institutional_indicators_score,
        sensorial_symbolic_score,
        global_score
      `
    )
    .eq('patient_id', patientId)
    .order('session_date', { ascending: true, nullsFirst: false })
    .order('date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true, nullsFirst: false })
    .returns<AtpeSessionRow[]>()

  if (error) {
    console.error('Erreur récupération séances ATPE:', error)
    return []
  }

  return data ?? []
}

export default async function PatientAtpePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const patient = await getPatient(supabase, id)

  if (!patient) {
    notFound()
  }

  const sessions = await getAtpeSessions(supabase, id)
  const latestSession = sessions.at(-1)
  const patientName = getPatientDisplayName(patient)

  if (!latestSession) {
    return (
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2">
              <Link
                href={`/patients/${id}`}
                className="text-sm text-slate-500 transition hover:text-slate-700"
              >
                ← Retour au dossier patient
              </Link>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              ATPE — {patientName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Analyse clinique, synthèse, protocole, guidage et trajectoire longitudinale
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Aucune séance ATPE disponible
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Le résumé clinique et le tableau de bord ATPE s’afficheront automatiquement
            dès qu’une première séance aura été enregistrée pour ce patient.
          </p>
        </section>
      </main>
    )
  }

  const latestCoreScores = normalizeCoreScores(latestSession)

  const analysis = analyzeAtpe({
    corps: latestCoreScores.corps,
    emotion: latestCoreScores.emotion,
    conscience: latestCoreScores.conscience,
    relation: latestCoreScores.relation,
    symbolique: latestCoreScores.symbolique,
  })

  const latestAxisScores = normalizeAxisScores(latestSession)
  const compositeAxisScores = toCompositeAxisScores(latestAxisScores)
  const composite = computeAtpeCompositeScore(compositeAxisScores)
  const protocol = getProtocolFromProfile(analysis.profile)

  const dashboardSessions: AtpePredictionPoint[] = sessions.map((session) => {
    const axisScores = normalizeAxisScores(session)

    return {
      date: getSessionDate(session),
      globalScore: computeGlobalScore(session),
      internalProcess: axisScores.internalProcessScore,
      expressiveProcess: axisScores.expressiveProcessScore,
      relationalProcess: axisScores.relationalProcessScore,
      pluriexpressivity: axisScores.pluriexpressivityScore,
      institutionalIndicators: axisScores.institutionalIndicatorsScore,
      sensorialSymbolic: axisScores.sensorialSymbolicScore,
    }
  })

  const prediction = predictAtpeTrajectory(dashboardSessions)

  const alerts = buildDashboardAlerts({
    profile: analysis.profile,
    composite,
    prediction,
    axisScores: compositeAxisScores,
    sessionsCount: dashboardSessions.length,
  })

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2">
            <Link
              href={`/patients/${id}`}
              className="text-sm text-slate-500 transition hover:text-slate-700"
            >
              ← Retour au dossier patient
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            ATPE — {patientName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyse clinique, synthèse exportable, alertes, protocole et trajectoire longitudinale
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          {dashboardSessions.length} séance{dashboardSessions.length > 1 ? 's' : ''}
        </div>
      </div>

      <PatientAtpeClinicalSummary
        patientName={patientName}
        profile={analysis.profile}
        composite={composite}
        prediction={prediction}
        protocol={protocol}
        alerts={alerts}
        sessionsCount={dashboardSessions.length}
        sessionDateLabel={dashboardSessions.at(-1)?.date ?? null}
      />

      <PatientAtpeDashboard
        data={{
          analysisProfile: analysis.profile,
          internalProcessScore: latestAxisScores.internalProcessScore,
          expressiveProcessScore: latestAxisScores.expressiveProcessScore,
          relationalProcessScore: latestAxisScores.relationalProcessScore,
          pluriexpressivityScore: latestAxisScores.pluriexpressivityScore,
          institutionalIndicatorsScore: latestAxisScores.institutionalIndicatorsScore,
          sensorialSymbolicScore: latestAxisScores.sensorialSymbolicScore,
          sessions: dashboardSessions.map((session) => ({
            date: session.date,
            global_score: session.globalScore,
            internal_process_score: session.internalProcess,
            expressive_process_score: session.expressiveProcess,
            relational_process_score: session.relationalProcess,
            pluriexpressivity_score: session.pluriexpressivity,
            institutional_indicators_score: session.institutionalIndicators,
            sensorial_symbolic_score: session.sensorialSymbolic,
          })),
        }}
      />
    </main>
  )
}