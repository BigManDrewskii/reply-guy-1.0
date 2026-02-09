import { db, type Contact, type Touchpoint, type MessageVariant } from '@/lib/db';
import type { PageData, AnalysisResult } from '@/types';

/**
 * Contact Relationship Manager (Mini-CRM) service.
 * Manages contacts, touchpoints, and message variants in Dexie.
 */

// ============================================
// Contact Management
// ============================================

/**
 * Find or create a contact from page data.
 * Returns the contact ID.
 */
export async function findOrCreateContact(
  pageData: PageData,
  analysis?: AnalysisResult
): Promise<number> {
  const profileUrl = normalizeProfileUrl(pageData.url);

  // Try to find existing contact by profile URL
  const existing = await db.contacts
    .where('profileUrl')
    .equals(profileUrl)
    .first();

  if (existing && existing.id) {
    // Update last contacted timestamp
    await db.contacts.update(existing.id, {
      lastContactedAt: Date.now(),
      totalMessages: existing.totalMessages + 1,
      // Update fields if we have newer data
      ...(pageData.name && { name: pageData.name }),
      ...(pageData.bio && { bio: pageData.bio }),
      ...(pageData.location && { location: pageData.location }),
      ...(pageData.followers && { followers: pageData.followers }),
      ...(pageData.headline && { headline: pageData.headline }),
    });
    return existing.id;
  }

  // Create new contact
  const contact: Contact = {
    name: analysis?.personName || pageData.name || pageData.ogTitle || 'Unknown',
    platform: pageData.platform,
    profileUrl,
    username: pageData.username,
    bio: pageData.bio || pageData.headline || '',
    location: pageData.location || '',
    followers: pageData.followers || '',
    headline: pageData.headline || '',
    firstContactedAt: Date.now(),
    lastContactedAt: Date.now(),
    totalMessages: 1,
    status: 'new',
    notes: '',
    tags: analysis?.interests?.slice(0, 3) || [],
  };

  const id = await db.contacts.add(contact);
  return id as number;
}

/**
 * Get all contacts, sorted by most recently contacted.
 */
export async function getAllContacts(): Promise<Contact[]> {
  return db.contacts
    .orderBy('lastContactedAt')
    .reverse()
    .toArray();
}

/**
 * Get contacts filtered by status.
 */
export async function getContactsByStatus(status: Contact['status']): Promise<Contact[]> {
  return db.contacts
    .where('status')
    .equals(status)
    .reverse()
    .sortBy('lastContactedAt');
}

/**
 * Update a contact's status.
 */
export async function updateContactStatus(
  contactId: number,
  status: Contact['status']
): Promise<void> {
  await db.contacts.update(contactId, { status });
}

/**
 * Update a contact's notes.
 */
export async function updateContactNotes(
  contactId: number,
  notes: string
): Promise<void> {
  await db.contacts.update(contactId, { notes });
}

/**
 * Add tags to a contact.
 */
export async function addContactTags(
  contactId: number,
  newTags: string[]
): Promise<void> {
  const contact = await db.contacts.get(contactId);
  if (!contact) return;

  const existingTags = contact.tags || [];
  const mergedTags = [...new Set([...existingTags, ...newTags])];
  await db.contacts.update(contactId, { tags: mergedTags });
}

/**
 * Delete a contact and all associated touchpoints.
 */
export async function deleteContact(contactId: number): Promise<void> {
  await db.touchpoints.where('contactId').equals(contactId).delete();
  await db.messageVariants.where('contactId').equals(contactId).delete();
  await db.contacts.delete(contactId);
}

/**
 * Check if a contact already exists for a given URL.
 */
export async function contactExists(url: string): Promise<Contact | undefined> {
  const profileUrl = normalizeProfileUrl(url);
  return db.contacts
    .where('profileUrl')
    .equals(profileUrl)
    .first();
}

// ============================================
// Touchpoint Management
// ============================================

/**
 * Record a touchpoint (interaction) with a contact.
 */
