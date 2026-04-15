import { useState, useCallback, useRef, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

/* ── Constants ────────────────────────────────────────────────────────── */

const ACCENT = '#8b5cf6'

const SERVICE_PALETTE = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981',
  '#ef4444', '#3b82f6', '#ec4899', '#f97316',
  '#14b8a6', '#a855f7',
]

const LEVEL_COLORS = {
  ERROR: '#ef4444',
  FATAL: '#dc2626',
  WARN:  '#f59e0b',
  WARNING: '#f59e0b',
  INFO:  '#10b981',
  DEBUG: '#64748b',
  TRACE: '#475569',
}

const UUID_RE   = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const HEX16_RE  = /\b[0-9a-f]{16,32}\b/gi
const TRACE_KV  = /(?:traceId|trace_id|traceid|X-Request-ID|requestId|request_id|correlationId|correlation_id|spanId|span_id)[=:\s"']+([0-9a-f-]{16,36})/gi

/* ── Log parsing ──────────────────────────────────────────────────────── */

function detectServiceName(filename) {
  if (!filename) return 'Unknown'
  const base = filename.replace(/\.(log|txt|json|ndjson)$/i, '')
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function parseTimestamp(str) {
  if (!str) return null
  // ISO 8601
  const iso = Date.parse(str)
  if (!isNaN(iso)) return iso
  // Apache: [DD/Mon/YYYY:HH:MM:SS +ZZZZ]
  const apacheM = str.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s*([+-]\d{4})?/)
  if (apacheM) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
    const d = new Date(+apacheM[3], months[apacheM[2]]||0, +apacheM[1], +apacheM[4], +apacheM[5], +apacheM[6])
    return d.getTime()
  }
  // epoch ms
  if (/^\d{13}$/.test(str.trim())) return parseInt(str.trim(), 10)
  return null
}

function extractTraceIds(text) {
  const ids = new Set()
  let m
  // KV pairs first (most reliable)
  TRACE_KV.lastIndex = 0
  while ((m = TRACE_KV.exec(text)) !== null) ids.add(m[1].toLowerCase())
  // UUIDs
  UUID_RE.lastIndex = 0
  while ((m = UUID_RE.exec(text)) !== null) ids.add(m[0].toLowerCase())
  return [...ids]
}

function detectLevel(text) {
  const upper = text.toUpperCase()
  if (/\bFATAL\b/.test(upper)) return 'FATAL'
  if (/\bERROR\b/.test(upper)) return 'ERROR'
  if (/\bWARN(ING)?\b/.test(upper)) return 'WARN'
  if (/\bINFO\b/.test(upper)) return 'INFO'
  if (/\bDEBUG\b/.test(upper)) return 'DEBUG'
  if (/\bTRACE\b/.test(upper)) return 'TRACE'
  return 'INFO'
}

function parseJsonLine(line) {
  try {
    const obj = JSON.parse(line)
    const ts = parseTimestamp(
      obj.timestamp || obj.time || obj['@timestamp'] || obj.ts || obj.datetime || ''
    )
    const level = (obj.level || obj.severity || obj.lvl || 'INFO').toString().toUpperCase()
    const message = obj.message || obj.msg || obj.log || ''
    const traceIds = extractTraceIds(line)
    // Also pick up explicit traceId fields
    const explicit = obj.traceId || obj.trace_id || obj.traceid || obj['X-Request-ID'] ||
                     obj.requestId || obj.correlationId || obj.spanId || ''
    if (explicit) traceIds.unshift(explicit.toString().toLowerCase())
    return { ts, level: detectLevel(level), message, traceIds: [...new Set(traceIds)], raw: line }
  } catch { return null }
}

function parseApacheLine(line) {
  // [DD/Mon/YYYY:HH:MM:SS +ZZZZ] [level] message
  const m = line.match(/\[([^\]]+)\](?:\s*\[([^\]]+)\])?\s*(.*)/)
  if (!m) return null
  const ts = parseTimestamp(m[1])
  if (!ts) return null
  const level = detectLevel(m[2] || m[3] || 'INFO')
  const message = m[3] || ''
  return { ts, level, message, traceIds: extractTraceIds(line), raw: line }
}

