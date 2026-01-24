// app/api/admin/calendly/schedule/route.ts

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { lead_id, lead_table, email, name, event_type_uri } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get Calendly settings
    const { data: settings } = await supabase
      .from("calendly_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!settings || !settings.is_active) {
      return NextResponse.json({ error: "Calendly not configured" }, { status: 400 })
    }

    // Create scheduling link
    const response = await fetch("https://api.calendly.com/scheduling_links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.calendly_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: settings.calendly_organization_uri,
        owner_type: "EventType",
        event_type: event_type_uri || settings.default_event_type_uri,
      }),
    })

    const calendlyData = await response.json()

    if (calendlyData.resource) {
      // Store in database
      await supabase.from("scheduled_meetings").insert({
        lead_id,
        lead_table,
        meeting_url: calendlyData.resource.booking_url,
        status: "scheduled",
        created_by: user.id,
        metadata: {
          invitee_email: email,
          invitee_name: name,
        },
      })

      // Log event
      await supabase.from("lead_events").insert({
        lead_id,
        event_type: "calendly_scheduled",
        payload: {
          booking_url: calendlyData.resource.booking_url,
          email,
        },
        created_by: user.id,
      })

      return NextResponse.json({
        success: true,
        booking_url: calendlyData.resource.booking_url,
      })
    }

    return NextResponse.json({ error: "Failed to create scheduling link" }, { status: 400 })
  } catch (error: any) {
    console.error("Calendly schedule error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
