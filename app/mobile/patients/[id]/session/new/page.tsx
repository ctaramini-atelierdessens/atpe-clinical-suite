import Link from 'next/link'
import { createSessionAction } from '@/lib/atpe/actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MobileNewSessionPage({ params }: PageProps) {
  const { id } = await params

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Nouvelle séance</h1>
        <Link
          href={`/mobile/patients/${id}`}
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
        >
          Retour
        </Link>
      </div>

      <form
        action={createSessionAction}
        className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm"
      >
        <input type="hidden" name="patient_id" value={id} />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Numéro de séance
          </label>
          <input
            name="session_number"
            type="number"
            min={1}
            className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            placeholder="1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Émotion
            </label>
            <input
              name="emotion"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Corps
            </label>
            <input
              name="corps"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Conscience
            </label>
            <input
              name="conscience"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Dynamique
            </label>
            <input
              name="dynamique"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Symbolique
          </label>
          <input
            name="symbolique"
            type="number"
            min={0}
            max={100}
            className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Notes
          </label>
          <textarea
            name="notes"
            rows={5}
            className="w-full rounded-2xl border border-neutral-300 px-3 py-3 text-sm"
            placeholder="Observation rapide de séance"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-medium text-white"
        >
          Enregistrer la séance
        </button>
      </form>
    </main>
  )
}