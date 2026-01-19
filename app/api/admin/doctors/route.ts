//app/api/admin/doctors/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

/* ---------- SLUG ---------- */
async function generateUniqueSlug(
  supabase: any,
  name: string,
  excludeId?: string
) {
  const base = slugify(name)
  let slug = base
  let i = 1

  while (true) {
    let q = supabase.from("doctors").select("id").eq("slug", slug)
    if (excludeId) q = q.neq("id", excludeId)

    const { data } = await q
    if (!data || data.length === 0) break

    slug = `${base}-${i++}`
  }

  return slug
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const slug = await generateUniqueSlug(supabase, body.name)

    const translations = {
      ar: await translateValuesToArabic({
        name: body.name,
        bio: body.bio,
        education: body.education,
        languages: body.languages,
        expertise: body.expertise,
        conditions_treated: body.conditions_treated,
        procedures: body.procedures,
        experience_details: body.experience_details?.map((e: any) => ({
          role: e.role,
          hospital: e.hospital,
        })),
      }),
    }

    const { error } = await supabase.from("doctors").insert({
      ...body,
      slug,
      translations,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Doctor POST error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

/* ================= PUT ================= */
export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const slug = await generateUniqueSlug(supabase, body.name, body.id)

    const translations = {
      ar: await translateValuesToArabic({
        name: body.name,
        bio: body.bio,
        education: body.education,
        languages: body.languages,
        expertise: body.expertise,
        conditions_treated: body.conditions_treated,
        procedures: body.procedures,
        experience_details: body.experience_details?.map((e: any) => ({
          role: e.role,
          hospital: e.hospital,
        })),
      }),
    }

    const { error } = await supabase
      .from("doctors")
      .update({
        ...body,
        slug,
        translations,
      })
      .eq("id", body.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Doctor PUT error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

