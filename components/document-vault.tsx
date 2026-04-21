import type { Database } from '@/lib/database.types'

type PatientDocument = Database['public']['Tables']['patient_documents']['Row']

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

function getDocumentTitle(item: Partial<PatientDocument>) {
  const record = item as Record<string, unknown>

  return (
    (record.title as string) ||
    (record.name as string) ||
    (record.filename as string) ||
    (record.file_name as string) ||
    'Document sans titre'
  )
}

function getDocumentType(item: Partial<PatientDocument>) {
  const record = item as Record<string, unknown>

  return (
    (record.document_type as string) ||
    (record.type as string) ||
    (record.mime_type as string) ||
    'Type non renseigné'
  )
}

function getDocumentUrl(item: Partial<PatientDocument>) {
  const record = item as Record<string, unknown>

  return (
    (record.file_url as string) ||
    (record.url as string) ||
    (record.storage_path as string) ||
    ''
  )
}

function getDocumentDescription(item: Partial<PatientDocument>) {
  const record = item as Record<string, unknown>

  return (
    (record.description as string) ||
    (record.notes as string) ||
    ''
  )
}

type DocumentVaultListProps = {
  items?: PatientDocument[] | null
}

export function DocumentVaultList({ items }: DocumentVaultListProps) {
  const safeItems = asArray(items)

  if (safeItems.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Aucun document disponible.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {safeItems.map((item) => {
        const title = getDocumentTitle(item)
        const type = getDocumentType(item)
        const url = getDocumentUrl(item)
        const description = getDocumentDescription(item)

        return (
          <article
            key={item.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <h3 className="break-words text-base font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {type}
                  </p>
                </div>

                {description ? (
                  <p className="text-sm text-slate-700">{description}</p>
                ) : null}

                <dl className="grid gap-1 text-sm text-slate-600">
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-medium text-slate-900">Créé le :</dt>
                    <dd>{formatDate(item.created_at)}</dd>
                  </div>

                  {item.updated_at ? (
                    <div className="flex flex-wrap gap-2">
                      <dt className="font-medium text-slate-900">Mis à jour :</dt>
                      <dd>{formatDate(item.updated_at)}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Ouvrir
                  </a>
                ) : (
                  <span className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                    Aucun lien
                  </span>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}