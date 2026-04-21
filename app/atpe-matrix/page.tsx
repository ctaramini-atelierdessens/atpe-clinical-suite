import { AtpeMatrixViewer } from '@/components/atpe-matrix-viewer'

export default function AtpeMatrixPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">Référentiel clinique</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    Matrice ATPE
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-600">
                    Lecture structurée des 6 axes, des objectifs thérapeutiques, des
                    sous-objectifs, des indicateurs croisés, des signaux faibles et des
                    trajectoires de progression.
                </p>
            </section>

            <AtpeMatrixViewer />
        </div>
    )
}