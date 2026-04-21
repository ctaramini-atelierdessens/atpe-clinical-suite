'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  buildPatientClinicalProfile,
  type PatientClinicalProfile,
  type PatientInitialAssessmentData,
} from '@/lib/atpe-clinical-profile'

type ApiResponse = {
  ok: boolean
  assessment: PatientInitialAssessmentData | null
  error?: string
  details?: string
}

const SYNC_KEY = 'atpe:patient-initial-assessment-updated'

export function usePatientClinicalProfile(patientId?: string) {
  const [assessment, setAssessment] = useState<PatientInitialAssessmentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!patientId) {
      setAssessment(null)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/patient-initial-assessments?patientId=${encodeURIComponent(patientId)}`,
        { cache: 'no-store' }
      )

      const data = (await res.json()) as ApiResponse

      if (!res.ok) {
        throw new Error(data?.details || data?.error || 'Erreur de chargement du bilan.')
      }

      setAssessment(data.assessment ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [patientId])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== SYNC_KEY || !event.newValue || !patientId) return

      try {
        const parsed = JSON.parse(event.newValue) as { patientId?: string }
        if (parsed.patientId === patientId) {
          load()
        }
      } catch {
        // ignore
      }
    }

    function handleCustomSync(event: Event) {
      const customEvent = event as CustomEvent<{ patientId?: string }>
      if (customEvent.detail?.patientId === patientId) {
        load()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(
      'atpe:patient-initial-assessment-updated',
      handleCustomSync as EventListener
    )

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(
        'atpe:patient-initial-assessment-updated',
        handleCustomSync as EventListener
      )
    }
  }, [patientId])

  const profile: PatientClinicalProfile = useMemo(() => {
    return buildPatientClinicalProfile(assessment)
  }, [assessment])

  return {
    assessment,
    profile,
    loading,
    error,
    reload: load,
  }
}