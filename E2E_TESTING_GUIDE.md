# E2E Testing Guide - Reply Guy Extension

**Task:** dev-6-8: E2E Testing (Phase 6.8)
**Goal:** Test on 100 real profiles across both platforms
**Status:** MANUAL TESTING REQUIRED

---

## Overview

The Reply Guy extension is now **fully functional** with all features implemented. This guide will help you conduct comprehensive end-to-end testing on real X (Twitter) and LinkedIn profiles.

**Build Status:** ✅ 1.09 MB (no errors)
**Load extension:** `.output/chrome-mv3/` folder in Chrome

---

## Testing Checklist

### Part 1: X (Twitter) Profiles (50 profiles)

#### Profile Variety (10 each)
- [ ] Verified accounts with blue checkmark
- [ ] Unverified accounts
- [ ] High followers (100K+)
- [ ] Medium followers (10K-100K)
- [ ] Low followers (<10K)

#### For Each Profile, Verify:

**1. Scraping Accuracy**
- [ ] Name extracted correctly
- [ ] Handle (@username) extracted correctly
- [ ] Bio extracted correctly
- [ ] Location extracted correctly (if available)
- [ ] Follower count extracted and parsed correctly (1.2K, 1.2M formats)
- [ ] Verified status detected correctly

**2. Message Generation**
- [ ] Messages generate successfully (no errors)
- [ ] All angles produce valid DMs (service, partner, community, value_first)
- [ ] Messages are 30-60 words (concise)
- [ ] Messages reference specific profile details (personalized)
- [ ] Voice match score displays (if voice profile trained)

**3. UI/UX**
- [ ] Side panel opens with Command+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- [ ] Loading skeleton shows immediately
- [ ] Empty states display correctly (no API key, no voice profile, no messages)
- [ ] Confidence bar displays with correct color (green ≥80%, amber ≥60%, red <60%)
- [ ] Message tabs work correctly (switching between messages)

**4. Actions**
- [ ] Copy to clipboard works
- [ ] "Did you send it?" confirmation appears
- [ ] "Yes" button saves to conversation history
- [ ] "No" button dismisses without saving
- [ ] Toast notifications appear

**5. Conversation History**
- [ ] History tab shows sent messages
- [ ] Status dropdown works (sent → responded → no_response → converted)
- [ ] Messages display with angle, timestamp, voice score
- [ ] Copy button works on history messages
- [ ] Message count updates correctly

**6. Error Handling**
- [ ] Rate limit message shows after multiple requests (5 second wait)
- [ ] Network errors handled gracefully (try offline)
- [ ] Invalid API key shows "Open Settings" empty state
- [ ] React ErrorBoundary catches errors (try triggering one)

---

### Part 2: LinkedIn Profiles (50 profiles)

#### Profile Variety (10 each)
- [ ] Connections 500+
- [ ] Connections 100-500
- [ ] Connections <100
- [ ] With experience section (3+ positions)
- [ ] With recent posts (5+)

#### For Each Profile, Verify:

**1. Scraping Accuracy**
- [ ] Name extracted correctly
- [ ] Headline extracted correctly
- [ ] Location extracted correctly (if available)
- [ ] Follower count extracted and parsed correctly (1,234, 1.2K, 1.2M formats)
- [ ] Connection count extracted and parsed correctly
- [ ] Experience extracted (last 3 positions with titles/companies)
- [ ] Recent posts extracted (last 10 with text, reactions, comments, timestamps)
- [ ] Relative timestamps parsed correctly ("2d ago", "3h ago", "1w ago")

**2-6. Message Generation, UI/UX, Actions, History, Error Handling**
- Same checks as X profiles above

---

## Performance Testing

For both platforms, measure:

**Profile Load Time**
- [ ] Time from opening profile to side panel showing data
- Target: <5 seconds

**Message Generation Time**
- [ ] Time from first request to messages appearing
- Target: <30 seconds (depending on API response)

**End-to-End Time**
- [ ] Time from profile load to message copy
- Target: <2 minutes total

---

## Edge Cases to Test

**1. Empty Profiles**
- [ ] Profile with no bio
- [ ] Profile with no posts
- [ ] Profile with no location
- [ ] Profile with no experience (LinkedIn)

**2. Special Characters**
- [ ] Bio with emojis
- [ ] Name with unicode characters
- [ ] Handle with underscores/numbers
- [ ] Posts with hashtags, mentions, links

**3. Error Scenarios**
- [ ] Offline network (disconnect internet, try generating)
- [ ] Invalid API key (remove from settings, try generating)
- [ ] Rate limit hit (send 3 requests rapidly)
- [ ] Profile while API is down (unlikely but possible)

**4. Voice Training**
- [ ] Train voice profile with 5-10 example messages
- [ ] Verify voice match scores appear on generated messages
- [ ] Verify scores are >70% (if good examples provided)

---

## Bug Documentation Template

If you find bugs, document them using this template:

```markdown
### Bug #[Number]

**Platform:** X / LinkedIn
**Profile URL:** [Link to profile]
**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
[Paste any console errors here]

**Screenshot/Video:**
[Attach if applicable]
```

---

## Success Criteria

Phase 6.8 (E2E Testing) is complete when:

- [ ] 50 X profiles tested with 95%+ scraper accuracy
- [ ] 50 LinkedIn profiles tested with 95%+ scraper accuracy
- [ ] All message generation tests pass (valid DMs produced)
- [ ] Performance targets met (<2 min end-to-end)
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed or documented
- [ ] Edge cases documented

---

## Next Steps After Testing

1. **Document Bugs:** Create a `BUGS.md` file with all issues found
2. **Fix Critical Bugs:** Prioritize and fix blocking issues
3. **Update Selectors:** If scraping fails, update selectors in `lib/scraper/selectors/`
4. **Polish UI:** Fix any visual glitches or UX issues
5. **Complete Phase 6:** Mark dev-6-8 as complete in `.loki/queue/pending.json`
6. **QA Phase:** Proceed to QA phase (automated tests, security audit)

---

## Tips for Efficient Testing

1. **Batch Test:** Open 10 profiles in tabs, test each one sequentially
2. **Use Console:** Keep DevTools console open to catch errors
3. **Screenshot:** Take screenshots of any UI issues
4. **Network Tab:** Monitor API calls in DevTools Network tab
5. **Storage Check:** Verify IndexedDB data in DevTools Application tab
6. **Test Voice:** Train voice profile once, test on multiple profiles
7. **Test Rate Limiting:** Intentionally trigger it to verify UX

---

## Extension Features Summary

**Implemented:**
- ✅ X (Twitter) profile scraping
- ✅ LinkedIn profile scraping
- ✅ LLM-powered profile analysis (Claude Sonnet 4.5)
- ✅ Voice-matched message generation
- ✅ Voice profile training
- ✅ Conversation history tracking
- ✅ Metrics dashboard (messages generated, sent, conversion rate)
- ✅ Keyboard shortcut (Cmd/Ctrl+Shift+R)
- ✅ Error boundaries + comprehensive error handling
- ✅ Rate limiting (5 second minimum between requests)
- ✅ Skeleton loading states (shimmer)
- ✅ Empty states (API key, voice profile, no messages)
- ✅ Toast notifications
- ✅ Dark mode UI (Vercel aesthetic)

**Not Yet Implemented:**
- ⏳ E2E testing validation (this task)
- ⏳ Bug fixes from testing
- ⏳ QA phase (automated tests, security audit)

---

**Good luck with testing!** 🚀
