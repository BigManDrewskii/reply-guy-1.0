import type { PageData, AnalysisResult, VoiceProfile } from '@/types';
import type { MessageLength } from '@/lib/store';
import { formatMetricsForPrompt } from '@/lib/voice-analyzer';

// ============================================
// Message Length Instructions
// ============================================

const LENGTH_INSTRUCTIONS: Record<MessageLength, string> = {
  short: 'Message must be 40-80 words. Be punchy and direct — 2-3 sentences max. Get to the point fast.',
  medium: 'Message must be 100-150 words. Balance detail with brevity — 3-4 paragraphs.',
  long: 'Message must be 180-250 words. Be thorough — include context, specific references, and a detailed value proposition.',
};

// ============================================
// Copy Structure Framework
// Hook → Bridge → Value → CTA
// ============================================

const COPY_FRAMEWORK = `MESSAGE STRUCTURE (follow this framework):
1. HOOK (1-2 sentences): Open with something specific about THEM — a recent post, project, or achievement. Make it clear you've done your homework. Never start with "I" or "My".
2. BRIDGE (1-2 sentences): Connect their world to yours. Show you understand their challenges or goals.
3. VALUE (1-2 sentences): What specific value can you offer? Be concrete — not "let's collaborate" but what exactly.
4. CTA (1 sentence): Clear, low-commitment ask. A question works best. Make it easy to say yes.`;

// ============================================
// Analysis Prompts
// ============================================

/**
 * Strip empty/null/undefined fields from pageData before sending to LLM.
 * This reduces token waste and prevents the LLM from hallucinating about empty fields.
 */
function cleanPageData(data: PageData): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) continue;
    // Skip internal/redundant fields
    if (['hostname', 'isReady', 'scrapedAt', 'ogImage'].includes(key)) continue;
    clean[key] = value;
  }
  return clean;
}

export function getAnalysisPrompt(pageData: PageData): string {
  const cleanData = cleanPageData(pageData);

  if (pageData.platform === 'linkedin') {
    return `You are an expert at analyzing LinkedIn profiles to identify high-value outreach opportunities.

PROFILE DATA:
${JSON.stringify(cleanData, null, 2)}

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
- If profileSections contains raw text, parse it to extract structured information the selectors may have missed`;
  }

  return `You analyze webpages to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(cleanData, null, 2)}

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
- confidenceReason should explain the rating`;
}

// ============================================
// Message Generation Prompt
// (with structured voice profile + few-shot exemplars)
// ============================================

export function getMessagePrompt(
  pageData: PageData,
  analysis: AnalysisResult,
  selectedAngle: string,
  voiceProfile?: VoiceProfile,
  messageLength: MessageLength = 'medium'
): string {
  const cleanData = cleanPageData(pageData);

  let prompt = `Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(cleanData, null, 2)}

ANALYSIS:
${JSON.stringify(analysis, null, 2)}

SELECTED ANGLE: ${selectedAngle}

`;

  // Add thread context if available
  if (pageData.threadContext && pageData.threadContext.length > 0) {
    prompt += `THREAD CONTEXT (this person is replying in a conversation):
${pageData.threadContext.map((t, i) => `[${i + 1}] ${t}`).join('\n')}

Use the thread context to make the message more relevant and timely.

`;
  }

  // ── Structured Voice Profile Injection ──
  if (voiceProfile && voiceProfile.register) {
    prompt += buildStructuredVoiceContext(voiceProfile);
  } else if (voiceProfile) {
    // Legacy voice profile fallback
    prompt += buildLegacyVoiceContext(voiceProfile);
  }

  // ── Copy Structure Framework ──
  prompt += `${COPY_FRAMEWORK}

`;

  // ── Platform-Specific Instructions ──
  prompt += getPlatformInstructions(pageData);

  // ── Output Format ──
  prompt += `Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message following the Hook→Bridge→Value→CTA structure",
  "wordCount": number,
  "hook": "1-sentence explanation of why this approach works for this specific person",
  "voiceScore": 0-100
}

Rules:
- ${LENGTH_INSTRUCTIONS[messageLength]}
- Follow the Hook→Bridge→Value→CTA structure
- Reference specific details from the page/analysis — names, projects, posts, roles
- voiceScore: Rate honestly how well the message matches the voice profile (if provided)
- The message must sound like a REAL PERSON wrote it, not an AI
- Never use clichés like "I hope this finds you well", "I came across your profile", "I'd love to pick your brain"
- Never start with "I" — start with something about THEM`;

  return prompt;
}

