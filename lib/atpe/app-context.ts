import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { MembershipRole } from '@/lib/atpe/rbac'

type MembershipRecord = {
  organization_id: string
  role: MembershipRole
  organizations: { id: string; name: string; slug: string } | null
}

export async function getAppContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membershipsRaw } = await supabase
    .from('organization_memberships')
    .select('organization_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const memberships = ((membershipsRaw ?? []) as MembershipRecord[]).filter((item) => item.organization_id)

  if (!memberships.length) {
    return { supabase, user, organization: null, membership: null, memberships: [] as MembershipRecord[] }
  }

  const cookieStore = await cookies()
  const preferredOrgId = cookieStore.get('atpe_active_org_id')?.value
  const membership = memberships.find((item) => item.organization_id === preferredOrgId) ?? memberships[0]

  return {
    supabase,
    user,
    organization: membership.organizations,
    membership,
    memberships,
  }
}

export async function insertAuditLog(args: {
  organizationId: string | null
  actorUserId: string
  entityType: string
  entityId?: string | null
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login'
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()
  await supabase.from('audit_logs').insert({
    organization_id: args.organizationId,
    actor_user_id: args.actorUserId,
    entity_type: args.entityType,
    entity_id: args.entityId ?? null,
    action: args.action,
    metadata: args.metadata ?? {},
  })
}

export async function insertPatientAccessLog(args: {
  organizationId: string
  patientId: string
  actorUserId: string
  accessScope: string
  route: string
}) {
  const supabase = await createClient()
  await supabase.from('patient_access_logs').insert({
    organization_id: args.organizationId,
    patient_id: args.patientId,
    actor_user_id: args.actorUserId,
    access_scope: args.accessScope,
    route: args.route,
  })
}
