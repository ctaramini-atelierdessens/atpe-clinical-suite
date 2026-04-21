import type { ReactNode } from 'react'

export type AtpeProtocolCategory =
  | 'ancrage'
  | 'regulation'
  | 'symbolisation'
  | 'relation'
  | 'expression'
  | 'integration'

export type AtpeProtocolTarget =
  | 'inhibition'
  | 'debordement'
  | 'dissociation'
  | 'retrait'
  | 'fragilite_relationnelle'
  | 'fragilite_symbolique'
  | 'general'

export type AtpePriorityAxis =
  | 'internal_process'
  | 'expressive_process'
  | 'relational_process'
  | 'pluriexpressivity'
  | 'institutional_indicators'
  | 'sensorial_symbolic'

export type AtpeProtocolRecord = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: AtpeProtocolCategory
  targets: AtpeProtocolTarget[]
  clinicalIntent: string
  indications: string[]
  contraindications: string[]
  goals: string[]
  mediations: string[]
  vigilance: string[]
  durationMinutes: number
  format: 'individuel' | 'groupe' | 'mixte'
  intensity: 'faible' | 'modérée' | 'élevée'
  tags: string[]

  // Champs de compatibilité pour le matcher
  primary_axes: AtpePriorityAxis[]
  secondary_axes: AtpePriorityAxis[]
}

