import test from "node:test";
import assert from "node:assert/strict";
import { validateSubmission } from "../src/validate.js";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to talk about a backend role on our data platform team.",
};

test("accepts a well-formed submission and trims whitespace", () => {
  const result = validateSubmission({ ...valid, name: "  Ada Lovelace  " });

  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Ada Lovelace");
  assert.equal(result.data.email, "ada@example.com");
});

test("rejects a filled honeypot silently", () => {
  const result = validateSubmission({ ...valid, website: "http://spam.example" });

  assert.equal(result.ok, false);
  assert.equal(result.silent, true);
});

test("rejects a name shorter than two characters", () => {
  const result = validateSubmission({ ...valid, name: "A" });

  assert.equal(result.ok, false);
  assert.equal(result.field, "name");
});

test("rejects an address with no domain", () => {
  const result = validateSubmission({ ...valid, email: "ada@example" });

  assert.equal(result.ok, false);
  assert.equal(result.field, "email");
});

test("rejects a message under the minimum length", () => {
  const result = validateSubmission({ ...valid, message: "hi" });

  assert.equal(result.ok, false);
  assert.equal(result.field, "message");
});

test("rejects a message over the maximum length", () => {
  const result = validateSubmission({ ...valid, message: "x".repeat(4001) });

  assert.equal(result.ok, false);
  assert.equal(result.field, "message");
});

test("rejects a non-object body", () => {
  assert.equal(validateSubmission(null).ok, false);
  assert.equal(validateSubmission("name=Ada").ok, false);
});

test("rejects missing fields rather than throwing", () => {
  const result = validateSubmission({});

  assert.equal(result.ok, false);
  assert.equal(result.field, "name");
});
