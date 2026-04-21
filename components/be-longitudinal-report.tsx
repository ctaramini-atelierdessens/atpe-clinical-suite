import type { Database } from '@/lib/database.types'

type Patient = Database['public']['Tables']['patients']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

type BELongitudinalReportProps = {
  patient?: Patient | null
  sessions?: Session[] | null
}

type ScoreKey =
  | 'engagement'
  | 'regulation'
  | 'tension'
  | 'symbolization'
  | 'transformation'
  | 'vulnerability'

type LongitudinalPoint = {
  id: string
  date: string | null
  label: string
  engagement: number | null
  regulation: number | null
  tension: number | null
  symbolization: number | null
  transformation: number | null
  vulnerability: number | null
}

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function clampScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatDateShort(value: string | null | undefined) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

function getPatientLabel(patient?: Patient | null) {
  if (!patient) return 'Patient'

  const record = patient as Record<string, unknown>

  return (
    (record.full_name as string) ||
    (record.display_name as string) ||
    (record.name as string) ||
    (record.code as string) ||
    patient.id ||
    'Patient'
  )
}

function getSessionDate(session: Session): string | null {
  const record = session as Record<string, unknown>

  const value =
    (record.session_date as string) ||
    (record.date as string) ||
    session.created_at ||
    null

  return typeof value === 'string' ? value : null
}

function getSessionIndexLabel(session: Session, index: number) {
  const record = session as Record<string, unknown>
  const explicit =
    (record.session_number as number) ||
    (record.number as number) ||
    (record.order_index as number)

  if (typeof explicit === 'number' && Number.isFinite(explicit)) {
    return `S${explicit}`
  }

  return `S${index + 1}`
}

function sortSessionsByDate(sessions: Session[]) {
  return [...sessions].sort((a, b) => {
    const ta = new Date(getSessionDate(a) || 0).getTime()
    const tb = new Date(getSessionDate(b) || 0).getTime()
    return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb)
  })
}

function pickScore(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const score = clampScore(record[key])
    if (score !== null) return score
  }
  return null
}

function getScoreValue(session: Session, key: ScoreKey): number | null {
  const record = session as Record<string, unknown>

  const mapping: Record<ScoreKey, string[]> = {
    engagement: ['engagement_score', 'engagement', 'score_engagement'],
    regulation: ['regulation_score', 'regulation', 'score_regulation'],
    tension: ['tension_score', 'tension', 'score_tension'],
    symbolization: [
      'symbolization_score',
      'symbolization',
      'symbolic_score',
      'score_symbolization',
    ],
    transformation: [
      'transformation_score',
      'transformation',
      'score_transformation',
    ],
    vulnerability: [
      'vulnerability_score',
      'vulnerability',
      'score_vulnerability',
    ],
  }

  return pickScore(record, mapping[key])
}

function buildPoints(sessions: Session[]): LongitudinalPoint[] {
  const sorted = sortSessionsByDate(sessions)

  return sorted.map((session, index) => {
    const date = getSessionDate(session)
    const sessionLabel = getSessionIndexLabel(session, index)

    return {
      id: session.id,
      date,
      label: `${sessionLabel} · ${formatDateShort(date)}`,
      engagement: getScoreValue(session, 'engagement'),
      regulation: getScoreValue(session, 'regulation'),
      tension: getScoreValue(session, 'tension'),
      symbolization: getScoreValue(session, 'symbolization'),
      transformation: getScoreValue(session, 'transformation'),
      vulnerability: getScoreValue(session, 'vulnerability'),
    }
  })
}

function validValues(points: LongitudinalPoint[], key: ScoreKey): number[] {
  return points
    .map((point) => point[key])
    .filter((value): value is number => typeof value === 'number')
}

function firstValid(points: LongitudinalPoint[], key: ScoreKey): number | null {
  for (const point of points) {
    const value = point[key]
    if (typeof value === 'number') return value
  }
  return null
}

function lastValid(points: LongitudinalPoint[], key: ScoreKey): number | null {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const value = points[i][key]
    if (typeof value === 'number') return value
  }
  return null
}

function average(values: number[]): number | null {
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function delta(points: LongitudinalPoint[], key: ScoreKey): number | null {
  const first = firstValid(points, key)
  const last = lastValid(points, key)
  if (first === null || last === null) return null
  return last - first
}

function countDirectionChanges(points: LongitudinalPoint[], key: ScoreKey): number {
  const values = validValues(points, key)
  if (values.length < 3) return 0

  let changes = 0
  let lastDirection = 0

  for (let i = 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1]
    const direction = diff > 0 ? 1 : diff < 0 ? -1 : 0

    if (direction !== 0 && lastDirection !== 0 && direction !== lastDirection) {
      changes += 1
    }

    if (direction !== 0) {
      lastDirection = direction
    }
  }

  return changes
}

