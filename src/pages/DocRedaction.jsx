import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#6366f1'

const ENTITY_TYPES = [
  { id: 'cnic',       label: 'CNIC',           color: '#ef4444', regex: /\b\d{5}-\d{7}-\d\b/g },
  { id: 'iban',       label: 'IBAN (PK)',       color: '#f97316', regex: /\bPK\d{2}[A-Z]{4}\d{16}\b/g },
  { id: 'phone',      label: 'Phone Number',    color: '#eab308', regex: /\b(?:\+92|0092|0)3[0-9]{9}\b/g },
  { id: 'email',      label: 'Email Address',   color: '#22c55e', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { id: 'ntn',        label: 'NTN (Tax No.)',   color: '#06b6d4', regex: /\b\d{7}-\d\b/g },
  { id: 'passport',   label: 'Passport No.',    color: '#8b5cf6', regex: /\b[A-Z]{2}\d{7}\b/g },
  { id: 'creditcard', label: 'Credit Card No.', color: '#ec4899', regex: /\b(?:\d{4}[- ]){3}\d{4}\b/g },
  { id: 'amount',     label: 'PKR Amounts',     color: '#14b8a6', regex: /\bPKR\s?[\d,]+(?:\.\d{2})?\b/gi },
]

const REDACT_STYLES = [
  { id: 'bracket',   label: '[REDACTED]' },
  { id: 'block',     label: '████████' },
  { id: 'type',      label: '[TYPE]' },
]

const SAMPLE_DOC = `EMPLOYMENT CONTRACT

Employee Name: Muhammad Ahmed Khan
CNIC: 42301-1234567-1
NTN: 1234567-8
Passport: AB1234567
Contact: 03001234567
Email: ahmed.khan@email.com

Salary: PKR 85,000 per month
Bank Account: PK36SCBL0000001123456702

This agreement is between ABC Corporation and the above-named employee...`

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function detectEntities(text, enabledIds) {
  const matches = []
  for (const et of ENTITY_TYPES) {
    if (!enabledIds.has(et.id)) continue
    const re = new RegExp(et.regex.source, et.regex.flags.replace('g', '') + 'g')
    let m
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, type: et.id, match: m[0] })
    }
  }
  // Sort by start, remove overlaps
  matches.sort((a, b) => a.start - b.start)
  const accepted = []
  let cursor = 0
  for (const m of matches) {
    if (m.start >= cursor) {
      accepted.push(m)
      cursor = m.end
    }
  }
  return accepted
}

function buildSegments(text, matches) {
  const segments = []
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) segments.push({ text: text.slice(pos, m.start), entityType: null })
    segments.push({ text: text.slice(m.start, m.end), entityType: m.type, match: m.match })
    pos = m.end
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), entityType: null })
  return segments
}

function buildRedacted(text, matches, style) {
  if (matches.length === 0) return text
  let result = ''
  let pos = 0
  for (const m of matches) {
    result += text.slice(pos, m.start)
    const et = ENTITY_TYPES.find(e => e.id === m.type)
    if (style === 'bracket') {
      result += '[REDACTED]'
    } else if (style === 'block') {
      const blockLen = Math.min(m.match.length, 12)
      result += '█'.repeat(blockLen)
    } else {
      result += `[${et ? et.label.toUpperCase().replace(/[^A-Z]/g, '') : 'REDACTED'}]`
    }
    pos = m.end
  }
  result += text.slice(pos)
  return result
}

