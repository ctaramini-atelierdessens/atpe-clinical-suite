import { atpeConcepts } from './concepts'
import { atpeCurrents } from './currents'
import { atpeTimeline } from './chronology'
import { atpeProtocols } from './protocols'

export const atpeKnowledgeBase = {
  concepts: atpeConcepts,
  currents: atpeCurrents,
  timeline: atpeTimeline,
  protocols: atpeProtocols,
}

export function searchATPEKnowledge(query: string) {
  const q = query.trim().toLowerCase()

  return {
    concepts: atpeConcepts.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    ),
    currents: atpeCurrents.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.keyIdeas.some((k) => k.toLowerCase().includes(q))
    ),
    timeline: atpeTimeline.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.period.toLowerCase().includes(q)
    ),
    protocols: atpeProtocols.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.objective.toLowerCase().includes(q)
    ),
  }
}