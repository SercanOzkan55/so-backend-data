import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1));
const base = "/so-backend-data";
const repo = "https://github.com/SercanOzkan55/FlyRankHW";

const cases = [
  {
    slug: "smallest-backend", number: "01", title: "Smallest Possible Backend",
    strap: "Two endpoints. One useful first step.",
    summary: "A deliberately tiny Node.js server that makes the request-response cycle visible before frameworks or databases are added.",
    image: "repo-overview.png", stack: ["Node.js", "HTTP", "JSON"], folder: "w1",
    challenge: "Build the smallest complete backend: listen for a request, choose a route, and return structured data.",
    approach: ["Used Node's built-in HTTP server so the fundamentals stayed visible.", "Added GET / for a hello response and GET /time for live server time.", "Kept the run path to one command so the project is easy to inspect."],
    outcome: "A compact baseline for routing, status codes, headers, and JSON responses.",
    proof: "The repository includes the server, run script, endpoint documentation, and reproducible curl commands.",
    limitation: "The source pack has no recorded test run, automated tests, persistence, or deployment."
  },
  {
    slug: "postgres-task-service", number: "02", title: "PostgreSQL Task Service",
    strap: "Persistence without rewriting the service.",
    summary: "An Express and TypeScript task API that switches between memory and PostgreSQL without changing routes or business logic.",
    image: "a2-proof.png", stack: ["Express", "TypeScript", "PostgreSQL", "Docker"], folder: "a2",
    challenge: "Replace temporary memory storage with a real database while preserving the API contract.",
    approach: ["Defined a TaskRepository interface and made the service depend on the contract.", "Added a PostgreSQL implementation, pool, schema, and Docker Compose stack.", "Selected the repository from DATABASE_URL without changing routes or the service."],
    outcome: "Tasks survived full container removal and recreation because the data lived in a named volume.",
    proof: "Two tasks were created, both containers were recreated, and GET /tasks returned the same IDs and timestamps.",
    limitation: "Redis and the index / EXPLAIN ANALYZE stretch goals remain undone."
  },
  {
    slug: "sqlite-crud-api", number: "03", title: "SQLite CRUD API",
    strap: "A familiar API backed by a real file.",
    summary: "A task-management REST API using SQLite for zero-configuration relational persistence, filtering, sorting, statistics, and CRUD.",
    image: "repo-overview.png", stack: ["Node.js", "Express", "SQLite", "SQL"], folder: "a2-database",
    challenge: "Move a task API from memory into persistent SQL storage without changing the client interface.",
    approach: ["Created a tasks table with timestamps and an auto-incrementing key.", "Mapped SQLite integer values to JSON booleans at the API boundary.", "Added search, state filtering, sorting, statistics, and SQL verification queries."],
    outcome: "A documented CRUD surface backed by a single-file database that standard SQLite tools can inspect.",
    proof: "The source includes its schema, seed data, endpoint table, SQL checks, and a local test command.",
    limitation: "The current README contains an unresolved Git merge marker and should be rerun before being called fully verified."
  },
  {
    slug: "polite-web-scraper", number: "04", title: "Polite Web Scraper",
    strap: "Structured data, collected with restraint.",
    summary: "A modular scraper that checks robots.txt, rate-limits requests, cleans page values, and writes 1,000 book records as JSONL.",
    image: "a3-proof.png", stack: ["Node.js", "Cheerio", "JSONL", "robots.txt"], folder: "a3",
    challenge: "Turn catalogue pages into structured records while keeping crawl behavior respectful and reproducible.",
    approach: ["Separated fetching, robots rules, parsing, cleaning, configuration, and orchestration.", "Sent an identifying User-Agent and delayed every request by 300ms.", "Converted price, stock, rating, category, and description into typed fields."],
    outcome: "A complete run walks 50 listing pages and produces roughly 1,000 clean records.",
    proof: "The captured run log and output sample show the fetch → parse → extract → clean → structure pipeline.",
    limitation: "Production use would need retries, observability, and selector-change monitoring."
  },
  {
    slug: "supabase-auth-api", number: "05", title: "Supabase Auth API",
    strap: "Protected routes with server-side verification.",
    summary: "An Express and TypeScript API that delegates identity to Supabase, verifies tokens server-side, and documents the flow in Swagger UI.",
    image: "swagger-ui.png", stack: ["Express", "TypeScript", "Supabase Auth", "OpenAPI"], folder: "a4-auth",
    challenge: "Add signup, login, logout, and protected routes without storing passwords or trusting a locally decoded JWT.",
    approach: ["Forwarded credentials to Supabase Auth and used only its public anon key.", "Built middleware that extracts and verifies Bearer tokens with supabase.auth.getUser.", "Added OpenAPI docs and compared the implementation with an AI-generated rematch."],
    outcome: "Thirteen manual scenarios passed, including tampered-token rejection and post-logout revocation.",
    proof: "The README records each request and status; Swagger UI exposes public, auth, and protected endpoints.",
    limitation: "There is no automated test suite or verified public API deployment yet."
  }
];

