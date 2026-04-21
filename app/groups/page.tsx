import Link from 'next/link'
import { listClinicalGroups } from '@/lib/clinical-db-helpers'

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function GroupsPage() {
  let groups = []

  try {
    groups = await listClinicalGroups()
  } catch {
    groups = []
  }

  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Groupes
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Groupes thérapeutiques
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Accès aux groupes cliniques et à leur lecture intersubjective.
        </p>
      </section>

      {!groups.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Aucun groupe disponible pour le moment.</p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {groups.map((group) => {
            const displayName =
              group.name?.trim() ||
              group.reference?.trim() ||
              group.code?.trim() ||
              group.id

            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {displayName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {group.description || 'Aucune description'}
                    </p>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {group.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Référence
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {group.reference || group.code || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Créé le
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(group.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}