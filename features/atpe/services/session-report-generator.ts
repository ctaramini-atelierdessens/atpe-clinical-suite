export function generateSessionReport(session: any) {
  const engagement = session.patient_engagement_level ?? 0
  const symbolisation = session.primary_symbolization ?? 0
  const containment = session.frame_containment ?? 0

  let interpretation = 'séance stable'

  if (engagement > 70 && symbolisation > 60) {
    interpretation = 'bonne mobilisation thérapeutique'
  } else if (engagement < 40) {
    interpretation = 'faible engagement nécessitant ajustement'
  }

  return `
Compte rendu de séance :

Engagement patient : ${engagement}/100
Symbolisation : ${symbolisation}/100
Containment : ${containment}/100

Analyse :
La séance montre une ${interpretation}.

Recommandation :
Adapter le cadre thérapeutique en fonction de la dynamique observée.
`
}