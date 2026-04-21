import { AtpeProtocol } from '@/lib/atpe-protocol-engine'
import { buildSessionGuide, SessionGuideStep } from '@/lib/atpe-session-guide'

type PatientAtpeSessionGuideProps = {
  protocol: AtpeProtocol
  className?: string
}

function phaseLabel(step: SessionGuideStep['phase']) {
  switch (step) {
    case 'opening':
      return 'Temps 1'
    case 'deployment':
      return 'Temps 2'
    case 'closure':
      return 'Temps 3'
    default:
      return ''
  }
}

function phaseColor(step: SessionGuideStep['phase']) {
  switch (step) {
    case 'opening':
      return 'bg-sky-50 border-sky-200'
    case 'deployment':
      return 'bg-amber-50 border-amber-200'
    case 'closure':
      return 'bg-emerald-50 border-emerald-200'
    default:
      return 'bg-slate-50 border-slate-200'
  }
}

export function PatientAtpeSessionGuide({
  protocol,
  className = '',
}: PatientAtpeSessionGuideProps) {
  const guide = buildSessionGuide(protocol)

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Guidage de séance</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {guide.estimatedDurationMinutes} min
          </span>
        </div>

        <p className="text-sm text-slate-600">{guide.protocolTitle}</p>
        <p className="text-sm text-slate-500">{guide.protocolIntent}</p>
      </div>

      <div className="space-y-4">
        {guide.steps.map((step) => (
          <div
            key={step.phase}
            className={`rounded-2xl border p-4 ${phaseColor(step.phase)}`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {phaseLabel(step.phase)}
              </span>
              <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-sm font-medium text-slate-800">Objectif clinique</p>
              <p className="text-sm text-slate-700">{step.objective}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white/80 p-3">
                <p className="mb-2 text-sm font-medium text-slate-800">Instructions</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {step.instructions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white/80 p-3">
                <p className="mb-2 text-sm font-medium text-slate-800">À observer</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {step.observationTargets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white/80 p-3">
                <p className="mb-2 text-sm font-medium text-slate-800">Ajustements possibles</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {step.adjustmentIfNeeded.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/80 p-3">
              <p className="mb-2 text-sm font-medium text-slate-800">Marqueurs de réussite</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {step.successMarkers.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}