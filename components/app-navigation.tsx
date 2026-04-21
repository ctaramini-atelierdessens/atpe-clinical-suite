import Link from 'next/link'

type NavItem = {
  href: string
  label: string
  description?: string
}

const primaryItems: NavItem[] = [
  {
    href: '/',
    label: 'Accueil',
    description: 'Vue générale de l’outil clinique',
  },
  {
    href: '/patients',
    label: 'Patients',
    description: 'Accès aux dossiers patients',
  },
  {
    href: '/groups',
    label: 'Groupes',
    description: 'Accès aux groupes thérapeutiques',
  },
  {
    href: '/clinical-admin',
    label: 'Administration clinique',
    description: 'Pilotage, supervision, protocoles, signatures, exports',
  },
]

export function AppNavigation() {
  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Navigation clinique
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          ATPE Clinical Suite
        </h2>
      </div>

      <nav className="flex flex-col gap-2">
        {primaryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            {item.description ? (
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {item.description}
              </p>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Accès direct
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/patients"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            /patients
          </Link>
          <Link
            href="/groups"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            /groups
          </Link>
          <Link
            href="/clinical-admin"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            /clinical-admin
          </Link>
        </div>
      </div>
    </aside>
  )
}