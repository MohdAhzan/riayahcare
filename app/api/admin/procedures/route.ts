// app/api/admin/procedures/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const {
      name,
      specialty,
      description,
      cost_min,
      cost_max,
      recovery_days,
      success_rate,
      image_url
    } = body

    // Generate slug from name
    const slug = generateSlug(name)

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      name,
      specialty,
      description
    })

    const procedureData = {
      name,
      specialty,
      description,
      cost_min,
      cost_max,
      recovery_days,
      success_rate,
      image_url,
      slug,
      translations: {
        en: {
          name,
          specialty,
          description
        },
        ar: {
          name: translated.name,
          specialty: translated.specialty,
          description: translated.description
        }
      }
    }

    const { error } = await supabase
      .from("procedures")
      .insert([procedureData])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Procedure POST error:", err)
    return NextResponse.json({ error: "Failed to create procedure" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const {
      id,
      name,
      specialty,
      description,
      cost_min,
      cost_max,
      recovery_days,
      success_rate,
      image_url
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Generate slug from name
    const slug = generateSlug(name)

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      name,
      specialty,
      description
    })

    const procedureData = {
      name,
      specialty,
      description,
      cost_min,
      cost_max,
      recovery_days,
      success_rate,
      image_url,
      slug,
      translations: {
        en: {
          name,
          specialty,
          description
        },
        ar: {
          name: translated.name,
          specialty: translated.specialty,
          description: translated.description
        }
      }
    }

    const { error } = await supabase
      .from("procedures")
      .update(procedureData)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Procedure PUT error:", err)
    return NextResponse.json({ error: "Failed to update procedure" }, { status: 500 })
  }
}
