/**
 * Text analysis utilities for Word Counter tool.
 * All processing is client-side — no data leaves the browser.
 */

/** Count words (split on whitespace, ignore empty tokens). */
export function countWords(text) {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

/** Count characters (all). */
export function countChars(text) {
  return text.length
}

/** Count characters excluding spaces. */
export function countCharsNoSpaces(text) {
  return text.replace(/\s/g, '').length
}

/** Count sentences (ends with . ! ?). */
export function countSentences(text) {
  if (!text.trim()) return 0
  const matches = text.match(/[^.!?]*[.!?]+/g)
  return matches ? matches.length : 1
}

/** Count paragraphs (separated by blank lines). */
export function countParagraphs(text) {
  if (!text.trim()) return 0
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
}

/** Count lines. */
export function countLines(text) {
  if (!text) return 0
  return text.split('\n').length
}

/**
 * Flesch Reading Ease score.
 * 90–100 = Very Easy, 60–70 = Standard, 0–30 = Very Difficult
 */
export function fleschReadingEase(text) {
  const words = countWords(text)
  const sentences = countSentences(text)
  const syllables = countSyllables(text)
  if (words === 0 || sentences === 0) return null
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  return Math.min(100, Math.max(0, Math.round(score)))
}

/** Rough syllable counter (English heuristic). */
export function countSyllables(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || []
  return words.reduce((total, word) => {
    const vowelGroups = word.match(/[aeiouy]+/g) || []
    const count = Math.max(1, vowelGroups.length - (word.endsWith('e') ? 1 : 0))
    return total + count
  }, 0)
}

/** Average words per sentence. */
export function avgWordsPerSentence(text) {
  const w = countWords(text)
  const s = countSentences(text)
  if (s === 0) return 0
  return Math.round((w / s) * 10) / 10
}

/** Estimated reading time in seconds at 200 wpm. */
export function readingTimeSec(text) {
  return Math.ceil((countWords(text) / 200) * 60)
}

/** Format reading time as "X min Y sec". */
export function formatReadingTime(text) {
  const total = readingTimeSec(text)
  if (total < 60) return `${total} sec`
  const min = Math.floor(total / 60)
  const sec = total % 60
  return sec > 0 ? `${min} min ${sec} sec` : `${min} min`
}

/** Flesch grade label. */
export function readabilityLabel(score) {
  if (score === null) return '—'
  if (score >= 90) return 'Very Easy'
  if (score >= 80) return 'Easy'
  if (score >= 70) return 'Fairly Easy'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  if (score >= 30) return 'Difficult'
  return 'Very Difficult'
}

/** Top N keywords (excluding stop words). */
export function topKeywords(text, n = 10) {
  const STOP = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','being','have','has','had','do','does',
    'did','will','would','could','should','may','might','can','this','that',
    'these','those','i','you','he','she','it','we','they','my','your','his',
    'her','its','our','their','me','him','us','them','by','from','as','so',
    'if','not','no','up','out','all','more','also','just','than','then','when',
    'there','here','what','which','who','how','about','into','after','before',
  ])
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  const freq = {}
  words.forEach((w) => {
    if (!STOP.has(w)) freq[w] = (freq[w] || 0) + 1
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({ word, count }))
}

/** Full analysis object. */
export function analyzeText(text) {
  const feScore = fleschReadingEase(text)
  return {
    words: countWords(text),
    chars: countChars(text),
    charsNoSpaces: countCharsNoSpaces(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: countLines(text),
    syllables: countSyllables(text),
    avgWordsPerSentence: avgWordsPerSentence(text),
    readingTime: formatReadingTime(text),
    fleschScore: feScore,
    readabilityLabel: readabilityLabel(feScore),
    topKeywords: topKeywords(text, 10),
  }
}