function describeTrend(
  points: LongitudinalPoint[],
  key: ScoreKey,
  invertMeaning = false
) {
  const values = validValues(points, key)
  if (values.length < 2) return 'Données insuffisantes'

  const movement = delta(points, key)
  if (movement === null) return 'Données insuffisantes'

  const corrected = invertMeaning ? -movement : movement
  const instability = countDirectionChanges(points, key)

  if (Math.abs(corrected) <= 4) {
    return instability >= 2 ? 'Relative stabilité avec fluctuations' : 'Globalement stable'
  }

  if (corrected >= 15) {
    return instability >= 2 ? 'Progression nette mais irrégulière' : 'Progression nette'
  }

  if (corrected >= 5) {
    return instability >= 2 ? 'Amélioration modérée avec fluctuations' : 'Amélioration modérée'
  }

  if (corrected <= -15) {
    return instability >= 2 ? 'Dégradation nette et instable' : 'Dégradation nette'
  }

  if (corrected <= -5) {
    return instability >= 2 ? 'Fragilisation modérée avec fluctuations' : 'Fragilisation modérée'
  }

  return 'Évolution hétérogène'
}

function scoreLabel(value: number | null) {
  return value === null ? '—' : `${value}/100`
}

function deltaLabel(value: number | null) {
  if (value === null) return '—'
  if (value > 0) return `+${value}`
  return `${value}`
}

function getLongitudinalSummary(points: LongitudinalPoint[]) {
  const engagementTrend = describeTrend(points, 'engagement')
  const regulationTrend = describeTrend(points, 'regulation')
  const tensionTrend = describeTrend(points, 'tension', true)
  const symbolizationTrend = describeTrend(points, 'symbolization')
  const transformationTrend = describeTrend(points, 'transformation')
  const vulnerabilityTrend = describeTrend(points, 'vulnerability', true)

  const strengths: string[] = []
  const vigilance: string[] = []

  const engagementDelta = delta(points, 'engagement')
  const regulationDelta = delta(points, 'regulation')
  const tensionDelta = delta(points, 'tension')
  const symbolizationDelta = delta(points, 'symbolization')
  const transformationDelta = delta(points, 'transformation')
  const vulnerabilityDelta = delta(points, 'vulnerability')

  if ((engagementDelta ?? 0) >= 5) strengths.push("engagement en progression")
  if ((regulationDelta ?? 0) >= 5) strengths.push("régulation en amélioration")
  if ((symbolizationDelta ?? 0) >= 5) strengths.push("symbolisation plus accessible")
  if ((transformationDelta ?? 0) >= 5) strengths.push("processus transformateur en consolidation")
  if ((tensionDelta ?? 0) <= -5) strengths.push("tension globale en diminution")
  if ((vulnerabilityDelta ?? 0) <= -5) strengths.push("vulnérabilité en recul")

  if ((engagementDelta ?? 0) <= -5) vigilance.push("recul de l’engagement")
  if ((regulationDelta ?? 0) <= -5) vigilance.push("fragilisation de la régulation")
  if ((tensionDelta ?? 0) >= 5) vigilance.push("augmentation tensionnelle")
  if ((vulnerabilityDelta ?? 0) >= 5) vigilance.push("vulnérabilité croissante")
  if ((symbolizationDelta ?? 0) <= -5) vigilance.push("appauvrissement symbolique")
  if ((transformationDelta ?? 0) <= -5) vigilance.push("ralentissement transformateur")

  return {
    engagementTrend,
    regulationTrend,
    tensionTrend,
    symbolizationTrend,
    transformationTrend,
    vulnerabilityTrend,
    strengths: strengths.length ? strengths : ['pas de progression franche objectivable à ce stade'],
    vigilance: vigilance.length ? vigilance : ['pas d’alerte évolutive majeure objectivable à ce stade'],
  }
}

type TrendCardProps = {
  title: string
  averageValue: number | null
  firstValue: number | null
  lastValue: number | null
  deltaValue: number | null
  trendLabel: string
}

function TrendCard({
  title,
  averageValue,
  firstValue,
  lastValue,
  deltaValue,
  trendLabel,
}: TrendCardProps) {
  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span>Moyenne</span>
          <span className="font-semibold text-slate-900">{scoreLabel(averageValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Début</span>
          <span className="font-semibold text-slate-900">{scoreLabel(firstValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Dernière valeur</span>
          <span className="font-semibold text-slate-900">{scoreLabel(lastValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Delta</span>
          <span className="font-semibold text-slate-900">{deltaLabel(deltaValue)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-700">{trendLabel}</p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${averageValue ?? 0}%` }}
        />
      </div>
    </article>
  )
}

type SessionLineProps = {
  point: LongitudinalPoint
}

function SessionLine({ point }: SessionLineProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold text-slate-900">{point.label}</h4>
        <p className="text-xs text-slate-500">{formatDate(point.date)}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Engagement</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.engagement)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Régulation</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.regulation)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Tension</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.tension)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Symbolisation</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.symbolization)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Transformation</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.transformation)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-sm">
          <span className="text-slate-500">Vulnérabilité</span>
          <p className="mt-1 font-semibold text-slate-900">{scoreLabel(point.vulnerability)}</p>
        </div>
      </div>
    </article>
  )
}

