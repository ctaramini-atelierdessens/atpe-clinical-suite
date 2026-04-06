
import Link from 'next/link'
import { AlertTriangle, ArrowRight, BadgeAlert, CheckCircle2, Clock3, FileSpreadsheet, ShieldAlert, Stethoscope } from 'lucide-react'
import { KpiCard } from '@/components/kpi-card'

type Patient = { id: string; code: string; initials?: string | null; display_name?: string | null; status: string; primary_clinician_id: string | null; created_at: string }
type Consent = { patient_id: string; consent_kind: string; status: string }
type Session = { id: string; patient_id: string; session_date: string; frame_quality: string; regulation_score: number; engagement_score: number }
type Review = { patient_id: string; status: string; updated_at: string }
type ImportJob = { status: string; created_at: string; summary?: any }
type Snapshot = { patient_id: string; snapshot_date: string; current_score: number | null; progression_percent: number | null; duration_days: number | null; imported_name: string | null }

function daysSince(dateValue: string | null | undefined) {
  if (!dateValue) return null
  const diff = Date.now() - new Date(dateValue).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function uniqueLatestByPatient<T extends { patient_id: string }>(rows: T[], getDate: (row: T) => string) {
  const map = new Map<string, T>()
  rows.forEach((row) => {
    const existing = map.get(row.patient_id)
    if (!existing || new Date(getDate(row)).getTime() > new Date(getDate(existing)).getTime()) {
      map.set(row.patient_id, row)
    }
  })
  return map
}

export function IntelligentDashboard({ patients, consents, sessions, reviews, imports, snapshots }: { patients: Patient[]; consents: Consent[]; sessions: Session[]; reviews: Review[]; imports: ImportJob[]; snapshots: Snapshot[] }) {
  const latestSnapshotByPatient = uniqueLatestByPatient(snapshots, (row) => row.snapshot_date)
  const latestSessionByPatient = uniqueLatestByPatient(sessions, (row) => row.session_date)
  const consentMap = consents.reduce((acc, row) => {
    if (!acc[row.patient_id]) acc[row.patient_id] = []
    acc[row.patient_id].push(row)
    return acc
  }, {} as Record<string, Consent[]>)
  const reviewMap = reviews.reduce((acc, row) => {
    if (!acc[row.patient_id]) acc[row.patient_id] = []
    acc[row.patient_id].push(row)
    return acc
  }, {} as Record<string, Review[]>)

  const patientSignals = patients.map((patient) => {
    const snapshot = latestSnapshotByPatient.get(patient.id)
    const session = latestSessionByPatient.get(patient.id)
    const patientConsents = consentMap[patient.id] ?? []
    const patientReviews = reviewMap[patient.id] ?? []
    const signals: string[] = []
    let priority = 0

    const missingCoreConsent = !patientConsents.some((item) => item.consent_kind === 'care' && item.status === 'granted')
    if (missingCoreConsent) {
      signals.push('Consentement de soin non validé')
      priority += 3
    }

    const noRecentSession = !session || (daysSince(session.session_date) ?? 999) > 30
    if (noRecentSession) {
      signals.push('Pas de séance récente (>30 jours)')
      priority += 2
    }

    if ((snapshot?.progression_percent ?? 100) <= 40) {
      signals.push('Progression descriptive basse')
      priority += 2
    }

    if ((snapshot?.current_score ?? 10) <= 4) {
      signals.push('Score global descriptif bas')
      priority += 2
    }

    if ((snapshot?.duration_days ?? 0) >= 90 && (snapshot?.progression_percent ?? 100) <= 50) {
      signals.push('Durée longue avec progression lente')
      priority += 2
    }

    if (session?.frame_quality === 'fragile' || session?.frame_quality === 'rupture') {
      signals.push('Cadre récent fragile/rupture')
      priority += 1
    }

    const pendingReview = patientReviews.some((item) => ['submitted', 'changes_requested'].includes(item.status))
    if (pendingReview) {
      signals.push('Revue superviseur en attente')
      priority += 2
    }

    return { patient, snapshot, session, signals, priority }
  }).sort((a, b) => b.priority - a.priority || a.patient.code.localeCompare(b.patient.code))

  const urgentCount = patientSignals.filter((item) => item.priority >= 5).length
  const missingConsents = patientSignals.filter((item) => item.signals.includes('Consentement de soin non validé')).length
  const dormantCount = patientSignals.filter((item) => item.signals.includes('Pas de séance récente (>30 jours)')).length
  const lowProgressCount = patientSignals.filter((item) => item.signals.includes('Progression descriptive basse')).length
  const importsWithErrors = imports.filter((item) => item.status === 'processed_with_errors' || item.status === 'failed').length
  const latestImport = imports[0]

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Cockpit clinique descriptif</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard clinique intelligent</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-500">
              Lecture descriptive multi-source : séances, consentements, imports Excel et revues superviseur.
              Les signaux affichés aident au repérage organisationnel et ne constituent ni un diagnostic ni une recommandation thérapeutique automatisée.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/imports/excel" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">Nouveau sync Excel</Link>
            <Link href="/patients" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Ouvrir les dossiers</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Patients actifs" value={patients.length} hint="Visibles selon les règles RLS" />
        <KpiCard title="Dossiers à surveiller" value={urgentCount} tone={urgentCount > 0 ? 'danger' : 'success'} />
        <KpiCard title="Consentements manquants" value={missingConsents} tone={missingConsents > 0 ? 'danger' : 'default'} />
        <KpiCard title="Sans séance récente" value={dormantCount} tone={dormantCount > 0 ? 'danger' : 'default'} />
        <KpiCard title="Imports avec erreurs" value={importsWithErrors} tone={importsWithErrors > 0 ? 'danger' : 'success'} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-amber-50 p-3 text-amber-700"><BadgeAlert className="h-5 w-5" /></span>
              <div>
                <h2 className="text-xl font-semibold">Repérages descriptifs</h2>
                <p className="text-sm text-slate-500">Synthèse non décisionnelle pour l’équipe clinique.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200 p-4"><p className="font-medium text-slate-900">Progression basse</p><p className="mt-1 text-slate-500">{lowProgressCount} dossier(s) avec progression ≤ 40% dans le dernier snapshot importé.</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><p className="font-medium text-slate-900">Séances espacées</p><p className="mt-1 text-slate-500">{dormantCount} dossier(s) sans séance récente ou sans séance enregistrée.</p></div>
              <div className="rounded-2xl border border-slate-200 p-4"><p className="font-medium text-slate-900">Consentements à compléter</p><p className="mt-1 text-slate-500">{missingConsents} dossier(s) sans consentement de soin accordé.</p></div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-brand-50 p-3 text-brand-700"><FileSpreadsheet className="h-5 w-5" /></span>
              <div>
                <h2 className="text-xl font-semibold">Dernière synchronisation Excel</h2>
                <p className="text-sm text-slate-500">Source métier secondaire pour enrichir le cockpit.</p>
              </div>
            </div>
            {latestImport ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{new Date(latestImport.created_at).toLocaleString('fr-FR')}</p>
                <p className="mt-2">Statut : {latestImport.status}</p>
                <p className="mt-1">Patients créés : {latestImport.summary?.createdPatients ?? 0} · mis à jour : {latestImport.summary?.updatedPatients ?? 0}</p>
              </div>
            ) : <p className="mt-4 text-sm text-slate-500">Aucun import n’a encore été réalisé.</p>}
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>
              <div>
                <h2 className="text-xl font-semibold">Rappel de sécurité clinique</h2>
                <p className="text-sm text-slate-500">Le cockpit reste descriptif.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• aucun diagnostic généré</li>
              <li>• aucune conduite thérapeutique suggérée</li>
              <li>• uniquement des repères d’organisation, de suivi et de traçabilité</li>
            </ul>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-rose-50 p-3 text-rose-700"><ShieldAlert className="h-5 w-5" /></span>
            <div>
              <h2 className="text-xl font-semibold">Table de priorisation descriptive</h2>
              <p className="text-sm text-slate-500">Classement visuel des dossiers à revoir en équipe.</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Dernier snapshot</th>
                  <th className="px-4 py-3 font-medium">Dernière séance</th>
                  <th className="px-4 py-3 font-medium">Repérages</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {patientSignals.map((item) => (
                  <tr key={item.patient.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{item.patient.display_name ?? item.patient.initials ?? item.patient.code}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.patient.code}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <div className="space-y-1">
                        <p>Score : {item.snapshot?.current_score ?? '—'}</p>
                        <p>Progression : {item.snapshot?.progression_percent ?? '—'}%</p>
                        <p>Durée : {item.snapshot?.duration_days ?? '—'} j</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {item.session ? (
                        <div className="space-y-1">
                          <p>{item.session.session_date}</p>
                          <p>Régulation {item.session.regulation_score}/10 · Engagement {item.session.engagement_score}/10</p>
                          <p>Cadre : {item.session.frame_quality}</p>
                        </div>
                      ) : 'Aucune séance'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.signals.length ? item.signals.map((signal) => (
                          <span key={signal} className={`badge ${item.priority >= 5 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{signal}</span>
                        )) : <span className="badge bg-emerald-50 text-emerald-700">Aucun repérage prioritaire</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/patients/${item.patient.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700">
                        Ouvrir
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!patientSignals.length ? (
                  <tr><td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>Aucune donnée clinique exploitable.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-brand-600" /><h2 className="text-xl font-semibold">Dossiers dormants</h2></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {patientSignals.filter((item) => item.signals.includes('Pas de séance récente (>30 jours)')).slice(0, 6).map((item) => (
              <div key={item.patient.id} className="rounded-2xl border border-slate-200 p-3"><p className="font-medium text-slate-900">{item.patient.display_name ?? item.patient.code}</p><p className="mt-1 text-slate-500">Dernière séance : {item.session?.session_date ?? 'aucune'}</p></div>
            ))}
            {!patientSignals.some((item) => item.signals.includes('Pas de séance récente (>30 jours)')) ? <p className="text-slate-500">Aucun dossier dormant.</p> : null}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3"><Stethoscope className="h-5 w-5 text-brand-600" /><h2 className="text-xl font-semibold">Progression lente</h2></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {patientSignals.filter((item) => item.signals.includes('Progression descriptive basse')).slice(0, 6).map((item) => (
              <div key={item.patient.id} className="rounded-2xl border border-slate-200 p-3"><p className="font-medium text-slate-900">{item.patient.display_name ?? item.patient.code}</p><p className="mt-1 text-slate-500">Progression : {item.snapshot?.progression_percent ?? '—'}% · Score : {item.snapshot?.current_score ?? '—'}</p></div>
            ))}
            {!patientSignals.some((item) => item.signals.includes('Progression descriptive basse')) ? <p className="text-slate-500">Aucun dossier concerné.</p> : null}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-brand-600" /><h2 className="text-xl font-semibold">Consentements à régulariser</h2></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {patientSignals.filter((item) => item.signals.includes('Consentement de soin non validé')).slice(0, 6).map((item) => (
              <div key={item.patient.id} className="rounded-2xl border border-slate-200 p-3"><p className="font-medium text-slate-900">{item.patient.display_name ?? item.patient.code}</p><p className="mt-1 text-slate-500">Dossier à compléter dans l’écran de consentements.</p></div>
            ))}
            {!patientSignals.some((item) => item.signals.includes('Consentement de soin non validé')) ? <p className="text-slate-500">Aucun consentement manquant.</p> : null}
          </div>
        </div>
      </section>
    </div>
  )
}
