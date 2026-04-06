
import Link from 'next/link'

export function ExportButtons({ patientId, disabled }: { patientId: string; disabled?: boolean }) {
  const classes = disabled
    ? 'rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed'
    : 'rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700'

  if (disabled) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className={classes}>Export CSV</span>
        <span className={classes}>Export PDF</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/patients/${patientId}/export/csv`} className={classes}>Export CSV</Link>
      <Link href={`/patients/${patientId}/export/pdf`} className={classes}>Export PDF</Link>
    </div>
  )
}
