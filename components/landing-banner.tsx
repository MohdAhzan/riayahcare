//components/landing-banner.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Hospital, Stethoscope, Plane, UserCheck, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"

interface Banner {
  id: string
  image_url: string
  cta_link: string
  is_active: boolean
  order_index: number
  translations: {
    en?: { title: string; subtitle: string; cta_text: string }
    ar?: { title: string; subtitle: string; cta_text: string }
  } | null
}

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    title: "World-Class Medical Treatment",
    subtitle: "Compassionate Care & Expert Specialists",
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
    cta_text: "Get Quote",
    cta_link: "/hospitals",
  }
]

export default function EnhancedLandingBanner() {
  const [banners, setBanners] = useState<Array<{ id: string; title: string; subtitle: string; image_url: string; cta_text: string; cta_link: string }>>(DEFAULT_BANNERS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const t = useTranslations("landing")


  const features = [
    {
      icon: Hospital,
      title: t("features.hospital.title"),
      description: t("features.hospital.description"),
    },
    {
      icon: Stethoscope,
      title: t("features.stethoscope.title"),
      description: t("features.stethoscope.description"),
    },
    {
      icon: Plane,
      title: t("features.plane.title"),
      description: t("features.plane.description"),
    },
    {
      icon: UserCheck,
      title: t("features.user_check.title"),
      description: t("features.user_check.description"),
    },
  ]

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("banners")
          .select("id, image_url, cta_link, is_active, order_index, translations")
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const formattedBanners = data.map(banner => ({
            id: banner.id,
            title: banner.translations?.en?.title || DEFAULT_BANNERS[0].title,
            subtitle: banner.translations?.en?.subtitle || DEFAULT_BANNERS[0].subtitle,
            image_url: banner.image_url,
            cta_text: banner.translations?.en?.cta_text || DEFAULT_BANNERS[0].cta_text,
            cta_link: banner.cta_link || DEFAULT_BANNERS[0].cta_link,
          }))
          setBanners(formattedBanners)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsAutoPlaying(false)
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-green-100 to-emerald-50 animate-pulse" />
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <section className="relative h-full w-full overflow-hidden">
      {/* Banner Carousel */}
      <div className="relative h-full w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            style={{
              backgroundImage: `url(${banner.image_url})`,
              backgroundSize: "cover",

              backgroundPosition: "center",
            }}
          >
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(0, 0, 0, 0.64) 0%, rgba(196, 196, 196, 0.39) 41%, rgba(140, 139, 138, 0.28) 64%, rgba(5, 1, 1, 0.45) 95%)",
              }}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-start lg:justify-center pt-24 sm:pt-28 lg:pt-0">
        <div className="px-4 sm:px-8 lg:px-20 max-w-[95%] sm:max-w-lg lg:max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 lg:mb-4 leading-tight drop-shadow-lg text-white text-center lg:text-left">
            {currentBanner.title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 text-gray-100 drop-shadow-md text-center lg:text-left">
            {currentBanner.subtitle}
          </p>

          {/* Google Reviews Badge */}
          <div className="flex items-center gap-4 mb-6 lg:mb-8 justify-center lg:justify-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg lg:text-xl">G</span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 lg:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs lg:text-sm font-semibold text-gray-900">4.7 Rating</p>
                  <p className="text-xs text-gray-600">1,000+ Reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <Link href={currentBanner.cta_link}>
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold shadow-xl rounded-xl text-white transition-all transform hover:scale-105">
                {currentBanner.cta_text}
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Tiles - Desktop Only */}
        <div className="hidden lg:block absolute bottom-[12vh] xl:bottom-[14vh] 2xl:bottom-[18vh] left-80 right-0 px-4 lg:px-8 xl:px-16 2xl:px-20 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-end">
            <div className="grid grid-cols-4 gap-4 xl:gap-6 w-full max-w-6xl pointer-events-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl xl:rounded-2xl p-3 xl:p-4 2xl:p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center space-y-2 xl:space-y-3 2xl:space-y-4">
                      <div className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 rounded-lg xl:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Icon className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 text-white" />
                      </div>
                      <h3 className="text-sm xl:text-base 2xl:text-xl font-semibold text-white leading-tight">{feature.title}</h3>
                      <p className="text-gray-400 text-xs xl:text-xs 2xl:text-sm leading-relaxed hidden xl:block">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


