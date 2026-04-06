import { createPatientAction, updatePatientAction } from '@/lib/atpe/actions'
import { Field, FormShell, Grid, Input, Select, SubmitRow, Textarea } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type Patient = Database['public']['Tables']['patients']['Row']
type Episode = Database['public']['Tables']['therapy_episodes']['Row']

export function PatientForm({ patient, episode }: { patient?: Patient | null; episode?: Episode | null }) {
  const action = patient ? updatePatientAction : createPatientAction
  const title = patient ? `Éditer ${patient.code}` : 'Créer un patient'

  return (
    <form action={action}>
      <FormShell title={title} description="Écran métier patient + épisode thérapeutique principal.">
        {patient ? <input type="hidden" name="patient_id" value={patient.id} /> : null}
        {episode ? <input type="hidden" name="episode_id" value={episode.id} /> : null}

        <Grid>
          <Field label="Code patient">
            <Input name="code" required defaultValue={patient?.code ?? ''} placeholder="ATPE-001" />
          </Field>
          <Field label="Initiales">
            <Input name="initials" defaultValue={patient?.initials ?? ''} placeholder="OV" />
          </Field>
          <Field label="Année de naissance">
            <Input type="number" name="birth_year" defaultValue={patient?.birth_year ?? ''} placeholder="1980" />
          </Field>
          <Field label="Sexe">
            <Input name="sex" defaultValue={patient?.sex ?? ''} placeholder="F / M / autre" />
          </Field>
          <Field label="Source d'orientation">
            <Input name="referral_source" defaultValue={patient?.referral_source ?? ''} placeholder="Médecin, institution, famille..." />
          </Field>
          <Field label="Référence dossier">
            <Input name="case_reference" defaultValue={patient?.case_reference ?? ''} placeholder="Référence interne" />
          </Field>
          <Field label="Premier contact">
            <Input type="date" name="first_contact_on" defaultValue={patient?.first_contact_on ?? ''} />
          </Field>
          <Field label="Statut patient">
            <Select name="status" defaultValue={patient?.status ?? 'active'}>
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="closed">Clos</option>
            </Select>
          </Field>
        </Grid>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold">Épisode thérapeutique principal</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Libellé épisode">
              <Input name="episode_label" defaultValue={episode?.episode_label ?? 'Suivi principal'} />
            </Field>
            <Field label="Statut épisode">
              <Select name="episode_status" defaultValue={episode?.status ?? 'active'}>
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="suspended">Suspendu</option>
              </Select>
            </Field>
            <Field label="Ouvert le">
              <Input type="date" name="opened_on" defaultValue={episode?.opened_on ?? new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Clôturé le">
              <Input type="date" name="closed_on" defaultValue={episode?.closed_on ?? ''} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Motif d'orientation">
              <Textarea name="referral_reason" defaultValue={episode?.referral_reason ?? ''} className="min-h-[110px]" />
            </Field>
            <Field label="Cadre thérapeutique">
              <Textarea name="therapeutic_frame" defaultValue={episode?.therapeutic_frame ?? ''} className="min-h-[110px]" />
            </Field>
            <Field label="Indication clinique">
              <Textarea name="clinical_indication" defaultValue={episode?.clinical_indication ?? ''} className="min-h-[110px]" />
            </Field>
            <Field label="Résumé des objectifs">
              <Textarea name="objectives_summary" defaultValue={episode?.objectives_summary ?? ''} className="min-h-[110px]" />
            </Field>
          </div>
        </div>

        <SubmitRow cancelHref={patient ? `/patients/${patient.id}` : '/patients'} submitLabel={patient ? 'Enregistrer les modifications' : 'Créer le patient'} />
      </FormShell>
    </form>
  )
}
