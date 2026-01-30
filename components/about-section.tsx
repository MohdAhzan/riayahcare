
// components/about-section.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useLocale, useTranslations } from "next-intl"
import { Heart, Target, Eye, Award } from "lucide-react"
import Link from "next/link"

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

interface AboutSectionProps {
  isLandingPage?: boolean
}

const iconMap: Record<string, any> = {
  mission: Target,
  vision: Eye,
  values: Heart,
  main: Award
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 350) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export default function AboutSection({ isLandingPage = true }: AboutSectionProps) {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const t = useTranslations("aboutus")

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

  // Get content with locale fallback
  const getContent = (section: AboutSection) => {
    return section.translations[locale as 'en' | 'ar'] || section.translations.en
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main About Section */}
        {mainSection && (
          <div className={isLandingPage ? "" : "mb-20"}>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
                  {getContent(mainSection)?.title}
                </h2>
                {getContent(mainSection)?.subtitle && (
                  <p className="text-lg lg:text-xl text-green-600 mb-4 lg:mb-6 font-semibold">
                    {getContent(mainSection)?.subtitle}
                  </p>
                )}
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg">
                  {isLandingPage
                    ? truncateText(getContent(mainSection)?.content || '')
                    : getContent(mainSection)?.content}
                </p>
                {isLandingPage && (
                  <Link
                    href="/aboutus"
                    className="inline-block mt-6 lg:mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {t("cta")}
                  </Link>
                )}
              </div>
              {mainSection.image_url && (
                <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
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

        {/* Mission, Vision, Values Cards - Only show when NOT on landing page */}
        {!isLandingPage && otherSections.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {otherSections.map((section) => {
              const content = getContent(section)
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
