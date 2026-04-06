import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTrackedExportLog } from '@/lib/atpe/actions'
import { getAppContext } from '@/lib/atpe/app-context'
import { canExport } from '@/lib/atpe/rbac'

export async function GET() {
  const { supabase, organization, membership } = await getAppContext()
  if (!organization || !membership || !canExport(membership.role)) {
    return new NextResponse('Export non autorisé.', { status: 403 })
  }

  const { data: logs, error } = await supabase
    .from('patient_access_logs')
    .select('*')
    .eq('organization_id', organization.id)
    .order('accessed_at', { ascending: false })
    .limit(5000)

  if (error) return new NextResponse(error.message, { status: 500 })

  await createTrackedExportLog({
    entityType: 'patient_access_logs',
    exportType: 'csv',
    destination: 'download',
    metadata: { organizationId: organization.id, rowCount: logs?.length ?? 0 },
  })

  const header = ['id', 'organization_id', 'patient_id', 'actor_user_id', 'access_scope', 'route', 'accessed_at']
  const rows = (logs ?? []).map((item) =>
    [item.id, item.organization_id, item.patient_id, item.actor_user_id ?? '', item.access_scope, item.route, item.accessed_at]
      .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
      .join(','),
  )

  return new NextResponse([header.join(','), ...rows].join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="patient-access-logs-${organization.slug}.csv"`,
    },
  })
}
