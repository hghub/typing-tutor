import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f97316'

const FLAGS_INFO = [
  { flag: 'g', label: 'Global',           desc: 'Find all matches, not just the first' },
  { flag: 'i', label: 'Case Insensitive', desc: 'Match regardless of letter case' },
  { flag: 'm', label: 'Multiline',        desc: '^ and $ match start/end of each line' },
  { flag: 's', label: 'Dot All',          desc: '. matches newline characters too' },
  { flag: 'u', label: 'Unicode',          desc: 'Enable full Unicode support (e.g. \\u{1F600})' },
]

const COMMON_PATTERNS = [
  { name: 'Email',            pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL',              pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?' },
  { name: 'Phone (PK +92)',   pattern: '(\\+92|0092|0)3[0-9]{2}[\\-\\s]?[0-9]{7}' },
  { name: 'CNIC',             pattern: '[0-9]{5}-?[0-9]{7}-?[0-9]' },
  { name: 'Date DD/MM/YYYY',  pattern: '(0?[1-9]|[12][0-9]|3[01])\\/(0?[1-9]|1[012])\\/(19|20)?\\d{2}' },
  { name: 'IPv4',             pattern: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' },
  { name: 'Hex Color',        pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' },
  { name: 'Postal Code',      pattern: '\\b[0-9]{5}\\b' },
]

/* Distinct highlight colors for successive matches */
const MATCH_COLORS = [
  'rgba(249,115,22,0.30)',
  'rgba(139,92,246,0.30)',
  'rgba(16,185,129,0.30)',
  'rgba(59,130,246,0.30)',
  'rgba(236,72,153,0.30)',
  'rgba(234,179,8,0.30)',
]

/* ── helpers ──────────────────────────────────────────────────────────────── */
function buildRegex(pattern, flagStr) {
  if (!pattern) return { regex: null, error: null }
  try {
    return { regex: new RegExp(pattern, flagStr), error: null }
  } catch (e) {
    return { regex: null, error: e.message }
  }
}

function runMatches(regex, text) {
  if (!regex || !text) return []
  const results = []

  if (regex.flags.includes('g')) {
    const re = new RegExp(regex.source, regex.flags)
    let m
    while ((m = re.exec(text)) !== null) {
      results.push({
        index: results.length,
        match: m[0],
        groups: Array.from({ length: m.length - 1 }, (_, i) => m[i + 1]),
        start: m.index,
        end: m.index + m[0].length,
      })
      if (m[0].length === 0) re.lastIndex++ // guard against infinite loops
    }
  } else {
    const m = regex.exec(text)
    if (m) {
      results.push({
        index: 0,
        match: m[0],
        groups: Array.from({ length: m.length - 1 }, (_, i) => m[i + 1]),
        start: m.index,
        end: m.index + m[0].length,
      })
    }
  }
  return results
}

function buildSegments(text, matches) {
  if (!matches.length) return [{ text, matchIdx: -1 }]
  const segs = []
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) segs.push({ text: text.slice(pos, m.start), matchIdx: -1 })
    segs.push({ text: m.match, matchIdx: m.index })
    pos = m.end
  }
  if (pos < text.length) segs.push({ text: text.slice(pos), matchIdx: -1 })
  return segs
}

