//components/procedures-section.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { TrendingUp, Clock, Award, ArrowRight } from "lucide-react"

interface Procedure {
  id: string
  slug?: string
  name: string
  specialty: string
  description: string
  cost_min: number
  cost_max: number
  success_rate: number
  recovery_days: number
  image_url?: string
  translations?: {
    en?: { name: string; description: string }
    ar?: { name: string; description: string }
  }
}

export default function EnhancedProceduresSection() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const t =useTranslations("procedures_section")

  useEffect(() => {
    const fetchProcedures = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("procedures")
        .select("*")
        .limit(6)
        .order("success_rate", { ascending: false })

      setProcedures(data || [])
      setLoading(false)
    }

    fetchProcedures()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const getProcedureName = (procedure: Procedure) => {
    return procedure.translations?.[locale as 'en' | 'ar']?.name || procedure.name
  }

  const getProcedureDescription = (procedure: Procedure) => {
    return procedure.translations?.[locale as 'en' | 'ar']?.description || procedure.description
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            {t("tag")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Procedures Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {procedures.map((procedure) => (
            <Link
              key={procedure.id}
              href={procedure.slug ? `/procedures/${procedure.slug}` : `/procedures`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100 block"
            >
              {/* Image */}
              {procedure.image_url && (
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
                  <img
                    src={procedure.image_url}
                    alt={getProcedureName(procedure)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-700 shadow-md">
                      {procedure.specialty}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {getProcedureName(procedure)}
                  </h3>
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {getProcedureDescription(procedure)}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">{t("success_rate")}</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {procedure.success_rate}%
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">{t("recovery")}</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {procedure.recovery_days} {t("days")}
                    </p>
                  </div>
                </div>

                {/* Cost Range */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">{t("cost_range")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{procedure.cost_min.toLocaleString()} - ₹{procedure.cost_max.toLocaleString()}
                  </p>
                </div>

                {/* CTA Button - Changed to span since Link wraps */}
                <span className="w-full bg-gradient-to-r from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2">
                  {t("view_details")}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/procedures"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 hover:border-green-600 hover:text-green-600 font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            {t("view_all")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}


//"use client"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import Link from "next/link"
//
//interface Procedure {
//  id: string
//  name: string
//  specialty: string
//  description: string
//  cost_min: number
//  cost_max: number
//  success_rate: number
//}
//
//export default function ProceduresSection() {
//  const [procedures, setProcedures] = useState<Procedure[]>([])
//  const [loading, setLoading] = useState(true)
//
//  useEffect(() => {
//    const fetchProcedures = async () => {
//      const supabase = createClient()
//      const { data } = await supabase.from("procedures").select("*").limit(6)
//      setProcedures(data || [])
//      setLoading(false)
//    }
//
//    fetchProcedures()
//  }, [])
//
//  if (loading) return <div className="text-center py-12">Loading procedures...</div>
//
//  return (
//    <section className="py-16 md:py-24 border border-emerald-200 bg-gradient-to-br from-green-50 ">
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//        <div className="text-center mb-12">
//          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Procedures</h2>
//          <p className="text-gray-600 text-lg">Explore a wide range of medical procedures with transparent pricing</p>
//        </div>
//
//        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ">
//          {procedures.map((procedure) => (
//            <div
//              key={procedure.id}
//              className="bg-gradient-to-br from-green-70 to-emerald-110 rounded-lg p-6 hover:shadow-lg transition border border-emerald-200"
//            >
//              <div className="flex items-start justify-between mb-4">
//                <div>
//                  <h3 className="text-xl font-bold text-gray-900 mb-2">{procedure.name}</h3>
//                  <p className="text-green-600 font-semibold text-sm">{procedure.specialty}</p>
//                </div>
//                <svg
//                  className="w-6 h-6 text-green-600"
//                  viewBox="0 0 24 24"
//                  fill="none"
//                  stroke="currentColor"
//                  strokeWidth="2"
//                >
//                  <polyline points="23 6 13.5 15.5 8 9.5 1 16"></polyline>
//                  <polyline points="17 6 23 6 23 12"></polyline>
//                </svg>
//              </div>
//
//              <p className="text-gray-600 text-sm mb-4">{procedure.description}</p>
//
//              <div className="space-y-3">
//                <div className="flex justify-between items-center">
//                  <span className="text-gray-700">Cost Range:</span>
//                  <span className="font-bold text-gray-900">
//                    ${procedure.cost_min.toLocaleString()} - ${procedure.cost_max.toLocaleString()}
//                  </span>
//                </div>
//                <div className="flex justify-between items-center">
//                  <span className="text-gray-700">Success Rate:</span>
//                  <span className="font-bold text-green-600">{procedure.success_rate}%</span>
//                </div>
//              </div>
//
//              <button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg transition">
//                Request Quote
//              </button>
//            </div>
//          ))}
//        </div>
//
//        <div className="text-center mt-12">
//          <Link
//            href="/procedures"
//            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition"
//          >
//            View All Procedures
//          </Link>
//        </div>
//      </div>
//    </section>
//  )
//}
