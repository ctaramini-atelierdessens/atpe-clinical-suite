type Variant =
  | 'automatic'
  | 'validated'
  | 'active'
  | 'draft'
  | 'archived'
  | 'priority_high'
  | 'priority_medium'
  | 'priority_low'
  | 'neutral'

type Props = {
  label: string
  variant?: Variant
}

function getClasses(variant: Variant) {
  switch (variant) {
    case 'automatic':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'validated':
      return 'border-green-200 bg-green-50 text-green-700'
    case 'active':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'draft':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'archived':
      return 'border-slate-200 bg-slate-100 text-slate-700'
    case 'priority_high':
      return 'border-red-200 bg-red-50 text-red-700'
    case 'priority_medium':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'priority_low':
      return 'border-green-200 bg-green-50 text-green-700'
    case 'neutral':
    default:
      return 'border-neutral-200 bg-neutral-50 text-neutral-700'
  }
}

export function ClinicalStatusBadge({
  label,
  variant = 'neutral',
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getClasses(
        variant,
      )}`}
    >
      {label}
    </span>
  )
}