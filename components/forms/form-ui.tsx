import type * as React from 'react'
import { ReactNode } from 'react'

export function FormShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 outline-none ring-0 transition focus:border-brand-500 ${props.className ?? ''}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-[120px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500 ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-brand-500 ${props.className ?? ''}`} />
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

export function SubmitRow({ cancelHref, submitLabel }: { cancelHref?: string; submitLabel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700">
        {submitLabel}
      </button>
      {cancelHref ? (
        <a href={cancelHref} className="rounded-2xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
          Annuler
        </a>
      ) : null}
    </div>
  )
}
