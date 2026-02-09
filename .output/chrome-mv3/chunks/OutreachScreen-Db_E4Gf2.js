import{c as Q,r as l,j as e,C as me,a as H,b as Z,u as W,Z as ie,R as ne,d as he,P as fe}from"./sidepanel-C07SLsau.js";import{P as re}from"./icons-BMjcCgZl.js";import{C as B,a as G,b as Y,c as _,B as le,d as X}from"./badge-iP5lC0gp.js";import{L as ge,B as D}from"./button-FZWBz2j-.js";import{G as xe,f as pe,c as be,T as ee,C as ye,A as ae}from"./alert-DS_8i131.js";import{E as ce}from"./external-link-BYugeYAP.js";import{s as te,e as J,g as we,a as ve}from"./openrouter-BcGTOTcb.js";import{f as oe,c as je,a as Ne}from"./crm-Q1QJXVE-.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=Q("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=Q("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=Q("OctagonAlert",[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=Q("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);function Ae(s){let t=0;for(let o=0;o<s.length;o++)t=s.charCodeAt(o)+((t<<5)-t);const r=Math.abs(t%360),n=(r+40)%360;return`linear-gradient(135deg, oklch(0.55 0.15 ${r}), oklch(0.45 0.18 ${n}))`}const se=l.forwardRef(({className:s,src:t,alt:r,fallback:n,size:o="md",variant:i="circle",status:c,loading:d=!1,error:f=!1,...g},C)=>{const[S,y]=l.useState(!1),U={xs:"w-5 h-5 text-[12px]",sm:"w-8 h-8 text-xs",md:"w-10 h-10 text-sm",lg:"w-12 h-12 text-base",xl:"w-16 h-16 text-lg"},A={xs:10,sm:12,md:14,lg:16,xl:18}[o],b={online:"var(--color-success)",offline:"var(--color-muted-foreground)",away:"var(--color-warning)",busy:"var(--color-destructive)"},N=f||S,E=N||!t,R=l.useMemo(()=>Ae(n||r||"?"),[n,r]);return e.jsxs("div",{ref:C,className:H("relative inline-flex flex-shrink-0",U[o],s),...g,children:[e.jsxs("div",{className:H("relative w-full h-full inline-flex items-center justify-center overflow-hidden","font-semibold text-white",{"rounded-full":i==="circle","rounded-lg":i==="square"}),style:E?{background:R}:void 0,children:[d&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10",children:e.jsx(ge,{size:A,className:"animate-spin text-muted-foreground"})}),E?N&&!n?e.jsx("div",{className:"w-full h-full flex items-center justify-center bg-destructive/10",children:e.jsx(me,{size:A,className:"text-destructive"})}):e.jsx("span",{className:"select-none","aria-label":r||n||"Avatar",children:n}):e.jsx("img",{src:t,alt:r||"",className:"w-full h-full object-cover",onError:()=>y(!0)})]}),c&&e.jsx("span",{className:H("absolute bottom-0 right-0 block rounded-full ring-2 ring-background",{"h-1.5 w-1.5":o==="xs"||o==="sm","h-2.5 w-2.5":o==="md"||o==="lg","h-3 w-3":o==="xl"}),style:{backgroundColor:b[c]},role:"status","aria-label":`Status: ${c}`})]})});se.displayName="Avatar";function Ee({data:s}){var r,n;const t=re[s.platform]||re.generic;return e.jsx(B,{variant:"default",children:e.jsxs(G,{className:"p-5",children:[e.jsxs("div",{className:"flex items-center gap-3.5 mb-3.5",children:[e.jsx(se,{src:s.avatarUrl,fallback:((r=s.name)==null?void 0:r.charAt(0).toUpperCase())||((n=s.ogTitle)==null?void 0:n.charAt(0).toUpperCase())||"?",size:"lg",variant:"circle"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h2",{className:"text-base font-semibold text-foreground truncate tracking-tight",children:s.name||s.ogTitle||s.title}),e.jsx(t,{size:14,className:"text-muted-foreground/60 shrink-0"})]}),(s.location||s.company)&&e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5 truncate",children:[s.location,s.company].filter(Boolean).join(" · ")}),s.headline&&e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5 line-clamp-1",children:s.headline})]})]}),s.bio&&e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5",children:s.bio}),s.about&&!s.bio&&e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5",children:s.about}),s.followers&&e.jsx("div",{className:"flex items-center gap-3 text-xs text-muted-foreground pb-3.5 mb-3.5 border-b border-border/30",children:e.jsxs("span",{children:[e.jsx("span",{className:"text-foreground font-medium tabular-nums",children:s.followers})," followers"]})}),s.recentPosts&&s.recentPosts.length>0&&e.jsxs("div",{children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5",children:"Recent posts"}),e.jsx("div",{className:"space-y-2",children:s.recentPosts.slice(0,3).map((o,i)=>e.jsx("p",{className:"text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed",children:o},i))})]})]})})}const Re=l.memo(Ee,(s,t)=>s.data.name===t.data.name&&s.data.headline===t.data.headline&&s.data.bio===t.data.bio);function Ie({data:s}){return e.jsx(B,{variant:"default",children:e.jsxs(G,{className:"p-5",children:[e.jsxs("div",{className:"flex items-start gap-3.5 mb-3.5",children:[e.jsx(se,{fallback:e.jsx(xe,{size:20}),size:"md",variant:"circle"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h2",{className:"text-base font-semibold text-foreground truncate tracking-tight",children:s.hostname}),s.ogTitle&&e.jsx("p",{className:"text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed",children:s.ogTitle}),!s.ogTitle&&s.h1&&e.jsx("p",{className:"text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed",children:s.h1})]})]}),s.ogDescription&&e.jsx("p",{className:"text-sm text-muted-foreground line-clamp-3 mb-3.5 leading-relaxed",children:s.ogDescription}),s.socialLinks&&s.socialLinks.length>0&&e.jsxs("div",{className:"border-t border-border/30 pt-3.5 mt-3.5",children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5",children:"Detected social links"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:s.socialLinks.map((t,r)=>e.jsxs("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:"text-xs text-foreground/70 hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200",children:[new URL(t).hostname,e.jsx(ce,{size:15})]},r))})]}),s.email&&e.jsxs("div",{className:"border-t border-border/30 pt-3.5 mt-3.5",children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-1.5",children:"Contact"}),e.jsx("a",{href:`mailto:${s.email}`,className:"text-sm text-foreground/70 hover:text-foreground transition-colors duration-200",children:s.email})]})]})})}const Me=l.memo(Ie,(s,t)=>s.data.hostname===t.data.hostname&&s.data.ogTitle===t.data.ogTitle&&s.data.ogDescription===t.data.ogDescription);function Te({text:s,onCopy:t}){const[r,n]=l.useState(!1),o=async()=>{try{await navigator.clipboard.writeText(s),n(!0),t&&t(),setTimeout(()=>n(!1),1500)}catch(i){console.error("Failed to copy:",i)}};return e.jsx(D,{variant:r?"success":"primary",onClick:o,"aria-label":r?"Copied!":"Copy to clipboard",size:"md",className:"w-full",children:r?e.jsxs(e.Fragment,{children:[e.jsx(Z,{size:15}),"Copied!"]}):e.jsxs(e.Fragment,{children:[e.jsx(ke,{size:15}),"Copy Message"]})})}const $e=l.memo(Te,(s,t)=>s.text===t.text);function Le({initialMessage:s,onSave:t,onClose:r}){const[n,o]=l.useState(s),i=l.useRef(null),c=n.split(/\s+/).filter(Boolean).length,d=!n.trim()||n===s;return l.useEffect(()=>{i.current&&(i.current.focus(),i.current.setSelectionRange(n.length,n.length));const f=g=>{g.key==="Escape"&&r()};return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[]),e.jsx("div",{className:"fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in",onClick:r,role:"dialog","aria-modal":"true","aria-label":"Edit message",children:e.jsxs("div",{className:"w-full bg-card border-t border-border/60 rounded-t-2xl animate-slide-up",onClick:f=>f.stopPropagation(),children:[e.jsx("div",{className:"w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-2"}),e.jsxs("div",{className:"p-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"Edit Message"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[c,"w"]})]}),e.jsx("textarea",{ref:i,value:n,onChange:f=>o(f.target.value),className:"w-full h-40 px-3 py-2.5 rounded-lg bg-background border border-border/60 text-[14px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors",placeholder:"Edit your message...","aria-label":"Edit message content"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(D,{onClick:r,variant:"ghost",size:"sm",className:"flex-1",children:"Cancel"}),e.jsxs(D,{onClick:()=>t(n),variant:"primary",size:"sm",className:"flex-1",disabled:d,children:[e.jsx(Z,{size:15}),"Save"]})]})]})]})})}const Oe={short:"Message must be 40-80 words. Be punchy and direct — 2-3 sentences max. Get to the point fast.",medium:"Message must be 100-150 words. Balance detail with brevity — 3-4 paragraphs.",long:"Message must be 180-250 words. Be thorough — include context, specific references, and a detailed value proposition."},ze=`MESSAGE STRUCTURE (follow this framework):
1. HOOK (1-2 sentences): Open with something specific about THEM — a recent post, project, or achievement. Make it clear you've done your homework. Never start with "I" or "My".
2. BRIDGE (1-2 sentences): Connect their world to yours. Show you understand their challenges or goals.
3. VALUE (1-2 sentences): What specific value can you offer? Be concrete — not "let's collaborate" but what exactly.
4. CTA (1 sentence): Clear, low-commitment ask. A question works best. Make it easy to say yes.`;function ue(s){const t={};for(const[r,n]of Object.entries(s))n==null||n===""||Array.isArray(n)&&n.length===0||typeof n=="object"&&!Array.isArray(n)&&Object.keys(n).length===0||["hostname","isReady","scrapedAt","ogImage"].includes(r)||(t[r]=n);return t}function Pe(s){const t=ue(s);return s.platform==="linkedin"?`You are an expert at analyzing LinkedIn profiles to identify high-value outreach opportunities.

PROFILE DATA:
${JSON.stringify(t,null,2)}

IMPORTANT: The "profileSections" field contains raw text extracted from LinkedIn profile sections. Parse it carefully — it may contain role titles, company names, dates, descriptions, school names, certifications, and other structured information embedded in the text.

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "personName": "full name",
  "summary": "3-4 sentences: their current role, company, career trajectory, and what they seem to care about. Be specific — mention actual company names, titles, and industries.",
  "interests": ["5-7 SPECIFIC professional interests derived from their experience, skills, about section, and activity. NOT generic like 'technology' — specific like 'B2B SaaS growth marketing' or 'React Native mobile development'"],
  "outreachAngles": [
    { "angle": "service", "hook": "specific service offering tied to their current role/company challenges", "relevance": "why this matters for their specific situation" },
    { "angle": "partner", "hook": "concrete partnership idea based on complementary capabilities", "relevance": "specific mutual benefit" },
    { "angle": "community", "hook": "shared professional interest or industry connection", "relevance": "why connecting makes sense now" },
    { "angle": "value", "hook": "specific resource, insight, or introduction you could offer", "relevance": "why they'd find this valuable" }
  ],
  "confidence": 0-100,
  "confidenceReason": "explain what data was available and what was missing"
}

LinkedIn analysis rules:
- Extract SPECIFIC details: company names, job titles, technologies, industries, school names
- If experience data is available, identify their career trajectory and current focus
- If they have an About section, treat it as their own words about their priorities
- Connection degree context: 1st = warm (reference existing connection), 2nd = mention mutual connections, 3rd = establish credibility first
- If skills are listed, use them to understand technical/professional expertise
- If education is available, note alma mater for potential shared background
- If recent activity is available, reference it — it shows what they're currently thinking about
- Each outreach angle MUST reference specific details from their profile, not generic templates
- interests must be specific professional topics derived from evidence in the profile
- If profileSections contains raw text, parse it to extract structured information the selectors may have missed`:`You analyze webpages to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(t,null,2)}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "personName": "best guess — person name or page/company name",
  "summary": "2-3 sentences about who this is and what they do",
  "interests": ["3-5 topics based on available evidence"],
  "outreachAngles": [
    { "angle": "service", "hook": "specific reason", "relevance": "why now" },
    { "angle": "partner", "hook": "...", "relevance": "..." },
    { "angle": "community", "hook": "...", "relevance": "..." },
    { "angle": "value", "hook": "...", "relevance": "..." }
  ],
  "confidence": 0-100,
  "confidenceReason": "based on data quality"
}

Rules:
- If data is sparse, confidence should be lower but ALWAYS provide angles
- Work with whatever context you have. Never refuse.
- For generic sites, focus on what IS visible (title, meta, content)
- interests must be specific topics, not generic phrases
- Each angle must have a unique hook based on actual page content
- confidenceReason should explain the rating`}function Ve(s,t,r,n,o="medium"){const i=ue(s);let c=`Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(i,null,2)}

ANALYSIS:
${JSON.stringify(t,null,2)}

SELECTED ANGLE: ${r}

`;return s.threadContext&&s.threadContext.length>0&&(c+=`THREAD CONTEXT (this person is replying in a conversation):
${s.threadContext.map((d,f)=>`[${f+1}] ${d}`).join(`
`)}

Use the thread context to make the message more relevant and timely.

`),n&&n.register?c+=De(n):n&&(c+=Fe(n)),c+=`${ze}

`,c+=Be(s),c+=`Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message following the Hook→Bridge→Value→CTA structure",
  "wordCount": number,
  "hook": "1-sentence explanation of why this approach works for this specific person",
  "voiceScore": 0-100
}

Rules:
- ${Oe[o]}
- Follow the Hook→Bridge→Value→CTA structure
- Reference specific details from the page/analysis — names, projects, posts, roles
- voiceScore: Rate honestly how well the message matches the voice profile (if provided)
- The message must sound like a REAL PERSON wrote it, not an AI
- Never use clichés like "I hope this finds you well", "I came across your profile", "I'd love to pick your brain"
- Never start with "I" — start with something about THEM`,c}function De(s){let t=`═══ VOICE PROFILE (CRITICAL — match this voice precisely) ═══

`;if(t+=`REGISTER DIMENSIONS (Biber's 6-factor model, 1-10 scale):
- Involved↔Informational: ${s.register.involvedVsInformational}/10 (${s.register.involvedVsInformational<=4?"personal/emotional":s.register.involvedVsInformational>=7?"detached/factual":"balanced"})
- Narrative↔Non-narrative: ${s.register.narrativeVsNonNarrative}/10 (${s.register.narrativeVsNonNarrative<=4?"story-like":s.register.narrativeVsNonNarrative>=7?"expository":"mixed"})
- Situation-dependent↔Explicit: ${s.register.situationDependentVsExplicit}/10
- Non-persuasive↔Persuasive: ${s.register.nonPersuasiveVsPersuasive}/10
- Concrete↔Abstract: ${s.register.concreteVsAbstract}/10
- Casual↔Formal: ${s.register.casualVsFormalElaboration}/10

`,t+=`TONE: ${s.tone.primary} (primary), ${s.tone.secondary} (secondary)
- Humor: ${s.tone.humor}
- Confidence: ${s.tone.confidence}
- Style descriptors: ${s.descriptors.join(", ")}

`,s.rules.length>0&&(t+=`VOICE RULES (you MUST follow these):
${s.rules.map((r,n)=>`${n+1}. ${r}`).join(`
`)}

`),s.antiPatterns.length>0&&(t+=`ANTI-PATTERNS (NEVER do these):
${s.antiPatterns.map(r=>`✗ ${r}`).join(`
`)}

`),s.signatures){const r=s.signatures;r.openingPatterns.length>0&&(t+=`OPENING PATTERNS: ${r.openingPatterns.join(" | ")}
`),r.transitionWords.length>0&&(t+=`TRANSITION WORDS: ${r.transitionWords.join(", ")}
`),r.closingPatterns.length>0&&(t+=`CLOSING PATTERNS: ${r.closingPatterns.join(" | ")}
`),r.catchphrases.length>0&&(t+=`CATCHPHRASES: ${r.catchphrases.join(" | ")}
`),t+=`
`}return s.metrics&&(t+=`QUANTITATIVE ANCHORS (match these numbers):
${pe(s.metrics)}

`),s.exemplars&&s.exemplars.length>0&&(t+=`═══ WRITING EXEMPLARS (study these carefully — replicate this EXACT style) ═══
${s.exemplars.slice(0,3).map((r,n)=>`--- Exemplar ${n+1} (${r.wordCount} words, ${r.context}) ---
${r.text}`).join(`

`)}

CRITICAL: The message you generate must read as if the SAME PERSON who wrote the exemplars above wrote it. Match their sentence rhythm, word choices, punctuation habits, and energy level.

`),t}function Fe(s){var r,n,o;let t=`VOICE PROFILE (match this tone and style):
`;return s.tone!==void 0&&(t+=`- Tone: ${s.tone}/10
`),(r=s.openingPatterns)!=null&&r.length&&(t+=`- Opening patterns: ${s.openingPatterns.join(", ")}
`),(n=s.personalityMarkers)!=null&&n.length&&(t+=`- Personality markers: ${s.personalityMarkers.join(", ")}
`),(o=s.avoidPhrases)!=null&&o.length&&(t+=`- Avoid: ${s.avoidPhrases.join(", ")}
`),s.avgSentenceLength&&(t+=`- Average sentence length: ${s.avgSentenceLength} words
`),s.formalityScore!==void 0&&(t+=`- Formality: ${s.formalityScore}/100
`),t+=`
`,t}function Be(s){if(s.platform==="linkedin"){let t=`PLATFORM: LinkedIn
- Use professional but warm tone appropriate for LinkedIn DMs
- Reference SPECIFIC details: their actual job title, company name, a project they worked on, or a skill they have
- If their About section is available, reference something specific from it — it's their own words about what they care about
- If experience data shows a career trajectory, acknowledge it (e.g., "your move from X to Y shows...")
- If education is available and relevant, mention shared alma mater or notable programs
- If recent activity/posts are available, reference them — it's the most timely hook possible
`;if(s.connectionDegree){const r=s.connectionDegree.trim();r.includes("1")?t+=`- CONNECTION: 1st degree — you're already connected. Be warm, reference the existing connection.
`:r.includes("2")?t+=`- CONNECTION: 2nd degree — mention mutual connections if possible. Medium warmth.
`:t+=`- CONNECTION: 3rd degree or unknown — establish credibility first. Be more formal.
`}return t+=`- Avoid overly salesy language — LinkedIn users are highly sensitive to spam and generic outreach
- NEVER use phrases like "I came across your profile", "I hope this finds you well", "I'd love to connect"
- If this is a connection request note, keep it under 300 characters

`,t}return s.platform==="x"?`PLATFORM: X (Twitter)
- Use conversational, authentic tone
- Reference their recent posts or tweets if available
- Keep it casual but purposeful

`:s.platform==="github"?`PLATFORM: GitHub
- Reference their projects, contributions, or tech stack
- Use developer-friendly language
- Be specific about technical interests

`:""}function Ge(s,t,r,n){const o=Object.entries(n).filter(([,c])=>c<70).sort((c,d)=>c[1]-d[1]).map(([c,d])=>`${c}: ${d}/100`);let i=`You are a voice-matching editor. A message was generated to match a specific voice profile, but scored ${r}/100 on voice matching.

GENERATED MESSAGE:
"${s}"

`;return o.length>0&&(i+=`WEAK DIMENSIONS (fix these):
${o.join(`
`)}

`),i+=`VOICE RULES TO FOLLOW:
${t.rules.map((c,d)=>`${d+1}. ${c}`).join(`
`)}

ANTI-PATTERNS TO AVOID:
${t.antiPatterns.map(c=>`✗ ${c}`).join(`
`)}

`,t.metrics&&(i+=`TARGET METRICS:
- Sentence length: aim for ~${t.metrics.sentenceLength.mean} words per sentence
- Formality: ${t.metrics.formalityScore}/100
- Contraction rate: ${t.metrics.contractionRate}% of sentences should use contractions
- Active voice: ${t.metrics.activeVoiceRate}%
${t.metrics.punctuation.exclamationRate>10?`- Use exclamation marks (${t.metrics.punctuation.exclamationRate}% of sentences)`:"- Avoid exclamation marks"}
${t.metrics.punctuation.questionRate>15?`- Include questions (${t.metrics.punctuation.questionRate}% of sentences)`:""}

`),t.exemplars&&t.exemplars.length>0&&(i+=`REFERENCE EXEMPLARS (match this style):
${t.exemplars.slice(0,2).map((c,d)=>`--- ${d+1} ---
${c.text}`).join(`

`)}

`),i+=`TASK: Rewrite the message to better match the voice profile. Fix the weak dimensions while keeping the same intent, recipient context, and call-to-action. The rewritten message should score 85+ on voice matching.

Return JSON (no markdown, no code blocks):
{
  "message": "rewritten message",
  "wordCount": number,
  "hook": "same hook as before",
  "voiceScore": 0-100,
  "changes": "brief description of what you changed and why"
}`,i}function K(s){const t=J(s);try{const n=JSON.parse(t);if(n.message)return n.message}catch{}const r=t.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/s);return r!=null&&r[1]?r[1].replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").replace(/\\t/g,"	"):null}function Ue(){const[s,t]=l.useState({}),[r,n]=l.useState({}),[o,i]=l.useState({}),[c,d]=l.useState({}),[f,g]=l.useState({}),[C,S]=l.useState("service"),[y,U]=l.useState(null),[A,b]=l.useState(0),N=W(x=>x.apiKey),E=W(x=>x.preferredModel),R=l.useRef(null),F=l.useRef(null),P=l.useRef(null),k=l.useRef(null),p=3;l.useEffect(()=>{const x=()=>{chrome.storage.local.get("voiceProfile",a=>{a.voiceProfile&&U(a.voiceProfile)})};x();const u=()=>x();return chrome.storage.onChanged.addListener(u),()=>chrome.storage.onChanged.removeListener(u)},[]);const $=l.useCallback(()=>{k.current&&(k.current.abort(),k.current=null)},[]),v=l.useCallback((x,u)=>{if(!(y!=null&&y.metrics)){g(a=>({...a,[u]:null}));return}try{const a=be(x,y.metrics);g(w=>({...w,[u]:a}))}catch(a){console.warn("[useMessageGeneration] Voice match scoring failed:",a),g(w=>({...w,[u]:null}))}},[y]),L=l.useCallback(async(x,u,a)=>{if(!N)return;R.current=x,F.current=u,P.current=a,$();const w=new AbortController;k.current=w,i(I=>({...I,[a]:!0})),n(I=>({...I,[a]:""})),g(I=>({...I,[a]:null}));try{const I=W.getState().messageLength,z=Ve(x,u,a,y||void 0,I);let V="";await te([{role:"system",content:"You are an expert outreach copywriter. You write personalized messages that sound authentically human — never generic, never AI-sounding. You follow the Hook→Bridge→Value→CTA structure precisely."},{role:"user",content:z}],N,{signal:w.signal,onChunk:M=>{V+=M;const j=K(V);j&&n(m=>({...m,[a]:j}));try{const m=J(V),h=JSON.parse(m);h.message&&h.wordCount&&(t(T=>({...T,[a]:h})),n(T=>({...T,[a]:""})),v(h.message,a))}catch{}},onComplete:M=>{try{const j=J(M),m=JSON.parse(j);t(h=>({...h,[a]:m})),n(h=>({...h,[a]:""})),i(h=>({...h,[a]:!1})),b(0),v(m.message,a)}catch{const j=K(M);if(j){const m={message:j,wordCount:j.split(/\s+/).filter(Boolean).length,hook:"",voiceScore:50};t(h=>({...h,[a]:m})),v(j,a)}n(m=>({...m,[a]:""})),i(m=>({...m,[a]:!1}))}k.current=null},onError:M=>{if(M instanceof DOMException&&M.name==="AbortError"){i(h=>({...h,[a]:!1})),n(h=>({...h,[a]:""}));return}const j=M instanceof Error?M.message:"Generation failed";if((j.includes("network")||j.includes("timeout")||j.includes("503")||j.includes("502"))&&A<p){b(T=>T+1);const h=Math.pow(2,A)*1e3;setTimeout(()=>{R.current&&F.current&&P.current&&L(R.current,F.current,P.current)},h)}else i(h=>({...h,[a]:!1})),n(h=>({...h,[a]:""})),b(0);k.current=null}},E)}catch(I){if(I instanceof DOMException&&I.name==="AbortError"){i(z=>({...z,[a]:!1})),n(z=>({...z,[a]:""}));return}i(z=>({...z,[a]:!1})),n(z=>({...z,[a]:""})),k.current=null}},[N,y,A,$,v,E]),q=l.useCallback(async(x,u,a)=>{if(!N||!(y!=null&&y.metrics))return;const w=s[a],I=f[a];if(!w||!I)return;$();const z=new AbortController;k.current=z,d(V=>({...V,[a]:!0})),n(V=>({...V,[a]:""}));try{const V=Ge(w.message,y,I.score,I.breakdown);let M="";await te([{role:"system",content:"You are a voice-matching editor. You rewrite messages to better match a specific writing style while preserving the original intent and context."},{role:"user",content:V}],N,{signal:z.signal,onChunk:j=>{M+=j;const m=K(M);m&&n(h=>({...h,[a]:m}))},onComplete:j=>{try{const m=J(j),h=JSON.parse(m);t(T=>({...T,[a]:h})),n(T=>({...T,[a]:""})),d(T=>({...T,[a]:!1})),v(h.message,a)}catch{const m=K(j);if(m){const h={message:m,wordCount:m.split(/\s+/).filter(Boolean).length,hook:w.hook,voiceScore:70};t(T=>({...T,[a]:h})),v(m,a)}n(h=>({...h,[a]:""})),d(h=>({...h,[a]:!1}))}k.current=null},onError:j=>{if(j instanceof DOMException&&j.name==="AbortError"){d(m=>({...m,[a]:!1})),n(m=>({...m,[a]:""}));return}d(m=>({...m,[a]:!1})),n(m=>({...m,[a]:""})),k.current=null}},E)}catch{d(M=>({...M,[a]:!1})),n(M=>({...M,[a]:""})),k.current=null}},[N,y,s,f,$,v,E]),O=l.useCallback(async(x,u,a)=>{t(w=>({...w,[a]:null})),n(w=>({...w,[a]:""})),g(w=>({...w,[a]:null})),await L(x,u,a)},[L]);return{messages:s,streamingText:r,isGenerating:o,isRefining:c,voiceMatchScores:f,selectedAngle:C,setSelectedAngle:S,generateMessage:L,regenerateMessage:O,refineMessage:q,cancelGeneration:$,setMessages:t}}const qe=["i hope this message finds you well","i wanted to reach out","i came across your","i was impressed by","i'd love to connect","i'd love to chat","i'd love to learn more","let me know if you'd be open","would you be open to","looking forward to connecting","looking forward to hearing","i believe there could be","i think there's a great opportunity","synergy","leverage","circle back","touch base","deep dive","game-changer","cutting-edge","innovative solution","value proposition","thought leader","paradigm shift","best-in-class","at the end of the day","in today's fast-paced","in the ever-evolving","it's worth noting","it goes without saying","needless to say","that being said","having said that","delve into","delve deeper","navigate the complexities","foster meaningful","cultivate","spearhead","revolutionize","streamline"],He=["i noticed that","i was particularly","i'm reaching out because","i'm writing to","as someone who","as a fellow","given your expertise","given your background","with your experience","based on your"];function We(s){if(s.length<50)return 50;const t=s.toLowerCase().split(/\s+/),n=new Set(t).size/t.length,o=new Set;let i=0;for(let g=0;g<t.length-1;g++)o.add(`${t[g]} ${t[g+1]}`),i++;const c=i>0?o.size/i:1,d=Math.max(0,Math.min(100,(.7-n)*200)),f=Math.max(0,Math.min(100,(.9-c)*300));return(d+f)/2}function Je(s){const t=s.toLowerCase();let r=0;for(const n of qe)t.includes(n)&&r++;for(const n of He)t.includes(n)&&r++;return Math.min(100,r*25)}function Ye(s){const t=s.split(/[.!?]+/).filter(d=>d.trim().length>0);if(t.length<3)return 30;const r=t.map(d=>d.trim().split(/\s+/).length),n=r.reduce((d,f)=>d+f,0)/r.length,o=r.reduce((d,f)=>d+Math.pow(f-n,2),0)/r.length,i=Math.sqrt(o),c=n>0?i/n:0;return Math.max(0,Math.min(100,(.5-c)*200))}function _e(s){const t=s.toLowerCase(),r=["perhaps","maybe","possibly","potentially","arguably","it seems","it appears","it's possible","one might","could potentially","might consider","worth exploring","i think","i believe","in my opinion","from my perspective"],n=t.split(/\s+/).length;let o=0;for(const c of r){const d=new RegExp(c,"g"),f=t.match(d);f&&(o+=f.length)}const i=o/n*100;return Math.min(100,i*30)}function Ke(s){if(!s||s.length<20)return{score:0,label:"Too short to analyze",breakdown:{compression:0,phrases:0,structure:0,hedging:0},suggestions:[]};const t=We(s),r=Je(s),n=Ye(s),o=_e(s),i=Math.round(t*.2+r*.4+n*.2+o*.2),c=Math.max(0,Math.min(100,i));let d;c<=20?d="Very human":c<=40?d="Mostly human":c<=60?d="Mixed":c<=80?d="Somewhat AI":d="Very AI";const f=[];return r>40&&f.push(`Remove generic AI phrases like "I hope this finds you well" or "I'd love to connect"`),n>50&&f.push("Vary your sentence lengths — mix short punchy sentences with longer ones"),o>40&&f.push('Reduce hedging words like "perhaps", "potentially", "might consider"'),t>50&&f.push("Use more specific, unique vocabulary instead of common generic terms"),{score:c,label:d,breakdown:{compression:t,phrases:r,structure:n,hedging:o},suggestions:f}}function Xe(s){return s>=80?{label:"Sounds like you",variant:"success"}:s>=60?{label:"Close match",variant:"info"}:s>=40?{label:"Moderate match",variant:"warning"}:{label:"Generic tone",variant:"error"}}function Ze(s){return s<=20?{label:"Very human",color:"text-success"}:s<=40?{label:"Human",color:"text-info"}:s<=60?{label:"Mixed",color:"text-warning"}:{label:"AI-sounding",color:"text-destructive"}}const Qe={sentenceLength:{label:"Rhythm",desc:"Sentence length pattern"},formality:{label:"Formality",desc:"Register & tone level"},contractions:{label:"Contractions",desc:"Contraction usage"},readability:{label:"Readability",desc:"Reading level match"},pronouns:{label:"Pronouns",desc:"I/you/we usage"},punctuation:{label:"Punctuation",desc:"Marks & emphasis"}};function et({pageData:s,analysis:t,selectedAngle:r,onSelectAngle:n,onCopy:o,onRegenerate:i,onScheduleFollowUp:c}){const{messages:d,streamingText:f,isGenerating:g,isRefining:C,voiceMatchScores:S,generateMessage:y,regenerateMessage:U,refineMessage:A,setMessages:b}=Ue(),[N,E]=l.useState(!1),[R,F]=l.useState(!1),[P,k]=l.useState(!1),p=d[r],$=f[r]||"",v=g[r],L=C[r],q=(v||L)&&$.length>0,O=S[r],x=p?Ke(p.message):null,u=x?Ze(x.score):null,a=(O==null?void 0:O.score)??(p==null?void 0:p.voiceScore)??0,w=p?Xe(a):null,I=O&&O.score<70&&!L&&!v,z=m=>{n(m),!d[m]&&!g[m]&&y(s,t,m)},V=()=>{U(s,t,r),F(!1),k(!1),i&&i()},M=()=>{t&&(A(s,t,r),k(!1))},j=()=>{o&&p&&o(p.message)};return!p&&!v&&t&&y(s,t,r),e.jsxs(B,{variant:"default",children:[e.jsx(Y,{children:e.jsx(_,{children:"Message"})}),e.jsxs(G,{className:"space-y-3.5",children:[(t==null?void 0:t.outreachAngles)&&e.jsx(ee.Root,{defaultValue:r,value:r,onValueChange:z,children:e.jsx(ee.List,{children:t.outreachAngles.map(m=>e.jsx(ee.Trigger,{value:m.angle,children:m.angle.charAt(0).toUpperCase()+m.angle.slice(1)},m.angle))})}),v&&!p&&!q&&e.jsxs("div",{role:"status","aria-live":"polite","aria-label":"Generating message",className:"space-y-2.5 py-4",children:[e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-5/6 animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-4/6 animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-3/5 animate-pulse-subtle"})]}),q&&!p&&e.jsxs("div",{className:"rounded-xl bg-background/50 p-4",children:[e.jsxs("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:[$,e.jsx("span",{className:"inline-block w-[2px] h-[14px] bg-foreground ml-0.5 align-middle animate-blink"})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-3 pt-3 border-t border-border/20",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground",children:[L?"Refining voice":"Generating"," · ",$.split(/\s+/).filter(Boolean).length,"w"]})]})]}),L&&q&&p&&e.jsxs("div",{className:"rounded-xl bg-background/50 p-4 border border-border/30",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle"}),e.jsx("span",{className:"text-[12px] text-foreground/70 font-medium",children:"Refining voice match..."})]}),e.jsxs("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:[$,e.jsx("span",{className:"inline-block w-[2px] h-[14px] bg-foreground ml-0.5 align-middle animate-blink"})]})]}),p&&!L&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"rounded-xl bg-background/50 p-4",children:e.jsx("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:p.message})}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center gap-2",children:w&&e.jsxs("button",{onClick:()=>k(!P),className:"flex items-center gap-1.5 group",children:[e.jsx(le,{variant:w.variant,size:"sm",children:w.label}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[a,"%"]}),e.jsx(ye,{size:14,className:`text-muted-foreground/40 transition-transform duration-[200ms] ${P?"rotate-180":""}`})]})}),e.jsxs("div",{className:"flex items-center gap-2.5",children:[x&&u&&e.jsxs("button",{onClick:()=>F(!R),className:`flex items-center gap-1 text-[12px] ${u.color} hover:opacity-80 transition-opacity duration-200`,title:"AI-ness score — click for details",children:[e.jsx(ie,{size:14}),e.jsxs("span",{className:"tabular-nums",children:[x.score,"% AI"]})]}),e.jsx("span",{className:"text-[12px] text-muted-foreground/30",children:"·"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[p.wordCount,"w"]})]})]}),P&&O&&e.jsxs("div",{className:"rounded-xl bg-background/50 border border-border/30 p-4 space-y-2.5 animate-fade-in",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-foreground",children:"Voice Match Breakdown"}),e.jsxs("span",{className:"text-xs font-medium text-muted-foreground tabular-nums",children:[O.score,"/100"]})]}),e.jsx("div",{className:"space-y-2",children:Object.entries(O.breakdown).map(([m,h])=>{const T=Qe[m];return e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"text-[12px] text-muted-foreground w-[72px] shrink-0",title:T.desc,children:T.label}),e.jsx("div",{className:"flex-1 h-1.5 bg-muted rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-700 ${h>=70?"bg-success":h>=40?"bg-warning":"bg-destructive"}`,style:{width:`${Math.max(3,h)}%`,transitionTimingFunction:"cubic-bezier(0.34, 1.56, 0.64, 1)"}})}),e.jsx("span",{className:"text-[12px] text-muted-foreground/50 w-6 text-right tabular-nums",children:h})]},m)})}),I&&e.jsxs("div",{className:"pt-2.5 border-t border-border/20",children:[e.jsxs(D,{variant:"outline",size:"sm",onClick:M,className:"w-full",children:[e.jsx(ne,{size:14}),"Refine Voice Match (",O.score,"% → 85%+)"]}),e.jsx("p",{className:"text-[12px] text-muted-foreground/40 text-center mt-1.5",children:"Uses a second LLM pass to improve weak dimensions"})]})]}),R&&x&&e.jsxs("div",{className:"rounded-xl bg-background/50 border border-border/30 p-4 space-y-2.5 animate-fade-in",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-foreground",children:"AI Detection Breakdown"}),e.jsx("span",{className:`text-xs font-medium ${u.color}`,children:x.label})]}),e.jsx("div",{className:"space-y-2",children:[{label:"Phrases",value:x.breakdown.phrases,desc:"Common AI phrases"},{label:"Structure",value:x.breakdown.structure,desc:"Sentence uniformity"},{label:"Hedging",value:x.breakdown.hedging,desc:"Qualifiers & hedges"},{label:"Vocab",value:x.breakdown.compression,desc:"Word diversity"}].map(({label:m,value:h,desc:T})=>e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"text-[12px] text-muted-foreground w-14 shrink-0",title:T,children:m}),e.jsx("div",{className:"flex-1 h-1.5 bg-muted rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-500 ${h<=30?"bg-success":h<=60?"bg-warning":"bg-destructive"}`,style:{width:`${Math.max(2,h)}%`}})}),e.jsx("span",{className:"text-[12px] text-muted-foreground/50 w-6 text-right tabular-nums",children:h})]},m))}),x.suggestions.length>0&&e.jsxs("div",{className:"pt-2.5 border-t border-border/20",children:[e.jsx("p",{className:"text-[12px] font-medium text-muted-foreground mb-1.5",children:"Suggestions"}),e.jsx("ul",{className:"space-y-1",children:x.suggestions.map((m,h)=>e.jsxs("li",{className:"text-[12px] text-muted-foreground/60 flex gap-1.5",children:[e.jsx("span",{className:"shrink-0",children:"·"}),e.jsx("span",{children:m})]},h))})]})]}),p.hook&&e.jsxs("p",{className:"text-xs text-muted-foreground/60 italic leading-relaxed",children:["Hook: ",p.hook]}),e.jsx($e,{text:p.message,onCopy:j}),e.jsxs("div",{className:"flex gap-2.5",children:[e.jsxs(D,{variant:"ghost",size:"md",onClick:V,disabled:v||L,className:"flex-1",children:[e.jsx(ne,{size:15,className:v?"animate-spin":""}),"Regenerate"]}),e.jsxs(D,{variant:"ghost",size:"md",onClick:()=>E(!0),className:"flex-1","aria-label":"Edit this message",children:[e.jsx(Se,{size:15}),"Edit"]})]}),c&&e.jsxs(D,{variant:"ghost",size:"md",onClick:c,className:"w-full text-muted-foreground",children:[e.jsx(de,{size:15}),"Schedule Follow-ups"]})]})]}),N&&p&&e.jsx(Le,{initialMessage:p.message,onSave:m=>{b(h=>({...h,[r]:{...p,message:m,wordCount:m.split(/\s+/).filter(Boolean).length}})),E(!1)},onClose:()=>E(!1)})]})}const tt=l.memo(et,(s,t)=>{var r,n,o,i,c,d,f,g;return s.pageData.url===t.pageData.url&&s.selectedAngle===t.selectedAngle&&((r=s.analysis)==null?void 0:r.personName)===((n=t.analysis)==null?void 0:n.personName)&&((o=s.analysis)==null?void 0:o.confidence)===((i=t.analysis)==null?void 0:i.confidence)&&((d=(c=s.analysis)==null?void 0:c.outreachAngles)==null?void 0:d.length)===((g=(f=t.analysis)==null?void 0:f.outreachAngles)==null?void 0:g.length)});function st(s,t){return t?s==="x"?`https://x.com/messages/${t}`:s==="linkedin"?"https://www.linkedin.com/messaging/compose/":null:null}function nt({isOpen:s,onClose:t,onLogged:r,platform:n,username:o}){const[i,c]=l.useState(!1);l.useEffect(()=>{s&&c(!0)},[s]);const d=l.useCallback(y=>{s&&(y.key==="Escape"?C():y.key==="Enter"&&g())},[s]);if(l.useEffect(()=>(document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)),[d]),!s)return null;const f=st(n,o),g=()=>{r(),c(!1),setTimeout(()=>t(),200)},C=()=>{c(!1),setTimeout(()=>t(),200)},S=()=>{f&&window.open(f,"_blank"),g()};return e.jsx("div",{className:`
        fixed inset-0 bg-background/60 backdrop-blur-sm flex items-end justify-center z-50
        transition-opacity duration-200
        ${i?"opacity-100":"opacity-0"}
      `,onClick:C,role:"dialog","aria-modal":"true","aria-label":"Log conversation",children:e.jsxs("div",{className:`
          w-full bg-card border-t border-border/60 rounded-t-2xl p-5 pb-6
          transition-transform duration-200 ease-out
          ${i?"translate-y-0":"translate-y-full"}
        `,onClick:y=>y.stopPropagation(),children:[e.jsx("div",{className:"w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4"}),e.jsxs("div",{className:"flex flex-col items-center mb-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2",children:e.jsx(Z,{size:18,className:"text-success"})}),e.jsx("p",{className:"text-sm font-medium text-foreground text-center",children:"Message copied"}),e.jsx("p",{className:"text-[12px] text-muted-foreground text-center mt-0.5",children:"Did you send it? We'll track it for you."})]}),e.jsxs("div",{className:"space-y-2",children:[f&&e.jsxs(D,{onClick:S,variant:"primary",size:"md",className:"w-full",children:[e.jsx(ce,{size:14}),"Open ",n==="x"?"X":"LinkedIn"," DM"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(D,{onClick:g,variant:f?"ghost":"primary",size:"md",className:"flex-1",children:[e.jsx(Z,{size:14}),"Sent it"]}),e.jsx(D,{onClick:C,variant:"ghost",size:"md",className:"flex-1",children:"Not yet"})]})]})]})})}function rt({value:s,max:t=100,size:r="md",variant:n,showValue:o=!1,label:i,color:c,className:d,...f}){const g=Math.min(Math.max(s/t*100,0),100),C=n||(g>=60?"success":g>=30?"warning":"error"),S={default:"bg-muted-foreground",success:"bg-success",warning:"bg-warning",error:"bg-destructive"},y={default:"text-muted-foreground",success:"text-success",warning:"text-warning",error:"text-destructive"};return e.jsxs("div",{className:H("space-y-2",d),...f,children:[(i||o)&&e.jsxs("div",{className:"flex items-center justify-between",children:[i&&e.jsx("span",{className:"text-xs text-muted-foreground font-medium",children:i}),o&&e.jsxs("span",{className:H("text-xs font-semibold font-numerical tabular-nums",y[C]),children:[Math.round(g),"%"]})]}),e.jsx("div",{role:"progressbar","aria-valuenow":Math.round(g),"aria-valuemin":0,"aria-valuemax":100,className:H("w-full bg-muted/70 rounded-full overflow-hidden",{"h-1":r==="sm","h-1.5":r==="md","h-2.5":r==="lg"}),children:e.jsx("div",{className:H("h-full rounded-full transition-all duration-700",c?"":S[C]),style:{width:`${g}%`,transitionTimingFunction:"cubic-bezier(0.34, 1.56, 0.64, 1)",...c&&{backgroundColor:c}}})})]})}function at(){const[s,t]=l.useState(null),[r,n]=l.useState(!1),[o,i]=l.useState(!1),[c,d]=l.useState(0),[f,g]=l.useState(null),[C,S]=l.useState(0),y=W(p=>p.apiKey),U=W(p=>p.preferredModel),A=l.useRef(null),b=l.useRef(null),N=l.useRef(null),E=l.useRef(null),R=l.useRef(null),F=3,P=l.useCallback(()=>{R.current&&(R.current.abort(),R.current=null),A.current&&(clearTimeout(A.current),A.current=null),b.current&&(clearInterval(b.current),b.current=null),i(!1),d(0),n(!1),N.current=null},[]),k=l.useCallback(async p=>{if(!y){g("No API key configured");return}if(N.current===p.url&&(r||o))return;P(),N.current=p.url,E.current=p,i(!0),d(1),g(null);let $=1;b.current=setInterval(()=>{$--,d($),$<=0&&b.current&&(clearInterval(b.current),b.current=null)},1e3),A.current=setTimeout(async()=>{i(!1),n(!0),t(null);try{const v=await we(p.url);if(v){t(v),n(!1),N.current=null;return}const L=new AbortController;R.current=L;const q=Pe(p);let O="";await te([{role:"system",content:"You are a helpful assistant that analyzes webpages for outreach purposes."},{role:"user",content:q}],y,{signal:L.signal,onChunk:x=>{O+=x;try{const u=J(O),a=JSON.parse(u);a.confidence&&t(a)}catch{}},onComplete:async x=>{try{const u=J(x),a=JSON.parse(u);t(a),await ve(p.url,a),S(0)}catch{g("Failed to parse analysis response")}n(!1),N.current=null,R.current=null},onError:x=>{if(x instanceof DOMException&&x.name==="AbortError")return;const u=x instanceof Error?x.message:"Analysis failed";if((u.includes("network")||u.includes("timeout")||u.includes("503")||u.includes("502"))&&C<F){S(I=>I+1);const w=Math.pow(2,C)*1e3;setTimeout(()=>{E.current&&k(E.current)},w)}else g(u),n(!1),N.current=null,R.current=null,S(0)}},U)}catch(v){if(v instanceof DOMException&&v.name==="AbortError")return;g(v instanceof Error?v.message:"Analysis failed"),n(!1),N.current=null,R.current=null}},1e3)},[y,r,o,P,C]);return{analysis:s,isAnalyzing:r,isDebouncing:o,debounceCountdown:c,error:f,analyzePage:k,cancelAnalysis:P}}function ot(s,t,r,n){const o=s.name||"this person",i=n==="linkedin"?"LinkedIn connection/message":n==="x"?"X/Twitter DM":"message";return{contactId:s.id,contactName:s.name,originalAngle:r,originalMessage:t,createdAt:Date.now(),messages:[{sequence:1,delay:"3 days",delayMs:4320*60*1e3,tone:"gentle",prompt:`Write a gentle follow-up ${i} to ${o}. 

