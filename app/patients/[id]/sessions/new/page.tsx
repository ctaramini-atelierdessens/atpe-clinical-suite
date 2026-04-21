import Link from 'next/link'
import { createSessionAction } from '@/lib/atpe/actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewSessionPage({ params }: PageProps) {
  const { id } = await params

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nouvelle séance</h1>
          <p className="text-sm text-neutral-600">
            Saisie simple des scores ATPE pour alimenter automatiquement le
            profil clinique.
          </p>
        </div>

        <Link
          href={`/patients/${id}`}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
        >
          Retour au patient
        </Link>
      </div>

      <form
        action={createSessionAction}
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="patient_id" value={id} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="session_number"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Numéro de séance
            </label>
            <input
              id="session_number"
              name="session_number"
              type="number"
              min={1}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="1"
            />
          </div>

          <div>
            <label
              htmlFor="global_score"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Score global (optionnel)
            </label>
            <input
              id="global_score"
              name="global_score"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Calculé automatiquement si vide"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="emotion"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Émotion
            </label>
            <input
              id="emotion"
              name="emotion"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="0 à 100"
            />
          </div>

          <div>
            <label
              htmlFor="corps"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Corps
            </label>
            <input
              id="corps"
              name="corps"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="0 à 100"
            />
          </div>

          <div>
            <label
              htmlFor="conscience"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Conscience
            </label>
            <input
              id="conscience"
              name="conscience"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="0 à 100"
            />
          </div>

          <div>
            <label
              htmlFor="dynamique"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Dynamique
            </label>
            <input
              id="dynamique"
              name="dynamique"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="0 à 100"
            />
          </div>

          <div>
            <label
              htmlFor="symbolique"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Symbolique
            </label>
            <input
              id="symbolique"
              name="symbolique"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              placeholder="0 à 100"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="fatigue"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Fatigue
            </label>
            <select
              id="fatigue"
              name="fatigue"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="forte">Forte</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="attention"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Attention
            </label>
            <select
              id="attention"
              name="attention"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="stable">Stable</option>
              <option value="fluctuante">Fluctuante</option>
              <option value="basse">Basse</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="engagement_relationnel"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Engagement relationnel
            </label>
            <select
              id="engagement_relationnel"
              name="engagement_relationnel"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="faible">Faible</option>
              <option value="moyen">Moyen</option>
              <option value="bon">Bon</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="verbalisation"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Verbalisation
            </label>
            <select
              id="verbalisation"
              name="verbalisation"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="bonne">Bonne</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Observations de séance"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Enregistrer la séance
          </button>
        </div>
      </form>
    </main>
  )
}