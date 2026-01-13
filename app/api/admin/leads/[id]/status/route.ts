
// app/api/admin/leads/[id]/status/route.ts

// app/api/admin/leads/[id]/status/route.ts

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ MUST await params
  const { id } = await params

  const supabase = await createClient()

  const form = await req.formData()
  const newStatusId = Number(form.get("lead_status_id"))

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: lead } = await supabase
    .from("leads")
    .select("lead_status_id")
    .eq("id", id)
    .single()

  const oldStatusId = lead?.lead_status_id ?? null


  const note = form.get("note")?.toString().trim()

  if (note) {
    await supabase.from("lead_notes").insert({
      lead_table: "leads",
      lead_id: id,
      note,
      created_by: user?.id ?? null,
    })
  }

  await supabase
  .from("leads")
  .update({ lead_status_id: newStatusId })
  .eq("id", id)

  if (oldStatusId !== newStatusId) {
    await supabase.from("lead_status_history").insert({
      lead_id: id,
      old_status_id: oldStatusId,
      new_status_id: newStatusId,
      changed_by: user?.id ?? null,
    })

    await supabase.from("lead_events").insert({
      lead_id: id,
      event_type: "status_changed",
      payload: {
        old_status_id: oldStatusId,
        new_status_id: newStatusId,
      },
      created_by: user?.id ?? null,
    })
  }

  const referer = req.headers.get("referer")!
  const { pathname } = new URL(referer)
  revalidatePath(pathname)

  return NextResponse.redirect(new URL(referer))
}



