'use client'

import React, { useEffect, useState } from 'react'

type SupervisionRow = {
  id: string
  patient_id: string | null
  group_id: string | null
  supervision_date: string
  session_context: string | null
  therapist_experiences: string[]
  probable_clinical_meaning: string[]
  caution_points: string[]
  supervision_axes: string[]
  suggested_note: string | null
  free_notes: string | null
  priority_level: string
}

type FormState = {
  patient_id: string
  group_id: string
  session_context: string
  therapist_experiences: string
  perceived_affects: string
  probable_clinical_meaning: string
  caution_points: string
  supervision_axes: string
  suggested_note: string
  free_notes: string
  priority_level: string
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function ClinicalAdminSupervisionPanel() {
  const [items, setItems] = useState<SupervisionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    patient_id: '',
    group_id: '',
    session_context: '',
    therapist_experiences: '',
    perceived_affects: '',
    probable_clinical_meaning: '',
    caution_points: '',
    supervision_axes: '',
    suggested_note: '',
    free_notes: '',
    priority_level: 'standard',
  })

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/supervision')
      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de charger les supervisions.')
      }

      setItems(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur de chargement.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/supervision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: form.patient_id || null,
          group_id: form.group_id || null,
          session_context: form.session_context || null,
          therapist_experiences: splitLines(form.therapist_experiences),
          perceived_affects: splitLines(form.perceived_affects),
          probable_clinical_meaning: splitLines(form.probable_clinical_meaning),
          caution_points: splitLines(form.caution_points),
          supervision_axes: splitLines(form.supervision_axes),
          suggested_note: form.suggested_note || null,
          free_notes: form.free_notes || null,
          priority_level: form.priority_level,
        }),
      })

      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de créer la supervision.')
      }

      setMessage('Entrée de supervision créée.')
      setForm({
        patient_id: '',
        group_id: '',
        session_context: '',
        therapist_experiences: '',
        perceived_affects: '',
        probable_clinical_meaning: '',
        caution_points: '',
        supervision_axes: '',
        suggested_note: '',
        free_notes: '',
        priority_level: 'standard',
      })
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur de création.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Patient ID"
          value={form.patient_id}
          onChange={(e) => patch('patient_id', e.target.value)}
        />

        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Group ID"
          value={form.group_id}
          onChange={(e) => patch('group_id', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:col-span-2"
          rows={3}
          placeholder="Contexte de séance"
          value={form.session_context}
          onChange={(e) => patch('session_context', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Éprouvés thérapeutiques (1 ligne = 1 item)"
          value={form.therapist_experiences}
          onChange={(e) => patch('therapist_experiences', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Affects perçus"
          value={form.perceived_affects}
          onChange={(e) => patch('perceived_affects', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Sens cliniques probables"
          value={form.probable_clinical_meaning}
          onChange={(e) => patch('probable_clinical_meaning', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Points de prudence"
          value={form.caution_points}
          onChange={(e) => patch('caution_points', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Axes de supervision"
          value={form.supervision_axes}
          onChange={(e) => patch('supervision_axes', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          rows={4}
          placeholder="Note suggérée"
          value={form.suggested_note}
          onChange={(e) => patch('suggested_note', e.target.value)}
        />

        <textarea
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:col-span-2"
          rows={4}
          placeholder="Notes libres"
          value={form.free_notes}
          onChange={(e) => patch('free_notes', e.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          value={form.priority_level}
          onChange={(e) => patch('priority_level', e.target.value)}
        >
          <option value="low">Low</option>
          <option value="standard">Standard</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <div className="xl:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Création…' : 'Créer l’entrée de supervision'}
          </button>
        </div>
      </form>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : !items.length ? (
        <p className="text-sm text-slate-500">Aucune supervision enregistrée.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Priorité : {item.priority_level}
                </p>
                <p className="text-xs text-slate-500">{formatDate(item.supervision_date)}</p>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {item.session_context || 'Sans contexte'}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Patient: {item.patient_id || '—'} · Groupe: {item.group_id || '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}