import { createClient } from '@/lib/supabase/server'
import { labelPhase, labelScope, labelSensoryDominant } from '@/lib/atpe/referential'
import type { Database } from '@/lib/database.types'

type ConditionRow = Database['public']['Tables']['atpe_conditions']['Row']
type MediaRow = Database['public']['Tables']['atpe_media']['Row']
type ProtocolRow = Database['public']['Tables']['atpe_protocols']['Row']
type MediaRuleRow =
  Database['public']['Tables']['atpe_condition_media_rules']['Row']
type ProtocolRuleRow =
  Database['public']['Tables']['atpe_condition_protocol_rules']['Row']
type WatchpointRow = Database['public']['Tables']['atpe_watchpoints']['Row']
type ConditionWatchpointRow =
  Database['public']['Tables']['atpe_condition_watchpoints']['Row']

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function prettyText(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function severityLabel(value: string) {
  switch (value) {
    case 'high':
      return 'Élevée'
    case 'medium':
      return 'Moyenne'
    case 'low':
      return 'Faible'
    default:
      return prettyText(value)
  }
}

function cautionLabel(value: string) {
  switch (value) {
    case 'high':
      return 'Élevée'
    case 'medium':
      return 'Moyenne'
    case 'low':
      return 'Faible'
    default:
      return prettyText(value)
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const entries = Object.entries(value).filter(
    ([, v]) => typeof v === 'string' && v.trim().length > 0
  )

  return Object.fromEntries(entries) as Record<string, string>
}

export default async function ClinicalPage() {
  const supabase = await createClient()

  const [
    conditionsResult,
    mediaResult,
    protocolsResult,
    mediaRulesResult,
    protocolRulesResult,
    watchpointsResult,
    conditionWatchpointsResult,
  ] = await Promise.all([
    supabase.from('atpe_conditions').select('*').order('label'),
    supabase.from('atpe_media').select('*').order('label'),
    supabase.from('atpe_protocols').select('*').order('label'),
    supabase
      .from('atpe_condition_media_rules')
      .select('*')
      .order('priority', { ascending: false }),
    supabase
      .from('atpe_condition_protocol_rules')
      .select('*')
      .order('priority', { ascending: false }),
    supabase.from('atpe_watchpoints').select('*').order('label'),
    supabase.from('atpe_condition_watchpoints').select('*'),
  ])

  const conditions = asArray<ConditionRow>(conditionsResult.data)
  const media = asArray<MediaRow>(mediaResult.data)
  const protocols = asArray<ProtocolRow>(protocolsResult.data)
  const mediaRules = asArray<MediaRuleRow>(mediaRulesResult.data)
  const protocolRules = asArray<ProtocolRuleRow>(protocolRulesResult.data)
  const watchpoints = asArray<WatchpointRow>(watchpointsResult.data)
  const conditionWatchpoints = asArray<ConditionWatchpointRow>(
    conditionWatchpointsResult.data
  )

  const errors = [
    conditionsResult.error ? `Conditions : ${conditionsResult.error.message}` : null,
    mediaResult.error ? `Médiations : ${mediaResult.error.message}` : null,
    protocolsResult.error ? `Protocoles : ${protocolsResult.error.message}` : null,
    mediaRulesResult.error ? `Règles média : ${mediaRulesResult.error.message}` : null,
    protocolRulesResult.error
      ? `Règles protocole : ${protocolRulesResult.error.message}`
      : null,
    watchpointsResult.error ? `Vigilances : ${watchpointsResult.error.message}` : null,
    conditionWatchpointsResult.error
      ? `Liaisons vigilance : ${conditionWatchpointsResult.error.message}`
      : null,
  ].filter(Boolean)

  const conditionMap = new Map(conditions.map((item) => [item.id, item]))
  const mediaMap = new Map(media.map((item) => [item.id, item]))
  const protocolMap = new Map(protocols.map((item) => [item.id, item]))
  const watchpointMap = new Map(watchpoints.map((item) => [item.id, item]))

  const totalItems =
    conditions.length +
    media.length +
    protocols.length +
    mediaRules.length +
    protocolRules.length +
    watchpoints.length

  const enrichedMediaRules = mediaRules.map((rule) => ({
    ...rule,
    condition: conditionMap.get(rule.condition_id) ?? null,
    media: mediaMap.get(rule.media_id) ?? null,
  }))

  const enrichedProtocolRules = protocolRules.map((rule) => ({
    ...rule,
    condition: conditionMap.get(rule.condition_id) ?? null,
    protocol: protocolMap.get(rule.protocol_id) ?? null,
    caution_points: asStringArray(rule.caution_points),
    watchpoints: asStringArray(rule.watchpoints),
    team_relay: asRecord(rule.team_relay),
  }))

  const watchpointsByCondition = new Map<string, WatchpointRow[]>()

  for (const link of conditionWatchpoints) {
    const watchpoint = watchpointMap.get(link.watchpoint_id)
    if (!watchpoint) continue

    const existing = watchpointsByCondition.get(link.condition_id) ?? []
    existing.push(watchpoint)
    watchpointsByCondition.set(link.condition_id, existing)
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Clinique
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Cockpit du référentiel clinique ATPE
          </h1>
          <p className="text-sm text-slate-600">
            Référentiel central des pathologies repères, médiations, protocoles,
            points de vigilance et règles d’orientation clinique.
          </p>
        </div>
      </section>

      {errors.length > 0 ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">
            Erreur de chargement du référentiel
          </h2>
          <div className="mt-3 space-y-1 text-sm text-red-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Conditions
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {conditions.length}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Médiations
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {media.length}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Protocoles
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {protocols.length}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Vigilances
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {watchpoints.length}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Règles média
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {mediaRules.length}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Règles protocole
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {protocolRules.length}
          </p>
        </article>
      </section>

      {totalItems === 0 && errors.length === 0 ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Le référentiel clinique ATPE est encore vide. Vérifie que la migration
            SQL et le seed initial ont bien été exécutés dans Supabase.
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Conditions cliniques
            </h2>
            <p className="text-sm text-slate-600">
              Pathologies et profils repères du moteur clinique.
            </p>
          </div>

          <div className="space-y-3">
            {conditions.length > 0 ? (
              conditions.map((item) => {
                const linkedWatchpoints = watchpointsByCondition.get(item.id) ?? []

                return (
                  <article key={item.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.description || 'Aucune description renseignée.'}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        {prettyText(item.family)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Phase : {labelPhase(item.default_phase)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Portée : {labelScope(item.default_emotional_scope)}
                      </span>
                    </div>

                    {linkedWatchpoints.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Vigilances associées
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {linkedWatchpoints.map((watchpoint) => (
                            <span
                              key={`${item.id}-${watchpoint.id}`}
                              className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900"
                            >
                              {watchpoint.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {item.notes ? (
                      <p className="mt-3 text-xs text-slate-500">{item.notes}</p>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <p className="text-sm text-slate-500">
                Aucune condition clinique renseignée.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Médiations artistiques
            </h2>
            <p className="text-sm text-slate-600">
              Médias thérapeutiques avec dominante sensorielle et précautions.
            </p>
          </div>

          <div className="space-y-3">
            {media.length > 0 ? (
              media.map((item) => (
                <article key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description || 'Aucune description renseignée.'}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      {prettyText(item.category)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      Dominante : {labelSensoryDominant(item.sensory_dominant)}
                    </span>
                  </div>

                  {item.cautions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.cautions.map((caution) => (
                        <span
                          key={`${item.id}-${caution}`}
                          className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900"
                        >
                          {caution}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucune médiation renseignée.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Protocoles thérapeutiques
            </h2>
            <p className="text-sm text-slate-600">
              Protocoles disponibles par phase et portée clinique.
            </p>
          </div>

          <div className="space-y-3">
            {protocols.length > 0 ? (
              protocols.map((item) => (
                <article key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      {item.duration_min}-{item.duration_max} min
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      Phase : {labelPhase(item.phase)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      Portée : {labelScope(item.emotional_scope)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      Verbalisation : {prettyText(item.verbalization_style)}
                    </span>
                  </div>

                  {item.closure_ritual ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Clôture : {item.closure_ritual}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucun protocole renseigné.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Points de vigilance
            </h2>
            <p className="text-sm text-slate-600">
              Repères de qualité clinique à maintenir dans les séances.
            </p>
          </div>

          <div className="space-y-3">
            {watchpoints.length > 0 ? (
              watchpoints.map((item) => (
                <article key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      {severityLabel(item.severity)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucun point de vigilance renseigné.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Règles condition → média
            </h2>
            <p className="text-sm text-slate-600">
              Correspondances entre profils cliniques et médiations conseillées.
            </p>
          </div>

          <div className="space-y-3">
            {enrichedMediaRules.length > 0 ? (
              enrichedMediaRules.map((rule) => (
                <article key={rule.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {rule.condition?.label ?? 'Condition inconnue'} →{' '}
                        {rule.media?.label ?? 'Média inconnu'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {rule.therapeutic_goal}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Priorité : {rule.priority}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Caution : {cautionLabel(rule.caution_level)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                      Recommandé : {rule.recommended ? 'Oui' : 'Non'}
                    </span>

                    {rule.media?.sensory_dominant ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Dominante : {labelSensoryDominant(rule.media.sensory_dominant)}
                      </span>
                    ) : null}
                  </div>

                  {rule.notes ? (
                    <p className="mt-3 text-xs text-slate-500">{rule.notes}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucune règle condition → média renseignée.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Règles condition → protocole
            </h2>
            <p className="text-sm text-slate-600">
              Correspondances entre profils cliniques, protocoles et relais équipe.
            </p>
          </div>

          <div className="space-y-3">
            {enrichedProtocolRules.length > 0 ? (
              enrichedProtocolRules.map((rule) => (
                <article key={rule.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {rule.condition?.label ?? 'Condition inconnue'} →{' '}
                        {rule.protocol?.label ?? 'Protocole inconnu'}
                      </p>
                      {rule.protocol?.summary ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {rule.protocol.summary}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Priorité : {rule.priority}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Recommandé : {rule.recommended ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {rule.phase_override ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Phase forcée : {labelPhase(rule.phase_override)}
                      </span>
                    ) : null}

                    {rule.protocol?.phase ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                        Phase protocole : {labelPhase(rule.protocol.phase)}
                      </span>
                    ) : null}
                  </div>

                  {rule.caution_points.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vigilances
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rule.caution_points.map((point) => (
                          <span
                            key={`${rule.id}-caution-${point}`}
                            className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {rule.watchpoints.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Watchpoints
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rule.watchpoints.map((point) => (
                          <span
                            key={`${rule.id}-watch-${point}`}
                            className="rounded-full bg-white px-3 py-1 text-xs text-slate-700"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {Object.keys(rule.team_relay).length > 0 ? (
                    <div className="mt-3 rounded-xl bg-white p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Relais équipe
                      </p>
                      <div className="mt-2 space-y-1">
                        {Object.entries(rule.team_relay).map(([key, value]) => (
                          <p key={`${rule.id}-${key}`} className="text-sm text-slate-700">
                            <span className="font-medium text-slate-900">
                              {prettyText(key)} :
                            </span>{' '}
                            {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Aucune règle condition → protocole renseignée.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}