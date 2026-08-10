import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1));
const base = "/so-backend-data";
const repo = "https://github.com/SercanOzkan55";
const linkedin = "https://www.linkedin.com/in/sercan-%C3%B6zkan-a205852a7/";
const cv = `${base}/assets/Sercan_Ozkan_CV_EN.pdf`;
const booking = "mailto:ozkansercan55@gmail.com?subject=Portfolio%20conversation%20request";

const cases = [
  {
    slug: "cv-analyzer", number: "01", title: "CV Analyzer",
    strap: "Deterministic where it can be, AI where it must be.",
    summary: "A hybrid resume-intelligence platform for ATS analysis, recruiter workflows, CV building, and privacy-first local processing.",
    image: "cv-analyzer.png", stack: ["Python", "FastAPI", "React", "PostgreSQL", "Celery"],
    repoUrl: "https://github.com/SercanOzkan55/CV-Analyzer",
    challenge: "Analyze varied resume formats, produce explainable ATS feedback, and support recruiter-scale workflows without sending every document to an LLM.",
    approach: ["Built a deterministic extraction and normalization pipeline with a quality gate that invokes an LLM only for weak parses.", "Separated cloud accounts and collaboration from a local desktop worker for privacy-sensitive batch processing.", "Combined FastAPI services, PostgreSQL, Redis, Celery, S3-compatible storage, React, and automated security checks."],
    outcome: "The documented system spans four runtimes, 185 endpoints across 14 routers, recruiter and candidate workflows, multiple renderers, 800+ backend tests, 100 frontend tests, and 12 CI checks gating every pull request.",
    proof: "The public repository includes architecture diagrams, implementation guides, security controls, a detailed test plan, and real interface captures.",
    limitation: "The project is source-available for portfolio review rather than open source, and its production architecture requires several managed services."
  },
  {
    slug: "siliqon", number: "02", title: "Siliqon",
    strap: "An electronics laboratory that runs entirely in the browser.",
    summary: "A visual breadboard simulator with real-time analog solving, measurement instruments, guided lessons, deterministic safety warnings, and Arduino-style programming.",
    image: "siliqon-cover.svg", stack: ["TypeScript", "React", "PixiJS", "Web Worker", "Supabase", "Vitest"],
    repoUrl: null,
    challenge: "Make circuit building feel visual and immediate while keeping electrical connectivity and simulation behavior technically consistent.",
    approach: ["Kept the visual world and the electrical world separate: where a wire is drawn never decides which pins share a node. Connectivity comes from declared breadboard strips, leg insertions, and user wires, merged by union-find. Nodes connected to no device are dropped from the matrix, so a 400-hole breadboard collapses to three to six nodes and real-time solving becomes possible.", "Solved analog behavior with modified nodal analysis and Newton-Raphson, using Shockley and Ebers-Moll device models with SPICE-style junction limiting and a gmin homotopy fallback, then stepped it through time with backward Euler at 200 µs inside a Web Worker.", "Wrote a C-subset microcontroller interpreter on a generator-based evaluator, so delay() and millis() suspend the program and hand time back to the circuit solver instead of blocking it.", "Put a deterministic rule engine in front of the AI assistant: missing supply, unlimited LED current, reverse polarity, over-current and short-circuit checks run without an LLM, and the assistant explains causes rather than repeating findings."],
    outcome: "The build ships 32 prepared experiments, six development boards from Uno to STM32, more than forty component models, oscilloscope, multimeter and a logic analyzer that decodes UART, I²C and SPI, small-signal AC sweeps with Bode magnitude and phase, and step-by-step lessons whose checks read the actual circuit so a step only passes when the wiring is right. The suite runs 295 tests.",
    proof: "The repository README documents the solver, netlist rules, the supported Arduino subset, every component's simulation model, the lesson check types, and the full test inventory.",
    limitation: "There is no public deployment yet, so the work cannot be tried from a link, and the repository stays private. The interpreter is a C-like subset rather than real AVR emulation, browser-local project storage is not durable, and the AI assistant needs a Supabase Edge Function and an OpenAI key before it will run."
  },
  {
    slug: "vr-teacher", number: "03", title: "VR Teacher",
    strap: "An AI-supported electronics teacher inside a virtual classroom.",
    summary: "A Unity VR learning environment that explains experiment sheets, answers grounded voice questions, and guides interactive breadboard work.",
    image: "vr-teacher-cover.svg", stack: ["Unity", "C#", "FastAPI", "ChromaDB", "Whisper", "Azure TTS"],
    repoUrl: null,
    challenge: "Join immersive interaction, grounded teaching content, voice input, and circuit practice without letting the AI drift away from the selected experiment sheet.",
    approach: ["Built the classroom and electronics-lab client in Unity with OpenXR and the XR Interaction Toolkit, transcribing questions with Whisper and speaking answers through an Azure Turkish neural voice whose amplitude drives the avatar's mouth blendshape.", "Chose retrieval over fine-tuning for a nine-document corpus: PyMuPDF extraction, 500-token chunks with 50-token overlap, embeddings in a persisted ChromaDB collection, and top-five retrieval at query time.", "Constrained the model to the retrieved context, required it to cite the source document, and made it answer \"this topic is not covered in the course materials\" rather than improvise — the anti-hallucination boundary is a prompt contract, not a hope.", "Added an experiment-sheet service, an answer cache, a question log, and a token optimizer so repeated classroom questions do not re-pay for the same retrieval and generation."],
    outcome: "Nine experiment documents are ingested and queryable, and the full loop runs: spoken question, transcription, retrieval, grounded answer with sources, spoken reply from a lip-synced avatar. An evaluation harness scores answer relevance, faithfulness, correctness, context precision, latency, and retrieval recall through its own API endpoints.",
    proof: "The private repository holds the Unity project, the FastAPI backend, the architecture document with the RAG and evaluation design, the experiment corpus, and the benchmark test set.",
    limitation: "The evaluation harness is built but not yet reported: the test set holds fifteen question-answer pairs and no benchmark run is recorded, so no quality number is claimed here. Headset usability and learning outcomes are likewise unmeasured, and the project stays a private prototype."
  }
];

