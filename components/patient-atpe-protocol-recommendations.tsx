import Link from 'next/link'
import { matchAtpeProtocols } from '@/lib/atpe/protocol-matcher'
import {
  getAxisLabel,
  getClinicalLevelLabel,
  getProgressStateLabel,
} from '@/lib/atpe/clinical-matrix'
import {
  safeArray,
  safeNumber,
  formatShortDate,
  phaseLabel,
  longitudinalPhaseLabel,
} from '@/lib/atpe/format'

type SessionRow = {
  id?: string
  created_at?: string | null
  session_number?: number
  atpe_phase_dominant?: string | null
  longitudinal_phase?:
    | 'installation'
    | 'mobilisation'
    | 'pivot'
    | 'consolidation'
    | null
  patient_engagement_level?: number | null
  frame_containment?: number | null
  bodily_engagement?: number | null
  decentering_level?: number | null
  centering_level?: number | null
  externalization_level?: number | null
  work_dialogue_level?: number | null
  sharing_level?: number | null
  primary_symbolization?: number | null
  secondary_symbolization?: number | null
  relational_availability?: number | null
  creative_mobility?: number | null
  projective_intensity?: number | null
  therapist_presence_quality?: number | null
  therapist_feels_confusion?: boolean | null
  therapist_feels_sudden_fatigue?: boolean | null
  therapist_feels_pressure?: boolean | null
  therapist_feels_irritation?: boolean | null
  therapist_feels_void?: boolean | null
  patient_repeats_without_integration?: boolean | null
  group_feels_same_affect?: boolean | null
  tension_spreads_quickly?: boolean | null
}

type Props = {
  sessions: SessionRow[] | null | undefined
  maxResults?: number
}

function confidenceLabel(value: 'high' | 'medium' | 'low') {
  switch (value) {
    case 'high':
      return 'Confiance élevée'
    case 'medium':
      return 'Confiance moyenne'
    case 'low':
    default:
      return 'Confiance faible'
  }
}

function confidenceClass(value: 'high' | 'medium' | 'low') {
  switch (value) {
    case 'high':
      return 'bg-green-100 text-green-700'
    case 'medium':
      return 'bg-amber-100 text-amber-700'
    case 'low':
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function reasonLabel(reason: string) {
  switch (reason) {
    case 'primary_axis':
      return 'axe principal'
    case 'secondary_axis':
      return 'axe secondaire'
    case 'progress_state':
      return 'état de progression'
    case 'clinical_level':
      return 'niveau clinique'
    case 'priority_axis':
      return 'axe prioritaire'
    case 'phase_alignment':
      return 'phase dominante'
    case 'countertransference_signal':
      return 'signal contre-transférentiel'
    case 'low_containment':
      return 'contenance faible'
    case 'low_engagement':
      return 'engagement faible'
    case 'high_projective_intensity':
      return 'intensité projective'
    case 'closure_phase':
      return 'clôture / transférabilité'
    case 'integration_phase':
      return 'intégration'
    case 'stabilization_need':
      return 'besoin de stabilisation'
    case 'default_support':
      return 'appui transversal'
    default:
      return reason
  }
}

function axisBadgeClass(
  axis:
    | 'relation'
    | 'soma'
    | 'projection'
    | 'symbolisation'
    | 'identite'
    | 'transformation'
) {
  switch (axis) {
    case 'relation':
      return 'bg-blue-100 text-blue-800'
    case 'soma':
      return 'bg-orange-100 text-orange-800'
    case 'projection':
      return 'bg-fuchsia-100 text-fuchsia-800'
    case 'symbolisation':
      return 'bg-violet-100 text-violet-800'
    case 'identite':
      return 'bg-emerald-100 text-emerald-800'
    case 'transformation':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function PatientAtpeProtocolRecommendations({
  sessions,
  maxResults = 3,
}: Props) {
  const safeSessions = safeArray(sessions)
  const match = matchAtpeProtocols(safeSessions, maxResults)
  const latestSession = match.latestSession

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recommandations protocolaires
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Protocoles suggérés automatiquement par le moteur clinique à partir
            de la dernière séance, du niveau global, de l’état de progression
            et des axes prioritaires.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <span>
            Niveau clinique :{' '}
            <strong>{getClinicalLevelLabel(match.recommendedState.level)}</strong>
          </span>
          <span>•</span>
          <span>
            Progression :{' '}
            <strong>
              {getProgressStateLabel(match.recommendedState.progression)}
            </strong>
          </span>
          <span>•</span>
          <span>
            Axe prioritaire :{' '}
            <strong>
              {getAxisLabel(match.recommendedState.priorityAxes[0] ?? 'relation')}
            </strong>
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {match.recommendedState.priorityAxes.slice(0, 3).map((axis) => (
          <span
            key={axis}
            className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
              axis
            )}`}
          >
            Priorité : {getAxisLabel(axis)}
          </span>
        ))}
      </div>

      {match.recommended.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          Aucun protocole automatique disponible pour le moment.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {match.recommended.map((item) => (
            <article
              key={item.slug}
              className="rounded-2xl border bg-slate-50 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceClass(
                    item.confidence
                  )}`}
                >
                  {confidenceLabel(item.confidence)}
                </span>

                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  Score {item.score}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${axisBadgeClass(
                    item.protocol.primary_axis
                  )}`}
                >
                  {getAxisLabel(item.protocol.primary_axis)}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold text-slate-900">
                {item.protocol.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.rationale}
              </p>

              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Raisons détaillées
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {reasonLabel(reason)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>
                  <span className="font-medium">Intention clinique :</span>{' '}
                  {item.protocol.clinical_intent}
                </div>

                <div>
                  <span className="font-medium">État de progression :</span>{' '}
                  {getProgressStateLabel(item.matched_progress_state)}
                </div>

                <div>
                  <span className="font-medium">Niveau clinique :</span>{' '}
                  {getClinicalLevelLabel(item.matched_clinical_level)}
                </div>

                <div>
                  <span className="font-medium">Axes appariés :</span>{' '}
                  {item.matched_axes.length > 0
                    ? item.matched_axes.map((axis) => getAxisLabel(axis)).join(', ')
                    : '—'}
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Cohérence avec la dernière séance
                </h4>

                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div>
                    <span className="font-medium">Séance :</span>{' '}
                    {latestSession?.session_number ?? '—'}
                  </div>
                  <div>
                    <span className="font-medium">Date :</span>{' '}
                    {formatShortDate(latestSession?.created_at ?? null)}
                  </div>
                  <div>
                    <span className="font-medium">Phase dominante :</span>{' '}
                    {phaseLabel(latestSession?.atpe_phase_dominant)}
                  </div>
                  <div>
                    <span className="font-medium">Phase longitudinale :</span>{' '}
                    {longitudinalPhaseLabel(latestSession?.longitudinal_phase)}
                  </div>
                  <div>
                    <span className="font-medium">Axe prioritaire :</span>{' '}
                    {getAxisLabel(match.recommendedState.priorityAxes[0] ?? 'relation')}
                  </div>
                  <div>
                    <span className="font-medium">Engagement patient :</span>{' '}
                    {safeNumber(latestSession?.patient_engagement_level)}
                  </div>
                  <div>
                    <span className="font-medium">Containment :</span>{' '}
                    {safeNumber(latestSession?.frame_containment)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Médiations proposées
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                  {item.protocol.mediations.slice(0, 4).map((mediation) => (
                    <li key={mediation}>{mediation}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/atpe-library/${item.slug}`}
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Ouvrir la fiche protocole
                </Link>

                <Link
                  href="/atpe-library"
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Voir la bibliothèque
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}