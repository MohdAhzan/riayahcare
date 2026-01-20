"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
} from "lucide-react"

interface AnalyticsData {
  totalLeads: number
  newLeads: number
  convertedLeads: number
  pendingLeads: number
  averageResponseTime: number
  conversionRate: number
  sourceBreakdown: { source: string; count: number }[]
  statusBreakdown: { status: string; count: number }[]
  recentActivity: {
    id: string
    patient_name: string
    status_name: string
    created_at: string
    source: string
  }[]
}

export default function CRMAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7") // days
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number(timeRange))

      // Get leads data
      const { data: allLeads } = await supabase
        .from("leads_with_status")
        .select("*")
        .gte("created_at", daysAgo.toISOString())

      const { data: newLeads } = await supabase
        .from("leads_with_status")
        .select("*")
        .eq("status_name", "New")
        .gte("created_at", daysAgo.toISOString())

      const { data: convertedLeads } = await supabase
        .from("leads_with_status")
        .select("*")
        .eq("status_name", "Converted")
        .gte("created_at", daysAgo.toISOString())

      const { data: pendingLeads } = await supabase
        .from("leads_with_status")
        .select("*")
        .in("status_name", ["Contacted", "Follow-up"])
        .gte("created_at", daysAgo.toISOString())

      const { data: recentActivity } = await supabase
        .from("leads_with_status")
        .select("lead_id, patient_name, status_name, created_at, source")
        .order("created_at", { ascending: false })
        .limit(10)

      // Calculate source breakdown
      const sourceMap: Record<string, number> = {}
      allLeads?.forEach((lead) => {
        sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1
      })

      // Calculate status breakdown
      const statusMap: Record<string, number> = {}
      allLeads?.forEach((lead) => {
        statusMap[lead.status_name] = (statusMap[lead.status_name] || 0) + 1
      })

      setAnalytics({
        totalLeads: allLeads?.length || 0,
        newLeads: newLeads?.length || 0,
        convertedLeads: convertedLeads?.length || 0,
        pendingLeads: pendingLeads?.length || 0,
        averageResponseTime: 2.5, // Mock data - implement actual calculation
        conversionRate:
          allLeads?.length
            ? ((convertedLeads?.length || 0) / allLeads.length) * 100
            : 0,
        sourceBreakdown: Object.entries(sourceMap).map(([source, count]) => ({
          source,
          count,
        })),
        statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
        })),
        recentActivity:
          recentActivity?.map((a) => ({
            id: a.lead_id,
            patient_name: a.patient_name || "Unknown",
            status_name: a.status_name,
            created_at: a.created_at,
            source: a.source,
          })) || [],
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!analytics) return null

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: any
    title: string
    value: string | number
    subtitle: string
    color: string
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm text-gray-500">{subtitle}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your lead performance and metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Leads"
          value={analytics.totalLeads}
          subtitle="All time"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={AlertCircle}
          title="New Leads"
          value={analytics.newLeads}
          subtitle="Uncontacted"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Converted"
          value={analytics.convertedLeads}
          subtitle="Success rate"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={analytics.pendingLeads}
          subtitle="Follow-up needed"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Conversion Rate & Response Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-600">
              {analytics.conversionRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">of total leads</span>
          </div>
          <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full"
              style={{ width: `${analytics.conversionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">
              {analytics.averageResponseTime}
            </span>
            <span className="text-sm text-gray-500">hours</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Target: &lt;4 hours for optimal conversion
          </p>
        </div>
      </div>

      {/* Source & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {analytics.sourceBreakdown.map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 capitalize">{item.source}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
          <div className="space-y-3">
            {analytics.statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === "Converted"
                        ? "bg-green-500"
                        : item.status === "New"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{activity.patient_name}</p>
                  <p className="text-sm text-gray-600">
                    Source: <span className="capitalize">{activity.source}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    activity.status_name === "Converted"
                      ? "bg-green-100 text-green-700"
                      : activity.status_name === "New"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {activity.status_name}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
