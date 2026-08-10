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
    outcome: "The documented system spans four runtimes, 14 API routers, recruiter and candidate workflows, multiple renderers, and a large regression-focused test surface.",
    proof: "The public repository includes architecture diagrams, implementation guides, security controls, a detailed test plan, and real interface captures.",
    limitation: "The project is source-available for portfolio review rather than open source, and its production architecture requires several managed services."
  },
  {
    slug: "siliqon", number: "02", title: "Siliqon",
    strap: "An electronics laboratory that runs entirely in the browser.",
    summary: "A visual breadboard simulator with real-time analog solving, measurement tools, deterministic safety warnings, and Arduino-style programming.",
    image: "siliqon-cover.svg", stack: ["TypeScript", "React", "PixiJS", "Web Worker", "Vitest"],
    repoUrl: null,
    challenge: "Make circuit building feel visual and immediate while keeping electrical connectivity and simulation behavior technically consistent.",
    approach: ["Separated the PixiJS laboratory scene from React panels and from the electrical netlist model.", "Reduced breadboard connections to active nodes, then solved analog behavior with modified nodal analysis and time-stepped simulation.", "Added a C-like microcontroller interpreter, oscilloscope, multimeter, deterministic fault rules, and portable project files."],
    outcome: "The current build supports prepared experiments, multiple development boards, transient RC and PWM behavior, and an 80-test simulation and interpreter suite.",
    proof: "The repository README documents the solver, netlist rules, Arduino subset, supported equipment, roadmap, and a working traffic-light experiment capture.",
    limitation: "The education layer, AI assistant, advanced components, and public deployment are still roadmap work; the repository remains private."
  },
  {
    slug: "vr-teacher", number: "03", title: "VR Teacher",
    strap: "An AI-supported electronics teacher inside a virtual classroom.",
    summary: "A Unity VR learning environment that explains experiment PDFs, answers grounded voice questions, and guides interactive breadboard work.",
    image: "vr-teacher-cover.svg", stack: ["Unity", "C#", "FastAPI", "ChromaDB", "OpenAI"],
    repoUrl: null,
    challenge: "Join immersive interaction, grounded teaching content, voice input, and circuit simulation without letting the AI drift away from the selected experiment sheet.",
    approach: ["Built the classroom and electronics-lab client with Unity and XR Interaction Toolkit.", "Used a FastAPI backend for experiment-sheet management plus speech-to-text and text-to-speech bridges.", "Grounded answers in indexed PDF material and added circuit rules for shorts, LED current, capacitors, logic gates, and multimeter probes."],
    outcome: "The prototype connects a VR classroom, experiment phone UI, voice questions, RAG answers, and interactive electronics practice in one learning flow.",
    proof: "The private repository contains the Unity project, FastAPI backend, architecture document, roadmap, lab assets, and experiment teaching material.",
    limitation: "It remains a private prototype; headset usability, learning outcomes, and production deployment still need measured validation."
  }
];

function nav() {
  return `<header class="site-header"><a class="brand" href="${base}/"><span>SÖ</span><b>Sercan Özkan</b></a><nav aria-label="Primary"><a href="${base}/work/">Work</a><a href="${base}/about/">About</a><a href="${base}/contact/">Contact</a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><small>Software portfolio</small><p>Decisions, evidence, and honest limits.</p></div><div><a href="${linkedin}">LinkedIn ↗</a> <a href="${repo}">GitHub ↗</a> <a href="${cv}">CV ↗</a> <a href="${base}/contact/">Contact</a></div><small>© 2026 SÖ</small></footer>`;
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
<section class="metrics"><div><b>03</b><span>flagship projects</span></div><div><b>185</b><span>documented API routes</span></div><div><b>80</b><span>circuit tests</span></div><div><b>01</b><span>public portfolio</span></div></section>
<section class="section shell"><p class="eyebrow">Selected work</p><h2 class="display">Real builds, including the rough edges.</h2><div class="grid">${cases.map(card).join("")}</div></section>
<section class="section shell"><p class="eyebrow">Coming next</p><h2 class="display">A place for the work that is still becoming real.</h2><div class="grid two"><article class="card"><p class="mono stamp">Future posts</p><h2>Build notes and technical lessons</h2><p>Short, source-grounded notes on backend architecture, simulation, AI workflows, and the decisions behind each build.</p></article><article class="card"><p class="mono stamp">Capstone</p><h2>Portfolio Evidence Agent</h2><p>A personal agent that turns verified project documentation into case studies while protecting project boundaries and marking unsupported claims.</p></article></div></section>
<section class="cta shell"><p class="eyebrow">Next conversation</p><h2>Have a system that needs a careful builder?</h2><a class="button light" href="${base}/contact/">Let&apos;s talk</a></section>`);

const work = shell("Work", "Three software and immersive-learning case studies.", `<section class="intro shell"><p class="eyebrow">Work / 2026</p><h1>Ambitious products are more convincing when the evidence travels with them.</h1><p>Three flagship projects spanning resume intelligence, browser-based electronics simulation, and VR learning. Every case records the goal, technical decisions, proof, and unfinished work.</p></section><section class="section shell"><div class="grid two">${cases.map(card).join("")}</div></section>`);

const about = shell("About", "How Sercan Özkan approaches software, simulation, and AI-assisted products.", `<section class="intro shell about"><div><p class="eyebrow">About</p><h1>I learn complex systems by making their boundaries, evidence, and failure modes visible.</h1></div><img src="${base}/assets/images/identity-kit-light.png" alt="Sercan Özkan identity kit"></section><section class="about-body shell"><div><p class="big">I&apos;m Sercan Özkan, a software developer building AI-assisted products, simulation systems, backend services, and immersive learning tools.</p><p>My projects move between web platforms, deterministic engines, data pipelines, and VR interaction. I want to trace how a decision is made, understand where data moves, and know what fails before adding another layer.</p><p>AI helps me plan, question, and document the work. I still check the source, run important paths, record uncertainty, and keep the technical decisions explainable.</p></div><aside><p class="eyebrow">Still ugly</p><ul><li>The writing needs a tighter edit and more measured outcomes.</li><li>Siliqon and VR Teacher are private, so their source cannot be inspected publicly.</li><li>VR Teacher still needs a strong in-headset demo capture.</li><li>There is no custom domain or analytics yet.</li><li>I used the identity kit instead of inventing a portrait.</li></ul></aside></section>`);

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
