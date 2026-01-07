//app/[locale]/admin/page.tsx

"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AdminDoctorsRoot from "@/components/admin/addDoctor/admin-doctors-root"
import AdminHospitals from "@/components/admin/admin-hospitals"
import AdminProcedures from "@/components/admin/admin-procedures"
import AdminTestimonials from "@/components/admin/admin-testimonials"
import AdminBanners from "@/components/admin/admin-banners"
import AdminFAQs from "@/components/admin/faqs/admin-faqs"

const TABS = [
  "banners",
  "hospitals",
  "doctors",
  "procedures",
  "testimonials",
  "faqs",
] as const

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("banners")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-green-100">
            Manage banners, hospitals, doctors, procedures, testimonials, and FAQs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ✅ SINGLE TAB BAR */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 flex-wrap overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ✅ CONTENT SWITCH */}
        {activeTab === "banners" && <AdminBanners />}
        {activeTab === "hospitals" && <AdminHospitals />}
        {activeTab === "doctors" && <AdminDoctorsRoot />}
        {activeTab === "procedures" && <AdminProcedures />}
        {activeTab === "testimonials" && <AdminTestimonials />}
        {activeTab === "faqs" && <AdminFAQs />}
      </div>

      <Footer />
    </div>
  )
}

