// Reply Guy - OpenRouter SDK Client
import { OpenRouter } from '@openrouter/sdk';
import { db } from './db';
import type { ProfileAnalysis, AnalysisCache } from './db';
import { withRateLimit, getWaitTimeDisplay } from './utils/rate-limiter';

// Initialize OpenRouter client
let client: OpenRouter | null = null;

export async function getClient(): Promise<OpenRouter> {
  if (!client) {
    const apiKey = await getApiKey();
    if (!apiKey) {
      const error = new Error('OpenRouter API key not found. Please configure in options.');
      console.error('[OpenRouter] API key missing:', error.message);
      throw error;
    }

    try {
      client = new OpenRouter({
        apiKey,
      });
    } catch (error) {
      console.error('[OpenRouter] Failed to initialize client:', error);
      throw new Error('Failed to initialize OpenRouter client. Please check your API key.');
    }
  }

  return client;
}

async function getApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['openrouterApiKey'], (result) => {
      resolve(result.openrouterApiKey || null);
    });
  });
}

// Profile analysis prompt
const PROFILE_ANALYSIS_PROMPT = `
Analyze this social media profile and extract key insights for personalized cold outreach.

Profile data will be provided as JSON.

Return a JSON object with:
{
  "summary": "2-3 sentence overview of who they are",
  "painPoints": ["list of 3-5 inferred challenges or goals"],
  "outreachAngles": [
    {
      "type": "service" | "partner" | "community" | "value_first",
      "reasoning": "why this angle works for them",
      "hook": "specific topic or post to reference"
    }
  ],
  "confidence": 0.0-1.0
}
`;

// Message generation prompt
const MESSAGE_GENERATION_PROMPT = `
Generate 3-5 personalized cold DM variants based on profile analysis.

You will receive:
1. Profile data (JSON)
2. Profile analysis (JSON)
3. Voice profile (optional JSON)

Generate messages that are:
- Concise (30-60 words)
- Authentic (match voice profile if provided)
- Personalized (reference specific details)
- Value-focused (offer something immediately)

Return JSON array:
[
  {
    "angle": "service" | "partner" | "community" | "value_first",
    "content": "actual message text",
    "whyItWorks": "brief explanation"
  }
]
`;

// Analyze profile with 24hr cache
export async function* analyzeProfile(profileData: any, profileUrl: string) {
  const cacheKey = profileUrl;

  // Check cache first
  try {
    const cached = await db.analysisCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      console.log('[OpenRouter] Cache hit, returning cached analysis');
      yield JSON.stringify(cached.analysis);
      return;
    }
  } catch (error) {
    console.warn('[OpenRouter] Cache check failed, proceeding to API:', error);
  }

  console.log('[OpenRouter] Cache miss, calling API...');

  // Check rate limit before making API call
  const waitTime = getWaitTimeDisplay();
  if (waitTime !== 'Ready') {
    console.warn(`[OpenRouter] Rate limited: please wait ${waitTime}`);
    throw new Error(`Rate limited: Please wait ${waitTime} before generating more messages.`);
  }

  let client: OpenRouter;
  try {
    client = await getClient();
  } catch (error) {
    console.error('[OpenRouter] Failed to get client:', error);
    throw error;
  }

  // Wrap API call in rate limiter
  try {
    const stream = await withRateLimit(async () => {
      return await client.chat.send({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [
          { role: 'system', content: PROFILE_ANALYSIS_PROMPT },
          { role: 'user', content: JSON.stringify(profileData) }
        ],
        stream: true,
        provider: {
          data_collection: 'deny', // Zero data retention
          sort: 'throughput'
        }
      });
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) {
        fullResponse += content;
        yield content;
      }
    }

    // Validate and parse response
    try {
      const analysis: ProfileAnalysis = JSON.parse(fullResponse);

      // Validate analysis structure
      if (!analysis.summary || !analysis.painPoints || !analysis.outreachAngles) {
        throw new Error('Invalid analysis structure: missing required fields');
      }

      // Store in cache
      try {
        await db.analysisCache.put({
          profileUrl: cacheKey,
          analysis,
          timestamp: new Date()
        });
        console.log('[OpenRouter] Analysis cached successfully');
      } catch (error) {
        console.warn('[OpenRouter] Failed to cache analysis:', error);
      }
    } catch (error) {
      console.error('[OpenRouter] Failed to parse analysis response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.error('[OpenRouter] Rate limit exceeded:', error);
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('[OpenRouter] Network error:', error);
        throw new Error('Network error. Please check your connection and try again.');
      }
      if (error.message.includes('API key')) {
        console.error('[OpenRouter] API key error:', error);
        throw new Error('Invalid API key. Please check your settings.');
      }
    }

    console.error('[OpenRouter] Analysis failed:', error);
    throw new Error('Failed to analyze profile. Please try again.');
  }
}

