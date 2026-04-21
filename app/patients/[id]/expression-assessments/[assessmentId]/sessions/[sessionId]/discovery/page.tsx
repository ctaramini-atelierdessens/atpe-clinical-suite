import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{ id: string; assessmentId: string; sessionId: string }>
  searchParams?: Promise<{ error?: string }>
}

async function createDiscoveryObservation(formData: FormData) {
  'use server'

  const patientId = String(formData.get('patient_id') || '').trim()
  const assessmentId = String(formData.get('assessment_id') || '').trim()
  const sessionId = String(formData.get('session_id') || '').trim()

  if (!patientId || !assessmentId || !sessionId) {
    redirect(`/patients/${patientId}/expression-assessments/${assessmentId}`)
  }

  const mediaGroup = String(formData.get('media_group') || '').trim()
  const mediaLabel = String(formData.get('media_label') || '').trim()
  const mediaCode = String(formData.get('media_code') || '').trim()
  const attractionOrderRaw = String(formData.get('attraction_order') || '').trim()
  const associatedMediaCodes = String(formData.get('associated_media_codes') || '').trim()
  const timeSpentScoreRaw = String(formData.get('time_spent_score') || '').trim()
  const latencySecondsRaw = String(formData.get('latency_seconds') || '').trim()

  const behaviorNotes = String(formData.get('behavior_notes') || '').trim()
  const emotionNotes = String(formData.get('emotion_notes') || '').trim()
  const movementNotes = String(formData.get('movement_notes') || '').trim()

  const lookedOnly = String(formData.get('looked_only') || '').trim() === 'on'
  const takenOrUsed = String(formData.get('taken_or_used') || '').trim() === 'on'
  const displacementAssociated =
    String(formData.get('displacement_associated') || '').trim() === 'on'
  const therapistContactBySpeech =
    String(formData.get('therapist_contact_by_speech') || '').trim() === 'on'
  const therapistContactByGaze =
    String(formData.get('therapist_contact_by_gaze') || '').trim() === 'on'

  const parsedAttractionOrder = Number.parseInt(attractionOrderRaw || '', 10)
  const parsedTimeSpentScore = Number.parseInt(timeSpentScoreRaw || '0', 10)
  const parsedLatencySeconds = Number.parseInt(latencySecondsRaw || '', 10)

  const attractionOrder = Number.isNaN(parsedAttractionOrder)
    ? null
    : Math.max(1, parsedAttractionOrder)

  const timeSpentScore = Number.isNaN(parsedTimeSpentScore)
    ? 0
    : Math.max(0, parsedTimeSpentScore)

  const latencySeconds = Number.isNaN(parsedLatencySeconds)
    ? null
    : Math.max(0, parsedLatencySeconds)

  const supabase = await createClient()

  const { error } = await supabase
    .from('discovery_media_observations')
    .insert({
      assessment_session_id: sessionId,
      media_group: mediaGroup || null,
      media_label: mediaLabel || null,
      media_code: mediaCode || null,
      attraction_order: attractionOrder,
      associated_media_codes: associatedMediaCodes || null,
      time_spent_score: timeSpentScore,
      latency_seconds: latencySeconds,
      looked_only: lookedOnly,
      taken_or_used: takenOrUsed,
      displacement_associated: displacementAssociated,
      therapist_contact_by_speech: therapistContactBySpeech,
      therapist_contact_by_gaze: therapistContactByGaze,
      behavior_notes: behaviorNotes || null,
      emotion_notes: emotionNotes || null,
      movement_notes: movementNotes || null,
    })

  if (error) {
    redirect(
      `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/discovery?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}`
  )
  revalidatePath(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/discovery`
  )

  redirect(
    `/patients/${patientId}/expression-assessments/${assessmentId}/sessions/${sessionId}/discovery`
  )
}

export default async function DiscoverySessionGridPage({
  params,
  searchParams,
}: PageProps) {
  const { id, assessmentId, sessionId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : ''

  const supabase = await createClient()

  const [{ data: patient }, { data: assessment }, { data: session }, { data: observations }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('expression_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('expression_assessment_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('assessment_id', assessmentId)
        .eq('patient_id', id)
        .maybeSingle(),
      supabase
        .from('discovery_media_observations')
        .select('*')
        .eq('assessment_session_id', sessionId)
        .order('attraction_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true }),
    ])

  if (!patient || !assessment || !session) {
    notFound()
  }

  const safePatient = patient as any
  const safeSession = session as any

  const patientLabel =
    safePatient.code ||
    safePatient.initials ||
    safePatient.display_name ||
    safePatient.last_name ||
    safePatient.first_name ||
    'Patient'

  if (safeSession.session_type !== 'discovery') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Cette grille est réservée aux séances de type <strong>discovery</strong>.
        </div>

        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
          className="inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Retour à la séance
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <Link
          href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour à la séance
        </Link>

        <p className="mt-3 text-sm text-slate-500">
          Grille découverte pluriexpressionnelle
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Observations médias
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Patient : {patientLabel}
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-medium">Impossible d’enregistrer l’observation.</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      <form action={createDiscoveryObservation} className="space-y-6">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="session_id" value={sessionId} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Repérage du média
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Groupe de média
                  </span>
                  <input
                    type="text"
                    name="media_group"
                    placeholder="son, arts_plastiques, mise_en_scene..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Média / objet
                  </span>
                  <input
                    type="text"
                    name="media_label"
                    placeholder="tambour, peinture, tissu..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Code média
                  </span>
                  <input
                    type="text"
                    name="media_code"
                    placeholder="A1, S2, P3..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Médias associés
                  </span>
                  <input
                    type="text"
                    name="associated_media_codes"
                    placeholder="A1 + S2"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Dynamique d’investissement
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ordre d’attirance
                  </span>
                  <input
                    type="number"
                    name="attraction_order"
                    min={1}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Temps passé (score)
                  </span>
                  <input
                    type="number"
                    name="time_spent_score"
                    min={0}
                    defaultValue={1}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Latence (secondes)
                  </span>
                  <input
                    type="number"
                    name="latency_seconds"
                    min={0}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="looked_only" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">Regarde seulement</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" name="taken_or_used" className="mt-1 h-4 w-4" />
                  <span className="text-sm text-slate-700">Prend / utilise le média</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="displacement_associated"
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">Déplacement associé</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="therapist_contact_by_speech"
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    Contact thérapeute par parole
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 md:col-span-2">
                  <input
                    type="checkbox"
                    name="therapist_contact_by_gaze"
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    Contact thérapeute par regard
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Observations qualitatives
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Notes comportementales
                  </span>
                  <textarea
                    name="behavior_notes"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Notes émotionnelles
                  </span>
                  <textarea
                    name="emotion_notes"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Notes motrices / déplacements
                  </span>
                  <textarea
                    name="movement_notes"
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Ajouter l’observation média
                </button>

                <Link
                  href={`/patients/${id}/expression-assessments/${assessmentId}/sessions/${sessionId}`}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retour à la séance
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Observations enregistrées
              </h2>

              <div className="mt-4 space-y-3">
                {!observations?.length ? (
                  <p className="text-sm text-slate-500">
                    Aucune observation média enregistrée.
                  </p>
                ) : (
                  observations.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.media_label || 'Média non nommé'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.media_group || 'groupe non renseigné'}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Ordre : {item.attraction_order ?? '—'} · Temps : {item.time_spent_score} ·
                        Latence : {item.latency_seconds ?? '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}