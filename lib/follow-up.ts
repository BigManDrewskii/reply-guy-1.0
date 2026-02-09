/**
 * Follow-Up Sequence Module
 * 
 * Generates 3-message follow-up sequences with increasing urgency,
 * and manages Chrome alarms for follow-up reminders.
 */

import { db, type Contact, type Touchpoint } from '@/lib/db';

export interface FollowUpMessage {
  sequence: number; // 1, 2, or 3
  delay: string;    // "3 days", "7 days", "14 days"
  delayMs: number;
  tone: string;     // "gentle", "value-add", "final"
  prompt: string;   // Prompt to send to LLM
}

export interface FollowUpPlan {
  contactId: number;
  contactName: string;
  originalAngle: string;
  originalMessage: string;
  messages: FollowUpMessage[];
  createdAt: number;
}

/**
 * Generate a 3-message follow-up sequence plan
 */
export function generateFollowUpPlan(
  contact: Contact,
  originalMessage: string,
  originalAngle: string,
  platform: string,
): FollowUpPlan {
  const name = contact.name || 'this person';
  const platformContext = platform === 'linkedin' 
    ? 'LinkedIn connection/message' 
    : platform === 'x' 
      ? 'X/Twitter DM' 
      : 'message';

  return {
    contactId: contact.id!,
    contactName: contact.name,
    originalAngle,
    originalMessage,
    createdAt: Date.now(),
    messages: [
      {
        sequence: 1,
        delay: '3 days',
        delayMs: 3 * 24 * 60 * 60 * 1000,
        tone: 'gentle',
        prompt: `Write a gentle follow-up ${platformContext} to ${name}. 

Context: I previously sent this message:
"${originalMessage.slice(0, 300)}"

The follow-up should:
- Be SHORT (2-3 sentences max)
- Reference the original message briefly without repeating it
- Add a small new insight or value point
- NOT be pushy or desperate
- Sound natural and human
- End with a soft call to action

Tone: Casual, friendly, brief. Like bumping a thread.`,
      },
      {
        sequence: 2,
        delay: '7 days',
        delayMs: 7 * 24 * 60 * 60 * 1000,
        tone: 'value-add',
        prompt: `Write a value-add follow-up ${platformContext} to ${name}.

Context: I sent an initial outreach message about ${originalAngle}, and a gentle follow-up 3 days later. Neither got a response.

The follow-up should:
- Be 3-4 sentences
- Lead with NEW value (share a relevant insight, resource, or observation about their work)
- NOT reference the previous messages directly
- Feel like a fresh, helpful message rather than a "just checking in"
- Include something specific about their recent activity or content
- End with a low-pressure question

Tone: Helpful, knowledgeable, not salesy.`,
      },
      {
        sequence: 3,
        delay: '14 days',
        delayMs: 14 * 24 * 60 * 60 * 1000,
        tone: 'final',
        prompt: `Write a final, graceful follow-up ${platformContext} to ${name}.

Context: This is the third and final follow-up. Previous messages about ${originalAngle} went unanswered.

The follow-up should:
- Be 2 sentences MAX
- Acknowledge they're busy (without being passive-aggressive)
- Leave the door open for future connection
- NOT guilt-trip or be desperate
- Be memorable and classy

Tone: Respectful, brief, confident. Like closing a door gently.`,
      },
    ],
  };
}

/**
 * Schedule follow-up reminders using Chrome alarms
 */
export async function scheduleFollowUps(plan: FollowUpPlan): Promise<void> {
  for (const msg of plan.messages) {
    const alarmName = `followup-${plan.contactId}-${msg.sequence}`;
    const when = Date.now() + msg.delayMs;

    try {
      await chrome.alarms.create(alarmName, { when });
      
      // Store the follow-up plan in chrome.storage.local for the alarm handler
      const key = `followup_${plan.contactId}_${msg.sequence}`;
      await chrome.storage.local.set({
        [key]: {
          contactId: plan.contactId,
          contactName: plan.contactName,
          sequence: msg.sequence,
          tone: msg.tone,
          prompt: msg.prompt,
          scheduledFor: when,
        },
      });

      // Add touchpoint
      await db.touchpoints.add({
        contactId: plan.contactId,
        type: 'follow_up_scheduled',
        angle: plan.originalAngle,
        message: `Follow-up #${msg.sequence} (${msg.tone}) scheduled for ${msg.delay}`,
        platform: 'system',
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn(`[follow-up] Failed to schedule alarm ${alarmName}:`, err);
    }
  }
}

/**
 * Cancel all follow-ups for a contact
 */
export async function cancelFollowUps(contactId: number): Promise<void> {
  for (let seq = 1; seq <= 3; seq++) {
    const alarmName = `followup-${contactId}-${seq}`;
    try {
      await chrome.alarms.clear(alarmName);
      await chrome.storage.local.remove(`followup_${contactId}_${seq}`);
    } catch {
      // Alarm may not exist
    }
  }
}

/**
 * Get pending follow-ups for a contact
 */
export async function getPendingFollowUps(contactId: number): Promise<{
  sequence: number;
  tone: string;
  scheduledFor: number;
}[]> {
  const pending: { sequence: number; tone: string; scheduledFor: number }[] = [];

  for (let seq = 1; seq <= 3; seq++) {
    const key = `followup_${contactId}_${seq}`;
    const result = await chrome.storage.local.get(key);
    if (result[key]) {
      pending.push({
        sequence: result[key].sequence,
        tone: result[key].tone,
        scheduledFor: result[key].scheduledFor,
      });
    }
  }

  return pending.sort((a, b) => a.scheduledFor - b.scheduledFor);
}

/**
 * Handle a follow-up alarm firing (called from background.ts)
 */
export async function handleFollowUpAlarm(alarmName: string): Promise<{
  contactId: number;
  contactName: string;
  sequence: number;
  prompt: string;
} | null> {
  const match = alarmName.match(/^followup-(\d+)-(\d+)$/);
  if (!match) return null;

  const contactId = parseInt(match[1], 10);
  const sequence = parseInt(match[2], 10);
  const key = `followup_${contactId}_${sequence}`;

  const result = await chrome.storage.local.get(key);
  if (!result[key]) return null;

  const data = result[key];

  // Clean up the stored data
  await chrome.storage.local.remove(key);

  // Add touchpoint
  await db.touchpoints.add({
    contactId,
    type: 'follow_up_due',
    angle: 'follow-up',
    message: `Follow-up #${sequence} (${data.tone}) is due`,
    platform: 'system',
    timestamp: Date.now(),
  });

  return {
    contactId: data.contactId,
    contactName: data.contactName,
    sequence: data.sequence,
    prompt: data.prompt,
  };
}
