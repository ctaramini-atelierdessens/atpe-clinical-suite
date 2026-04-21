import { createPatientAction, updatePatientAction } from '@/lib/atpe/actions'
import {
  Field,
  FormShell,
  Grid,
  Input,
  Select,
  SubmitRow,
  Textarea,
} from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type PatientRow = Database['public']['Tables']['patients']['Row']

type Props = {
  patient?: PatientRow | null
  submitLabel?: string
}

export function PatientForm({
  patient,
  submitLabel = patient ? 'Enregistrer les modifications' : 'Créer le patient',
}: Props) {
  const action = patient ? updatePatientAction : createPatientAction

  return (
    <FormShell
      action={action}
      title={patient ? 'Modifier le patient' : 'Nouveau patient'}
      description="Renseignez les informations administratives essentielles du patient."
    >
      {patient?.id ? <input type="hidden" name="id" value={patient.id} /> : null}

      <Grid>
        <Field label="Code patient">
          <Input name="code" defaultValue={patient?.code ?? ''} />
        </Field>

        <Field label="Initiales">
          <Input name="initials" defaultValue={patient?.initials ?? ''} />
        </Field>
      </Grid>

      <Grid>
        <Field label="Année de naissance">
          <Input
            name="birth_year"
            type="number"
            defaultValue={patient?.birth_year ?? ''}
          />
        </Field>

        <Field label="Sexe">
          <Select name="sex" defaultValue={patient?.sex ?? ''}>
            <option value="">—</option>
            <option value="F">F</option>
            <option value="M">M</option>
          </Select>
        </Field>
      </Grid>

      <Field label="Notes">
        <Textarea
          name="notes"
          defaultValue={''}
          placeholder="Zone libre éventuelle"
          rows={4}
        />
      </Field>

      <SubmitRow submitLabel={submitLabel} />
    </FormShell>
  )
}