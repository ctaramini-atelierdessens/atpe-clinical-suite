import type { Database } from '@/lib/database.types'

type PatientAccessLog = Database['public']['Tables']['patient_access_logs']['Row']

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

type PatientAccessLogListProps = {
  items?: PatientAccessLog[] | null
}

export function PatientAccessLogList({
  items,
}: PatientAccessLogListProps) {
  const safeItems = asArray(items)

  if (safeItems.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Aucun journal d’accès disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {safeItems.map((item) => {
        const record = item as Record<string, unknown>

        const actor = pickString(
          record,
          ['actor_name', 'user_name', 'clinician_name', 'accessed_by'],
          'Utilisateur inconnu'
        )

        const action = pickString(
          record,
          ['action', 'event_type', 'access_type', 'type'],
          'Action non renseignée'
        )

        const source = pickString(
          record,
          ['source', 'origin', 'channel'],
          ''
        )

        const details = pickString(
          record,
          ['details', 'description', 'notes'],
          ''
        )

        return (
          <article
            key={item.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {action}
                  </h3>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Auteur :</span> {actor}
                  </p>
                </div>

                <p className="text-sm text-slate-500">
                  {formatDate(item.created_at)}
                </p>
              </div>

              {source ? (
                <p className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Source :</span>{' '}
                  {source}
                </p>
              ) : null}

              {details ? (
                <p className="text-sm text-slate-700">{details}</p>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}