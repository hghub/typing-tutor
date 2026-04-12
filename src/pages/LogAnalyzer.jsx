import { useState, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f59e0b'

const SAMPLE_LOGS = `2024-01-15T10:23:01.123Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
2024-01-15T10:23:02.456Z [INFO] Server listening on port 3000
2024-01-15T10:23:05.789Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
2024-01-15T10:23:07.001Z [WARN] Deprecated API endpoint /api/v1/users called
2024-01-15T10:23:08.321Z [ERROR] MongoServerError: E11000 duplicate key error collection: db.users index: email_1
2024-01-15T10:23:09.654Z [INFO] GET /api/v1/users 200 42ms
2024-01-15T10:23:10.987Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
2024-01-15T10:23:11.234Z [WARN] Deprecated API endpoint /api/v1/users called
2024-01-15T10:23:12.567Z [ERROR] UnhandledPromiseRejectionWarning: Error: ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect (net.js:1148:16)
2024-01-15T10:23:13.890Z [INFO] GET /api/v1/products 200 18ms
2024-01-15T10:23:14.123Z [ERROR] MongoServerError: E11000 duplicate key error collection: db.users index: email_1
2024-01-15T10:23:15.456Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
2024-01-15T10:23:16.789Z [WARN] Memory usage high: 87% (heap used: 1.4 GB / 1.6 GB)
2024-01-15T10:23:17.012Z [ERROR] UnhandledPromiseRejectionWarning: Error: ECONNREFUSED 127.0.0.1:5432
2024-01-15T10:23:18.345Z [INFO] Cache hit ratio: 94.3%
2024-01-15T10:23:19.678Z [ERROR] SyntaxError: Unexpected token < in JSON at position 0
    at JSON.parse (<anonymous>)
    at Response.json (node-fetch.js:272:24)
2024-01-15T10:23:20.901Z [WARN] Deprecated API endpoint /api/v1/users called
2024-01-15T10:23:21.234Z [ERROR] MongoServerError: E11000 duplicate key error collection: db.users index: email_1
2024-01-15T10:23:22.567Z [INFO] POST /api/v1/auth/login 201 156ms
2024-01-15T10:23:23.890Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
2024-01-15T10:23:24.123Z [WARN] Memory usage high: 89% (heap used: 1.42 GB / 1.6 GB)
2024-01-15T10:23:25.456Z [ERROR] UnhandledPromiseRejectionWarning: Error: ECONNREFUSED 127.0.0.1:5432
2024-01-15T10:23:26.789Z [INFO] Scheduled job "cleanup-sessions" started
2024-01-15T10:23:27.012Z [ERROR] SyntaxError: Unexpected token < in JSON at position 0
2024-01-15T10:23:28.345Z [ERROR] TypeError: Cannot read property 'id' of undefined
    at UserController.getUser (user.controller.js:45:18)
2024-01-15T10:23:29.678Z [WARN] Slow query detected (2340ms): SELECT * FROM orders WHERE user_id = 9182
2024-01-15T10:23:30.901Z [INFO] GET /health 200 1ms
2024-01-15T10:23:31.234Z [ERROR] MongoServerError: E11000 duplicate key error collection: db.users index: email_1`

/* ── Clustering logic ─────────────────────────────────────────────────── */

function getSeverity(line) {
  if (/error|exception|fatal|critical|traceback/i.test(line)) return 'ERROR'
  if (/warn|warning/i.test(line)) return 'WARN'
  if (/info|notice/i.test(line)) return 'INFO'
  return 'DEBUG'
}

function normalizePattern(line) {
  return line
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[\.\d]*/g, '[TIMESTAMP]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]')
    .replace(/\b\d+\b/g, '[N]')
    .replace(/0x[0-9a-f]+/gi, '[HEX]')
    .trim()
}

function analyzeLogs(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim())
  const clusters = {}
  lines.forEach(line => {
    const key = normalizePattern(line)
    if (!clusters[key]) {
      clusters[key] = { pattern: key, representative: line, count: 0, lines: [], severity: getSeverity(line) }
    }
    clusters[key].count++
    clusters[key].lines.push(line)
  })
  return { clusters: Object.values(clusters).sort((a, b) => b.count - a.count), totalLines: lines.length }
}

/* ── Severity badge ───────────────────────────────────────────────────── */

const SEVERITY_COLORS = {
  ERROR: { bg: '#ef444422', text: '#ef4444', border: '#ef444444' },
  WARN:  { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b44' },
  INFO:  { bg: '#3b82f622', text: '#3b82f6', border: '#3b82f644' },
  DEBUG: { bg: '#6b728022', text: '#6b7280', border: '#6b728044' },
}

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLORS[severity] || SEVERITY_COLORS.DEBUG
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: '0.3rem',
      padding: '0.1rem 0.45rem',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      flexShrink: 0,
    }}>
      {severity}
    </span>
  )
}

/* ── Cluster card ─────────────────────────────────────────────────────── */

