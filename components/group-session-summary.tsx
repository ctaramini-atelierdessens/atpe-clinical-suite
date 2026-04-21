'use client'

import React from 'react'

type GroupFlag = {
  level: 'info' | 'moderate' | 'high'
  code: string
  title: string
  description: string
}

type Props = {
  summary: string
  narrative: string
  probableProcesses: string[]
  flags: GroupFlag[]
  detoxifiedReturn: {
    possible: boolean
    rationale: string
    recommendation: string
  }
}

function tone(level: GroupFlag['level']) {
  if (level === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (level === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

export function GroupSessionSummary({
  summary,
  narrative,
  probableProcesses,
  flags,
  detoxifiedReturn,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {summary}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Lecture intersubjective</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{narrative}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Processus probables</p>
        <div className="mt-3 space-y-2">
          {probableProcesses.map((item, index) => (
            <div
              key={index}
              className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">
          Restitution groupale détoxifiée
        </p>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Possible :</span>{' '}
            {detoxifiedReturn.possible ? 'oui' : 'non'}
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            {detoxifiedReturn.rationale}
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            {detoxifiedReturn.recommendation}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Drapeaux groupaux</p>
        <div className="mt-3 space-y-3">
          {flags.length ? (
            flags.map((flag, index) => (
              <div
                key={`${flag.code}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tone(flag.level)}`}
                >
                  {flag.level === 'high'
                    ? 'Alerte forte'
                    : flag.level === 'moderate'
                    ? 'Vigilance'
                    : 'Information'}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {flag.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {flag.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucun drapeau groupal calculé.</p>
          )}
        </div>
      </div>
    </div>
  )
}