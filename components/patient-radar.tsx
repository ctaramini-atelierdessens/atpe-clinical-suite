'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  emotion?: number | null
  corps?: number | null
  conscience?: number | null
  dynamique?: number | null
  symbolique?: number | null
}

function normalize(v?: number | null) {
  if (typeof v !== 'number') return 0
  return Math.max(0, Math.min(100, v))
}

export function PatientRadar(props: Props) {
  const data = [
    { name: 'Émotion', value: normalize(props.emotion) },
    { name: 'Corps', value: normalize(props.corps) },
    { name: 'Conscience', value: normalize(props.conscience) },
    { name: 'Dynamique', value: normalize(props.dynamique) },
    { name: 'Symbolique', value: normalize(props.symbolique) },
  ]

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Radar clinique</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <Radar dataKey="value" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}