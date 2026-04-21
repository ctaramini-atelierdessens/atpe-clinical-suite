import Link from 'next/link'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function PatientLayout({
  children,
  params,
}: LayoutProps) {
  // ✅ FIX Next.js 16 → params est une Promise
  const { id: patientId } = await params

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR PATIENT */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-6 text-lg font-semibold text-slate-900">
          Dossier patient
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <SidebarLink
            href={`/patients/${patientId}`}
            label="Vue d’ensemble"
          />
          <SidebarLink
            href={`/patients/${patientId}?tab=sessions`}
            label="Séances"
          />
          <SidebarLink
            href={`/patients/${patientId}?tab=protocols`}
            label="Protocoles"
          />
          <SidebarLink
            href={`/patients/${patientId}?tab=goals`}
            label="Objectifs"
          />
          <SidebarLink
            href={`/patients/${patientId}?tab=alerts`}
            label="Alertes"
          />
        </nav>

        <div className="mt-auto pt-6 text-xs text-slate-400">
          ATPE Clinical Suite
        </div>
      </aside>

      {/* CONTENU */}
      <div className="flex-1">{children}</div>
    </div>
  )
}

function SidebarLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100"
    >
      {label}
    </Link>
  )
}