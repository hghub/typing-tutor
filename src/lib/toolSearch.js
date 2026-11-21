import { SEARCH_VOCABULARY } from '../tools/searchVocabulary.js'
import { getToolUseCases } from './toolUsage.js'
import { getRomanUrduTerms } from './pakistanAccessibility.js'

export function scoreMatch(tool, query) {
  const q = query.toLowerCase().trim()
  if (!q || q.length < 2) return 0
  const vocab = SEARCH_VOCABULARY[tool.id] || {}
  const terms = q.split(/\s+/).filter(t => t.length > 1)
  let score = 0

  function check(text, weight) {
    if (!text) return
    const t = text.toLowerCase()
    if (t === q) { score += weight * 4; return }
    if (t.startsWith(q)) { score += weight * 3; return }
    if (t.includes(q)) { score += weight * 2; return }
    terms.forEach(term => { if (term.length > 1 && t.includes(term)) score += weight })
  }

  check(tool.name, 100)
  check(tool.tagline, 5)
  check(tool.description, 2)
  getToolUseCases(tool).forEach(s => check(s, 2))
  tool.tags?.forEach(t => check(t, 4))
  vocab.keywords?.forEach(k => check(k, 4))
  vocab.roman_urdu?.forEach(r => check(r, 6))
  vocab.synonyms?.forEach(s => check(s, 3))
  getRomanUrduTerms(tool.id).forEach(term => check(term, 6))

  return score
}


export function searchTools(tools, query) {
  return tools.map(tool => ({ tool, score: scoreMatch(tool, query) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.tool)
}
