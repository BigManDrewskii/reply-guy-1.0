# Geist Fonts

## Current Setup (Google Fonts CDN)

The Geist font family is currently loaded via Google Fonts CDN in `assets/main.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
```

This works for development and online usage.

## Offline Bundle (Recommended for Production)

For true offline support and faster loading, download WOFF2 files and bundle them:

1. Visit: https://github.com/vercel/geist-font/releases
2. Download:
   - GeistVF.woff2 (Variable font)
   - GeistMonoVF.woff2 (Variable monospace)
3. Place them in this directory: `assets/fonts/`
4. Update `assets/main.css` to use local fonts:

```css
/* Replace Google Fonts import with: */
@font-face {
  font-family: 'Geist';
  src: url('./fonts/GeistVF.woff2') format('woff2-variations'),
       url('./fonts/GeistVF.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('./fonts/GeistMonoVF.woff2') format('woff2-variations'),
       url('./fonts/GeistMonoVF.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}
```

## Font Files Expected

- `GeistVF.woff2` - Geist Sans variable font (30-80KB)
- `GeistMonoVF.woff2` - Geist Mono variable font (30-80KB)

Total bundled size: ~60-160KB (acceptable for Chrome extension)
