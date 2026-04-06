import { cn } from '@/lib/utils'

export function KpiCard({
  title,
  value,
  hint,
  tone = 'default',
}: {
  title: string
  value: string | number
  hint?: string
  tone?: 'default' | 'danger' | 'success'
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <p
          className={cn(
            'text-3xl font-semibold tracking-tight',
            tone === 'danger' && 'text-rose-600',
            tone === 'success' && 'text-emerald-600',
          )}
        >
          {value}
        </p>
        {hint ? <p className="max-w-[12rem] text-right text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}
