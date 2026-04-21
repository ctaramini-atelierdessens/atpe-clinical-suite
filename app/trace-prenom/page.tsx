import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type PatientRow = Database['public']['Tables']['patients']['Row']
type TracePrenomRow =
  Database['public']['Tables']['trace_prenom_observations']['Row']

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function readString(
  source: Record<string, unknown>,
  keys: string[],
  fallback = '—'
): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return fallback
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function average(values: Array<number | null | undefined>) {
  const valid = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  )

  if (!valid.length) return null

  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

function patientLabel(patient: PatientRow) {
  const record = asRecord(patient)
  const code = readString(record, ['code', 'patient_code'], '')
  const name = readString(record, ['full_name', 'display_name', 'name'], '')
  const initials = readString(record, ['initials'], '')

  return code || name || initials || patient.id
}

function scoreLabel(score: number | null) {
  if (score === null) return 'Indisponible'
  if (score < 35) return 'Très fragile'
  if (score < 50) return 'Fragile'
  if (score < 65) return 'Intermédiaire'
  if (score < 80) return 'Structuré'
  return 'Intégré'
}

function latestByCreatedAt<T extends { created_at: string | null }>(items: T[]): T | null {
  if (!items.length) return null

  return [...items].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0
    return tb - ta
  })[0] ?? null
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
    </article>
  )
}

