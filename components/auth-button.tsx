'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export function AuthButton({ email }: { email?: string | null }) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!email) {
    return null
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Déconnexion
    </button>
  )
}
