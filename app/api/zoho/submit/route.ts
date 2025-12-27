import { NextRequest, NextResponse } from "next/server";
import { getZohoAccessToken } from "@/lib/zoho/zoho";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    const portalName = "gsirkahzanpkmgm1";
    const formLinkName = process.env.ZOHO_FORM_LINK_NAME!;

    const apiURL = `https://forms.zoho.in/api/v2/${portalName}/${formLinkName}/submit`;

    console.log("🚀 Zoho URL:", apiURL);

    const formBody = new URLSearchParams({
      patient_name: body.patient_name,
      country: body.country,
      state: body.state,
      city: body.city,
      phone: body.phone,
      medical_problem: body.medical_problem,
      age: body.age,
      gender: body.gender,
      specialty: body.specialty,
      medical_report_url: body.medical_report_url || "",
    });

    const res = await fetch(apiURL, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("❌ ZOHO ERROR:", text);
      return NextResponse.json(
        { error: "Zoho rejected submission", details: text },
        { status: res.status }
      );
    }

    console.log("✅ Zoho Success:", text);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



//// app/api/zoho/submit/route.ts
//
//import { NextRequest, NextResponse } from "next/server";
//import { getZohoAccessToken } from "@/lib/zoho/zoho";
//
//export async function POST(req: NextRequest) {
//  try {
//    const body = await req.json(); 
//    const accessToken = await getZohoAccessToken();
//
//    // 1. Map to Zoho's structure
//    const zohoData = {
//      patient_name: body.patient_name,
//      country: body.country,
//      state: body.state,
//      city: body.city,
//      phone: body.phone,
//      medical_problem: body.medical_problem,
//      age: body.age,
//      gender: body.gender,
//      specialty: body.specialty,
//      medical_report_url: body.medical_report_url
//    };
//
//    // 2. Wrap in FormData as required by Zoho API v2
//    const zohoForm = new FormData();
//    zohoForm.append("data", JSON.stringify(zohoData));
//
//    // 3. Request to Zoho
//    const res = await fetch(
//      `https://forms.zoho.in/api/v2/${process.env.ZOHO_FORM_LINK_NAME}/submissions`,
//      {
//        method: "POST",
//        headers: {
//          Authorization: `Zoho-oauthtoken ${accessToken}`
//        },
//        body: zohoForm
//      }
//    );
//
//    const result = await res.json();
//
//    // 4. Enhanced Error Logging
//    if (!res.ok) {
//      // THIS LOG WILL SHOW IN YOUR TERMINAL (NOT BROWSER)
//      console.error("❌ ZOHO API REJECTION:", JSON.stringify(result, null, 2));
//
//      // Return the full result so the frontend can see it
//      return NextResponse.json(result, { status: res.status });
//    }
//
//    console.log("✅ Zoho Submission Successful");
//    return NextResponse.json({ success: true });
//
//  } catch (err: any) {
//    console.error("❌ SERVER-SIDE CRASH:", err);
//    return NextResponse.json(
//      { error: "Server error", details: err.message }, 
//      { status: 500 }
//    );
//  }
//}


////app/api/zoho/submit/route.ts
//
//import { NextRequest, NextResponse } from "next/server";
//import { getZohoAccessToken } from "@/lib/zoho/zoho";
//
//export async function POST(req: NextRequest) {
//  try {
//    const formData = await req.formData();
//    const accessToken = await getZohoAccessToken();
//
//    const zohoData = {
//      patient_name: formData.get("name"),
//      country: formData.get("country"),
//      state: formData.get("state"),
//      city: formData.get("city"),
//      phone: formData.get("phone"),
//      medical_problem: formData.get("concern"),
//      age: formData.get("age"),
//      gender: formData.get("gender"),
//      specialty: formData.get("specialty"),
//      medical_report_url: formData.get("report") // optional file
//    };
//
//    const zohoForm = new FormData();
//    zohoForm.append("data", JSON.stringify(zohoData));
//
//    // Optional file upload
//    const file = formData.get("report") as File | null;
//    if (file) {
//      zohoForm.append("upload", file);
//    }
//
//    const res = await fetch(
//      `https://forms.zoho.in/api/v2/${process.env.ZOHO_FORM_LINK_NAME}/submissions`,
//      {
//        method: "POST",
//        headers: {
//          Authorization: `Zoho-oauthtoken ${accessToken}`
//        },
//        body: zohoForm
//      }
//    );
//
//    const result = await res.json();
//
//    if (!res.ok) {
//      console.error("Zoho error:", result);
//      return NextResponse.json({ error: "Zoho failed" }, { status: 500 });
//    }
//
//    return NextResponse.json({ success: true });
//
//  } catch (err) {
//    console.error(err);
//    return NextResponse.json({ error: "Server error" }, { status: 500 });
//  }
//}
//
