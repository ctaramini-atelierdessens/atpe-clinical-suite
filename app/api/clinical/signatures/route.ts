import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type SignatureType =
  | 'clinical_summary'
  | 'supervision_validation'
  | 'protocol_validation'
  | 'group_summary_validation'
  | 'export_validation'

type SignatureStatus = 'signed' | 'revoked' | 'superseded'

function isValidSignatureType(value: unknown): value is SignatureType {
  return [
    'clinical_summary',
    'supervision_validation',
    'protocol_validation',
    'group_summary_validation',
    'export_validation',
  ].includes(String(value))
}

function isValidSignatureStatus(value: unknown): value is SignatureStatus {
  return ['signed', 'revoked', 'superseded'].includes(String(value))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const patientId = searchParams.get('patientId')
    const groupId = searchParams.get('groupId')
    const sessionAdvancedId = searchParams.get('atpeSessionAdvancedId')
    const signatureType = searchParams.get('signatureType')
    const signatureStatus = searchParams.get('signatureStatus')
    const signerId = searchParams.get('signerId')
    const limitParam = searchParams.get('limit')

    let query = supabase
      .from('atpe_clinical_signatures')
      .select('*')
      .order('signed_at', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    if (sessionAdvancedId) {
      query = query.eq('atpe_session_advanced_id', sessionAdvancedId)
    }

    if (signatureType && isValidSignatureType(signatureType)) {
      query = query.eq('signature_type', signatureType)
    }

    if (signatureStatus && isValidSignatureStatus(signatureStatus)) {
      query = query.eq('signature_status', signatureStatus)
    }

    if (signerId) {
      query = query.eq('signer_id', signerId)
    }

    if (limitParam) {
      const parsedLimit = Number(limitParam)
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit)
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    })
  } catch (error) {
    console.error('GET /api/clinical/signatures error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les signatures.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const signatureType = body?.signature_type
    const signatureStatus = body?.signature_status ?? 'signed'

    if (!isValidSignatureType(signatureType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ signature_type est requis et invalide.',
        },
        { status: 400 },
      )
    }

    if (!isValidSignatureStatus(signatureStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ signature_status est invalide.',
        },
        { status: 400 },
      )
    }

    const signedPayload =
      body?.signed_payload &&
      typeof body.signed_payload === 'object' &&
      !Array.isArray(body.signed_payload)
        ? body.signed_payload
        : {}

    const payload = {
      patient_id:
        typeof body?.patient_id === 'string' && body.patient_id.trim()
          ? body.patient_id.trim()
          : null,
      group_id:
        typeof body?.group_id === 'string' && body.group_id.trim()
          ? body.group_id.trim()
          : null,
      atpe_session_advanced_id:
        typeof body?.atpe_session_advanced_id === 'string' &&
        body.atpe_session_advanced_id.trim()
          ? body.atpe_session_advanced_id.trim()
          : null,
      signature_type: signatureType,
      signer_id:
        typeof body?.signer_id === 'string' && body.signer_id.trim()
          ? body.signer_id.trim()
          : null,
      signer_name:
        typeof body?.signer_name === 'string' && body.signer_name.trim()
          ? body.signer_name.trim()
          : null,
      signer_role:
        typeof body?.signer_role === 'string' && body.signer_role.trim()
          ? body.signer_role.trim()
          : null,
      signature_status: signatureStatus,
      signed_payload: signedPayload,
      comment:
        typeof body?.comment === 'string' ? body.comment : null,
      signed_at:
        typeof body?.signed_at === 'string' && body.signed_at.trim()
          ? body.signed_at
          : new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('atpe_clinical_signatures')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('POST /api/clinical/signatures error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible d’enregistrer la signature.',
      },
      { status: 500 },
    )
  }
}