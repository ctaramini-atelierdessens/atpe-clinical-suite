import { computeAtpeCompositeScore, AtpeAxisScores } from '@/lib/atpe-composite-score'
import { buildDashboardAlerts } from '@/lib/dashboard-alerts'
import { getProtocolFromProfile } from '@/lib/atpe-protocol-engine'
import {
  AtpePredictionPoint,
  predictAtpeTrajectory,
  riskLevelLabel,
  trendLabel,
} from '@/lib/atpe-prediction-engine'
import { PatientAtpeAlertsBanner } from '@/components/patient-atpe-alerts-banner'
import { PatientAtpeCompositeScoreCard } from '@/components/patient-atpe-composite-score-card'
import { PatientAtpePredictionCard } from '@/components/patient-atpe-prediction-card'
import { PatientAtpePrintButton } from '@/components/patient-atpe-print-button'
import { PatientAtpeSessionGuide } from '@/components/patient-atpe-session-guide'

type PatientAtpeDashboardSession = {
  date: string
  global_score: number
  internal_process_score?: number
  expressive_process_score?: number
  relational_process_score?: number
  pluriexpressivity_score?: number
  institutional_indicators_score?: number
  sensorial_symbolic_score?: number
}

type PatientAtpeDashboardData = {
  analysisProfile: string | null | undefined
  internalProcessScore: number
  expressiveProcessScore: number
  relationalProcessScore: number
  pluriexpressivityScore: number
  institutionalIndicatorsScore: number
  sensorialSymbolicScore: number
  sessions?: PatientAtpeDashboardSession[]
}

type PatientAtpeDashboardProps = {
  data: PatientAtpeDashboardData
  className?: string
  patientId?: string
}

function normalizeAxisScores(data: PatientAtpeDashboardData): AtpeAxisScores {
  return {
    internalProcess: data.internalProcessScore,
    expressiveProcess: data.expressiveProcessScore,
    relationalProcess: data.relationalProcessScore,
    pluriexpressivity: data.pluriexpressivityScore,
    institutionalIndicators: data.institutionalIndicatorsScore,
    sensorialSymbolic: data.sensorialSymbolicScore,
  }
}

function normalizePredictionPoints(
  sessions: PatientAtpeDashboardSession[] | undefined
): AtpePredictionPoint[] {
  if (!sessions?.length) return []

  return sessions.map((session) => ({
    date: session.date,
    globalScore: session.global_score,
    internalProcess: session.internal_process_score,
    expressiveProcess: session.expressive_process_score,
    relationalProcess: session.relational_process_score,
    pluriexpressivity: session.pluriexpressivity_score,
    institutionalIndicators: session.institutional_indicators_score,
    sensorialSymbolic: session.sensorial_symbolic_score,
  }))
}

