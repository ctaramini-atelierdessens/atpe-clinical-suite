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

type Recommendation = {
  key: DimensionKey
  label: string
  latest: number | null
  average: number | null
  priority: 'haute' | 'moyenne' | 'basse'
  objective: string
  action: string
  vigilance: string
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

function buildRecommendation(
  key: DimensionKey,
  label: string,
  sessions: SessionItem[],
): Recommendation {
  const latest = sessions[0] ? getDimensionValue(sessions[0], key) : null
  const values = sessions
    .map((session) => getDimensionValue(session, key))
    .filter((v): v is number => typeof v === 'number')

  const avg = average(values)

  if (key === 'emotion') {
    if ((latest ?? avg ?? 50) < 40) {
      return {
        key,
        label,
        latest,
        average: avg,
        priority: 'haute',
        objective: 'Réactiver la mobilisation émotionnelle sécurisée',
        action:
          'Proposer des médiations contenant l’expression émotionnelle sans surcharge, avec verbalisation brève et rythme progressif.',
        vigilance:
          'Éviter la confrontation émotionnelle trop directe ou les stimulations trop denses.',
      }
    }

    return {
      key,
      label,
      latest,
      average: avg,
      priority: 'basse',
      objective: 'Maintenir la disponibilité émotionnelle',
      action:
        'Soutenir l’expression émotionnelle déjà accessible avec des repères stables et des retours de mise en sens.',
      vigilance:
        'Surveiller les variations brusques si le niveau émotionnel devient instable.',
    }
  }

  if (key === 'corps') {
    if ((latest ?? avg ?? 50) < 40) {
      return {
        key,
        label,
        latest,
        average: avg,
        priority: 'haute',
        objective: 'Renforcer l’ancrage corporel',
        action:
          'Introduire des médiations corporelles simples, rythmiques, respiratoires ou sensorielles pour restaurer la présence corporelle.',
        vigilance:
          'Éviter les consignes complexes ou les sollicitations corporelles trop rapides.',
      }
    }

    return {
      key,
      label,
      latest,
      average: avg,
      priority: 'moyenne',
      objective: 'Consolider la stabilité corporelle',
      action:
        'Poursuivre des appuis corporels réguliers pour soutenir l’inscription tonique et la continuité de présence.',
      vigilance:
        'Surveiller les phases de fatigue ou de retrait corporel.',
    }
  }

  if (key === 'conscience') {
    if ((latest ?? avg ?? 50) < 40) {
      return {
        key,
        label,
        latest,
        average: avg,
        priority: 'haute',
        objective: 'Soutenir la mise en sens',
        action:
          'Favoriser des temps courts de reprise, de nomination et d’élaboration pour relier vécu, ressenti et représentation.',
        vigilance:
          'Ne pas surcharger en interprétations ou en exigences réflexives trop précoces.',
      }
    }

    return {
      key,
      label,
      latest,
      average: avg,
      priority: 'moyenne',
      objective: 'Renforcer l’élaboration consciente',
      action:
        'Structurer les liens entre expérience, parole et compréhension clinique à partir de supports concrets.',
      vigilance:
        'Rester attentif aux moments où la réflexion coupe de l’expérience vécue.',
    }
  }

  if (key === 'dynamique') {
    if ((latest ?? avg ?? 50) < 40) {
      return {
        key,
        label,
        latest,
        average: avg,
        priority: 'haute',
        objective: 'Relancer l’engagement',
        action:
          'Mettre en place des séquences courtes, accessibles, progressives et motivantes afin de soutenir l’initiative et l’élan.',
        vigilance:
          'Éviter les tâches longues, floues ou demandant un engagement massif immédiat.',
      }
    }

    return {
      key,
      label,
      latest,
      average: avg,
      priority: 'moyenne',
      objective: 'Stabiliser l’élan thérapeutique',
      action:
        'Entretenir la dynamique par des objectifs de séance lisibles, des transitions douces et un rythme soutenable.',
      vigilance:
        'Repérer les micro-signaux de désengagement ou de ralentissement.',
    }
  }

  if ((latest ?? avg ?? 50) < 40) {
    return {
      key,
      label,
      latest,
      average: avg,
      priority: 'haute',
      objective: 'Réouvrir l’espace symbolique',
      action:
        'Appuyer les médiations imagées, narratives ou créatives pour relancer la représentation et la symbolisation.',
      vigilance:
        'Éviter l’abstraction trop précoce si l’accès symbolique reste fragile.',
    }
  }

  return {
    key,
    label,
    latest,
    average: avg,
    priority: 'moyenne',
    objective: 'Soutenir la continuité symbolique',
    action:
      'Consolider les liens entre imagination, traces, représentations et narration clinique.',
    vigilance:
      'Surveiller les ruptures de continuité ou les replis défensifs.',
  }
}

function priorityStyle(priority: Recommendation['priority']) {
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

function scoreText(value: number | null) {
  return value === null ? '—' : `${value}/100`
}

export function PatientDimensionalRecommendations({ sessions }: Props) {
  if (!sessions.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Recommandations thérapeutiques automatiques
        </h2>
        <p className="text-sm text-neutral-500">
          Aucune séance disponible pour générer des recommandations.
        </p>
      </div>
    )
  }

  const recommendations = [
    buildRecommendation('emotion', 'Émotion', sessions),
    buildRecommendation('corps', 'Corps', sessions),
    buildRecommendation('conscience', 'Conscience', sessions),
    buildRecommendation('dynamique', 'Dynamique', sessions),
    buildRecommendation('symbolique', 'Symbolique', sessions),
  ]

  const urgent = recommendations.filter((item) => item.priority === 'haute')

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Recommandations thérapeutiques automatiques
      </h2>

      {urgent.length ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Priorités cliniques immédiates :</strong>{' '}
          {urgent.map((item) => item.label).join(', ')}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Aucune priorité critique immédiate détectée sur les dimensions suivies.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {recommendations.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-neutral-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="font-semibold">{item.label}</div>
              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityStyle(
                  item.priority,
                )}`}
              >
                Priorité {item.priority}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-neutral-500">Dernière valeur</div>
                <div className="font-medium">{scoreText(item.latest)}</div>
              </div>

              <div>
                <div className="text-neutral-500">Moyenne</div>
                <div className="font-medium">{scoreText(item.average)}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <p>
                <strong>Objectif :</strong> {item.objective}
              </p>
              <p>
                <strong>Axe thérapeutique :</strong> {item.action}
              </p>
              <p>
                <strong>Vigilance :</strong> {item.vigilance}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}