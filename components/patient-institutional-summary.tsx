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

function getLevelLabel(score: number | null) {
  if (score === null) return 'non déterminé'
  if (score >= 80) return 'très favorable'
  if (score >= 60) return 'favorable'
  if (score >= 40) return 'intermédiaire'
  if (score >= 20) return 'fragile'
  return 'très fragile'
}

function getTrendLabel(values: number[]) {
  if (values.length < 2) return 'première évaluation'
  const delta = values[0] - values[values.length - 1]
  if (delta >= 10) return 'en progression nette'
  if (delta >= 4) return 'en amélioration'
  if (delta <= -10) return 'en régression nette'
  if (delta <= -4) return 'en fragilisation'
  return 'globalement stable'
}

function buildDimensionSnapshot(sessions: SessionItem[]) {
  const dims: Array<{ key: DimensionKey; label: string; avg: number | null }> = [
    {
      key: 'emotion',
      label: 'émotion',
      avg: average(
        sessions
          .map((s) => getDimensionValue(s, 'emotion'))
          .filter((v): v is number => typeof v === 'number'),
      ),
    },
    {
      key: 'corps',
      label: 'corps',
      avg: average(
        sessions
          .map((s) => getDimensionValue(s, 'corps'))
          .filter((v): v is number => typeof v === 'number'),
      ),
    },
    {
      key: 'conscience',
      label: 'conscience',
      avg: average(
        sessions
          .map((s) => getDimensionValue(s, 'conscience'))
          .filter((v): v is number => typeof v === 'number'),
      ),
    },
    {
      key: 'dynamique',
      label: 'dynamique',
      avg: average(
        sessions
          .map((s) => getDimensionValue(s, 'dynamique'))
          .filter((v): v is number => typeof v === 'number'),
      ),
    },
    {
      key: 'symbolique',
      label: 'symbolique',
      avg: average(
        sessions
          .map((s) => getDimensionValue(s, 'symbolique'))
          .filter((v): v is number => typeof v === 'number'),
      ),
    },
  ]

  const strongest = [...dims]
    .filter((d) => d.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0] ?? null

  const weakest = [...dims]
    .filter((d) => d.avg !== null)
    .sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999))[0] ?? null

  return { strongest, weakest }
}

function buildSupportPoints(
  strongestLabel: string | null,
  trend: string,
  latestGlobal: number | null,
) {
  const items: string[] = []

  if (latestGlobal !== null && latestGlobal >= 50) {
    items.push(
      'Mobilisation clinique actuellement possible dans un cadre structuré.',
    )
  }

  if (strongestLabel) {
    items.push(
      `Le principal point d’appui actuel semble être la dimension ${strongestLabel}.`,
    )
  }

  if (trend === 'en progression nette' || trend === 'en amélioration') {
    items.push(
      'Une dynamique évolutive favorable apparaît sur la période observée.',
    )
  }

  if (!items.length) {
    items.push(
      'Des ressources restent mobilisables sous réserve d’un cadre progressif et ajusté.',
    )
  }

  return items
}

function buildVigilancePoints(
  weakestLabel: string | null,
  latestGlobal: number | null,
  trend: string,
) {
  const items: string[] = []

  if (latestGlobal !== null && latestGlobal < 40) {
    items.push(
      'Le niveau global récent reste fragile et justifie une attention soutenue.',
    )
  }

  if (weakestLabel) {
    items.push(
      `La dimension la plus vulnérable actuellement concerne ${weakestLabel}.`,
    )
  }

  if (trend === 'en fragilisation' || trend === 'en régression nette') {
    items.push(
      'Une dégradation récente justifie une vigilance renforcée sur le rythme et le cadre.',
    )
  }

  if (!items.length) {
    items.push(
      'Pas de signal critique majeur, mais la stabilité clinique doit rester surveillée.',
    )
  }

  return items
}

