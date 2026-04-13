import { useState, useMemo, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#0ea5e9'
const LS_KEY = 'typely_leak_log'

const REFRIGERANTS = [
  { value: 'R-22',       label: 'R-22 (HCFC)',       threshold: 15, type: 'HCFC' },
  { value: 'R-410A',     label: 'R-410A (HFC)',       threshold: 10, type: 'HFC' },
  { value: 'R-134a',     label: 'R-134a (HFC)',       threshold: 10, type: 'HFC' },
  { value: 'R-404A',     label: 'R-404A (HFC)',       threshold: 10, type: 'HFC' },
  { value: 'R-407C',     label: 'R-407C (HFC)',       threshold: 10, type: 'HFC' },
  { value: 'R-32',       label: 'R-32 (HFC)',         threshold: 10, type: 'HFC' },
  { value: 'R-600a',     label: 'R-600a (HC)',        threshold: 10, type: 'HC'  },
  { value: 'Other HFC',  label: 'Other HFC',          threshold: 10, type: 'HFC' },
  { value: 'Other HCFC', label: 'Other HCFC',         threshold: 15, type: 'HCFC'},
]

function getThreshold(refrigerantValue) {
  const r = REFRIGERANTS.find((x) => x.value === refrigerantValue)
  return r ? r.threshold : 10
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLog(entries) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(-10)))
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function SectionCard({ title, children, colors, accent, style }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      ...style,
    }}>
      {title && (
        <h2 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          color: accent || ACCENT,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

function InputRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.72 }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

function StyledInput({ colors, ...props }) {
  return (
    <input
      {...props}
      style={{
        background: colors.input,
        border: `1px solid ${colors.inputBorder}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    />
  )
}

function StyledSelect({ colors, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        background: colors.input,
        border: `1px solid ${colors.inputBorder}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function PrimaryButton({ onClick, children, disabled, colors, accent }) {
  const bg = accent || ACCENT
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? colors.border : bg,
        border: 'none',
        borderRadius: '0.5rem',
        color: disabled ? colors.textSecondary : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0.55rem 1.1rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

/* ── Collapsible ──────────────────────────────────────────────────────── */

function Collapsible({ title, colors, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: colors.text,
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.8rem', color: ACCENT }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function RefrigerantCalc() {
  const { isDark, colors } = useTheme()

  const [systemName, setSystemName]         = useState('')
  const [refrigerant, setRefrigerant]       = useState('R-410A')
  const [systemCharge, setSystemCharge]     = useState('')
  const [amountAdded, setAmountAdded]       = useState('')
  const [timePeriod, setTimePeriod]         = useState('12')
  const [systemType, setSystemType]         = useState('commercial')

  const [log, setLog] = useState(() => loadLog())

  /* ── Calculation ─────────────────────────────────────────────────── */
  const calc = useMemo(() => {
    const charge = parseFloat(systemCharge)
    const added  = parseFloat(amountAdded)
    const months = parseFloat(timePeriod)

    if (!charge || !added || !months || charge <= 0 || months <= 0 || added < 0) return null

    const isResidential = systemType === 'residential'
    const threshold = isResidential ? null : getThreshold(refrigerant)
    const leakRate = (added / charge) * (12 / months) * 100

    if (isResidential) {
      return { leakRate, threshold: null, isResidential: true }
    }

    const headroom = threshold - leakRate
    const ratio    = leakRate / threshold

    let status
    if (ratio >= 1)        status = 'action'
    else if (ratio >= 0.8) status = 'warning'
    else                   status = 'compliant'

    return { leakRate, threshold, headroom, ratio, status, isResidential: false }
  }, [systemCharge, amountAdded, timePeriod, refrigerant, systemType])

  /* ── Status banner colours ───────────────────────────────────────── */
  const statusMeta = useMemo(() => {
    if (!calc || calc.isResidential) return null
    if (calc.status === 'compliant') return { bg: '#16a34a22', border: '#16a34a55', color: '#16a34a', icon: '🟢', label: 'COMPLIANT' }
    if (calc.status === 'warning')   return { bg: '#ca8a0422', border: '#ca8a0455', color: '#ca8a04', icon: '🟡', label: 'WARNING'   }
    return                                  { bg: '#dc262622', border: '#dc262655', color: '#dc2626', icon: '🔴', label: 'ACTION REQUIRED' }
  }, [calc])

  /* ── Save to log ─────────────────────────────────────────────────── */
  const handleSave = useCallback(() => {
    if (!calc) return
    const entry = {
      date:       new Date().toLocaleDateString(),
      system:     systemName || '—',
      refrigerant,
      leakRate:   calc.leakRate.toFixed(1),
      status:     calc.isResidential ? 'Advisory' : (calc.status === 'compliant' ? 'Compliant' : calc.status === 'warning' ? 'Warning' : 'Action Required'),
    }
    const updated = [entry, ...log].slice(0, 10)
    setLog(updated)
    saveLog(updated)
  }, [calc, systemName, refrigerant, log])

  /* ── Export CSV ──────────────────────────────────────────────────── */
  const handleExport = useCallback(() => {
    if (!log.length) return
    const header = 'Date,System,Refrigerant,Leak Rate (%/yr),Status'
    const rows = log.map((e) => `${e.date},"${e.system}",${e.refrigerant},${e.leakRate},${e.status}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'refrigerant_leak_log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [log])

  /* ── Table shared styles ─────────────────────────────────────────── */
  const th = {
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    opacity: 0.65,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  }
  const td = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    borderBottom: `1px solid ${colors.border}`,
  }

  return (
    <ToolLayout toolId="refrigerant-calc">
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        color: colors.text,
        fontFamily: 'inherit',
      }}>

        {/* ── Page title ── */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: colors.text }}>
            🌡️ EPA Refrigerant Leak Rate Calculator
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: colors.textSecondary }}>
            Determine if a system's leak rate exceeds EPA mandatory-repair thresholds.
          </p>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{
          background: `${ACCENT}18`,
          border: `1px solid ${ACCENT}44`,
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          fontSize: '0.82rem',
          color: colors.textSecondary,
          lineHeight: 1.5,
        }}>
          ℹ️ <strong style={{ color: colors.text }}>Reference only.</strong> Always verify with current EPA regulations (40 CFR Part 82).
        </div>

        {/* ── Input card ── */}
        <SectionCard title="System Information" colors={colors}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <InputRow label="System / Equipment Name (optional)">
              <StyledInput
                colors={colors}
                type="text"
                placeholder="e.g. Rooftop Unit #3"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
              />
            </InputRow>

            <InputRow label="Refrigerant Type">
              <StyledSelect colors={colors} value={refrigerant} onChange={(e) => setRefrigerant(e.target.value)}>
                {REFRIGERANTS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </StyledSelect>
            </InputRow>
          </div>

          <h3 style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Refrigerant Amounts
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem' }}>
            <InputRow label="Full System Charge (lbs)">
              <StyledInput
                colors={colors}
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 50"
                value={systemCharge}
                onChange={(e) => setSystemCharge(e.target.value)}
              />
            </InputRow>

            <InputRow label="Refrigerant Added (lbs)">
              <StyledInput
                colors={colors}
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 5"
                value={amountAdded}
                onChange={(e) => setAmountAdded(e.target.value)}
              />
            </InputRow>

            <InputRow label="Time Period (months)">
              <StyledInput
                colors={colors}
                type="number"
                min="1"
                max="120"
                step="1"
                placeholder="12"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              />
            </InputRow>
          </div>

          <InputRow label="System Type">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { value: 'commercial', label: 'Commercial / Industrial' },
                { value: 'residential', label: 'Residential (< 50 lbs — advisory only)' },
              ].map((opt) => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="radio"
                    name="systemType"
                    value={opt.value}
                    checked={systemType === opt.value}
                    onChange={() => setSystemType(opt.value)}
                    style={{ accentColor: ACCENT, cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </InputRow>
        </SectionCard>

        {/* ── Results card ── */}
        <SectionCard title="Results" colors={colors}>
          {!calc ? (
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
              Enter system charge, refrigerant added, and time period above to see results.
            </p>
          ) : calc.isResidential ? (
            <div style={{
              background: '#ca8a0422',
              border: '1px solid #ca8a0455',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#ca8a04', fontSize: '1rem' }}>
                🟡 RESIDENTIAL ADVISORY
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: colors.textSecondary }}>
                EPA mandatory-repair rules (40 CFR Part 82) generally do not apply to systems with less than 50 lbs of charge. However, proper refrigerant handling is still required under Section 608.
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: colors.text }}>
                Calculated leak rate: <strong>{calc.leakRate.toFixed(1)}% / year</strong>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Status banner */}
              <div style={{
                background: statusMeta.bg,
                border: `1px solid ${statusMeta.border}`,
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{statusMeta.icon}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: statusMeta.color, letterSpacing: '0.04em' }}>
                  {statusMeta.label}
                </span>
              </div>

              {/* Metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <MetricTile
                  label="Calculated Leak Rate"
                  value={`${calc.leakRate.toFixed(1)}%`}
                  sub="per year"
                  big
                  colors={colors}
                  accent={statusMeta.color}
                />
                <MetricTile
                  label={`EPA Threshold (${refrigerant})`}
                  value={`${calc.threshold}%`}
                  sub="annual"
                  colors={colors}
                  accent={ACCENT}
                />
                <MetricTile
                  label="Headroom"
                  value={`${Math.abs(calc.headroom).toFixed(1)}%`}
                  sub={calc.headroom >= 0 ? 'below threshold' : 'OVER threshold'}
                  colors={colors}
                  accent={calc.headroom >= 0 ? '#16a34a' : '#dc2626'}
                />
                <MetricTile
                  label="Mandatory Repair Required"
                  value={calc.status === 'action' ? 'YES' : 'NO'}
                  colors={colors}
                  accent={calc.status === 'action' ? '#dc2626' : '#16a34a'}
                  big
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <PrimaryButton colors={colors} onClick={handleSave} disabled={!calc}>
                  💾 Save This Check
                </PrimaryButton>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── EPA Thresholds Reference ── */}
        <Collapsible title="📋 EPA Thresholds Reference" colors={colors}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={th}>Refrigerant Type</th>
                <th style={th}>System Type</th>
                <th style={th}>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['HCFCs (e.g. R-22)', 'Commercial / Industrial', '15% / year'],
                ['HFCs (e.g. R-410A, R-134a)', 'Commercial / Industrial', '10% / year'],
                ['Hydrocarbons (e.g. R-600a)', 'Commercial / Industrial', '10% / year'],
                ['Any', 'Residential (< 50 lbs charge)', 'N/A (advisory)'],
              ].map(([refType, sysType, threshold], i) => (
                <tr key={i}>
                  <td style={td}>{refType}</td>
                  <td style={td}>{sysType}</td>
                  <td style={{ ...td, fontWeight: 700, color: ACCENT }}>{threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: colors.textSecondary }}>
            Source: 40 CFR Part 82, Subpart F — Recycling and Emissions Reduction. Thresholds apply to appliances with ≥ 50 lbs of charge.
          </p>
        </Collapsible>

        {/* ── Log card ── */}
        <SectionCard title="Check Log" colors={colors}>
          {log.length === 0 ? (
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
              No checks saved yet. Fill in the inputs and click "Save This Check".
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '520px' }}>
                <thead>
                  <tr>
                    {['Date', 'System', 'Refrigerant', 'Leak Rate (%/yr)', 'Status'].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.map((entry, i) => (
                    <tr key={i}>
                      <td style={td}>{entry.date}</td>
                      <td style={td}>{entry.system}</td>
                      <td style={td}>{entry.refrigerant}</td>
                      <td style={{ ...td, fontWeight: 700, color: ACCENT }}>{entry.leakRate}%</td>
                      <td style={{
                        ...td,
                        fontWeight: 600,
                        color: entry.status === 'Compliant' ? '#16a34a'
                             : entry.status === 'Warning'   ? '#ca8a04'
                             : entry.status === 'Advisory'  ? '#ca8a04'
                             : '#dc2626',
                      }}>
                        {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <PrimaryButton colors={colors} onClick={handleExport} disabled={log.length === 0}>
              📥 Export CSV
            </PrimaryButton>
            {log.length > 0 && (
              <button
                onClick={() => { setLog([]); localStorage.removeItem(LS_KEY) }}
                style={{
                  background: '#ef444422',
                  border: '1px solid #ef444444',
                  borderRadius: '0.5rem',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                🗑️ Clear Log
              </button>
            )}
          </div>
        </SectionCard>

      </div>
    </ToolLayout>
  )
}

/* ── Metric tile ──────────────────────────────────────────────────────── */

function MetricTile({ label, value, sub, big, colors, accent }) {
  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '0.9rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontSize: big ? '2rem' : '1.5rem', fontWeight: 800, color: accent, lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: '0.75rem', color: accent, fontWeight: 600, opacity: 0.85 }}>
          {sub}
        </span>
      )}
    </div>
  )
}
