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
  if (!values.every((v) => typeof v === 'number')) return null

  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function standardRange(values: number[]) {
  if (!values.length) return null
  return Math.max(...values) - Math.min(...values)
}

function computeSlope(values: number[]) {
  if (values.length < 2) return null

  const first = values[values.length - 1]
  const last = values[0]
  return last - first
}

function getTrendLabel(slope: number | null) {
  if (slope === null) return 'Données insuffisantes'
  if (slope >= 15) return 'Amélioration forte'
  if (slope >= 6) return 'Amélioration progressive'
  if (slope <= -15) return 'Régression forte'
  if (slope <= -6) return 'Régression progressive'
  return 'Tendance globalement stable'
}

function getVariabilityLabel(range: number | null) {
  if (range === null) return 'Non calculable'
  if (range >= 25) return 'Très variable'
  if (range >= 12) return 'Variable'
  return 'Plutôt stable'
}

function getClinicalLevel(avg: number | null) {
  if (avg === null) return 'Non déterminé'
  if (avg >= 80) return 'Très favorable'
  if (avg >= 60) return 'Favorable'
  if (avg >= 40) return 'Intermédiaire'
  if (avg >= 20) return 'Fragile'
  return 'Très fragile'
}

function getRecentAlert(values: number[]) {
  if (values.length < 3) return null

  const latest = values[0]
  const previous = values[1]
  const older = values[2]

  if (
    latest <= previous - 8 &&
    previous <= older - 2
  ) {
    return 'Baisse récente sur les trois dernières séances'
  }

  if (latest <= 30) {
    return 'Dernier niveau global fragile'
  }

  return null
}

export function PatientLongitudinalInsights({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const globals = ordered
    .map(computeGlobal)
    .filter((v): v is number => typeof v === 'number')

  const avg = average(globals)
  const range = standardRange(globals)
  const slope = computeSlope(globals)
  const best = globals.length ? Math.max(...globals) : null
  const worst = globals.length ? Math.min(...globals) : null
  const recentAlert = getRecentAlert(globals)

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Lecture expert longitudinale
      </h2>

      {!globals.length ? (
        <p className="text-sm text-neutral-500">
          Pas assez de données pour une lecture longitudinale.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Moyenne longitudinale</div>
              <div className="mt-1 text-2xl font-bold">
                {avg !== null ? `${avg}/100` : '—'}
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {getClinicalLevel(avg)}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Tendance générale</div>
              <div className="mt-1 text-base font-semibold">
                {getTrendLabel(slope)}
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Variation cumulée : {slope !== null ? `${slope > 0 ? '+' : ''}${slope}` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Variabilité</div>
              <div className="mt-1 text-base font-semibold">
                {getVariabilityLabel(range)}
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Amplitude : {range !== null ? `${range} points` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Meilleur niveau</div>
              <div className="mt-1 text-2xl font-bold">
                {best !== null ? `${best}/100` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Niveau le plus bas</div>
              <div className="mt-1 text-2xl font-bold">
                {worst !== null ? `${worst}/100` : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="text-sm text-neutral-500">Séances analysées</div>
              <div className="mt-1 text-2xl font-bold">
                {globals.length}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Lecture clinique</div>
            <div className="mt-2 text-sm text-neutral-700">
              {globals.length < 3 ? (
                <p>
                  Les données commencent à être exploitables, mais une analyse
                  longitudinale devient vraiment pertinente à partir de plusieurs
                  séances successives.
                </p>
              ) : (
                <p>
                  Le patient présente un niveau moyen{' '}
                  <strong>{avg !== null ? `${avg}/100` : '—'}</strong>, avec une
                  trajectoire décrite comme{' '}
                  <strong>{getTrendLabel(slope).toLowerCase()}</strong> et une
                  variabilité <strong>{getVariabilityLabel(range).toLowerCase()}</strong>.
                </p>
              )}
            </div>

            {recentAlert ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                ⚠️ {recentAlert}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}