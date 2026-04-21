import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import {
  computeAtpeExpertResult,
  getProfileLabel,
  getTrendLabel,
} from '@/lib/atpe-expert'
import { getClinicalAlerts } from '@/lib/atpe-clinical-insights'
import { getTherapeuticRecommendations } from '@/lib/atpe-therapeutic-recommendations'
import {
  buildPatientClinicalProfile,
  type PatientInitialAssessmentData,
} from '@/lib/atpe-clinical-profile'

type SessionLike = {
  id: string
  session_number: number
  session_date?: string | null
  mediation_type?: string | null
  frame_quality?: string | null
  emotional_score: number
  body_score: number
  awareness_score: number
  dynamic_score: number
  symbolic_score: number
  regulation_score: number
  engagement_score: number
  clinical_summary?: string | null
  note?: string | null
  therapist_hypothesis?: string | null
}

type PatientLike = {
  code?: string | null
  status?: string | null
  initials?: string | null
  first_contact_on?: string | null
}

type EpisodeLike = {
  episode_label?: string | null
  status?: string | null
  therapeutic_frame?: string | null
  clinical_indication?: string | null
  objectives_summary?: string | null
}

type PatientClinicalPdfProps = {
  patient: PatientLike
  episode?: EpisodeLike | null
  sessions: SessionLike[]
  initialAssessment?: PatientInitialAssessmentData | null
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    lineHeight: 1.4,
  },
  cover: {
    paddingTop: 80,
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#475569',
  },
  section: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  paragraph: {
    marginTop: 6,
  },
  sessionBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sessionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    justifyContent: 'space-between',
  },
  scoreItem: {
    width: '24%',
    marginBottom: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  small: {
    fontSize: 8,
    color: '#64748b',
  },
  bullet: {
    marginTop: 6,
    paddingLeft: 8,
  },
  bulletItem: {
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
})

function buildCurrentResult(sessions: SessionLike[]) {
  if (!sessions.length) return null

  const current = sessions[sessions.length - 1]
  const previous = sessions.length > 1 ? sessions[sessions.length - 2] : null

  return computeAtpeExpertResult(
    {
      emotion: current.emotional_score,
      corps: current.body_score,
      conscience: current.awareness_score,
      dynamique: current.dynamic_score,
      symbolique: current.symbolic_score,
      regulation: current.regulation_score,
      engagement: current.engagement_score,
    },
    previous
      ? {
          emotion: previous.emotional_score,
          corps: previous.body_score,
          conscience: previous.awareness_score,
          dynamique: previous.dynamic_score,
          symbolique: previous.symbolic_score,
          regulation: previous.regulation_score,
          engagement: previous.engagement_score,
        }
      : null
  )
}

function levelLabel(level: 'low' | 'medium' | 'high') {
  if (level === 'high') return 'Alerte élevée'
  if (level === 'medium') return 'Vigilance'
  return 'Information clinique'
}

function priorityLabel(priority: 'low' | 'medium' | 'high') {
  if (priority === 'high') return 'Priorité haute'
  if (priority === 'medium') return 'Priorité moyenne'
  return 'Priorité basse'
}

function yesNo(value: boolean) {
  return value ? 'Oui' : 'Non'
}

