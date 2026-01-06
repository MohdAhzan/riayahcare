//app/[locale]/hospitals/page.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { useSearchParams, useParams } from "next/navigation"
import { dbT } from "@/i18n/db-translate"
import { useTranslations } from "next-intl"
import HelpWidget from "@/components/help-widget"

// --- INTERFACES ---

interface HospitalSpecialty {
  specialty: string
  translations?: any
}

interface Hospital {
  id: string
  slug: string
  name: string
  city: string
  country: string
  rating: number
  reviews_count: number
  image_url: string
  accreditation: string
  beds: number | null
  description: string
  hospital_specialties?: HospitalSpecialty[] | null
  translations?: any
}

export default function HospitalsPage() {
  const { locale } = useParams()
  const lang = locale === "ar" ? "ar" : "en"

  const t = useTranslations("all_hospital_page")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [allSpecialties, setAllSpecialties] = useState<string[]>([])

  const searchParams = useSearchParams()

  // --- EFFECT 1: FETCH DATA & INITIALIZE STATE FROM URL ---
  useEffect(() => {
    const fetchHospitals = async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from("hospitals")
        .select(`
*,
hospital_specialties (
specialty,
translations
)
`)

      const fetchedHospitals = ((data as Hospital[]) || []).map(h => ({
        ...h,
        // ✅ TRANSLATIONS (ONLY THIS PART IS NEW)
        name: dbT(h, "name", lang),
        city: dbT(h, "city", lang),
        country: dbT(h, "country", lang),
        description: dbT(h, "description", lang),
        hospital_specialties: (h.hospital_specialties || []).map(s => ({
          ...s,
          specialty: s.translations?.[lang]?.specialty ?? s.specialty,
        })),
      }))

      setHospitals(fetchedHospitals)
      setFilteredHospitals(fetchedHospitals)
      setLoading(false)

      // Collect all unique specialties
      const specialties = fetchedHospitals.flatMap(h =>
        (h.hospital_specialties || []).map(s => s.specialty).filter(Boolean)
      )
      setAllSpecialties([...new Set(specialties)].sort())

      const urlSpecialty = searchParams.get("specialty")
      if (urlSpecialty) {
        setSelectedSpecialty(urlSpecialty)
      }
    }

    fetchHospitals()
  }, [searchParams, lang])

  // --- EFFECT 2: FILTERING LOGIC ---
  useEffect(() => {
    let filtered = hospitals

    if (selectedCountry) {
      filtered = filtered.filter(h => h.country === selectedCountry)
    }

    if (selectedSpecialty) {
      const selectedSpecialtyLower = selectedSpecialty.toLowerCase()
      filtered = filtered.filter(h =>
        (h.hospital_specialties || []).some(s =>
          s.specialty?.toLowerCase().includes(selectedSpecialtyLower)
        )
      )
    }

    setFilteredHospitals(filtered)
  }, [selectedCountry, selectedSpecialty, hospitals])

  const countries = [...new Set(hospitals.map(h => h.country))]

  // --- JSX RENDER ---
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">
            {t("page_title")}
          </h1>
          <p className="text-green-100">
            {t("page_subtitle")}
          </p>
        </div>
      </div>


      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-3 gap-12">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-12">

            {/* FILTERS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("filters.country_label")}
                </label>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg"
                >
                  <option value="">{t("filters.country_all")}</option>
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("filters.specialty_label")}
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg"
                >
                  <option value="">{t("filters.specialty_all")}</option>
                  {allSpecialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCountry("")
                    setSelectedSpecialty("")
                  }}
                  className="w-full bg-green-600 text-white py-2 rounded-lg"
                >
                  {t("filters.reset")}
                </button>
              </div>
            </div>

            {/* HOSPITAL CARDS */}
            {loading ? (
              <div className="text-center py-12">{t("loading")}</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredHospitals.map(hospital => (
                    <Link key={hospital.id} href={`/hospitals/${hospital.slug}`}>
                      <div className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden">
                        <img
                          src={hospital.image_url || "/placeholder.svg"}
                          alt={hospital.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <h3 className="font-bold text-lg">{hospital.name}</h3>
                          <p className="text-sm text-gray-600">
                            {hospital.city}, {hospital.country}
                          </p>
                          <p className="text-sm text-green-600 mt-2">
                            {(hospital.hospital_specialties || [])
                              .map(s => s.specialty)
                              .slice(0, 2)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            {/* WHY RIAYAH CARE */}
            <div className="bg-card rounded-xl shadow p-6">
              <h3 className="font-semibold mb-3">
                {t("sidebar.why_title")}
              </h3>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.raw("sidebar.why_items").map((item: string, index: number) => (
                  <li key={index}>✔ {item}</li>
                ))}
              </ul>
            </div>

            {/* NEED HELP CARD */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-xl p-6">
              <h3 className="font-semibold mb-2">
                {t("sidebar.help_title")}
              </h3>

              <p className="text-sm mb-4">
                {t("sidebar.help_description")}
              </p>

              <button
                onClick={() => window.dispatchEvent(new Event("open-advisor"))}
                className="bg-white text-emerald-700 w-full py-2 rounded font-semibold"
              >
                {t("sidebar.help_button")}
              </button>
            </div>
          </aside>


        </div>
      </section>

      <HelpWidget/>
      <Footer />
    </div>
  )
}



//  <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
//  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//    <div className="grid md:grid-cols-3 gap-6 mb-12">
//      {/* Country Filter */}
//      <div>
//        <label className="block text-sm font-medium text-gray-700 mb-2">
//          {t("filters.country_label")}
//        </label>
//        <select
//          value={selectedCountry}
//          onChange={e => setSelectedCountry(e.target.value)}
//          className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
//        >
//          <option value="">{t("filters.country_all")}</option>
//          {countries.map(country => (
//            <option key={country} value={country}>
//              {country}
//            </option>
//          ))}
//        </select>
//      </div>
//
//      {/* Specialty Filter */}
//      <div>
//        <label className="block text-sm font-medium text-gray-700 mb-2">
//          {t("filters.specialty_label")}
//        </label>
//        <select
//          value={selectedSpecialty}
//          onChange={e => setSelectedSpecialty(e.target.value)}
//          className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:border-green-500"
//        >
//          <option value="">  {t("filters.specialty_all")} </option>
//          {allSpecialties.map(specialty => (
//            <option key={specialty} value={specialty}>
//              {specialty}
//            </option>
//          ))}
//        </select>
//      </div>
//
//      <div className="flex items-end">
//        <button
//          onClick={() => {
//            setSelectedCountry("")
//            setSelectedSpecialty("")
//          }}
//          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
//        >
//          {t("filters.reset")}
//        </button>
//      </div>
//    </div>
//
//    {loading ? (
//      <div className="text-center py-12"> {t("loading")} </div>
//    ) : (
//        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//          {filteredHospitals.map(hospital => (
//            <Link key={hospital.id} href={`/hospitals/${hospital.slug}`}>
//              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
//                <img
//                  src={hospital.image_url || "/placeholder.svg"}
//                  alt={hospital.name}
//                  className="w-full h-48 object-cover"
//                />
//                <div className="p-6">
//                  <h3 className="text-xl font-bold text-gray-900 mb-2">
//                    {hospital.name}
//                  </h3>
//                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
//                    <span>
//                      {hospital.city}, {hospital.country}
//                    </span>
//                  </div>
//
//                  <p className="text-green-600 font-semibold text-sm mb-3">
//                    {(hospital.hospital_specialties || [])
//                      .map(s => s.specialty)
//                      .filter(Boolean)
//                      .slice(0, 2)
//                      .join(", ")}
//                    {(hospital.hospital_specialties || []).length > 4 && (
//                      <span className="text-gray-500">, ...</span>
//                    )}
//                  </p>
//
//                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                    {hospital.description}
//                  </p>
//
//                  <div className="flex items-center gap-2 text-gray-600 text-sm">
//                    <span>{hospital.accreditation}</span>
//                  </div>
//                </div>
//              </div>
//            </Link>
//          ))}
//        </div>
//      )}
//
//    {!loading && filteredHospitals.length === 0 && (
//      <div className="text-center py-12">
//        <p className="text-gray-600">
//          {t("no_results")}
//        </p>
//      </div>
//    )}
//  </div>
//
//    {/* SIDEBAR */}
//    <aside className="space-y-6">
//      <div className="bg-card rounded-xl shadow p-6">
//        <h3 className="font-semibold mb-3">Why Riayah Care?</h3>
//        <ul className="space-y-2 text-sm text-muted-foreground">
//          <li>✔ Doctor & hospital coordination</li>
//          <li>✔ International patient support</li>
//          <li>✔ Transparent premium care</li>
//          <li>✔ Dedicated medical advisors</li>
//        </ul>
//      </div>
//
//      <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-xl p-6">
//        <h3 className="font-semibold mb-2">Need Help Choosing?</h3>
//        <p className="text-sm mb-4">
//          Talk to our medical advisor for free guidance.
//        </p>
//        <button
//          onClick={() =>
//            window.dispatchEvent(new Event("open-advisor"))
//          }
//          className="bg-white text-emerald-700 w-full py-2 rounded font-semibold"
//        >
//          Need Help?
//        </button>
//      </div>
//    </aside>
//</section>
