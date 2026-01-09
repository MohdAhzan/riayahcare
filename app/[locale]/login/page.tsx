// app/[locale]/login/page.tsx

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"

export default function LoginPage() {
  const supabase = createClient()
  const { locale } = useParams<{ locale: string }>()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/${locale}/auth/callback`,
      },
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>

        {sent ? (
          <p className="text-emerald-400">
            Login Link sent. Check your email.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="admin@riayahcare.com"
              className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-600 py-3 rounded font-medium"
            >
              {loading ? "Sending..." : "Login via Link"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

