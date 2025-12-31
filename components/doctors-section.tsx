"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Star } from "lucide-react"
import Link from "next/link"

interface Doctor {
  id: string
  name: string
  slug:string
  specialty: string
  experience_years: number
  bio: string
  rating: number
  reviews_count: number
  image_url: string
}

export default function DoctorsSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("doctors").select("*").limit(6)
      setDoctors(data || [])
      setLoading(false)
    }

    fetchDoctors()
  }, [])

  if (loading) return <div className="text-center py-12">Loading doctors...</div>

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Doctors</h2>
          <p className="text-gray-600 text-lg">Experienced medical professionals with proven track records</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Link key={doctor.id} href={`/doctors/${doctor.slug}`}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                <img
                  src={doctor.image_url || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-2">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mb-3">{doctor.experience_years} years experience</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{doctor.rating}</span>
                    <span className="text-gray-600 text-sm">({doctor.reviews_count})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/doctors"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            View All Doctors
          </Link>
        </div>
      </div>
    </section>
  )
}