export default async function TracePrenomPage() {
  const supabase = await createClient()

  const [patientsResult, traceResult] = await Promise.all([
    supabase.from('patients').select('*').order('created_at', { ascending: false }),
    supabase
      .from('trace_prenom_observations')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const patients = asArray<PatientRow>(patientsResult.data)
  const traceItems = asArray<TracePrenomRow>(traceResult.data)

  const errors = [
    patientsResult.error ? `Patients : ${patientsResult.error.message}` : null,
    traceResult.error ? `Trace-Prénom : ${traceResult.error.message}` : null,
  ].filter(Boolean)

  const patientMap = new Map(patients.map((patient) => [patient.id, patient]))

  const latestTrace = latestByCreatedAt(traceItems)

  const averageEngagement = average(traceItems.map((item) => item.engagement_score))
  const averageTension = average(traceItems.map((item) => item.tension_score))
  const averageVulnerability = average(traceItems.map((item) => item.vulnerability_score))
  const averageSymbolization = average(traceItems.map((item) => item.symbolization_score))
  const averageAnchoring = average(traceItems.map((item) => item.anchoring_score))
  const averageContinuity = average(traceItems.map((item) => item.continuity_score))

  const uniquePatients = new Set(traceItems.map((item) => item.patient_id)).size

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Trace-Prénom
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Module Trace-Prénom
            </h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Vue centrale des passations graphiques, avec lecture synthétique de
              l’engagement, de la tension, de la vulnérabilité, de la symbolisation
              et de l’ancrage.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/clinical"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Retour clinique
            </Link>
            <Link
              href="/patients"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Patients
            </Link>
          </div>
        </div>
      </section>

      {errors.length > 0 ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">
            Erreurs de chargement
          </h2>
          <div className="mt-3 space-y-1 text-sm text-red-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Passations"
          value={traceItems.length}
          hint="Nombre total d’observations enregistrées"
        />
        <MetricCard
          label="Patients concernés"
          value={uniquePatients}
          hint="Patients ayant au moins une passation"
        />
        <MetricCard
          label="Dernière passation"
          value={latestTrace ? formatDate(latestTrace.created_at) : '—'}
          hint={latestTrace ? `Patient ${latestTrace.patient_id}` : 'Aucune passation'}
        />
        <MetricCard
          label="Symbolisation moyenne"
          value={averageSymbolization ?? '—'}
          hint={scoreLabel(averageSymbolization)}
        />
      </section>

      <Card
        title="Indicateurs synthétiques"
        subtitle="Lecture moyenne du module Trace-Prénom sur l’ensemble des passations."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Engagement"
            value={averageEngagement ?? '—'}
            hint={scoreLabel(averageEngagement)}
          />
          <MetricCard
            label="Tension"
            value={averageTension ?? '—'}
            hint={scoreLabel(averageTension)}
          />
          <MetricCard
            label="Vulnérabilité"
            value={averageVulnerability ?? '—'}
            hint={scoreLabel(averageVulnerability)}
          />
          <MetricCard
            label="Ancrage"
            value={averageAnchoring ?? '—'}
            hint={scoreLabel(averageAnchoring)}
          />
          <MetricCard
            label="Continuité"
            value={averageContinuity ?? '—'}
            hint={scoreLabel(averageContinuity)}
          />
          <MetricCard
            label="Symbolisation"
            value={averageSymbolization ?? '—'}
            hint={scoreLabel(averageSymbolization)}
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Dernière passation"
          subtitle="Lecture rapide de l’observation la plus récente."
        >
          {latestTrace ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Patient{' '}
                  {patientMap.get(latestTrace.patient_id)
                    ? patientLabel(patientMap.get(latestTrace.patient_id) as PatientRow)
                    : latestTrace.patient_id}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(latestTrace.created_at)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Pression : {latestTrace.pressure ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Continuité : {latestTrace.continuity ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Organisation : {latestTrace.organization ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Répétition : {latestTrace.repetition ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Hésitation : {latestTrace.hesitation ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Lisibilité : {latestTrace.readability ?? '—'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Engagement : {latestTrace.engagement_score ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Tension : {latestTrace.tension_score ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Vulnérabilité : {latestTrace.vulnerability_score ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Symbolisation : {latestTrace.symbolization_score ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Ancrage : {latestTrace.anchoring_score ?? '—'}
                </div>
                <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                  Continuité : {latestTrace.continuity_score ?? '—'}
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Notes clinicien</p>
                <p className="mt-2 text-sm text-slate-600">
                  {latestTrace.clinician_notes ??
                    latestTrace.notes ??
                    'Aucune note clinique.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune passation Trace-Prénom enregistrée.
            </p>
          )}
        </Card>

        <Card
          title="Repères d’usage"
          subtitle="Synthèse fonctionnelle du module dans le cockpit clinique."
        >
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Lecture de l’inscription graphique et du geste</p>
            <p>• Repérage de l’engagement et de la continuité</p>
            <p>• Estimation prudente de la tension et de la vulnérabilité</p>
            <p>• Observation de la symbolisation naissante ou consolidée</p>
            <p>• Appui pour le score clinique global et la lecture longitudinale</p>
          </div>
        </Card>
      </div>

      <Card
        title="Historique des passations"
        subtitle="Ensemble des observations Trace-Prénom disponibles dans la base."
      >
        {traceItems.length ? (
          <div className="space-y-3">
            {traceItems.map((item) => {
              const patient = patientMap.get(item.patient_id) ?? null

              return (
                <article key={item.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {patient ? patientLabel(patient) : item.patient_id}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {typeof item.engagement_score === 'number' ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                          Engagement {item.engagement_score}
                        </span>
                      ) : null}
                      {typeof item.symbolization_score === 'number' ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                          Symbolisation {item.symbolization_score}
                        </span>
                      ) : null}
                      {typeof item.anchoring_score === 'number' ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                          Ancrage {item.anchoring_score}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Pression : {item.pressure ?? '—'}
                    </div>
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Continuité : {item.continuity ?? '—'}
                    </div>
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Organisation : {item.organization ?? '—'}
                    </div>
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Répétition : {item.repetition ?? '—'}
                    </div>
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Hésitation : {item.hesitation ?? '—'}
                    </div>
                    <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
                      Lisibilité : {item.readability ?? '—'}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">Notes</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.clinician_notes ?? item.notes ?? 'Aucune note.'}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/patients/${item.patient_id}`}
                      className="text-sm font-medium text-slate-900 underline underline-offset-2"
                    >
                      Ouvrir le dossier patient
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Aucun historique Trace-Prénom disponible.
          </p>
        )}
      </Card>
    </main>
  )
}