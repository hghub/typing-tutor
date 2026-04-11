/**
 * Urdu phonetic mapping — NLA Pakistan standard.
 * Keys are English phonetic inputs; values are Urdu Unicode characters.
 * Digraphs (2-char sequences) are listed first and take priority.
 */

/** Digraph mappings (checked before single chars). */
export const URDU_DIGRAPHS = {
  kh: 'خ',
  gh: 'غ',
  sh: 'ش',
  ch: 'چ',
  zh: 'ژ',
  ph: 'ف',
  th: 'ث',
  Th: 'ٹ',
  dh: 'ڈ',
  nh: 'ں',
  ny: 'ں',
  ng: 'ں',
  aa: 'آ',
  ae: 'ع',
  uu: 'و',
  ii: 'ی',
  ee: 'ی',
  ai: 'ے',
  ou: 'او',
  aw: 'او',
}

/** Single-character mappings. */
export const URDU_SINGLES = {
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  T: 'ٹ',
  j: 'ج',
  H: 'ح',
  d: 'د',
  D: 'ڈ',
  r: 'ر',
  R: 'ڑ',
  z: 'ز',
  s: 'س',
  x: 'ص',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  v: 'و',
  w: 'و',
  h: 'ہ',
  y: 'ی',
  e: 'ے',
  i: 'ِ',
  u: 'ُ',
  o: 'و',
  A: 'آ',
  I: 'ی',
  U: 'و',
  Z: 'ذ',
  G: 'غ',
  Y: 'ئ',
  '\'': 'ء',
  '`': 'ع',
  ',': '،',
  '.': '۔',
  '?': '؟',
  ' ': ' ',
}

/**
 * Convert a Latin phonetic string to Urdu Unicode.
 * Processes left to right, digraphs take priority over singles.
 */
export function latinToUrdu(latin) {
  let result = ''
  let i = 0
  while (i < latin.length) {
    const di = latin.slice(i, i + 2)
    if (URDU_DIGRAPHS[di] !== undefined) {
      result += URDU_DIGRAPHS[di]
      i += 2
    } else {
      const single = URDU_SINGLES[latin[i]]
      result += single !== undefined ? single : latin[i]
      i += 1
    }
  }
  return result
}

/** All mappings for the reference table (UI). */
export function getAllMappings() {
  const rows = []
  Object.entries(URDU_DIGRAPHS).forEach(([latin, urdu]) => {
    rows.push({ latin, urdu, type: 'digraph' })
  })
  Object.entries(URDU_SINGLES).forEach(([latin, urdu]) => {
    if (latin !== ' ') rows.push({ latin, urdu, type: 'single' })
  })
  return rows
}
