//app/[locale]/procedures/[slug]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FAQs from "@/components/faqs"
import { createClient } from "@/lib/supabase/client"
import { useLocale, useTranslations } from "next-intl"
import {
    Clock,
    DollarSign,
    TrendingUp,
    Hospital,
    User,
    CheckCircle,
    ArrowLeft
} from "lucide-react"

interface Procedure {
    id: string
    slug: string
    name: string
    specialty: string
    description: string
    cost_min: number
    cost_max: number
    recovery_days: number
    success_rate: number
    image_url?: string
    translations?: {
        en?: { name: string; description: string; specialty: string }
        ar?: { name: string; description: string; specialty: string }
    }
}

interface RelatedHospital {
    id: string
    slug: string
    name: string
    city: string
    country: string
    image_url?: string
    rating: number
}

interface RelatedDoctor {
    id: string
    slug: string
    name: string
    image_url?: string
    rating: number
    experience_years: number
}

export default function ProcedureDetailPage() {
    const { slug, locale: localeParam } = useParams() as { slug: string; locale: string }
    const locale = useLocale()
    const t = useTranslations("ProcedureDetail")
    const supabase = createClient()

    const [procedure, setProcedure] = useState<Procedure | null>(null)
    const [relatedHospitals, setRelatedHospitals] = useState<RelatedHospital[]>([])
    const [relatedDoctors, setRelatedDoctors] = useState<RelatedDoctor[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) return
        fetchProcedure()
    }, [slug])

    const fetchProcedure = async () => {
        try {
            // Fetch procedure by slug
            const { data: procData, error: procError } = await supabase
                .from("procedures")
                .select("*")
                .eq("slug", slug)
                .single()

            if (procError) throw procError

            if (procData) {
                const lang = locale === 'ar' ? 'ar' : 'en'
                const formatted: Procedure = {
                    ...procData,
                    name: procData.translations?.[lang]?.name || procData.name,
                    description: procData.translations?.[lang]?.description || procData.description,
                    specialty: procData.translations?.[lang]?.specialty || procData.specialty,
                }
                setProcedure(formatted)

                // Fetch related hospitals that offer this specialty
                const { data: hospitals } = await supabase
                    .from("hospitals")
                    .select("id, slug, name, city, country, image_url, rating, translations")
                    .limit(4)

                if (hospitals) {
                    setRelatedHospitals(hospitals.map(h => ({
                        ...h,
                        name: h.translations?.[lang]?.name || h.name,
                        city: h.translations?.[lang]?.city || h.city,
                        country: h.translations?.[lang]?.country || h.country,
                    })))
                }

                // Fetch related doctors
                const { data: doctors } = await supabase
                    .from("doctors")
                    .select("id, slug, name, image_url, rating, experience_years")
                    .limit(4)

                if (doctors) {
                    setRelatedDoctors(doctors)
                }
            }
        } catch (error) {
            console.error("Error fetching procedure:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!procedure) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("not_found")}</h1>
                    <Link href="/procedures" className="text-green-600 hover:text-green-700 font-semibold">
                        ← Back to Procedures
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Header */}
            <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/procedures"
                        className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Procedures
                    </Link>
                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                        {procedure.image_url && (
                            <div className="w-full lg:w-1/3">
                                <Image
                                    src={procedure.image_url}
                                    alt={procedure.name}
                                    width={400}
                                    height={300}
                                    className="rounded-2xl shadow-xl object-cover w-full h-48 lg:h-64"
                                />
                            </div>
                        )}
                        <div className={procedure.image_url ? "lg:w-2/3" : "w-full"}>
                            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-3">
                                {procedure.specialty}
                            </span>
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
                                {procedure.name}
                            </h1>
                            <p className="text-green-100 text-base lg:text-lg max-w-2xl">
                                {procedure.description?.substring(0, 200)}...
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Stats */}
            <section className="py-8 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 lg:p-6 text-center">
                            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-xs lg:text-sm text-gray-600 mb-1">{t("cost_range")}</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900">
                                ₹{procedure.cost_min.toLocaleString()} - ₹{procedure.cost_max.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 lg:p-6 text-center">
                            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs lg:text-sm text-gray-600 mb-1">{t("recovery")}</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900">
                                {procedure.recovery_days} {t("days")}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 lg:p-6 text-center">
                            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs lg:text-sm text-gray-600 mb-1">{t("success_rate")}</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900">
                                {procedure.success_rate}%
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 lg:p-6 text-center">
                            <Hospital className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <p className="text-xs lg:text-sm text-gray-600 mb-1">Available at</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900">
                                {relatedHospitals.length}+ Hospitals
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Description */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{t("overview")}</h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p className="leading-relaxed whitespace-pre-line">{procedure.description}</p>
                    </div>
                </div>
            </section>

            {/* Related Hospitals */}
            {relatedHospitals.length > 0 && (
                <section className="py-12 bg-gradient-to-b from-green-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {t("related_hospitals")}
                            </h2>
                            <Link
                                href={`/hospitals?specialty=${encodeURIComponent(procedure.specialty)}`}
                                className="text-green-600 hover:text-green-700 font-semibold"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedHospitals.map((hospital) => (
                                <Link
                                    key={hospital.id}
                                    href={`/hospitals/${hospital.slug || hospital.id}`}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                                >
                                    {hospital.image_url && (
                                        <div className="relative h-40 overflow-hidden">
                                            <Image
                                                src={hospital.image_url}
                                                alt={hospital.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{hospital.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{hospital.city}, {hospital.country}</p>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <span>⭐</span>
                                            <span className="font-semibold">{hospital.rating?.toFixed(1) || '4.5'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Related Doctors */}
            {relatedDoctors.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {t("related_doctors")}
                            </h2>
                            <Link
                                href={`/doctors?specialty=${encodeURIComponent(procedure.specialty)}`}
                                className="text-green-600 hover:text-green-700 font-semibold"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedDoctors.map((doctor) => (
                                <Link
                                    key={doctor.id}
                                    href={`/doctors/${doctor.slug || doctor.id}`}
                                    className="bg-gradient-to-b from-green-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-center group"
                                >
                                    {doctor.image_url ? (
                                        <Image
                                            src={doctor.image_url}
                                            alt={doctor.name}
                                            width={100}
                                            height={100}
                                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-green-500"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-green-100 flex items-center justify-center">
                                            <User className="w-10 h-10 text-green-600" />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-gray-900 mb-1">{doctor.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{doctor.experience_years}+ years exp.</p>
                                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                                        <span>⭐</span>
                                        <span className="font-semibold">{doctor.rating?.toFixed(1) || '4.5'}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQs */}
            <FAQs section="procedure_detail" entityId={procedure.id} />

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("cta_title")}</h2>
                    <p className="text-lg text-green-100 mb-8">{t("cta_subtitle")}</p>
                    <button
                        onClick={() => document.getElementById('private-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {t("get_quote")}
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    )
}
