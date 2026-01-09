
// app/api/admin/leads/[id]/status/route.ts

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const form = await req.formData()
  const newStatusId = Number(form.get("lead_status_id"))

  // get current status
  const { data: lead } = await supabase
    .from("leads")
    .select("lead_status_id")
    .eq("id", id)
    .single()

  const oldStatusId = lead?.lead_status_id ?? null

  // update lead
  await supabase
    .from("leads")
    .update({ lead_status_id: newStatusId })
    .eq("id", id)

  // log history (NON-BREAKING)
  if (oldStatusId !== newStatusId) {
    await supabase.from("lead_status_history").insert({
      lead_id: id,
      old_status_id: oldStatusId,
      new_status_id: newStatusId,
    })
  }

  return NextResponse.redirect(req.headers.get("referer")!)
}

