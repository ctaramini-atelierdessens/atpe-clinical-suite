import type { AtpeAdvancedRow, PatientRow } from '@/lib/patient-types'
import { analyzeLongitudinalComparison } from '@/lib/atpe-longitudinal'
import { buildProtocolPlanFromRow } from '@/lib/atpe-protocol'
import { analyzeSupervisionRow } from '@/lib/atpe-supervision'
import { analyzeGroupRow } from '@/lib/atpe-group'

function patientName(patient: PatientRow | null) {
  if (!patient) return 'Patient'
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first =
    typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last =
    typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const full = `${first} ${last}`.trim()
  return full || `Patient ${patient.id}`
}

function patientReference(patient: PatientRow | null) {
  if (!patient) return 'inconnu'
  const candidates = [patient.patient_code, patient.code, patient.reference, patient.id]
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return patient.id
}

function fmtDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleString('fr-FR')
}

export function buildTherapeuticSummaryExport(args: {
  patient: PatientRow | null
  currentRow: AtpeAdvancedRow | null
  previousRow: AtpeAdvancedRow | null
}) {
  const { patient, currentRow, previousRow } = args

  if (!currentRow) {
    return `SYNTHÈSE THÉRAPEUTIQUE STRUCTURÉE

Patient : ${patientName(patient)}
Référence : ${patientReference(patient)}

Aucune séance avancée disponible.`
  }

  const longitudinal = analyzeLongitudinalComparison({
    currentRow,
    previousRow,
    currentSessionId: currentRow.session_id,
    previousSessionId: previousRow?.session_id ?? null,
  })

  const protocol = buildProtocolPlanFromRow(currentRow)

  return [
    'SYNTHÈSE THÉRAPEUTIQUE STRUCTURÉE',
    '',
    `Patient : ${patientName(patient)}`,
    `Référence : ${patientReference(patient)}`,
    `Séance actuelle : ${currentRow.session_id}`,
    `Date : ${fmtDate(currentRow.created_at)}`,
    '',
    '1. Lecture clinique synthétique',
    longitudinal.narrative,
    '',
    '2. Hypothèses cliniques',
    longitudinal.hypotheses.length
      ? longitudinal.hypotheses.map((item) => `- ${item}`).join('\n')
      : '- Aucune hypothèse supplémentaire.',
    '',
    '3. Alertes',
    longitudinal.alerts.length
      ? longitudinal.alerts.map((item) => `- ${item}`).join('\n')
      : '- Aucune alerte majeure.',
    '',
    '4. Recommandations',
    longitudinal.recommendations.length
      ? longitudinal.recommendations.map((item) => `- ${item}`).join('\n')
      : '- Aucune recommandation calculée.',
    '',
    '5. Orientation séance suivante',
    `- Type de séance : ${protocol.nextSessionType}`,
    `- Intensité de cadre : ${protocol.frameIntensity}`,
    `- Verbalisation : ${protocol.verbalization}`,
  ].join('\n')
}

export function buildSupervisionExport(args: {
  patient: PatientRow | null
  currentRow: AtpeAdvancedRow | null
}) {
  const { patient, currentRow } = args

  if (!currentRow) {
    return `NOTE DE SUPERVISION

Patient : ${patientName(patient)}
Référence : ${patientReference(patient)}

Aucune séance avancée disponible.`
  }

  const analysis = analyzeSupervisionRow(currentRow)

  return [
    'NOTE DE SUPERVISION',
    '',
    `Patient : ${patientName(patient)}`,
    `Référence : ${patientReference(patient)}`,
    `Séance : ${currentRow.session_id}`,
    `Date : ${fmtDate(currentRow.created_at)}`,
    '',
    '1. Éprouvés thérapeutiques repérés',
    analysis.therapistExperiences.length
      ? analysis.therapistExperiences.map((item) => `- ${item}`).join('\n')
      : '- Aucun éprouvé marqué renseigné.',
    '',
    '2. Sens cliniques probables',
    analysis.structuredReview.probableClinicalMeaning.length
      ? analysis.structuredReview.probableClinicalMeaning
          .map((item) => `- ${item}`)
          .join('\n')
      : '- Pas d’hypothèse supplémentaire.',
    '',
    '3. Points de prudence',
    analysis.structuredReview.cautionPoints.length
      ? analysis.structuredReview.cautionPoints.map((item) => `- ${item}`).join('\n')
      : '- Aucun point spécifique.',
    '',
    '4. Axes de supervision',
    analysis.structuredReview.supervisionAxes.length
      ? analysis.structuredReview.supervisionAxes.map((item) => `- ${item}`).join('\n')
      : '- Aucun axe spécifique.',
    '',
    '5. Note suggérée',
    analysis.suggestedNote,
    '',
    '6. Notes contre-transférentielles saisies',
    currentRow.therapist_countertransference_notes || 'Aucune note saisie.',
  ].join('\n')
}

