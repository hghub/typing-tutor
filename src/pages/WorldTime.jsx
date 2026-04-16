import { useState, useEffect, useRef, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,sans-serif'
const ACCENT = '#06b6d4'
const ACCENT_DARK = '#0891b2'
const PINS_KEY = 'typely_worldtime_pins'
const DEFAULT_PINS = ['Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York']

const ALL_CITIES = [
  { name: 'Karachi',     tz: 'Asia/Karachi',        flag: '🇵🇰', country: 'Pakistan' },
  { name: 'Lahore',      tz: 'Asia/Karachi',         flag: '🇵🇰', country: 'Pakistan' },
  { name: 'Dubai',       tz: 'Asia/Dubai',           flag: '🇦🇪', country: 'UAE' },
  { name: 'Riyadh',      tz: 'Asia/Riyadh',          flag: '🇸🇦', country: 'Saudi Arabia' },
  { name: 'London',      tz: 'Europe/London',        flag: '🇬🇧', country: 'UK' },
  { name: 'Berlin',      tz: 'Europe/Berlin',        flag: '🇩🇪', country: 'Germany' },
  { name: 'New York',    tz: 'America/New_York',     flag: '🇺🇸', country: 'USA' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles',  flag: '🇺🇸', country: 'USA' },
  { name: 'Chicago',     tz: 'America/Chicago',      flag: '🇺🇸', country: 'USA' },
  { name: 'Toronto',     tz: 'America/Toronto',      flag: '🇨🇦', country: 'Canada' },
  { name: 'Tokyo',       tz: 'Asia/Tokyo',           flag: '🇯🇵', country: 'Japan' },
  { name: 'Singapore',   tz: 'Asia/Singapore',       flag: '🇸🇬', country: 'Singapore' },
  { name: 'Sydney',      tz: 'Australia/Sydney',     flag: '🇦🇺', country: 'Australia' },
  { name: 'Paris',       tz: 'Europe/Paris',         flag: '🇫🇷', country: 'France' },
  { name: 'Istanbul',    tz: 'Europe/Istanbul',      flag: '🇹🇷', country: 'Turkey' },
  { name: 'Moscow',      tz: 'Europe/Moscow',        flag: '🇷🇺', country: 'Russia' },
  { name: 'Cairo',       tz: 'Africa/Cairo',         flag: '🇪🇬', country: 'Egypt' },
  { name: 'Nairobi',     tz: 'Africa/Nairobi',       flag: '🇰🇪', country: 'Kenya' },
  { name: 'Mumbai',      tz: 'Asia/Kolkata',         flag: '🇮🇳', country: 'India' },
  { name: 'Beijing',     tz: 'Asia/Shanghai',        flag: '🇨🇳', country: 'China' },
]

// ── helpers ──────────────────────────────────────────────────────────────────

function getTimeInTz(tz, referenceDate = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(referenceDate)
}

function getHourInTz(tz, referenceDate = new Date()) {
  const raw = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', hour12: false,
  }).format(referenceDate)
  return parseInt(raw, 10)
}

function getDateInTz(tz, referenceDate = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric',
  }).format(referenceDate)
}

function getOffsetHours(tz) {
  const now = new Date()
  const pktDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
  const tzDate  = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  return Math.round((tzDate - pktDate) / 3600000)
}

function isWorking(hour) { return hour >= 9 && hour < 18 }
function isDayTime(hour) { return hour >= 6 && hour < 18 }

