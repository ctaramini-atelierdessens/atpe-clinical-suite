'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type SessionRow = {
  id: string
  session_number?: number | null
  created_at?: string | null
  patient_engagement_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  frame_containment?: number | null
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function formatShortDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR')
}

function buildChartData(sessions: SessionRow[]) {
  return [...sessions]
    .sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return da - db
    })
    .map((session, index) => ({
      id: session.id,
      label: `S${session.session_number ?? index + 1}`,
      date: formatShortDate(session.created_at),
      engagement: safeNumber(session.patient_engagement_level),
      symbolisation1: safeNumber(session.primary_symbolization),
      symbolisation2: safeNumber(session.secondary_symbolization),
      containment: safeNumber(session.frame_containment),
      symbolisationMoyenne:
        Math.round(
          (safeNumber(session.primary_symbolization) +
            safeNumber(session.secondary_symbolization)) /
            2
        ),
    }))
}

export function PatientClinicalCharts({
  sessions,
}: {
  sessions: SessionRow[]
}) {
  const data = buildChartData(sessions)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Graphiques d’évolution
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Aucune donnée de séance disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Évolution engagement / symbolisation
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Lecture longitudinale des dimensions cliniques principales.
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                name="Engagement"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="symbolisationMoyenne"
                name="Symbolisation moyenne"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Évolution de la contenance
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Suivi du niveau de contenance du cadre séance après séance.
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="containment"
                name="Containment"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}