Context: I previously sent this message:
"${t.slice(0,300)}"

The follow-up should:
- Be SHORT (2-3 sentences max)
- Reference the original message briefly without repeating it
- Add a small new insight or value point
- NOT be pushy or desperate
- Sound natural and human
- End with a soft call to action

Tone: Casual, friendly, brief. Like bumping a thread.`},{sequence:2,delay:"7 days",delayMs:10080*60*1e3,tone:"value-add",prompt:`Write a value-add follow-up ${i} to ${o}.

Context: I sent an initial outreach message about ${r}, and a gentle follow-up 3 days later. Neither got a response.

The follow-up should:
- Be 3-4 sentences
- Lead with NEW value (share a relevant insight, resource, or observation about their work)
- NOT reference the previous messages directly
- Feel like a fresh, helpful message rather than a "just checking in"
- Include something specific about their recent activity or content
- End with a low-pressure question

Tone: Helpful, knowledgeable, not salesy.`},{sequence:3,delay:"14 days",delayMs:336*60*60*1e3,tone:"final",prompt:`Write a final, graceful follow-up ${i} to ${o}.

Context: This is the third and final follow-up. Previous messages about ${r} went unanswered.

The follow-up should:
- Be 2 sentences MAX
- Acknowledge they're busy (without being passive-aggressive)
- Leave the door open for future connection
- NOT guilt-trip or be desperate
- Be memorable and classy

