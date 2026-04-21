import { ClinicalStatusBadge } from '@/components/clinical-status-badge'

type ExpressionAssessment = {
  expression_summary?: string | null
  expression_profile?: string | null
  preferred_mediations?: string | null
  vigilance_points?: string | null
  clinician_notes?: string | null
}

type Props = {
  assessment: ExpressionAssessment
}

export function PatientExpressionalSummaryVersionView({
  assessment,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Bilan expressionnel</h2>
        <ClinicalStatusBadge
          label="Version validée"
          variant="validated"
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-sm font-medium text-neutral-700">
            Synthèse expressionnelle
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {assessment.expression_summary ?? '—'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Profil d'expression</div>
            <div className="mt-1 text-sm font-medium text-neutral-800">
              {assessment.expression_profile ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">
              Médiations à privilégier
            </div>
            <div className="mt-1 text-sm font-medium text-neutral-800">
              {assessment.preferred_mediations ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm text-neutral-500">Points de vigilance</div>
            <div className="mt-1 text-sm font-medium text-neutral-800">
              {assessment.vigilance_points ?? '—'}
            </div>
          </div>
        </div>

        {assessment.clinician_notes ? (
          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="text-sm font-medium text-neutral-700">
              Notes clinicien
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {assessment.clinician_notes}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}