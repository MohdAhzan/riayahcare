// components/landingbanner-tiles-mobile.tsx
"use client"

import { Hospital, Stethoscope, Plane, UserCheck } from "lucide-react"

const features = [
  {
    icon: Hospital,
    title: "Premium Hospitals",
    description:
      "Access internationally accredited medical facilities with state-of-the-art technology",
  },
  {
    icon: Stethoscope,
    title: "Expert Doctors",
    description:
      "Connect with board-certified specialists with proven international experience",
  },
  {
    icon: Plane,
    title: "Travel Support",
    description:
      "Complete travel arrangements including visa, accommodation, and transportation",
  },
  {
    icon: UserCheck,
    title: "Personal Care",
    description:
      "24/7 dedicated care coordinators for seamless communication and support",
  },
]
interface BannerDisplayData {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string
  cta_link: string
}

/* ============================
   Constants
============================ */

const DEFAULT_BANNER: BannerDisplayData = {
  id: "default",
  title: "Welcome to Riayah Care",
  subtitle: "Compassionate Care & World Class Treatment",
  image_url:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
  cta_text: "Get Quote",
  cta_link: "/hospitals",
}


export default function LandingBannerTilesMobile() {

  return (
    <section 
       className="lg:hidden py-16 px-4 bg-white/70 backdrop-blur-sm"
  style={{
    backgroundImage: `linear-gradient(
      rgba(255,255,255,0.75),
      rgba(255,255,255,0.75)
    ), url(${DEFAULT_BANNER.image_url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}

    >

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="
                  bg-gradient-to-br from-slate-800 to-slate-900
                  border border-slate-700/50
                  rounded-2xl
                  p-6
                  shadow-lg
                "
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

