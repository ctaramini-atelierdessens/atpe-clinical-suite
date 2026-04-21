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
}

type Props = {
  sessions: SessionItem[]
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

function computeGlobal(session: SessionItem): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const emotion = normalizeScore(session.emotion, session.emotional_score)
  const corps = normalizeScore(session.corps, session.body_score)
  const conscience = normalizeScore(
    session.conscience,
    session.consciousness_score,
  )
  const dynamique = normalizeScore(session.dynamique, session.dynamic_score)
  const symbolique = normalizeScore(
    session.symbolique,
    session.symbolic_score,
  )

  const values = [emotion, corps, conscience, dynamique, symbolique]

  if (!values.every((value) => typeof value === 'number')) return null

  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function getTrend(delta: number | null) {
  if (delta === null) {
    return {
      label: 'Première évaluation',
      tone: 'text-neutral-600',
    }
  }

  if (delta >= 10) {
    return {
      label: 'Amélioration nette',
      tone: 'text-green-600',
    }
  }

  if (delta >= 3) {
    return {
      label: 'Amélioration légère',
      tone: 'text-green-600',
    }
  }

  if (delta <= -10) {
    return {
      label: 'Régression nette',
      tone: 'text-red-600',
    }
  }

  if (delta <= -3) {
    return {
      label: 'Régression légère',
      tone: 'text-red-600',
    }
  }

  return {
    label: 'Stabilité',
    tone: 'text-amber-600',
  }
}

function formatDelta(delta: number | null) {
  if (delta === null) return '—'
  return `${delta > 0 ? '+' : ''}${delta}`
}

export function PatientGlobalEvolutionCard({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const latest = ordered[0] ?? null
  const previous = ordered[1] ?? null

  const latestGlobal = latest ? computeGlobal(latest) : null
  const previousGlobal = previous ? computeGlobal(previous) : null

  const delta =
    latestGlobal !== null && previousGlobal !== null
      ? latestGlobal - previousGlobal
      : null

  const trend = getTrend(delta)

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Score global évolutif</h2>

      {!latest ? (
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour calculer l’évolution.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Dernier score global</div>
              <div className="mt-1 text-2xl font-bold">
                {latestGlobal !== null ? `${latestGlobal}/100` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Score précédent</div>
              <div className="mt-1 text-2xl font-bold">
                {previousGlobal !== null ? `${previousGlobal}/100` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Variation</div>
              <div className="mt-1 text-2xl font-bold">
                {formatDelta(delta)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Lecture clinique</div>
            <div className={`mt-1 text-base font-semibold ${trend.tone}`}>
              {trend.label}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}