export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
