import type { Database } from '@/types/database'
import {
  computeAtpeExpertResult,
  getTrendLabel,
  getProfileLabel,
} from '@/lib/atpe-expert'
import { SessionRadar } from '@/components/session-radar'

type Session = Database['public']['Tables']['sessions']['Row']
type NoteVersion = Database['public']['Tables']['session_note_versions']['Row']

function avgScore(session: Session) {
  const values = [
    session.emotional_score,
    session.body_score,
    session.awareness_score,
    session.dynamic_score,
    session.symbolic_score,
    session.regulation_score,
    session.engagement_score,
  ]

  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
}

export function PatientTimeline({
  sessions,
  versionsBySession,
}: {
  sessions: Session[]
  versionsBySession?: Record<string, NoteVersion[]>
}) {
  return (
    <div className="space-y-4">
      {sessions.length ? (
        sessions.map((session, index) => {
          const previousSession = index > 0 ? sessions[index - 1] : null

          const expertResult = computeAtpeExpertResult(
            {
              emotion: session.emotional_score,
              corps: session.body_score,
              conscience: session.awareness_score,
              dynamique: session.dynamic_score,
              symbolique: session.symbolic_score,
              regulation: session.regulation_score,
              engagement: session.engagement_score,
            },
            previousSession
              ? {
                  emotion: previousSession.emotional_score,
                  corps: previousSession.body_score,
                  conscience: previousSession.awareness_score,
                  dynamique: previousSession.dynamic_score,
                  symbolique: previousSession.symbolic_score,
                  regulation: previousSession.regulation_score,
                  engagement: previousSession.engagement_score,
                }
              : null
          )

          const versions = versionsBySession?.[session.id] ?? []

          return (
            <div
              key={session.id}
              className="relative rounded-3xl border border-slate-200 bg-white p-5"
            >
              {index < sessions.length - 1 ? (
                <div className="absolute left-8 top-16 h-[calc(100%+1rem)] w-px bg-slate-200" />
              ) : null}

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {session.session_number}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Séance {session.session_number}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {session.session_date} · {session.mediation_type} · cadre{' '}
                        {session.frame_quality}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      Moyenne descriptive {avgScore(session)}/10
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-4">
                    {[
                      ['Émotion', session.emotional_score],
                      ['Corps', session.body_score],
                      ['Conscience', session.awareness_score],
                      ['Dynamique', session.dynamic_score],
                      ['Symbolique', session.symbolic_score],
                      ['Régulation', session.regulation_score],
                      ['Engagement', session.engagement_score],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <div className="text-slate-500">{label}</div>
                        <div className="font-semibold text-slate-900">
                          {String(value)}/10
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {session.clinical_summary ??
                      session.note ??
                      'Aucun résumé clinique.'}
                  </p>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-900">
                      Lecture clinique automatique
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="text-sm">
                        <strong>Score global :</strong>{' '}
                        {expertResult.scoreGlobal ?? '—'}/100
                      </div>

                      <div className="text-sm">
                        <strong>Niveau :</strong> {expertResult.niveau}
                      </div>

                      <div className="text-sm">
                        <strong>Tendance :</strong>{' '}
                        {getTrendLabel(expertResult.tendance)}
                      </div>

                      <div className="text-sm">
                        <strong>Profil :</strong>{' '}
                        {getProfileLabel(expertResult.profil)}
                      </div>

                      <div className="text-sm">
                        <strong>Pôle régulation :</strong>{' '}
                        {expertResult.poleRegulation ?? '—'}/100
                      </div>

                      <div className="text-sm">
                        <strong>Pôle ancrage :</strong>{' '}
                        {expertResult.poleAncrage ?? '—'}/100
                      </div>

                      <div className="text-sm md:col-span-2">
                        <strong>Pôle élaboration :</strong>{' '}
                        {expertResult.poleElaboration ?? '—'}/100
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <strong>Synthèse :</strong> {expertResult.synthese}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-sm font-semibold text-slate-900">
                      Profil visuel de la séance
                    </div>

                    <SessionRadar
                      emotion={session.emotional_score}
                      corps={session.body_score}
                      conscience={session.awareness_score}
                      dynamique={session.dynamic_score}
                      symbolique={session.symbolic_score}
                      regulation={session.regulation_score}
                      engagement={session.engagement_score}
                      previous={
                        previousSession
                          ? {
                              emotion: previousSession.emotional_score,
                              corps: previousSession.body_score,
                              conscience: previousSession.awareness_score,
                              dynamique: previousSession.dynamic_score,
                              symbolique: previousSession.symbolic_score,
                              regulation: previousSession.regulation_score,
                              engagement: previousSession.engagement_score,
                            }
                          : null
                      }
                    />
                  </div>

                  {session.therapist_hypothesis ? (
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">
                        Hypothèse :
                      </span>{' '}
                      {session.therapist_hypothesis}
                    </p>
                  ) : null}

                  {versions.length ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-amber-900">
                          Historique des versions de note
                        </h4>
                        <span className="badge bg-white text-amber-800">
                          {versions.length} version(s)
                        </span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className="rounded-2xl bg-white p-3 text-sm text-slate-700"
                          >
                            <p className="font-medium text-slate-900">
                              Version {version.version_number} ·{' '}
                              {new Date(version.edited_at).toLocaleString(
                                'fr-FR'
                              )}
                            </p>

                            {version.change_reason ? (
                              <p className="mt-1 text-slate-500">
                                Motif: {version.change_reason}
                              </p>
                            ) : null}

                            {version.previous_clinical_summary ? (
                              <p className="mt-2">
                                <span className="font-medium">
                                  Résumé précédent:
                                </span>{' '}
                                {version.previous_clinical_summary}
                              </p>
                            ) : null}

                            {version.previous_note ? (
                              <p className="mt-2">
                                <span className="font-medium">
                                  Note précédente:
                                </span>{' '}
                                {version.previous_note}
                              </p>
                            ) : null}

                            {version.previous_therapist_hypothesis ? (
                              <p className="mt-2">
                                <span className="font-medium">
                                  Hypothèse précédente:
                                </span>{' '}
                                {version.previous_therapist_hypothesis}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Aucune séance visible dans la timeline.
        </div>
      )}
    </div>
  )
}