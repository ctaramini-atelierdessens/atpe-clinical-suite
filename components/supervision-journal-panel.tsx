'use client'

import React from 'react'

type JournalFlag = {
  level: 'info' | 'moderate' | 'high'
  code: string
  title: string
  description: string
}

type JournalItem = {
  id: string
  sessionId: string
  createdAt: string
  mediumPrimary: string | null
  note: string
  therapistExperiences: string[]
  flags: JournalFlag[]
  therapistCountertransferenceNotes: string | null
}

type Props = {
  items: JournalItem[]
}

function flagTone(level: JournalFlag['level']) {
  if (level === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

function formatDate(value?: string | null) {
  if (!value) return 'Date non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date non renseignée'
  return date.toLocaleString('fr-FR')
}

export function SupervisionJournalPanel({ items }: Props) {
  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">
        Aucun journal de supervision disponible pour le moment.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {item.sessionId}
                {item.mediumPrimary ? ` — ${item.mediumPrimary}` : ''}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.therapistExperiences.length ? (
              item.therapistExperiences.map((exp, index) => (
                <span
                  key={`${exp}-${index}`}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {exp}
                </span>
              ))
            ) : (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                Aucun éprouvé marqué
              </span>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {item.note}
          </div>

          {item.therapistCountertransferenceNotes ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                Notes contre-transférentielles saisies
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {item.therapistCountertransferenceNotes}
              </p>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {item.flags.map((flag, index) => (
              <div
                key={`${flag.code}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${flagTone(flag.level)}`}
                >
                  {flag.level === 'high'
                    ? 'Prioritaire'
                    : flag.level === 'moderate'
                    ? 'Vigilance'
                    : 'Info'}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {flag.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {flag.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}