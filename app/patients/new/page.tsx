import { PatientForm } from '@/components/forms/patient-form'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function NewPatientPage() {
  await getAppContext()
  return <PatientForm />
}
