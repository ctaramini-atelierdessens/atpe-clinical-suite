import Link from 'next/link'
import { ATPE_PROTOCOLS } from '@/lib/atpe/protocol-catalog'

function categoryLabel(category: string) {
  switch (category) {
    case 'containment':
      return 'Contenance'
    case 'sensorial':
      return 'Sensoriel'
    case 'mobilisation':
      return 'Mobilisation'
    case 'symbolization':
      return 'Symbolisation'
    case 'integration':
      return 'Intégration'
    case 'closure':
      return 'Clôture'
    default:
      return category
  }
}

export default function ProtocolsPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Protocoles ATPE
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Catalogue clinique des protocoles ATPE réintégrés dans l’outil. Chaque
          protocole peut être consulté individuellement et, ensuite, relié au
          moteur expert pour produire des recommandations automatiques.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ATPE_PROTOCOLS.map((protocol) => (
          <article
            key={protocol.slug}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {categoryLabel(protocol.category)}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {protocol.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {protocol.clinical_intent}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>
                <span className="font-medium">Phases cibles :</span>{' '}
                {protocol.target_phases.join(', ')}
              </div>
              <div>
                <span className="font-medium">Risque :</span>{' '}
                {protocol.target_risk_levels.join(', ')}
              </div>
            </div>

            <div className="mt-5">
              <Link
                href={`/protocols/${protocol.slug}`}
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Ouvrir le protocole
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}