export function buildLongitudinalExport(args: {
  patient: PatientRow | null
  currentRow: AtpeAdvancedRow | null
  previousRow: AtpeAdvancedRow | null
}) {
  const { patient, currentRow, previousRow } = args

  if (!currentRow) {
    return `SYNTHÈSE LONGITUDINALE

Patient : ${patientName(patient)}
Référence : ${patientReference(patient)}

Aucune séance avancée disponible.`
  }

  const longitudinal = analyzeLongitudinalComparison({
    currentRow,
    previousRow,
    currentSessionId: currentRow.session_id,
    previousSessionId: previousRow?.session_id ?? null,
  })

  return [
    'SYNTHÈSE LONGITUDINALE',
    '',
    `Patient : ${patientName(patient)}`,
    `Référence : ${patientReference(patient)}`,
    `Séance actuelle : ${currentRow.session_id}`,
    `Séance précédente : ${previousRow?.session_id ?? 'Aucune'}`,
    '',
    '1. Narrative',
    longitudinal.narrative,
    '',
    '2. Drapeaux automatiques',
    longitudinal.flags.length
      ? longitudinal.flags
          .map((flag) => `- [${flag.level}] ${flag.title} : ${flag.description}`)
          .join('\n')
      : '- Aucun drapeau.',
    '',
    '3. Écarts',
    `- Cadre : ${
      longitudinal.deltas.frameContainment
        ? longitudinal.deltas.frameContainment.delta
        : 'N/A'
    }`,
    `- Engagement corporel : ${
      longitudinal.deltas.bodilyEngagement
        ? longitudinal.deltas.bodilyEngagement.delta
        : 'N/A'
    }`,
    `- Symbolisation primaire : ${
      longitudinal.deltas.primarySymbolization
        ? longitudinal.deltas.primarySymbolization.delta
        : 'N/A'
    }`,
    `- Symbolisation secondaire : ${
      longitudinal.deltas.secondarySymbolization
        ? longitudinal.deltas.secondarySymbolization.delta
        : 'N/A'
    }`,
    `- Relationnel : ${
      longitudinal.deltas.relationalAvailability
        ? longitudinal.deltas.relationalAvailability.delta
        : 'N/A'
    }`,
    `- Créativité : ${
      longitudinal.deltas.creativeMobility
        ? longitudinal.deltas.creativeMobility.delta
        : 'N/A'
    }`,
    `- Projectif : ${
      longitudinal.deltas.projectiveIntensity
        ? longitudinal.deltas.projectiveIntensity.delta
        : 'N/A'
    }`,
    `- Contenance groupale : ${
      longitudinal.deltas.groupContainment
        ? longitudinal.deltas.groupContainment.delta
        : 'N/A'
    }`,
  ].join('\n')
}

export function buildProtocolExport(args: {
  patient: PatientRow | null
  currentRow: AtpeAdvancedRow | null
}) {
  const { patient, currentRow } = args

  if (!currentRow) {
    return `FICHE PROTOCOLE SÉANCE SUIVANTE

Patient : ${patientName(patient)}
Référence : ${patientReference(patient)}

Aucune séance avancée disponible.`
  }

  const plan = buildProtocolPlanFromRow(currentRow)

  return [
    'FICHE PROTOCOLE SÉANCE SUIVANTE',
    '',
    `Patient : ${patientName(patient)}`,
    `Référence : ${patientReference(patient)}`,
    `Séance source : ${currentRow.session_id}`,
    '',
    '1. Décisions cliniques',
    `- Type de séance suivante : ${plan.nextSessionType}`,
    `- Intensité de cadre : ${plan.frameIntensity}`,
    `- Verbalisation conseillée : ${plan.verbalization}`,
    '',
    '2. Recommandations de médium',
    ...plan.mediumRecommendations.map(
      (item) => `- ${item.label} : ${item.reason}`,
    ),
    '',
    '3. Posture thérapeutique',
    ...plan.therapistPosture.map((item) => `- ${item}`),
    '',
    '4. Protocole ATPE automatique',
    `- Attitude intérieure : ${plan.atpeProtocol.attitudeInterieure}`,
    `- Création : ${plan.atpeProtocol.creation}`,
    `- Dialogue avec l’œuvre : ${plan.atpeProtocol.dialogueOeuvre}`,
    `- Partage : ${plan.atpeProtocol.partage}`,
    '',
    '5. Narrative',
    plan.narrative,
  ].join('\n')
}

export function buildGroupSummaryExport(args: {
  patient: PatientRow | null
  currentRow: AtpeAdvancedRow | null
}) {
  const { patient, currentRow } = args

  if (!currentRow || currentRow.format !== 'group') {
    return `SYNTHÈSE DE GROUPE

Patient : ${patientName(patient)}
Référence : ${patientReference(patient)}

Aucune séance de groupe disponible.`
  }

  const group = analyzeGroupRow(currentRow)

  return [
    'SYNTHÈSE DE GROUPE',
    '',
    `Patient / point d’entrée : ${patientName(patient)}`,
    `Référence : ${patientReference(patient)}`,
    `Séance : ${currentRow.session_id}`,
    '',
    '1. Session summary',
    group.sessionSummary,
    '',
    '2. Lecture intersubjective',
    group.narrative,
    '',
    '3. Processus probables',
    ...group.probableProcesses.map((item) => `- ${item}`),
    '',
    '4. Restitution groupale détoxifiée',
    `- Possible : ${group.detoxifiedReturn.possible ? 'oui' : 'non'}`,
    `- Justification : ${group.detoxifiedReturn.rationale}`,
    `- Recommandation : ${group.detoxifiedReturn.recommendation}`,
  ].join('\n')
}