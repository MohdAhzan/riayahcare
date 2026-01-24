
// app/api/admin/calendly/webhook/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const supabase = await createClient()

    // Handle different Calendly webhook events
    switch (payload.event) {
      case "invitee.created":
        // Meeting scheduled
        const { data: meeting } = await supabase
          .from("scheduled_meetings")
          .select("*")
          .eq("calendly_invitee_uri", payload.payload.uri)
          .single()

        if (meeting) {
          await supabase
            .from("scheduled_meetings")
            .update({
              calendly_event_uri: payload.payload.event,
              scheduled_time: payload.payload.scheduled_event.start_time,
              status: "scheduled",
            })
            .eq("id", meeting.id)
        }
        break

      case "invitee.canceled":
        // Meeting canceled
        await supabase
          .from("scheduled_meetings")
          .update({ status: "cancelled" })
          .eq("calendly_invitee_uri", payload.payload.uri)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
