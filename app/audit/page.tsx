import Link from 'next/link'
import { AuditLogList } from '@/components/audit-log-list'
import { SectionCard } from '@/components/section-card'
import { getAppContext } from '@/lib/atpe/app-context'
import { canExport } from '@/lib/atpe/rbac'

export default async function AuditPage() {
  const { supabase, organization, membership } = await getAppContext()
  const { data: logs } = organization
    ? await supabase.from('audit_logs').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(100)
    : { data: [] as any[] }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Traçabilité</p>
          <h1 className="text-3xl font-semibold tracking-tight">Audit log visible dans l’interface</h1>
          <p className="mt-2 text-sm text-slate-500">Créations, consultations, modifications, exports et gouvernance d’établissement.</p>
        </div>
        {canExport(membership?.role) ? (
          <Link href="/audit/access-export/csv" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            Exporter le journal d’accès CSV
          </Link>
        ) : null}
      </div>
      <SectionCard title="Historique récent" description={organization ? `Organisation : ${organization.name}` : undefined}>
        <AuditLogList items={(logs ?? []) as any} />
      </SectionCard>
    </div>
  )
}
