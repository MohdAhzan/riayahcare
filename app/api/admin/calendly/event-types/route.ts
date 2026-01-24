// app/api/admin/calendly/event-types/route.ts

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { api_key } = await req.json()

    const response = await fetch("https://api.calendly.com/event_types?organization=", {
      headers: {
        "Authorization": `Bearer ${api_key}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

