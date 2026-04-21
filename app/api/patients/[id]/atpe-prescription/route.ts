import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/database.types'

type RouteContext = {
  params: Promise<{ id: string }>
}

type PatientATPEProfileRow =
  Database['public']['Tables']['patient_atpe_profiles']['Row']

type ConditionRow = Database['public']['Tables']['atpe_conditions']['Row']
type MediaRow = Database['public']['Tables']['atpe_media']['Row']
type ProtocolRow = Database['public']['Tables']['atpe_protocols']['Row']
type MediaRuleRow =
  Database['public']['Tables']['atpe_condition_media_rules']['Row']
type ProtocolRuleRow =
  Database['public']['Tables']['atpe_condition_protocol_rules']['Row']
type WatchpointRow = Database['public']['Tables']['atpe_watchpoints']['Row']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )
}

function asRecord(value: Json | null | undefined): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const entries = Object.entries(value).filter(
    ([, v]) => typeof v === 'string' && v.trim().length > 0
  )

  return Object.fromEntries(entries) as Record<string, string>
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)))
}

function sortByPriorityDesc<T extends { priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

function groupAttentionPoints(params: {
  profile: PatientATPEProfileRow | null
  protocolRules: ProtocolRuleRow[]
  linkedWatchpoints: WatchpointRow[]
}) {
  const profileRiskFlags = asStringArray(params.profile?.risk_flags)
  const followUpPoints = asStringArray(params.profile?.follow_up_points)
  const protocolCautions = uniqueStrings(
    params.protocolRules.flatMap((rule) => asStringArray(rule.caution_points))
  )
  const explicitWatchpointSlugs = uniqueStrings(
    params.protocolRules.flatMap((rule) => asStringArray(rule.watchpoints))
  )
  const resolvedWatchpointLabels = params.linkedWatchpoints.map((item) => item.label)

  return uniqueStrings([
    ...profileRiskFlags,
    ...followUpPoints,
    ...protocolCautions,
    ...resolvedWatchpointLabels,
    ...explicitWatchpointSlugs,
  ])
}

export async function GET(_: Request, context: RouteContext) {
  const { id: patientId } = await context.params

  if (!isNonEmptyString(patientId)) {
    return NextResponse.json(
      { error: 'Identifiant patient manquant.' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('patient_atpe_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: `Lecture du profil impossible : ${profileError.message}` },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json({
        data: {
          profile: null,
          condition: null,
          media: [],
          protocols: [],
          watchpoints: [],
          attention_points: ['Compléter le profil clinique ATPE du patient.'],
        },
      })
    }

    if (!profile.primary_condition_id) {
      return NextResponse.json({
        data: {
          profile,
          condition: null,
          media: [],
          protocols: [],
          watchpoints: [],
          attention_points: uniqueStrings([
            ...asStringArray(profile.risk_flags),
            ...asStringArray(profile.follow_up_points),
            'Renseigner une pathologie principale pour activer la prescription clinique.',
          ]),
        },
      })
    }

    const [
      conditionResult,
      mediaRulesResult,
      protocolRulesResult,
      mediaResult,
      protocolResult,
      watchpointsResult,
    ] = await Promise.all([
      supabase
        .from('atpe_conditions')
        .select('*')
        .eq('id', profile.primary_condition_id)
        .maybeSingle(),

      supabase
        .from('atpe_condition_media_rules')
        .select('*')
        .eq('condition_id', profile.primary_condition_id),

      supabase
        .from('atpe_condition_protocol_rules')
        .select('*')
        .eq('condition_id', profile.primary_condition_id),

      supabase.from('atpe_media').select('*'),

      supabase.from('atpe_protocols').select('*'),

      supabase.from('atpe_watchpoints').select('*'),
    ])

    const errors = [
      conditionResult.error,
      mediaRulesResult.error,
      protocolRulesResult.error,
      mediaResult.error,
      protocolResult.error,
      watchpointsResult.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.map((item) => item?.message).join(' | ') },
        { status: 500 }
      )
    }

    const condition = (conditionResult.data ?? null) as ConditionRow | null
    const mediaRules = sortByPriorityDesc(
      (mediaRulesResult.data ?? []) as MediaRuleRow[]
    )
    const protocolRules = sortByPriorityDesc(
      (protocolRulesResult.data ?? []) as ProtocolRuleRow[]
    )
    const media = (mediaResult.data ?? []) as MediaRow[]
    const protocols = (protocolResult.data ?? []) as ProtocolRow[]
    const watchpoints = (watchpointsResult.data ?? []) as WatchpointRow[]

    const mediaMap = new Map(media.map((item) => [item.id, item]))
    const protocolMap = new Map(protocols.map((item) => [item.id, item]))
    const watchpointBySlug = new Map(watchpoints.map((item) => [item.slug, item]))

    const mediaPayload = mediaRules
      .map((rule) => ({
        ...rule,
        media: mediaMap.get(rule.media_id) ?? null,
      }))
      .filter((item) => item.media !== null)

    const protocolPayload = protocolRules
      .map((rule) => ({
        ...rule,
        protocol: protocolMap.get(rule.protocol_id) ?? null,
        caution_points: asStringArray(rule.caution_points),
        watchpoints: asStringArray(rule.watchpoints),
        team_relay: asRecord(rule.team_relay),
      }))
      .filter((item) => item.protocol !== null)

    const linkedWatchpoints = uniqueStrings(
      protocolRules.flatMap((rule) => asStringArray(rule.watchpoints))
    )
      .map((slug) => watchpointBySlug.get(slug) ?? null)
      .filter((item): item is WatchpointRow => item !== null)

    const attentionPoints = groupAttentionPoints({
      profile,
      protocolRules,
      linkedWatchpoints,
    })

    return NextResponse.json({
      data: {
        profile,
        condition,
        media: mediaPayload,
        protocols: protocolPayload,
        watchpoints: linkedWatchpoints,
        attention_points: attentionPoints,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Erreur serveur inconnue.',
      },
      { status: 500 }
    )
  }
}