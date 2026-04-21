import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
    params: Promise<{ id: string; assessmentId: string }>
    searchParams?: Promise<{ error?: string }>
}

async function updateExpressionAssessment(formData: FormData) {
    'use server'

    const patientId = String(formData.get('patient_id') || '').trim()
    const assessmentId = String(formData.get('assessment_id') || '').trim()

    const requestDateRaw = String(formData.get('request_date') || '').trim()
    const requestedBy = String(formData.get('requested_by') || '').trim()
    const requestType = String(formData.get('request_type') || '').trim()
    const status = String(formData.get('status') || '').trim()
    const indicationText = String(formData.get('indication_text') || '').trim()
    const priorKnowledgeSummary = String(formData.get('prior_knowledge_summary') || '').trim()
    const initialRecommendation = String(formData.get('initial_recommendation') || '').trim()
    const finalRecommendation = String(formData.get('final_recommendation') || '').trim()
    const initialObjectives = String(formData.get('initial_objectives') || '').trim()
    const proposedModalities = String(formData.get('proposed_modalities') || '').trim()

    const trialSessionsRequired =
        String(formData.get('trial_sessions_required') || '').trim() === 'on'

    const trialSessionsCountRaw = String(formData.get('trial_sessions_count') || '').trim()
    const parsedTrialSessionsCount = Number.parseInt(trialSessionsCountRaw || '0', 10)
    const trialSessionsCount = Number.isNaN(parsedTrialSessionsCount)
        ? 0
        : Math.max(0, parsedTrialSessionsCount)

    if (!patientId || !assessmentId) {
        redirect(`/patients/${patientId}/expression-assessments`)
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('expression_assessments')
        .update({
            request_date: requestDateRaw || null,
            requested_by: requestedBy || null,
            request_type: requestType || 'undetermined',
            status: status || 'draft',
            indication_text: indicationText || null,
            prior_knowledge_summary: priorKnowledgeSummary || null,
            initial_recommendation: initialRecommendation || null,
            final_recommendation: finalRecommendation || null,
            initial_objectives: initialObjectives || null,
            proposed_modalities: proposedModalities || null,
            trial_sessions_required: trialSessionsRequired,
            trial_sessions_count: trialSessionsRequired ? trialSessionsCount : 0,
        })
        .eq('id', assessmentId)
        .eq('patient_id', patientId)

    if (error) {
        redirect(
            `/patients/${patientId}/expression-assessments/${assessmentId}/edit?error=${encodeURIComponent(
                error.message
            )}`
        )
    }

    revalidatePath(`/patients/${patientId}/expression-assessments`)
    revalidatePath(`/patients/${patientId}/expression-assessments/${assessmentId}`)

    redirect(`/patients/${patientId}/expression-assessments/${assessmentId}`)
}

export default async function EditExpressionAssessmentPage({
    params,
    searchParams,
}: PageProps) {
    const { id, assessmentId } = await params
    const resolvedSearchParams = searchParams ? await searchParams : {}
    const errorMessage =
        typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

    const supabase = await createClient()

    const [{ data: patient }, { data: assessment }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).maybeSingle(),
        supabase
            .from('expression_assessments')
            .select('*')
            .eq('id', assessmentId)
            .eq('patient_id', id)
            .maybeSingle(),
    ])

    if (!patient || !assessment) {
        notFound()
    }

    const safePatient = patient as any
    const safeAssessment = assessment as any
    const patientLabel =
        safePatient.code ||
        safePatient.initials ||
        safePatient.display_name ||
        safePatient.last_name ||
        safePatient.first_name ||
        'Patient'

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <Link
                    href={`/patients/${id}/expression-assessments/${assessmentId}`}
                    className="text-sm text-slate-500 hover:text-slate-700"
                >
                    ← Retour au bilan expressionnel
                </Link>

                <p className="mt-3 text-sm text-slate-500">Bilan expressionnel</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                    Modifier le bilan
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Patient : {patientLabel}
                </p>
            </div>

            {errorMessage ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
                    <p className="font-medium">Impossible de modifier le bilan expressionnel.</p>
                    <p className="mt-2 text-sm">{errorMessage}</p>
                </div>
            ) : null}

            <form action={updateExpressionAssessment} className="space-y-6">
                <input type="hidden" name="patient_id" value={id} />
                <input type="hidden" name="assessment_id" value={assessmentId} />

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Données de la demande
                            </h2>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Date de la demande</span>
                                    <input
                                        type="date"
                                        name="request_date"
                                        defaultValue={safeAssessment.request_date || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Demandeur</span>
                                    <input
                                        type="text"
                                        name="requested_by"
                                        defaultValue={safeAssessment.requested_by || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Type de demande</span>
                                    <select
                                        name="request_type"
                                        defaultValue={safeAssessment.request_type || 'undetermined'}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    >
                                        <option value="undetermined">À déterminer</option>
                                        <option value="individual">Individuel</option>
                                        <option value="group">Groupe</option>
                                        <option value="mixed">Mixte</option>
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Statut</span>
                                    <select
                                        name="status"
                                        defaultValue={safeAssessment.status || 'draft'}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="intake_started">Entame du bilan</option>
                                        <option value="discovery_in_progress">Découverte en cours</option>
                                        <option value="final_interview_done">Entretien final réalisé</option>
                                        <option value="trial_sessions">Séances d'essai</option>
                                        <option value="recommended">Recommandé</option>
                                        <option value="deferred">Différé</option>
                                        <option value="refused">Refusé</option>
                                        <option value="converted_to_care">Converti en prise en charge</option>
                                    </select>
                                </label>

                                <label className="block md:col-span-2">
                                    <span className="text-sm font-medium text-slate-700">Indication / motif de demande</span>
                                    <textarea
                                        name="indication_text"
                                        rows={4}
                                        defaultValue={safeAssessment.indication_text || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-slate-900">Connaissance préalable</h2>
                            <label className="mt-4 block">
                                <span className="text-sm font-medium text-slate-700">Résumé préalable</span>
                                <textarea
                                    name="prior_knowledge_summary"
                                    rows={6}
                                    defaultValue={safeAssessment.prior_knowledge_summary || ''}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                />
                            </label>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-slate-900">Recommandations et objectifs</h2>

                            <div className="mt-4 space-y-4">
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Pré-recommandation</span>
                                    <textarea
                                        name="initial_recommendation"
                                        rows={4}
                                        defaultValue={safeAssessment.initial_recommendation || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Recommandation finale</span>
                                    <textarea
                                        name="final_recommendation"
                                        rows={4}
                                        defaultValue={safeAssessment.final_recommendation || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Objectifs initiaux</span>
                                    <textarea
                                        name="initial_objectives"
                                        rows={5}
                                        defaultValue={safeAssessment.initial_objectives || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Modalités proposées</span>
                                    <textarea
                                        name="proposed_modalities"
                                        rows={5}
                                        defaultValue={safeAssessment.proposed_modalities || ''}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-slate-900">Paramètres du bilan</h2>

                            <div className="mt-4 space-y-4">
                                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                                    <input
                                        type="checkbox"
                                        name="trial_sessions_required"
                                        defaultChecked={!!safeAssessment.trial_sessions_required}
                                        className="mt-1 h-4 w-4 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700">
                                        Prévoir des séances d'essai
                                    </span>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">
                                        Nombre de séances d'essai prévues
                                    </span>
                                    <input
                                        type="number"
                                        name="trial_sessions_count"
                                        min={0}
                                        defaultValue={safeAssessment.trial_sessions_count ?? 0}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <div className="grid gap-3">
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
                                >
                                    Enregistrer les modifications
                                </button>

                                <Link
                                    href={`/patients/${id}/expression-assessments/${assessmentId}`}
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}