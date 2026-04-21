import type { ATPETimelineItem } from '@/lib/atpe-knowledge/chronology'

type ATPEChronologyProps = {
  items: ATPETimelineItem[]
}

export function ATPEChronology({ items }: ATPEChronologyProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
            {index < items.length - 1 ? (
              <div className="mt-2 h-full w-px bg-slate-300" />
            ) : null}
          </div>

          <article className="mb-4 flex-1 rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {item.period}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{item.description}</p>
          </article>
        </div>
      ))}
    </div>
  )
}