'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

type Props = {
  scores: {
    emotion: number
    corps: number
    conscience: number
    dynamique: number
    symbolique: number
  }
}

export function PatientRadarChart({ scores }: Props) {
  const data = [
    { subject: 'Émotion', value: scores.emotion },
    { subject: 'Corps', value: scores.corps },
    { subject: 'Conscience', value: scores.conscience },
    { subject: 'Dynamique', value: scores.dynamique },
    { subject: 'Symbolique', value: scores.symbolique },
  ]

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">📊 Radar clinique</h2>

      <RadarChart width={300} height={250} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar dataKey="value" />
      </RadarChart>
    </div>
  )
}