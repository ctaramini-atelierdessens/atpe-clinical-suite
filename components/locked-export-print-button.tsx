'use client'

type Props = {
  className?: string
}

export function LockedExportPrintButton({ className }: Props) {
  function handlePrint() {
    window.print()
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={
        className ??
        'rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50'
      }
    >
      Imprimer
    </button>
  )
}