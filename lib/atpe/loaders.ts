import { createClient } from "@/lib/supabase/server"
import { getPatientClinicalOverview } from "@/lib/atpe/clinical-services"
import { resolveAtpeCase } from "@/resolve-atpe-case"

type LoaderResult = {
  overview: Awaited<ReturnType<typeof getPatientClinicalOverview>>
  atpe: Awaited<ReturnType<typeof resolveAtpeCase>>
}

export async function loadPatientDashboardData(patientId: string): Promise<LoaderResult> {
  const supabase = await createClient()

  const [overview, atpe] = await Promise.all([
    getPatientClinicalOverview(patientId, supabase),
    resolveAtpeCase(patientId),
  ])

  return {
    overview,
    atpe,
  }
}