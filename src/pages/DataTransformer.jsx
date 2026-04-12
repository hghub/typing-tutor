import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#6366f1'

const FORMATS = ['JSON', 'CSV', 'TSV']

const DE_ID_PATTERNS = [
  { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, mask: '[EMAIL]' },
  { name: 'ip', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, mask: '[IP]' },
  {
    name: 'api_key',
    regex: /(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|Bearer\s+[a-zA-Z0-9\-._~+/]+=*|AIza[0-9A-Za-z\-_]{35})/g,
    mask: '[API_KEY]',
  },
]

/* ── De-identifier ────────────────────────────────────────────────────── */

function deIdentify(text) {
  const counts = {}
  let result = text
  for (const { name, regex, mask } of DE_ID_PATTERNS) {
    const matches = result.match(new RegExp(regex.source, regex.flags)) ?? []
    counts[name] = matches.length
    result = result.replace(new RegExp(regex.source, regex.flags), mask)
  }
  return { text: result, counts }
}

/* ── CSV/TSV helpers ──────────────────────────────────────────────────── */

function parseDelimited(text, delimiter) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  const parseRow = (line) => {
    const cells = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === delimiter && !inQuote) {
        cells.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur)
    return cells
  }

  const headers = parseRow(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseRow(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return obj
  })
}

function serializeDelimited(data, delimiter) {
  if (!Array.isArray(data) || data.length === 0) return ''
  const headers = Object.keys(data[0])
  const escape = (val) => {
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const rows = [
    headers.join(delimiter),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(delimiter)),
  ]
  return rows.join('\n')
}

/* ── Core conversion ──────────────────────────────────────────────────── */