export async function addTouchpoint(touchpoint: Omit<Touchpoint, 'id'>): Promise<number> {
  const id = await db.touchpoints.add(touchpoint as Touchpoint);
  return id as number;
}

/**
 * Get all touchpoints for a contact.
 */
export async function getContactTouchpoints(contactId: number): Promise<Touchpoint[]> {
  return db.touchpoints
    .where('contactId')
    .equals(contactId)
    .reverse()
    .sortBy('timestamp');
}

/**
 * Get recent touchpoints across all contacts.
 */
export async function getRecentTouchpoints(limit: number = 20): Promise<Touchpoint[]> {
  return db.touchpoints
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

// ============================================
// Message Variant Management (A/B Testing)
// ============================================

/**
 * Store a message variant for A/B tracking.
 */
export async function addMessageVariant(variant: Omit<MessageVariant, 'id'>): Promise<number> {
  const id = await db.messageVariants.add(variant as MessageVariant);
  return id as number;
}

/**
 * Mark a message variant as copied.
 */
export async function markVariantCopied(variantId: number): Promise<void> {
  await db.messageVariants.update(variantId, {
    copied: true,
    copiedAt: Date.now(),
  });
}

/**
 * Get A/B analytics for a specific angle.
 */
export async function getAngleAnalytics(angle: string): Promise<{
  totalGenerated: number;
  totalCopied: number;
  copyRate: number;
  avgVoiceScore: number;
}> {
  const variants = await db.messageVariants
    .where('angle')
    .equals(angle)
    .toArray();

  const totalGenerated = variants.length;
  const totalCopied = variants.filter(v => v.copied).length;
  const copyRate = totalGenerated > 0 ? (totalCopied / totalGenerated) * 100 : 0;
  const avgVoiceScore = totalGenerated > 0
    ? variants.reduce((sum, v) => sum + v.voiceScore, 0) / totalGenerated
    : 0;

  return { totalGenerated, totalCopied, copyRate, avgVoiceScore };
}

// ============================================
// Analytics & Stats
// ============================================

/**
 * Get overall CRM statistics.
 */
export async function getCrmStats(): Promise<{
  totalContacts: number;
  contactsByStatus: Record<string, number>;
  contactsByPlatform: Record<string, number>;
  totalTouchpoints: number;
  totalMessagesCopied: number;
  avgVoiceScore: number;
  topAngles: { angle: string; count: number }[];
}> {
  const contacts = await db.contacts.toArray();
  const touchpoints = await db.touchpoints.toArray();
  const variants = await db.messageVariants.toArray();

  // Contacts by status
  const contactsByStatus: Record<string, number> = {};
  contacts.forEach(c => {
    contactsByStatus[c.status] = (contactsByStatus[c.status] || 0) + 1;
  });

  // Contacts by platform
  const contactsByPlatform: Record<string, number> = {};
  contacts.forEach(c => {
    contactsByPlatform[c.platform] = (contactsByPlatform[c.platform] || 0) + 1;
  });

  // Total messages copied
  const totalMessagesCopied = variants.filter(v => v.copied).length;

  // Average voice score
  const avgVoiceScore = variants.length > 0
    ? Math.round(variants.reduce((sum, v) => sum + v.voiceScore, 0) / variants.length)
    : 0;

  // Top angles
  const angleCounts: Record<string, number> = {};
  touchpoints.forEach(t => {
    angleCounts[t.angle] = (angleCounts[t.angle] || 0) + 1;
  });
  const topAngles = Object.entries(angleCounts)
    .map(([angle, count]) => ({ angle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    totalContacts: contacts.length,
    contactsByStatus,
    contactsByPlatform,
    totalTouchpoints: touchpoints.length,
    totalMessagesCopied,
    avgVoiceScore,
    topAngles,
  };
}

// ============================================
// Utilities
// ============================================

/**
 * Normalize a profile URL for deduplication.
 * Strips trailing slashes, query params, and fragments.
 */
function normalizeProfileUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove query params and hash
    let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}
