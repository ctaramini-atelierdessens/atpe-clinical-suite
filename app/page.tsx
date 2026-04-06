import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ClipboardCheck, FileCheck2, FolderKanban, Users } from 'lucide-react'
import { KpiCard } from '@/components/kpi-card'
import { ChecklistBoard } from '@/components/checklist-board'
import { RiskTable } from '@/components/risk-table'
import { SessionTrend } from '@/components/session-trend'
import { PatientList } from '@/components/patient-list'
import { AuthButton } from '@/components/auth-button'
import { getAppContext } from '@/lib/atpe/app-context'

export default async function HomePage() {
  const { supabase, user, organization } = await getAppContext()

  if (!user) redirect('/login')

  const [patientsRes, sessionsRes, checklistRes, risksRes, auditRes] = await Promise.all([
    supabase.from('patients').select('*').order('created_at', { ascending: false }),
    supabase.from('sessions').select('*').order('session_date', { ascending: false }).limit(8),
    organization ? supabase.from('checklist_items').select('*').eq('organization_id', organization.id).order('phase').order('created_at') : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('risk_items').select('*').eq('organization_id', organization.id).order('severity', { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    organization ? supabase.from('audit_logs').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(12) : Promise.resolve({ data: [] as any[] }),
  ])

  const patients = patientsRes.data ?? []
  const sessions = sessionsRes.data ?? []
  const checklistItems = checklistRes.data ?? []
  const risks = risksRes.data ?? []
  const audits = auditRes.data ?? []

  const criticalTasks = checklistItems.filter((item) => item.priority === 'Critique').length
  const blockedTasks = checklistItems.filter((item) => item.status === 'Bloqué').length
  const openRisks = risks.filter((item) => item.status !== 'Clos').length

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-brand-700 to-brand-500 p-8 text-white md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Dashboard clinique v2</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pilotage ATPE + écrans métier patient / séance / consentement / objectifs</h1>
          <p className="mt-3 max-w-3xl text-brand-50/90">Données réelles Supabase, visualisation descriptive, édition écran par écran, import Excel auto et cockpit clinique intelligent sans recommandation automatisée.</p>
        </div>
        <div className="flex items-center gap-3">
          <AuthButton email={user.email} />
          <Link href="/imports/excel" className="rounded-2xl bg-white px-4 py-2 font-medium text-brand-700 transition hover:bg-brand-50">
            Sync Excel auto
          </Link>
          <Link href="/dashboard/intelligent" className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/15">
            Dashboard intelligent
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Patients actifs" value={patients.length} hint="Dossiers visibles selon tes règles RLS" />
        <KpiCard title="Tâches critiques" value={criticalTasks} hint="Items 30-60-90 à traiter" />
        <KpiCard title="Tâches bloquées" value={blockedTasks} tone={blockedTasks > 0 ? 'danger' : 'default'} />
        <KpiCard title="Risques ouverts" value={openRisks} tone={openRisks > 0 ? 'danger' : 'success'} />
        <KpiCard title="Sync Excel" value="Auto" hint="Import structuré vers Supabase" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-brand-600" />
            <h2 className="text-xl font-semibold">Checklist de mise en conformité</h2>
          </div>
          <ChecklistBoard items={checklistItems} />
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <Users className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-semibold">Patients récents</h2>
            </div>
            <PatientList patients={patients.slice(0, 6)} />
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-brand-600" />
              <div>
                <h2 className="text-xl font-semibold">Écrans v2 branchés</h2>
                <p className="text-sm text-slate-500">Création/édition patient, séance, consentement, objectifs, audit.</p>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-600">
              <Link href="/patients/new" className="rounded-2xl border border-slate-200 px-3 py-2 hover:bg-slate-50">Créer un patient</Link>
              <Link href="/patients" className="rounded-2xl border border-slate-200 px-3 py-2 hover:bg-slate-50">Ouvrir les dossiers</Link>
              <Link href="/audit" className="rounded-2xl border border-slate-200 px-3 py-2 hover:bg-slate-50">Consulter l’audit log</Link>
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-brand-600" />
              <div>
                <h2 className="text-xl font-semibold">Positionnement produit</h2>
                <p className="text-sm text-slate-500">Descriptif, traçable, sans recommandation automatisée.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Recueil des séances et visualisation des tendances</li>
              <li>• Gestion patient, consentements et objectifs thérapeutiques</li>
              <li>• Pas de diagnostic, pas de moteur de décision patient-spécifique</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SessionTrend sessions={sessions} />
        <RiskTable items={risks} />
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="text-xl font-semibold">Audit log récent</h2>
            <p className="text-sm text-slate-500">Dernières actions tracées dans l’interface.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {audits.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-medium text-slate-900">{item.entity_type}</p>
              <p className="mt-1 text-slate-500">{item.action}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString('fr-FR')}</p>
            </div>
          ))}
          {!audits.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Aucune action tracée pour le moment.</div> : null}
        </div>
      </section>
    </div>
  )
}
