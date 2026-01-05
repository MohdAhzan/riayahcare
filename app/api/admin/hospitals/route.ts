
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"

/* ---------------- SLUG ---------------- */

async function generateUniqueSlug(
  supabase: any,
  name: string,
  excludeId?: string
) {
  const base = slugify(name)
  let slug = base
  let i = 1

  while (true) {
    let q = supabase.from("hospitals").select("id").eq("slug", slug)
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

    const { specialties, facilities, intl_services, ...hospitalData } = body

    /* -------- TRANSLATE ONCE -------- */

    const translations = {
      ar: await translateValuesToArabic({
        name: hospitalData.name,
        city: hospitalData.city,
        country: hospitalData.country,
        description: hospitalData.description,
        why_choose: hospitalData.why_choose,
        airport_distance: hospitalData.airport_distance,
        facilities,
        intl_services,
      }),
    }

    const slug = await generateUniqueSlug(supabase, hospitalData.name)

    /* -------- INSERT HOSPITAL -------- */

    const { data, error } = await supabase
      .from("hospitals")
      .insert({
        ...hospitalData,
        slug,
        facilities,
        intl_services,
        translations,
      })
      .select("id")
      .single()

    if (error) throw error

    /* -------- INSERT SPECIALTIES -------- */

    if (Array.isArray(specialties) && specialties.length > 0) {
      await supabase.from("hospital_specialties").insert(
        specialties.map((s: string) => ({
          hospital_id: data.id,
          specialty: s,
        }))
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Admin hospital POST error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

/* ================= PUT ================= */

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const { id, specialties, facilities, intl_services, ...hospitalData } = body
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const slug = await generateUniqueSlug(supabase, hospitalData.name, id)

    const translations = {
      ar: await translateValuesToArabic({
        name: hospitalData.name,
        city: hospitalData.city,
        country: hospitalData.country,
        description: hospitalData.description,
        why_choose: hospitalData.why_choose,
        airport_distance: hospitalData.airport_distance,
        facilities,
        intl_services,
      }),
    }

    await supabase
      .from("hospitals")
      .update({
        ...hospitalData,
        slug,
        facilities,
        intl_services,
        translations,
      })
      .eq("id", id)

    await supabase.from("hospital_specialties").delete().eq("hospital_id", id)

    if (Array.isArray(specialties)) {
      await supabase.from("hospital_specialties").insert(
        specialties.map((s: string) => ({
          hospital_id: id,
          specialty: s,
        }))
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Admin hospital PUT error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}


//import { NextResponse } from "next/server"
//import { createClient } from "@/lib/supabase/server"
//import { slugify } from "@/lib/utils"
//import {translateValuesToArabic } from "@/lib/googleTranslationServer/translate"
//async function generateUniqueSlug(
//  supabase: any,
//  name: string,
//  excludeId?: string
//) {
//  const base = slugify(name)
//  let slug = base
//  let i = 1
//
//  while (true) {
//    let q = supabase.from("hospitals").select("id").eq("slug", slug)
//    if (excludeId) q = q.neq("id", excludeId)
//
//    const { data } = await q
//    if (!data || data.length === 0) break
//
//    slug = `${base}-${i++}`
//  }
//
//  return slug
//}
//
//
//export async function POST(req: Request) {
//  try {
//    const supabase = await createClient()
//    const body = await req.json()
//
//    const {
//      specialties,
//      facilities,
//      intl_services,
//      ...hospitalData
//    } = body
//
//    /* ----------------------------------
//       1. TRANSLATE CORE HOSPITAL FIELDS
//    ----------------------------------- */
//
//
//    const translationPayload = {
//      name: hospitalData.name,
//      city: hospitalData.city,
//      country: hospitalData.country,
//      description: hospitalData.description,
//      why_choose: hospitalData.why_choose,
//      airport_distance: hospitalData.airport_distance,
//      facilities,
//      intl_services,
//    }
//
//    const translations = {
//      ar: await translateObjectToArabic(translationPayload),
//    }
//
//    //const translations = {
//    //  ar: {
//    //    name: await translateToArabic(hospitalData.name),
//    //    city: await translateToArabic(hospitalData.city),
//    //    country: await translateToArabic(hospitalData.country),
//    //    description: await translateToArabic(hospitalData.description),
//    //    why_choose: await translateToArabic(hospitalData.why_choose),
//    //    airport_distance: await translateToArabic(hospitalData.airport_distance),
//    //    facilities: await Promise.all(
//    //      (facilities || []).map(translateToArabic)
//    //    ),
//    //    intl_services: await Promise.all(
//    //      (intl_services || []).map(translateToArabic)
//    //    ),
//    //  },
//    //}
//
//    /* ----------------------------------
//       2. INSERT HOSPITAL
//    ----------------------------------- */
//
//    const slug = await generateUniqueSlug( supabase,hospitalData.name)
//
//
//    const { data, error } = await supabase
//      .from("hospitals")
//      .insert({
//        ...hospitalData,
//        slug,                 // ✅ FIX
//        facilities,
//        intl_services,
//        translations,
//      })
//      .select("id")
//      .single()
//    if (error) throw error
//
//    const hospitalId = data.id
//
//    /* ----------------------------------
//       3. INSERT SPECIALTIES + TRANSLATIONS
//    ----------------------------------- */
//    if (Array.isArray(specialties) && specialties.length > 0) {
//      await supabase.from("hospital_specialties").insert(
//        await Promise.all(
//          specialties.map(async (s: string) => ({
//            hospital_id: hospitalId,
//            specialty: s,
//            translations: {
//              ar: {
//                specialty: await translateToArabic(s),
//              },
//            },
//          }))
//        )
//      )
//    }
//
//    return NextResponse.json({ success: true })
//  } catch (err) {
//    console.error("Admin hospital API error:", err)
//    return NextResponse.json(
//      { error: "Failed to create hospital" },
//      { status: 500 }
//    )
//  }
//}
//export async function PUT(req: Request) {
//  try {
//    const supabase = await createClient()
//    const body = await req.json()
//
//    const {
//      id,
//      specialties,
//      facilities,
//      intl_services,
//      ...hospitalData
//    } = body
//
//    if (!id) {
//      return NextResponse.json(
//        { error: "Hospital ID required" },
//        { status: 400 }
//      )
//    }
//
//
//    // 1️⃣ Update hospital
//
//    const slug = await generateUniqueSlug(
//      supabase,
//      hospitalData.name,
//      id
//    )
//    const translationPayload = {
//      name: hospitalData.name,
//      city: hospitalData.city,
//      country: hospitalData.country,
//      description: hospitalData.description,
//      why_choose: hospitalData.why_choose,
//      airport_distance: hospitalData.airport_distance,
//      facilities,
//      intl_services,
//    }
//
//    const translations = {
//      ar: await translateObjectToArabic(translationPayload),
//    }
//
//
//    const { error } = await supabase
//      .from("hospitals")
//      .update({
//        ...hospitalData,
//        slug,                 // ✅ FIX
//        facilities,
//        intl_services,
//        translations,
//      })
//      .eq("id", id)
//
//    if (error) throw error
//
//    // 2️⃣ Replace specialties
//    await supabase.from("hospital_specialties").delete().eq("hospital_id", id)
//
//    if (Array.isArray(specialties)) {
//      await supabase.from("hospital_specialties").insert(
//        await Promise.all(
//          specialties.map(async (s: string) => ({
//            hospital_id: id,
//            specialty: s,
//            translations: {
//              ar: { specialty: await translateToArabic(s) },
//            },
//          }))
//        )
//      )
//    }
//
//    return NextResponse.json({ success: true })
//  } catch (err) {
//    console.error("Admin hospital UPDATE error:", err)
//    return NextResponse.json(
//      { error: "Failed to update hospital" },
//      { status: 500 }
//    )
//  }
//}
//
