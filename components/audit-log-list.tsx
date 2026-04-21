import type { Database } from '@/lib/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function pickString(
  item: Record<string, unknown>,
  keys: string[],
  fallback: string
) {
  for (const key of keys) {
    const value = item[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return fallback
}

function getLevelClasses(level: string) {
  switch (level.toLowerCase()) {
    case 'error':
    case 'erreur':
    case 'critical':
    case 'critique':
      return 'border-red-200 bg-red-50 text-red-900'
    case 'warning':
    case 'warn':
    case 'alerte':
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case 'info':
    case 'information':
      return 'border-blue-200 bg-blue-50 text-blue-900'
    case 'success':
    case 'ok':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

type AuditLogListProps = {
  items?: AuditLog[] | null
}

export function AuditLogList({ items }: AuditLogListProps) {
  const safeItems = asArray(items)

  if (safeItems.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Aucun événement d’audit disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {safeItems.map((item) => {
        const record = item as Record<string, unknown>

        const title = pickString(
          record,
          ['title', 'action', 'event', 'event_type', 'type'],
          'Événement d’audit'
        )

        const actor = pickString(
          record,
          ['actor_name', 'user_name', 'clinician_name', 'performed_by'],
          'Utilisateur inconnu'
        )

        const level = pickString(
          record,
          ['level', 'severity', 'priority'],
          'info'
        )

        const description = pickString(
          record,
          ['description', 'details', 'message', 'notes'],
          ''
        )

        const target = pickString(
          record,
          ['target', 'resource', 'entity', 'object_type'],
          ''
        )

        const metadata = record.metadata

        return (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 shadow-sm ${getLevelClasses(level)}`}
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-sm">
                    <span className="font-medium">Auteur :</span> {actor}
                  </p>
                </div>

                <div className="text-sm opacity-80">
                  {formatDate(item.created_at)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/70 px-3 py-1 font-medium">
                  Niveau : {level}
                </span>

                {target ? (
                  <span className="rounded-full bg-white/70 px-3 py-1 font-medium">
                    Cible : {target}
                  </span>
                ) : null}
              </div>

              {description ? (
                <p className="text-sm">{description}</p>
              ) : null}

              {metadata && typeof metadata === 'object' ? (
                <details className="rounded-xl bg-white/70 p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Métadonnées
                  </summary>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}