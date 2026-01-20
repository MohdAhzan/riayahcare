
// components/navbar-v2.tsx

//"use client"
//
//import { useState, useEffect } from "react"
//import { useLocale } from "next-intl"
//import Link from "next/link"
//import { Search, Menu, X, Globe, ChevronDown } from "lucide-react"
//import { createClient } from "@supabase/supabase-js"
//
//interface SearchResult {
//  id: string
//  type: "procedure" | "hospital" | "doctor" | "specialty"
//  name: string
//  description?: string
//  location?: string
//  specialty?: string
//}
//
//export default function EnhancedNavbar() {
//  const locale = useLocale()
//  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//  const [searchOpen, setSearchOpen] = useState(false)
//  const [searchQuery, setSearchQuery] = useState("")
//  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
//  const [isSearching, setIsSearching] = useState(false)
//  const [scrolled, setScrolled] = useState(false)
//
//  const supabase = createClient(
//    process.env.NEXT_PUBLIC_SUPABASE_URL!,
//    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//  )
//
//  useEffect(() => {
//    const handleScroll = () => {
//      setScrolled(window.scrollY > 20)
//    }
//    window.addEventListener("scroll", handleScroll)
//    return () => window.removeEventListener("scroll", handleScroll)
//  }, [])
//
//  useEffect(() => {
//    if (searchQuery.length < 2) {
//      setSearchResults([])
//      return
//    }
//
//    const searchTimeout = setTimeout(async () => {
//      setIsSearching(true)
//      try {
//        const results: SearchResult[] = []
//
//        // Search procedures
//        const { data: procedures } = await supabase
//          .from("procedures")
//          .select("id, name, specialty, description")
//          .ilike("name", `%${searchQuery}%`)
//          .limit(5)
//
//        procedures?.forEach((proc) => {
//          results.push({
//            id: proc.id,
//            type: "procedure",
//            name: proc.name,
//            specialty: proc.specialty,
//            description: proc.description,
//          })
//        })
//
//        // Search hospitals
//        const { data: hospitals } = await supabase
//          .from("hospitals")
//          .select("id, name, city, country, translations")
//          .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
//          .limit(5)
//
//        hospitals?.forEach((hosp) => {
//          results.push({
//            id: hosp.id,
//            type: "hospital",
//            name: hosp.translations?.en?.name || hosp.name,
//            location: `${hosp.city}, ${hosp.country}`,
//          })
//        })
//
//        // Search doctors
//        const { data: doctors } = await supabase
//          .from("doctors")
//          .select("id, name, slug, translations")
//          .ilike("name", `%${searchQuery}%`)
//          .limit(5)
//
//        doctors?.forEach((doc) => {
//          results.push({
//            id: doc.id,
//            type: "doctor",
//            name: doc.name,
//            specialty: doc.translations?.en?.specialty,
//          })
//        })
//
//        setSearchResults(results)
//      } catch (error) {
//        console.error("Search error:", error)
//      } finally {
//        setIsSearching(false)
//      }
//    }, 300)
//
//    return () => clearTimeout(searchTimeout)
//  }, [searchQuery])
//
//  const getResultLink = (result: SearchResult) => {
//    switch (result.type) {
//      case "hospital":
//        return `/${locale}/hospitals/${result.id}`
//      case "doctor":
//        return `/${locale}/doctors/${result.id}`
//      case "procedure":
//        return `/${locale}/procedures`
//      default:
//        return "#"
//    }
//  }
//
//  const navLinks = [
//    { href: `/${locale}`, label: "Home" },
//    { href: `/${locale}/hospitals`, label: "Hospitals" },
//    { href: `/${locale}/doctors`, label: "Doctors" },
//    { href: `/${locale}/procedures`, label: "Procedures" },
//    { href: `/${locale}/aboutus`, label: "About Us" },
//    { href: `/${locale}/blogs`, label: "Blog" },
//  ]
//
//  return (
//    <nav
//      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//        scrolled
//          ? "bg-white shadow-lg py-3"
//          : "bg-white/95 backdrop-blur-md py-4"
//      }`}
//    >
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//        <div className="flex items-center justify-between">
//          {/* Logo */}
//          <Link href={`/${locale}`} className="flex items-center gap-3 group">
//            <div className="text-3xl font-bold">
//              <span className="text-gray-900 group-hover:text-green-600 transition-colors">
//                Riayah
//              </span>
//              <span className="text-green-600">Care</span>
//            </div>
//          </Link>
//
//          {/* Desktop Navigation */}
//          <div className="hidden lg:flex items-center gap-8">
//            {navLinks.map((link) => (
//              <Link
//                key={link.href}
//                href={link.href}
//                className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group"
//              >
//                {link.label}
//                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300" />
//              </Link>
//            ))}
//          </div>
//
//          {/* Search & Actions */}
//          <div className="flex items-center gap-4">
//            {/* Search Button */}
//            <button
//              onClick={() => setSearchOpen(!searchOpen)}
//              className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//              aria-label="Search"
//            >
//              <Search className="w-5 h-5" />
//            </button>
//
//            {/* Language Switcher */}
//            <div className="hidden md:flex items-center gap-2">
//              <Globe className="w-4 h-4 text-gray-600" />
//              <select
//                value={locale}
//                onChange={(e) => {
//                  window.location.href = `/${e.target.value}${window.location.pathname.slice(3)}`
//                }}
//                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
//              >
//                <option value="en">EN</option>
//                <option value="ar">AR</option>
//              </select>
//            </div>
//
//            {/* CTA Button */}
//            <Link
//              href={`/${locale}/hospitals`}
//              className="hidden md:block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
//            >
//              Get Quote
//            </Link>
//
//            {/* Mobile Menu Toggle */}
//            <button
//              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//              className="lg:hidden p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//              aria-label="Toggle menu"
//            >
//              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//            </button>
//          </div>
//        </div>
//
//        {/* Search Overlay */}
//        {searchOpen && (
//          <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-2xl p-6 mx-4 border border-gray-100">
//            <div className="relative">
//              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//              <input
//                type="text"
//                placeholder="Search procedures, hospitals, doctors, or locations..."
//                value={searchQuery}
//                onChange={(e) => setSearchQuery(e.target.value)}
//                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                autoFocus
//              />
//            </div>
//
//            {/* Search Results */}
//            {searchQuery.length >= 2 && (
//              <div className="mt-4 max-h-96 overflow-y-auto">
//                {isSearching ? (
//                  <p className="text-gray-500 text-center py-4">Searching...</p>
//                ) : searchResults.length > 0 ? (
//                  <div className="space-y-2">
//                    {searchResults.map((result) => (
//                      <Link
//                        key={`${result.type}-${result.id}`}
//                        href={getResultLink(result)}
//                        onClick={() => {
//                          setSearchOpen(false)
//                          setSearchQuery("")
//                        }}
//                        className="block p-4 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
//                      >
//                        <div className="flex items-start justify-between">
//                          <div className="flex-1">
//                            <p className="font-semibold text-gray-900">{result.name}</p>
//                            <p className="text-sm text-gray-600">
//                              {result.type === "hospital" && result.location}
//                              {result.type === "procedure" && result.specialty}
//                              {result.type === "doctor" && result.specialty}
//                            </p>
//                          </div>
//                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded capitalize">
//                            {result.type}
//                          </span>
//                        </div>
//                      </Link>
//                    ))}
//                  </div>
//                ) : (
//                  <p className="text-gray-500 text-center py-4">
//                    No results found. Try a different search.
//                  </p>
//                )}
//              </div>
//            )}
//          </div>
//        )}
//
//        {/* Mobile Menu */}
//        {mobileMenuOpen && (
//          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
//            <div className="flex flex-col gap-3">
//              {navLinks.map((link) => (
//                <Link
//                  key={link.href}
//                  href={link.href}
//                  onClick={() => setMobileMenuOpen(false)}
//                  className="text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium px-4 py-2 rounded-lg transition-colors"
//                >
//                  {link.label}
//                </Link>
//              ))}
//              <Link
//                href={`/${locale}/hospitals`}
//                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-center"
//              >
//                Get Quote
//              </Link>
//            </div>
//          </div>
//        )}
//      </div>
//    </nav>
//  )
//}
//

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

