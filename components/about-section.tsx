
// components/about-section.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useLocale } from "next-intl"
import { Heart, Target, Eye, Award } from "lucide-react"

interface AboutSection {
  id: string
  section_type: string
  image_url: string | null
  order_index: number
  translations: {
    en?: { title: string; content: string; subtitle: string }
    ar?: { title: string; content: string; subtitle: string }
  }
}

const iconMap: Record<string, any> = {
  mission: Target,
  vision: Eye,
  values: Heart,
  main: Award
}

export default function AboutSection() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale()

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("about_us")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (error) throw error
        setSections(data || [])
      } catch (error) {
        console.error("Error fetching about sections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAbout()
  }, [])

  if (loading || sections.length === 0) return null

  const mainSection = sections.find(s => s.section_type === 'main')
  const otherSections = sections.filter(s => s.section_type !== 'main')

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main About Section */}
        {mainSection && (
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {mainSection.translations[locale as 'en' | 'ar']?.title || mainSection.translations.en?.title}
                </h2>
                {mainSection.translations[locale as 'en' | 'ar']?.subtitle && (
                  <p className="text-xl text-green-600 mb-6 font-semibold">
                    {mainSection.translations[locale as 'en' | 'ar']?.subtitle}
                  </p>
                )}
                <p className="text-gray-700 leading-relaxed text-lg">
                  {mainSection.translations[locale as 'en' | 'ar']?.content || mainSection.translations.en?.content}
                </p>
                <a 
                  href="/aboutus"
                  className="inline-block mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Learn More About Us
                </a>
              </div>
              {mainSection.image_url && (
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={mainSection.image_url}
                    alt="About Riayah Care"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mission, Vision, Values Cards */}
        {otherSections.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {otherSections.map((section) => {
              const content = section.translations[locale as 'en' | 'ar'] || section.translations.en
              const Icon = iconMap[section.section_type] || Award

              return (
                <div 
                  key={section.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-green-500"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {content?.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content?.content}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
