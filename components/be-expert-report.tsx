import type { Database } from '@/lib/database.types'

type Patient = Database['public']['Tables']['patients']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

type BEExpertReportProps = {
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

type ScoreSnapshot = Record<ScoreKey, number | null>

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

function average(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number')
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

function latestValue(sessions: Session[], key: ScoreKey): number | null {
  const sorted = sortSessionsByDate(sessions)
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const value = getScoreValue(sorted[i], key)
    if (value !== null) return value
  }
  return null
}

function firstValue(sessions: Session[], key: ScoreKey): number | null {
  const sorted = sortSessionsByDate(sessions)
  for (let i = 0; i < sorted.length; i += 1) {
    const value = getScoreValue(sorted[i], key)
    if (value !== null) return value
  }
  return null
}

function buildAverageSnapshot(sessions: Session[]): ScoreSnapshot {
  return {
    engagement: average(sessions.map((s) => getScoreValue(s, 'engagement'))),
    regulation: average(sessions.map((s) => getScoreValue(s, 'regulation'))),
    tension: average(sessions.map((s) => getScoreValue(s, 'tension'))),
    symbolization: average(sessions.map((s) => getScoreValue(s, 'symbolization'))),
    transformation: average(sessions.map((s) => getScoreValue(s, 'transformation'))),
    vulnerability: average(sessions.map((s) => getScoreValue(s, 'vulnerability'))),
  }
}

function buildLatestSnapshot(sessions: Session[]): ScoreSnapshot {
  return {
    engagement: latestValue(sessions, 'engagement'),
    regulation: latestValue(sessions, 'regulation'),
    tension: latestValue(sessions, 'tension'),
    symbolization: latestValue(sessions, 'symbolization'),
    transformation: latestValue(sessions, 'transformation'),
    vulnerability: latestValue(sessions, 'vulnerability'),
  }
}

function buildEvolutionSnapshot(sessions: Session[]): ScoreSnapshot {
  const delta = (key: ScoreKey) => {
    const first = firstValue(sessions, key)
    const latest = latestValue(sessions, key)
    if (first === null || latest === null) return null
    return latest - first
  }

  return {
    engagement: delta('engagement'),
    regulation: delta('regulation'),
    tension: delta('tension'),
    symbolization: delta('symbolization'),
    transformation: delta('transformation'),
    vulnerability: delta('vulnerability'),
  }
}

function scoreLabel(value: number | null) {
  return value === null ? '—' : `${value}/100`
}

function deltaLabel(value: number | null) {
  if (value === null) return '—'
  if (value > 0) return `+${value}`
  return `${value}`
}

function safeJoin(values: string[]) {
  return values.length ? values.join(' · ') : 'Aucun élément saillant'
}

function inferDominantProfile(latest: ScoreSnapshot) {
  const { engagement, regulation, tension, symbolization, transformation, vulnerability } =
    latest

  if ((vulnerability ?? 0) >= 70 && (engagement ?? 100) <= 35) {
    return 'Retrait protégé'
  }

  if ((tension ?? 0) >= 75 && (regulation ?? 100) <= 35) {
    return 'Débordement émotionnel'
  }

  if ((vulnerability ?? 0) >= 75 && (regulation ?? 100) <= 35) {
    return 'Désorganisation fragile'
  }

  if ((tension ?? 0) >= 65 && (regulation ?? 0) >= 40 && (symbolization ?? 100) < 40) {
    return 'Tension contenue'
  }

  if ((symbolization ?? 0) >= 45 && (transformation ?? 100) < 60) {
    return 'Symbolisation émergente'
  }

  if (
    (engagement ?? 0) >= 45 &&
    (symbolization ?? 0) >= 45 &&
    (transformation ?? 0) >= 45
  ) {
    return 'Processus transformateur actif'
  }

  return 'Profil à préciser'
}

function inferStrengths(snapshot: ScoreSnapshot) {
  const strengths: string[] = []

  if ((snapshot.engagement ?? 0) >= 55) strengths.push('engagement thérapeutique mobilisable')
  if ((snapshot.regulation ?? 0) >= 55) strengths.push('capacités de régulation relativement préservées')
  if ((snapshot.symbolization ?? 0) >= 55) strengths.push('potentiel de symbolisation présent')
  if ((snapshot.transformation ?? 0) >= 55) strengths.push('dynamique de transformation repérable')

  return strengths
}

function inferVigilancePoints(snapshot: ScoreSnapshot) {
  const warnings: string[] = []

  if ((snapshot.vulnerability ?? 0) >= 65) warnings.push('vulnérabilité clinique élevée')
  if ((snapshot.tension ?? 0) >= 65) warnings.push('niveau de tension important')
  if ((snapshot.regulation ?? 100) <= 35) warnings.push('fragilité de régulation')
  if ((snapshot.engagement ?? 100) <= 35) warnings.push('faible engagement observé')
  if ((snapshot.symbolization ?? 100) <= 30) warnings.push('mise en forme symbolique limitée')

  return warnings
}

function inferPriorityAxes(latest: ScoreSnapshot) {
  const axes: string[] = []

  if ((latest.vulnerability ?? 0) >= 65 || (latest.regulation ?? 100) <= 35) {
    axes.push('sécurisation du cadre et contenance')
  }

  if ((latest.tension ?? 0) >= 65) {
    axes.push('travail de décharge contenue et de modulation tensionnelle')
  }

  if ((latest.symbolization ?? 100) <= 40) {
    axes.push('soutien à la mise en forme symbolique')
  }

  if ((latest.engagement ?? 100) <= 40) {
    axes.push('renforcement progressif de l’engagement')
  }

  if ((latest.transformation ?? 100) >= 45) {
    axes.push('poursuite et stabilisation du processus transformateur')
  }

  if (axes.length === 0) {
    axes.push('poursuite des observations et consolidation du processus clinique')
  }

  return axes
}

type MetricProps = {
  label: string
  averageValue: number | null
  latestValue: number | null
  evolutionValue: number | null
}

function MetricCard({
  label,
  averageValue,
  latestValue,
  evolutionValue,
}: MetricProps) {
  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span>Moyenne</span>
          <span className="font-semibold text-slate-900">{scoreLabel(averageValue)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Dernière valeur</span>
          <span className="font-semibold text-slate-900">{scoreLabel(latestValue)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Évolution</span>
          <span className="font-semibold text-slate-900">{deltaLabel(evolutionValue)}</span>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${averageValue ?? 0}%` }}
        />
      </div>
    </article>
  )
}

export function BEExpertReport({ patient, sessions }: BEExpertReportProps) {
  const safeSessions = asArray(sessions)
  const sortedSessions = sortSessionsByDate(safeSessions)
  const patientLabel = getPatientLabel(patient)

  if (sortedSessions.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rapport expert
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{patientLabel}</h2>
        </div>

        <p className="text-sm text-slate-500">
          Aucune séance disponible pour générer un rapport expert.
        </p>
      </section>
    )
  }

  const averageSnapshot = buildAverageSnapshot(sortedSessions)
  const latestSnapshot = buildLatestSnapshot(sortedSessions)
  const evolutionSnapshot = buildEvolutionSnapshot(sortedSessions)

  const dominantProfile = inferDominantProfile(latestSnapshot)
  const strengths = inferStrengths(latestSnapshot)
  const vigilance = inferVigilancePoints(latestSnapshot)
  const axes = inferPriorityAxes(latestSnapshot)

  const firstDate = formatDate(getSessionDate(sortedSessions[0]))
  const lastDate = formatDate(getSessionDate(sortedSessions[sortedSessions.length - 1]))

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Rapport expert
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">{patientLabel}</h2>
            <p className="text-sm text-slate-600">
              Lecture clinique synthétique issue des données disponibles.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Profil dominant
            </p>
            <p className="mt-1 text-lg font-semibold">{dominantProfile}</p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Nombre de séances</dt>
            <dd className="mt-1 font-semibold text-slate-900">{sortedSessions.length}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Première séance</dt>
            <dd className="mt-1 font-semibold text-slate-900">{firstDate}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Dernière séance</dt>
            <dd className="mt-1 font-semibold text-slate-900">{lastDate}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Engagement"
          averageValue={averageSnapshot.engagement}
          latestValue={latestSnapshot.engagement}
          evolutionValue={evolutionSnapshot.engagement}
        />
        <MetricCard
          label="Régulation"
          averageValue={averageSnapshot.regulation}
          latestValue={latestSnapshot.regulation}
          evolutionValue={evolutionSnapshot.regulation}
        />
        <MetricCard
          label="Tension"
          averageValue={averageSnapshot.tension}
          latestValue={latestSnapshot.tension}
          evolutionValue={evolutionSnapshot.tension}
        />
        <MetricCard
          label="Symbolisation"
          averageValue={averageSnapshot.symbolization}
          latestValue={latestSnapshot.symbolization}
          evolutionValue={evolutionSnapshot.symbolization}
        />
        <MetricCard
          label="Transformation"
          averageValue={averageSnapshot.transformation}
          latestValue={latestSnapshot.transformation}
          evolutionValue={evolutionSnapshot.transformation}
        />
        <MetricCard
          label="Vulnérabilité"
          averageValue={averageSnapshot.vulnerability}
          latestValue={latestSnapshot.vulnerability}
          evolutionValue={evolutionSnapshot.vulnerability}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Forces repérées</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {safeJoin(strengths)}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Points de vigilance</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {safeJoin(vigilance)}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Axes prioritaires</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {safeJoin(axes)}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Synthèse clinique</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Le dossier de <span className="font-medium text-slate-900">{patientLabel}</span>{' '}
          comporte actuellement <span className="font-medium text-slate-900">{sortedSessions.length}</span>{' '}
          séance(s) exploitables, entre <span className="font-medium text-slate-900">{firstDate}</span>{' '}
          et <span className="font-medium text-slate-900">{lastDate}</span>. La lecture
          experte automatisée met principalement en évidence un profil de{' '}
          <span className="font-medium text-slate-900">{dominantProfile.toLowerCase()}</span>.
          Les éléments de ressource les plus saillants sont :{' '}
          <span className="font-medium text-slate-900">{safeJoin(strengths)}</span>. Les
          principaux points de vigilance concernent :{' '}
          <span className="font-medium text-slate-900">{safeJoin(vigilance)}</span>. Les
          priorités d’intervention suggérées à ce stade sont :{' '}
          <span className="font-medium text-slate-900">{safeJoin(axes)}</span>.
        </p>
      </article>
    </section>
  )
}