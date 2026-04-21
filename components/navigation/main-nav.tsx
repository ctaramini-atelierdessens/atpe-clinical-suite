'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/patients', label: 'Patients' },
  { href: '/clinical', label: 'Clinique' },
  { href: '/knowledge', label: 'Base ATPE' },
  { href: '/protocols', label: 'Protocoles' },
  { href: '/protocols/trace-prenom', label: 'Trace-Prénom' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Cockpit clinique ATPE
          </Link>
          <p className="text-sm text-slate-600">
            Vue centrale de ton activité clinique : patients, séances, évolution globale, accès rapide aux dossiers et reporting.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}