import {
  validateExpressionAssessmentAction,
  unlockExpressionAssessmentAction,
  validateGoalsAction,
  unlockGoalsAction,
  validateDiagnosticMatrixVersionAction,
  unlockDiagnosticMatrixVersionAction,
} from '@/lib/atpe/clinical-lock-actions'
import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type Mode = 'expression' | 'goals' | 'matrix'

type Props = {
  mode: Mode
  patientId: string
  versionId?: string
  isLocked?: boolean | null
  validatedAt?: string | null
  validatedBy?: string | null
  validationNote?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fr-FR')
}

export function ClinicalSignoffPanel({
  mode,
  patientId,
  versionId,
  isLocked,
  validatedAt,
  validatedBy,
  validationNote,
}: Props) {
  const validateAction =
    mode === 'expression'
      ? validateExpressionAssessmentAction
      : mode === 'goals'
      ? validateGoalsAction
      : validateDiagnosticMatrixVersionAction

  const unlockAction =
    mode === 'expression'
      ? unlockExpressionAssessmentAction
      : mode === 'goals'
      ? unlockGoalsAction
      : unlockDiagnosticMatrixVersionAction

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Signature clinique</h3>
        {isLocked ? (
          <ClinicalStatusBadge label="Verrouillé" variant="validated" />
        ) : (
          <ClinicalStatusBadge label="Modifiable" variant="draft" />
        )}
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div>
          <div className="text-neutral-500">Statut</div>
          <div className="font-medium">
            {isLocked ? 'Version validée et verrouillée' : 'Version en cours d’édition'}
          </div>
        </div>

        <div>
          <div className="text-neutral-500">Date de validation</div>
          <div className="font-medium">{formatDate(validatedAt)}</div>
        </div>

        <div>
          <div className="text-neutral-500">Validé par</div>
          <div className="font-medium">{validatedBy ?? '—'}</div>
        </div>
      </div>

      {validationNote ? (
        <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-700">
          <strong>Note de validation :</strong> {validationNote}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form action={validateAction} className="space-y-3">
          <input type="hidden" name="patient_id" value={patientId} />
          {versionId ? <input type="hidden" name="version_id" value={versionId} /> : null}

          {mode !== 'goals' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Note de validation
              </label>
              <textarea
                name="validation_note"
                rows={3}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                placeholder="Commentaire de validation clinique"
              />
            </div>
          ) : null}

          <button
            type="submit"
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Valider et verrouiller
          </button>
        </form>

        <form action={unlockAction} className="flex items-end">
          <div>
            <input type="hidden" name="patient_id" value={patientId} />
            {versionId ? <input type="hidden" name="version_id" value={versionId} /> : null}

            <button
              type="submit"
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Déverrouiller
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}