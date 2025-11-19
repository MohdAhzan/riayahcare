
// components/navbar.tsx

"use client"

import { useRouter, usePathname, Link } from "@/i18n/navigation"; 
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Navbar() {
  const t = useTranslations("Navbar")
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const [menuOpen, setMenuOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(locale === "ar" ? "Arabic" : "English")

  const languages = [
    { name: "English", code: "en" },
    { name: "Arabic", code: "ar" },
  ]

  // ✅ Proper language switch handler
  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode === "ar" ? "Arabic" : "English")
    setLanguageOpen(false)
    // This uses the current pathname and replaces the locale parameter
    router.replace(pathname, { locale: langCode })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo - Use the localized Link with a simple relative path */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Riayah Care Logo"
            width={60}
            height={70}
            className="rounded-lg shadow-lg"
            priority
          />
          <span className="font-bold text-xl text-gray-900">Riayah Care</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {/* Use the localized Link with simple relative paths */}
          <Link href="/hospitals" className="text-gray-700 hover:text-green-600 transition font-medium">
            {t("hospitals")}
          </Link>
          <Link href="/doctors" className="text-gray-700 hover:text-green-600 transition font-medium">
            {t("doctors")}
          </Link>
          <Link href="/procedures" className="text-gray-700 hover:text-green-600 transition font-medium">
            {t("procedures")}
          </Link>
          <Link href="/admin" className="text-gray-700 hover:text-green-600 transition font-medium">
            {t("admin")}
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
            >
              🌐 {selectedLanguage}
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
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition ${
                      selectedLanguage === lang.name ? "bg-green-100" : ""
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button href="#private-inquiry-form" className="btn-gold-glass text-white">{t("get_premium_consultation")}</Button>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-3">
          {/* Use the localized Link with simple relative paths */}
          <Link href="/hospitals" className="block text-gray-700 hover:text-green-600 font-medium">
            {t("hospitals")}
          </Link>
          <Link href="/doctors" className="block text-gray-700 hover:text-green-600 font-medium">
            {t("doctors")}
          </Link>
          <Link href="/procedures" className="block text-gray-700 hover:text-green-600 font-medium">
            {t("procedures")}
          </Link>
          <Link href="/admin" className="block text-gray-700 hover:text-green-600 font-medium">
            {t("admin")}
          </Link>
                    {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
            >
              🌐 {selectedLanguage}
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
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition ${
                      selectedLanguage === lang.name ? "bg-green-100" : ""
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button href="#private-inquiry-form" className="btn-gold-glass w-full text-white">{t("get_premium_consultation")}</Button>
        </div>
      )}
    </nav>
  )
}



















//"use client"
//
//import { useRouter, usePathname } from "@/i18n/navigation"; 
//import { useLocale, useTranslations } from "next-intl";
//import Link from "next/link"
//import Image from "next/image"
//import { Button } from "@/components/ui/button"
//import { useState } from "react"
//
//export default function Navbar() {
//  const t = useTranslations("Navbar")
//  const router = useRouter()
//  const pathname = usePathname()
//  const locale = useLocale()
//
//  const [menuOpen, setMenuOpen] = useState(false)
//  const [languageOpen, setLanguageOpen] = useState(false)
//  const [selectedLanguage, setSelectedLanguage] = useState(locale === "ar" ? "Arabic" : "English")
//
//  const languages = [
//    { name: "English", code: "en" },
//    { name: "Arabic", code: "ar" },
//  ]
//
//  // ✅ Proper language switch handler
//  const changeLanguage = (langCode: string) => {
//    setSelectedLanguage(langCode === "ar" ? "Arabic" : "English")
//    setLanguageOpen(false)
//    router.replace(pathname, { locale: langCode })
//  }
//
//  return (
//    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//        {/* Logo */}
//        <Link href={`/${locale}`} className="flex items-center gap-2">
//          <Image
//            src="/logo2.png"
//            alt="Riayah Care Logo"
//            width={60}
//            height={70}
//            className="rounded-lg shadow-lg"
//            priority
//          />
//          <span className="font-bold text-xl text-gray-900">Riayah Care</span>
//        </Link>
//
//        {/* Desktop Menu */}
//        <div className="hidden md:flex gap-8 items-center">
//          <Link href={`/${locale}/hospitals`} className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("hospitals")}
//          </Link>
//          <Link href={`/${locale}/doctors`} className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("doctors")}
//          </Link>
//          <Link href={`/${locale}/procedures`} className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("procedures")}
//          </Link>
//          <Link href={`/${locale}/admin`} className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("admin")}
//          </Link>
//
//          {/* Language Selector */}
//          <div className="relative">
//            <button
//              onClick={() => setLanguageOpen(!languageOpen)}
//              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
//            >
//              🌐 {selectedLanguage}
//              <svg
//                className={`w-4 h-4 transition-transform ${languageOpen ? "rotate-180" : ""}`}
//                fill="none"
//                stroke="currentColor"
//                viewBox="0 0 24 24"
//              >
//                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//              </svg>
//            </button>
//
//            {languageOpen && (
//              <div className="absolute top-full right-0 mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-50 w-48">
//                {languages.map((lang) => (
//                  <button
//                    key={lang.code}
//                    onClick={() => changeLanguage(lang.code)}
//                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition ${
//                      selectedLanguage === lang.name ? "bg-green-100" : ""
//                    }`}
//                  >
//                    {lang.name}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//
//          <Button className="btn-glass text-white">{t("getQuote")}</Button>
//        </div>
//
//        {/* Mobile Menu Button */}
//        <button
//          className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
//          onClick={() => setMenuOpen(!menuOpen)}
//        >
//          {menuOpen ? (
//            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//            </svg>
//          ) : (
//            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//            </svg>
//          )}
//        </button>
//      </div>
//
//      {/* Mobile Dropdown */}
//      {menuOpen && (
//        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-3">
//          <Link href={`/${locale}/hospitals`} className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("hospitals")}
//          </Link>
//          <Link href={`/${locale}/doctors`} className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("doctors")}
//          </Link>
//          <Link href={`/${locale}/procedures`} className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("procedures")}
//          </Link>
//          <Link href={`/${locale}/admin`} className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("admin")}
//          </Link>
//                    {/* Language Selector */}
//          <div className="relative">
//            <button
//              onClick={() => setLanguageOpen(!languageOpen)}
//              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
//            >
//              🌐 {selectedLanguage}
//              <svg
//                className={`w-4 h-4 transition-transform ${languageOpen ? "rotate-180" : ""}`}
//                fill="none"
//                stroke="currentColor"
//                viewBox="0 0 24 24"
//              >
//                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//              </svg>
//            </button>
//
//            {languageOpen && (
//              <div className="absolute top-full right-0 mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-50 w-48">
//                {languages.map((lang) => (
//                  <button
//                    key={lang.code}
//                    onClick={() => changeLanguage(lang.code)}
//                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition ${
//                      selectedLanguage === lang.name ? "bg-green-100" : ""
//                    }`}
//                  >
//                    {lang.name}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//
//          <Button className="btn-glass w-full text-white">{t("getQuote")}</Button>
//        </div>
//      )}
//    </nav>
//  )
//}
//
//
//
