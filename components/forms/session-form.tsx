import { createSessionAction, updateSessionAction } from '@/lib/atpe/actions'
import { Field, FormShell, Grid, Input, Select, SubmitRow, Textarea } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type Session = Database['public']['Tables']['sessions']['Row']

function ScoreField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: number | null }) {
  return (
    <Field label={label} hint="Score descriptif 0 à 10. Aucune recommandation automatisée.">
      <Input type="number" min={0} max={10} step={1} name={name} defaultValue={defaultValue ?? 0} />
    </Field>
  )
}

export function SessionForm({ patientId, session }: { patientId: string; session?: Session | null }) {
  const action = session ? updateSessionAction : createSessionAction
  return (
    <form action={action}>
      <FormShell title={session ? `Éditer la séance ${session.session_number}` : 'Créer une séance'} description="Saisie descriptive structurée ATPE par séance.">
        <input type="hidden" name="patient_id" value={patientId} />
        {session ? <input type="hidden" name="session_id" value={session.id} /> : null}

        <Grid>
          <Field label="Numéro de séance">
            <Input type="number" min={1} name="session_number" defaultValue={session?.session_number ?? 1} required />
          </Field>
          <Field label="Date de séance">
            <Input type="date" name="session_date" defaultValue={session?.session_date ?? new Date().toISOString().slice(0, 10)} required />
          </Field>
          <Field label="Durée (minutes)">
            <Input type="number" min={0} name="duration_minutes" defaultValue={session?.duration_minutes ?? 60} />
          </Field>
          <Field label="Cadre de séance">
            <Select name="setting_type" defaultValue={session?.setting_type ?? 'cabinet'}>
              <option value="cabinet">Cabinet</option>
              <option value="institution">Institution</option>
              <option value="domicile">Domicile</option>
              <option value="teleconsultation">Téléconsultation</option>
              <option value="other">Autre</option>
            </Select>
          </Field>
          <Field label="Médiation">
            <Select name="mediation_type" defaultValue={session?.mediation_type ?? 'mixte'}>
              <option value="arts_plastiques">Arts plastiques</option>
              <option value="musique">Musique</option>
              <option value="ecriture">Écriture</option>
              <option value="corps_mouvement">Corps et mouvement</option>
              <option value="mixte">Mixte</option>
              <option value="other">Autre</option>
            </Select>
          </Field>
          <Field label="Qualité du cadre">
            <Select name="frame_quality" defaultValue={session?.frame_quality ?? 'stable'}>
              <option value="stable">Stable</option>
              <option value="fragile">Fragile</option>
              <option value="rupture">Rupture</option>
            </Select>
          </Field>
        </Grid>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold">Scores descriptifs</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ScoreField name="emotional_score" label="Émotion" defaultValue={session?.emotional_score} />
            <ScoreField name="body_score" label="Corps" defaultValue={session?.body_score} />
            <ScoreField name="awareness_score" label="Conscience" defaultValue={session?.awareness_score} />
            <ScoreField name="dynamic_score" label="Dynamique" defaultValue={session?.dynamic_score} />
            <ScoreField name="symbolic_score" label="Symbolique" defaultValue={session?.symbolic_score} />
            <ScoreField name="regulation_score" label="Régulation" defaultValue={session?.regulation_score} />
            <ScoreField name="engagement_score" label="Engagement" defaultValue={session?.engagement_score} />
          </div>
        </div>

        <Grid>
          <Field label="Note clinique libre">
            <Textarea name="note" defaultValue={session?.note ?? ''} />
          </Field>
          <Field label="Résumé clinique">
            <Textarea name="clinical_summary" defaultValue={session?.clinical_summary ?? ''} />
          </Field>
        </Grid>
        <Field label="Hypothèse thérapeute">
          <Textarea name="therapist_hypothesis" defaultValue={session?.therapist_hypothesis ?? ''} />
        </Field>
        {session ? (
          <Field label="Motif de révision de la note" hint="Saisi si tu veux documenter pourquoi une version clinique est remplacée.">
            <Textarea name="change_reason" defaultValue="" className="min-h-[90px]" />
          </Field>
        ) : null}

        <SubmitRow cancelHref={`/patients/${patientId}`} submitLabel={session ? 'Mettre à jour la séance' : 'Créer la séance'} />
      </FormShell>
    </form>
  )
}
