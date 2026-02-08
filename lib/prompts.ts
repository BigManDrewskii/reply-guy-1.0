import type { PageData, AnalysisResult, VoiceProfile } from '@/types';

export function getAnalysisPrompt(pageData: PageData): string {
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
  voiceProfile?: VoiceProfile
): string {
  let prompt = `Generate a personalized outreach message based on:

PAGE DATA:
${JSON.stringify(pageData, null, 2)}

ANALYSIS:
${JSON.stringify(analysis, null, 2)}

SELECTED ANGLE: ${selectedAngle}

`;

  if (voiceProfile) {
    prompt += `
VOICE PROFILE (match this tone and style):
- Tone: ${voiceProfile.tone}/10
- Opening patterns: ${voiceProfile.openingPatterns.join(', ')}
- Personality markers: ${voiceProfile.personalityMarkers.join(', ')}
- Avoid: ${voiceProfile.avoidPhrases.join(', ')}

`;
  }

  prompt += `Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
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
