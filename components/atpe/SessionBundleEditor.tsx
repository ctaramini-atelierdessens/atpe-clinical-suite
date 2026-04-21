"use client"

import { useState } from "react"

type Props = {
  sessionId: string
  patientId: string
  organizationId: string
  episodeId?: string | null
  onSaved?: (data: unknown) => void
}

type Observation = {
  observation_type: string
  content: string
  intensity: number | ""
  valence: string
}

type Analysis = {
  title: string
  summary: string
  clinical_interpretation: string
}

const emptyObservation = (): Observation => ({
  observation_type: "emotionnel",
  content: "",
  intensity: "",
  valence: "mixed",
})

const emptyAnalysis = (): Analysis => ({
  title: "",
  summary: "",
  clinical_interpretation: "",
})

export function SessionBundleEditor({
  sessionId,
  patientId,
  organizationId,
  episodeId = null,
  onSaved,
}: Props) {
  const [observations, setObservations] = useState<Observation[]>([emptyObservation()])
  const [analyses, setAnalyses] = useState<Analysis[]>([emptyAnalysis()])
  const [advancedAtpe, setAdvancedAtpe] = useState({
    format: "individual",
    medium_primary: "",
    atpe_phase_dominant: "",
    frame_containment: "",
    bodily_engagement: "",
    primary_symbolization: "",
    clinical_hypotheses: "",
    next_step_recommendation: "",
    therapist_countertransference_notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateObservation(index: number, patch: Partial<Observation>) {
    setObservations((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addObservation() {
    setObservations((prev) => [...prev, emptyObservation()])
  }

  function updateAnalysis(index: number, patch: Partial<Analysis>) {
    setAnalyses((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addAnalysis() {
    setAnalyses((prev) => [...prev, emptyAnalysis()])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`/api/sessions/${sessionId}/bundle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          organizationId,
          episodeId,
          observations: observations.map((item) => ({
            ...item,
            intensity: item.intensity === "" ? null : Number(item.intensity),
          })),
          analyses: analyses.map((item) => ({
            patient_id: patientId,
            organization_id: organizationId,
            analysis_type: "session",
            title: item.title,
            summary: item.summary,
            clinical_interpretation: item.clinical_interpretation,
          })),
          advancedAtpe: {
            patient_id: patientId,
            session_id: sessionId,
            format: advancedAtpe.format,
            medium_primary: advancedAtpe.medium_primary || null,
            atpe_phase_dominant: advancedAtpe.atpe_phase_dominant || null,
            frame_containment:
              advancedAtpe.frame_containment === ""
                ? null
                : Number(advancedAtpe.frame_containment),
            bodily_engagement:
              advancedAtpe.bodily_engagement === ""
                ? null
                : Number(advancedAtpe.bodily_engagement),
            primary_symbolization:
              advancedAtpe.primary_symbolization === ""
                ? null
                : Number(advancedAtpe.primary_symbolization),
            clinical_hypotheses: advancedAtpe.clinical_hypotheses || null,
            next_step_recommendation: advancedAtpe.next_step_recommendation || null,
            therapist_countertransference_notes:
              advancedAtpe.therapist_countertransference_notes || null,
          },
        }),
      })

      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Impossible d’enregistrer le bundle clinique.")
      }

      setMessage("Bundle clinique enregistré.")
      onSaved?.(json.data)
    } catch (err: any) {
      setError(err?.message ?? "Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Éditeur de bundle de séance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Observations, analyse clinique et synthèse ATPE avancée.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Observations</h3>
          <button
            type="button"
            onClick={addObservation}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Ajouter
          </button>
        </div>

        {observations.map((item, index) => (
          <div key={index} className="grid gap-4 rounded-2xl border p-4 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Type</span>
              <select
                value={item.observation_type}
                onChange={(e) => updateObservation(index, { observation_type: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="emotionnel">Émotionnel</option>
                <option value="corporel">Corporel</option>
                <option value="symbolique">Symbolique</option>
                <option value="relationnel">Relationnel</option>
                <option value="verbal">Verbal</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Intensité (0-100)</span>
              <input
                type="number"
                value={item.intensity}
                onChange={(e) =>
                  updateObservation(index, {
                    intensity: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Valence</span>
              <select
                value={item.valence}
                onChange={(e) => updateObservation(index, { valence: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="negative">Négative</option>
                <option value="neutral">Neutre</option>
                <option value="positive">Positive</option>
                <option value="mixed">Mixte</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 md:col-span-3">
              <span className="text-sm font-medium">Contenu</span>
              <textarea
                rows={3}
                value={item.content}
                onChange={(e) => updateObservation(index, { content: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </label>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Analyses cliniques</h3>
          <button
            type="button"
            onClick={addAnalysis}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Ajouter
          </button>
        </div>

        {analyses.map((item, index) => (
          <div key={index} className="grid gap-4 rounded-2xl border p-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Titre</span>
              <input
                value={item.title}
                onChange={(e) => updateAnalysis(index, { title: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Résumé</span>
              <textarea
                rows={3}
                value={item.summary}
                onChange={(e) => updateAnalysis(index, { summary: e.target.value })}
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Interprétation clinique</span>
              <textarea
                rows={4}
                value={item.clinical_interpretation}
                onChange={(e) =>
                  updateAnalysis(index, { clinical_interpretation: e.target.value })
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </label>
          </div>
        ))}
      </section>

      <section className="grid gap-4 rounded-2xl border p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Synthèse ATPE avancée</h3>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Format</span>
          <input
            value={advancedAtpe.format}
            onChange={(e) => setAdvancedAtpe((p) => ({ ...p, format: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Média principal</span>
          <input
            value={advancedAtpe.medium_primary}
            onChange={(e) => setAdvancedAtpe((p) => ({ ...p, medium_primary: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Phase ATPE dominante</span>
          <input
            value={advancedAtpe.atpe_phase_dominant}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, atpe_phase_dominant: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Contenance du cadre</span>
          <input
            type="number"
            value={advancedAtpe.frame_containment}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, frame_containment: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Engagement corporel</span>
          <input
            type="number"
            value={advancedAtpe.bodily_engagement}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, bodily_engagement: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Symbolisation primaire</span>
          <input
            type="number"
            value={advancedAtpe.primary_symbolization}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, primary_symbolization: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium">Hypothèses cliniques</span>
          <textarea
            rows={4}
            value={advancedAtpe.clinical_hypotheses}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, clinical_hypotheses: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Prochaine étape recommandée</span>
          <textarea
            rows={3}
            value={advancedAtpe.next_step_recommendation}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({ ...p, next_step_recommendation: e.target.value }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Contre-transfert / ressenti thérapeute</span>
          <textarea
            rows={3}
            value={advancedAtpe.therapist_countertransference_notes}
            onChange={(e) =>
              setAdvancedAtpe((p) => ({
                ...p,
                therapist_countertransference_notes: e.target.value,
              }))
            }
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer le bundle"}
        </button>

        {message ? <span className="text-sm text-emerald-600">{message}</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  )
}