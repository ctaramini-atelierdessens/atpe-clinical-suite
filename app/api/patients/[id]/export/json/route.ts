import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/database.types'

type RouteContext = {
  params: Promise<{ id: string }>
}

type PatientRow = Database['public']['Tables']['patients']['Row']
type SessionRow = Database['public']['Tables']['sessions']['Row']
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']
type PatientDocumentRow = Database['public']['Tables']['patient_documents']['Row']
type ClinicalAlertRow = Database['public']['Tables']['clinical_alerts']['Row']
type AccessLogRow = Database['public']['Tables']['patient_access_logs']['Row']
type InitialAssessmentRow =
  Database['public']['Tables']['initial_assessments']['Row']
type TracePrenomObservationRow =
  Database['public']['Tables']['trace_prenom_observations']['Row']
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

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
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

function extractPatientLabel(patient: Partial<PatientRow> | null | undefined) {
  if (!patient) return 'patient'
  const record = patient as Record<string, unknown>

  const raw =
    (record.code as string) ||
    (record.full_name as string) ||
    (record.display_name as string) ||
    (record.name as string) ||
    patient.id ||
    'patient'

  return raw
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function sortByPriorityDesc<T extends { priority?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

function jsonHeaders(filename: string) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  }
}

async function ensurePatientExists(supabase: Awaited<ReturnType<typeof createClient>>, patientId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .maybeSingle()

  if (error) {
    throw new Error(`Lecture patient impossible : ${error.message}`)
  }

  if (!data) {
    throw new Error('Patient introuvable.')
  }

  return data as PatientRow
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
    const patient = await ensurePatientExists(supabase, patientId)

    const [
      sessionsResult,
      auditLogsResult,
      documentsResult,
      accessLogsResult,
      alertsResult,
      initialAssessmentResult,
      tracePrenomHistoryResult,
      atpeProfileResult,
    ] = await Promise.all([
      supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true }),

      supabase
        .from('audit_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),

      supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),

      supabase
        .from('patient_access_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),

      supabase
        .from('clinical_alerts')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),

      supabase
        .from('initial_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('trace_prenom_observations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false }),

      supabase
        .from('patient_atpe_profiles')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle(),
    ])

    const readErrors = [
      sessionsResult.error,
      auditLogsResult.error,
      documentsResult.error,
      accessLogsResult.error,
      alertsResult.error,
      initialAssessmentResult.error,
      tracePrenomHistoryResult.error,
      atpeProfileResult.error,
    ].filter(Boolean)

    if (readErrors.length > 0) {
      return NextResponse.json(
        { error: readErrors.map((item) => item?.message).join(' | ') },
        { status: 500 }
      )
    }

    const sessions = asArray<SessionRow>(sessionsResult.data)
    const auditLogs = asArray<AuditLogRow>(auditLogsResult.data)
    const documents = asArray<PatientDocumentRow>(documentsResult.data)
    const accessLogs = asArray<AccessLogRow>(accessLogsResult.data)
    const alerts = asArray<ClinicalAlertRow>(alertsResult.data)
    const initialAssessment =
      (initialAssessmentResult.data as InitialAssessmentRow | null) ?? null
    const tracePrenomHistory = asArray<TracePrenomObservationRow>(
      tracePrenomHistoryResult.data
    )
    const latestTracePrenom =
      tracePrenomHistory.length > 0 ? tracePrenomHistory[0] : null
    const atpeProfile =
      (atpeProfileResult.data as PatientATPEProfileRow | null) ?? null

    let atpePrescription: {
      condition: ConditionRow | null
      media: Array<MediaRuleRow & { media: MediaRow | null }>
      protocols: Array<
        ProtocolRuleRow & {
          protocol: ProtocolRow | null
          caution_points: string[]
          watchpoints: string[]
          team_relay: Record<string, string>
        }
      >
      watchpoints: WatchpointRow[]
      attention_points: string[]
    } = {
      condition: null,
      media: [],
      protocols: [],
      watchpoints: [],
      attention_points: [],
    }

    if (atpeProfile?.primary_condition_id) {
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
          .eq('id', atpeProfile.primary_condition_id)
          .maybeSingle(),

        supabase
          .from('atpe_condition_media_rules')
          .select('*')
          .eq('condition_id', atpeProfile.primary_condition_id),

        supabase
          .from('atpe_condition_protocol_rules')
          .select('*')
          .eq('condition_id', atpeProfile.primary_condition_id),

        supabase.from('atpe_media').select('*'),
        supabase.from('atpe_protocols').select('*'),
        supabase.from('atpe_watchpoints').select('*'),
      ])

      const prescriptionErrors = [
        conditionResult.error,
        mediaRulesResult.error,
        protocolRulesResult.error,
        mediaResult.error,
        protocolResult.error,
        watchpointsResult.error,
      ].filter(Boolean)

      if (prescriptionErrors.length > 0) {
        return NextResponse.json(
          { error: prescriptionErrors.map((item) => item?.message).join(' | ') },
          { status: 500 }
        )
      }

      const condition =
        (conditionResult.data as ConditionRow | null) ?? null
      const mediaRules = sortByPriorityDesc(
        asArray<MediaRuleRow>(mediaRulesResult.data)
      )
      const protocolRules = sortByPriorityDesc(
        asArray<ProtocolRuleRow>(protocolRulesResult.data)
      )
      const media = asArray<MediaRow>(mediaResult.data)
      const protocols = asArray<ProtocolRow>(protocolResult.data)
      const watchpoints = asArray<WatchpointRow>(watchpointsResult.data)

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

      const attentionPoints = uniqueStrings([
        ...asStringArray(atpeProfile.risk_flags),
        ...asStringArray(atpeProfile.follow_up_points),
        ...protocolPayload.flatMap((item) => item.caution_points),
        ...linkedWatchpoints.map((item) => item.label),
        ...protocolPayload.flatMap((item) => item.watchpoints),
      ])

      atpePrescription = {
        condition,
        media: mediaPayload,
        protocols: protocolPayload,
        watchpoints: linkedWatchpoints,
        attention_points: attentionPoints,
      }
    } else if (atpeProfile) {
      atpePrescription = {
        condition: null,
        media: [],
        protocols: [],
        watchpoints: [],
        attention_points: uniqueStrings([
          ...asStringArray(atpeProfile.risk_flags),
          ...asStringArray(atpeProfile.follow_up_points),
          'Renseigner une pathologie principale pour activer la prescription clinique.',
        ]),
      }
    } else {
      atpePrescription = {
        condition: null,
        media: [],
        protocols: [],
        watchpoints: [],
        attention_points: ['Compléter le profil clinique ATPE du patient.'],
      }
    }

    const payload = {
      exported_at: new Date().toISOString(),
      export_type: 'patient-json-consolidated',
      patient,
      dossier: {
        sessions,
        alerts,
        documents,
        access_logs: accessLogs,
        audit_logs: auditLogs,
        initial_assessment: initialAssessment,
      },
      atpe: {
        profile: atpeProfile,
        prescription: atpePrescription,
      },
      trace_prenom: {
        latest: latestTracePrenom,
        history: tracePrenomHistory,
        count: tracePrenomHistory.length,
      },
      summary: {
        sessions_count: sessions.length,
        alerts_count: alerts.length,
        documents_count: documents.length,
        access_logs_count: accessLogs.length,
        audit_logs_count: auditLogs.length,
        has_initial_assessment: Boolean(initialAssessment),
        has_atpe_profile: Boolean(atpeProfile),
        has_primary_condition: Boolean(atpeProfile?.primary_condition_id),
        trace_prenom_count: tracePrenomHistory.length,
      },
    }

    const filename = `${extractPatientLabel(patient)}-export.json`

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: jsonHeaders(filename),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur serveur inconnue.'
    const status = message === 'Patient introuvable.' ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}