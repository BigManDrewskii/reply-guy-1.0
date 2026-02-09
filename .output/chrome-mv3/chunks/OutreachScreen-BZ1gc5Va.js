import{c as Q,r as l,j as e,C as ue,a as H,b as Z,u as W,Z as ie,R as ne,d as me,P as he}from"./sidepanel-B3m0Y82W.js";import{P as re}from"./icons-BJMHPUIr.js";import{C as G,a as B,b as _,c as Y,B as le,d as X}from"./badge-sqAuUL5X.js";import{L as fe,B as D}from"./button-hfLyMwOU.js";import{G as ge,f as xe,c as pe,T as ee,C as be,A as ae}from"./alert-k7ra-tT2.js";import{E as ce}from"./external-link-D4hse_B-.js";import{s as te,e as J,g as ye,a as we}from"./openrouter-BLRxJY_V.js";import{f as oe,c as je,a as ve}from"./crm-BptGe9lJ.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=Q("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=Q("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=Q("OctagonAlert",[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=Q("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);function Ce(t){let s=0;for(let i=0;i<t.length;i++)s=t.charCodeAt(i)+((s<<5)-s);const n=Math.abs(s%360),r=(n+40)%360;return`linear-gradient(135deg, oklch(0.55 0.15 ${n}), oklch(0.45 0.18 ${r}))`}const se=l.forwardRef(({className:t,src:s,alt:n,fallback:r,size:i="md",variant:o="circle",status:m,loading:c=!1,error:f=!1,...g},S)=>{const[C,y]=l.useState(!1),U={xs:"w-5 h-5 text-[12px]",sm:"w-8 h-8 text-xs",md:"w-10 h-10 text-sm",lg:"w-12 h-12 text-base",xl:"w-16 h-16 text-lg"},A={xs:10,sm:12,md:14,lg:16,xl:18}[i],b={online:"var(--color-success)",offline:"var(--color-muted-foreground)",away:"var(--color-warning)",busy:"var(--color-destructive)"},N=f||C,R=N||!s,E=l.useMemo(()=>Ce(r||n||"?"),[r,n]);return e.jsxs("div",{ref:S,className:H("relative inline-flex flex-shrink-0",U[i],t),...g,children:[e.jsxs("div",{className:H("relative w-full h-full inline-flex items-center justify-center overflow-hidden","font-semibold text-white",{"rounded-full":o==="circle","rounded-lg":o==="square"}),style:R?{background:E}:void 0,children:[c&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10",children:e.jsx(fe,{size:A,className:"animate-spin text-muted-foreground"})}),R?N&&!r?e.jsx("div",{className:"w-full h-full flex items-center justify-center bg-destructive/10",children:e.jsx(ue,{size:A,className:"text-destructive"})}):e.jsx("span",{className:"select-none","aria-label":n||r||"Avatar",children:r}):e.jsx("img",{src:s,alt:n||"",className:"w-full h-full object-cover",onError:()=>y(!0)})]}),m&&e.jsx("span",{className:H("absolute bottom-0 right-0 block rounded-full ring-2 ring-background",{"h-1.5 w-1.5":i==="xs"||i==="sm","h-2.5 w-2.5":i==="md"||i==="lg","h-3 w-3":i==="xl"}),style:{backgroundColor:b[m]},role:"status","aria-label":`Status: ${m}`})]})});se.displayName="Avatar";function Ae({data:t}){var n,r;const s=re[t.platform]||re.generic;return e.jsx(G,{variant:"default",children:e.jsxs(B,{className:"p-5",children:[e.jsxs("div",{className:"flex items-center gap-3.5 mb-3.5",children:[e.jsx(se,{src:t.avatarUrl,fallback:((n=t.name)==null?void 0:n.charAt(0).toUpperCase())||((r=t.ogTitle)==null?void 0:r.charAt(0).toUpperCase())||"?",size:"lg",variant:"circle"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h2",{className:"text-base font-semibold text-foreground truncate tracking-tight",children:t.name||t.ogTitle||t.title}),e.jsx(s,{size:14,className:"text-muted-foreground/60 shrink-0"})]}),(t.location||t.company)&&e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5 truncate",children:[t.location,t.company].filter(Boolean).join(" · ")}),t.headline&&e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5 line-clamp-1",children:t.headline})]})]}),t.bio&&e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5",children:t.bio}),t.about&&!t.bio&&e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5",children:t.about}),t.followers&&e.jsx("div",{className:"flex items-center gap-3 text-xs text-muted-foreground pb-3.5 mb-3.5 border-b border-border/30",children:e.jsxs("span",{children:[e.jsx("span",{className:"text-foreground font-medium tabular-nums",children:t.followers})," followers"]})}),t.recentPosts&&t.recentPosts.length>0&&e.jsxs("div",{children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5",children:"Recent posts"}),e.jsx("div",{className:"space-y-2",children:t.recentPosts.slice(0,3).map((i,o)=>e.jsx("p",{className:"text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed",children:i},o))})]})]})})}const Re=l.memo(Ae,(t,s)=>t.data.name===s.data.name&&t.data.headline===s.data.headline&&t.data.bio===s.data.bio);function Ee({data:t}){return e.jsx(G,{variant:"default",children:e.jsxs(B,{className:"p-5",children:[e.jsxs("div",{className:"flex items-start gap-3.5 mb-3.5",children:[e.jsx(se,{fallback:e.jsx(ge,{size:20}),size:"md",variant:"circle"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h2",{className:"text-base font-semibold text-foreground truncate tracking-tight",children:t.hostname}),t.ogTitle&&e.jsx("p",{className:"text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed",children:t.ogTitle}),!t.ogTitle&&t.h1&&e.jsx("p",{className:"text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed",children:t.h1})]})]}),t.ogDescription&&e.jsx("p",{className:"text-sm text-muted-foreground line-clamp-3 mb-3.5 leading-relaxed",children:t.ogDescription}),t.socialLinks&&t.socialLinks.length>0&&e.jsxs("div",{className:"border-t border-border/30 pt-3.5 mt-3.5",children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5",children:"Detected social links"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:t.socialLinks.map((s,n)=>e.jsxs("a",{href:s,target:"_blank",rel:"noopener noreferrer",className:"text-xs text-foreground/70 hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200",children:[new URL(s).hostname,e.jsx(ce,{size:15})]},n))})]}),t.email&&e.jsxs("div",{className:"border-t border-border/30 pt-3.5 mt-3.5",children:[e.jsx("p",{className:"text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-1.5",children:"Contact"}),e.jsx("a",{href:`mailto:${t.email}`,className:"text-sm text-foreground/70 hover:text-foreground transition-colors duration-200",children:t.email})]})]})})}const Me=l.memo(Ee,(t,s)=>t.data.hostname===s.data.hostname&&t.data.ogTitle===s.data.ogTitle&&t.data.ogDescription===s.data.ogDescription);function Te({text:t,onCopy:s}){const[n,r]=l.useState(!1),i=async()=>{try{await navigator.clipboard.writeText(t),r(!0),s&&s(),setTimeout(()=>r(!1),1500)}catch(o){console.error("Failed to copy:",o)}};return e.jsx(D,{variant:n?"success":"primary",onClick:i,"aria-label":n?"Copied!":"Copy to clipboard",size:"md",className:"w-full",children:n?e.jsxs(e.Fragment,{children:[e.jsx(Z,{size:15}),"Copied!"]}):e.jsxs(e.Fragment,{children:[e.jsx(Ne,{size:15}),"Copy Message"]})})}const $e=l.memo(Te,(t,s)=>t.text===s.text);function Ie({initialMessage:t,onSave:s,onClose:n}){const[r,i]=l.useState(t),o=l.useRef(null),m=r.split(/\s+/).filter(Boolean).length,c=!r.trim()||r===t;return l.useEffect(()=>{o.current&&(o.current.focus(),o.current.setSelectionRange(r.length,r.length));const f=g=>{g.key==="Escape"&&n()};return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[]),e.jsx("div",{className:"fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in",onClick:n,role:"dialog","aria-modal":"true","aria-label":"Edit message",children:e.jsxs("div",{className:"w-full bg-card border-t border-border/60 rounded-t-2xl animate-slide-up",onClick:f=>f.stopPropagation(),children:[e.jsx("div",{className:"w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-2"}),e.jsxs("div",{className:"p-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h3",{className:"text-sm font-semibold text-foreground",children:"Edit Message"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[m,"w"]})]}),e.jsx("textarea",{ref:o,value:r,onChange:f=>i(f.target.value),className:"w-full h-40 px-3 py-2.5 rounded-lg bg-background border border-border/60 text-[14px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors",placeholder:"Edit your message...","aria-label":"Edit message content"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(D,{onClick:n,variant:"ghost",size:"sm",className:"flex-1",children:"Cancel"}),e.jsxs(D,{onClick:()=>s(r),variant:"primary",size:"sm",className:"flex-1",disabled:c,children:[e.jsx(Z,{size:15}),"Save"]})]})]})]})})}const Le={short:"Message must be 40-80 words. Be punchy and direct — 2-3 sentences max. Get to the point fast.",medium:"Message must be 100-150 words. Balance detail with brevity — 3-4 paragraphs.",long:"Message must be 180-250 words. Be thorough — include context, specific references, and a detailed value proposition."},Oe=`MESSAGE STRUCTURE (follow this framework):
1. HOOK (1-2 sentences): Open with something specific about THEM — a recent post, project, or achievement. Make it clear you've done your homework. Never start with "I" or "My".
2. BRIDGE (1-2 sentences): Connect their world to yours. Show you understand their challenges or goals.
3. VALUE (1-2 sentences): What specific value can you offer? Be concrete — not "let's collaborate" but what exactly.
4. CTA (1 sentence): Clear, low-commitment ask. A question works best. Make it easy to say yes.`;function ze(t){return t.platform==="linkedin"?`You analyze LinkedIn profiles to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(t,null,2)}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "personName": "full name from profile",
  "summary": "2-3 sentences about their role, company, and professional focus",
  "interests": ["3-5 professional interests based on headline, about, experience, and skills"],
  "outreachAngles": [
    { "angle": "service", "hook": "specific service you could offer based on their role/company", "relevance": "why it's relevant to their current position" },
    { "angle": "partner", "hook": "partnership opportunity based on complementary skills/industries", "relevance": "mutual benefit explanation" },
    { "angle": "community", "hook": "shared industry/interest connection point", "relevance": "why connecting makes sense" },
    { "angle": "value", "hook": "specific value you could provide (insight, intro, resource)", "relevance": "why they'd care" }
  ],
  "confidence": 0-100,
  "confidenceReason": "based on profile completeness and data quality"
}

LinkedIn-specific rules:
- Use their headline and experience to understand their professional focus
- Reference specific companies, roles, or skills from their profile
- If they have an "About" section, use it to understand their priorities
- Connection degree matters: 1st = warm, 2nd = mutual connections, 3rd = cold
- If experience data is available, reference career trajectory
- Skills endorsements indicate areas of expertise
- interests must be specific professional topics, not generic phrases`:`You analyze webpages to help craft personalized outreach messages.

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
- confidenceReason should explain the rating`}function Ve(t,s,n,r,i="medium"){let o=`Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(t,null,2)}

