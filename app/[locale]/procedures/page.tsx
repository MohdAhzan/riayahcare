"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { TrendingUp, DollarSign } from "lucide-react"

interface Procedure {
  id: string
  name: string
  specialty: string
  description: string
  cost_min: number
  cost_max: number
  recovery_days: number
  success_rate: number
}

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [maxPrice, setMaxPrice] = useState(50000)

  useEffect(() => {
    const fetchProcedures = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("procedures").select("*")
      setProcedures(data || [])
      setFilteredProcedures(data || [])
      setLoading(false)
    }

    fetchProcedures()
  }, [])

  useEffect(() => {
    let filtered = procedures

    if (selectedSpecialty) {
      filtered = filtered.filter((p) => p.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    }

    filtered = filtered.filter((p) => p.cost_max <= maxPrice)

    setFilteredProcedures(filtered)
  }, [selectedSpecialty, maxPrice, procedures])

  const specialties = [...new Set(procedures.map((p) => p.specialty))]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Medical Procedures</h1>
          <p className="text-blue-100">Browse our comprehensive list of procedures with transparent pricing</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price:  ₹{maxPrice.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="5000000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedSpecialty("")
                setMaxPrice(5000000)
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading procedures...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcedures.map((procedure) => (
              <div key={procedure.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{procedure.name}</h3>
                    <p className="text-blue-600 font-semibold text-sm">{procedure.specialty}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>

                <p className="text-gray-600 text-sm mb-4">{procedure.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900">
                      ${procedure.cost_min.toLocaleString()} - ${procedure.cost_max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recovery:</span>
                    <span className="font-semibold">{procedure.recovery_days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold text-green-600">{procedure.success_rate}%</span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                  Request Quote
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProcedures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No procedures found matching your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