export const ATPE_PROTOCOL_LIBRARY: AtpeProtocolRecord[] = [
  {
    id: 'protocol-ancrage-progressif',
    slug: 'ancrage-progressif',
    title: 'Ancrage progressif',
    subtitle: 'Sécuriser la présence corporelle et l’entrée en séance',
    category: 'ancrage',
    targets: ['dissociation', 'retrait', 'general'],
    clinicalIntent:
      'Renforcer les appuis corporels, la stabilité attentionnelle et la continuité de présence dans un cadre contenant.',
    indications: [
      'Difficulté d’installation en séance',
      'Flottement corporel ou agitation diffuse',
      'Rupture rapide d’attention',
    ],
    contraindications: [
      'Aucune contre-indication absolue',
      'Adapter si surcharge sensorielle importante',
    ],
    goals: [
      'Renforcer la présence à soi',
      'Stabiliser l’entrée en séance',
      'Favoriser le contact au support',
    ],
    mediations: [
      'Respiration guidée',
      'Support grand format',
      'Geste lent',
      'Matières contenantes',
    ],
    vigilance: [
      'Ne pas surstimuler',
      'Ralentir le rythme',
      'Maintenir un cadre simple',
    ],
    durationMinutes: 45,
    format: 'individuel',
    intensity: 'faible',
    tags: ['ancrage', 'corps', 'sécurisation'],
    primary_axes: ['internal_process', 'sensorial_symbolic'],
    secondary_axes: ['relational_process', 'institutional_indicators'],
  },
  {
    id: 'protocol-containment-emotionnel',
    slug: 'containment-emotionnel',
    title: 'Contenance émotionnelle',
    subtitle: 'Transformer le débordement en forme supportable',
    category: 'regulation',
    targets: ['debordement', 'fragilite_relationnelle'],
    clinicalIntent:
      'Soutenir la modulation émotionnelle par un cadre structuré, des séquences courtes et des reprises progressives.',
    indications: [
      'Débordement émotionnel',
      'Difficulté de retour au calme',
      'Instabilité inter-séances',
    ],
    contraindications: [
      'Éviter les dispositifs trop ouverts au départ',
      'Éviter les accumulations sensorielles brutales',
    ],
    goals: [
      'Améliorer la régulation émotionnelle',
      'Structurer l’expression',
      'Sécuriser la clôture de séance',
    ],
    mediations: [
      'Cadres spatiaux',
      'Séquences courtes',
      'Alternance décharge / reprise',
      'Contenants symboliques',
    ],
    vigilance: [
      'Baliser la fin de séance',
      'Fractionner les temps',
      'Réduire les stimuli concurrents',
    ],
    durationMinutes: 50,
    format: 'individuel',
    intensity: 'modérée',
    tags: ['régulation', 'débordement', 'contenance'],
    primary_axes: ['expressive_process', 'sensorial_symbolic'],
    secondary_axes: ['internal_process', 'relational_process'],
  },
  {
    id: 'protocol-reouverture-emotionnelle',
    slug: 'reouverture-emotionnelle',
    title: 'Réouverture émotionnelle',
    subtitle: 'Réintroduire la nuance et la sensorialité',
    category: 'expression',
    targets: ['inhibition', 'retrait'],
    clinicalIntent:
      'Réactiver l’expression sensible et la capacité de choix à travers des médiations douces et progressives.',
    indications: [
      'Inhibition émotionnelle',
      'Appauvrissement expressif',
      'Faible initiative créative',
    ],
    contraindications: [
      'Éviter les consignes trop abstraites',
      'Éviter les attentes de verbalisation rapide',
    ],
    goals: [
      'Réactiver la dynamique du désir',
      'Développer l’expression plastique',
      'Favoriser la nuance émotionnelle',
    ],
    mediations: [
      'Pastels',
      'Encres légères',
      'Couleurs peu saturées',
      'Superpositions simples',
    ],
    vigilance: [
      'Laisser du temps',
      'Ne pas interpréter trop vite',
      'Soutenir sans envahir',
    ],
    durationMinutes: 45,
    format: 'individuel',
    intensity: 'faible',
    tags: ['inhibition', 'émotion', 'expression'],
    primary_axes: ['expressive_process', 'sensorial_symbolic'],
    secondary_axes: ['internal_process', 'pluriexpressivity'],
  },
  {
    id: 'protocol-reliance-relationnelle',
    slug: 'reliance-relationnelle',
    title: 'Reliance relationnelle',
    subtitle: 'Soutenir le lien sans intrusion',
    category: 'relation',
    targets: ['dissociation', 'fragilite_relationnelle', 'general'],
    clinicalIntent:
      'Renforcer l’alliance thérapeutique, la co-présence et la continuité relationnelle dans un dispositif ajusté.',
    indications: [
      'Évitement relationnel',
      'Méfiance',
      'Ruptures de continuité dans le lien',
    ],
    contraindications: [
      'Éviter toute mise en miroir trop précoce',
      'Ne pas forcer la co-construction',
    ],
    goals: [
      'Construire l’alliance thérapeutique',
      'Développer la communication relationnelle',
      'Stabiliser la relation au cadre',
    ],
    mediations: [
      'Travail parallèle',
      'Rythmes partagés',
      'Repères de début et de fin',
      'Co-présence ajustée',
    ],
    vigilance: [
      'Respecter les distances',
      'Tolérer les temps de retrait',
      'Garder une continuité de ton et de cadre',
    ],
    durationMinutes: 50,
    format: 'mixte',
    intensity: 'faible',
    tags: ['relation', 'alliance', 'reliance'],
    primary_axes: ['relational_process', 'institutional_indicators'],
    secondary_axes: ['internal_process', 'sensorial_symbolic'],
  },
  {
    id: 'protocol-symbolisation-progressive',
    slug: 'symbolisation-progressive',
    title: 'Symbolisation progressive',
    subtitle: 'Passer du vécu brut à une forme partageable',
    category: 'symbolisation',
    targets: ['fragilite_symbolique', 'inhibition', 'general'],
    clinicalIntent:
      'Soutenir la mise en forme du vécu en favorisant des passages progressifs entre sensation, trace et représentation.',
    indications: [
      'Difficulté à mettre en forme le vécu',
      'Expression peu intégrée',
      'Faible continuité symbolique',
    ],
    contraindications: [
      'Éviter les interprétations imposées',
      'Éviter les dispositifs trop complexes',
    ],
    goals: [
      'Favoriser la symbolisation',
      'Créer une cohérence intermodale',
      'Soutenir la transformation psychique',
    ],
    mediations: [
      'Trace simple',
      'Image-support',
      'Récit bref',
      'Association couleur-forme',
    ],
    vigilance: [
      'Respecter le niveau de figurabilité',
      'Accompagner les transitions',
      'Garder un appui concret',
    ],
    durationMinutes: 50,
    format: 'individuel',
    intensity: 'modérée',
    tags: ['symbolisation', 'mise en forme', 'transformation'],
    primary_axes: ['sensorial_symbolic', 'pluriexpressivity'],
    secondary_axes: ['expressive_process', 'internal_process'],
  },
  {
    id: 'protocol-integration-transversale',
    slug: 'integration-transversale',
    title: 'Intégration transversale',
    subtitle: 'Relier les axes et consolider les acquis',
    category: 'integration',
    targets: ['general'],
    clinicalIntent:
      'Consolider les acquis cliniques en travaillant les passages entre corps, expression, relation et symbolisation.',
    indications: [
      'Progression déjà amorcée',
      'Besoin de consolidation',
      'Travail de continuité trans-séance',
    ],
    contraindications: [
      'À alléger si grande fatigabilité',
      'À simplifier si instabilité forte',
    ],
    goals: [
      'Renforcer l’intégration incarnée',
      'Favoriser la continuité trans-séance',
      'Consolider les acquis',
    ],
    mediations: [
      'Parcours en trois temps',
      'Reprise d’une production antérieure',
      'Lien corps-image-récit',
      'Rituel de continuité',
    ],
    vigilance: [
      'Ne pas surcharger les objectifs',
      'Maintenir une lisibilité forte',
      'Évaluer la fatigabilité',
    ],
    durationMinutes: 55,
    format: 'mixte',
    intensity: 'modérée',
    tags: ['intégration', 'continuité', 'transversalité'],
    primary_axes: ['pluriexpressivity', 'institutional_indicators'],
    secondary_axes: ['relational_process', 'sensorial_symbolic'],
  },
]

