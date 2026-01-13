
// app/api/admin/leads/[id]/notes/route.ts

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = params

  const { data: { user } } = await supabase.auth.getUser()
  const body = await req.json()

  const { error } = await supabase.from("lead_notes").insert({
    lead_table: "leads", // ✅ REQUIRED
    lead_id: id,
    note: body.note,
    created_by: user?.id ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

