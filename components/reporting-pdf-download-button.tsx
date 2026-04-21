'use client'

export function ReportingPdfDownloadButton() {
  function handleOpenDirectionPdf() {
    window.open('/api/reporting/export', '_blank')
  }

  return (
    <button
      type="button"
      onClick={handleOpenDirectionPdf}
      className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
    >
      Télécharger le PDF direction
    </button>
  )
}