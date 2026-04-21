import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AtpeAxisScores,
  axisLabel,
  computeAtpeCompositeScore,
} from '@/lib/atpe-composite-score'
import { buildAtpeClinicalSummaryExport } from '@/lib/atpe-clinical-summary-export'
import { analyzeAtpe } from '@/lib/atpe-expert-engine'
import { buildDashboardAlerts } from '@/lib/dashboard-alerts'
import { getProtocolFromProfile } from '@/lib/atpe-protocol-engine'
import {
  AtpePredictionPoint,
  predictAtpeTrajectory,
  riskLevelLabel,
  trendLabel,
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

  const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim()
  return fullName || 'Patient'
}

function getSessionDate(session: AtpeSessionRow): string {
  return session.session_date ?? session.date ?? session.created_at ?? new Date().toISOString()
}

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'Non renseignée'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(date)
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

function sectionTitle(title: string) {
  return (
    <h2 className="mb-3 border-b border-slate-300 pb-2 text-base font-semibold text-slate-900">
      {title}
    </h2>
  )
}

export default async function PatientAtpePrintPage({ params }: PageProps) {
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
      <main className="mx-auto max-w-4xl p-6 print:p-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={`/patients/${id}/atpe`}
            className="text-sm text-slate-500 transition hover:text-slate-700"
          >
            ← Retour à l’écran ATPE
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Imprimer / Exporter en PDF
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <h1 className="text-2xl font-semibold text-slate-900">
            Synthèse ATPE imprimable — {patientName}
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            Aucune séance ATPE n’est disponible pour ce patient à ce jour.
          </p>
        </section>
      </main>
    )
  }

  const latestCoreScores = normalizeCoreScores(latestSession)
  const latestAxisScores = normalizeAxisScores(latestSession)
  const compositeAxisScores = toCompositeAxisScores(latestAxisScores)

  const analysis = analyzeAtpe({
    corps: latestCoreScores.corps,
    emotion: latestCoreScores.emotion,
    conscience: latestCoreScores.conscience,
    relation: latestCoreScores.relation,
    symbolique: latestCoreScores.symbolique,
  })

  const composite = computeAtpeCompositeScore(compositeAxisScores)
  const protocol = getProtocolFromProfile(analysis.profile)

  const predictionPoints: AtpePredictionPoint[] = sessions.map((session) => {
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

  const prediction = predictAtpeTrajectory(predictionPoints)

  const alerts = buildDashboardAlerts({
    profile: analysis.profile,
    composite,
    prediction,
    axisScores: compositeAxisScores,
    sessionsCount: predictionPoints.length,
  })

  const exportText = buildAtpeClinicalSummaryExport({
    patientName,
    sessionDateLabel: formatDateLabel(predictionPoints.at(-1)?.date ?? null),
    profile: analysis.profile,
    composite,
    prediction,
    protocol,
    alerts,
    sessionsCount: predictionPoints.length,
  })

  const priorityAlerts = alerts.slice(0, 5)

  return (
    <main className="mx-auto max-w-4xl p-6 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/patients/${id}/atpe`}
          className="text-sm text-slate-500 transition hover:text-slate-700"
        >
          ← Retour à l’écran ATPE
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Imprimer / Exporter en PDF
        </button>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Synthèse clinique ATPE
          </h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-medium">Patient :</span> {patientName}
            </p>
            <p>
              <span className="font-medium">Date de référence :</span>{' '}
              {formatDateLabel(predictionPoints.at(-1)?.date ?? null)}
            </p>
            <p>
              <span className="font-medium">Nombre de séances :</span> {predictionPoints.length}
            </p>
            <p>
              <span className="font-medium">Profil clinique :</span>{' '}
              {analysis.profile ?? 'Soutien intégratif'}
            </p>
          </div>
        </header>

        <section className="mb-8">
          {sectionTitle('1. Synthèse générale')}
          <p className="text-sm leading-6 text-slate-700">
            {patientName} présente actuellement un profil clinique dominant de type{' '}
            <strong>{analysis.profile ?? 'Soutien intégratif'}</strong>. Le score composite
            ATPE est de <strong>{composite.global}/100</strong>, correspondant à{' '}
            <strong>{composite.interpretation.toLowerCase()}</strong>. L’axe le plus
            mobilisable est <strong>{axisLabel(composite.dominantAxis).toLowerCase()}</strong>,
            tandis que la principale zone de fragilité concerne{' '}
            <strong>{axisLabel(composite.weakestAxis).toLowerCase()}</strong>. La trajectoire
            longitudinale est actuellement orientée vers une{' '}
            <strong>{trendLabel(prediction.trend).toLowerCase()}</strong>, avec un niveau de
            risque <strong>{riskLevelLabel(prediction.riskLevel).toLowerCase()}</strong>.
          </p>
        </section>

        <section className="mb-8">
          {sectionTitle('2. Indicateurs structurants')}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Score composite
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {composite.global}/100 — {composite.interpretation}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tendance longitudinale
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {trendLabel(prediction.trend)} — risque{' '}
                {riskLevelLabel(prediction.riskLevel).toLowerCase()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Axe dominant
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {axisLabel(composite.dominantAxis)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Axe le plus fragile
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {axisLabel(composite.weakestAxis)}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          {sectionTitle('3. Détail des axes')}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
              <p><span className="font-medium">Processus interne :</span> {compositeAxisScores.internalProcess}/100</p>
              <p><span className="font-medium">Processus expressif :</span> {compositeAxisScores.expressiveProcess}/100</p>
              <p><span className="font-medium">Processus relationnel :</span> {compositeAxisScores.relationalProcess}/100</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
              <p><span className="font-medium">Pluriexpressionnalité :</span> {compositeAxisScores.pluriexpressivity}/100</p>
              <p><span className="font-medium">Indicateurs institutionnels :</span> {compositeAxisScores.institutionalIndicators}/100</p>
              <p><span className="font-medium">Sensoriel & symbolique :</span> {compositeAxisScores.sensorialSymbolic}/100</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          {sectionTitle('4. Points d’appui et fragilités')}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Points d’appui</h3>
              {composite.strengths.length ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {composite.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Aucun point d’appui saillant identifié.</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Fragilités prioritaires</h3>
              {composite.vulnerabilities.length ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {composite.vulnerabilities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Aucune fragilité majeure prioritaire repérée.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          {sectionTitle('5. Orientation thérapeutique recommandée')}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-900">
              <span className="font-medium">Protocole :</span> {protocol.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              <span className="font-medium">Intention clinique :</span> {protocol.clinicalIntent}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Objectifs principaux</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {protocol.primaryGoals.map((goal) => (
                    <li key={goal}>• {goal}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Médiations recommandées</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {protocol.mediations.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          {sectionTitle('6. Vigilances cliniques')}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Vigilances du protocole</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                {protocol.vigilance.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Alertes prioritaires</h3>
              {priorityAlerts.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {priorityAlerts.map((alert) => (
                    <li key={alert.id}>
                      • <span className="font-medium">{alert.title}</span> — {alert.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Aucune alerte prioritaire particulière.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          {sectionTitle('7. Version texte structurée')}
          <div className="rounded-xl border border-slate-200 p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {exportText}
            </pre>
          </div>
        </section>
      </article>
    </main>
  )
}