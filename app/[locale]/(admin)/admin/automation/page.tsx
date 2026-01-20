//app/[locale]/(admin)/admin/automation/page.tsx

"use client"

import { useState } from "react"
import CRMAnalytics from "@/components/admin/crm-analytics"
// Import other automation components as you build them

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("analytics")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Automation</h1>
        <p className="text-gray-600 mt-2">Manage automated workflows and analytics</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {["analytics", "email", "whatsapp", "calendar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "analytics" && <CRMAnalytics />}
      {/* Add other tabs as you build the components */}
    </div>
  )
}
