import{d as w}from"./badge-4w6LEc2_.js";import{c as v,r as j,j as i,I as N,C as $,a as R}from"./sidepanel-DS6lTU98.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=v("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=v("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function q(t){return`You analyze webpages to help craft personalized outreach messages.

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
- confidenceReason should explain the rating`}function G(t,e,a,r){let n=`Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(t,null,2)}

ANALYSIS:
${JSON.stringify(e,null,2)}

SELECTED ANGLE: ${a}

`;return r&&(n+=`
VOICE PROFILE (match this tone and style):
- Tone: ${r.tone}/10
- Opening patterns: ${r.openingPatterns.join(", ")}
- Personality markers: ${r.personalityMarkers.join(", ")}
- Avoid: ${r.avoidPhrases.join(", ")}

`),n+=`Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message 100-150 words",
  "wordCount": number,
  "hook": "why this approach works",
  "voiceScore": 0-100
}

Rules:
- Message must be 100-150 words
- Start with a natural, conversational opening
- Reference specific details from the page/analysis
- End with clear call-to-action
- Make it sound authentic, not AI-generated
- voiceScore reflects how well it matches the requested style`,n}function _(t){return`Analyze these ${t.length} example messages to extract the writer's unique voice:

EXAMPLES:
${t.map((e,a)=>`---
Example ${a+1}:
${e}`).join(`

`)}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "tone": 0-10,
  "openingPatterns": ["3-5 common opening patterns"],
  "closingPatterns": ["3-5 common closing patterns"],
  "personalityMarkers": ["5-10 personality traits/signatures"],
  "avoidPhrases": ["phrases this writer never uses"],
  "vocabularySignature": ["5-10 characteristic words/phrases"]
}`}const g=["anthropic/claude-sonnet-4","openai/gpt-4o","meta-llama/llama-3.3-70b-instruct"],L=1440*60*1e3;async function B(t,e,a={}){var d,y,b,x,A;const{onChunk:r,onComplete:n,onError:c,signal:o}=a;let l=null;for(const h of g)try{if(o!=null&&o.aborted)throw new DOMException("Aborted","AbortError");const s=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json","HTTP-Referer":(d=chrome.runtime)!=null&&d.id?`chrome-extension://${chrome.runtime.id}`:"chrome-extension://reply-guy","X-Title":"Reply Guy"},body:JSON.stringify({model:h,messages:t,stream:!0,temperature:.7,max_tokens:2e3,data_collection:"deny"}),signal:o});if(!s.ok){const p=await s.text().catch(()=>"");throw new Error(`OpenRouter API error (${h}): ${s.status} ${p}`)}const u=(y=s.body)==null?void 0:y.getReader();if(!u)throw new Error("No response body");const C=new TextDecoder;let m="";try{for(;;){if(o!=null&&o.aborted)throw u.cancel(),new DOMException("Aborted","AbortError");const{done:p,value:O}=await u.read();if(p)break;const S=C.decode(O).split(`
`);for(const k of S)if(k.startsWith("data: ")){const E=k.slice(6);if(E==="[DONE]"){n&&n(m);return}try{const f=(A=(x=(b=JSON.parse(E).choices)==null?void 0:b[0])==null?void 0:x.delta)==null?void 0:A.content;f&&(m+=f,r&&r(f))}catch{}}}}finally{u.releaseLock()}n&&n(m);return}catch(s){if(s instanceof DOMException&&s.name==="AbortError"){c&&c(s);return}if(l=s instanceof Error?s:new Error("Unknown error"),h===g[g.length-1])if(c)c(new Error(`All models failed. Last error: ${l.message}`));else throw l}}function D(t){return Date.now()-t<L}async function F(t){try{const e=await w.analysisCache.get(t);return e&&D(e.timestamp)?e.analysis:(e&&await w.analysisCache.delete(t),null)}catch{return null}}async function H(t,e){try{await w.analysisCache.put({pageUrl:t,analysis:e,timestamp:Date.now()})}catch{}}function V(t){let e=t.trim();return e.startsWith("```json")?e=e.slice(7):e.startsWith("```")&&(e=e.slice(3)),e.endsWith("```")&&(e=e.slice(0,-3)),e.trim()}const J=j.forwardRef(({className:t,variant:e="default",title:a,action:r,children:n,...c},o)=>{const d={default:N,error:$,warning:I,info:N,success:T}[e];return i.jsx("div",{ref:o,role:"alert","aria-live":e==="error"?"assertive":"polite","aria-atomic":"true",className:R("rounded-lg px-3 py-2.5 text-xs leading-relaxed",{"bg-muted/50 text-muted-foreground border border-border/60":e==="default","bg-destructive/10 text-destructive border border-destructive/20":e==="error","bg-warning/10 text-warning border border-warning/20":e==="warning","bg-info/10 text-info border border-info/20":e==="info","bg-success/10 text-success border border-success/20":e==="success"},t),...c,children:i.jsxs("div",{className:"flex items-start gap-2",children:[i.jsx(d,{size:14,className:"shrink-0 mt-0.5"}),i.jsxs("div",{className:"flex-1 min-w-0",children:[a&&i.jsx("p",{className:"font-medium text-xs mb-0.5",children:a}),i.jsx("div",{className:"text-xs opacity-90",children:n}),r&&i.jsx("button",{onClick:r.onClick,className:"text-xs font-medium underline underline-offset-2 hover:no-underline mt-1",children:r.label})]})]})})});J.displayName="Alert";export{J as A,F as a,q as b,H as c,_ as d,V as e,G as g,B as s};
