import {
  createPatientGoalAction,
  updatePatientGoalAction,
  deletePatientGoalAction,
  createPatientGoalSubitemAction,
  updatePatientGoalSubitemAction,
  deletePatientGoalSubitemAction,
} from '@/lib/atpe/patient-plan-actions'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type Goal = {
  id: string
  dimension?: string | null
  priority?: string | null
  time_horizon?: string | null
  objective_text?: string | null
  position?: number | null
  is_locked?: boolean | null
}

type Subitem = {
  id: string
  goal_id: string
  text?: string | null
  position?: number | null
  is_completed?: boolean | null
}

type Props = {
  patientId: string
  goals: Goal[]
  subitemsByGoalId: Record<string, Subitem[]>
}

const dimensions = ['emotion', 'corps', 'conscience', 'dynamique', 'symbolique', 'globale']
const priorities = ['haute', 'moyenne', 'basse']
const horizons = ['court', 'moyen', 'long']

export function PatientGoalsEditor({
  patientId,
  goals,
  subitemsByGoalId,
}: Props) {
  const locked = goals.length > 0 && goals.every((goal) => Boolean(goal.is_locked))

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Objectifs et sous-objectifs modifiables</h2>
          <p className="text-sm text-neutral-500">
            Tu peux créer, modifier et supprimer les objectifs cliniques.
          </p>
        </div>
        {locked ? (
          <ClinicalStatusBadge label="Verrouillé" variant="validated" />
        ) : (
          <ClinicalStatusBadge label="Brouillon" variant="draft" />
        )}
      </div>

      {locked ? (
        <p className="mb-4 text-sm text-neutral-500">
          Les objectifs sont verrouillés. Déverrouille-les pour les modifier.
        </p>
      ) : null}

      <div className="mb-6 rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-base font-semibold">Ajouter un objectif</h3>

        <form action={createPatientGoalAction} className="space-y-4">
          <input type="hidden" name="patient_id" value={patientId} />

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Dimension</label>
              <select
                name="dimension"
                defaultValue="globale"
                disabled={locked}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
              >
                {dimensions.map((dimension) => (
                  <option key={dimension} value={dimension}>{dimension}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Priorité</label>
              <select
                name="priority"
                defaultValue="moyenne"
                disabled={locked}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Horizon</label>
              <select
                name="time_horizon"
                defaultValue="court"
                disabled={locked}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
              >
                {horizons.map((horizon) => (
                  <option key={horizon} value={horizon}>{horizon}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Position</label>
              <input
                type="number"
                name="position"
                defaultValue={0}
                disabled={locked}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Objectif</label>
            <textarea
              name="objective_text"
              rows={3}
              disabled={locked}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={locked}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Ajouter l'objectif
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {goals.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucun objectif enregistré pour le moment.</p>
        ) : (
          goals.map((goal) => {
            const subitems = subitemsByGoalId[goal.id] ?? []

            return (
              <div key={goal.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-base font-semibold">
                    Objectif {goal.time_horizon ?? '—'} — {goal.dimension ?? '—'}
                  </div>

                  <form action={deletePatientGoalAction}>
                    <input type="hidden" name="goal_id" value={goal.id} />
                    <input type="hidden" name="patient_id" value={patientId} />
                    <button
                      type="submit"
                      disabled={locked}
                      className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>

                <form action={updatePatientGoalAction} className="space-y-4">
                  <input type="hidden" name="goal_id" value={goal.id} />
                  <input type="hidden" name="patient_id" value={patientId} />

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">Dimension</label>
                      <select
                        name="dimension"
                        defaultValue={goal.dimension ?? 'globale'}
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                      >
                        {dimensions.map((dimension) => (
                          <option key={dimension} value={dimension}>{dimension}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">Priorité</label>
                      <select
                        name="priority"
                        defaultValue={goal.priority ?? 'moyenne'}
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                      >
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">Horizon</label>
                      <select
                        name="time_horizon"
                        defaultValue={goal.time_horizon ?? 'court'}
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                      >
                        {horizons.map((horizon) => (
                          <option key={horizon} value={horizon}>{horizon}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">Position</label>
                      <input
                        type="number"
                        name="position"
                        defaultValue={goal.position ?? 0}
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Objectif</label>
                    <textarea
                      name="objective_text"
                      rows={3}
                      disabled={locked}
                      defaultValue={goal.objective_text ?? ''}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={locked}
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Mettre à jour l'objectif
                    </button>
                  </div>
                </form>

                <div className="mt-6 rounded-xl border border-neutral-200 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-neutral-800">Sous-objectifs</h4>

                  <div className="space-y-3">
                    {subitems.length === 0 ? (
                      <p className="text-sm text-neutral-500">Aucun sous-objectif pour cet objectif.</p>
                    ) : (
                      subitems.map((subitem) => (
                        <div key={subitem.id} className="rounded-lg border border-neutral-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <form action={updatePatientGoalSubitemAction} className="flex-1 space-y-3">
                              <input type="hidden" name="subitem_id" value={subitem.id} />
                              <input type="hidden" name="patient_id" value={patientId} />

                              <div className="grid gap-3 md:grid-cols-[1fr_120px_160px]">
                                <input
                                  type="text"
                                  name="text"
                                  defaultValue={subitem.text ?? ''}
                                  disabled={locked}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                                />

                                <input
                                  type="number"
                                  name="position"
                                  defaultValue={subitem.position ?? 0}
                                  disabled={locked}
                                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                                />

                                <label className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                                  <input
                                    type="checkbox"
                                    name="is_completed"
                                    defaultChecked={Boolean(subitem.is_completed)}
                                    disabled={locked}
                                  />
                                  Terminé
                                </label>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  disabled={locked}
                                  className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  Mettre à jour
                                </button>
                              </div>
                            </form>

                            <form action={deletePatientGoalSubitemAction}>
                              <input type="hidden" name="subitem_id" value={subitem.id} />
                              <input type="hidden" name="patient_id" value={patientId} />
                              <button
                                type="submit"
                                disabled={locked}
                                className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Supprimer
                              </button>
                            </form>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form action={createPatientGoalSubitemAction} className="mt-4 space-y-3">
                    <input type="hidden" name="goal_id" value={goal.id} />
                    <input type="hidden" name="patient_id" value={patientId} />

                    <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                      <input
                        type="text"
                        name="text"
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                        placeholder="Nouveau sous-objectif"
                      />
                      <input
                        type="number"
                        name="position"
                        defaultValue={0}
                        disabled={locked}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={locked}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Ajouter le sous-objectif
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}