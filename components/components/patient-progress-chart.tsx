import {

'use client'

    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    Legend,
} from 'recharts'

type SessionRadarProps = {
    emotion: number
    corps: number
    conscience: number
    dynamique: number
    symbolique: number
    regulation: number
    engagement: number
    previous?: {
        emotion: number
        corps: number
        conscience: number
        dynamique: number
        symbolique: number
        regulation: number
        engagement: number
    } | null
}

export function SessionRadar({
    emotion,
    corps,
    conscience,
    dynamique,
    symbolique,
    regulation,
    engagement,
    previous = null,
}: SessionRadarProps) {
    const data = [
        {
            subject: 'Émotion',
            current: emotion,
            previous: previous?.emotion ?? 0,
        },
        {
            subject: 'Corps',
            current: corps,
            previous: previous?.corps ?? 0,
        },
        {
            subject: 'Conscience',
            current: conscience,
            previous: previous?.conscience ?? 0,
        },
        {
            subject: 'Dynamique',
            current: dynamique,
            previous: previous?.dynamique ?? 0,
        },
        {
            subject: 'Symbolique',
            current: symbolique,
            previous: previous?.symbolique ?? 0,
        },
        {
            subject: 'Régulation',
            current: regulation,
            previous: previous?.regulation ?? 0,
        },
        {
            subject: 'Engagement',
            current: engagement,
            previous: previous?.engagement ?? 0,
        },
    ]

    return (
        <div className="mt-2 flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
            <RadarChart width={460} height={340} data={data} outerRadius={115}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />

                {previous && (
                    <Radar
                        name="Séance précédente"
                        dataKey="previous"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.2}
                    />
                )}

                <Radar
                    name="Séance actuelle"
                    dataKey="current"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.35}
                />

                <Legend />
            </RadarChart>
        </div>
    )
}