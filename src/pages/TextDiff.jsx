import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

// ── Diff engine (line-by-line LCS-based) ──────────────────────────────────────

function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  return dp
}

function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const dp = longestCommonSubsequence(oldLines, newLines)
  const result = []
  let i = oldLines.length, j = newLines.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'same', value: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: newLines[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', value: oldLines[i - 1] })
      i--
    }
  }
  return result
}

// Inline word-level diff for changed lines
function wordDiff(a, b) {
  const wa = a.split(/(\s+)/)
  const wb = b.split(/(\s+)/)
  const dp = longestCommonSubsequence(wa, wb)
  const result = []
  let i = wa.length, j = wb.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wa[i - 1] === wb[j - 1]) {
      result.unshift({ type: 'same', value: wa[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: wb[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', value: wa[i - 1] })
      i--
    }
  }
  return result
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Textarea({ value, onChange, placeholder, colors, isDark, label }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <label style={{
        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: colors.muted, marginBottom: '0.4rem',
      }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          flex: 1,
          minHeight: '260px',
          fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
          fontSize: '0.82rem',
          lineHeight: 1.65,
          padding: '0.85rem 1rem',
          border: `1.5px solid ${colors.border}`,
          borderRadius: '0.65rem',
          background: isDark ? '#0f172a' : '#f8fafc',
          color: colors.text,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
        onBlur={(e) => (e.target.style.borderColor = colors.border)}
      />
    </div>
  )
}

function DiffLine({ line, lineNum, colors, isDark, wordLevel }) {
  const bg = line.type === 'added'
    ? (isDark ? '#052e16' : '#f0fdf4')
    : line.type === 'removed'
    ? (isDark ? '#2d0a0a' : '#fff1f2')
    : 'transparent'

  const border = line.type === 'added' ? '#22c55e'
    : line.type === 'removed' ? '#ef4444'
    : 'transparent'

  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '
  const prefixColor = line.type === 'added' ? '#22c55e' : line.type === 'removed' ? '#ef4444' : colors.muted

  let content
  if (wordLevel && (line.type === 'added' || line.type === 'removed') && line.pair) {
    const words = line.type === 'added'
      ? wordDiff(line.pair, line.value)
      : wordDiff(line.value, line.pair)
    content = words.map((w, i) => {
      const isHighlight = line.type === 'added' ? w.type === 'added' : w.type === 'removed'
      return (
        <span key={i} style={{
          background: isHighlight
            ? (line.type === 'added' ? '#86efac60' : '#fca5a560')
            : 'transparent',
          borderRadius: '2px',
        }}>
          {w.value || '\u00a0'}
        </span>
      )
    })
  } else {
    content = line.value || '\u00a0'
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      background: bg,
      borderLeft: `3px solid ${border}`,
      fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
      fontSize: '0.82rem', lineHeight: 1.65,
    }}>
      <span style={{
        color: colors.muted, minWidth: '2.8rem', padding: '0 0.5rem',
        textAlign: 'right', userSelect: 'none', flexShrink: 0,
        fontSize: '0.7rem', opacity: 0.6,
      }}>{lineNum}</span>
      <span style={{ color: prefixColor, minWidth: '1.2rem', flexShrink: 0, userSelect: 'none' }}>{prefix}</span>
      <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all', padding: '0 0.5rem', color: colors.text }}>
        {content}
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TextDiff() {
  const { isDark, colors } = useTheme()
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [wordLevel, setWordLevel] = useState(true)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)

  const normalize = (t) => {
    let s = t
    if (ignoreCase) s = s.toLowerCase()
    if (ignoreWhitespace) s = s.split('\n').map((l) => l.trim()).join('\n')
    return s
  }

  const diff = useMemo(() => {
    const lines = diffLines(normalize(textA), normalize(textB))
    // Pair adjacent removed+added for word-level diff
    const paired = []
    let i = 0
    while (i < lines.length) {
      if (
        lines[i]?.type === 'removed' &&
        lines[i + 1]?.type === 'added'
      ) {
        paired.push({ ...lines[i], pair: lines[i + 1].value })
        paired.push({ ...lines[i + 1], pair: lines[i].value })
        i += 2
      } else {
        paired.push(lines[i])
        i++
      }
    }
    return paired
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textA, textB, ignoreWhitespace, ignoreCase])

  const stats = useMemo(() => ({
    added:   diff.filter((l) => l.type === 'added').length,
    removed: diff.filter((l) => l.type === 'removed').length,
    same:    diff.filter((l) => l.type === 'same').length,
  }), [diff])

  const isEmpty = !textA.trim() && !textB.trim()
  const identical = !isEmpty && stats.added === 0 && stats.removed === 0

  const copyDiff = () => {
    const text = diff.map((l) => {
      const p = l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  '
      return p + l.value
    }).join('\n')
    navigator.clipboard?.writeText(text)
  }

  let lineCounter = { added: 0, removed: 0, same: 0 }
  const renderLineNum = (line) => {
    lineCounter[line.type]++
    return lineCounter.same + (line.type === 'added' ? lineCounter.added : lineCounter.removed)
  }
  lineCounter = { added: 0, removed: 0, same: 0 }

  let numA = 0, numB = 0
  const lineNumbers = diff.map((l) => {
    if (l.type === 'removed' || l.type === 'same') numA++
    if (l.type === 'added'   || l.type === 'same') numB++
    return l.type === 'removed' ? numA : l.type === 'added' ? numB : `${numA}/${numB}`
  })
  numA = 0; numB = 0
  const lineNumsActual = diff.map((l) => {
    if (l.type === 'removed' || l.type === 'same') numA++
    if (l.type === 'added'   || l.type === 'same') numB++
    return l.type === 'removed' ? numA : l.type === 'added' ? numB : numA
  })

  return (
    <ToolLayout toolId="text-diff">
      <div style={{ fontFamily: FONT, maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 800, margin: '0 0 0.3rem',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            ⚡ Text Diff — Compare Two Texts
          </h1>
          <p style={{ color: colors.muted, margin: 0, fontSize: '0.87rem' }}>
            Side-by-side line comparison with inline word highlighting · 100% private, browser-only
          </p>
        </div>

        {/* Options bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center',
          marginBottom: '1rem',
        }}>
          {[
            { key: 'wordLevel',        val: wordLevel,        set: setWordLevel,        label: 'Inline word diff' },
            { key: 'ignoreWhitespace', val: ignoreWhitespace, set: setIgnoreWhitespace, label: 'Ignore whitespace' },
            { key: 'ignoreCase',       val: ignoreCase,       set: setIgnoreCase,       label: 'Ignore case' },
          ].map(({ key, val, set, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: colors.muted }}>
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => set(e.target.checked)}
                style={{ accentColor: '#6366f1', width: 14, height: 14 }}
              />
              {label}
            </label>
          ))}

          <button
            onClick={() => { setTextA(''); setTextB('') }}
            style={{
              marginLeft: 'auto', background: 'none', border: `1px solid ${colors.border}`,
              borderRadius: '0.45rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem',
              color: colors.muted, cursor: 'pointer',
            }}
          >Clear</button>
          {!isEmpty && (
            <button onClick={copyDiff} style={{
              background: '#6366f1', border: 'none', borderRadius: '0.45rem',
              padding: '0.3rem 0.85rem', fontSize: '0.78rem', color: '#fff', cursor: 'pointer',
            }}>Copy diff</button>
          )}
        </div>

        {/* Input panels */}
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <Textarea
            value={textA} onChange={setTextA}
            placeholder="Paste original text here…"
            label="Original (A)" colors={colors} isDark={isDark}
          />
          <Textarea
            value={textB} onChange={setTextB}
            placeholder="Paste modified text here…"
            label="Modified (B)" colors={colors} isDark={isDark}
          />
        </div>

        {/* Stats bar */}
        {!isEmpty && (
          <div style={{
            display: 'flex', gap: '1rem', flexWrap: 'wrap',
            marginBottom: '0.85rem', fontSize: '0.8rem',
          }}>
            {identical
              ? <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Texts are identical</span>
              : <>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>+{stats.added} added</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>−{stats.removed} removed</span>
                  <span style={{ color: colors.muted }}>{stats.same} unchanged</span>
                </>
            }
          </div>
        )}

        {/* Diff output */}
        {!isEmpty && !identical && (
          <div style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            background: isDark ? '#0d1117' : '#ffffff',
          }}>
            <div style={{
              display: 'flex', gap: 0, fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: isDark ? '#161b22' : '#f1f5f9',
              color: colors.muted, padding: '0.5rem 1rem',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ flex: 1 }}>Diff (unified view)</span>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {diff.map((line, idx) => (
                <DiffLine
                  key={idx}
                  line={line}
                  lineNum={lineNumsActual[idx]}
                  colors={colors}
                  isDark={isDark}
                  wordLevel={wordLevel}
                />
              ))}
            </div>
          </div>
        )}

        {isEmpty && (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: colors.muted, fontSize: '0.9rem',
            border: `2px dashed ${colors.border}`, borderRadius: '0.75rem',
          }}>
            Paste text in both panels above to see the diff
          </div>
        )}

      </div>
    </ToolLayout>
  )
}
