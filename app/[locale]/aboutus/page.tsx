
// app/[locale]/aboutus/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocale } from "next-intl"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Heart, Target, Eye, Award, Users } from "lucide-react"

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

interface TeamMember {
  id: string
  name: string
  position: string
  image_url: string | null
  email: string | null
  linkedin_url: string | null
  translations: {
    en?: { bio: string }
    ar?: { bio: string }
  }
}

const iconMap: Record<string, any> = {
  mission: Target,
  vision: Eye,
  values: Heart,
  main: Award
}

export default function AboutUsPage() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sectionsRes, teamRes] = await Promise.all([
        supabase
          .from("about_us")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true }),
        supabase
          .from("team_members")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true })
      ])

      if (sectionsRes.error) throw sectionsRes.error
      if (teamRes.error) throw teamRes.error

      setSections(sectionsRes.data || [])
      setTeamMembers(teamRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const mainSection = sections.find(s => s.section_type === 'main')
  const otherSections = sections.filter(s => s.section_type !== 'main')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Riayah Care</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Connecting patients with world-class healthcare across borders
          </p>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Main About Section */}
          {mainSection && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {mainSection.translations[locale as 'en' | 'ar']?.content || mainSection.translations.en?.content}
                    </p>
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
            </section>
          )}

          {/* Mission, Vision, Values */}
          {otherSections.length > 0 && (
            <section className="py-20 bg-gradient-to-b from-green-50 to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                  What Drives Us
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {otherSections.map(section => {
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
                        {content?.subtitle && (
                          <p className="text-green-600 font-semibold mb-3">
                            {content.subtitle}
                          </p>
                        )}
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {content?.content}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Meet Our Team
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Dedicated professionals committed to your healthcare journey
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {teamMembers.map(member => {
                    const bio = member.translations[locale as 'en' | 'ar']?.bio || member.translations.en?.bio

                    return (
                      <div
                        key={member.id}
                        className="bg-gradient-to-b from-green-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
                      >
                        {member.image_url && (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-green-500"
                          />
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-green-600 font-semibold mb-3">
                          {member.position}
                        </p>
                        {bio && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-4">
                            {bio}
                          </p>
                        )}
                        <div className="flex gap-3 justify-center">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-gray-600 hover:text-green-600"
                            >
                              📧
                            </a>
                          )}
                          {member.linkedin_url && (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-green-600"
                            >
                              🔗
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Healthcare Journey?
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Get in touch with our medical advisors for personalized guidance
              </p>
              <button
                onClick={() => document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get Free Consultation
              </button>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  )
}


