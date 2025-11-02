"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Star } from "lucide-react"

interface Testimonial {
  id: string
  patient_name: string
  patient_country: string
  procedure: string
  rating: number
  title: string
  content: string
  image_url: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("testimonials").select("*").limit(3)
      setTestimonials(data || [])
      setLoading(false)
    }

    fetchTestimonials()
  }, [])

  if (loading) return <div className="text-center py-12">Loading testimonials...</div>

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Patient Success Stories</h2>
          <p className="text-gray-600 text-lg">Hear from patients who transformed their lives with our care</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image_url || "/placeholder.svg"}
                  alt={testimonial.patient_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900">{testimonial.patient_name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.patient_country}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-blue-600 font-semibold text-sm mb-3">{testimonial.procedure}</p>

              <h4 className="font-bold text-gray-900 mb-2">{testimonial.title}</h4>

              <p className="text-gray-600 text-sm">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
