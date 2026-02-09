# LinkedIn Scraper Fix — TODO

- [ ] 1. Rewrite `scrapeLinkedIn()` in content.ts with section-based extraction strategy
  - [ ] 1a. Name: h1 → .text-heading-xlarge → meta tags
  - [ ] 1b. Headline: multiple selectors + aria fallback
  - [ ] 1c. About: section-based (#about) + see-more expansion + innerText
  - [ ] 1d. Experience: section-based (#experience) + structured extraction (title/company/duration)
  - [ ] 1e. Education: NEW — section-based (#education)
  - [ ] 1f. Skills: section-based (#skills) + aria-hidden spans
  - [ ] 1g. Location, connection degree, followers, avatar
  - [ ] 1h. Recent activity: section-based + feed items
  - [ ] 1i. Full page text fallback — extract body text split by sections
- [ ] 2. Remove dead `scrapeLinkedIn()` from lib/scrapers.ts
- [ ] 3. Update PageData type with new LinkedIn fields (education, avatarUrl, industry)
- [ ] 4. Improve analysis prompt to handle raw section text + structured data
- [ ] 5. Clean JSON dump — filter out empty fields before sending to LLM
- [ ] 6. Build and verify
- [ ] 7. Commit and push