// ============================================
// Structured Voice Context Builder
// (for the new VoiceProfile with register dimensions)
// ============================================

function buildStructuredVoiceContext(vp: VoiceProfile): string {
  let context = `═══ VOICE PROFILE (CRITICAL — match this voice precisely) ═══

`;

  // Register Dimensions
  context += `REGISTER DIMENSIONS (Biber's 6-factor model, 1-10 scale):
- Involved↔Informational: ${vp.register.involvedVsInformational}/10 (${vp.register.involvedVsInformational <= 4 ? 'personal/emotional' : vp.register.involvedVsInformational >= 7 ? 'detached/factual' : 'balanced'})
- Narrative↔Non-narrative: ${vp.register.narrativeVsNonNarrative}/10 (${vp.register.narrativeVsNonNarrative <= 4 ? 'story-like' : vp.register.narrativeVsNonNarrative >= 7 ? 'expository' : 'mixed'})
- Situation-dependent↔Explicit: ${vp.register.situationDependentVsExplicit}/10
- Non-persuasive↔Persuasive: ${vp.register.nonPersuasiveVsPersuasive}/10
- Concrete↔Abstract: ${vp.register.concreteVsAbstract}/10
- Casual↔Formal: ${vp.register.casualVsFormalElaboration}/10

`;

  // Tone
  context += `TONE: ${vp.tone.primary} (primary), ${vp.tone.secondary} (secondary)
- Humor: ${vp.tone.humor}
- Confidence: ${vp.tone.confidence}
- Style descriptors: ${vp.descriptors.join(', ')}

`;

  // Voice Rules (actionable instructions)
  if (vp.rules.length > 0) {
    context += `VOICE RULES (you MUST follow these):
${vp.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

`;
  }

  // Anti-Patterns (what NOT to do)
  if (vp.antiPatterns.length > 0) {
    context += `ANTI-PATTERNS (NEVER do these):
${vp.antiPatterns.map((a) => `✗ ${a}`).join('\n')}

`;
  }

  // Signature Patterns
  if (vp.signatures) {
    const sig = vp.signatures;
    if (sig.openingPatterns.length > 0) {
      context += `OPENING PATTERNS: ${sig.openingPatterns.join(' | ')}\n`;
    }
    if (sig.transitionWords.length > 0) {
      context += `TRANSITION WORDS: ${sig.transitionWords.join(', ')}\n`;
    }
    if (sig.closingPatterns.length > 0) {
      context += `CLOSING PATTERNS: ${sig.closingPatterns.join(' | ')}\n`;
    }
    if (sig.catchphrases.length > 0) {
      context += `CATCHPHRASES: ${sig.catchphrases.join(' | ')}\n`;
    }
    context += '\n';
  }

  // Quantitative Anchors (hard constraints from local NLP)
  if (vp.metrics) {
    context += `QUANTITATIVE ANCHORS (match these numbers):
${formatMetricsForPrompt(vp.metrics)}

`;
  }

  // Few-Shot Exemplars (the single biggest improvement — 23.5x better matching)
  if (vp.exemplars && vp.exemplars.length > 0) {
    context += `═══ WRITING EXEMPLARS (study these carefully — replicate this EXACT style) ═══
${vp.exemplars
  .slice(0, 3) // Use top 3 to stay within context window
  .map(
    (ex, i) =>
      `--- Exemplar ${i + 1} (${ex.wordCount} words, ${ex.context}) ---\n${ex.text}`
  )
  .join('\n\n')}

CRITICAL: The message you generate must read as if the SAME PERSON who wrote the exemplars above wrote it. Match their sentence rhythm, word choices, punctuation habits, and energy level.

`;
  }

  return context;
}

// ============================================
// Legacy Voice Context (backward compat)
// ============================================

