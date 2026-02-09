/**
 * Extract meta tag content by name or property.
 * Shared utility used by content script and scrapers.
 */
export function getMeta(name: string): string {
  return (
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`)
  )?.getAttribute('content') || '';
}
