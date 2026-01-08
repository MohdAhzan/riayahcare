import { NextResponse } from "next/server";
import { hubspotFetch  } from "@/lib/hubspot/helper";

export async function POST(req: Request) {
  try {
    const { record } = await req.json();

    /* -----------------------------
       1. CREATE CONTACT
    ------------------------------ */
    const contact = await hubspotFetch(
      "/crm/v3/objects/contacts",
      "POST",
      {
        properties: {
          firstname: record.patient_name,
          phone: record.phone,
          city: record.city || "",
          state: record.state || "",
          country: record.country, 
          medical_specialty: record.specialty,

          medical_problem: record.medical_problem,
          patient_age: record.age,
          patient_gender: record.gender,
          medical_report_url: record.medical_report_url || "",
          //lead_source: "RiayahCare Website",
        },
      }
    );

    /* -----------------------------
       2. CREATE DEAL
    ------------------------------ */
    await hubspotFetch(
      "/crm/v3/objects/deals",
      "POST",
      {
        properties: {
          dealname: record.procedure
            ? `Procedure Inquiry – ${record.procedure}`
            : `General Inquiry – ${record.patient_name}`,
          pipeline: "default",
          dealstage: "appointmentscheduled", // change later
        },
        associations: [
          {
            to: { id: contact.id },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 3, // Contact ↔ Deal
              },
            ],
          },
        ],
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quote request sync failed:", err);
    return NextResponse.json(
      { error: "Quote request sync failed" },
      { status: 500 }
    );
  }
}

