//app/api/faqs/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbT } from "@/i18n/db-translate"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

type Lang = "en" | "ar"

interface FAQRow {
  id: string
  section: string
  question: string
  answer: string
  translations?: {
    ar?: {
      question?: string
      answer?: string
    }
  }
  position: number
  is_active: boolean
}

/* ================================ GET ================================ */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const section = searchParams.get("section")
    const lang: Lang = searchParams.get("lang") === "ar" ? "ar" : "en"

    if (!section) {
      return NextResponse.json(
        { error: "Missing section parameter" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("section", section)
      .eq("is_active", true)
      .order("position", { ascending: true })

    if (error) {
      console.error("[FAQs GET Error]", error)
      return NextResponse.json(
        { error: "Failed to fetch FAQs" },
        { status: 500 }
      )
    }

    const formatted = (data as FAQRow[]).map((faq) => ({
      id: faq.id,
      question: dbT(faq, "question", lang),
      answer: dbT(faq, "answer", lang),
    }))

    return NextResponse.json({ faqs: formatted })
  } catch (err) {
    console.error("[FAQs GET Fatal]", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

/* ================================ POST ================================ */
  
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      section,
      entity_type,
      entity_id,
      question,
      answer,
      position,
    } = body

    if (!section || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const translated = await translateValuesToArabic({
      question,
      answer,
    })

    const supabase = await createClient()

    const { error } = await supabase.from("faqs").insert({
      section,
      entity_type: entity_type ?? null,
      entity_id: entity_id ?? null,
      question,
      answer,
      translations: {
        ar: {
          question: translated.question,
          answer: translated.answer,
        },
      },
      position: position ?? 0,   // ✅ respect frontend
      is_active: true,
    })

    if (error) {
      console.error("[FAQs POST Error]", error)
      return NextResponse.json(
        { error: "Insert failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[FAQs POST Fatal]", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}


/* ================================ PUT ================================ */

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      id,
      section,
      entity_type,
      entity_id,
      question,
      answer,
    } = body

    if (!id || !section || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const translated = await translateValuesToArabic({
      question,
      answer,
    })

    const supabase = await createClient()

    const { error } = await supabase
      .from("faqs")
      .update({
        section,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
        question,
        answer,
        translations: {
          ar: {
            question: translated.question,
            answer: translated.answer,
          },
        },
      })
      .eq("id", id)

    if (error) {
      console.error("[FAQs PUT Error]", error)
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[FAQs PUT Fatal]", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

