# Reply Guy — Feature Implementation TODO

## Phase 1A: Streaming Responses
- [x] Modify `useMessageGeneration` to stream partial message text (not wait for full JSON)
- [x] Add `streamingText` state to track in-progress streaming content
- [x] Update `MessageCard` to display streaming text with typing cursor
- [x] Update `useAnalysis` to show progressive analysis results during streaming (already streams via onChunk)

## Phase 1B: Message Length Control + Thread Context
- [x] Add `messageLength` preference to store (`short` | `medium` | `long`)
- [x] Add length control UI (segmented control) to OutreachScreen
- [x] Modify `getMessagePrompt()` in prompts.ts for length variants
- [x] Extend content.ts to detect thread pages and extract thread context
- [x] Add `threadContext` field to PageData type
- [x] Include thread context in analysis and message prompts

## Phase 2A: Inline Timeline Buttons
- [x] Create `entrypoints/inline-buttons.content/index.ts` using WXT createIntegratedUi
- [x] Inject Reply Guy icon button next to tweet action bars
- [x] Use MutationObserver to handle dynamically loaded tweets (debounced 300ms)
- [x] On click: navigate to profile URL and open side panel via background.ts
- [x] Add inline CSS (blends with X's native action bar styles)

## Phase 2B: Compose Box Injection + Enhanced Voice Training
- [x] Add "Open DM" button to PostCopySheet that opens X/LinkedIn DM compose
- [x] Detect current profile username for DM URL construction
- [x] Install compromise.js for client-side NLP
- [x] Create `lib/voice-analyzer.ts` with local style metrics
- [x] Show quantified style metrics during voice training (readability, formality, vocab richness, etc.)
- [x] Include metrics in voice profile (avgSentenceLength, readabilityScore, formalityScore, etc.)

## Phase 3A: LinkedIn Support
- [x] Enhance LinkedIn scraper with more selectors (experience, posts, skills, connection degree)
- [x] Add LinkedIn-specific prompt templates (analysis + message generation)
- [x] Add LinkedIn article extraction (company pages + article pages handled)
- [x] Add connection request message type (300 char limit in prompt)

## Phase 3B: Contact Relationship Manager (Mini-CRM)
- [x] Add `contacts`, `touchpoints`, `messageVariants` tables to Dexie schema (db.ts v6)
- [x] Create `lib/crm.ts` service layer (findOrCreateContact, addTouchpoint, getCrmStats, etc.)
- [x] Auto-create contact records on message copy (OutreachScreen uses crm.ts)
- [x] Add Contacts tab to HistoryScreen with status pipeline, search, expand/collapse
- [x] Contact status pipeline (new → contacted → replied → meeting → converted → archived)
- [x] Track touchpoints: generated, copied, follow-up
- [x] CRM analytics (top angles, contacts by platform, message variants)

## Phase 4: Advanced Features
- [x] AI-ness scoring using compression-ratio algorithm (`lib/ai-score.ts`)
- [x] AI-ness breakdown panel in MessageCard (phrases, structure, hedging, vocab)
- [x] Follow-up sequence generation (3-message series with `lib/follow-up.ts`)
- [x] Chrome alarms for follow-up reminders (`background.ts` alarm handler)
- [x] Chrome notifications for due follow-ups
- [x] Follow-up scheduling button in MessageCard → OutreachScreen
- [x] Multi-model routing with preferred model selection
- [x] Model selection UI in SettingsScreen
- [x] `preferredModel` passed through useAnalysis + useMessageGeneration → streamCompletion
- [x] `alarms` and `notifications` permissions added to manifest
- [x] Version bumped to 0.3.0
