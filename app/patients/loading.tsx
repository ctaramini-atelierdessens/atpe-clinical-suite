function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="h-6 w-1/3 rounded-xl bg-slate-200" />
        <div className="mt-3 h-4 w-1/2 rounded-xl bg-slate-200" />

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-3">
            <div className="h-3 w-1/3 rounded-xl bg-slate-200" />
            <div className="mt-2 h-4 w-2/3 rounded-xl bg-slate-200" />
          </div>

          <div className="rounded-2xl bg-slate-100 p-3">
            <div className="h-3 w-1/3 rounded-xl bg-slate-200" />
            <div className="mt-2 h-4 w-1/2 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PatientsLoading() {
  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-3 w-24 rounded-xl bg-slate-200" />
          <div className="mt-4 h-8 w-64 rounded-xl bg-slate-200" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-xl bg-slate-200" />
          <div className="mt-2 h-4 w-full max-w-xl rounded-xl bg-slate-200" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>
    </main>
  )
}