function parseGenericLine(line) {
  // Try ISO timestamp at start
  const isoM = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/)
  const ts = isoM ? parseTimestamp(isoM[1]) : null
  const level = detectLevel(line)
  return { ts, level, message: line.trim(), traceIds: extractTraceIds(line), raw: line }
}

function parseLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('{')) {
    const r = parseJsonLine(trimmed)
    if (r) return r
  }
  if (trimmed.startsWith('[')) {
    const r = parseApacheLine(trimmed)
    if (r) return r
  }
  return parseGenericLine(trimmed)
}

async function parseFileContent(content, filename) {
  const serviceName = detectServiceName(filename)
  const lines = content.split('\n')
  const entries = []
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseLine(lines[i])
    if (parsed) {
      entries.push({ ...parsed, service: serviceName, filename, lineNum: i + 1, id: `${filename}:${i}` })
    }
    // Yield to UI every 5000 lines
    if (i % 5000 === 0 && i > 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }
  return entries
}

/* ── Correlation engine ───────────────────────────────────────────────── */

function buildTraceMap(allEntries) {
  const map = new Map()
  for (const entry of allEntries) {
    for (const tid of entry.traceIds) {
      if (!map.has(tid)) map.set(tid, [])
      map.get(tid).push(entry)
    }
  }
  // Sort each trace's entries by timestamp
  for (const [, entries] of map) {
    entries.sort((a, b) => (a.ts || 0) - (b.ts || 0))
  }
  return map
}

function buildStats(allEntries, traceMap) {
  const services = new Set(allEntries.map(e => e.service))
  const errors = allEntries.filter(e => e.level === 'ERROR' || e.level === 'FATAL').length
  return {
    totalLogs: allEntries.length,
    uniqueTraces: traceMap.size,
    uniqueServices: services.size,
    errorCount: errors,
  }
}

/* ── Format for AI ────────────────────────────────────────────────────── */

function formatTraceForAI(traceId, traceEntries) {
  const lines = [`=== TRACE: ${traceId} ===`, '']
  for (const e of traceEntries) {
    const ts = e.ts ? new Date(e.ts).toISOString() : 'unknown'
    lines.push(`[${ts}] [${e.level}] [${e.service}] ${e.message}`)
  }
  lines.push('')
  lines.push(`Total entries: ${traceEntries.length}`)
  const hasError = traceEntries.some(e => e.level === 'ERROR' || e.level === 'FATAL')
  if (hasError) lines.push('⚠️  This trace contains errors.')
  return lines.join('\n')
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function StatPill({ icon, value, label, color, isDark }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: isDark ? `${color}22` : `${color}18`,
      border: `1px solid ${color}44`,
      borderRadius: '999px',
      padding: '0.35rem 0.75rem',
      fontSize: '0.82rem', fontWeight: 700,
      color,
    }}>
      <span>{icon}</span>
      <span>{value}</span>
      <span style={{ fontWeight: 400, opacity: 0.75 }}>{label}</span>
    </div>
  )
}

function LevelDot({ level, size = 10 }) {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.INFO
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} title={level} />
  )
}

/* ── Swimlane SVG ─────────────────────────────────────────────────────── */

const LANE_H = 64
const DOT_R  = 5
const LABEL_W = 140
const PADDING = { top: 40, bottom: 20, right: 24 }