function buildLegacyVoiceContext(vp: any): string {
  let context = `VOICE PROFILE (match this tone and style):\n`;
  if (vp.tone !== undefined) context += `- Tone: ${vp.tone}/10\n`;
  if (vp.openingPatterns?.length) context += `- Opening patterns: ${vp.openingPatterns.join(', ')}\n`;
  if (vp.personalityMarkers?.length) context += `- Personality markers: ${vp.personalityMarkers.join(', ')}\n`;
  if (vp.avoidPhrases?.length) context += `- Avoid: ${vp.avoidPhrases.join(', ')}\n`;
  if (vp.avgSentenceLength) context += `- Average sentence length: ${vp.avgSentenceLength} words\n`;
  if (vp.formalityScore !== undefined) context += `- Formality: ${vp.formalityScore}/100\n`;
  context += '\n';
  return context;
}

// ============================================
// Platform-Specific Instructions
// ============================================

function getPlatformInstructions(pageData: PageData): string {
  if (pageData.platform === 'linkedin') {
    let instructions = `PLATFORM: LinkedIn
- Use professional but warm tone appropriate for LinkedIn DMs
- Reference SPECIFIC details: their actual job title, company name, a project they worked on, or a skill they have
- If their About section is available, reference something specific from it — it's their own words about what they care about
- If experience data shows a career trajectory, acknowledge it (e.g., "your move from X to Y shows...")
- If education is available and relevant, mention shared alma mater or notable programs
- If recent activity/posts are available, reference them — it's the most timely hook possible
`;
    if (pageData.connectionDegree) {
      const degree = pageData.connectionDegree.trim();
      if (degree.includes('1')) {
        instructions += `- CONNECTION: 1st degree — you're already connected. Be warm, reference the existing connection.
`;
      } else if (degree.includes('2')) {
        instructions += `- CONNECTION: 2nd degree — mention mutual connections if possible. Medium warmth.
`;
      } else {
        instructions += `- CONNECTION: 3rd degree or unknown — establish credibility first. Be more formal.
`;
      }
    }
    instructions += `- Avoid overly salesy language — LinkedIn users are highly sensitive to spam and generic outreach
- NEVER use phrases like "I came across your profile", "I hope this finds you well", "I'd love to connect"
- If this is a connection request note, keep it under 300 characters

`;
    return instructions;
  }

  if (pageData.platform === 'x') {
    return `PLATFORM: X (Twitter)
- Use conversational, authentic tone
- Reference their recent posts or tweets if available
- Keep it casual but purposeful

`;
  }

  if (pageData.platform === 'github') {
    return `PLATFORM: GitHub
- Reference their projects, contributions, or tech stack
- Use developer-friendly language
- Be specific about technical interests

`;
  }

  return '';
}

// ============================================
// Self-Refinement Prompt
// (optional second pass for higher quality)
// ============================================

