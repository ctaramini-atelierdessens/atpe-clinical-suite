export type LongitudinalPhase =
  | 'installation'
  | 'mobilisation'
  | 'pivot'
  | 'consolidation'
  | undefined

export function safeText(
  value: string | null | undefined,
  fallback = '—'
): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : fallback
}

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

export function safeNumber(
  value: number | null | undefined,
  fallback = '—'
): string {
  return typeof value === 'number' && !Number.isNaN(value)
    ? String(value)
    : fallback
}

export function safeBoolean(value: boolean | null | undefined): boolean {
  return value === true
}

export function booleanLabel(value: boolean | null | undefined): string {
  if (value === true) return 'Oui'
  if (value === false) return 'Non'
  return '—'
}

export function clampPercent(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date)
}

export function statusLabel(value: string | null | undefined): string {
  if (!value) return '—'

  switch (value) {
    case 'active':
      return 'Actif'
    case 'archived':
      return 'Archivé'
    default:
      return value
  }
}

export function phaseLabel(value: string | null | undefined): string {
  switch (value) {
    case 'attitude_interieure':
      return 'Attitude intérieure'
    case 'creation':
      return 'Création'
    case 'dialogue_oeuvre':
      return 'Dialogue avec l’œuvre'
    case 'partage':
      return 'Partage'
    default:
      return '—'
  }
}

export function longitudinalPhaseLabel(value: LongitudinalPhase): string {
  switch (value) {
    case 'installation':
      return 'Installation'
    case 'mobilisation':
      return 'Mobilisation'
    case 'pivot':
      return 'Pivot'
    case 'consolidation':
      return 'Consolidation'
    default:
      return '—'
  }
}

export function longitudinalPhaseClass(value: LongitudinalPhase): string {
  switch (value) {
    case 'installation':
      return 'bg-slate-100 text-slate-800'
    case 'mobilisation':
      return 'bg-blue-100 text-blue-800'
    case 'pivot':
      return 'bg-violet-100 text-violet-800'
    case 'consolidation':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function scoreLevel(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'

  if (value >= 80) return 'Élevé'
  if (value >= 60) return 'Bon'
  if (value >= 40) return 'Modéré'
  if (value >= 20) return 'Faible'
  return 'Très faible'
}

export function truncateText(
  value: string | null | undefined,
  maxLength = 140,
  fallback = '—'
): string {
  const text = safeText(value, '')
  if (!text) return fallback
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}