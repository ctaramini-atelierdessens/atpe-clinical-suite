'use client'

type SessionItem = {
    id: string
    created_at?: string | null
    emotion?: number | null
    emotional_score?: number | null
    corps?: number | null
    body_score?: number | null
    conscience?: number | null
    consciousness_score?: number | null
    dynamique?: number | null
    dynamic_score?: number | null
    symbolique?: number | null
    symbolic_score?: number | null
}

type Props = {
    sessions: SessionItem[]
}

type DimensionKey =
    | 'emotion'
    | 'corps'
    | 'conscience'
    | 'dynamique'
    | 'symbolique'

type DimensionSummary = {
    key: DimensionKey
    label: string
    average: number | null
    latest: number | null
    previous: number | null
    delta: number | null
    range: number | null
    trendLabel: string
    levelLabel: string
}

function normalizeScore(
    primary?: number | null,
    fallback?: number | null,
): number | null {
    const value =
        typeof primary === 'number'
            ? primary
            : typeof fallback === 'number'
            ? fallback
            : null

    if (value === null || !Number.isFinite(value)) return null
    return Math.max(0, Math.min(100, Math.round(value)))
}

function average(values: number[]) {
    if (!values.length) return null
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function range(values: number[]) {
    if (!values.length) return null
    return Math.max(...values) - Math.min(...values)
}

function getTrendLabel(delta: number | null) {
    if (delta === null) return 'Données insuffisantes'
    if (delta >= 12) return 'Progression forte'
    if (delta >= 4) return 'Progression'
    if (delta <= -12) return 'Décrochage net'
    if (delta <= -4) return 'Fragilisation'
    return 'Stable'
}

function getLevelLabel(avg: number | null) {
    if (avg === null) return 'Non déterminé'
    if (avg >= 80) return 'Très favorable'
    if (avg >= 60) return 'Favorable'
    if (avg >= 40) return 'Intermédiaire'
    if (avg >= 20) return 'Fragile'
    return 'Très fragile'
}

function getDimensionValue(session: SessionItem, key: DimensionKey) {
    switch (key) {
        case 'emotion':
            return normalizeScore(session.emotion, session.emotional_score)
        case 'corps':
            return normalizeScore(session.corps, session.body_score)
        case 'conscience':
            return normalizeScore(session.conscience, session.consciousness_score)
        case 'dynamique':
            return normalizeScore(session.dynamique, session.dynamic_score)
        case 'symbolique':
            return normalizeScore(session.symbolique, session.symbolic_score)
        default:
            return null
    }
}

function buildDimensionSummary(
    sessions: SessionItem[],
    key: DimensionKey,
    label: string,
): DimensionSummary {
    const values = sessions
        .map((session) => getDimensionValue(session, key))
        .filter((v): v is number => typeof v === 'number')

    const latest = sessions[0] ? getDimensionValue(sessions[0], key) : null
    const previous = sessions[1] ? getDimensionValue(sessions[1], key) : null
    const delta =
        latest !== null && previous !== null ? latest - previous : null

    const avg = average(values)
    const amplitude = range(values)

    return {
        key,
        label,
        average: avg,
        latest,
        previous,
        delta,
        range: amplitude,
        trendLabel: getTrendLabel(delta),
        levelLabel: getLevelLabel(avg),
    }
}

function formatScore(value: number | null) {
    return value === null ? '—' : `${value}/100`
}

function formatDelta(value: number | null) {
    if (value === null) return '—'
    return `${value > 0 ? '+' : ''}${value}`
}

export function PatientDimensionalInsights({ sessions }: Props) {
    const ordered = [...sessions].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0
        const db = b.created_at ? new Date(b.created_at).getTime() : 0
        return db - da
    })

    const summaries = [
        buildDimensionSummary(ordered, 'emotion', 'Émotion'),
        buildDimensionSummary(ordered, 'corps', 'Corps'),
        buildDimensionSummary(ordered, 'conscience', 'Conscience'),
        buildDimensionSummary(ordered, 'dynamique', 'Dynamique'),
        buildDimensionSummary(ordered, 'symbolique', 'Symbolique'),
    ]

    const validDeltas = summaries.filter((item) => item.delta !== null)

    const strongestProgress = validDeltas.length
        ? [...validDeltas].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))[0]
        : null

    const biggestDrop = validDeltas.length
        ? [...validDeltas].sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0))[0]
        : null

    const mostFragile = [...summaries]
        .filter((item) => item.average !== null)
        .sort((a, b) => (a.average ?? 999) - (b.average ?? 999))[0] ?? null

    const mostStable = [...summaries]
        .filter((item) => item.range !== null)
        .sort((a, b) => (a.range ?? 999) - (b.range ?? 999))[0] ?? null

    if (!ordered.length) {
        return (
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold">
                    Analyse avancée par dimension
                </h2>
                <p className="text-sm text-neutral-500">
                    Aucune séance disponible pour l'analyse dimensionnelle.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
                Analyse avancée par dimension
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {summaries.map((item) => (
                    <div
                        key={item.key}
                        className="rounded-xl border border-neutral-200 p-4"
                    >
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="font-semibold">{item.label}</div>
                            <div className="text-sm text-neutral-500">{item.trendLabel}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                            <div>
                                <div className="text-neutral-500">Dernière</div>
                                <div className="font-medium">{formatScore(item.latest)}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">Précédente</div>
                                <div className="font-medium">{formatScore(item.previous)}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">Variation</div>
                                <div className="font-medium">{formatDelta(item.delta)}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">Moyenne</div>
                                <div className="font-medium">{formatScore(item.average)}</div>
                            </div>
                        </div>

                        <div className="mt-3 text-sm text-neutral-700">
                            <strong>Niveau longitudinal :</strong> {item.levelLabel}
                        </div>

                        <div className="mt-1 text-sm text-neutral-700">
                            <strong>Amplitude :</strong>{' '}
                            {item.range !== null ? `${item.range} points` : '—'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-xl border border-neutral-200 p-4">
                <h3 className="mb-2 text-base font-semibold">Lecture synthétique</h3>

                <div className="space-y-2 text-sm text-neutral-700">
                    <p>
                        <strong>Dimension la plus en progression :</strong>{' '}
                        {strongestProgress
                            ? `${strongestProgress.label} (${formatDelta(strongestProgress.delta)})`
                            : '—'}
                    </p>

                    <p>
                        <strong>Dimension qui décroche le plus :</strong>{' '}
                        {biggestDrop
                            ? `${biggestDrop.label} (${formatDelta(biggestDrop.delta)})`
                            : '—'}
                    </p>

                    <p>
                        <strong>Dimension la plus fragile sur la durée :</strong>{' '}
                        {mostFragile
                            ? `${mostFragile.label} (${formatScore(mostFragile.average)})`
                            : '—'}
                    </p>

                    <p>
                        <strong>Dimension la plus stable :</strong>{' '}
                        {mostStable
                            ? `${mostStable.label} (amplitude ${mostStable.range ?? '—'} points)`
                            : '—'}
                    </p>
                </div>
            </div>
        </div>
    )
}