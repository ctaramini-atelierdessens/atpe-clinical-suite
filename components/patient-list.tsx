
import Link from 'next/link'
import type { Database } from '@/types/database'

type Patient = Database['public']['Tables']['patients']['Row']

export function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Code</th>
            <th className="px-5 py-3 font-medium">Initiales</th>
            <th className="px-5 py-3 font-medium">Statut</th>
            <th className="px-5 py-3 font-medium">Référence</th>
            <th className="px-5 py-3 font-medium">Premier contact</th>
            <th className="px-5 py-3 font-medium">Archivage</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-t border-slate-100">
              <td className="px-5 py-4 font-medium text-slate-900">{patient.code}</td>
              <td className="px-5 py-4 text-slate-600">{patient.initials ?? '—'}</td>
              <td className="px-5 py-4"><span className="badge bg-slate-100 text-slate-700">{patient.status}</span></td>
              <td className="px-5 py-4 text-slate-600">{patient.case_reference ?? '—'}</td>
              <td className="px-5 py-4 text-slate-600">{patient.first_contact_on ?? '—'}</td>
              <td className="px-5 py-4 text-slate-600">{patient.deleted_at ? new Date(patient.deleted_at).toLocaleDateString('fr-FR') : 'Actif'}</td>
              <td className="px-5 py-4 text-right">
                <Link href={`/patients/${patient.id}`} className="rounded-2xl border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700">Ouvrir</Link>
              </td>
            </tr>
          ))}
          {!patients.length ? (
            <tr>
              <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Aucun patient ne correspond à ces filtres.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
