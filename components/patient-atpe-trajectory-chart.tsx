'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import { analyzeAtpeTrajectory } from '@/lib/atpe/trajectory-analysis'
import { resolveAtpeClinicalMatrix } from '@/lib/atpe/clinical-matrix'
import { formatShortDate } from '@/lib/atpe/format'
import { formatRelatedAxesLabel } from '@/lib/atpe/dashboard-alerts'

type SessionLike = {
  id?: string
  session_number?: number | null
  created_at?: string | null

  frame_containment?: number | null
  bodily_engagement?: number | null
  decentering_level?: number | null
  centering_level?: number | null
  externalization_level?: number | null
  work_dialogue_level?: number | null
  sharing_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  projective_intensity?: number | null
  therapist_presence_quality?: number | null
  patient_engagement_level?: number | null

  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
}

type Props = {
  sessions: SessionLike[] | null | undefined
}

function sortChronologically<T extends { created_at?: string | null }>(items: T[]) {
  return [...items].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return da - db
  })
}

function severityClass(severity: 'info' | 'moderate' | 'high') {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'moderate':
      return 'bg-amber-100 text-amber-800'
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

function patternContainerClass(severity: 'info' | 'moderate' | 'high') {
  switch (severity) {
    case 'high':
      return 'border-red-200 bg-red-50'
    case 'moderate':
      return 'border-amber-200 bg-amber-50'
    case 'info':
    default:
      return 'border-blue-200 bg-blue-50'
  }
}

function buildChartData(sessions: SessionLike[]) {
  const chronological = sortChronologically(sessions)

  return chronological.map((session, index) => {
    const matrix = resolveAtpeClinicalMatrix(session)

    return {
      label: `S${session.session_number ?? index + 1}`,
      date: formatShortDate(session.created_at ?? null),
      global: matrix.average,
      relation: matrix.axes.relation,
      soma: matrix.axes.soma,
      projection: matrix.axes.projection,
      symbolisation: matrix.axes.symbolisation,
      identite: matrix.axes.identite,
      transformation: matrix.axes.transformation,
      dominantAxis: matrix.dominantAxis,
      weakestAxis: matrix.weakestAxis,
    }
  })
}

export function PatientAtpeTrajectoryChart({ sessions }: Props) {
  const safeSessions = Array.isArray(sessions) ? sessions : []

  if (safeSessions.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Trajectoire clinique
        </h2>
        <p className="mt-2 text-sm text-slate-500">Aucune donnée disponible.</p>
      </section>
    )
  }

  const chronological = sortChronologically(safeSessions)
  const analysis = analyzeAtpeTrajectory(chronological)
  const data = buildChartData(chronological)

  const latestPoint = analysis.points[analysis.points.length - 1] ?? null

  return (
    <section className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Trajectoire clinique
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Évolution du score global et des axes cliniques au fil des séances,
          avec lecture supervisionnelle automatique.
        </p>
      </div>

      <div
        className={`rounded-2xl border p-4 ${patternContainerClass(
          analysis.severity
        )}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${severityClass(
              analysis.severity
            )}`}
          >
            {analysis.label}
          </span>

          <span className="text-sm font-medium text-slate-900">
            Delta total {analysis.delta_total >= 0 ? '+' : ''}
            {analysis.delta_total}
          </span>

          <span className="text-sm font-medium text-slate-900">
            Delta récent {analysis.delta_recent >= 0 ? '+' : ''}
            {analysis.delta_recent}
          </span>

          <span className="text-sm font-medium text-slate-900">
            Volatilité {analysis.volatility}
          </span>

          <span className="text-sm font-medium text-slate-900">
            Pente {analysis.slope >= 0 ? '+' : ''}
            {analysis.slope}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          {analysis.summary}
        </p>

        {latestPoint ? (
          <p className="mt-2 text-xs text-slate-600">
            Axe dominant actuel : {latestPoint.dominant_axis} • Axe fragile actuel :{' '}
            {latestPoint.weakest_axis}
          </p>
        ) : null}

        {analysis.events.length > 0 ? (
          <div className="mt-4 space-y-2">
            {analysis.events.map((event, index) => (
              <div
                key={`${event.type}-${index}`}
                className="rounded-xl border bg-white/70 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityClass(
                      event.severity
                    )}`}
                  >
                    {event.title}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Première séance</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {analysis.points[0]?.session_number ?? '—'}
          </div>
          <div className="text-sm text-slate-600">
            {analysis.points[0]?.created_at
              ? formatShortDate(analysis.points[0].created_at)
              : '—'}
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Dernière séance</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {analysis.points[analysis.points.length - 1]?.session_number ?? '—'}
          </div>
          <div className="text-sm text-slate-600">
            {analysis.points[analysis.points.length - 1]?.created_at
              ? formatShortDate(analysis.points[analysis.points.length - 1].created_at)
              : '—'}
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Score initial</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {analysis.points[0]?.global_score ?? 0}/100
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Score actuel</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {analysis.points[analysis.points.length - 1]?.global_score ?? 0}/100
          </div>
        </div>
      </div>

      <div className="h-[360px] rounded-2xl border bg-slate-50 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip />

            <Line type="monotone" dataKey="global" strokeWidth={3} dot />
            <Line type="monotone" dataKey="relation" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="soma" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="projection" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="symbolisation" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="identite" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="transformation" strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Lecture supervisionnelle
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            La trajectoire actuelle est classée comme{' '}
            <strong>{analysis.label.toLowerCase()}</strong>. Cette lecture se base
            sur le delta total, le delta récent, la volatilité et la pente globale
            des scores cliniques.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Légende</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <span>Global = synthèse clinique</span>
            <span>Relation = lien / alliance</span>
            <span>Soma = corps / régulation</span>
            <span>Projection = charge projective</span>
            <span>Symbolisation = forme / sens</span>
            <span>Identité = cohérence de soi</span>
            <span>Transformation = passage / intégration</span>
          </div>
        </div>
      </div>

      {latestPoint ? (
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Focus sur la dernière position clinique
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Le score global actuel est de <strong>{latestPoint.global_score}/100</strong>.
            Les axes à surveiller en priorité doivent être croisés avec les alertes
            automatiques et les recommandations protocolaires.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Axes mis en avant :{' '}
            {formatRelatedAxesLabel([latestPoint.dominant_axis, latestPoint.weakest_axis])}
          </p>
        </div>
      ) : null}
    </section>
  )
}