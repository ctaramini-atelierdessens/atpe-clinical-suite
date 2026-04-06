import type { Database } from '@/types/database'

type AccessLog = Database['public']['Tables']['patient_access_logs']['Row']

export function PatientAccessLogList({ items }: { items: AccessLog[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">Aucun accès dossier journalisé pour le moment.</p>

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.access_scope}</p>
              <p className="text-xs text-slate-500">{item.route}</p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{new Date(item.accessed_at).toLocaleString('fr-FR')}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Acteur : {item.actor_user_id ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}