function profileBadgeColor(profile: string | null | undefined) {
  switch (profile) {
    case 'Inhibition émotionnelle profonde':
      return 'bg-sky-100 text-sky-800'
    case 'Dissociation corporelle-relationnelle':
      return 'bg-amber-100 text-amber-800'
    case 'Débordement émotionnel non intégré':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function profileLabel(profile: string | null | undefined) {
  return profile ?? 'Soutien intégratif'
}

function synthesisText(params: {
  profile: string | null | undefined
  compositeScore: number
  predictionTrend: string
  weakestAxisLabel: string
  riskLevel: string
}) {
  const { profile, compositeScore, predictionTrend, weakestAxisLabel, riskLevel } = params

  const profilePart = profile
    ? `Le profil clinique dominant est "${profile}".`
    : 'Le profil clinique relève actuellement d’un soutien intégratif non spécifique.'

  let scorePart = ''
  if (compositeScore < 40) {
    scorePart =
      'Le score composite met en évidence une fragilité clinique marquée nécessitant un cadrage renforcé.'
  } else if (compositeScore < 60) {
    scorePart =
      'Le score composite indique un équilibre intermédiaire avec plusieurs dimensions encore vulnérables.'
  } else if (compositeScore < 80) {
    scorePart =
      'Le score composite traduit une dynamique clinique favorable, avec des ressources déjà mobilisables.'
  } else {
    scorePart =
      'Le score composite traduit une très bonne dynamique clinique avec une base de travail bien consolidée.'
  }

  const trendPart = `La trajectoire actuelle est évaluée comme "${predictionTrend}" avec un niveau de risque ${riskLevel.toLowerCase()}.`
  const axisPart = `L’axe le plus fragile actuellement concerne ${weakestAxisLabel}.`

  return `${profilePart} ${scorePart} ${trendPart} ${axisPart}`
}

function protocolCardTone(profile: string | null | undefined) {
  switch (profile) {
    case 'Inhibition émotionnelle profonde':
      return 'border-sky-200 bg-sky-50'
    case 'Dissociation corporelle-relationnelle':
      return 'border-amber-200 bg-amber-50'
    case 'Débordement émotionnel non intégré':
      return 'border-rose-200 bg-rose-50'
    default:
      return 'border-slate-200 bg-slate-50'
  }
}

export function PatientAtpeDashboard({
  data,
  className = '',
  patientId,
}: PatientAtpeDashboardProps) {
  const axisScores = normalizeAxisScores(data)
  const composite = computeAtpeCompositeScore(axisScores)
  const protocol = getProtocolFromProfile(data.analysisProfile)
  const prediction = predictAtpeTrajectory(normalizePredictionPoints(data.sessions))
  const alerts = buildDashboardAlerts({
    profile: data.analysisProfile,
    composite,
    prediction,
    axisScores,
    sessionsCount: data.sessions?.length ?? 0,
  })

  const synthesis = synthesisText({
    profile: data.analysisProfile,
    compositeScore: composite.global,
    predictionTrend: trendLabel(prediction.trend),
    weakestAxisLabel:
      composite.weakestAxis === 'internalProcess'
        ? 'du processus interne'
        : composite.weakestAxis === 'expressiveProcess'
        ? 'du processus expressif'
        : composite.weakestAxis === 'relationalProcess'
        ? 'du processus relationnel'
        : composite.weakestAxis === 'pluriexpressivity'
        ? 'de la pluriexpressionnalité'
        : composite.weakestAxis === 'institutionalIndicators'
        ? 'des indicateurs institutionnels'
        : 'du registre sensoriel et symbolique',
    riskLevel: riskLevelLabel(prediction.riskLevel),
  })

  return (
    <div className={`space-y-6 ${className}`}>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-slate-900">Synthèse clinique ATPE</h2>
            <p className="mt-1 text-sm text-slate-500">
              Vue intégrée du profil, du score composite, de la trajectoire et du protocole thérapeutique
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-700">{synthesis}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${profileBadgeColor(
                data.analysisProfile
              )}`}
            >
              Profil : {profileLabel(data.analysisProfile)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Score : {composite.global}/100
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Tendance : {trendLabel(prediction.trend)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Risque : {riskLevelLabel(prediction.riskLevel)}
            </span>

            {patientId ? (
              <PatientAtpePrintButton
                patientId={patientId}
                className="px-3 py-1 text-xs"
                label="Impression / PDF"
              />
            ) : null}
          </div>
        </div>
      </section>

      <PatientAtpeAlertsBanner alerts={alerts} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PatientAtpeCompositeScoreCard composite={composite} axisScores={axisScores} />
        <PatientAtpePredictionCard prediction={prediction} />
      </div>

      <section
        className={`rounded-2xl border p-5 shadow-sm ${protocolCardTone(data.analysisProfile)}`}
      >
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Protocole recommandé</h2>
          <p className="text-sm text-slate-600">{protocol.title}</p>
          <p className="text-sm text-slate-500">{protocol.subtitle}</p>
          <p className="text-sm text-slate-700">{protocol.clinicalIntent}</p>
        </div>

        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Format recommandé
            </p>
            <p className="text-sm font-medium text-slate-800">{protocol.recommendedFormat}</p>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Durée indicative
            </p>
            <p className="text-sm font-medium text-slate-800">
              {protocol.recommendedDurationMinutes} minutes
            </p>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Axes transversaux
            </p>
            <p className="text-sm font-medium text-slate-800">
              {protocol.transverseTrajectories.length}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Objectifs principaux
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.primaryGoals.map((goal) => (
                <li key={goal} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Objectifs secondaires
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.secondaryGoals.map((goal) => (
                <li key={goal} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Médiations recommandées
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.mediations.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Vigilances
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.vigilance.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Signaux faibles
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.weakSignals.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/70 p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Trajectoires transversales
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {protocol.transverseTrajectories.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PatientAtpeSessionGuide protocol={protocol} />
    </div>
  )
}