
// app/[locale]/(admin)/admin/leads/page.tsx


import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    q?: string
  }>
}) {
  const { page = "1", status, q } = await searchParams
  const pageNum = Number(page)
  const pageSize = 20

  const supabase = await createClient()

  const { data: statuses } = await supabase
    .from("lead_status")
    .select("id, name")
    .order("id")

  let query = supabase
    .from("leads_with_status")
    .select(
      `
        lead_id,
        patient_name,
        phone,
        source,
        status_name,
        created_at
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((pageNum - 1) * pageSize, pageNum * pageSize - 1)

  if (status) query = query.eq("lead_status_id", status)


  if (q) {
  const search = `%${q}%`
  query = query.or(
    `patient_name.ilike.${search},` +
    `phone.ilike.${search},` +
    `source.ilike.${search},` +
    `country.ilike.${search},` +
    `specialty.ilike.${search},` +
    `medical_problem.ilike.${search}`
  )
}
  const { data, count } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Leads</h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 bg-card p-4 rounded-lg shadow">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search anything..."
          className="input-field w-64"
        />

        <select
          name="status"
          defaultValue={status}
          className="input-field w-48"
        >
          <option value="">All Status</option>
          {statuses?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button className="btn-glass">Apply</button>
      </form>

      {/* Table */}
      <div className="bg-card rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left w-1/4">Name</th>
              <th className="p-3 w-1/5">Phone</th>
              <th className="p-3 w-1/6">Source</th>
              <th className="p-3 w-1/6">Status</th>
              <th className="p-3 w-1/5">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((lead) => (
              <tr key={lead.lead_id} className="border-t hover:bg-muted/50">
                <td className="p-3 truncate">
                  <a
                    href={`leads/${lead.lead_id}`}
                    className="text-primary font-medium hover:underline"
                  >
                   {lead.patient_name ?? "—"}
                  </a>
                </td>
                <td className="p-3">{lead.phone ?? "—"}</td>
                <td className="p-3 capitalize">{lead.source}</td>
                <td className="p-3">
                  <StatusBadge name={lead.status_name} />
                </td>
                <td className="p-3">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2">
        {Array.from({ length: Math.ceil((count ?? 0) / pageSize) }).map(
          (_, i) => (
            <a
              key={i}
              href={`?page=${i + 1}`}
              className={`px-3 py-1 rounded border ${
                i + 1 === pageNum ? "bg-primary text-white" : ""
              }`}
            >
              {i + 1}
            </a>
          )
        )}
      </div>
    </div>
  )
}

