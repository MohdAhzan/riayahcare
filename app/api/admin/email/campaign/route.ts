
// app/api/admin/email/campaign/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, template_id, target_filters, scheduled_at } = await req.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from("email_campaigns")
      .insert({
        name,
        template_id,
        target_filters,
        scheduled_at,
        status: scheduled_at ? "scheduled" : "draft",
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error("Create campaign error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    const { data: campaigns } = await supabase
      .from("email_campaigns")
      .select(`
        *,
        template:email_templates(name, subject)
      `)
      .order("created_at", { ascending: false })

    return NextResponse.json({ campaigns })
  } catch (error: any) {
    console.error("Get campaigns error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

