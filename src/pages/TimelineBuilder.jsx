import { useState, useCallback, useMemo, useRef } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#06b6d4'

const SAMPLE_TEXT = `Jan 15, 2024 - Contract signed with the new vendor
On March 3rd, 2024, the building inspection was completed
2024-04-10: First payment received from client
May 22, 2024 – Project kickoff meeting held
07/14/2024 - Phase 1 deliverables submitted
August 5, 2024: Team review and feedback session
2024-09-01 - Final revisions approved
October 12, 2024 - Project officially launched`

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseDate(str) {
  if (!str) return null

  // ISO: 2024-01-15
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])

  // MM/DD/YYYY or DD/MM/YYYY or with dashes
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]
    return new Date(y, +m[1] - 1, +m[2])
  }

  // Month name: Jan 15, 2024 / January 15 2024
  m = str.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/)
  if (m) {
    const mo = MONTH_MAP[m[1].toLowerCase().slice(0, 3)]
    if (mo !== undefined) return new Date(+m[3], mo, +m[2])
  }

  // 15 Jan 2024
  m = str.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/)
  if (m) {
    const mo = MONTH_MAP[m[2].toLowerCase().slice(0, 3)]
    if (mo !== undefined) return new Date(+m[3], mo, +m[1])
  }

  return null
}

function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function extractEvents(text) {
  const patterns = [
    /\d{4}-\d{2}-\d{2}/g,
    /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}/gi,
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/gi,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
  ]

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const results = []
  let idCounter = Date.now()

  for (const line of lines) {
    let foundDate = null
    let remainder = line

    for (const pattern of patterns) {
      pattern.lastIndex = 0
      const match = pattern.exec(line)
      if (match) {
        const parsed = parseDate(match[0])
        if (parsed && !isNaN(parsed)) {
          foundDate = parsed
          remainder = line.slice(0, match.index) + line.slice(match.index + match[0].length)
          break
        }
      }
    }

    if (!foundDate) continue

    // Strip leading/trailing separators and whitespace from remainder
    const label = remainder.replace(/^[\s\-:–—,]+|[\s\-:–—,]+$/g, '').trim()
    if (!label) continue

    results.push({ id: ++idCounter, date: foundDate, label })
  }

  return results
}

let manualIdCounter = 0

/* ── Sub-components ───────────────────────────────────────────────────── */

function PrimaryButton({ onClick, children, disabled, colors }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? colors.border : ACCENT,
        border: 'none',
        borderRadius: '0.5rem',
        color: disabled ? colors.textSecondary : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0.55rem 1.1rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ onClick, children, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        color: colors.textSecondary,
        cursor: 'pointer',
        padding: '0.5rem 0.9rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'border-color 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function TimelineEvent({ event, index, onDelete, colors }) {
  const isEven = index % 2 === 0
  const dateLabel = formatDate(event.date)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 28px 1fr',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 1,
        transition: 'opacity 0.3s ease',
        minHeight: '2.5rem',
      }}
    >
      {/* Left column */}
      <div style={{ textAlign: 'right', padding: '0.25rem 0.5rem' }}>
        {isEven ? (
          <span style={{
            fontWeight: 700,
            fontSize: '0.78rem',
            color: ACCENT,
            letterSpacing: '0.03em',
          }}>
            {dateLabel}
          </span>
        ) : (
          <EventText event={event} onDelete={onDelete} colors={colors} align="right" />
        )}
      </div>

      {/* Center dot */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: ACCENT,
          boxShadow: `0 0 0 3px ${ACCENT}33`,
          flexShrink: 0,
          zIndex: 1,
        }} />
      </div>

      {/* Right column */}
      <div style={{ padding: '0.25rem 0.5rem' }}>
        {isEven ? (
          <EventText event={event} onDelete={onDelete} colors={colors} align="left" />
        ) : (
          <span style={{
            fontWeight: 700,
            fontSize: '0.78rem',
            color: ACCENT,
            letterSpacing: '0.03em',
          }}>
            {dateLabel}
          </span>
        )}
      </div>
    </div>
  )
}

