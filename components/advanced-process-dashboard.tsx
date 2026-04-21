'use client'

import React from 'react'
import {
  AtpeEngineOutput,
  AtpeSessionAdvancedInput,
} from '@/lib/atpe-engine-v2'

type Props = {
  input: AtpeSessionAdvancedInput
  result: AtpeEngineOutput
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function Gauge({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const safe = Math.max(0, Math.min(100, value))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{safe}/100</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-800 transition-all"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  )
}

function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : tone === 'danger'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        toneClass,
      )}
    >
      {children}
    </span>
  )
}

function alertTone(level: 'faible' | 'modéré' | 'élevé') {
  if (level === 'élevé') return 'danger' as const
  if (level === 'modéré') return 'warning' as const
  return 'success' as const
}

export function AdvancedProcessDashboard({ input, result }: Props) {
  const { dimensions, profile, hypotheses, recommendations, alerts, narrative } =
    result

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Dashboard clinique avancé ATPE
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lecture multidimensionnelle du cadre, du processus symbolisant et du champ relationnel.
            </p>
          </div>

          <Badge tone={alertTone(alerts.level)}>
            Niveau d’alerte : {alerts.level}
          </Badge>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {narrative}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Bloc A. État du dispositif
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Format
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {input.format === 'group' ? 'Groupe' : 'Individuel'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Médium principal
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {input.mediumPrimary || 'Non renseigné'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Médium secondaire
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {input.mediumSecondary || 'Non renseigné'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Phase ATPE dominante
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {input.atpePhaseDominant || 'Non renseignée'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Stabilité du cadre
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {dimensions.frameContainment}/100
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Présence thérapeutique / disponibilité relationnelle
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {dimensions.relationalAvailability}/100
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Bloc B. Processus symbolisant
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Gauge label="Décentration" value={input.decenteringLevel ?? 0} />
          <Gauge label="Centration" value={input.centeringLevel ?? 0} />
          <Gauge label="Extériorisation" value={input.externalizationLevel ?? 0} />
          <Gauge label="Dialogue avec l’œuvre" value={input.workDialogueLevel ?? 0} />
          <Gauge label="Partage" value={input.sharingLevel ?? 0} />
          <Gauge label="Engagement corporel" value={dimensions.bodilyEngagement} />
          <Gauge label="Symbolisation primaire" value={dimensions.primarySymbolization} />
          <Gauge label="Symbolisation secondaire" value={dimensions.secondarySymbolization} />
          <Gauge label="Mobilité créative" value={dimensions.creativeMobility} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Bloc C. Champ relationnel / groupal
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Gauge
            label="Disponibilité relationnelle"
            value={dimensions.relationalAvailability}
          />
          <Gauge
            label="Intensité projective"
            value={dimensions.projectiveIntensity}
          />
          <Gauge
            label="Contenance groupale"
            value={dimensions.groupContainment}
          />
          <Gauge
            label="Cohésion groupale"
            value={input.groupCohesion ?? 0}
          />
          <Gauge
            label="Diffraction du transfert"
            value={input.transferDiffraction ?? 0}
          />
          <Gauge
            label="Contenance du cadre"
            value={dimensions.frameContainment}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Profil symbolique
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {profile.symbolicProfile}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mode relationnel
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {profile.relationalMode}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mode groupal
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {profile.groupMode}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Mode projectif
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {profile.projectionMode}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Hypothèses cliniques prudentes
          </h3>

          <div className="space-y-3">
            {hypotheses.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Recommandations thérapeutiques
          </h3>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Médiums suggérés
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendations.medium.map((item, index) => (
                  <Badge key={index}>{item}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Posture thérapeutique
              </p>
              <div className="space-y-2">
                {recommendations.posture.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">
                Étape suivante
              </p>
              <div className="space-y-2">
                {recommendations.nextStep.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Alertes et vigilance clinique
        </h3>

        <div className="mb-4">
          <Badge tone={alertTone(alerts.level)}>
            Niveau d’alerte : {alerts.level}
          </Badge>
        </div>

        <div className="space-y-3">
          {alerts.items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}