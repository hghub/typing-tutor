import { useState, useEffect, useMemo, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
const ACCENT = '#f59e0b'
const STORAGE_KEY = 'typely_gold_rates'

// Weight conversions to grams
const UNITS = [
  { id: 'tola',   label: 'Tola',       toGrams: 11.664,  note: '1 tola = 11.664 g' },
  { id: 'gram',   label: 'Gram',       toGrams: 1,       note: '' },
  { id: 'masha',  label: 'Māsha',      toGrams: 0.972,   note: '12 māsha = 1 tola' },
  { id: 'ratti',  label: 'Ratti',      toGrams: 0.1215,  note: '8 ratti = 1 māsha' },
  { id: 'oz',     label: 'Troy Ounce', toGrams: 31.1035, note: '1 troy oz = 31.1035 g' },
  { id: 'kg',     label: 'Kilogram',   toGrams: 1000,    note: '' },
]

const PURITIES = [
  { karat: '24K', pct: 1.0 },
  { karat: '22K', pct: 0.9167 },
  { karat: '21K', pct: 0.875 },
  { karat: '18K', pct: 0.75 },
  { karat: '14K', pct: 0.5833 },
]

// Nisab thresholds in tola
const GOLD_NISAB_TOLA  = 7.5
const SILVER_NISAB_TOLA = 52.5

const fmt = (n) =>
  isNaN(n) || n === null
    ? '—'
    : 'Rs ' + Math.round(n).toLocaleString('en-PK')

const fmtNum = (n, dec = 4) =>
  isNaN(n) || n === null ? '—' : Number(n).toFixed(dec)

function toGrams(qty, unitId) {
  const u = UNITS.find((u) => u.id === unitId)
  return u ? qty * u.toGrams : 0
}

function toTola(grams) {
  return grams / 11.664
}

// Price per gram from price per tola
function pricePerGram(perTola) {
  return perTola / 11.664
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, colors, style = {} }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.25rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, colors, icon }) {
  return (
    <div style={{
      fontSize: '0.8rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: ACCENT,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </div>
  )
}

function FieldLabel({ children, colors }) {
  return (
    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: colors.muted, display: 'block', marginBottom: '0.3rem' }}>
      {children}
    </label>
  )
}

