import { NextResponse } from "next/server"

const HUBSPOT_BASE = "https://api.hubapi.com"

async function hubspotFetch(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: any
) {
  const res = await fetch(`${HUBSPOT_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.json()
}

async function createContact(record: any) {
  const contact = await hubspotFetch("/crm/v3/objects/contacts", "POST", {
    properties: {
      firstname: record.patient_name,
      phone: record.phone,
      country: record.country,
      medical_specialty: record.specialty,
      medical_problem: record.medical_problem,
      patient_age: record.age,
      patient_gender: record.gender,
      medical_report_url: record.medical_report_url || "",
      lead_source: "RiayahCare Website",
    },
  })

  return contact.id
}

async function createDeal(contactId: string) {
  await hubspotFetch("/crm/v3/objects/deals", "POST", {
    properties: {
      dealname: "New Patient Inquiry",
      pipeline: "default",
      dealstage: "appointmentscheduled", // adjust later
    },
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3,
          },
        ],
      },
    ],
  })
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const record = payload.record

    const contactId = await createContact(record)
    await createDeal(contactId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("HubSpot sync error:", err)
    return NextResponse.json({ error: "HubSpot sync failed" }, { status: 500 })
  }
}

