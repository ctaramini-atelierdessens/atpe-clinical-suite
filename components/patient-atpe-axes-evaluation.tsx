import {
  ATPE_ATELIER_DES_SENS_MATRIX,
  type ATPEAxisId,
} from '@/lib/atpe/atelier-des-sens-matrix'

import {
  clampPercent,
  safeNumber,
} from '@/lib/atpe/format'

// ===============================
// TYPES
// ===============================

type SessionLike = {
  relational_availability?: number | null
  bodily_engagement?: number | null
  projective_intensity?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  creative_mobility?: number | null
  patient_engagement_level?: number | null
  externalization_level?: number | null
}

type Props = {
  session: SessionLike | null | undefined
}

// ===============================
// SCORE PAR AXE
// ===============================

function computeAxisScore(axis: ATPEAxisId, s: SessionLike): number {
  switch (axis) {
    case 'internal_process':
      return avg(
        s.primary_symbolization,
        s.secondary_symbolization,
        s.projective_intensity
      )

    case 'expressive_process':
      return avg(
        s.creative_mobility,
        s.externalization_level
      )

    case 'relational_process':
      return avg(
        s.relational_availability,
        s.patient_engagement_level
      )

    case 'pluri_expression':
      return avg(
        s.externalization_level,
        s.creative_mobility
      )

    case 'institutional':
      return avg(
        s.patient_engagement_level,
        s.relational_availability
      )

    case 'sensory_symbolic':
      return avg(
        s.bodily_engagement,
        s.projective_intensity
      )

    default:
      return 0
  }
}

function avg(...values: (number | null | undefined)[]): number {
  const valid = values
    .map((v) => safeNumber(v))
    .filter((v) => v > 0)

  if (valid.length === 0) return 0
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

// ===============================
// UI HELPERS
// ===============================

function axisColor(axis: ATPEAxisId) {
  switch (axis) {
    case 'internal_process':
      return 'bg-blue-500'
    case 'expressive_process':
      return 'bg-purple-500'
    case 'relational_process':
      return 'bg-green-500'
    case 'pluri_expression':
      return 'bg-pink-500'
    case 'institutional':
      return 'bg-orange-500'
    case 'sensory_symbolic':
      return 'bg-amber-500'
    default:
      return 'bg-slate-500'
  }
}

function axisBg(axis: ATPEAxisId) {
  switch (axis) {
    case 'internal_process':
      return 'bg-blue-50'
    case 'expressive_process':
      return 'bg-purple-50'
    case 'relational_process':
      return 'bg-green-50'
    case 'pluri_expression':
      return 'bg-pink-50'
    case 'institutional':
      return 'bg-orange-50'
    case 'sensory_symbolic':
      return 'bg-amber-50'
    default:
      return 'bg-slate-50'
  }
}

// ===============================
// COMPONENT
// ===============================

export function PatientAtpeAxesEvaluation({ session }: Props) {
  if (!session) {
    return (
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Évaluation clinique par axes
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Aucune donnée disponible
        </p>
      </section>
    )
  }

  const axes = ATPE_ATELIER_DES_SENS_MATRIX.map((axis) => {
    const score = computeAxisScore(axis.id, session)
    return {
      ...axis,
      score,
    }
  })

  const dominant = [...axes].sort((a, b) => b.score - a.score)[0]
  const weakest = [...axes].sort((a, b) => a.score - b.score)[0]

  return (
    <section className="rounded-2xl border bg-white p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Évaluation clinique par axes
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Lecture Atelier des Sens basée sur la dernière séance
        </p>
      </div>

      {/* SYNTHÈSE */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Axe dominant</div>
          <div className="font-semibold mt-1">
            {dominant?.label}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Axe fragile</div>
          <div className="font-semibold mt-1">
            {weakest?.label}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Score moyen</div>
          <div className="font-semibold mt-1">
            {Math.round(
              axes.reduce((a, b) => a + b.score, 0) / axes.length
            )}
            /100
          </div>
        </div>
      </div>

      {/* AXES */}
      <div className="grid xl:grid-cols-2 gap-4">
        {axes.map((axis) => (
          <div
            key={axis.id}
            className={`rounded-xl border p-4 ${axisBg(axis.id)}`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                {axis.label}
              </h3>
              <span className="text-sm font-medium">
                {axis.score}/100
              </span>
            </div>

            {/* BAR */}
            <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full ${axisColor(axis.id)}`}
                style={{
                  width: `${clampPercent(axis.score)}%`,
                }}
              />
            </div>

            {/* DESCRIPTION */}
            <p className="text-xs text-slate-600 mt-2">
              {axis.description}
            </p>

            {/* OBJECTIFS */}
            <ul className="mt-3 text-xs text-slate-500 space-y-1">
              {axis.objectives.slice(0, 2).map((obj) => (
                <li key={obj.id}>• {obj.label}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}