// Check if cache is valid (< 24hr)
function isCacheValid(timestamp: Date): boolean {
  const now = new Date();
  const cacheAge = now.getTime() - timestamp.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return cacheAge < twentyFourHours;
}

// Generate messages (streaming)
export async function* generateMessages(
  profileData: any,
  profileAnalysis: any,
  voiceProfile?: any
) {
  let client: OpenRouter;
  try {
    client = await getClient();
  } catch (error) {
    console.error('[OpenRouter] Failed to get client for message generation:', error);
    throw error;
  }

  const context = voiceProfile
    ? `Voice Profile: ${JSON.stringify(voiceProfile)}`
    : 'No voice profile provided. Use casual, authentic tone.';

  try {
    // Check rate limit before making API call
    const waitTime = getWaitTimeDisplay();
    if (waitTime !== 'Ready') {
      console.warn(`[OpenRouter] Rate limited: please wait ${waitTime}`);
      throw new Error(`Rate limited: Please wait ${waitTime} before generating more messages.`);
    }

    // Wrap API call in rate limiter
    const stream = await withRateLimit(async () => {
      return await client.chat.send({
      model: 'anthropic/claude-sonnet-4.5',
      messages: [
        { role: 'system', content: MESSAGE_GENERATION_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            profile: profileData,
            analysis: profileAnalysis,
            voiceContext: context
          })
        }
      ],
      stream: true,
      provider: {
        data_collection: 'deny',
        sort: 'throughput'
      }
    });
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) {
        fullResponse += content;
        yield content;
      }
    }

    // Validate response (check if it's valid JSON array)
    try {
      const messages = JSON.parse(fullResponse);
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
      if (messages.length === 0) {
        throw new Error('No messages generated');
      }
    } catch (error) {
      console.error('[OpenRouter] Failed to validate message generation response:', error);
      throw new Error('Failed to generate messages. Please try again.');
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.error('[OpenRouter] Rate limit exceeded:', error);
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('[OpenRouter] Network error:', error);
        throw new Error('Network error. Please check your connection and try again.');
      }
      if (error.message.includes('API key')) {
        console.error('[OpenRouter] API key error:', error);
        throw new Error('Invalid API key. Please check your settings.');
      }
    }

    console.error('[OpenRouter] Message generation failed:', error);
    throw new Error('Failed to generate messages. Please try again.');
  }
}

// Extract voice fingerprint from example messages
export async function extractVoiceProfile(messages: string[]): Promise<any> {
  let client: OpenRouter;
  try {
    client = await getClient();
  } catch (error) {
    console.error('[OpenRouter] Failed to get client for voice extraction:', error);
    throw error;
  }

  const VOICE_EXTRACTION_PROMPT = `
Analyze these message examples and extract a precise voice fingerprint.

MESSAGES:
${messages.join('\n---\n')}

Return a JSON voice profile with:
1. avgMessageLength: average word count
2. emojiFrequency: average emojis per message (decimal)
3. emojiTypes: top 5 most-used emojis (array)
4. tone: 0 (extremely casual) to 10 (extremely formal)
5. sentenceStructure: "simple" | "complex" | "mixed"
6. openingPatterns: 3-5 typical message openers
7. closingPatterns: 3-5 typical message closers
8. personalityMarkers: 3-5 distinctive traits
9. avoidPhrases: phrases this person would NEVER use
10. vocabularySignature: 10-15 distinctive words/phrases

Be extremely precise. This profile will be used to ghostwrite messages.
`;

  try {
    const response = await client.chat.send({
      model: 'anthropic/claude-sonnet-4.5',
      messages: [
        { role: 'system', content: VOICE_EXTRACTION_PROMPT },
        { role: 'user', content: messages.join('\n---\n') }
      ],
      stream: false,
      provider: {
        data_collection: 'deny'
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from voice extraction');
    }

    const voiceProfile = JSON.parse(content);

    // Validate voice profile structure
    if (!voiceProfile.avgMessageLength || !voiceProfile.tone) {
      throw new Error('Invalid voice profile structure');
    }

    return voiceProfile;
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        console.error('[OpenRouter] Rate limit exceeded:', error);
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('[OpenRouter] Network error:', error);
        throw new Error('Network error. Please check your connection and try again.');
      }
      if (error.message.includes('API key')) {
        console.error('[OpenRouter] API key error:', error);
        throw new Error('Invalid API key. Please check your settings.');
      }
      if (error instanceof SyntaxError) {
        console.error('[OpenRouter] JSON parse error:', error);
        throw new Error('Failed to analyze voice profile. Please try again.');
      }
    }

    console.error('[OpenRouter] Voice extraction failed:', error);
    throw new Error('Failed to analyze voice profile. Please try again.');
  }
}
