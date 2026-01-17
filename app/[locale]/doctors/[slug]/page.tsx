

"use client"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import DesktopContactBar from "@/components/ui/desktop-contact-bar"
import Footer from "@/components/footer"
import HelpWidget from "@/components/help-widget"
import {
  Star,
  Briefcase,
  Building2,
  GraduationCap,
  Languages,
  Activity,
  Stethoscope,
} from "lucide-react"
import FAQs from "@/components/faqs"

const supabase = createClient()

/* ================= TYPES ================= */

type ExperienceItem = {
  role: string
  hospital: string
  years: string
}

type HospitalDoctor = {
  specialties: string[] | null
  hospitals: { name: string }[] | null
}

type Doctor = {
  id: string
  name: string
  slug: string
  experience_years: number
  bio: string | null
  education: string | null
  languages: string[] | null
  expertise: string[] | null
  conditions_treated: string[] | null
  procedures: string[] | null
  experience_details: ExperienceItem[] | null
  rating: number | null
  image_url: string | null
  hospital_doctors: HospitalDoctor[]
}

/* ================= PAGE ================= */

export default function DoctorDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!slug) return

    supabase
      .from("doctors")
      .select(
        `
        *,
        hospital_doctors (
          specialties,
          hospitals ( name )
        )
      `
      )
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setDoctor(data as Doctor | null)
        setLoading(false)
      })
  }, [slug])

  /* ================= DERIVED ================= */

  const hospitals = useMemo(() => {
    if (!doctor) return []
    return Array.from(
      new Set(
        doctor.hospital_doctors
          .flatMap((hd) => hd.hospitals ?? [])
          .map((h) => h.name)
      )
    )
  }, [doctor])

  if (loading) return <div className="p-10">Loading…</div>
  if (!doctor) return <div className="p-10">Doctor not found</div>

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 flex gap-6">
            <img
              src={doctor.image_url || "/placeholder.svg"}
              alt={doctor.name}
              className="w-40 h-40 rounded-xl object-cover bg-white border"
            />

            <div>
              <h1 className="text-3xl font-bold">{doctor.name}</h1>

              {/* Expertise */}
              <div className="flex flex-wrap gap-2 my-3">
                {doctor.expertise?.map((e) => (
                  <span
                    key={e}
                    className="bg-white/20 px-3 py-1 rounded-full text-xs"
                  >
                    {e}
                  </span>
                ))}
              </div>

              <div className="space-y-2 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {doctor.experience_years}+ years experience
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {hospitals.join(", ")}
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {doctor.rating ?? "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
  
       <DesktopContactBar />

        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-12">

          {/* ABOUT */}
          <section className="bg-card rounded-xl border p-6">
            <h2 className="section-title">About Doctor</h2>
            <p className="text-muted-foreground">{doctor.bio}</p>
          </section>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Experience" value={`${doctor.experience_years}+ yrs`} />
            <Stat label="Expertise" value={doctor.expertise?.length ?? 0} />
            <Stat label="Procedures" value={doctor.procedures?.length ?? 0} />
            <Stat label="Languages" value={doctor.languages?.length ?? 0} />
          </div>

          {/* EXPERIENCE */}
          {doctor.experience_details?.length ? (
            <section className="bg-card rounded-xl border p-6">
              <h2 className="section-title">Experience</h2>
              <div className="space-y-6">
                {doctor.experience_details.map((e, i) => (
                  <div
                    key={i}
                    className="border-l-4 border-emerald-600 pl-4"
                  >
                    <p className="font-semibold">{e.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {e.hospital} • {e.years}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* CONDITIONS */}
          {doctor.conditions_treated?.length ? (
            <section className="bg-card rounded-xl border p-6">
              <h2 className="section-title flex gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Conditions Treated
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {doctor.conditions_treated.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* PROCEDURES */}
          {doctor.procedures?.length ? (
            <section className="bg-card rounded-xl border p-6">
              <h2 className="section-title flex gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Procedures
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {doctor.procedures.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* EDUCATION */}
          {doctor.education ? (
            <section className="bg-card rounded-xl border p-6">
              <h2 className="section-title flex gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education
              </h2>
              <ul className="list-disc ml-5">
                {doctor.education
                  .replace(/[\[\]"]/g, "")
                  .split(",")
                  .map((e) => e.trim())
                  .filter(Boolean)
                  .map((e) => (
                    <li key={e}>{e}</li>
                  ))}
              </ul>
            </section>
          ) : null}

          {/* LANGUAGES */}
          {doctor.languages?.length ? (
            <section className="bg-card rounded-xl border p-6">
              <h2 className="section-title flex gap-2">
                <Languages className="w-5 h-5 text-primary" />
                Languages Spoken
              </h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((l) => (
                  <span
                    key={l}
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* WHY CHOOSE */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
            <h3 className="font-semibold mb-3">
              Why Choose Dr. {doctor.name}?
            </h3>
            <ul className="space-y-2 text-sm">
              <li>✔ {doctor.experience_years}+ years of excellence</li>
              <li>✔ Trusted by international patients</li>
              <li>✔ Works with top hospitals</li>
              <li>✔ Dedicated patient-first approach</li>
            </ul>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="bg-card rounded-xl shadow p-6">
            <h3 className="font-semibold mb-3">Why Riayah Care?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✔ Doctor & hospital coordination</li>
              <li>✔ International patient support</li>
              <li>✔ Transparent premium care</li>
              <li>✔ Dedicated medical advisors</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-xl p-6">
            <h3 className="font-semibold mb-2">Need Help Choosing?</h3>
            <p className="text-sm mb-4">
              Talk to our medical advisor for free guidance.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("open-advisor"))
              }
              className="bg-white text-emerald-700 w-full py-2 rounded font-semibold"
            >
              Need Help?
            </button>
          </div>
        </aside>
      </section>
  
            <FAQs section="doctor_detail" entityId={doctor.id} />
      <HelpWidget/>
      <Footer />
    </div>
  )
}

/* ================= HELPERS ================= */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

