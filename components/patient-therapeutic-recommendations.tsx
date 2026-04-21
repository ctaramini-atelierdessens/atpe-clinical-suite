'use client'

import { useMemo } from 'react'
import { usePatientClinicalProfile } from '@/hooks/use-patient-clinical-profile'

type SessionLike = {
  id: string
  session_number: number
  emotional_score: number
  body_score: number
  awareness_score: number
  dynamic_score: number
  symbolic_score: number
  regulation_score: number
  engagement_score: number
}

type Props = {
  sessions: SessionLike[]
  patientId?: string
}

export function PatientTherapeuticRecommendations({
  sessions,
  patientId,
}: Props) {
  const { profile } = usePatientClinicalProfile(patientId)

  const latestSession = sessions.at(-1)

  const recommendations = useMemo(() => {
    if (!latestSession) return []

    const items: string[] = []

    if (profile.priorities.regulationPriority) {
      items.push(
        'Introduire une médiation à forte valeur contenante avec séquences courtes, repères stables et temps de retour au calme.'
      )
    }

    if (profile.priorities.sensoryPriority) {
      items.push(
        'Privilégier une entrée sensorielle progressive : matières rassurantes, variations tactiles limitées, souffle et ancrage corporel.'
      )
    }

    if (profile.priorities.relationalPriority) {
      items.push(
        'Renforcer l’alliance par des consignes souples, une co-présence explicite et des temps de validation clinique.'
      )
    }

    if (profile.priorities.expressivePriority) {
      items.push(
        'Favoriser une médiation expressive modulable : geste, couleur, rythme ou voix selon la disponibilité du moment.'
      )
    }

    if (profile.priorities.symbolicPriority) {
      items.push(
        'Soutenir la mise en sens à partir des motifs récurrents, des métaphores émergentes et du récit de l’œuvre.'
      )
    }

    if (profile.priorities.autonomyPriority) {
      items.push(
        'Augmenter les marges de choix du patient : sélection du médium, organisation du déroulé et rythme de clôture.'
      )
    }

    if (profile.priorities.participationPriority) {
      items.push(
        'Stabiliser le rituel d’entrée dans l’activité pour sécuriser la participation et soutenir la continuité séance après séance.'
      )
    }

    if (profile.priorities.intermodalPriority) {
      items.push(
        'Organiser des passages guidés entre deux médiums pour favoriser la circulation intermodale sans rupture tonique.'
      )
    }

    if (!items.length) {
      items.push(
        'Poursuivre une observation clinique globale avec médiation adaptée à la tolérance actuelle du patient.'
      )
    }

    return items
  }, [latestSession, profile])

  if (!latestSession) {
    return null
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Pilotage thérapeutique</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Recommandations thérapeutiques
          </h2>
        </div>

        {profile.focusAreas.length ? (
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Priorités : {profile.focusAreas.join(' · ')}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        {recommendations.map((item, index) => (
          <div
            key={`${index}-${item}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">{profile.summary}</p>
    </div>
  )
}