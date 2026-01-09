
//app/[locale]/(admin)/admin/leads/[id]/page.tsx


import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"
import { notFound } from "next/navigation"

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
.eq("id", id)
.single()

  if (!lead) notFound()

  const { data: statuses } = await supabase
    .from("lead_status")
    .select("id, name")
    .order("id")

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main */}
      <div className="col-span-2 space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-primary mb-4">
            {lead.patient_name}
          </h1>

          <p><strong>Phone:</strong> {lead.phone}</p>
          <p><strong>Source:</strong> {lead.source}</p>
          <p><strong>Problem:</strong> {lead.medical_problem}</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Status</h2>
          <StatusBadge name={lead.status_name} />
          <form
            action={`/api/admin/leads/${id}/status`}
            method="POST"
            className="mt-4 flex gap-2"
          >
            <select
              name="lead_status_id"
              defaultValue={lead.lead_status_id}
              className="input-field flex-1"
            >
              {statuses?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button className="btn-glass">Update</button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Actions</h2>
          <a
            href="https://calendly.com/riayahcare/consultation"
            target="_blank"
            className="btn-glass block text-center"
          >
            Schedule Consultation
          </a>
        </div>
      </div>
    </div>
  )
}



//import { createClient } from "@/lib/supabase/server"
//import { StatusBadge } from "@/components/admin/status-badge"
//
//export default async function LeadDetail({
//  params,
//}: {
//  params: Promise<{ id: string }>
//}) {
//  const { id } = await params
//  const supabase = await createClient()
//
//  const { data: lead } = await supabase
//    .from("leads")
//    .select(
//      `
//        *,
//        lead_status:lead_status_id (id, name)
//      `
//    )
//    .eq("id", id)
//    .single()
//
//  if (!lead) return null
//
//  const { data: statuses } = await supabase
//    .from("lead_status")
//    .select("id, name")
//    .order("id")
//
//  return (
//    <div className="grid grid-cols-3 gap-6">
//      {/* LEFT */}
//      <div className="col-span-2 space-y-6">
//        <div className="bg-card p-6 rounded-lg shadow">
//          <h1 className="text-2xl font-bold text-primary mb-4">
//            {lead.patient_name}
//          </h1>
//
//          <p><strong>Phone:</strong> {lead.phone}</p>
//          <p><strong>Source:</strong> {lead.source}</p>
//          <p><strong>Problem:</strong> {lead.medical_problem}</p>
//        </div>
//      </div>
//
//      {/* RIGHT */}
//      <div className="space-y-6">
//        <div className="bg-card p-6 rounded-lg shadow">
//          <h2 className="font-semibold mb-2">Status</h2>
//
//          <StatusBadge name={lead.lead_status?.[0]?.name} />
//
//          <form
//            action={`/api/admin/leads/${id}/status`}
//            method="POST"
//            className="mt-4 flex gap-2"
//          >
//            <select
//              name="lead_status_id"
//              defaultValue={lead.lead_status_id}
//              className="input-field flex-1"
//            >
//              {statuses?.map((s: { id: number; name: string }) => (
//                <option key={s.id} value={s.id}>
//                  {s.name}
//                </option>
//              ))}
//            </select>
//
//            <button className="btn-glass">Update</button>
//          </form>
//        </div>
//
//        <div className="bg-card p-6 rounded-lg shadow">
//          <h2 className="font-semibold mb-2">Actions</h2>
//
//          <a
//            href="https://calendly.com/riayahcare/consultation"
//            target="_blank"
//            className="btn-glass block text-center"
//          >
//            Schedule Consultation
//          </a>
//        </div>
//      </div>
//    </div>
//  )
//}
//