function NumberInput({ value, onChange, min = 0, step = 1, prefix, suffix, colors, isDark, style = {} }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...style }}>
      {prefix && (
        <span style={{ position: 'absolute', left: '0.65rem', fontSize: '0.82rem', color: colors.muted, pointerEvents: 'none', zIndex: 1 }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: `0.55rem ${suffix ? '2.8rem' : '0.75rem'} 0.55rem ${prefix ? '2.4rem' : '0.75rem'}`,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.6rem',
          color: colors.text,
          fontSize: '0.95rem',
          fontFamily: FONT,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: '0.65rem', fontSize: '0.78rem', color: colors.muted, pointerEvents: 'none' }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

function StatBox({ label, value, sub, accent = ACCENT, colors }) {
  return (
    <div style={{
      flex: 1,
      minWidth: '140px',
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: '0.875rem',
      padding: '1rem 1.1rem',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.muted, marginBottom: '0.3rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: accent, fontFamily: FONT }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: colors.muted, marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

function PillBtn({ active, onClick, children, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.3rem 0.85rem',
        borderRadius: '999px',
        border: active ? `1.5px solid ${ACCENT}` : `1px solid ${colors.border}`,
        background: active ? `${ACCENT}20` : 'transparent',
        color: active ? ACCENT : colors.muted,
        fontWeight: active ? 700 : 500,
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function Toggle({ checked, onChange, label, colors }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '36px',
          height: '20px',
          borderRadius: '999px',
          background: checked ? ACCENT : colors.border,
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: '0.82rem', color: colors.muted, fontWeight: 600 }}>{label}</span>
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoldPrice() {
  const { isDark, colors } = useTheme()

  // Rates
  const [goldRate, setGoldRate]     = useState(265000)
  const [silverRate, setSilverRate] = useState(3000)

  // Live API state
  const [liveUSD,    setLiveUSD]    = useState(null)   // USD per troy oz
  const [livePKR,    setLivePKR]    = useState(null)   // PKR per tola (auto-filled)
  const [apiStatus,  setApiStatus]  = useState('idle') // 'idle'|'loading'|'ok'|'error'
  const [liveTs,     setLiveTs]     = useState(null)   // Date of last successful fetch
  const [isManual,   setIsManual]   = useState(false)  // user overrode the live rate

  // Chart state
  const [goldChartData,    setGoldChartData]    = useState(null)
  const [goldChartLoading, setGoldChartLoading] = useState(false)
  const [goldChartError,   setGoldChartError]   = useState(null)

  // ── Live gold price fetch (CoinGecko, no API key, CORS-enabled) ────────────
  const fetchLiveRate = useCallback(async () => {
    setApiStatus('loading')
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd,pkr',
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const usd = data?.['pax-gold']?.usd
      const pkr = data?.['pax-gold']?.pkr
      if (!usd || !pkr) throw new Error('Bad response')
      const pkrPerTola = Math.round(pkr * (11.664 / 31.1035))
      setLiveUSD(usd)
      setLivePKR(pkrPerTola)
      setLiveTs(new Date())
      setGoldRate(pkrPerTola)
      setIsManual(false)
      setApiStatus('ok')
    } catch {
      setApiStatus('error')
    }
  }, [])

  // Fetch on mount + every 5 minutes
  useEffect(() => {
    fetchLiveRate()
    const id = setInterval(fetchLiveRate, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchLiveRate])

  // Fetch 7-day gold price chart from CoinGecko
  useEffect(() => {
    setGoldChartLoading(true)
    fetch('https://api.coingecko.com/api/v3/coins/pax-gold/market_chart?vs_currency=usd&days=7&interval=daily')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(data => {
        const prices = (data.prices || []).map(([, price]) => price)
        if (prices.length < 2) throw new Error('insufficient data')
        setGoldChartData(prices)
      })
      .catch(() => setGoldChartError(true))
      .finally(() => setGoldChartLoading(false))
  }, [])

  // "X min ago" helper
  const minutesAgo = liveTs
    ? Math.floor((Date.now() - liveTs.getTime()) / 60000)
    : null

  // ── Weight input ─────────────────────────────────────────────────────────
  const [weightQty,  setWeightQty]  = useState(1)
  const [weightUnit, setWeightUnit] = useState('tola')

  // Purity
  const [purity, setPurity] = useState('24K')

  // Making charges
  const [makingPct,  setMakingPct]  = useState(0)
  const [showMaking, setShowMaking] = useState(false)

  // Zakat
  const [zakatEnabled, setZakatEnabled] = useState(false)

  // Rate history
  const [rateHistory, setRateHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  const [showHistory, setShowHistory] = useState(false)

  // ── Derived values ──────────────────────────────────────────────────────────

  const selectedPurity = PURITIES.find((p) => p.karat === purity) || PURITIES[0]
  const weightInGrams  = useMemo(() => toGrams(Number(weightQty) || 0, weightUnit), [weightQty, weightUnit])
  const weightInTola   = useMemo(() => toTola(weightInGrams), [weightInGrams])

  const goldPricePerGram   = useMemo(() => pricePerGram(Number(goldRate)   || 0), [goldRate])
  const silverPricePerGram = useMemo(() => pricePerGram(Number(silverRate) || 0), [silverRate])

  const goldValue   = useMemo(() => goldPricePerGram   * weightInGrams * selectedPurity.pct, [goldPricePerGram, weightInGrams, selectedPurity])
  const silverValue = useMemo(() => silverPricePerGram * weightInGrams,                       [silverPricePerGram, weightInGrams])

  const makingChargeAmt = useMemo(() => goldValue * (Number(makingPct) / 100), [goldValue, makingPct])
  const totalJewellery  = useMemo(() => goldValue + makingChargeAmt,           [goldValue, makingChargeAmt])

  // Zakat
  const goldZakatDue   = useMemo(() => zakatEnabled && weightInTola >= GOLD_NISAB_TOLA,    [zakatEnabled, weightInTola])
  const silverZakatDue = useMemo(() => zakatEnabled && weightInTola >= SILVER_NISAB_TOLA,  [zakatEnabled, weightInTola])
  const goldZakatAmt   = useMemo(() => goldZakatDue   ? goldValue   * 0.025 : 0, [goldZakatDue, goldValue])
  const silverZakatAmt = useMemo(() => silverZakatDue ? silverValue * 0.025 : 0, [silverZakatDue, silverValue])

  // ── Weight breakdown for all units ─────────────────────────────────────────
  const weightBreakdown = useMemo(() => {
    if (!weightInGrams) return []
    return UNITS.map((u) => ({
      ...u,
      qty: weightInGrams / u.toGrams,
      goldVal:   goldPricePerGram   * weightInGrams * selectedPurity.pct,
      silverVal: silverPricePerGram * weightInGrams,
    }))
  }, [weightInGrams, goldPricePerGram, silverPricePerGram, selectedPurity])

  // ── Persist rate to history ─────────────────────────────────────────────────
  const saveRate = useCallback(() => {
    const entry = {
      ts: new Date().toISOString(),
      gold: Number(goldRate),
      silver: Number(silverRate),
      purity,
    }
    setRateHistory((prev) => {
      const next = [entry, ...prev].slice(0, 10)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [goldRate, silverRate, purity])

  // Auto-save when rates change (debounced via useEffect)
  useEffect(() => {
    const id = setTimeout(() => {
      if (Number(goldRate) > 0 || Number(silverRate) > 0) saveRate()
    }, 1500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldRate, silverRate])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ToolLayout toolId="gold-price">
      <div style={{ fontFamily: FONT, maxWidth: 800, margin: '0 auto' }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.4rem,3.5vw,2rem)',
            fontWeight: 800,
            margin: '0 0 0.35rem',
            background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            🪙 Gold &amp; Silver Price Calculator
          </h1>
          <p style={{ color: colors.muted, margin: 0, fontSize: '0.88rem' }}>
            Pakistan-focused · Tola / Masha / Ratti · Zakat · Making charges
          </p>
        </div>

        {/* ── Rate Entry ────────────────────────────────────────────────────── */}
        <SectionCard colors={colors}>
          <SectionTitle colors={colors} icon="📋">Today's Rates (PKR per Tola)</SectionTitle>

          {/* Live rate status bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.85rem', flexWrap: 'wrap',
          }}>
            {apiStatus === 'loading' && (
              <span style={{ fontSize: '0.77rem', color: ACCENT }}>⏳ Fetching live rate…</span>
            )}
            {apiStatus === 'ok' && liveUSD && (
              <>
                <span style={{
                  background: '#10b98120', color: '#10b981',
                  borderRadius: '99px', padding: '0.15rem 0.65rem',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                }}>● LIVE</span>
                <span style={{ fontSize: '0.77rem', color: colors.muted }}>
                  ${liveUSD.toLocaleString()} / troy oz (international)
                </span>
                <span style={{ fontSize: '0.72rem', color: colors.muted, marginLeft: 'auto' }}>
                  {minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`}
                  {' · '}
                  <button onClick={fetchLiveRate} style={{
                    background: 'none', border: 'none', color: ACCENT,
                    cursor: 'pointer', fontSize: '0.72rem', padding: 0,
                  }}>refresh</button>
                </span>
              </>
            )}
            {apiStatus === 'error' && (
              <span style={{ fontSize: '0.77rem', color: '#ef4444' }}>
                ⚠️ Live rate unavailable — enter manually
              </span>
            )}
            {isManual && apiStatus === 'ok' && (
              <span style={{
                background: '#f59e0b20', color: ACCENT,
                borderRadius: '99px', padding: '0.15rem 0.65rem',
                fontSize: '0.72rem', fontWeight: 700,
              }}>MANUAL OVERRIDE</span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <FieldLabel colors={colors}>Gold Rate / Tola</FieldLabel>
              <NumberInput
                value={goldRate}
                onChange={(v) => { setGoldRate(v); setIsManual(true) }}
                min={0}
                step={500}
                prefix="Rs"
                colors={colors}
                isDark={isDark}
              />
              {livePKR && !isManual && (
                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>
                  ✓ Auto-filled from live international rate
                </div>
              )}
              {isManual && (
                <button
                  onClick={() => { setGoldRate(livePKR || goldRate); setIsManual(false) }}
                  style={{
                    marginTop: '0.35rem', display: 'block', width: '100%',
                    background: 'none', border: `1px dashed ${ACCENT}`,
                    borderRadius: '0.4rem', padding: '0.3rem 0.5rem',
                    fontSize: '0.72rem', color: ACCENT, cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  ↺ Reset to live rate
                </button>
              )}
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <FieldLabel colors={colors}>Silver Rate / Tola</FieldLabel>
              <NumberInput
                value={silverRate}
                onChange={setSilverRate}
                min={0}
                step={50}
                prefix="Rs"
                colors={colors}
                isDark={isDark}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            background: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.06)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: '0.6rem',
            padding: '0.65rem 0.85rem',
            fontSize: '0.77rem',
            color: colors.muted,
            lineHeight: 1.6,
          }}>
            <span style={{ flexShrink: 0 }}>ℹ️</span>
            <span>
              Gold rate is auto-fetched from the international spot price (converted to PKR/tola).
              Local <em>sarafa bazar</em> rates vary by city — <strong style={{ color: colors.text }}>edit the Gold Rate field above to enter your city's rate</strong> (Lahore, Karachi, etc. may differ by Rs 500–2,000/tola).
              Silver rate is always manual — check your local market.
            </span>
          </div>
        </SectionCard>

        {/* ── Gold Price Trend Chart ─────────────────────────────────────────── */}
        {(goldChartLoading || goldChartData || goldChartError) && (
          <SectionCard colors={colors}>
            <SectionTitle colors={colors} icon="📈">7-day gold price trend (USD/oz)</SectionTitle>
            {goldChartLoading ? (
              <p style={{ color: colors.muted, fontSize: '0.85rem', margin: 0 }}>Loading chart…</p>
            ) : goldChartError ? (
              <p style={{ color: colors.muted, fontSize: '0.82rem', margin: 0 }}>No historical data available.</p>
            ) : goldChartData && (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <Sparkline data={goldChartData} color={ACCENT} width={300} height={60} />
                </div>
                {(() => {
                  const pct = ((goldChartData[goldChartData.length - 1] - goldChartData[0]) / goldChartData[0]) * 100
                  return (
                    <p style={{ fontSize: '0.78rem', color: pct >= 0 ? '#10b981' : '#ef4444', margin: '0.5rem 0 0', fontWeight: 600 }}>
                      {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}% over 7 days
                      {' · '}
                      <span style={{ color: colors.muted, fontWeight: 400 }}>
                        ${Math.round(goldChartData[0]).toLocaleString()} → ${Math.round(goldChartData[goldChartData.length - 1]).toLocaleString()} USD/oz
                      </span>
                    </p>
                  )
                })()}
              </>
            )}
          </SectionCard>
        )}

        {/* ── Weight Input + Purity ─────────────────────────────────────────── */}
        <SectionCard colors={colors}>
          <SectionTitle colors={colors} icon="⚖️">Weight &amp; Purity</SectionTitle>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <FieldLabel colors={colors}>Quantity</FieldLabel>
              <NumberInput
                value={weightQty}
                onChange={setWeightQty}
                min={0}
                step={0.001}
                colors={colors}
                isDark={isDark}
              />
            </div>
            <div style={{ flex: 2, minWidth: '260px' }}>
              <FieldLabel colors={colors}>Unit</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {UNITS.map((u) => (
                  <PillBtn
                    key={u.id}
                    active={weightUnit === u.id}
                    onClick={() => setWeightUnit(u.id)}
                    colors={colors}
                  >
                    {u.label}
                  </PillBtn>
                ))}
              </div>
              {UNITS.find((u) => u.id === weightUnit)?.note && (
                <div style={{ fontSize: '0.72rem', color: colors.muted, marginTop: '0.35rem' }}>
                  {UNITS.find((u) => u.id === weightUnit).note}
                </div>
              )}
            </div>
          </div>

          {/* Weight conversions mini-table */}
          {weightInGrams > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              marginBottom: '1rem',
            }}>
              {UNITS.map((u) => {
                const qty = weightInGrams / u.toGrams
                return (
                  <div key={u.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.74rem',
                    color: weightUnit === u.id ? ACCENT : colors.muted,
                    fontWeight: weightUnit === u.id ? 700 : 400,
                  }}>
                    {fmtNum(qty, 3)} {u.label}
                  </div>
                )
              })}
            </div>
          )}

          {/* Purity */}
          <div>
            <FieldLabel colors={colors}>Gold Purity (Karat)</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PURITIES.map((p) => (
                <PillBtn
                  key={p.karat}
                  active={purity === p.karat}
                  onClick={() => setPurity(p.karat)}
                  colors={colors}
                >
                  {p.karat} <span style={{ opacity: 0.7 }}>({(p.pct * 100).toFixed(2)}%)</span>
                </PillBtn>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Results ──────────────────────────────────────────────────────────*/}
        {weightInGrams > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '1.25rem' }}>
            <StatBox
              label={`Gold Value (${purity})`}
              value={fmt(goldValue)}
              sub={`${fmtNum(weightInGrams, 3)} g · ${fmtNum(weightInTola, 4)} tola`}
              accent={ACCENT}
              colors={colors}
            />
            <StatBox
              label="Silver Value"
              value={fmt(silverValue)}
              sub={`${fmtNum(weightInGrams, 3)} g (pure)`}
              accent="#94a3b8"
              colors={colors}
            />
          </div>
        )}

        {/* ── Gold vs Silver Comparison ─────────────────────────────────────── */}
        {weightInGrams > 0 && (
          <SectionCard colors={colors}>
            <SectionTitle colors={colors} icon="📊">Gold vs Silver — Same Weight</SectionTitle>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Gold bar */}
              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: ACCENT, marginBottom: '0.3rem' }}>
                  🥇 Gold ({purity})
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: colors.text }}>{fmt(goldValue)}</div>
                <div style={{ fontSize: '0.72rem', color: colors.muted }}>
                  Rs {Math.round(goldPricePerGram * selectedPurity.pct).toLocaleString('en-PK')} / g
                </div>
              </div>
              {/* Divider */}
              <div style={{ width: '1px', background: colors.border, margin: '0 0.25rem' }} />
              {/* Silver bar */}
              <div style={{ flex: 1, minWidth: '130px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  🥈 Silver (pure)
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: colors.text }}>{fmt(silverValue)}</div>
                <div style={{ fontSize: '0.72rem', color: colors.muted }}>
                  Rs {Math.round(silverPricePerGram).toLocaleString('en-PK')} / g
                </div>
              </div>
              {/* Ratio */}
              {silverValue > 0 && (
                <>
                  <div style={{ width: '1px', background: colors.border, margin: '0 0.25rem' }} />
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.muted, marginBottom: '0.3rem' }}>
                      Gold / Silver Ratio
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: colors.text }}>
                      {(goldValue / silverValue).toFixed(1)}×
                    </div>
                    <div style={{ fontSize: '0.72rem', color: colors.muted }}>gold is more expensive</div>
                  </div>
                </>
              )}
            </div>

            {/* Comparison bar */}
            {silverValue > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: colors.muted, marginBottom: '0.3rem' }}>
                  <span style={{ color: ACCENT }}>■ Gold {((goldValue / (goldValue + silverValue)) * 100).toFixed(0)}%</span>
                  <span style={{ color: '#94a3b8' }}>■ Silver {((silverValue / (goldValue + silverValue)) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    width: `${(goldValue / (goldValue + silverValue)) * 100}%`,
                    background: `linear-gradient(to right, ${ACCENT}, #fbbf24)`,
                    transition: 'width 0.4s ease',
                  }} />
                  <div style={{ flex: 1, background: 'linear-gradient(to right, #64748b, #94a3b8)' }} />
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Making Charges ────────────────────────────────────────────────── */}
        <SectionCard colors={colors}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMaking ? '1rem' : 0 }}>
            <SectionTitle colors={colors} icon="💍" style={{ margin: 0 }}>Making Charges</SectionTitle>
            <Toggle checked={showMaking} onChange={setShowMaking} label="Enable" colors={colors} />
          </div>

          {showMaking && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <FieldLabel colors={colors}>Making Charges %</FieldLabel>
                  <NumberInput
                    value={makingPct}
                    onChange={setMakingPct}
                    min={0}
                    max={100}
                    step={0.5}
                    suffix="%"
                    colors={colors}
                    isDark={isDark}
                  />
                </div>
                <div style={{ flex: 2, minWidth: '220px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                    <StatBox label="Making Charges" value={fmt(makingChargeAmt)} accent="#a78bfa" colors={colors} />
                    <StatBox label="Total Jewellery" value={fmt(totalJewellery)}  accent={ACCENT}   colors={colors} />
                  </div>
                </div>
              </div>
              {weightInGrams > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: colors.muted }}>
                  Gold value <strong style={{ color: ACCENT }}>{fmt(goldValue)}</strong>
                  &nbsp;+&nbsp;
                  making ({makingPct}%) <strong style={{ color: '#a78bfa' }}>{fmt(makingChargeAmt)}</strong>
                  &nbsp;=&nbsp;
                  <strong style={{ color: colors.text }}>{fmt(totalJewellery)}</strong>
                </div>
              )}
            </>
          )}
        </SectionCard>

        {/* ── Zakat Calculator ──────────────────────────────────────────────── */}
        <SectionCard colors={colors}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: zakatEnabled ? '1rem' : 0 }}>
            <SectionTitle colors={colors} icon="🌙" style={{ margin: 0 }}>Zakat Calculator</SectionTitle>
            <Toggle checked={zakatEnabled} onChange={setZakatEnabled} label="Enable" colors={colors} />
          </div>

          {zakatEnabled && (
            <>
              {/* Nisab info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  flex: 1, minWidth: '200px',
                  background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)',
                  border: `1px solid ${ACCENT}33`,
                  borderRadius: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.78rem',
                  color: colors.muted,
                  lineHeight: 1.6,
                }}>
                  <strong style={{ color: ACCENT }}>Gold Nisab:</strong> 7.5 tola ({(7.5 * 11.664).toFixed(2)} g)
                  <br />
                  <strong style={{ color: ACCENT }}>Silver Nisab:</strong> 52.5 tola ({(52.5 * 11.664).toFixed(2)} g)
                  <br />
                  <strong style={{ color: ACCENT }}>Zakat rate:</strong> 2.5% of total value
                </div>
              </div>

              {/* Gold Zakat */}
              <div style={{
                background: goldZakatDue
                  ? (isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)')
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: `1px solid ${goldZakatDue ? ACCENT + '44' : colors.border}`,
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: goldZakatDue ? ACCENT : colors.muted }}>
                      🥇 Gold Zakat {goldZakatDue ? '— Nisab Reached ✓' : `— Nisab NOT reached (need ≥ ${GOLD_NISAB_TOLA} tola)`}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: colors.muted, marginTop: '0.2rem' }}>
                      You have: {fmtNum(weightInTola, 4)} tola
                    </div>
                  </div>
                  {goldZakatDue && (
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: ACCENT }}>
                      {fmt(goldZakatAmt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Silver Zakat */}
              <div style={{
                background: silverZakatDue
                  ? (isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.06)')
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: `1px solid ${silverZakatDue ? '#94a3b8' + '66' : colors.border}`,
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: silverZakatDue ? '#94a3b8' : colors.muted }}>
                      🥈 Silver Zakat {silverZakatDue ? '— Nisab Reached ✓' : `— Nisab NOT reached (need ≥ ${SILVER_NISAB_TOLA} tola)`}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: colors.muted, marginTop: '0.2rem' }}>
                      You have: {fmtNum(weightInTola, 4)} tola
                    </div>
                  </div>
                  {silverZakatDue && (
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8' }}>
                      {fmt(silverZakatAmt)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: colors.muted, lineHeight: 1.6 }}>
                ⚠️ Zakat is calculated on the current market value at 2.5%. Consult a scholar for your full zakatable assets.
              </div>
            </>
          )}
        </SectionCard>

        {/* ── Unit Converter Table ──────────────────────────────────────────── */}
        {weightInGrams > 0 && (
          <SectionCard colors={colors}>
            <SectionTitle colors={colors} icon="🔄">Value in All Units (Gold {purity} · Silver)</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: FONT }}>
                <thead>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    {['Unit', 'Quantity', `Gold (${purity})`, 'Silver'].map((h) => (
                      <th key={h} style={{
                        padding: '0.6rem 0.9rem',
                        textAlign: h === 'Unit' || h === 'Quantity' ? 'left' : 'right',
                        color: colors.muted,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {UNITS.map((u, i) => {
                    const qty = weightInGrams / u.toGrams
                    const gVal  = goldPricePerGram   * weightInGrams * selectedPurity.pct
                    const sVal  = silverPricePerGram * weightInGrams
                    const isActive = weightUnit === u.id
                    return (
                      <tr
                        key={u.id}
                        style={{
                          background: isActive
                            ? (isDark ? `${ACCENT}11` : `${ACCENT}0a`)
                            : 'transparent',
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                        }}
                      >
                        <td style={{ padding: '0.55rem 0.9rem', color: isActive ? ACCENT : colors.text, fontWeight: isActive ? 700 : 400 }}>
                          {u.label}
                          {u.note && <span style={{ display: 'block', fontSize: '0.68rem', color: colors.muted, fontWeight: 400 }}>{u.note}</span>}
                        </td>
                        <td style={{ padding: '0.55rem 0.9rem', color: colors.muted }}>
                          {fmtNum(qty, 4)}
                        </td>
                        <td style={{ padding: '0.55rem 0.9rem', textAlign: 'right', color: ACCENT, fontWeight: 600 }}>
                          {fmt(gVal)}
                        </td>
                        <td style={{ padding: '0.55rem 0.9rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>
                          {fmt(sVal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* ── Rate History ─────────────────────────────────────────────────── */}
        <SectionCard colors={colors}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showHistory ? '1rem' : 0 }}>
            <SectionTitle colors={colors} icon="🕐" style={{ margin: 0 }}>Rate History (last 10)</SectionTitle>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={saveRate}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${ACCENT}55`,
                  background: isDark ? `${ACCENT}15` : `${ACCENT}10`,
                  color: ACCENT,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Save now
              </button>
              <button
                onClick={() => setShowHistory((h) => !h)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.muted,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                {showHistory ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showHistory && (
            <>
              {rateHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: colors.muted, fontSize: '0.82rem', padding: '1rem 0' }}>
                  No saved rates yet. Rates are auto-saved when you enter them.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: FONT }}>
                    <thead>
                      <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                        {['Date & Time', 'Purity', 'Gold / Tola', 'Silver / Tola'].map((h) => (
                          <th key={h} style={{
                            padding: '0.5rem 0.85rem',
                            textAlign: h === 'Date & Time' ? 'left' : 'right',
                            color: colors.muted,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            borderBottom: `1px solid ${colors.border}`,
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rateHistory.map((r, i) => {
                        const d = new Date(r.ts)
                        return (
                          <tr
                            key={i}
                            style={{
                              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                              background: i === 0 ? (isDark ? `${ACCENT}0a` : `${ACCENT}07`) : 'transparent',
                            }}
                          >
                            <td style={{ padding: '0.5rem 0.85rem', color: colors.muted, fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                              {d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {' '}
                              <span style={{ opacity: 0.7 }}>{d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
                              {i === 0 && (
                                <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: ACCENT, color: '#fff', borderRadius: '999px', padding: '0.1rem 0.4rem', fontWeight: 700 }}>
                                  latest
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: colors.text }}>{r.purity}</td>
                            <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: ACCENT, fontWeight: 600 }}>
                              Rs {(r.gold || 0).toLocaleString('en-PK')}
                            </td>
                            <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>
                              Rs {(r.silver || 0).toLocaleString('en-PK')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {rateHistory.length > 0 && (
                <button
                  onClick={() => {
                    setRateHistory([])
                    localStorage.removeItem(STORAGE_KEY)
                  }}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid #ef444433`,
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: FONT,
                  }}
                >
                  Clear history
                </button>
              )}
            </>
          )}
        </SectionCard>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <DisclaimerBlock
          type="financial"
          overrideBodyEn="This calculator uses manually entered rates and standard weight conversions. Gold and silver prices fluctuate daily — always verify today's rate with a certified jeweller or sarafa bazar before buying, selling, or calculating zakat. This tool does not constitute financial or religious advice."
        />

        {/* ── Static SEO reference section — always in HTML, no API needed ── */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text, margin: '0 0 0.75rem' }}>
            Gold Price in Pakistan — Reference Rates &amp; Guide
          </h2>
          <p style={{ fontSize: '0.85rem', color: colors.muted, margin: '0 0 1rem', lineHeight: 1.6 }}>
            Pakistan gold prices are derived from the international spot price (XAU/USD) converted to PKR.
            The table below shows typical reference ranges. Use the live tool above for today's exact rate.
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
                <tr style={{ background: `${ACCENT}15` }}>
                  {['Purity', 'Per Tola (PKR)', 'Per Gram (PKR)', 'Common Use'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.9rem', textAlign: 'left', color: colors.muted, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['24K — Pure Gold',     '~Rs 335,000–360,000', '~Rs 28,700–30,850', 'Bullion, investment'],
                  ['22K — Standard',      '~Rs 307,000–330,000', '~Rs 26,300–28,300', 'Pakistani jewellery'],
                  ['21K',                 '~Rs 293,000–315,000', '~Rs 25,100–27,000', 'Gulf-style jewellery'],
                  ['18K',                 '~Rs 252,000–270,000', '~Rs 21,600–23,100', 'Modern/hallmark gold'],
                ].map(([purity, tola, gram, use], i) => (
                  <tr key={purity} style={{ borderTop: `1px solid ${colors.border}`, background: i % 2 ? `${ACCENT}06` : 'transparent' }}>
                    <td style={{ padding: '0.55rem 0.9rem', color: colors.text, fontWeight: 600 }}>{purity}</td>
                    <td style={{ padding: '0.55rem 0.9rem', color: ACCENT, fontWeight: 700 }}>{tola}</td>
                    <td style={{ padding: '0.55rem 0.9rem', color: ACCENT, fontWeight: 700 }}>{gram}</td>
                    <td style={{ padding: '0.55rem 0.9rem', color: colors.muted }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[
              { title: 'How is gold price set in Pakistan?', body: 'Pakistan gold price = International XAU/USD spot price × PKR/USD rate. The All Pakistan Sarafa Gems &amp; Jewellers Association (APSGJA) announces rates daily based on interbank PKR and the London Bullion Market Association (LBMA) fix.' },
              { title: 'Tola vs gram — which to use?', body: '1 tola = 11.664 grams. Tola is the traditional unit used in Pakistani sarafa markets and for quoting gold prices. Most jewellers quote per tola. Internationally, troy ounce (31.1035 g) is standard.' },
              { title: 'Zakat on gold (Nisab)', body: 'Zakat (2.5%) is due on gold owned for one lunar year that meets the nisab threshold: 7.5 tola (87.48 g) for gold, or 52.5 tola for silver. The Zakat calculator above checks this automatically.' },
            ].map(({ title, body }) => (
              <div key={title} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '0.85rem 1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text, margin: '0 0 0.35rem' }}>{title}</p>
                <p style={{ fontSize: '0.77rem', color: colors.muted, margin: 0, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: colors.muted, margin: 0 }}>
            ⚠️ Reference rates above are approximate and for educational purposes only.
            Actual rates change daily — always use the live calculator above or check with your local sarafa market.
          </p>
        </div>

      </div>
    </ToolLayout>
  )
}
