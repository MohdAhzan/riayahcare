
//app/[locale]/(admin)/admin/leads/[id]/page.tsx

// app/[locale]/(admin)/admin/leads/[id]/page.tsx

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"
import { notFound } from "next/navigation"
import LeadActivityTimeline from "@/components/admin/lead-activity-timeline"
import LeadActions from "@/components/admin/lead-actions"
import { Mail, Phone, MapPin, Calendar, FileText, User } from "lucide-react"

export default async function LeadDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get lead with email from leads table
  const { data: lead } = await supabase
    .from("leads")
    .select(`
      *,
      lead_status:lead_status_id (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (!lead) notFound()

  let sourceData: any = null
  let leadEmail = lead.email // Get email directly from leads table

  // Fetch source-specific data and email if not in leads table
  if (lead.source === "private") {
    const { data } = await supabase
      .from("private_consultations")
      .select("*")
      .eq("phone", lead.phone)
      .single()
    sourceData = data
    if (!leadEmail && data?.email) {
      leadEmail = data.email
    }
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

  // Enhanced lead object with email
  const enhancedLead = {
    ...lead,
    lead_id: lead.id,
    status_name: lead.lead_status?.name,
    email: leadEmail,
    source_details: sourceData,
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{lead.patient_name || "Unnamed Lead"}</h1>
            </div>
            <div className="flex items-center gap-4 text-green-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {new Date(lead.created_at).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold capitalize">
                {lead.source}
              </span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-green-100 mb-1">Status</p>
            <div className="bg-white px-3 py-1 rounded-md">
              <StatusBadge name={lead.lead_status?.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Lead Details */}
        <div className="col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Contact Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Phone Number</p>
                    <p className="text-gray-900 font-medium">{lead.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Email Address</p>
                    <p className="text-gray-900 font-medium">
                      {leadEmail || (
                        <span className="text-red-600 text-sm">No email provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Country</p>
                    <p className="text-gray-900 font-medium">{lead.country || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Specialty</p>
                    <p className="text-gray-900 font-medium">{lead.specialty || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Medical Details</h2>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">Medical Problem</p>
                <p className="text-gray-900">{lead.medical_problem || "No information provided"}</p>
              </div>
            </div>
          </div>

          {/* Source Details */}
          {sourceData && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Source Details</h2>
              </div>
              <div className="p-6 space-y-3">
                {"email" in sourceData && sourceData.email && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Email</span>
                    <span className="text-gray-900">{sourceData.email}</span>
                  </div>
                )}

                {"scheduled_date" in sourceData && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">Scheduled Date</span>
                      <span className="text-gray-900">{sourceData.scheduled_date}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">Scheduled Time</span>
                      <span className="text-gray-900">{sourceData.scheduled_time}</span>
                    </div>
                  </>
                )}

                {"discussion_topic" in sourceData && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Discussion Topic</span>
                    <span className="text-gray-900">{sourceData.discussion_topic}</span>
                  </div>
                )}

                {sourceData.medical_report_url && (
                  <div className="pt-3">
                    <a
                      href={sourceData.medical_report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FileText className="w-4 h-4" />
                      View Medical Report
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <LeadActivityTimeline leadId={lead.id} />
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <LeadActions lead={enhancedLead} />
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Update Status</h2>
            </div>
            <div className="p-6">
              <form
                action={`/api/admin/leads/${id}/status`}
                method="POST"
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Status
                  </label>
                  <select
                    name="lead_status_id"
                    defaultValue={lead.lead_status_id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    {statuses?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add Note (Optional)
                  </label>
                  <textarea
                    name="note"
                    placeholder="Add a note about this status change..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    rows={4}
                  />
                </div>

                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
                  Update Status
                </button>
              </form>
            </div>
          </div>

          {/* Lead Info Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Lead Summary</h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lead ID</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {lead.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Source</span>
                <span className="capitalize font-semibold text-gray-900">{lead.source}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
              {lead.assigned_to && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assigned To</span>
                  <span className="text-gray-900">Admin User</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


//
//import { createClient } from "@/lib/supabase/server"
//import { StatusBadge } from "@/components/admin/status-badge"
//import { notFound } from "next/navigation"
//import LeadActivityTimeline from "@/components/admin/lead-activity-timeline"
//import LeadActions from "@/components/admin/lead-actions"
//
//export default async function LeadDetail({
//  params,
//}: {
//    params: Promise<{ id: string }>
//  }) {
//  const { id } = await params
//
//  const supabase = await createClient()
//
//  const { data: lead } = await supabase
//    .from("leads_with_status")
//    .select("*")
//    .eq("lead_id", id)
//    .single()
//
//  if (!lead) notFound()
//
//  let sourceData: any = null
//
//  if (lead.source === "private") {
//    const { data } = await supabase
//      .from("private_consultations")
//      .select("*")
//      .eq("phone", lead.phone)
//      .single()
//    sourceData = data
//  }
//
//  if (lead.source === "quote") {
//    const { data } = await supabase
//      .from("quote_requests")
//      .select("*")
//      .eq("phone", lead.phone)
//      .single()
//    sourceData = data
//  }
//
//  if (lead.source === "hospital") {
//    const { data } = await supabase
//      .from("hospital_inquiries")
//      .select("*")
//      .eq("phone", lead.phone)
//      .single()
//    sourceData = data
//  }
//
//  const { data: statuses } = await supabase
//    .from("lead_status")
//    .select("id, name")
//    .order("id")
//
//  return (
//    <div className="grid grid-cols-3 gap-6">
//      <div className="col-span-2 space-y-6">
//        <div className="bg-card p-6 rounded-lg shadow">
//          <h1 className="text-2xl font-bold text-primary mb-4">
//            {lead.patient_name}
//          </h1>
//
//          <p><strong>Phone:</strong> {lead.phone}</p>
//          <p><strong>Source:</strong> {lead.source}</p>
//          <p><strong>Problem:</strong> {lead.medical_problem ?? "—"}</p>
//          <p>
//            <strong>Created:</strong>{" "}
//            {new Date(lead.created_at).toLocaleString()}
//          </p>
//        </div>
//
//        {sourceData && (
//          <div className="bg-card p-6 rounded-lg shadow space-y-2">
//            <h2 className="font-semibold">Source Details</h2>
//
//            {"email" in sourceData && (
//              <p><strong>Email:</strong> {sourceData.email}</p>
//            )}
//
//            {"scheduled_date" in sourceData && (
//              <>
//                <p><strong>Date:</strong> {sourceData.scheduled_date}</p>
//                <p><strong>Time:</strong> {sourceData.scheduled_time}</p>
//              </>
//            )}
//
//            {sourceData.medical_report_url && (
//              <a
//                href={sourceData.medical_report_url}
//                target="_blank"
//                className="text-primary underline"
//              >
//                View Medical Report
//              </a>
//            )}
//          </div>
//        )}
//      </div>
//
//      <div className="space-y-6">
//        <div className="bg-card p-6 rounded-lg shadow">
//          <h2 className="font-semibold mb-2">Status</h2>
//          <StatusBadge name={lead.status_name} />
//          <form
//            action={`/api/admin/leads/${id}/status`}
//            method="POST"
//            className="mt-4 space-y-3"
//          >
//            <select
//              name="lead_status_id"
//              defaultValue={lead.lead_status_id}
//              className="input-field w-full"
//            >
//              {statuses?.map((s) => (
//                <option key={s.id} value={s.id}>
//                  {s.name}
//                </option>
//              ))}
//            </select>
//
//            <textarea
//              name="note"
//              placeholder="Add a note (optional)…"
//              className="input-field w-full h-20 resize-none"
//            />
//
//            <button className="btn-glass w-full">Update Status</button>
//          </form>
//
//        </div>
//
//        <div className="space-y-6">
//
//          {/* <LeadActions lead={lead} /> */}
//
//            <LeadActions lead={{ ...lead, email: lead.email ?? sourceData?.email ?? null }} />
//
//              <LeadActivityTimeline leadId={lead.lead_id} />
//        </div>
//
//        <LeadActivityTimeline leadId={lead.lead_id} />
//      </div>
//    </div>
//  )
//}
//