function parseTimeInput(raw) {
  const s = raw.trim().toLowerCase()
  // Roman Urdu shorthands
  if (/^shaam/.test(s))   return { h: 18, m: 0 }
  if (/^raat/.test(s))    return { h: 21, m: 0 }
  if (/^subah/.test(s))   return { h: 8,  m: 0 }
  if (/^dopahar/.test(s)) return { h: 12, m: 0 }

  const match = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = match[2] ? parseInt(match[2], 10) : 0
  const ampm = match[3]
  if (ampm === 'pm' && h < 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  if (!ampm && h < 7) h += 12 // assume pm for ambiguous small numbers
  return { h, m }
}

function buildRefDate(h, m, sourceTz) {
  // Build a Date object representing h:m in sourceTz
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: sourceTz,
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const year  = parts.find(p => p.type === 'year').value
  const month = parts.find(p => p.type === 'month').value
  const day   = parts.find(p => p.type === 'day').value
  // Create ISO-like string, then subtract offset
  const localStr = `${year}-${month}-${day}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`
  // trick: use Date.parse on the local string, then compensate for UTC vs tz
  const probe = new Date(localStr) // treated as local browser time
  // adjust: find diff between browser tz and sourceTz
  const browserHour = probe.getHours()
  const tzHour = getHourInTz(sourceTz, probe)
  const diff = (tzHour - browserHour) * 3600000
  return new Date(probe.getTime() - diff)
}

function slotToDate(slot) {
  // slot 0‥47 representing 00:00‥23:30 PKT
  const h = Math.floor(slot / 2)
  const m = (slot % 2) * 30
  return buildRefDate(h, m, 'Asia/Karachi')
}

function cityByTz(tz) {
  return ALL_CITIES.find(c => c.tz === tz) || { name: tz, flag: '🌐', country: '' }
}

function pinnedCities(pins) {
  return pins.map(tz => {
    const city = cityByTz(tz)
    return { ...city, tz }
  })
}

function timePeriod(hour) {
  if (hour >= 5 && hour < 12)  return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

// ── CityCard ──────────────────────────────────────────────────────────────────

function CityCard({ city, referenceDate, onUnpin, colors, isDark }) {
  const hour   = getHourInTz(city.tz, referenceDate)
  const time   = getTimeInTz(city.tz, referenceDate)
  const date   = getDateInTz(city.tz, referenceDate)
  const offset = getOffsetHours(city.tz)
  const working = isWorking(hour)
  const daytime = isDayTime(hour)
  const offsetLabel = offset === 0 ? 'PKT' : offset > 0 ? `+${offset}h` : `${offset}h`

  return (
    <div style={{
      background: isDark
        ? (daytime ? colors.surface : 'rgba(79,70,229,0.08)')
        : colors.surface,
      border: `1px solid ${colors.border}`,
      borderLeft: working ? '3px solid #10b981' : `3px solid ${colors.border}`,
      borderRadius: 12,
      padding: '16px 18px',
      position: 'relative',
      fontFamily: FONT,
      transition: 'border-color 0.2s',
    }}>
      {/* unpin button */}
      <button
        onClick={() => onUnpin(city.tz)}
        title="Unpin city"
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'transparent', border: 'none',
          color: colors.muted, cursor: 'pointer', fontSize: 14, lineHeight: 1,
          padding: '2px 4px', borderRadius: 4,
        }}
      >×</button>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{city.flag}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>{city.name}</div>
          <div style={{ fontSize: 11, color: colors.muted }}>{city.country}</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 18 }}>{daytime ? '🌞' : '🌙'}</span>
      </div>

      {/* time */}
      <div style={{
        fontSize: 28, fontWeight: 800, letterSpacing: 1,
        color: working ? '#10b981' : colors.text, lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      }}>{time}</div>

      {/* date + offset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: colors.textSecondary }}>{date}</span>
        <span style={{
          fontSize: 11, color: working ? '#10b981' : colors.muted,
          background: working
            ? 'rgba(16,185,129,0.12)'
            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          padding: '1px 6px', borderRadius: 20, fontWeight: 600,
        }}>{offsetLabel}</span>
      </div>

      {/* working status */}
      <div style={{ marginTop: 6, fontSize: 11, color: working ? '#10b981' : colors.muted }}>
        {working ? '✅ Working hours' : '🔕 Outside working hours'}
      </div>
    </div>
  )
}

