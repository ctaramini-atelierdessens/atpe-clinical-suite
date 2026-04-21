import Link from 'next/link'
import { AtpeSessionVersionRecord } from '@/lib/atpe-versioning'

type PatientAtpeVersionHistoryProps = {
  patientId: string
  versions: AtpeSessionVersionRecord[]
  currentBaseId?: string | null
  currentTargetId?: string | null
  className?: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function levelColor(isLocked: boolean, pdfLocked: boolean) {
  if (pdfLocked) return 'bg-emerald-100 text-emerald-800'
  if (isLocked) return 'bg-sky-100 text-sky-800'
  return 'bg-slate-100 text-slate-800'
}

export function PatientAtpeVersionHistory({
  patientId,
  versions,
  currentBaseId,
  currentTargetId,
  className = '',
}: PatientAtpeVersionHistoryProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Historique des versions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Versions figées, signées et verrouillées de la séance
        </p>
      </div>

      {!versions.length ? (
        <p className="text-sm text-slate-500">Aucune version enregistrée pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => {
            const isBase = currentBaseId === version.id
            const isTarget = currentTargetId === version.id

            return (
              <div
                key={version.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        V{version.version_number}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${levelColor(
                          version.is_locked,
                          version.pdf_locked
                        )}`}
                      >
                        {version.pdf_locked
                          ? 'PDF verrouillé'
                          : version.is_locked
                          ? 'Version verrouillée'
                          : 'Brouillon'}
                      </span>

                      {isBase ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          Base de comparaison
                        </span>
                      ) : null}

                      {isTarget ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                          Cible de comparaison
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm text-slate-700">
                      Créée le {formatDate(version.created_at)}
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      Profil : <strong>{version.profile ?? 'Non renseigné'}</strong>
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      Score composite :{' '}
                      <strong>
                        {typeof version.composite_score === 'number'
                          ? `${Math.round(version.composite_score)}/100`
                          : 'Non renseigné'}
                      </strong>
                    </p>

                    {version.signed_by ? (
                      <p className="mt-1 text-sm text-slate-700">
                        Signée par <strong>{version.signed_by}</strong> le{' '}
                        {formatDate(version.signed_at)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/patients/${patientId}/atpe?base=${version.id}${
                        currentTargetId ? `&target=${currentTargetId}` : ''
                      }`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Comparer comme base
                    </Link>

                    <Link
                      href={`/patients/${patientId}/atpe?${
                        currentBaseId ? `base=${currentBaseId}&` : ''
                      }target=${version.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Comparer comme cible
                    </Link>
                  </div>
                </div>

                {version.hash ? (
                  <p className="break-all text-xs text-slate-400">Hash : {version.hash}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}