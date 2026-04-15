import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#10b981'
const CURRENCIES = [
  { code: 'PKR', symbol: 'PKR' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
]
const RISK_CHIPS = [0.5, 1, 2, 3]
const MAX_TRADES = 20
const LS_KEY = 'position-size-calc-journal'

function fmt(n, symbol) {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol}\u202f${formatted}`
}

function loadJournal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveJournal(trades) {
  localStorage.setItem(LS_KEY, JSON.stringify(trades))
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function SectionCard({ title, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h2 style={{
        margin: 0,
        fontSize: '1rem',
        fontWeight: 700,
        color: ACCENT,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function InputRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>
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
        background: colors.bg,
        border: `1px solid ${colors.border}`,
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
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function RiskMeter({ riskPercent, colors }) {
  const pct = Math.min(riskPercent, 4)
  const barWidth = (pct / 4) * 100

  let barColor = ACCENT
  if (riskPercent > 2) barColor = '#ef4444'
  else if (riskPercent > 1) barColor = '#f59e0b'

  const zones = [
    { label: '0–1% ✅', color: ACCENT, flex: 1 },
    { label: '1–2% ⚠️', color: '#f59e0b', flex: 1 },
    { label: '2%+ 🚨', color: '#ef4444', flex: 2 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: 0, borderRadius: '0.4rem', overflow: 'hidden', height: '8px', background: colors.border }}>
        {zones.map((z) => (
          <div key={z.label} style={{ flex: z.flex, background: z.color, opacity: 0.25 }} />
        ))}
      </div>
      <div style={{
        position: 'relative',
        height: '8px',
        background: colors.border,
        borderRadius: '0.4rem',
        overflow: 'hidden',
        marginTop: '-12px',
      }}>
        <div style={{
          width: `${barWidth}%`,
          height: '100%',
          background: barColor,
          borderRadius: '0.4rem',
          transition: 'width 0.3s ease, background 0.3s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
        {zones.map((z) => (
          <span key={z.label} style={{ fontSize: '0.65rem', color: z.color, fontWeight: 600 }}>{z.label}</span>
        ))}
      </div>
      <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '0.1rem' }}>
        Your risk: <strong style={{ color: barColor }}>{riskPercent}%</strong>
      </div>
    </div>
  )
}

function ResultGrid({ results, currencySymbol, colors }) {
  const items = [
    {
      label: 'Shares / Units',
      value: results.shares.toLocaleString(),
      large: true,
      color: ACCENT,
    },
    {
      label: 'Max Loss',
      value: fmt(results.riskAmount, currencySymbol),
      color: '#ef4444',
    },
    {
      label: 'Risk per Share',
      value: fmt(results.riskPerShare, currencySymbol),
      color: colors.text,
    },
    {
      label: 'Position Value',
      value: fmt(results.positionValue, currencySymbol),
      color: colors.text,
    },
    {
      label: 'Break-even',
      value: fmt(results.entryPrice, currencySymbol),
      color: colors.textSecondary,
    },
    ...(results.rrRatio !== null ? [{
      label: 'Risk / Reward',
      value: `1 : ${results.rrRatio}`,
      color: parseFloat(results.rrRatio) >= 2 ? ACCENT : '#f59e0b',
    }] : []),
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '0.75rem',
    }}>
      {items.map((item) => (
        <div key={item.label} style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          <span style={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {item.label}
          </span>
          <span style={{
            fontSize: item.large ? '1.6rem' : '1.1rem',
            fontWeight: 700,
            color: item.color,
            lineHeight: 1.1,
          }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function EducationCard({ colors }) {
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
          background: 'none',
          border: 'none',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: colors.text,
        }}
      >
        <span style={{ fontWeight: 700, color: ACCENT, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          💡 Why 1%?
        </span>
        <span style={{ color: colors.textSecondary, fontSize: '1rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            '🛡️ Risking only 1% per trade means you need 100 consecutive losses to wipe your account — giving you time to learn and adapt.',
            '📊 Professional traders rarely risk more than 1–2%. Consistent small losses are survivable; large ones are not.',
            '🔄 With 1% risk and a 2:1 R:R ratio, winning just 40% of trades keeps you profitable long-term.',
          ].map((point) => (
            <div key={point} style={{
              fontSize: '0.85rem',
              color: colors.textSecondary,
              lineHeight: 1.6,
              paddingLeft: '0.5rem',
              borderLeft: `3px solid ${ACCENT}`,
            }}>
              {point}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TradeJournal({ journal, onSave, onClear, colors, hasValidTrade }) {
  const cols = ['Date', 'Symbol', 'Entry', 'Stop', 'Size', 'Max Loss', 'R:R']
  return (
    <SectionCard title="Trade Journal" colors={colors}>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          onClick={onSave}
          disabled={!hasValidTrade}
          style={{
            background: hasValidTrade ? ACCENT : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: hasValidTrade ? '#fff' : colors.textSecondary,
            cursor: hasValidTrade ? 'pointer' : 'not-allowed',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          💾 Save this trade
        </button>
        <button
          onClick={onClear}
          disabled={journal.length === 0}
          style={{
            background: journal.length > 0 ? '#ef444422' : colors.border,
            border: `1px solid ${journal.length > 0 ? '#ef444444' : 'transparent'}`,
            borderRadius: '0.5rem',
            color: journal.length > 0 ? '#ef4444' : colors.textSecondary,
            cursor: journal.length > 0 ? 'pointer' : 'not-allowed',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          🗑 Clear all
        </button>
      </div>

      {journal.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c} style={{
                    textAlign: 'left',
                    padding: '0.4rem 0.6rem',
                    color: colors.textSecondary,
                    fontWeight: 600,
                    borderBottom: `1px solid ${colors.border}`,
                    whiteSpace: 'nowrap',
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {journal.map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '0.4rem 0.6rem', color: colors.textSecondary }}>{t.date}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: ACCENT, fontWeight: 600 }}>{t.symbol || '—'}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: colors.text }}>{t.entry}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: colors.text }}>{t.stop}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: colors.text, fontWeight: 600 }}>{t.size}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: '#ef4444', fontWeight: 600 }}>{t.maxLoss}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: colors.text }}>{t.rr || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: colors.textSecondary, textAlign: 'center', padding: '1rem 0' }}>
          No trades saved yet. Calculate a valid trade and hit "Save this trade".
        </div>
      )}
    </SectionCard>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function PositionSizeCalc() {
  const { isDark, colors } = useTheme()

  const [accountSize, setAccountSize] = useState('')
  const [currency, setCurrency] = useState('PKR')
  const [riskPercent, setRiskPercent] = useState('1')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [symbol, setSymbol] = useState('')
  const [journal, setJournal] = useState(loadJournal)

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? 'PKR'

  const results = useMemo(() => {
    const acc = parseFloat(accountSize)
    const risk = parseFloat(riskPercent)
    const entry = parseFloat(entryPrice)
    const stop = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)

    if (!acc || !risk || !entry || !stop || acc <= 0 || entry <= 0 || stop <= 0) return null

    const riskAmount = acc * (risk / 100)
    const riskPerShare = Math.abs(entry - stop)
    const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0
    const positionValue = shares * entry
    const rewardPerShare = !isNaN(tp) && tp > 0 ? Math.abs(tp - entry) : null
    const rrRatio = rewardPerShare && riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : null

    return { riskAmount, riskPerShare, shares, positionValue, rrRatio, entryPrice: entry }
  }, [accountSize, riskPercent, entryPrice, stopLoss, takeProfit])

  const hasValid = results !== null && results.shares > 0

  function handleSaveTrade() {
    if (!hasValid) return
    const trade = {
      date: new Date().toLocaleDateString('en-GB'),
      symbol: symbol.trim().toUpperCase() || '',
      entry: parseFloat(entryPrice).toFixed(4),
      stop: parseFloat(stopLoss).toFixed(4),
      size: results.shares.toLocaleString(),
      maxLoss: fmt(results.riskAmount, currencySymbol),
      rr: results.rrRatio ? `1 : ${results.rrRatio}` : null,
    }
    const updated = [trade, ...journal].slice(0, MAX_TRADES)
    setJournal(updated)
    saveJournal(updated)
  }

  function handleClearJournal() {
    setJournal([])
    saveJournal([])
  }

  return (
    <ToolLayout toolId="position-size-calc">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxWidth: '780px',
        margin: '0 auto',
        padding: '1rem',
        color: colors.text,
        fontFamily: 'inherit',
      }}>

        {/* ── Inputs ── */}
        <SectionCard title="Position Size Calculator" colors={colors}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>

            {/* Account Size + Currency */}
            <InputRow label="Account Size">
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <StyledInput
                  colors={colors}
                  type="number"
                  min="0"
                  placeholder="e.g. 100000"
                  value={accountSize}
                  onChange={(e) => setAccountSize(e.target.value)}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <StyledSelect
                  colors={colors}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ flexShrink: 0, width: '80px' }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </StyledSelect>
              </div>
            </InputRow>

            {/* Risk % */}
            <InputRow label="Risk %">
              <StyledInput
                colors={colors}
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                placeholder="e.g. 1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                {RISK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setRiskPercent(String(chip))}
                    style={{
                      background: parseFloat(riskPercent) === chip ? ACCENT : `${ACCENT}22`,
                      border: `1px solid ${parseFloat(riskPercent) === chip ? ACCENT : `${ACCENT}44`}`,
                      borderRadius: '0.4rem',
                      color: parseFloat(riskPercent) === chip ? '#fff' : ACCENT,
                      cursor: 'pointer',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {chip}%
                  </button>
                ))}
              </div>
            </InputRow>

            {/* Entry Price */}
            <InputRow label="Entry Price">
              <StyledInput
                colors={colors}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 150.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </InputRow>

            {/* Stop Loss */}
            <InputRow label="Stop Loss Price">
              <StyledInput
                colors={colors}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 145.00"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </InputRow>

            {/* Take Profit */}
            <InputRow label="Take Profit Price (optional)">
              <StyledInput
                colors={colors}
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 160.00"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
            </InputRow>

            {/* Symbol (for journal) */}
            <InputRow label="Symbol (for journal)">
              <StyledInput
                colors={colors}
                type="text"
                placeholder="e.g. AAPL, EURUSD"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </InputRow>
          </div>

          {/* Risk Meter */}
          {riskPercent && parseFloat(riskPercent) > 0 && (
            <div style={{ marginTop: '0.25rem' }}>
              <RiskMeter riskPercent={parseFloat(riskPercent)} colors={colors} />
            </div>
          )}
        </SectionCard>

        {/* ── Results ── */}
        {hasValid && (
          <SectionCard title="Results" colors={colors}>
            <ResultGrid results={results} currencySymbol={currencySymbol} colors={colors} />
          </SectionCard>
        )}

        {/* Not enough data hint */}
        {!hasValid && (accountSize || entryPrice || stopLoss) && (
          <div style={{
            background: `${ACCENT}11`,
            border: `1px solid ${ACCENT}33`,
            borderRadius: '0.75rem',
            padding: '0.85rem 1.1rem',
            fontSize: '0.85rem',
            color: colors.textSecondary,
          }}>
            Fill in Account Size, Risk %, Entry Price, and Stop Loss to see results.
          </div>
        )}

        {/* ── Trade Journal ── */}
        <TradeJournal
          journal={journal}
          onSave={handleSaveTrade}
          onClear={handleClearJournal}
          colors={colors}
          hasValidTrade={hasValid}
        />

        {/* ── Education ── */}
        <EducationCard colors={colors} />

        {/* ── Disclaimers ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <span>💾</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
              <strong style={{ color: colors.text }}>Trading journal stored locally.</strong>{' '}
              Your journal entries are saved in this browser's local storage. Clearing browser cache or cookies will permanently erase them. Export your records regularly.
            </p>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <span>🔌</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
              <strong style={{ color: colors.text }}>Manual entry only.</strong>{' '}
              Entry price and stop loss are entered manually. Broker API integration for live market prices can be added in the future if needed.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
