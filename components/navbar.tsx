"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English")

  const languages = ["English", "Hindi", "Bengali", "French", "Arabic", "Spanish", "Portuguese", "Russian"]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Riayah Care</span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link href="/hospitals" className="text-gray-700 hover:text-green-600 transition font-medium">
            Hospitals
          </Link>
          <Link href="/doctors" className="text-gray-700 hover:text-green-600 transition font-medium">
            Doctors
          </Link>
          <Link href="/procedures" className="text-gray-700 hover:text-green-600 transition font-medium">
            Procedures
          </Link>
          <Link href="/admin" className="text-gray-700 hover:text-green-600 transition font-medium">
            Admin
          </Link>

          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5l5.68 5.68M19 5l-5.68 5.68"
                />
              </svg>
              {selectedLanguage}
              <svg
                className={`w-4 h-4 transition-transform ${languageOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {languageOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-50 w-48">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang)
                      setLanguageOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition flex items-center justify-between ${
                      selectedLanguage === lang ? "bg-green-100" : ""
                    }`}
                  >
                    {lang}
                    {selectedLanguage === lang && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button className="btn-glass text-white">Get Quote</Button>
        </div>

        <button
          className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-3">
          <Link
            href="/hospitals"
            className="block text-gray-700 hover:text-green-600 py-2 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Hospitals
          </Link>
          <Link
            href="/doctors"
            className="block text-gray-700 hover:text-green-600 py-2 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Doctors
          </Link>
          <Link
            href="/procedures"
            className="block text-gray-700 hover:text-green-600 py-2 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Procedures
          </Link>
          <Link
            href="/admin"
            className="block text-gray-700 hover:text-green-600 py-2 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
          <Button className="btn-glass w-full text-white">Get Quote</Button>
        </div>
      )}
    </nav>
  )
}
