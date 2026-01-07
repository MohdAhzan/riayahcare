"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Procedure {
  id: string
  name: string
  specialty: string
  description: string
  cost_min: number
  cost_max: number
  success_rate: number
}

export default function ProceduresSection() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProcedures = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("procedures").select("*").limit(6)
      setProcedures(data || [])
      setLoading(false)
    }

    fetchProcedures()
  }, [])

  if (loading) return <div className="text-center py-12">Loading procedures...</div>

  return (
    <section className="py-16 md:py-24 border border-emerald-200 bg-gradient-to-br from-green-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Procedures</h2>
          <p className="text-gray-600 text-lg">Explore a wide range of medical procedures with transparent pricing</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {procedures.map((procedure) => (
            <div
              key={procedure.id}
              className="bg-gradient-to-br from-green-70 to-emerald-110 rounded-lg p-6 hover:shadow-lg transition border border-emerald-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{procedure.name}</h3>
                  <p className="text-green-600 font-semibold text-sm">{procedure.specialty}</p>
                </div>
                <svg
                  className="w-6 h-6 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8 9.5 1 16"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>

              <p className="text-gray-600 text-sm mb-4">{procedure.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Cost Range:</span>
                  <span className="font-bold text-gray-900">
                    ${procedure.cost_min.toLocaleString()} - ${procedure.cost_max.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Success Rate:</span>
                  <span className="font-bold text-green-600">{procedure.success_rate}%</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg transition">
                Request Quote
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/procedures"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            View All Procedures
          </Link>
        </div>
      </div>
    </section>
  )
}
