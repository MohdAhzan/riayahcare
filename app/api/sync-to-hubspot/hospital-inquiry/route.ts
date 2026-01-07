import { NextResponse } from "next/server";
import { hubspotFetch } from "@/lib/hubspot/helper";

export async function POST(req: Request) {
  try {
    const { record } = await req.json();

    const contact = await hubspotFetch("/crm/v3/objects/contacts", "POST", {
      properties: {
        firstname: record.name,
        phone: record.phone,
        lead_source: "Hospital Page",
      },
    });

    await hubspotFetch("/crm/v3/objects/deals", "POST", {
      properties: {
        dealname: `Hospital Inquiry – ${record.hospital_name}`,
        pipeline: "default",
        dealstage: "appointmentscheduled",
        hospital_name: record.hospital_name,
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
    console.error("Hospital inquiry sync failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

