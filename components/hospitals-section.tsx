
// components/hospital-section.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { Star } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { dbT } from "@/i18n/db-translate"

interface Hospital {
  id: string
  slug: string
  name: string
  city: string
  country: string
  rating: number
  reviews_count: number
  image_url: string
  translations?: Record<string, any>
}

export default function HospitalsSection() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  const t = useTranslations("hospitals")
  const { locale } = useParams() as { locale: string }
  const lang = locale === "ar" ? "ar" : "en"

  useEffect(() => {
    const fetchHospitals = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("hospitals")
        .select("id, slug, name, city, country, rating, reviews_count, image_url, translations")
        .limit(3)

      if (error || !data) {
        console.error("[HospitalsSection] Supabase error:", error)
        setLoading(false)
        return
      }

      const formatted: Hospital[] = data.map((h) => ({
        ...h,
        name: dbT(h, "name", lang),
        city: dbT(h, "city", lang),
        country: dbT(h, "country", lang),
      }))

      setHospitals(formatted)
      setLoading(false)
    }

    fetchHospitals()
  }, [lang])

  if (loading) {
    return <div className="text-center py-12">Loading hospitals...</div>
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 text-lg">{t("tag")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <Link key={hospital.id} href={`/hospitals/${hospital.slug}`}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                <img
                  src={hospital.image_url || "/placeholder.svg"}
                  alt={hospital.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {hospital.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {hospital.city}, {hospital.country}
                  </p>

                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {hospital.rating}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ({hospital.reviews_count})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/hospitals"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            {t("view_all")}
          </Link>
        </div>
      </div>
    </section>
  )
}

