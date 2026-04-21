import { ATPEChronology } from '@/components/atpe/atpe-chronology'
import { ATPECurrentCard } from '@/components/atpe/atpe-current-card'
import { ATPEKnowledgeCard } from '@/components/atpe/atpe-knowledge-card'
import { ATPEProtocolCard } from '@/components/atpe/atpe-protocol-card'
import { atpeKnowledgeBase } from '@/lib/atpe-knowledge/indexes'

export default function KnowledgePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Base de connaissances ATPE</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Socle théorique, historique et clinique intégré à l’outil : concepts,
          courants, repères chronologiques et protocoles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Repères chronologiques</h2>
        <ATPEChronology items={atpeKnowledgeBase.timeline} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Courants</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {atpeKnowledgeBase.currents.map((item) => (
            <ATPECurrentCard
              key={item.id}
              name={item.name}
              period={item.period}
              summary={item.summary}
              keyIdeas={item.keyIdeas}
              clinicalTranslation={item.clinicalTranslation}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Concepts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {atpeKnowledgeBase.concepts.map((item) => (
            <ATPEKnowledgeCard
              key={item.id}
              title={item.label}
              category={item.category}
              definition={item.definition}
              clinicalMeaning={item.clinicalMeaning}
              atpeUse={item.atpeUse}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Protocoles</h2>
        <div className="grid gap-4">
          {atpeKnowledgeBase.protocols.map((protocol) => (
            <ATPEProtocolCard
              key={protocol.id}
              protocol={protocol}
              href={
                protocol.id === 'trace-prenom'
                  ? '/protocols/trace-prenom'
                  : undefined
              }
            />
          ))}
        </div>
      </section>
    </main>
  )
}