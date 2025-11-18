"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import VideoPlaceholder from "@/components/videoplaceholder"

interface Hospital {
  id: string
  name: string
  city: string
  country: string
  accreditation: string
  year_established: number
  airport_distance: string
  rating: number
  reviews_count: number
  // Ensure these properties exist from the Supabase fetch
  facilities: string[]
  intl_services: string[]
  why_choose: string
  description: string
  image_url?: string
  gallery_urls?: string[]
  specialties?: string[]
}

// Accreditation logos — store these images in /public/accreditations/
const accreditationLogos: Record<string, string> = {
  JCI: "/accreditations/jci.png",
  NABH: "/accreditations/nabh.png",
  GHA: "/accreditations/gha.png",
  ISO: "/accreditations/iso.png",
}

/**
 * STATIC facility data (categorized for the "Facilities" tabbed section)
 * This is used for the complex facility display with tabs/accordion.
 */
const facilitySections = [
  {
    title: "Comfort During Stay",
    items: [
      "TV in room",
      "Private rooms",
      "Free Wifi",
      "Phone in Room",
      "Mobility accessible rooms",
      "Family accommodation",
      "Laundry",
      "Welcome",
      "Safe in the room",
      "Nursery / Nanny services",
      "Dry cleaning",
      "Personal assistance / Concierge",
      "Religious facilities",
      "Fitness",
      "Spa and wellness",
      "Café",
      "Business centre services",
      "Shop",
      "Dedicated smoking areas",
      "Beauty Salon",
      "Special offer for group stays",
      "Parking available",
    ],
  },
  {
    title: "Money Matters",
    items: [
      "Health insurance coordination",
      "Medical travel insurance",
      "Foreign currency exchange",
      "ATM",
      "Credit Card",
      "Debit Card",
      "Netbanking",
    ],
  },
  {
    title: "Food",
    items: ["Diet on Request", "Restaurant", "International Cuisine"],
  },
  {
    title: "Treatment Related",
    items: [
      "Medical records transfer",
      "Online doctor consultation",
      "Rehabilitation",
      "Pharmacy",
      "Document legalisation",
      "Post operative followup",
    ],
  },
  {
    title: "Language",
    items: ["Interpreter", "Translation services"],
  },
  {
    title: "Transportation",
    items: [
      "Airport pickup",
      "Local tourism options",
      "Local transportation booking",
      "Visa / Travel office",
      "Car Hire",
      "Private driver / Limousine services",
      "Air ambulance",
    ],
  },
]

// --- CONSTANT FOR LIMITING ITEMS ---
const FACILITY_ITEM_LIMIT = 10