function nav() {
  return `<header class="site-header"><a class="brand" href="${base}/"><span>SÖ</span><b>Sercan Özkan</b></a><nav aria-label="Primary"><a href="${base}/work/">Work</a><a href="${base}/about/">About</a><a href="${base}/contact/">Contact</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><small>Backend &amp; data portfolio</small><p>Decisions, evidence, and honest limits.</p></div><div><a href="${repo}">GitHub ↗</a> <a href="${base}/contact/">Contact</a></div><small>© 2026 SÖ</small></footer>`;
}
function shell(title, description, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Sercan Özkan</title><meta name="description" content="${description}"><link rel="stylesheet" href="${base}/assets/styles.css"><link rel="icon" href="${base}/assets/favicon.svg"></head><body>${nav()}<main>${body}</main>${footer()}</body></html>`;
}
function tags(items) { return `<ul class="tags">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; }
function card(c) {
  return `<article class="card"><a class="card-img" href="${base}/work/${c.slug}/"><img src="${base}/assets/images/${c.image}" alt="Evidence image for ${c.title}"></a><p class="mono stamp">Case ${c.number}</p><h2><a href="${base}/work/${c.slug}/">${c.title}</a></h2><p>${c.summary}</p>${tags(c.stack)}<a class="text-link" href="${base}/work/${c.slug}/">Open case study →</a></article>`;
}

const home = shell("Backend & Data Portfolio", "Backend and data case studies with evidence and honest limitations.", `
<section class="hero shell"><div><p class="kicker">● Available for backend &amp; data work</p><h1>Systems that make their evidence visible.</h1><p class="lede">I&apos;m Sercan Özkan, a backend-focused developer building APIs, databases, data pipelines, and authentication flows—and documenting what actually worked.</p><p class="actions"><a class="button dark" href="${base}/work/">See the work</a><a class="button" href="${base}/about/">How I build</a></p></div><img src="${base}/assets/images/social-preview.png" alt="Backend and data systems diagram"></section>
<section class="metrics"><div><b>05</b><span>documented projects</span></div><div><b>13</b><span>auth scenarios</span></div><div><b>1,000</b><span>records scraped</span></div><div><b>01</b><span>public portfolio</span></div></section>
<section class="section shell"><p class="eyebrow">Selected work</p><h2 class="display">Real builds, including the rough edges.</h2><div class="grid">${cases.slice(1,4).map(card).join("")}</div></section>
<section class="cta shell"><p class="eyebrow">Next conversation</p><h2>Have a system that needs a careful builder?</h2><a class="button light" href="${base}/contact/">Let&apos;s talk</a></section>`);

