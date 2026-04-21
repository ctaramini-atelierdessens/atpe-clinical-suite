'use client'

import { useEffect, useState } from 'react'
import { PatientRadarChart } from './patient-radar-chart'

type Props = {
  patientId: string
}

type ClinicalProfile = {
  id: string
  output_json?: any
}

export function PatientExpertV2Card({ patientId }: Props) {
  const [data, setData] = useState<ClinicalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/patient-expert-v2?patientId=${patientId}`)
        const json = await res.json()
        setData(json.profile ?? null)
      } catch (e) {
        console.error('Erreur chargement profil V2', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId])

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Chargement du profil expert…
      </div>
    )
  }

  if (!data || !data.output_json) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Aucun profil clinique disponible
      </div>
    )
  }

  const profile = data.output_json

  return (
    <div className="rounded-2xl border p-5 bg-white shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">🧠 Profil expert V2</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Charge clinique :</strong>{' '}
          {profile.clinicalLoad ?? '—'}
        </div>

        <div>
          <strong>Modalité dominante :</strong>{' '}
          {profile.dominantModality ?? '—'}
        </div>

        <div>
          <strong>Entrée thérapeutique :</strong>{' '}
          {profile.entryMode ?? '—'}
        </div>

        <div>
          <strong>Stratégie séance :</strong>{' '}
          {profile.sessionStrategy ?? '—'}
        </div>
      </div>

      <div className="text-sm">
        <strong>Profils détectés :</strong>{' '}
        {profile.profiles?.length
          ? profile.profiles.join(', ')
          : '—'}
      </div>

      <div className="text-sm">
        <strong>Risques :</strong>
        <ul className="list-disc ml-5">
          {profile.risks?.length
            ? profile.risks.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))
            : <li>Aucun</li>}
        </ul>
      </div>

      <div className="text-sm">
        <strong>Recommandations :</strong>
        <ul className="list-disc ml-5">
          {profile.recommendations?.length
            ? profile.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))
            : <li>Aucune</li>}
        </ul>
      </div>

      {/* 🔥 RADAR CLINIQUE */}
      <PatientRadarChart
        scores={{
          emotion: profile.scores?.emotion ?? 50,
          corps: profile.scores?.corps ?? 50,
          conscience: profile.scores?.conscience ?? 50,
          dynamique: profile.scores?.dynamique ?? 50,
          symbolique: profile.scores?.symbolique ?? 50,
        }}
      />
    </div>
  )
}