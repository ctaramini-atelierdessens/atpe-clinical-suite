import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const DEFAULT_CONFIG = {
  sheets: {
    patients: 'Patients_V4',
    sessions: 'Séances',
    consents: 'Consentements',
  },
  mappings: {
    patients: {
      id: 'ID',
      name: 'Nom',
      age: 'Age',
      currentScore: 'Score actuel',
      progressionPercent: 'Progression %',
      durationDays: 'Durée (jours)',
      patientCode: 'Code patient',
      caseReference: 'Référence dossier',
    },
    sessions: {
      patientCode: 'Code patient',
      sessionDate: 'Date',
      sessionNumber: 'Séance',
      durationMinutes: 'Durée (min)',
      note: 'Note',
      clinicalSummary: 'Résumé clinique',
      emotionalScore: 'Score émotion',
      regulationScore: 'Score régulation',
      engagementScore: 'Score engagement',
    },
    consents: {
      patientCode: 'Code patient',
      consentKind: 'Type consentement',
      status: 'Statut',
      recordedAt: 'Date',
      expiresAt: 'Expiration',
      note: 'Note',
    },
  },
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text.length ? text : null
}

function toInt(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(String(value).replace(',', '.'))
  return Number.isFinite(num) ? Math.round(num) : null
}

function toDateString(value: unknown) {
  if (!value) return null

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`
  }

  const text = String(value).trim()
  if (!text) return null

  const iso = new Date(text)
  if (!Number.isNaN(iso.getTime())) return iso.toISOString().slice(0, 10)

  const m = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/)
  if (!m) return null

  const year = m[3].length === 2 ? `20${m[3]}` : m[3]
  return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

function deriveInitials(name: string | null) {
  if (!name) return null
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || null
  )
}

function canonicalConsentKind(value: unknown) {
  const text = normalizeHeader(value)
  if (!text) return 'care'
  if (text.includes('image') || text.includes('audio')) return 'image_audio'
  if (text.includes('data') || text.includes('donnee')) return 'data_processing'
  if (text.includes('research') || text.includes('recherche')) return 'research'
  return 'care'
}

function canonicalConsentStatus(value: unknown) {
  const text = normalizeHeader(value)
  if (text.includes('refus')) return 'refused'
  if (text.includes('withdraw') || text.includes('retir')) return 'withdrawn'
  if (text.includes('expire')) return 'expired'
  return 'granted'
}

function readSheetRows(workbook: XLSX.WorkBook, preferredSheetName: string) {
  const sheetName =
    workbook.SheetNames.find((name) => normalizeHeader(name) === normalizeHeader(preferredSheetName)) ??
    preferredSheetName

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { sheetName: null, rows: [] as Record<string, unknown>[] }

  return {
    sheetName,
    rows: XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null }),
  }
}

function pick(row: Record<string, unknown>, label?: string) {
  if (!label) return null
  const normalizedLabel = normalizeHeader(label)

  for (const [key, value] of Object.entries(row)) {
    if (normalizeHeader(key) === normalizedLabel) return value
  }

  return null
}

function buildPatientRecord(row: Record<string, unknown>, mappings: any, index: number) {
  const name = normalizeValue(pick(row, mappings.name))
  const age = toInt(pick(row, mappings.age))
  const currentScore = toInt(pick(row, mappings.currentScore))
  const progressionPercent = toInt(pick(row, mappings.progressionPercent))
  const durationDays = toInt(pick(row, mappings.durationDays))
  const code =
    normalizeValue(pick(row, mappings.patientCode)) ??
    `IMP-${normalizeValue(pick(row, mappings.id)) ?? index + 1}`
  const caseReference = normalizeValue(pick(row, mappings.caseReference) ?? pick(row, mappings.id))

  return {
    code,
    name,
    age,
    currentScore,
    progressionPercent,
    durationDays,
    caseReference,
    raw: row,
  }
}

function buildSessionRecord(row: Record<string, unknown>, mappings: any, index: number) {
  return {
    patientCode: normalizeValue(pick(row, mappings.patientCode)),
    sessionDate: toDateString(pick(row, mappings.sessionDate)),
    sessionNumber: toInt(pick(row, mappings.sessionNumber)) ?? index + 1,
    durationMinutes: toInt(pick(row, mappings.durationMinutes)),
    note: normalizeValue(pick(row, mappings.note)),
    clinicalSummary: normalizeValue(pick(row, mappings.clinicalSummary)),
    emotionalScore: toInt(pick(row, mappings.emotionalScore)) ?? 0,
    regulationScore: toInt(pick(row, mappings.regulationScore)) ?? 0,
    engagementScore: toInt(pick(row, mappings.engagementScore)) ?? 0,
    raw: row,
  }
}

function buildConsentRecord(row: Record<string, unknown>, mappings: any) {
  return {
    patientCode: normalizeValue(pick(row, mappings.patientCode)),
    consentKind: canonicalConsentKind(pick(row, mappings.consentKind)),
    status: canonicalConsentStatus(pick(row, mappings.status)),
    recordedAt: toDateString(pick(row, mappings.recordedAt)) ?? new Date().toISOString().slice(0, 10),
    expiresAt: toDateString(pick(row, mappings.expiresAt)),
    note: normalizeValue(pick(row, mappings.note)),
    raw: row,
  }
}

async function resolveOrganization(supabase: any, userId: string) {
  const { data } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  return data?.[0]?.organization_id ?? null
}

function resolutionKey(group: string, rowNumber: number, reason: string) {
  return `${group}:${rowNumber}:${reason}`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const db = supabase as any

  const {
    data: { user },
  } = await db.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  const organizationId = await resolveOrganization(db, user.id)
  if (!organizationId) {
    return NextResponse.json({ error: 'Aucune organisation active.' }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })
  }

  const previewOnly = formData.get('preview')?.toString() === '1'
  const duplicateResolutions = JSON.parse(
    String(formData.get('duplicate_resolutions') || '{}'),
  ) as Record<string, string>

  const configText = formData.get('config_json')?.toString()
  let config: any = DEFAULT_CONFIG

  if (configText) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(configText) }
    } catch {
      return NextResponse.json({ error: 'Config de mapping invalide.' }, { status: 400 })
    }
  }

  const fileBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(fileBuffer, { type: 'array' })

  const patientsSheet = readSheetRows(workbook, config.sheets?.patients ?? DEFAULT_CONFIG.sheets.patients)
  const sessionsSheet = readSheetRows(workbook, config.sheets?.sessions ?? DEFAULT_CONFIG.sheets.sessions)
  const consentsSheet = readSheetRows(workbook, config.sheets?.consents ?? DEFAULT_CONFIG.sheets.consents)

  const patientRecords = patientsSheet.rows.map((row, i) =>
    buildPatientRecord(row, config.mappings?.patients ?? DEFAULT_CONFIG.mappings.patients, i),
  )

  const sessionRecords = sessionsSheet.rows
    .map((row, i) => buildSessionRecord(row, config.mappings?.sessions ?? DEFAULT_CONFIG.mappings.sessions, i))
    .filter((row) => row.patientCode || row.sessionDate || row.note)

  const consentRecords = consentsSheet.rows
    .map((row) => buildConsentRecord(row, config.mappings?.consents ?? DEFAULT_CONFIG.mappings.consents))
    .filter((row) => row.patientCode || row.note)

  const patientCodes = [...new Set(patientRecords.map((r) => r.code).filter(Boolean))]
  const caseRefs = [...new Set(patientRecords.map((r) => r.caseReference).filter(Boolean))]
  const names = [...new Set(patientRecords.map((r) => r.name).filter(Boolean))]
  const sessionPatientCodes = [...new Set(sessionRecords.map((r) => r.patientCode).filter(Boolean))]
  const consentPatientCodes = [...new Set(consentRecords.map((r) => r.patientCode).filter(Boolean))]

  const [{ data: existingByCode }, { data: existingByCaseRef }, { data: existingByNames }, { data: patientsForLinked }, { data: existingConsents }] =
    await Promise.all([
      patientCodes.length
        ? db
            .from('patients')
            .select('id, code, case_reference, display_name, birth_year')
            .eq('organization_id', organizationId)
            .in('code', patientCodes)
        : Promise.resolve({ data: [] }),
      caseRefs.length
        ? db
            .from('patients')
            .select('id, code, case_reference, display_name, birth_year')
            .eq('organization_id', organizationId)
            .in('case_reference', caseRefs)
        : Promise.resolve({ data: [] }),
      names.length
        ? db
            .from('patients')
            .select('id, code, case_reference, display_name, birth_year')
            .eq('organization_id', organizationId)
            .in('display_name', names)
        : Promise.resolve({ data: [] }),
      [...sessionPatientCodes, ...consentPatientCodes].length
        ? db
            .from('patients')
            .select('id, code')
            .eq('organization_id', organizationId)
            .in('code', [...new Set([...sessionPatientCodes, ...consentPatientCodes])])
        : Promise.resolve({ data: [] }),
      consentPatientCodes.length
        ? db
            .from('patient_consents')
            .select('id, patient_id, consent_kind, patients(code)')
            .in('patients.code', consentPatientCodes)
        : Promise.resolve({ data: [] }),
    ])

  const patientDuplicates = patientRecords.flatMap((record, index) => {
    const rowNumber = index + 2
    const birthYear = record.age ? new Date().getFullYear() - record.age : null

    return [
      ...((existingByCode ?? []) as any[])
        .filter((item: any) => item.code === record.code)
        .map((item: any) => ({
          reason: 'Code patient déjà présent',
          imported: record,
          existing: item,
          rowNumber,
        })),

      ...(record.caseReference
        ? ((existingByCaseRef ?? []) as any[])
            .filter((item: any) => item.case_reference === record.caseReference)
            .map((item: any) => ({
              reason: 'Référence dossier déjà présente',
              imported: record,
              existing: item,
              rowNumber,
            }))
        : []),

      ...(record.name
        ? ((existingByNames ?? []) as any[])
            .filter(
              (item: any) =>
                item.display_name === record.name &&
                (!birthYear || !item.birth_year || item.birth_year === birthYear),
            )
            .map((item: any) => ({
              reason: 'Nom / année de naissance proche d’un patient existant',
              imported: record,
              existing: item,
              rowNumber,
            }))
        : []),
    ]
  })

  const sessionDuplicates: any[] = []
  for (let index = 0; index < sessionRecords.length; index += 1) {
    const record = sessionRecords[index]
    const rowNumber = index + 2

    if (!record.patientCode) continue

    const patient = (patientsForLinked ?? []).find((item: any) => item.code === record.patientCode)
    if (!patient) continue

    const { data: episodes } = await db
      .from('therapy_episodes')
      .select('id')
      .eq('patient_id', patient.id)
      .is('closed_on', null)
      .limit(1)

    const episodeId = episodes?.[0]?.id
    if (!episodeId) continue

    const { data: existingSession } = await db
      .from('sessions')
      .select('id, session_number, session_date')
      .eq('episode_id', episodeId)
      .eq('session_number', record.sessionNumber)
      .maybeSingle()

    if (existingSession) {
      sessionDuplicates.push({
        reason: 'Séance déjà présente sur cet épisode',
        imported: record,
        existing: existingSession,
        rowNumber,
      })
    }
  }

  const consentDuplicates: any[] = []
  for (let index = 0; index < consentRecords.length; index += 1) {
    const record = consentRecords[index]
    const rowNumber = index + 2
    const patient = (patientsForLinked ?? []).find((item: any) => item.code === record.patientCode)
    const existing = (existingConsents ?? []).find(
      (item: any) => item.patient_id === patient?.id && item.consent_kind === record.consentKind,
    )

    if (existing) {
      consentDuplicates.push({
        reason: 'Consentement du même type déjà présent',
        imported: record,
        existing,
        rowNumber,
      })
    }
  }

  if (previewOnly) {
    return NextResponse.json({
      ok: true,
      mode: 'preview',
      dryRunToken: randomUUID(),
      workbook: { sheetNames: workbook.SheetNames },
      preview: {
        patients: patientRecords.slice(0, 5),
        sessions: sessionRecords.slice(0, 5),
        consents: consentRecords.slice(0, 5),
      },
      duplicates: {
        patients: patientDuplicates.slice(0, 20),
        sessions: sessionDuplicates.slice(0, 20),
        consents: consentDuplicates.slice(0, 20),
      },
      counts: {
        patientRows: patientRecords.length,
        sessionRows: sessionRecords.length,
        consentRows: consentRecords.length,
        patientDuplicateHits: patientDuplicates.length,
        sessionDuplicateHits: sessionDuplicates.length,
        consentDuplicateHits: consentDuplicates.length,
      },
    })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const storagePath = `${organizationId}/${timestamp}-${file.name}`

  const { data: job, error: jobError } = await db
    .from('import_jobs')
    .insert({
      organization_id: organizationId,
      uploaded_by: user.id,
      file_name: file.name,
      mime_type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      storage_bucket: 'clinical-imports',
      storage_path: storagePath,
      status: 'uploaded',
      row_count: patientRecords.length + sessionRecords.length + consentRecords.length,
      summary: {
        sheetNames: workbook.SheetNames,
        mapping: config,
        duplicateResolutions,
        mode: 'final-import',
      },
    })
    .select('*')
    .single()

  if (jobError || !job) {
    return NextResponse.json(
      { error: jobError?.message ?? 'Impossible de créer le job d’import.' },
      { status: 500 },
    )
  }

  await db.storage.from('clinical-imports').upload(storagePath, file, {
    contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    upsert: false,
  })

  const patientByCode = new Map<string, any>()
  const rowLogs: any[] = []

  let successCount = 0
  let errorCount = 0
  let warningCount = 0
  let createdPatients = 0
  let updatedPatients = 0
  let createdSessions = 0
  let updatedSessions = 0
  let createdConsents = 0
  let updatedConsents = 0
  let createdSnapshots = 0

  for (let index = 0; index < patientRecords.length; index += 1) {
    const record = patientRecords[index]
    const rowNumber = index + 2

    if (!record.name && record.currentScore === null && record.progressionPercent === null) {
      errorCount += 1
      rowLogs.push({
        import_job_id: job.id,
        source_sheet: patientsSheet.sheetName,
        entity_type: 'patient',
        row_number: rowNumber,
        patient_code: record.code,
        status: 'error',
        message: 'Ligne patient ignorée : aucune donnée exploitable.',
        payload: record.raw,
      })
      continue
    }

    try {
      const resolution = patientDuplicates
        .map((d) => ({ ...d, key: resolutionKey('patients', d.rowNumber, d.reason) }))
        .find((d) => d.rowNumber === rowNumber && duplicateResolutions[d.key])

      if (resolution && duplicateResolutions[resolution.key] === 'skip') {
        warningCount += 1
        rowLogs.push({
          import_job_id: job.id,
          source_sheet: patientsSheet.sheetName,
          entity_type: 'patient',
          row_number: rowNumber,
          patient_code: record.code,
          status: 'warning',
          message: 'Ligne ignorée par résolution assistée.',
          payload: record.raw,
        })
        continue
      }

      const birthYear = record.age ? new Date().getFullYear() - record.age : null
      let existingPatient: any = null

      if (record.code) {
        existingPatient = (
          await db
            .from('patients')
            .select('id, code')
            .eq('organization_id', organizationId)
            .eq('code', record.code)
            .maybeSingle()
        ).data
      }

      if (!existingPatient && record.caseReference) {
        existingPatient = (
          await db
            .from('patients')
            .select('id, code')
            .eq('organization_id', organizationId)
            .eq('case_reference', record.caseReference)
            .maybeSingle()
        ).data
      }

      if (!existingPatient && record.name && birthYear) {
        existingPatient = (
          await db
            .from('patients')
            .select('id, code')
            .eq('organization_id', organizationId)
            .eq('display_name', record.name)
            .eq('birth_year', birthYear)
            .maybeSingle()
        ).data
      }

      const patientBase = {
        organization_id: organizationId,
        primary_clinician_id: user.id,
        code:
          resolution && duplicateResolutions[resolution.key] === 'create_new'
            ? `${record.code}-NEW-${rowNumber}`
            : record.code,
        display_name: record.name,
        initials: deriveInitials(record.name),
        birth_year: birthYear,
        referral_source: 'excel_import_v9',
        case_reference:
          resolution && duplicateResolutions[resolution.key] === 'create_new'
            ? `${record.caseReference ?? record.code}-NEW-${rowNumber}`
            : record.caseReference,
        status: 'active',
        updated_at: new Date().toISOString(),
      }

      let patientId = existingPatient?.id

      if (existingPatient?.id && (!resolution || duplicateResolutions[resolution.key] !== 'create_new')) {
        const { error } = await db
          .from('patients')
          .update(patientBase)
          .eq('id', existingPatient.id)

        if (error) throw error
        updatedPatients += 1
      } else {
        const { data, error } = await db
          .from('patients')
          .insert(patientBase)
          .select('id')
          .single()

        if (error || !data) throw error ?? new Error('Création patient impossible')
        patientId = data.id
        createdPatients += 1
      }

      let episodeId = (
        await db
          .from('therapy_episodes')
          .select('id')
          .eq('patient_id', patientId)
          .is('closed_on', null)
          .order('opened_on', { ascending: false })
          .limit(1)
          .maybeSingle()
      ).data?.id

      if (!episodeId) {
        const { data, error } = await db
          .from('therapy_episodes')
          .insert({
            organization_id: organizationId,
            patient_id: patientId,
            clinician_id: user.id,
            episode_label: 'Episode importé v9',
            therapeutic_frame: 'Import incrémental',
            objectives_summary: 'Données descriptives synchronisées depuis Excel.',
            status: 'active',
            opened_on: new Date().toISOString().slice(0, 10),
          })
          .select('id')
          .single()

        if (error || !data) throw error ?? new Error('Création épisode impossible')
        episodeId = data.id
      }

      const { error: snapshotError } = await db.from('patient_metric_snapshots').insert({
        organization_id: organizationId,
        patient_id: patientId,
        episode_id: episodeId,
        source_type: 'excel_import',
        source_job_id: job.id,
        snapshot_date: new Date().toISOString().slice(0, 10),
        current_score: record.currentScore,
        progression_percent: record.progressionPercent,
        duration_days: record.durationDays,
        imported_name: record.name,
        imported_age: record.age,
        raw_payload: {
          import_version: 'v9',
          source_file: file.name,
        },
      })

      if (!snapshotError) createdSnapshots += 1

      patientByCode.set(record.code, { patientId, episodeId })
      successCount += 1

      rowLogs.push({
        import_job_id: job.id,
        source_sheet: patientsSheet.sheetName,
        entity_type: 'patient',
        row_number: rowNumber,
        patient_id: patientId,
        patient_code: record.code,
        status: 'success',
        message: existingPatient?.id ? 'Patient mis à jour (mode incrémental).' : 'Patient créé.',
        payload: record.raw,
      })
    } catch (error: any) {
      errorCount += 1
      rowLogs.push({
        import_job_id: job.id,
        source_sheet: patientsSheet.sheetName,
        entity_type: 'patient',
        row_number: rowNumber,
        patient_code: record.code,
        status: 'error',
        message: error?.message ?? 'Erreur patient',
        payload: record.raw,
      })
    }
  }

  for (let index = 0; index < sessionRecords.length; index += 1) {
    const record = sessionRecords[index]
    const rowNumber = index + 2

    try {
      const resolution = sessionDuplicates
        .map((d) => ({ ...d, key: resolutionKey('sessions', d.rowNumber, d.reason) }))
        .find((d) => d.rowNumber === rowNumber && duplicateResolutions[d.key])

      if (resolution && duplicateResolutions[resolution.key] === 'skip') {
        warningCount += 1
        rowLogs.push({
          import_job_id: job.id,
          source_sheet: sessionsSheet.sheetName,
          entity_type: 'session',
          row_number: rowNumber,
          patient_code: record.patientCode,
          status: 'warning',
          message: 'Séance ignorée par résolution assistée.',
          payload: record.raw,
        })
        continue
      }

if (!record.patientCode) {
  throw new Error('Code patient manquant pour la séance.')
}

const linked = patientByCode.get(record.patientCode)
if (!linked?.patientId || !linked?.episodeId) {
  throw new Error('Patient lié introuvable pour la séance.')
}

if (!record.patientCode) {
  throw new Error('Code patient manquant pour le consentement.')
}

const linked =
  patientByCode.get(record.patientCode) ??
  (patientsForLinked ?? []).find((item: any) => item.code === record.patientCode)
}

      const existing = await db
        .from('sessions')
        .select('id')
        .eq('episode_id', linked.episodeId)
        .eq('session_number', record.sessionNumber)
        .maybeSingle()

      const payload = {
        organization_id: organizationId,
        patient_id: linked.patientId,
        episode_id: linked.episodeId,
        clinician_id: user.id,
        session_number: record.sessionNumber,
        session_date: record.sessionDate ?? new Date().toISOString().slice(0, 10),
        duration_minutes: record.durationMinutes,
        emotional_score: record.emotionalScore,
        regulation_score: record.regulationScore,
        engagement_score: record.engagementScore,
        note: record.note,
        clinical_summary: record.clinicalSummary,
      }

      if (existing.data && (!resolution || duplicateResolutions[resolution.key] !== 'create_new')) {
        const { error } = await db.from('sessions').update(payload).eq('id', existing.data.id)
        if (error) throw error

        updatedSessions += 1
        rowLogs.push({
          import_job_id: job.id,
          source_sheet: sessionsSheet.sheetName,
          entity_type: 'session',
          row_number: rowNumber,
          patient_id: linked.patientId,
          patient_code: record.patientCode,
          status: 'success',
          message: 'Séance mise à jour (mode incrémental).',
          payload: record.raw,
        })
      } else {
        const createPayload = existing.data
          ? { ...payload, session_number: record.sessionNumber + 1000 }
          : payload

        const { error } = await db.from('sessions').insert(createPayload)
        if (error) throw error

        createdSessions += 1
        rowLogs.push({
          import_job_id: job.id,
          source_sheet: sessionsSheet.sheetName,
          entity_type: 'session',
          row_number: rowNumber,
          patient_id: linked.patientId,
          patient_code: record.patientCode,
          status: 'success',
          message: existing.data
            ? 'Séance créée avec nouveau numéro pour éviter l’écrasement.'
            : 'Séance créée.',
          payload: record.raw,
        })
      }

      successCount += 1
    } catch (error: any) {
      errorCount += 1
      rowLogs.push({
        import_job_id: job.id,
        source_sheet: sessionsSheet.sheetName,
        entity_type: 'session',
        row_number: rowNumber,
        patient_code: record.patientCode,
        status: 'error',
        message: error?.message ?? 'Erreur séance',
        payload: record.raw,
      })
    }
  }

  for (let index = 0; index < consentRecords.length; index += 1) {
    const record = consentRecords[index]
    const rowNumber = index + 2

    try {
      const resolution = consentDuplicates
        .map((d) => ({ ...d, key: resolutionKey('consents', d.rowNumber, d.reason) }))
        .find((d) => d.rowNumber === rowNumber && duplicateResolutions[d.key])

      if (resolution && duplicateResolutions[resolution.key] === 'skip') {
        warningCount += 1
        rowLogs.push({
          import_job_id: job.id,
          source_sheet: consentsSheet.sheetName,
          entity_type: 'consent',
          row_number: rowNumber,
          patient_code: record.patientCode,
          status: 'warning',
          message: 'Consentement ignoré par résolution assistée.',
          payload: record.raw,
        })
        continue
      }

      const linked =
        patientByCode.get(record.patientCode) ??
        (patientsForLinked ?? []).find((item: any) => item.code === record.patientCode)

      const patientId = linked?.patientId ?? linked?.id
      if (!patientId) {
        throw new Error('Patient lié introuvable pour le consentement.')
      }

      const existing = await db
        .from('patient_consents')
        .select('id')
        .eq('patient_id', patientId)
        .eq('consent_kind', record.consentKind)
        .maybeSingle()

      const payload = {
        patient_id: patientId,
        consent_kind: record.consentKind,
        status: record.status,
        recorded_at: record.recordedAt,
        expires_at: record.expiresAt,
        note: record.note,
        created_by: user.id,
      }

      if (existing.data && (!resolution || duplicateResolutions[resolution.key] !== 'create_new')) {
        const { error } = await db
          .from('patient_consents')
          .update(payload)
          .eq('id', existing.data.id)

        if (error) throw error
        updatedConsents += 1

        rowLogs.push({
          import_job_id: job.id,
          source_sheet: consentsSheet.sheetName,
          entity_type: 'consent',
          row_number: rowNumber,
          patient_id: patientId,
          patient_code: record.patientCode,
          status: 'success',
          message: 'Consentement mis à jour.',
          payload: record.raw,
        })
      } else {
        const insertPayload = existing.data ? { ...payload, consent_kind: `${record.consentKind}` } : payload
        const { error } = await db.from('patient_consents').insert(insertPayload)

        if (error) throw error
        createdConsents += 1

        rowLogs.push({
          import_job_id: job.id,
          source_sheet: consentsSheet.sheetName,
          entity_type: 'consent',
          row_number: rowNumber,
          patient_id: patientId,
          patient_code: record.patientCode,
          status: 'success',
          message: 'Consentement créé.',
          payload: record.raw,
        })
      }

      successCount += 1
    } catch (error: any) {
      errorCount += 1
      rowLogs.push({
        import_job_id: job.id,
        source_sheet: consentsSheet.sheetName,
        entity_type: 'consent',
        row_number: rowNumber,
        patient_code: record.patientCode,
        status: 'error',
        message: error?.message ?? 'Erreur consentement',
        payload: record.raw,
      })
    }
  }

  if (rowLogs.length) {
    await db.from('import_row_results').insert(rowLogs)
  }

  const summary = {
    successCount,
    errorCount,
    warningCount,
    createdPatients,
    updatedPatients,
    createdSessions,
    updatedSessions,
    createdConsents,
    updatedConsents,
    createdSnapshots,
    duplicateResolutions,
  }

  await db
    .from('import_jobs')
    .update({
      status: errorCount ? 'processed_with_errors' : 'processed',
      processed_at: new Date().toISOString(),
      success_count: successCount,
      error_count: errorCount,
      summary,
    })
    .eq('id', job.id)

  return NextResponse.json({
    ok: true,
    importJobId: job.id,
    summary,
  })
}