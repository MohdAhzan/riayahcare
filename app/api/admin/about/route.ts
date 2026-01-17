// app/api/admin/about/route.ts


import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      section_type,
      image_url,
      order_index,
      is_active,
      title_en,
      subtitle_en,
      content_en
    } = body

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      subtitle: subtitle_en,
      content: content_en
    })

    const aboutData = {
      section_type,
      image_url: image_url || null,
      order_index,
      is_active,
      translations: {
        en: {
          title: title_en,
          subtitle: subtitle_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          subtitle: translated.subtitle,
          content: translated.content
        }
      }
    }

    const { error } = await supabase
      .from("about_us")
      .insert([aboutData])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("About POST error:", err)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      id,
      section_type,
      image_url,
      order_index,
      is_active,
      title_en,
      subtitle_en,
      content_en
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      subtitle: subtitle_en,
      content: content_en
    })

    const aboutData = {
      section_type,
      image_url: image_url || null,
      order_index,
      is_active,
      translations: {
        en: {
          title: title_en,
          subtitle: subtitle_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          subtitle: translated.subtitle,
          content: translated.content
        }
      },
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("about_us")
      .update(aboutData)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("About PUT error:", err)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}
