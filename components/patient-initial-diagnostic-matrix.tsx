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

type DimensionKey =
  | 'emotion'
  | 'corps'
  | 'conscience'
  | 'dynamique'
  | 'symbolique'

type MatrixRow = {
  dimension: string
  priority: 'haute' | 'moyenne' | 'basse'
  initialFinding: string
  shortObjective: string
  shortSubObjectives: string[]
  mediumObjective: string
  mediumSubObjectives: string[]
  longObjective: string
  longSubObjectives: string[]
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

function getDimensionAverage(sessions: SessionItem[], key: DimensionKey) {
  const values = sessions
    .map((s) => getDimensionValue(s, key))
    .filter((v): v is number => typeof v === 'number')

  return average(values)
}

function getPriority(score: number | null): MatrixRow['priority'] {
  if (score === null) return 'moyenne'
  if (score < 40) return 'haute'
  if (score < 60) return 'moyenne'
  return 'basse'
}

function buildRow(
  dimension: DimensionKey,
  label: string,
  score: number | null,
): MatrixRow {
  const priority = getPriority(score)

  if (dimension === 'emotion') {
    return {
      dimension: label,
      priority,
      initialFinding:
        score !== null && score < 40
          ? "Expression émotionnelle limitée ou peu régulée."
          : 'Mobilisation émotionnelle partiellement ou globalement accessible.',
      shortObjective:
        'Sécuriser et rendre possible une expression émotionnelle tolérable.',
      shortSubObjectives: [
        'Installer un cadre contenant et prévisible.',
        'Repérer les signes de surcharge ou de retrait émotionnel.',
        'Favoriser une expression brève sans mise en tension excessive.',
      ],
      mediumObjective:
        "Renforcer l'identification et la régulation émotionnelle.",
      mediumSubObjectives: [
        'Relier ressenti, contexte et médiation utilisée.',
        "Soutenir la mise en mots d'états émotionnels simples.",
        'Développer la tolérance aux variations affectives en séance.',
      ],
      longObjective:
        'Stabiliser une expression émotionnelle intégrée dans la relation thérapeutique.',
      longSubObjectives: [
        'Favoriser une expression plus nuancée.',
        'Renforcer la continuité émotionnelle entre les séances.',
        'Permettre une meilleure articulation entre émotion, relation et représentation.',
      ],
    }
  }

  if (dimension === 'corps') {
    return {
      dimension: label,
      priority,
      initialFinding:
        score !== null && score < 40
          ? 'Ancrage corporel fragile, disponibilité corporelle réduite.'
          : 'Présence corporelle partiellement ou correctement mobilisable.',
      shortObjective: "Renforcer la sécurité corporelle et l'ancrage.",
      shortSubObjectives: [
        'Stabiliser la posture et le rythme respiratoire.',
        'Soutenir une perception corporelle plus contenue.',
        'Réduire le retrait ou la dispersion tonique.',
      ],
      mediumObjective:
        'Développer la continuité entre corps, présence et engagement.',
      mediumSubObjectives: [
        'Appuyer des médiations corporelles simples et répétables.',
        'Renforcer la disponibilité tonico-posturale.',
        'Installer des repères corporels stables en séance.',
      ],
      longObjective:
        'Intégrer le corps comme support stable du travail thérapeutique.',
      longSubObjectives: [
        'Favoriser une présence incarnée plus continue.',
        'Renforcer le lien entre ressenti corporel et expression.',
        "Soutenir la continuité entre ancrage corporel et élaboration clinique.",
      ],
    }
  }

  if (dimension === 'conscience') {
    return {
      dimension: label,
      priority,
      initialFinding:
        score !== null && score < 40
          ? 'Mise en sens et élaboration encore fragiles.'
          : 'Capacité de reprise et de compréhension partiellement accessible.',
      shortObjective: "Soutenir la lisibilité de l'expérience vécue.",
      shortSubObjectives: [
        'Mettre en lien ce qui est fait, ressenti et observé.',
        'Réduire la confusion ou la discontinuité de sens.',
        'Proposer des reprises courtes et concrètes.',
      ],
      mediumObjective:
        'Renforcer la capacité de liaison entre vécu et représentation.',
      mediumSubObjectives: [
        "Développer la verbalisation guidée de l'expérience.",
        'Structurer les liens entre séance, ressenti et évolution.',
        'Soutenir une compréhension progressive de ce qui se joue en thérapie.',
      ],
      longObjective: 'Installer une élaboration plus autonome et stable.',
      longSubObjectives: [
        'Favoriser une appropriation subjective des processus thérapeutiques.',
        'Renforcer la capacité de recul clinique.',
        'Soutenir une continuité réflexive dans le temps.',
      ],
    }
  }

  if (dimension === 'dynamique') {
    return {
      dimension: label,
      priority,
      initialFinding:
        score !== null && score < 40
          ? "Difficulté d'engagement, élan thérapeutique freiné."
          : 'Dynamique de participation présente mais à stabiliser.',
      shortObjective: 'Réamorcer un engagement thérapeutique soutenable.',
      shortSubObjectives: [
        'Proposer des tâches courtes et accessibles.',
        "Soutenir l'initiative sans surcharge.",
        'Renforcer les micro-signaux de participation.',
      ],
      mediumObjective: "Stabiliser l'implication dans la séance.",
      mediumSubObjectives: [
        'Structurer un rythme de séance lisible.',
        'Développer la continuité de participation.',
        "Réduire les ruptures d'engagement.",
      ],
      longObjective: 'Consolider une dynamique thérapeutique plus autonome.',
      longSubObjectives: [
        "Favoriser une implication plus régulière dans le travail thérapeutique.",
        'Renforcer la continuité motivationnelle.',
        'Soutenir la participation active dans la durée.',
      ],
    }
  }

  return {
    dimension: label,
    priority,
    initialFinding:
      score !== null && score < 40
        ? 'Accès symbolique ou représentatif limité.'
        : 'Ressources symboliques partiellement accessibles.',
    shortObjective:
      'Réouvrir un espace de représentation et de symbolisation.',
    shortSubObjectives: [
      'Mobiliser des supports imagés ou concrets.',
      'Soutenir la trace, la forme ou la narration simple.',
      'Réduire la rupture entre vécu et représentation.',
    ],
    mediumObjective:
      "Développer la capacité à transformer l'expérience en matériau symbolique.",
    mediumSubObjectives: [
      'Renforcer les médiations créatives ou narratives.',
      'Soutenir la continuité entre image, affect et sens.',
      "Permettre une mise en forme plus stable de l'expérience.",
    ],
    longObjective: 'Consolider une fonction symbolique plus intégrée.',
    longSubObjectives: [
      'Renforcer la continuité identitaire.',
      'Développer la capacité de représentation différenciée.',
      'Soutenir une élaboration plus souple et plus riche.',
    ],
  }
}

function priorityStyle(priority: MatrixRow['priority']) {
  switch (priority) {
    case 'haute':
      return 'border-red-200 bg-red-50 text-red-700'
    case 'moyenne':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'basse':
      return 'border-green-200 bg-green-50 text-green-700'
    default:
      return 'border-neutral-200 bg-neutral-50 text-neutral-700'
  }
}

export function PatientInitialDiagnosticMatrix({ sessions }: Props) {
  const ordered = [...sessions].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return db - da
  })

  const rows = [
    buildRow('emotion', 'Émotion', getDimensionAverage(ordered, 'emotion')),
    buildRow('corps', 'Corps', getDimensionAverage(ordered, 'corps')),
    buildRow(
      'conscience',
      'Conscience',
      getDimensionAverage(ordered, 'conscience'),
    ),
    buildRow(
      'dynamique',
      'Dynamique',
      getDimensionAverage(ordered, 'dynamique'),
    ),
    buildRow(
      'symbolique',
      'Symbolique',
      getDimensionAverage(ordered, 'symbolique'),
    ),
  ]

  if (!ordered.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Diagnostic initial — matrice objectifs / sous-objectifs
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour compléter la matrice diagnostique.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Diagnostic initial — matrice objectifs / sous-objectifs
      </h2>

      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.dimension}
            className="rounded-xl border border-neutral-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="font-semibold">{row.dimension}</div>
              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityStyle(
                  row.priority,
                )}`}
              >
                Priorité {row.priority}
              </div>
            </div>

            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                <strong>Constat initial :</strong> {row.initialFinding}
              </p>

              <div>
                <p>
                  <strong>Objectif court terme :</strong> {row.shortObjective}
                </p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  {row.shortSubObjectives.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p>
                  <strong>Objectif moyen terme :</strong> {row.mediumObjective}
                </p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  {row.mediumSubObjectives.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p>
                  <strong>Objectif long terme :</strong> {row.longObjective}
                </p>
                <ul className="ml-5 mt-1 list-disc space-y-1">
                  {row.longSubObjectives.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}