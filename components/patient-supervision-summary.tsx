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
  global_score?: number | null
  notes?: string | null
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

type DimensionStat = {
  key: DimensionKey
  label: string
  latest: number | null
  average: number | null
  delta: number | null
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

function computeGlobal(session: SessionItem): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const values = [
    getDimensionValue(session, 'emotion'),
    getDimensionValue(session, 'corps'),
    getDimensionValue(session, 'conscience'),
    getDimensionValue(session, 'dynamique'),
    getDimensionValue(session, 'symbolique'),
  ]

  if (!values.every((v) => typeof v === 'number')) return null
  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function buildDimensionStats(sessions: SessionItem[]): DimensionStat[] {
  const labels: Record<DimensionKey, string> = {
    emotion: 'Émotion',
    corps: 'Corps',
    conscience: 'Conscience',
    dynamique: 'Dynamique',
    symbolique: 'Symbolique',
  }

  return (Object.keys(labels) as DimensionKey[]).map((key) => {
    const values = sessions
      .map((session) => getDimensionValue(session, key))
      .filter((v): v is number => typeof v === 'number')

    const latest = sessions[0] ? getDimensionValue(sessions[0], key) : null
    const previous = sessions[1] ? getDimensionValue(sessions[1], key) : null
    const delta =
      latest !== null && previous !== null ? latest - previous : null

    return {
      key,
      label: labels[key],
      latest,
      average: average(values),
      delta,
    }
  })
}

function formatScore(value: number | null) {
  return value === null ? '—' : `${value}/100`
}

function buildSupportPoints(stats: DimensionStat[], latestGlobal: number | null) {
  const items: string[] = []

  const strong = stats.filter((s) => (s.latest ?? 0) >= 60)
  const improving = stats.filter((s) => (s.delta ?? 0) >= 5)

  if (latestGlobal !== null && latestGlobal >= 60) {
    items.push('Le niveau global récent constitue un appui clinique exploitable.')
  }

  if (strong.length) {
    items.push(
      `Les dimensions les plus disponibles actuellement sont : ${strong
        .map((s) => s.label.toLowerCase())
        .join(', ')}.`,
    )
  }

  if (improving.length) {
    items.push(
      `Des signes de progression apparaissent sur : ${improving
        .map((s) => s.label.toLowerCase())
        .join(', ')}.`,
    )
  }

  if (!items.length) {
    items.push(
      "Quelques appuis demeurent mobilisables à condition de conserver un cadre contenant et progressif.",
    )
  }

  return items
}

function buildVigilancePoints(stats: DimensionStat[], latestGlobal: number | null) {
  const items: string[] = []

  const fragile = stats.filter((s) => (s.latest ?? 999) < 40)
  const dropping = stats.filter((s) => (s.delta ?? 0) <= -5)

  if (latestGlobal !== null && latestGlobal < 40) {
    items.push('Le niveau global récent reste fragile et demande un cadrage prudent.')
  }

  if (fragile.length) {
    items.push(
      `Les dimensions les plus fragiles actuellement sont : ${fragile
        .map((s) => s.label.toLowerCase())
        .join(', ')}.`,
    )
  }

  if (dropping.length) {
    items.push(
      `Une baisse récente est observée sur : ${dropping
        .map((s) => s.label.toLowerCase())
        .join(', ')}.`,
    )
  }

  if (!items.length) {
    items.push(
      "Aucune alerte dimensionnelle majeure ne ressort, mais la stabilité reste à surveiller dans la durée.",
    )
  }

  return items
}

function buildHypotheses(stats: DimensionStat[], latestGlobal: number | null) {
  const items: string[] = []

  const weakest = [...stats]
    .filter((s) => s.latest !== null)
    .sort((a, b) => (a.latest ?? 999) - (b.latest ?? 999))[0]

  if (weakest?.key === 'corps') {
    items.push(
      "Une fragilité de l’ancrage corporel pourrait limiter la disponibilité relationnelle et l’engagement thérapeutique.",
    )
  }

  if (weakest?.key === 'emotion') {
    items.push(
      "La régulation émotionnelle semble possiblement insuffisante, ce qui peut nécessiter davantage de contenance avant l’élaboration.",
    )
  }

  if (weakest?.key === 'conscience') {
    items.push(
      "La mise en sens paraît encore fragile ; un étayage de verbalisation et de liaison expérience-représentation semble indiqué.",
    )
  }

  if (weakest?.key === 'dynamique') {
    items.push(
      "Le ralentissement de la dynamique peut refléter une fatigabilité, un retrait ou une difficulté à soutenir l’initiative.",
    )
  }

  if (weakest?.key === 'symbolique') {
    items.push(
      "L’accès symbolique paraît à soutenir, possiblement par des médiations plus imagées, concrètes ou narratives.",
    )
  }

  if (latestGlobal !== null && latestGlobal >= 60) {
    items.push(
      "Malgré certaines fragilités localisées, le niveau global laisse penser qu’un travail de consolidation peut être engagé.",
    )
  }

  if (!items.length) {
    items.push(
      "Les éléments disponibles invitent surtout à poursuivre l’observation clinique et à affiner les hypothèses dans la continuité des séances.",
    )
  }

  return items
}

function buildSummary(
  stats: DimensionStat[],
  latestGlobal: number | null,
  sessionCount: number,
) {
  const best = [...stats]
    .filter((s) => s.latest !== null)
    .sort((a, b) => (b.latest ?? 0) - (a.latest ?? 0))[0]

  const weak = [...stats]
    .filter((s) => s.latest !== null)
    .sort((a, b) => (a.latest ?? 999) - (b.latest ?? 999))[0]

  if (sessionCount === 0) {
    return "Aucune donnée de séance n'est disponible pour la supervision."
  }

  return `Sur ${sessionCount} séance(s) analysée(s), le patient présente un niveau global ${
    latestGlobal !== null ? `${latestGlobal}/100` : 'non déterminé'
  }. La dimension actuellement la plus disponible semble être ${
    best ? best.label.toLowerCase() : 'non déterminée'
  }, tandis que la plus fragile paraît être ${
    weak ? weak.label.toLowerCase() : 'non déterminée'
  }. La supervision peut donc s’orienter vers un ajustement du cadre et des médiations autour de cette zone de fragilité principale, tout en s’appuyant sur les ressources les plus accessibles.`
}

export function PatientSupervisionSummary({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const latestGlobal = ordered[0] ? computeGlobal(ordered[0]) : null
  const stats = buildDimensionStats(ordered)
  const supportPoints = buildSupportPoints(stats, latestGlobal)
  const vigilancePoints = buildVigilancePoints(stats, latestGlobal)
  const hypotheses = buildHypotheses(stats, latestGlobal)
  const summary = buildSummary(stats, latestGlobal, ordered.length)

  if (!ordered.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Supervision clinique
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour produire une synthèse de supervision.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Supervision clinique</h2>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-2 text-base font-semibold">
          Synthèse automatique pour réunion / supervision
        </h3>
        <p className="text-sm text-neutral-700">{summary}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 text-base font-semibold">Points d’appui</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            {supportPoints.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 text-base font-semibold">Points de vigilance</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            {vigilancePoints.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-3 text-base font-semibold">Hypothèses cliniques</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            {hypotheses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-base font-semibold">Repères dimensionnels</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-neutral-200 p-3 text-sm"
            >
              <div className="font-medium">{item.label}</div>
              <div className="mt-1 text-neutral-600">
                Dernière : {formatScore(item.latest)}
              </div>
              <div className="text-neutral-600">
                Moyenne : {formatScore(item.average)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}