
// app/[locale]/doctors/page.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import DesktopContactBar from "@/components/ui/desktop-contact-bar"
import { Star, Briefcase, Building2, Filter, ShieldCheck, Headphones, BadgeCheck, } from "lucide-react"
import HelpWidget from "@/components/help-widget"



const supabase = createClient()

type HospitalDoctor = {
  specialties: string[] | null
  hospitals: { name: string } | null
}

type Doctor = {
  id: string
  name: string
  slug: string
  experience_years: number
  bio: string | null
  rating: number | null
  image_url: string | null
  hospital_doctors: HospitalDoctor[]
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedHospital, setSelectedHospital] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from("doctors")
        .select(`
          id,
          name,
          slug,
          experience_years,
          bio,
          rating,
          image_url,
          hospital_doctors (
            specialties,
            hospitals ( name )
          )
        `)

      setDoctors((data ?? []) as unknown as Doctor[])
      setLoading(false)
    }

    fetchDoctors()
  }, [])

  /* ---------------- FILTER OPTIONS ---------------- */
  const specialties = useMemo(() => {
    const set = new Set<string>()
    doctors.forEach((d) =>
      d.hospital_doctors.forEach((hd) =>
        hd.specialties?.forEach((s) => set.add(s))
      )
    )
    return Array.from(set).sort()
  }, [doctors])

  const hospitals = useMemo(() => {
    const set = new Set<string>()
    doctors.forEach((d) =>
      d.hospital_doctors.forEach((hd) => {
        if (hd.hospitals?.name) set.add(hd.hospitals.name)
      })
    )
    return Array.from(set).sort()
  }, [doctors])

  /* ---------------- FILTERED LIST ---------------- */
  const filteredDoctors = useMemo(() => {
    let list = doctors

    if (selectedSpecialty) {
      list = list.filter((d) =>
        d.hospital_doctors.some((hd) =>
          hd.specialties?.includes(selectedSpecialty)
        )
      )
    }

    if (selectedHospital) {
      list = list.filter((d) =>
        d.hospital_doctors.some(
          (hd) => hd.hospitals?.name === selectedHospital
        )
      )
    }

    list =
      sortBy === "experience"
        ? [...list].sort(
            (a, b) => b.experience_years - a.experience_years
          )
        : [...list].sort(
            (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
          )

    return list
  }, [doctors, selectedSpecialty, selectedHospital, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ---------------- HERO ---------------- */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row justify-between gap-10">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                Find the Right Doctor
              </h1>
              <p className="text-emerald-100 max-w-2xl">
                Browse verified medical professionals across top hospitals
                worldwide with complete care support.
              </p>

              <div className="flex gap-10 mt-8 text-sm">
                <div>
                  <span className="text-2xl font-bold">
                    {doctors.length}+
                  </span>
                  <p className="text-emerald-100">Doctors</p>
                </div>
                <div>
                  <span className="text-2xl font-bold">
                    {hospitals.length}+
                  </span>
                  <p className="text-emerald-100">Hospitals</p>
                </div>
              </div>
            </div>

            {/* Desktop only */}
            <DesktopContactBar />
          </div>
        </div>
      </section>

      {/* ---------------- CONTENT ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-4 gap-10">
        {/* FILTERS */}
        <aside className="lg:sticky lg:top-28 space-y-6 bg-card rounded-xl shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 font-semibold">
            <Filter className="w-4 h-4" /> Filters
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="input-field"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="input-field"
          >
            <option value="">All Hospitals</option>
            {hospitals.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
          </select>

          <button
            onClick={() => {
              setSelectedSpecialty("")
              setSelectedHospital("")
              setSortBy("rating")
            }}
            className="w-full bg-muted hover:bg-muted/70 rounded-lg py-2 font-medium"
          >
            Reset Filters
          </button>
        </aside>

        {/* LIST */}
        <div className="lg:col-span-3">
          {loading ? (
            <p>Loading doctors...</p>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-muted-foreground">
              No doctors match your filters.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredDoctors.map((d) => (
                <Link key={d.id} href={`/doctors/${d.slug}`}>
                  <div className="bg-card rounded-xl shadow hover:shadow-lg transition overflow-hidden flex cursor-pointer">
                    <img
                      src={d.image_url || "/placeholder.svg"}
                      className="w-40 object-cover"
                      alt={d.name}
                    />

                    <div className="p-5 flex-1">
                      <h3 className="text-lg font-bold">{d.name}</h3>

                      <div className="flex flex-wrap gap-1 mt-2 mb-3">
                        {d.hospital_doctors
                          .flatMap((hd) => hd.specialties ?? [])
                          .slice(0, 3)
                          .map((s, i) => (
                            <span
                              key={i}
                              className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded"
                            >
                              {s}
                            </span>
                          ))}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {d.experience_years} yrs experience
                        </div>

                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {d.hospital_doctors
                            .map((hd) => hd.hospitals?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-4">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {d.rating ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
  
      {/* ---------------- TRUST STRIP ---------------- */}
      <section className="border-b bg-muted/40">
        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <p className="font-semibold">100% Verified Doctors</p>
            <p className="text-sm text-muted-foreground">
              Credentials checked & approved
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Headphones className="w-6 h-6 text-primary" />
            <p className="font-semibold">24/7 Care Assistance</p>
            <p className="text-sm text-muted-foreground">
              Dedicated medical coordinators
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-primary" />
            <p className="font-semibold">Book Consultations</p>
            <p className="text-sm text-muted-foreground">
              No hidden charges
            </p>
          </div>
        </div>
      </section>
  
      <HelpWidget/>

      <Footer />
    </div>
  )
}

