/**
 * Pure request-body validation for the contact endpoint.
 *
 * Kept separate from the fetch handler so it can be unit-tested without a
 * Workers runtime, and so the handler stays a thin transport layer.
 */

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 20, max: 4000 },
};

// Deliberately loose: the only address that matters is one a human can reply
// to, and every stricter regex on the internet rejects valid mailboxes.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @returns {{ok: true, data: {name: string, email: string, message: string}}
 *          | {ok: false, error: string, field?: string, silent?: boolean}}
 */
export function validateSubmission(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a JSON object." };
  }

  // Honeypot: a field hidden from people and irresistible to form bots.
  // Filled means bot, and the caller answers 200 anyway — a bot that learns
  // it was rejected just comes back with the field left empty.
  if (asString(body.website)) {
    return { ok: false, error: "Rejected.", silent: true };
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const message = asString(body.message);

  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    return { ok: false, field: "name", error: `Name must be ${LIMITS.name.min}-${LIMITS.name.max} characters.` };
  }
  if (email.length > LIMITS.email.max || !EMAIL.test(email)) {
    return { ok: false, field: "email", error: "That email address does not look valid." };
  }
  if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) {
    return { ok: false, field: "message", error: `Message must be ${LIMITS.message.min}-${LIMITS.message.max} characters.` };
  }

  return { ok: true, data: { name, email, message } };
}
