'use client'

import React, { useEffect, useState } from 'react'

type GroupRow = {
  id: string
  name: string
  code: string | null
  reference: string | null
  description: string | null
  group_type: string | null
  format: string | null
  status: string
  created_at: string
}

type FormState = {
  name: string
  code: string
  reference: string
  description: string
  group_type: string
  format: string
  status: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function ClinicalAdminGroupsPanel() {
  const [items, setItems] = useState<GroupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    code: '',
    reference: '',
    description: '',
    group_type: 'art_therapy_group',
    format: 'semi_open',
    status: 'active',
  })

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/groups')
      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de charger les groupes.')
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clinical/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await response.json()

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Impossible de créer le groupe.')
      }

      setForm({
        name: '',
        code: '',
        reference: '',
        description: '',
        group_type: 'art_therapy_group',
        format: 'semi_open',
        status: 'active',
      })

      setMessage('Groupe créé avec succès.')
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur lors de la création.')
    } finally {
      setSaving(false)
    }
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-3">
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Nom du groupe"
          value={form.name}
          onChange={(e) => patch('name', e.target.value)}
        />

        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Code"
          value={form.code}
          onChange={(e) => patch('code', e.target.value)}
        />

        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          placeholder="Référence"
          value={form.reference}
          onChange={(e) => patch('reference', e.target.value)}
        />

        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:col-span-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) => patch('description', e.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          value={form.group_type}
          onChange={(e) => patch('group_type', e.target.value)}
        >
          <option value="art_therapy_group">Art therapy group</option>
          <option value="therapy_group">Therapy group</option>
          <option value="support_group">Support group</option>
          <option value="mixed_group">Mixed group</option>
        </select>

        <select
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          value={form.format}
          onChange={(e) => patch('format', e.target.value)}
        >
          <option value="closed">Closed</option>
          <option value="semi_open">Semi open</option>
          <option value="open">Open</option>
        </select>

        <select
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          value={form.status}
          onChange={(e) => patch('status', e.target.value)}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>

        <div className="xl:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Création…' : 'Créer le groupe'}
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
        <p className="text-sm text-slate-500">Aucun groupe enregistré.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.code || 'Sans code'} · {item.reference || 'Sans référence'}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>
              <p className="mt-3 text-sm text-slate-700">
                {item.description || 'Aucune description'}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {item.group_type || 'type non renseigné'} · {item.format || 'format non renseigné'} · {item.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}