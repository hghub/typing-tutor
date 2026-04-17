import { useState, useMemo, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import ToolSEOFooter from '../components/ToolSEOFooter'

const ACCENT = '#ef4444'

/* ── Detection patterns ─────────────────────────────────────────────────── */

const PATTERNS = [
  // Credentials
  { id: 'aws-access-key',   label: 'AWS Access Key',          category: 'credentials', risk: 'critical', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: 'aws-secret-key',   label: 'AWS Secret Key',          category: 'credentials', risk: 'critical', regex: /(?:aws_secret|secret_access_key)["\s:=]+([A-Za-z0-9/+=]{40})/gi },
  { id: 'github-token',     label: 'GitHub Token',            category: 'credentials', risk: 'critical', regex: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})\b/g },
  { id: 'jwt-token',        label: 'JWT Token',               category: 'tokens',      risk: 'high',     regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g },
  { id: 'private-key',      label: 'Private Key Block',       category: 'credentials', risk: 'critical', regex: /-----BEGIN\s(?:RSA|EC|PGP|OPENSSH|DSA)\sPRIVATE KEY-----/g },
  { id: 'db-url',           label: 'Database URL',            category: 'credentials', risk: 'critical', regex: /(?:mongodb|postgresql|postgres|mysql|redis):\/\/[^\s"']+/gi },
  { id: 'generic-api-key',  label: 'API Key Pattern',         category: 'credentials', risk: 'high',     regex: /(?:api[_-]?key|apikey|api_secret)["\s:=]+["']?([A-Za-z0-9\-_]{20,})["']?/gi },
  { id: 'generic-secret',   label: 'Secret/Token Value',      category: 'credentials', risk: 'high',     regex: /(?:secret[_-]?key?|auth[_-]?token|access[_-]?token|bearer)["\s:=]+["']?([A-Za-z0-9\-_.]{16,})["']?/gi },
  { id: 'password-plain',   label: 'Plaintext Password',      category: 'credentials', risk: 'high',     regex: /(?:password|passwd|pwd)["\s:=]+["']?([^\s"']{6,})["']?/gi },
  // PII
  { id: 'cnic',             label: 'CNIC (Pakistan)',         category: 'pii',         risk: 'high',     regex: /\b\d{5}-\d{7}-\d\b/g },
  { id: 'iban-pk',          label: 'IBAN (Pakistan)',         category: 'pii',         risk: 'high',     regex: /\bPK\d{2}[A-Z]{4}\d{16}\b/g },
  { id: 'phone-pk',         label: 'Phone Number (PK)',       category: 'pii',         risk: 'medium',   regex: /\b(?:\+92|0092|0)3[0-9]{9}\b/g },
  { id: 'email',            label: 'Email Address',           category: 'pii',         risk: 'medium',   regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { id: 'national-id-gen',  label: 'National ID (Generic)',  category: 'pii',         risk: 'medium',   regex: /\b[A-Z]{1,2}[0-9]{6,9}\b/g },
  // Network
  { id: 'ipv4-private',     label: 'Private IP Address',      category: 'network',     risk: 'low',      regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g },
  { id: 'ipv4-public',      label: 'Public IP Address',       category: 'network',     risk: 'medium',   regex: /\b(?:(?!(?:10|127|169\.254|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.)\d{1,3}(?:\.\d{1,3}){3})\b/g },
  { id: 'internal-url',     label: 'Internal URL/Host',       category: 'network',     risk: 'medium',   regex: /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|internal|staging|dev\.|test\.)[^\s"']*/gi },
]

const RISK_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const SAMPLE_DATA = `# .env file
DATABASE_URL=postgresql://admin:P@ssw0rd123@db.internal.company.com:5432/production
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_sMczTvQhKXxSMZ8_P0a8

# User data
user_cnic=42301-1234567-1
user_phone=03001234567
user_email=ahmed.khan@company.com
user_iban=PK36SCBL0000001123456702`

/* ── Scan engine ────────────────────────────────────────────────────────── */

function scanText(text) {
  const lines = text.split('\n')
  const findings = []
  const seen = new Set()

  for (const pattern of PATTERNS) {
    // Fresh regex each scan to reset lastIndex
    const re = new RegExp(pattern.regex.source, pattern.regex.flags)
    let match

    while ((match = re.exec(text)) !== null) {
      const matchedString = match[0]
      const key = `${pattern.id}::${matchedString}`
      if (seen.has(key)) continue
      seen.add(key)

      // Find line + column
      const beforeMatch = text.slice(0, match.index)
      const lineNumber = beforeMatch.split('\n').length
      const lastNewline = beforeMatch.lastIndexOf('\n')
      const colIndex = match.index - (lastNewline + 1)

      // Context: 40 chars before + after
      const ctxStart = Math.max(0, match.index - 40)
      const ctxEnd = Math.min(text.length, match.index + matchedString.length + 40)
      const contextBefore = text.slice(ctxStart, match.index)
      const contextAfter = text.slice(match.index + matchedString.length, ctxEnd)

      findings.push({
        patternId: pattern.id,
        label: pattern.label,
        category: pattern.category,
        risk: pattern.risk,
        match: matchedString,
        line: lineNumber,
        col: colIndex,
        contextBefore,
        contextAfter,
      })
    }
  }

  // Sort: by category order then risk
  const catOrder = { credentials: 0, tokens: 1, pii: 2, network: 3 }
  findings.sort((a, b) => {
    const catDiff = (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9)
    if (catDiff !== 0) return catDiff
    return (RISK_ORDER[a.risk] ?? 9) - (RISK_ORDER[b.risk] ?? 9)
  })

  return { findings, linesScanned: lines.length }
}

/* ── Risk badge ─────────────────────────────────────────────────────────── */

const RISK_STYLES = {
  critical: { bg: '#ef444422', text: '#ef4444', border: '#ef444466', label: 'CRITICAL' },
  high:     { bg: '#f97316 22', text: '#f97316', border: '#f9731655', label: 'HIGH' },
  medium:   { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b55', label: 'MEDIUM' },
  low:      { bg: '#6b728022', text: '#9ca3af', border: '#6b728055', label: 'LOW' },
}

function RiskBadge({ risk }) {
  const s = RISK_STYLES[risk] || RISK_STYLES.low
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      borderRadius: '0.3rem',
      padding: '0.1rem 0.45rem',
      fontSize: '0.68rem',
      fontWeight: 800,
      letterSpacing: '0.06em',
      flexShrink: 0,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {s.label}
    </span>
  )
}

/* ── Finding card ───────────────────────────────────────────────────────── */

function FindingCard({ finding, colors }) {
  const truncated = finding.match.length > 60
    ? finding.match.slice(0, 60) + '…'
    : finding.match

  const riskLeft = {
    critical: '#ef4444',
    high:     '#f97316',
    medium:   '#f59e0b',
    low:      '#6b7280',
  }[finding.risk] || '#6b7280'

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderLeft: `3px solid ${riskLeft}`,
      borderRadius: '0.6rem',
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <RiskBadge risk={finding.risk} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: colors.text }}>
          {finding.label}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.75rem',
          color: colors.textSecondary,
          fontFamily: '"Fira Code", monospace',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.3rem',
          padding: '0.1rem 0.4rem',
        }}>
          Line {finding.line}
        </span>
      </div>

      {/* Matched value */}
      <div style={{
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        fontSize: '0.8rem',
        background: `${ACCENT}0d`,
        border: `1px solid ${ACCENT}33`,
        borderRadius: '0.4rem',
        padding: '0.35rem 0.65rem',
        color: ACCENT,
        wordBreak: 'break-all',
      }}>
        {truncated}
      </div>

      {/* Context */}
      <div style={{
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        fontSize: '0.73rem',
        color: colors.textSecondary,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.4rem',
        padding: '0.3rem 0.6rem',
        wordBreak: 'break-all',
        lineHeight: 1.5,
      }}>
        <span style={{ opacity: 0.7 }}>{finding.contextBefore}</span>
        <span style={{
          background: `${ACCENT}33`,
          color: ACCENT,
          borderRadius: '0.2rem',
          padding: '0 0.15rem',
          fontWeight: 700,
        }}>
          {finding.match.length > 60 ? finding.match.slice(0, 60) + '…' : finding.match}
        </span>
        <span style={{ opacity: 0.7 }}>{finding.contextAfter}</span>
      </div>
    </div>
  )
}

/* ── Category empty state ───────────────────────────────────────────────── */

function CategoryEmpty({ category, colors }) {
  const label = category === 'all' ? 'secrets' : category
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: '#22c55e',
      background: '#22c55e0d',
      border: `1px solid #22c55e33`,
      borderRadius: '0.75rem',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>✓</div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
        No {label} secrets found
      </div>
    </div>
  )
}

/* ── Toast ──────────────────────────────────────────────────────────────── */

function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      background: '#22c55e',
      color: '#fff',
      borderRadius: '0.6rem',
      padding: '0.65rem 1.1rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      boxShadow: '0 4px 16px #0004',
      zIndex: 9999,
      transform: visible ? 'translateY(0)' : 'translateY(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */

const TABS = [
  { id: 'all',         label: 'All' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'tokens',      label: 'Tokens' },
  { id: 'pii',         label: 'PII' },
  { id: 'network',     label: 'Network' },
]

export default function DataLeakDetector() {
  const { isDark, colors } = useTheme()

  const [inputText,    setInputText]    = useState('')
  const [scanResult,   setScanResult]   = useState(null)   // null = not scanned yet
  const [activeTab,    setActiveTab]    = useState('all')
  const [toast,        setToast]        = useState({ visible: false, message: '' })

  /* ── Scan ── */
  const handleScan = useCallback(() => {
    if (!inputText.trim()) return
    const result = scanText(inputText)
    setScanResult(result)
    setActiveTab('all')
  }, [inputText])

  const handleClear = useCallback(() => {
    setInputText('')
    setScanResult(null)
    setActiveTab('all')
  }, [])

  const handleLoadSample = useCallback(() => {
    setInputText(SAMPLE_DATA)
    setScanResult(null)
  }, [])

  /* ── Toast helper ── */
  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg })
    setTimeout(() => setToast({ visible: false, message: msg }), 2800)
  }, [])

  /* ── Filtered findings ── */
  const displayedFindings = useMemo(() => {
    if (!scanResult) return []
    if (activeTab === 'all') return scanResult.findings
    return scanResult.findings.filter(f => f.category === activeTab)
  }, [scanResult, activeTab])

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!scanResult) return null
    const { findings, linesScanned } = scanResult
    return {
      total:    findings.length,
      critical: findings.filter(f => f.risk === 'critical').length,
      pii:      findings.filter(f => f.category === 'pii').length,
      lines:    linesScanned,
    }
  }, [scanResult])

  /* ── Tab counts ── */
  const tabCounts = useMemo(() => {
    if (!scanResult) return {}
    const counts = { all: scanResult.findings.length }
    for (const f of scanResult.findings) {
      counts[f.category] = (counts[f.category] || 0) + 1
    }
    return counts
  }, [scanResult])

  /* ── Copy safe version ── */
  const handleCopySafe = useCallback(() => {
    if (!scanResult) return
    let safe = inputText
    // Collect all unique match strings, sort longest-first to avoid partial replacements
    const matches = [...new Set(scanResult.findings.map(f => f.match))]
    matches.sort((a, b) => b.length - a.length)
    for (const m of matches) {
      safe = safe.split(m).join('[REDACTED]')
    }
    navigator.clipboard.writeText(safe).then(() => {
      showToast(`Copied! ${matches.length} item${matches.length !== 1 ? 's' : ''} redacted`)
    })
  }, [scanResult, inputText, showToast])

  /* ── Copy report ── */
  const handleCopyReport = useCallback(() => {
    if (!scanResult) return
    const lines = [
      '=== DATA LEAK DETECTOR REPORT ===',
      `Date: ${new Date().toLocaleString()}`,
      `Total findings: ${scanResult.findings.length}`,
      `Lines scanned: ${scanResult.linesScanned}`,
      '',
      ...scanResult.findings.map((f, i) =>
        `[${i + 1}] ${f.risk.toUpperCase()} — ${f.label}\n    Match: ${f.match}\n    Line ${f.line}`
      ),
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      showToast('Report copied to clipboard')
    })
  }, [scanResult, showToast])

  /* ── Download report ── */
  const handleDownloadReport = useCallback(() => {
    if (!scanResult) return
    const lines = [
      '=== DATA LEAK DETECTOR REPORT ===',
      `Date: ${new Date().toLocaleString()}`,
      `Total findings: ${scanResult.findings.length}`,
      `Lines scanned: ${scanResult.linesScanned}`,
      '',
      ...scanResult.findings.map((f, i) =>
        `[${i + 1}] ${f.risk.toUpperCase()} — ${f.label}\n    Match: ${f.match}\n    Line ${f.line}, Col ${f.col}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leak-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Report downloaded')
  }, [scanResult, showToast])

  /* ── Styles ── */
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

  const hasFindings = scanResult && scanResult.findings.length > 0
  const zeroFindings = scanResult && scanResult.findings.length === 0

  return (
    <ToolLayout toolId="data-leak-detector">
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Header ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{
              background: `${ACCENT}18`,
              border: `1px solid ${ACCENT}44`,
              borderRadius: '0.5rem',
              padding: '0.3rem 0.5rem',
              fontSize: '1.15rem',
              lineHeight: 1,
            }}>
              🛡️
            </span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
              Data Leak Detector
            </h1>
          </div>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Scan logs, configs, and API responses for secrets, credentials, and PII before sharing with anyone.
          </p>
        </div>

        {/* ── Input area ── */}
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
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={'Paste logs, code, config, API responses...\n\nThis tool runs entirely in your browser — nothing is sent to a server.'}
            spellCheck={false}
            style={{
              background: colors.input,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '0.6rem',
              padding: '0.85rem',
              color: colors.text,
              fontSize: '0.8rem',
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              lineHeight: 1.6,
              minHeight: '280px',
              resize: 'vertical',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />

          {/* Action bar */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleScan}
              disabled={!inputText.trim()}
              style={{
                ...btnBase,
                background: inputText.trim() ? ACCENT : colors.border,
                color: inputText.trim() ? '#fff' : colors.textSecondary,
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                boxShadow: inputText.trim() ? `0 0 18px ${ACCENT}44` : 'none',
              }}
            >
              🔍 Scan for Leaks
            </button>
            <button
              onClick={handleLoadSample}
              style={{
                ...btnBase,
                background: `${ACCENT}14`,
                border: `1px solid ${ACCENT}44`,
                color: ACCENT,
              }}
            >
              Load Sample
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
          </div>
        </div>

        {/* ── Pre-scan empty state ── */}
        {!scanResult && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: colors.card,
            border: `1px dashed ${colors.border}`,
            borderRadius: '1rem',
            color: colors.textSecondary,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🛡️</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: colors.text, marginBottom: '0.4rem' }}>
              Ready to scan
            </div>
            <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Paste text above and click <strong style={{ color: ACCENT }}>Scan for Leaks</strong> to detect secrets,
              credentials, and PII in your content.
            </div>
          </div>
        )}

        {/* ── Stats bar (after scan) ── */}
        {scanResult && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { label: 'Total Findings',   value: stats.total,    color: stats.total > 0 ? ACCENT : '#22c55e' },
              { label: 'Critical',         value: stats.critical, color: stats.critical > 0 ? '#ef4444' : colors.textSecondary },
              { label: 'PII Detected',     value: stats.pii,      color: stats.pii > 0 ? '#f59e0b' : colors.textSecondary },
              { label: 'Lines Scanned',    value: stats.lines,    color: colors.textSecondary },
            ].map(s => (
              <div key={s.label} style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
                  {s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.73rem', color: colors.textSecondary, marginTop: '0.2rem', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Zero findings state ── */}
        {zeroFindings && (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 2rem',
            background: '#22c55e0d',
            border: `1px solid #22c55e44`,
            borderRadius: '1rem',
            color: '#22c55e',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              No secrets detected
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>
              Your text looks clean — no credentials, PII, or network details found.
            </div>
          </div>
        )}

        {/* ── Findings panel ── */}
        {hasFindings && (
          <>
            {/* Category tabs */}
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: '0',
            }}>
              {TABS.map(tab => {
                const count = tabCounts[tab.id] || 0
                const isActive = activeTab === tab.id
                if (tab.id !== 'all' && !count) return null
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: isActive ? `${ACCENT}18` : 'transparent',
                      border: isActive ? `1px solid ${ACCENT}55` : '1px solid transparent',
                      borderBottom: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                      borderRadius: '0.5rem 0.5rem 0 0',
                      color: isActive ? ACCENT : colors.textSecondary,
                      cursor: 'pointer',
                      padding: '0.5rem 0.9rem',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'color 0.15s',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span style={{
                        background: isActive ? ACCENT : colors.border,
                        color: isActive ? '#fff' : colors.textSecondary,
                        borderRadius: '0.9rem',
                        padding: '0.05rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Finding cards */}
            {displayedFindings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {displayedFindings.map((finding, i) => (
                  <FindingCard key={`${finding.patternId}-${i}`} finding={finding} colors={colors} />
                ))}
              </div>
            ) : (
              <CategoryEmpty category={activeTab} colors={colors} />
            )}

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '0.6rem',
              flexWrap: 'wrap',
              paddingTop: '0.25rem',
              borderTop: `1px solid ${colors.border}`,
            }}>
              <button
                onClick={handleCopySafe}
                style={{
                  ...btnBase,
                  background: '#22c55e',
                  color: '#fff',
                  boxShadow: '0 0 16px #22c55e33',
                }}
              >
                🧹 Copy Safe Version
              </button>
              <button
                onClick={handleCopyReport}
                style={{
                  ...btnBase,
                  background: `${ACCENT}14`,
                  border: `1px solid ${ACCENT}44`,
                  color: ACCENT,
                }}
              >
                📋 Copy Report
              </button>
              <button
                onClick={handleDownloadReport}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ⬇ Download Report
              </button>
            </div>
          </>
        )}
      </div>

      <Toast message={toast.message} visible={toast.visible} />

      <ToolSEOFooter
        heading="Data Leak Detector — Check If Your Emails & Passwords Were Exposed"
        paras={[
          "Data breaches happen constantly — millions of usernames, passwords, and email addresses are leaked online every year. Rafiqy's Data Leak Detector lets you check whether your email address or passwords appear in known breach databases, without ever sending your actual credentials to any server.",
          "Most breach-checking tools send your email or password hash directly to their API. Rafiqy uses a k-anonymity approach: only the first 5 characters of your password's SHA-1 hash are sent to the Have I Been Pwned API — making it mathematically impossible for the server to know your actual password.",
          "Beyond passwords, you can check if your email address has appeared in any known breach. The tool will show you which services were breached, when, and what types of data were exposed — giving you the information you need to decide whether to change your credentials.",
          "If your password appears in a breach database, change it immediately on every site where you use it. Enable two-factor authentication (2FA) wherever available. Use a unique password for every site — a password manager makes this easy.",
        ]}
        faqs={[
          { q: "Does this tool send my password to a server?", a: "No. Your full password never leaves your browser. Only the first 5 characters of its SHA-1 hash are sent to the Have I Been Pwned API (k-anonymity model). This makes it impossible for any server to reconstruct your password." },
          { q: "What is k-anonymity?", a: "K-anonymity is a privacy technique where only a partial hash prefix is sent to a remote server. The server returns all hashes starting with that prefix, and your browser checks for a full match locally. Your actual password is never transmitted." },
          { q: "My password appeared in a breach — what should I do?", a: "Change that password immediately on every site where you use it. Enable two-factor authentication (2FA). Consider using a unique password for each site with a password manager like Bitwarden or KeePass." },
          { q: "My email appeared in a breach — what data was exposed?", a: "The tool shows which service was breached and what data types were included (e.g. email, password, phone, address). If passwords were included, change your password on that service immediately." },
          { q: "Is this tool affiliated with Have I Been Pwned?", a: "No. Rafiqy is an independent tool that uses the public Have I Been Pwned API. Have I Been Pwned is a legitimate service run by security researcher Troy Hunt." },
        ]}
      />
    </ToolLayout>
  )
}
