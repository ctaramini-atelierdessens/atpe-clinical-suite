import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AuditLogList } from '@/components/audit-log-list'
import { DocumentVaultList } from '@/components/document-vault'
import { ExportButtons } from '@/components/export-buttons'
import { PatientAccessLogList } from '@/components/patient-access-log-list'
import { PatientTimeline } from '@/components/patient-timeline'
import { ReviewRequestList, ReviewRequestForm } from '@/components/review-workflow'
import { SectionCard } from '@/components/section-card'
import { getAppContext, insertAuditLog, insertPatientAccessLog } from '@/lib/atpe/app-context'
import { canCreateOrEdit, canExport } from '@/lib/atpe/rbac'

function scoreBadge(value: number) {
  return <span className="badge bg-brand-50 text-brand-700">{value}/10</span>
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, membership, organization, user } = await getAppContext()

  const [{ data: patient }, { data: episode }, { data: sessions }, { data: consents }, { data: auditLogs }, { data: reviewRequests }, { data: documents }, { data: accessLogs }, { data: supervisors }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase.from('therapy_episodes').select('*').eq('patient_id', id).order('opened_on', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('active_patient_sessions').select('*').eq('patient_id', id).order('session_number', { ascending: true }),
    supabase.from('patient_consents').select('*').eq('patient_id', id).order('recorded_at', { ascending: false }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(120),
    supabase.from('clinical_review_requests').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    supabase.from('patient_documents').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(8),
    supabase.from('patient_access_logs').select('*').eq('patient_id', id).order('accessed_at', { ascending: false }).limit(20),
    organization
      ? supabase
          .from('organization_memberships')
          .select('user_id, role')
          .eq('organization_id', organization.id)
          .in('role', ['supervisor', 'admin', 'owner'])
      : Promise.resolve({ data: [] as any[] }),
  ])

  if (!patient) notFound()

  if (organization) {
    await Promise.all([
      insertPatientAccessLog({
        organizationId: organization.id,
        patientId: id,
        actorUserId: user.id,
        accessScope: 'patient_overview',
        route: `/patients/${id}`,
      }),
      insertAuditLog({
        organizationId: organization.id,
        actorUserId: user.id,
        entityType: 'patient',
        entityId: id,
        action: 'read',
        metadata: { route: `/patients/${id}` },
      }),
    ])
  }

  const [{ data: goals }, { data: noteVersions }, { data: signatures }] = await Promise.all([
    episode
      ? supabase.from('therapy_goals').select('*').eq('episode_id', episode.id).is('deleted_at', null).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    sessions?.length
      ? supabase.from('session_note_versions').select('*').in('session_id', sessions.map((session) => session.id)).order('version_number', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    consents?.length
      ? supabase.from('consent_signatures').select('*').in('consent_id', consents.map((consent) => consent.id)).order('signed_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
  ])

  const patientAuditLogs = (auditLogs ?? [])
    .filter(
      (log: any) =>
        log.entity_id === id ||
        (log.metadata && typeof log.metadata === 'object' && 'patientId' in log.metadata && String((log.metadata as any).patientId) === id),
    )
    .slice(0, 15)

  const versionsBySession = ((noteVersions ?? []) as any[]).reduce((acc, item) => {
    const key = String(item.session_id)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Dossier patient</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{patient.code}</h1>
            <p className="mt-3 text-sm text-slate-500">
              Statut : {patient.status} · Initiales : {patient.initials ?? '—'} · Premier contact : {patient.first_contact_on ?? '—'}
            </p>
            {patient.deleted_at ? <p className="mt-2 text-sm font-medium text-rose-700">Dossier archivé le {new Date(patient.deleted_at).toLocaleString('fr-FR')}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canCreateOrEdit(membership?.role) ? <Link href={`/patients/${id}/edit`} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Éditer patient</Link> : null}
            {canCreateOrEdit(membership?.role) ? <Link href={`/patients/${id}/sessions/new`} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">Nouvelle séance</Link> : null}
            <Link href={`/patients/${id}/consents`} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Consentements</Link>
            <Link href={`/patients/${id}/goals`} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Objectifs</Link>
            <Link href={`/patients/${id}/documents`} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Coffre documentaire</Link>
            <ExportButtons patientId={id} disabled={!canExport(membership?.role)} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Épisode thérapeutique" description="Vue synthétique du suivi principal.">
          {episode ? (
            <div className="space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-slate-800">Libellé :</span> {episode.episode_label}</p>
              <p><span className="font-medium text-slate-800">Statut :</span> {episode.status}</p>
              <p><span className="font-medium text-slate-800">Cadre thérapeutique :</span> {episode.therapeutic_frame ?? '—'}</p>
              <p><span className="font-medium text-slate-800">Indication clinique :</span> {episode.clinical_indication ?? '—'}</p>
              <p><span className="font-medium text-slate-800">Résumé objectifs :</span> {episode.objectives_summary ?? '—'}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucun épisode trouvé.</p>
          )}
        </SectionCard>

        <SectionCard title="Consentements" description="États courants visibles dans le dossier." actions={<Link href={`/patients/${id}/consents`} className="text-sm font-medium text-brand-700">Gérer</Link>}>
          <div className="space-y-3">
            {(consents ?? []).slice(0, 4).map((consent) => (
              <div key={consent.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <span className="font-medium text-slate-800">{consent.consent_kind}</span>
                <span className="badge bg-slate-100 text-slate-700">{consent.status}</span>
              </div>
            ))}
            {!consents?.length ? <p className="text-sm text-slate-500">Aucun consentement saisi.</p> : null}
            {!!signatures?.length ? <p className="text-xs text-slate-500">{signatures.length} signature(s) liées aux consentements.</p> : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Objectifs thérapeutiques" description="Création et édition écran par écran." actions={<Link href={`/patients/${id}/goals`} className="text-sm font-medium text-brand-700">Gérer</Link>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(goals ?? []).map((goal) => (
            <div key={goal.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                <span className="badge bg-slate-100 text-slate-700">{goal.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Priorité : {goal.priority}</p>
              {goal.description ? <p className="mt-3 text-sm text-slate-600">{goal.description}</p> : null}
            </div>
          ))}
          {!goals?.length ? <p className="text-sm text-slate-500">Aucun objectif saisi.</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="Séances" description="Table opérationnelle avec édition, versions de notes et accès aux exports serveur.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Scores</th>
                <th className="px-5 py-3 font-medium">Résumé</th>
                <th className="px-5 py-3 font-medium">Versions</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(sessions ?? []).map((session) => (
                <tr key={session.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 font-medium text-slate-800">{session.session_number}</td>
                  <td className="px-5 py-4 text-slate-600">{session.session_date}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {scoreBadge(session.emotional_score)}
                      {scoreBadge(session.body_score)}
                      {scoreBadge(session.awareness_score)}
                      {scoreBadge(session.dynamic_score)}
                      {scoreBadge(session.symbolic_score)}
                      {scoreBadge(session.regulation_score)}
                      {scoreBadge(session.engagement_score)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{session.clinical_summary ?? session.note ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{versionsBySession?.[session.id]?.length ?? 0}</td>
                  <td className="px-5 py-4 text-right">
                    {canCreateOrEdit(membership?.role) ? <Link href={`/patients/${id}/sessions/${session.id}/edit`} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Éditer</Link> : null}
                  </td>
                </tr>
              ))}
              {!sessions?.length ? (
                <tr>
                  <td className="px-5 py-6 text-sm text-slate-500" colSpan={6}>Aucune séance enregistrée.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Timeline clinique multi-séances" description="Lecture chronologique continue du processus thérapeutique avec historique des versions par note clinique.">
        <PatientTimeline sessions={(sessions ?? []) as any} versionsBySession={versionsBySession} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Coffre documentaire" description="Pièces versées dans le stockage sécurisé du dossier." actions={<Link href={`/patients/${id}/documents`} className="text-sm font-medium text-brand-700">Voir tout</Link>}>
          <DocumentVaultList items={(documents ?? []) as any} />
        </SectionCard>

        <SectionCard title="Workflow validation superviseur" description="Soumission, revue et décision dans le dossier patient." actions={<Link href="/reviews" className="text-sm font-medium text-brand-700">Tableau global</Link>}>
          <div className="space-y-4">
            {canCreateOrEdit(membership?.role) ? <ReviewRequestForm patientId={id} supervisors={(supervisors ?? []) as any} /> : null}
            <ReviewRequestList items={(reviewRequests ?? []) as any} role={membership?.role} patientId={id} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Audit log patient" description="Traçabilité visible directement dans le dossier." actions={<Link href="/audit" className="text-sm font-medium text-brand-700">Voir tout</Link>}>
          <AuditLogList items={patientAuditLogs as any} />
        </SectionCard>
        <SectionCard title="Journal d’accès du dossier" description="Qui a consulté le dossier et sur quel écran.">
          <PatientAccessLogList items={(accessLogs ?? []) as any} />
        </SectionCard>
      </div>
    </div>
  )
}
