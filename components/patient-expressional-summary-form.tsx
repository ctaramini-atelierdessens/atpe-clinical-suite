import { upsertPatientExpressionalAssessmentAction } from '@/lib/atpe/patient-plan-actions'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type ExpressionAssessment = {
  id?: string | null
  expression_summary?: string | null
  expression_profile?: string | null
  preferred_mediations?: string | null
  vigilance_points?: string | null
  clinician_notes?: string | null
  is_locked?: boolean | null
}

type Props = {
  patientId: string
  assessment?: ExpressionAssessment | null
}

export function PatientExpressionalSummaryForm({
  patientId,
  assessment,
}: Props) {
  const locked = Boolean(assessment?.is_locked)

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Bilan expressionnel modifiable
        </h2>
        {locked ? (
          <ClinicalStatusBadge label="Verrouillé" variant="validated" />
        ) : (
          <ClinicalStatusBadge label="Brouillon" variant="draft" />
        )}
      </div>

      {locked ? (
        <p className="mb-4 text-sm text-neutral-500">
          Cette version est verrouillée. Déverrouille-la pour pouvoir la modifier.
        </p>
      ) : null}

      <form action={upsertPatientExpressionalAssessmentAction} className="space-y-4">
        <input type="hidden" name="patient_id" value={patientId} />

        <div>
          <label htmlFor="expression_summary" className="mb-1 block text-sm font-medium text-neutral-700">
            Synthèse expressionnelle
          </label>
          <textarea
            id="expression_summary"
            name="expression_summary"
            rows={4}
            disabled={locked}
            defaultValue={assessment?.expression_summary ?? ''}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="expression_profile" className="mb-1 block text-sm font-medium text-neutral-700">
            Profil d'expression
          </label>
          <textarea
            id="expression_profile"
            name="expression_profile"
            rows={3}
            disabled={locked}
            defaultValue={assessment?.expression_profile ?? ''}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="preferred_mediations" className="mb-1 block text-sm font-medium text-neutral-700">
            Médiations à privilégier
          </label>
          <textarea
            id="preferred_mediations"
            name="preferred_mediations"
            rows={3}
            disabled={locked}
            defaultValue={assessment?.preferred_mediations ?? ''}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="vigilance_points" className="mb-1 block text-sm font-medium text-neutral-700">
            Points de vigilance
          </label>
          <textarea
            id="vigilance_points"
            name="vigilance_points"
            rows={3}
            disabled={locked}
            defaultValue={assessment?.vigilance_points ?? ''}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="clinician_notes" className="mb-1 block text-sm font-medium text-neutral-700">
            Notes clinicien
          </label>
          <textarea
            id="clinician_notes"
            name="clinician_notes"
            rows={4}
            disabled={locked}
            defaultValue={assessment?.clinician_notes ?? ''}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={locked}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Enregistrer le bilan expressionnel
          </button>
        </div>
      </form>
    </div>
  )
}