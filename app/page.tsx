import Link from 'next/link'

function HomeCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50"
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-medium text-slate-800">{href}</p>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Accueil
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          ATPE Clinical Suite
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Espace de navigation clinique pour les dossiers patients, les groupes,
          l’administration clinique, la supervision, les protocoles et les exports.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <HomeCard
          title="Patients"
          description="Accès à la liste des patients et à chaque dossier individuel."
          href="/patients"
        />
        <HomeCard
          title="Groupes"
          description="Accès aux groupes thérapeutiques et à la lecture intersubjective."
          href="/groups"
        />
        <HomeCard
          title="Administration clinique"
          description="Gestion des groupes, supervisions, protocoles, signatures et exports."
          href="/clinical-admin"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Chemins principaux
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Patients</p>
            <p className="mt-2">/patients</p>
            <p className="mt-1">/patients/[id]</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Groupes</p>
            <p className="mt-2">/groups</p>
            <p className="mt-1">/groups/[id]</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Admin clinique</p>
            <p className="mt-2">/clinical-admin</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Navigation</p>
            <p className="mt-2">Menu stable global</p>
          </div>
        </div>
      </section>
    </main>
  )
}