function nav() {
  return `<header class="site-header"><a class="brand" href="${base}/"><span>SÖ</span><b>Sercan Özkan</b></a><nav aria-label="Primary"><a href="${base}/work/">Work</a><a href="${base}/about/">About</a><a href="${base}/contact/">Contact</a><a class="nav-cv" href="${cv}">CV ↗</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><small>Software portfolio</small><p>Decisions, evidence, and honest limits.</p></div><div><a href="${linkedin}">LinkedIn ↗</a> <a href="${repo}">GitHub ↗</a> <a href="${cv}">CV ↗</a> <a href="${base}/contact/">Contact</a></div><small>© 2026 SÖ</small></footer>`;
}
function shell(title, description, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Sercan Özkan</title><meta name="description" content="${description}"><meta property="og:title" content="${title} | Sercan Özkan"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:image" content="https://sercanozkan55.github.io${base}/assets/images/social-preview-v2.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://sercanozkan55.github.io${base}/assets/images/social-preview-v2.png"><link rel="stylesheet" href="${base}/assets/styles.css"><link rel="icon" href="${base}/assets/favicon.svg"></head><body>${nav()}<main>${body}</main>${footer()}</body></html>`;
}
function tags(items) { return `<ul class="tags">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; }
function card(c) {
  return `<article class="card"><a class="card-img" href="${base}/work/${c.slug}/"><img src="${base}/assets/images/${c.image}" alt="Evidence image for ${c.title}"></a><p class="mono stamp">Case ${c.number}</p><h2><a href="${base}/work/${c.slug}/">${c.title}</a></h2><p>${c.summary}</p>${tags(c.stack)}<a class="text-link" href="${base}/work/${c.slug}/">Open case study →</a></article>`;
}

const home = shell("Software & AI Portfolio", "Software, simulation, and AI-assisted product case studies with evidence and honest limitations.", `
<section class="hero shell"><div class="hero-copy"><p class="kicker"><span></span> Available for software &amp; AI product work</p><h1>I build systems you can inspect, test, and trust.</h1><p class="lede">I&apos;m Sercan Özkan, a software developer working across backend platforms, circuit simulation, AI workflows, and immersive learning.</p><p class="actions"><a class="button dark" href="${base}/work/">Explore projects</a><a class="button" href="${base}/contact/">Start a conversation</a></p><div class="hero-links"><a href="${linkedin}">LinkedIn ↗</a><a href="${repo}">GitHub ↗</a><a href="${cv}">English CV ↗</a></div></div><div class="hero-panel" aria-label="Portfolio project overview"><div class="panel-head"><span>Selected systems</span><b>2026 / 03 builds</b></div><a class="panel-feature" href="${base}/work/cv-analyzer/"><small>01 / AI PRODUCT</small><strong>CV Analyzer</strong><p>Resume intelligence with deterministic parsing and explainable scoring.</p><span>FastAPI · React · PostgreSQL</span></a><div class="panel-grid"><a href="${base}/work/siliqon/"><small>02 / SIMULATION</small><strong>Siliqon</strong><span>295 simulation tests</span></a><a href="${base}/work/vr-teacher/"><small>03 / IMMERSIVE AI</small><strong>VR Teacher</strong><span>Unity + grounded RAG</span></a></div><div class="panel-foot"><span><i></i> Portfolio live</span><b>Evidence over mystery</b></div></div></section>
<section class="metrics"><div><b>03</b><span>flagship projects</span></div><div><b>185</b><span>documented API endpoints</span></div><div><b>295</b><span>simulation tests</span></div><div><b>32</b><span>prepared experiments</span></div></section>
<section class="expertise shell"><p class="eyebrow">What I work across</p><div><span>Backend systems</span><span>Applied AI</span><span>Simulation engines</span><span>XR learning</span><span>Data workflows</span><span>Evidence design</span></div></section>
<section class="section shell"><p class="eyebrow">Selected work</p><h2 class="display">Real builds, including the rough edges.</h2><div class="grid">${cases.map(card).join("")}</div></section>
<section class="process"><div class="shell"><p class="eyebrow">How I build</p><h2 class="display">A clear trail from problem to proof.</h2><div class="process-grid"><article><b>01</b><h3>Frame the boundary</h3><p>Define the user, the core job, and what the system must never assume.</p></article><article><b>02</b><h3>Build the smallest loop</h3><p>Connect the real data and make one complete path work before adding breadth.</p></article><article><b>03</b><h3>Test the failure modes</h3><p>Record what breaks, separate evidence from claims, and keep human review visible.</p></article></div></div></section>
<section class="section shell"><p class="eyebrow">Coming next</p><h2 class="display">A place for the work that is still becoming real.</h2><div class="grid two"><article class="card"><p class="mono stamp">Future posts</p><h2>Build notes and technical lessons</h2><p>Short, source-grounded notes on backend architecture, simulation, AI workflows, and the decisions behind each build.</p></article><article class="card"><p class="mono stamp">Capstone</p><h2>Portfolio Evidence Agent</h2><p>A personal agent that turns verified project documentation into case studies while protecting project boundaries and marking unsupported claims.</p></article></div></section>
<section class="cta shell"><p class="eyebrow">Next conversation</p><h2>Have a system that needs a careful builder?</h2><a class="button light" href="${base}/contact/">Let&apos;s talk</a></section>`);

const work = shell("Work", "Three software and immersive-learning case studies.", `<section class="intro shell"><p class="eyebrow">Work / 2026</p><h1>Ambitious products are more convincing when the evidence travels with them.</h1><p>Three flagship projects spanning resume intelligence, browser-based electronics simulation, and VR learning. Every case records the goal, technical decisions, proof, and unfinished work.</p></section><section class="section shell"><div class="grid two">${cases.map(card).join("")}</div></section>`);

const about = shell("About", "How Sercan Özkan approaches software, simulation, and AI-assisted products.", `<section class="intro shell about"><div><p class="eyebrow">About</p><h1>I learn complex systems by making their boundaries, evidence, and failure modes visible.</h1></div><img src="${base}/assets/images/identity-kit-light.png" alt="Sercan Özkan identity kit"></section><section class="about-body shell"><div><p class="big">I&apos;m Sercan Özkan, a software developer building AI-assisted products, simulation systems, backend services, and immersive learning tools.</p><p>My projects move between web platforms, deterministic engines, data pipelines, and VR interaction. I want to trace how a decision is made, understand where data moves, and know what fails before adding another layer.</p><p>AI helps me plan, question, and document the work. I still check the source, run important paths, record uncertainty, and keep the technical decisions explainable.</p></div><aside><p class="eyebrow">Still ugly</p><ul><li>VR Teacher&apos;s evaluation harness runs, but no benchmark result is published yet.</li><li>Siliqon has no public deployment, so it cannot be tried from a link.</li><li>Siliqon and VR Teacher are private, so their source cannot be inspected publicly.</li><li>VR Teacher still needs a strong in-headset demo capture.</li><li>There is no custom domain or analytics yet.</li><li>I used the identity kit instead of inventing a portrait.</li></ul></aside></section>`);

const contact = shell("Contact", "Contact Sercan Özkan about software and AI-assisted product work.", `<section class="contact shell"><p class="eyebrow">Contact</p><h1>Let&apos;s talk about the system behind the screen.</h1><p>If you&apos;re working on an API, an AI-assisted product, simulation, or immersive learning—and value clear evidence over mystery—send me a note.</p><div class="contact-links"><a href="mailto:ozkansercan55@gmail.com"><small>Email</small><b>ozkansercan55@gmail.com</b><span>↗</span></a><a href="${linkedin}"><small>Profile</small><b>LinkedIn</b><span>↗</span></a><a href="${repo}"><small>Code</small><b>GitHub</b><span>↗</span></a><a href="${cv}"><small>Resume</small><b>Download CV (English)</b><span>↗</span></a><a href="${booking}"><small>Booking</small><b>Request a conversation</b><span>↗</span></a></div></section>`);

await writeFile(join(root, "index.html"), home);
for (const [folder, html] of [["work", work], ["about", about], ["contact", contact]]) {
  await mkdir(join(root, folder), { recursive: true });
  await writeFile(join(root, folder, "index.html"), html);
}
for (const c of cases) {
  const next = cases[(cases.indexOf(c) + 1) % cases.length];
  const repoAction = c.repoUrl ? `<a class="button" href="${c.repoUrl}">Open public repository ↗</a>` : `<span class="button muted">Private repository</span>`;
  const body = `<article><header class="case-hero shell"><a class="mono back" href="${base}/work/">← All work</a><p class="eyebrow">Case ${c.number} / ${c.stack.join(" · ")}</p><h1>${c.title}</h1><p class="lede">${c.strap} ${c.summary}</p>${repoAction}</header><figure class="proof shell"><img src="${base}/assets/images/${c.image}" alt="Evidence for ${c.title}"><figcaption><span class="mono">Evidence</span>${c.proof}</figcaption></figure><div class="case-body shell"><aside><p class="eyebrow">Stack</p>${tags(c.stack)}</aside><div><section><p class="eyebrow">Challenge</p><h2>What needed to change</h2><p>${c.challenge}</p></section><section><p class="eyebrow">Approach</p><h2>How I built it</h2><ol>${c.approach.map(x=>`<li>${x}</li>`).join("")}</ol></section><section><p class="eyebrow">Result</p><h2>What landed</h2><p>${c.outcome}</p></section><section class="limit"><p class="eyebrow">Honest limitation</p><h2>What is not finished</h2><p>${c.limitation}</p></section></div></div></article><section class="next shell"><p class="eyebrow">Next case</p><a href="${base}/work/${next.slug}/">${next.title} <b>→</b></a></section>`;
  const dir = join(root, "work", c.slug); await mkdir(dir, {recursive:true});
  await writeFile(join(dir, "index.html"), shell(c.title, c.summary, body));
}
console.log("Built 7 public pages.");