function convert(input, srcFmt, tgtFmt) {
  if (srcFmt === tgtFmt) {
    if (srcFmt === 'JSON') return JSON.stringify(JSON.parse(input), null, 2)
    /* CSV/TSV same-format: re-serialize to normalize whitespace */
    const delim = srcFmt === 'CSV' ? ',' : '\t'
    return serializeDelimited(parseDelimited(input, delim), delim)
  }

  let intermediate

  if (srcFmt === 'JSON') {
    const parsed = JSON.parse(input)
    if (!Array.isArray(parsed)) throw new Error('JSON input must be an array of objects.')
    intermediate = parsed
  } else {
    const delim = srcFmt === 'CSV' ? ',' : '\t'
    intermediate = parseDelimited(input, delim)
  }

  if (tgtFmt === 'JSON') {
    return JSON.stringify(intermediate, null, 2)
  } else {
    const delim = tgtFmt === 'CSV' ? ',' : '\t'
    return serializeDelimited(intermediate, delim)
  }
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function FormatButtonGroup({ label, value, onChange, colors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {FORMATS.map((fmt) => {
          const active = fmt === value
          return (
            <button
              key={fmt}
              onClick={() => onChange(fmt)}
              style={{
                background: active ? ACCENT : colors.input,
                border: `1px solid ${active ? ACCENT : colors.inputBorder}`,
                borderRadius: '0.45rem',
                color: active ? '#fff' : colors.text,
                cursor: 'pointer',
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: active ? 700 : 500,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {fmt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange, colors }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '2.5rem',
        height: '1.4rem',
        borderRadius: '999px',
        background: checked ? ACCENT : colors.inputBorder,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: checked ? 'calc(100% - 1.15rem)' : '0.15rem',
          width: '1.05rem',
          height: '1.05rem',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

function SecondaryButton({ onClick, children, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: colors.input,
        border: `1px solid ${colors.inputBorder}`,
        borderRadius: '0.45rem',
        color: colors.text,
        cursor: 'pointer',
        padding: '0.45rem 0.85rem',
        fontSize: '0.82rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function DataTransformer() {
  const { isDark, colors } = useTheme()

  const [srcFmt, setSrcFmt] = useState('JSON')
  const [tgtFmt, setTgtFmt] = useState('CSV')
  const [deIdEnabled, setDeIdEnabled] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [maskSummary, setMaskSummary] = useState(null)
  const [copyMsg, setCopyMsg] = useState('')

  const handleConvert = useCallback(() => {
    setError('')
    setOutput('')
    setMaskSummary(null)

    let text = input.trim()
    if (!text) { setError('Input is empty.'); return }

    let counts = null
    if (deIdEnabled) {
      const result = deIdentify(text)
      text = result.text
      counts = result.counts
    }

    try {
      const result = convert(text, srcFmt, tgtFmt)
      setOutput(result)
      if (counts) setMaskSummary(counts)
    } catch (err) {
      setError(err.message || 'Conversion failed.')
    }
  }, [input, srcFmt, tgtFmt, deIdEnabled])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch {
      setError('Clipboard access denied.')
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 1800)
    } catch {
      setError('Clipboard access denied.')
    }
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output) return
    const ext = tgtFmt === 'JSON' ? 'json' : tgtFmt === 'CSV' ? 'csv' : 'tsv'
    const mime = tgtFmt === 'JSON' ? 'application/json' : 'text/plain'
    const blob = new Blob([output], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [output, tgtFmt])

  const maskSummaryText = maskSummary
    ? [
        maskSummary.email > 0 && `${maskSummary.email} email${maskSummary.email > 1 ? 's' : ''}`,
        maskSummary.api_key > 0 && `${maskSummary.api_key} API key${maskSummary.api_key > 1 ? 's' : ''}`,
        maskSummary.ip > 0 && `${maskSummary.ip} IP${maskSummary.ip > 1 ? 's' : ''}`,
      ]
        .filter(Boolean)
        .join(', ')
    : null

  const inputPlaceholders = {
    JSON: '[\n  { "name": "Alice", "email": "alice@example.com" },\n  { "name": "Bob", "email": "bob@example.com" }\n]',
    CSV: 'name,email\nAlice,alice@example.com\nBob,bob@example.com',
    TSV: 'name\temail\nAlice\talice@example.com\nBob\tbob@example.com',
  }

  return (
    <ToolLayout toolId="data-transformer">
      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: colors.text }}>
            🔄 Privacy-First Data Transformer
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: colors.textSecondary }}>
            Convert between JSON, CSV, and TSV entirely in your browser — nothing leaves your device.
          </p>
        </div>

        {/* Format selector */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'center',
        }}>
          <FormatButtonGroup label="Source format" value={srcFmt} onChange={setSrcFmt} colors={colors} />
          <span style={{ fontSize: '1.3rem', color: colors.textSecondary, marginTop: '1.25rem' }}>→</span>
          <FormatButtonGroup label="Target format" value={tgtFmt} onChange={setTgtFmt} colors={colors} />
        </div>

        {/* De-identifier toggle */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <ToggleSwitch checked={deIdEnabled} onChange={setDeIdEnabled} colors={colors} />
          <span style={{ fontSize: '0.9rem', color: colors.text, userSelect: 'none' }}>
            🛡️ De-identify sensitive data{' '}
            <span style={{ color: colors.textSecondary, fontSize: '0.82rem' }}>
              (masks emails, API keys, IPs)
            </span>
          </span>
        </div>

        {/* Input panel */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Input — {srcFmt}
            </span>
            <SecondaryButton onClick={handlePaste} colors={colors}>
              📋 Paste from clipboard
            </SecondaryButton>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholders[srcFmt]}
            spellCheck={false}
            style={{
              background: colors.input,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '0.6rem',
              color: colors.text,
              fontSize: '0.85rem',
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              lineHeight: 1.55,
              minHeight: '200px',
              outline: 'none',
              padding: '0.75rem',
              resize: 'vertical',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#ef444420',
            border: '1px solid #ef444455',
            borderRadius: '0.6rem',
            color: '#ef4444',
            fontSize: '0.875rem',
            padding: '0.7rem 1rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Convert button */}
        <button
          onClick={handleConvert}
          style={{
            background: ACCENT,
            border: 'none',
            borderRadius: '0.6rem',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            padding: '0.75rem',
            width: '100%',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Convert →
        </button>

        {/* Output panel */}
        {output && (
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '1rem',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Output — {tgtFmt}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SecondaryButton onClick={handleCopy} colors={colors}>
                  {copyMsg || '📋 Copy'}
                </SecondaryButton>
                <SecondaryButton onClick={handleDownload} colors={colors}>
                  ⬇️ Download
                </SecondaryButton>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              style={{
                background: colors.input,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '0.6rem',
                color: colors.text,
                fontSize: '0.85rem',
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                lineHeight: 1.55,
                minHeight: '200px',
                outline: 'none',
                padding: '0.75rem',
                resize: 'vertical',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Mask summary info card */}
        {maskSummary && (
          <div style={{
            background: deIdEnabled ? `${ACCENT}15` : colors.card,
            border: `1px solid ${ACCENT}44`,
            borderRadius: '0.75rem',
            color: colors.text,
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            {maskSummaryText
              ? <span>Masked <strong>{maskSummaryText}</strong></span>
              : <span style={{ color: colors.textSecondary }}>No sensitive data detected.</span>
            }
          </div>
        )}

      </div>
    </ToolLayout>
  )
}
