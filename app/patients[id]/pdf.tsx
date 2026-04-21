import { notFound } from 'next/navigation'
import { getAppContext } from '@/lib/atpe/app-context'
import { PatientExpertV2Card } from '@/components/patient-expert-v2-card'
import { PatientRadar } from '@/components/patient-radar'
import { PatientGlobalEvolutionCard } from '@/components/patient-global-evolution-card'
import { PatientLongitudinalInsights } from '@/components/patient-longitudinal-insights'
import { PatientDimensionalInsights } from '@/components/patient-dimensional-insights'
import { PatientDimensionalRecommendations } from '@/components/patient-dimensional-recommendations'
import { PatientTherapeuticPlan } from '@/components/patient-therapeutic-plan'
import { PatientSupervisionIntelligent } from '@/components/patient-supervision-intelligent'
import { PatientInstitutionalSummary } from '@/components/patient-institutional-summary'
import { PatientExpressionalSummary } from '@/components/patient-expressional-summary'
import { PatientInitialDiagnosticMatrix } from '@/components/patient-initial-diagnostic-matrix'

type PageProps = {
    params: Promise<{ id: string }>
}

function todayLabel() {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date())
}

export default async function PatientPdfPage({ params }: PageProps) {
    const { id } = await params
    const { supabase, organization, user } = await getAppContext()

    if (!organization?.id) {
        notFound()
    }

    const [{ data: patient }, { data: sessions }] = await Promise.all([
        supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .eq('organization_id', organization.id)
            .maybeSingle(),

        supabase
            .from('sessions')
            .select('*')
            .eq('patient_id', id)
            .eq('organization_id', organization.id)
            .order('created_at', { ascending: false }),
    ])

    if (!patient) {
        notFound()
    }

    const safeSessions = Array.isArray(sessions) ? sessions : []

    return (
        <main className="pdf-premium mx-auto max-w-5xl space-y-8 bg-white px-10 py-10 text-black print:max-w-none print:px-0 print:py-0">
            <section className="rounded-2xl border border-neutral-300 px-8 py-8">
                <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
                    <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Rapport clinique institutionnel premium
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900">
                            Synthèse clinique ATPE
                        </h1>
                        <p className="text-sm text-neutral-600">
                            Document de travail pour réunion clinique, supervision et coordination institutionnelle
                        </p>
                    </div>

                    <div className="min-w-[220px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                        <div className="font-semibold text-neutral-900">
                            {organization.name ?? 'Structure clinique'}
                        </div>
                        <div className="mt-2 text-neutral-600">
                            Date de génération : {todayLabel()}
                        </div>
                        <div className="text-neutral-600">
                            Référent export : {user?.email ?? '—'}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                            Code patient
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {patient.code ?? '—'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                            Initiales
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {patient.initials ?? '—'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                            Année de naissance
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {patient.birth_year ?? '—'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                            Sexe
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {patient.sex ?? '—'}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-neutral-300 p-6">
                <h2 className="mb-4 text-xl font-bold">Résumé exécutif</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-sm text-neutral-500">Patient</div>
                        <div className="mt-1 font-medium">
                            {patient.code ?? '—'} — {patient.initials ?? '—'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-sm text-neutral-500">Séances analysées</div>
                        <div className="mt-1 font-medium">{safeSessions.length}</div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="text-sm text-neutral-500">Cadre</div>
                        <div className="mt-1 font-medium">
                            Rapport clinique premium pour supervision et coordination
                        </div>
                    </div>
                </div>
            </section>

            <section className="pdf-section space-y-6">
                <div className="pdf-section-title">Profil clinique</div>
                <PatientExpertV2Card patientId={id} />
                <PatientRadar
                    emotion={safeSessions[0]?.emotion}
                    corps={safeSessions[0]?.corps}
                    conscience={safeSessions[0]?.conscience}
                    dynamique={safeSessions[0]?.dynamique}
                    symbolique={safeSessions[0]?.symbolique}
                />
            </section>

            <section className="pdf-section space-y-6">
                <div className="pdf-section-title">Évolution clinique</div>
                <PatientGlobalEvolutionCard sessions={safeSessions} />
                <PatientLongitudinalInsights sessions={safeSessions} />
                <PatientDimensionalInsights sessions={safeSessions} />
            </section>

            <section className="pdf-section space-y-6">
                <div className="pdf-section-title">Lecture décisionnelle</div>
                <PatientDimensionalRecommendations sessions={safeSessions} />
                <PatientTherapeuticPlan sessions={safeSessions} />
            </section>

            <section className="pdf-section space-y-6">
                <div className="pdf-section-title">Supervision et institution</div>
                <PatientSupervisionIntelligent sessions={safeSessions} />
                <PatientInstitutionalSummary sessions={safeSessions} />
                <PatientExpressionalSummary sessions={safeSessions} />
            </section>

            <section className="pdf-section space-y-6">
                <div className="pdf-section-title">Diagnostic initial structuré</div>
                <PatientInitialDiagnosticMatrix sessions={safeSessions} />
            </section>

            <footer className="rounded-2xl border border-neutral-300 px-8 py-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <div className="text-sm font-semibold text-neutral-800">
                            Signature clinique
                        </div>
                        <div className="mt-3 h-16 rounded-lg border border-dashed border-neutral-300" />
                        <div className="mt-2 text-xs text-neutral-500">
                            Nom, fonction, signature
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-neutral-800">
                            Mention institutionnelle
                        </div>
                        <p className="mt-2 text-xs leading-6 text-neutral-600">
                            Ce document constitue une synthèse clinique de travail destinée à
                            la concertation professionnelle, à la supervision et à la coordination
                            de l'accompagnement. Son usage doit rester inscrit dans le cadre
                            institutionnel, éthique et confidentiel de la prise en charge.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    )
}