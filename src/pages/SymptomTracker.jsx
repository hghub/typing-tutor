import { useState, useEffect, useCallback, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f97316'
const STORAGE_KEY = 'typely_symptoms'
const MAX_LOG = 30

const SYMPTOM_OPTIONS = [
  'Headache', 'Fatigue', 'Eye strain', 'Back pain', 'Neck pain',
  'Sore throat', 'Runny nose', 'Nausea', 'Dizziness', 'Anxiety',
  'Insomnia', 'Joint pain',
]

function severityEmoji(v) {
  if (v <= 3) return '😊'
  if (v <= 6) return '😐'
  return '😣'
}

function severityColor(v) {
  if (v <= 3) return '#22c55e'
  if (v <= 6) return '#eab308'
  return '#ef4444'
}

function nowLocalISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getContextHint(symptoms = [], weather = {}) {
  const s = symptoms.map((x) => x.toLowerCase())
  const { pressure, humidity, temp } = weather
  if (s.includes('headache') && pressure != null && pressure < 1010)
    return 'Low atmospheric pressure is commonly associated with tension headaches. Stay hydrated and rest.'
  if (s.includes('headache') && humidity != null && humidity > 80)
    return 'High humidity can trigger headaches. Ensure good ventilation.'
  if (s.includes('fatigue') && temp != null && temp > 35)
    return 'Heat fatigue is common in hot weather. Stay hydrated.'
  if (s.includes('eye strain'))
    return 'Remember the 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds.'
  if (s.includes('back pain') || s.includes('neck pain'))
    return 'A short walk or gentle stretching can help relieve these symptoms.'
  return 'Log consistently to spot patterns over time.'
}

function exportCSV(entries) {
  const header = 'Date,Time,Symptoms,Severity,Temp,Humidity,Pressure,Notes'
  const rows = entries.map((e) => {
    const d = new Date(e.timestamp)
    const date = d.toLocaleDateString()
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    const symptoms = `"${e.symptoms.join('; ')}"`
    const temp = e.weather?.temp != null ? e.weather.temp : ''
    const humidity = e.weather?.humidity != null ? e.weather.humidity : ''
    const pressure = e.weather?.pressure != null ? e.weather.pressure : ''
    const notes = `"${(e.notes || '').replace(/"/g, '""')}"`
    return [date, time, symptoms, e.severity, temp, humidity, pressure, notes].join(',')
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'typely_symptoms.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveLog(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Chip({ label, selected, onClick, colors }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.3rem 0.75rem',
        borderRadius: '9999px',
        border: `1.5px solid ${selected ? ACCENT : colors.inputBorder}`,
        background: selected ? ACCENT : colors.input,
        color: selected ? '#fff' : colors.text,
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.15s',
        userSelect: 'none',
        lineHeight: 1.4,
      }}
    >
      {label}
    </button>
  )
}

function WeatherCard({ weather, locationError, loading, colors }) {
  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
  }

  if (loading) {
    return (
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: colors.text }}>🌤 Local Weather Context</h3>
        <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0 }}>Fetching weather…</p>
      </div>
    )
  }

  if (locationError) {
    return (
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: colors.text }}>🌤 Local Weather Context</h3>
        <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0 }}>
          Location unavailable — weather context not shown
        </p>
      </div>
    )
  }

  if (!weather) return null

  const { temp, humidity, pressure, windspeed } = weather
  const lowPressure = pressure != null && pressure < 1010

  const metricStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  }
  const labelStyle = { fontSize: '0.72rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }
  const valueStyle = { fontSize: '1.05rem', fontWeight: 600, color: colors.text }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: colors.text, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        🌤 Local Weather Context
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
        <div style={metricStyle}>
          <span style={labelStyle}>Temperature</span>
          <span style={valueStyle}>{temp != null ? `${temp} °C` : '—'}</span>
        </div>
        <div style={metricStyle}>
          <span style={labelStyle}>Humidity</span>
          <span style={valueStyle}>{humidity != null ? `${humidity} %` : '—'}</span>
        </div>
        <div style={metricStyle}>
          <span style={labelStyle}>Air Pressure</span>
          <span style={{ ...valueStyle, color: lowPressure ? '#f97316' : colors.text }}>
            {pressure != null ? `${pressure} hPa` : '—'}
          </span>
          {lowPressure && (
            <span style={{ fontSize: '0.7rem', color: '#f97316', marginTop: '0.1rem' }}>
              Low — may affect headaches/joints
            </span>
          )}
        </div>
        <div style={metricStyle}>
          <span style={labelStyle}>Wind Speed</span>
          <span style={valueStyle}>{windspeed != null ? `${windspeed} km/h` : '—'}</span>
        </div>
      </div>
    </div>
  )
}

