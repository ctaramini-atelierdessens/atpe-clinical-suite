import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAppContext } from '@/lib/atpe/app-context'
import { LockedExportPrintButton } from '@/components/locked-export-print-button'
import { PrintCloseButton } from '@/components/print-close-button'
import { computeAtpeExpertResult, type AtpeInput } from '@/lib/atpe-expert'

type PageProps = {
  params: Promise<{ id: string }>
}

async function getPrintData(id: string) {
  const { supabase } = await getAppContext()

  const [{ data: patient }, { data: sessions }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('active_patient_sessions')
      .select('*')
      .eq('patient_id', id)
      .order('session_number', { ascending: true }),
  ])

  return {
    patient,
    sessions: Array.isArray(sessions) ? (sessions as AtpeInput[]) : [],
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'

  return date.toLocaleString('fr-FR')
}

export default async function PatientPrintPage({ params }: PageProps) {
  const { id } = await params
  const { patient, sessions } = await getPrintData(id)

  if (!patient) {
    notFound()
  }

  const latestSession =
    sessions.length > 0 ? sessions[sessions.length - 1] : null
  const previousSession =
    sessions.length > 1 ? sessions[sessions.length - 2] : null

  const result = computeAtpeExpertResult(latestSession, previousSession)

  return (
    <main className="mx-auto max-w-4xl space-y-6 bg-white p-6 print:max-w-none print:p-0">
      <div className="print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/patients/${id}`}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Retour au dossier
          </Link>

          <LockedExportPrintButton />

          <PrintCloseButton />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold">Impression du dossier patient</h1>
          <p className="mt-1 text-sm text-slate-500">
            Synthèse imprimable du dossier clinique.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Code patient
            </div>
            <div className="mt-2 text-base font-semibold">
              {patient.code ?? 'Patient'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Nombre de séances
            </div>
            <div className="mt-2 text-base font-semibold">{sessions.length}</div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Dernière séance
            </div>
            <div className="mt-2 text-base font-semibold">
              {latestSession?.session_number
                ? `Séance ${latestSession.session_number}`
                : 'Non disponible'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Date d’impression
            </div>
            <div className="mt-2 text-base font-semibold">
              {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Synthèse clinique actuelle</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Score global
              </div>
              <div className="mt-2 text-2xl font-bold">
                {result.globalScore}/100
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Niveau clinique
              </div>
              <div className="mt-2 text-base font-semibold">{result.level}</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Profil
              </div>
              <div className="mt-2 text-base font-semibold">{result.profile}</div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Dimensions cliniques</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Émotion
              </div>
              <div className="mt-2 text-xl font-semibold">
                {result.scores.emotion}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Corps
              </div>
              <div className="mt-2 text-xl font-semibold">
                {result.scores.corps}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Conscience
              </div>
              <div className="mt-2 text-xl font-semibold">
                {result.scores.conscience}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Dynamique
              </div>
              <div className="mt-2 text-xl font-semibold">
                {result.scores.dynamique}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Symbolique
              </div>
              <div className="mt-2 text-xl font-semibold">
                {result.scores.symbolique}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Synthèse expert</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {result.synthesis}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Historique des séances</h2>

          {!sessions.length ? (
            <p className="mt-3 text-sm text-slate-500">
              Aucune séance disponible.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Séance</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Score global</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => {
                    const previous = index > 0 ? sessions[index - 1] : null
                    const sessionResult = computeAtpeExpertResult(
                      session,
                      previous,
                    )

                    return (
                      <tr
                        key={session.created_at ?? `${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <td className="px-3 py-3 text-sm font-medium">
                          {session.session_number
                            ? `Séance ${session.session_number}`
                            : `Séance ${index + 1}`}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {formatDate(session.created_at)}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {sessionResult.globalScore}/100
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}