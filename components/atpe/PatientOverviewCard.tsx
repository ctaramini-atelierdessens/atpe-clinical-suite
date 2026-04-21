type PatientClinicalOverview = {
  patient_id: string
  active_conditions: Array<{ id: string; label: string; status: string }>
  latest_expression_assessment: null | {
    assessed_on?: string | null
    expression_profile?: string | null
    preliminary_hypothesis?: string | null
    initial_recommendations?: string | null
  }
  active_episode_id: string | null
  active_goals_count: number
  active_subgoals_count: number
  active_alerts_count: number
  latest_analysis: null | {
    title?: string | null
    summary?: string | null
    clinical_interpretation?: string | null
    created_at?: string | null
  }
}

type Props = {
  overview: PatientClinicalOverview
}

export function PatientOverviewCard({ overview }: Props) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Overview clinique patient</h2>
          <p className="text-sm text-slate-500">
            Synthèse rapide pour lecture de dossier et orientation thérapeutique.
          </p>
        </div>

        <div className="rounded-xl border px-3 py-2 text-xs text-slate-600">
          Épisode actif : {overview.active_episode_id ? "oui" : "non"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Conditions actives" value={overview.active_conditions.length} />
        <MetricCard label="Objectifs actifs" value={overview.active_goals_count} />
        <MetricCard label="Sous-objectifs actifs" value={overview.active_subgoals_count} />
        <MetricCard label="Alertes actives" value={overview.active_alerts_count} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Pathologies / conditions</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {overview.active_conditions.length ? (
              overview.active_conditions.map((condition) => (
                <span
                  key={condition.id}
                  className="rounded-full border px-3 py-1 text-xs text-slate-700"
                >
                  {condition.label}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">Aucune condition active renseignée.</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h3 className="text-sm font-semibold text-slate-900">Dernier bilan expressionnel</h3>
          {overview.latest_expression_assessment ? (
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <InfoRow
                label="Date"
                value={overview.latest_expression_assessment.assessed_on ?? "—"}
              />
              <InfoRow
                label="Profil expressif"
                value={overview.latest_expression_assessment.expression_profile ?? "—"}
              />
              <InfoRow
                label="Hypothèse"
                value={overview.latest_expression_assessment.preliminary_hypothesis ?? "—"}
              />
              <InfoRow
                label="Recommandations"
                value={overview.latest_expression_assessment.initial_recommendations ?? "—"}
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Aucun bilan expressionnel disponible.</p>
          )}
        </div>

        <div className="rounded-2xl border p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Dernière analyse clinique</h3>
          {overview.latest_analysis ? (
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <InfoRow label="Titre" value={overview.latest_analysis.title ?? "—"} />
              <InfoRow label="Résumé" value={overview.latest_analysis.summary ?? "—"} />
              <InfoRow
                label="Interprétation"
                value={overview.latest_analysis.clinical_interpretation ?? "—"}
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Aucune analyse clinique disponible.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 whitespace-pre-wrap">{value}</div>
    </div>
  )
}