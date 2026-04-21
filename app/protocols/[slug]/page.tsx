import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getProtocolBySlug,
  type AtpeProtocolRecord,
} from '@/lib/atpe/protocol-library'
import {
  getAxisLabel,
  getClinicalLevelLabel,
  getProgressStateLabel,
  type AtpeClinicalAxis,
  type AtpeClinicalLevel,
  type AtpeProgressState,
} from '@/lib/atpe/clinical-matrix'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

function categoryLabel(category: AtpeProtocolRecord['category']) {
  switch (category) {
    case 'relation':
      return 'Relation'
    case 'sensorial':
      return 'Sensoriel'
    case 'mobilisation':
      return 'Mobilisation'
    case 'symbolization':
      return 'Symbolisation'
    case 'integration':
      return 'Intégration'
    case 'closure':
      return 'Clôture'
    case 'projection':
      return 'Projection'
    case 'dream':
      return 'Rêve'
    case 'ritual':
      return 'Rituel'
    case 'somatic':
      return 'Somatique'
    case 'body':
      return 'Corps'
    case 'identity':
      return 'Identité'
    case 'group':
      return 'Groupe'
    default:
      return category
  }
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

function levelBadgeClass(level: AtpeClinicalLevel) {
  switch (level) {
    case 'very_fragile':
      return 'bg-red-100 text-red-800'
    case 'fragile':
      return 'bg-orange-100 text-orange-800'
    case 'intermediate':
      return 'bg-amber-100 text-amber-800'
    case 'good':
      return 'bg-blue-100 text-blue-800'
    case 'very_good':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function stateBadgeClass(state: AtpeProgressState) {
  switch (state) {
    case 'entry':
      return 'bg-red-100 text-red-800'
    case 'stabilization':
      return 'bg-orange-100 text-orange-800'
    case 'mobilisation':
      return 'bg-amber-100 text-amber-800'
    case 'symbolisation':
      return 'bg-blue-100 text-blue-800'
    case 'integration':
      return 'bg-emerald-100 text-emerald-800'
    case 'transformation':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function SectionList({
  title,
  items,
  emptyLabel = '—',
}: {
  title: string
  items: string[]
  emptyLabel?: string
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function AtpeProtocolDetailPage({ params }: PageProps) {
  const { slug } = await params
  const protocol = getProtocolBySlug(slug)

  if (!protocol) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {categoryLabel(protocol.category)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
              protocol.primary_axis
            )}`}
          >
            Axe principal : {getAxisLabel(protocol.primary_axis)}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          {protocol.title}
        </h1>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          {protocol.clinical_intent}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/atpe-library"
            className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Retour à la bibliothèque
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-slate-500">Famille</div>
          <div className="mt-1 text-base font-semibold text-slate-900">
            {protocol.family}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs text-slate-500">Slug</div>
          <div className="mt-1 break-all text-sm font-medium text-slate-900">
            {protocol.slug}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="text-xs text-slate-500">Axes secondaires</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {protocol.secondary_axes.length === 0 ? (
              <span className="text-sm text-slate-600">—</span>
            ) : (
              protocol.secondary_axes.map((axis) => (
                <span
                  key={axis}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
                    axis
                  )}`}
                >
                  {getAxisLabel(axis)}
                </span>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Niveaux cliniques compatibles
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {protocol.clinical_levels.map((level) => (
              <span
                key={level}
                className={`rounded-full px-3 py-1 text-xs font-medium ${levelBadgeClass(
                  level
                )}`}
              >
                {getClinicalLevelLabel(level)}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            États de progression compatibles
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {protocol.progress_states.map((state) => (
              <span
                key={state}
                className={`rounded-full px-3 py-1 text-xs font-medium ${stateBadgeClass(
                  state
                )}`}
              >
                {getProgressStateLabel(state)}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionList
          title="Indications thérapeutiques"
          items={protocol.indication}
        />

        <SectionList
          title="Contre-indications / points de non-pertinence"
          items={protocol.contraindication}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionList
          title="Objectifs thérapeutiques"
          items={protocol.objectives}
        />

        <SectionList
          title="Médiations utilisées"
          items={protocol.mediations}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionList
          title="Matériel"
          items={protocol.materials}
        />

        <SectionList
          title="Effets attendus"
          items={protocol.expected_effects}
        />
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Déroulé pas à pas
        </h2>

        <ol className="mt-4 space-y-3">
          {protocol.steps.map((step, index) => (
            <li
              key={`${index + 1}-${step}`}
              className="flex gap-3 rounded-xl border bg-slate-50 p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </div>
              <div className="pt-0.5 text-sm leading-6 text-slate-700">
                {step}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionList
          title="Posture thérapeutique"
          items={protocol.therapist_posture}
        />

        <SectionList
          title="Vigilance clinique"
          items={protocol.vigilance_points}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SectionList
          title="Productions / sorties attendues"
          items={protocol.outputs}
        />

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Lecture synthétique
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>
              <span className="font-medium">Axe principal :</span>{' '}
              {getAxisLabel(protocol.primary_axis)}
            </p>

            <p>
              <span className="font-medium">Famille clinique :</span>{' '}
              {protocol.family}
            </p>

            <p>
              <span className="font-medium">Intention :</span>{' '}
              {protocol.clinical_intent}
            </p>

            <p>
              <span className="font-medium">Position dans le parcours :</span>{' '}
              {protocol.progress_states
                .map((state) => getProgressStateLabel(state))
                .join(', ')}
            </p>

            <p>
              <span className="font-medium">Population clinique compatible :</span>{' '}
              {protocol.clinical_levels
                .map((level) => getClinicalLevelLabel(level))
                .join(', ')}
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}