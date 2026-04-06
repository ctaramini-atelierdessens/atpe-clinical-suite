import { markNotificationReadAction } from '@/lib/atpe/actions'
import type { Database } from '@/types/database'

type Notification = Database['public']['Tables']['supervisor_notifications']['Row']

export function NotificationsPanel({ items }: { items: Notification[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">Aucune notification superviseur.</p>

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              <p className="mt-2 text-xs text-slate-500">
                Canal {item.channel} · créée le {new Date(item.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{item.status}</span>
          </div>
          {item.read_at ? (
            <p className="mt-3 text-xs text-emerald-700">Lue le {new Date(item.read_at).toLocaleString('fr-FR')}</p>
          ) : (
            <form action={markNotificationReadAction} className="mt-3">
              <input type="hidden" name="notification_id" value={item.id} />
              <button type="submit" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                Marquer comme lue
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  )
}
