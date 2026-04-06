import { createGoalAction, updateGoalAction } from '@/lib/atpe/actions'
import { Field, FormShell, Grid, Input, Select, SubmitRow, Textarea } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type Goal = Database['public']['Tables']['therapy_goals']['Row']

export function GoalForm({ patientId, goal }: { patientId: string; goal?: Goal | null }) {
  const action = goal ? updateGoalAction : createGoalAction
  return (
    <form action={action}>
      <FormShell title={goal ? 'Éditer un objectif thérapeutique' : 'Créer un objectif thérapeutique'} description="Objectifs liés à l’épisode thérapeutique principal du patient.">
        <input type="hidden" name="patient_id" value={patientId} />
        {goal ? <input type="hidden" name="goal_id" value={goal.id} /> : null}
        <Field label="Titre">
          <Input name="title" required defaultValue={goal?.title ?? ''} placeholder="Renforcer la régulation émotionnelle" />
        </Field>
        <Field label="Description">
          <Textarea name="description" defaultValue={goal?.description ?? ''} />
        </Field>
        <Grid>
          <Field label="Priorité">
            <Select name="priority" defaultValue={goal?.priority ?? 'medium'}>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </Select>
          </Field>
          <Field label="Statut">
            <Select name="status" defaultValue={goal?.status ?? 'planned'}>
              <option value="planned">Planifié</option>
              <option value="in_progress">En cours</option>
              <option value="achieved">Atteint</option>
              <option value="paused">En pause</option>
              <option value="closed">Clos</option>
            </Select>
          </Field>
          <Field label="Date de revue cible">
            <Input type="date" name="target_review_date" defaultValue={goal?.target_review_date ?? ''} />
          </Field>
        </Grid>
        <SubmitRow cancelHref={`/patients/${patientId}/goals`} submitLabel={goal ? 'Mettre à jour l’objectif' : 'Créer l’objectif'} />
      </FormShell>
    </form>
  )
}
