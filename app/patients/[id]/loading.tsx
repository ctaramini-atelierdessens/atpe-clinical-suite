function SkeletonBlock({ height = 'h-32' }: { height?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm`}>
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-1/4 rounded-xl bg-slate-200" />
        <div className={`w-full rounded-xl bg-slate-200 ${height}`} />
      </div>
    </div>
  )
}

function SkeletonHeader() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-24 rounded-xl bg-slate-200" />
        <div className="h-8 w-72 rounded-xl bg-slate-200" />
        <div className="h-4 w-full max-w-xl rounded-xl bg-slate-200" />
      </div>
    </section>
  )
}

export default function PatientDetailLoading() {
  return (
    <main className="flex flex-col gap-6">
      <SkeletonHeader />

      {/* Dashboard global */}
      <SkeletonBlock height="h-40" />

      {/* Profil clinique */}
      <SkeletonBlock height="h-32" />

      {/* Score global */}
      <SkeletonBlock height="h-24" />

      {/* Graphique / progression */}
      <SkeletonBlock height="h-48" />

      {/* Observations / documents */}
      <SkeletonBlock height="h-32" />

      {/* Audit / logs */}
      <SkeletonBlock height="h-32" />
    </main>
  )
}