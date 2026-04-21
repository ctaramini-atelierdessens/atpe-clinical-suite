type Lang = 'fr' | 'en'

const dict = {
  fr: {
    reportTitle: 'RAPPORT CLINIQUE ATPE',
    synthesis: 'SYNTHÈSE CLINIQUE',
    prediction: 'PRÉDICTION CLINIQUE',
    recommendations: 'RECOMMANDATIONS THÉRAPEUTIQUES',
    mdph: 'SYNTHÈSE MDPH',
    sessions: 'HISTORIQUE DES SÉANCES',
    score: 'Score',
    trend: 'Tendance',
    risk: 'Risque',
    label: 'Lecture',
    relapse: 'Rechute',
  },
  en: {
    reportTitle: 'ATPE CLINICAL REPORT',
    synthesis: 'CLINICAL SUMMARY',
    prediction: 'PREDICTION',
    recommendations: 'THERAPEUTIC RECOMMENDATIONS',
    mdph: 'SUMMARY',
    sessions: 'SESSIONS HISTORY',
    score: 'Score',
    trend: 'Trend',
    risk: 'Risk',
    label: 'Clinical interpretation',
    relapse: 'Relapse',
  },
}

export function t(key: keyof typeof dict['fr'], lang: Lang = 'fr') {
  return dict[lang][key] ?? key
}