//"use client"
//
//import { useEffect, useState } from "react"
//import Link from "next/link"
//import { Hospital, Stethoscope, Plane, UserCheck } from "lucide-react"
//import { createClient } from "@supabase/supabase-js"
//import { Button } from "@/components/ui/button"
//import { useTranslations } from "next-intl"
//
///* ============================
//   Types
//============================ */
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
//    [key: string]: any
//  } | null
//}
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
///* ============================
//   Constants
//============================ */
//
//const DEFAULT_BANNER: BannerDisplayData = {
//  id: "default",
//  title: "Welcome to Riayah Care",
//  subtitle: "Compassionate Care & World Class Treatment",
//  image_url:
//    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
//  cta_text: "Get Quote",
//  cta_link: "/hospitals",
//}
//
//
///* ============================
//   Component
//============================ */
//
//export default function LandingBanner() {
//  const [banner, setBanner] = useState<BannerDisplayData | null>(null)
//  const [loading, setLoading] = useState(true)
//  const t = useTranslations("landing")
//
//const features = [
//  {
//    icon: Hospital,
//    title: t("features.hospital.title"),
//    description: t("features.hospital.description"),
//  },
//  {
//    icon: Stethoscope,
//    title: t("features.stethoscope.title"),
//    description: t("features.stethoscope.description"),
//  },
//  {
//    icon: Plane,
//    title: t("features.plane.title"),
//    description: t("features.plane.description"),
//  },
//  {
//    icon: UserCheck,
//    title: t("features.user_check.title"),
//    description: t("features.user_check.description"),
//  },
//]
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
//          const t = data.translations?.en
//          setBanner({
//            id: data.id,
//            image_url: data.image_url,
//            cta_link: data.cta_link || DEFAULT_BANNER.cta_link,
//            title: t?.title || DEFAULT_BANNER.title,
//            subtitle: t?.subtitle || DEFAULT_BANNER.subtitle,
//            cta_text: t?.cta_text || DEFAULT_BANNER.cta_text,
//          })
//        } else {
//          setBanner(DEFAULT_BANNER)
//        }
//      } catch {
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
//  if (!banner) return null
//
//  return (
//    <section
//      className="relative h-screen w-full"
//
//      style={{
//        backgroundImage: `url(${banner.image_url})`,
//        backgroundSize: "cover",
//        backgroundPosition: "center",
//      }}
//    >
//      {/* CUSTOM GRADIENT OVERLAY */}
//      <div 
//        className="absolute inset-0 pointer-events-none" 
//        style={{
//          background: "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(0, 0, 0, 0.64) 0%, rgba(196, 196, 196, 0.39) 41%, rgba(140, 139, 138, 0.28) 64%, rgba(5, 1, 1, 0.45) 95%)"
//        }}
//      />
//
//      {/* ============================
//          HERO CONTENT
//      ============================ */}
//      <div
//  className="
//    relative z-10
//    pt-48 sm:pt-52 lg:pt-40  
//    px-4 sm:px-8 lg:px-20
//    max-w-xl
//    text-center lg:text-left
//    text-white
//  "
//>
//        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
//          {banner.title}
//        </h1>
//
//        {banner.subtitle && (
//          <p className="text-lg sm:text-xl mb-8 text-gray-100 drop-shadow-md">
//            {banner.subtitle}
//          </p>
//        )}
//
//        <Link href={banner.cta_link}>
//          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-6 text-lg font-semibold shadow-lg">
//            {banner.cta_text}
//          </Button>
//        </Link>
//      </div>
//
//      {/* ============================
//          FEATURE TILES
//      ============================ */}
//      <div
//        className="
//          hidden lg:block
//          relative z-10
//          mt-20
//          lg:absolute lg:bottom-20 lg:left-0 lg:right-0
//          px-4 sm:px-6 lg:px-20
//
//        "
//      >
//        <div className="max-w-7xl mx-auto">
//          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//            {features.map((feature, index) => {
//              const Icon = feature.icon
//              return (
//                <div
//                  key={index}
//                  className="
//                    bg-gradient-to-br from-slate-800/80 to-slate-900/80
//                    backdrop-blur-sm
//                    border border-slate-700/50
//                    rounded-2xl
//                    p-6
//                    hover:border-green-500/50
//                    transition-all duration-300
//                    hover:scale-105
//                    hover:shadow-xl hover:shadow-green-500/10
//                  "
//                >
//                  <div className="flex flex-col items-center text-center space-y-4">
//                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
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
//    </section>
//  )
//}
//
