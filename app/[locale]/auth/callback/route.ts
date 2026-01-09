// app/[locale]/auth/callback/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  // 🔥 Extract locale from pathname
  // /en/auth/callback → ["", "en", "auth", "callback"]
  const locale = url.pathname.split("/")[1] || "en"

  if (!code) {
    return NextResponse.redirect(`${url.origin}/${locale}/login`)
  }

  const supabase = await createClient()
  await supabase.auth.exchangeCodeForSession(code)

  // ✅ Correct redirect
  return NextResponse.redirect(`${url.origin}/${locale}/admin`)
}