function SwimlaneSVG({ services, entryMap, selectedTrace, traceMap, onDotClick, isDark, colors, width }) {
  const lanes = useMemo(() => {
    return services.map((svc, i) => ({
      svc,
      color: SERVICE_PALETTE[i % SERVICE_PALETTE.length],
      entries: entryMap.get(svc) || [],
      y: PADDING.top + i * LANE_H + LANE_H / 2,
    }))
  }, [services, entryMap])

  const allEntries = useMemo(() => lanes.flatMap(l => l.entries), [lanes])

  const timestamps = allEntries.map(e => e.ts).filter(Boolean)
  const minTs = timestamps.length ? Math.min(...timestamps) : 0
  const maxTs = timestamps.length ? Math.max(...timestamps) : 1

  const svgW = Math.max(width - LABEL_W - PADDING.right, 100)
  const svgH = PADDING.top + lanes.length * LANE_H + PADDING.bottom

  function xPos(ts) {
    if (maxTs === minTs) return svgW / 2
    return ((ts - minTs) / (maxTs - minTs)) * (svgW - 20) + 10
  }

  // Find entries for selected trace
  const selectedEntries = selectedTrace ? (traceMap.get(selectedTrace) || []) : []
  const selectedIds = new Set(selectedEntries.map(e => e.id))

  // Connector lines between same trace entries across lanes
  const connectors = []
  if (selectedTrace && selectedEntries.length > 1) {
    // Group selected entries by their position
    const points = selectedEntries
      .filter(e => e.ts != null)
      .map(e => {
        const lane = lanes.find(l => l.svc === e.service)
        if (!lane) return null
        return { x: xPos(e.ts), y: lane.y }
      })
      .filter(Boolean)
    for (let i = 1; i < points.length; i++) {
      connectors.push({ x1: points[i-1].x, y1: points[i-1].y, x2: points[i].x, y2: points[i].y })
    }
  }

  // Time axis ticks
  const tickCount = Math.min(6, Math.floor(svgW / 90))
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const ts = minTs + (maxTs - minTs) * (i / (tickCount - 1))
    return { x: xPos(ts), label: ts ? new Date(ts).toLocaleTimeString() : '' }
  })

  return (
    <svg
      width={LABEL_W + svgW + PADDING.right}
      height={svgH}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Lane backgrounds */}
      {lanes.map((lane, i) => (
        <rect
          key={lane.svc}
          x={LABEL_W}
          y={PADDING.top + i * LANE_H}
          width={svgW}
          height={LANE_H}
          fill={i % 2 === 0
            ? (isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)')
            : 'transparent'}
        />
      ))}

      {/* Time axis ticks */}
      {timestamps.length > 0 && ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={LABEL_W + t.x} y1={PADDING.top}
            x2={LABEL_W + t.x} y2={PADDING.top + lanes.length * LANE_H}
            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            strokeWidth={1}
          />
          <text
            x={LABEL_W + t.x}
            y={PADDING.top - 8}
            textAnchor="middle"
            fontSize={9}
            fill={isDark ? '#475569' : '#94a3b8'}
          >{t.label}</text>
        </g>
      ))}

      {/* Connector lines for selected trace */}
      {connectors.map((c, i) => (
        <line
          key={i}
          x1={LABEL_W + c.x1} y1={c.y1}
          x2={LABEL_W + c.x2} y2={c.y2}
          stroke={ACCENT}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      ))}

      {/* Lane lines and dots */}
      {lanes.map(lane => (
        <g key={lane.svc}>
          {/* Service label */}
          <text
            x={LABEL_W - 8}
            y={lane.y + 4}
            textAnchor="end"
            fontSize={11}
            fontWeight={600}
            fill={lane.color}
          >{lane.svc.length > 16 ? lane.svc.slice(0, 14) + '…' : lane.svc}</text>

          {/* Lane center line */}
          <line
            x1={LABEL_W} y1={lane.y}
            x2={LABEL_W + svgW} y2={lane.y}
            stroke={lane.color}
            strokeWidth={1.5}
            opacity={0.3}
          />

          {/* Dots */}
          {lane.entries.map(entry => {
            if (entry.ts == null) return null
            const x = xPos(entry.ts)
            const isSelected = selectedIds.has(entry.id)
            const isInTrace = selectedTrace && entry.traceIds.includes(selectedTrace)
            const dotColor = LEVEL_COLORS[entry.level] || LEVEL_COLORS.INFO
            return (
              <circle
                key={entry.id}
                cx={LABEL_W + x}
                cy={lane.y}
                r={isSelected ? DOT_R + 3 : isInTrace ? DOT_R + 1 : DOT_R}
                fill={dotColor}
                stroke={isSelected ? '#fff' : isInTrace ? ACCENT : 'transparent'}
                strokeWidth={isSelected ? 2 : isInTrace ? 1.5 : 0}
                opacity={selectedTrace && !isInTrace ? 0.2 : 1}
                style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                onClick={() => onDotClick(entry)}
              />
            )
          })}
        </g>
      ))}
    </svg>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */

