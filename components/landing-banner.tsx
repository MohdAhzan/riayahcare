//components/landing-banner.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Hospital, Stethoscope, Plane, UserCheck } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"

/* ============================
   Types
============================ */

interface Banner {
  id: string
  image_url: string
  cta_link: string
  is_active: boolean
  order_index: number
  translations: {
    en?: {
      title: string
      subtitle: string
      cta_text: string
    }
    [key: string]: any
  } | null
}

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

/* ============================
   Component
============================ */

export default function LandingBanner() {
  const [banner, setBanner] = useState<BannerDisplayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("banners")
          .select(`id, image_url, cta_link, is_active, order_index, translations`)
          .eq("is_active", true)
          .order("order_index", { ascending: true })
          .limit(1)
          .single()

        if (error) throw error

        if (data) {
          const t = data.translations?.en
          setBanner({
            id: data.id,
            image_url: data.image_url,
            cta_link: data.cta_link || DEFAULT_BANNER.cta_link,
            title: t?.title || DEFAULT_BANNER.title,
            subtitle: t?.subtitle || DEFAULT_BANNER.subtitle,
            cta_text: t?.cta_text || DEFAULT_BANNER.cta_text,
          })
        } else {
          setBanner(DEFAULT_BANNER)
        }
      } catch {
        setBanner(DEFAULT_BANNER)
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [])

  if (loading) {
    return <div className="h-screen bg-gradient-to-br from-green-100 to-emerald-50 animate-pulse" />
  }

  if (!banner) return null

  return (
    <section
      className="relative h-screen w-full"

      style={{
        backgroundImage: `url(${banner.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* CUSTOM GRADIENT OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(0, 0, 0, 0.64) 0%, rgba(196, 196, 196, 0.39) 41%, rgba(140, 139, 138, 0.28) 64%, rgba(5, 1, 1, 0.45) 95%)"
        }}
      />

      {/* ============================
          HERO CONTENT
      ============================ */}
      <div
  className="
    relative z-10
    pt-48 sm:pt-52 lg:pt-40  
    px-4 sm:px-8 lg:px-20
    max-w-xl
    text-center lg:text-left
    text-white
  "
>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
          {banner.title}
        </h1>

        {banner.subtitle && (
          <p className="text-lg sm:text-xl mb-8 text-gray-100 drop-shadow-md">
            {banner.subtitle}
          </p>
        )}

        <Link href={banner.cta_link}>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-6 text-lg font-semibold shadow-lg">
            {banner.cta_text}
          </Button>
        </Link>
      </div>

      {/* ============================
          FEATURE TILES
      ============================ */}
      <div
        className="
          hidden lg:block
          relative z-10
          mt-20
          lg:absolute lg:bottom-20 lg:left-0 lg:right-0
          px-4 sm:px-6 lg:px-20

        "
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="
                    bg-gradient-to-br from-slate-800/80 to-slate-900/80
                    backdrop-blur-sm
                    border border-slate-700/50
                    rounded-2xl
                    p-6
                    hover:border-green-500/50
                    transition-all duration-300
                    hover:scale-105
                    hover:shadow-xl hover:shadow-green-500/10
                  "
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
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
      </div>
    </section>
  )
}



//
//"use client"
//
//import { useEffect, useState } from "react"
//import Link from "next/link"
//import { Hospital, Stethoscope, Plane, UserCheck } from "lucide-react"
//import { createClient } from "@supabase/supabase-js"
//import { Button } from "@/components/ui/button"
//
//interface Banner {
//  id: string
//  image_url: string
//  cta_link: string
//  is_active: boolean
//  order_index: number
//  translations: {
//    en?: {
//      title: string
//      subtitle: string
//      cta_text: string
//    }
//    // Add other languages (ar, etc.) as needed
//    [key: string]: any
//  } | null
//}
//
//const features = [
//  {
//    icon: Hospital,
//    title: "Premium Hospitals",
//    description: "Access internationally accredited medical facilities with state-of-the-art technology"
//  },
//  {
//    icon: Stethoscope,
//    title: "Expert Doctors",
//    description: "Connect with board-certified specialists with proven international experience"
//  },
//  {
//    icon: Plane,
//    title: "Travel Support",
//    description: "Complete travel arrangements including visa, accommodation, and transportation"
//  },
//  {
//    icon: UserCheck,
//    title: "Personal Care",
//    description: "24/7 dedicated care coordinators for seamless communication and support"
//  }
//]
//
//// Define a structured type for the data we actually use in the UI
//interface BannerDisplayData {
//    id: string
//    title: string
//    subtitle: string | null
//    image_url: string
//    cta_text: string
//    cta_link: string
//}
//
//const DEFAULT_BANNER: BannerDisplayData = {
//    id: "default",
//    title: "Welcome to Riayah Care",
//    subtitle: "Compassionate Care & World Class Treatment",
//    image_url:
//      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
//    cta_text: "Get Quote",
//    cta_link: "/hospitals",
//}
//
//
//export default function LandingBanner() {
//  const [banner, setBanner] = useState<BannerDisplayData | null>(null)
//  const [loading, setLoading] = useState(true)
//
//  useEffect(() => {
//    const fetchBanner = async () => {
//      try {
//        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
//
//        // ⭐ FIX 1: Select translations column
//        const { data, error } = await supabase
//          .from("banners")
//          // Select only necessary columns based on your schema
//          .select(`id, image_url, cta_link, is_active, order_index, translations`) 
//          .eq("is_active", true)
//          .order("order_index", { ascending: true })
//          .limit(1)
//          .single()
//
//        // ⭐ CRITICAL FIX: Handle Supabase error object explicitly
//        if (error) {
//            console.error("[v0] Supabase Query Error, using default:", error)
//            throw new Error(error.message || `Supabase query failed: ${error.code}`)
//        }
//
//        // ⭐ FIX 2: Process fetched data
//        if (data) {
//            const translationData = data.translations?.en;
//
//            // Map the fetched data to the display structure
//            const displayBanner: BannerDisplayData = {
//                id: data.id,
//                image_url: data.image_url,
//                cta_link: data.cta_link || DEFAULT_BANNER.cta_link,
//
//                // Extract text fields from the 'en' translation object
//                title: translationData?.title || DEFAULT_BANNER.title,
//                subtitle: translationData?.subtitle || DEFAULT_BANNER.subtitle,
//                cta_text: translationData?.cta_text || DEFAULT_BANNER.cta_text,
//            };
//
//            setBanner(displayBanner)
//        } else {
//            // No active banner found, use default
//            setBanner(DEFAULT_BANNER)
//        }
//      } catch (error) {
//        console.error("[v0] Error fetching banner, using default:", error instanceof Error ? error.message : error)
//        // Fallback to the default banner on any error
//        setBanner(DEFAULT_BANNER)
//      } finally {
//        setLoading(false)
//      }
//    }
//
//    fetchBanner()
//  }, [])
//
//  if (loading) {
//    return <div className="h-screen bg-gradient-to-br from-green-100 to-emerald-50 animate-pulse" />
//  }
//
//  if (!banner) {
//    return null
//  }
//
//  return (
//    <div
//      className="h-screen w-full relative flex items-center justify-center overflow-hidden"
//      style={{
//        backgroundImage: `url(${banner.image_url})`,
//        backgroundSize: "cover",
//        backgroundPosition: "center",
//        backgroundAttachment: "fixed",
//        backgroundColor: "#f0fdf4",
//      }}
//    >
//      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
//
//      {/* Content (Use bannerDisplayData properties directly) */}
//      <div className="relative z-10 text-center text-white px-4 max-w-2xl">
//        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance drop-shadow-lg">{banner.title}</h1>
//        {banner.subtitle && (
//          <p className="text-xl md:text-2xl mb-8 text-gray-50 drop-shadow-md text-balance">{banner.subtitle}</p>
//        )}
//        <Link href={banner.cta_link}>
//          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
//            {banner.cta_text}
//          </Button>
//        </Link>
//      </div>
//            {/* Feature Tiles */}
//      <div className="relative z-10 pb-12 px-4 sm:px-6 lg:px-8">
//        <div className="max-w-7xl mx-auto">
//          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//            {features.map((feature, index) => {
//              const Icon = feature.icon
//              return (
//                <div
//                  key={index}
//                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 group"
//                >
//                  <div className="flex flex-col items-center text-center space-y-4">
//                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
//                      <Icon className="w-8 h-8 text-white" />
//                    </div>
//                    <h3 className="text-xl font-semibold text-white">
//                      {feature.title}
//                    </h3>
//                    <p className="text-gray-400 text-sm leading-relaxed">
//                      {feature.description}
//                    </p>
//                  </div>
//                </div>
//              )
//            })}
//          </div>
//        </div>
//      </div>
//
//    </div>
//  )
//}
//

//// components/landing-banner-v2.tsx
//
//import { useEffect, useState } from "react"
//import { createClient } from "@supabase/supabase-js"
//import Link from "next/link"
//import { Hospital, Stethoscope, Plane, UserCheck } from "lucide-react"
//
//interface BannerDisplayData {
//  id: string
//  title: string
//  subtitle: string | null
//  image_url: string
//  cta_text: string
//  cta_link: string
//}
//
//const DEFAULT_BANNER: BannerDisplayData = {
//  id: "default",
//  title: "Elevate Your Healthcare Journey. World-Class Medical Tourism.",
//  subtitle: "Compassionate Care & Expert Treatment Abroad",
//  image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
//  cta_text: "Get Started",
//  cta_link: "/hospitals",
//}
//
//const features = [
//  {
//    icon: Hospital,
//    title: "Premium Hospitals",
//    description: "Access internationally accredited medical facilities with state-of-the-art technology"
//  },
//  {
//    icon: Stethoscope,
//    title: "Expert Doctors",
//    description: "Connect with board-certified specialists with proven international experience"
//  },
//  {
//    icon: Plane,
//    title: "Travel Support",
//    description: "Complete travel arrangements including visa, accommodation, and transportation"
//  },
//  {
//    icon: UserCheck,
//    title: "Personal Care",
//    description: "24/7 dedicated care coordinators for seamless communication and support"
//  }
//]
//
//export default function LandingBannerV2() {
//  const [banner, setBanner] = useState<BannerDisplayData | null>(null)
//  const [loading, setLoading] = useState(true)
//
//  useEffect(() => {
//    const fetchBanner = async () => {
//      try {
//        const supabase = createClient(
//          process.env.NEXT_PUBLIC_SUPABASE_URL!,
//          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//        )
//
//        const { data, error } = await supabase
//          .from("banners")
//          .select(`id, image_url, cta_link, is_active, order_index, translations`)
//          .eq("is_active", true)
//          .order("order_index", { ascending: true })
//          .limit(1)
//          .single()
//
//        if (error) throw error
//
//        if (data) {
//          const translationData = data.translations?.en
//          setBanner({
//            id: data.id,
//            image_url: data.image_url,
//            cta_link: data.cta_link || DEFAULT_BANNER.cta_link,
//            title: translationData?.title || DEFAULT_BANNER.title,
//            subtitle: translationData?.subtitle || DEFAULT_BANNER.subtitle,
//            cta_text: translationData?.cta_text || DEFAULT_BANNER.cta_text,
//          })
//        } else {
//          setBanner(DEFAULT_BANNER)
//        }
//      } catch (error) {
//        console.error("Error fetching banner:", error)
//        setBanner(DEFAULT_BANNER)
//      } finally {
//        setLoading(false)
//      }
//    }
//
//    fetchBanner()
//  }, [])
//
//  if (loading) {
//    return <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-800 animate-pulse" />
//  }
//
//  if (!banner) return null
//
//  return (
//    <div className="h-screen w-full relative flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//      {/* Background with overlay */}
//      <div 
//        className="absolute inset-0 opacity-20"
//        style={{
//          backgroundImage: `url(${banner.image_url})`,
//          backgroundSize: "cover",
//          backgroundPosition: "center",
//        }}
//      />
//      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-900/80 to-slate-900/90" />
//
//      {/* Hero Content */}
//      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
//        <div className="max-w-4xl mx-auto text-center">
//          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
//            {banner.title}
//          </h1>
//          {banner.subtitle && (
//            <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 font-light">
//              {banner.subtitle}
//            </p>
//          )}
//          <Link href={banner.cta_link}>
//            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl">
//              {banner.cta_text}
//            </button>
//          </Link>
//        </div>
//      </div>
//
//      {/* Feature Tiles */}
//      <div className="relative z-10 pb-12 px-4 sm:px-6 lg:px-8">
//        <div className="max-w-7xl mx-auto">
//          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//            {features.map((feature, index) => {
//              const Icon = feature.icon
//              return (
//                <div
//                  key={index}
//                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 group"
//                >
//                  <div className="flex flex-col items-center text-center space-y-4">
//                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
//                      <Icon className="w-8 h-8 text-white" />
//                    </div>
//                    <h3 className="text-xl font-semibold text-white">
//                      {feature.title}
//                    </h3>
//                    <p className="text-gray-400 text-sm leading-relaxed">
//                      {feature.description}
//                    </p>
//                  </div>
//                </div>
//              )
//            })}
//          </div>
//        </div>
//      </div>
//    </div>
//  )
//}