export function BELongitudinalReport({
  patient,
  sessions,
}: BELongitudinalReportProps) {
  const safeSessions = asArray(sessions)
  const points = buildPoints(safeSessions)
  const patientLabel = getPatientLabel(patient)

  if (points.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rapport longitudinal
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{patientLabel}</h2>
        </div>

        <p className="text-sm text-slate-500">
          Aucune séance disponible pour produire une lecture longitudinale.
        </p>
      </section>
    )
  }

  const summary = getLongitudinalSummary(points)
  const firstDate = formatDate(points[0]?.date)
  const lastDate = formatDate(points[points.length - 1]?.date)

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Rapport longitudinal
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">{patientLabel}</h2>
            <p className="text-sm text-slate-600">
              Lecture de l’évolution dans le temps à partir des séances disponibles.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Fenêtre analysée
            </p>
            <p className="mt-1 text-sm font-semibold">
              {points.length} séance(s)
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Première séance analysée</dt>
            <dd className="mt-1 font-semibold text-slate-900">{firstDate}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Dernière séance analysée</dt>
            <dd className="mt-1 font-semibold text-slate-900">{lastDate}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TrendCard
          title="Engagement"
          averageValue={average(validValues(points, 'engagement'))}
          firstValue={firstValid(points, 'engagement')}
          lastValue={lastValid(points, 'engagement')}
          deltaValue={delta(points, 'engagement')}
          trendLabel={summary.engagementTrend}
        />
        <TrendCard
          title="Régulation"
          averageValue={average(validValues(points, 'regulation'))}
          firstValue={firstValid(points, 'regulation')}
          lastValue={lastValid(points, 'regulation')}
          deltaValue={delta(points, 'regulation')}
          trendLabel={summary.regulationTrend}
        />
        <TrendCard
          title="Tension"
          averageValue={average(validValues(points, 'tension'))}
          firstValue={firstValid(points, 'tension')}
          lastValue={lastValid(points, 'tension')}
          deltaValue={delta(points, 'tension')}
          trendLabel={summary.tensionTrend}
        />
        <TrendCard
          title="Symbolisation"
          averageValue={average(validValues(points, 'symbolization'))}
          firstValue={firstValid(points, 'symbolization')}
          lastValue={lastValid(points, 'symbolization')}
          deltaValue={delta(points, 'symbolization')}
          trendLabel={summary.symbolizationTrend}
        />
        <TrendCard
          title="Transformation"
          averageValue={average(validValues(points, 'transformation'))}
          firstValue={firstValid(points, 'transformation')}
          lastValue={lastValid(points, 'transformation')}
          deltaValue={delta(points, 'transformation')}
          trendLabel={summary.transformationTrend}
        />
        <TrendCard
          title="Vulnérabilité"
          averageValue={average(validValues(points, 'vulnerability'))}
          firstValue={firstValid(points, 'vulnerability')}
          lastValue={lastValid(points, 'vulnerability')}
          deltaValue={delta(points, 'vulnerability')}
          trendLabel={summary.vulnerabilityTrend}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Éléments évolutifs favorables
          </h3>
          <div className="mt-3 space-y-2">
            {summary.strengths.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Points de vigilance évolutifs
          </h3>
          <div className="mt-3 space-y-2">
            {summary.vigilance.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Synthèse longitudinale
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          L’analyse longitudinale du dossier de{' '}
          <span className="font-medium text-slate-900">{patientLabel}</span>{' '}
          porte sur <span className="font-medium text-slate-900">{points.length}</span>{' '}
          séance(s), entre <span className="font-medium text-slate-900">{firstDate}</span>{' '}
          et <span className="font-medium text-slate-900">{lastDate}</span>. Les tendances
          principales observées sont les suivantes : engagement{' '}
          <span className="font-medium text-slate-900">
            {summary.engagementTrend.toLowerCase()}
          </span>
          , régulation{' '}
          <span className="font-medium text-slate-900">
            {summary.regulationTrend.toLowerCase()}
          </span>
          , tension{' '}
          <span className="font-medium text-slate-900">
            {summary.tensionTrend.toLowerCase()}
          </span>
          , symbolisation{' '}
          <span className="font-medium text-slate-900">
            {summary.symbolizationTrend.toLowerCase()}
          </span>
          , transformation{' '}
          <span className="font-medium text-slate-900">
            {summary.transformationTrend.toLowerCase()}
          </span>
          , vulnérabilité{' '}
          <span className="font-medium text-slate-900">
            {summary.vulnerabilityTrend.toLowerCase()}
          </span>
          .
        </p>
      </article>

      <article className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Détail par séance
        </h3>

        <div className="mt-4 space-y-3">
          {points.map((point) => (
            <SessionLine key={point.id} point={point} />
          ))}
        </div>
      </article>
    </section>
  )
}