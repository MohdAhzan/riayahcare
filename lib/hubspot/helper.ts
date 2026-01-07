const HUBSPOT_BASE = "https://api.hubapi.com";

export async function hubspotFetch(
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
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export function parseAge(age: string | null) {
  if (!age) return null
  const n = parseInt(age, 10)
  return Number.isNaN(n) ? null : n
}

