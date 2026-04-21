'use client'

import React, { useEffect, useMemo, useState } from 'react'

type PatientLike = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  [key: string]: unknown
}

type AdvancedRow = {
  id: string
  session_id: string
  format: 'individual' | 'group'
  medium_primary: string | null
  medium_secondary: string | null
  atpe_phase_dominant: string | null

  frame_containment: number | null
  bodily_engagement: number | null
  decentering_level: number | null
  centering_level: number | null
  externalization_level: number | null
  work_dialogue_level: number | null
  sharing_level: number | null

  primary_symbolization: number | null
  secondary_symbolization: number | null
  relational_availability: number | null
  creative_mobility: number | null

  projective_intensity: number | null
  group_cohesion: number | null
  group_containment: number | null
  transfer_diffraction: number | null

  therapist_feels_confusion: boolean
  therapist_feels_sudden_fatigue: boolean
  therapist_feels_pressure: boolean
  therapist_feels_irritation: boolean
  therapist_feels_void: boolean
  patient_repeats_without_integration: boolean
  group_feels_same_affect: boolean
  tension_spreads_quickly: boolean

  clinical_hypotheses: string | null
  next_step_recommendation: string | null
  created_at: string
}

type Props = {
  patient?: PatientLike
  patientId?: string
  sessionId?: string
}

type AlertItem = {
  level: 'low' | 'medium' | 'high'
  title: string
  description: string
}

function getPatientName(patient?: PatientLike) {
  if (!patient) return 'Patient'
  if (typeof patient.full_name === 'string' && patient.full_name.trim()) {
    return patient.full_name.trim()
  }
  const first = typeof patient.first_name === 'string' ? patient.first_name.trim() : ''
  const last = typeof patient.last_name === 'string' ? patient.last_name.trim() : ''
  const combined = `${first} ${last}`.trim()
  if (combined) return combined
  if (typeof patient.id === 'string' && patient.id.trim()) return `Patient ${patient.id}`
  return 'Patient'
}

function badgeClass(level: AlertItem['level']) {
  if (level === 'high') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (level === 'medium') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function formatDate(value?: string | null) {
  if (!value) return 'Date non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date non renseignée'
  return date.toLocaleString('fr-FR')
}

function buildAlertsFromRow(row: AdvancedRow | null): AlertItem[] {
  if (!row) {
    return [
      {
        level: 'low',
        title: 'Aucune alerte calculable',
        description:
          'Aucune observation thérapeutique avancée n’est encore enregistrée pour produire des alertes.',
      },
    ]
  }

  const alerts: AlertItem[] = []

  const frameContainment = row.frame_containment ?? 0
  const projectiveIntensity = row.projective_intensity ?? 0
  const primary = row.primary_symbolization ?? 0
  const secondary = row.secondary_symbolization ?? 0
  const groupContainment = row.group_containment ?? 0

  if (frameContainment < 40) {
    alerts.push({
      level: 'high',
      title: 'Cadre faiblement contenant',
      description:
        'Le niveau de contenance du cadre apparaît bas. Un recentrage du dispositif et des limites de séance est recommandé.',
    })
  }

  if (projectiveIntensity >= 60 && frameContainment < 45) {
    alerts.push({
      level: 'high',
      title: 'Risque de débordement projectif',
      description:
        'L’intensité projective élevée combinée à un cadre fragile constitue un point de vigilance clinique majeur.',
    })
  }

  if (primary >= 50 && secondary < 35) {
    alerts.push({
      level: 'medium',
      title: 'Écart entre expression et élaboration',
      description:
        'Le sujet semble pouvoir extérioriser davantage qu’élaborer. Il peut être utile de ralentir la verbalisation et de renforcer la médiation.',
    })
  }

  if (
    row.therapist_feels_confusion ||
    row.therapist_feels_pressure ||
    row.therapist_feels_void ||
    row.therapist_feels_irritation ||
    row.therapist_feels_sudden_fatigue
  ) {
    alerts.push({
      level: 'medium',
      title: 'Éprouvés contre-transférentiels à reprendre',
      description:
        'Des marqueurs de réception projective semblent présents. Reprise en supervision conseillée avant toute interprétation trop rapide.',
    })
  }

  if (
    row.format === 'group' &&
    groupContainment < 45 &&
    projectiveIntensity >= 50
  ) {
    alerts.push({
      level: 'high',
      title: 'Fragilité groupale sous charge projective',
      description:
        'La contenance du groupe paraît insuffisante au regard de la tension projective. Structurer davantage le cadre groupal.',
    })
  }

  if (
    row.group_feels_same_affect &&
    row.tension_spreads_quickly
  ) {
    alerts.push({
      level: 'medium',
      title: 'Possible dépôt projectif groupal',
      description:
        'Une diffusion rapide d’affects similaires dans le groupe suggère une hypothèse prudente de dépôt projectif groupal.',
    })
  }

  if (!alerts.length) {
    alerts.push({
      level: 'low',
      title: 'Pas d’alerte clinique majeure',
      description:
        'Le tableau actuel ne met pas en évidence de signal de rupture majeur. Poursuivre l’observation longitudinale.',
    })
  }

  return alerts
}

export function PatientClinicalAlerts({
  patient,
  patientId,
}: Props) {
  const effectivePatientId =
    patientId || (typeof patient?.id === 'string' ? patient.id : '')

  const [rows, setRows] = useState<AdvancedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!effectivePatientId) {
        setLoading(false)
        setRows([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ patientId: effectivePatientId })
        const response = await fetch(`/api/atpe-advanced-session?${params.toString()}`)
        const payload = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Impossible de charger les alertes.')
        }

        if (!cancelled) {
          setRows(Array.isArray(payload.data) ? payload.data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement.')
          setRows([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [effectivePatientId])

  const latest = rows[0] ?? null
  const alerts = useMemo(() => buildAlertsFromRow(latest), [latest])
  const patientName = getPatientName(patient)

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement des alertes cliniques...</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          Lecture de vigilance clinique pour <span className="font-semibold text-slate-900">{patientName}</span>.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Dernière observation : {formatDate(latest?.created_at)}
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.title}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(alert.level)}`}
              >
                {alert.level === 'high'
                  ? 'Alerte élevée'
                  : alert.level === 'medium'
                  ? 'Vigilance modérée'
                  : 'Stable'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">{alert.description}</p>
          </div>
        ))}
      </div>

      {latest?.clinical_hypotheses ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Hypothèses cliniques enregistrées</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {latest.clinical_hypotheses}
          </p>
        </div>
      ) : null}
    </div>
  )
}