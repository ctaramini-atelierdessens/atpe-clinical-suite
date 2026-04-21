export function generateClinicalReport(patient: any, sessions: any[]) {
  const latest = sessions[0]

  return `
  RAPPORT CLINIQUE ATPE

  Patient : ${patient.code}
  Initiales : ${patient.initials}

  Dernier score global : ${latest?.global_score ?? '—'}

  Nombre de séances : ${sessions.length}

  --- ANALYSE ---
  Évolution observée : ${
    sessions.length >= 2
      ? 'Analyse en cours'
      : 'Données insuffisantes'
  }
  `
}