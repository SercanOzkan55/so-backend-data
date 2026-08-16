# portfolio-contact-api

The backend behind the contact form on <https://sercanozkan55.github.io/Portfolio/contact/>.

**Live endpoint:** <https://portfolio-contact-api.portfolio-contact-api.workers.dev/api/contact>

One endpoint, one job: take a message from the form, check it, and hand it to
an email service that delivers it to my inbox.

```
Browser form  --POST JSON-->  Cloudflare Worker  --HTTPS-->  Resend API  --email-->  my inbox
                                    |
                                    +-- Workers KV (per-IP submission counter)
```

## Endpoint

`POST /api/contact`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "message": "…", "website": "" }
```

| Status | Meaning |
| --- | --- |
| 200 `{"ok":true}` | Accepted and handed to the mail service (also the answer to a filled honeypot, so bots learn nothing) |
| 400 | Validation failed — `error` is safe to show, `field` names the input |
| 403 | `Origin` is not on the allowlist |
| 405 / 404 | Wrong method or path |
| 413 | Body over 64 KB |
| 429 | More than 5 submissions from one IP in an hour |
| 502 | Resend rejected the message |

`GET /health` answers `{"ok":true,…}` for uptime checks.

## What protects it

- **Origin allowlist** — CORS headers are only returned for origins in `ALLOWED_ORIGINS`, so another site cannot post through a visitor's browser.
- **Honeypot** — a `website` field that people never see and bots usually fill.
- **Rate limit** — a fixed one-hour window per IP in Workers KV.
- **Size and shape limits** — 64 KB body cap, plus length checks on every field.
- **No secrets in the repo** — the Resend key is an encrypted Worker secret; provider errors are logged, never returned to the browser.

## Deploy (free tier)

Run everything from this directory.

1. **Resend account.** Sign up at <https://resend.com> with the same address the form should deliver to (`CONTACT_TO` in `wrangler.jsonc`). Without a verified custom domain, the `onboarding@resend.dev` sender may only deliver to the account's own address — which is exactly this use case. Create an API key with sending access and keep it somewhere safe.

2. **Cloudflare login.**

   ```bash
   npx wrangler login
   ```

3. **Create the rate-limit store** for a fresh Cloudflare account, then paste the printed
   `id` into `kv_namespaces` in `wrangler.jsonc`. This repository's live deployment is
   already wired to its own namespace:

   ```bash
   npx wrangler kv namespace create RATE_LIMIT_KV
   ```

4. **Deploy.** The output includes the live `workers.dev` URL.

   ```bash
   npx wrangler deploy
   ```

5. **Add the API key as an encrypted secret** (it is never written to a file in this repo):

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

6. **Point the site at it.** In `../build-site.mjs`, set `contactEndpoint` to the deployed
   `/api/contact` URL, then rebuild and push. The current build already points at the live
   Worker above:

   ```bash
   node ../build-site.mjs
   ```

7. **Send a real message** from the live contact page and confirm it arrives.

## Local development

```bash
cp .dev.vars.example .dev.vars   # then put a real key in it; the file is git-ignored
npm install
npm run dev                      # http://127.0.0.1:8787
npm test                         # validation unit tests
```

Point `contactEndpoint` in `build-site.mjs` at `http://127.0.0.1:8787/api/contact`, rebuild,
and serve the site from the repo's parent directory on port 8080 (an allowed origin):

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Reset the local rate-limit counter by deleting `.wrangler/state`.

## Cost

Cloudflare Workers and Workers KV both have a free daily allowance, and Resend has a
free monthly send allowance; a portfolio contact form uses a rounding error of either.
Current limits are on the Cloudflare and Resend pricing pages.
