import type { Database, Json } from '@/types/database'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

function renderMetadata(metadata: Json) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const entries = Object.entries(metadata as Record<string, Json>)
  if (!entries.length) return null
  return (
    <dl className="mt-2 grid gap-1 text-xs text-slate-500 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl bg-slate-50 px-2 py-1">
          <dt className="font-medium text-slate-600">{key}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AuditLogList({ items }: { items: AuditLog[] }) {
  return (
    <div className="space-y-3">
      {items.length ? (
        items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="badge bg-brand-50 text-brand-700">{item.action}</span>
              <span className="font-medium text-slate-800">{item.entity_type}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{new Date(item.created_at).toLocaleString('fr-FR')}</span>
            </div>
            {item.entity_id ? <p className="mt-2 text-xs text-slate-500">Entity ID : {item.entity_id}</p> : null}
            {renderMetadata(item.metadata)}
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Aucun audit log visible.</div>
      )}
    </div>
  )
}
