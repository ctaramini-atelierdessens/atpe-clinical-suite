'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, FileSpreadsheet, GitBranch, Loader2, RefreshCcw, Save, Upload } from 'lucide-react'

type ImportJob = {
  id: string
  file_name: string
  status: string
  row_count: number | null
  success_count: number | null
  error_count: number | null
  created_at: string
  processed_at: string | null
  summary: any
}

type ImportRow = {
  id: string
  import_job_id: string
  row_number: number
  status: 'success' | 'warning' | 'error'
  message: string | null
  patient_id: string | null
  patient_code: string | null
}

type MappingProfile = {
  id: string
  profile_name: string
  profile_scope: 'organization' | 'personal'
  config_json: any
  created_at: string
  updated_at: string
}

type PreviewResponse = {
  ok: boolean
  mode: 'preview'
  workbook: { sheetNames: string[] }
  preview: {
    patients: any[]
    sessions: any[]
    consents: any[]
  }
  duplicates: {
    patients: any[]
    sessions: any[]
    consents: any[]
  }
  counts: Record<string, number>
  dryRunToken?: string
}

const DEFAULT_CONFIG = {
  sheets: {
    patients: 'Patients_V4',
    sessions: 'Séances',
    consents: 'Consentements',
  },
  mappings: {
    patients: {
      id: 'ID',
      name: 'Nom',
      age: 'Age',
      currentScore: 'Score actuel',
      progressionPercent: 'Progression %',
      durationDays: 'Durée (jours)',
      patientCode: 'Code patient',
      caseReference: 'Référence dossier',
    },
    sessions: {
      patientCode: 'Code patient',
      sessionDate: 'Date',
      sessionNumber: 'Séance',
      durationMinutes: 'Durée (min)',
      note: 'Note',
      clinicalSummary: 'Résumé clinique',
      emotionalScore: 'Score émotion',
      regulationScore: 'Score régulation',
      engagementScore: 'Score engagement',
    },
    consents: {
      patientCode: 'Code patient',
      consentKind: 'Type consentement',
      status: 'Statut',
      recordedAt: 'Date',
      expiresAt: 'Expiration',
      note: 'Note',
    },
  },
}

function MappingField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 focus:border-brand-500" />
    </label>
  )
}

function DuplicateCard({ item, resolution, onChange }: { item: any; resolution: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-amber-950">Ligne {item.rowNumber}</p>
          <p className="mt-1 text-amber-900">{item.reason}</p>
          <p className="mt-2 text-slate-700">Import : <span className="font-medium">{item.imported?.name ?? item.imported?.patientCode ?? '—'}</span></p>
          <p className="text-slate-600">Existant : <span className="font-medium">{item.existing?.display_name ?? item.existing?.code ?? '—'}</span></p>
        </div>
        <select value={resolution} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800">
          <option value="merge">Fusionner avec l’existant</option>
          <option value="create_new">Créer quand même</option>
          <option value="skip">Ignorer la ligne</option>
        </select>
      </div>
    </div>
  )
}

