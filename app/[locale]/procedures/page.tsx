//app/[locale]/procedures/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { TrendingUp, Clock, DollarSign, ChevronRight } from "lucide-react"

interface Procedure {
  id: string
  slug: string
  name: string
  specialty: string
  description: string
  cost_min: number
  cost_max: number
  recovery_days: number
  success_rate: number
  image_url?: string
  translations?: {
    en?: { name: string; description: string; specialty: string }
    ar?: { name: string; description: string; specialty: string }
  }
}

export default function ProceduresPage() {
  const searchParams = useSearchParams()
  const initialSpecialty = searchParams.get('specialty') || ""

  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty)
  const [maxPrice, setMaxPrice] = useState(5000000)

  const locale = useLocale()
  const t = useTranslations("Procedures")
  const supabase = createClient()

  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    const { data } = await supabase.from("procedures").select("*").order("name")

    if (data) {
      const lang = locale === 'ar' ? 'ar' : 'en'
      const formatted = data.map(proc => ({
        ...proc,
        name: proc.translations?.[lang]?.name || proc.name,
        description: proc.translations?.[lang]?.description || proc.description,
        specialty: proc.translations?.[lang]?.specialty || proc.specialty,
      }))
      setProcedures(formatted)
      setFilteredProcedures(formatted)
    }
    setLoading(false)
  }

  useEffect(() => {
    let filtered = procedures

    if (selectedSpecialty) {
      filtered = filtered.filter((p) =>
        p.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
      )
    }

    filtered = filtered.filter((p) => p.cost_max <= maxPrice)

    setFilteredProcedures(filtered)
  }, [selectedSpecialty, maxPrice, procedures])

  const specialties = [...new Set(procedures.map((p) => p.specialty))]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-3">{t("page_title")}</h1>
          <p className="text-green-100 text-base lg:text-lg max-w-2xl">{t("page_subtitle")}</p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("filter_specialty")}
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">{t("all_specialties")}</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("max_price")}: ₹{maxPrice.toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSpecialty("")
                  setMaxPrice(5000000)
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition"
              >
                {t("reset_filters")}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcedures.map((procedure) => (
              <Link
                key={procedure.id}
                href={procedure.slug ? `/procedures/${procedure.slug}` : `/procedures`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                {procedure.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={procedure.image_url}
                      alt={procedure.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-green-600 font-semibold text-sm">{procedure.success_rate}% success</span>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {procedure.specialty}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {procedure.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{procedure.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        ₹{procedure.cost_min.toLocaleString()} - ₹{procedure.cost_max.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{procedure.recovery_days} {t("days")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">{procedure.success_rate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-green-600 font-semibold text-sm group-hover:text-green-700">
                      {t("view_details")}
                    </span>
                    <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredProcedures.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <p className="text-gray-600 text-lg">{t("no_results")}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