function HintCard({ hint, colors }) {
  if (!hint) return null
  return (
    <div style={{
      background: `${ACCENT}18`,
      border: `1px solid ${ACCENT}55`,
      borderRadius: '0.6rem',
      padding: '0.85rem 1rem',
      fontSize: '0.875rem',
      color: colors.text,
      display: 'flex',
      gap: '0.6rem',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>💡</span>
      <span>{hint}</span>
    </div>
  )
}

function EntryCard({ entry, onDelete, colors }) {
  const d = new Date(entry.timestamp)
  const { temp, humidity, pressure, windspeed } = entry.weather || {}

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1rem 1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
    }}>
      {/* Row 1: date + severity + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
          {formatDateTime(d.toISOString())}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: severityColor(entry.severity),
            color: '#fff',
            borderRadius: '9999px',
            padding: '0.15rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            {severityEmoji(entry.severity)} {entry.severity}/10
          </span>
          <button
            onClick={() => onDelete(entry.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.textSecondary,
              fontSize: '0.85rem',
              padding: '0.15rem 0.3rem',
              borderRadius: '0.3rem',
              lineHeight: 1,
            }}
            title="Delete entry"
            aria-label="Delete entry"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Row 2: symptom chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {entry.symptoms.map((s) => (
          <span key={s} style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: `${ACCENT}22`,
            border: `1px solid ${ACCENT}55`,
            color: ACCENT,
            fontSize: '0.75rem',
            fontWeight: 500,
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Row 3: weather snapshot */}
      {(temp != null || humidity != null || pressure != null) && (
        <div style={{ fontSize: '0.75rem', color: colors.textSecondary, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {temp != null && <span>🌡 {temp} °C</span>}
          {humidity != null && <span>💧 {humidity} %</span>}
          {pressure != null && <span>🌬 {pressure} hPa</span>}
          {windspeed != null && <span>💨 {windspeed} km/h</span>}
        </div>
      )}

      {/* Row 4: notes */}
      {entry.notes && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary, fontStyle: 'italic' }}>
          "{entry.notes}"
        </p>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SymptomTracker() {
  const { colors } = useTheme()

  // Form state
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(nowLocalISO)

  // Weather state
  const [weather, setWeather] = useState(null)
  const [locationError, setLocationError] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(true)

  // Log state
  const [log, setLog] = useState(loadLog)
  const [hint, setHint] = useState(null)

  // Responsive: track viewport width
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 700)
  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < 700)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Fetch weather on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true)
      setWeatherLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude: lat, longitude: lon } = coords
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relativehumidity_2m,surface_pressure,weathercode,windspeed_10m&timezone=auto`
          const res = await fetch(url)
          if (!res.ok) throw new Error('weather_fetch_failed')
          const data = await res.json()
          const c = data?.current ?? {}
          setWeather({
            temp: c.temperature_2m ?? null,
            humidity: c.relativehumidity_2m ?? null,
            pressure: c.surface_pressure ?? null,
            windspeed: c.windspeed_10m ?? null,
          })
        } catch {
          setLocationError(true)
        } finally {
          setWeatherLoading(false)
        }
      },
      () => {
        setLocationError(true)
        setWeatherLoading(false)
      },
      { timeout: 10000 }
    )
  }, [])

  const toggleSymptom = useCallback((s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }, [])

  const handleAdd = useCallback(() => {
    if (selectedSymptoms.length === 0) return
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date(timestamp).toISOString(),
      symptoms: selectedSymptoms,
      severity,
      notes: notes.trim(),
      weather: weather ?? { temp: null, humidity: null, pressure: null, windspeed: null },
    }
    const newLog = [entry, ...log].slice(0, MAX_LOG)
    setLog(newLog)
    saveLog(newLog)
    setHint(getContextHint(selectedSymptoms, weather ?? {}))
    // Reset form
    setSelectedSymptoms([])
    setSeverity(5)
    setNotes('')
    setTimestamp(nowLocalISO())
  }, [selectedSymptoms, severity, notes, timestamp, weather, log])

  const handleDelete = useCallback((id) => {
    const newLog = log.filter((e) => e.id !== id)
    setLog(newLog)
    saveLog(newLog)
  }, [log])

  const displayedLog = useMemo(() => log.slice(0, MAX_LOG), [log])

  // Shared input style
  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    color: colors.text,
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const sectionHeadingStyle = {
    fontSize: '1rem',
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 1rem',
  }

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.5rem',
  }

  const addDisabled = selectedSymptoms.length === 0

  return (
    <ToolLayout toolId="symptom-tracker">
      {/* Page heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: colors.text, margin: '0 0 0.4rem' }}>
          🩺 Symptom Tracker
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Correlate how you feel with your local environment and weather conditions.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div style={{
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '0.6rem',
        padding: '0.75rem 1rem',
        fontSize: '0.82rem',
        color: '#92400e',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
        lineHeight: 1.5,
      }}>
        <span style={{ flexShrink: 0 }}>⚠️</span>
        <span>
          This tracker is a personal wellness log — not a diagnostic tool. See a doctor if symptoms are severe or persistent.
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '1fr 320px',
        gap: '1.5rem',
        alignItems: 'start',
        marginBottom: '2rem',
      }}>
        {/* LEFT — Log form */}
        <div style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Log a Symptom</h2>

          {/* Symptom selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.5rem' }}>
              SYMPTOMS
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {SYMPTOM_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={selectedSymptoms.includes(s)}
                  onClick={() => toggleSymptom(s)}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Severity slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>SEVERITY</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: severityColor(severity) }}>
                {severity}/10 {severityEmoji(severity)}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: ACCENT,
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: colors.textSecondary, marginTop: '0.2rem' }}>
              <span>1 – Mild</span>
              <span>10 – Severe</span>
            </div>
          </div>

          {/* Date/time */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.5rem' }}>
              DATE &amp; TIME
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>NOTES (OPTIONAL)</span>
              <span style={{ fontWeight: 400 }}>{notes.length}/200</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Any context, triggers, or observations…"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={addDisabled}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: addDisabled ? colors.inputBorder : ACCENT,
              color: addDisabled ? colors.textSecondary : '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: addDisabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {addDisabled ? 'Select at least one symptom' : '+ Add to Log'}
          </button>
        </div>

        {/* RIGHT — Weather context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <WeatherCard
            weather={weather}
            locationError={locationError}
            loading={weatherLoading}
            colors={colors}
          />

          {/* Quick stats */}
          {log.length > 0 && (
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1.1rem 1.25rem',
            }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: colors.text }}>
                📊 Quick Stats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: colors.textSecondary }}>
                <span>Entries logged: <strong style={{ color: colors.text }}>{log.length}</strong></span>
                <span>
                  Most common:&nbsp;
                  <strong style={{ color: ACCENT }}>
                    {(() => {
                      const freq = {}
                      log.forEach((e) => e.symptoms.forEach((s) => { freq[s] = (freq[s] || 0) + 1 }))
                      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
                      return top ? top[0] : '—'
                    })()}
                  </strong>
                </span>
                <span>
                  Avg severity:&nbsp;
                  <strong style={{ color: colors.text }}>
                    {(log.reduce((s, e) => s + e.severity, 0) / log.length).toFixed(1)}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log section */}
      <div>
        {/* Log header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>
            Symptom Log
            {log.length > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', fontWeight: 500, color: colors.textSecondary }}>
                ({Math.min(log.length, MAX_LOG)} entries)
              </span>
            )}
          </h2>
          {log.length > 0 && (
            <button
              onClick={() => exportCSV(log)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '0.45rem',
                border: `1.5px solid ${ACCENT}`,
                background: 'transparent',
                color: ACCENT,
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              ⬇ Export CSV
            </button>
          )}
        </div>

        {/* Context hint */}
        <HintCard hint={hint} colors={colors} />

        {/* Entries */}
        {displayedLog.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.textSecondary,
            fontSize: '0.9rem',
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
            No entries yet — log your first symptom above
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayedLog.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                colors={colors}
              />
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
