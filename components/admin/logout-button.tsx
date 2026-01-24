//components/admin/logout-button.tsx

"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"

export function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace(`/${locale}/login`)
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-red-600 hover:underline"
    >
      Logout
    </button>
  )
}

