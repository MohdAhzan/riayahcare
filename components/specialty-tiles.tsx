

"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useState } from "react"

interface Specialty {
  id: string
  key: string // translation key reference
  icon: React.ReactNode
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
  const t = useTranslations("specialty_tiles.specialties")
  const t1 = useTranslations("specialty_tiles")


  if (!specialty) return null

  const handleNavigateToHospitals = () => {
    router.push(`/hospitals?specialty=${encodeURIComponent(specialty.key)}`)
    onClose()
  }

  const handleNavigateToDoctors = () => {
    router.push(`/doctors?specialty=${encodeURIComponent(specialty.key)}`)
    onClose()
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-5xl mb-3">{specialty.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900">
              {t(`${specialty.key}.name`)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">{t(`${specialty.key}.description`)}</p>

        <div className="space-y-3">
          <div
            onClick={handleNavigateToDoctors}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 cursor-pointer"
          >
            <h3 className="font-semibold text-green-900 mb-2">
              {t1("best")} {t(`${specialty.key}.name`)} {t1("doctor")}
            </h3>
            <p className="text-sm text-green-700">
              {specialty.doctors_count} {t1("doc_data")}{" "}
              {t(`${specialty.key}.name`)}
            </p>
          </div>

          <div
            onClick={handleNavigateToHospitals}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 cursor-pointer"
          >
            <h3 className="font-semibold text-green-900 mb-2">
              {t1("best")} {t(`${specialty.key}.name`)} {t1("hospital")}
            </h3>
            <p className="text-sm text-green-700">
              {specialty.hospitals_count} {t1("hos_data")}{" "}
              {t(`${specialty.key}.name`)} {t1("facilities")} 
            </p>
          </div>

        </div>

        <div className="flex gap-3 mt-6">
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
  const t = useTranslations("specialty_tiles")
  const [specialties, setSpecialties] = useState<Specialty[]>([
    {
      id: "1",
      key: "cardiology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      hospitals_count: 45,
      doctors_count: 120,
      avg_cost: 450000,
    },
    {
      id: "2",
      key: "oncology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      hospitals_count: 52,
      doctors_count: 145,
      avg_cost: 800000,
    },
    {
      id: "3",
      key: "neurosurgery",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4 12h16" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      hospitals_count: 38,
      doctors_count: 95,
      avg_cost: 900000,
    },
    {
      id: "4",
      key: "spine_surgery",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      ),
      hospitals_count: 42,
      doctors_count: 108,
      avg_cost: 650000,
    },
    {
      id: "5",
      key: "orthopedics",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M8 12h8M8 8h8M8 16h8" />
        </svg>
      ),
      hospitals_count: 58,
      doctors_count: 165,
      avg_cost: 380000,
    },
    {
      id: "6",
      key: "pediatrics",
      icon: (
      <svg
      className="w-12 h-12 mx-auto"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Definitions for the mask */}
      <defs>
        <mask id="baby-mask">
          {/* 1. Fill the whole canvas with white (everything visible) */}
          <rect x="0" y="0" width="64" height="64" fill="white" stroke="none" />
          {/* 2. Draw a black circle where the baby head is (this area becomes hidden).
               We make the radius slightly larger (13.5) to account for the stroke width,
               ensuring a clean cut where the lines meet. */}
          <circle cx="44" cy="34" r="13.5" fill="black" stroke="none" />
        </mask>
      </defs>

      {/* Medical Cross - We apply the mask here so the baby head area is hidden */}
      <path
        mask="url(#baby-mask)"
        d="M20 6 H28 A4 4 0 0 1 32 10 V20 H42 A4 4 0 0 1 46 24 V32 A4 4 0 0 1 42 36 H32 V46 A4 4 0 0 1 28 50 H20 A4 4 0 0 1 16 46 V36 H6 A4 4 0 0 1 2 32 V24 A4 4 0 0 1 6 20 H16 V10 A4 4 0 0 1 20 6 Z"
      />

      {/* Baby Face Group - Drawn normally on top */}
      <g>
        {/* Head outline */}
        <circle cx="44" cy="34" r="12" />

        {/* Ears */}
        <path d="M32 34c-2-2-2 6 0 4" />
        <path d="M56 34c2-2 2 6 0 4" />

        {/* Eyes (Solid fill) */}
        <circle cx="40" cy="33" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="48" cy="33" r="1.5" fill="currentColor" stroke="none" />

        {/* Smile */}
        <path d="M40 38c2 2 6 2 8 0" />

        {/* Hair curl */}
        <path d="M44 23c2-2 6 2 2 4" />
      </g>
    </svg>
      ),
      hospitals_count: 18,
      doctors_count: 35,
      avg_cost: 5800000,
    },
    {
      id: "7",
      key: "gynecology",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2c3.314 0 6 2.686 6 6 0 2.748-1.872 5.064-4.418 5.82.396 1.164.618 2.413.618 3.68 0 5.523-4.477 10-10 10S0 23.523 0 18s4.477-10 10-10" />
        </svg>
      ),
      hospitals_count: 50,
      doctors_count: 130,
      avg_cost: 200000,
    },
    {
      id: "8",
      key: "ivf_fertility",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
      hospitals_count: 35,
      doctors_count: 85,
      avg_cost: 350000,
    },
    {
      id: "9",
      key: "liver_transplant",
      icon: (
        <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="13" rx="5" ry="7" />
          <path d="M17 13c0 2-1 3-2 4M7 13c0 2 1 3 2 4" />
        </svg>
      ),
      hospitals_count: 28,
      doctors_count: 65,
      avg_cost: 1800000,
    },
    {
      id: "10",
      key: "ayurveda",
      icon: (
        <svg
      className="w-12 h-12 mx-auto"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mortar Bowl */}
      <path d="M5 10c0 4.418 3.582 8 8 8s8-3.582 8-8H5z" />
      {/* Pestle */}
      <path d="M10.5 5l2.5 5" />
      {/* Small Leaf attached to bowl */}
      <path d="M3 7c1 0 3 1 3 4 0-3 3-4 3-4s-2-1-3-1-3 1-3 1z" />
    </svg>
      ),
      hospitals_count: 18,
      doctors_count: 35,
      avg_cost: 5800000,
    },
  ])

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)
  const tSpec = useTranslations("specialty_tiles.specialties")

  return (
    <>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{t("title")}</h2>
            <p className="text-lg text-gray-600">{t("tag")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.map((specialty, index) => {
              const isLastTwo =
                specialties.length % 4 === 2 &&
                  index >= specialties.length - 2

              // Render a wrapper ONLY for the first of the last two
              if (isLastTwo && index === specialties.length - 2) {
                return (
                  <div
                    key="last-two-wrapper"
                    className="col-span-2 md:col-span-3 lg:col-span-4 flex justify-center gap-4"
                  >
                    {specialties.slice(-2).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSpecialty(item)}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:scale-105 w-full max-w-xs"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="text-green-600">{item.icon}</div>
                          <h3 className="font-bold text-gray-900 text-center text-sm md:text-base">
                            {tSpec(`${item.key}.name`)}
                          </h3>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                            +
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              }

              // Skip rendering the second last item (already rendered above)
              if (isLastTwo) return null

              // Normal cards
              return (
                <button
                  key={specialty.id}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="text-green-600">{specialty.icon}</div>
                    <h3 className="font-bold text-gray-900 text-center text-sm md:text-base">
                      {tSpec(`${specialty.key}.name`)}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      +
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </section>

      <SpecialtyModal specialty={selectedSpecialty} onClose={() => setSelectedSpecialty(null)} />
    </>
  )
}


//<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//  {specialties.map((specialty) => (
//    <button
//      key={specialty.id}
//      onClick={() => setSelectedSpecialty(specialty)}
//      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
//    >
//      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//
//      <div className="relative z-10 flex flex-col items-center gap-3">
//        <div className="text-green-600">{specialty.icon}</div>
//        <h3 className="font-bold text-gray-900 text-center text-sm md:text-base">
//          {tSpec(`${specialty.key}.name`)}
//        </h3>
//        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
//          +
//        </div>
//      </div>
//    </button>
//  ))}
//</div>
//


