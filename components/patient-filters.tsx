
import Link from 'next/link'

export function PatientFilters({ q, status, mine, archived }: { q: string; status: string; mine: string; archived: string }) {
  return (
    <form className="card grid gap-3 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
      <input name="q" defaultValue={q} placeholder="Rechercher par code, initiales, référence..." className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring" />
      <select name="status" defaultValue={status} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring">
        <option value="all">Tous statuts</option>
        <option value="active">Actifs</option>
        <option value="paused">En pause</option>
        <option value="closed">Clos</option>
      </select>
      <select name="mine" defaultValue={mine} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring">
        <option value="all">Tous cliniciens</option>
        <option value="mine">Mes patients</option>
      </select>
      <select name="archived" defaultValue={archived} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none ring-brand-200 focus:ring">
        <option value="active">Dossiers actifs</option>
        <option value="all">Inclure archivés</option>
        <option value="only">Archivés uniquement</option>
      </select>
      <div className="flex gap-2">
        <button className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">Filtrer</button>
        <Link href="/patients" className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Réinitialiser</Link>
      </div>
    </form>
  )
}