export default function HospitalDetailPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [expandedGallery, setExpandedGallery] = useState(false)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" })
  const [loadingInquiry, setLoadingInquiry] = useState(false)

  // facilities UI state (desktop tabs)
  const [activeFacilityIndex, setActiveFacilityIndex] = useState(0)
  // facilities UI state (desktop content 'view more')
  const [showAllItems, setShowAllItems] = useState(false) 
  // mobile accordion open indices
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0) 

  useEffect(() => {
    if (!id) return
    fetchHospital(id as string)
  }, [id])
  
  useEffect(() => {
    // Reset showAllItems when the active tab changes
    setShowAllItems(false)
  }, [activeFacilityIndex])

  const fetchHospital = async (hospitalId: string) => {
    try {
      const { data, error } = await supabase
        .from("hospitals")
        // Ensure facilities and intl_services are selected
        .select("*, hospital_specialties (specialty)")
        .eq("id", hospitalId)
        .single()

      if (error) throw error

      // NOTE: Ensure the database columns 'facilities' and 'intl_services' are correctly fetched and formatted as string[]
      const formatted: Hospital = {
        ...data,
        specialties: data.hospital_specialties?.map((s: any) => s.specialty) || [],
      }

      // Fill in defaults if array columns are null/undefined from Supabase
      formatted.facilities = formatted.facilities || []
      formatted.intl_services = formatted.intl_services || []


      setHospital(formatted)
    } catch (err) {
      console.error("Error fetching hospital:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingInquiry(true)

    try {
      const { error } = await supabase.from("hospital_inquiries").insert([
        {
          hospital_id: hospital?.id,
          hospital_name: hospital?.name,
          name: inquiry.name,
          phone: inquiry.phone,
          message: inquiry.message,
        },
      ])

      if (error) throw error

      alert("Your inquiry has been submitted successfully!")
      setShowModal(false)
      setInquiry({ name: "", phone: "", message: "" })
    } catch (err) {
      console.error("Inquiry submission error:", err)
      alert("Failed to submit your inquiry.")
    } finally {
      setLoadingInquiry(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Loading...
      </div>
    )

  if (!hospital)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Hospital not found.
      </div>
    )

  const accreditations = hospital.accreditation
    ? hospital.accreditation.split(",").map((a) => a.trim().toUpperCase())
    : []

  const gallery = hospital.gallery_urls ?? []
  const previewGallery = gallery.slice(0, 4)
  const itemsToShow = expandedGallery ? gallery : previewGallery

  // ---- helper components inside same file ----
  function Checkmark() {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
        ✓
      </span>
    )
  }

  // Mobile accordion item 
  function MobileAccordionItem({
    index,
    title,
    items,
  }: {
    index: number
    title: string
    items: string[]
  }) {
    const open = openAccordionIndex === index
    const [showAllMobileItems, setShowAllMobileItems] = useState(false)
    
    // items to render for mobile view
    const mobileItemsToDisplay = showAllMobileItems 
        ? items 
        : items.slice(0, FACILITY_ITEM_LIMIT);

    const hasMore = items.length > FACILITY_ITEM_LIMIT;

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpenAccordionIndex(open ? null : index)}
          className={`w-full text-left px-4 py-3 flex items-center justify-between bg-emerald-50/30 hover:bg-emerald-50 transition`}
        >
          <span className="font-medium text-emerald-800">{title}</span>
          <span className="text-gray-600">{open ? "−" : "+"}</span>
        </button>

        {open && (
          <div className="px-4 pb-4 pt-2">
            <ul className="list-inside space-y-2 text-gray-700">
              {mobileItemsToDisplay.map((it, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Checkmark />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            
            {/* Mobile View More/Less Button */}
            {hasMore && (
                <button
                    onClick={() => setShowAllMobileItems(!showAllMobileItems)}
                    className="mt-4 text-sm text-emerald-600 font-medium hover:text-emerald-800 transition block"
                >
                    {showAllMobileItems ? "View Less ▲" : "View More ▼"}
                </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Determine which items to display for the active desktop tab
  const activeSection = facilitySections[activeFacilityIndex]
  const itemsToDisplay = showAllItems 
    ? activeSection.items 
    : activeSection.items.slice(0, FACILITY_ITEM_LIMIT);

  // Split items for a two-column layout on desktop
  const half = Math.ceil(itemsToDisplay.length / 2);
  const col1 = itemsToDisplay.slice(0, half);
  const col2 = itemsToDisplay.slice(half);

  const hasMoreItems = activeSection.items.length > FACILITY_ITEM_LIMIT;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Image */}
          {hospital.image_url && (
            <div className="flex-shrink-0 w-full md:w-1/2">
              <Image
                src={hospital.image_url}
                alt={hospital.name}
                width={800}
                height={500}
                className="rounded-2xl w-full object-cover shadow-md"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col justify-center md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{hospital.name}</h1>
            <p className="text-gray-600 mb-2">
              📍 {hospital.city}, {hospital.country}
            </p>
            <p className="text-gray-600 mb-2">🕓 Established: {hospital.year_established}</p>
            <p className="text-gray-600 mb-2">✈️ {hospital.airport_distance}</p>
            <p className="text-yellow-500 font-semibold">⭐ {hospital.rating.toFixed(1)} / 5</p>

            {/* Accreditations */}
            {accreditations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                {accreditations.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1 shadow-sm"
                  >
                    {accreditationLogos[a] ? (
                      <Image
                        src={accreditationLogos[a]}
                        alt={a}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">{a}</span>
                    )}
                    <span className="text-sm font-medium text-gray-800">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
        </div>

        {/* Specialties */}
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((s) => (
                <span
                  key={s}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RE-ADDED: INTERNATIONAL PATIENT SERVICES (from dynamic data) */}
        {hospital.intl_services.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-semibold mb-3">
              International Patient Services
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                {hospital.intl_services.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <Checkmark />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Why Choose */}
        {hospital.why_choose && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Why Choose {hospital.name}?</h2>
            <p className="text-gray-700 leading-relaxed">{hospital.why_choose}</p>
          </div>
        )}

        {/* ============================
            CATEGORIZED FACILITIES SECTION (from static data)
            ============================ */}
        <section className="mt-14">
          <div className="col-12 facilities pt-5" id="facilities">
            <h2 className="text-2xl font-semibold mb-3">
              Facilities
            </h2>

            {/* DESKTOP: Sidebar Tab Layout (Fixed) */}
            <div className="hidden md:flex gap-6 mt-4">
              {/* Left: glass sidebar tabs */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white/60 rounded-2xl p-2 border border-emerald-100 shadow-sm">
                  {facilitySections.map((section, idx) => {
                    const active = idx === activeFacilityIndex
                    return (
                      <button
                        key={section.title}
                        onClick={() => setActiveFacilityIndex(idx)}
                        className={`w-full text-left px-4 py-3 mb-2 rounded-lg transition flex items-center gap-3 ${
                          active
                            ? "btn-glass text-white shadow-lg"
                            : "bg-white text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        <span className="font-medium">{section.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right: content panel */}
              <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-emerald-800 mb-3">
                  {activeSection.title}
                </h3>
                <div className="list-w-circle">
                  
                  {/* Two-column layout for items */}
                  <div className="flex gap-10">
                    <ul className="space-y-3 w-1/2">
                      {col1.map((it, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <Checkmark />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-3 w-1/2">
                      {col2.map((it, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <Checkmark />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desktop View More/Less Button */}
                  {hasMoreItems && (
                      <div className="mt-6 text-center">
                          <button
                              onClick={() => setShowAllItems(!showAllItems)}
                              className="text-emerald-600 font-medium hover:text-emerald-800 transition flex items-center gap-2 mx-auto"
                          >
                              {showAllItems ? "View Less ▲" : "View More ▼"}
                          </button>
                      </div>
                  )}

                </div>
              </div>
            </div>

            {/* MOBILE: Accordion (Fixed) */}
            <div className="md:hidden mt-4 space-y-3">
              {facilitySections.map((section, idx) => (
                <MobileAccordionItem
                  key={section.title}
                  index={idx}
                  title={section.title}
                  items={section.items}
                />
              ))}
            </div>
          </div>
        </section>
        

        {/* --- GALLERY (simple expand collapse) --- */}
        {gallery.length > 0 && (
          <section className="mt-14 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Gallery</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {itemsToShow.map((url, i) =>
                url.endsWith(".mp4") ? (
                  <VideoPlaceholder key={i} url={url} alt={`video-${i}`} />
                ) : (
                  <Image
                    key={i}
                    src={url}
                    alt={`Gallery ${i}`}
                    width={500}
                    height={350}
                    className="rounded-xl object-cover w-full shadow-sm"
                  />
                )
              )}
            </div>

            {gallery.length > 4 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setExpandedGallery(!expandedGallery)}
                  className="btn-glass text-white px-5 py-2 rounded-lg font-medium"
                >
                  {expandedGallery ? "View less" : "View all photos"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Book Consultation CTA */}
        {/* CTA (desktop) */}
        <div className="mt-16 text-center bg-emerald-100 py-10 rounded-2xl shadow-sm hidden md:block">
          <h2 className="text-2xl font-semibold mb-3">
            Need Assistance or a Quote?
          </h2>
          <p className="text-gray-700 mb-6">Let us help you connect with {hospital.name}.</p>

          <button
            onClick={() => setShowModal(true)}
            className="btn-glass text-white px-6 py-3 rounded-lg shadow"
          >
            Book Consultation
          </button>
        </div>
      </div>

      {/* MOBILE FLOATING BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className=" btn-gls md:hidden fixed right-5 bottom-5 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center text-lg"
      >
        📞
      </button>
      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Book Consultation</h3>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={inquiry.name}
                onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                type="phone"
                placeholder="Phone No"
                value={inquiry.phone}
                onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <textarea
                placeholder="Your message or procedure interest"
                value={inquiry.message}
                onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                required
                className="w-full border rounded-lg px-4 py-2"
              ></textarea>
              <button
                type="submit"
                disabled={loadingInquiry}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg w-full transition disabled:opacity-60"
              >
                {loadingInquiry ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

//"use client"
//
//import { useEffect, useState } from "react"
//import { useParams } from "next/navigation"
//import Image from "next/image"
//import Navbar from "@/components/navbar"
//import Footer from "@/components/footer"
//import { createClient } from "@/lib/supabase/client"
//import VideoPlaceholder from "@/components/videoplaceholder"
//
//interface Hospital {
//  id: string
//  name: string
//  city: string
//  country: string
//  accreditation: string
//  year_established: number
//  airport_distance: string
//  rating: number
//  reviews_count: number
//  facilities: string[]
//  intl_services: string[]
//  why_choose: string
//  description: string
//  image_url?: string
//  gallery_urls?: string[]
//  specialties?: string[]
//}
//
//
//
//
//// Accreditation logos — store these images in /public/accreditations/
//const accreditationLogos: Record<string, string> = {
//  JCI: "/accreditations/jci.png",
//  NABH: "/accreditations/nabh.png",
//  GHA: "/accreditations/gha.png",
//  ISO: "/accreditations/iso.png",
//}
//
//export default function HospitalDetailPage() {
//  const { id } = useParams()
//  const supabase = createClient()
//
//  const [expandedGallery, setExpandedGallery] = useState(false)
//  const [hospital, setHospital] = useState<Hospital | null>(null)
//  const [loading, setLoading] = useState(true)
//  const [showModal, setShowModal] = useState(false)
//  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" })
//  const [loadingInquiry, setLoadingInquiry] = useState(false)
//
//  useEffect(() => {
//    if (!id) return
//    fetchHospital(id as string)
//  }, [id])
//
//  const fetchHospital = async (hospitalId: string) => {
//    try {
//      const { data, error } = await supabase
//        .from("hospitals")
//        .select("*, hospital_specialties (specialty)")
//        .eq("id", hospitalId)
//        .single()
//
//      if (error) throw error
//
//      const formatted: Hospital = {
//        ...data,
//        specialties: data.hospital_specialties?.map((s: any) => s.specialty) || [],
//      }
//
//      setHospital(formatted)
//    } catch (err) {
//      console.error("Error fetching hospital:", err)
//    } finally {
//      setLoading(false)
//    }
//  }
//
//  const handleInquirySubmit = async (e: React.FormEvent) => {
//    e.preventDefault()
//    setLoadingInquiry(true)
//
//    try {
//      const { error } = await supabase.from("hospital_inquiries").insert([
//        {
//          hospital_id: hospital?.id,
//          hospital_name: hospital?.name,
//          name: inquiry.name,
//          phone: inquiry.phone,
//          message: inquiry.message,
//        },
//      ])
//
//      if (error) throw error
//
//      alert("Your inquiry has been submitted successfully!")
//      setShowModal(false)
//      setInquiry({ name: "", phone: "", message: "" })
//    } catch (err) {
//      console.error("Inquiry submission error:", err)
//      alert("Failed to submit your inquiry.")
//    } finally {
//      setLoadingInquiry(false)
//    }
//  }
//
//  if (loading)
//    return (
//      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
//        Loading...
//      </div>
//    )
//
//  if (!hospital)
//    return (
//      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
//        Hospital not found.
//      </div>
//    )
//
//  const accreditations = hospital.accreditation
//    ? hospital.accreditation.split(",").map((a) => a.trim().toUpperCase())
//    : []
//
//  const gallery = hospital.gallery_urls ?? []
//  const previewGallery = gallery.slice(0, 4)
//
//  const itemsToShow = expandedGallery ? gallery : previewGallery
//
//
//  return (
//    <div className="min-h-screen bg-background">
//      <Navbar />
//
//      <div className="max-w-6xl mx-auto px-4 py-10">
//        {/* Header */}
//        <div className="flex flex-col md:flex-row gap-8">
//          {/* Main Image */}
//          {hospital.image_url && (
//            <div className="flex-shrink-0 w-full md:w-1/2">
//              <Image
//                src={hospital.image_url}
//                alt={hospital.name}
//                width={800}
//                height={500}
//                className="rounded-2xl w-full object-cover shadow-md"
//              />
//            </div>
//          )}
//
//          {/* Info */}
//          <div className="flex flex-col justify-center md:w-1/2">
//            <h1 className="text-3xl font-bold text-gray-800 mb-3">{hospital.name}</h1>
//            <p className="text-gray-600 mb-2">
//              📍 {hospital.city}, {hospital.country}
//            </p>
//            <p className="text-gray-600 mb-2">🕓 Established: {hospital.year_established}</p>
//            <p className="text-gray-600 mb-2">✈️ {hospital.airport_distance}</p>
//            <p className="text-yellow-500 font-semibold">⭐ {hospital.rating.toFixed(1)} / 5</p>
//
//            {/* Accreditations */}
//            {accreditations.length > 0 && (
//              <div className="mt-4 flex flex-wrap gap-3 items-center">
//                {accreditations.map((a) => (
//                  <div
//                    key={a}
//                    className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1 shadow-sm"
//                  >
//                    {accreditationLogos[a] ? (
//                      <Image
//                        src={accreditationLogos[a]}
//                        alt={a}
//                        width={32}
//                        height={32}
//                        className="object-contain"
//                      />
//                    ) : (
//                        <span className="text-sm font-semibold text-gray-700">{a}</span>
//                      )}
//                    <span className="text-sm font-medium text-gray-800">{a}</span>
//                  </div>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//
//        {/* Description */}
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">About</h2>
//          <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
//        </div>
//
//        {/* Specialties */}
//        {hospital.specialties && hospital.specialties.length > 0 && (
//          <div className="mt-10">
//            <h2 className="text-2xl font-semibold mb-3">Specialties</h2>
//            <div className="flex flex-wrap gap-2">
//              {hospital.specialties.map((s) => (
//                <span
//                  key={s}
//                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium"
//                >
//                  {s}
//                </span>
//              ))}
//            </div>
//          </div>
//        )}
//
//           {/* Facilities + Intl Services side-by-side */}
//        {(hospital.facilities.length > 0 || hospital.intl_services.length > 0) && (
//          <section className="mt-14 grid md:grid-cols-2 gap-12">
//            {/* Facilities */}
//            {hospital.facilities.length > 0 && (
//              <div>
//                <h2 className="text-2xl font-semibold mb-3">Facilities</h2>
//                <ul className="space-y-1">
//                  {hospital.facilities.map((f, i) => (
//                    <li key={i} className="flex items-start gap-2 text-gray-700">
//                      <span className="text-emerald-600 mt-1">✔</span> {f}
//                    </li>
//                  ))}
//                </ul>
//              </div>
//            )}
//
//            {/* International Services */}
//            {hospital.intl_services.length > 0 && (
//              <div>
//                <h2 className="text-2xl font-semibold mb-3">
//                  International Patient Services
//                </h2>
//                <ul className="space-y-1">
//                  {hospital.intl_services.map((s, i) => (
//                    <li key={i} className="flex items-start gap-2 text-gray-700">
//                      <span className="text-emerald-600 mt-1">✔</span> {s}
//                    </li>
//                  ))}
//                </ul>
//              </div>
//            )}
//          </section>
//        )}
//
//        {/* Why Choose */}
//        {hospital.why_choose && (
//          <div className="mt-10">
//            <h2 className="text-2xl font-semibold mb-3">Why Choose {hospital.name}?</h2>
//            <p className="text-gray-700 leading-relaxed">{hospital.why_choose}</p>
//          </div>
//        )}
//
//        {/* --- GALLERY (simple expand collapse) --- */}
//        {gallery.length > 0 && (
//          <section className="mt-14 bg-white p-6 rounded-2xl shadow-sm">
//            <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
//
//            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//              {itemsToShow.map((url, i) =>
//                url.endsWith(".mp4") ? (
//                  <VideoPlaceholder key={i} url={url} alt={`video-${i}`} />
//                ) : (
//                    <Image
//                      key={i}
//                      src={url}
//                      alt={`Gallery ${i}`}
//                      width={500}
//                      height={350}
//                      className="rounded-xl object-cover w-full shadow-sm"
//                    />
//                  )
//              )}
//            </div>
//
//            {gallery.length > 4 && (
//              <div className="mt-6 text-center">
//                <button
//                  onClick={() => setExpandedGallery(!expandedGallery)}
//                  className="btn-glass text-white px-5 py-2 rounded-lg font-medium"
//                >
//                  {expandedGallery ? "View less" : "View all photos"}
//                </button>
//              </div>
//            )}
//          </section>
//        )}
//
//        {/* Book Consultation CTA */}
//
//        {/* CTA (desktop) */}
//        <div className="mt-16 text-center bg-emerald-100 py-10 rounded-2xl shadow-sm hidden md:block">
//          <h2 className="text-2xl font-semibold mb-3">
//            Need Assistance or a Quote?
//          </h2>
//          <p className="text-gray-700 mb-6">Let us help you connect with {hospital.name}.</p>
//
//          <button
//            onClick={() => setShowModal(true)}
//            className="btn-glass text-white px-6 py-3 rounded-lg shadow"
//          >
//            Book Consultation
//          </button>
//        </div>
//      </div>
//
//      {/* MOBILE FLOATING BUTTON */}
//      <button
//        onClick={() => setShowModal(true)}
//        className=" btn-gls md:hidden fixed right-5 bottom-5 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center text-lg"
//      >
//       📞
//      </button>
//      <Footer />
//
//      {/* Modal */}
//      {showModal && (
//        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
//            <button
//              onClick={() => setShowModal(false)}
//              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
//            >
//              ✕
//            </button>
//            <h3 className="text-xl font-semibold mb-4">Book Consultation</h3>
//            <form onSubmit={handleInquirySubmit} className="space-y-4">
//              <input
//                type="text"
//                placeholder="Full Name"
//                value={inquiry.name}
//                onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
//                required
//                className="w-full border rounded-lg px-4 py-2"
//              />
//              <input
//                type="phone"
//                placeholder="Phone No"
//                value={inquiry.phone}
//                onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
//                required
//                className="w-full border rounded-lg px-4 py-2"
//              />
//              <textarea
//                placeholder="Your message or procedure interest"
//                value={inquiry.message}
//                onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
//                required
//                className="w-full border rounded-lg px-4 py-2"
//              ></textarea>
//              <button
//                type="submit"
//                disabled={loadingInquiry}
//                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg w-full transition disabled:opacity-60"
//              >
//                {loadingInquiry ? "Submitting..." : "Submit"}
//              </button>
//            </form>
//          </div>
//        </div>
//      )}
//    </div>
//  )
//}
//
//
//
//
//
//
//
