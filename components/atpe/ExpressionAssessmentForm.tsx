"use client"

import { useState } from "react"

type Props = {
  patientId: string
  organizationId: string
  episodeId?: string | null
  onSaved?: (data: unknown) => void
}

type FormState = {
  expression_profile: string
  sensory_profile: string
  body_relation: string
  symbolic_capacity: string
  relational_availability: string
  emotional_regulation: string
  preferred_media: string
  blocked_media: string
  preliminary_hypothesis: string
  initial_recommendations: string
}

const initialState: FormState = {
  expression_profile: "",
  sensory_profile: "",
  body_relation: "",
  symbolic_capacity: "",
  relational_availability: "",
  emotional_regulation: "",
  preferred_media: "",
  blocked_media: "",
  preliminary_hypothesis: "",
  initial_recommendations: "",
}

export function ExpressionAssessmentForm({
  patientId,
  organizationId,
  episodeId = null,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch("/api/expression-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          organization_id: organizationId,
          episode_id: episodeId,
          ...form,
          raw_payload: {
            ui: "ExpressionAssessmentForm",
            version: "v5",
          },
        }),
      })

      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Erreur lors de l’enregistrement.")
      }

      setMessage("Bilan expressionnel enregistré.")
      onSaved?.(json.data)
    } catch (err: any) {
      setError(err?.message ?? "Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  const fields: Array<{ key: keyof FormState; label: string; rows?: number }> = [
    { key: "expression_profile", label: "Profil expressif", rows: 3 },
    { key: "sensory_profile", label: "Profil sensoriel", rows: 3 },
    { key: "body_relation", label: "Relation au corps", rows: 3 },
    { key: "symbolic_capacity", label: "Capacité de symbolisation", rows: 3 },
    { key: "relational_availability", label: "Disponibilité relationnelle", rows: 3 },
    { key: "emotional_regulation", label: "Régulation émotionnelle", rows: 3 },
    { key: "preferred_media", label: "Médias préférés", rows: 2 },
    { key: "blocked_media", label: "Médias bloqués / évités", rows: 2 },
    { key: "preliminary_hypothesis", label: "Hypothèse clinique préalable", rows: 4 },
    { key: "initial_recommendations", label: "Recommandations initiales", rows: 4 },
  ]

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Bilan expressionnel préalable</h2>
        <p className="mt-1 text-sm text-slate-500">
          Saisie structurée du profil expressif, corporel, relationnel et symbolique.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <textarea
              value={form[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              rows={field.rows ?? 3}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-500"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer le bilan"}
        </button>

        {message ? <span className="text-sm text-emerald-600">{message}</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  )
}