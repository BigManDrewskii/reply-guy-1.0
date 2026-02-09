# LinkedIn DOM Selector Research Notes

## Key Insight: LinkedIn uses dynamic class names that change frequently
- CSS classes like `artdeco-pill`, `pvs-list`, etc. change with UI updates
- Data attributes like `data-view-name` are more stable
- Best approach: multi-strategy extraction with fallbacks

## Strategy for Chrome Extension (runs IN the page, logged in)

Since our extension runs as a content script in the user's authenticated LinkedIn session,
we have access to the full rendered DOM. The approach should be:

### 1. Section-based text extraction (most resilient)
- Find section headings by their IDs: `#about`, `#experience`, `#education`, `#skills`
- Extract all text content from the section container that follows
- Let the LLM parse the raw text into structured data

### 2. Multi-selector fallback per field
- Try the newest selector first, fall back to older ones
- Use aria-labels and data attributes over class names

### 3. Full page text fallback
- If specific selectors fail, extract `document.body.innerText`
- Use section heading text as anchors to split into sections
- Pass raw sections to the LLM

## Known Stable Selectors (as of 2024-2025)
- `h1` — profile name (always an h1)
- `.text-heading-xlarge` — profile name (may change)
- Section IDs: `#about`, `#experience`, `#education`, `#skills`, `#certifications`
- `[data-view-name]` attributes — more stable than classes
- `.pv-top-card` — top card container
- `section` elements — each profile section is a `<section>`
