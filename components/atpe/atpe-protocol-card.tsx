import Link from 'next/link'
import type { ATPEProtocol } from '@/lib/atpe-knowledge/protocols'

type ATPEProtocolCardProps = {
  protocol: ATPEProtocol
  href?: string
}

export function ATPEProtocolCard({
  protocol,
  href,
}: ATPEProtocolCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{protocol.name}</h3>
          <p className="text-sm text-slate-700">{protocol.objective}</p>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Variables observées
            </p>
            <div className="flex flex-wrap gap-2">
              {protocol.observedFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {href ? (
          <Link
            href={href}
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Ouvrir le protocole
          </Link>
        ) : null}
      </div>
    </article>
  )
}