export function ExcelImportPanel({ jobs, latestRows, mappingProfiles }: { jobs: ImportJob[]; latestRows: ImportRow[]; mappingProfiles: MappingProfile[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<'preview' | 'import' | 'save-profile' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [profileName, setProfileName] = useState('')
  const [profileScope, setProfileScope] = useState<'organization' | 'personal'>('organization')
  const [duplicateResolution, setDuplicateResolution] = useState<Record<string, string>>({})
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')

  const latestSummary = useMemo(() => jobs[0]?.summary ?? null, [jobs])

  function updateSheet(sheetKey: 'patients' | 'sessions' | 'consents', value: string) {
    setConfig((current) => ({ ...current, sheets: { ...current.sheets, [sheetKey]: value } }))
  }

  function updateMapping(section: 'patients' | 'sessions' | 'consents', key: string, value: string) {
    setConfig((current) => ({
      ...current,
      mappings: {
        ...current.mappings,
        [section]: {
          ...current.mappings[section],
          [key]: value,
        },
      },
    }))
  }

  function applyProfile(profileId: string) {
    setSelectedProfileId(profileId)
    const profile = mappingProfiles.find((item) => item.id === profileId)
    if (!profile?.config_json) return
    setConfig(profile.config_json)
    setProfileName(profile.profile_name)
    setProfileScope(profile.profile_scope)
  }

  async function saveProfile() {
    setBusy('save-profile')
    setError(null)
    try {
      const res = await fetch('/api/import/mapping-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfileId || undefined,
          profileName: profileName || 'Profil import clinique',
          profileScope,
          config,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Sauvegarde impossible')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sauvegarde impossible')
    } finally {
      setBusy(null)
    }
  }

  async function submit(mode: 'preview' | 'import') {
    if (!file) return
    setBusy(mode)
    setError(null)
    if (mode === 'import') setResult(null)

    try {
      const body = new FormData()
      body.append('file', file)
      body.append('config_json', JSON.stringify(config))
      if (mode === 'preview') {
        body.append('preview', '1')
        body.append('dry_run', '1')
      } else {
        body.append('dry_run_token', preview?.dryRunToken ?? '')
        body.append('duplicate_resolutions', JSON.stringify(duplicateResolution))
      }
      const res = await fetch('/api/import/excel', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Opération impossible')
      if (mode === 'preview') {
        setPreview(json)
        const resolutions: Record<string, string> = {}
        ;['patients', 'sessions', 'consents'].forEach((group) => {
          for (const item of json?.duplicates?.[group] ?? []) {
            const key = `${group}:${item.rowNumber}:${item.reason}`
            resolutions[key] = 'merge'
          }
        })
        setDuplicateResolution(resolutions)
      } else {
        setResult(json)
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opération impossible')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><FileSpreadsheet className="h-5 w-5" /></span>
            <div>
              <h2 className="text-xl font-semibold">Import clinique production</h2>
              <p className="text-sm text-slate-500">Dry run, résolution des doublons et profils de mapping sauvegardables.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-brand-300 hover:bg-brand-50/40">
              <Upload className="h-8 w-8 text-brand-600" />
              <span className="mt-3 font-medium text-slate-800">Choisir un fichier .xlsx</span>
              <span className="mt-1 text-sm text-slate-500">Prévisualisation obligatoire avant validation finale.</span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>

            {file ? <p className="text-sm text-slate-600">Fichier sélectionné : <span className="font-medium">{file.name}</span></p> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            {result ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Import terminé : {result.summary?.successCount ?? 0} succès · {result.summary?.errorCount ?? 0} erreur(s) · {result.summary?.warningCount ?? 0} avertissement(s).</div> : null}

            <div className="flex flex-wrap gap-3">
              <button onClick={() => submit('preview')} disabled={!file || !!busy} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60">
                {busy === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Dry run / Prévisualiser
              </button>
              <button onClick={() => submit('import')} disabled={!file || !!busy || !preview} className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                {busy === 'import' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />} Valider l’import final
              </button>
              <button onClick={() => { setPreview(null); setResult(null); setError(null); setConfig(DEFAULT_CONFIG); setDuplicateResolution({}); setSelectedProfileId('') }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
                <RefreshCcw className="h-4 w-4" /> Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Profils de mapping</p>
            <h3 className="mt-1 text-lg font-semibold">Charger ou sauvegarder</h3>
          </div>

          <select value={selectedProfileId} onChange={(e) => applyProfile(e.target.value)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700">
            <option value="">Sélectionner un profil</option>
            {mappingProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.profile_name} · {profile.profile_scope}</option>
            ))}
          </select>

          <MappingField label="Nom du profil" value={profileName} onChange={setProfileName} />
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Portée</span>
            <select value={profileScope} onChange={(e) => setProfileScope(e.target.value as 'organization' | 'personal')} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700">
              <option value="organization">Organisation</option>
              <option value="personal">Personnel</option>
            </select>
          </label>
          <button onClick={saveProfile} disabled={!!busy} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60">
            {busy === 'save-profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sauvegarder le profil
          </button>
          {preview?.workbook?.sheetNames?.length ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Onglets détectés</p>
              <p className="mt-2">{preview.workbook.sheetNames.join(' · ')}</p>
            </div>
          ) : latestSummary?.mapping ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Dernier mapping utilisé</p>
              <p className="mt-2">Profils sauvegardables + import incrémental activés.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Onglets</h3>
          <MappingField label="Feuille patients" value={config.sheets.patients} onChange={(value) => updateSheet('patients', value)} />
          <MappingField label="Feuille séances" value={config.sheets.sessions} onChange={(value) => updateSheet('sessions', value)} />
          <MappingField label="Feuille consentements" value={config.sheets.consents} onChange={(value) => updateSheet('consents', value)} />
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Mapping patients</h3>
          <MappingField label="ID externe" value={config.mappings.patients.id} onChange={(v) => updateMapping('patients', 'id', v)} />
          <MappingField label="Nom" value={config.mappings.patients.name} onChange={(v) => updateMapping('patients', 'name', v)} />
          <MappingField label="Âge" value={config.mappings.patients.age} onChange={(v) => updateMapping('patients', 'age', v)} />
          <MappingField label="Score actuel" value={config.mappings.patients.currentScore} onChange={(v) => updateMapping('patients', 'currentScore', v)} />
          <MappingField label="Progression %" value={config.mappings.patients.progressionPercent} onChange={(v) => updateMapping('patients', 'progressionPercent', v)} />
          <MappingField label="Durée (jours)" value={config.mappings.patients.durationDays} onChange={(v) => updateMapping('patients', 'durationDays', v)} />
          <MappingField label="Code patient" value={config.mappings.patients.patientCode} onChange={(v) => updateMapping('patients', 'patientCode', v)} />
          <MappingField label="Référence dossier" value={config.mappings.patients.caseReference} onChange={(v) => updateMapping('patients', 'caseReference', v)} />
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Mapping séances / consentements</h3>
          <MappingField label="Séances · Code patient" value={config.mappings.sessions.patientCode} onChange={(v) => updateMapping('sessions', 'patientCode', v)} />
          <MappingField label="Séances · Date" value={config.mappings.sessions.sessionDate} onChange={(v) => updateMapping('sessions', 'sessionDate', v)} />
          <MappingField label="Séances · Numéro" value={config.mappings.sessions.sessionNumber} onChange={(v) => updateMapping('sessions', 'sessionNumber', v)} />
          <MappingField label="Séances · Note" value={config.mappings.sessions.note} onChange={(v) => updateMapping('sessions', 'note', v)} />
          <MappingField label="Consentements · Code patient" value={config.mappings.consents.patientCode} onChange={(v) => updateMapping('consents', 'patientCode', v)} />
          <MappingField label="Consentements · Type" value={config.mappings.consents.consentKind} onChange={(v) => updateMapping('consents', 'consentKind', v)} />
          <MappingField label="Consentements · Statut" value={config.mappings.consents.status} onChange={(v) => updateMapping('consents', 'status', v)} />
        </div>
      </section>

      {preview ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Prévisualisation</h3>
                <p className="text-sm text-slate-500">Simulation sans écriture en base avant validation finale.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <Eye className="h-4 w-4" /> Dry run actif
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(preview.counts).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{key}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{String(value)}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Patients</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(preview.preview.patients, null, 2)}</pre>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Séances</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(preview.preview.sessions, null, 2)}</pre>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Consentements</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(preview.preview.consents, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Résolution assistée des doublons</h3>
            </div>
            <p className="text-sm text-slate-500">Avant l’import final, choisis le comportement de chaque doublon détecté.</p>
            <div className="space-y-3 max-h-[34rem] overflow-auto pr-1">
              {(['patients', 'sessions', 'consents'] as const).flatMap((group) => (preview.duplicates[group] ?? []).map((item: any, idx: number) => {
                const key = `${group}:${item.rowNumber}:${item.reason}`
                return <DuplicateCard key={`${key}:${idx}`} item={item} resolution={duplicateResolution[key] ?? 'merge'} onChange={(value) => setDuplicateResolution((current) => ({ ...current, [key]: value }))} />
              }))}
              {Object.values(preview.duplicates).every((items) => !items?.length) ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" /> Aucun doublon bloquant détecté.</div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Historique des imports</h3>
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{job.file_name}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{job.status}</span>
                </div>
                <p className="mt-2 text-slate-500">{job.row_count ?? 0} lignes · {job.success_count ?? 0} succès · {job.error_count ?? 0} erreurs</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold">Derniers résultats de lignes</h3>
          <div className="mt-4 space-y-3">
            {latestRows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">Ligne {row.row_number}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${row.status === 'success' ? 'bg-emerald-100 text-emerald-700' : row.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{row.status}</span>
                </div>
                <p className="mt-2 text-slate-600">{row.message ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
