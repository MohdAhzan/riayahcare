// app/api/admin/email/test/route.ts
//
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { to } = await req.json()
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

    // Send test email
    let result
    if (settings.provider === "resend") {
      const resend = new Resend(settings.api_key)
      result = await resend.emails.send({
        from: `${settings.from_name} <${settings.from_email}>`,
        to: [to],
        subject: "RiayahCare CRM - Test Email",
        html: `
          <h1>Test Email Successful!</h1>
          <p>Your email configuration is working correctly.</p>
          <p>This is a test email from your RiayahCare CRM system.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent from RiayahCare CRM</p>
        `,
      })
    } else if (settings.provider === "sendgrid") {
      const sgMail = require("@sendgrid/mail")
      sgMail.setApiKey(settings.api_key)
      
      result = await sgMail.send({
        from: { email: settings.from_email, name: settings.from_name },
        to: to,
        subject: "RiayahCare CRM - Test Email",
        html: `
          <h1>Test Email Successful!</h1>
          <p>Your email configuration is working correctly.</p>
          <p>This is a test email from your RiayahCare CRM system.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent from RiayahCare CRM</p>
        `,
      })
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

