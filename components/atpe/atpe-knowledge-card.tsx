type ATPEKnowledgeCardProps = {
  title: string
  category: string
  definition: string
  clinicalMeaning: string
  atpeUse: string
}

export function ATPEKnowledgeCard({
  title,
  category,
  definition,
  clinicalMeaning,
  atpeUse,
}: ATPEKnowledgeCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {category}
        </span>
      </div>

      <div className="space-y-3 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Définition :</span>{' '}
          {definition}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Lecture clinique :</span>{' '}
          {clinicalMeaning}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Usage ATPE :</span>{' '}
          {atpeUse}
        </p>
      </div>
    </article>
  )
}