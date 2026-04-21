'use client'

import { useMemo } from 'react'

type AssessmentLike = {
  final_recommendation?: string | null
  proposed_modalities?: string | null
  initial_objectives?: string | null
  status?: string | null
}

type EpisodeLike = {
  id?: string | null
  therapeutic_frame?: string | null
  clinical_indication?: string | null
  objectives_summary?: string | null
  status?: string | null
}

type AssessmentObjectiveLike = {
  id: string
  title?: string | null
  description?: string | null
}

type TherapyGoalLike = {
  id: string
  title?: string | null
  description?: string | null
  status?: string | null
  priority?: string | null
}

type TherapySessionLike = {
  id: string
  session_number?: number | null
  session_date?: string | null
  emotional_score?: number | null
  body_score?: number | null
  awareness_score?: number | null
  dynamic_score?: number | null
  symbolic_score?: number | null
  regulation_score?: number | null
  engagement_score?: number | null
}

type Props = {
  assessment: AssessmentLike
  episode: EpisodeLike | null
  assessmentObjectives: AssessmentObjectiveLike[]
  therapyGoals: TherapyGoalLike[]
  therapySessions: TherapySessionLike[]
}

function normalizeText(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactText(value?: string | null) {
  return normalizeText(value).replace(/\s+/g, '')
}

function wordOverlap(a?: string | null, b?: string | null) {
  const na = normalizeText(a)
  const nb = normalizeText(b)

  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.8

  const wa = new Set(na.split(' ').filter((w) => w.length > 2))
  const wb = new Set(nb.split(' ').filter((w) => w.length > 2))

  if (!wa.size || !wb.size) return 0

  let common = 0
  for (const word of wa) {
    if (wb.has(word)) common++
  }

  return common / Math.max(wa.size, wb.size)
}

function compareRecommendationAndFrame(
  recommendation?: string | null,
  proposedModalities?: string | null,
  episode?: EpisodeLike | null
) {
  const source = [recommendation, proposedModalities].filter(Boolean).join(' ')
  const target = [episode?.clinical_indication, episode?.therapeutic_frame]
    .filter(Boolean)
    .join(' ')

  const score = wordOverlap(source, target)

  if (!source && !target) {
    return {
      label: 'Comparaison non documentée',
      description:
        'Ni la recommandation du bilan ni le cadre de suivi ne sont suffisamment renseignés.',
      level: 'low' as const,
    }
  }

  if (score >= 0.7) {
    return {
      label: 'Cadre thérapeutique aligné',
      description:
        'Le cadre réel du suivi reprend clairement l’orientation clinique formulée dans le bilan.',
      level: 'high' as const,
    }
  }

  if (score >= 0.3) {
    return {
      label: 'Cadre partiellement aligné',
      description:
        'Le suivi reprend une partie de l’indication initiale, avec reformulations ou ajustements.',
      level: 'medium' as const,
    }
  }

  return {
    label: 'Cadre faiblement aligné',
    description:
      'Le cadre actuellement mis en place paraît éloigné de la recommandation issue du bilan.',
    level: 'low' as const,
  }
}

function compareObjectives(
  assessmentObjectives: AssessmentObjectiveLike[],
  therapyGoals: TherapyGoalLike[],
  assessmentInitialObjectives?: string | null
) {
  const sourceItems = [
    ...assessmentObjectives.map((item) => item.title || item.description || ''),
    ...(assessmentInitialObjectives ? [assessmentInitialObjectives] : []),
  ]
    .map((text) => ({
      raw: text,
      normalized: normalizeText(text),
      compact: compactText(text),
    }))
    .filter((item) => item.normalized.length > 0)

  const targetItems = therapyGoals
    .map((item) => item.title || item.description || '')
    .map((text) => ({
      raw: text,
      normalized: normalizeText(text),
      compact: compactText(text),
    }))
    .filter((item) => item.normalized.length > 0)

  if (!sourceItems.length && !targetItems.length) {
    return {
      label: 'Objectifs non documentés',
      description:
        'Aucun objectif suffisamment structuré n’est disponible des deux côtés du parcours.',
      matched: 0,
      total: 0,
      ratio: 0,
    }
  }

  let matched = 0

  for (const source of sourceItems) {
    const hasMatch = targetItems.some((target) => {
      if (source.compact && source.compact === target.compact) return true
      return wordOverlap(source.normalized, target.normalized) >= 0.45
    })

    if (hasMatch) matched++
  }

  const ratio = sourceItems.length ? matched / sourceItems.length : 0

  if (ratio >= 0.75) {
    return {
      label: 'Objectifs fortement repris',
      description:
        'Les objectifs définis au bilan se retrouvent largement dans les objectifs du suivi.',
      matched,
      total: sourceItems.length,
      ratio,
    }
  }

  if (ratio >= 0.35) {
    return {
      label: 'Objectifs partiellement repris',
      description:
        'Une partie des objectifs du bilan est visible dans le suivi, avec sélection ou reformulation.',
      matched,
      total: sourceItems.length,
      ratio,
    }
  }

  return {
    label: 'Objectifs faiblement repris',
    description:
      'Les objectifs du suivi paraissent peu reliés aux repères explicitement formulés dans le bilan.',
    matched,
    total: sourceItems.length,
    ratio,
  }
}

function avg(values: number[]) {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function computeGlobalSessionScore(session: TherapySessionLike) {
  const values = [
    session.emotional_score,
    session.body_score,
    session.awareness_score,
    session.dynamic_score,
    session.symbolic_score,
    session.regulation_score,
    session.engagement_score,
  ].filter((v): v is number => typeof v === 'number')

  if (!values.length) return 0
  return avg(values) * 10
}

function compareClinicalTrajectory(therapySessions: TherapySessionLike[]) {
  if (therapySessions.length < 2) {
    return {
      label: 'Trajectoire encore peu lisible',
      description:
        'Le nombre de séances ATPE est encore insuffisant pour apprécier une dynamique clinique fiable.',
      delta: null as number | null,
    }
  }

  const ordered = [...therapySessions].sort((a, b) => {
    const da = a.session_number ?? 0
    const db = b.session_number ?? 0
    return da - db
  })

  const first = computeGlobalSessionScore(ordered[0])
  const last = computeGlobalSessionScore(ordered[ordered.length - 1])
  const delta = Math.round((last - first) * 10) / 10

  if (delta >= 10) {
    return {
      label: 'Évolution cliniquement favorable',
      description:
        'Le suivi montre une progression globale cohérente avec une dynamique thérapeutique positive.',
      delta,
    }
  }

  if (delta >= 0) {
    return {
      label: 'Évolution modérément favorable',
      description:
        'Le suivi paraît globalement stable ou légèrement progressif, sans rupture négative nette.',
      delta,
    }
  }

  if (delta <= -10) {
    return {
      label: 'Évolution à surveiller',
      description:
        'La dynamique observée montre une baisse notable qui appelle une relecture clinique du cadre ou des objectifs.',
      delta,
    }
  }

  return {
    label: 'Évolution fluctuante',
    description:
      'La trajectoire apparaît irrégulière, sans amélioration consolidée ni effondrement massif.',
    delta,
  }
}

function getOverallContinuity(args: {
  frameLevel: 'high' | 'medium' | 'low'
  objectivesRatio: number
  trajectoryDelta: number | null
  hasEpisode: boolean
}) {
  if (!args.hasEpisode) {
    return {
      label: 'Pas de suivi relié',
      description:
        'La comparaison clinique intelligente nécessite un épisode thérapeutique relié au bilan.',
    }
  }

  if (
    args.frameLevel === 'high' &&
    args.objectivesRatio >= 0.75 &&
    (args.trajectoryDelta === null || args.trajectoryDelta >= 0)
  ) {
    return {
      label: 'Continuité clinique forte',
      description:
        'Le suivi reprend de façon cohérente le bilan, tant sur le cadre que sur les objectifs et la dynamique observée.',
    }
  }

  if (
    args.frameLevel === 'low' ||
    args.objectivesRatio < 0.35 ||
    (args.trajectoryDelta !== null && args.trajectoryDelta <= -10)
  ) {
    return {
      label: 'Continuité clinique fragile',
      description:
        'Le passage du bilan à la prise en charge présente des écarts importants ou une dynamique peu conforme aux attentes.',
    }
  }

  return {
    label: 'Continuité clinique intermédiaire',
    description:
      'Le relais entre bilan et suivi existe, mais il gagnerait à être davantage harmonisé ou explicité.',
  }
}

export function ExpressionAssessmentSmartComparison({
  assessment,
  episode,
  assessmentObjectives,
  therapyGoals,
  therapySessions,
}: Props) {
  const analysis = useMemo(() => {
    const frame = compareRecommendationAndFrame(
      assessment.final_recommendation,
      assessment.proposed_modalities,
      episode
    )

    const objectives = compareObjectives(
      assessmentObjectives,
      therapyGoals,
      assessment.initial_objectives
    )

    const trajectory = compareClinicalTrajectory(therapySessions)

    const overall = getOverallContinuity({
      frameLevel: frame.level,
      objectivesRatio: objectives.ratio,
      trajectoryDelta: trajectory.delta,
      hasEpisode: Boolean(episode?.id),
    })

    return {
      frame,
      objectives,
      trajectory,
      overall,
    }
  }, [assessment, episode, assessmentObjectives, therapyGoals, therapySessions])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Lecture de continuité avancée</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Comparatif clinique intelligent
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {analysis.overall.label}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Conclusion synthétique
        </div>
        <div className="mt-2 text-lg font-semibold text-slate-900">
          {analysis.overall.label}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {analysis.overall.description}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cadre recommandé vs réel
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {analysis.frame.label}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {analysis.frame.description}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reprise des objectifs
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {analysis.objectives.label}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {analysis.objectives.description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {analysis.objectives.matched}/{analysis.objectives.total} repéré(s)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dynamique clinique réelle
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {analysis.trajectory.label}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {analysis.trajectory.description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {analysis.trajectory.delta === null
              ? 'Delta non calculable'
              : `Delta global : ${analysis.trajectory.delta > 0 ? '+' : ''}${analysis.trajectory.delta}`}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bilan expressionnel
          </div>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div>
              <div className="font-medium text-slate-900">Recommandation finale</div>
              <p className="mt-1 whitespace-pre-wrap">
                {assessment.final_recommendation || 'Non renseignée'}
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900">Cadre proposé</div>
              <p className="mt-1 whitespace-pre-wrap">
                {assessment.proposed_modalities || 'Non renseigné'}
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900">Objectifs initiaux</div>
              <p className="mt-1 whitespace-pre-wrap">
                {assessment.initial_objectives || 'Non renseignés'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Suivi ATPE réel
          </div>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div>
              <div className="font-medium text-slate-900">Indication clinique</div>
              <p className="mt-1 whitespace-pre-wrap">
                {episode?.clinical_indication || 'Non renseignée'}
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900">Cadre appliqué</div>
              <p className="mt-1 whitespace-pre-wrap">
                {episode?.therapeutic_frame || 'Non renseigné'}
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900">Résumé des objectifs</div>
              <p className="mt-1 whitespace-pre-wrap">
                {episode?.objectives_summary || 'Non renseigné'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}