'use client'

import { computeAtpeExpertResult } from '@/lib/atpe/expert-engine'
import { mapSessionToExpertInput } from '@/lib/atpe/map-session-to-expert-input'
import {
  getClinicalLevel,
  getRiskFlag,
  getTrajectoryTrend,
  clinicalLevelClass,
  riskFlagClass,
  trajectoryTrendClass,
} from '@/lib/atpe/clinical-intelligence'
import {
  safeText,
  safeArray,
  formatShortDate,
  phaseLabel,
  clampPercent,
  truncateText,
} from '@/lib/atpe/format'

type SessionRow = {
  id: string
  created_at: string | null
  updated_at?: string | null
  atpe_phase_dominant: string | null
  medium_primary: string | null
  medium_secondary?: string | null
  format?: string | null
  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  patient_engagement_level: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
  clinical_hypotheses?: string | null
  next_step_recommendation?: string | null
}

type Props = {
  sessions: SessionRow[] | null | undefined
}

function badgeClass(value: string) {
  if (value === 'stable' || value === 'low') {
    return 'bg-green-100 text-green-700'
  }
  if (value === 'intermediate' || value === 'moderate') {
    return 'bg-amber-100 text-amber-700'
  }
  if (value === 'fragile' || value === 'high') {
    return 'bg-red-100 text-red-700'
  }
  return 'bg-slate-100 text-slate-700'
}

function buildAlerts(session: SessionRow) {
  const alerts: Array<{
    level: 'low' | 'moderate' | 'high'
    label: string
    detail: string
  }> = []

  if ((session.frame_containment ?? 0) < 60) {
    alerts.push({
      level: 'high',
      label: 'Contenance fragile',
      detail:
        'Le cadre paraît insuffisamment contenant et nécessite un renforcement.',
    })
  }

  if ((session.patient_engagement_level ?? 0) < 50) {
    alerts.push({
      level: 'moderate',
      label: 'Engagement bas',
      detail:
        'Le niveau d’engagement observé reste faible et demande prudence clinique.',
    })
  }

  if ((session.projective_intensity ?? 0) >= 40) {
    alerts.push({
      level: 'high',
      label: 'Intensité projective élevée',
      detail:
        'Le niveau projectif peut majorer le risque de débordement ou de surcharge.',
    })
  }

  if (session.therapist_feels_confusion) {
    alerts.push({
      level: 'moderate',
      label: 'Contre-transfert : confusion',
      detail:
        'Un vécu de confusion thérapeutique est signalé et doit être repris cliniquement.',
    })
  }

  if (session.therapist_feels_sudden_fatigue) {
    alerts.push({
      level: 'moderate',
      label: 'Contre-transfert : fatigue',
      detail:
        'Une fatigue soudaine du thérapeute peut signaler une charge transférentielle à surveiller.',
    })
  }

  if (session.therapist_feels_pressure) {
    alerts.push({
      level: 'moderate',
      label: 'Contre-transfert : pression',
      detail:
        'Le thérapeute ressent une pression qui peut indiquer un risque de sur-sollicitation.',
    })
  }

  if (session.therapist_feels_irritation) {
    alerts.push({
      level: 'moderate',
      label: 'Contre-transfert : irritation',
      detail:
        'Une irritation apparaît dans le champ thérapeutique et demande un repérage clinique.',
    })
  }

  if (session.therapist_feels_void) {
    alerts.push({
      level: 'moderate',
      label: 'Contre-transfert : vide',
      detail:
        'Un vécu de vide est noté et peut signaler une fragilisation du lien ou de la symbolisation.',
    })
  }

  if (session.patient_repeats_without_integration) {
    alerts.push({
      level: 'high',
      label: 'Répétition sans intégration',
      detail:
        'La répétition n’ouvre pas actuellement sur une intégration suffisante.',
    })
  }

  if (session.group_feels_same_affect) {
    alerts.push({
      level: 'moderate',
      label: 'Affect partagé',
      detail:
        'Un affect homogène semble circuler dans le groupe ou le champ relationnel.',
    })
  }

  if (session.tension_spreads_quickly) {
    alerts.push({
      level: 'high',
      label: 'Diffusion rapide de tension',
      detail:
        'La tension semble se propager rapidement, ce qui augmente le niveau de vigilance.',
    })
  }

  return alerts
}

