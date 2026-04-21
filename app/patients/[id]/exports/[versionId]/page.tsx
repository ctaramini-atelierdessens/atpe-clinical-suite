import { PatientExportCertifyButton } from '@/components/patient-export-certify-button'
import { LockedExportVerificationCard } from '@/components/locked-export-verification-card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LockedExportPrintButton } from '@/components/locked-export-print-button'


                            be17Data?.scores?.initiativeCreativity
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Lecture longitudinale</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(longitudinal).map(([key, value]) => {
                        const item = value as {
                            start?: number
                            end?: number
                            trend?: string
                        }

                        return (
                            <div key={key} className="rounded-2xl border border-neutral-200 p-4">
                                <div className="font-medium capitalize">{key}</div>
                                <div className="mt-2 text-sm text-neutral-600">
                                    Début : {item.start ?? 0}
                                </div>
                                <div className="text-sm text-neutral-600">
                                    Fin : {item.end ?? 0}
                                </div>
                                <div className="mt-2 text-sm font-semibold">
                                    Tendance : {item.trend ?? '—'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Projection clinique</h3>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-800">
                    {JSON.stringify(predictive, null, 2)}
                </pre>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Snapshot JSON verrouillé</h3>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-800">
                    {JSON.stringify(payload, null, 2)}
                </pre>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Séances figées</h3>
                {sessions.length === 0 ? (
                    <p className="mt-3 text-sm text-neutral-500">Aucune séance figée.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {sessions.map((session: any, index: number) => (
                            <div
                                key={session.id ?? `session-${index}`}
                                className="rounded-2xl border border-neutral-200 p-4"
                            >
                                <div className="font-medium">
                                    Séance {session.session_number ?? index + 1}
                                </div>
                                <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                    {scoreLine('Émotion', session.emotional_score)}
                                    {scoreLine('Corps', session.body_score)}
                                    {scoreLine('Symbolique', session.symbolic_score)}
                                    {scoreLine('Régulation', session.regulation_score)}
                                    {scoreLine('Dynamique', session.dynamic_score)}
                                    {scoreLine('Engagement', session.engagement_score)}
                                    {scoreLine('Conscience', session.awareness_score)}
                                </div>
                                <div className="mt-3 text-sm whitespace-pre-wrap text-neutral-700">
                                    {session.clinical_summary || 'Pas de synthèse clinique.'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}