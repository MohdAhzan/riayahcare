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

export default function HospitalDetailPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" })
  const [loadingInquiry, setLoadingInquiry] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchHospital(id as string)
  }, [id])

  const fetchHospital = async (hospitalId: string) => {
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*, hospital_specialties (specialty)")
        .eq("id", hospitalId)
        .single()

      if (error) throw error

      const formatted: Hospital = {
        ...data,
        specialties: data.hospital_specialties?.map((s: any) => s.specialty) || [],
      }

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

        {/* Facilities */}
        {hospital.facilities && hospital.facilities.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Facilities</h2>
            <ul className="grid md:grid-cols-2 gap-2 text-gray-700 list-disc list-inside">
              {hospital.facilities.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* International Services */}
        {hospital.intl_services && hospital.intl_services.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">International Patient Services</h2>
            <ul className="grid md:grid-cols-2 gap-2 text-gray-700 list-disc list-inside">
              {hospital.intl_services.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Why Choose */}
        {hospital.why_choose && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Why Choose {hospital.name}?</h2>
            <p className="text-gray-700 leading-relaxed">{hospital.why_choose}</p>
          </div>
        )}

        {/* Gallery */}
        {hospital.gallery_urls && hospital.gallery_urls.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {hospital.gallery_urls.map((url, i) =>
                url.endsWith(".mp4") || url.endsWith(".mov") ? (
                  <VideoPlaceholder
                    key={i}
                    url={url}
                    alt={`Hospital Video ${i + 1}`}
                  />
                ) : (
                    <Image
                      key={i}
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      width={400}
                      height={250}
                      className="rounded-xl object-cover w-full shadow-sm"
                    />
                  )
              )}
            </div>
          </div>
        )}

        {/* Book Consultation CTA */}
        <div className="mt-16 text-center bg-emerald-50 py-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Need Assistance or a Quote?</h2>
          <p className="text-gray-700 mb-6">
            Let us help you connect with <strong>{hospital.name}</strong> for the best care
            options.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Book Consultation
          </button>
        </div>
      </div>

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
//import { createClient } from "@/lib/supabase/client"
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
//// Known accreditation logos (put real ones in /public/accreditations/)
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
//  const [hospital, setHospital] = useState<Hospital | null>(null)
//  const [loading, setLoading] = useState(true)
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
//  if (loading) return <div className="text-center py-12">Loading...</div>
//  if (!hospital) return <div className="text-center py-12">Hospital not found.</div>
//
//  const accreditations = hospital.accreditation
//    ? hospital.accreditation.split(",").map((a) => a.trim().toUpperCase())
//    : []
//
//  return (
//    <div className="max-w-6xl mx-auto px-4 py-10">
//      {/* Header */}
//      <div className="flex flex-col md:flex-row gap-8">
//        {/* Main Image */}
//        {hospital.image_url && (
//          <div className="flex-shrink-0 w-full md:w-1/2">
//            <Image
//              src={hospital.image_url}
//              alt={hospital.name}
//              width={800}
//              height={500}
//              className="rounded-2xl w-full object-cover shadow-md"
//            />
//          </div>
//        )}
//
//        {/* Info */}
//        <div className="flex flex-col justify-center md:w-1/2">
//          <h1 className="text-3xl font-bold text-gray-800 mb-3">{hospital.name}</h1>
//          <p className="text-gray-600 mb-2">
//            📍 {hospital.city}, {hospital.country}
//          </p>
//          <p className="text-gray-600 mb-2">🕓 Established: {hospital.year_established}</p>
//          <p className="text-gray-600 mb-2">✈️ {hospital.airport_distance}</p>
//          <p className="text-yellow-500 font-semibold">⭐ {hospital.rating.toFixed(1)} / 5</p>
//
//          {/* Accreditations */}
//          {accreditations.length > 0 && (
//            <div className="mt-4 flex flex-wrap gap-3 items-center">
//              {accreditations.map((a) => (
//                <div
//                  key={a}
//                  className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-1 shadow-sm"
//                >
//                  {accreditationLogos[a] ? (
//                    <Image
//                      src={accreditationLogos[a]}
//                      alt={a}
//                      width={32}
//                      height={32}
//                      className="object-contain"
//                    />
//                  ) : (
//                    <span className="text-sm font-semibold text-gray-700">{a}</span>
//                  )}
//                  <span className="text-sm font-medium text-gray-800">{a}</span>
//                </div>
//              ))}
//            </div>
//          )}
//        </div>
//      </div>
//
//      {/* Description */}
//      <div className="mt-10">
//        <h2 className="text-2xl font-semibold mb-3">About</h2>
//        <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
//      </div>
//
//      {/* Specialties */}
//      {hospital.specialties && hospital.specialties.length > 0 && (
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">Specialties</h2>
//          <div className="flex flex-wrap gap-2">
//            {hospital.specialties.map((s) => (
//              <span
//                key={s}
//                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium"
//              >
//                {s}
//              </span>
//            ))}
//          </div>
//        </div>
//      )}
//
//      {/* Facilities */}
//      {hospital.facilities && hospital.facilities.length > 0 && (
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">Facilities</h2>
//          <ul className="grid md:grid-cols-2 gap-2 text-gray-700 list-disc list-inside">
//            {hospital.facilities.map((f, i) => (
//              <li key={i}>{f}</li>
//            ))}
//          </ul>
//        </div>
//      )}
//
//      {/* International Services */}
//      {hospital.intl_services && hospital.intl_services.length > 0 && (
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">International Patient Services</h2>
//          <ul className="grid md:grid-cols-2 gap-2 text-gray-700 list-disc list-inside">
//            {hospital.intl_services.map((s, i) => (
//              <li key={i}>{s}</li>
//            ))}
//          </ul>
//        </div>
//      )}
//
//      {/* Why Choose */}
//      {hospital.why_choose && (
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">Why Choose {hospital.name}?</h2>
//          <p className="text-gray-700 leading-relaxed">{hospital.why_choose}</p>
//        </div>
//      )}
//
//      {/* Gallery */}
//      {hospital.gallery_urls && hospital.gallery_urls.length > 0 && (
//        <div className="mt-10">
//          <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
//          <div className="grid md:grid-cols-3 gap-4">
//            {hospital.gallery_urls.map((url, i) =>
//              url.endsWith(".mp4") || url.endsWith(".mov") ? (
//                <video
//                  key={i}
//                  src={url}
//                  controls
//                  className="rounded-xl w-full object-cover shadow-sm"
//                />
//              ) : (
//                <Image
//                  key={i}
//                  src={url}
//                  alt={`Gallery ${i + 1}`}
//                  width={400}
//                  height={250}
//                  className="rounded-xl object-cover w-full shadow-sm"
//                />
//              )
//            )}
//          </div>
//        </div>
//      )}
//    </div>
//  )
//}
//
