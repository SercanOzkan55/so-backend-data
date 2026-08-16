import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/* ==================================================================== *
 * Sercan Özkan — portfolio build
 *
 * One Node script writes every page from the data below. There is no
 * framework and no dependency: the site is nine static files, and the
 * only thing on it that talks to a server is the contact form.
 * ==================================================================== */

const root = new URL(".", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1));
const base = "/Portfolio";
const site = `https://sercanozkan55.github.io${base}`;
const repo = "https://github.com/SercanOzkan55";
const linkedin = "https://www.linkedin.com/in/sercan-%C3%B6zkan-a205852a7/";
const cv = `${base}/assets/Sercan_Ozkan_CV_EN.pdf`;
const email = "ozkansercan55@gmail.com";

// The contact form posts here. The endpoint is a Cloudflare Worker in
// contact-api/, deployed separately from this static site.
const contactEndpoint = "https://portfolio-contact-api.portfolio-contact-api.workers.dev/api/contact";

// Fonts load from <head> behind preconnect, never via @import in the
// stylesheet — an @import would hold the first paint until Google Fonts
// answered. Two families and a mono, five weights in total.
const fontsHref = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap";

const ground = "#08090b";

// Intrinsic sizes so the browser reserves each image box before the file
// lands. Without these the hero, project media and proof shots all shift.
const imageDims = {
  "cv-analyzer.webp": [2000, 1125],
  "siliqon-app.webp": [1800, 943],
  "identity-kit.webp": [900, 1260],
  "vr-teacher-cover.svg": [1200, 750],
};

function imgTag(file, alt, { eager = false } = {}) {
  const [w, h] = imageDims[file] ?? [];
  return `<img src="${base}/assets/images/${file}" alt="${alt}"`
    + (w ? ` width="${w}" height="${h}"` : "")
    + (eager ? ` decoding="async" fetchpriority="high"` : ` loading="lazy" decoding="async"`)
    + `>`;
}

const arrow = `<span class="arrow" aria-hidden="true">↗</span>`;
const arrowRight = `<span class="arrow" aria-hidden="true">→</span>`;

/* ------------------------------------------------------------------ *
 * Runtime
 * Everything the pages do at runtime lives here: reveals, the sticky
 * header, the mobile sheet, parallax, and the contact form. All of it
 * is progressive — the markup is complete and readable without it.
 * ------------------------------------------------------------------ */

// Set before the body paints. Reveal rules hang off this class, so with
// JS off or reduced motion on it never lands and nothing is hidden.
// `js` gates anything that would leave the page worse if the script never
// runs — the collapsed mobile menu above all. `js-motion` additionally
// respects the reduced-motion preference.
const bootFlag = `<script>document.documentElement.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-motion")</script>`;