/* ── sub-components ───────────────────────────────────────────────────────── */
function Th({ children, colors }) {
  return (
    <th style={{
      textAlign: 'left',
      padding: '0.45rem 0.7rem',
      color: colors.textSecondary,
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

function Td({ children, colors, accent }) {
  return (
    <td style={{
      padding: '0.45rem 0.7rem',
      color: accent ? ACCENT : colors.text,
      fontWeight: accent ? 700 : 400,
      verticalAlign: 'middle',
      fontSize: '0.82rem',
    }}>
      {children}
    </td>
  )
}

/* ── main component ───────────────────────────────────────────────────────── */
export default function RegexTester() {
  const { isDark, colors } = useTheme()

  const [pattern, setPattern]         = useState('')
  const [flags, setFlags]             = useState({ g: true, i: false, m: false, s: false, u: false })
  const [testStr, setTestStr]         = useState('')
  const [replaceMode, setReplaceMode] = useState(false)
  const [replacement, setReplacement] = useState('')
  const [copiedPat, setCopiedPat]     = useState(false)
  const [copiedMat, setCopiedMat]     = useState(false)

  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')

  const { regex, error } = useMemo(() => buildRegex(pattern, flagStr), [pattern, flagStr])
  const matches          = useMemo(() => runMatches(regex, testStr), [regex, testStr])
  const segments         = useMemo(() => buildSegments(testStr, matches), [testStr, matches])
  const maxGroups        = useMemo(() => matches.reduce((n, m) => Math.max(n, m.groups.length), 0), [matches])

  const replacedResult = useMemo(() => {
    if (!replaceMode || !regex || !testStr) return ''
    try { return testStr.replace(regex, replacement) } catch { return '' }
  }, [replaceMode, regex, testStr, replacement])

  const toggleFlag = (f) => setFlags(p => ({ ...p, [f]: !p[f] }))

  const copyPattern = () => {
    if (!pattern) return
    navigator.clipboard.writeText(`/${pattern}/${flagStr}`).then(() => {
      setCopiedPat(true); setTimeout(() => setCopiedPat(false), 1800)
    })
  }

  const copyMatches = () => {
    if (!matches.length) return
    const data = matches.map(m => ({ index: m.index, match: m.match, groups: m.groups, start: m.start, end: m.end }))
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopiedMat(true); setTimeout(() => setCopiedMat(false), 1800)
    })
  }

  /* ── styles ─────────────────────────────────────────────────────────────── */
  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.875rem',
    padding: '1.25rem',
  }

  const label$ = {
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: '0.45rem',
    display: 'block',
  }

  const input$ = (hasError) => ({
    background: colors.input,
    border: `1px solid ${hasError ? '#ef4444' : colors.inputBorder}`,
    borderRadius: '0.5rem',
    padding: '0.6rem 0.75rem',
    color: colors.text,
    fontSize: '0.88rem',
    fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  })

  const textarea$ = {
    ...input$(false),
    minHeight: '130px',
    resize: 'vertical',
    lineHeight: 1.65,
  }

  const btn$ = {
    padding: '0.38rem 0.85rem',
    borderRadius: '0.5rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
  }

  const primary$ = { ...btn$, background: ACCENT, color: '#fff' }

  const secondary$ = {
    ...btn$,
    background: isDark ? '#1e293b' : '#e2e8f0',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  }

  const monoPreview$ = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
    fontSize: '0.85rem',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: colors.text,
    minHeight: '3rem',
  }

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <ToolLayout toolId="regex-tester">
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Header ── */}
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            Regex Tester
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.95rem' }}>
            Build, test, and debug regular expressions in real-time — entirely in your browser.
          </p>
        </div>

        {/* ── Pattern + Flags ── */}
        <div style={card}>
          {/* header row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.6rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ ...label$, marginBottom: 0 }}>Pattern</span>
            <button
              style={{ ...secondary$, marginLeft: 'auto', fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
              disabled={!pattern}
              onClick={copyPattern}
            >
              {copiedPat ? '✓ Copied!' : '📋 Copy Pattern'}
            </button>
          </div>

          {/* /pattern/flags row */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <span style={{
              display: 'flex', alignItems: 'center',
              padding: '0 0.55rem',
              background: isDark ? '#0f172a' : '#f1f5f9',
              border: `1px solid ${error && pattern ? '#ef4444' : colors.inputBorder}`,
              borderRight: 'none',
              borderRadius: '0.5rem 0 0 0.5rem',
              color: colors.muted,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              userSelect: 'none',
            }}>
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="e.g. (\\w+)@(\\w+\\.\\w+)"
              spellCheck={false}
              style={{
                ...input$(error && !!pattern),
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                flex: 1,
              }}
            />
            <span style={{
              display: 'flex', alignItems: 'center',
              padding: '0 0.55rem',
              background: isDark ? '#0f172a' : '#f1f5f9',
              border: `1px solid ${error && pattern ? '#ef4444' : colors.inputBorder}`,
              borderLeft: 'none',
              borderRadius: '0 0.5rem 0.5rem 0',
              color: ACCENT,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              fontWeight: 700,
              userSelect: 'none',
              minWidth: '1.5rem',
            }}>
              /{flagStr}
            </span>
          </div>

          {/* inline error */}
          {error && pattern && (
            <div style={{
              marginTop: '0.35rem',
              padding: '0.35rem 0.65rem',
              background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '0.4rem',
              color: '#ef4444',
              fontSize: '0.79rem',
              fontFamily: 'monospace',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* flags row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
            {FLAGS_INFO.map(({ flag, label }) => (
              <label
                key={flag}
                title={FLAGS_INFO.find(f => f.flag === flag)?.desc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  fontSize: '0.83rem',
                  color: flags[flag] ? ACCENT : colors.textSecondary,
                  fontWeight: flags[flag] ? 700 : 400,
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={flags[flag]}
                  onChange={() => toggleFlag(flag)}
                  style={{ accentColor: ACCENT, cursor: 'pointer', width: '14px', height: '14px' }}
                />
                <code style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{flag}</code>
                <span style={{ fontSize: '0.75rem' }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Common Patterns Library ── */}
        <div style={card}>
          <span style={label$}>Common Patterns — click to insert</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {COMMON_PATTERNS.map(({ name, pattern: p }) => {
              const active = pattern === p
              return (
                <button
                  key={name}
                  onClick={() => setPattern(p)}
                  style={{
                    ...secondary$,
                    fontSize: '0.77rem',
                    padding: '0.28rem 0.6rem',
                    borderColor: active ? ACCENT : colors.border,
                    color: active ? ACCENT : colors.text,
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Test String + Highlighted Preview ── */}
        <div style={card}>
          <span style={label$}>Test String</span>
          <textarea
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
            placeholder="Paste or type your test string here…"
            spellCheck={false}
            style={textarea$}
          />

          {testStr && (
            <div style={{ marginTop: '0.9rem' }}>
              <span style={{ ...label$, marginBottom: '0.4rem' }}>Highlighted Preview</span>
              <div style={monoPreview$}>
                {segments.map((seg, i) =>
                  seg.matchIdx === -1
                    ? <span key={i}>{seg.text}</span>
                    : (
                      <mark
                        key={i}
                        title={`Match ${seg.matchIdx + 1}: "${seg.text}"`}
                        style={{
                          background: MATCH_COLORS[seg.matchIdx % MATCH_COLORS.length],
                          color: 'inherit',
                          borderRadius: '0.2rem',
                          padding: '0.05em 0.15em',
                          outline: `1.5px solid ${ACCENT}55`,
                          outlineOffset: '0px',
                        }}
                      >
                        {seg.text}
                      </mark>
                    )
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Replace Mode ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: replaceMode ? '0.85rem' : 0, flexWrap: 'wrap' }}>
            <span style={{ ...label$, marginBottom: 0 }}>Replace Mode</span>
            <button
              onClick={() => setReplaceMode(r => !r)}
              style={{
                ...btn$,
                background: replaceMode ? ACCENT : (isDark ? '#1e293b' : '#e2e8f0'),
                color: replaceMode ? '#fff' : colors.text,
                border: `1px solid ${replaceMode ? ACCENT : colors.border}`,
                padding: '0.28rem 0.7rem',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
              }}
            >
              {replaceMode ? '● ON' : '○ OFF'}
            </button>
          </div>

          {replaceMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={label$}>Replacement String</span>
                <input
                  type="text"
                  value={replacement}
                  onChange={e => setReplacement(e.target.value)}
                  placeholder="Use $1, $2… for captured groups"
                  spellCheck={false}
                  style={input$(false)}
                />
              </div>
              <div>
                <span style={label$}>Preview (replaced result)</span>
                <div style={{
                  ...monoPreview$,
                  color: replacedResult ? colors.text : colors.muted,
                  fontStyle: replacedResult ? 'normal' : 'italic',
                }}>
                  {replacedResult || (testStr ? 'No matches — nothing replaced.' : 'Enter a test string above.')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Match List ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ ...label$, marginBottom: 0 }}>Matches</span>
            {/* badge */}
            <span style={{
              background: matches.length > 0 ? ACCENT : (isDark ? '#334155' : '#cbd5e1'),
              color: matches.length > 0 ? '#fff' : colors.textSecondary,
              borderRadius: '2rem',
              padding: '0.1rem 0.55rem',
              fontSize: '0.73rem',
              fontWeight: 700,
              minWidth: '1.5rem',
              textAlign: 'center',
            }}>
              {matches.length}
            </span>
            <button
              style={{ ...secondary$, marginLeft: 'auto', fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
              disabled={!matches.length}
              onClick={copyMatches}
            >
              {copiedMat ? '✓ Copied!' : '📋 Copy Matches (JSON)'}
            </button>
          </div>

          {matches.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
              }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                    <Th colors={colors}>#</Th>
                    <Th colors={colors}>Full Match</Th>
                    {Array.from({ length: maxGroups }, (_, i) => (
                      <Th key={i} colors={colors}>Group {i + 1}</Th>
                    ))}
                    <Th colors={colors}>Position</Th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr
                      key={m.index}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Td colors={colors} accent>{m.index + 1}</Td>
                      <Td colors={colors}>
                        <span style={{
                          background: MATCH_COLORS[m.index % MATCH_COLORS.length],
                          padding: '0.1em 0.45em',
                          borderRadius: '0.25rem',
                          display: 'inline-block',
                        }}>
                          {m.match !== '' ? m.match : <em style={{ color: colors.muted }}>(empty)</em>}
                        </span>
                      </Td>
                      {Array.from({ length: maxGroups }, (_, gi) => (
                        <Td key={gi} colors={colors}>
                          {m.groups[gi] !== undefined && m.groups[gi] !== null
                            ? m.groups[gi]
                            : <em style={{ color: colors.muted, fontSize: '0.78rem' }}>—</em>
                          }
                        </Td>
                      ))}
                      <Td colors={colors}>
                        <span style={{ color: colors.textSecondary }}>
                          {m.start}–{m.end}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: colors.muted,
              fontSize: '0.88rem',
            }}>
              {!pattern
                ? '↑ Enter a regex pattern above to begin.'
                : error
                  ? '⚠ Fix the pattern error to see matches.'
                  : !testStr
                    ? '↑ Enter a test string to see matches.'
                    : '✗ No matches found in the test string.'
              }
            </div>
          )}
        </div>

        {/* ── Flags Reference ── */}
        <div style={card}>
          <span style={label$}>Flags Reference</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: '0.5rem',
          }}>
            {FLAGS_INFO.map(({ flag, label, desc }) => (
              <div
                key={flag}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${flags[flag] ? ACCENT + '55' : colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onClick={() => toggleFlag(flag)}
                title={`Toggle /${flag} flag`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <code style={{
                    background: flags[flag] ? ACCENT : (isDark ? '#334155' : '#e2e8f0'),
                    color: flags[flag] ? '#fff' : colors.text,
                    borderRadius: '0.25rem',
                    padding: '0.1em 0.45em',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.83rem',
                    transition: 'background 0.15s',
                  }}>
                    /{flag}
                  </code>
                  <span style={{ fontWeight: 600, fontSize: '0.81rem', color: colors.text }}>{label}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.4 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
