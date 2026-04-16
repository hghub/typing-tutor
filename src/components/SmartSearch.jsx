import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import { SEARCH_VOCABULARY } from '../tools/searchVocabulary'

const PLACEHOLDER_HINTS = [
  'Search tools, features (English or Roman Urdu)…',
  'e.g. "typing speed" or "tez typing"…',
  'e.g. "tax" or "tax nikalna"…',
  'e.g. "encrypt" or "message chupana"…',
  'e.g. "expense" or "kharch ka hisaab"…',
]

function scoreMatch(tool, query) {
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

  check(tool.name, 10)
  check(tool.tagline, 5)
  check(tool.description, 2)
  tool.tags?.forEach(t => check(t, 4))
  vocab.keywords?.forEach(k => check(k, 4))
  vocab.roman_urdu?.forEach(r => check(r, 6))
  vocab.synonyms?.forEach(s => check(s, 3))

  return score
}

const searchableTools = TOOLS

export default function SmartSearch({ isDark, colors }) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState(null)
  const [focused, setFocused] = useState(false)
  const [hintIdx, setHintIdx] = useState(0)
  const inputRef  = useRef(null)
  const panelRef  = useRef(null)
  const debounce  = useRef(null)

  // Rotate placeholder hints
  useEffect(() => {
    const id = setInterval(() => setHintIdx(i => (i + 1) % PLACEHOLDER_HINTS.length), 3500)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setResults(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function runSearch(q) {
    const trimmed = q.trim()
    if (!trimmed || trimmed.length < 2) { setResults(null); return }

    const scored = searchableTools
      .map(t => ({ tool: t, score: scoreMatch(t, trimmed) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)

    const strong  = scored.filter(r => r.score >= 8).slice(0, 6).map(r => r.tool)
    const suggest = scored.filter(r => r.score >= 2 && r.score < 8).slice(0, 5).map(r => r.tool)

    setResults({ query: trimmed, strong, suggest })
  }

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    clearTimeout(debounce.current)
    if (!v.trim()) { setResults(null); return }
    debounce.current = setTimeout(() => runSearch(v), 300)
  }

  function handleClear() {
    setQuery('')
    setResults(null)
    inputRef.current?.focus()
  }

  function closeResults() {
    setQuery('')
    setResults(null)
  }

  const isOpen     = results !== null
  const hasStrong  = isOpen && results.strong.length > 0
  const hasSuggest = isOpen && results.suggest.length > 0
  const noResults  = isOpen && results.strong.length === 0 && results.suggest.length === 0

  const borderColor = focused ? '#06b6d4' : (isDark ? '#334155' : '#e2e8f0')

  return (
    <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', zIndex: 40 }}>
      {/* ── Input ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: isDark ? '#1e293b' : '#fff',
        border: `2px solid ${isOpen ? '#06b6d4' : borderColor}`,
        borderRadius: isOpen ? '0.875rem 0.875rem 0 0' : '0.875rem',
        padding: '0 1rem',
        boxShadow: focused || isOpen
          ? '0 0 0 4px rgba(6,182,212,0.15), 0 8px 32px rgba(0,0,0,0.12)'
          : isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
      }}>
        <span style={{ fontSize: '1.1rem', opacity: 0.45, flexShrink: 0, userSelect: 'none' }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDER_HINTS[hintIdx]}
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', color: colors.text,
            fontSize: '1rem', padding: '0.95rem 0', fontFamily: 'inherit',
          }}
        />
        {query ? (
          <button onClick={handleClear} style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            border: 'none', cursor: 'pointer', color: colors.textSecondary,
            fontSize: '0.8rem', width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        ) : (
          <kbd style={{
            fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '0.3rem',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: colors.textSecondary, background: 'transparent',
            fontFamily: 'inherit', flexShrink: 0, opacity: 0.6,
          }}>⌘K</kbd>
        )}
      </div>

      {/* ── Results Panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            background: isDark ? '#1e293b' : '#fff',
            border: '2px solid #06b6d4',
            borderTop: `1px solid ${isDark ? '#334155' : '#e8f0fe'}`,
            borderRadius: '0 0 0.875rem 0.875rem',
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.18)',
            padding: '0.75rem',
            maxHeight: 380,
            overflowY: 'auto',
          }}
        >
          {/* Strong matches */}
          {hasStrong && (
            <div style={{ marginBottom: hasSuggest ? '0.75rem' : 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.5rem', marginBottom: '0.4rem' }}>
                {results.strong.length} result{results.strong.length !== 1 ? 's' : ''} found
              </div>
              {results.strong.map(tool => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  onClick={closeResults}
                  style={{
                    textDecoration: 'none', display: 'flex', alignItems: 'center',
                    gap: '0.75rem', padding: '0.6rem 0.5rem', borderRadius: '0.6rem',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '1.5rem', width: 32, textAlign: 'center', flexShrink: 0 }}>{tool.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>{tool.name}</div>
                    <div style={{ fontSize: '0.77rem', color: tool.color, fontWeight: 600, marginTop: '0.1rem' }}>{tool.tagline}</div>
                  </div>
                  <span style={{
                    fontSize: '0.73rem', padding: '0.2rem 0.65rem', borderRadius: '2rem',
                    background: `${tool.color}18`, border: `1px solid ${tool.color}44`,
                    color: tool.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>Open →</span>
                </Link>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {hasSuggest && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                You might be looking for:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 0.25rem' }}>
                {results.suggest.map(tool => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    onClick={closeResults}
                    style={{
                      textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                      gap: '0.4rem', padding: '0.35rem 0.8rem', borderRadius: '2rem',
                      border: `1px solid ${tool.color}44`, background: `${tool.color}10`,
                      color: tool.color, fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${tool.color}22`; e.currentTarget.style.borderColor = tool.color }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${tool.color}10`; e.currentTarget.style.borderColor = `${tool.color}44` }}
                  >
                    <span>{tool.icon}</span><span>{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔭</div>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
                No tools found for "{results.query}"
              </p>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                Can't find what you need? Share your idea and we'll build it.
              </p>
              <button
                onClick={() => { closeResults(); window.dispatchEvent(new CustomEvent('open-feedback')) }}
                style={{
                  padding: '0.55rem 1.25rem', borderRadius: '0.6rem', border: 'none',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                }}
              >Share your idea →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
