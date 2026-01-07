import { NextResponse } from "next/server";
import { hubspotFetch } from "@/lib/hubspot/helper";

export async function POST(req: Request) {
  try {
    const { record } = await req.json();

    // Create contact
    const contact = await hubspotFetch("/crm/v3/objects/contacts", "POST", {
      properties: {
        firstname: record.patient_name,
        phone: record.phone,
        country: record.country,
        medical_specialty: record.specialty,
        medical_problem: record.medical_problem,
        patient_age: record.age,
        patient_gender: record.gender,
        lead_source: "RiayahCare Website",
      },
    });

    // Create deal (Patient Leads pipeline)
    await hubspotFetch("/crm/v3/objects/deals", "POST", {
      properties: {
        dealname: `General Inquiry – ${record.patient_name}`,
        pipeline: "default",
        dealstage: "appointmentscheduled", // replace later
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
    console.error("Quote sync failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

