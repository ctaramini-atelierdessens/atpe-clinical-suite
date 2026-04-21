import {
  resolveAtpeClinicalMatrix,
  getAxisLabel,
  getClinicalLevelLabel,
  getProgressStateLabel,
  clinicalLevelClass,
  progressStateClass,
  type AtpeClinicalAxis,
  type AtpeSessionForMatrix,
} from '@/lib/atpe/clinical-matrix'
import { formatShortDate } from '@/lib/atpe/format'

type SessionRow = AtpeSessionForMatrix & {
  id?: string
  created_at?: string | null
  session_number?: number
}

type Props = {
  session: SessionRow | null | undefined
}

function axisBadgeClass(axis: AtpeClinicalAxis) {
  switch (axis) {
    case 'relation':
      return 'bg-blue-100 text-blue-800'
    case 'soma':
      return 'bg-orange-100 text-orange-800'
    case 'projection':
      return 'bg-fuchsia-100 text-fuchsia-800'
    case 'symbolisation':
      return 'bg-violet-100 text-violet-800'
    case 'identite':
      return 'bg-emerald-100 text-emerald-800'
    case 'transformation':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function axisBarClass(axis: AtpeClinicalAxis) {
  switch (axis) {
    case 'relation':
      return 'bg-blue-500'
    case 'soma':
      return 'bg-orange-500'
    case 'projection':
      return 'bg-fuchsia-500'
    case 'symbolisation':
      return 'bg-violet-500'
    case 'identite':
      return 'bg-emerald-500'
    case 'transformation':
      return 'bg-amber-500'
    default:
      return 'bg-slate-500'
  }
}

export function PatientAtpeClinicalMatrix({ session }: Props) {
  if (!session) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Matrice clinique ATPE
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Aucune séance disponible pour calculer la matrice clinique.
        </p>
      </section>
    )
  }

  const clinicalMatrix = resolveAtpeClinicalMatrix(session)

  const axisEntries = [
    { key: 'relation' as const, score: clinicalMatrix.axes.relation },
    { key: 'soma' as const, score: clinicalMatrix.axes.soma },
    { key: 'projection' as const, score: clinicalMatrix.axes.projection },
    { key: 'symbolisation' as const, score: clinicalMatrix.axes.symbolisation },
    { key: 'identite' as const, score: clinicalMatrix.axes.identite },
    { key: 'transformation' as const, score: clinicalMatrix.axes.transformation },
  ]

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Matrice clinique ATPE
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Lecture clinique par axes à partir de la dernière séance résolue,
            avec niveau global, état de progression, axe dominant et axe le
            plus fragile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${clinicalLevelClass(
              clinicalMatrix.globalLevel
            )}`}
          >
            Niveau global : {getClinicalLevelLabel(clinicalMatrix.globalLevel)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${progressStateClass(
              clinicalMatrix.progressionState
            )}`}
          >
            Progression : {getProgressStateLabel(clinicalMatrix.progressionState)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Score clinique moyen</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {clinicalMatrix.average}/100
          </div>
        </article>

        <article className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Axe dominant</div>
          <div className="mt-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
                clinicalMatrix.dominantAxis
              )}`}
            >
              {getAxisLabel(clinicalMatrix.dominantAxis)}
            </span>
          </div>
        </article>

        <article className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Axe le plus fragile</div>
          <div className="mt-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
                clinicalMatrix.weakestAxis
              )}`}
            >
              {getAxisLabel(clinicalMatrix.weakestAxis)}
            </span>
          </div>
        </article>

        <article className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Séance analysée</div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {session.session_number ?? '—'}
          </div>
          <div className="text-sm text-slate-600">
            {formatShortDate(session.created_at ?? null)}
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {axisEntries.map((axis) => (
          <article key={axis.key} className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
                    axis.key
                  )}`}
                >
                  {getAxisLabel(axis.key)}
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-900">
                {axis.score}/100
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${axisBarClass(axis.key)}`}
                style={{ width: `${Math.max(4, axis.score)}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {axis.key === clinicalMatrix.dominantAxis
                ? 'Axe actuellement le plus soutenu.'
                : axis.key === clinicalMatrix.weakestAxis
                  ? 'Axe prioritaire à travailler.'
                  : 'Axe intermédiaire dans le profil clinique actuel.'}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}