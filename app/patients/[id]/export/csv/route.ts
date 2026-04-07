import { NextResponse } from 'next/server'
import { getAppContext } from '@/lib/atpe/app-context'
import { createTrackedExportLog } from '@/lib/atpe/actions'
import { canExport } from '@/lib/atpe/rbac'

function esc(value: unknown) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const { supabase, membership } = await getAppContext()

  if (!canExport(membership?.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const [{ data: patient }, { data: sessions }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', id)
      .is('deleted_at', null)
      .order('session_number', { ascending: true }),
  ])

  if (!patient) {
    return new NextResponse('Not found', { status: 404 })
  }

  await createTrackedExportLog({
    entityType: 'patient',
    entityId: id,
    exportType: 'csv',
    destination: 'download',
    metadata: { sessions: sessions?.length ?? 0 },
  })

  const header = [
    'patient_code',
    'initials',
    'status',
    'session_number',
    'session_date',
    'emotional_score',
    'body_score',
    'awareness_score',
    'dynamic_score',
    'symbolic_score',
    'regulation_score',
    'engagement_score',
    'note',
  ]

  const rows = ((sessions ?? []) as any[]).map((s: any) => [
    (patient as any).code,
    ((patient as any).initials ?? ''),
    ((patient as any).status ?? ''),
    s.session_number ?? '',
    s.session_date ?? '',
    s.emotional_score ?? '',
    s.body_score ?? '',
    s.awareness_score ?? '',
    s.dynamic_score ?? '',
    s.symbolic_score ?? '',
    s.regulation_score ?? '',
    s.engagement_score ?? '',
    s.note ?? '',
  ])

  const csv = [header, ...rows].map((row) => row.map(esc).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
'Content-Disposition': `attachment; filename="patient-${id}.csv"`,
    },
  })
}



