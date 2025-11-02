"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Specialty {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  hospitals_count: number
  doctors_count: number
  avg_cost: number
}

interface SpecialtyModalProps {
  specialty: Specialty | null
  onClose: () => void
}

function SpecialtyModal({ specialty, onClose }: SpecialtyModalProps) {
  const router = useRouter()

  if (!specialty) return null

  const handleNavigateToHospitals = () => {
    router.push(`/hospitals?specialty=${encodeURIComponent(specialty.name)}`)
    onClose()
  }

  const handleNavigateToDoctors = () => {
    router.push(`/doctors?specialty=${encodeURIComponent(specialty.name)}`)
    onClose()
  }

  const handleNavigateToCost = () => {
    router.push(`/cost?specialty=${encodeURIComponent(specialty.name)}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-5xl mb-3">{specialty.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900">{specialty.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">{specialty.description}</p>

        <div className="space-y-3">
          <div
            onClick={handleNavigateToDoctors}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 cursor-pointer"
          >
            <h3 className="font-semibold text-green-900 mb-2">Best {specialty.name} Doctors in India</h3>
            <p className="text-sm text-green-700">
              {specialty.doctors_count} expert doctors specializing in {specialty.name.toLowerCase()}
            </p>
          </div>

          <div
            onClick={handleNavigateToHospitals}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 cursor-pointer"
          >
            <h3 className="font-semibold text-green-900 mb-2">Best {specialty.name} Hospitals In India</h3>
            <p className="text-sm text-green-700">
              {specialty.hospitals_count} hospitals with world-class {specialty.name.toLowerCase()} facilities
            </p>
          </div>

          <div
            onClick={handleNavigateToCost}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 cursor-pointer"
          >
            <h3 className="font-semibold text-green-900 mb-2">{specialty.name} Treatment Cost in India</h3>
            <p className="text-sm text-green-700">
              Average cost: ₹{specialty.avg_cost?.toLocaleString() || "Contact for quote"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleNavigateToHospitals}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
          >
            View Hospitals
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SpecialtyTiles() {
  const [specialties, setSpecialties] = useState<Specialty[]>([
    {
      id: "1",
      name: "Cardiology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      description: "Heart and cardiovascular disease treatment",
      hospitals_count: 45,
      doctors_count: 120,
      avg_cost: 450000,
    },
    {
      id: "2",
      name: "Oncology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      description: "Cancer treatment and tumor management",
      hospitals_count: 52,
      doctors_count: 145,
      avg_cost: 800000,
    },
    {
      id: "3",
      name: "Neurosurgery",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4 12h16" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      description: "Brain and nervous system surgery",
      hospitals_count: 38,
      doctors_count: 95,
      avg_cost: 900000,
    },
    {
      id: "4",
      name: "Spine Surgery",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      ),
      description: "Spinal cord and vertebral treatments",
      hospitals_count: 42,
      doctors_count: 108,
      avg_cost: 650000,
    },
    {
      id: "5",
      name: "Orthopedics",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M8 12h8M8 8h8M8 16h8" />
        </svg>
      ),
      description: "Bone, joint, and limb treatments",
      hospitals_count: 58,
      doctors_count: 165,
      avg_cost: 380000,
    },
    {
      id: "6",
      name: "Gynecology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2c3.314 0 6 2.686 6 6 0 2.748-1.872 5.064-4.418 5.82.396 1.164.618 2.413.618 3.68 0 5.523-4.477 10-10 10S0 23.523 0 18s4.477-10 10-10" />
        </svg>
      ),
      description: "Women's health and reproductive care",
      hospitals_count: 50,
      doctors_count: 130,
      avg_cost: 200000,
    },
    {
      id: "7",
      name: "IVF/Fertility",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
      description: "Fertility treatments and IVF procedures",
      hospitals_count: 35,
      doctors_count: 85,
      avg_cost: 350000,
    },
    {
      id: "8",
      name: "Liver Transplant",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="13" rx="5" ry="7" />
          <path d="M17 13c0 2-1 3-2 4M7 13c0 2 1 3 2 4" />
        </svg>
      ),
      description: "Liver disease and transplant surgery",
      hospitals_count: 28,
      doctors_count: 65,
      avg_cost: 1800000,
    },
  ])

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)

  return (
    <>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Multi-Specialty Focus</h2>
            <p className="text-lg text-gray-600">
              We cover all medical needs, from hair transplants to heart transplants.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => setSelectedSpecialty(specialty)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {/* Glass effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="text-green-600">{specialty.icon}</div>
                  <h3 className="font-bold text-gray-900 text-center text-sm md:text-base">{specialty.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    +
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <SpecialtyModal specialty={selectedSpecialty} onClose={() => setSelectedSpecialty(null)} />
    </>
  )
}
