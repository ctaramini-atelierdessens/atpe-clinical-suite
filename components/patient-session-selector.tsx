'use client'

import React from 'react'

type SessionOption = {
  id: string
  label: string
  createdAt?: string | null
}

type Props = {
  sessions: SessionOption[]
  value: string
  onChange: (sessionId: string) => void
  title?: string
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('fr-FR')
}

export function PatientSessionSelector({
  sessions,
  value,
  onChange,
  title = 'Sélection de séance',
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Choisis une séance pour afficher la lecture longitudinale.
        </p>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
      >
        {sessions.length === 0 ? (
          <option value="">Aucune séance disponible</option>
        ) : null}

        {sessions.map((session) => {
          const extra = formatDate(session.createdAt)
          return (
            <option key={session.id} value={session.id}>
              {session.label}
              {extra ? ` — ${extra}` : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}