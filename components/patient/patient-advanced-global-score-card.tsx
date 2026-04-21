import { createClient } from '@/lib/supabase/server'
import { computeAdvancedGlobalScore } from '@/lib/atpe/advanced-global-score'

function Badge({
  label,
  tone = 'slate',
}: {
  label: string
  tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue'
}) {
  const styles = {
    slate: 'bg-slate-100 text-slate-800',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[tone]}`}>
      {label}
    </span>
  )
}

function toneFromLevel(level: string): 'green' | 'amber' | 'red' | 'blue' {
  if (level === 'intégré') return 'green'
  if (level === 'structuré') return 'blue'
  if (level === 'intermédiaire') return 'amber'
  return 'red'
}

function renderScore(value: number | null) {
  return value === null ? '—' : `${value}/100`
}

export async function PatientAdvancedGlobalScoreCard({
  patientId,
}: {
  patientId: string
}) {
  const supabase = await createClient()

  const [
    traceResult,
    dcResult,
    dmResult,
    epResult,
    colorResult,
    voiceResult,
    mandalaResult,
  ] = await Promise.all([
    supabase.from('trace_prenom_observations').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('dialogue_colore_sessions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('diamandala_sessions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('ep_observations').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('color_sessions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('voice_sessions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
    supabase.from('mandala_sessions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1),
  ])

  const trace = traceResult.data?.[0] ?? null
  const dc = dcResult.data?.[0] ?? null
  const dm = dmResult.data?.[0] ?? null
  const ep = epResult.data?.[0] ?? null
  const color = colorResult.data?.[0] ?? null
  const voice = voiceResult.data?.[0] ?? null
  const mandala = mandalaResult.data?.[0] ?? null

  const result = computeAdvancedGlobalScore({
    tracePrenom: trace
      ? {
          engagement: trace.engagement_score ?? null,
          tension: trace.tension_score ?? null,
          vulnerabilite: trace.vulnerability_score ?? null,
          symbolisation: trace.symbolization_score ?? null,
          anchoring: trace.anchoring_score ?? null,
          continuity: trace.continuity_score ?? null,
        }
      : null,

    dialogueColore: dc
      ? {
          contact: dc.contact ?? null,
          engagement: dc.engagement ?? null,
          continuity: dc.continuity ?? null,
          rupture: dc.rupture ?? null,
          emotionalExpression: dc.emotional_expression ?? null,
          inhibition: dc.inhibition ?? null,
          symbolicEmergence: dc.symbolic_emergence ?? null,
        }
      : null,

    diamandala: dm
      ? {
          synchronization: dm.synchronization ?? null,
          adaptation: dm.adaptation ?? null,
          centerApproach: dm.center_approach ?? null,
          centerAvoidance: dm.center_avoidance ?? null,
          centerIntegration: dm.center_integration ?? null,
          structureOrganization: dm.structure_organization ?? null,
        }
      : null,

    expressionPrimitive: ep
      ? {
          anchoring: ep.anchoring ?? null,
          coordination: ep.coordination ?? null,
          groupEngagement: ep.group_engagement ?? null,
          rhythmIntegration: ep.rhythm_integration ?? null,
          symbolicExpression: ep.symbolic_expression ?? null,
          structureLevel: ep.structure_level ?? null,
          expressionLevel: ep.expression_level ?? null,
        }
      : null,

    color: color
      ? {
          preferredColors: color.preferred_colors ?? [],
          rejectedColors: color.rejected_colors ?? [],
        }
      : null,

    voice: voice
      ? {
          tone: voice.tone as 'stable' | 'cassé' | 'monotone' | 'chaotique' | null,
          rhythm: voice.rhythm as 'fluide' | 'saccadé' | null,
          intensity: voice.intensity as 'faible' | 'forte' | 'variable' | null,
          emotionalLoad: voice.emotional_load ?? null,
          bodyConnection: voice.body_connection ?? null,
          envelope: voice.envelope as 'solide' | 'fragile' | 'perméable' | null,
          mirrorQuality: voice.mirror_quality as 'bon' | 'instable' | 'pathologique' | null,
          archaicExpression: voice.archaic_expression as 'inhibé' | 'présent' | 'débordant' | null,
          vocalEmotion: voice.vocal_emotion as
            | 'amour'
            | 'colère'
            | 'tristesse'
            | 'vide'
            | 'joie'
            | 'apaisement'
            | null,
          verbalEmotion: voice.verbal_emotion as
            | 'amour'
            | 'colère'
            | 'tristesse'
            | 'vide'
            | 'joie'
            | 'apaisement'
            | null,
        }
      : null,

    mandala: mandala
      ? {
          centerStrength: mandala.center_strength ?? null,
          boundaryIntegrity: mandala.boundary_integrity ?? null,
          symmetry: mandala.symmetry ?? null,
          openness: mandala.openness ?? null,
        }
      : null,
  })

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Score global avancé
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Lecture intégrative : corps, relation, symbolisation, couleur, voix et centration.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge label={result.clinicalLevel} tone={toneFromLevel(result.clinicalLevel)} />
          <Badge label={`Confiance ${result.confidenceScore}%`} tone="slate" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Indice global</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {result.globalScore ?? '—'}
          </p>
          <p className="mt-1 text-sm text-slate-600">Sur 100</p>
        </article>

        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Niveau clinique</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {result.clinicalLevel}
          </p>
        </article>

        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Fiabilité de lecture</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {result.confidenceScore}%
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Corps / ancrage</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.bodyAnchoring)}
          </p>
        </article>

        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Relation / engagement</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.relationEngagement)}
          </p>
        </article>

        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Symbolisation</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.symbolization)}
          </p>
        </article>

        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Affect / couleur</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.affectColor)}
          </p>
        </article>

        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Voix / enveloppe sonore</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.voiceEnvelope)}
          </p>
        </article>

        <article className="rounded-xl border p-4">
          <p className="text-sm font-medium text-slate-900">Intégration / centration</p>
          <p className="mt-1 text-sm text-slate-600">
            {renderScore(result.subscores.integrationCentering)}
          </p>
        </article>
      </div>

      {result.alerts.length > 0 ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Alertes cliniques</h3>
          <ul className="mt-2 space-y-1 text-sm text-red-800">
            {result.alerts.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.strengths.length > 0 ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-900">Points d’appui</h3>
          <ul className="mt-2 space-y-1 text-sm text-emerald-800">
            {result.strengths.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Recommandations</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            {result.recommendations.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}