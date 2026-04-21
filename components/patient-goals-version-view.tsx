import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type Goal = {
  id: string
  dimension?: string | null
  priority?: string | null
  time_horizon?: string | null
  objective_text?: string | null
  position?: number | null
}

type Subitem = {
  id: string
  goal_id: string
  text?: string | null
  position?: number | null
  is_completed?: boolean | null
}

type Props = {
  goals: Goal[]
  subitemsByGoalId: Record<string, Subitem[]>
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

export function PatientGoalsVersionView({
  goals,
  subitemsByGoalId,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Objectifs thérapeutiques
        </h2>
        <ClinicalStatusBadge
          label="Version validée"
          variant="validated"
        />
      </div>

      {!goals.length ? (
        <p className="text-sm text-neutral-500">
          Aucun objectif enregistré.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const subitems = subitemsByGoalId[goal.id] ?? []

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-neutral-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    {goal.time_horizon ?? '—'} — {goal.dimension ?? '—'}
                  </div>

                  <ClinicalStatusBadge
                    label={`Priorité ${goal.priority ?? 'moyenne'}`}
                    variant={priorityVariant(goal.priority)}
                  />
                </div>

                <div className="text-sm text-neutral-700">
                  <strong>Objectif :</strong> {goal.objective_text ?? '—'}
                </div>

                {subitems.length > 0 ? (
                  <div className="mt-3">
                    <div className="mb-2 text-sm font-medium text-neutral-700">
                      Sous-objectifs
                    </div>

                    <ul className="ml-5 list-disc space-y-1 text-sm text-neutral-600">
                      {subitems.map((subitem) => (
                        <li key={subitem.id}>
                          {subitem.text ?? '—'}
                          {subitem.is_completed ? ' ✓' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}