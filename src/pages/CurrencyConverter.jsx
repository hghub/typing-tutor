import { useState, useEffect, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#06b6d4'
const QUICK_CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'CAD', 'AUD']
const BASE_URL = 'https://open.er-api.com/v6/latest'

// Frankfurter only covers ECB currencies — skip chart fetch for unsupported pairs (PKR, AED, SAR etc.)
const FRANKFURTER_SUPPORTED = new Set([
  'AUD','BGN','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP',
  'HKD','HUF','IDR','ILS','INR','ISK','JPY','KRW','MXN','MYR',
  'NOK','NZD','PHP','PLN','RON','SEK','SGD','THB','TRY','USD','ZAR',
])



function Sparkline({ data, color = '#06b6d4', width = 300, height = 60 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`)
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="3" fill={color} />
    </svg>
  )
}

function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
}

export default function CurrencyConverter() {
  const { isDark, colors } = useTheme()

  const [amount, setAmount]         = useState('1')
  const [fromCurrency, setFrom]     = useState('USD')
  const [toCurrency, setTo]         = useState('PKR')
  const [result, setResult]         = useState(null)
  const [currencies, setCurrencies] = useState({})
  const [rates, setRates]           = useState({}) // cache rates keyed by base
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Chart state
  const [chartData,    setChartData]    = useState(null)
  const [chartDates,   setChartDates]   = useState([])
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError,   setChartError]   = useState(null)

  // Load rates for default base (USD) on mount — also gives us currency list
  useEffect(() => {
    fetch(`${BASE_URL}/USD`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load rates')
        return r.json()
      })
      .then((data) => {
        setRates(prev => ({ ...prev, USD: data.rates }))
        // Build currency name map from known currencies
        setCurrencies(data.rates) // keys only — we'll show code + known names
      })
      .catch(() => setError('Could not load exchange rates. Check your connection.'))
  }, [])

  const convert = useCallback(() => {
    const num = parseFloat(amount)
    if (!num || isNaN(num) || num <= 0) { setResult(null); return }
    if (fromCurrency === toCurrency) { setResult(num); setLastUpdated(new Date()); return }

    setLoading(true)
    setError(null)

    // Use cached rates if available, else fetch
    if (rates[fromCurrency]) {
      const rate = rates[fromCurrency][toCurrency]
      if (rate != null) {
        setResult(num * rate)
        setLastUpdated(new Date())
        setLoading(false)
        return
      }
    }

    fetch(`${BASE_URL}/${fromCurrency}`)
      .then((r) => {
        if (!r.ok) throw new Error('Conversion failed')
        return r.json()
      })
      .then((data) => {
        setRates(prev => ({ ...prev, [fromCurrency]: data.rates }))
        const rate = data.rates[toCurrency]
        setResult(rate != null ? parseFloat(amount) * rate : null)
        setLastUpdated(new Date())
      })
      .catch(() => setError('Conversion failed. Please try again.'))
      .finally(() => setLoading(false))
  }, [amount, fromCurrency, toCurrency, rates])

  useEffect(() => {
    const t = setTimeout(convert, 400)
    return () => clearTimeout(t)
  }, [convert])

  // Fetch 7-day historical data from Frankfurter API (ECB currencies only)
  useEffect(() => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
      setChartData(null); setChartDates([]); setChartError(null); return
    }
    // Skip fetch entirely for currencies not covered by Frankfurter/ECB — prevents CORS errors
    if (!FRANKFURTER_SUPPORTED.has(fromCurrency) || !FRANKFURTER_SUPPORTED.has(toCurrency)) {
      setChartData(null); setChartDates([]); setChartError(null); return
    }
    setChartLoading(true)
    setChartError(null)
    setChartData(null)
    const endDate   = new Date()
    const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000)
    const fmtDate   = d => d.toISOString().slice(0, 10)
    fetch(`https://api.frankfurter.app/${fmtDate(startDate)}..${fmtDate(endDate)}?from=${fromCurrency}&symbols=${toCurrency}`)
      .then(r => { if (!r.ok) throw new Error('unsupported'); return r.json() })
      .then(data => {
        const sorted = Object.keys(data.rates || {}).sort()
        const values = sorted.map(d => data.rates[d][toCurrency]).filter(v => v != null)
        if (sorted.length < 2 || values.length < 2) throw new Error('insufficient data')
        setChartDates(sorted)
        setChartData(values)
      })
      .catch(() => setChartError('no_data'))
      .finally(() => setChartLoading(false))
  }, [fromCurrency, toCurrency])

  const swap = useCallback(() => {
    setFrom(toCurrency)
    setTo(fromCurrency)
  }, [fromCurrency, toCurrency])

  // Shared input/select styles
  const inputBase = {
    background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '0.6rem',
    color: colors.text,
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  }

  const currencyOptions = Object.keys(currencies).sort().map((code) => (
    <option key={code} value={code}>{code}</option>
  ))

  return (
    <ToolLayout toolId="currency-converter">
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          background: `linear-gradient(to right, ${ACCENT}, #0ea5e9)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.4rem',
          letterSpacing: '-0.02em',
        }}>
          💱 Currency Converter
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Live exchange rates including PKR, AED, SAR and 150+ currencies — free, no API key.
        </p>
      </div>

      {/* ── Main card ── */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '1rem',
        padding: '1.75rem',
        maxWidth: '600px',
      }}>

        {/* Amount input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Amount
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount…"
            style={{
              ...inputBase,
              width: '100%',
              padding: '0.65rem 0.9rem',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = colors.border }}
          />
        </div>

        {/* From / Swap / To row */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          {/* From */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFrom(e.target.value)}
              style={{ ...inputBase, width: '100%', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = colors.border }}
            >
              {currencyOptions}
            </select>
          </div>

          {/* Swap button */}
          <button
            onClick={swap}
            title="Swap currencies"
            style={{
              flexShrink: 0,
              background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)',
              border: `1.5px solid ${ACCENT}44`,
              borderRadius: '0.6rem',
              color: ACCENT,
              padding: '0.6rem 0.75rem',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 700,
              lineHeight: 1,
              transition: 'all 0.15s ease',
              marginBottom: '0',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}22`; e.currentTarget.style.borderColor = ACCENT }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)'; e.currentTarget.style.borderColor = `${ACCENT}44` }}
          >
            ⇄
          </button>

          {/* To */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setTo(e.target.value)}
              style={{ ...inputBase, width: '100%', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = colors.border }}
            >
              {currencyOptions}
            </select>
          </div>
        </div>

        {/* ── Result display ── */}
        <div style={{
          background: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(6,182,212,0.05)',
          border: `1.5px solid ${ACCENT}33`,
          borderRadius: '0.85rem',
          padding: '1.5rem 1.25rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          minHeight: '5.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loading ? (
            <p style={{ color: colors.textSecondary, fontSize: '1rem', margin: 0 }}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚡</span>
              {' '}Fetching live rate…
            </p>
          ) : error ? (
            <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }}>⚠️ {error}</p>
          ) : result !== null ? (
            <>
              <p style={{ color: colors.textSecondary, fontSize: '0.8rem', margin: '0 0 0.35rem', fontWeight: 500 }}>
                {formatNumber(parseFloat(amount) || 0)} {fromCurrency} =
              </p>
              <p style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                fontWeight: 800,
                color: ACCENT,
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                {formatNumber(result)}
                <span style={{ fontSize: '0.45em', fontWeight: 600, marginLeft: '0.3em', opacity: 0.8 }}>{toCurrency}</span>
              </p>
            </>
          ) : (
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
              Enter an amount above to see the conversion.
            </p>
          )}
        </div>

        {/* Last updated */}
        {lastUpdated && !error && (
          <p style={{ color: colors.textSecondary, fontSize: '0.72rem', textAlign: 'center', margin: '0 0 1.25rem' }}>
            🕐 Rates fetched at {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* ── Trend Chart ── */}
        {(chartLoading || chartData || chartError) && (
          <div style={{
            marginBottom: '1.25rem',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.85rem',
            padding: '1rem 1.25rem',
          }}>
            <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, margin: '0 0 0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📈 7-day {fromCurrency}/{toCurrency} trend
            </p>
            {chartLoading ? (
              <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0 }}>Loading chart…</p>
            ) : chartError ? (
              <p style={{ color: colors.textSecondary, fontSize: '0.82rem', margin: 0 }}>No historical data for this pair.</p>
            ) : chartData && (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <Sparkline data={chartData} color={ACCENT} width={300} height={60} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', maxWidth: 300 }}>
                  {chartDates.map(d => (
                    <span key={d} style={{ fontSize: '0.62rem', color: colors.textSecondary }}>{parseInt(d.slice(8), 10)}</span>
                  ))}
                </div>
                {(() => {
                  const pct = ((chartData[chartData.length - 1] - chartData[0]) / chartData[0]) * 100
                  return (
                    <p style={{ fontSize: '0.78rem', color: pct >= 0 ? '#10b981' : '#ef4444', margin: '0.45rem 0 0', fontWeight: 600 }}>
                      {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}% over 7 days
                    </p>
                  )
                })()}
              </>
            )}
          </div>
        )}

        {/* ── Quick currency strip ── */}
        <div>
          <p style={{ color: colors.textSecondary, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.55rem' }}>
            Quick Select
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {QUICK_CURRENCIES.map((code) => {
              const isFrom = fromCurrency === code
              const isTo   = toCurrency === code
              const active = isFrom || isTo
              return (
                <button
                  key={code}
                  title={`Set as ${isFrom ? 'To' : 'From'} currency`}
                  onClick={() => {
                    if (isFrom) setTo(code)
                    else if (isTo) setFrom(code)
                    else setTo(code)
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '2rem',
                    border: `1.5px solid ${active ? ACCENT : colors.border}`,
                    background: active
                      ? isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.09)'
                      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    color: active ? ACCENT : colors.textSecondary,
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary } }}
                >
                  {code}
                  {isFrom && <span style={{ fontSize: '0.65em', marginLeft: '0.25em', opacity: 0.7 }}>FROM</span>}
                  {isTo   && <span style={{ fontSize: '0.65em', marginLeft: '0.25em', opacity: 0.7 }}>TO</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Subtle note */}
      <p style={{ color: colors.textSecondary, fontSize: '0.75rem', marginTop: '1rem', maxWidth: '600px' }}>
        ℹ️ Rates are updated daily via Open Exchange Rates API. Mid-market rates only — not for financial transactions.
      </p>

      {/* ── Static SEO reference section — always in HTML, no API needed ── */}
      <div style={{ maxWidth: '600px', marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text, margin: '0 0 0.75rem' }}>
          USD to PKR &amp; Key Exchange Rates — Reference Guide
        </h2>
        <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0 0 1rem', lineHeight: 1.6 }}>
          The Pakistani Rupee (PKR) fluctuates daily against major currencies. The table below shows
          typical reference ranges based on recent market data. Use the live converter above for today's exact rate.
        </p>

        <div style={{
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                {['Currency Pair', 'Approx. Rate (PKR)', 'Common Use'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.9rem', textAlign: 'left', color: colors.textSecondary, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['USD → PKR', '~278–282', 'Freelancing, imports'],
                ['AED → PKR', '~75–77',  'UAE remittances'],
                ['SAR → PKR', '~74–76',  'Saudi remittances'],
                ['GBP → PKR', '~350–360', 'UK transfers'],
                ['EUR → PKR', '~305–315', 'Europe trade'],
                ['CAD → PKR', '~200–205', 'Canada transfers'],
                ['AUD → PKR', '~175–180', 'Australia transfers'],
              ].map(([pair, rate, use], i) => (
                <tr key={pair} style={{ borderTop: `1px solid ${colors.border}`, background: i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)') }}>
                  <td style={{ padding: '0.55rem 0.9rem', color: colors.text, fontWeight: 600 }}>{pair}</td>
                  <td style={{ padding: '0.55rem 0.9rem', color: ACCENT, fontWeight: 700 }}>{rate}</td>
                  <td style={{ padding: '0.55rem 0.9rem', color: colors.textSecondary }}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.78rem', color: colors.textSecondary, lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          <strong style={{ color: colors.text }}>Why does PKR fluctuate?</strong> The PKR/USD rate is influenced
          by Pakistan's foreign exchange reserves, trade deficit, remittances from Pakistanis abroad
          (mainly UAE, Saudi Arabia, UK), and State Bank of Pakistan (SBP) policy.
          Remittances are Pakistan's largest foreign exchange source, exceeding $27 billion annually.
        </p>
        <p style={{ fontSize: '0.78rem', color: colors.textSecondary, lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: colors.text }}>Open market vs interbank rate:</strong> The interbank rate
          is set by SBP and used for official transactions. The open market rate (from money changers)
          may differ by Rs 1–5. For remittances via banks or services like Wise, use the live tool above
          to compare and pick the best rate.
        </p>
      </div>
    </ToolLayout>
  )
}
