import type { ReactNode } from 'react'
import Link from 'next/link'

import { ClinicalAdminGroupsPanel } from '@/components/clinical-admin-groups-panel'
import { ClinicalAdminSupervisionPanel } from '@/components/clinical-admin-supervision-panel'
import { ClinicalAdminProtocolsPanel } from '@/components/clinical-admin-protocols-panel'
import { ClinicalAdminSignaturesPanel } from '@/components/clinical-admin-signatures-panel'
import { ClinicalAdminExportsPanel } from '@/components/clinical-admin-exports-panel'
import { requireClinicalRole } from '@/lib/auth-server'
import { logSecurityAudit } from '@/lib/security-audit'

function AdminSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export default async function ClinicalAdminPage() {
  const session = await requireClinicalRole(['supervisor', 'admin'])

  await logSecurityAudit({
    actorId: session.profile.user_id,
    accessType: 'clinical_admin_access',
    description: 'Accès à l’administration clinique',
    metadata: {
      role: session.profile.role,
    },
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  ← Retour accueil
                </Link>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Administration clinique
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Gestion des groupes, supervisions, protocoles, signatures et exports.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Espace
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Clinical admin
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Rôle
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {session.profile.role}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AdminSection
          title="Groupes"
          description="Créer et visualiser les groupes cliniques."
        >
          <ClinicalAdminGroupsPanel />
        </AdminSection>

        <AdminSection
          title="Supervisions"
          description="Créer et consulter les entrées de supervision clinique."
        >
          <ClinicalAdminSupervisionPanel />
        </AdminSection>

        <AdminSection
          title="Protocoles"
          description="Consulter les protocoles thérapeutiques générés."
        >
          <ClinicalAdminProtocolsPanel />
        </AdminSection>

        <AdminSection
          title="Signatures"
          description="Consulter les signatures cliniques et validations."
        >
          <ClinicalAdminSignaturesPanel />
        </AdminSection>

        <AdminSection
          title="Exports"
          description="Historique des exports cliniques générés."
        >
          <ClinicalAdminExportsPanel />
        </AdminSection>
      </div>
    </main>
  )
}