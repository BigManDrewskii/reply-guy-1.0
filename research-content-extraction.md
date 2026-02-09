# Content Extraction Tools Research

## Strategy for Chrome Extension

Since we're in a Chrome extension, we have two approaches:
1. **Client-side extraction** - Use the content script to extract from pages the user is viewing
2. **API-based extraction** - Call an external service to fetch and extract content from URLs

## Top Candidates

### 1. Jina Reader API (r.jina.ai) ⭐ BEST FOR URLs
- **How**: Prepend `https://r.jina.ai/` to any URL → get clean markdown
- **Cost**: FREE, stable, maintained as core Jina AI product
- **Pros**: No dependencies, works from any context (background script, content script), handles JS-rendered pages, PDFs, images
- **Cons**: External API dependency, rate limits (unclear exact limits)
- **Usage**: `fetch('https://r.jina.ai/' + url)` → markdown text
- **Perfect for**: User pastes a URL → we fetch clean content automatically

### 2. Defuddle (kepano/defuddle) ⭐ BEST FOR CLIENT-SIDE
- **How**: `new Defuddle(document).parse()` → clean HTML/markdown
- **Cost**: Free, MIT license, by Obsidian creator
- **Pros**: Zero dependencies (core bundle), works in browser directly, extracts metadata, markdown option, more forgiving than Readability
- **Cons**: Work in progress, newer/less battle-tested
- **Usage**: `import Defuddle from 'defuddle'; const result = new Defuddle(document, { markdown: true }).parse();`
- **Perfect for**: Extracting content from the page the user is currently viewing

### 3. Mozilla Readability + Turndown (battle-tested combo)
- **How**: Readability extracts article → Turndown converts HTML to markdown
- **Pros**: Industry standard (powers Firefox Reader View), well-tested
- **Cons**: Two dependencies, more conservative extraction, can remove useful content
- **Usage**: Already used by many extensions including Manus itself

### 4. md-browse approach (Turndown with custom rules)
- **How**: Uses Turndown with settings tuned to match what AI tools see
- **Pros**: Matches what LLMs expect
- **Cons**: Desktop app, not directly usable as library

## Recommended Architecture

### Multi-Source Input Pipeline:

1. **URL Input** → Jina Reader API (`r.jina.ai`) for clean markdown extraction
   - Handles any URL: tweets, blog posts, LinkedIn posts, articles
   - No CORS issues (fetched from background script)
   - Handles JS-rendered SPAs

2. **Current Page** → Defuddle (client-side, zero deps)
   - Extract from the page user is currently viewing
   - Use content script injection

3. **Pasted Text** → Direct ingestion
   - User pastes raw text (emails, DMs, documents)
   - AI segments into individual writing samples

4. **AI Auto-Segmentation** → LLM splits any input into discrete writing samples
   - Takes raw extracted content
   - Identifies individual messages/posts/paragraphs
   - Returns clean array of writing samples