export function PatientClinicalPdf({
  patient,
  episode,
  sessions,
  initialAssessment = null,
}: PatientClinicalPdfProps) {
  const currentResult = buildCurrentResult(sessions)
  const alerts = getClinicalAlerts(sessions)
  const recommendationBundle = getTherapeuticRecommendations(sessions)
  const currentSession = sessions.length ? sessions[sessions.length - 1] : null
  const clinicalProfile = buildPatientClinicalProfile(initialAssessment)

  return (
    <Document
      title={`Synthèse clinique ${patient.code ?? 'patient'}`}
      author="ATPE Clinical Suite"
      subject="Export PDF clinique avancé"
      creator="ATPE Clinical Suite"
      producer="ATPE Clinical Suite"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>Synthèse clinique avancée</Text>
          <Text style={styles.coverSubtitle}>Dossier : {patient.code ?? '—'}</Text>
          <Text style={styles.coverSubtitle}>Statut : {patient.status ?? '—'}</Text>
          <Text style={styles.coverSubtitle}>Initiales : {patient.initials ?? '—'}</Text>
          <Text style={styles.coverSubtitle}>
            Premier contact : {patient.first_contact_on ?? '—'}
          </Text>
          <Text style={styles.coverSubtitle}>Nombre de séances : {sessions.length}</Text>
          <Text style={styles.coverSubtitle}>
            Dernière séance : {currentSession ? `S${currentSession.session_number}` : '—'}
            {currentSession?.session_date ? ` · ${currentSession.session_date}` : ''}
          </Text>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Export clinique avancé · Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Synthèse clinique actuelle</Text>
          <Text style={styles.subtitle}>
            Dossier : {patient.code ?? '—'} · Statut : {patient.status ?? '—'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicateurs globaux</Text>

          {currentResult ? (
            <>
              <View style={styles.row}>
                <View style={styles.card}>
                  <Text style={styles.label}>Score global</Text>
                  <Text style={styles.value}>{currentResult.scoreGlobal ?? '—'}/100</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Niveau</Text>
                  <Text style={styles.value}>{currentResult.niveau}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Tendance</Text>
                  <Text style={styles.value}>{getTrendLabel(currentResult.tendance)}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Profil</Text>
                  <Text style={styles.value}>{getProfileLabel(currentResult.profil)}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Pôle régulation</Text>
                  <Text style={styles.value}>{currentResult.poleRegulation ?? '—'}/100</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Pôle ancrage</Text>
                  <Text style={styles.value}>{currentResult.poleAncrage ?? '—'}/100</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Pôle élaboration</Text>
                  <Text style={styles.value}>{currentResult.poleElaboration ?? '—'}/100</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.label}>Dernière séance</Text>
                  <Text style={styles.value}>
                    {currentSession ? `S${currentSession.session_number}` : '—'}
                  </Text>
                </View>
              </View>

              <Text style={styles.paragraph}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Synthèse automatique : </Text>
                {currentResult.synthese}
              </Text>
            </>
          ) : (
            <Text>Aucune séance disponible pour calculer la synthèse.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil clinique automatique</Text>

          <Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Statut : </Text>
            {clinicalProfile.hasAssessment
              ? 'Bilan initial actif'
              : 'Aucun bilan initial enregistré'}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Résumé : </Text>
            {clinicalProfile.summary}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Axes actifs : </Text>
            {clinicalProfile.activeAxes.length
              ? clinicalProfile.activeAxes.join(' · ')
              : '—'}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Focus cliniques : </Text>
            {clinicalProfile.focusAreas.length
              ? clinicalProfile.focusAreas.join(' · ')
              : '—'}
          </Text>

          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={styles.card}>
              <Text style={styles.label}>Régulation</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.regulationPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Relationnel</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.relationalPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Sensoriel</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.sensoryPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Expressif</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.expressivePriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Symbolique</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.symbolicPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Autonomie</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.autonomyPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Participation</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.participationPriority)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Intermodalité</Text>
              <Text style={styles.value}>{yesNo(clinicalProfile.priorities.intermodalPriority)}</Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Objectifs sélectionnés : </Text>
          </Text>

          {clinicalProfile.selectedObjectives.length ? (
            <View style={styles.bullet}>
              {clinicalProfile.selectedObjectives.map((item, index) => (
                <Text
                  key={`${item.axisKey}-${item.rowKey}-${index}`}
                  style={styles.bulletItem}
                >
                  • {item.objective}
                </Text>
              ))}
            </View>
          ) : (
            <Text>—</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Épisode thérapeutique</Text>
          <Text>Libellé : {episode?.episode_label ?? '—'}</Text>
          <Text>Statut : {episode?.status ?? '—'}</Text>
          <Text>Cadre thérapeutique : {episode?.therapeutic_frame ?? '—'}</Text>
          <Text>Indication clinique : {episode?.clinical_indication ?? '—'}</Text>
          <Text>Résumé objectifs : {episode?.objectives_summary ?? '—'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes cliniques</Text>
          {alerts.length ? (
            <View style={styles.bullet}>
              {alerts.map((alert) => (
                <Text key={alert.key} style={styles.bulletItem}>
                  • {alert.title} — {levelLabel(alert.level)}. {alert.message}
                </Text>
              ))}
            </View>
          ) : (
            <Text>Aucune alerte clinique particulière détectée.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations thérapeutiques</Text>
          <Text>{recommendationBundle.summary}</Text>

          {recommendationBundle.recommendations.length ? (
            <View style={styles.bullet}>
              {recommendationBundle.recommendations.map((rec) => (
                <View key={rec.key} style={{ marginBottom: 8 }}>
                  <Text style={styles.bulletItem}>
                    • {rec.title} — {priorityLabel(rec.priority)}
                  </Text>
                  <Text>Justification : {rec.rationale}</Text>
                  <Text>Orientation : {rec.action}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text>Aucune recommandation disponible.</Text>
          )}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Export clinique avancé · Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>Historique clinique des séances</Text>
          <Text style={styles.subtitle}>
            Lecture longitudinale séance par séance
          </Text>
        </View>

        <View style={styles.section}>
          {sessions.length ? (
            sessions.map((session, index) => {
              const previous = index > 0 ? sessions[index - 1] : null

              const result = computeAtpeExpertResult(
                {
                  emotion: session.emotional_score,
                  corps: session.body_score,
                  conscience: session.awareness_score,
                  dynamique: session.dynamic_score,
                  symbolique: session.symbolic_score,
                  regulation: session.regulation_score,
                  engagement: session.engagement_score,
                },
                previous
                  ? {
                      emotion: previous.emotional_score,
                      corps: previous.body_score,
                      conscience: previous.awareness_score,
                      dynamique: previous.dynamic_score,
                      symbolique: previous.symbolic_score,
                      regulation: previous.regulation_score,
                      engagement: previous.engagement_score,
                    }
                  : null
              )

              return (
                <View key={session.id} style={styles.sessionBlock}>
                  <Text style={styles.sessionTitle}>
                    Séance {session.session_number} · {session.session_date ?? '—'}
                  </Text>

                  <Text>
                    Médiation : {session.mediation_type ?? '—'} · Cadre : {session.frame_quality ?? '—'}
                  </Text>

                  <View style={styles.scoreGrid}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Émotion</Text>
                      <Text>{session.emotional_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Corps</Text>
                      <Text>{session.body_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Conscience</Text>
                      <Text>{session.awareness_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Dynamique</Text>
                      <Text>{session.dynamic_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Symbolique</Text>
                      <Text>{session.symbolic_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Régulation</Text>
                      <Text>{session.regulation_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Engagement</Text>
                      <Text>{session.engagement_score}/10</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.small}>Score global</Text>
                      <Text>{result.scoreGlobal ?? '—'}/100</Text>
                    </View>
                  </View>

                  <Text style={styles.paragraph}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>Résumé clinique : </Text>
                    {session.clinical_summary ?? session.note ?? '—'}
                  </Text>

                  {session.therapist_hypothesis ? (
                    <Text style={styles.paragraph}>
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>Hypothèse thérapeutique : </Text>
                      {session.therapist_hypothesis}
                    </Text>
                  ) : null}

                  <Text style={styles.paragraph}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>Lecture automatique : </Text>
                    {result.synthese}
                  </Text>
                </View>
              )
            })
          ) : (
            <Text>Aucune séance enregistrée.</Text>
          )}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Export clinique avancé · Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}