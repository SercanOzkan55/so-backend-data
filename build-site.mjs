import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1));
const base = "/so-backend-data";
const site = `https://sercanozkan55.github.io${base}`;
const repo = "https://github.com/SercanOzkan55";
const linkedin = "https://www.linkedin.com/in/sercan-%C3%B6zkan-a205852a7/";
const cv = `${base}/assets/Sercan_Ozkan_CV_EN.pdf`;
const email = "ozkansercan55@gmail.com";
const booking = `mailto:${email}?subject=Portfolio%20conversation%20request`;

/* ------------------------------------------------------------------ *
 * Architecture diagrams
 * Hand-drawn SVG so they inherit the site palette, stay crisp at any
 * width, and need no image assets.
 * ------------------------------------------------------------------ */

function svgBox(x, y, w, h, label, sub, variant = "") {
  const cx = x + w / 2;
  const labelY = sub ? y + h / 2 - 2 : y + h / 2 + 5;
  return `<g class="dg-node ${variant}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>` +
    `<text x="${cx}" y="${labelY}" class="dg-label">${label}</text>` +
    (sub ? `<text x="${cx}" y="${y + h / 2 + 15}" class="dg-sub">${sub}</text>` : "") + `</g>`;
}
function svgArrow(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dg-arrow" marker-end="url(#dg-head)"/>`;
}
function svgWrap(viewBox, inner, title) {
  return `<svg viewBox="${viewBox}" role="img" aria-label="${title}" class="diagram">` +
    `<defs><marker id="dg-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">` +
    `<path d="M0,0 L10,5 L0,10 z" class="dg-headfill"/></marker></defs>${inner}</svg>`;
}

const diagrams = {
  "cv-analyzer": svgWrap("0 0 940 380", [
    `<text x="0" y="16" class="dg-tier">CLIENTS</text>`,
    svgBox(0, 30, 190, 64, "Web portal", "React + Vite"),
    svgBox(0, 106, 190, 64, "Mobile", "Expo React Native"),
    svgBox(0, 182, 190, 64, "Local worker", "PySide6 / QML", "dg-accent"),
    `<text x="375" y="16" class="dg-tier">GATEWAY</text>`,
    svgBox(375, 60, 190, 132, "FastAPI", "REST · auth · quotas", "dg-primary"),
    svgBox(375, 236, 190, 64, "Celery workers", "async batches"),
    `<text x="750" y="16" class="dg-tier">STATE</text>`,
    svgBox(750, 30, 190, 56, "PostgreSQL", ""),
    svgBox(750, 98, 190, 56, "Redis", "queue + cache"),
    svgBox(750, 166, 190, 56, "S3 storage", ""),
    svgBox(750, 234, 190, 56, "LLM providers", "fallback only", "dg-accent"),
    svgArrow(190, 62, 373, 100), svgArrow(190, 138, 373, 126), svgArrow(190, 214, 373, 152),
    svgArrow(565, 90, 748, 58), svgArrow(565, 112, 748, 126),
    svgArrow(565, 140, 748, 194), svgArrow(565, 165, 748, 262),
    svgArrow(470, 192, 470, 234),
    svgArrow(565, 268, 748, 200),
    `<text x="0" y="345" class="dg-note">The local worker syncs only when the user asks; the LLM is a fallback, not the default path</text>`,
  ].join(""), "CV Analyzer architecture"),

  siliqon: svgWrap("0 0 940 300", [
    svgBox(0, 30, 175, 64, "React panels", "palette · code · scope"),
    svgBox(0, 130, 175, 64, "PixiJS scene", "breadboard · wires", "dg-accent"),
    svgBox(255, 80, 175, 64, "Netlist builder", "union-find nodes", "dg-primary"),
    svgBox(510, 20, 175, 64, "MNA solver", "Newton-Raphson"),
    svgBox(510, 110, 175, 64, "Transient step", "backward Euler 200 µs"),
    svgBox(510, 200, 175, 64, "MCU interpreter", "C subset, generators"),
    svgBox(765, 80, 175, 64, "Instruments", "scope · meter · logic"),
    svgArrow(175, 62, 253, 100), svgArrow(175, 162, 253, 128),
    svgArrow(430, 100, 508, 60), svgArrow(430, 112, 508, 142), svgArrow(430, 124, 508, 226),
    svgArrow(685, 52, 763, 100), svgArrow(685, 142, 763, 112), svgArrow(685, 232, 763, 128),
    `<text x="255" y="175" class="dg-note">400 holes collapse to 3–6 active nodes</text>`,
    `<text x="510" y="290" class="dg-note">Solver runs in a Web Worker; falls back to the main thread</text>`,
  ].join(""), "Siliqon simulation pipeline"),

  "vr-teacher": svgWrap("0 0 940 320", [
    `<text x="0" y="16" class="dg-tier">UNITY VR CLIENT</text>`,
    svgBox(0, 30, 175, 60, "Microphone", "student question"),
    svgBox(0, 210, 175, 60, "Avatar", "lip-synced reply", "dg-accent"),
    svgBox(230, 30, 175, 60, "Whisper", "speech to text"),
    svgBox(230, 210, 175, 60, "Azure TTS", "Turkish neural voice"),
    `<text x="460" y="16" class="dg-tier">FASTAPI BACKEND</text>`,
    svgBox(460, 30, 190, 60, "Retriever", "top-5 chunks", "dg-primary"),
    svgBox(460, 120, 190, 60, "ChromaDB", "9 documents indexed"),
    svgBox(460, 210, 190, 60, "Grounded answer", "cites its source"),
    svgBox(720, 120, 220, 60, "Evaluation harness", "faithfulness · latency"),
    svgArrow(175, 60, 228, 60), svgArrow(405, 60, 458, 60),
    svgArrow(555, 90, 555, 118), svgArrow(555, 180, 555, 208),
    svgArrow(458, 240, 407, 240), svgArrow(228, 240, 177, 240),
    svgArrow(650, 150, 718, 150),
    `<text x="0" y="300" class="dg-note">No retrieved context, no answer: the model must say the material does not cover it</text>`,
  ].join(""), "VR Teacher retrieval and voice loop"),
};

/* ------------------------------------------------------------------ *
 * Case studies
 * ------------------------------------------------------------------ */

const cases = [
  {
    slug: "cv-analyzer", number: "01", title: "CV Analyzer",
    kind: "AI PRODUCT", featured: true,
    strap: "Deterministic where it can be, AI where it must be.",
    oneLine: "AI-powered resume intelligence platform",
    summary: "A hybrid resume-intelligence platform for ATS analysis, recruiter workflows, CV building, and privacy-first local processing.",
    image: "cv-analyzer.png",
    stack: ["Python", "FastAPI", "React", "PostgreSQL", "Redis", "Celery"],
    chips: ["185 endpoints", "900+ tests", "4 runtimes"],
    role: "Solo — backend, web portal, mobile scaffold, desktop worker",
    activity: "Mar – Jul 2026 · 253 commits",
    status: "Live at cvanalyzer.dev",
    repoUrl: "https://github.com/SercanOzkan55/CV-Analyzer",
    liveUrl: "https://cvanalyzer.dev",
    problem: "Parse any résumé layout reliably without paying an LLM for every document.",
    challenge: "Analyze varied resume formats, produce explainable ATS feedback, and support recruiter-scale workflows without sending every document to an LLM.",
    approach: [
      "Built a deterministic extraction and normalization pipeline first, and put a fragmentation quality gate in front of the LLM so a model is only paid for when the deterministic parse actually falls apart.",
      "Split the product into four runtimes over one domain model: a FastAPI gateway, a React portal, an Expo mobile client, and a PySide6 desktop worker that keeps sensitive batches on the user's own machine until a sync is explicitly requested.",
      "Moved large batch processing onto Celery and Redis so a recruiter uploading hundreds of CVs never blocks the request path, with plan-based quotas and JWT auth guarding the gateway.",
    ],
    decisions: [
      ["Deterministic parser before the LLM", "A rules-based parse is reproducible, free, and debuggable. The LLM is a fallback for shredded layouts, not the default path — which keeps both cost and variance down."],
      ["Celery + Redis instead of request-time work", "Batch résumé processing is measured in minutes, not milliseconds. Pushing it to workers keeps the API responsive and makes retries a queue concern rather than a user-facing failure."],
      ["A local desktop worker beside the SaaS", "Some organizations cannot upload candidate documents at all. Processing locally and syncing only on request turns a hard blocker into a deployment option."],
    ],
    testing: "800+ backend tests under pytest, including golden fixtures that pin known résumé shapes against regressions, 100 frontend component and page tests under Vitest, and 12 CI checks on every pull request — tests, lint, frontend, mobile, docker, benchmark, local worker, security, secret scan, and both dependency audits.",
    outcome: "The documented system spans four runtimes, 185 endpoints across 14 routers, recruiter and candidate workflows, multiple document renderers, and a regression suite that has to pass before anything merges.",
    proof: "The public repository includes architecture diagrams, implementation guides, security controls, a detailed test plan, and real interface captures.",
    limitation: "The project is source-available for portfolio review rather than open source, and its production architecture depends on several managed services, so a one-command local run is not the whole picture.",
  },
  {
    slug: "siliqon", number: "02", title: "Siliqon",
    kind: "SIMULATION",
    strap: "An electronics laboratory that runs entirely in the browser.",
    oneLine: "Browser-based circuit simulation lab",
    summary: "A visual breadboard simulator with real-time analog solving, measurement instruments, guided lessons, deterministic safety warnings, and Arduino-style programming.",
    image: "siliqon-app.png",
    stack: ["TypeScript", "React", "PixiJS", "Web Worker", "Supabase", "Vitest"],
    chips: ["295 tests", "40+ components", "6 boards"],
    role: "Solo — simulation engine, interpreter, UI, cloud sync",
    activity: "Jul – Aug 2026 · 44 commits",
    status: "Private, no public deployment",
    repoUrl: null,
    liveUrl: null,
    problem: "Keep a drag-and-drop breadboard visually loose but electrically exact — and fast enough to solve every frame.",
    challenge: "Make circuit building feel visual and immediate while keeping electrical connectivity and simulation behavior technically consistent.",
    approach: [
      "Kept the visual world and the electrical world separate: where a wire is drawn never decides which pins share a node. Connectivity comes from declared breadboard strips, leg insertions, and user wires, merged by union-find. Nodes connected to no device are dropped from the matrix, so a 400-hole breadboard collapses to three to six nodes and real-time solving becomes possible.",
      "Solved analog behavior with modified nodal analysis and Newton-Raphson, using Shockley and Ebers-Moll device models with SPICE-style junction limiting and a gmin homotopy fallback, then stepped it through time with backward Euler at 200 µs inside a Web Worker.",
      "Wrote a C-subset microcontroller interpreter on a generator-based evaluator, so delay() and millis() suspend the program and hand time back to the circuit solver instead of blocking it.",
      "Put a deterministic rule engine in front of the AI assistant: missing supply, unlimited LED current, reverse polarity, over-current and short-circuit checks run without an LLM, and the assistant explains causes rather than repeating findings.",
    ],
    decisions: [
      ["Union-find netlist instead of geometric guessing", "If connectivity were inferred from pixel positions, every visual tweak would risk changing the circuit. Declaring strips and insertions makes the electrical model independent of how the scene is drawn."],
      ["Pruning nodes before the matrix", "A 400-hole breadboard would produce a matrix far too large to solve per frame. Dropping nodes no device touches is what makes the solver real-time rather than a batch job."],
      ["An interpreter, not an AVR emulator", "Real emulation would be cycle-accurate but opaque and slow to integrate. A generator-based interpreter can pause inside delay() and hand control to the solver, which is what interactive teaching actually needs."],
      ["Rules before the model", "Burning an LED or shorting a supply is a safety lesson, not a language task. Those checks are deterministic code, so they hold even with the assistant switched off."],
    ],
    testing: "295 Vitest tests covering the strip map and node pruning, Ohm and Kirchhoff validation, RC and RL time constants, transistor saturation and cutoff, logic families and flip-flop edge capture, comparator hysteresis, UART, I²C and SPI decoding, AC sweeps against known cutoff and resonance, plus every prepared experiment built and solved and every lesson completed through its own solution circuit.",
    outcome: "The build ships 32 prepared experiments, six development boards from Uno to STM32, more than forty component models, oscilloscope, multimeter and a logic analyzer that decodes UART, I²C and SPI, small-signal AC sweeps with Bode magnitude and phase, and step-by-step lessons whose checks read the actual circuit so a step only passes when the wiring is right.",
    proof: "The running lab: a traffic-light experiment loaded from the catalogue, solving in 9.1 ms per step across 25 nodes with the deterministic circuit analysis reporting a clean board.",
    limitation: "There is no public deployment yet, so the work cannot be tried from a link, and the repository stays private. The interpreter is a C-like subset rather than real AVR emulation, browser-local project storage is not durable, and the AI assistant needs a Supabase Edge Function and an OpenAI key before it will run.",
  },
  {
    slug: "vr-teacher", number: "03", title: "VR Teacher",
    kind: "IMMERSIVE AI",
    strap: "An AI-supported electronics teacher inside a virtual classroom.",
    oneLine: "AI-powered VR education, grounded in course material",
    summary: "A Unity VR learning environment that explains experiment sheets, answers grounded voice questions, and guides interactive breadboard work.",
    image: "vr-teacher-cover.svg",
    stack: ["Unity", "C#", "FastAPI", "ChromaDB", "Whisper", "Azure TTS"],
    chips: ["RAG + voice", "9 documents", "6 eval metrics"],
    role: "Solo — Unity client, RAG backend, evaluation harness",
    activity: "Jul – Aug 2026 · 187 commits",
    status: "Private prototype",
    repoUrl: null,
    liveUrl: null,
    problem: "Let a VR teacher answer freely asked questions without drifting away from the course material.",
    challenge: "Join immersive interaction, grounded teaching content, voice input, and circuit practice without letting the AI drift away from the selected experiment sheet.",
    approach: [
      "Built the classroom and electronics-lab client in Unity with OpenXR and the XR Interaction Toolkit, transcribing questions with Whisper and speaking answers through an Azure Turkish neural voice whose amplitude drives the avatar's mouth blendshape.",
      "Chose retrieval over fine-tuning for a nine-document corpus: PyMuPDF extraction, 500-token chunks with 50-token overlap, embeddings in a persisted ChromaDB collection, and top-five retrieval at query time.",
      "Constrained the model to the retrieved context, required it to cite the source document, and made it answer \"this topic is not covered in the course materials\" rather than improvise — the anti-hallucination boundary is a prompt contract, not a hope.",
      "Added an experiment-sheet service, an answer cache, a question log, and a token optimizer so repeated classroom questions do not re-pay for the same retrieval and generation.",
    ],
    decisions: [
      ["Retrieval instead of fine-tuning", "Nine PDFs are nowhere near a training set, fine-tuning costs money per iteration, and a new experiment sheet would mean retraining. Re-embedding one document takes seconds and keeps answers traceable to a page."],
      ["Text-to-speech on the client, not the server", "Generating audio in the backend would double the response payload and add a round trip before the avatar can start speaking. Keeping it in Unity keeps the backend focused on retrieval."],
      ["An evaluation harness from the start", "\"It sounded right\" is not a measurement. Scoring faithfulness, context precision and retrieval recall is what will make a later quality claim defensible — which is also why no score is claimed yet."],
    ],
    testing: "An evaluation harness scores answer relevance, faithfulness, correctness, context precision, latency and retrieval recall at five, driven through its own API endpoints against a ground-truth test set.",
    outcome: "Nine experiment documents are ingested and queryable, and the full loop runs: spoken question, transcription, retrieval, grounded answer with sources, spoken reply from a lip-synced avatar.",
    proof: "The private repository holds the Unity project, the FastAPI backend, the architecture document with the RAG and evaluation design, the experiment corpus, and the benchmark test set.",
    limitation: "The evaluation harness is built but not yet reported: the test set holds fifteen question-answer pairs and no benchmark run is recorded, so no quality number is claimed here. Headset usability and learning outcomes are likewise unmeasured, and the project stays a private prototype.",
  },
];

const metrics = [
  ["185", "API endpoints"],
  ["1,190+", "automated tests"],
  ["12", "CI checks per PR"],
  ["40+", "simulation components"],
];

const experience = {
  role: "Intern Software Engineer",
  org: "Daşal Havacılık",
  place: "Istanbul",
  period: "Jul – Aug 2025",
  lines: [
    "Compared RTSP, RTP/RTCP and TCP versus UDP transports for low-latency drone video, then ran them in live streaming tests.",
    "Stood up an RTSP server, streamed live camera feeds over Wi-Fi, and exercised the pipelines with FFmpeg, GStreamer and VLC.",
    "Measured end-to-end latency, analyzed packet loss and network stability, and tuned bitrate and resolution against the results.",
    "Debugged camera connectivity on the ground control station, contributed to C++ stream and GUI integration, and left a handover document so the next intern could repeat the measurements.",
  ],
  tags: ["RTSP", "RTP/RTCP", "FFmpeg", "GStreamer", "C++", "Latency testing"],
};

const process = [
  ["01", "Define", "Name the user, the core job, and what the system must never assume."],
  ["02", "Architect", "Draw the boundaries first: what is deterministic, what is a service, what is allowed to fail."],
  ["03", "Build", "Connect real data and make one complete path work before adding breadth."],
  ["04", "Test", "Pin the behavior that matters, including the failure modes, so regressions surface before users do."],
  ["05", "Measure", "Record what the system actually does, and say plainly where a number does not exist yet."],
];

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

function nav() {
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="${base}/"><span>SÖ</span><b>Sercan Özkan</b></a><nav aria-label="Primary"><a href="${base}/work/">Work</a><a href="${base}/#experience">Experience</a><a href="${base}/about/">About</a><a href="${base}/contact/">Contact</a><a class="nav-cv" href="${cv}">CV ↗</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><small>Backend &amp; AI engineering</small><p>Decisions, evidence, and honest limits.</p></div><div><a href="${linkedin}">LinkedIn ↗</a> <a href="${repo}">GitHub ↗</a> <a href="${cv}">CV ↗</a> <a href="${base}/contact/">Contact</a></div><small>© 2026 SÖ</small></footer>`;
}

const personSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sercan Özkan",
  jobTitle: "Backend & AI Software Engineer",
  url: `${site}/`,
  email: `mailto:${email}`,
  sameAs: [linkedin, repo],
  knowsAbout: ["Backend engineering", "FastAPI", "PostgreSQL", "Retrieval-augmented generation", "Circuit simulation", "Unity XR"],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Istanbul Health and Technology University" },
});

function shell(title, description, body, path = "/") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Sercan Özkan</title><meta name="description" content="${description}"><link rel="canonical" href="${site}${path}"><meta property="og:title" content="${title} | Sercan Özkan"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:url" content="${site}${path}"><meta property="og:image" content="${site}/assets/images/social-preview-v2.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${site}/assets/images/social-preview-v2.png"><link rel="stylesheet" href="${base}/assets/styles.css"><link rel="icon" href="${base}/assets/favicon.svg"><script type="application/ld+json">${personSchema}</script></head><body>${nav()}<main id="main">${body}</main>${footer()}</body></html>`;
}

function tags(items) { return `<ul class="tags">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; }
function chips(items) { return `<ul class="chips">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; }

function caseLinks(c, { compact = false, onCasePage = false } = {}) {
  const out = onCasePage
    ? []
    : [`<a class="button${compact ? "" : " dark"}" href="${base}/work/${c.slug}/">Case study →</a>`];
  if (c.liveUrl) out.push(`<a class="button" href="${c.liveUrl}">Live ↗</a>`);
  if (c.repoUrl) out.push(`<a class="button" href="${c.repoUrl}">GitHub ↗</a>`);
  if (!c.repoUrl && !c.liveUrl) out.push(`<span class="button muted">Private repository</span>`);
  return `<p class="actions">${out.join("")}</p>`;
}

function card(c) {
  return `<article class="card"><a class="card-img" href="${base}/work/${c.slug}/"><img src="${base}/assets/images/${c.image}" alt="Interface capture from ${c.title}" loading="lazy"></a><p class="mono stamp">Case ${c.number} · ${c.kind}</p><h2><a href="${base}/work/${c.slug}/">${c.title}</a></h2><p class="card-line">${c.oneLine}</p>${chips(c.chips)}<p class="card-role"><b>My role</b> ${c.role}</p><p class="card-role"><b>Key problem</b> ${c.problem}</p>${tags(c.stack)}${caseLinks(c, { compact: true })}</article>`;
}

const featured = cases.find(c => c.featured);
const secondary = cases.filter(c => !c.featured);

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

const home = shell(
  "Backend & AI Software Engineer",
  "Sercan Özkan — backend, AI and simulation engineering case studies with architecture, tests and measured results.",
  `
<section class="hero shell"><div class="hero-copy"><p class="kicker"><span></span> Available for software, backend and AI engineering roles</p><p class="hero-name mono">Sercan Özkan</p><h1>Backend &amp; AI Software Engineer</h1><p class="lede">I build production-minded backend systems, AI products and simulation software — and I document how each one was tested and where it still falls short.</p><p class="actions"><a class="button dark" href="${base}/work/">View projects</a><a class="button" href="${cv}">Download CV</a><a class="button" href="${repo}">GitHub ↗</a></p><ul class="chips wide"><li>Python</li><li>FastAPI</li><li>PostgreSQL</li><li>React</li><li>TypeScript</li><li>Docker</li><li>RAG / LLM</li></ul></div><div class="hero-panel" aria-label="Portfolio project overview"><div class="panel-head"><span>Selected systems</span><b>2026 / 03 builds</b></div><a class="panel-feature" href="${base}/work/cv-analyzer/"><small>01 / AI PRODUCT</small><strong>CV Analyzer</strong><p>Resume intelligence with deterministic parsing and explainable scoring.</p><span>FastAPI · React · PostgreSQL</span></a><div class="panel-grid"><a href="${base}/work/siliqon/"><small>02 / SIMULATION</small><strong>Siliqon</strong><span>295 simulation tests</span></a><a href="${base}/work/vr-teacher/"><small>03 / IMMERSIVE AI</small><strong>VR Teacher</strong><span>Unity + grounded RAG</span></a></div><div class="panel-foot"><span><i></i> Portfolio live</span><b>Evidence over mystery</b></div></div></section>

<section class="metrics" aria-label="Engineering by the numbers">${metrics.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("")}</section>
<p class="metrics-note shell mono">Counted from the three case studies below — endpoints and CI checks from CV Analyzer, tests across all three, components from Siliqon.</p>

<section class="section shell featured"><p class="eyebrow">Featured project</p><div class="featured-grid"><a class="featured-img" href="${base}/work/${featured.slug}/"><img src="${base}/assets/images/${featured.image}" alt="CV Analyzer interface"></a><div><h2 class="display">${featured.title}</h2><p class="featured-line">${featured.oneLine}</p><p>${featured.summary}</p>${chips(featured.chips)}<p class="card-role"><b>My role</b> ${featured.role}</p><p class="card-role"><b>Key problem</b> ${featured.problem}</p>${tags(featured.stack)}${caseLinks(featured)}</div></div></section>

<section class="section shell"><p class="eyebrow">Other selected work</p><h2 class="display">Engineering case studies, from problem to production.</h2><div class="grid two">${secondary.map(card).join("")}</div></section>

<section class="experience" id="experience"><div class="shell"><p class="eyebrow">Experience</p><div class="exp-grid"><div class="exp-head"><h2 class="display">${experience.role}</h2><p class="exp-org">${experience.org} · ${experience.place}</p><p class="mono exp-period">${experience.period}</p>${tags(experience.tags)}</div><ul class="exp-list">${experience.lines.map(l => `<li>${l}</li>`).join("")}</ul></div></div></section>

<section class="process"><div class="shell"><p class="eyebrow">How I engineer</p><h2 class="display">A clear trail from problem to proof.</h2><div class="process-grid five">${process.map(([n, h, p]) => `<article><b>${n}</b><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></div></section>

<section class="cta shell"><p class="eyebrow">Next conversation</p><h2>Have a system that needs a careful builder?</h2><p class="actions"><a class="button light" href="${base}/contact/">Let&apos;s talk</a><a class="button light" href="${cv}">Download CV</a></p></section>`);

const work = shell(
  "Work",
  "Three engineering case studies: resume intelligence, browser circuit simulation, and VR learning — each with architecture, tests and limits.",
  `<section class="intro shell"><p class="eyebrow">Work / 2026</p><h1>Ambitious products are more convincing when the evidence travels with them.</h1><p>Three flagship projects spanning resume intelligence, browser-based electronics simulation, and VR learning. Every case records the problem, the engineering decisions, how it was tested, and what is still unfinished.</p></section><section class="section shell"><div class="grid two">${cases.map(card).join("")}</div></section>`,
  "/work/");

const about = shell(
  "About",
  "How Sercan Özkan approaches backend systems, simulation and AI-assisted products.",
  `<section class="intro shell about"><div><p class="eyebrow">About</p><h1>I learn complex systems by making their boundaries, evidence, and failure modes visible.</h1></div><img src="${base}/assets/images/identity-kit-light.png" alt="Sercan Özkan identity kit"></section><section class="about-body shell"><div><p class="big">I&apos;m Sercan Özkan, a computer engineering student and software developer building AI-assisted products, simulation systems, backend services, and immersive learning tools.</p><p>My projects move between web platforms, deterministic engines, data pipelines, and VR interaction. I want to trace how a decision is made, understand where data moves, and know what fails before adding another layer. Outside personal work I spent a summer on low-latency drone video streaming at ${experience.org}, measuring latency and packet loss across RTSP and RTP transports.</p><p>AI helps me plan, question, and document the work. I still check the source, run important paths, record uncertainty, and keep the technical decisions explainable.</p></div><aside><p class="eyebrow">Current limitations</p><ul><li>Siliqon has no public deployment, so it cannot be tried from a link.</li><li>VR Teacher&apos;s evaluation harness is implemented; benchmark results are still being collected.</li><li>Siliqon and VR Teacher are private, so their source cannot be inspected publicly.</li><li>VR Teacher still needs a strong in-headset demo capture.</li><li>There is no custom domain or analytics yet.</li><li>I used the identity kit instead of inventing a portrait.</li></ul></aside></section>`,
  "/about/");

const contact = shell(
  "Contact",
  "Contact Sercan Özkan about backend, AI and simulation engineering work.",
  `<section class="contact shell"><p class="eyebrow">Contact</p><h1>Let&apos;s talk about the system behind the screen.</h1><p>If you&apos;re working on an API, an AI-assisted product, simulation, or immersive learning—and value clear evidence over mystery—send me a note. Email is the fastest route.</p><div class="contact-links"><a href="mailto:${email}"><small>Email</small><b>${email}</b><span>↗</span></a><a href="${linkedin}"><small>Profile</small><b>LinkedIn</b><span>↗</span></a><a href="${repo}"><small>Code</small><b>GitHub</b><span>↗</span></a><a href="${cv}"><small>Resume</small><b>Download CV (English)</b><span>↗</span></a><a href="${booking}"><small>Booking</small><b>Request a conversation</b><span>↗</span></a></div></section>`,
  "/contact/");

const notFound = shell(
  "Page not found",
  "That page does not exist on this portfolio.",
  `<section class="intro shell"><p class="eyebrow">404</p><h1>That page moved on.</h1><p>The address you opened is not part of this portfolio. The work is one click away.</p><p class="actions"><a class="button dark" href="${base}/work/">View projects</a><a class="button" href="${base}/">Home</a></p></section>`,
  "/404.html");

/* ------------------------------------------------------------------ *
 * Write
 * ------------------------------------------------------------------ */

await writeFile(join(root, "index.html"), home);
await writeFile(join(root, "404.html"), notFound);

for (const [folder, html] of [["work", work], ["about", about], ["contact", contact]]) {
  await mkdir(join(root, folder), { recursive: true });
  await writeFile(join(root, folder, "index.html"), html);
}

// /resume/ — a short URL that hands over to the PDF.
await mkdir(join(root, "resume"), { recursive: true });
await writeFile(join(root, "resume", "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Resume | Sercan Özkan</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${cv}"><link rel="canonical" href="${site}/assets/Sercan_Ozkan_CV_EN.pdf"></head><body><p>Redirecting to <a href="${cv}">the CV</a>.</p></body></html>`);

for (const c of cases) {
  const next = cases[(cases.indexOf(c) + 1) % cases.length];
  const overview = [
    ["Role", c.role],
    ["Repo activity", c.activity],
    ["Status", c.status],
    ["Problem", c.problem],
  ];
  const body = `<article>
<header class="case-hero shell"><a class="mono back" href="${base}/work/">← All work</a><p class="eyebrow">Case ${c.number} / ${c.stack.join(" · ")}</p><h1>${c.title}</h1><p class="lede">${c.strap} ${c.summary}</p>${caseLinks(c, { onCasePage: true })}</header>

<dl class="overview shell">${overview.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join("")}</dl>

<figure class="proof shell"><img src="${base}/assets/images/${c.image}" alt="Evidence for ${c.title}"><figcaption><span class="mono">Evidence</span>${c.proof}</figcaption></figure>

<section class="arch shell"><p class="eyebrow">Architecture</p><h2>How the pieces fit</h2>${diagrams[c.slug]}</section>

<div class="case-body shell"><aside><p class="eyebrow">Stack</p>${tags(c.stack)}</aside><div>
<section><p class="eyebrow">Challenge</p><h2>What needed to change</h2><p>${c.challenge}</p></section>
<section><p class="eyebrow">Approach</p><h2>How I built it</h2><ol>${c.approach.map(x => `<li>${x}</li>`).join("")}</ol></section>
<section><p class="eyebrow">Engineering decisions</p><h2>Why it is built this way</h2><dl class="decisions">${c.decisions.map(([q, a]) => `<div><dt>${q}</dt><dd>${a}</dd></div>`).join("")}</dl></section>
<section><p class="eyebrow">Testing</p><h2>How it is verified</h2><p>${c.testing}</p></section>
<section><p class="eyebrow">Result</p><h2>What landed</h2><p>${c.outcome}</p></section>
<section class="limit"><p class="eyebrow">What I&apos;d improve</p><h2>What is not finished</h2><p>${c.limitation}</p></section>
</div></div></article>
<section class="next shell"><p class="eyebrow">Next case</p><a href="${base}/work/${next.slug}/">${next.title} <b>→</b></a></section>`;
  const dir = join(root, "work", c.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), shell(c.title, c.summary, body, `/work/${c.slug}/`));
}

const urls = ["/", "/work/", "/about/", "/contact/", ...cases.map(c => `/work/${c.slug}/`)];
await writeFile(join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${site}${u}</loc></url>`).join("\n") + `\n</urlset>\n`);

await writeFile(join(root, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`Built ${urls.length + 2} pages, sitemap and robots.txt.`);
