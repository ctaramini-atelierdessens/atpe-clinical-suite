import type { Database } from '@/types/database'

type RiskItem = Database['public']['Tables']['risk_items']['Row']

export function RiskTable({ items }: { items: RiskItem[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold">Risques principaux</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Risque</th>
              <th className="px-5 py-3 font-medium">Prob.</th>
              <th className="px-5 py-3 font-medium">Gravité</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Mesure</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 align-top">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.impact ? <p className="mt-1 text-xs text-slate-500">{item.impact}</p> : null}
                </td>
                <td className="px-5 py-3">{item.probability}/5</td>
                <td className="px-5 py-3">{item.severity}/5</td>
                <td className="px-5 py-3">{item.status}</td>
                <td className="px-5 py-3 text-slate-600">{item.mitigation ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
