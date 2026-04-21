import {
  AtpeSessionVersionRecord,
  compareVersions,
  summarizeVersionDiff,
} from '@/lib/atpe-versioning'

type PatientAtpeVersionCompareProps = {
  baseVersion: AtpeSessionVersionRecord | null
  targetVersion: AtpeSessionVersionRecord | null
  className?: string
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function deltaLabel(value: number) {
  if (value > 0) return `+${value}`
  return `${value}`
}

export function PatientAtpeVersionCompare({
  baseVersion,
  targetVersion,
  className = '',
}: PatientAtpeVersionCompareProps) {
  if (!baseVersion || !targetVersion) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
        <h2 className="text-lg font-semibold text-slate-900">Comparaison de versions</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sélectionne une version de base et une version cible dans l’historique pour afficher la comparaison.
        </p>
      </section>
    )
  }

  const diff = compareVersions(baseVersion.snapshot, targetVersion.snapshot)
  const diffSummary = summarizeVersionDiff(diff)

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Comparaison de versions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Comparaison entre V{baseVersion.version_number} et V{targetVersion.version_number}
        </p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Version de base
          </h3>
          <p className="text-sm text-slate-700">
            <strong>V{baseVersion.version_number}</strong> — {formatDate(baseVersion.created_at)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Profil : <strong>{baseVersion.profile ?? 'Non renseigné'}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Score :{' '}
            <strong>
              {typeof baseVersion.composite_score === 'number'
                ? `${Math.round(baseVersion.composite_score)}/100`
                : 'Non renseigné'}
            </strong>
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Version cible
          </h3>
          <p className="text-sm text-slate-700">
            <strong>V{targetVersion.version_number}</strong> — {formatDate(targetVersion.created_at)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Profil : <strong>{targetVersion.profile ?? 'Non renseigné'}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Score :{' '}
            <strong>
              {typeof targetVersion.composite_score === 'number'
                ? `${Math.round(targetVersion.composite_score)}/100`
                : 'Non renseigné'}
            </strong>
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Résumé des écarts
        </h3>
        <ul className="space-y-1 text-sm text-slate-700">
          {diffSummary.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 text-slate-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Variations structurées
          </h3>

          <ul className="space-y-1 text-sm text-slate-700">
            <li>Score composite : <strong>{deltaLabel(diff.compositeDelta)}</strong></li>
            <li>Changement de profil : <strong>{diff.profileChanged ? 'Oui' : 'Non'}</strong></li>
            <li>
              Changement de tendance prédictive :{' '}
              <strong>{diff.predictionChanged ? 'Oui' : 'Non'}</strong>
            </li>
            <li>Résumé clinique modifié : <strong>{diff.summaryChanged ? 'Oui' : 'Non'}</strong></li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Deltas par axe
          </h3>

          <ul className="space-y-1 text-sm text-slate-700">
            <li>Processus interne : <strong>{deltaLabel(diff.axisDeltas.internalProcess)}</strong></li>
            <li>Processus expressif : <strong>{deltaLabel(diff.axisDeltas.expressiveProcess)}</strong></li>
            <li>Processus relationnel : <strong>{deltaLabel(diff.axisDeltas.relationalProcess)}</strong></li>
            <li>Pluriexpressionnalité : <strong>{deltaLabel(diff.axisDeltas.pluriexpressivity)}</strong></li>
            <li>
              Indicateurs institutionnels :{' '}
              <strong>{deltaLabel(diff.axisDeltas.institutionalIndicators)}</strong>
            </li>
            <li>
              Sensoriel & symbolique : <strong>{deltaLabel(diff.axisDeltas.sensorialSymbolic)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}