import { createReviewRequestAction, decideReviewRequestAction } from '@/lib/atpe/actions'
import { canReview, type MembershipRole } from '@/lib/atpe/rbac'
import { Field, FormShell, Input, Select, SubmitRow, Textarea } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type ReviewRequest = Database['public']['Tables']['clinical_review_requests']['Row']

export function ReviewRequestForm({
  patientId,
  sessionId,
  supervisors,
}: {
  patientId: string
  sessionId?: string | null
  supervisors: Array<{ user_id: string; role: string }>
}) {
  return (
    <form action={createReviewRequestAction}>
      <FormShell
        title="Soumettre à validation superviseur"
        description="Workflow clinique pour revue, approbation ou demande de modifications."
      >
        <input type="hidden" name="patient_id" value={patientId} />
        {sessionId ? <input type="hidden" name="session_id" value={sessionId} /> : null}
        <Field label="Superviseur assigné">
          <Select name="assigned_supervisor_id" defaultValue="">
            <option value="">Affectation libre</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.user_id} value={supervisor.user_id}>
                {supervisor.user_id} · {supervisor.role}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Note de demande">
          <Textarea name="request_note" className="min-h-[110px]" placeholder="Points à relire, décision attendue, contexte clinique." />
        </Field>
        <SubmitRow cancelHref={`/patients/${patientId}`} submitLabel="Soumettre à validation" />
      </FormShell>
    </form>
  )
}

export function ReviewRequestList({
  items,
  role,
  patientId,
}: {
  items: ReviewRequest[]
  role: MembershipRole | null | undefined
  patientId: string
}) {
  if (!items.length) return <p className="text-sm text-slate-500">Aucune revue clinique soumise.</p>

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">Revue {item.status}</h3>
              <p className="text-xs text-slate-500">Soumise le {item.submitted_at ? new Date(item.submitted_at).toLocaleString('fr-FR') : '—'}</p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{item.status}</span>
          </div>
          {item.request_note ? <p className="mt-3 text-sm text-slate-600">{item.request_note}</p> : null}
          {item.supervisor_note ? <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{item.supervisor_note}</p> : null}

          {canReview(role) && item.status === 'submitted' ? (
            <form action={decideReviewRequestAction} className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4">
              <input type="hidden" name="review_id" value={item.id} />
              <input type="hidden" name="patient_id" value={patientId} />
              <Field label="Décision superviseur">
                <Select name="decision" defaultValue="approved">
                  <option value="approved">Approuver</option>
                  <option value="changes_requested">Demander des modifications</option>
                  <option value="rejected">Rejeter</option>
                </Select>
              </Field>
              <Field label="Commentaire superviseur">
                <Textarea name="supervisor_note" className="min-h-[90px]" />
              </Field>
              <SubmitRow submitLabel="Valider la revue" />
            </form>
          ) : null}
        </div>
      ))}
    </div>
  )
}
