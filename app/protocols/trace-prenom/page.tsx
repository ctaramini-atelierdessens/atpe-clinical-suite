import { TracePrenomPanel } from '@/components/atpe/trace-prenom-panel'

export default function TracePrenomPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Trace-Prénom</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Protocole d’observation clinique centré sur l’inscription identitaire,
          l’engagement du geste, l’organisation du trait et certaines modalités
          de régulation.
        </p>
      </section>

      <TracePrenomPanel />
    </main>
  )
}