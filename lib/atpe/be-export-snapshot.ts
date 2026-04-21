import { buildPredictiveReport } from '@/lib/atpe/be-predictive'

export type ExportSnapshotSession = {
    id?: string
    session_number?: number | null
    emotional_score?: number | null
    body_score?: number | null
    symbolic_score?: number | null
    regulation_score?: number | null
    dynamic_score?: number | null
    engagement_score?: number | null
    awareness_score?: number | null
    clinical_summary?: string | null
}

function safeScore(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function avg(values: number[]) {
    if (!values.length) return 0
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function to100(v?: number | null) {
    if (typeof v !== 'number') return 0
    return Math.max(0, Math.min(100, Math.round(v * 10)))
}

function trendLabel(first: number, last: number) {
    if (last > first) return 'Amélioration'
    if (last < first) return 'Fragilisation'
    return 'Stabilité'
}

export function buildExportSnapshot({
    patient,
    sessions,
    userEmail,
    signatureName,
    signatureRole,
    versionLabel,
}: {
    patient: { id: string; code?: string | null }
    sessions: ExportSnapshotSession[]
    userEmail?: string | null
    signatureName: string
    signatureRole: string
    versionLabel: string
}) {
    const safeSessions = (sessions ?? []).filter(Boolean)
    const lastSession = safeSessions[safeSessions.length - 1]

    const be17Data = {
        patientName: patient.code ?? 'Patient',
        assessmentDate: new Date().toLocaleDateString('fr-FR'),
        clinicianName: userEmail ?? 'Clinicien',
        context:
            safeSessions.length > 0
                ? `Le patient présente ${safeSessions.length} séance(s) analysée(s).`
                : 'Aucune séance disponible.',
        observations:
            lastSession?.clinical_summary ??
            'Pas encore de synthèse clinique disponible.',
        scores: {
            emotionalExpression: to100(
                avg(safeSessions.map((s) => safeScore(s.emotional_score)))
            ),
            bodyEngagement: to100(
                avg(safeSessions.map((s) => safeScore(s.body_score)))
            ),
            relationalAvailability: to100(
                avg(
                    safeSessions.map((s) =>
                        Math.round(
                            (safeScore(s.engagement_score) + safeScore(s.awareness_score)) / 2
                        )
                    )
                )
            ),
            symbolicCapacity: to100(
                avg(safeSessions.map((s) => safeScore(s.symbolic_score)))
            ),
            regulationCapacity: to100(
                avg(safeSessions.map((s) => safeScore(s.regulation_score)))
            ),
            initiativeCreativity: to100(
                avg(safeSessions.map((s) => safeScore(s.dynamic_score)))
            ),
        },
    }

    const emotionalSeries = safeSessions.map((s) => safeScore(s.emotional_score))
    const bodySeries = safeSessions.map((s) => safeScore(s.body_score))
    const symbolicSeries = safeSessions.map((s) => safeScore(s.symbolic_score))
    const regulationSeries = safeSessions.map((s) => safeScore(s.regulation_score))
    const dynamicSeries = safeSessions.map((s) => safeScore(s.dynamic_score))
    const engagementSeries = safeSessions.map((s) => safeScore(s.engagement_score))

    const longitudinal = {
        emotional: {
            start: emotionalSeries[0] ?? 0,
            end: emotionalSeries[emotionalSeries.length - 1] ?? 0,
            trend: trendLabel(
                emotionalSeries[0] ?? 0,
                emotionalSeries[emotionalSeries.length - 1] ?? 0
            ),
        },
        body: {
            start: bodySeries[0] ?? 0,
            end: bodySeries[bodySeries.length - 1] ?? 0,
            trend: trendLabel(bodySeries[0] ?? 0, bodySeries[bodySeries.length - 1] ?? 0),
        },
        symbolic: {
            start: symbolicSeries[0] ?? 0,
            end: symbolicSeries[symbolicSeries.length - 1] ?? 0,
            trend: trendLabel(
                symbolicSeries[0] ?? 0,
                symbolicSeries[symbolicSeries.length - 1] ?? 0
            ),
        },
        regulation: {
            start: regulationSeries[0] ?? 0,
            end: regulationSeries[regulationSeries.length - 1] ?? 0,
            trend: trendLabel(
                regulationSeries[0] ?? 0,
                regulationSeries[regulationSeries.length - 1] ?? 0
            ),
        },
        dynamic: {
            start: dynamicSeries[0] ?? 0,
            end: dynamicSeries[dynamicSeries.length - 1] ?? 0,
            trend: trendLabel(
                dynamicSeries[0] ?? 0,
                dynamicSeries[dynamicSeries.length - 1] ?? 0
            ),
        },
        engagement: {
            start: engagementSeries[0] ?? 0,
            end: engagementSeries[engagementSeries.length - 1] ?? 0,
            trend: trendLabel(
                engagementSeries[0] ?? 0,
                engagementSeries[engagementSeries.length - 1] ?? 0
            ),
        },
    }

    const predictive = buildPredictiveReport(safeSessions)

    return {
        meta: {
            versionLabel,
            exportedAt: new Date().toISOString(),
            patientId: patient.id,
            patientCode: patient.code ?? 'Patient',
            clinicianEmail: userEmail ?? 'Clinicien',
            signatureName,
            signatureRole,
            sessionCount: safeSessions.length,
            locked: true,
        },
        be17Data,
        longitudinal,
        predictive,
        sessions: safeSessions.map((s) => ({
            id: s.id ?? null,
            session_number: s.session_number ?? null,
            emotional_score: safeScore(s.emotional_score),
            body_score: safeScore(s.body_score),
            symbolic_score: safeScore(s.symbolic_score),
            regulation_score: safeScore(s.regulation_score),
            dynamic_score: safeScore(s.dynamic_score),
            engagement_score: safeScore(s.engagement_score),
            awareness_score: safeScore(s.awareness_score),
            clinical_summary: s.clinical_summary ?? '',
        })),
    }
}