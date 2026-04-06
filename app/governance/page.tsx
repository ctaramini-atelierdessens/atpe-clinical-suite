import { SectionCard } from '@/components/section-card'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function GovernancePage() {
  const { supabase, organization, memberships } = await getAppContext()

  const [{ data: policies }, { data: retentionDue }] = organization
    ? await Promise.all([
        supabase.from('organization_security_policies').select('*').eq('organization_id', organization.id).maybeSingle(),
        supabase.from('documents_retention_due').select('*').eq('organization_id', organization.id).order('retention_until', { ascending: true }).limit(100),
      ])
    : [{ data: null as any }, { data: [] as any[] }]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Gouvernance établissement</p>
        <h1 className="text-3xl font-semibold tracking-tight">Multi-organisation, rétention et sécurité documentaire</h1>
        <p className="mt-2 text-sm text-slate-500">
          Pilotage des règles documentaires, de l’organisation active et des dossiers dont la rétention arrive à échéance.
        </p>
      </div>

      <SectionCard title="Organisation active" description={organization ? `${organization.name} (${organization.slug})` : 'Aucune organisation active'}>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-medium text-slate-800">Nombre d’organisations rattachées :</span> {memberships.length}</p>
          {(memberships ?? []).map((membership) => (
            <p key={membership.organization_id}>
              {(membership.organizations?.name ?? membership.organization_id)} · rôle {membership.role}
            </p>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Politique documentaire" description="Rétention et bucket sécurisé utilisés par l’organisation active.">
        {policies ? (
          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <p><span className="font-medium text-slate-800">Rétention par défaut :</span> {policies.default_retention_days} jours</p>
            <p><span className="font-medium text-slate-800">Rétention consentements signés :</span> {policies.signed_consent_retention_days} jours</p>
            <p><span className="font-medium text-slate-800">Bucket documents :</span> {policies.documents_bucket}</p>
            <p><span className="font-medium text-slate-800">Bucket consentements :</span> {policies.consent_signatures_bucket}</p>
            <p className="md:col-span-2"><span className="font-medium text-slate-800">Escalade superviseur :</span> {policies.supervisor_notification_channel}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune politique configurée.</p>
        )}
      </SectionCard>

      <SectionCard title="Documents à surveiller" description="Documents actifs dont la date de rétention est proche ou dépassée.">
        {!retentionDue?.length ? (
          <p className="text-sm text-slate-500">Aucun document en attente de revue de rétention.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Titre</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Rétention jusqu’au</th>
                </tr>
              </thead>
              <tbody>
                {(retentionDue ?? []).map((item: any) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-slate-600">{item.patient_id}</td>
                    <td className="px-4 py-3 text-slate-600">{item.retention_until ? new Date(item.retention_until).toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
