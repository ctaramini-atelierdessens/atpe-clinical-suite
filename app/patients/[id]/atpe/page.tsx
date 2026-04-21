import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PatientAtpeActionsBar } from '@/components/patient-atpe-actions-bar'
import { PatientAtpeClinicalSummary } from '@/components/patient-atpe-clinical-summary'
import { PatientAtpeClinicalSummaryExport } from '@/components/patient-atpe-clinical-summary-export'
import { PatientAtpeDashboard } from '@/components/patient-atpe-dashboard'
import { PatientAtpeVersionCompare } from '@/components/patient-atpe-version-compare'
import { PatientAtpeVersionHistory } from '@/components/patient-atpe-version-history'
import {
  AtpeAxisScores,
  computeAtpeCompositeScore,
} from '@/lib/atpe-composite-score'
import { buildAtpeClinicalSummaryExport } from '@/lib/atpe-clinical-summary-export'
import { analyzeAtpe } from '@/lib/atpe-expert-engine'
import { buildDashboardAlerts } from '@/lib/dashboard-alerts'
import { getProtocolFromProfile } from '@/lib/atpe-protocol-engine'
import {
  AtpePredictionPoint,
  predictAtpeTrajectory,
} from '@/lib/atpe-prediction-engine'
import {
  AtpeSessionVersionRecord,
  AtpeVersionSnapshot,
  buildVersionPayload,
} from '@/lib/atpe-versioning'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    base?: string
    target?: string
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

  const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim()
  return fullName || 'Patient'
}

function getSessionDate(session: AtpeSessionRow): string {
  return session.session_date ?? session.date ?? session.created_at ?? new Date().toISOString()
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

function normalizeAxisScores(session: AtpeSessionRow) {
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

async function getAtpeVersions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string
): Promise<AtpeSessionVersionRecord[]> {
  const { data, error } = await supabase
    .from('atpe_session_versions')
    .select('*')
    .eq('patient_id', patientId)
    .order('version_number', { ascending: false })
    .returns<AtpeSessionVersionRecord[]>()

  if (error) {
    console.error('Erreur récupération versions ATPE:', error)
    return []
  }

  return data ?? []
}

export default async function PatientAtpePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
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

            <h1 className="text-2xl font-semibold text-slate-900">ATPE — {patientName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Analyse clinique, synthèse exportable, alertes, protocole et trajectoire longitudinale
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Aucune séance ATPE disponible
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Le versionnage clinique s’activera dès qu’une première séance aura été enregistrée.
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

  const summaryText = buildAtpeClinicalSummaryExport({
    patientName,
    profile: analysis.profile,
    composite,
    prediction,
    protocol,
    alerts,
    sessionsCount: dashboardSessions.length,
    sessionDateLabel: dashboardSessions.at(-1)?.date ?? null,
  })

  const currentSnapshot: AtpeVersionSnapshot = {
    sessionId: latestSession.id,
    patientId: id,
    sessionDate: dashboardSessions.at(-1)?.date ?? null,
    profile: analysis.profile,
    compositeScore: composite.global,
    predictionTrend: prediction.trend,
    axisScores: compositeAxisScores,
    summaryText,
    alerts: alerts.map((alert) => ({
      level: alert.level,
      title: alert.title,
      message: alert.message,
    })),
    protocol: {
      title: protocol.title,
      subtitle: protocol.subtitle,
      primaryGoals: protocol.primaryGoals,
      mediations: protocol.mediations,
    },
  }

  const versions = await getAtpeVersions(supabase, id)

  const baseVersion =
    versions.find((version) => version.id === resolvedSearchParams.base) ??
    null

  const targetVersion =
    versions.find((version) => version.id === resolvedSearchParams.target) ??
    null

  async function createVersionAction() {
    'use server'

    const supabase = await createClient()
    const { data: latestVersions } = await supabase
      .from('atpe_session_versions')
      .select('version_number')
      .eq('session_id', latestSession.id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersionNumber = (latestVersions?.[0]?.version_number ?? 0) + 1

    const payload = buildVersionPayload({
      sessionId: latestSession.id,
      patientId: id,
      versionNumber: nextVersionNumber,
      snapshot: currentSnapshot,
      signerName: null,
      lockPdf: false,
    })

    await supabase.from('atpe_session_versions').insert(payload)

    revalidatePath(`/patients/${id}/atpe`)
    redirect(`/patients/${id}/atpe`)
  }

  async function signSessionAction(formData: FormData) {
    'use server'

    const signerName = String(formData.get('signerName') ?? '').trim()
    if (!signerName) {
      redirect(`/patients/${id}/atpe`)
    }

    const supabase = await createClient()
    const { data: latestVersions } = await supabase
      .from('atpe_session_versions')
      .select('version_number')
      .eq('session_id', latestSession.id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersionNumber = (latestVersions?.[0]?.version_number ?? 0) + 1

    const payload = buildVersionPayload({
      sessionId: latestSession.id,
      patientId: id,
      versionNumber: nextVersionNumber,
      snapshot: currentSnapshot,
      signerName,
      lockPdf: true,
    })

    await supabase.from('atpe_session_versions').insert(payload)

    revalidatePath(`/patients/${id}/atpe`)
    redirect(`/patients/${id}/atpe`)
  }

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

          <h1 className="text-2xl font-semibold text-slate-900">ATPE — {patientName}</h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyse clinique, versionnage, synthèse exportable, alertes, protocole et trajectoire longitudinale
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          {dashboardSessions.length} séance{dashboardSessions.length > 1 ? 's' : ''}
        </div>
      </div>

      <PatientAtpeActionsBar patientId={id} summaryText={summaryText} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Versionnage clinique</h2>
          <p className="mt-1 text-sm text-slate-500">
            Création de snapshot, signature de séance et verrouillage PDF
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <form action={createVersionAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Créer une version
            </button>
          </form>

          <form action={signSessionAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              name="signerName"
              placeholder="Nom du clinicien signataire"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Signer la séance
            </button>
          </form>
        </div>
      </section>

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

      <PatientAtpeClinicalSummaryExport
        patientName={patientName}
        profile={analysis.profile}
        composite={composite}
        prediction={prediction}
        protocol={protocol}
        alerts={alerts}
        sessionsCount={dashboardSessions.length}
        sessionDateLabel={dashboardSessions.at(-1)?.date ?? null}
      />

      <PatientAtpeVersionHistory
        patientId={id}
        versions={versions}
        currentBaseId={resolvedSearchParams.base ?? null}
        currentTargetId={resolvedSearchParams.target ?? null}
      />

      <PatientAtpeVersionCompare
        baseVersion={baseVersion}
        targetVersion={targetVersion}
      />

      <PatientAtpeDashboard
        patientId={id}
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