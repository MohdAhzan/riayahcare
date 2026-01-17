
// app/[locale]/testimonials/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocale } from "next-intl"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Star, Play, Quote } from "lucide-react"

interface Testimonial {
  id: string
  patient_name: string
  patient_country: string
  patient_image_url: string | null
  video_url: string | null
  treatment_type: string
  rating: number
  translations: {
    en?: { content: string; title: string }
    ar?: { content: string; title: string }
  }
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [filterTreatment, setFilterTreatment] = useState<string>("all")
  const locale = useLocale()
  const supabase = createClient()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const treatments = ["all", ...Array.from(new Set(testimonials.map(t => t.treatment_type)))]
  const filteredTestimonials = filterTreatment === "all" 
    ? testimonials 
    : testimonials.filter(t => t.treatment_type === filterTreatment)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Patient Success Stories</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Real experiences from patients who found hope and healing with Riayah Care
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3 flex-wrap justify-center">
            {treatments.map(treatment => (
              <button
                key={treatment}
                onClick={() => setFilterTreatment(treatment)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterTreatment === treatment
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {treatment === "all" ? "All Treatments" : treatment}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No testimonials found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTestimonials.map(testimonial => {
                const content = testimonial.translations[locale as 'en' | 'ar'] || testimonial.translations.en
                return (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                  >
                    {testimonial.video_url ? (
                      <div
                        className="relative h-48 rounded-xl overflow-hidden mb-4 cursor-pointer group"
                        onClick={() => setSelectedVideo(testimonial.video_url)}
                      >
                        <img
                          src={testimonial.patient_image_url || "/placeholder.svg"}
                          alt={testimonial.patient_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 mb-4">
                        {testimonial.patient_image_url && (
                          <img
                            src={testimonial.patient_image_url}
                            alt={testimonial.patient_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                          />
                        )}
                        <Quote className="w-8 h-8 text-green-500" />
                      </div>
                    )}

                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>

                    {content?.title && (
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {content.title}
                      </h3>
                    )}

                    <p className="text-gray-700 mb-4">
                      "{content?.content}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.patient_name}</p>
                        <p className="text-sm text-gray-600">{testimonial.patient_country}</p>
                      </div>
                      <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
                        {testimonial.treatment_type}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-green-400 text-2xl"
            >
              ✕
            </button>
            <video
              controls
              autoPlay
              className="w-full h-full rounded-xl"
              src={selectedVideo}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

