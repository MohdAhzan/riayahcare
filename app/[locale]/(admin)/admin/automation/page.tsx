////app/[locale]/(admin)/admin/automation/page.tsx
"use client"

import { useState } from "react"
import CRMAnalytics from "@/components/admin/crm-analytics"
import CalendlySettingsComponent from "@/components/admin/lead-calendly-settings-component"
import EmailProviderSettings from "@/components/admin/lead-email-provider-settings-component"
import EmailTemplatesManager from "@/components/admin/email-templates-manager"

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [emailSubTab, setEmailSubTab] = useState<"settings" | "templates">("settings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Automation & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Manage automated workflows, integrations, and view analytics
        </p>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: "analytics", label: "Analytics", icon: "📊" },
            { key: "calendly", label: "Calendly", icon: "📅" },
            { key: "email", label: "Email", icon: "✉️" },
            { key: "whatsapp", label: "WhatsApp", icon: "💬" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeTab === "analytics" && <CRMAnalytics />}
        
        {activeTab === "calendly" && <CalendlySettingsComponent />}
        
        {activeTab === "email" && (
          <div className="space-y-6">
            {/* Email Sub-tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setEmailSubTab("settings")}
                className={`pb-3 px-4 text-sm font-medium transition ${
                  emailSubTab === "settings"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Provider Settings
              </button>
              <button
                onClick={() => setEmailSubTab("templates")}
                className={`pb-3 px-4 text-sm font-medium transition ${
                  emailSubTab === "templates"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Email Templates
              </button>
            </div>

            {/* Email Sub-content */}
            {emailSubTab === "settings" && <EmailProviderSettings />}
            {emailSubTab === "templates" && <EmailTemplatesManager />}
          </div>
        )}
        
        {activeTab === "whatsapp" && <WhatsAppAutomationPlaceholder />}
      </div>
    </div>
  )
}

// Placeholder for WhatsApp automation (coming next)
function WhatsAppAutomationPlaceholder() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">💬</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Automation</h3>
      <p className="text-gray-600 mb-6">
        Set up WhatsApp chatbot and automated messaging for lead engagement
      </p>
      <div className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
        Coming Soon
      </div>
    </div>
  )
}

//"use client"
//
//import { useState } from "react"
//import CRMAnalytics from "@/components/admin/crm-analytics"
//import CalendlySettingsComponent from "@/components/admin/lead-calendly-settings-component"
//
//export default function AutomationPage() {
//  const [activeTab, setActiveTab] = useState("analytics")
//
//  return (
//    <div className="space-y-6">
//      <div>
//        <h1 className="text-3xl font-bold text-gray-900">Lead Automation & Analytics</h1>
//        <p className="text-gray-600 mt-2">
//          Manage automated workflows, integrations, and view analytics
//        </p>
//      </div>
//
//      {/* Tabs */}
//      <div className="border-b border-gray-200">
//        <nav className="flex gap-8">
//          {[
//            { key: "analytics", label: "Analytics", icon: "📊" },
//            { key: "calendly", label: "Calendly", icon: "📅" },
//            { key: "email", label: "Email", icon: "✉️" },
//            { key: "whatsapp", label: "WhatsApp", icon: "💬" },
//          ].map((tab) => (
//            <button
//              key={tab.key}
//              onClick={() => setActiveTab(tab.key)}
//              className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
//                activeTab === tab.key
//                  ? "border-green-600 text-green-600"
//                  : "border-transparent text-gray-500 hover:text-gray-700"
//              }`}
//            >
//              <span>{tab.icon}</span>
//              {tab.label}
//            </button>
//          ))}
//        </nav>
//      </div>
//
//      {/* Content */}
//      <div className="min-h-[600px]">
//        {activeTab === "analytics" && <CRMAnalytics />}
//        {activeTab === "calendly" && <CalendlySettingsComponent />}
//        {activeTab === "email" && <EmailAutomationPlaceholder />}
//        {activeTab === "whatsapp" && <WhatsAppAutomationPlaceholder />}
//      </div>
//    </div>
//  )
//}
//
//// Placeholder components for future features
//function EmailAutomationPlaceholder() {
//  return (
//    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
//      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//        <span className="text-3xl">✉️</span>
//      </div>
//      <h3 className="text-xl font-bold text-gray-900 mb-2">Email Automation</h3>
//      <p className="text-gray-600 mb-6">
//        Configure automated email campaigns and templates for leads
//      </p>
//      <div className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
//        Coming Soon
//      </div>
//    </div>
//  )
//}
//
//function WhatsAppAutomationPlaceholder() {
//  return (
//    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
//      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//        <span className="text-3xl">💬</span>
//      </div>
//      <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Automation</h3>
//      <p className="text-gray-600 mb-6">
//        Set up WhatsApp chatbot and automated messaging for lead engagement
//      </p>
//      <div className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
//        Coming Soon
//      </div>
//    </div>
//  )
//}
