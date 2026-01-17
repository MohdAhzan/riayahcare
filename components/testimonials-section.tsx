
// components/testimonials-section.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useLocale } from "next-intl"
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

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const locale = useLocale()

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) throw error
        setTestimonials(data || [])
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="text-center animate-pulse">Loading testimonials...</div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Patient Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from patients who found hope and healing with Riayah Care
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => {
              const content = testimonial.translations[locale as 'en' | 'ar'] || testimonial.translations.en
              
              return (
                <div 
                  key={testimonial.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
                >
                  {/* Video Thumbnail or Quote Icon */}
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

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  {content?.title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {content.title}
                    </h3>
                  )}

                  {/* Content */}
                  <p className="text-gray-700 mb-4 line-clamp-4">
                    "{content?.content}"
                  </p>

                  {/* Patient Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-green-200">
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

          {/* View All Button */}
          <div className="text-center mt-12">
            <a 
              href="/testimonials"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              View All Stories
            </a>
          </div>
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
    </>
  )
}



//"use client"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import { Star } from "lucide-react"
//
//interface Testimonial {
//  id: string
//  patient_name: string
//  patient_country: string
//  procedure: string
//  rating: number
//  title: string
//  content: string
//  image_url: string
//}
//
//export default function TestimonialsSection() {
//  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
//  const [loading, setLoading] = useState(true)
//
//  useEffect(() => {
//    const fetchTestimonials = async () => {
//      const supabase = createClient()
//      const { data } = await supabase.from("testimonials").select("*").limit(3)
//      setTestimonials(data || [])
//      setLoading(false)
//    }
//
//    fetchTestimonials()
//  }, [])
//
//  if (loading) return <div className="text-center py-12">Loading testimonials...</div>
//
//  return (
//    <section className="py-16 md:py-24 bg-gray-50">
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//        <div className="text-center mb-12">
//          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Patient Success Stories</h2>
//          <p className="text-gray-600 text-lg">Hear from patients who transformed their lives with our care</p>
//        </div>
//
//        <div className="grid md:grid-cols-3 gap-6">
//          {testimonials.map((testimonial) => (
//            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition">
//              <div className="flex items-center gap-4 mb-4">
//                <img
//                  src={testimonial.image_url || "/placeholder.svg"}
//                  alt={testimonial.patient_name}
//                  className="w-12 h-12 rounded-full object-cover"
//                />
//                <div>
//                  <p className="font-bold text-gray-900">{testimonial.patient_name}</p>
//                  <p className="text-gray-600 text-sm">{testimonial.patient_country}</p>
//                </div>
//              </div>
//
//              <div className="flex gap-1 mb-3">
//                {Array.from({ length: testimonial.rating }).map((_, i) => (
//                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                ))}
//              </div>
//
//              <p className="text-blue-600 font-semibold text-sm mb-3">{testimonial.procedure}</p>
//
//              <h4 className="font-bold text-gray-900 mb-2">{testimonial.title}</h4>
//
//              <p className="text-gray-600 text-sm">{testimonial.content}</p>
//            </div>
//          ))}
//        </div>
//      </div>
//    </section>
//  )
//}