// ── TABS ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'clocks',    label: '🌍 World Clocks' },
  { id: 'converter', label: '🔄 Converter' },
  { id: 'timeline',  label: '⏱️ Timeline' },
  { id: 'meet',      label: '🤝 Best Time to Meet' },
]

// ═════════════════════════════════════════════════════════════════════════════
export default function WorldTime() {
  const { isDark, colors } = useTheme()

  // ── state ──
  const [now, setNow] = useState(new Date())
  const [tab, setTab] = useState('clocks')
  const [pins, setPins] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PINS_KEY))
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_PINS
    } catch { return DEFAULT_PINS }
  })
  const [showAddCity, setShowAddCity] = useState(false)
  const addCityRef = useRef(null)

  // Converter
  const [convInput, setConvInput]  = useState('')
  const [convTz, setConvTz]        = useState('Asia/Karachi')
  const [convResult, setConvResult] = useState(null)
  const [convError, setConvError]   = useState('')

  // Timeline
  const [sliderActive, setSliderActive] = useState(false)
  const [sliderVal, setSliderVal]       = useState(0)

  // Best time to meet
  const [meetCities, setMeetCities] = useState([])
  const [meetResult, setMeetResult] = useState(null)

  // Freelancer mode
  const [freelancerMode, setFreelancerMode]   = useState(false)
  const [freelancerCity, setFreelancerCity]    = useState('Europe/London')

  // ── live tick ──
  useEffect(() => {
    const id = setInterval(() => {
      if (!sliderActive) setNow(new Date())
    }, 1000)
    return () => clearInterval(id)
  }, [sliderActive])

  // ── persist pins ──
  useEffect(() => {
    localStorage.setItem(PINS_KEY, JSON.stringify(pins))
  }, [pins])

  // ── close add-city dropdown on outside click ──
  useEffect(() => {
    if (!showAddCity) return
    const handler = (e) => {
      if (addCityRef.current && !addCityRef.current.contains(e.target)) {
        setShowAddCity(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAddCity])

  const unpin = useCallback((tz) => {
    setPins(p => p.filter(x => x !== tz))
    setMeetCities(mc => mc.filter(x => x !== tz))
  }, [])

  const pin = useCallback((tz) => {
    setPins(p => p.includes(tz) ? p : [...p, tz])
    setShowAddCity(false)
  }, [])

  // reference date: live or slider
  const referenceDate = sliderActive ? slotToDate(sliderVal) : now

  // ── converter ──
  const runConverter = () => {
    setConvError('')
    setConvResult(null)
    const parsed = parseTimeInput(convInput)
    if (!parsed) { setConvError('Could not parse time. Try "3pm", "15:30", "shaam 7"'); return }
    const ref = buildRefDate(parsed.h, parsed.m, convTz)
    const results = pinnedCities(pins).map(city => {
      const h    = getHourInTz(city.tz, ref)
      const time = getTimeInTz(city.tz, ref)
      return { ...city, time, hour: h, working: isWorking(h), daytime: isDayTime(h) }
    })
    setConvResult(results)
  }

  // ── best time to meet ──
  const calcBestMeet = () => {
    if (meetCities.length < 2) { setMeetResult({ error: 'Pick at least 2 cities.' }); return }
    const cities = meetCities.map(tz => cityByTz(tz))
    const slots = []
    // Iterate 48 half-hour slots for today in PKT
    for (let s = 0; s < 48; s++) {
      const ref = slotToDate(s)
      const allWorking = meetCities.every(tz => {
        const h = getHourInTz(tz, ref)
        return isWorking(h)
      })
      if (allWorking) {
        slots.push({ slot: s, ref, cities: meetCities.map(tz => ({
          tz, city: cityByTz(tz), time: getTimeInTz(tz, ref)
        }))})
      }
    }
    if (slots.length === 0) { setMeetResult({ error: 'No overlapping working hours found for the selected cities.', slots: [] }); return }
    // Group consecutive slots into windows
    const windows = []
    let winStart = slots[0]
    let prev = slots[0].slot
    for (let i = 1; i <= slots.length; i++) {
      if (i === slots.length || slots[i].slot !== prev + 1) {
        windows.push({ start: winStart, end: slots[i - 1], len: (i > 0 ? i : 1) })
        if (i < slots.length) { winStart = slots[i]; prev = slots[i].slot }
      } else {
        prev = slots[i].slot
      }
    }
    const best = windows.sort((a, b) => b.len - a.len)[0]
    setMeetResult({ windows, best, cities })
  }

  // ── slider label ──
  const sliderH = Math.floor(sliderVal / 2)
  const sliderM = (sliderVal % 2) * 30
  const sliderLabel = `${String(sliderH).padStart(2,'0')}:${String(sliderM).padStart(2,'0')} PKT`

  // ── freelancer ──
  const fHour = getHourInTz(freelancerCity, now)
  const fTime = getTimeInTz(freelancerCity, now)
  const fCity = cityByTz(freelancerCity)
  const fPeriod = timePeriod(fHour)
  const fGood = isWorking(fHour)

  // ── styles ──
  const cardBase = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 24,
    fontFamily: FONT,
  }

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    color: colors.text,
    fontFamily: FONT,
    fontSize: 14,
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const btnStyle = (active) => ({
    background: active ? `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})` : colors.surface,
    color: active ? '#fff' : colors.text,
    border: `1px solid ${active ? ACCENT : colors.border}`,
    borderRadius: 8,
    padding: '8px 18px',
    cursor: 'pointer',
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.15s',
  })

  const unpinnedCities = ALL_CITIES.filter(c => !pins.includes(c.tz))

  return (
    <ToolLayout toolId="world-time">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 48px', fontFamily: FONT }}>

        {/* ── Hero Header ── */}
        <div style={{
          background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`,
          borderRadius: 16, padding: '28px 32px', marginBottom: 28, color: '#fff',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>🌍 World Time Smart Converter</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>
            Live clocks · Convert timezones · Find best meeting windows · Freelancer mode
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap',
          marginBottom: 24, borderBottom: `1px solid ${colors.border}`, paddingBottom: 12,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB: World Clocks
        ══════════════════════════════════════════════════════════ */}
        {tab === 'clocks' && (
          <div>
            {/* Freelancer Mode toggle */}
            <div style={{ ...cardBase, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFreelancerMode(m => !m)}
                  style={{
                    ...btnStyle(freelancerMode),
                    padding: '6px 14px', fontSize: 13,
                  }}
                >💼 {freelancerMode ? 'Freelancer Mode ON' : 'Freelancer Mode'}</button>

                {freelancerMode && (
                  <select
                    value={freelancerCity}
                    onChange={e => setFreelancerCity(e.target.value)}
                    style={{ ...inputStyle, width: 'auto' }}
                  >
                    {ALL_CITIES.map(c => (
                      <option key={c.tz + c.name} value={c.tz}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {freelancerMode && (
                <div style={{
                  marginTop: 14,
                  background: fGood
                    ? 'rgba(16,185,129,0.1)'
                    : isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${fGood ? '#10b981' : '#ef4444'}`,
                  borderRadius: 10, padding: '14px 18px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                    {fCity.flag} Your client is in <strong>{fCity.name}</strong>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: fGood ? '#10b981' : '#ef4444', marginBottom: 6 }}>
                    {fTime}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>
                    It's {fPeriod} there.{' '}
                    {fGood
                      ? <span style={{ color: '#10b981', fontWeight: 600 }}>Good time to reach out ✅</span>
                      : <span style={{ color: '#ef4444', fontWeight: 600 }}>Avoid — outside working hours ❌</span>}
                  </div>
                </div>
              )}
            </div>

            {/* City grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}>
              {pinnedCities(pins).map(city => (
                <CityCard
                  key={city.tz + city.name}
                  city={city}
                  referenceDate={referenceDate}
                  onUnpin={unpin}
                  colors={colors}
                  isDark={isDark}
                />
              ))}

              {/* Add city card */}
              <div ref={addCityRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowAddCity(s => !s)}
                  style={{
                    width: '100%', height: '100%', minHeight: 140,
                    background: 'transparent',
                    border: `2px dashed ${colors.border}`,
                    borderRadius: 12, cursor: 'pointer',
                    color: colors.muted, fontSize: 14, fontFamily: FONT,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <span style={{ fontSize: 28 }}>＋</span>
                  <span>Add City</span>
                </button>

                {showAddCity && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 100,
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10, padding: 8,
                    width: 220, maxHeight: 260, overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}>
                    {unpinnedCities.length === 0
                      ? <div style={{ padding: '8px 12px', color: colors.muted, fontSize: 13 }}>All cities pinned</div>
                      : unpinnedCities.map(c => (
                        <button
                          key={c.tz + c.name}
                          onClick={() => pin(c.tz)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', background: 'transparent',
                            border: 'none', padding: '7px 10px', cursor: 'pointer',
                            color: colors.text, fontFamily: FONT, fontSize: 13,
                            borderRadius: 6, textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: 16 }}>{c.flag}</span>
                          <span>{c.name}</span>
                          <span style={{ marginLeft: 'auto', color: colors.muted, fontSize: 11 }}>{c.country}</span>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: Converter
        ══════════════════════════════════════════════════════════ */}
        {tab === 'converter' && (
          <div>
            <div style={cardBase}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 16 }}>
                🔄 Convert Time Across Pinned Cities
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                    Time (e.g. 3pm, shaam 7, raat 9, 15:30)
                  </label>
                  <input
                    value={convInput}
                    onChange={e => setConvInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runConverter()}
                    placeholder="3pm, 15:30, shaam 7..."
                    style={inputStyle}
                  />
                </div>
                <div style={{ color: colors.muted, fontSize: 13, paddingBottom: 8 }}>in</div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                    Source Timezone
                  </label>
                  <select value={convTz} onChange={e => setConvTz(e.target.value)} style={inputStyle}>
                    {ALL_CITIES.map(c => (
                      <option key={c.tz + c.name} value={c.tz}>{c.flag} {c.name} ({c.tz})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={runConverter} style={{ ...btnStyle(true), padding: '10px 28px' }}>
                Convert →
              </button>

              {convError && (
                <div style={{ marginTop: 12, color: '#ef4444', fontSize: 13 }}>{convError}</div>
              )}
            </div>

            {convResult && (
              <div style={cardBase}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 14 }}>
                  Results
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
                    <thead>
                      <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        {['City', 'Local Time', 'Day/Night', 'Working Hours'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '8px 14px',
                            fontSize: 12, color: colors.muted, fontWeight: 600,
                            borderBottom: `1px solid ${colors.border}`,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {convResult.map((row, i) => (
                        <tr key={row.tz + i} style={{
                          borderBottom: `1px solid ${colors.border}`,
                          background: row.working
                            ? 'rgba(16,185,129,0.06)'
                            : 'transparent',
                        }}>
                          <td style={{ padding: '10px 14px', color: colors.text }}>
                            {row.flag} {row.name}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: row.working ? '#10b981' : colors.text, fontVariantNumeric: 'tabular-nums' }}>
                            {row.time}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 16 }}>
                            {row.daytime ? '🌞' : '🌙'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: row.working ? '#10b981' : colors.muted }}>
                            {row.working ? '✅ Working hours' : '🔕 Outside'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: Timeline Slider
        ══════════════════════════════════════════════════════════ */}
        {tab === 'timeline' && (
          <div>
            <div style={cardBase}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                ⏱️ Timeline Slider
              </div>
              <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>
                Drag to see what time it would be in all cities at a given PKT hour.
              </div>

              {/* Slider */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
                }}>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>PKT 00:00</span>
                  <span style={{
                    fontSize: 20, fontWeight: 800, color: ACCENT,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{sliderLabel}</span>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>PKT 23:30</span>
                </div>
                <input
                  type="range" min={0} max={47} value={sliderActive ? sliderVal : Math.round(
                    (now.getHours() * 60 + now.getMinutes()) / 30
                  )}
                  onChange={e => { setSliderActive(true); setSliderVal(Number(e.target.value)) }}
                  style={{ width: '100%', accentColor: ACCENT, cursor: 'pointer', height: 6 }}
                />
              </div>

              {sliderActive && (
                <button
                  onClick={() => setSliderActive(false)}
                  style={{ ...btnStyle(false), fontSize: 13, marginBottom: 20 }}
                >⟳ Back to current time</button>
              )}

              {/* City grid at slider time */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 14,
              }}>
                {pinnedCities(pins).map(city => (
                  <CityCard
                    key={city.tz + city.name}
                    city={city}
                    referenceDate={referenceDate}
                    onUnpin={unpin}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: Best Time to Meet
        ══════════════════════════════════════════════════════════ */}
        {tab === 'meet' && (
          <div>
            <div style={cardBase}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                🤝 Best Time to Meet
              </div>
              <div style={{ fontSize: 13, color: colors.muted, marginBottom: 18 }}>
                Select 2–4 cities. We'll find overlapping 9am–6pm working windows.
              </div>

              {/* City picker */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {pinnedCities(pins).map(city => {
                  const selected = meetCities.includes(city.tz)
                  return (
                    <button
                      key={city.tz + city.name}
                      onClick={() => setMeetCities(mc =>
                        selected
                          ? mc.filter(x => x !== city.tz)
                          : mc.length < 4 ? [...mc, city.tz] : mc
                      )}
                      style={{
                        background: selected ? `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})` : colors.surface,
                        color: selected ? '#fff' : colors.text,
                        border: `1px solid ${selected ? ACCENT : colors.border}`,
                        borderRadius: 20, padding: '6px 14px',
                        cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600,
                      }}
                    >
                      {city.flag} {city.name}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={calcBestMeet}
                disabled={meetCities.length < 2}
                style={{
                  ...btnStyle(meetCities.length >= 2),
                  opacity: meetCities.length < 2 ? 0.5 : 1,
                  padding: '10px 28px',
                }}
              >Find Best Meeting Time →</button>
            </div>

            {meetResult && (
              <div style={cardBase}>
                {meetResult.error && meetResult.slots?.length === 0 ? (
                  <div style={{ color: '#ef4444', fontSize: 14 }}>❌ {meetResult.error}</div>
                ) : meetResult.error ? (
                  <div style={{ color: '#ef4444', fontSize: 14 }}>❌ {meetResult.error}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 14 }}>
                      🏆 Best Meeting Window
                    </div>
                    <div style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid #10b981',
                      borderRadius: 10, padding: '16px 20px', marginBottom: 18,
                    }}>
                      <div style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>
                        {meetResult.best.len * 30} minutes of overlap starting at:
                      </div>
                      {meetResult.best.start.cities.map(c => (
                        <div key={c.tz} style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 2 }}>
                          {c.city.flag} {c.city.name}: {c.time}
                        </div>
                      ))}
                    </div>

                    {meetResult.windows.length > 1 && (
                      <>
                        <div style={{ fontSize: 13, color: colors.muted, marginBottom: 10 }}>
                          All available windows ({meetResult.windows.length}):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {meetResult.windows.slice(0, 6).map((w, i) => (
                            <div key={i} style={{
                              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                              border: `1px solid ${colors.border}`,
                              borderRadius: 8, padding: '10px 14px',
                            }}>
                              <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                                Window {i + 1} · {w.len * 30} min
                              </div>
                              {w.start.cities.map(c => (
                                <span key={c.tz} style={{ fontSize: 13, color: colors.text, marginRight: 16 }}>
                                  {c.city.flag} {c.city.name}: {c.time}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
