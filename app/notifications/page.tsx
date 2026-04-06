import { NotificationsPanel } from '@/components/notifications-panel'
import { SectionCard } from '@/components/section-card'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function NotificationsPage() {
  const { supabase, user, organization } = await getAppContext()
  const { data: items } = organization
    ? await supabase
        .from('supervisor_notifications')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] as any[] }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Gouvernance établissement</p>
        <h1 className="text-3xl font-semibold tracking-tight">Notifications superviseur</h1>
        <p className="mt-2 text-sm text-slate-500">Requêtes de validation, demandes de modifications et accusés de lecture.</p>
      </div>
      <SectionCard title="Boîte de réception clinique" description={organization ? `Organisation active : ${organization.name}` : undefined}>
        <NotificationsPanel items={(items ?? []) as any} />
      </SectionCard>
    </div>
  )
}
