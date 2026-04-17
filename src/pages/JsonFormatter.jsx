import { useState, useMemo, useCallback, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#0ea5e9'

// ── Helpers ────────────────────────────────────────────────────────────────

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((k) => [k, sortKeysDeep(value[k])])
    )
  }
  return value
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((a, v) => a + countKeys(v), 0)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).length + Object.values(value).reduce((a, v) => a + countKeys(v), 0)
  }
  return 0
}

function maxDepth(value, d = 0) {
  if (Array.isArray(value)) return value.reduce((a, v) => Math.max(a, maxDepth(v, d + 1)), d)
  if (value !== null && typeof value === 'object')
    return Object.values(value).reduce((a, v) => Math.max(a, maxDepth(v, d + 1)), d)
  return d
}

function parseJSON(text) {
  try {
    const parsed = JSON.parse(text)
    return { ok: true, parsed }
  } catch (err) {
    // Extract line number from error message if possible
    const match = err.message.match(/position (\d+)/i)
    let line = null
    if (match) {
      const pos = parseInt(match[1], 10)
      line = text.slice(0, pos).split('\n').length
    }
    return { ok: false, error: err.message, line }
  }
}

// ── Tree View ──────────────────────────────────────────────────────────────

function TreeNode({ label, value, depth, colors, isDark }) {
  const [collapsed, setCollapsed] = useState(depth > 1)

  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const childCount = isObject ? Object.keys(value).length : 0

  const valueColor = useMemo(() => {
    if (value === null) return isDark ? '#9ca3af' : '#6b7280'
    if (typeof value === 'string') return isDark ? '#34d399' : '#047857'
    if (typeof value === 'number') return ACCENT
    if (typeof value === 'boolean') return '#f59e0b'
    return colors.text
  }, [value, isDark, colors.text])

  const indent = `${depth * 1.2}rem`

  if (!isObject) {
    const display = typeof value === 'string' ? `"${value}"` : String(value)
    return (
      <div style={{ paddingLeft: indent, lineHeight: 1.7, fontSize: '0.82rem', fontFamily: 'monospace' }}>
        {label !== null && (
          <span style={{ color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: 600 }}>
            {label}
            <span style={{ color: colors.textSecondary }}>: </span>
          </span>
        )}
        <span style={{ color: valueColor }}>{display}</span>
      </div>
    )
  }

  const entries = isArray
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value)

  const bracketOpen = isArray ? '[' : '{'
  const bracketClose = isArray ? ']' : '}'

  return (
    <div style={{ paddingLeft: indent }}>
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          lineHeight: 1.7,
          fontSize: '0.82rem',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <span style={{ color: ACCENT, fontSize: '0.65rem', width: '0.8rem', display: 'inline-block' }}>
          {collapsed ? '▶' : '▼'}
        </span>
        {label !== null && (
          <span style={{ color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: 600 }}>
            {label}
            <span style={{ color: colors.textSecondary }}>: </span>
          </span>
        )}
        <span style={{ color: colors.textSecondary }}>
          {bracketOpen}
          {collapsed && (
            <span style={{ color: colors.textSecondary }}>
              {' '}
              {childCount} {isArray ? 'items' : 'keys'}{' '}
            </span>
          )}
          {collapsed && bracketClose}
        </span>
      </div>
      {!collapsed && (
        <>
          {entries.map(([k, v]) => (
            <TreeNode
              key={k}
              label={isArray ? `[${k}]` : k}
              value={v}
              depth={depth + 1}
              colors={colors}
              isDark={isDark}
            />
          ))}
          <div style={{
            paddingLeft: `${(depth) * 1.2}rem`,
            color: colors.textSecondary,
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            lineHeight: 1.7,
          }}>
            {bracketClose}
          </div>
        </>
      )}
    </div>
  )
}

// ── Button ─────────────────────────────────────────────────────────────────