ANALYSIS:
${JSON.stringify(s,null,2)}

SELECTED ANGLE: ${n}

`;return t.threadContext&&t.threadContext.length>0&&(o+=`THREAD CONTEXT (this person is replying in a conversation):
${t.threadContext.map((m,c)=>`[${c+1}] ${m}`).join(`
`)}

Use the thread context to make the message more relevant and timely.

`),r&&r.register?o+=Pe(r):r&&(o+=De(r)),o+=`${Oe}

`,o+=Fe(t),o+=`Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message following the Hook→Bridge→Value→CTA structure",
  "wordCount": number,
  "hook": "1-sentence explanation of why this approach works for this specific person",
  "voiceScore": 0-100
}

Rules:
- ${Le[i]}
- Follow the Hook→Bridge→Value→CTA structure
- Reference specific details from the page/analysis — names, projects, posts, roles
- voiceScore: Rate honestly how well the message matches the voice profile (if provided)
- The message must sound like a REAL PERSON wrote it, not an AI
- Never use clichés like "I hope this finds you well", "I came across your profile", "I'd love to pick your brain"
- Never start with "I" — start with something about THEM`,o}function Pe(t){let s=`═══ VOICE PROFILE (CRITICAL — match this voice precisely) ═══

`;if(s+=`REGISTER DIMENSIONS (Biber's 6-factor model, 1-10 scale):
- Involved↔Informational: ${t.register.involvedVsInformational}/10 (${t.register.involvedVsInformational<=4?"personal/emotional":t.register.involvedVsInformational>=7?"detached/factual":"balanced"})
- Narrative↔Non-narrative: ${t.register.narrativeVsNonNarrative}/10 (${t.register.narrativeVsNonNarrative<=4?"story-like":t.register.narrativeVsNonNarrative>=7?"expository":"mixed"})
- Situation-dependent↔Explicit: ${t.register.situationDependentVsExplicit}/10
- Non-persuasive↔Persuasive: ${t.register.nonPersuasiveVsPersuasive}/10
- Concrete↔Abstract: ${t.register.concreteVsAbstract}/10
- Casual↔Formal: ${t.register.casualVsFormalElaboration}/10

`,s+=`TONE: ${t.tone.primary} (primary), ${t.tone.secondary} (secondary)
- Humor: ${t.tone.humor}
- Confidence: ${t.tone.confidence}
- Style descriptors: ${t.descriptors.join(", ")}

`,t.rules.length>0&&(s+=`VOICE RULES (you MUST follow these):
${t.rules.map((n,r)=>`${r+1}. ${n}`).join(`
`)}

`),t.antiPatterns.length>0&&(s+=`ANTI-PATTERNS (NEVER do these):
${t.antiPatterns.map(n=>`✗ ${n}`).join(`
`)}

`),t.signatures){const n=t.signatures;n.openingPatterns.length>0&&(s+=`OPENING PATTERNS: ${n.openingPatterns.join(" | ")}
`),n.transitionWords.length>0&&(s+=`TRANSITION WORDS: ${n.transitionWords.join(", ")}
`),n.closingPatterns.length>0&&(s+=`CLOSING PATTERNS: ${n.closingPatterns.join(" | ")}
`),n.catchphrases.length>0&&(s+=`CATCHPHRASES: ${n.catchphrases.join(" | ")}
`),s+=`
`}return t.metrics&&(s+=`QUANTITATIVE ANCHORS (match these numbers):
${xe(t.metrics)}

`),t.exemplars&&t.exemplars.length>0&&(s+=`═══ WRITING EXEMPLARS (study these carefully — replicate this EXACT style) ═══
${t.exemplars.slice(0,3).map((n,r)=>`--- Exemplar ${r+1} (${n.wordCount} words, ${n.context}) ---
${n.text}`).join(`

`)}

CRITICAL: The message you generate must read as if the SAME PERSON who wrote the exemplars above wrote it. Match their sentence rhythm, word choices, punctuation habits, and energy level.

`),s}function De(t){var n,r,i;let s=`VOICE PROFILE (match this tone and style):
`;return t.tone!==void 0&&(s+=`- Tone: ${t.tone}/10
`),(n=t.openingPatterns)!=null&&n.length&&(s+=`- Opening patterns: ${t.openingPatterns.join(", ")}
`),(r=t.personalityMarkers)!=null&&r.length&&(s+=`- Personality markers: ${t.personalityMarkers.join(", ")}
`),(i=t.avoidPhrases)!=null&&i.length&&(s+=`- Avoid: ${t.avoidPhrases.join(", ")}
`),t.avgSentenceLength&&(s+=`- Average sentence length: ${t.avgSentenceLength} words
`),t.formalityScore!==void 0&&(s+=`- Formality: ${t.formalityScore}/100
`),s+=`
`,s}function Fe(t){return t.platform==="linkedin"?`PLATFORM: LinkedIn
- Use professional but warm tone appropriate for LinkedIn
- Reference their headline, role, company, or recent activity
- If connection degree is available, adjust warmth accordingly:
  - 1st degree: Reference existing connection, be warm
  - 2nd degree: Mention mutual connections if possible
  - 3rd degree: Be more formal, establish credibility first
- Reference specific skills or experience from their profile
- If this is a connection request note, keep it under 300 characters
- Avoid overly salesy language — LinkedIn users are sensitive to spam

`:t.platform==="x"?`PLATFORM: X (Twitter)
- Use conversational, authentic tone
- Reference their recent posts or tweets if available
- Keep it casual but purposeful

`:t.platform==="github"?`PLATFORM: GitHub
- Reference their projects, contributions, or tech stack
- Use developer-friendly language
- Be specific about technical interests

`:""}function Ge(t,s,n,r){const i=Object.entries(r).filter(([,m])=>m<70).sort((m,c)=>m[1]-c[1]).map(([m,c])=>`${m}: ${c}/100`);let o=`You are a voice-matching editor. A message was generated to match a specific voice profile, but scored ${n}/100 on voice matching.

GENERATED MESSAGE:
"${t}"

`;return i.length>0&&(o+=`WEAK DIMENSIONS (fix these):
${i.join(`
`)}

`),o+=`VOICE RULES TO FOLLOW:
${s.rules.map((m,c)=>`${c+1}. ${m}`).join(`
`)}

ANTI-PATTERNS TO AVOID:
${s.antiPatterns.map(m=>`✗ ${m}`).join(`
`)}

`,s.metrics&&(o+=`TARGET METRICS:
- Sentence length: aim for ~${s.metrics.sentenceLength.mean} words per sentence
- Formality: ${s.metrics.formalityScore}/100
- Contraction rate: ${s.metrics.contractionRate}% of sentences should use contractions
- Active voice: ${s.metrics.activeVoiceRate}%
${s.metrics.punctuation.exclamationRate>10?`- Use exclamation marks (${s.metrics.punctuation.exclamationRate}% of sentences)`:"- Avoid exclamation marks"}
${s.metrics.punctuation.questionRate>15?`- Include questions (${s.metrics.punctuation.questionRate}% of sentences)`:""}

`),s.exemplars&&s.exemplars.length>0&&(o+=`REFERENCE EXEMPLARS (match this style):
${s.exemplars.slice(0,2).map((m,c)=>`--- ${c+1} ---
${m.text}`).join(`

`)}

`),o+=`TASK: Rewrite the message to better match the voice profile. Fix the weak dimensions while keeping the same intent, recipient context, and call-to-action. The rewritten message should score 85+ on voice matching.

Return JSON (no markdown, no code blocks):
{
  "message": "rewritten message",
  "wordCount": number,
  "hook": "same hook as before",
  "voiceScore": 0-100,
  "changes": "brief description of what you changed and why"
}`,o}function K(t){const s=J(t);try{const r=JSON.parse(s);if(r.message)return r.message}catch{}const n=s.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/s);return n!=null&&n[1]?n[1].replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").replace(/\\t/g,"	"):null}function Be(){const[t,s]=l.useState({}),[n,r]=l.useState({}),[i,o]=l.useState({}),[m,c]=l.useState({}),[f,g]=l.useState({}),[S,C]=l.useState("service"),[y,U]=l.useState(null),[A,b]=l.useState(0),N=W(x=>x.apiKey),R=W(x=>x.preferredModel),E=l.useRef(null),F=l.useRef(null),V=l.useRef(null),k=l.useRef(null),p=3;l.useEffect(()=>{const x=()=>{chrome.storage.local.get("voiceProfile",a=>{a.voiceProfile&&U(a.voiceProfile)})};x();const d=()=>x();return chrome.storage.onChanged.addListener(d),()=>chrome.storage.onChanged.removeListener(d)},[]);const I=l.useCallback(()=>{k.current&&(k.current.abort(),k.current=null)},[]),j=l.useCallback((x,d)=>{if(!(y!=null&&y.metrics)){g(a=>({...a,[d]:null}));return}try{const a=pe(x,y.metrics);g(w=>({...w,[d]:a}))}catch(a){console.warn("[useMessageGeneration] Voice match scoring failed:",a),g(w=>({...w,[d]:null}))}},[y]),L=l.useCallback(async(x,d,a)=>{if(!N)return;E.current=x,F.current=d,V.current=a,I();const w=new AbortController;k.current=w,o(M=>({...M,[a]:!0})),r(M=>({...M,[a]:""})),g(M=>({...M,[a]:null}));try{const M=W.getState().messageLength,z=Ve(x,d,a,y||void 0,M);let P="";await te([{role:"system",content:"You are an expert outreach copywriter. You write personalized messages that sound authentically human — never generic, never AI-sounding. You follow the Hook→Bridge→Value→CTA structure precisely."},{role:"user",content:z}],N,{signal:w.signal,onChunk:T=>{P+=T;const v=K(P);v&&r(u=>({...u,[a]:v}));try{const u=J(P),h=JSON.parse(u);h.message&&h.wordCount&&(s($=>({...$,[a]:h})),r($=>({...$,[a]:""})),j(h.message,a))}catch{}},onComplete:T=>{try{const v=J(T),u=JSON.parse(v);s(h=>({...h,[a]:u})),r(h=>({...h,[a]:""})),o(h=>({...h,[a]:!1})),b(0),j(u.message,a)}catch{const v=K(T);if(v){const u={message:v,wordCount:v.split(/\s+/).filter(Boolean).length,hook:"",voiceScore:50};s(h=>({...h,[a]:u})),j(v,a)}r(u=>({...u,[a]:""})),o(u=>({...u,[a]:!1}))}k.current=null},onError:T=>{if(T instanceof DOMException&&T.name==="AbortError"){o(h=>({...h,[a]:!1})),r(h=>({...h,[a]:""}));return}const v=T instanceof Error?T.message:"Generation failed";if((v.includes("network")||v.includes("timeout")||v.includes("503")||v.includes("502"))&&A<p){b($=>$+1);const h=Math.pow(2,A)*1e3;setTimeout(()=>{E.current&&F.current&&V.current&&L(E.current,F.current,V.current)},h)}else o(h=>({...h,[a]:!1})),r(h=>({...h,[a]:""})),b(0);k.current=null}},R)}catch(M){if(M instanceof DOMException&&M.name==="AbortError"){o(z=>({...z,[a]:!1})),r(z=>({...z,[a]:""}));return}o(z=>({...z,[a]:!1})),r(z=>({...z,[a]:""})),k.current=null}},[N,y,A,I,j,R]),q=l.useCallback(async(x,d,a)=>{if(!N||!(y!=null&&y.metrics))return;const w=t[a],M=f[a];if(!w||!M)return;I();const z=new AbortController;k.current=z,c(P=>({...P,[a]:!0})),r(P=>({...P,[a]:""}));try{const P=Ge(w.message,y,M.score,M.breakdown);let T="";await te([{role:"system",content:"You are a voice-matching editor. You rewrite messages to better match a specific writing style while preserving the original intent and context."},{role:"user",content:P}],N,{signal:z.signal,onChunk:v=>{T+=v;const u=K(T);u&&r(h=>({...h,[a]:u}))},onComplete:v=>{try{const u=J(v),h=JSON.parse(u);s($=>({...$,[a]:h})),r($=>({...$,[a]:""})),c($=>({...$,[a]:!1})),j(h.message,a)}catch{const u=K(v);if(u){const h={message:u,wordCount:u.split(/\s+/).filter(Boolean).length,hook:w.hook,voiceScore:70};s($=>({...$,[a]:h})),j(u,a)}r(h=>({...h,[a]:""})),c(h=>({...h,[a]:!1}))}k.current=null},onError:v=>{if(v instanceof DOMException&&v.name==="AbortError"){c(u=>({...u,[a]:!1})),r(u=>({...u,[a]:""}));return}c(u=>({...u,[a]:!1})),r(u=>({...u,[a]:""})),k.current=null}},R)}catch{c(T=>({...T,[a]:!1})),r(T=>({...T,[a]:""})),k.current=null}},[N,y,t,f,I,j,R]),O=l.useCallback(async(x,d,a)=>{s(w=>({...w,[a]:null})),r(w=>({...w,[a]:""})),g(w=>({...w,[a]:null})),await L(x,d,a)},[L]);return{messages:t,streamingText:n,isGenerating:i,isRefining:m,voiceMatchScores:f,selectedAngle:S,setSelectedAngle:C,generateMessage:L,regenerateMessage:O,refineMessage:q,cancelGeneration:I,setMessages:s}}const Ue=["i hope this message finds you well","i wanted to reach out","i came across your","i was impressed by","i'd love to connect","i'd love to chat","i'd love to learn more","let me know if you'd be open","would you be open to","looking forward to connecting","looking forward to hearing","i believe there could be","i think there's a great opportunity","synergy","leverage","circle back","touch base","deep dive","game-changer","cutting-edge","innovative solution","value proposition","thought leader","paradigm shift","best-in-class","at the end of the day","in today's fast-paced","in the ever-evolving","it's worth noting","it goes without saying","needless to say","that being said","having said that","delve into","delve deeper","navigate the complexities","foster meaningful","cultivate","spearhead","revolutionize","streamline"],qe=["i noticed that","i was particularly","i'm reaching out because","i'm writing to","as someone who","as a fellow","given your expertise","given your background","with your experience","based on your"];function He(t){if(t.length<50)return 50;const s=t.toLowerCase().split(/\s+/),r=new Set(s).size/s.length,i=new Set;let o=0;for(let g=0;g<s.length-1;g++)i.add(`${s[g]} ${s[g+1]}`),o++;const m=o>0?i.size/o:1,c=Math.max(0,Math.min(100,(.7-r)*200)),f=Math.max(0,Math.min(100,(.9-m)*300));return(c+f)/2}function We(t){const s=t.toLowerCase();let n=0;for(const r of Ue)s.includes(r)&&n++;for(const r of qe)s.includes(r)&&n++;return Math.min(100,n*25)}function Je(t){const s=t.split(/[.!?]+/).filter(c=>c.trim().length>0);if(s.length<3)return 30;const n=s.map(c=>c.trim().split(/\s+/).length),r=n.reduce((c,f)=>c+f,0)/n.length,i=n.reduce((c,f)=>c+Math.pow(f-r,2),0)/n.length,o=Math.sqrt(i),m=r>0?o/r:0;return Math.max(0,Math.min(100,(.5-m)*200))}function _e(t){const s=t.toLowerCase(),n=["perhaps","maybe","possibly","potentially","arguably","it seems","it appears","it's possible","one might","could potentially","might consider","worth exploring","i think","i believe","in my opinion","from my perspective"],r=s.split(/\s+/).length;let i=0;for(const m of n){const c=new RegExp(m,"g"),f=s.match(c);f&&(i+=f.length)}const o=i/r*100;return Math.min(100,o*30)}function Ye(t){if(!t||t.length<20)return{score:0,label:"Too short to analyze",breakdown:{compression:0,phrases:0,structure:0,hedging:0},suggestions:[]};const s=He(t),n=We(t),r=Je(t),i=_e(t),o=Math.round(s*.2+n*.4+r*.2+i*.2),m=Math.max(0,Math.min(100,o));let c;m<=20?c="Very human":m<=40?c="Mostly human":m<=60?c="Mixed":m<=80?c="Somewhat AI":c="Very AI";const f=[];return n>40&&f.push(`Remove generic AI phrases like "I hope this finds you well" or "I'd love to connect"`),r>50&&f.push("Vary your sentence lengths — mix short punchy sentences with longer ones"),i>40&&f.push('Reduce hedging words like "perhaps", "potentially", "might consider"'),s>50&&f.push("Use more specific, unique vocabulary instead of common generic terms"),{score:m,label:c,breakdown:{compression:s,phrases:n,structure:r,hedging:i},suggestions:f}}function Ke(t){return t>=80?{label:"Sounds like you",variant:"success"}:t>=60?{label:"Close match",variant:"info"}:t>=40?{label:"Moderate match",variant:"warning"}:{label:"Generic tone",variant:"error"}}function Xe(t){return t<=20?{label:"Very human",color:"text-success"}:t<=40?{label:"Human",color:"text-info"}:t<=60?{label:"Mixed",color:"text-warning"}:{label:"AI-sounding",color:"text-destructive"}}const Ze={sentenceLength:{label:"Rhythm",desc:"Sentence length pattern"},formality:{label:"Formality",desc:"Register & tone level"},contractions:{label:"Contractions",desc:"Contraction usage"},readability:{label:"Readability",desc:"Reading level match"},pronouns:{label:"Pronouns",desc:"I/you/we usage"},punctuation:{label:"Punctuation",desc:"Marks & emphasis"}};function Qe({pageData:t,analysis:s,selectedAngle:n,onSelectAngle:r,onCopy:i,onRegenerate:o,onScheduleFollowUp:m}){const{messages:c,streamingText:f,isGenerating:g,isRefining:S,voiceMatchScores:C,generateMessage:y,regenerateMessage:U,refineMessage:A,setMessages:b}=Be(),[N,R]=l.useState(!1),[E,F]=l.useState(!1),[V,k]=l.useState(!1),p=c[n],I=f[n]||"",j=g[n],L=S[n],q=(j||L)&&I.length>0,O=C[n],x=p?Ye(p.message):null,d=x?Xe(x.score):null,a=(O==null?void 0:O.score)??(p==null?void 0:p.voiceScore)??0,w=p?Ke(a):null,M=O&&O.score<70&&!L&&!j,z=u=>{r(u),!c[u]&&!g[u]&&y(t,s,u)},P=()=>{U(t,s,n),F(!1),k(!1),o&&o()},T=()=>{s&&(A(t,s,n),k(!1))},v=()=>{i&&p&&i(p.message)};return!p&&!j&&s&&y(t,s,n),e.jsxs(G,{variant:"default",children:[e.jsx(_,{children:e.jsx(Y,{children:"Message"})}),e.jsxs(B,{className:"space-y-3.5",children:[(s==null?void 0:s.outreachAngles)&&e.jsx(ee.Root,{defaultValue:n,value:n,onValueChange:z,children:e.jsx(ee.List,{children:s.outreachAngles.map(u=>e.jsx(ee.Trigger,{value:u.angle,children:u.angle.charAt(0).toUpperCase()+u.angle.slice(1)},u.angle))})}),j&&!p&&!q&&e.jsxs("div",{role:"status","aria-live":"polite","aria-label":"Generating message",className:"space-y-2.5 py-4",children:[e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-5/6 animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-4/6 animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2.5 bg-muted rounded-full w-3/5 animate-pulse-subtle"})]}),q&&!p&&e.jsxs("div",{className:"rounded-xl bg-background/50 p-4",children:[e.jsxs("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:[I,e.jsx("span",{className:"inline-block w-[2px] h-[14px] bg-foreground ml-0.5 align-middle animate-blink"})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-3 pt-3 border-t border-border/20",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground",children:[L?"Refining voice":"Generating"," · ",I.split(/\s+/).filter(Boolean).length,"w"]})]})]}),L&&q&&p&&e.jsxs("div",{className:"rounded-xl bg-background/50 p-4 border border-border/30",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle"}),e.jsx("span",{className:"text-[12px] text-foreground/70 font-medium",children:"Refining voice match..."})]}),e.jsxs("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:[I,e.jsx("span",{className:"inline-block w-[2px] h-[14px] bg-foreground ml-0.5 align-middle animate-blink"})]})]}),p&&!L&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"rounded-xl bg-background/50 p-4",children:e.jsx("p",{className:"text-sm text-foreground whitespace-pre-wrap leading-relaxed",children:p.message})}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center gap-2",children:w&&e.jsxs("button",{onClick:()=>k(!V),className:"flex items-center gap-1.5 group",children:[e.jsx(le,{variant:w.variant,size:"sm",children:w.label}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[a,"%"]}),e.jsx(be,{size:14,className:`text-muted-foreground/40 transition-transform duration-[200ms] ${V?"rotate-180":""}`})]})}),e.jsxs("div",{className:"flex items-center gap-2.5",children:[x&&d&&e.jsxs("button",{onClick:()=>F(!E),className:`flex items-center gap-1 text-[12px] ${d.color} hover:opacity-80 transition-opacity duration-200`,title:"AI-ness score — click for details",children:[e.jsx(ie,{size:14}),e.jsxs("span",{className:"tabular-nums",children:[x.score,"% AI"]})]}),e.jsx("span",{className:"text-[12px] text-muted-foreground/30",children:"·"}),e.jsxs("span",{className:"text-[12px] text-muted-foreground tabular-nums",children:[p.wordCount,"w"]})]})]}),V&&O&&e.jsxs("div",{className:"rounded-xl bg-background/50 border border-border/30 p-4 space-y-2.5 animate-fade-in",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-foreground",children:"Voice Match Breakdown"}),e.jsxs("span",{className:"text-xs font-medium text-muted-foreground tabular-nums",children:[O.score,"/100"]})]}),e.jsx("div",{className:"space-y-2",children:Object.entries(O.breakdown).map(([u,h])=>{const $=Ze[u];return e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"text-[12px] text-muted-foreground w-[72px] shrink-0",title:$.desc,children:$.label}),e.jsx("div",{className:"flex-1 h-1.5 bg-muted rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-700 ${h>=70?"bg-success":h>=40?"bg-warning":"bg-destructive"}`,style:{width:`${Math.max(3,h)}%`,transitionTimingFunction:"cubic-bezier(0.34, 1.56, 0.64, 1)"}})}),e.jsx("span",{className:"text-[12px] text-muted-foreground/50 w-6 text-right tabular-nums",children:h})]},u)})}),M&&e.jsxs("div",{className:"pt-2.5 border-t border-border/20",children:[e.jsxs(D,{variant:"outline",size:"sm",onClick:T,className:"w-full",children:[e.jsx(ne,{size:14}),"Refine Voice Match (",O.score,"% → 85%+)"]}),e.jsx("p",{className:"text-[12px] text-muted-foreground/40 text-center mt-1.5",children:"Uses a second LLM pass to improve weak dimensions"})]})]}),E&&x&&e.jsxs("div",{className:"rounded-xl bg-background/50 border border-border/30 p-4 space-y-2.5 animate-fade-in",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-medium text-foreground",children:"AI Detection Breakdown"}),e.jsx("span",{className:`text-xs font-medium ${d.color}`,children:x.label})]}),e.jsx("div",{className:"space-y-2",children:[{label:"Phrases",value:x.breakdown.phrases,desc:"Common AI phrases"},{label:"Structure",value:x.breakdown.structure,desc:"Sentence uniformity"},{label:"Hedging",value:x.breakdown.hedging,desc:"Qualifiers & hedges"},{label:"Vocab",value:x.breakdown.compression,desc:"Word diversity"}].map(({label:u,value:h,desc:$})=>e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("span",{className:"text-[12px] text-muted-foreground w-14 shrink-0",title:$,children:u}),e.jsx("div",{className:"flex-1 h-1.5 bg-muted rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-500 ${h<=30?"bg-success":h<=60?"bg-warning":"bg-destructive"}`,style:{width:`${Math.max(2,h)}%`}})}),e.jsx("span",{className:"text-[12px] text-muted-foreground/50 w-6 text-right tabular-nums",children:h})]},u))}),x.suggestions.length>0&&e.jsxs("div",{className:"pt-2.5 border-t border-border/20",children:[e.jsx("p",{className:"text-[12px] font-medium text-muted-foreground mb-1.5",children:"Suggestions"}),e.jsx("ul",{className:"space-y-1",children:x.suggestions.map((u,h)=>e.jsxs("li",{className:"text-[12px] text-muted-foreground/60 flex gap-1.5",children:[e.jsx("span",{className:"shrink-0",children:"·"}),e.jsx("span",{children:u})]},h))})]})]}),p.hook&&e.jsxs("p",{className:"text-xs text-muted-foreground/60 italic leading-relaxed",children:["Hook: ",p.hook]}),e.jsx($e,{text:p.message,onCopy:v}),e.jsxs("div",{className:"flex gap-2.5",children:[e.jsxs(D,{variant:"ghost",size:"md",onClick:P,disabled:j||L,className:"flex-1",children:[e.jsx(ne,{size:15,className:j?"animate-spin":""}),"Regenerate"]}),e.jsxs(D,{variant:"ghost",size:"md",onClick:()=>R(!0),className:"flex-1","aria-label":"Edit this message",children:[e.jsx(Se,{size:15}),"Edit"]})]}),m&&e.jsxs(D,{variant:"ghost",size:"md",onClick:m,className:"w-full text-muted-foreground",children:[e.jsx(de,{size:15}),"Schedule Follow-ups"]})]})]}),N&&p&&e.jsx(Ie,{initialMessage:p.message,onSave:u=>{b(h=>({...h,[n]:{...p,message:u,wordCount:u.split(/\s+/).filter(Boolean).length}})),R(!1)},onClose:()=>R(!1)})]})}const et=l.memo(Qe,(t,s)=>{var n,r,i,o,m,c,f,g;return t.pageData.url===s.pageData.url&&t.selectedAngle===s.selectedAngle&&((n=t.analysis)==null?void 0:n.personName)===((r=s.analysis)==null?void 0:r.personName)&&((i=t.analysis)==null?void 0:i.confidence)===((o=s.analysis)==null?void 0:o.confidence)&&((c=(m=t.analysis)==null?void 0:m.outreachAngles)==null?void 0:c.length)===((g=(f=s.analysis)==null?void 0:f.outreachAngles)==null?void 0:g.length)});function tt(t,s){return s?t==="x"?`https://x.com/messages/${s}`:t==="linkedin"?"https://www.linkedin.com/messaging/compose/":null:null}function st({isOpen:t,onClose:s,onLogged:n,platform:r,username:i}){const[o,m]=l.useState(!1);l.useEffect(()=>{t&&m(!0)},[t]);const c=l.useCallback(y=>{t&&(y.key==="Escape"?S():y.key==="Enter"&&g())},[t]);if(l.useEffect(()=>(document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)),[c]),!t)return null;const f=tt(r,i),g=()=>{n(),m(!1),setTimeout(()=>s(),200)},S=()=>{m(!1),setTimeout(()=>s(),200)},C=()=>{f&&window.open(f,"_blank"),g()};return e.jsx("div",{className:`
        fixed inset-0 bg-background/60 backdrop-blur-sm flex items-end justify-center z-50
        transition-opacity duration-200
        ${o?"opacity-100":"opacity-0"}
      `,onClick:S,role:"dialog","aria-modal":"true","aria-label":"Log conversation",children:e.jsxs("div",{className:`
          w-full bg-card border-t border-border/60 rounded-t-2xl p-5 pb-6
          transition-transform duration-200 ease-out
          ${o?"translate-y-0":"translate-y-full"}
        `,onClick:y=>y.stopPropagation(),children:[e.jsx("div",{className:"w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4"}),e.jsxs("div",{className:"flex flex-col items-center mb-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2",children:e.jsx(Z,{size:18,className:"text-success"})}),e.jsx("p",{className:"text-sm font-medium text-foreground text-center",children:"Message copied"}),e.jsx("p",{className:"text-[12px] text-muted-foreground text-center mt-0.5",children:"Did you send it? We'll track it for you."})]}),e.jsxs("div",{className:"space-y-2",children:[f&&e.jsxs(D,{onClick:C,variant:"primary",size:"md",className:"w-full",children:[e.jsx(ce,{size:14}),"Open ",r==="x"?"X":"LinkedIn"," DM"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(D,{onClick:g,variant:f?"ghost":"primary",size:"md",className:"flex-1",children:[e.jsx(Z,{size:14}),"Sent it"]}),e.jsx(D,{onClick:S,variant:"ghost",size:"md",className:"flex-1",children:"Not yet"})]})]})]})})}function nt({value:t,max:s=100,size:n="md",variant:r,showValue:i=!1,label:o,color:m,className:c,...f}){const g=Math.min(Math.max(t/s*100,0),100),S=r||(g>=60?"success":g>=30?"warning":"error"),C={default:"bg-muted-foreground",success:"bg-success",warning:"bg-warning",error:"bg-destructive"},y={default:"text-muted-foreground",success:"text-success",warning:"text-warning",error:"text-destructive"};return e.jsxs("div",{className:H("space-y-2",c),...f,children:[(o||i)&&e.jsxs("div",{className:"flex items-center justify-between",children:[o&&e.jsx("span",{className:"text-xs text-muted-foreground font-medium",children:o}),i&&e.jsxs("span",{className:H("text-xs font-semibold font-numerical tabular-nums",y[S]),children:[Math.round(g),"%"]})]}),e.jsx("div",{role:"progressbar","aria-valuenow":Math.round(g),"aria-valuemin":0,"aria-valuemax":100,className:H("w-full bg-muted/70 rounded-full overflow-hidden",{"h-1":n==="sm","h-1.5":n==="md","h-2.5":n==="lg"}),children:e.jsx("div",{className:H("h-full rounded-full transition-all duration-700",m?"":C[S]),style:{width:`${g}%`,transitionTimingFunction:"cubic-bezier(0.34, 1.56, 0.64, 1)",...m&&{backgroundColor:m}}})})]})}function rt(){const[t,s]=l.useState(null),[n,r]=l.useState(!1),[i,o]=l.useState(!1),[m,c]=l.useState(0),[f,g]=l.useState(null),[S,C]=l.useState(0),y=W(p=>p.apiKey),U=W(p=>p.preferredModel),A=l.useRef(null),b=l.useRef(null),N=l.useRef(null),R=l.useRef(null),E=l.useRef(null),F=3,V=l.useCallback(()=>{E.current&&(E.current.abort(),E.current=null),A.current&&(clearTimeout(A.current),A.current=null),b.current&&(clearInterval(b.current),b.current=null),o(!1),c(0),r(!1),N.current=null},[]),k=l.useCallback(async p=>{if(!y){g("No API key configured");return}if(N.current===p.url&&(n||i))return;V(),N.current=p.url,R.current=p,o(!0),c(1),g(null);let I=1;b.current=setInterval(()=>{I--,c(I),I<=0&&b.current&&(clearInterval(b.current),b.current=null)},1e3),A.current=setTimeout(async()=>{o(!1),r(!0),s(null);try{const j=await ye(p.url);if(j){s(j),r(!1),N.current=null;return}const L=new AbortController;E.current=L;const q=ze(p);let O="";await te([{role:"system",content:"You are a helpful assistant that analyzes webpages for outreach purposes."},{role:"user",content:q}],y,{signal:L.signal,onChunk:x=>{O+=x;try{const d=J(O),a=JSON.parse(d);a.confidence&&s(a)}catch{}},onComplete:async x=>{try{const d=J(x),a=JSON.parse(d);s(a),await we(p.url,a),C(0)}catch{g("Failed to parse analysis response")}r(!1),N.current=null,E.current=null},onError:x=>{if(x instanceof DOMException&&x.name==="AbortError")return;const d=x instanceof Error?x.message:"Analysis failed";if((d.includes("network")||d.includes("timeout")||d.includes("503")||d.includes("502"))&&S<F){C(M=>M+1);const w=Math.pow(2,S)*1e3;setTimeout(()=>{R.current&&k(R.current)},w)}else g(d),r(!1),N.current=null,E.current=null,C(0)}},U)}catch(j){if(j instanceof DOMException&&j.name==="AbortError")return;g(j instanceof Error?j.message:"Analysis failed"),r(!1),N.current=null,E.current=null}},1e3)},[y,n,i,V,S]);return{analysis:t,isAnalyzing:n,isDebouncing:i,debounceCountdown:m,error:f,analyzePage:k,cancelAnalysis:V}}function at(t,s,n,r){const i=t.name||"this person",o=r==="linkedin"?"LinkedIn connection/message":r==="x"?"X/Twitter DM":"message";return{contactId:t.id,contactName:t.name,originalAngle:n,originalMessage:s,createdAt:Date.now(),messages:[{sequence:1,delay:"3 days",delayMs:4320*60*1e3,tone:"gentle",prompt:`Write a gentle follow-up ${o} to ${i}. 

Context: I previously sent this message:
"${s.slice(0,300)}"

The follow-up should:
- Be SHORT (2-3 sentences max)
- Reference the original message briefly without repeating it
- Add a small new insight or value point
- NOT be pushy or desperate
- Sound natural and human
- End with a soft call to action

Tone: Casual, friendly, brief. Like bumping a thread.`},{sequence:2,delay:"7 days",delayMs:10080*60*1e3,tone:"value-add",prompt:`Write a value-add follow-up ${o} to ${i}.

Context: I sent an initial outreach message about ${n}, and a gentle follow-up 3 days later. Neither got a response.

The follow-up should:
- Be 3-4 sentences
- Lead with NEW value (share a relevant insight, resource, or observation about their work)
- NOT reference the previous messages directly
- Feel like a fresh, helpful message rather than a "just checking in"
- Include something specific about their recent activity or content
- End with a low-pressure question

Tone: Helpful, knowledgeable, not salesy.`},{sequence:3,delay:"14 days",delayMs:336*60*60*1e3,tone:"final",prompt:`Write a final, graceful follow-up ${o} to ${i}.

Context: This is the third and final follow-up. Previous messages about ${n} went unanswered.

The follow-up should:
- Be 2 sentences MAX
- Acknowledge they're busy (without being passive-aggressive)
- Leave the door open for future connection
- NOT guilt-trip or be desperate
- Be memorable and classy

Tone: Respectful, brief, confident. Like closing a door gently.`}]}}async function ot(t){for(const s of t.messages){const n=`followup-${t.contactId}-${s.sequence}`,r=Date.now()+s.delayMs;try{await chrome.alarms.create(n,{when:r});const i=`followup_${t.contactId}_${s.sequence}`;await chrome.storage.local.set({[i]:{contactId:t.contactId,contactName:t.contactName,sequence:s.sequence,tone:s.tone,prompt:s.prompt,scheduledFor:r}}),await X.touchpoints.add({contactId:t.contactId,type:"follow_up_scheduled",angle:t.originalAngle,message:`Follow-up #${s.sequence} (${s.tone}) scheduled for ${s.delay}`,platform:"system",timestamp:Date.now()})}catch(i){console.warn(`[follow-up] Failed to schedule alarm ${n}:`,i)}}}const it=[{value:"short",label:"Short",desc:"40-80w"},{value:"medium",label:"Medium",desc:"100-150w"},{value:"long",label:"Long",desc:"180-250w"}];function xt({initialData:t}){const[s,n]=l.useState(t),[r,i]=l.useState(!t),[o,m]=l.useState("service"),[c,f]=l.useState(!1),[g,S]=l.useState(!1),[C,y]=l.useState(""),[U,A]=l.useState(null),{analysis:b,isAnalyzing:N,isDebouncing:R,debounceCountdown:E,error:F,analyzePage:V,cancelAnalysis:k}=rt(),p=W(d=>d.messageLength),I=W(d=>d.setMessageLength),{add:j}=me();l.useEffect(()=>{const d=a=>{if(a.currentPageData){const w=a.currentPageData.newValue;n(w),i(!1),S(!1),A(null)}};return chrome.storage.session.onChanged.addListener(d),()=>chrome.storage.session.onChanged.removeListener(d)},[]),l.useEffect(()=>{(async()=>{if(s!=null&&s.url)try{const a=await je(s.url);if(a&&a.totalMessages>0){A(`You've already sent ${a.totalMessages} message${a.totalMessages>1?"s":""} to this contact.`);return}const w=await X.conversations.where("pageUrl").equals(s.url).count();w>0?A(`You've already sent ${w} message${w>1?"s":""} to this page.`):A(null)}catch{}})()},[s==null?void 0:s.url]);const L=()=>{s&&!b&&!N&&!g&&(S(!0),V(s))},q=d=>{d&&y(d),setTimeout(()=>f(!0),100)},O=async()=>{if(!(!s||!C))try{await X.conversations.add({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,platform:s.platform,pageUrl:s.url,pageName:(b==null?void 0:b.personName)||s.name||s.ogTitle||s.hostname,sentMessage:C,angle:o,sentAt:Date.now(),status:"sent"});try{const d=await oe(s,b||void 0);await ve({contactId:d,type:"copied",angle:o,message:C,platform:s.platform,timestamp:Date.now(),messageLength:p})}catch(d){console.warn("[OutreachScreen] Failed to update contact:",d)}}catch(d){console.error("[OutreachScreen] Failed to log conversation:",d)}};if(r)return e.jsx("div",{className:"space-y-4 animate-fade-in",children:e.jsx(he,{})});if(!s)return e.jsx("div",{className:"text-center py-12",children:e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:"Waiting for page data..."})});const x=s.isProfile||s.name;return e.jsxs("div",{className:"space-y-4 stagger-children",children:[x?e.jsx(Re,{data:s}):e.jsx(Me,{data:s}),s.isThread&&s.threadContext&&s.threadContext.length>0&&e.jsx(G,{variant:"default",children:e.jsxs(B,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 mb-1.5",children:[e.jsx(ke,{size:14,className:"text-info"}),e.jsxs("span",{className:"text-xs font-medium text-foreground",children:["Thread detected · ",s.threadContext.length," messages"]})]}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Thread context will be used to generate more relevant messages."})]})}),U&&e.jsx(ae,{variant:"warning",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(de,{size:14,className:"shrink-0"}),e.jsx("span",{children:U})]})}),F&&e.jsx(ae,{variant:"error",children:F}),s&&!b&&!N&&!R&&!g&&e.jsx(G,{variant:"elevated",children:e.jsxs(B,{className:"p-6 text-center",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4",children:e.jsx(ie,{size:20,className:"text-foreground/70"})}),e.jsx("p",{className:"text-sm font-medium text-foreground mb-1.5",children:"Ready to analyze"}),e.jsxs("p",{className:"text-xs text-muted-foreground mb-5 leading-relaxed",children:["Generate personalized outreach for"," ",e.jsx("span",{className:"text-foreground font-medium",children:s.name||s.ogTitle||s.hostname})]}),e.jsx(D,{onClick:L,variant:"primary",size:"lg",className:"w-full",children:"Analyze This Page"})]})}),R&&e.jsx(G,{variant:"default",children:e.jsxs(B,{className:"p-5 text-center",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2.5 mb-2",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-info animate-pulse-subtle"}),e.jsx("span",{className:"text-sm font-medium text-foreground",children:"Starting analysis..."})]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Analyzing in ",E,"s"]}),e.jsx(D,{onClick:k,variant:"ghost",size:"sm",className:"mt-3",children:"Cancel"})]})}),N&&!b&&e.jsx(G,{variant:"default",children:e.jsxs(B,{className:"p-5 text-center",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2.5",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-info animate-pulse-subtle"}),e.jsx("span",{className:"text-sm font-medium text-foreground",children:"Analyzing page..."})]}),e.jsxs("div",{className:"mt-4 space-y-2.5",children:[e.jsx("div",{className:"h-2 bg-muted rounded-full w-full animate-pulse-subtle"}),e.jsx("div",{className:"h-2 bg-muted rounded-full w-3/4 animate-pulse-subtle"})]})]})}),b&&e.jsxs(e.Fragment,{children:[e.jsxs(G,{variant:"default",children:[e.jsx(_,{children:e.jsx(Y,{children:"Confidence"})}),e.jsxs(B,{children:[e.jsx(nt,{value:b.confidence,showValue:!0,size:"md"}),b.confidenceReason&&e.jsx("p",{className:"text-xs leading-relaxed text-muted-foreground mt-2.5",children:b.confidenceReason})]})]}),b.summary&&e.jsxs(G,{variant:"default",children:[e.jsx(_,{children:e.jsx(Y,{children:"Summary"})}),e.jsx(B,{children:e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:b.summary})})]}),b.interests&&b.interests.length>0&&e.jsxs(G,{variant:"default",children:[e.jsx(_,{children:e.jsx(Y,{children:"Interests"})}),e.jsx(B,{children:e.jsx("div",{className:"flex flex-wrap gap-1.5",children:b.interests.map((d,a)=>e.jsx(le,{variant:"outline",size:"sm",children:d},a))})})]}),e.jsxs(G,{variant:"default",children:[e.jsx(_,{children:e.jsx(Y,{children:"Message Length"})}),e.jsx(B,{children:e.jsx("div",{className:"flex rounded-xl bg-muted/50 p-1 gap-1",children:it.map(d=>e.jsxs("button",{onClick:()=>I(d.value),className:`flex-1 py-2 px-2.5 rounded-lg text-center transition-all duration-[200ms] ease-out ${p===d.value?"bg-card text-foreground shadow-xs":"text-muted-foreground hover:text-foreground/80"}`,children:[e.jsx("span",{className:"text-xs font-medium block",children:d.label}),e.jsx("span",{className:"text-[12px] opacity-50 block mt-0.5",children:d.desc})]},d.value))})})]})]}),b&&s&&e.jsx(et,{pageData:s,analysis:b,selectedAngle:o,onSelectAngle:m,onCopy:q,onScheduleFollowUp:async()=>{if(!s||!C){j({title:"Copy a message first",variant:"error"});return}try{const d=await oe(s,b||void 0),a=await X.contacts.get(d);if(!a)return;const w=at(a,C,o,s.platform);await ot(w),j({title:"Follow-ups scheduled",description:"3 reminders: 3d, 7d, 14d",variant:"success"})}catch(d){console.error("[OutreachScreen] Failed to schedule follow-ups:",d),j({title:"Failed to schedule follow-ups",variant:"error"})}}}),e.jsx(st,{isOpen:c,onClose:()=>f(!1),onLogged:O,platform:s.platform,username:s.username})]})}export{xt as default};