function alertClass(level: 'low' | 'moderate' | 'high') {
  switch (level) {
    case 'high':
      return 'border-red-200 bg-red-50 text-red-800'
    case 'moderate':
      return 'border-amber-200 bg-amber-50 text-amber-800'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

export function PatientAtpeExpertCard({ sessions }: Props) {
  const safeSessions = safeArray(sessions)
  const latest = safeSessions[safeSessions.length - 1] ?? null

  if (!latest) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Moteur expert ATPE
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Aucune séance disponible pour calculer l’analyse experte.
        </p>
      </section>
    )
  }

  let expert: ReturnType<typeof computeAtpeExpertResult> | null = null

  try {
    expert = computeAtpeExpertResult(mapSessionToExpertInput(latest))
  } catch (error) {
    console.error('Erreur moteur expert ATPE:', error)
    expert = null
  }

  const clinicalLevel = getClinicalLevel(latest)
  const riskFlag = getRiskFlag(latest)
  const trajectory = getTrajectoryTrend(safeSessions)
  const alerts = buildAlerts(latest)

  const chronological = [...safeSessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })

  const chartData = chronological.map((session, index) => ({
    label: `S${index + 1}`,
    score: getClinicalLevel(session).score,
    date: formatShortDate(session.created_at),
  }))

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Moteur expert ATPE
        </h2>
        <span className="text-sm text-slate-500">
          Dernière séance : {formatShortDate(latest.created_at)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Phase dominante calculée</div>
          <div className="mt-1 text-base font-semibold text-slate-900">
            {expert ? phaseLabel(expert.phase_dominant) : '—'}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Score clinique global</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {clinicalLevel.score}/100
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Niveau clinique</div>
          <div
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${clinicalLevelClass(
              clinicalLevel.level
            )}`}
          >
            {clinicalLevel.label}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Niveau de risque</div>
          <div
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${riskFlagClass(
              riskFlag.flag
            )}`}
          >
            {riskFlag.label}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Lecture clinique
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {clinicalLevel.rationale}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Lecture du risque
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {riskFlag.rationale}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Orientation clinique
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {safeText(expert?.clinical_orientation)}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Prochaine étape recommandée
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {safeText(
              expert?.next_step_recommendation || latest.next_step_recommendation
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Trajectoire dynamique
          </h3>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${trajectoryTrendClass(
              trajectory.trend
            )}`}
          >
            {trajectory.label} · {trajectory.delta >= 0 ? '+' : ''}
            {trajectory.delta}
          </span>
        </div>

        <div className="mt-3 text-sm leading-6 text-slate-700">
          {trajectory.rationale}
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span>Départ : {trajectory.startScore}/100</span>
            <span>Arrivée : {trajectory.endScore}/100</span>
          </div>

          <div className="flex min-h-[140px] items-end gap-2 rounded-xl bg-slate-50 p-4">
            {chartData.map((item) => (
              <div
                key={`${item.label}-${item.date}`}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="text-[10px] text-slate-500">{item.score}</div>
                <div className="flex w-full items-end justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t bg-slate-900"
                    style={{ height: `${Math.max(8, item.score)}px` }}
                    title={`${item.label} — ${item.score}/100`}
                  />
                </div>
                <div className="text-[10px] text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-slate-900">Alertes</h3>

        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Aucune alerte clinique majeure détectée sur la dernière séance.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.label}-${index}`}
                className={`rounded-xl border p-3 ${alertClass(alert.level)}`}
              >
                <div className="text-sm font-semibold">{alert.label}</div>
                <div className="mt-1 text-sm">
                  {truncateText(alert.detail, 220)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Scores des phases calculées
        </h3>

        {!expert ? (
          <p className="mt-3 text-sm text-slate-600">Calcul indisponible.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {Object.entries(expert.phase_scores).map(([phase, score]) => {
              const safeScore = clampPercent(score)

              return (
                <div key={phase}>
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>{phaseLabel(phase)}</span>
                    <span>{safeScore}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${safeScore}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}