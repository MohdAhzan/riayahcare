
// app/api/admin/leads/[id]/status/route.ts


import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const form = await req.formData()
  const lead_status_id = Number(form.get("lead_status_id"))

  const supabase = await createClient()

  await supabase
    .from("leads")
    .update({ lead_status_id })
    .eq("id", id)

  return NextResponse.redirect(req.headers.get("referer")!)
}

