import { buildSupervisionSummary, SupervisionPatientPoint } from '@/lib/atpe-supervision-engine'

type AtpeSupervisionDashboardProps = {
  patients: SupervisionPatientPoint[]
}

export function AtpeSupervisionDashboard({
  patients,
}: AtpeSupervisionDashboardProps) {
  const summary = buildSupervisionSummary(patients)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Supervision clinique ATPE</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lecture multi-patients, patterns croisés et alertes globales
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Patients suivis</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalPatients}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Score composite moyen</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.averageCompositeScore}/100
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Axe fragile principal</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {summary.fragileAxes[0]?.axis ?? 'Non disponible'}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Alertes globales</h2>
        <div className="space-y-3">
          {summary.alerts.length ? (
            summary.alerts.map((alert, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-700">{alert.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucune alerte globale particulière.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Répartition des profils</h2>
          <div className="space-y-2 text-sm text-slate-700">
            {Object.entries(summary.profileDistribution).map(([profile, count]) => (
              <div key={profile} className="flex items-center justify-between">
                <span>{profile}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Répartition des trajectoires</h2>
          <div className="space-y-2 text-sm text-slate-700">
            {Object.entries(summary.trendDistribution).map(([trend, count]) => (
              <div key={trend} className="flex items-center justify-between">
                <span>{trend}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Patients supervisés</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2 pr-4">Patient</th>
                <th className="pb-2 pr-4">Profil</th>
                <th className="pb-2 pr-4">Score</th>
                <th className="pb-2 pr-4">Tendance</th>
                <th className="pb-2 pr-4">Risque</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {patients.map((patient) => (
                <tr key={patient.patientId} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-medium">{patient.patientName}</td>
                  <td className="py-2 pr-4">{patient.profile ?? 'Soutien intégratif'}</td>
                  <td className="py-2 pr-4">{patient.compositeScore}/100</td>
                  <td className="py-2 pr-4">{patient.predictionTrend}</td>
                  <td className="py-2 pr-4">{patient.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}