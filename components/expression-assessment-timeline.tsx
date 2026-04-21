type TimelineInterview = {
  id: string
  interview_type?: string | null
  interview_date?: string | null
  duration_minutes?: number | null
  created_at?: string | null
}

type TimelineSession = {
  id: string
  session_type?: string | null
  session_date?: string | null
  duration_minutes?: number | null
  session_number?: number | null
  created_at?: string | null
}

type TimelineAssessment = {
  id: string
  status?: string | null
  request_date?: string | null
  created_at?: string | null
  closed_at?: string | null
}

type Props = {
  assessment: TimelineAssessment
  interviews: TimelineInterview[]
  sessions: TimelineSession[]
}

type TimelineItem = {
  id: string
  date: string | null
  kind:
    | 'assessment_created'
    | 'interview'
    | 'session'
    | 'assessment_closed'
    | 'assessment_converted'
  title: string
  subtitle?: string
  href?: string
}

function labelInterviewType(type?: string | null) {
  switch (type) {
    case 'primo':
      return 'Primo-entretien'
    case 'final':
      return 'Entretien final'
    case 'requester':
      return 'Entretien avec le demandeur'
    case 'family':
      return 'Entretien avec la famille'
    case 'team':
      return "Entretien avec l’équipe"
    default:
      return type || 'Entretien'
  }
}

function labelSessionType(type?: string | null) {
  switch (type) {
    case 'discovery':
      return 'Séance découverte pluriexpressionnelle'
    case 'music_receptivity':
      return 'Séance de réceptivité musicale'
    case 'trial_group':
      return "Séance d’essai en groupe"
    case 'trial_individual':
      return "Séance d’essai individuelle"
    case 'other':
      return 'Autre séance du bilan'
    default:
      return type || 'Séance'
  }
}

function labelStatus(status?: string | null) {
  switch (status) {
    case 'draft':
      return 'Brouillon'
    case 'intake_started':
      return 'Entame du bilan'
    case 'discovery_in_progress':
      return 'Découverte en cours'
    case 'final_interview_done':
      return 'Entretien final réalisé'
    case 'trial_sessions':
      return "Séances d’essai"
    case 'recommended':
      return 'Recommandé'
    case 'deferred':
      return 'Différé'
    case 'refused':
      return 'Refusé'
    case 'converted_to_care':
      return 'Converti en prise en charge'
    default:
      return status || 'Non renseigné'
  }
}

function toSortableDate(value: string | null | undefined) {
  if (!value) return '9999-12-31'
  return value
}

export function ExpressionAssessmentTimeline({
  assessment,
  interviews,
  sessions,
}: Props) {
  const items: TimelineItem[] = []

  items.push({
    id: `assessment-${assessment.id}`,
    date: assessment.request_date || assessment.created_at || null,
    kind: 'assessment_created',
    title: 'Création du bilan expressionnel',
    subtitle: `Statut initial : ${labelStatus(assessment.status)}`,
  })

  for (const interview of interviews) {
    items.push({
      id: `interview-${interview.id}`,
      date: interview.interview_date || interview.created_at || null,
      kind: 'interview',
      title: labelInterviewType(interview.interview_type),
      subtitle: interview.duration_minutes
        ? `${interview.duration_minutes} min`
        : 'Durée non renseignée',
      href: `interviews/${interview.id}`,
    })
  }

  for (const session of sessions) {
    items.push({
      id: `session-${session.id}`,
      date: session.session_date || session.created_at || null,
      kind: 'session',
      title: session.session_number
        ? `${labelSessionType(session.session_type)} · n°${session.session_number}`
        : labelSessionType(session.session_type),
      subtitle: session.duration_minutes
        ? `${session.duration_minutes} min`
        : 'Durée non renseignée',
      href: `sessions/${session.id}`,
    })
  }

  if (assessment.closed_at) {
    items.push({
      id: `closed-${assessment.id}`,
      date: assessment.closed_at,
      kind: assessment.status === 'converted_to_care'
        ? 'assessment_converted'
        : 'assessment_closed',
      title:
        assessment.status === 'converted_to_care'
          ? 'Conversion en prise en charge'
          : 'Clôture du bilan',
      subtitle: `Statut : ${labelStatus(assessment.status)}`,
    })
  }

  const sorted = items.sort((a, b) =>
    toSortableDate(a.date).localeCompare(toSortableDate(b.date))
  )

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div>
        <p className="text-sm text-slate-500">Lecture continue du processus</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Timeline du bilan expressionnel
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {!sorted.length ? (
          <p className="text-sm text-slate-500">Aucun événement à afficher.</p>
        ) : (
          sorted.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex w-10 flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-slate-400" />
                {index < sorted.length - 1 ? (
                  <div className="mt-1 h-full min-h-[32px] w-px bg-slate-200" />
                ) : null}
              </div>

              <div className="flex-1 rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.kind === 'assessment_created'
                        ? 'Bilan'
                        : item.kind === 'interview'
                        ? 'Entretien'
                        : item.kind === 'session'
                        ? 'Séance'
                        : item.kind === 'assessment_converted'
                        ? 'Conversion'
                        : 'Clôture'}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    {item.subtitle ? (
                      <p className="mt-2 text-sm text-slate-600">{item.subtitle}</p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {item.date || 'Date non renseignée'}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-2 inline-block text-xs font-medium text-slate-700 hover:text-slate-900"
                      >
                        Ouvrir
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}