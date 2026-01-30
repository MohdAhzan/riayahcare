// app/api/admin/banners/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    
    const {
      image_url,
      cta_link,
      is_active,
      title_en,
      subtitle_en,
      cta_text_en,
      order_index
    } = body

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      subtitle: subtitle_en,
      cta_text: cta_text_en
    })

    const bannerData = {
      image_url,
      cta_link: cta_link || "/hospitals",
      is_active: is_active !== undefined ? is_active : true,
      order_index: order_index !== undefined ? order_index : 0,
      translations: {
        en: {
          title: title_en,
          subtitle: subtitle_en,
          cta_text: cta_text_en
        },
        ar: {
          title: translated.title,
          subtitle: translated.subtitle,
          cta_text: translated.cta_text
        }
      }
    }

    const { data, error } = await supabase
      .from("banners")
      .insert([bannerData])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("Banner POST error:", err)
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    
    const {
      id,
      image_url,
      cta_link,
      is_active,
      title_en,
      subtitle_en,
      cta_text_en
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      subtitle: subtitle_en,
      cta_text: cta_text_en
    })

    const bannerData = {
      image_url,
      cta_link,
      is_active,
      translations: {
        en: {
          title: title_en,
          subtitle: subtitle_en,
          cta_text: cta_text_en
        },
        ar: {
          title: translated.title,
          subtitle: translated.subtitle,
          cta_text: translated.cta_text
        }
      },
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("banners")
      .update(bannerData)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Banner PUT error:", err)
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    )
  }
}
