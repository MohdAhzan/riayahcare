import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

import { createClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createClient()

    const buckets = ["banners", "hospitals", "doctors", "blogs", "testimonials", "about"]

    for (const bucketName of buckets) {
      const { data: existingBucket } = await supabase.storage.getBucket(bucketName)

      if (!existingBucket) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })
        console.log(`Bucket ${bucketName} created`)
      }
    }

    return Response.json({ success: true, message: "All buckets initialized" })
  } catch (error) {
    console.error("Bucket creation error:", error)
    return Response.json({ error: "Failed to create buckets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = (formData.get("bucket") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = getAdminClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${bucket}/${fileName}`

    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === bucket)

      if (!bucketExists) {
        await supabase.storage.createBucket(bucket, { public: true })
        console.log(`[v0] Created bucket: ${bucket}`)
      }
    } catch (err) {
      console.warn("[v0] Bucket operation warning:", err)
    }

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrlData.publicUrl, path: filePath })
  } catch (error) {
    console.error("[v0] Upload failed:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