function buildOrientation(
  weakestLabel: string | null,
  latestGlobal: number | null,
) {
  if (weakestLabel === 'corps') {
    return 'Poursuivre un travail centré sur l’ancrage corporel, la contenance sensorielle et la stabilisation de présence.'
  }
  if (weakestLabel === 'émotion') {
    return 'Privilégier des médiations soutenant la régulation émotionnelle dans un cadre contenant et progressif.'
  }
  if (weakestLabel === 'conscience') {
    return 'Renforcer les temps de reprise, de liaison et de mise en sens à partir de supports concrets.'
  }
  if (weakestLabel === 'dynamique') {
    return 'Soutenir l’engagement par des séquences courtes, structurées et fortement étayées.'
  }
  if (weakestLabel === 'symbolique') {
    return 'Favoriser des supports imagés, narratifs ou créatifs pour relancer la symbolisation.'
  }
  if (latestGlobal !== null && latestGlobal >= 60) {
    return 'Consolider les acquis actuels tout en renforçant progressivement les dimensions plus hétérogènes.'
  }
  return 'Maintenir un cadre de soin structurant, prudent et évolutif, avec réévaluation régulière.'
}

function buildShortSummary(
  sessionCount: number,
  latestGlobal: number | null,
  trend: string,
  strongestLabel: string | null,
  weakestLabel: string | null,
) {
  return `Sur ${sessionCount} séance(s) analysée(s), le patient présente un niveau global ${
    latestGlobal !== null ? `${latestGlobal}/100` : 'non déterminé'
  }, ${trend}. Le principal appui repéré concerne ${
    strongestLabel ?? 'une ressource non clairement déterminée'
  }, tandis que le point de vigilance principal porte sur ${
    weakestLabel ?? 'une fragilité encore à préciser'
  }.`
}

export function PatientInstitutionalSummary({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const globals = ordered
    .map(computeGlobal)
    .filter((v): v is number => typeof v === 'number')

  const latestGlobal = ordered[0] ? computeGlobal(ordered[0]) : null
  const trend = getTrendLabel(globals)
  const { strongest, weakest } = buildDimensionSnapshot(ordered)

  const strongestLabel = strongest?.label ?? null
  const weakestLabel = weakest?.label ?? null

  const supportPoints = buildSupportPoints(
    strongestLabel,
    trend,
    latestGlobal,
  )
  const vigilancePoints = buildVigilancePoints(
    weakestLabel,
    latestGlobal,
    trend,
  )
  const orientation = buildOrientation(weakestLabel, latestGlobal)
  const shortSummary = buildShortSummary(
    ordered.length,
    latestGlobal,
    trend,
    strongestLabel,
    weakestLabel,
  )

  if (!ordered.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Coordination / synthèse institutionnelle
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour générer une synthèse institutionnelle.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Coordination / synthèse institutionnelle
      </h2>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-2 text-base font-semibold">
          Version courte partageable
        </h3>
        <p className="text-sm text-neutral-700">{shortSummary}</p>
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
          <h3 className="mb-3 text-base font-semibold">Orientation proposée</h3>
          <p className="text-sm text-neutral-700">{orientation}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-base font-semibold">Repères rapides</h3>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
          <div>
            <div className="text-neutral-500">Niveau global</div>
            <div className="font-medium">
              {latestGlobal !== null ? `${latestGlobal}/100` : '—'}
            </div>
            <div className="text-neutral-600">
              {getLevelLabel(latestGlobal)}
            </div>
          </div>

          <div>
            <div className="text-neutral-500">Tendance</div>
            <div className="font-medium">{trend}</div>
          </div>

          <div>
            <div className="text-neutral-500">Point d’appui principal</div>
            <div className="font-medium">{strongestLabel ?? '—'}</div>
          </div>

          <div>
            <div className="text-neutral-500">
              Point de vigilance principal
            </div>
            <div className="font-medium">{weakestLabel ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}