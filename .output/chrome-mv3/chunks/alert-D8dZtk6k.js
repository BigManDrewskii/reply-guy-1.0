import{d as y}from"./badge-CZaMXL-c.js";import{c as O,r as R,j as c,I as C,C as v,a as h}from"./sidepanel-DBKoi8z6.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=O("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=O("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function q(t){return`You analyze webpages to help craft personalized outreach messages.

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
- confidenceReason should explain the rating`}function G(t,e,a,r){let s=`Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(t,null,2)}

ANALYSIS:
${JSON.stringify(e,null,2)}

SELECTED ANGLE: ${a}

`;return r&&(s+=`
VOICE PROFILE (match this tone and style):
- Tone: ${r.tone}/10
- Opening patterns: ${r.openingPatterns.join(", ")}
- Personality markers: ${r.personalityMarkers.join(", ")}
- Avoid: ${r.avoidPhrases.join(", ")}

`),s+=`Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
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
- voiceScore reflects how well it matches the requested style`,s}function _(t){return`Analyze these ${t.length} example messages to extract the writer's unique voice:

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
}`}const w=["anthropic/claude-sonnet-4","openai/gpt-4o","meta-llama/llama-3.3-70b-instruct"],L=1440*60*1e3;async function B(t,e,a={}){var d,x,b,A,k;const{onChunk:r,onComplete:s,onError:i,signal:o}=a;let l=null;for(const m of w)try{if(o!=null&&o.aborted)throw new DOMException("Aborted","AbortError");const n=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json","HTTP-Referer":(d=chrome.runtime)!=null&&d.id?`chrome-extension://${chrome.runtime.id}`:"chrome-extension://reply-guy","X-Title":"Reply Guy"},body:JSON.stringify({model:m,messages:t,stream:!0,temperature:.7,max_tokens:2e3,data_collection:"deny"}),signal:o});if(!n.ok){const f=await n.text().catch(()=>"");throw new Error(`OpenRouter API error (${m}): ${n.status} ${f}`)}const u=(x=n.body)==null?void 0:x.getReader();if(!u)throw new Error("No response body");const S=new TextDecoder;let p="";try{for(;;){if(o!=null&&o.aborted)throw u.cancel(),new DOMException("Aborted","AbortError");const{done:f,value:j}=await u.read();if(f)break;const $=S.decode(j).split(`
`);for(const E of $)if(E.startsWith("data: ")){const N=E.slice(6);if(N==="[DONE]"){s&&s(p);return}try{const g=(k=(A=(b=JSON.parse(N).choices)==null?void 0:b[0])==null?void 0:A.delta)==null?void 0:k.content;g&&(p+=g,r&&r(g))}catch{}}}}finally{u.releaseLock()}s&&s(p);return}catch(n){if(n instanceof DOMException&&n.name==="AbortError"){i&&i(n);return}if(l=n instanceof Error?n:new Error("Unknown error"),m===w[w.length-1])if(i)i(new Error(`All models failed. Last error: ${l.message}`));else throw l}}function D(t){return Date.now()-t<L}async function F(t){try{const e=await y.analysisCache.get(t);return e&&D(e.timestamp)?e.analysis:(e&&await y.analysisCache.delete(t),null)}catch{return null}}async function H(t,e){try{await y.analysisCache.put({pageUrl:t,analysis:e,timestamp:Date.now()})}catch{}}function V(t){let e=t.trim();return e.startsWith("```json")?e=e.slice(7):e.startsWith("```")&&(e=e.slice(3)),e.endsWith("```")&&(e=e.slice(0,-3)),e.trim()}const J=R.forwardRef(({className:t,variant:e="default",title:a,action:r,children:s,...i},o)=>{const d={default:C,error:v,warning:I,info:C,success:T}[e];return c.jsx("div",{ref:o,role:"alert","aria-live":e==="error"?"assertive":"polite","aria-atomic":"true",className:h("border rounded-lg p-4 relative",{"border-border bg-card":e==="default","border-destructive bg-card":e==="error","border-warning bg-card":e==="warning","border-info bg-card":e==="info","border-success bg-card":e==="success"},t),...i,children:c.jsxs("div",{className:"flex gap-3",children:[c.jsx("div",{className:h("flex-shrink-0",{"text-muted-foreground":e==="default","text-destructive":e==="error","text-warning":e==="warning","text-info":e==="info","text-success":e==="success"}),children:c.jsx(d,{size:18})}),c.jsxs("div",{className:"flex-1 space-y-1",children:[a&&c.jsx("div",{className:"font-semibold text-sm text-foreground",children:a}),c.jsx("div",{className:h("text-sm",{"text-muted-foreground":e==="default","text-destructive":e==="error","text-warning":e==="warning","text-info":e==="info","text-success":e==="success"}),children:s}),r&&c.jsx("button",{onClick:r.onClick,className:h("text-sm font-medium underline underline-offset-2 hover:no-underline",{"text-primary":e==="default","text-destructive":e==="error","text-warning":e==="warning","text-info":e==="info","text-success":e==="success"}),children:r.label})]})]})})});J.displayName="Alert";export{J as A,F as a,q as b,H as c,_ as d,V as e,G as g,B as s};
