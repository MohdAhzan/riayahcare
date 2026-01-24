
// app/api/admin/email/send/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { lead_id, template_id, to, custom_subject, custom_body, variables } = await req.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email provider settings
    const { data: settings } = await supabase
      .from("email_provider_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!settings || !settings.is_active) {
      return NextResponse.json({ error: "Email provider not configured" }, { status: 400 })
    }

    let subject = custom_subject
    let body = custom_body

    // If template_id is provided, load template
    if (template_id) {
      const { data: template } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", template_id)
        .single()

      if (template) {
        subject = template.subject
        body = template.body

        // Replace variables
        if (variables) {
          Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g")
            subject = subject.replace(regex, String(value))
            body = body.replace(regex, String(value))
          })
        }
      }
    }

    // Send email
    let messageId = null
    if (settings.provider === "resend") {
      const resend = new Resend(settings.api_key)
      const result = await resend.emails.send({
        from: `${settings.from_name} <${settings.from_email}>`,
        to: [to],
        subject: subject,
        html: body.replace(/\n/g, "<br>"),
      })
      messageId = result.data?.id
    } else if (settings.provider === "sendgrid") {
      const sgMail = require("@sendgrid/mail")
      sgMail.setApiKey(settings.api_key)
      
      const result = await sgMail.send({
        from: { email: settings.from_email, name: settings.from_name },
        to: to,
        subject: subject,
        html: body.replace(/\n/g, "<br>"),
      })
      messageId = result[0]?.headers?.["x-message-id"]
    }

    // Log email
    await supabase.from("email_logs").insert({
      lead_id: lead_id,
      lead_table: "leads",
      template_id: template_id,
      to_email: to,
      subject: subject,
      body: body,
      status: "sent",
      provider_message_id: messageId,
      created_by: user.id,
      metadata: variables || {},
    })

    // Log event
    if (lead_id) {
      await supabase.from("lead_events").insert({
        lead_id: lead_id,
        event_type: "email_sent",
        payload: {
          to: to,
          subject: subject,
          template_id: template_id,
        },
        created_by: user.id,
      })
    }

    return NextResponse.json({ success: true, messageId })
  } catch (error: any) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
