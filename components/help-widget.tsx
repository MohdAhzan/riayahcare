"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export default function HelpWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const t= useTranslations("help_widget")

  useEffect(() => {
    const handleScroll = () => {
      // Show help widget after scrolling down 300px from landing page
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-2xl p-6 w-80 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">{t("title")}</h3>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t("tag")}
          </p>

          <div className="space-y-3">
            <a
              href="https://wa.me/918589068653?text=Hi%20Riayah%20Care%2C%20I%20need%20assistance%20with%20medical%20treatment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Chat on WhatsApp
            </a>
            <a
              href="tel:+918589068653"
              className="flex items-center gap-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502.609l2.01 1.042a1 1 0 001.092-.02l1.494-1.149a1 1 0 00.502-.609l1.498-4.493a1 1 0 00.948-.684H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                />
              </svg>
              Call Us
            </a>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">{t("24/7")}</p>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full p-4 shadow-2xl transition transform hover:scale-110 animate-pulse"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