export function categoryLabel(category: AtpeProtocolCategory): string {
  switch (category) {
    case 'ancrage':
      return 'Ancrage'
    case 'regulation':
      return 'Régulation'
    case 'symbolisation':
      return 'Symbolisation'
    case 'relation':
      return 'Relation'
    case 'expression':
      return 'Expression'
    case 'integration':
      return 'Intégration'
    default:
      return category
  }
}

export function intensityLabel(intensity: AtpeProtocolRecord['intensity']): string {
  switch (intensity) {
    case 'faible':
      return 'Faible intensité'
    case 'modérée':
      return 'Intensité modérée'
    case 'élevée':
      return 'Haute intensité'
    default:
      return intensity
  }
}

export function formatLabel(format: AtpeProtocolRecord['format']): string {
  switch (format) {
    case 'individuel':
      return 'Individuel'
    case 'groupe':
      return 'Groupe'
    case 'mixte':
      return 'Mixte'
    default:
      return format
  }
}

export function getProtocolById(id: string): AtpeProtocolRecord | undefined {
  return ATPE_PROTOCOL_LIBRARY.find((protocol) => protocol.id === id)
}

export function getProtocolBySlug(slug: string): AtpeProtocolRecord | undefined {
  return ATPE_PROTOCOL_LIBRARY.find((protocol) => protocol.slug === slug)
}

export function getProtocolsByCategory(
  category: AtpeProtocolCategory
): AtpeProtocolRecord[] {
  return ATPE_PROTOCOL_LIBRARY.filter((protocol) => protocol.category === category)
}

export function getProtocolsByTarget(
  target: AtpeProtocolTarget
): AtpeProtocolRecord[] {
  return ATPE_PROTOCOL_LIBRARY.filter((protocol) =>
    protocol.targets.includes(target)
  )
}

export function searchProtocols(query: string): AtpeProtocolRecord[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return ATPE_PROTOCOL_LIBRARY

  return ATPE_PROTOCOL_LIBRARY.filter((protocol) => {
    const haystack = [
      protocol.title,
      protocol.subtitle,
      protocol.category,
      protocol.clinicalIntent,
      ...protocol.targets,
      ...protocol.indications,
      ...protocol.goals,
      ...protocol.mediations,
      ...protocol.tags,
      ...protocol.primary_axes,
      ...protocol.secondary_axes,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

function badgeTone(category: AtpeProtocolCategory): string {
  switch (category) {
    case 'ancrage':
      return 'bg-amber-100 text-amber-800'
    case 'regulation':
      return 'bg-rose-100 text-rose-800'
    case 'symbolisation':
      return 'bg-violet-100 text-violet-800'
    case 'relation':
      return 'bg-sky-100 text-sky-800'
    case 'expression':
      return 'bg-emerald-100 text-emerald-800'
    case 'integration':
      return 'bg-slate-100 text-slate-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function list(items: string[]): ReactNode {
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 text-slate-400">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ProtocolCard({ protocol }: { protocol: AtpeProtocolRecord }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${badgeTone(
            protocol.category
          )}`}
        >
          {categoryLabel(protocol.category)}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {formatLabel(protocol.format)}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {intensityLabel(protocol.intensity)}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {protocol.durationMinutes} min
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{protocol.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{protocol.subtitle}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {protocol.clinicalIntent}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Objectifs</p>
          {list(protocol.goals)}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Médiations</p>
          {list(protocol.mediations)}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Indications</p>
          {list(protocol.indications)}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Vigilances</p>
          {list(protocol.vigilance)}
        </div>
      </div>
    </article>
  )
}

export function ProtocolLibraryGrid({
  protocols = ATPE_PROTOCOL_LIBRARY,
}: {
  protocols?: AtpeProtocolRecord[]
}) {
  if (!protocols.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Aucun protocole disponible.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {protocols.map((protocol) => (
        <ProtocolCard key={protocol.id} protocol={protocol} />
      ))}
    </div>
  )
}