const runtime = `<script>(function(){
var root=document.documentElement;
var motion=root.classList.contains("js-motion");

/* ---- mobile navigation: a sheet, not a cramped dropdown ---- */
var bar=document.querySelector(".nav-bar");
var toggle=document.querySelector(".nav-toggle");
if(toggle&&bar){
  var close=function(){document.body.classList.remove("nav-open");toggle.setAttribute("aria-expanded","false")};
  toggle.addEventListener("click",function(){
    var open=document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded",open?"true":"false");
  });
  document.querySelectorAll(".nav-links a").forEach(function(a){a.addEventListener("click",close)});
  addEventListener("keydown",function(e){if(e.key==="Escape")close()});
}

/* ---- sticky header state + scroll progress ---- */
var progress=document.querySelector(".scroll-progress");
var stuck=false,ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(function(){
    var y=scrollY;
    var s=y>16;
    if(s!==stuck&&bar){stuck=s;bar.classList.toggle("is-stuck",s)}
    if(progress){
      var h=document.documentElement.scrollHeight-innerHeight;
      progress.style.transform="scaleX("+(h>0?Math.min(y/h,1):0)+")";
    }
    ticking=false;
  });
}
addEventListener("scroll",onScroll,{passive:true});onScroll();

if(!motion)return;

/* ---- reveals ----
   Reveal styles hide content until a callback runs, so the callback not
   running must never be able to swallow the page. IntersectionObserver
   reports every target once on observe, which makes it its own health
   check: no report at all means it is throttled or absent, and
   everything is shown outright. */
var targets=document.querySelectorAll("[data-reveal],[data-reveal-group]");
function revealAll(){root.classList.remove("js-motion")}
document.querySelectorAll("[data-reveal-group]").forEach(function(g){
  Array.prototype.forEach.call(g.children,function(c,i){c.style.setProperty("--i",i)});
});
document.querySelectorAll(".mask").forEach(function(m,i){m.style.setProperty("--i",i%6)});

if(!("IntersectionObserver" in window)){revealAll();return}
var alive=false;
var io=new IntersectionObserver(function(entries){
  alive=true;
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add("is-in");io.unobserve(e.target)}});
},{rootMargin:"0px 0px -8% 0px",threshold:.06});
Array.prototype.forEach.call(targets,function(el){io.observe(el)});
setTimeout(function(){if(!alive){io.disconnect();revealAll()}},2500);

/* ---- diagram arrows draw themselves ---- */
document.querySelectorAll(".diagram .dg-arrow").forEach(function(line,i){
  var len=Math.hypot(line.x2.baseVal.value-line.x1.baseVal.value,line.y2.baseVal.value-line.y1.baseVal.value);
  line.style.setProperty("--len",len.toFixed(1));
  line.style.setProperty("--i",i);
});

/* ---- process rail fills as the section is read ---- */
var rail=document.querySelector(".process");
if(rail){
  var fill=rail.querySelector(".process-fill");
  var steps=rail.querySelectorAll("article");
  var pio=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      e.target.classList.add("is-lit");
      var lit=rail.querySelectorAll("article.is-lit").length;
      if(fill)fill.style.setProperty("--p",(lit/steps.length).toFixed(3));
    });
  },{rootMargin:"0px 0px -35% 0px",threshold:.4});
  steps.forEach(function(s){pio.observe(s)});
}

/* ---- parallax + magnetic CTA, desktop pointers only ----
   Both are transform-only and read scroll state inside one rAF, so
   nothing here forces a synchronous layout. */
var fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
if(fine){
  var layers=document.querySelectorAll(".parallax");
  if(layers.length){
    var ptick=false;
    addEventListener("scroll",function(){
      if(ptick)return;ptick=true;
      requestAnimationFrame(function(){
        layers.forEach(function(el){
          var r=el.getBoundingClientRect();
          if(r.bottom<0||r.top>innerHeight)return;
          var mid=(r.top+r.height/2-innerHeight/2)/innerHeight;
          el.style.transform="translate3d(0,"+(mid*-22).toFixed(2)+"px,0)";
        });
        ptick=false;
      });
    },{passive:true});
  }
  document.querySelectorAll(".magnetic").forEach(function(el){
    el.addEventListener("pointermove",function(e){
      var r=el.getBoundingClientRect();
      var x=(e.clientX-r.left-r.width/2)/r.width;
      var y=(e.clientY-r.top-r.height/2)/r.height;
      el.style.transform="translate("+(x*7).toFixed(2)+"px,"+(y*7).toFixed(2)+"px)";
    });
    el.addEventListener("pointerleave",function(){el.style.transform=""});
  });
}
})();</script>`;

// Progressive enhancement: the markup is a plain form, and this turns it
// into an in-page submit. Anything unexpected — offline, endpoint down,
// non-JSON answer — ends in a message that still points at my address.
const contactScript = `<script>(function(){
var form=document.querySelector(".contact-form");if(!form)return;
var endpoint=${JSON.stringify(contactEndpoint)};
var status=form.querySelector(".form-status");
var button=form.querySelector('button[type="submit"]');
var buttonLabel=button.querySelector("[data-button-label]");
var fields=Array.prototype.slice.call(form.querySelectorAll(".field input,.field textarea"));
function say(text,state){
  status.textContent=text;
  form.dataset.state=state||"idle";
  if(state)status.dataset.state=state;else delete status.dataset.state;
  button.dataset.state=state||"idle";
  buttonLabel.textContent=state==="pending"?"Sending…":state==="ok"?"Message sent":state==="error"?"Try again":"Send message";
}
function errorText(input){
  if(input.validity.valueMissing)return input.name==="message"?"Write a short message.":"Enter your "+input.name+".";
  if(input.validity.typeMismatch)return "Enter a complete email address.";
  if(input.validity.tooShort)return input.name==="message"?"Use at least 20 characters so I have enough context.":"Use at least 2 characters.";
  if(input.validity.tooLong)return "That is longer than this field allows.";
  return input.validationMessage||"Check this field.";
}
function setFieldError(input,message){
  var field=input.closest(".field");
  var error=field.querySelector(".field-error");
  field.classList.toggle("field-invalid",Boolean(message));
  input.setAttribute("aria-invalid",message?"true":"false");
  error.textContent=message||"";
}
function validate(input){var message=input.validity.valid?"":errorText(input);setFieldError(input,message);return !message}
function clearErrors(){fields.forEach(function(input){setFieldError(input,"")})}
fields.forEach(function(input){
  input.addEventListener("blur",function(){validate(input)});
  input.addEventListener("input",function(){
    if(input.getAttribute("aria-invalid")==="true")validate(input);
    if(form.dataset.state==="error")say("","idle");
  });
});
function markBackendInvalid(field){
  if(!field)return null;
  var input=form.querySelector('[name="'+field+'"]');
  if(input)setFieldError(input,"Please check this field.");
  return input;
}
form.addEventListener("submit",function(event){
  event.preventDefault();
  var firstInvalid=null;
  fields.forEach(function(input){if(!validate(input)&&!firstInvalid)firstInvalid=input});
  if(firstInvalid){say("Check the highlighted fields and try again.","error");firstInvalid.focus();return}
  clearErrors();
  var data=new FormData(form);
  var payload={name:data.get("name"),email:data.get("email"),message:data.get("message"),website:data.get("website")};
  button.disabled=true;form.setAttribute("aria-busy","true");say("Sending securely through the live backend…","pending");
  fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)})
    .then(function(res){return res.json().catch(function(){return{ok:false}}).then(function(body){return{status:res.status,body:body}})})
    .then(function(result){
      if(result.body&&result.body.ok){form.reset();clearErrors();say("Accepted by the backend and handed to email delivery. I usually reply within a day.","ok");status.focus();return}
      var invalid=markBackendInvalid(result.body&&result.body.field);
      say((result.body&&result.body.error)||"That did not send. Please email me at ${email}.","error");
      if(invalid)invalid.focus();else status.focus();
    })
    .catch(function(){say("Network error — nothing was sent. Please email me at ${email}.","error");status.focus()})
    .then(function(){button.disabled=false;form.removeAttribute("aria-busy")});
});
})();</script>`;

