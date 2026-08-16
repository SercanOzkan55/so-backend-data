/**
 * Portfolio contact endpoint — Cloudflare Worker.
 *
 * Flow: browser POSTs JSON to /api/contact -> validate -> per-IP rate limit
 * in Workers KV -> hand the message to Resend's API -> Resend delivers the
 * email to my inbox -> the Worker answers JSON so the page can show a result.
 *
 * The Worker never stores the message itself; Resend is the only place the
 * body comes to rest, and the API key lives in an encrypted secret, not here.
 */

import { validateSubmission } from "./validate.js";

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT = { max: 5, windowSeconds: 3600 };

const json = (status, payload, origin) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(origin) },
  });

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Echo the caller's origin only when it is on the allowlist. Echoing blindly,
 * or answering `*`, would let any site post to this endpoint from a visitor's
 * browser and spend my send quota.
 */
function resolveOrigin(request, env) {
  const origin = request.headers.get("Origin");
  return origin && allowedOrigins(env).includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  if (!origin) return { vary: "Origin" };
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

/** Fixed-window counter per IP. Absent binding means no limiter, not an outage. */
async function overRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV) {
    console.warn("RATE_LIMIT_KV binding missing — submissions are not rate limited");
    return false;
  }
  const key = `contact:${ip}`;
  const used = Number((await env.RATE_LIMIT_KV.get(key)) || 0);
  if (used >= RATE_LIMIT.max) return true;
  // expirationTtl is only reset on the first write of a window, so the window
  // stays fixed at one hour instead of sliding forward with every attempt.
  await env.RATE_LIMIT_KV.put(key, String(used + 1), {
    expirationTtl: used === 0 ? RATE_LIMIT.windowSeconds : undefined,
  });
  return false;
}

/** Header fields must stay single-line: newlines are how header injection starts. */
const oneLine = (value) => value.replace(/[\r\n]+/g, " ").trim();

async function sendEmail(env, { name, email, message }, meta) {
  const body = {
    from: env.CONTACT_FROM,
    to: [env.CONTACT_TO],
    reply_to: oneLine(email),
    subject: `Portfolio contact — ${oneLine(name)}`,
    text: [
      `Name:    ${oneLine(name)}`,
      `Email:   ${oneLine(email)}`,
      `Sent:    ${meta.at}`,
      `From IP: ${meta.ip}`,
      "",
      message,
    ].join("\n"),
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Logged for me, never returned: provider errors can quote the API key
    // context or the recipient, and the visitor needs none of it.
    console.error("resend failed", res.status, await res.text());
    return false;
  }
  return true;
}

export default {
  async fetch(request, env) {
    const origin = resolveOrigin(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (url.pathname === "/health") {
      return json(200, { ok: true, service: "portfolio-contact-api" }, origin);
    }
    if (url.pathname !== "/api/contact") {
      return json(404, { ok: false, error: "Not found." }, origin);
    }
    if (request.method !== "POST") {
      return json(405, { ok: false, error: "Use POST." }, origin);
    }
    if (!origin) {
      return json(403, { ok: false, error: "Origin not allowed." }, null);
    }
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: "Message is too large." }, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(400, { ok: false, error: "Body must be JSON." }, origin);
    }

    const check = validateSubmission(payload);
    if (!check.ok) {
      // The honeypot path answers like a success so bots gain no signal.
      if (check.silent) return json(200, { ok: true }, origin);
      return json(400, { ok: false, error: check.error, field: check.field }, origin);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (await overRateLimit(env, ip)) {
      return json(429, { ok: false, error: "Too many messages from this address. Try again in an hour." }, origin);
    }

    const sent = await sendEmail(env, check.data, { ip, at: new Date().toISOString() });
    if (!sent) {
      return json(502, { ok: false, error: "The mail service rejected the message. Please email me directly." }, origin);
    }

    return json(200, { ok: true }, origin);
  },
};
