'use client'

type SourceType =
  | 'database'
  | 'seed_fallback'
  | 'mixed'
  | 'unavailable'
  | 'unknown'

type Props = {
  source?: SourceType | string | null
  className?: string
  showLabel?: boolean
  title?: string
}

type SourceConfig = {
  label: string
  short: string
  className: string
}

function normalizeSource(source?: string | null): SourceType {
  switch (source) {
    case 'database':
    case 'seed_fallback':
    case 'mixed':
    case 'unavailable':
    case 'unknown':
      return source
    default:
      return 'unknown'
  }
}

function getSourceConfig(source: SourceType): SourceConfig {
  switch (source) {
    case 'database':
      return {
        label: 'Base de données',
        short: 'DB',
        className: 'border-green-200 bg-green-100 text-green-700',
      }

    case 'seed_fallback':
      return {
        label: 'Données de démonstration',
        short: 'Seed',
        className: 'border-amber-200 bg-amber-100 text-amber-700',
      }

    case 'mixed':
      return {
        label: 'Sources mixtes',
        short: 'Mix',
        className: 'border-blue-200 bg-blue-100 text-blue-700',
      }

    case 'unavailable':
      return {
        label: 'Indisponible',
        short: '—',
        className: 'border-slate-200 bg-slate-100 text-slate-500',
      }

    case 'unknown':
    default:
      return {
        label: 'Source inconnue',
        short: '?',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
      }
  }
}

export function PatientAtpeSourceBadge({
  source,
  className = '',
  showLabel = true,
  title,
}: Props) {
  const normalized = normalizeSource(source)
  const config = getSourceConfig(normalized)
  const tooltip = title ?? config.label

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${config.className} ${className}`}
      title={tooltip}
      aria-label={config.label}
    >
      <span className="font-semibold">{config.short}</span>
      {showLabel ? <span>{config.label}</span> : null}
    </span>
  )
}