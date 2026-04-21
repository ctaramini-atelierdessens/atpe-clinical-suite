'use client'

type SourceType = 'database' | 'seed_fallback' | 'unknown'

type Props = {
  source?: SourceType | string | null
  className?: string
  showLabel?: boolean
}

function getSourceConfig(source: SourceType) {
  switch (source) {
    case 'database':
      return {
        label: 'Base de données',
        short: 'DB',
        className: 'bg-green-100 text-green-700 border-green-200',
      }

    case 'seed_fallback':
      return {
        label: 'Données seed',
        short: 'Seed',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      }

    default:
      return {
        label: 'Source inconnue',
        short: '?',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      }
  }
}

export function PatientAtpeSourceBadge({
  source,
  className = '',
  showLabel = true,
}: Props) {
  const normalized: SourceType =
    source === 'database' || source === 'seed_fallback'
      ? source
      : 'unknown'

  const config = getSourceConfig(normalized)

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${config.className} ${className}`}
      title={config.label}
    >
      <span className="font-semibold">{config.short}</span>
      {showLabel ? <span>{config.label}</span> : null}
    </span>
  )
}