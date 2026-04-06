create extension if not exists pgcrypto;
create extension if not exists citext;

DO $$ BEGIN
  CREATE TYPE public.membership_role AS ENUM ('owner', 'admin', 'clinician', 'supervisor', 'reader');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.patient_status AS ENUM ('active', 'paused', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.episode_status AS ENUM ('draft', 'active', 'completed', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.goal_status AS ENUM ('planned', 'in_progress', 'achieved', 'paused', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.setting_type AS ENUM ('cabinet', 'institution', 'domicile', 'teleconsultation', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.mediation_type AS ENUM ('arts_plastiques', 'musique', 'ecriture', 'corps_mouvement', 'mixte', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.frame_quality AS ENUM ('stable', 'fragile', 'rupture');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.consent_kind AS ENUM ('care', 'data_processing', 'image_audio', 'research');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.consent_status AS ENUM ('granted', 'refused', 'withdrawn', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.checklist_phase AS ENUM ('0-30', '30-60', '60-90');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.priority_level AS ENUM ('Critique', 'Haute', 'Moyenne', 'Basse');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('À faire', 'En cours', 'Bloqué', 'Validé');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_status AS ENUM ('Ouvert', 'Sous contrôle', 'Clos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.audit_action AS ENUM ('create', 'read', 'update', 'delete', 'export', 'login');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.document_category AS ENUM ('clinical_document', 'consent_signed_attachment', 'identity', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.review_status AS ENUM ('draft', 'submitted', 'approved', 'changes_requested', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  global_role text not null default 'clinician' check (global_role in ('platform_admin', 'clinician')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'clinician',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  primary_clinician_id uuid not null references auth.users(id) on delete restrict,
  code text not null,
  initials text,
  birth_year integer,
  sex text,
  referral_source text,
  case_reference text,
  status public.patient_status not null default 'active',
  first_contact_on date,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table if not exists public.patient_consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  consent_kind public.consent_kind not null,
  status public.consent_status not null default 'granted',
  recorded_at timestamptz not null default now(),
  expires_at timestamptz,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  unique (patient_id, consent_kind)
);

create table if not exists public.consent_signatures (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.patient_consents(id) on delete cascade,
  signer_name text not null,
  signer_role text not null default 'patient',
  signature_mode text not null default 'typed' check (signature_mode in ('typed','drawn')),
  signature_text text,
  signature_data_url text,
  signed_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.therapy_episodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinician_id uuid not null references auth.users(id) on delete restrict,
  episode_label text not null default 'Suivi principal',
  referral_reason text,
  therapeutic_frame text,
  clinical_indication text,
  objectives_summary text,
  status public.episode_status not null default 'active',
  opened_on date not null default current_date,
  closed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.therapy_goals (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.therapy_episodes(id) on delete cascade,
  title text not null,
  description text,
  priority public.goal_priority not null default 'medium',
  status public.goal_status not null default 'planned',
  target_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  episode_id uuid not null references public.therapy_episodes(id) on delete cascade,
  clinician_id uuid not null references auth.users(id) on delete restrict,
  session_number integer not null,
  session_date date not null,
  duration_minutes integer,
  setting_type public.setting_type not null default 'cabinet',
  mediation_type public.mediation_type not null default 'mixte',
  frame_quality public.frame_quality not null default 'stable',
  emotional_score integer not null default 0 check (emotional_score between 0 and 10),
  body_score integer not null default 0 check (body_score between 0 and 10),
  awareness_score integer not null default 0 check (awareness_score between 0 and 10),
  dynamic_score integer not null default 0 check (dynamic_score between 0 and 10),
  symbolic_score integer not null default 0 check (symbolic_score between 0 and 10),
  regulation_score integer not null default 0 check (regulation_score between 0 and 10),
  engagement_score integer not null default 0 check (engagement_score between 0 and 10),
  note text,
  clinical_summary text,
  therapist_hypothesis text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (episode_id, session_number)
);

create table if not exists public.session_note_versions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  version_number integer not null,
  previous_note text,
  previous_clinical_summary text,
  previous_therapist_hypothesis text,
  change_reason text,
  edited_by uuid references auth.users(id) on delete set null,
  edited_at timestamptz not null default now(),
  unique (session_id, version_number)
);

create table if not exists public.session_artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('image', 'audio', 'pdf', 'text', 'other')),
  title text not null,
  storage_path text,
  note text,
  created_at timestamptz not null default now()
);


create table if not exists public.patient_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consent_id uuid references public.patient_consents(id) on delete set null,
  category public.document_category not null default 'clinical_document',
  title text not null,
  file_name text not null,
  mime_type text,
  byte_size bigint,
  storage_bucket text not null default 'clinical-documents',
  storage_path text not null unique,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_access_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  access_scope text not null,
  route text not null,
  accessed_at timestamptz not null default now()
);

create table if not exists public.clinical_review_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  assigned_supervisor_id uuid references auth.users(id) on delete set null,
  status public.review_status not null default 'draft',
  request_note text,
  supervisor_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  phase public.checklist_phase not null,
  workstream text not null,
  task text not null,
  priority public.priority_level not null default 'Moyenne',
  status public.task_status not null default 'À faire',
  deliverable text,
  owner text,
  due_date date,
  evidence text,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  cause text,
  impact text,
  probability integer not null default 1 check (probability between 1 and 5),
  severity integer not null default 1 check (severity between 1 and 5),
  mitigation text,
  residual_risk text,
  status public.risk_status not null default 'Ouvert',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action public.audit_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.data_exports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  export_type text not null check (export_type in ('pdf', 'csv', 'json', 'xlsx')),
  entity_type text not null,
  entity_id uuid,
  destination text,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user on public.organization_memberships(user_id);
create index if not exists idx_memberships_org_user on public.organization_memberships(organization_id, user_id);
create index if not exists idx_patients_org on public.patients(organization_id);
create index if not exists idx_patients_clinician on public.patients(primary_clinician_id);
create index if not exists idx_episodes_patient on public.therapy_episodes(patient_id);
create index if not exists idx_sessions_patient_date on public.sessions(patient_id, session_date desc);
create index if not exists idx_session_versions_session on public.session_note_versions(session_id, version_number desc);
create index if not exists idx_audit_logs_org_created on public.audit_logs(organization_id, created_at desc);
create index if not exists idx_exports_org_created on public.data_exports(organization_id, created_at desc);

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.organization_memberships
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

create or replace function public.current_membership_role(org_id uuid)
returns public.membership_role
language sql
stable
as $$
  select role
  from public.organization_memberships
  where organization_id = org_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_min_role(org_id uuid, min_role public.membership_role)
returns boolean
language sql
stable
as $$
  with current_role as (
    select public.current_membership_role(org_id) as role
  )
  select case
    when (select role from current_role) is null then false
    when (select role from current_role) = 'owner' then true
    when (select role from current_role) = 'admin' then min_role in ('admin', 'clinician', 'supervisor', 'reader')
    when (select role from current_role) = 'clinician' then min_role in ('clinician', 'supervisor', 'reader')
    when (select role from current_role) = 'supervisor' then min_role in ('supervisor', 'reader')
    when (select role from current_role) = 'reader' then min_role = 'reader'
    else false
  end;
$$;

create or replace function public.can_export_org_data(org_id uuid)
returns boolean
language sql
stable
as $$
  select public.has_min_role(org_id, 'supervisor');
$$;

create or replace function public.can_manage_patient(patient_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.patients p
    where p.id = patient_uuid
      and p.deleted_at is null
      and (
        public.has_min_role(p.organization_id, 'admin')
        or p.primary_clinician_id = auth.uid()
      )
  );
$$;

create or replace function public.can_read_patient(patient_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.patients p
    where p.id = patient_uuid
      and (
        public.has_min_role(p.organization_id, 'supervisor')
        or (public.has_min_role(p.organization_id, 'clinician') and p.primary_clinician_id = auth.uid())
      )
  );
$$;

create or replace view public.active_patients as
select *
from public.patients
where deleted_at is null and status <> 'closed';

create or replace view public.active_patient_sessions as
select s.*
from public.sessions s
join public.patients p on p.id = s.patient_id
where s.deleted_at is null and p.deleted_at is null and p.status <> 'closed';

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.patients enable row level security;
alter table public.patient_consents enable row level security;
alter table public.consent_signatures enable row level security;
alter table public.therapy_episodes enable row level security;
alter table public.therapy_goals enable row level security;
alter table public.sessions enable row level security;
alter table public.session_note_versions enable row level security;
alter table public.session_artifacts enable row level security;
alter table public.patient_documents enable row level security;
alter table public.patient_access_logs enable row level security;
alter table public.clinical_review_requests enable row level security;
alter table public.checklist_items enable row level security;
alter table public.risk_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.data_exports enable row level security;

drop policy if exists org_read on public.organizations;
create policy org_read on public.organizations for select using (public.is_org_member(id));

drop policy if exists profile_self_rw on public.profiles;
create policy profile_self_rw on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists membership_read on public.organization_memberships;
create policy membership_read on public.organization_memberships for select using (user_id = auth.uid() or public.has_min_role(organization_id, 'admin'));

drop policy if exists patient_read on public.patients;
create policy patient_read on public.patients for select using (
  public.has_min_role(organization_id, 'supervisor')
  or (public.has_min_role(organization_id, 'clinician') and primary_clinician_id = auth.uid())
);

drop policy if exists patient_insert on public.patients;
create policy patient_insert on public.patients for insert with check (
  public.has_min_role(organization_id, 'clinician') and primary_clinician_id = auth.uid()
);

drop policy if exists patient_update on public.patients;
create policy patient_update on public.patients for update using (
  public.has_min_role(organization_id, 'admin')
  or (public.has_min_role(organization_id, 'clinician') and primary_clinician_id = auth.uid())
) with check (
  public.has_min_role(organization_id, 'admin')
  or (public.has_min_role(organization_id, 'clinician') and primary_clinician_id = auth.uid())
);

drop policy if exists consent_rw on public.patient_consents;
create policy consent_rw on public.patient_consents for all using (public.can_read_patient(patient_id)) with check (public.can_manage_patient(patient_id));

drop policy if exists consent_sig_rw on public.consent_signatures;
create policy consent_sig_rw on public.consent_signatures for all using (
  exists (select 1 from public.patient_consents c where c.id = consent_id and public.can_read_patient(c.patient_id))
) with check (
  exists (select 1 from public.patient_consents c where c.id = consent_id and public.can_manage_patient(c.patient_id))
);

drop policy if exists episode_rw on public.therapy_episodes;
create policy episode_rw on public.therapy_episodes for all using (public.can_read_patient(patient_id)) with check (public.can_manage_patient(patient_id));

drop policy if exists goal_rw on public.therapy_goals;
create policy goal_rw on public.therapy_goals for all using (
  exists (select 1 from public.therapy_episodes e where e.id = episode_id and public.can_read_patient(e.patient_id))
) with check (
  exists (select 1 from public.therapy_episodes e where e.id = episode_id and public.can_manage_patient(e.patient_id))
);

drop policy if exists session_rw on public.sessions;
create policy session_rw on public.sessions for all using (public.can_read_patient(patient_id)) with check (public.can_manage_patient(patient_id));

drop policy if exists note_versions_read on public.session_note_versions;
create policy note_versions_read on public.session_note_versions for select using (
  exists (select 1 from public.sessions s where s.id = session_id and public.can_read_patient(s.patient_id))
);

drop policy if exists note_versions_insert on public.session_note_versions;
create policy note_versions_insert on public.session_note_versions for insert with check (
  exists (select 1 from public.sessions s where s.id = session_id and public.can_manage_patient(s.patient_id))
);

drop policy if exists artifacts_rw on public.session_artifacts;
create policy artifacts_rw on public.session_artifacts for all using (
  exists (select 1 from public.sessions s where s.id = session_id and public.can_read_patient(s.patient_id))
) with check (
  exists (select 1 from public.sessions s where s.id = session_id and public.can_manage_patient(s.patient_id))
);


drop policy if exists patient_documents_rw on public.patient_documents;
create policy patient_documents_rw on public.patient_documents for all using (
  public.can_read_patient(patient_id)
) with check (
  public.can_manage_patient(patient_id)
);

drop policy if exists patient_access_logs_read on public.patient_access_logs;
create policy patient_access_logs_read on public.patient_access_logs for select using (
  public.can_read_patient(patient_id)
);

drop policy if exists patient_access_logs_insert on public.patient_access_logs;
create policy patient_access_logs_insert on public.patient_access_logs for insert with check (
  public.can_read_patient(patient_id) and public.is_org_member(organization_id)
);

drop policy if exists review_requests_read on public.clinical_review_requests;
create policy review_requests_read on public.clinical_review_requests for select using (
  public.can_read_patient(patient_id)
);

drop policy if exists review_requests_insert on public.clinical_review_requests;
create policy review_requests_insert on public.clinical_review_requests for insert with check (
  public.can_manage_patient(patient_id)
);

drop policy if exists review_requests_update on public.clinical_review_requests;
create policy review_requests_update on public.clinical_review_requests for update using (
  public.can_manage_patient(patient_id)
  or public.has_min_role(organization_id, 'supervisor')
) with check (
  public.can_manage_patient(patient_id)
  or public.has_min_role(organization_id, 'supervisor')
);

drop policy if exists checklist_rw on public.checklist_items;
create policy checklist_rw on public.checklist_items for all using (public.is_org_member(organization_id)) with check (public.has_min_role(organization_id, 'admin'));

drop policy if exists risks_rw on public.risk_items;
create policy risks_rw on public.risk_items for all using (public.is_org_member(organization_id)) with check (public.has_min_role(organization_id, 'admin'));

drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select using (organization_id is not null and public.has_min_role(organization_id, 'supervisor'));

drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs for insert with check (organization_id is not null and public.is_org_member(organization_id));

drop policy if exists export_read on public.data_exports;
create policy export_read on public.data_exports for select using (public.has_min_role(organization_id, 'supervisor'));

drop policy if exists export_insert on public.data_exports;
create policy export_insert on public.data_exports for insert with check (public.can_export_org_data(organization_id));


insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clinical-documents',
  'clinical-documents',
  false,
  10485760,
  array['application/pdf','image/png','image/jpeg','text/plain']
)
on conflict (id) do nothing;

drop policy if exists clinical_documents_read on storage.objects;
create policy clinical_documents_read on storage.objects
for select to authenticated
using (
  bucket_id = 'clinical-documents'
  and public.is_org_member(split_part(name, '/', 1)::uuid)
);

drop policy if exists clinical_documents_insert on storage.objects;
create policy clinical_documents_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'clinical-documents'
  and public.has_min_role(split_part(name, '/', 1)::uuid, 'clinician')
);

drop policy if exists clinical_documents_update on storage.objects;
create policy clinical_documents_update on storage.objects
for update to authenticated
using (
  bucket_id = 'clinical-documents'
  and public.has_min_role(split_part(name, '/', 1)::uuid, 'clinician')
)
with check (
  bucket_id = 'clinical-documents'
  and public.has_min_role(split_part(name, '/', 1)::uuid, 'clinician')
);

drop policy if exists clinical_documents_delete on storage.objects;
create policy clinical_documents_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'clinical-documents'
  and public.has_min_role(split_part(name, '/', 1)::uuid, 'admin')
);