export default function DocRedaction() {
  const { isDark, colors } = useTheme()
  const [text, setText] = useState('')
  const [debouncedText, setDebouncedText] = useState('')
  const [enabledIds, setEnabledIds] = useState(() => new Set(ENTITY_TYPES.map(e => e.id)))
  const [redactStyle, setRedactStyle] = useState('bracket')
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const debounceRef = useRef(null)

  // Debounce text changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedText(text), 300)
    return () => clearTimeout(debounceRef.current)
  }, [text])

  const matches = useMemo(
    () => detectEntities(debouncedText, enabledIds),
    [debouncedText, enabledIds]
  )

  const segments = useMemo(
    () => buildSegments(debouncedText, matches),
    [debouncedText, matches]
  )

  const redactedText = useMemo(
    () => buildRedacted(debouncedText, matches, redactStyle),
    [debouncedText, matches, redactStyle]
  )

  // Per-type counts
  const typeCounts = useMemo(() => {
    const counts = {}
    for (const m of matches) counts[m.type] = (counts[m.type] || 0) + 1
    return counts
  }, [matches])

  const totalTypes = useMemo(
    () => Object.keys(typeCounts).length,
    [typeCounts]
  )

  const toggleType = useCallback((id) => {
    setEnabledIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleCopy = useCallback(() => {
    if (!redactedText) return
    navigator.clipboard.writeText(redactedText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [redactedText])

  const handleDownload = useCallback(() => {
    if (!redactedText) return
    const blob = new Blob([redactedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'redacted-document.txt'
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1800)
  }, [redactedText])

  const labelStyle = {
    color: colors.textSecondary,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.5rem',
  }

  const panelStyle = {
    flex: 1,
    minWidth: 0,
    background: colors.card,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '0.875rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const panelHeaderStyle = {
    padding: '0.65rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  }

  const panelTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  }

  const textAreaBase = {
    width: '100%',
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '1rem',
    color: colors.text,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    fontFamily: '"Fira Code", "Courier New", Courier, monospace',
    boxSizing: 'border-box',
    minHeight: '320px',
  }

  return (
    <ToolLayout toolId="doc-redaction">
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${ACCENT}, #818cf8)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            🔏 Smart Document Redaction
          </h1>
          <span style={{
            background: hexToRgba(ACCENT, 0.12),
            color: ACCENT,
            border: `1px solid ${hexToRgba(ACCENT, 0.3)}`,
            borderRadius: '999px',
            padding: '0.2rem 0.65rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            🔒 100% LOCAL
          </span>
        </div>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 0.35rem' }}>
          Detect and redact sensitive personal information before sharing documents.
        </p>
        <p style={{ color: isDark ? '#818cf8' : ACCENT, fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
          🛡️ 100% local — your document never leaves your browser.
        </p>
      </div>

      {/* ── Entity type toggles ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={labelStyle}>Detection Types</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ENTITY_TYPES.map(et => {
            const active = enabledIds.has(et.id)
            const count = typeCounts[et.id] || 0
            return (
              <button
                key={et.id}
                onClick={() => toggleType(et.id)}
                title={active ? `Click to disable ${et.label} detection` : `Click to enable ${et.label} detection`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: active ? hexToRgba(et.color, isDark ? 0.12 : 0.08) : colors.card,
                  border: `1.5px solid ${active ? et.color : colors.border}`,
                  borderRadius: '999px',
                  padding: '0.3rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: active ? et.color : colors.textSecondary,
                  transition: 'all 0.15s ease',
                  opacity: active ? 1 : 0.55,
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: active ? et.color : colors.textSecondary,
                  flexShrink: 0,
                }} />
                {et.label}
                {count > 0 && (
                  <span style={{
                    background: et.color,
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '0 0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    lineHeight: '1.4',
                    minWidth: '1.25rem',
                    textAlign: 'center',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Redaction style picker ── */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>Redaction Style:</span>
        <div style={{
          display: 'inline-flex',
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.625rem',
          padding: '0.2rem',
          gap: '0.2rem',
        }}>
          {REDACT_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setRedactStyle(s.id)}
              style={{
                background: redactStyle === s.id ? ACCENT : 'transparent',
                border: 'none',
                color: redactStyle === s.id ? '#fff' : colors.textSecondary,
                borderRadius: '0.4rem',
                padding: '0.35rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: redactStyle === s.id && s.id === 'block' ? '0.1em' : '0',
                transition: 'all 0.15s ease',
                fontFamily: s.id === 'block' ? 'monospace' : 'inherit',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Load sample */}
        <button
          onClick={() => setText(SAMPLE_DOC)}
          style={{
            background: 'transparent',
            border: `1px dashed ${colors.border}`,
            color: colors.textSecondary,
            borderRadius: '0.5rem',
            padding: '0.35rem 0.8rem',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            marginLeft: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary }}
        >
          📄 Load Sample
        </button>
        <button
          onClick={() => { setText(''); setDebouncedText('') }}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            borderRadius: '0.5rem',
            padding: '0.35rem 0.8rem',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary }}
        >
          🗑 Clear
        </button>
      </div>

      {/* ── Two-panel editor ── */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* LEFT: Original with highlight overlay */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>✏️ Original</span>
            <span style={{ fontSize: '0.72rem', color: colors.textSecondary }}>Editable</span>
          </div>
          {/* Highlight layer + textarea stacked */}
          <div style={{ position: 'relative', flex: 1, minHeight: '320px' }}>
            {/* Highlight backdrop */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                fontFamily: '"Fira Code", "Courier New", Courier, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                color: 'transparent',
                pointerEvents: 'none',
                zIndex: 1,
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
            >
              {debouncedText
                ? segments.map((seg, i) => {
                    if (!seg.entityType) return <span key={i}>{seg.text}</span>
                    const et = ENTITY_TYPES.find(e => e.id === seg.entityType)
                    return (
                      <mark
                        key={i}
                        title={et?.label}
                        style={{
                          background: hexToRgba(et.color, 0.28),
                          borderBottom: `2.5px solid ${et.color}`,
                          borderRadius: '3px',
                          color: 'transparent',
                          padding: '1px 0',
                        }}
                      >
                        {seg.text}
                      </mark>
                    )
                  })
                : null}
            </div>
            {/* Transparent editable textarea on top */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type or paste a document here to start detecting sensitive information…"
              spellCheck={false}
              style={{
                ...textAreaBase,
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: 'transparent',
                caretColor: colors.text,
                color: debouncedText ? 'transparent' : colors.textSecondary,
                WebkitTextFillColor: debouncedText ? 'transparent' : colors.textSecondary,
              }}
            />
          </div>

          {/* Highlight legend (below textarea) */}
          {matches.length > 0 && (
            <div style={{
              padding: '0.6rem 1rem',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}>
              {ENTITY_TYPES.filter(et => typeCounts[et.id]).map(et => (
                <span key={et.id} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  color: et.color,
                  fontWeight: 600,
                }}>
                  <span style={{ width: '8px', height: '3px', background: et.color, borderRadius: '2px', display: 'inline-block' }} />
                  {et.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Redacted preview */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>🔏 Redacted Preview</span>
            <span style={{
              fontSize: '0.7rem',
              color: isDark ? '#818cf8' : ACCENT,
              fontWeight: 600,
            }}>
              Read-only
            </span>
          </div>
          <div style={{ position: 'relative', flex: 1, minHeight: '320px' }}>
            {debouncedText ? (
              <pre
                style={{
                  ...textAreaBase,
                  position: 'absolute',
                  inset: 0,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  overflowY: 'auto',
                  color: colors.text,
                  userSelect: 'text',
                }}
              >
                {redactedText}
              </pre>
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '2.5rem' }}>🔏</span>
                <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  Type or paste a document above to start detecting sensitive information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        background: matches.length > 0
          ? hexToRgba(ACCENT, isDark ? 0.1 : 0.06)
          : colors.card,
        border: `1px solid ${matches.length > 0 ? hexToRgba(ACCENT, 0.35) : colors.border}`,
        borderRadius: '0.75rem',
        padding: '0.7rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        {matches.length > 0 ? (
          <>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: '0.9rem' }}>
              {matches.length} item{matches.length !== 1 ? 's' : ''} detected
            </span>
            <span style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>
              across {totalTypes} type{totalTypes !== 1 ? 's' : ''}
            </span>
            <span style={{ color: colors.border, fontSize: '0.85rem' }}>·</span>
            {ENTITY_TYPES.filter(et => typeCounts[et.id]).map(et => (
              <span key={et.id} style={{
                background: hexToRgba(et.color, 0.15),
                color: et.color,
                borderRadius: '999px',
                padding: '0.15rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>
                {et.label}: {typeCounts[et.id]}
              </span>
            ))}
          </>
        ) : (
          <span style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>
            {debouncedText
              ? '✅ No sensitive information detected with current settings'
              : '📋 Paste a document above — detection runs automatically'}
          </span>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={handleCopy}
          disabled={!redactedText}
          style={{
            background: redactedText
              ? `linear-gradient(135deg, ${ACCENT}, #818cf8)`
              : colors.card,
            border: `1px solid ${redactedText ? 'transparent' : colors.border}`,
            color: redactedText ? '#fff' : colors.textSecondary,
            borderRadius: '0.625rem',
            padding: '0.6rem 1.35rem',
            cursor: redactedText ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: 700,
            opacity: redactedText ? 1 : 0.5,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Redact All & Copy'}
        </button>

        <button
          onClick={handleDownload}
          disabled={!redactedText}
          style={{
            background: redactedText
              ? hexToRgba('#22c55e', isDark ? 0.15 : 0.1)
              : colors.card,
            border: `1px solid ${redactedText ? '#22c55e' : colors.border}`,
            color: redactedText ? '#22c55e' : colors.textSecondary,
            borderRadius: '0.625rem',
            padding: '0.6rem 1.35rem',
            cursor: redactedText ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: 700,
            opacity: redactedText ? 1 : 0.5,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          {downloaded ? '✓ Downloaded!' : '⬇️ Download .txt'}
        </button>
      </div>

      {/* ── Privacy info card ── */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.875rem',
        padding: '1.25rem 1.5rem',
      }}>
        <h2 style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🛡️</span> Privacy Guarantee
        </h2>
        <ul style={{ color: colors.textSecondary, fontSize: '0.82rem', lineHeight: 1.85, paddingLeft: '1.2rem', margin: 0 }}>
          <li><strong style={{ color: colors.text }}>Zero server contact</strong> — all detection and redaction runs entirely in your browser using JavaScript regex engines.</li>
          <li><strong style={{ color: colors.text }}>No storage</strong> — nothing is saved to localStorage, cookies, or any database. Closing the tab clears everything.</li>
          <li><strong style={{ color: colors.text }}>Offline capable</strong> — once this page loads, it works without any internet connection.</li>
          <li>Review the redacted preview carefully before sharing — regex patterns may miss edge cases or catch false positives.</li>
        </ul>
      </div>
    </ToolLayout>
  )
}
