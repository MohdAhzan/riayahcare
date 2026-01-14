
//app/[locale]/(admin)/admin/leads/[id]/page.tsx

// app/[locale]/(admin)/admin/leads/[id]/page.tsx

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"
import { notFound } from "next/navigation"
import LeadActivityTimeline from "@/components/admin/lead-activity-timeline"
import LeadActions from "@/components/admin/lead-actions"

export default async function LeadDetail({
  params,
}: {
    params: Promise<{ id: string }>
  }) {
  const { id } = await params

  const supabase = await createClient()

  const { data: lead } = await supabase
    .from("leads_with_status")
    .select("*")
    .eq("lead_id", id)
    .single()

  if (!lead) notFound()

  let sourceData: any = null

  if (lead.source === "private") {
    const { data } = await supabase
      .from("private_consultations")
      .select("*")
      .eq("phone", lead.phone)
      .single()
    sourceData = data
  }

  if (lead.source === "quote") {
    const { data } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("phone", lead.phone)
      .single()
    sourceData = data
  }

  if (lead.source === "hospital") {
    const { data } = await supabase
      .from("hospital_inquiries")
      .select("*")
      .eq("phone", lead.phone)
      .single()
    sourceData = data
  }

  const { data: statuses } = await supabase
    .from("lead_status")
    .select("id, name")
    .order("id")

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-primary mb-4">
            {lead.patient_name}
          </h1>

          <p><strong>Phone:</strong> {lead.phone}</p>
          <p><strong>Source:</strong> {lead.source}</p>
          <p><strong>Problem:</strong> {lead.medical_problem ?? "—"}</p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(lead.created_at).toLocaleString()}
          </p>
        </div>

        {sourceData && (
          <div className="bg-card p-6 rounded-lg shadow space-y-2">
            <h2 className="font-semibold">Source Details</h2>

            {"email" in sourceData && (
              <p><strong>Email:</strong> {sourceData.email}</p>
            )}

            {"scheduled_date" in sourceData && (
              <>
                <p><strong>Date:</strong> {sourceData.scheduled_date}</p>
                <p><strong>Time:</strong> {sourceData.scheduled_time}</p>
              </>
            )}

            {sourceData.medical_report_url && (
              <a
                href={sourceData.medical_report_url}
                target="_blank"
                className="text-primary underline"
              >
                View Medical Report
              </a>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Status</h2>
          <StatusBadge name={lead.status_name} />
          <form
            action={`/api/admin/leads/${id}/status`}
            method="POST"
            className="mt-4 space-y-3"
          >
            <select
              name="lead_status_id"
              defaultValue={lead.lead_status_id}
              className="input-field w-full"
            >
              {statuses?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <textarea
              name="note"
              placeholder="Add a note (optional)…"
              className="input-field w-full h-20 resize-none"
            />

            <button className="btn-glass w-full">Update Status</button>
          </form>

        </div>

        <div className="space-y-6">
          <LeadActions lead={lead} />
          <LeadActivityTimeline leadId={lead.lead_id} />
        </div>

        <LeadActivityTimeline leadId={lead.lead_id} />
      </div>
    </div>
  )
}

