import {
  activateDiagnosticMatrixVersionAction,
  createDiagnosticMatrixRowAction,
  createDiagnosticMatrixVersionAction,
  deleteDiagnosticMatrixRowAction,
  deleteDiagnosticMatrixVersionAction,
  updateDiagnosticMatrixRowAction,
  updateDiagnosticMatrixVersionAction,
} from '@/lib/atpe/patient-diagnostic-matrix-actions'

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
  patientId: string
  versions: MatrixVersion[]
  rowsByVersionId: Record<string, MatrixRow[]>
}

const dimensions = [
  'emotion',
  'corps',
  'conscience',
  'dynamique',
  'symbolique',
  'globale',
]

const priorities = ['haute', 'moyenne', 'basse']
const statuses = ['draft', 'validated', 'archived']

export function PatientDiagnosticMatrixEditor({
  patientId,
  versions,
  rowsByVersionId,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Matrice diagnostique modifiable et versionnable
        </h2>
        <p className="text-sm text-neutral-500">
          Chaque version peut être préparée, modifiée, puis activée comme version clinique de référence.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-base font-semibold">Créer une nouvelle version</h3>

        <form action={createDiagnosticMatrixVersionAction} className="space-y-4">
          <input type="hidden" name="patient_id" value={patientId} />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Titre
              </label>
              <input
                type="text"
                name="title"
                defaultValue="Matrice diagnostique"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Activer immédiatement
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                <input type="checkbox" name="is_active" />
                Définir comme version active
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Notes de version
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Notes sur cette version"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Créer la version
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {versions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucune version enregistrée pour le moment.
          </p>
        ) : (
          versions.map((version) => {
            const rows = rowsByVersionId[version.id] ?? []

            return (
              <div
                key={version.id}
                className="rounded-xl border border-neutral-200 p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      Version {version.version_number ?? '—'} — {version.title ?? 'Matrice'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      Statut : {version.status ?? 'draft'} {version.is_active ? '• Active' : ''}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={activateDiagnosticMatrixVersionAction}>
                      <input type="hidden" name="version_id" value={version.id} />
                      <input type="hidden" name="patient_id" value={patientId} />
                      <button
                        type="submit"
                        className="rounded-xl border border-green-300 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        Activer
                      </button>
                    </form>

                    <form action={deleteDiagnosticMatrixVersionAction}>
                      <input type="hidden" name="version_id" value={version.id} />
                      <input type="hidden" name="patient_id" value={patientId} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateDiagnosticMatrixVersionAction} className="space-y-4">
                  <input type="hidden" name="version_id" value={version.id} />
                  <input type="hidden" name="patient_id" value={patientId} />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Titre
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={version.title ?? 'Matrice diagnostique'}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Statut
                      </label>
                      <select
                        name="status"
                        defaultValue={version.status ?? 'draft'}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Version active
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                        <input
                          type="checkbox"
                          name="is_active"
                          defaultChecked={Boolean(version.is_active)}
                        />
                        Activer
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={version.notes ?? ''}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                    >
                      Mettre à jour la version
                    </button>
                  </div>
                </form>

                <div className="mt-6 rounded-xl border border-neutral-200 p-4">
                  <h4 className="mb-3 text-base font-semibold">Lignes de matrice</h4>

                  <div className="space-y-4">
                    {rows.length === 0 ? (
                      <p className="text-sm text-neutral-500">
                        Aucune ligne enregistrée dans cette version.
                      </p>
                    ) : (
                      rows.map((row) => (
                        <div
                          key={row.id}
                          className="rounded-lg border border-neutral-200 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold">
                              {row.dimension ?? 'dimension'} — priorité {row.priority ?? 'moyenne'}
                            </div>

                            <form action={deleteDiagnosticMatrixRowAction}>
                              <input type="hidden" name="row_id" value={row.id} />
                              <input type="hidden" name="patient_id" value={patientId} />
                              <button
                                type="submit"
                                className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                Supprimer
                              </button>
                            </form>
                          </div>

                          <form action={updateDiagnosticMatrixRowAction} className="space-y-4">
                            <input type="hidden" name="row_id" value={row.id} />
                            <input type="hidden" name="patient_id" value={patientId} />

                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Dimension
                                </label>
                                <select
                                  name="dimension"
                                  defaultValue={row.dimension ?? 'globale'}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                >
                                  {dimensions.map((dimension) => (
                                    <option key={dimension} value={dimension}>
                                      {dimension}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Priorité
                                </label>
                                <select
                                  name="priority"
                                  defaultValue={row.priority ?? 'moyenne'}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                >
                                  {priorities.map((priority) => (
                                    <option key={priority} value={priority}>
                                      {priority}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Position
                                </label>
                                <input
                                  type="number"
                                  name="position"
                                  defaultValue={row.position ?? 0}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-neutral-700">
                                Constat initial
                              </label>
                              <textarea
                                name="initial_finding"
                                rows={2}
                                defaultValue={row.initial_finding ?? ''}
                                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                              />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Objectif court terme
                                </label>
                                <textarea
                                  name="short_objective"
                                  rows={2}
                                  defaultValue={row.short_objective ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                />
                                <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                                  Sous-objectifs court terme
                                </label>
                                <textarea
                                  name="short_subobjectives"
                                  rows={5}
                                  defaultValue={row.short_subobjectives ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                  placeholder={'Un sous-objectif par ligne'}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Objectif moyen terme
                                </label>
                                <textarea
                                  name="medium_objective"
                                  rows={2}
                                  defaultValue={row.medium_objective ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                />
                                <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                                  Sous-objectifs moyen terme
                                </label>
                                <textarea
                                  name="medium_subobjectives"
                                  rows={5}
                                  defaultValue={row.medium_subobjectives ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                  placeholder={'Un sous-objectif par ligne'}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                  Objectif long terme
                                </label>
                                <textarea
                                  name="long_objective"
                                  rows={2}
                                  defaultValue={row.long_objective ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                />
                                <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                                  Sous-objectifs long terme
                                </label>
                                <textarea
                                  name="long_subobjectives"
                                  rows={5}
                                  defaultValue={row.long_subobjectives ?? ''}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                                  placeholder={'Un sous-objectif par ligne'}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                              >
                                Mettre à jour la ligne
                              </button>
                            </div>
                          </form>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-4">
                    <h5 className="mb-3 text-sm font-semibold text-neutral-800">
                      Ajouter une ligne
                    </h5>

                    <form action={createDiagnosticMatrixRowAction} className="space-y-4">
                      <input type="hidden" name="version_id" value={version.id} />
                      <input type="hidden" name="patient_id" value={patientId} />

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Dimension
                          </label>
                          <select
                            name="dimension"
                            defaultValue="globale"
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          >
                            {dimensions.map((dimension) => (
                              <option key={dimension} value={dimension}>
                                {dimension}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Priorité
                          </label>
                          <select
                            name="priority"
                            defaultValue="moyenne"
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          >
                            {priorities.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Position
                          </label>
                          <input
                            type="number"
                            name="position"
                            defaultValue={0}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                          Constat initial
                        </label>
                        <textarea
                          name="initial_finding"
                          rows={2}
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Objectif court terme
                          </label>
                          <textarea
                            name="short_objective"
                            rows={2}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />
                          <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                            Sous-objectifs court terme
                          </label>
                          <textarea
                            name="short_subobjectives"
                            rows={5}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                            placeholder={'Un sous-objectif par ligne'}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Objectif moyen terme
                          </label>
                          <textarea
                            name="medium_objective"
                            rows={2}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />
                          <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                            Sous-objectifs moyen terme
                          </label>
                          <textarea
                            name="medium_subobjectives"
                            rows={5}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                            placeholder={'Un sous-objectif par ligne'}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Objectif long terme
                          </label>
                          <textarea
                            name="long_objective"
                            rows={2}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                          />
                          <label className="mb-1 mt-2 block text-sm font-medium text-neutral-700">
                            Sous-objectifs long terme
                          </label>
                          <textarea
                            name="long_subobjectives"
                            rows={5}
                            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                            placeholder={'Un sous-objectif par ligne'}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Ajouter la ligne
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}