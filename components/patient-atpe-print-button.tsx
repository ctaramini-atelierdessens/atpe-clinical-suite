import Link from 'next/link'

type PatientAtpePrintButtonProps = {
  patientId: string
  className?: string
  label?: string
}

export function PatientAtpePrintButton({
  patientId,
  className = '',
  label = 'Version impression / PDF',
}: PatientAtpePrintButtonProps) {
  return (
    <Link
      href={`/patients/${patientId}/atpe/print`}
      target="_blank"
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${className}`}
    >
      {label}
    </Link>
  )
}