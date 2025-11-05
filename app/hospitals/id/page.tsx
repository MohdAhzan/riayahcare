
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

interface Hospital {
  id: string
  name: string
  city: string
  country: string
  specialty: string
  rating: number
  reviews_count: number
  image_url: string
  accreditation: string
  beds: number
  description: string
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")

  useEffect(() => {
    const fetchHospitals = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("hospitals").select("*")
      setHospitals(data || [])
      setFilteredHospitals(data || [])
      setLoading(false)
    }

    fetchHospitals()
  }, [])

  useEffect(() => {
    let filtered = hospitals

    if (selectedCountry) {
      filtered = filtered.filter((h) => h.country === selectedCountry)
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((h) => h.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    }

    setFilteredHospitals(filtered)
  }, [selectedCountry, selectedSpecialty, hospitals])

  const countries = [...new Set(hospitals.map((h) => h.country))]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Hospitals & Medical Centers</h1>
          <p className="text-green-100">Explore world-class healthcare facilities from leading hospitals worldwide</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="">All Specialties</option>
              <option>Orthopedic</option>
              <option>Cardiology</option>
              <option>Cosmetic Surgery</option>
              <option>Dental</option>
              <option>Neurology</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCountry("")
                setSelectedSpecialty("")
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading hospitals...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <Link key={hospital.id} href={`/hospitals/${hospital.id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                  <img
                    src={hospital.image_url || "/placeholder.svg"}
                    alt={hospital.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{hospital.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>
                        {hospital.city}, {hospital.country}
                      </span>
                    </div>
                    <p className="text-green-600 font-semibold text-sm mb-3">{hospital.specialty}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hospital.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                          </svg>
                          <span className="font-semibold">{hospital.rating}</span>
                          <span className="text-gray-600 text-sm">({hospital.reviews_count})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7"></circle>
                          <polyline points="8 14 12 17 16 14"></polyline>
                          <line x1="12" y1="17" x2="12" y2="23"></line>
                        </svg>
                        <span>{hospital.accreditation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hospitals found matching your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
