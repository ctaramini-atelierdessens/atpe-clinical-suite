import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { GroupIntersubjectivityPanel } from '@/components/group-intersubjectivity-panel'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requireClinicalRole } from '@/lib/auth-server'
import { logSecurityAudit } from '@/lib/security-audit'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

type GroupRow = {
  id: string
  name?: string | null
  title?: string | null
  label?: string | null
  code?: string | null
  reference?: string | null
  created_at?: string | null
  organization_id?: string | null
  clinician_id?: string | null
  status?: string | null
  [key: string]: unknown
}

function getGroupDisplayName(group: GroupRow) {
  const candidates = [group.name, group.title, group.label]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return `Groupe ${group.id}`
}

function getGroupReference(group: GroupRow) {
  const candidates = [group.code, group.reference, group.id]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return group.id
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseigné'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseigné'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function getGroupById(groupId: string): Promise<GroupRow | null> {
  const supabase = getSupabaseServerClient()

  const tableCandidates = ['clinical_groups', 'groups', 'therapy_groups', 'patient_groups']

  for (const tableName of tableCandidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', groupId)
        .single()

      if (!error && data) {
        return data as GroupRow
      }
    } catch {
      // tolérance volontaire
    }
  }

  return null
}

async function getLatestGroupSessionId(groupId: string): Promise<string | null> {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('atpe_session_advanced')
      .select('session_id, created_at')
      .eq('group_id', groupId)
      .eq('format', 'group')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      const row = data[0] as { session_id?: string | null }
      if (typeof row.session_id === 'string' && row.session_id.trim()) {
        return row.session_id.trim()
      }
    }
  } catch {
    // tolérance volontaire
  }

  return null
}

function SafeSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export default async function GroupPage({ params }: PageProps) {
  const session = await requireClinicalRole(['therapist', 'supervisor', 'admin'])

  const { id } = await params

  if (!id || typeof id !== 'string') {
    notFound()
  }

  const group = await getGroupById(id)

  if (!group) {
    notFound()
  }

  await logSecurityAudit({
    actorId: session.profile.user_id,
    groupId: group.id,
    accessType: 'group_access',
    description: 'Consultation du groupe clinique',
    metadata: {
      role: session.profile.role,
    },
  })

  const effectiveSessionId =
    (await getLatestGroupSessionId(group.id)) ?? `group-session-${group.id}`

  const groupName = getGroupDisplayName(group)
  const groupReference = getGroupReference(group)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/groups"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  ← Retour groupes
                </Link>

                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  Référence : {groupReference}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {groupName}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Fiche groupe – vue intersubjective et groupale stabilisée
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  ID groupe
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {group.id}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Créé le
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDate(
                    typeof group.created_at === 'string'
                      ? group.created_at
                      : null,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Statut
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {typeof group.status === 'string' && group.status.trim()
                    ? group.status
                    : 'Non renseigné'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Session utilisée
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {effectiveSessionId}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <SafeSection
            title="Repères groupe"
            description="Informations stables du dispositif groupal."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Nom du groupe
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {groupName}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Référence
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {groupReference}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Organisation
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {typeof group.organization_id === 'string' &&
                  group.organization_id.trim()
                    ? group.organization_id
                    : 'Non renseignée'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Clinicien
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {typeof group.clinician_id === 'string' &&
                  group.clinician_id.trim()
                    ? group.clinician_id
                    : 'Non renseigné'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Statut
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {typeof group.status === 'string' && group.status.trim()
                    ? group.status
                    : 'Non renseigné'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Dernière séance
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {effectiveSessionId}
                </p>
              </div>
            </div>
          </SafeSection>

          <SafeSection
            title="Repère clinique"
            description="Base de lecture groupale stable."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Orientation générale
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Cette page groupe est conçue comme un point d’entrée stable pour
                  la lecture de cohésion, tension, diffusion affective, contenance
                  groupale et circulation projective.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Usage recommandé
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Utiliser cette vue pour relire les séances de groupe comme
                  processus intersubjectif, et non comme simple addition
                  d’observations individuelles.
                </p>
              </div>
            </div>
          </SafeSection>

          <SafeSection
            title="Vue rapide"
            description="Résumé synthétique du cadre groupal."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Le groupe est accessible depuis un socle de lecture stable.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                La dernière séance chargée sert de point d’entrée pour l’analyse.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Les variations de cohésion, tension et contenance sont relues dans
                une logique de transformation groupale.
              </div>
            </div>
          </SafeSection>
        </div>

        <SafeSection
          title="Vue groupe / intersubjectivité"
          description="Cohésion, tension, diffusion affective, contenance groupale, dépôts projectifs et restitution groupale."
        >
          <GroupIntersubjectivityPanel
            patientId={undefined}
            groupId={group.id}
            sessionId={effectiveSessionId}
          />
        </SafeSection>
      </div>
    </main>
  )
}