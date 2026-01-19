
// components/navbar-v2.tsx
"use client"

import { useRouter, usePathname, Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X, Globe } from "lucide-react"

export default function NavbarV2() {
  const t = useTranslations("Navbar")
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const [menuOpen, setMenuOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(locale === "ar" ? "العربية" : "English")

  const languages = [
    { name: "English", code: "en" },
    { name: "العربية", code: "ar" },
  ]

  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode === "ar" ? "العربية" : "English")
    setLanguageOpen(false)
    router.replace(pathname, { locale: langCode })
  }

  return (
    <nav className="sticky top-0 z-50  backdrop-blur-sm border-b border-slate-700/50"
      style={{

        background: "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(210, 247, 210, 0.68) 0%, rgba(224, 255, 224, 0.15) 21%, rgba(224, 255, 224, 0.1) 78%, rgba(210, 247, 210, 0.45) 100%)"

      }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo2.png"
              alt="Riayah Care Logo"
              width={70}
              height={70}
              className="rounded-lg"
              priority
            />
            <span className="font-bold text-xl text-gray-900  group-hover:text-emerald-500 transition">
              Riayah Care
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4"> {/* Adjusted gap slightly for pill padding */}
            {[
              { name: t("hospitals"), href: "/hospitals" },
              { name: t("doctors"), href: "/doctors" },
              { name: t("procedures"), href: "/procedures" },
              { name: t("blogs"), href: "/blogs" },
              { name: t("testimonials"), href: "/testimonials" },
              { name: t("aboutus"), href: "/aboutus" },
              
            ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="
                  px-4 py-2 
                  rounded-full 
                  border border-transparent 
                  text-gray-900 font-bold 
                  transition-all duration-300 
                  hover:bg-white/80 
                  hover:border-emerald-500/30 
                  hover:shadow-md 
                  hover:-translate-y-1
                  flex items-center justify-center
                  "
                >
                  {link.name}
                </Link>
              ))}
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
              >
                <Globe className="w-4 h-4" />
                {selectedLanguage}
              </button>

              {languageOpen && (
                <div className="absolute top-full right-0 mt-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 hover:border-green-400 transition font-medium text-gray-700" >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-3 transition ${
selectedLanguage === lang.name 
? "bg-green-600 text-white" 
: "text-black-300 hover:bg-green-100"
}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={() => document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2"
            >
              {t("get_premium_consultation")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-black-300 hover:text-white transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700 py-4 space-y-3">
            <Link 
              href="/hospitals" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("hospitals")}
            </Link>
            <Link 
              href="/doctors" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("doctors")}
            </Link>
            <Link 
              href="/procedures" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("procedures")}
            </Link>
            <Link 
              href="/blogs" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("blogs")}
            </Link>
            <Link 
              href="/testimonials" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("testimonials")}
              
            </Link>
            <Link 
              href="/aboutus" 
              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("aboutus")}
            </Link>

            <div className="px-4">
              <div className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="w-full flex items-center rounded-full justify-between px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 hover:border-green-400 transition font-medium text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {selectedLanguage}
                  </span>
                </button>
                {languageOpen && (
                  <div className="mt-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200  hover:border-green-400 transition font-medium text-gray-700 rounded-lg overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code)
                          setMenuOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 transition ${
selectedLanguage === lang.name 
? "bg-green-600 text-white" 
: "text-black-300 hover:bg-green-100"
}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pt-2">
              <Button 
                onClick={() => {
                  document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })
                  setMenuOpen(false)
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {t("get_premium_consultation")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


//// components/navbar.tsx
//
//"use client"
//
//import { useRouter, usePathname, Link } from "@/i18n/navigation"; 
//import { useLocale, useTranslations } from "next-intl";
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
//    // This uses the current pathname and replaces the locale parameter
//    router.replace(pathname, { locale: langCode })
//  }
//
//  return (
//    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//        {/* Logo - Use the localized Link with a simple relative path */}
//        <Link href="/" className="flex items-center gap-2">
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
//          {/* Use the localized Link with simple relative paths */}
//          <Link href="/hospitals" className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("hospitals")}
//          </Link>
//          <Link href="/doctors" className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("doctors")}
//          </Link>
//          <Link href="/procedures" className="text-gray-700 hover:text-green-600 transition font-medium">
//            {t("procedures")}
//          </Link>
//          <Link href="/aboutus" className="text-gray-700 hover:text-green-600 transition font-medium">
//            AboutUs
//          </Link>
//          <Link href="/blogs" className="text-gray-700 hover:text-green-600 transition font-medium">
//            blogs
//          </Link>
//          <Link href="/testimonials" className="text-gray-700 hover:text-green-600 transition font-medium">
//            testimonials
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
//          <Button href="#private-inquiry-form" className="btn-gold-glass text-white">{t("get_premium_consultation")}</Button>
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
//          {/* Use the localized Link with simple relative paths */}
//          <Link href="/hospitals" className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("hospitals")}
//          </Link>
//          <Link href="/doctors" className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("doctors")}
//          </Link>
//          <Link href="/procedures" className="block text-gray-700 hover:text-green-600 font-medium">
//            {t("procedures")}
//          </Link>
//          <Link href="/admin" className="block text-gray-700 hover:text-green-600 font-medium">
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
//          <Button href="#private-inquiry-form" className="btn-gold-glass w-full text-white">{t("get_premium_consultation")}</Button>
//        </div>
//      )}
//    </nav>
//  )
//}
//
//
//
//
//
//
