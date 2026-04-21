import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

function formatErrors(
  errors: Array<{ message?: string } | null | undefined>
): string | null {
  const messages = errors
    .filter(Boolean)
    .map((item) => item?.message)
    .filter((message): message is string => typeof message === 'string' && message.trim().length > 0)

  return messages.length > 0 ? messages.join(' | ') : null
}

export async function GET() {
  try {
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

    const errorMessage = formatErrors([
      conditionsResult.error,
      mediaResult.error,
      protocolsResult.error,
      mediaRulesResult.error,
      protocolRulesResult.error,
      watchpointsResult.error,
      conditionWatchpointsResult.error,
    ])

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    const conditions = asArray<ConditionRow>(conditionsResult.data)
    const media = asArray<MediaRow>(mediaResult.data)
    const protocols = asArray<ProtocolRow>(protocolsResult.data)
    const mediaRules = asArray<MediaRuleRow>(mediaRulesResult.data)
    const protocolRules = asArray<ProtocolRuleRow>(protocolRulesResult.data)
    const watchpoints = asArray<WatchpointRow>(watchpointsResult.data)
    const conditionWatchpoints = asArray<ConditionWatchpointRow>(
      conditionWatchpointsResult.data
    )

    return NextResponse.json({
      data: {
        conditions,
        media,
        protocols,
        mediaRules,
        protocolRules,
        watchpoints,
        conditionWatchpoints,
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