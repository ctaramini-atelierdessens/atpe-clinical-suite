import { avg } from '@/lib/utils'
import type { Database } from '@/types/database'

type Session = Database['public']['Tables']['sessions']['Row']

export function SessionTrend({ sessions }: { sessions: Session[] }) {
  const latest = sessions.slice(0, 8).reverse()
  const maxScore = 10
  const regulationAvg = avg(latest.map((item) => item.regulation_score)).toFixed(1)
  const engagementAvg = avg(latest.map((item) => item.engagement_score)).toFixed(1)

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Tendance des séances</h3>
          <p className="text-sm text-slate-500">Moyennes récentes — régulation {regulationAvg} / engagement {engagementAvg}</p>
        </div>
      </div>
      <div className="space-y-3">
        {latest.map((session) => (
          <div key={session.id}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Séance {session.session_number}</span>
              <span>{session.session_date}</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-slate-500">Régulation</div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(session.regulation_score / maxScore) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Engagement</div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(session.engagement_score / maxScore) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
