import type { PageData, AnalysisResult, VoiceProfile } from '@/types';
import type { MessageLength } from '@/lib/store';

const LENGTH_INSTRUCTIONS: Record<MessageLength, string> = {
  short: 'Message must be 40-80 words. Be punchy and direct — 2-3 sentences max. Get to the point fast.',
  medium: 'Message must be 100-150 words. Balance detail with brevity — 3-4 paragraphs.',
  long: 'Message must be 180-250 words. Be thorough — include context, specific references, and a detailed value proposition.',
};

export function getAnalysisPrompt(pageData: PageData): string {
  // LinkedIn-specific analysis prompt
  if (pageData.platform === 'linkedin') {
    return `You analyze LinkedIn profiles to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(pageData, null, 2)}

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
- interests must be specific professional topics, not generic phrases`;
  }

  // Default analysis prompt (X, GitHub, generic)
  return `You analyze webpages to help craft personalized outreach messages.

PAGE DATA:
${JSON.stringify(pageData, null, 2)}

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

export function getMessagePrompt(
  pageData: PageData,
  analysis: AnalysisResult,
  selectedAngle: string,
  voiceProfile?: VoiceProfile,
  messageLength: MessageLength = 'medium'
): string {
  let prompt = `Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(pageData, null, 2)}

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

  if (voiceProfile) {
    prompt += `VOICE PROFILE (match this tone and style):
- Tone: ${voiceProfile.tone}/10
- Opening patterns: ${voiceProfile.openingPatterns.join(', ')}
- Personality markers: ${voiceProfile.personalityMarkers.join(', ')}
- Avoid: ${voiceProfile.avoidPhrases.join(', ')}
`;
    // Include enhanced metrics if available
    if (voiceProfile.avgSentenceLength) {
      prompt += `- Average sentence length: ${voiceProfile.avgSentenceLength} words
`;
    }
    if (voiceProfile.formalityScore !== undefined) {
      prompt += `- Formality: ${voiceProfile.formalityScore}/100 (${voiceProfile.formalityScore > 65 ? 'formal' : voiceProfile.formalityScore < 35 ? 'casual' : 'balanced'})
`;
    }
    if (voiceProfile.readabilityScore !== undefined) {
      prompt += `- Readability target: ${voiceProfile.readabilityScore}/100 (${voiceProfile.readabilityScore > 60 ? 'easy to read' : 'more complex'})
`;
    }
    if (voiceProfile.questionFrequency !== undefined && voiceProfile.questionFrequency > 10) {
      prompt += `- This writer frequently asks questions (${voiceProfile.questionFrequency}% of sentences)
`;
    }
    prompt += '\n';
  }

  // Platform-specific instructions
  if (pageData.platform === 'linkedin') {
    prompt += `PLATFORM: LinkedIn
- Use professional but warm tone appropriate for LinkedIn
- Reference their headline, role, company, or recent activity
- If connection degree is available, adjust warmth accordingly:
  - 1st degree: Reference existing connection, be warm
  - 2nd degree: Mention mutual connections if possible
  - 3rd degree: Be more formal, establish credibility first
- Reference specific skills or experience from their profile
- If this is a connection request note, keep it under 300 characters
- Avoid overly salesy language — LinkedIn users are sensitive to spam

`;
  } else if (pageData.platform === 'x') {
    prompt += `PLATFORM: X (Twitter)
- Use conversational, authentic tone
- Reference their recent posts or tweets if available
- Keep it casual but purposeful

`;
  } else if (pageData.platform === 'github') {
    prompt += `PLATFORM: GitHub
- Reference their projects, contributions, or tech stack
- Use developer-friendly language
- Be specific about technical interests

`;
  }

  prompt += `Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "message": "personalized message",
  "wordCount": number,
  "hook": "why this approach works",
  "voiceScore": 0-100
}

Rules:
- ${LENGTH_INSTRUCTIONS[messageLength]}
- Start with a natural, conversational opening
- Reference specific details from the page/analysis
- End with clear call-to-action
- Make it sound authentic, not AI-generated
- voiceScore reflects how well it matches the requested style`;

  return prompt;
}

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

  if (voiceProfile) {
    prompt += `VOICE PROFILE:
- Tone: ${voiceProfile.tone}/10
- Personality: ${voiceProfile.personalityMarkers.join(', ')}

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