/* ------------------------------------------------------------------ *
 * Architecture diagrams
 * Hand-drawn SVG so they inherit the palette, stay crisp at any width,
 * and need no image assets.
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
 * Content
 * Everything below is drawn from real project material. Nothing here is
 * a placeholder metric or an invented result.
 * ------------------------------------------------------------------ */

const cases = [
  {
    slug: "cv-analyzer", number: "01", title: "CV Analyzer",
    kind: "AI PRODUCT", featured: true, treatment: "lead",
    strap: "Deterministic where it can be, AI where it must be.",
    oneLine: "AI-powered resume intelligence platform",
    summary: "A hybrid resume-intelligence platform for ATS analysis, recruiter workflows, CV building, and privacy-first local processing.",
    image: "cv-analyzer.webp",
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
    kind: "SIMULATION", treatment: "split",
    strap: "An electronics laboratory that runs entirely in the browser.",
    oneLine: "Browser-based circuit simulation lab",
    summary: "A visual breadboard simulator with real-time analog solving, measurement instruments, guided lessons, deterministic safety warnings, and Arduino-style programming.",
    image: "siliqon-app.webp",
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
    proof: "The running lab: an RC low-pass built with a 159 nF capacitor, swept from 1 Hz to 100 kHz, with the Bode magnitude and phase traces below and the −3 dB corner reported at 1 kHz — where that resistor and capacitor should put it. The status bar shows the solver stepping in 0.8 ms, and the deterministic analysis reporting a clean board.",
    limitation: "There is no public deployment yet, so the work cannot be tried from a link, and the repository stays private. The interpreter is a C-like subset rather than real AVR emulation, browser-local project storage is not durable, and the AI assistant needs a Supabase Edge Function and an OpenAI key before it will run.",
  },
  {
    slug: "vr-teacher", number: "03", title: "VR Teacher",
    kind: "IMMERSIVE AI", treatment: "story",
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

const featured = cases.find((c) => c.featured);

// The featured readout: every figure below is counted from CV Analyzer's
// own repository and case study, not estimated.
const readout = [
  ["Endpoints", "185", "across 14 routers"],
  ["Automated tests", "900+", "pytest + Vitest"],
  ["CI checks per PR", "12", "tests, security, audits"],
  ["Runtimes", "4", "API, web, mobile, desktop"],
  ["Commits", "253", "Mar – Jul 2026"],
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

// Lucide-style 24px stroke icons, inlined. No icon font, no emoji.
const icons = {
  build: `<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>`,
  intelligence: `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>`,
  infrastructure: `<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>`,
  interactive: `<path d="m21 16-9 5-9-5V8l9-5 9 5v8Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`,
};

// Every capability below is backed by a shipped project on this site.
const capabilities = [
  ["build", "Build", [
    ["Web applications", "React · TypeScript · Vite"],
    ["APIs and services", "FastAPI · REST · JWT auth"],
    ["Developer tooling", "PySide6 desktop worker · CLI"],
  ]],
  ["intelligence", "Intelligence", [
    ["Retrieval-grounded answering", "ChromaDB · embeddings · citations"],
    ["LLM behind deterministic gates", "rules first, model as fallback"],
    ["Evaluation harnesses", "faithfulness · context precision"],
  ]],
  ["infrastructure", "Infrastructure", [
    ["Async workloads", "Celery · Redis queues"],
    ["Data stores", "PostgreSQL · Supabase"],
    ["Delivery", "Docker · CI checks · Cloudflare Workers"],
  ]],
  ["interactive", "Interactive", [
    ["Real-time simulation", "MNA solver in a Web Worker"],
    ["XR clients", "Unity · OpenXR · XR Interaction Toolkit"],
    ["Scene rendering", "PixiJS · 40+ component models"],
  ]],
];

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */

const navItems = [
  ["Work", `${base}/work/`, "work"],
  ["Capabilities", `${base}/#capabilities`, "capabilities"],
  ["About", `${base}/about/`, "about"],
  ["Contact", `${base}/contact/`, "contact"],
];

function nav(current) {
  return `<a class="skip" href="#main">Skip to content</a>` +
    `<div class="nav-wrap"><div class="nav-bar"><div class="shell"><div class="nav">` +
      `<a class="brand" href="${base}/"><span class="brand-name">Sercan Özkan</span><span class="brand-role">Backend / Applied AI</span></a>` +
      `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu"><span></span><span></span><span></span></button>` +
      `<nav class="nav-links" id="nav-links" aria-label="Primary">` +
        navItems.map(([label, href, id]) =>
          `<a href="${href}"${current === id ? ` aria-current="page"` : ""}>${label}</a>`).join("") +
        `<a class="nav-cta" href="${base}/contact/">Let&apos;s talk ${arrowRight}</a>` +
      `</nav>` +
      `<p class="nav-live"><span class="status-dot" aria-hidden="true"></span>Open to roles</p>` +
    `</div></div><div class="scroll-progress" aria-hidden="true"></div></div></div>`;
}

function footer() {
  return `<footer class="site-footer shell">` +
    `<div class="footer-id"><b>Sercan Özkan</b><span>Backend engineer for AI and data products. Decisions, evidence, and honest limits.</span></div>` +
    `<nav class="footer-links" aria-label="Footer">` +
      `<a href="${base}/work/">Work</a><a href="${base}/about/">About</a>` +
      `<a href="${repo}">GitHub</a><a href="${linkedin}">LinkedIn</a>` +
      `<a href="mailto:${email}">Email</a><a href="${cv}">CV</a>` +
    `</nav>` +
    `<p class="footer-note"><span>© 2026 Sercan Özkan</span><span>Designed and built by me — static site, one live endpoint</span></p>` +
    `</footer>`;
}

const personSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sercan Özkan",
  jobTitle: "Backend Engineer for AI and Data Products",
  url: `${site}/`,
  email: `mailto:${email}`,
  sameAs: [linkedin, repo],
  knowsAbout: ["Backend engineering", "FastAPI", "PostgreSQL", "Retrieval-augmented generation", "Circuit simulation", "Unity XR"],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Istanbul Health and Technology University" },
});

function shell(title, description, body, { path = "/", current = "", scripts = "" } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${title} | Sercan Özkan</title><meta name="description" content="${description}">` +
    `<link rel="canonical" href="${site}${path}">` +
    `<meta property="og:title" content="${title} | Sercan Özkan"><meta property="og:description" content="${description}">` +
    `<meta property="og:type" content="website"><meta property="og:url" content="${site}${path}">` +
    `<meta property="og:image" content="${site}/assets/images/social-preview.jpg">` +
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${site}/assets/images/social-preview.jpg">` +
    `<meta name="theme-color" content="${ground}">` +
    `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
    `<link rel="stylesheet" href="${fontsHref}"><link rel="stylesheet" href="${base}/assets/styles.css">` +
    `<link rel="icon" href="${base}/assets/favicon.svg">` +
    `<script type="application/ld+json">${personSchema}</script>${bootFlag}</head>` +
    `<body>${nav(current)}<main id="main">${body}</main>${footer()}${runtime}${scripts}</body></html>`;
}

/* ------------------------------------------------------------------ *
 * Fragments
 * ------------------------------------------------------------------ */

function chips(items, accent = false) {
  return `<ul class="chips${accent ? " chips-accent" : ""}">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
function tags(items) {
  return `<ul class="tags">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
function maskLines(lines) {
  // The trailing space keeps the lines from concatenating into "anddata"
  // when the headline is read as one text run.
  return lines.map((l) => `<span class="mask"><span>${l} </span></span>`).join("");
}
function sectionHead(label, heading, note = "") {
  return `<div class="section-head" data-reveal><p class="label label-accent">${label}</p><h2 class="h2">${heading}</h2>` +
    (note ? `<p class="head-note">${note}</p>` : "") + `</div>`;
}

function caseLinks(c, { onCasePage = false } = {}) {
  const out = onCasePage ? [] : [`<a class="button button-primary" href="${base}/work/${c.slug}/">Read the case study</a>`];
  if (c.liveUrl) out.push(`<a class="button" href="${c.liveUrl}">Live site ${arrow}</a>`);
  if (c.repoUrl) out.push(`<a class="button" href="${c.repoUrl}">Source ${arrow}</a>`);
  if (!c.repoUrl && !c.liveUrl) out.push(`<span class="button button-muted">Private repository</span>`);
  return `<p class="actions">${out.join("")}</p>`;
}

function projectMedia(c, { eager = false } = {}) {
  return `<a class="project-media" href="${base}/work/${c.slug}/" tabindex="-1" aria-hidden="true">` +
    imgTag(c.image, "", { eager }) + `</a>`;
}

function projectFacts(c) {
  return `<dl class="project-facts">` +
    `<div><dt>My role</dt><dd>${c.role}</dd></div>` +
    `<div><dt>Key problem</dt><dd>${c.problem}</dd></div>` +
    `<div><dt>Status</dt><dd>${c.status} · ${c.activity}</dd></div>` +
    `</dl>`;
}

// Three treatments, one design system. The lead project gets cinematic
// width, the second a split technical read, the third a reversed
// compact story — so range shows without the page losing its grammar.
function project(c, { eager = false } = {}) {
  const head = `<p class="project-index"><span>${c.number}</span><span class="kind">${c.kind}</span><span>${c.stack.slice(0, 3).join(" · ")}</span></p>`;

  if (c.treatment === "lead") {
    return `<article class="project project-lead" data-reveal>
  ${head}
  <div class="parallax project-media-wrap">${projectMedia(c, { eager })}</div>
  <div class="project-head">
    <h3><a href="${base}/work/${c.slug}/">${c.title}</a></h3>
    <p class="project-line">${c.summary}</p>
    ${caseLinks(c)}
  </div>
  <div class="project-side">${chips(c.chips, true)}${projectFacts(c)}</div>
</article>`;
  }

  const body = `<div class="project-body">
    <h3 class="h3"><a href="${base}/work/${c.slug}/">${c.title}</a></h3>
    <p class="project-line">${c.oneLine} — ${c.strap}</p>
    ${chips(c.chips, true)}
    ${projectFacts(c)}
    ${caseLinks(c)}
  </div>`;

  return `<article class="project project-${c.treatment}" data-reveal>
  ${head}
  ${projectMedia(c)}
  ${body}
</article>`;
}

const contactSection = (heading, copy) => `<div class="contact">
  <div class="contact-copy" data-reveal>
    <p class="label label-accent">Contact</p>
    <h2 class="h2">${heading}</h2>
    <p class="lede">${copy}</p>
  </div>
  <form class="contact-form" data-reveal novalidate data-state="idle">
    <div class="delivery-route" aria-hidden="true">
      <span data-route-step="browser"><i></i>Browser</span><b>→</b>
      <span data-route-step="worker"><i></i>Worker</span><b>→</b>
      <span data-route-step="inbox"><i></i>Inbox</span>
    </div>
    <div class="field">
      <label for="cf-name">Name</label>
      <input id="cf-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="80" aria-describedby="cf-name-error" aria-invalid="false">
      <p class="field-error" id="cf-name-error"></p>
    </div>
    <div class="field">
      <label for="cf-email">Email</label>
      <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="254" aria-describedby="cf-email-error" aria-invalid="false">
      <p class="field-error" id="cf-email-error"></p>
    </div>
    <div class="field">
      <label for="cf-message">Message</label>
      <textarea id="cf-message" name="message" rows="6" required minlength="20" maxlength="4000" placeholder="What are you building, and where does the backend hurt?" aria-describedby="cf-message-error" aria-invalid="false"></textarea>
      <p class="field-error" id="cf-message-error"></p>
    </div>
    <div class="field-trap" aria-hidden="true">
      <label for="cf-website">Leave this field empty</label>
      <input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off">
    </div>
    <div class="form-foot">
      <button class="button button-primary magnetic submit-button" type="submit"><span data-button-label>Send message</span><span class="submit-track" aria-hidden="true"></span></button>
      <p class="form-status" role="status" aria-live="polite" tabindex="-1"></p>
    </div>
    <noscript><p class="form-note">This form needs JavaScript to send. Without it, email me at <a class="link" href="mailto:${email}">${email}</a>.</p></noscript>
  </form>
  <div class="contact-routes" data-reveal-group>
    <a href="mailto:${email}"><small>Email</small><b>${email}</b></a>
    <a href="${linkedin}"><small>Profile</small><b>LinkedIn ${arrow}</b></a>
    <a href="${repo}"><small>Code</small><b>GitHub ${arrow}</b></a>
  </div>
</div>`;

/* ------------------------------------------------------------------ *
 * Home — one narrative: who, proof, depth, range, method, person, contact
 * ------------------------------------------------------------------ */

const home = shell(
  "Backend Engineer for AI & Data Products",
  "Sercan Özkan — backend and applied AI engineering case studies with architecture, tests and measured results.",
  `
<section class="hero shell">
  <div class="hero-top" data-reveal>
    <p class="status"><span class="status-dot" aria-hidden="true"></span>Available for backend &amp; applied AI roles</p>
    <p class="label">Istanbul · Türkiye</p>
  </div>
  <div data-reveal>
    <h1 class="display">${maskLines(["Backends for AI and", "data products, built", "to be <em>proven</em>."])}</h1>
  </div>
  <p class="lede hero-lede" data-reveal>I design and build Python/FastAPI services, data pipelines and retrieval-grounded AI features — then push the same habits into simulation and XR, where a system cannot be faked into looking like it works.</p>
  <p class="actions hero-actions" data-reveal>
    <a class="button button-primary magnetic" href="#work">View selected work</a>
    <a class="button" href="#contact">Contact me</a>
    <a class="button button-quiet link" href="${cv}">Download CV ${arrow}</a>
  </p>
  <dl class="hero-meta" data-reveal-group>
    <div><dt>Building across</dt><dd>Web · AI · Cloud · Interactive</dd></div>
    <div><dt>Primary stack</dt><dd>Python · FastAPI · PostgreSQL · React</dd></div>
    <div><dt>Evidence</dt><dd>1,190+ automated tests across three systems</dd></div>
    <div><dt>Currently</dt><dd>Computer engineering student, open to roles</dd></div>
  </dl>

  <figure class="exhibit" data-reveal>
    <div class="exhibit-head">
      <p class="label label-accent">Live system · CV Analyzer</p>
      <h2>Four runtimes over one domain model</h2>
    </div>
    <div class="exhibit-figure parallax">${diagrams["cv-analyzer"]}</div>
    <p class="exhibit-scroll" aria-hidden="true">Scroll the diagram →</p>
  </figure>
</section>

<section class="section ruled shell" id="work">
  ${sectionHead("Selected work", "Three systems, each with its architecture, its tests, and its limits.", "Every number on this page is counted from the repository it belongs to.")}
  <div class="work-list">${cases.map((c, i) => project(c, { eager: i === 0 })).join("")}</div>
</section>

<section class="section ruled shell" id="case">
  ${sectionHead("Featured case study", "CV Analyzer, from a parsing problem to a four-runtime product.")}
  <div class="study">
    <div class="study-steps" data-reveal-group>
      <div class="study-step"><p class="index">01 · Problem</p><h3>Every résumé layout is a different document</h3><p>${featured.problem} Sending each one to a model is accurate enough, but the cost and the variance both scale with the upload count.</p></div>
      <div class="study-step"><p class="index">02 · Approach</p><h3>Deterministic first, model as fallback</h3><p>A rules-based extraction and normalization pipeline runs first, and a fragmentation quality gate decides whether the parse actually fell apart. Only then does an LLM get paid for.</p></div>
      <div class="study-step"><p class="index">03 · Build</p><h3>One domain model, four runtimes</h3><p>A FastAPI gateway with JWT auth and plan quotas, a React portal, an Expo mobile client, and a PySide6 desktop worker that keeps sensitive batches on the user's own machine until a sync is asked for.</p></div>
      <div class="study-step"><p class="index">04 · Decisions</p><h3>Queues instead of request-time work</h3><p>Batch processing is measured in minutes. Celery and Redis take it off the request path, which turns a retry into a queue concern rather than a user-facing failure.</p></div>
      <div class="study-step"><p class="index">05 · Result</p><h3>A suite that has to pass before anything merges</h3><p>${featured.outcome}</p></div>
    </div>
    <figure class="study-figure" data-reveal>
      <dl class="readout">${readout.map(([k, v, note]) => `<div><dt>${k}</dt><dd><b>${v}</b><span>${note}</span></dd></div>`).join("")}</dl>
      <figcaption>Counted from the CV Analyzer repository and its case study. Nothing here is estimated.</figcaption>
    </figure>
  </div>
</section>

<section class="section ruled shell" id="capabilities">
  ${sectionHead("Capabilities", "What I can be handed on day one.", "Each line below is backed by a project on this site, not by a course.")}
  <div class="caps" data-reveal-group>
    ${capabilities.map(([icon, title, items]) => `<article class="cap">
      <span class="cap-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[icon]}</svg></span>
      <h3>${title}</h3>
      <ul>${items.map(([name, detail]) => `<li><b>${name}</b><span>${detail}</span></li>`).join("")}</ul>
    </article>`).join("")}
  </div>
</section>

<section class="section ruled shell" id="process">
  ${sectionHead("How I build", "Five steps, and the last one is where most portfolios stop.")}
  <div class="process" data-reveal>
    <span class="process-fill" aria-hidden="true"></span>
    ${process.map(([n, h, p]) => `<article><b>${n}</b><h3>${h}</h3><p>${p}</p></article>`).join("")}
  </div>
</section>

<section class="section ruled shell" id="experience">
  ${sectionHead("Experience", "Low-latency drone video, measured rather than assumed.")}
  <div class="about" data-reveal>
    <div class="about-main">
      <h3 class="h3">${experience.role} — ${experience.org}</h3>
      <p class="label t-meta">${experience.place} · ${experience.period}</p>
      <ul class="about-list">${experience.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
    </div>
    <div class="about-side"><p class="label">Worked with</p>${tags(experience.tags)}</div>
  </div>
</section>

<section class="section ruled shell" id="about">
  ${sectionHead("About", "I learn complex systems by making their boundaries visible.")}
  <div class="about">
    <div class="about-main" data-reveal>
      <p class="lede">I&apos;m Sercan Özkan, a computer engineering student focused on backend engineering for AI and data-heavy products.</p>
      <p class="prose t-body">I build APIs, data workflows and grounded AI features, then use simulation and XR projects to push the same engineering habits into harder technical domains. I want to trace how a decision is made, understand where data moves, and know what fails before adding another layer.</p>
      <p class="prose">AI helps me plan, question, and document the work. I still check the source, run the important paths, record uncertainty, and keep the technical decisions explainable — which is why every case study on this site ends with what is still unfinished.</p>
      <p class="actions t-actions"><a class="button" href="${base}/about/">More about how I work</a></p>
    </div>
    <div class="about-side" data-reveal>
      <p class="label">Known limits, stated</p>
      <ul class="about-list">
        <li>Siliqon and VR Teacher are private, so their source cannot be inspected publicly.</li>
        <li>VR Teacher&apos;s evaluation harness is built but not yet reported, so no quality score is claimed.</li>
        <li>Siliqon has no public deployment, so it cannot be tried from a link.</li>
      </ul>
    </div>
  </div>
</section>

<section class="section ruled shell" id="contact">
  ${contactSection("Have something worth building?", "Tell me about the problem, the idea, or the opportunity. This form posts to a small API I wrote and host myself — it validates the message and hands it to an email service, and it reaches my inbox directly.")}
</section>`,
  { path: "/", current: "", scripts: contactScript });

/* ------------------------------------------------------------------ *
 * Work index
 * ------------------------------------------------------------------ */

const work = shell(
  "Work",
  "Three engineering case studies: resume intelligence, browser circuit simulation, and VR learning — each with architecture, tests and limits.",
  `<section class="hero shell">
    <p class="label label-accent" data-reveal>Work / 2026</p>
    <div data-reveal><h1 class="display-sm t-title">${maskLines(["Evidence travels", "with the work."])}</h1></div>
    <p class="lede t-lede" data-reveal>Three flagship projects spanning resume intelligence, browser-based electronics simulation, and VR learning. Every case records the problem, the engineering decisions, how it was tested, and what is still unfinished.</p>
  </section>
  <section class="section shell">
    <div class="work-list">${cases.map((c, i) => project(c, { eager: i === 0 })).join("")}</div>
  </section>
  <section class="section ruled shell" id="contact">
    ${contactSection("Want the detail behind one of these?", "Ask about any decision on these pages — the trade-offs are the interesting part. This form posts to a small API I wrote and host myself.")}
  </section>`,
  { path: "/work/", current: "work", scripts: contactScript });

/* ------------------------------------------------------------------ *
 * About
 * ------------------------------------------------------------------ */

const about = shell(
  "About",
  "How Sercan Özkan approaches backend systems, applied AI and technically complex products.",
  `<section class="hero shell">
    <p class="label label-accent" data-reveal>About</p>
    <div data-reveal><h1 class="display-sm t-title">${maskLines(["I learn complex systems by", "making their boundaries visible."])}</h1></div>
  </section>
  <section class="section shell">
    <div class="about">
      <div class="about-main" data-reveal>
        <p class="lede">I&apos;m Sercan Özkan, a computer engineering student focused on backend engineering for AI and data-heavy products.</p>
        <p class="prose t-body">I build APIs, data workflows and grounded AI features, then use simulation and XR projects to push the same engineering habits into harder technical domains. I want to trace how a decision is made, understand where data moves, and know what fails before adding another layer. Outside personal work I spent a summer on low-latency drone video streaming at ${experience.org}, measuring latency and packet loss across RTSP and RTP transports.</p>
        <p class="prose">AI helps me plan, question, and document the work. I still check the source, run important paths, record uncertainty, and keep the technical decisions explainable.</p>
        <p class="prose">The pattern that runs through all three projects on this site is the same: do the deterministic thing first, put a model behind a gate, and keep a test that proves the boundary still holds.</p>
        <p class="actions t-actions"><a class="button button-primary" href="${base}/work/">See the case studies</a><a class="button" href="${cv}">Download CV ${arrow}</a></p>
      </div>
      <div class="about-side" data-reveal>
        <figure class="about-figure">${imgTag("identity-kit.webp", "Sercan Özkan identity kit: logotype, palette and type specimen", { eager: true })}</figure>
        <p class="label">Current limitations</p>
        <ul class="about-list">
          <li>Siliqon has no public deployment, so it cannot be tried from a link.</li>
          <li>VR Teacher&apos;s evaluation harness is implemented; benchmark results are still being collected.</li>
          <li>Siliqon and VR Teacher are private, so their source cannot be inspected publicly.</li>
          <li>VR Teacher still needs a strong in-headset demo capture.</li>
          <li>There is no custom domain or analytics yet.</li>
          <li>I used the identity kit instead of inventing a portrait.</li>
        </ul>
      </div>
    </div>
  </section>
  <section class="section ruled shell" id="contact">
    ${contactSection("Let&apos;s talk about the system behind the screen.", "If you need backend engineering for an API, a data workflow or a grounded AI product — and value clear evidence over mystery — send me a note.")}
  </section>`,
  { path: "/about/", current: "about", scripts: contactScript });

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ */

const contact = shell(
  "Contact",
  "Contact Sercan Özkan about backend and applied AI engineering work.",
  `<section class="hero shell">
    <p class="label label-accent" data-reveal>Contact</p>
    <div data-reveal><h1 class="display-sm t-title">${maskLines(["Let&apos;s talk about the", "system behind the screen."])}</h1></div>
    <p class="lede t-lede" data-reveal>If you need backend engineering for an API, a data workflow or a grounded AI product — and value clear evidence over mystery — send me a note. The form below reaches my inbox directly.</p>
  </section>
  <section class="section shell">
    ${contactSection("Have something worth building?", "Tell me about the problem, the idea, or the opportunity. This form posts to a small API I wrote and host myself: it validates the message, rate-limits abuse, and hands it to an email service that delivers it to me. I read every one and reply from my own address.")}
  </section>`,
  { path: "/contact/", current: "contact", scripts: contactScript });

/* ------------------------------------------------------------------ *
 * 404
 * ------------------------------------------------------------------ */

const notFound = shell(
  "Page not found",
  "That page does not exist on this portfolio.",
  `<section class="hero shell">
    <p class="label label-accent">Error 404</p>
    <h1 class="display-sm t-title">This page does not exist.</h1>
    <p class="lede t-lede">The link is broken or the page moved. The work, the case studies and the contact form are all one step away.</p>
    <p class="actions t-actions"><a class="button button-primary" href="${base}/">Back to the start</a><a class="button" href="${base}/work/">See the work</a></p>
  </section>`,
  { path: "/404.html" });

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
<header class="case-hero shell">
  <a class="back" href="${base}/work/">← All work</a>
  <p class="project-index t-title"><span>${c.number}</span><span class="kind">${c.kind}</span></p>
  <div data-reveal><h1 class="display-sm">${maskLines([c.title])}</h1></div>
  <p class="lede t-lede" data-reveal>${c.strap} ${c.summary}</p>
  ${caseLinks(c, { onCasePage: true })}
</header>

<div class="shell"><dl class="overview" data-reveal-group>${overview.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div>

<figure class="proof shell" data-reveal>
  <div class="proof-media">${imgTag(c.image, `Evidence for ${c.title}: ${c.oneLine}`, { eager: true })}</div>
  <figcaption><span class="label">Evidence</span>${c.proof}</figcaption>
</figure>

<section class="shell" data-reveal>
  <p class="label label-accent">Architecture</p>
  <h2 class="h2 t-heading">How the pieces fit</h2>
  <figure class="exhibit"><div class="exhibit-figure">${diagrams[c.slug]}</div><p class="exhibit-scroll" aria-hidden="true">Scroll the diagram →</p></figure>
</section>

<div class="case-body shell section">
  <aside class="case-aside" data-reveal>
    <p class="label">Stack</p>
    ${chips(c.stack)}
    ${chips(c.chips, true)}
  </aside>
  <div class="case-main">
    <section data-reveal><p class="label label-accent">Challenge</p><h2>What needed to change</h2><p>${c.challenge}</p></section>
    <section data-reveal><p class="label label-accent">Approach</p><h2>How I built it</h2><ol>${c.approach.map((x) => `<li>${x}</li>`).join("")}</ol></section>
    <section data-reveal><p class="label label-accent">Engineering decisions</p><h2>Why it is built this way</h2><dl class="decisions">${c.decisions.map(([q, a]) => `<div><dt>${q}</dt><dd>${a}</dd></div>`).join("")}</dl></section>
    <section data-reveal><p class="label label-accent">Testing</p><h2>How it is verified</h2><p>${c.testing}</p></section>
    <section data-reveal><p class="label label-accent">Result</p><h2>What landed</h2><p>${c.outcome}</p></section>
    <section class="limit" data-reveal><p class="label">What is not finished</p><h2 class="h3">Honest limits</h2><p>${c.limitation}</p></section>
  </div>
</div>

<div class="shell"><nav class="next-case" aria-label="Next case study">
  <p class="label">Next case</p>
  <a href="${base}/work/${next.slug}/">${next.title} ${arrowRight}</a>
</nav></div>
</article>`;

  const dir = join(root, "work", c.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"),
    shell(c.title, c.summary, body, { path: `/work/${c.slug}/`, current: "work" }));
}

const urls = ["/", "/work/", "/about/", "/contact/", ...cases.map((c) => `/work/${c.slug}/`)];
await writeFile(join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${site}${u}</loc></url>`).join("\n") + `\n</urlset>\n`);

await writeFile(join(root, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`Built ${urls.length + 2} pages, sitemap and robots.txt.`);
