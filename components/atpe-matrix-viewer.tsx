import { ATPE_MATRIX } from '@/lib/atpe-matrix'

export function AtpeMatrixViewer() {
    return (
        <div className="space-y-6">
            {ATPE_MATRIX.axes.map((axis) => (
                <div
                    key={axis.key}
                    className="rounded-3xl border border-slate-200 bg-white p-5"
                >
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">
                            {axis.label}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">{axis.description}</p>
                    </div>

                    <div className="space-y-4">
                        {axis.rows.map((row) => (
                            <div
                                key={row.key}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <h3 className="text-base font-semibold text-slate-900">
                                    {row.objective}
                                </h3>

                                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Sous-objectifs
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                            {row.subObjectives.map((item) => (
                                                <li key={item}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Indicateurs principaux
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                            {row.indicators.map((item) => (
                                                <li key={item}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Indicateurs sensoriels
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                            {row.sensoryIndicators.map((item) => (
                                                <li key={item}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Signaux faibles
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                            {row.weakSignals.map((item) => (
                                                <li key={item}>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Lecture clinique
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {row.reading.clinical}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Lecture institutionnelle
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {row.reading.institutional}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Lecture PUZZLE
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {row.reading.puzzle}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Trajectoires de progression
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {row.trajectories.map((trajectory) => (
                                            <div
                                                key={trajectory.key}
                                                className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700"
                                            >
                                                {trajectory.from} → {trajectory.to}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-semibold text-slate-900">
                    Trajectoires globales
                </h2>

                <div className="mt-4 space-y-3">
                    {ATPE_MATRIX.globalTrajectories.map((trajectory) => (
                        <div
                            key={trajectory.key}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <h3 className="font-semibold text-slate-900">
                                {trajectory.label}
                            </h3>
                            <p className="mt-1 text-sm text-slate-700">
                                {trajectory.description}
                            </p>

                            <div className="mt-2 text-sm text-slate-600">
                                <span className="font-medium text-slate-800">Axes :</span>{' '}
                                {trajectory.axes.join(', ')}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {trajectory.markers.map((marker) => (
                                    <span
                                        key={marker}
                                        className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700"
                                    >
                                        {marker}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}