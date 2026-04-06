import { switchOrganizationAction } from '@/lib/atpe/actions'

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: Array<{ organization_id: string; role: string; organizations: { id: string; name: string; slug: string } | null }>
  activeOrganizationId?: string | null
}) {
  if (organizations.length <= 1) return null

  return (
    <form action={switchOrganizationAction} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <label htmlFor="org-switcher" className="text-xs font-medium text-slate-500">
        Organisation
      </label>
      <select
        id="org-switcher"
        name="organization_id"
        defaultValue={activeOrganizationId ?? ''}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
      >
        {organizations.map((membership) => (
          <option key={membership.organization_id} value={membership.organization_id}>
            {(membership.organizations?.name ?? membership.organization_id)} · {membership.role}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
        Basculer
      </button>
    </form>
  )
}
