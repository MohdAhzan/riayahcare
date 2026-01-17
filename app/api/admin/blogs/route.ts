// app/api/admin/blogs/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      slug,
      author_name,
      author_image_url,
      image_url,
      category,
      is_active,
      title_en,
      excerpt_en,
      content_en
    } = body

    // Generate slug from title if empty
    const finalSlug = slug || generateSlug(title_en)

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      excerpt: excerpt_en,
      content: content_en
    })

    const blogData = {
      slug: finalSlug,
      author_name,
      author_image_url,
      image_url,
      category,
      is_active,
      translations: {
        en: {
          title: title_en,
          excerpt: excerpt_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          excerpt: translated.excerpt,
          content: translated.content
        }
      }
    }

    const { error } = await supabase
      .from("blogs")
      .insert([blogData])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Blog POST error:", err)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const {
      id,
      slug,
      author_name,
      author_image_url,
      image_url,
      category,
      is_active,
      title_en,
      excerpt_en,
      content_en
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    // Translate to Arabic
    const translated = await translateValuesToArabic({
      title: title_en,
      excerpt: excerpt_en,
      content: content_en
    })

    const blogData = {
      slug: slug || generateSlug(title_en),
      author_name,
      author_image_url,
      image_url,
      category,
      is_active,
      translations: {
        en: {
          title: title_en,
          excerpt: excerpt_en,
          content: content_en
        },
        ar: {
          title: translated.title,
          excerpt: translated.excerpt,
          content: translated.content
        }
      },
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("blogs")
      .update(blogData)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Blog PUT error:", err)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}
