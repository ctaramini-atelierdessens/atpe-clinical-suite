'use client'

type SessionItem = {
  id: string
  created_at?: string | null
  notes?: string | null
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

function getLevel(score: number | null) {
  if (score === null) return 'non déterminé'
  if (score >= 80) return 'très favorable'
  if (score >= 60) return 'favorable'
  if (score >= 40) return 'intermédiaire'
  if (score >= 20) return 'fragile'
  return 'très fragile'
}

function buildExpressionalSummary(session?: SessionItem | null) {
  if (!session) {
    return {
      summary:
        "Aucune séance n'est disponible pour produire un bilan expressionnel.",
      expression: 'non déterminée',
      mediation: 'à préciser',
      vigilance: 'à préciser',
    }
  }

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
  const global = computeGlobal(session)

  let expression = 'expression nuancée mais encore hétérogène'
  let mediation = 'médiations progressives et contenantes'
  let vigilance =
    "surveiller l'équilibre entre mobilisation, sécurité et mise en sens"

  if ((emotion ?? 0) < 40 && (symbolique ?? 0) < 40) {
    expression =
      "expression encore limitée, avec difficulté d'accès à l’émotion et à la symbolisation"
    mediation =
      'supports imagés, créatifs ou sensoriels, peu confrontants, à faible surcharge'
    vigilance =
      "éviter de solliciter trop directement l'expression émotionnelle ou l'abstraction"
  } else if ((emotion ?? 0) >= 60 && (symbolique ?? 0) >= 60) {
    expression =
      'expression relativement accessible, avec possibilité de mise en forme émotionnelle et symbolique'
    mediation =
      'médiations expressives, narratives ou créatives pouvant soutenir une élaboration plus riche'
    vigilance =
      "rester attentif à la stabilité du cadre pour ne pas majorer l'intensité émotionnelle"
  } else if ((corps ?? 0) < 40) {
    expression =
      "expression entravée par une fragilité de l'ancrage corporel"
    mediation =
      'appuis corporels, respiratoires et sensoriels avant toute demande expressive plus élaborée'
    vigilance =
      'éviter les sollicitations trop rapides qui dépasseraient la disponibilité corporelle'
  } else if ((dynamique ?? 0) < 40) {
    expression =
      "expression freinée par une difficulté d'engagement ou de mise en mouvement"
    mediation =
      'séquences courtes, structurées, progressives, avec renforcement des initiatives'
    vigilance =
      "éviter les dispositifs longs ou trop ouverts qui pourraient majorer le retrait"
  }

  const summary = `Le bilan expressionnel actuel évoque une modalité d'expression ${expression}, dans un contexte global ${getLevel(
    global,
  )}. Le travail thérapeutique semble bénéficier de ${mediation}. La vigilance principale porte sur le fait de ${vigilance}.`

  return {
    summary,
    expression,
    mediation,
    vigilance,
  }
}

export function PatientExpressionalSummary({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const latest = ordered[0] ?? null
  const data = buildExpressionalSummary(latest)

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Bilan expressionnel</h2>

      <div className="rounded-xl border border-neutral-200 p-4">
        <p className="text-sm text-neutral-700">{data.summary}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">Expression</div>
          <div className="mt-1 text-sm font-medium text-neutral-800">
            {data.expression}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">
            Médiations à privilégier
          </div>
          <div className="mt-1 text-sm font-medium text-neutral-800">
            {data.mediation}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-500">Vigilance</div>
          <div className="mt-1 text-sm font-medium text-neutral-800">
            {data.vigilance}
          </div>
        </div>
      </div>
    </div>
  )
}