# ATPE Clinical Suite — v5 conformité clinique

Cette version ajoute un socle **conformité clinique** au dashboard ATPE :

- coffre documentaire par dossier patient
- pièces jointes de consentement signées en stockage sécurisé
- journal d’accès par dossier
- workflow de validation superviseur
- vue patient détaillée enrichie

## Nouveautés

### Coffre documentaire
- table `patient_documents`
- bucket Supabase Storage `clinical-documents`
- upload serveur via `uploadPatientDocumentAction`
- écran `/patients/[id]/documents`

### Consentements signés
- les consentements peuvent recevoir :
  - une signature textuelle ou dessinée
  - une pièce jointe signée stockée dans le coffre

### Journal d’accès dossier
- table `patient_access_logs`
- insertion automatique lors de l’ouverture :
  - du dossier patient
  - de l’écran consentements
  - de l’écran coffre documentaire

### Workflow superviseur
- table `clinical_review_requests`
- soumission depuis le dossier patient
- validation / demande de modifications depuis :
  - le dossier patient
  - l’écran global `/reviews`

## Mise en route

1. Exécuter `supabase/schema.sql`
2. Renseigner les variables d’environnement Next.js / Supabase
3. Lancer le projet
4. Se connecter
5. Appeler `POST /api/seed`

## Écrans clés

- `/patients`
- `/patients/[id]`
- `/patients/[id]/consents`
- `/patients/[id]/documents`
- `/reviews`

## Limites actuelles

- le coffre documentaire trace le chemin de stockage mais n’ajoute pas encore de prévisualisation sécurisée ou lien signé temporaire
- le workflow superviseur est centré sur la revue d’un dossier / d’une séance et peut être étendu à plusieurs niveaux d’approbation
- les logs d’accès sont posés côté application serveur ; pour une production complète, ajouter alertes, rétention, archivage et tableaux de supervision


## V7 — Sync Excel auto + dashboard clinique intelligent

Nouveautés :
- page `/imports/excel` pour charger un classeur `.xlsx`
- route `POST /api/import/excel` utilisant `xlsx` (SheetJS) pour parser le fichier côté serveur
- archivage du fichier source dans le bucket Storage `clinical-imports`
- tables `import_jobs`, `import_row_results`, `patient_metric_snapshots`
- page `/dashboard/intelligent` avec repérages descriptifs multi-source

### Colonnes Excel reconnues
- `ID`
- `Nom`
- `Age`
- `Score actuel`
- `Progression %`
- `Durée (jours)`

Le moteur de sync crée ou met à jour des patients via un code import stable (`IMP-<ID>`), crée un épisode actif si besoin, puis enregistre un snapshot métier descriptif. Les signaux du dashboard sont organisationnels et descriptifs; ils ne constituent pas une décision médicale automatisée.


## V8 — Import clinique avancé

- mapping de colonnes configurable dans l’interface
- prévisualisation avant import
- détection de doublons plus fine
- import multi-onglets patients / séances / consentements
