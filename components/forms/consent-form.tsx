import { addConsentSignatureAction, upsertConsentAction } from '@/lib/atpe/actions'
import { Field, FormShell, Grid, Input, Select, SubmitRow, Textarea } from '@/components/forms/form-ui'
import type { Database } from '@/types/database'

type Consent = Database['public']['Tables']['patient_consents']['Row']

type ConsentSignature = Database['public']['Tables']['consent_signatures']['Row']

export function ConsentForm({ patientId, consent }: { patientId: string; consent?: Consent | null }) {
  return (
    <form action={upsertConsentAction}>
      <FormShell title="Gérer un consentement" description="Un enregistrement par type de consentement. La dernière soumission met à jour l’état courant.">
        <input type="hidden" name="patient_id" value={patientId} />
        <Grid>
          <Field label="Type de consentement">
            <Select name="consent_kind" defaultValue={consent?.consent_kind ?? 'care'}>
              <option value="care">Prise en charge</option>
              <option value="data_processing">Traitement des données</option>
              <option value="image_audio">Image / audio</option>
              <option value="research">Recherche</option>
            </Select>
          </Field>
          <Field label="Statut">
            <Select name="status" defaultValue={consent?.status ?? 'granted'}>
              <option value="granted">Accordé</option>
              <option value="refused">Refusé</option>
              <option value="withdrawn">Retiré</option>
              <option value="expired">Expiré</option>
            </Select>
          </Field>
          <Field label="Enregistré le">
            <Input type="datetime-local" name="recorded_at" defaultValue={(consent?.recorded_at ?? new Date().toISOString()).slice(0, 16)} />
          </Field>
          <Field label="Expire le">
            <Input type="datetime-local" name="expires_at" defaultValue={consent?.expires_at ? consent.expires_at.slice(0, 16) : ''} />
          </Field>
        </Grid>
        <Field label="Note">
          <Textarea name="note" defaultValue={consent?.note ?? ''} className="min-h-[100px]" />
        </Field>
        <SubmitRow cancelHref={`/patients/${patientId}`} submitLabel="Enregistrer le consentement" />
      </FormShell>
    </form>
  )
}

export function ConsentSignatureForm({ patientId, consentId }: { patientId: string; consentId: string }) {
  return (
    <form action={addConsentSignatureAction}>
      <FormShell title="Ajouter une signature de consentement" description="Capture serveur d’une signature textuelle ou dessinée en data URL.">
        <input type="hidden" name="patient_id" value={patientId} />
        <input type="hidden" name="consent_id" value={consentId} />
        <Grid>
          <Field label="Nom du signataire">
            <Input name="signer_name" placeholder="Ex. Mme O. V." required />
          </Field>
          <Field label="Rôle du signataire">
            <Select name="signer_role" defaultValue="patient">
              <option value="patient">Patient</option>
              <option value="representant_legal">Représentant légal</option>
              <option value="clinicien">Clinicien</option>
              <option value="temoin">Témoin</option>
            </Select>
          </Field>
          <Field label="Niveau de signature">
            <Select name="signature_level" defaultValue="advanced">
              <option value="simple">Simple</option>
              <option value="advanced">Avancée</option>
            </Select>
          </Field>
          <Field label="Mode de signature">
            <Select name="signature_mode" defaultValue="typed">
              <option value="typed">Signature textuelle</option>
              <option value="drawn">Signature dessinée (data URL)</option>
            </Select>
          </Field>
          <Field label="Signé le">
            <Input type="datetime-local" name="signed_at" defaultValue={new Date().toISOString().slice(0, 16)} />
          </Field>
          <Field label="Email signataire">
            <Input name="signer_email" placeholder="patient@example.fr" />
          </Field>
          <Field label="Identifiant signataire">
            <Input name="signer_identifier" placeholder="N° dossier / identifiant interne" />
          </Field>
          <Field label="Nom du témoin">
            <Input name="witness_name" placeholder="Nom du témoin si applicable" />
          </Field>
        </Grid>
        <Field label="Texte de signature" hint="Pour une signature textuelle, saisir le nom exact ou la formule validée.">
          <Input name="signature_text" placeholder="Lu et approuvé — Nom du signataire" />
        </Field>
        <Field label="Empreinte du document signé" hint="Hash SHA-256 ou référence d’intégrité du document signé.">
          <Input name="signed_document_hash" placeholder="sha256:..." />
        </Field>
        <Field label="Attestation de signature">
          <Textarea name="attestation" className="min-h-[90px]" placeholder="Contexte de recueil, consentement oral préalable, identité vérifiée, etc." />
        </Field>
        <Field label="Poste ou appareil de signature">
          <Input name="device_label" placeholder="Ex. iPad salle consultation 2" />
        </Field>
        <Field label="Signature dessinée (data URL)" hint="Optionnel. Tu peux coller une data URL PNG/JPEG si tu ajoutes ensuite un pad de signature dans l’UI.">
          <Textarea name="signature_data_url" className="min-h-[110px]" placeholder="data:image/png;base64,..." />
        </Field>
        <SubmitRow cancelHref={`/patients/${patientId}/consents`} submitLabel="Ajouter la signature" />
      </FormShell>
    </form>
  )
}

export function ConsentSignatureList({ items }: { items: ConsentSignature[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">Aucune signature de consentement enregistrée.</p>
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((signature) => (
        <div key={signature.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-900">{signature.signer_name}</span>
            <span className="badge bg-slate-100 text-slate-700">{signature.signer_role}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {new Date(signature.signed_at).toLocaleString('fr-FR')} · mode {signature.signature_mode} · niveau {(signature as any).signature_level ?? 'simple'}
          </p>
          {(signature as any).signer_email ? <p className="mt-1 text-xs text-slate-500">Email : {(signature as any).signer_email}</p> : null}
          {(signature as any).signer_identifier ? <p className="mt-1 text-xs text-slate-500">Identifiant : {(signature as any).signer_identifier}</p> : null}
          {(signature as any).witness_name ? <p className="mt-1 text-xs text-slate-500">Témoin : {(signature as any).witness_name}</p> : null}
          {(signature as any).signed_document_hash ? <p className="mt-1 break-all text-xs text-slate-500">Empreinte : {(signature as any).signed_document_hash}</p> : null}
          {signature.signature_text ? <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{signature.signature_text}</p> : null}
          {signature.signature_data_url ? <img src={signature.signature_data_url} alt={`Signature de ${signature.signer_name}`} className="mt-3 max-h-24 rounded-xl border border-slate-200 bg-white p-2" /> : null}
        </div>
      ))}
    </div>
  )
}
