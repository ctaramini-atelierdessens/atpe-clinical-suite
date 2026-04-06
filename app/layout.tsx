import './globals.css'
import Link from 'next/link'
import { Activity, Bell, Building2, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { getAppContext } from '@/lib/atpe/app-context'
import { OrganizationSwitcher } from '@/components/organization-switcher'

export const metadata: Metadata = {
  title: 'ATPE Clinical Suite',
  description: 'Tableau de bord clinique descriptif branché à Supabase',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let context: Awaited<ReturnType<typeof getAppContext>> | null = null
  try {
    context = await getAppContext()
  } catch {
    context = null
  }

  return (
    <html lang="fr">
      <body>
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 font-semibold text-slate-900">
                <span className="rounded-2xl bg-brand-600 p-2 text-white">
                  <Activity className="h-5 w-5" />
                </span>
                <span>ATPE Clinical Suite</span>
              </Link>
              <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Link href="/patients" className="transition hover:text-slate-900">Patients</Link>
                <Link href="/patients/new" className="transition hover:text-slate-900">Nouveau patient</Link>
                <Link href="/audit" className="transition hover:text-slate-900">Audit log</Link>
                <Link href="/reviews" className="transition hover:text-slate-900">Revues</Link>
                <Link href="/notifications" className="transition hover:text-slate-900">Notifications</Link>
                <Link href="/imports/excel" className="transition hover:text-slate-900">Import Excel</Link>
                <Link href="/dashboard/intelligent" className="transition hover:text-slate-900">Dashboard intelligent</Link>
                <Link href="/governance" className="transition hover:text-slate-900">Gouvernance</Link>
              </nav>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {context?.memberships?.length ? (
                <OrganizationSwitcher organizations={context.memberships as any} activeOrganizationId={context.membership?.organization_id} />
              ) : null}
              {context?.organization ? (
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  <Building2 className="h-4 w-4" />
                  {context.organization.name}
                </div>
              ) : null}
              <Link href="/notifications" className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4" />
                Outil descriptif — non diagnostic
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
