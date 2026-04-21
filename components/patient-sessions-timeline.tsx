'use client'

type SessionItem = {
  id: string
  session_number?: number | null
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
  global_score?: number | null
  notes?: string | null
}

type Props = {
  sessions: SessionItem[]
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR')
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

function scoreBadge(value?: number | null) {
  if (typeof value !== 'number') return '—'
  return `${value}/100`
}

export function PatientSessionsTimeline({ sessions }: Props) {
  if (!sessions.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Timeline des séances</h2>
        <p className="text-sm text-neutral-500">Aucune séance enregistrée.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Timeline des séances</h2>

      <div className="space-y-4">
        {sessions.map((session) => {
          const emotion = normalizeScore(
            session.emotion,
            session.emotional_score,
          )
          const corps = normalizeScore(session.corps, session.body_score)
          const conscience = normalizeScore(
            session.conscience,
            session.consciousness_score,
          )
          const dynamique = normalizeScore(
            session.dynamique,
            session.dynamic_score,
          )
          const symbolique = normalizeScore(
            session.symbolique,
            session.symbolic_score,
          )

          const computedGlobal =
            [emotion, corps, conscience, dynamique, symbolique].every(
              (value) => typeof value === 'number',
            )
              ? Math.round(
                  (
                    [emotion, corps, conscience, dynamique, symbolique] as number[]
                  ).reduce((sum, value) => sum + value, 0) / 5,
                )
              : null

          const global = normalizeScore(session.global_score, computedGlobal)

          return (
            <div
              key={session.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="font-medium">
                  Séance {session.session_number ?? '—'}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatDate(session.created_at)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-6">
                <div>
                  <strong>Émotion :</strong> {scoreBadge(emotion)}
                </div>
                <div>
                  <strong>Corps :</strong> {scoreBadge(corps)}
                </div>
                <div>
                  <strong>Conscience :</strong> {scoreBadge(conscience)}
                </div>
                <div>
                  <strong>Dynamique :</strong> {scoreBadge(dynamique)}
                </div>
                <div>
                  <strong>Symbolique :</strong> {scoreBadge(symbolique)}
                </div>
                <div>
                  <strong>Global :</strong> {scoreBadge(global)}
                </div>
              </div>

              {session.notes ? (
                <div className="mt-3 text-sm text-neutral-700">
                  <strong>Notes :</strong> {session.notes}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}