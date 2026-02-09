import{c as d,r as p,j as r,I as l,C as h,a as m}from"./sidepanel-BlZUykQz.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=d("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=d("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),y={short:"Message must be 40-80 words. Be punchy and direct — 2-3 sentences max. Get to the point fast.",medium:"Message must be 100-150 words. Balance detail with brevity — 3-4 paragraphs.",long:"Message must be 180-250 words. Be thorough — include context, specific references, and a detailed value proposition."};function k(n){return n.platform==="linkedin"?`You analyze LinkedIn profiles to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(n,null,2)}

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
${JSON.stringify(n,null,2)}

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
- confidenceReason should explain the rating`}function w(n,s,o,e,a="medium"){let t=`Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(n,null,2)}

ANALYSIS:
${JSON.stringify(s,null,2)}

SELECTED ANGLE: ${o}

`;return n.threadContext&&n.threadContext.length>0&&(t+=`THREAD CONTEXT (this person is replying in a conversation):
${n.threadContext.map((i,c)=>`[${c+1}] ${i}`).join(`
`)}

Use the thread context to make the message more relevant and timely.

`),e&&(t+=`VOICE PROFILE (match this tone and style):
- Tone: ${e.tone}/10
- Opening patterns: ${e.openingPatterns.join(", ")}
- Personality markers: ${e.personalityMarkers.join(", ")}
- Avoid: ${e.avoidPhrases.join(", ")}
`,e.avgSentenceLength&&(t+=`- Average sentence length: ${e.avgSentenceLength} words
`),e.formalityScore!==void 0&&(t+=`- Formality: ${e.formalityScore}/100 (${e.formalityScore>65?"formal":e.formalityScore<35?"casual":"balanced"})
`),e.readabilityScore!==void 0&&(t+=`- Readability target: ${e.readabilityScore}/100 (${e.readabilityScore>60?"easy to read":"more complex"})
`),e.questionFrequency!==void 0&&e.questionFrequency>10&&(t+=`- This writer frequently asks questions (${e.questionFrequency}% of sentences)
`),t+=`
`),n.platform==="linkedin"?t+=`PLATFORM: LinkedIn
- Use professional but warm tone appropriate for LinkedIn
- Reference their headline, role, company, or recent activity
- If connection degree is available, adjust warmth accordingly:
  - 1st degree: Reference existing connection, be warm
  - 2nd degree: Mention mutual connections if possible
  - 3rd degree: Be more formal, establish credibility first
- Reference specific skills or experience from their profile
- If this is a connection request note, keep it under 300 characters
- Avoid overly salesy language — LinkedIn users are sensitive to spam

`:n.platform==="x"?t+=`PLATFORM: X (Twitter)
- Use conversational, authentic tone
- Reference their recent posts or tweets if available
- Keep it casual but purposeful

`:n.platform==="github"&&(t+=`PLATFORM: GitHub
- Reference their projects, contributions, or tech stack
- Use developer-friendly language
- Be specific about technical interests

`),t+=`Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message",
  "wordCount": number,
  "hook": "why this approach works",
  "voiceScore": 0-100
}

Rules:
- ${y[a]}
- Start with a natural, conversational opening
- Reference specific details from the page/analysis
- End with clear call-to-action
- Make it sound authentic, not AI-generated
- voiceScore reflects how well it matches the requested style`,t}function v(n){return`Analyze these ${n.length} example messages to extract the writer's unique voice:

EXAMPLES:
${n.map((s,o)=>`---
Example ${o+1}:
${s}`).join(`

`)}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "tone": 0-10,
  "openingPatterns": ["3-5 common opening patterns"],
  "closingPatterns": ["3-5 common closing patterns"],
  "personalityMarkers": ["5-10 personality traits/signatures"],
  "avoidPhrases": ["phrases this writer never uses"],
  "vocabularySignature": ["5-10 characteristic words/phrases"]
}`}const b=p.forwardRef(({className:n,variant:s="default",title:o,action:e,children:a,...t},i)=>{const u={default:l,error:h,warning:g,info:l,success:f}[s];return r.jsx("div",{ref:i,role:"alert","aria-live":s==="error"?"assertive":"polite","aria-atomic":"true",className:m("rounded-lg px-3 py-2.5 text-xs leading-relaxed",{"bg-muted/50 text-muted-foreground border border-border/60":s==="default","bg-destructive/10 text-destructive border border-destructive/20":s==="error","bg-warning/10 text-warning border border-warning/20":s==="warning","bg-info/10 text-info border border-info/20":s==="info","bg-success/10 text-success border border-success/20":s==="success"},n),...t,children:r.jsxs("div",{className:"flex items-start gap-2",children:[r.jsx(u,{size:14,className:"shrink-0 mt-0.5"}),r.jsxs("div",{className:"flex-1 min-w-0",children:[o&&r.jsx("p",{className:"font-medium text-xs mb-0.5",children:o}),r.jsx("div",{className:"text-xs opacity-90",children:a}),e&&r.jsx("button",{onClick:e.onClick,className:"text-xs font-medium underline underline-offset-2 hover:no-underline mt-1",children:e.label})]})]})})});b.displayName="Alert";export{b as A,k as a,v as b,w as g};
