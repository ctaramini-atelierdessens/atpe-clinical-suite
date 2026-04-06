import { ProgressBar } from '@/components/progress-bar'
import { percent } from '@/lib/utils'
import type { Database } from '@/types/database'

type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']

export function ChecklistBoard({ items }: { items: ChecklistItem[] }) {
  const phases = ['0-30', '30-60', '60-90'] as const

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {phases.map((phase) => {
        const phaseItems = items.filter((item) => item.phase === phase)
        const done = phaseItems.filter((item) => item.status === 'Validé').length
        const progress = percent(done, phaseItems.length)

        return (
          <section key={phase} className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Phase {phase} jours</h3>
                <p className="text-sm text-slate-500">{done}/{phaseItems.length} tâches validées</p>
              </div>
              <span className="badge bg-brand-100 text-brand-800">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
            <div className="mt-4 space-y-3">
              {phaseItems.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{item.task}</p>
                    <span className="badge bg-slate-100 text-slate-700">{item.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.workstream}</p>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
