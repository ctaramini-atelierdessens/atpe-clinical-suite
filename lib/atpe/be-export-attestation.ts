export function buildExportAttestation({
  versionLabel,
  patientCode,
  sessionCount,
  exportedAt,
  payloadHash,
  previousHash,
  issuerName,
  issuerRole,
}: {
  versionLabel: string
  patientCode: string
  sessionCount: number
  exportedAt: string
  payloadHash: string
  previousHash?: string | null
  issuerName: string
  issuerRole: string
}) {
  return [
    'ATTESTATION D’INTÉGRITÉ CLINIQUE',
    '',
    `Version : ${versionLabel}`,
    `Patient : ${patientCode}`,
    `Nombre de séances figées : ${sessionCount}`,
    `Date d’émission : ${exportedAt}`,
    `Signataire clinique : ${issuerName}`,
    `Fonction : ${issuerRole}`,
    '',
    'Le présent export constitue une version figée du dossier clinique tel qu’il existait à la date d’émission.',
    'Toute modification du contenu entraînerait une rupture de l’empreinte cryptographique calculée sur le snapshot canonique.',
    '',
    `Empreinte SHA-256 : ${payloadHash}`,
    `Empreinte précédente : ${previousHash ?? 'Aucune'}`,
    '',
    'Ce document atteste l’intégrité technique du contenu exporté et la traçabilité de son émission.',
    'Il ne constitue pas, à lui seul, une signature électronique qualifiée au sens eIDAS.',
  ].join('\n')
}