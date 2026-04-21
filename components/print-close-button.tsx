'use client'

type Props = {
    className?: string
}

export function PrintCloseButton({ className }: Props) {
    function handleClose() {
        window.close()
    }

    return (
        <button
            type="button"
            onClick={handleClose}
            className={
                className ??
                'rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50'
            }
        >
            Fermer
        </button>
    )
}