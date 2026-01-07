"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown } from "lucide-react"

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
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      let query = supabase
        .from("faqs")
        .select("id, question, answer")
        .eq("section", section)
        .eq("is_active", true)
        .order("position")

      if (entityId) {
        query = query.eq("entity_id", entityId)
      } else {
        query = query.is("entity_id", null)
      }

      const { data } = await query
      setFaqs(data || [])
    }

    fetchFaqs()
  }, [section, entityId])

  if (!faqs.length) return null

  return (
    <section className="max-w-4xl background: #fafdff;
background: linear-gradient(90deg, rgba(250, 253, 255, 1) 0%, rgba(197, 255, 191, 1) 0%, rgba(240, 255, 240, 1) 22%, rgba(255, 255, 255, 1) 75%, rgba(184, 255, 181, 1) 100%); mx-auto py-12">
      <h2 className="text-4xl alignContent: 'center', font-bold mb-8">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id

          return (
            <div
              key={faq.id}
              className={`
                rounded-xl transition-all duration-300
                ${isOpen ? "bg-card border border-border" : "btn-glass"}
              `}
            >
              {/* HEADER */}
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                {/* QUESTION — always black */}
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>

                {/* ICON */}
                <span
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full
                    transition-all duration-300
                    ${
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/30 text-white"
                    }
                  `}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {/* CONTENT */}
              {isOpen && (
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

