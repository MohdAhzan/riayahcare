//components/faqs.tsx

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown } from "lucide-react"
import { useParams } from "next/navigation"
import { dbT } from "@/i18n/db-translate"
import { useTranslations } from "next-intl" 

type FAQRow = {
  id: string
  question: string
  answer: string
  translations?: any
}

type FAQ = {
  id: string
  question: string
  answer: string
}

type Props = {
  section: string
  entityId?: string
}

export default function FAQs({ section, entityId }: Props) {
  const supabase = createClient()
  const { locale } = useParams() as { locale: string }
  const lang = locale === "ar" ? "ar" : "en"
  const t = useTranslations("faqs") 

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      let query = supabase
        .from("faqs")
        .select("id, question, answer, translations")
        .eq("section", section)
        .eq("is_active", true)
        .order("position")

      if (entityId) {
        query = query.eq("entity_id", entityId)
      } else {
        query = query.is("entity_id", null)
      }

      const { data } = await query
      if (!data) return

      const formatted: FAQ[] = (data as FAQRow[]).map((faq) => ({
        id: faq.id,
        question: dbT(faq, "question", lang),
        answer: dbT(faq, "answer", lang),
      }))

      setFaqs(formatted)
    }

    fetchFaqs()
  }, [section, entityId, lang])

  if (!faqs.length) return null

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        {/* Card wrapper */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-emerald-200 p-4 sm:p-6">
          <div className="space-y-2">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id

              return (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-gradient-to-br from-green-50 to-emerald-100 hover:bg-green-100 transition"
                  >
                    <span className="text-md sm:text-base text-gray-900 font-semibold">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 text-emerald-600 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-md text-gray-800 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}


//"use client"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import { ChevronDown } from "lucide-react"
//
//type FAQ = {
//  id: string
//  question: string
//  answer: string
//}
//
//type Props = {
//  section: string
//  entityId?: string
//}
//
//export default function FAQs({ section, entityId }: Props) {
//  const supabase = createClient()
//  const [faqs, setFaqs] = useState<FAQ[]>([])
//  const [openId, setOpenId] = useState<string | null>(null)
//
//  useEffect(() => {
//    const fetchFaqs = async () => {
//      let query = supabase
//        .from("faqs")
//        .select("id, question, answer")
//        .eq("section", section)
//        .eq("is_active", true)
//        .order("position")
//
//      if (entityId) {
//        query = query.eq("entity_id", entityId)
//      } else {
//        query = query.is("entity_id", null)
//      }
//
//      const { data } = await query
//      setFaqs(data || [])
//    }
//
//    fetchFaqs()
//  }, [section, entityId])
//
//  if (!faqs.length) return null
//
//  return (
//    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200">
//      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//
//        {/* Heading */}
//        <div className="text-center mb-12">
//          <h2 className="text-3xl font-bold md:text-4xl  text-gray-900 mb-4">
//            Frequently Asked Questions (FAQ's)
//          </h2>
//          <p className="text-lg text-gray-600">
//            Clear answers to common questions
//          </p>
//        </div>
//
//        {/* Card wrapper  */}
//        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-emerald-200 p-4 sm:p-6">
//          <div className="space-y-2">
//            {faqs.map((faq) => {
//              const isOpen = openId === faq.id
//
//              return (
//                <div
//                  key={faq.id}
//                  className="border border-gray-200 rounded-lg overflow-hidden"
//                >
//                  <button
//                    onClick={() => setOpenId(isOpen ? null : faq.id)}
//                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-gradient-to-br from-green-50 to-emerald-100 hover:bg-green-100 transition"
//                  >
//                    <span className="text-md sm:text-base  text-grey-900 font-semibold">
//                      {faq.question}
//                    </span>
//
//                    <ChevronDown
//                      className={`w-5 h-5 text-emerald-600 transition-transform ${
//                        isOpen ? "rotate-180" : ""
//                      }`}
//                    />
//                  </button>
//
//                  {isOpen && (
//                    <div className="px-4 pb-4 text-md text-black-600 leading-relaxed">
//                      {faq.answer}
//                    </div>
//                  )}
//                </div>
//              )
//            })}
//          </div>
//        </div>
//      </div>
//    </section>
//  )
//}
//