export function getSelfRefinementPrompt(
  generatedMessage: string,
  voiceProfile: VoiceProfile,
  voiceMatchScore: number,
  scoreBreakdown: Record<string, number>
): string {
  // Find the weakest dimensions
  const weakDimensions = Object.entries(scoreBreakdown)
    .filter(([, score]) => score < 70)
    .sort((a, b) => a[1] - b[1])
    .map(([dim, score]) => `${dim}: ${score}/100`);

  let prompt = `You are a voice-matching editor. A message was generated to match a specific voice profile, but scored ${voiceMatchScore}/100 on voice matching.

GENERATED MESSAGE:
"${generatedMessage}"

`;

  if (weakDimensions.length > 0) {
    prompt += `WEAK DIMENSIONS (fix these):
${weakDimensions.join('\n')}

`;
  }

  // Include the voice rules and anti-patterns
  prompt += `VOICE RULES TO FOLLOW:
${voiceProfile.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

ANTI-PATTERNS TO AVOID:
${voiceProfile.antiPatterns.map((a) => `✗ ${a}`).join('\n')}

`;

  // Include quantitative targets
  if (voiceProfile.metrics) {
    prompt += `TARGET METRICS:
- Sentence length: aim for ~${voiceProfile.metrics.sentenceLength.mean} words per sentence
- Formality: ${voiceProfile.metrics.formalityScore}/100
- Contraction rate: ${voiceProfile.metrics.contractionRate}% of sentences should use contractions
- Active voice: ${voiceProfile.metrics.activeVoiceRate}%
${voiceProfile.metrics.punctuation.exclamationRate > 10 ? `- Use exclamation marks (${voiceProfile.metrics.punctuation.exclamationRate}% of sentences)` : '- Avoid exclamation marks'}
${voiceProfile.metrics.punctuation.questionRate > 15 ? `- Include questions (${voiceProfile.metrics.punctuation.questionRate}% of sentences)` : ''}

`;
  }

  // Include exemplars for reference
  if (voiceProfile.exemplars && voiceProfile.exemplars.length > 0) {
    prompt += `REFERENCE EXEMPLARS (match this style):
${voiceProfile.exemplars
  .slice(0, 2)
  .map((ex, i) => `--- ${i + 1} ---\n${ex.text}`)
  .join('\n\n')}

`;
  }

  prompt += `TASK: Rewrite the message to better match the voice profile. Fix the weak dimensions while keeping the same intent, recipient context, and call-to-action. The rewritten message should score 85+ on voice matching.

Return JSON (no markdown, no code blocks):
{
  "message": "rewritten message",
  "wordCount": number,
  "hook": "same hook as before",
  "voiceScore": 0-100,
  "changes": "brief description of what you changed and why"
}`;

  return prompt;
}

// ============================================
// Follow-Up Prompt
// ============================================

export function getFollowUpPrompt(
  originalMessage: string,
  analysis: AnalysisResult,
  followUpNumber: number,
  voiceProfile?: VoiceProfile
): string {
  let prompt = `Generate follow-up message #${followUpNumber} for this outreach:

ORIGINAL MESSAGE:
${originalMessage}

CONTEXT:
${JSON.stringify(analysis, null, 2)}

`;

  if (voiceProfile && voiceProfile.register) {
    // Use structured voice profile
    prompt += `VOICE PROFILE:
- Tone: ${voiceProfile.tone.primary}, ${voiceProfile.tone.secondary}
- Confidence: ${voiceProfile.tone.confidence}
- Rules: ${voiceProfile.rules.slice(0, 5).join('; ')}

`;
    if (voiceProfile.exemplars && voiceProfile.exemplars.length > 0) {
      prompt += `STYLE REFERENCE:
"${voiceProfile.exemplars[0].text}"

`;
    }
  } else if (voiceProfile) {
    // Legacy fallback
    prompt += `VOICE PROFILE:
- Tone: ${(voiceProfile as any).tone}/10
- Personality: ${(voiceProfile as any).personalityMarkers?.join(', ') || 'N/A'}

`;
  }

  prompt += `Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "follow-up message, 50-80 words",
  "wordCount": number,
  "hook": "why this follow-up approach works",
  "voiceScore": 0-100,
  "suggestedDelay": "e.g. 3 days, 1 week"
}

Rules:
- Follow-up #1: Gentle bump, add new value or insight
- Follow-up #2: Different angle, share something useful
- Follow-up #3: Final attempt, be direct about closing the loop
- Never be pushy or desperate
- Reference the original message naturally
- Keep it shorter than the original (50-80 words)`;

  return prompt;
}

// ============================================
// Legacy Voice Extraction Prompt (kept for compat)
// ============================================

export function getVoiceExtractionPrompt(exampleMessages: string[]): string {
  return `Analyze these ${exampleMessages.length} example messages to extract the writer's unique voice:

EXAMPLES:
${exampleMessages.map((msg, i) => `---\nExample ${i + 1}:\n${msg}`).join('\n\n')}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "tone": 0-10,
  "openingPatterns": ["3-5 common opening patterns"],
  "closingPatterns": ["3-5 common closing patterns"],
  "personalityMarkers": ["5-10 personality traits/signatures"],
  "avoidPhrases": ["phrases this writer never uses"],
  "vocabularySignature": ["5-10 characteristic words/phrases"]
}`;
}
