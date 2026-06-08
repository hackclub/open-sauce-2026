import type { APIRoute } from "astro";
// getSecret reads env vars at runtime (not inlined at build time), so the key
// is never baked into the bundle and can be injected by the host on deploy.
import { getSecret } from "astro:env/server";

// Rendered on-demand by the Node adapter so the Airtable key stays server-side.
export const prerender = false;

// Good-enough email shape check; Airtable does no validation of its own.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

export const POST: APIRoute = async ({ request }) => {
    const BASE_ID = getSecret("AIRTABLE_BASE_ID");
    const TABLE_ID = getSecret("AIRTABLE_SIGNUPS_TABLE_ID");
    const API_KEY = getSecret("AIRTABLE_API_KEY");

    if (!BASE_ID || !TABLE_ID || !API_KEY) {
        console.error("Airtable env vars missing");
        return json({ error: "Signups are not configured." }, 500);
    }

    let email: unknown;
    try {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            email = (await request.json())?.email;
        } else {
            email = (await request.formData()).get("email");
        }
    } catch {
        return json({ error: "Invalid request body." }, 400);
    }

    email = typeof email === "string" ? email.trim() : "";
    if (!email || !EMAIL_RE.test(email as string)) {
        return json({ error: "Please enter a valid email." }, 400);
    }

    const res = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                records: [{ fields: { email } }],
                typecast: true,
            }),
        },
    );

    if (!res.ok) {
        console.error("Airtable error", res.status, await res.text());
        return json({ error: "Something went wrong. Try again later." }, 502);
    }

    return json({ ok: true }, 200);
};
