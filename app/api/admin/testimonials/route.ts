// app/api/admin/testimonials/route.ts


import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      patient_name,
      patient_country,
      patient_image_url,
      video_url,
      treatment_type,
      rating,
      is_active,
      title_en,
      content_en
    } = body

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      content: content_en
    })

    const testimonialData = {
      patient_name,
      patient_country,
      patient_image_url: patient_image_url || null,
      video_url: video_url || null,
      treatment_type,
      rating,
      is_active,
      translations: {
        en: {
          title: title_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          content: translated.content
        }
      }
    }

    const { error } = await supabase
      .from("testimonials")
      .insert([testimonialData])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Testimonial POST error:", err)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      id,
      patient_name,
      patient_country,
      patient_image_url,
      video_url,
      treatment_type,
      rating,
      is_active,
      title_en,
      content_en
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      content: content_en
    })

    const testimonialData = {
      patient_name,
      patient_country,
      patient_image_url: patient_image_url || null,
      video_url: video_url || null,
      treatment_type,
      rating,
      is_active,
      translations: {
        en: {
          title: title_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          content: translated.content
        }
      }
    }

    const { error } = await supabase
      .from("testimonials")
      .update(testimonialData)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Testimonial PUT error:", err)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}