function ClusterCard({ cluster, index, colors }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderBottom: expanded ? `1px solid ${colors.border}` : 'none',
      }}>
        <span style={{
          background: `${ACCENT}22`,
          color: ACCENT,
          border: `1px solid ${ACCENT}44`,
          borderRadius: '50%',
          width: '1.6rem',
          height: '1.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {index + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <SeverityBadge severity={cluster.severity} />
            <span style={{
              background: `${ACCENT}18`,
              color: ACCENT,
              border: `1px solid ${ACCENT}33`,
              borderRadius: '0.9rem',
              padding: '0.1rem 0.55rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              × {cluster.count.toLocaleString()}
            </span>
          </div>
          <pre style={{
            margin: 0,
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            fontSize: '0.78rem',
            color: colors.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            opacity: 0.9,
          }}>
            {cluster.representative}
          </pre>
        </div>
        {cluster.lines.length > 1 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.4rem',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {expanded ? '▲ Hide' : `▼ Show ${cluster.lines.length}`}
          </button>
        )}
      </div>
      {expanded && (
        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {cluster.lines.map((line, i) => (
            <pre key={i} style={{
              margin: 0,
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: '0.72rem',
              color: colors.textSecondary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              padding: '0.25rem 0.5rem',
              background: colors.bg,
              borderRadius: '0.3rem',
              borderLeft: `2px solid ${ACCENT}55`,
            }}>
              {line}
            </pre>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */

export default function LogAnalyzer() {
  const { isDark, colors } = useTheme()
  const [rawText, setRawText] = useState('')
  const [clusters, setClusters] = useState(null)
  const [totalLines, setTotalLines] = useState(0)
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [sortOrder, setSortOrder] = useState('desc')
  const [copied, setCopied] = useState(false)

  const handleAnalyze = useCallback(() => {
    if (!rawText.trim()) return
    const result = analyzeLogs(rawText)
    setClusters(result.clusters)
    setTotalLines(result.totalLines)
  }, [rawText])

  const handleClear = useCallback(() => {
    setRawText('')
    setClusters(null)
    setTotalLines(0)
    setCopied(false)
  }, [])

  const handleLoadSample = useCallback(() => {
    setRawText(SAMPLE_LOGS)
    setClusters(null)
  }, [])

  const filteredClusters = clusters
    ? clusters
        .filter(c => severityFilter === 'ALL' || c.severity === severityFilter)
        .sort((a, b) => sortOrder === 'desc' ? b.count - a.count : a.count - b.count)
    : []

  const errorLines = clusters ? clusters.filter(c => c.severity === 'ERROR').reduce((s, c) => s + c.count, 0) : 0
  const uniquePatterns = clusters ? clusters.length : 0
  const compressionRatio = totalLines > 0 && uniquePatterns > 0
    ? ((1 - uniquePatterns / totalLines) * 100).toFixed(0)
    : 0

  const handleCopyForAI = useCallback(() => {
    if (!clusters) return
    const visible = clusters.filter(c => severityFilter === 'ALL' || c.severity === severityFilter)
    const lines = [
      '=== LOG ANALYSIS SUMMARY ===',
      `Total lines: ${totalLines.toLocaleString()} | Unique error patterns: ${visible.length}`,
      '',
      ...visible.flatMap((c, i) => [
        `[Pattern ${i + 1} × ${c.count} occurrences] [${c.severity}]`,
        c.representative,
        '',
      ]),
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [clusters, totalLines, severityFilter])

  const btnBase = {
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    padding: '0.55rem 1.1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
  }

  return (
    <ToolLayout toolId="log-analyzer">
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            Smart Log Analyzer
          </h1>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Paste raw server logs → auto-clusters similar errors → extract unique patterns for AI in one click.
          </p>
        </div>

        {/* Input area */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '1rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={'Paste your server logs here…\n\nSupports: Node.js, Python, Java, Nginx, Apache, Docker, and more'}
            style={{
              background: colors.input,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '0.6rem',
              padding: '0.75rem',
              color: colors.text,
              fontSize: '0.8rem',
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              lineHeight: 1.6,
              minHeight: '300px',
              resize: 'vertical',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAnalyze}
              disabled={!rawText.trim()}
              style={{
                ...btnBase,
                background: rawText.trim() ? ACCENT : colors.border,
                color: rawText.trim() ? '#fff' : colors.textSecondary,
                cursor: rawText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Analyze Logs →
            </button>
            <button
              onClick={handleClear}
              style={{
                ...btnBase,
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              Clear
            </button>
            <button
              onClick={handleLoadSample}
              style={{
                ...btnBase,
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}44`,
                color: ACCENT,
              }}
            >
              Load Sample
            </button>
          </div>
        </div>

        {/* Results */}
        {clusters && (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
            }}>
              {[
                { label: 'Total Lines', value: totalLines.toLocaleString() },
                { label: 'Error Lines', value: errorLines.toLocaleString() },
                { label: 'Unique Patterns', value: uniquePatterns.toLocaleString() },
                { label: 'Compression', value: `${compressionRatio}%` },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '0.875rem 1rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: ACCENT }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.2rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filter / sort + Copy for AI */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                style={{
                  background: colors.input,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  color: colors.text,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Severities</option>
                <option value="ERROR">ERROR only</option>
                <option value="WARN">WARN only</option>
                <option value="INFO">INFO only</option>
                <option value="DEBUG">DEBUG only</option>
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                style={{
                  background: colors.input,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  color: colors.text,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="desc">Most frequent first</option>
                <option value="asc">Least frequent first</option>
              </select>
              <div style={{ flex: 1 }} />
              <button
                onClick={handleCopyForAI}
                style={{
                  ...btnBase,
                  background: copied ? '#22c55e' : ACCENT,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: `0 0 16px ${ACCENT}55`,
                }}
              >
                {copied ? '✓ Copied!' : '⎘ Copy for AI'}
              </button>
            </div>

            {/* Cluster list */}
            {filteredClusters.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filteredClusters.map((cluster, i) => (
                  <ClusterCard key={cluster.pattern} cluster={cluster} index={i} colors={colors} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: colors.textSecondary,
                padding: '2rem',
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
              }}>
                No patterns match the current filter.
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
