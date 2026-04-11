/**
 * Input sanitisation helpers — zero-trust approach.
 * Never use innerHTML; use these instead of raw user strings in the DOM.
 */

/** Strip HTML tags from a string (plain-text safe). */
export function stripHtml(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '')
}

/** Limit string to maxLen characters. */
export function truncate(str, maxLen = 10000) {
  if (typeof str !== 'string') return ''
  return str.slice(0, maxLen)
}

/** Sanitise user-supplied text before analysis (strip HTML + truncate). */
export function sanitizeText(str, maxLen = 50000) {
  return truncate(stripHtml(str), maxLen)
}

/** Encode a string for safe display as text content (not innerHTML). */
export function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