const work = shell("Work", "Five backend and data case studies.", `<section class="intro shell"><p class="eyebrow">Work / 2026</p><h1>Backend work is more convincing when the evidence travels with it.</h1><p>Five projects, from the smallest HTTP server to authentication against a live identity provider. Every case records the goal, decisions, proof, and unfinished work.</p></section><section class="section shell"><div class="grid two">${cases.map(card).join("")}</div></section>`);

const about = shell("About", "How Sercan Özkan approaches backend and data work.", `<section class="intro shell about"><div><p class="eyebrow">About</p><h1>I learn systems by building the smallest honest version, then testing the boundary.</h1></div><img src="${base}/assets/images/identity-kit-light.png" alt="Sercan Özkan identity kit"></section><section class="about-body shell"><div><p class="big">I&apos;m Sercan Özkan, a backend-focused developer interested in APIs, database persistence, authentication, and practical data pipelines.</p><p>My projects start small on purpose. I want to trace a request, understand where data lives, and know what fails before adding another layer.</p><p>AI helped me plan, question, and document this work. I still checked the source, ran important paths, recorded uncertainty, and kept the decisions explainable.</p></div><aside><p class="eyebrow">Still ugly</p><ul><li>The writing needs a tighter edit and more measured outcomes.</li><li>Two cases need dedicated proof images.</li><li>The SQLite README has an unresolved merge conflict.</li><li>There is no custom domain or analytics yet.</li><li>I used the identity kit instead of inventing a portrait.</li></ul></aside></section>`);

const contact = shell("Contact", "Contact Sercan Özkan about backend and data work.", `<section class="contact shell"><p class="eyebrow">Contact</p><h1>Let&apos;s talk about the system behind the screen.</h1><p>If you&apos;re working on an API, a database-backed product, or a data workflow—and value clear evidence over mystery—send me a note.</p><div class="contact-links"><a href="mailto:ozkansercan55@gmail.com"><small>Email</small><b>ozkansercan55@gmail.com</b><span>↗</span></a><a href="${repo}"><small>Code</small><b>github.com/SercanOzkan55</b><span>↗</span></a></div></section>`);

await writeFile(join(root, "index.html"), home);
for (const [folder, html] of [["work", work], ["about", about], ["contact", contact]]) {
  await mkdir(join(root, folder), { recursive: true });
  await writeFile(join(root, folder, "index.html"), html);
}
for (const c of cases) {
  const next = cases[(cases.indexOf(c) + 1) % cases.length];
  const body = `<article><header class="case-hero shell"><a class="mono back" href="${base}/work/">← All work</a><p class="eyebrow">Case ${c.number} / ${c.stack.join(" · ")}</p><h1>${c.title}</h1><p class="lede">${c.strap} ${c.summary}</p><a class="button" href="${repo}/tree/main/${c.folder}">Open source folder ↗</a></header><figure class="proof shell"><img src="${base}/assets/images/${c.image}" alt="Evidence for ${c.title}"><figcaption><span class="mono">Evidence</span>${c.proof}</figcaption></figure><div class="case-body shell"><aside><p class="eyebrow">Stack</p>${tags(c.stack)}</aside><div><section><p class="eyebrow">Challenge</p><h2>What needed to change</h2><p>${c.challenge}</p></section><section><p class="eyebrow">Approach</p><h2>How I built it</h2><ol>${c.approach.map(x=>`<li>${x}</li>`).join("")}</ol></section><section><p class="eyebrow">Result</p><h2>What landed</h2><p>${c.outcome}</p></section><section class="limit"><p class="eyebrow">Honest limitation</p><h2>What is not finished</h2><p>${c.limitation}</p></section></div></div></article><section class="next shell"><p class="eyebrow">Next case</p><a href="${base}/work/${next.slug}/">${next.title} <b>→</b></a></section>`;
  const dir = join(root, "work", c.slug); await mkdir(dir, {recursive:true});
  await writeFile(join(dir, "index.html"), shell(c.title, c.summary, body));
}
console.log("Built 9 public pages.");
