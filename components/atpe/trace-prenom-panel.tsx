'use client'

import { useMemo, useState } from 'react'
import {
  interpretTracePrenom,
  type TracePrenomInput,
} from '@/lib/atpe-clinical/interpretation'

const initialState: TracePrenomInput = {
  pressure: 'moyenne',
  continuity: 'fluide',
  spatialOrganization: 'organisee',
  repetition: 'absente',
  hesitation: 'faible',
  anchoring: 'bon',
  readability: 'bonne',
}

type SelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FieldSelect({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <select
        className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TracePrenomPanel() {
  const [form, setForm] = useState<TracePrenomInput>(initialState)

  const result = useMemo(() => interpretTracePrenom(form), [form])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Protocole Trace-Prénom</h2>
          <p className="mt-1 text-sm text-slate-600">
            Saisie rapide des variables d’observation et lecture clinique ATPE.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldSelect
            label="Pression"
            value={form.pressure}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, pressure: value as TracePrenomInput['pressure'] }))
            }
            options={[
              { value: 'faible', label: 'Faible' },
              { value: 'moyenne', label: 'Moyenne' },
              { value: 'forte', label: 'Forte' },
            ]}
          />

          <FieldSelect
            label="Continuité"
            value={form.continuity}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, continuity: value as TracePrenomInput['continuity'] }))
            }
            options={[
              { value: 'fluide', label: 'Fluide' },
              { value: 'retenue', label: 'Retenue' },
              { value: 'hachée', label: 'Hachée' },
            ]}
          />

          <FieldSelect
            label="Organisation spatiale"
            value={form.spatialOrganization}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                spatialOrganization: value as TracePrenomInput['spatialOrganization'],
              }))
            }
            options={[
              { value: 'organisee', label: 'Organisée' },
              { value: 'partielle', label: 'Partielle' },
              { value: 'chaotique', label: 'Chaotique' },
            ]}
          />

          <FieldSelect
            label="Répétition"
            value={form.repetition}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, repetition: value as TracePrenomInput['repetition'] }))
            }
            options={[
              { value: 'absente', label: 'Absente' },
              { value: 'moderee', label: 'Modérée' },
              { value: 'marquee', label: 'Marquée' },
            ]}
          />

          <FieldSelect
            label="Hésitation"
            value={form.hesitation}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, hesitation: value as TracePrenomInput['hesitation'] }))
            }
            options={[
              { value: 'faible', label: 'Faible' },
              { value: 'moderee', label: 'Modérée' },
              { value: 'forte', label: 'Forte' },
            ]}
          />

          <FieldSelect
            label="Ancrage"
            value={form.anchoring}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, anchoring: value as TracePrenomInput['anchoring'] }))
            }
            options={[
              { value: 'bon', label: 'Bon' },
              { value: 'fragile', label: 'Fragile' },
              { value: 'faible', label: 'Faible' },
            ]}
          />

          <FieldSelect
            label="Lisibilité"
            value={form.readability}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, readability: value as TracePrenomInput['readability'] }))
            }
            options={[
              { value: 'bonne', label: 'Bonne' },
              { value: 'moyenne', label: 'Moyenne' },
              { value: 'difficile', label: 'Difficile' },
            ]}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Lecture clinique générée</h2>
          <p className="mt-1 text-sm text-slate-600">
            Hypothèses prudentes à intégrer au raisonnement clinique global.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Engagement
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {result.engagementDelta >= 0 ? '+' : ''}
              {result.engagementDelta}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tension</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.tensionDelta >= 0 ? '+' : ''}
              {result.tensionDelta}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Vulnérabilité
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {result.vulnerabilityDelta >= 0 ? '+' : ''}
              {result.vulnerabilityDelta}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Symbolisation
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {result.symbolizationDelta >= 0 ? '+' : ''}
              {result.symbolizationDelta}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Hypothèses cliniques
          </h3>

          {result.clinicalText.length ? (
            <div className="space-y-2">
              {result.clinicalText.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune hypothèse spécifique pour cette combinaison.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}