

// app/[locale]/(admin)/admin/leads/page.tsx

// app/[locale]/(admin)/admin/leads/page.tsx

import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/admin/status-badge"
import { Filter, Search, Users, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    source?: string
    q?: string
  }>
}) {
  const { page = "1", status, source, q } = await searchParams
  const pageNum = Number(page)
  const pageSize = 20
  const supabase = await createClient()

  // Get filter options
  const { data: statuses } = await supabase
    .from("lead_status")
    .select("id, name")
    .order("id")

  // Get lead sources
  const sources = [
    { value: "private", label: "Private Consultation" },
    { value: "quote", label: "Quote Request" },
    { value: "hospital", label: "Hospital Inquiry" },
  ]

  // Build query
  let query = supabase
    .from("leads")
    .select(
      `
        id,
        patient_name,
        phone,
        email,
        source,
        country,
        specialty,
        medical_problem,
        created_at,
        lead_status:lead_status_id (
          id,
          name
        )
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((pageNum - 1) * pageSize, pageNum * pageSize - 1)

  if (status) query = query.eq("lead_status_id", status)
  if (source) query = query.eq("source", source)
  
  if (q) {
    const search = `%${q}%`
    query = query.or(
      `patient_name.ilike.${search},` +
      `phone.ilike.${search},` +
      `email.ilike.${search},` +
      `country.ilike.${search},` +
      `specialty.ilike.${search},` +
      `medical_problem.ilike.${search}`
    )
  }

const { data, count } = await query;
const leads = data as any[];
  // Get statistics
  const { data: statsData } = await supabase
    .from("leads")
    .select("lead_status_id")

  const totalLeads = statsData?.length || 0
  const newLeads = statsData?.filter(l => l.lead_status_id === 1).length || 0
  const convertedLeads = statsData?.filter(l => l.lead_status_id === 5).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all your leads in one place</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalLeads}</h3>
          <p className="text-sm text-gray-600">Total Leads</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{newLeads}</h3>
          <p className="text-sm text-gray-600">New Leads</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{convertedLeads}</h3>
          <p className="text-sm text-gray-600">Converted</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0}%
          </h3>
          <p className="text-sm text-gray-600">Conversion Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-bold text-gray-900">Filters</h2>
        </div>
        <form className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              name="status"
              defaultValue={status}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Statuses</option>
              {statuses?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              name="source"
              defaultValue={source}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Sources</option>
              {sources.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Apply Button */}
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <a
                        href={`leads/${lead.id}`}
                        className="font-semibold text-gray-900 hover:text-green-600 transition"
                      >
                        {lead.patient_name || "Unnamed Lead"}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        {lead.specialty || "No specialty"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">{lead.phone || "—"}</p>
                      <p className="text-gray-500">{lead.email || "No email"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge name={lead.lead_status?.name || "no status"} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`leads/${lead.id}`}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      View Details →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(!leads || leads.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No leads found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {count && count > pageSize && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-600">
            Showing {(pageNum - 1) * pageSize + 1} to {Math.min(pageNum * pageSize, count)} of {count} leads
          </p>
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(count / pageSize) }).map((_, i) => (
              <a
                key={i}
                href={`?page=${i + 1}${status ? `&status=${status}` : ""}${source ? `&source=${source}` : ""}${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  i + 1 === pageNum
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

//import { createClient } from "@/lib/supabase/server"
//import { StatusBadge } from "@/components/admin/status-badge"
//
//export default async function LeadsPage({
//  searchParams,
//}: {
//  searchParams: Promise<{
//    page?: string
//    status?: string
//    q?: string
//  }>
//}) {
//  const { page = "1", status, q } = await searchParams
//  const pageNum = Number(page)
//  const pageSize = 20
//
//  const supabase = await createClient()
//
//  const { data: statuses } = await supabase
//    .from("lead_status")
//    .select("id, name")
//    .order("id")
//
//  let query = supabase
//    .from("leads_with_status")
//    .select(
//      `
//        lead_id,
//        patient_name,
//        phone,
//        source,
//        status_name,
//        created_at
//      `,
//      { count: "exact" }
//    )
//    .order("created_at", { ascending: false })
//    .range((pageNum - 1) * pageSize, pageNum * pageSize - 1)
//
//  if (status) query = query.eq("lead_status_id", status)
//
//
//  if (q) {
//  const search = `%${q}%`
//  query = query.or(
//    `patient_name.ilike.${search},` +
//    `phone.ilike.${search},` +
//    `source.ilike.${search},` +
//    `country.ilike.${search},` +
//    `specialty.ilike.${search},` +
//    `medical_problem.ilike.${search}`
//  )
//}
//  const { data, count } = await query
//
//  return (
//    <div className="space-y-6">
//      <h1 className="text-2xl font-bold text-primary">Leads</h1>
//
//      {/* Filters */}
//      <form className="flex flex-wrap gap-3 bg-card p-4 rounded-lg shadow">
//        <input
//          name="q"
//          defaultValue={q}
//          placeholder="Search anything..."
//          className="input-field w-64"
//        />
//
//        <select
//          name="status"
//          defaultValue={status}
//          className="input-field w-48"
//        >
//          <option value="">All Status</option>
//          {statuses?.map((s) => (
//            <option key={s.id} value={s.id}>
//              {s.name}
//            </option>
//          ))}
//        </select>
//
//        <button className="btn-glass">Apply</button>
//      </form>
//
//      {/* Table */}
//      <div className="bg-card rounded-lg shadow overflow-x-auto">
//        <table className="w-full text-sm table-fixed">
//          <thead className="bg-muted">
//            <tr>
//              <th className="p-3 text-left w-1/4">Name</th>
//              <th className="p-3 w-1/5">Phone</th>
//              <th className="p-3 w-1/6">Source</th>
//              <th className="p-3 w-1/6">Status</th>
//              <th className="p-3 w-1/5">Created</th>
//            </tr>
//          </thead>
//          <tbody>
//            {data?.map((lead) => (
//              <tr key={lead.lead_id} className="border-t hover:bg-muted/50">
//                <td className="p-3 truncate">
//                  <a
//                    href={`leads/${lead.lead_id}`}
//                    className="text-primary font-medium hover:underline"
//                  >
//                   {lead.patient_name ?? "—"}
//                  </a>
//                </td>
//                <td className="p-3">{lead.phone ?? "—"}</td>
//                <td className="p-3 capitalize">{lead.source}</td>
//                <td className="p-3">
//                  <StatusBadge name={lead.status_name} />
//                </td>
//                <td className="p-3">
//                  {new Date(lead.created_at).toLocaleString()}
//                </td>
//              </tr>
//            ))}
//          </tbody>
//        </table>
//      </div>
//
//      {/* Pagination */}
//      <div className="flex gap-2">
//        {Array.from({ length: Math.ceil((count ?? 0) / pageSize) }).map(
//          (_, i) => (
//            <a
//              key={i}
//              href={`?page=${i + 1}`}
//              className={`px-3 py-1 rounded border ${
//                i + 1 === pageNum ? "bg-primary text-white" : ""
//              }`}
//            >
//              {i + 1}
//            </a>
//          )
//        )}
//      </div>
//    </div>
//  )
//}
//
