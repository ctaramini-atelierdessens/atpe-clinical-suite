"use client"

import { useState } from "react"

type Step = {
  step_order: number
  title: string
  description: string
  expected_outcome: string
  media_suggestion: string
}

type Props = {
  organizationId: string
  onSaved?: (data: unknown) => void
}

export function ProtocolForm({ organizationId, onSaved }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [modality, setModality] = useState("individuel")
  const [targetIndications, setTargetIndications] = useState("")
  const [contraindications, setContraindications] = useState("")
  const [expectedDurationWeeks, setExpectedDurationWeeks] = useState<number | "">("")
  const [steps, setSteps] = useState<Step[]>([
    {
      step_order: 1,
      title: "",
      description: "",
      expected_outcome: "",
      media_suggestion: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateStep(index: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, ...patch } : step)))
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      {
        step_order: prev.length + 1,
        title: "",
        description: "",
        expected_outcome: "",
        media_suggestion: "",
      },
    ])
  }

  function removeStep(index: number) {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_order: i + 1 }))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol: {
            organization_id: organizationId,
            title,
            description,
            modality,
            target_indications: targetIndications,
            contraindications: contraindications,
            expected_duration_weeks:
              expectedDurationWeeks === "" ? null : Number(expectedDurationWeeks),
            status: "active",
          },
          steps: steps.map((step, i) => ({
            ...step,
            step_order: i + 1,
          })),
        }),
      })

      const json = await res.json()

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Impossible de créer le protocole.")
      }

      setMessage("Protocole enregistré.")
      onSaved?.(json.data)
    } catch (err: any) {
      setError(err?.message ?? "Erreur inattendue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Protocole thérapeutique</h2>
        <p className="mt-1 text-sm text-slate-500">
          Définition du protocole et de ses étapes successives.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Modalité</span>
          <input
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Durée estimée (semaines)</span>
          <input
            type="number"
            value={expectedDurationWeeks}
            onChange={(e) =>
              setExpectedDurationWeeks(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Indications</span>
          <textarea
            value={targetIndications}
            onChange={(e) => setTargetIndications(e.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Contre-indications</span>
          <textarea
            value={contraindications}
            onChange={(e) => setContraindications(e.target.value)}
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Étapes du protocole</h3>
          <button
            type="button"
            onClick={addStep}
            className="rounded-xl border px-3 py-2 text-sm font-medium"
          >
            Ajouter une étape
          </button>
        </div>

        {steps.map((step, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">Étape {index + 1}</div>
              {steps.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-sm text-red-600"
                >
                  Supprimer
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Titre</span>
                <input
                  value={step.title}
                  onChange={(e) => updateStep(index, { title: e.target.value })}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, { description: e.target.value })}
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Résultat attendu</span>
                <textarea
                  value={step.expected_outcome}
                  onChange={(e) => updateStep(index, { expected_outcome: e.target.value })}
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Suggestion de média</span>
                <input
                  value={step.media_suggestion}
                  onChange={(e) => updateStep(index, { media_suggestion: e.target.value })}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Créer le protocole"}
        </button>

        {message ? <span className="text-sm text-emerald-600">{message}</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  )
}