-- v6 governance extension
DO $$ BEGIN
  CREATE TYPE public.notification_status AS ENUM ('unread', 'read', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table public.patient_documents
  add column if not exists retention_policy_label text,
  add column if not exists retention_until timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

alter table public.consent_signatures
  add column if not exists signature_level text not null default 'simple' check (signature_level in ('simple','advanced')),
  add column if not exists signer_email text,
  add column if not exists signer_identifier text,
  add column if not exists witness_name text,
  add column if not exists signed_document_hash text,
  add column if not exists evidence jsonb not null default '{}'::jsonb;

create table if not exists public.organization_security_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  default_retention_days integer not null default 2555,
  signed_consent_retention_days integer not null default 3650,
  documents_bucket text not null default 'clinical-documents',
  consent_signatures_bucket text not null default 'clinical-documents',
  supervisor_notification_channel text not null default 'in_app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supervisor_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  review_request_id uuid references public.clinical_review_requests(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'in_app',
  title text not null,
  body text,
  status public.notification_status not null default 'unread',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_patient_documents_retention on public.patient_documents(organization_id, retention_until);
create index if not exists idx_supervisor_notifications_recipient on public.supervisor_notifications(recipient_user_id, created_at desc);

create or replace view public.documents_retention_due as
select *
from public.patient_documents
where archived_at is null
  and retention_until is not null
  and retention_until <= (now() + interval '30 days');

alter table public.organization_security_policies enable row level security;
alter table public.supervisor_notifications enable row level security;

drop policy if exists org_security_policy_read on public.organization_security_policies;
create policy org_security_policy_read on public.organization_security_policies
for select using (public.is_org_member(organization_id));

drop policy if exists org_security_policy_manage on public.organization_security_policies;
create policy org_security_policy_manage on public.organization_security_policies
for all using (public.has_min_role(organization_id, 'admin'))
with check (public.has_min_role(organization_id, 'admin'));

drop policy if exists supervisor_notifications_read on public.supervisor_notifications;
create policy supervisor_notifications_read on public.supervisor_notifications
for select using (
  recipient_user_id = auth.uid()
  or public.has_min_role(organization_id, 'supervisor')
);

drop policy if exists supervisor_notifications_insert on public.supervisor_notifications;
create policy supervisor_notifications_insert on public.supervisor_notifications
for insert with check (
  public.has_min_role(organization_id, 'clinician')
);

drop policy if exists supervisor_notifications_update on public.supervisor_notifications;
create policy supervisor_notifications_update on public.supervisor_notifications
for update using (
  recipient_user_id = auth.uid()
  or public.has_min_role(organization_id, 'supervisor')
)
with check (
  recipient_user_id = auth.uid()
  or public.has_min_role(organization_id, 'supervisor')
);

insert into public.organization_security_policies (organization_id)
select id from public.organizations
on conflict (organization_id) do nothing;



-- V7: sync Excel auto + dashboard clinique intelligent
DO $$ BEGIN
  CREATE TYPE public.import_status AS ENUM ('uploaded', 'processed', 'processed_with_errors', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS display_name text;

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  file_name text not null,
  mime_type text,
  storage_bucket text not null default 'clinical-imports',
  storage_path text not null,
  row_count integer,
  success_count integer,
  error_count integer,
  status public.import_status not null default 'uploaded',
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.import_row_results (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number integer not null,
  external_row_id text,
  patient_code text,
  patient_id uuid references public.patients(id) on delete set null,
  status text not null check (status in ('success','warning','error')),
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  source_type text not null check (source_type in ('excel_import', 'manual')),
  source_job_id uuid references public.import_jobs(id) on delete set null,
  snapshot_date date not null default current_date,
  current_score integer check (current_score between 0 and 10),
  progression_percent numeric(5,2),
  duration_days integer,
  imported_name text,
  imported_age integer,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create view public.latest_patient_metric_snapshots as
select distinct on (patient_id)
  id, organization_id, patient_id, source_type, source_job_id, snapshot_date,
  current_score, progression_percent, duration_days, imported_name, imported_age, raw_payload, created_at
from public.patient_metric_snapshots
order by patient_id, snapshot_date desc, created_at desc;

alter table public.import_jobs enable row level security;
alter table public.import_row_results enable row level security;
alter table public.patient_metric_snapshots enable row level security;

DO $$ BEGIN
  CREATE POLICY import_jobs_read ON public.import_jobs FOR SELECT USING (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_jobs_insert ON public.import_jobs FOR INSERT WITH CHECK (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_jobs_update ON public.import_jobs FOR UPDATE USING (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY import_row_results_read ON public.import_row_results FOR SELECT USING (
    exists (select 1 from public.import_jobs ij where ij.id = import_job_id and public.is_org_member(ij.organization_id))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_row_results_insert ON public.import_row_results FOR INSERT WITH CHECK (
    exists (select 1 from public.import_jobs ij where ij.id = import_job_id and public.has_min_role(ij.organization_id, 'clinician'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY patient_metric_snapshots_read ON public.patient_metric_snapshots FOR SELECT USING (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY patient_metric_snapshots_insert ON public.patient_metric_snapshots FOR INSERT WITH CHECK (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY patient_metric_snapshots_update ON public.patient_metric_snapshots FOR UPDATE USING (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

insert into storage.buckets (id, name, public)
values ('clinical-imports', 'clinical-imports', false)
on conflict (id) do nothing;



-- V8: import clinique avancé
ALTER TABLE public.import_row_results ADD COLUMN IF NOT EXISTS source_sheet text;
ALTER TABLE public.import_row_results ADD COLUMN IF NOT EXISTS entity_type text;

create table if not exists public.import_mapping_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  profile_name text not null,
  sheet_config jsonb not null default '{}'::jsonb,
  mapping_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.import_mapping_profiles enable row level security;
DO $$ BEGIN
  CREATE POLICY import_mapping_profiles_read ON public.import_mapping_profiles FOR SELECT USING (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_mapping_profiles_insert ON public.import_mapping_profiles FOR INSERT WITH CHECK (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_mapping_profiles_update ON public.import_mapping_profiles FOR UPDATE USING (public.has_min_role(organization_id, 'clinician')) WITH CHECK (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create index if not exists idx_import_row_results_job_entity on public.import_row_results(import_job_id, entity_type);
create index if not exists idx_import_mapping_profiles_org on public.import_mapping_profiles(organization_id, created_at desc);

-- V9: production import
ALTER TABLE public.import_mapping_profiles ADD COLUMN IF NOT EXISTS profile_scope text NOT NULL DEFAULT 'organization';
ALTER TABLE public.import_mapping_profiles ADD COLUMN IF NOT EXISTS config_json jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.import_mapping_profiles ADD COLUMN IF NOT EXISTS updated_by uuid references auth.users(id) on delete set null;

update public.import_mapping_profiles
set config_json = jsonb_build_object(
  'sheets', coalesce(sheet_config, '{}'::jsonb),
  'mappings', coalesce(mapping_config, '{}'::jsonb)
)
where config_json = '{}'::jsonb;

ALTER TABLE public.import_jobs ADD COLUMN IF NOT EXISTS dry_run_token text;
ALTER TABLE public.import_jobs ADD COLUMN IF NOT EXISTS import_mode text NOT NULL DEFAULT 'final' check (import_mode in ('dry_run', 'final'));
ALTER TABLE public.import_jobs ADD COLUMN IF NOT EXISTS duplicate_resolution_count integer NOT NULL DEFAULT 0;

create table if not exists public.import_duplicate_resolutions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_job_id uuid references public.import_jobs(id) on delete cascade,
  entity_type text not null,
  row_number integer not null,
  duplicate_reason text not null,
  resolution_action text not null check (resolution_action in ('merge','create_new','skip')),
  imported_payload jsonb not null default '{}'::jsonb,
  existing_payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.import_duplicate_resolutions enable row level security;
DO $$ BEGIN
  CREATE POLICY import_duplicate_resolutions_read ON public.import_duplicate_resolutions FOR SELECT USING (public.is_org_member(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY import_duplicate_resolutions_insert ON public.import_duplicate_resolutions FOR INSERT WITH CHECK (public.has_min_role(organization_id, 'clinician'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create index if not exists idx_import_duplicate_resolutions_job on public.import_duplicate_resolutions(import_job_id, entity_type, row_number);