function Btn({ onClick, children, active, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? ACCENT : 'none',
        border: `1px solid ${active ? ACCENT : colors.border}`,
        color: active ? '#fff' : colors.text,
        padding: '0.4rem 0.85rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: 600,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function JsonFormatter() {
  const { isDark, colors } = useTheme()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [tab, setTab] = useState('output') // 'output' | 'tree'
  const outputRef = useRef(null)

  const validation = useMemo(() => {
    if (!input.trim()) return null
    return parseJSON(input)
  }, [input])

  const parsed = validation?.ok ? validation.parsed : null

  const stats = useMemo(() => {
    if (!parsed) return null
    return { keys: countKeys(parsed), depth: maxDepth(parsed) }
  }, [parsed])

  const handleFormat = useCallback(() => {
    if (!parsed) return
    setOutput(JSON.stringify(parsed, null, 2))
    setTab('output')
  }, [parsed])

  const handleMinify = useCallback(() => {
    if (!parsed) return
    setOutput(JSON.stringify(parsed))
    setTab('output')
  }, [parsed])

  const handleSortKeys = useCallback(() => {
    if (!parsed) return
    setOutput(JSON.stringify(sortKeysDeep(parsed), null, 2))
    setTab('output')
  }, [parsed])

  const handleCopy = useCallback(() => {
    const text = tab === 'output' ? output : ''
    if (!text) return
    navigator.clipboard.writeText(text).catch(() => {})
  }, [output, tab])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  // Status bar content
  const statusBar = useMemo(() => {
    if (!input.trim()) return null
    if (!validation) return null
    if (validation.ok) {
      const parts = ['✅ Valid']
      if (stats) {
        parts.push(`${stats.keys} key${stats.keys !== 1 ? 's' : ''}`)
        parts.push(`${stats.depth} level${stats.depth !== 1 ? 's' : ''} deep`)
      }
      return { ok: true, text: parts.join(' · ') }
    }
    const lineInfo = validation.line ? ` at line ${validation.line}` : ''
    return { ok: false, text: `❌ Error${lineInfo}: ${validation.error}` }
  }, [input, validation, stats])

  const inputBorderColor = !input.trim()
    ? colors.border
    : validation?.ok
    ? '#10b981'
    : '#ef4444'

  return (
    <ToolLayout toolId="json-formatter">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: `linear-gradient(to right, ${ACCENT}, #8b5cf6)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          🔧 JSON Formatter
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Format, minify, validate and visually explore JSON data.
          <span style={{ color: ACCENT, fontWeight: 600 }}> All in your browser.</span>
        </p>
      </div>

      {/* Input */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste your JSON here…  e.g. {"name":"Ali","age":30}'
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: '300px',
            background: colors.card,
            border: `1.5px solid ${inputBorderColor}`,
            borderRadius: '0.75rem',
            padding: '1rem',
            color: colors.text,
            fontSize: '0.82rem',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            boxSizing: 'border-box',
            tabSize: 2,
          }}
        />
      </div>

      {/* Status bar */}
      <div style={{
        minHeight: '1.4rem',
        marginBottom: '0.75rem',
        fontSize: '0.82rem',
        fontWeight: 600,
        color: statusBar
          ? statusBar.ok
            ? '#10b981'
            : '#ef4444'
          : colors.textSecondary,
        fontFamily: "'Fira Code', monospace",
        letterSpacing: '0.01em',
      }}>
        {statusBar ? statusBar.text : input.trim() ? '' : 'Awaiting input…'}
      </div>

      {/* Action toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.25rem',
      }}>
        <Btn onClick={handleFormat} colors={colors} active={false}>
          ✨ Format
        </Btn>
        <Btn onClick={handleMinify} colors={colors} active={false}>
          🗜 Minify
        </Btn>
        <Btn onClick={handleSortKeys} colors={colors} active={false}>
          🔤 Sort Keys
        </Btn>
        <Btn onClick={handleCopy} colors={colors} active={false}>
          📋 Copy
        </Btn>
        <Btn onClick={handleClear} colors={colors} active={false}>
          ✕ Clear
        </Btn>
      </div>

      {/* Output / Tree toggle tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '0.5rem',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        {['output', 'tree'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? ACCENT : 'transparent'}`,
              color: tab === t ? ACCENT : colors.textSecondary,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
              marginBottom: '-1px',
            }}
          >
            {t === 'output' ? '📄 Output' : '🌳 Tree View'}
          </button>
        ))}
      </div>

      {/* Output panel */}
      {tab === 'output' && (
        <div style={{ position: 'relative' }}>
          <textarea
            ref={outputRef}
            readOnly
            value={output}
            placeholder="Output will appear here after Format / Minify / Sort Keys…"
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: '260px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1.5px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              color: colors.text,
              fontSize: '0.82rem',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Tree view panel */}
      {tab === 'tree' && (
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1.5px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          minHeight: '260px',
          overflowX: 'auto',
        }}>
          {parsed ? (
            <TreeNode
              label={null}
              value={parsed}
              depth={0}
              colors={colors}
              isDark={isDark}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: colors.textSecondary,
              padding: '3rem 1rem',
              fontSize: '0.9rem',
            }}>
              {input.trim()
                ? '❌ Fix JSON errors to see tree view'
                : '🌳 Paste valid JSON and click Format to explore the tree'}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
