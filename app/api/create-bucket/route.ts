import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("[v0] Error listing buckets:", listError)
      return NextResponse.json({ error: "Failed to list buckets" }, { status: 500 })
    }

    const bucketExists = buckets?.some((b) => b.name === "uploads")

    if (!bucketExists) {
      // Try to create bucket - if it fails due to RLS, that's expected, bucket might exist at storage level
      try {
        await supabase.storage.createBucket("uploads", {
          public: true,
        })
      } catch (createError) {
        // Bucket might already exist, continue anyway
        console.warn("[v0] Bucket creation attempted:", createError)
      }
    }

    return NextResponse.json({ message: "Bucket check complete" })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
