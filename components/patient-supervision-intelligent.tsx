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

function computeGlobal(session: SessionItem): number | null {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const values = [
    normalizeScore(session.emotion, session.emotional_score),
    normalizeScore(session.corps, session.body_score),
    normalizeScore(session.conscience, session.consciousness_score),
    normalizeScore(session.dynamique, session.dynamic_score),
    normalizeScore(session.symbolique, session.symbolic_score),
  ]

  if (!values.every((v) => typeof v === 'number')) return null
  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
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

function computeTrend(values: number[]) {
  if (values.length < 2) return { label: 'Première évaluation', delta: null as number | null }

  const latest = values[0]
  const oldest = values[values.length - 1]
  const delta = latest - oldest

  if (delta >= 12) return { label: 'Progression nette', delta }
  if (delta >= 4) return { label: 'Progression modérée', delta }
  if (delta <= -12) return { label: 'Régression nette', delta }
  if (delta <= -4) return { label: 'Fragilisation progressive', delta }
  return { label: 'Stabilité relative', delta }
}

function getDominantFragility(sessions: SessionItem[]) {
  const labels: Record<DimensionKey, string> = {
    emotion: 'émotion',
    corps: 'corps',
    conscience: 'conscience',
    dynamique: 'dynamique',
    symbolique: 'symbolique',
  }

  const dimensions = (Object.keys(labels) as DimensionKey[]).map((key) => {
    const values = sessions
      .map((s) => getDimensionValue(s, key))
      .filter((v): v is number => typeof v === 'number')

    return {
      key,
      label: labels[key],
      average: average(values),
      amplitude: range(values),
    }
  })

  const fragile = [...dimensions]
    .filter((d) => d.average !== null)
    .sort((a, b) => (a.average ?? 999) - (b.average ?? 999))[0] ?? null

  return fragile
}

function getMainRisk(globals: number[], fragilityLabel: string | null) {
  if (!globals.length) return 'Risque non déterminé'

  const latest = globals[0]
  const amplitude = range(globals) ?? 0

  if (latest < 35) {
    return 'Risque de désorganisation ou de surcharge clinique en cas de sollicitation excessive'
  }

  if (amplitude >= 25) {
    return 'Risque d’instabilité clinique avec fluctuations importantes d’une séance à l’autre'
  }

  if (fragilityLabel === 'dynamique') {
    return 'Risque de désengagement thérapeutique progressif'
  }

  if (fragilityLabel === 'corps') {
    return 'Risque de retrait ou de surcharge via une disponibilité corporelle insuffisante'
  }

  if (fragilityLabel === 'émotion') {
    return 'Risque de débordement ou d’inhibition émotionnelle selon le niveau de sollicitation'
  }

  if (fragilityLabel === 'symbolique') {
    return 'Risque de limitation de la symbolisation et de la mise en représentation'
  }

  return 'Risque modéré nécessitant surtout une surveillance de la continuité clinique'
}

function buildSupervisionProposal(
  globals: number[],
  fragilityLabel: string | null,
  trendLabel: string,
) {
  const latest = globals[0] ?? null

  if (latest !== null && latest < 40) {
    return "En supervision, travailler d'abord la juste intensité du cadre, la tolérance clinique du patient et les conditions minimales de sécurité thérapeutique."
  }

  if (trendLabel.includes('Régression') || trendLabel.includes('Fragilisation')) {
    return "En supervision, interroger ce qui, dans le rythme, le dispositif ou les médiations, pourrait majorer la fragilité récente et ajuster l'étayage."
  }

  if (fragilityLabel === 'conscience') {
    return "En supervision, réfléchir à la place des temps de reprise et à la manière de soutenir la mise en sens sans sur-solliciter la réflexion."
  }

  if (fragilityLabel === 'dynamique') {
    return "En supervision, penser la gradation de l'engagement thérapeutique et les leviers concrets permettant de relancer l'initiative du patient."
  }

  if (fragilityLabel === 'symbolique') {
    return "En supervision, ajuster les médiations pour favoriser davantage la trace, l'image, la narration ou la transformation symbolique."
  }

  return "En supervision, consolider les points d'appui déjà présents tout en maintenant une vigilance sur la dimension la plus fragile."
}

function buildCaseDynamics(globals: number[], trendLabel: string, fragilityLabel: string | null) {
  const avg = average(globals)
  const amplitude = range(globals)

  if (!globals.length) {
    return "Aucune dynamique de cas n'est actuellement lisible."
  }

  return `Le cas se présente actuellement sur un mode ${
    avg !== null ? `global moyen à ${avg}/100` : 'non quantifiable'
  }, avec une dynamique décrite comme ${trendLabel.toLowerCase()} et une variabilité ${
    amplitude !== null ? `${amplitude} points` : 'non déterminée'
  }. La zone la plus sensible concerne ${
    fragilityLabel ?? 'un axe encore à préciser'
  }.`
}

export function PatientSupervisionIntelligent({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const globals = ordered
    .map(computeGlobal)
    .filter((v): v is number => typeof v === 'number')

  const trend = computeTrend(globals)
  const fragility = getDominantFragility(ordered)
  const fragilityLabel = fragility?.label ?? null
  const stability =
    (range(globals) ?? 0) >= 25
      ? 'Instabilité élevée'
      : (range(globals) ?? 0) >= 12
      ? 'Stabilité relative'
      : 'Bonne stabilité'

  const dynamics = buildCaseDynamics(globals, trend.label, fragilityLabel)
  const mainRisk = getMainRisk(globals, fragilityLabel)
  const supervisionProposal = buildSupervisionProposal(
    globals,
    fragilityLabel,
    trend.label,
  )

  if (!ordered.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Supervision intelligente multi-séances
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour produire une lecture de supervision.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Supervision intelligente multi-séances
      </h2>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-2 text-base font-semibold">Dynamique de cas</h3>
        <p className="text-sm text-neutral-700">{dynamics}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">Tendance clinique</div>
          <div className="mt-1 text-base font-semibold">{trend.label}</div>
          <div className="mt-1 text-sm text-neutral-600">
            Variation : {trend.delta !== null ? `${trend.delta > 0 ? '+' : ''}${trend.delta}` : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">Stabilité</div>
          <div className="mt-1 text-base font-semibold">{stability}</div>
          <div className="mt-1 text-sm text-neutral-600">
            Amplitude : {range(globals) !== null ? `${range(globals)} points` : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">Axe principal de travail</div>
          <div className="mt-1 text-base font-semibold capitalize">
            {fragilityLabel ?? 'Non déterminé'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-base font-semibold">Risque clinique dominant</h3>
          <p className="text-sm text-neutral-700">{mainRisk}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-base font-semibold">Proposition de supervision</h3>
          <p className="text-sm text-neutral-700">{supervisionProposal}</p>
        </div>
      </div>
    </div>
  )
}