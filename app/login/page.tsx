'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    setMessage(error ? error.message : 'Lien magique envoyé. Vérifie ta boîte mail.')
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="mt-2 text-sm text-slate-500">Connexion par lien magique Supabase.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-brand-300 transition focus:ring"
              placeholder="toi@domaine.fr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Envoi…' : 'Recevoir un lien de connexion'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  )
}