Tone: Respectful, brief, confident. Like closing a door gently.`}]}}async function it(s){for(const t of s.messages){const r=`followup-${s.contactId}-${t.sequence}`,n=Date.now()+t.delayMs;try{await chrome.alarms.create(r,{when:n});const o=`followup_${s.contactId}_${t.sequence}`;await chrome.storage.local.set({[o]:{contactId:s.contactId,contactName:s.contactName,sequence:t.sequence,tone:t.tone,prompt:t.prompt,scheduledFor:n}}),await X.touchpoints.add({contactId:s.contactId,type:"follow_up_scheduled",angle:s.originalAngle,message:`Follow-up #${t.sequence} (${t.tone}) scheduled for ${t.delay}`,platform:"system",timestamp:Date.now()})}catch(o){console.warn(`[follow-up] Failed to schedule alarm ${r}:`,o)}}}const lt=[{value:"short",label:"Short",desc:"40-80w"},{value:"medium",label:"Medium",desc:"100-150w"},{value:"long",label:"Long",desc:"180-250w"}];function pt({initialData:s}){const[t,r]=l.useState(s),[n,o]=l.useState(!s),[i,c]=l.useState("service"),[d,f]=l.useState(!1),[g,C]=l.useState(!1),[S,y]=l.useState(""),[U,A]=l.useState(null),{analysis:b,isAnalyzing:N,isDebouncing:E,debounceCountdown:R,error:F,analyzePage:P,cancelAnalysis:k}=at(),p=W(u=>u.messageLength),$=W(u=>u.setMessageLength),{add:v}=he();l.useEffect(()=>{const u=a=>{if(a.currentPageData){const w=a.currentPageData.newValue;r(w),o(!1),C(!1),A(null)}};return chrome.storage.session.onChanged.addListener(u),()=>chrome.storage.session.onChanged.removeListener(u)},[]),l.useEffect(()=>{(async()=>{if(t!=null&&t.url)try{const a=await je(t.url);if(a&&a.totalMessages>0){A(`You've already sent ${a.totalMessages} message${a.totalMessages>1?"s":""} to this contact.`);return}const w=await X.conversations.where("pageUrl").equals(t.url).count();w>0?A(`You've already sent ${w} message${w>1?"s":""} to this page.`):A(null)}catch{}})()},[t==null?void 0:t.url]);const L=()=>{t&&!b&&!N&&!g&&(C(!0),P(t))},q=u=>{u&&y(u),setTimeout(()=>f(!0),100)},O=async()=>{if(!(!t||!S))try{await X.conversations.add({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,platform:t.platform,pageUrl:t.url,pageName:(b==null?void 0:b.personName)||t.name||t.ogTitle||t.hostname,sentMessage:S,angle:i,sentAt:Date.now(),status:"sent"});try{const u=await oe(t,b||void 0);await Ne({contactId:u,type:"copied",angle:i,message:S,platform:t.platform,timestamp:Date.now(),messageLength:p})}catch(u){console.warn("[OutreachScreen] Failed to update contact:",u)}}catch(u){console.error("[OutreachScreen] Failed to log conversation:",u)}};if(n)return e.jsx("div",{className:"space-y-4 animate-fade-in",children:e.jsx(fe,{})});if(!t)return e.jsx("div",{className:"text-center py-12",children:e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:"Waiting for page data..."})});const x=t.isProfile||t.name;return e.jsxs("div",{className:"space-y-4 stagger-children",children:[x?e.jsx(Re,{data:t}):e.jsx(Me,{data:t}),t.isThread&&t.threadContext&&t.threadContext.length>0&&e.jsx(B,{variant:"default",children:e.jsxs(G,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 mb-1.5",children:[e.jsx(Ce,{size:14,className:"text-info"}),e.jsxs("span",{className:"text-xs font-medium text-foreground",children:["Thread detected · ",t.threadContext.length," messages"]})]}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Thread context will be used to generate more relevant messages."})]})}),U&&e.jsx(ae,{variant:"warning",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(de,{size:14,className:"shrink-0"}),e.jsx("span",{children:U})]})}),F&&e.jsx(ae,{variant:"error",children:F}),t&&!b&&!N&&!E&&!g&&e.jsx(B,{variant:"elevated",children:e.jsxs(G,{className:"p-6 text-center",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4",children:e.jsx(ie,{size:20,className:"text-foreground/70"})}),e.jsx("p",{className:"text-sm font-medium text-foreground mb-1.5",children:"Ready to analyze"}),e.jsxs("p",{className:"text-xs text-muted-foreground mb-5 leading-relaxed",children:["Generate personalized outreach for"," ",e.jsx("span",{className:"text-foreground font-medium",children:t.name||t.ogTitle||t.hostname})]}),e.jsx(D,{onClick:L,variant:"primary",size:"lg",className:"w-full",children:"Analyze This Page"})]})}),E&&e.jsx(B,{variant:"default",children:e.jsxs(G,{className:"p-5 text-center",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2.5 mb-2",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-info animate-pulse-subtle"}),e.jsx("span",{className:"text-sm font-medium text-foreground",children:"Starting analysis..."})]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Analyzing in ",R,"s"]}),e.jsx(D,{onClick:k,variant:"ghost",size:"sm",className:"mt-3",children:"Cancel"})]})}),N&&!b&&e.jsx(B,{variant:"default",children:e.jsxs(G,{className:"p-5 text-center",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2.5",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-info animate-pulse-subtle"}),e.jsx("span",{className:"text-sm font-medium text-foreground",children:"Analyzing page..."})]}),e.jsxs("div",{className:"mt-4 space-y-2.5",children:[e.jsx("div",{className:"h-2 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2 bg-muted rounded-full w-3/4 animate-pulse-subtle"})]})]})}),b&&e.jsxs(e.Fragment,{children:[e.jsxs(B,{variant:"default",children:[e.jsx(Y,{children:e.jsx(_,{children:"Confidence"})}),e.jsxs(G,{children:[e.jsx(rt,{value:b.confidence,showValue:!0,size:"md"}),b.confidenceReason&&e.jsx("p",{className:"text-xs leading-relaxed text-muted-foreground mt-2.5",children:b.confidenceReason})]})]}),b.summary&&e.jsxs(B,{variant:"default",children:[e.jsx(Y,{children:e.jsx(_,{children:"Summary"})}),e.jsx(G,{children:e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:b.summary})})]}),b.interests&&b.interests.length>0&&e.jsxs(B,{variant:"default",children:[e.jsx(Y,{children:e.jsx(_,{children:"Interests"})}),e.jsx(G,{children:e.jsx("div",{className:"flex flex-wrap gap-1.5",children:b.interests.map((u,a)=>e.jsx(le,{variant:"outline",size:"sm",children:u},a))})})]}),e.jsxs(B,{variant:"default",children:[e.jsx(Y,{children:e.jsx(_,{children:"Message Length"})}),e.jsx(G,{children:e.jsx("div",{className:"flex rounded-xl bg-muted/50 p-1 gap-1",children:lt.map(u=>e.jsxs("button",{onClick:()=>$(u.value),className:`flex-1 py-2 px-2.5 rounded-lg text-center transition-all duration-[200ms] ease-out ${p===u.value?"bg-card text-foreground shadow-xs":"text-muted-foreground hover:text-foreground/80"}`,children:[e.jsx("span",{className:"text-xs font-medium block",children:u.label}),e.jsx("span",{className:"text-[12px] opacity-50 block mt-0.5",children:u.desc})]},u.value))})})]})]}),b&&t&&e.jsx(tt,{pageData:t,analysis:b,selectedAngle:i,onSelectAngle:c,onCopy:q,onScheduleFollowUp:async()=>{if(!t||!S){v({title:"Copy a message first",variant:"error"});return}try{const u=await oe(t,b||void 0),a=await X.contacts.get(u);if(!a)return;const w=ot(a,S,i,t.platform);await it(w),v({title:"Follow-ups scheduled",description:"3 reminders: 3d, 7d, 14d",variant:"success"})}catch(u){console.error("[OutreachScreen] Failed to schedule follow-ups:",u),v({title:"Failed to schedule follow-ups",variant:"error"})}}}),e.jsx(nt,{isOpen:d,onClose:()=>f(!1),onLogged:O,platform:t.platform,username:t.username})]})}export{pt as default};
