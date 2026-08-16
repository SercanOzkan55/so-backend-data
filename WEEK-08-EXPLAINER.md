# Week 08 — Make it do something

**The one feature:** a working contact form on
<https://sercanozkan55.github.io/Portfolio/contact/>.
You type a message, press send, and it lands in my email inbox.

**Live URL of the feature:** https://sercanozkan55.github.io/Portfolio/contact/
**The backend:** `https://portfolio-contact-api.portfolio-contact-api.workers.dev/api/contact`
(source in [`contact-api/`](contact-api/))
**Evidence to attach:** a screenshot of the "Message sent" state on the live page, plus a
screenshot of the email as it arrived in my inbox. Those two images prove both halves of
the same feature: the browser got a success response, and the message actually arrived.

**Verification record — 16 August 2026:** the live GitHub Pages origin posted a real message
to the deployed Worker. The Worker validated it, passed the KV rate-limit check, Resend
accepted it, and the endpoint returned `200 {"ok":true}`. The final thread evidence is the
matching email in my inbox; I attach that screenshot beside the live success state.

---

## What a backend is, in plain words

My portfolio was a stack of files. A browser asks GitHub Pages for a page, GitHub Pages
sends the file back, and that is the whole conversation. Files cannot do anything. A file
cannot check whether an email address is real, and it certainly cannot send me an email —
if it could, anyone reading the page could read how it does it, including the password
that lets it send mail.

A backend is a program that runs on a computer I control instead of inside the visitor's
browser. The browser cannot see its code and cannot see its secrets. It sits at a web
address, waits to be spoken to, decides what to do with what it is handed, and answers.
That is the entire idea. Everything else is detail.

The practical line is this: anything that has to be trusted, or has to hold a secret, or
has to reach out to another service on my behalf, has to live on the backend. A form on a
static page can collect words. Only a backend can be trusted with what happens next.

## What my feature does

The contact page now has a real form: name, email, message. When you press **Send
message**, the page does not reload and does not open your mail app. It sends what you
typed to my own small program running on Cloudflare's network, and that program arranges
for the email to reach me. The page then tells you what happened — sent, or something went
wrong and here is my address instead.

I chose this over a "mailto:" link because a mailto link only works if the visitor has a
mail app set up, and it drops silently for a lot of people on a lot of devices. A form that
posts to my own endpoint works for everyone, and I can see when it breaks.

## How the data flows

1. **You type and press send.** A small script on the page collects the three fields into a
   little bundle of text called JSON and sends it over HTTPS to my endpoint. HTTPS means
   the message is encrypted while it travels, so the networks in between see that you
   contacted me but not what you wrote.

2. **My endpoint answers.** It is a Cloudflare Worker: a small program with a public web
   address that only wakes up when a request arrives. There is no server sitting idle and
   no server for me to maintain.

3. **It checks who is asking.** Browsers attach the address of the page that made the
   request. My Worker only accepts requests from my own site. Without this, another website
   could quietly use my endpoint — and my mail quota — from its visitors' browsers.

4. **It checks the message.** Name between 2 and 80 characters, an email address that has
   the shape of one, a message between 20 and 4,000 characters. There is also a fourth
   field on the page that is hidden from people. Automated spam scripts fill in every field
   they find, so anything arriving with that field filled is a bot. The bot gets a cheerful
   "sent" and the message goes nowhere — if I told it the truth, it would just try again
   with the field left empty.

5. **It checks how often you have written.** The Worker keeps a small counter per internet
   address in Cloudflare's key-value store: five messages an hour. Past that, it answers
   "too many, try later". This is what stops one script from turning my inbox and my free
   send quota into a bonfire overnight.

6. **It hands the message to an email service.** The Worker does not send email itself —
   sending mail that actually arrives is a full-time problem involving reputation and spam
   filtering, and it is not the problem I am solving. It calls Resend, an email service,
   over HTTPS, with a secret key that proves the request is mine. That key is stored
   encrypted at Cloudflare. It is not in my code, not in my public repository, and never
   sent to the browser. My reply-to is set to your address, so I can just hit reply.

7. **Resend delivers the email to my inbox**, and the Worker answers the page with a short
   yes or no. The script turns that into the line you see under the button. If the mail
   service ever refuses, you see "please email me directly", never the raw error — error
   messages leak more about a system than most people expect.

The message itself is never stored by me. The Worker holds it only for the moment it takes
to pass it on; the copy that comes to rest is the email in my inbox.

## What it costs

Nothing. Cloudflare Workers and their key-value store both have a free daily allowance,
Resend has a free monthly allowance for sending, and GitHub Pages hosts the site. A
portfolio contact form does not come close to any of those ceilings.

## What I would fix next

- The `onboarding@resend.dev` sender is a test sender, so it can only deliver to my own
  address. That is enough for a contact form, but a custom domain would make it a proper
  `hello@` sender and improve deliverability.
- The rate limit counts by internet address, which is a blunt instrument: people behind the
  same office network share one.
- The Worker keeps no record of its own. If Resend ever accepts a message and then loses
  it, I have no second copy to check against.
- The form has no automated end-to-end test. I verified it by hand: unit tests on the
  validation rules, curl against every response path, and a real submission from the live
  site.

## Thread post

> **Week 08 — one thing that actually works.** My portfolio's contact form is live and
> wired end to end: the page posts to a Cloudflare Worker I wrote, the Worker validates the
> message, rate-limits by IP and hands it to Resend, and the email arrives in my inbox. All
> free tier. Screenshots below: the "Message sent" state on the live page, and the email as
> it landed. The plain-words explainer of what a backend is and how the data flows is in
> the post that follows. Try it: https://sercanozkan55.github.io/Portfolio/contact/
