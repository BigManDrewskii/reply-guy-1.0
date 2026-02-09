# Voice Profile Fix & Smart Context Gathering TODO

## Bug Fix: Profile Not Saving

- [ ] 1. Trace the save flow: `handleSaveAndExit` → `saveVoiceProfile()` → `db.voiceProfiles.put()` + `chrome.storage.local.set()`
- [ ] 2. Issue identified: `saveVoiceProfile` resets state BEFORE the async save might complete, AND the `voiceProfile` object contains `metrics` (a `LocalStyleMetrics` object with compromise.js internal data that may not be serializable to chrome.storage.local)
- [ ] 3. Fix: Ensure the profile is properly serialized, saved, and confirmed before resetting state
- [ ] 4. Fix: Add error handling with user feedback if save fails
- [ ] 5. Verify: `voiceProfileLoaded` flag persists correctly in zustand store

## Smart Context Gathering Pipeline

- [ ] 6. Create `lib/content-ingestion.ts` — the multi-source ingestion engine:
  - URL extraction via Jina Reader API (r.jina.ai)
  - Raw text/document parsing
  - AI-powered auto-segmentation into writing samples
- [ ] 7. Create `lib/url-extractor.ts` — URL detection and content fetching
- [ ] 8. Update `useVoiceTraining.ts`:
  - Accept multiple input sources (URLs, pasted text, documents)
  - Auto-detect URLs in pasted content
  - Run extraction pipeline before NLP analysis
  - Store source metadata (where each sample came from)
- [ ] 9. Rebuild `VoiceTrainingScreen.tsx` Step 1:
  - Multi-tab input: "Paste Text" | "Add URLs" | "Import"
  - URL input with fetch button and progress
  - Rich text area for pasting documents/emails
  - Source chips showing where samples came from
  - AI segmentation preview before analysis
- [ ] 10. Build and test
- [ ] 11. Commit and push
