# LinkedIn Analysis Diagnosis

## Problems Found

### 1. DUPLICATE SCRAPERS — Two LinkedIn scrapers exist
- `lib/scrapers.ts` → `scrapeLinkedIn()` (imported but NEVER used in content.ts)
- `entrypoints/content.ts` → inline `scrapeLinkedIn()` function (the one that actually runs)
- The lib/scrapers.ts version has MORE selectors and fallbacks but is dead code
- The content.ts version is simpler and misses many fields

### 2. STALE CSS SELECTORS — LinkedIn changes DOM frequently
- `.text-heading-xlarge` — may not exist on newer LinkedIn layouts
- `.text-body-medium.break-words` — fragile compound selector
- `.text-body-small.inline.t-black--light.break-words` — extremely fragile
- `#about ~ div .visually-hidden + span` — depends on exact DOM structure
- `#experience ~ div .pvs-entity__path-node + div` — LinkedIn's PVS components change
- `#skills ~ div .pvs-entity__path-node + div span[aria-hidden="true"]` — same issue
- `.dist-value` — connection degree selector may be outdated
- `.pvs-header__optional-link span.t-bold` — followers selector is fragile

### 3. MISSING DATA FIELDS
- **Recent activity/posts** — content.ts scraper doesn't capture any activity
- **Education** — not scraped at all
- **Certifications** — not scraped
- **Publications** — not scraped
- **Mutual connections** — not scraped
- **Profile URL** — not extracted from canonical
- **Avatar URL** — not extracted from img tag
- **Industry** — not extracted

### 4. ABOUT SECTION EXTRACTION IS WEAK
- Only tries `#about ~ div .visually-hidden + span` 
- LinkedIn often hides about text behind "see more" button
- The `lib/scrapers.ts` version has 3 fallback selectors but isn't used

### 5. EXPERIENCE EXTRACTION IS SHALLOW
- Only gets raw text, not structured (title, company, duration)
- Selector `#experience ~ div .pvs-entity__path-node + div` is fragile
- Doesn't extract company names separately

### 6. ANALYSIS PROMPT IS DECENT BUT GETS SPARSE DATA
- The prompt in `prompts.ts` is well-structured
- But it receives mostly empty fields because the scraper fails
- `JSON.stringify(pageData)` dumps everything including empty strings

## Solution Strategy

### A. Fix the scraper with multi-strategy extraction
1. Use multiple selector strategies per field (old LinkedIn, new LinkedIn, public profile)
2. Add `innerText` fallback for sections that use aria-hidden patterns
3. Extract structured experience (title + company + duration)
4. Add education, certifications, mutual connections
5. Extract avatar URL
6. Capture recent activity from the activity section

### B. Add a body text fallback
- If specific selectors fail, extract the full visible text of key sections
- Use section headings (About, Experience, Education, Skills) as anchors
- Pass raw section text to the LLM for extraction

### C. Clean up the analysis prompt
- Only include non-empty fields in the JSON dump
- Add explicit instructions for handling sparse data
- Better confidence scoring based on what was actually captured

### D. Remove the dead scraper in lib/scrapers.ts
- Consolidate to one scraper in content.ts
- Or import from lib/scrapers.ts and remove the inline one
