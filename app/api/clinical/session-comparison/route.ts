import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

type AdvancedRow = {
  id: string
  session_id: string | null
  created_at: string | null
  frame_containment: number | null
  bodily_engagement: number | null
  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null
  patient_engagement_level: number | null
  projective_intensity: number | null
  therapist_presence_quality: number | null
  clinical_hypotheses: string | null
  next_step_recommendation: string | null
  medium_primary: string | null
  medium_secondary: string | null
}

type MetricKey =
  | 'frame_containment'
  | 'bodily_engagement'
  | 'primary_symbolization'
  | 'secondary_symbolization'
  | 'relational_availability'
  | 'creative_mobility'
  | 'patient_engagement_level'
  | 'projective_intensity'
  | 'therapist_presence_quality'

const METRIC_LABELS: Record<MetricKey, string> = {
  frame_containment: 'Cadre',
  bodily_engagement: 'Corps',
  primary_symbolization: 'Symbolisation primaire',
  secondary_symbolization: 'Symbolisation secondaire',
  relational_availability: 'Disponibilité relationnelle',
  creative_mobility: 'Mobilité créative',
  patient_engagement_level: 'Engagement',
  projective_intensity: 'Intensité projective',
  therapist_presence_quality: 'Présence thérapeutique',
}

function clamp(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function diffDirection(diff: number) {
  if (diff >= 8) return 'up'
  if (diff <= -8) return 'down'
  return 'stable'
}

function buildNarrative(current: AdvancedRow | null, previous: AdvancedRow | null) {
  if (!current && !previous) {
    return 'Aucune donnée de comparaison disponible.'
  }

  if (current && !previous) {
    return 'Une seule séance avancée est disponible. La comparaison N / N-1 sera possible à partir de la séance suivante.'
  }

  if (!current || !previous) {
    return 'Comparaison incomplète.'
  }

  const frameDiff = clamp(current.frame_containment) - clamp(previous.frame_containment)
  const relationDiff =
    clamp(current.relational_availability) - clamp(previous.relational_availability)
  const engagementDiff =
    clamp(current.patient_engagement_level) - clamp(previous.patient_engagement_level)
  const projectiveDiff =
    clamp(current.projective_intensity) - clamp(previous.projective_intensity)

  const chunks: string[] = []

  if (frameDiff >= 8) {
    chunks.push('Le cadre paraît plus contenant que lors de la séance précédente.')
  } else if (frameDiff <= -8) {
    chunks.push('Le sentiment de contenance du cadre paraît en baisse.')
  }

  if (relationDiff >= 8) {
    chunks.push('La disponibilité relationnelle progresse.')
  } else if (relationDiff <= -8) {
    chunks.push('La disponibilité relationnelle se fragilise.')
  }

  if (engagementDiff >= 8) {
    chunks.push('L’engagement du patient augmente de façon significative.')
  } else if (engagementDiff <= -8) {
    chunks.push('L’engagement du patient diminue de façon notable.')
  }

  if (projectiveDiff >= 8) {
    chunks.push('L’intensité projective augmente et mérite une vigilance clinique accrue.')
  } else if (projectiveDiff <= -8) {
    chunks.push('La charge projective semble diminuer.')
  }

  if (!chunks.length) {
    chunks.push('Le profil reste globalement stable entre les deux séances.')
  }

  return chunks.join(' ')
}

function buildAlerts(current: AdvancedRow | null, previous: AdvancedRow | null) {
  const alerts: Array<{
    level: 'info' | 'warning' | 'critical'
    title: string
    message: string
  }> = []

  if (!current) return alerts

  const currentFrame = clamp(current.frame_containment)
  const currentRelation = clamp(current.relational_availability)
  const currentEngagement = clamp(current.patient_engagement_level)
  const currentProjection = clamp(current.projective_intensity)
  const currentPrimary = clamp(current.primary_symbolization)
  const currentSecondary = clamp(current.secondary_symbolization)

  const prevFrame = clamp(previous?.frame_containment)
  const prevRelation = clamp(previous?.relational_availability)
  const prevEngagement = clamp(previous?.patient_engagement_level)
  const prevProjection = clamp(previous?.projective_intensity)

  if (currentFrame < 40) {
    alerts.push({
      level: 'critical',
      title: 'Cadre peu contenant',
      message:
        'Le niveau de contenance du cadre est bas. Il est préférable de resserrer le dispositif, réduire les sollicitations et renforcer la ritualisation.',
    })
  }

  if (currentRelation < 40 && currentEngagement < 40) {
    alerts.push({
      level: 'warning',
      title: 'Risque de retrait',
      message:
        'La combinaison disponibilité relationnelle basse + engagement bas évoque un risque de retrait ou de désinvestissement.',
    })
  }

  if (currentProjection >= 70 && currentFrame < 60) {
    alerts.push({
      level: 'critical',
      title: 'Tension projective élevée',
      message:
        'L’intensité projective est élevée alors que la contenance du cadre reste moyenne ou basse. Vigilance supervision recommandée.',
    })
  }

  if (currentPrimary >= 60 && currentSecondary <= 35) {
    alerts.push({
      level: 'info',
      title: 'Symbolisation primaire active',
      message:
        'La symbolisation primaire est mobilisée mais l’élaboration secondaire reste fragile. Éviter une verbalisation trop rapide.',
    })
  }

  if (previous) {
    if (currentEngagement - prevEngagement <= -15) {
      alerts.push({
        level: 'warning',
        title: 'Baisse marquée de l’engagement',
        message:
          'L’engagement a chuté de manière significative entre N-1 et N. Revoir le rythme, le médium ou les conditions d’installation.',
      })
    }

    if (currentRelation - prevRelation <= -15) {
      alerts.push({
        level: 'warning',
        title: 'Fragilisation relationnelle',
        message:
          'La disponibilité relationnelle diminue nettement par rapport à la séance précédente.',
      })
    }

    if (currentFrame - prevFrame >= 15 && currentEngagement - prevEngagement >= 10) {
      alerts.push({
        level: 'info',
        title: 'Réponse positive au cadre',
        message:
          'L’amélioration conjointe du cadre et de l’engagement suggère que le resserrage ou la stabilité du dispositif soutient bien le processus.',
      })
    }

    if (currentProjection - prevProjection >= 15) {
      alerts.push({
        level: 'warning',
        title: 'Montée projective',
        message:
          'La charge projective augmente nettement par rapport à N-1. Relecture supervision utile.',
      })
    }
  }

  return alerts
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const sessionId = searchParams.get('sessionId')

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre patientId est requis.' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('atpe_session_advanced')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      )
    }

    const rows = (Array.isArray(data) ? data : []) as AdvancedRow[]

    const current =
      (sessionId
        ? rows.find((row) => row.session_id === sessionId)
        : rows[0]) ?? null

    const currentIndex = current ? rows.findIndex((row) => row.id === current.id) : -1
    const previous = currentIndex >= 0 ? rows[currentIndex + 1] ?? null : null

    const metrics = (Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => {
      const currentValue = clamp(current?.[key] ?? 0)
      const previousValue = clamp(previous?.[key] ?? 0)
      const diff = currentValue - previousValue

      return {
        key,
        label: METRIC_LABELS[key],
        currentValue,
        previousValue,
        diff,
        direction: diffDirection(diff),
      }
    })

    return NextResponse.json({
      success: true,
      current,
      previous,
      metrics,
      narrative: buildNarrative(current, previous),
      alerts: buildAlerts(current, previous),
    })
  } catch (error) {
    console.error('GET /api/clinical/session-comparison error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de calculer la comparaison clinique.',
      },
      { status: 500 },
    )
  }
}