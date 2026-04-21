type ATPECurrentCardProps = {
  name: string
  period: string
  summary: string
  keyIdeas: string[]
  clinicalTranslation: string
}

export function ATPECurrentCard({
  name,
  period,
  summary,
  keyIdeas,
  clinicalTranslation,
}: ATPECurrentCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">{period}</p>
      </div>

      <p className="text-sm text-slate-700">{summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {keyIdeas.map((idea) => (
          <span
            key={idea}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
          >
            {idea}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Traduction clinique :</span>{' '}
        {clinicalTranslation}
      </p>
    </article>
  )
}