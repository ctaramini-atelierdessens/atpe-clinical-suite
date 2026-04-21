import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type MatrixVersion = {
  id: string
  title?: string | null
  status?: string | null
  is_active?: boolean | null
  version_number?: number | null
  notes?: string | null
}

type MatrixRow = {
  id: string
  matrix_version_id: string
  dimension?: string | null
  priority?: string | null
  position?: number | null
  initial_finding?: string | null
  short_objective?: string | null
  short_subobjectives?: string | null
  medium_objective?: string | null
  medium_subobjectives?: string | null
  long_objective?: string | null
  long_subobjectives?: string | null
}

type Props = {
  version: MatrixVersion
  rows: MatrixRow[]
}

function priorityVariant(priority?: string | null) {
  switch (priority) {
    case 'haute':
      return 'priority_high' as const
    case 'moyenne':
      return 'priority_medium' as const
    case 'basse':
      return 'priority_low' as const
    default:
      return 'neutral' as const
  }
}

function splitLines(value?: string | null) {
  if (!value) return []
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function PatientDiagnosticMatrixVersionView({
  version,
  rows,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Matrice diagnostique
          </h2>
          <p className="text-sm text-neutral-500">
            Version {version.version_number ?? '—'} — {version.title ?? 'Matrice diagnostique'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ClinicalStatusBadge
            label="Version validée"
            variant="validated"
          />
          {version.is_active ? (
            <ClinicalStatusBadge
              label="Version active"
              variant="active"
            />
          ) : null}
        </div>
      </div>

      {version.notes ? (
        <div className="mb-4 rounded-xl border border-neutral-200 p-4">
          <div className="text-sm font-medium text-neutral-700">Notes de version</div>
          <p className="mt-2 text-sm text-neutral-600">{version.notes}</p>
        </div>
      ) : null}

      {!rows.length ? (
        <p className="text-sm text-neutral-500">
          Aucune ligne enregistrée dans cette version.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">
                  {row.dimension ?? 'Dimension'}
                </div>

                <ClinicalStatusBadge
                  label={`Priorité ${row.priority ?? 'moyenne'}`}
                  variant={priorityVariant(row.priority)}
                />
              </div>

              <div className="space-y-4 text-sm text-neutral-700">
                <div>
                  <strong>Constat initial :</strong>{' '}
                  {row.initial_finding ?? '—'}
                </div>

                <div>
                  <div>
                    <strong>Objectif court terme :</strong>{' '}
                    {row.short_objective ?? '—'}
                  </div>
                  {splitLines(row.short_subobjectives).length > 0 ? (
                    <ul className="ml-5 mt-2 list-disc space-y-1">
                      {splitLines(row.short_subobjectives).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div>
                  <div>
                    <strong>Objectif moyen terme :</strong>{' '}
                    {row.medium_objective ?? '—'}
                  </div>
                  {splitLines(row.medium_subobjectives).length > 0 ? (
                    <ul className="ml-5 mt-2 list-disc space-y-1">
                      {splitLines(row.medium_subobjectives).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div>
                  <div>
                    <strong>Objectif long terme :</strong>{' '}
                    {row.long_objective ?? '—'}
                  </div>
                  {splitLines(row.long_subobjectives).length > 0 ? (
                    <ul className="ml-5 mt-2 list-disc space-y-1">
                      {splitLines(row.long_subobjectives).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}