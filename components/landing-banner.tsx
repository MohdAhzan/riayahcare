"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string
  cta_link: string
}

export default function LandingBanner() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { data, error } = await supabase
          .from("banners")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true })
          .limit(1)
          .single()
     
        if (data) {
          setBanner(data)
        } else {
          setBanner({
            id: "default",
            title: "Welcome to Riayah Care",
            subtitle: "Compassionate Care & World Class Treatment",
            image_url:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
            cta_text: "Get Quote",
            cta_link: "/hospitals",
          })
        }
      } catch (error) {
        console.log("Error fetching banner, using default:", error)
        setBanner({
          id: "default",
          title: "Welcome to Riayah Care",
          subtitle: "Compassionate Care & World Class Treatment",
          image_url:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg",
          cta_text: "Get Quote",
          cta_link: "/hospitals",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [])

  if (loading) {
    return <div className="h-screen bg-gradient-to-br from-green-100 to-emerald-50 animate-pulse" />
  }

  if (!banner) {
    return null
  }

  return (
    <div
      className="h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${banner.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#f0fdf4",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance drop-shadow-lg">{banner.title}</h1>
        {banner.subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-gray-50 drop-shadow-md text-balance">{banner.subtitle}</p>
        )}
        <Link href={banner.cta_link}>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            {banner.cta_text}
          </Button>
        </Link>
      </div>
    </div>
  )
}
