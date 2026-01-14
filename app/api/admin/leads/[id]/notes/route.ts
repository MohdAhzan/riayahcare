
// app/api/admin/leads/[id]/notes/route.ts

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


//ADD STATUS NOTES
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

//EDIT STATUS NOTES
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await req.json()

  const { error } = await supabase
    .from("lead_notes")
    .update({ note: body.note })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

// DELETE STATUS NOTES
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from("lead_notes")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
