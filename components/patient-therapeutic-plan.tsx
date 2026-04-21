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
}

type Props = {
  sessions: SessionItem[]
}

function normalizeScore(v?: number | null) {
  if (typeof v !== 'number') return null
  return Math.max(0, Math.min(100, Math.round(v)))
}

function computeGlobal(session: SessionItem) {
  const direct = normalizeScore(session.global_score)
  if (direct !== null) return direct

  const values = [
    normalizeScore(session.emotion ?? session.emotional_score),
    normalizeScore(session.corps ?? session.body_score),
    normalizeScore(session.conscience ?? session.consciousness_score),
    normalizeScore(session.dynamique ?? session.dynamic_score),
    normalizeScore(session.symbolique ?? session.symbolic_score),
  ]

  if (!values.every((v) => typeof v === 'number')) return null

  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / 5)
}

function getWeakDimension(session: SessionItem) {
  const dims = [
    { key: 'émotion', value: normalizeScore(session.emotion ?? session.emotional_score) },
    { key: 'corps', value: normalizeScore(session.corps ?? session.body_score) },
    { key: 'conscience', value: normalizeScore(session.conscience ?? session.consciousness_score) },
    { key: 'dynamique', value: normalizeScore(session.dynamique ?? session.dynamic_score) },
    { key: 'symbolique', value: normalizeScore(session.symbolique ?? session.symbolic_score) },
  ]

  const valid = dims.filter((d) => typeof d.value === 'number') as {
    key: string
    value: number
  }[]

  if (!valid.length) return null

  return valid.sort((a, b) => a.value - b.value)[0].key
}

function buildPlan(session: SessionItem) {
  const global = computeGlobal(session)
  const weak = getWeakDimension(session)

  // 🎯 STRATÉGIE
  let strategy = 'Séance structurée, progressive et contenante.'

  if (global !== null && global < 40) {
    strategy =
      'Séance sécurisante centrée sur la stabilisation et la réduction de la surcharge.'
  } else if (global !== null && global > 60) {
    strategy =
      'Séance d’exploration et de consolidation des acquis avec élargissement progressif.'
  }

  // 🧠 PLAN DE SÉANCE
  const steps = [
    'Accueil et mise en sécurité (cadre, rythme, présence)',
    'Phase de mobilisation adaptée (médiation principale)',
    'Temps de régulation (pause, respiration, recentrage)',
    'Phase d’élaboration (verbalisation ou symbolisation)',
    'Clôture contenant et structurée',
  ]

  // 🎯 OBJECTIFS
  const shortTerm =
    weak === 'corps'
      ? 'Renforcer l’ancrage corporel immédiat'
      : weak === 'émotion'
      ? 'Sécuriser l’expression émotionnelle'
      : weak === 'conscience'
      ? 'Soutenir la mise en sens'
      : weak === 'dynamique'
      ? 'Relancer l’engagement'
      : weak === 'symbolique'
      ? 'Réactiver la symbolisation'
      : 'Stabiliser le fonctionnement global'

  const mediumTerm =
    'Renforcer la continuité entre expérience, ressenti et élaboration.'

  const longTerm =
    'Installer une autonomie progressive dans la régulation et la symbolisation.'

  return {
    strategy,
    steps,
    shortTerm,
    mediumTerm,
    longTerm,
  }
}

export function PatientTherapeuticPlan({ sessions }: Props) {
  if (!sessions.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">
          Plan thérapeutique automatique
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible.
        </p>
      </div>
    )
  }

  const latest = sessions[0]
  const plan = buildPlan(latest)

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">
        Plan thérapeutique automatique
      </h2>

      {/* STRATÉGIE */}
      <div>
        <h3 className="font-medium">Stratégie de séance</h3>
        <p className="text-sm text-neutral-700">{plan.strategy}</p>
      </div>

      {/* PLAN */}
      <div>
        <h3 className="font-medium">Déroulé proposé</h3>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {plan.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </div>

      {/* OBJECTIFS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          <h4 className="font-medium">Court terme</h4>
          <p>{plan.shortTerm}</p>
        </div>

        <div>
          <h4 className="font-medium">Moyen terme</h4>
          <p>{plan.mediumTerm}</p>
        </div>

        <div>
          <h4 className="font-medium">Long terme</h4>
          <p>{plan.longTerm}</p>
        </div>
      </div>
    </div>
  )
}