export default function TraceCorrelator() {
  const { isDark, colors } = useTheme()

  const [services, setServices] = useState([])        // [{name, filename, color}]
  const [allEntries, setAllEntries] = useState([])
  const [traceMap, setTraceMap] = useState(new Map())
  const [stats, setStats] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMsg, setProcessingMsg] = useState('')

  const [selectedTrace, setSelectedTrace] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const [filterTrace, setFilterTrace] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  const [copyMsg, setCopyMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pasteService, setPasteService] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)

  const timelineRef = useRef(null)
  const [timelineWidth, setTimelineWidth] = useState(700)

  const resizeObserver = useCallback(node => {
    if (!node) return
    const obs = new ResizeObserver(entries => {
      if (entries[0]) setTimelineWidth(entries[0].contentRect.width)
    })
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  /* ── Process files ─────────────────────────────────────────────── */

  async function processFiles(fileList) {
    setIsProcessing(true)
    const newEntries = [...allEntries]
    const newServices = [...services]

    for (const file of Array.from(fileList)) {
      setProcessingMsg(`Parsing ${file.name}…`)
      const content = await file.text()
      const entries = await parseFileContent(content, file.name)
      const svcName = detectServiceName(file.name)
      if (!newServices.find(s => s.name === svcName)) {
        newServices.push({
          name: svcName,
          filename: file.name,
          color: SERVICE_PALETTE[newServices.length % SERVICE_PALETTE.length],
        })
      }
      newEntries.push(...entries)
    }

    const tmap = buildTraceMap(newEntries)
    const st = buildStats(newEntries, tmap)
    setAllEntries(newEntries)
    setTraceMap(tmap)
    setServices(newServices)
    setStats(st)
    setIsProcessing(false)
    setProcessingMsg('')
  }

  async function processPaste() {
    if (!pasteText.trim()) return
    setIsProcessing(true)
    const fname = (pasteService.trim() || 'pasted-service') + '.log'
    const entries = await parseFileContent(pasteText, fname)
    const svcName = detectServiceName(fname)
    const newServices = [...services]
    if (!newServices.find(s => s.name === svcName)) {
      newServices.push({ name: svcName, filename: fname, color: SERVICE_PALETTE[newServices.length % SERVICE_PALETTE.length] })
    }
    const newEntries = [...allEntries, ...entries]
    const tmap = buildTraceMap(newEntries)
    setAllEntries(newEntries)
    setTraceMap(tmap)
    setServices(newServices)
    setStats(buildStats(newEntries, tmap))
    setPasteText('')
    setPasteService('')
    setShowPaste(false)
    setIsProcessing(false)
  }

  function removeService(svcName) {
    const remaining = allEntries.filter(e => e.service !== svcName)
    const newServices = services.filter(s => s.name !== svcName)
    const tmap = buildTraceMap(remaining)
    setAllEntries(remaining)
    setServices(newServices)
    setTraceMap(tmap)
    setStats(remaining.length ? buildStats(remaining, tmap) : null)
    if (selectedTrace && !tmap.has(selectedTrace)) setSelectedTrace(null)
    setSelectedEntry(null)
  }

  function reset() {
    setServices([])
    setAllEntries([])
    setTraceMap(new Map())
    setStats(null)
    setSelectedTrace(null)
    setSelectedEntry(null)
    setFilterTrace('')
    setFilterService('')
    setFilterLevel('')
  }

  /* ── Derived data ──────────────────────────────────────────────── */

  const filteredEntries = useMemo(() => {
    let list = allEntries
    if (filterTrace) list = list.filter(e => e.traceIds.some(t => t.includes(filterTrace.toLowerCase())))
    if (filterService) list = list.filter(e => e.service.toLowerCase().includes(filterService.toLowerCase()))
    if (filterLevel) list = list.filter(e => e.level === filterLevel)
    return list
  }, [allEntries, filterTrace, filterService, filterLevel])

  // Build per-service entry maps for swimlane (max 50 per service if no trace selected)
  const swimmableEntries = useMemo(() => {
    const entries = selectedTrace
      ? (traceMap.get(selectedTrace) || [])
      : filteredEntries

    const map = new Map()
    for (const svc of services) {
      const svcEntries = entries.filter(e => e.service === svc.name && e.ts != null)
      map.set(svc.name, selectedTrace ? svcEntries : svcEntries.slice(0, 50))
    }
    return map
  }, [services, selectedTrace, filteredEntries, traceMap])

  const topTraces = useMemo(() => {
    const filtered = filterTrace || filterService || filterLevel
      ? (() => {
          const ids = new Set()
          for (const e of filteredEntries) e.traceIds.forEach(t => ids.add(t))
          return [...ids].map(id => ({ id, entries: traceMap.get(id) || [] }))
        })()
      : [...traceMap.entries()].map(([id, entries]) => ({ id, entries }))
    return filtered
      .sort((a, b) => b.entries.length - a.entries.length)
      .slice(0, 50)
  }, [traceMap, filteredEntries, filterTrace, filterService, filterLevel])

  const selectedTraceEntries = useMemo(() => {
    if (!selectedTrace) return []
    return (traceMap.get(selectedTrace) || []).sort((a, b) => (a.ts || 0) - (b.ts || 0))
  }, [selectedTrace, traceMap])

  /* ── Copy for AI ───────────────────────────────────────────────── */

  function copyForAI() {
    const entries = selectedTrace
      ? selectedTraceEntries
      : allEntries.slice(0, 200)
    const id = selectedTrace || 'all-traces'
    const text = formatTraceForAI(id, entries)
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }

  /* ── Drag & Drop ───────────────────────────────────────────────── */

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length) processFiles(files)
  }

  function onDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  /* ── Styles ────────────────────────────────────────────────────── */

  const card = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1rem',
  }

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: colors.text,
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnPrimary = {
    background: ACCENT,
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.55rem 1.1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const btnSecondary = {
    background: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.45rem 0.85rem',
    fontSize: '0.82rem',
    cursor: 'pointer',
  }

  const hasData = allEntries.length > 0

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <ToolLayout toolId="trace-correlator">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            🔗 Distributed Trace Correlator
          </h1>
          <span style={{
            background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
          }}>ENTERPRISE</span>
        </div>
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
          Correlate requests across microservices — 100% client-side, handles GBs
        </p>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      {hasData && stats && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <StatPill icon="📁" value={services.length} label="services" color="#06b6d4" isDark={isDark} />
          <StatPill icon="📋" value={stats.totalLogs.toLocaleString()} label="log lines" color="#8b5cf6" isDark={isDark} />
          <StatPill icon="🔗" value={stats.uniqueTraces.toLocaleString()} label="traces" color="#10b981" isDark={isDark} />
          <StatPill icon="🚨" value={stats.errorCount.toLocaleString()} label="errors" color="#ef4444" isDark={isDark} />
          <button onClick={reset} style={{ ...btnSecondary, marginLeft: 'auto', fontSize: '0.78rem' }}>
            ✕ Clear all
          </button>
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────── */}
      {hasData && (
        <div style={{ ...card, marginBottom: '1rem', padding: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, maxWidth: 220 }}
              placeholder="🔍 Filter by trace ID…"
              value={filterTrace}
              onChange={e => setFilterTrace(e.target.value)}
            />
            <input
              style={{ ...inputStyle, maxWidth: 180 }}
              placeholder="Filter by service…"
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
            />
            <select
              style={{ ...inputStyle, maxWidth: 140 }}
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
            >
              <option value="">All levels</option>
              {['DEBUG','INFO','WARN','ERROR','FATAL'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button onClick={copyForAI} style={{ ...btnPrimary, fontSize: '0.8rem' }}>
              {copyMsg || '🤖 Copy Trace for AI'}
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: hasData ? '260px 1fr' : '1fr',
        gap: '1rem',
        alignItems: 'start',
      }}>

        {/* ── Left panel: file manager ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Upload area */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => setDragOver(false)}
            style={{
              ...card,
              border: `2px dashed ${dragOver ? ACCENT : colors.border}`,
              borderRadius: '0.75rem',
              padding: '1.25rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              background: dragOver
                ? (isDark ? '#8b5cf622' : '#8b5cf608')
                : colors.card,
            }}
            onClick={() => document.getElementById('tc-file-input').click()}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: colors.text }}>
              Drop log files here
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.77rem', color: colors.textSecondary }}>
              2–10 files · .log .txt .json .ndjson
            </p>
            {isProcessing && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: ACCENT }}>
                ⚡ {processingMsg}
              </p>
            )}
            <input
              id="tc-file-input"
              type="file"
              multiple
              accept=".log,.txt,.json,.ndjson,.jsonl"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files.length) processFiles(e.target.files) }}
            />
          </div>

          {/* Paste service button */}
          <button
            style={{ ...btnSecondary, textAlign: 'center', width: '100%' }}
            onClick={() => setShowPaste(v => !v)}
          >
            {showPaste ? '▲ Hide paste' : '📋 Paste service logs'}
          </button>

          {/* Paste panel */}
          {showPaste && (
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                style={inputStyle}
                placeholder="Service name (e.g. api-gateway)"
                value={pasteService}
                onChange={e => setPasteService(e.target.value)}
              />
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.78rem' }}
                placeholder="Paste log content here…"
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
              <button style={btnPrimary} onClick={processPaste} disabled={!pasteText.trim()}>
                ⚡ Correlate
              </button>
            </div>
          )}

          {/* Service list */}
          {services.length > 0 && (
            <div style={{ ...card, padding: '0.75rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Services ({services.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {services.map(svc => {
                  const count = allEntries.filter(e => e.service === svc.name).length
                  const errs = allEntries.filter(e => e.service === svc.name && (e.level === 'ERROR' || e.level === 'FATAL')).length
                  return (
                    <div key={svc.name} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.4rem',
                      background: filterService === svc.name
                        ? (isDark ? `${svc.color}22` : `${svc.color}12`)
                        : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => setFilterService(filterService === svc.name ? '' : svc.name)}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: svc.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.82rem', color: colors.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {svc.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: colors.textSecondary }}>{count}</span>
                      {errs > 0 && <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>{errs}⚠</span>}
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: '0.75rem', padding: '0 2px' }}
                        onClick={e => { e.stopPropagation(); removeService(svc.name) }}
                        title="Remove service"
                      >✕</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trace list */}
          {topTraces.length > 0 && (
            <div style={{ ...card, padding: '0.75rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Top Traces ({topTraces.length})
              </p>
              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {topTraces.map(({ id, entries }) => {
                  const hasErr = entries.some(e => e.level === 'ERROR' || e.level === 'FATAL')
                  const svcCount = new Set(entries.map(e => e.service)).size
                  return (
                    <div key={id}
                      onClick={() => setSelectedTrace(selectedTrace === id ? null : id)}
                      style={{
                        padding: '0.4rem 0.5rem',
                        borderRadius: '0.4rem',
                        background: selectedTrace === id
                          ? (isDark ? `${ACCENT}33` : `${ACCENT}15`)
                          : 'transparent',
                        border: `1px solid ${selectedTrace === id ? ACCENT + '66' : 'transparent'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {hasErr && <span style={{ fontSize: '0.7rem' }}>🔴</span>}
                        <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.72rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: colors.textSecondary, marginTop: '0.15rem' }}>
                        {entries.length} entries · {svcCount} service{svcCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: timeline ─────────────────────────────── */}
        {hasData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Swimlane */}
            <div style={{ ...card, overflowX: 'auto' }} ref={el => {
              timelineRef.current = el
              if (el) resizeObserver(el)
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: colors.text }}>
                  🏊 Swimlane Timeline
                  {selectedTrace && (
                    <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.72rem', color: ACCENT }}>
                      {selectedTrace.slice(0, 20)}…
                    </span>
                  )}
                </p>
                {selectedTrace && (
                  <button style={{ ...btnSecondary, fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setSelectedTrace(null); setSelectedEntry(null) }}>
                    Clear selection
                  </button>
                )}
              </div>

              {services.length > 0 ? (
                <div style={{ minWidth: 400 }}>
                  <SwimlaneSVG
                    services={services.map(s => s.name)}
                    entryMap={swimmableEntries}
                    selectedTrace={selectedTrace}
                    traceMap={traceMap}
                    onDotClick={setSelectedEntry}
                    isDark={isDark}
                    colors={colors}
                    width={timelineWidth || 700}
                  />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(LEVEL_COLORS).slice(0,5).map(([level, color]) => (
                      <span key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: colors.textSecondary }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {level}
                      </span>
                    ))}
                    <span style={{ fontSize: '0.72rem', color: colors.textSecondary, marginLeft: 'auto' }}>
                      {selectedTrace ? 'Showing full trace' : `Showing up to 50 entries/service`}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: colors.textSecondary, fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                  No entries with parseable timestamps yet.
                </p>
              )}
            </div>

            {/* Selected entry detail */}
            {selectedEntry && (
              <div style={{ ...card, borderLeft: `3px solid ${LEVEL_COLORS[selectedEntry.level] || ACCENT}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.85rem', color: colors.text }}>
                    Selected Entry
                  </p>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }} onClick={() => setSelectedEntry(null)}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: colors.textSecondary }}>Service: </span><strong style={{ color: colors.text }}>{selectedEntry.service}</strong></div>
                  <div><span style={{ color: colors.textSecondary }}>Level: </span>
                    <span style={{ color: LEVEL_COLORS[selectedEntry.level] || colors.text, fontWeight: 700 }}>{selectedEntry.level}</span>
                  </div>
                  <div><span style={{ color: colors.textSecondary }}>Time: </span>
                    <span style={{ color: colors.text, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {selectedEntry.ts ? new Date(selectedEntry.ts).toISOString() : 'unknown'}
                    </span>
                  </div>
                  <div><span style={{ color: colors.textSecondary }}>Line: </span><span style={{ color: colors.text }}>#{selectedEntry.lineNum}</span></div>
                </div>
                {selectedEntry.traceIds.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '0.78rem' }}>Trace IDs: </span>
                    {selectedEntry.traceIds.map(tid => (
                      <span key={tid}
                        onClick={() => setSelectedTrace(tid)}
                        style={{
                          fontFamily: 'monospace', fontSize: '0.72rem',
                          background: isDark ? '#8b5cf622' : '#8b5cf610',
                          color: ACCENT, padding: '0.15rem 0.4rem',
                          borderRadius: '0.3rem', marginLeft: '0.3rem',
                          cursor: 'pointer', display: 'inline-block',
                        }}
                        title="Click to select this trace"
                      >{tid.slice(0,24)}{tid.length > 24 ? '…' : ''}</span>
                    ))}
                  </div>
                )}
                <div style={{
                  marginTop: '0.6rem',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#f1f5f9',
                  borderRadius: '0.4rem',
                  padding: '0.6rem',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: colors.text,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}>{selectedEntry.raw}</div>
              </div>
            )}

            {/* Selected trace full log */}
            {selectedTrace && selectedTraceEntries.length > 0 && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: colors.text }}>
                    📋 Full Trace — {selectedTraceEntries.length} entries
                  </p>
                  <button style={{ ...btnPrimary, fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={copyForAI}>
                    {copyMsg || '🤖 Copy for AI'}
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {selectedTraceEntries.map((entry, i) => {
                    const svc = services.find(s => s.name === entry.service)
                    return (
                      <div key={i} style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '0.4rem',
                        background: selectedEntry?.id === entry.id
                          ? (isDark ? `${ACCENT}22` : `${ACCENT}10`)
                          : 'transparent',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${LEVEL_COLORS[entry.level] || '#64748b'}`,
                      }}
                      onClick={() => setSelectedEntry(entry)}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: svc?.color || '#64748b', flexShrink: 0, marginTop: 4 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: colors.textSecondary, marginBottom: '0.1rem', flexWrap: 'wrap' }}>
                            <span style={{ color: svc?.color || colors.textSecondary, fontWeight: 600 }}>{entry.service}</span>
                            <span style={{ color: LEVEL_COLORS[entry.level] || colors.textSecondary, fontWeight: 700 }}>{entry.level}</span>
                            <span style={{ fontFamily: 'monospace' }}>{entry.ts ? new Date(entry.ts).toISOString().slice(11,23) : ''}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.message}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (

          <div style={{
            ...card,
            textAlign: 'center',
            padding: '3rem 2rem',
            border: `2px dashed ${colors.border}`,
            background: 'transparent',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔗</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: colors.text }}>
              No log files loaded yet
            </h2>
            <p style={{ margin: '0 0 1.5rem', color: colors.textSecondary, fontSize: '0.9rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Drop 2–10 log files from different microservices. The correlator will automatically group requests by trace ID across all services.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start', maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
              {[
                '📄 JSON logs: {"traceId":"…","level":"…","message":"…"}',
                '📄 Apache/NGINX: [timestamp] [LEVEL] message',
                '📄 Generic: any log with traceId=UUID or trace_id=UUID',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: colors.textSecondary }}>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button
              style={{ ...btnPrimary, marginTop: '1.5rem', padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
              onClick={() => document.getElementById('tc-file-input-empty').click()}
            >
              📂 Choose Log Files
            </button>
            <input
              id="tc-file-input-empty"
              type="file"
              multiple
              accept=".log,.txt,.json,.ndjson,.jsonl"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files.length) processFiles(e.target.files) }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
