'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type HistoryPoint = {
  label: string
  score: number
}

type ProjectionPoint = {
  step: string
  predictedScore: number
}

type Props = {
  history: HistoryPoint[]
  projection: ProjectionPoint[]
}

function buildMergedData(
  history: HistoryPoint[],
  projection: ProjectionPoint[]
) {
  const historyData = history.map((point) => ({
    label: point.label,
    historyScore: point.score,
    projectedScore: null as number | null,
  }))

  const projectionData = projection.map((point) => ({
    label: point.step,
    historyScore: null as number | null,
    projectedScore: point.predictedScore,
  }))

  return [...historyData, ...projectionData]
}

export function PatientPredictionChart({
  history,
  projection,
}: Props) {
  const data = buildMergedData(history, projection)

  if (history.length === 0 && projection.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Projection clinique
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Aucune donnée disponible.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Projection clinique (3 séances)
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Historique récent et projection du score clinique global.
      </p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />

            <ReferenceLine y={30} strokeDasharray="4 4" />
            <ReferenceLine y={60} strokeDasharray="4 4" />

            <Line
              type="monotone"
              dataKey="historyScore"
              name="Historique"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
            />

            <Line
              type="monotone"
              dataKey="projectedScore"
              name="Projection"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}