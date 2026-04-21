import {

runAtpeExpertV1,
type ExpertObservationInput,
} from '@/lib/atpe-expert'

type Props = {
observation?: ExpertObservationInput | null
title?: string
}

function Badge({
children,
tone = 'default',
}: {
children: React.ReactNode
tone?: 'default' | 'warning' | 'critical' | 'success'
}) {
const className =
    tone === 'warning'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : tone === 'critical'
        ? 'bg-rose-100 text-rose-800 border-rose-200'
        : tone === 'success'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-slate-100 text-slate-800 border-slate-200'

return (
    <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
        {children}
    </span>
)
}

function Section({
title,
children,
}: {
title: string
children: React.ReactNode
}) {
return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
        {children}
    </div>
)
}

export function PatientExpertV1Card({
observation,
title = 'Moteur expert ATPE V1',
}: Props) {
const result = runAtpeExpertV1(observation)

const hasObservation = Boolean(observation)

return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">
                Analyse clinique experte simplifiée issue des observations de séance.
            </p>
        </div>

        {!hasObservation ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                Aucune observation experte disponible pour générer le profil.
            </div>
        ) : (
            <div className="grid gap-4">
                <Section title="Synthèse">
                    <p className="text-sm leading-6 text-slate-700">{result.synthesis}</p>
                </Section>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Section title="Profils repérés">
                        {result.profiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {result.profiles.map((profile) => (
                                    <Badge key={profile} tone="success">
                                        {profile}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Aucun profil expert automatique repéré.
                            </p>
                        )}
                    </Section>

                    <Section title="Risques de vigilance">
                        {result.risks.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {result.risks.map((risk) => (
                                    <Badge
                                        key={risk}
                                        tone={
                                            risk === 'surcharge sensorielle' ? 'warning' : 'critical'
                                        }
                                    >
                                        {risk}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Aucun risque majeur repéré automatiquement.
                            </p>
                        )}
                    </Section>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Section title="Modalité dominante">
                        <p className="text-sm font-medium text-slate-800">
                            {result.dominantModality ?? 'Non déterminée'}
                        </p>
                    </Section>

                    <Section title="Fatigue">
                        <p className="text-sm font-medium text-slate-800">
                            {result.fatigueLevel ?? 'Non renseignée'}
                        </p>
                    </Section>

                    <Section title="Engagement">
                        <p className="text-sm font-medium text-slate-800">
                            {result.engagementLevel ?? 'Non renseigné'}
                        </p>
                    </Section>
                </div>

                <Section title="Régulation émotionnelle">
                    <p className="text-sm text-slate-700">
                        {result.emotionalRegulation ?? 'Non déterminée'}
                    </p>
                </Section>

                <Section title="Notes cliniques automatiques">
                    {result.notes.length > 0 ? (
                        <ul className="space-y-2 text-sm text-slate-700">
                            {result.notes.map((note, index) => (
                                <li key={`${index}-${note}`} className="leading-6">
                                    • {note}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Aucune note automatique disponible.
                        </p>
                    )}
                </Section>

                <Section title="Protocoles recommandés">
                    {result.recommendations.length > 0 ? (
                        <div className="space-y-4">
                            {result.recommendations.map((rec) => (
                                <div
                                    key={rec.profile_type}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-semibold text-slate-900">
                                            Profil : {rec.profile_type}
                                        </h4>
                                        <Badge>{rec.protocol.mediations.principale}</Badge>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Cadre
                                            </p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>Durée : {rec.protocol.cadre.duree}</li>
                                                <li>Rythme : {rec.protocol.cadre.rythme}</li>
                                                <li>Environnement : {rec.protocol.cadre.environnement}</li>
                                                <li>Stimulation : {rec.protocol.cadre.stimulation}</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Médiations
                                            </p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>Principale : {rec.protocol.mediations.principale}</li>
                                                <li>
                                                    Secondaires :{' '}
                                                    {rec.protocol.mediations.secondaire.join(', ')}
                                                </li>
                                                <li>
                                                    À éviter : {rec.protocol.mediations.eviter.join(', ')}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Objectifs
                                        </p>
                                        <ul className="space-y-1 text-sm text-slate-700">
                                            {rec.protocol.objectifs.map((objectif) => (
                                                <li key={objectif}>• {objectif}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Aucun protocole automatique disponible pour ces observations.
                        </p>
                    )}
                </Section>
            </div>
        )}
    </section>
)
}