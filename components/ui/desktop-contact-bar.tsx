"use client"

import { CalendarCheck, ShieldCheck, Star } from "lucide-react"
import Link from "next/link"

export default function DesktopContactBar() {
  return (
    <div className="hidden lg:flex items-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg px-6 py-5 w-[420px] border border-white/30">
        {/* Trust Row */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-700">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Verified doctors • Trusted hospitals</span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          Book a Premium Medical Consultation
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          Personalised guidance, hospital coordination, and doctor access
          handled end-to-end by Riayah Care.
        </p>

        {/* CTA */}
        <Link
          href="/#private-inquiry-form"
          className="btn-gold-glass w-full mt-4 flex items-center justify-center gap-2 text-sm"
        >
          <CalendarCheck className="w-4 h-4" />
          Book Premium Consultation
        </Link>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          Trusted by international patients
        </div>
      </div>
    </div>
  )
}

