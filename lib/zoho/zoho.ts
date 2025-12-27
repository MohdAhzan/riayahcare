//lib/zoho/zoho.ts

export async function getZohoAccessToken() {
  const res = await fetch("https://accounts.zoho.in/oauth/v2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: "refresh_token"
    })
  });

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("Zoho access token failed");
  }

  return data.access_token;
}