function EventText({ event, onDelete, colors, align }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    }}>
      {align === 'right' && (
        <button
          onClick={() => onDelete(event.id)}
          title="Remove event"
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '0.1rem 0.3rem',
            borderRadius: '0.25rem',
            lineHeight: 1,
            opacity: 0.6,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
      <span style={{
        fontSize: '0.875rem',
        color: colors.text,
        lineHeight: 1.4,
      }}>
        {event.label}
      </span>
      {align === 'left' && (
        <button
          onClick={() => onDelete(event.id)}
          title="Remove event"
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '0.1rem 0.3rem',
            borderRadius: '0.25rem',
            lineHeight: 1,
            opacity: 0.6,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function TimelineBuilder() {
  const { isDark, colors } = useTheme()

  const [inputText, setInputText] = useState('')
  const [events, setEvents] = useState([])
  const [newestFirst, setNewestFirst] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')

  const [manualDate, setManualDate] = useState('')
  const [manualLabel, setManualLabel] = useState('')

  const sortedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date - b.date)
    return newestFirst ? sorted.reverse() : sorted
  }, [events, newestFirst])

  const stats = useMemo(() => {
    if (events.length < 2) return null
    const dates = events.map((e) => e.date.getTime())
    const span = Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24))
    return { count: events.length, span }
  }, [events])

  const handleExtract = useCallback(() => {
    if (!inputText.trim()) return
    const extracted = extractEvents(inputText)
    if (extracted.length > 0) setEvents(extracted)
  }, [inputText])

  const handleLoadSample = useCallback(() => {
    setInputText(SAMPLE_TEXT)
    const extracted = extractEvents(SAMPLE_TEXT)
    setEvents(extracted)
  }, [])

  const handleClear = useCallback(() => {
    setInputText('')
    setEvents([])
  }, [])

  const handleDelete = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleAddManual = useCallback(() => {
    if (!manualDate || !manualLabel.trim()) return
    const [y, m, d] = manualDate.split('-').map(Number)
    const parsed = new Date(y, m - 1, d)
    if (isNaN(parsed)) return
    setEvents((prev) => [
      ...prev,
      { id: Date.now() + ++manualIdCounter, date: parsed, label: manualLabel.trim() },
    ])
    setManualDate('')
    setManualLabel('')
  }, [manualDate, manualLabel])

  const buildText = useCallback(() => {
    const lines = [...events]
      .sort((a, b) => a.date - b.date)
      .map((e) => `[${formatDate(e.date)}] ${e.label}`)
    return `TIMELINE\n========\n${lines.join('\n')}`
  }, [events])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }, [buildText])

  const handleDownload = useCallback(() => {
    const blob = new Blob([buildText()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'timeline.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [buildText])

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.25rem',
  }

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: colors.text,
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <ToolLayout toolId="timeline-builder">
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        color: colors.text,
        fontFamily: 'inherit',
      }}>
        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            Contextual Timeline Builder
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem', color: colors.textSecondary }}>
            Paste unstructured text with dates — extract and visualize an interactive timeline.
          </p>
        </div>

        {/* Input card */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Input
          </h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste any text containing dates and events...\n\nExamples:\n• Jan 15, 2024 - Contract signed\n• On March 3rd, the inspection was completed\n• 2024-04-10: Payment received`}
            rows={7}
            style={{
              ...inputStyle,
              minHeight: 200,
              resize: 'vertical',
              lineHeight: 1.6,
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <PrimaryButton onClick={handleExtract} disabled={!inputText.trim()} colors={colors}>
              Extract Timeline →
            </PrimaryButton>
            <GhostButton onClick={handleLoadSample} colors={colors}>
              Load Sample
            </GhostButton>
            <GhostButton onClick={handleClear} colors={colors}>
              Clear
            </GhostButton>
          </div>
        </div>

        {/* Timeline output */}
        {events.length > 0 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Timeline
              </h2>
              <button
                onClick={() => setNewestFirst((v) => !v)}
                style={{
                  background: `${ACCENT}18`,
                  border: `1px solid ${ACCENT}44`,
                  borderRadius: '0.4rem',
                  color: ACCENT,
                  cursor: 'pointer',
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {newestFirst ? '↑ Newest first' : '↓ Oldest first'}
              </button>
            </div>

            {/* Vertical timeline */}
            <div style={{ position: 'relative', paddingBottom: '0.5rem' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 2,
                background: `${ACCENT}60`,
                transform: 'translateX(-50%)',
                zIndex: 0,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sortedEvents.map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    index={index}
                    onDelete={handleDelete}
                    colors={colors}
                  />
                ))}
              </div>
            </div>

            {/* Manual add */}
            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', colorScheme: isDark ? 'dark' : 'light' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Event
                </label>
                <input
                  type="text"
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                  placeholder="Describe the event…"
                  style={inputStyle}
                />
              </div>
              <PrimaryButton onClick={handleAddManual} disabled={!manualDate || !manualLabel.trim()} colors={colors}>
                Add
              </PrimaryButton>
            </div>

            {/* Actions + Stats */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <GhostButton onClick={handleCopy} colors={colors}>
                  {copyMsg || '📋 Copy as Text'}
                </GhostButton>
                <GhostButton onClick={handleDownload} colors={colors}>
                  ⬇️ Download .txt
                </GhostButton>
              </div>
              {stats && (
                <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  {stats.count} event{stats.count !== 1 ? 's' : ''} · spanning {stats.span} day{stats.span !== 1 ? 's' : ''}
                </span>
              )}
              {events.length === 1 && (
                <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  1 event
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
