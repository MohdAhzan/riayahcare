
// components/navbar-v2.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, Search } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface SearchResult {
  id: string
  slug?: string
  type: "procedure" | "hospital" | "doctor" | "specialty"
  name: string
  description?: string
  location?: string
  specialty?: string
}

interface GroupedResults {
  hospitals: SearchResult[]
  procedures: SearchResult[]
  doctors: SearchResult[]
  specialties: SearchResult[]
}

export default function EnhancedNavbar() {
  const t = useTranslations("Navbar")
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const [menuOpen, setMenuOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<GroupedResults>({
    hospitals: [],
    procedures: [],
    doctors: [],
    specialties: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(locale === "ar" ? "العربية" : "English")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const languages = [
    { name: "English", code: "en" },
    { name: "العربية", code: "ar" },
  ]

  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode === "ar" ? "العربية" : "English")
    setLanguageOpen(false)
    router.replace(pathname, { locale: langCode })
  }

  // Universal Search Function
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ hospitals: [], procedures: [], doctors: [], specialties: [] })
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results: GroupedResults = {
          hospitals: [],
          procedures: [],
          doctors: [],
          specialties: [],
        }

        // Search Hospitals
        const { data: hospitals } = await supabase
          .from("hospitals")
          .select("id, slug, name, city, country, translations")
          .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
          .limit(5)

        hospitals?.forEach((hosp) => {
          results.hospitals.push({
            id: hosp.id,
            slug: hosp.slug,
            type: "hospital",
            name: hosp.translations?.en?.name || hosp.name,
            location: `${hosp.city}, ${hosp.country}`,
          })
        })

        // Search Procedures
        const { data: procedures } = await supabase
          .from("procedures")
          .select("id, slug, name, specialty, description, translations")
          .or(`name.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%`)
          .limit(5)

        procedures?.forEach((proc) => {
          results.procedures.push({
            id: proc.id,
            slug: proc.slug,
            type: "procedure",
            name: proc.translations?.en?.name || proc.name,
            specialty: proc.translations?.en?.specialty || proc.specialty,
          })
        })

        // Search Doctors
        const { data: doctors } = await supabase
          .from("doctors")
          .select("id, slug, name, translations")
          .ilike("name", `%${searchQuery}%`)
          .limit(5)

        doctors?.forEach((doc) => {
          results.doctors.push({
            id: doc.id,
            slug: doc.slug,
            type: "doctor",
            name: doc.name,
            specialty: doc.translations?.en?.specialty,
          })
        })

        // Search Specialties from hospital_specialties and procedures
        const [{ data: hospitalSpecialties }, { data: procedureSpecialties }] = await Promise.all([
          supabase
            .from("hospital_specialties")
            .select("specialty, translations")
            .ilike("specialty", `%${searchQuery}%`)
            .limit(5),
          supabase
            .from("procedures")
            .select("specialty, translations")
            .ilike("specialty", `%${searchQuery}%`)
            .limit(5)
        ])

        const uniqueSpecialties = new Map<string, string>()

        // Collect unique specialties from hospital_specialties
        hospitalSpecialties?.forEach((hs) => {
          const specialty = hs.translations?.en?.specialty || hs.specialty
          if (specialty && !uniqueSpecialties.has(specialty.toLowerCase())) {
            uniqueSpecialties.set(specialty.toLowerCase(), specialty)
          }
        })

        // Collect unique specialties from procedures
        procedureSpecialties?.forEach((proc) => {
          const specialty = proc.translations?.en?.specialty || proc.specialty
          if (specialty && !uniqueSpecialties.has(specialty.toLowerCase())) {
            uniqueSpecialties.set(specialty.toLowerCase(), specialty)
          }
        })

        // Create specialty-based contextual results
        uniqueSpecialties.forEach((specialty) => {
          // Add "Best [specialty] Hospitals in India"
          results.specialties.push({
            id: `${specialty}-hospitals`,
            type: "specialty",
            name: `Best ${specialty} Hospitals in India`,
            description: `View top-rated ${specialty} hospitals`,
            specialty: specialty,
          })

          // Add "Best [specialty] Specialist Doctors"
          results.specialties.push({
            id: `${specialty}-doctors`,
            type: "specialty",
            name: `Best ${specialty} Specialist Doctors`,
            description: `Find expert ${specialty} doctors`,
            specialty: specialty,
          })

          // Add "Procedures related to [specialty]"
          results.specialties.push({
            id: `${specialty}-procedures`,
            type: "specialty",
            name: `${specialty} Procedures & Treatments`,
            description: `Browse ${specialty} procedures and costs`,
            specialty: specialty,
          })
        })

        setSearchResults(results)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case "hospital":
        return `/hospitals/${result.slug || result.id}`
      case "doctor":
        return `/doctors/${result.slug || result.id}`
      case "procedure":
        return result.slug ? `/procedures/${result.slug}` : `/procedures`
      case "specialty":
        // Handle contextual specialty links
        if (result.id.endsWith('-hospitals')) {
          return `/hospitals?specialty=${encodeURIComponent(result.specialty || '')}`
        } else if (result.id.endsWith('-doctors')) {
          return `/doctors?specialty=${encodeURIComponent(result.specialty || '')}`
        } else if (result.id.endsWith('-procedures')) {
          return `/procedures?specialty=${encodeURIComponent(result.specialty || '')}`
        }
        return `/procedures?specialty=${encodeURIComponent(result.specialty || result.id)}`
      default:
        return "#"
    }
  }

  const totalResults =
    searchResults.hospitals.length +
    searchResults.procedures.length +
    searchResults.doctors.length +
    searchResults.specialties.length

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm border-b border-slate-700/50"
      style={{
        background:
          "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(210, 247, 210, 0.68) 0%, rgba(224, 255, 224, 0.15) 21%, rgba(224, 255, 224, 0.1) 78%, rgba(210, 247, 210, 0.45) 100%)",
      }}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Left side */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 mr-8">
            <Image
              src="/logo2.png"
              alt="Riayah Care Logo"
              width={60}
              height={60}
              className="rounded-lg w-auto h-12 sm:h-14"
              priority
            />
            <span className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-emerald-500 transition whitespace-nowrap">
              Riayah Care
            </span>
          </Link>

          {/* Desktop Menu - Right side with spacer */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-8 ml-auto mr-4 xl:mr-8">
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
                className="px-3 py-2 rounded-full border border-transparent text-gray-900 font-bold text-sm xl:text-base transition-all duration-300 hover:bg-white/80 hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-1 flex items-center justify-center whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

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
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-green-200 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-3 transition ${selectedLanguage === lang.name
                        ? "bg-green-600 text-white"
                        : "text-gray-700 hover:bg-green-50"
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() =>
                document.getElementById("private-inquiry-form")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2"
            >
              {t("get_premium_consultation")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-green-600 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-700 hover:text-green-600 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery("")
              }}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-2xl p-6 mx-4 border border-gray-100 max-h-[80vh] overflow-y-auto z-50">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search procedures, hospitals, doctors, or specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {searchQuery.length >= 2 && (
                <div className="space-y-6">
                  {isSearching ? (
                    <p className="text-gray-500 text-center py-4">Searching...</p>
                  ) : totalResults > 0 ? (
                    <>
                      {/* Specialties */}
                      {searchResults.specialties.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            Specialties
                          </h3>
                          <div className="space-y-1">
                            {searchResults.specialties.map((result) => (
                              <Link
                                key={result.id}
                                href={getResultLink(result)}
                                onClick={() => {
                                  setSearchOpen(false)
                                  setSearchQuery("")
                                }}
                                className="block p-3 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <p className="font-semibold text-gray-900">{result.name}</p>
                                <p className="text-sm text-gray-600">{result.description}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hospitals */}
                      {searchResults.hospitals.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            Hospitals
                          </h3>
                          <div className="space-y-1">
                            {searchResults.hospitals.map((result) => (
                              <Link
                                key={result.id}
                                href={getResultLink(result)}
                                onClick={() => {
                                  setSearchOpen(false)
                                  setSearchQuery("")
                                }}
                                className="block p-3 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{result.name}</p>
                                    <p className="text-sm text-gray-600">{result.location}</p>
                                  </div>
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                    HOSPITAL
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Procedures */}
                      {searchResults.procedures.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            Procedures
                          </h3>
                          <div className="space-y-1">
                            {searchResults.procedures.map((result) => (
                              <Link
                                key={result.id}
                                href={getResultLink(result)}
                                onClick={() => {
                                  setSearchOpen(false)
                                  setSearchQuery("")
                                }}
                                className="block p-3 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{result.name}</p>
                                    <p className="text-sm text-gray-600">{result.specialty}</p>
                                  </div>
                                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    PROCEDURE
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctors */}
                      {searchResults.doctors.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            Doctors
                          </h3>
                          <div className="space-y-1">
                            {searchResults.doctors.map((result) => (
                              <Link
                                key={result.id}
                                href={getResultLink(result)}
                                onClick={() => {
                                  setSearchOpen(false)
                                  setSearchQuery("")
                                }}
                                className="block p-3 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{result.name}</p>
                                    {result.specialty && (
                                      <p className="text-sm text-gray-600">{result.specialty}</p>
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                    DOCTOR
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No results found. Try searching for procedures, hospitals, or specialties.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700 py-4 space-y-3">
            <Link
              href="/hospitals"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("hospitals")}
            </Link>
            <Link
              href="/doctors"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("doctors")}
            </Link>
            <Link
              href="/procedures"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("procedures")}
            </Link>
            <Link
              href="/blogs"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("blogs")}
            </Link>
            <Link
              href="/testimonials"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              {t("testimonials")}
            </Link>
            <Link
              href="/aboutus"
              className="block px-4 py-2 text-gray-700 hover:text-green-400 hover:bg-slate-100 rounded transition"
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
                  <div className="mt-2 bg-white border border-green-200 rounded-lg overflow-hidden shadow-xl">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code)
                          setMenuOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 transition ${selectedLanguage === lang.name
                          ? "bg-green-600 text-white"
                          : "text-gray-700 hover:bg-green-50"
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
                  document.getElementById("private-inquiry-form")?.scrollIntoView({ behavior: "smooth" })
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


//"use client"
//
//import { useRouter, usePathname, Link } from "@/i18n/navigation"
//import { useLocale, useTranslations } from "next-intl"
//import Image from "next/image"
//import { Button } from "@/components/ui/button"
//import { useState } from "react"
//import { Menu, X, Globe } from "lucide-react"
//
//export default function NavbarV2() {
//  const t = useTranslations("Navbar")
//  const router = useRouter()
//  const pathname = usePathname()
//  const locale = useLocale()
//
//  const [menuOpen, setMenuOpen] = useState(false)
//  const [languageOpen, setLanguageOpen] = useState(false)
//  const [selectedLanguage, setSelectedLanguage] = useState(locale === "ar" ? "العربية" : "English")
//
//  const languages = [
//    { name: "English", code: "en" },
//    { name: "العربية", code: "ar" },
//  ]
//
//  const changeLanguage = (langCode: string) => {
//    setSelectedLanguage(langCode === "ar" ? "العربية" : "English")
//    setLanguageOpen(false)
//    router.replace(pathname, { locale: langCode })
//  }
//
//  return (
//    <nav className="sticky top-0 z-50  backdrop-blur-sm border-b border-slate-700/50"
//      style={{
//
//        background: "linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(210, 247, 210, 0.68) 0%, rgba(224, 255, 224, 0.15) 21%, rgba(224, 255, 224, 0.1) 78%, rgba(210, 247, 210, 0.45) 100%)"
//
//      }}
//    >
//
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//        <div className="flex justify-between items-center h-20">
//          {/* Logo */}
//          <Link href="/" className="flex items-center gap-3 group">
//            <Image
//              src="/logo2.png"
//              alt="Riayah Care Logo"
//              width={70}
//              height={70}
//              className="rounded-lg"
//              priority
//            />
//            <span className="font-bold text-xl text-gray-900  group-hover:text-emerald-500 transition">
//              Riayah Care
//            </span>
//          </Link>
//
//          {/* Desktop Menu */}
//          <div className="hidden lg:flex items-center gap-4"> {/* Adjusted gap slightly for pill padding */}
//            {[
//              { name: t("hospitals"), href: "/hospitals" },
//              { name: t("doctors"), href: "/doctors" },
//              { name: t("procedures"), href: "/procedures" },
//              { name: t("blogs"), href: "/blogs" },
//              { name: t("testimonials"), href: "/testimonials" },
//              { name: t("aboutus"), href: "/aboutus" },
//
//            ].map((link) => (
//                <Link
//                  key={link.href}
//                  href={link.href}
//                  className="
//                  px-4 py-2 
//                  rounded-full 
//                  border border-transparent 
//                  text-gray-900 font-bold 
//                  transition-all duration-300 
//                  hover:bg-white/80 
//                  hover:border-emerald-500/30 
//                  hover:shadow-md 
//                  hover:-translate-y-1
//                  flex items-center justify-center
//                  "
//                >
//                  {link.name}
//                </Link>
//              ))}
//            {/* Language Selector */}
//            <div className="relative">
//              <button
//                onClick={() => setLanguageOpen(!languageOpen)}
//                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-full hover:border-green-400 transition font-medium text-gray-700"
//              >
//                <Globe className="w-4 h-4" />
//                {selectedLanguage}
//              </button>
//
//              {languageOpen && (
//                <div className="absolute top-full right-0 mt-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 hover:border-green-400 transition font-medium text-gray-700" >
//                  {languages.map((lang) => (
//                    <button
//                      key={lang.code}
//                      onClick={() => changeLanguage(lang.code)}
//                      className={`w-full text-left px-4 py-3 transition ${
//selectedLanguage === lang.name 
//? "bg-green-600 text-white" 
//: "text-black-300 hover:bg-green-100"
//}`}
//                    >
//                      {lang.name}
//                    </button>
//                  ))}
//                </div>
//              )}
//            </div>
//
//            <Button 
//              onClick={() => document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
//              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2"
//            >
//              {t("get_premium_consultation")}
//            </Button>
//          </div>
//
//          {/* Mobile Menu Button */}
//          <button
//            className="lg:hidden p-2 text-black-300 hover:text-white transition"
//            onClick={() => setMenuOpen(!menuOpen)}
//          >
//            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//          </button>
//        </div>
//
//        {/* Mobile Menu */}
//        {menuOpen && (
//          <div className="lg:hidden border-t border-slate-700 py-4 space-y-3">
//            <Link 
//              href="/hospitals" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("hospitals")}
//            </Link>
//            <Link 
//              href="/doctors" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("doctors")}
//            </Link>
//            <Link 
//              href="/procedures" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("procedures")}
//            </Link>
//            <Link 
//              href="/blogs" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("blogs")}
//            </Link>
//            <Link 
//              href="/testimonials" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("testimonials")}
//
//            </Link>
//            <Link 
//              href="/aboutus" 
//              className="block px-4 py-2 text-black-300 hover:text-green-400 hover:bg-slate-800 rounded transition"
//              onClick={() => setMenuOpen(false)}
//            >
//              {t("aboutus")}
//            </Link>
//
//            <div className="px-4">
//              <div className="relative">
//                <button
//                  onClick={() => setLanguageOpen(!languageOpen)}
//                  className="w-full flex items-center rounded-full justify-between px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 hover:border-green-400 transition font-medium text-gray-700"
//                >
//                  <span className="flex items-center gap-2">
//                    <Globe className="w-4 h-4" />
//                    {selectedLanguage}
//                  </span>
//                </button>
//                {languageOpen && (
//                  <div className="mt-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200  hover:border-green-400 transition font-medium text-gray-700 rounded-lg overflow-hidden">
//                    {languages.map((lang) => (
//                      <button
//                        key={lang.code}
//                        onClick={() => {
//                          changeLanguage(lang.code)
//                          setMenuOpen(false)
//                        }}
//                        className={`w-full text-left px-4 py-3 transition ${
//selectedLanguage === lang.name 
//? "bg-green-600 text-white" 
//: "text-black-300 hover:bg-green-100"
//}`}
//                      >
//                        {lang.name}
//                      </button>
//                    ))}
//                  </div>
//                )}
//              </div>
//            </div>
//
//            <div className="px-4 pt-2">
//              <Button 
//                onClick={() => {
//                  document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })
//                  setMenuOpen(false)
//                }}
//                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
//              >
//                {t("get_premium_consultation")}
//              </Button>
//            </div>
//          </div>
//        )}
//      </div>
//    </nav>
//  )
//}
//
