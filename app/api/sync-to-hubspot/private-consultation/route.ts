import { NextResponse } from "next/server";
import { hubspotFetch } from "@/lib/hubspot/helper";

export async function POST(req: Request) {
  try {
    const { record } = await req.json();

    // Create contact (email exists here)
    const contact = await hubspotFetch("/crm/v3/objects/contacts", "POST", {
      properties: {
        firstname: record.patient_name,
        email: record.email,
        phone: record.phone,
        medical_report_url: record.medical_report_url || "",
        lead_source: "Private Consultation",
      },
    });

    // Create deal in Private Consultation pipeline
    await hubspotFetch("/crm/v3/objects/deals", "POST", {
      properties: {
        dealname: `Private Consultation – ${record.patient_name}`,
        pipeline: "private_consultations", // create this pipeline
        dealstage: "consultation_requested",
        scheduled_date: record.scheduled_date,
        scheduled_time: record.scheduled_time,
        discussion_topic: record.discussion_topic,
      },
      associations: [
        {
          to: { id: contact.id },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Private consultation sync failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

