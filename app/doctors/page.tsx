"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Star, Briefcase } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Doctor {
  id: string
  name: string
  specialty: string
  experience_years: number
  bio: string
  rating: number
  reviews_count: number
  image_url: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const searchParams = useSearchParams()

  useEffect(() => {
    const specialty = searchParams.get("specialty")
    if (specialty) {
      setSelectedSpecialty(specialty)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchDoctors = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("doctors").select("*")
      setDoctors(data || [])
      setFilteredDoctors(data || [])
      setLoading(false)
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    let filtered = doctors

    if (selectedSpecialty) {
      filtered = filtered.filter((d) => d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    }

    if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "experience") {
      filtered = [...filtered].sort((a, b) => b.experience_years - a.experience_years)
    }

    setFilteredDoctors(filtered)
  }, [selectedSpecialty, sortBy, doctors])

  const specialties = [...new Set(doctors.map((d) => d.specialty))]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Medical Professionals</h1>
          <p className="text-green-100">Connect with experienced doctors and specialists worldwide</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Specialties</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedSpecialty("")
                setSortBy("rating")
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading doctors...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                  <img
                    src={doctor.image_url || "/placeholder.svg"}
                    alt={doctor.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <p className="text-green-600 font-semibold text-sm mb-2">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <Briefcase className="w-4 h-4" />
                      <span>{doctor.experience_years} years experience</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{doctor.rating}</span>
                      <span className="text-gray-600 text-sm">({doctor.reviews_count})</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No doctors found matching your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
