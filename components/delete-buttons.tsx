
import { softDeletePatientAction, softDeleteSessionAction } from '@/lib/atpe/actions'

export function SoftDeletePatientButton({ patientId }: { patientId: string }) {
  return (
    <form action={softDeletePatientAction} className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
      <input type="hidden" name="patient_id" value={patientId} />
      <label className="block text-sm font-medium text-rose-900">Archiver le patient</label>
      <textarea name="reason" className="mt-2 min-h-[96px] w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none ring-rose-100 focus:ring" placeholder="Motif de suppression logique / archivage" />
      <button className="mt-3 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white">Archiver le dossier</button>
    </form>
  )
}

export function SoftDeleteSessionButton({ patientId, sessionId }: { patientId: string; sessionId: string }) {
  return (
    <form action={softDeleteSessionAction} className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="session_id" value={sessionId} />
      <label className="block text-sm font-medium text-rose-900">Archiver la séance</label>
      <textarea name="reason" className="mt-2 min-h-[96px] w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none ring-rose-100 focus:ring" placeholder="Motif de suppression logique / archivage" />
      <button className="mt-3 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white">Archiver la séance</button>
    </form>
  )
}
