/**
 * Text formatting and cleaning utilities.
 * All operations are pure functions — client-side only.
 */

export function trimLines(text) {
  return text.split('\n').map((l) => l.trim()).join('\n')
}

export function removeExtraSpaces(text) {
  return text.replace(/[^\S\n]+/g, ' ').trim()
}

export function removeExtraBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

export function removeAllBlankLines(text) {
  return text.split('\n').filter((l) => l.trim().length > 0).join('\n')
}

export function toUpperCase(text) {
  return text.toUpperCase()
}

export function toLowerCase(text) {
  return text.toLowerCase()
}

export function toTitleCase(text) {
  const MINOR = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as'])
  return text.toLowerCase().replace(/\b\w+/g, (word, offset) => {
    if (offset === 0 || !MINOR.has(word)) return word.charAt(0).toUpperCase() + word.slice(1)
    return word
  })
}

export function toSentenceCase(text) {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
}

export function toCamelCase(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
}

export function toSnakeCase(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function toKebabCase(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** Remove HTML/XML tags. */
export function stripHtmlTags(text) {
  return text.replace(/<[^>]*>/g, '')
}

/** Remove numbers from text. */
export function removeNumbers(text) {
  return text.replace(/\d+/g, '')
}

/** Remove punctuation. */
export function removePunctuation(text) {
  return text.replace(/[^\w\s]/g, '')
}

/** Remove duplicate lines. */
export function removeDuplicateLines(text) {
  const seen = new Set()
  return text.split('\n').filter((l) => {
    const key = l.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).join('\n')
}

/** Sort lines alphabetically. */
export function sortLines(text) {
  return text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n')
}

/** Reverse line order. */
export function reverseLines(text) {
  return text.split('\n').reverse().join('\n')
}

/** Add line numbers. */
export function addLineNumbers(text) {
  return text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')
}

/** Count and replace. */
export function replaceText(text, find, replace, caseSensitive = false) {
  if (!find) return text
  const flags = caseSensitive ? 'g' : 'gi'
  return text.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags), replace)
}
