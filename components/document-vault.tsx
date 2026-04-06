import { uploadPatientDocumentAction } from '@/lib/atpe/actions'
import { Field, FormShell, Grid, Input, Select, SubmitRow } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type PatientDocument = Database['public']['Tables']['patient_documents']['Row']

export function DocumentUploadForm({
  patientId,
  consentId,
  defaultCategory = 'clinical_document',
}: {
  patientId: string
  consentId?: string | null
  defaultCategory?: string
}) {
  return (
    <form action={uploadPatientDocumentAction}>
      <FormShell
        title="Coffre documentaire"
        description="Téléversement serveur vers un bucket sécurisé Supabase Storage avec traçabilité dans le dossier patient."
      >
        <input type="hidden" name="patient_id" value={patientId} />
        {consentId ? <input type="hidden" name="consent_id" value={consentId} /> : null}
        <Grid>
          <Field label="Catégorie">
            <Select name="category" defaultValue={defaultCategory}>
              <option value="clinical_document">Document clinique</option>
              <option value="consent_signed_attachment">Pièce jointe consentement signée</option>
              <option value="identity">Pièce administrative</option>
              <option value="other">Autre</option>
            </Select>
          </Field>
          <Field label="Titre">
            <Input name="title" placeholder="Ex. Consentement signé séance 8" required />
          </Field>
        </Grid>
        <Field label="Fichier">
          <Input type="file" name="file" required />
        </Field>
        <SubmitRow cancelHref={`/patients/${patientId}`} submitLabel="Téléverser dans le coffre" />
      </FormShell>
    </form>
  )
}

export function DocumentVaultList({ items }: { items: PatientDocument[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">Aucun document versé dans le coffre.</p>
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.file_name} · {item.mime_type ?? 'mime inconnu'}</p>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{item.category}</span>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <p><span className="font-medium text-slate-800">Bucket :</span> {item.storage_bucket}</p>
            <p><span className="font-medium text-slate-800">Taille :</span> {item.byte_size ?? 0} octets</p>
            <p className="md:col-span-2 break-all"><span className="font-medium text-slate-800">Chemin :</span> {item.storage_path}</p>
            <p><span className="font-medium text-slate-800">Téléversé le :</span> {new Date(item.created_at).toLocaleString('fr-FR')}</p>
            <p><span className="font-medium text-slate-800">Consentement lié :</span> {item.consent_id ?? '—'}</p>
            <p><span className="font-medium text-slate-800">Rétention :</span> {(item as any).retention_until ? new Date((item as any).retention_until).toLocaleDateString('fr-FR') : '—'}</p>
            <p><span className="font-medium text-slate-800">Politique :</span> {(item as any).retention_policy_label ?? '—'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
