////components/landing-banner.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Hospital, Stethoscope, Plane, UserCheck, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useLocale, useTranslations } from "next-intl"

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
  const locale = useLocale()
  const t = useTranslations("landing")

  const [banners, setBanners] = useState<Array<{ id: string; title: string; subtitle: string; image_url: string; cta_text: string; cta_link: string }>>(DEFAULT_BANNERS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const isRtl = locale === 'ar'

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
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const formattedBanners = data.map(banner => {
            const content = banner.translations?.[locale] || 
                            banner.translations?.en || 
                            DEFAULT_BANNERS[0];

            return {
              id: banner.id,
              title: content.title,
              subtitle: content.subtitle,
              image_url: banner.image_url,
              cta_text: content.cta_text,
              cta_link: banner.cta_link || DEFAULT_BANNERS[0].cta_link,
            }
          })
          setBanners(formattedBanners)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [locale])

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
    <section className="relative h-screen w-full overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Banner Carousel */}
      <div className="relative h-full w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${banner.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isRtl 
                  ? "linear-gradient(-90deg, rgba(250, 253, 255, 1) 0%, rgba(0, 0, 0, 0.64) 0%, rgba(196, 196, 196, 0.39) 41%, rgba(140, 139, 138, 0.28) 64%, rgba(5, 1, 1, 0.45) 95%)"
                  : "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(0, 0, 0, 0.64) 0%, rgba(196, 196, 196, 0.39) 41%, rgba(140, 139, 138, 0.28) 64%, rgba(5, 1, 1, 0.45) 95%)",
              }}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <div className="hidden sm:block">
            <button
              onClick={prevSlide}
              className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition`}
              aria-label="Previous banner"
            >
              {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button
              onClick={nextSlide}
              className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition`}
              aria-label="Next banner"
            >
              {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </div>
        )}

        {/* Dot Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-start pt-[15vh] md:pt-[12vh]">
        <div className={`mx-auto w-full max-w-7xl px-6 sm:px-12 lg:px-20 ${isRtl ? 'text-center lg:text-right' : 'text-center lg:text-left'}`}>
          <div className={`max-w-[95%] sm:max-w-lg lg:max-w-xl xl:max-w-2xl ${isRtl ? 'lg:mr-0 lg:ml-auto' : 'lg:ml-0 lg:mr-auto'}`}>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg text-white">
              {currentBanner.title}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl mb-8 text-gray-100 drop-shadow-md">
              {currentBanner.subtitle}
            </p>

            {/* Google Reviews Badge */}
            <div className={`flex items-center gap-4 mb-8 justify-center ${isRtl ? 'lg:justify-start' : 'lg:justify-start'}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl" dir="ltr">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs lg:text-sm font-semibold text-gray-900">4.7 Rating</p>
                    <p className="text-xs text-gray-600">1,000+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link href={currentBanner.cta_link}>
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-4 text-lg font-semibold shadow-xl rounded-xl text-white transition-all transform hover:scale-105">
                  {currentBanner.cta_text}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Tiles - Desktop/Tablet Landscape Only */}
        <div className="hidden lg:block absolute bottom-[18vh] w-full px-6 sm:px-12 lg:px-20 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-4 gap-4 xl:gap-6 w-full max-w-5xl pointer-events-auto ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 xl:p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
                      </div>
                      <h3 className="text-sm xl:text-base font-semibold text-white leading-tight">{feature.title}</h3>
                      <p className="text-gray-400 text-xs hidden xl:block leading-relaxed">{feature.description}</p>
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

