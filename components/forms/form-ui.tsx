import * as React from 'react'

type FormAction = string | ((formData: FormData) => void | Promise<void>)

export function FormShell({
  action,
  title,
  description,
  children,
  className = '',
}: {
  action: FormAction
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {title ? (
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
      ) : null}

      <form action={action} className="space-y-6">
        {children}
      </form>
    </section>
  )
}

export function Grid({
  children,
  cols = 2,
  className = '',
}: {
  children: React.ReactNode
  cols?: 1 | 2 | 3
  className?: string
}) {
  const colsClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2'

  return <div className={`grid gap-4 ${colsClass} ${className}`}>{children}</div>
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = '',
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-800"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

const inputBaseClassName =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100'

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className = '', ...rest } = props

  return <input {...rest} className={`${inputBaseClassName} ${className}`} />
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className = '', children, ...rest } = props

  return (
    <select {...rest} className={`${inputBaseClassName} ${className}`}>
      {children}
    </select>
  )
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = '', ...rest } = props

  return (
    <textarea
      {...rest}
      className={`${inputBaseClassName} min-h-[120px] resize-y ${className}`}
    />
  )
}

export function SubmitRow({
  submitLabel = 'Enregistrer',
  secondaryAction,
  className = '',
}: {
  submitLabel?: string
  secondaryAction?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>{secondaryAction}</div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </div>
  )
}