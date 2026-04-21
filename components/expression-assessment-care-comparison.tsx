import { useMemo } from 'react'


    ) {
        return {
            label: 'Continuité clinique fragile',
            description:
                'Le relais entre bilan et suivi paraît partiellement rompu ou insuffisamment tracé.',
        }
    }

    return {
        label: 'Continuité clinique intermédiaire',
        description:
            'Le relais existe mais demanderait une harmonisation plus explicite entre bilan et suivi.',
    }
}

export function ExpressionAssessmentCareComparison({
    assessment,
    episode,
    assessmentObjectives,
    therapyGoals,
}: Props) {
    const comparison = useMemo(() => {
        const frame = compareFrames(
            assessment.proposed_modalities,
            episode?.therapeutic_frame
        )

        const objectives = compareObjectives(assessmentObjectives, therapyGoals)

        const global = getGlobalContinuityLabel({
            frameLabel: frame.label,
            objectiveLabel: objectives.label,
            hasEpisode: Boolean(episode),
        })

        return {
            frame,
            objectives,
            global,
        }
    }, [assessment, episode, assessmentObjectives, therapyGoals])

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500">
                            Comparatif bilan / prise en charge
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-900">
                            Continuité clinique BE → ATPE
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
                        {episode ? 'Épisode relié détecté' : 'Aucun épisode relié'}
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Lecture synthétique
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                        {comparison.global.label}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        {comparison.global.description}
                    </p>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cadre
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                            {comparison.frame.label}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                            {comparison.frame.description}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Objectifs
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                            {comparison.objectives.label}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                            {comparison.objectives.description}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Reprise chiffrée
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                            {comparison.objectives.matched}/{assessmentObjectives.length}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                            Objectif(s) du bilan repérés comme repris dans le suivi
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cadre proposé dans le bilan
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {assessment.proposed_modalities || 'Non renseigné'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cadre appliqué dans le suivi
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {episode?.therapeutic_frame || 'Non renseigné'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Objectifs du bilan
                        </div>
                        <div className="mt-2 space-y-2">
                            {!assessmentObjectives.length ? (
                                <p className="text-sm text-slate-500">Aucun objectif bilan.</p>
                            ) : (
                                assessmentObjectives.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                    >
                                        {item.title || item.description || 'Objectif sans libellé'}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Objectifs repris en thérapie
                        </div>
                        <div className="mt-2 space-y-2">
                            {!therapyGoals.length ? (
                                <p className="text-sm text-slate-500">Aucun objectif thérapeutique.</p>
                            ) : (
                                therapyGoals.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                    >
                                        <div className="font-medium text-slate-900">
                                            {item.title || item.description || 'Objectif sans libellé'}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">
                                            {item.status || 'statut non renseigné'}
                                            {item.priority ? ` · priorité ${item.priority}` : ''}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}