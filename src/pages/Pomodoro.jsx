import { useState, useEffect, useRef, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const FONT = 'system-ui,-apple-system,sans-serif'

const MODES = [
  { id: 'work',       label: 'Focus',       emoji: '🍅', defaultMins: 25, color: '#ef4444' },
  { id: 'short',      label: 'Short Break', emoji: '☕', defaultMins: 5,  color: '#10b981' },
  { id: 'long',       label: 'Long Break',  emoji: '🛋️', defaultMins: 15, color: '#3b82f6' },
]

function beep(ctx, type = 'start') {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = type === 'start' ? 880 : 440
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
}

function pad(n) { return String(n).padStart(2, '0') }

export default function Pomodoro() {
  const { isDark, colors } = useTheme()
  const [mode, setMode] = useState('work')
  const [durations, setDurations] = useState({ work: 25, short: 5, long: 15 })
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('typely_pomodoro_sessions') || '[]') } catch { return [] }
  })
  const [showSettings, setShowSettings] = useState(false)
  const audioCtx = useRef(null)
  const intervalRef = useRef(null)

  const currentMode = MODES.find(m => m.id === mode)
  const totalSeconds = durations[mode] * 60
  const progress = 1 - secondsLeft / totalSeconds
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  // Update document title
  useEffect(() => {
    if (running) document.title = `${pad(mins)}:${pad(secs)} — ${currentMode.label} | Rafiqy`
    else document.title = 'Pomodoro Timer | Rafiqy'
    return () => { document.title = 'Rafiqy' }
  }, [running, mins, secs, currentMode.label])

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const startTimer = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
    beep(audioCtx.current, 'start')
    setRunning(true)
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setSecondsLeft(durations[mode] * 60)
  }, [stopTimer, durations, mode])

  const switchMode = useCallback((newMode) => {
    stopTimer()
    setMode(newMode)
    setSecondsLeft(durations[newMode] * 60)
  }, [stopTimer, durations])

  // Tick
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          beep(audioCtx.current, 'end')
          if (mode === 'work') {
            const today = new Date().toISOString().slice(0, 10)
            setSessions(prev => {
              const updated = [...prev, { date: today, completedAt: Date.now() }].slice(-100)
              localStorage.setItem('typely_pomodoro_sessions', JSON.stringify(updated))
              return updated
            })
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  // Today's count
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = sessions.filter(s => s.date === today).length
  const totalCount = sessions.length

  // SVG circle progress
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const updateDuration = (modeId, val) => {
    const v = Math.max(1, Math.min(120, Number(val)))
    setDurations(d => ({ ...d, [modeId]: v }))
    if (modeId === mode && !running) setSecondsLeft(v * 60)
  }

  return (
    <ToolLayout toolId="pomodoro">
      <div style={{ fontFamily: FONT, maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.25rem',
              background: `linear-gradient(to right, ${currentMode.color}, ${currentMode.color}aa)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>🍅 Pomodoro Timer</h1>
            <p style={{ color: colors.muted, margin: 0, fontSize: '0.85rem' }}>
              Focus in 25-min bursts. Take breaks. Stay sharp.
            </p>
          </div>
          <button onClick={() => setShowSettings(s => !s)} style={{
            padding: '0.4rem 0.75rem', borderRadius: '0.6rem', cursor: 'pointer',
            background: showSettings ? currentMode.color : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
            color: showSettings ? '#fff' : colors.muted, border: 'none', fontFamily: FONT, fontSize: '0.8rem',
          }}>⚙️ Settings</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '0.25rem', borderRadius: '0.75rem', width: 'fit-content' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => switchMode(m.id)} style={{
              padding: '0.45rem 1rem', borderRadius: '0.55rem', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: '0.82rem', fontWeight: mode === m.id ? 700 : 500,
              background: mode === m.id ? m.color : 'transparent',
              color: mode === m.id ? '#fff' : colors.muted,
              transition: 'all 0.15s',
            }}>{m.emoji} {m.label}</button>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Timer Durations (minutes)</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {MODES.map(m => (
                <div key={m.id} style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.78rem', color: colors.muted, display: 'block', marginBottom: '0.3rem' }}>{m.emoji} {m.label}</label>
                  <input type="number" min="1" max="120" value={durations[m.id]}
                    onChange={e => updateDuration(m.id, e.target.value)}
                    style={{
                      width: '100%', padding: '0.45rem 0.6rem',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      border: `1px solid ${colors.border}`, borderRadius: '0.5rem',
                      color: colors.text, fontFamily: FONT, fontSize: '0.9rem', outline: 'none',
                    }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timer circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <svg width="210" height="210" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="105" cy="105" r={radius}
              fill="none" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
              strokeWidth="10" />
            <circle cx="105" cy="105" r={radius}
              fill="none" stroke={currentMode.color}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }} />
          </svg>
          <div style={{ marginTop: '-125px', textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{ fontSize: '3.25rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: colors.text, lineHeight: 1 }}>
              {pad(mins)}:{pad(secs)}
            </div>
            <div style={{ fontSize: '0.85rem', color: colors.muted, marginTop: '0.35rem' }}>
              {currentMode.emoji} {currentMode.label}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <button onClick={resetTimer} style={{
            padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1px solid ${colors.border}`,
            background: 'transparent', color: colors.muted, cursor: 'pointer', fontFamily: FONT, fontSize: '0.875rem',
          }}>↺ Reset</button>
          <button onClick={running ? stopTimer : startTimer} style={{
            padding: '0.6rem 2rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
            background: currentMode.color, color: '#fff', fontFamily: FONT, fontSize: '1rem', fontWeight: 700,
            boxShadow: `0 4px 16px ${currentMode.color}44`, transition: 'all 0.15s',
          }}>
            {running ? '⏸ Pause' : secondsLeft === totalSeconds ? '▶ Start' : '▶ Resume'}
          </button>
        </div>

        {/* Session stats */}
        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: currentMode.color }}>{todayCount}</div>
            <div style={{ fontSize: '0.75rem', color: colors.muted, fontWeight: 600 }}>Today's Sessions</div>
          </div>
          <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: colors.text }}>{todayCount * durations.work}</div>
            <div style={{ fontSize: '0.75rem', color: colors.muted, fontWeight: 600 }}>Mins Focused Today</div>
          </div>
          <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '0.875rem', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: colors.text }}>{totalCount}</div>
            <div style={{ fontSize: '0.75rem', color: colors.muted, fontWeight: 600 }}>All-Time Sessions</div>
          </div>
        </div>

        {totalCount > 0 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button onClick={() => {
              if (window.confirm('Clear all session history?')) {
                setSessions([]); localStorage.removeItem('typely_pomodoro_sessions')
              }
            }} style={{ background: 'none', border: 'none', color: colors.muted, fontSize: '0.75rem', cursor: 'pointer', fontFamily: FONT }}>
              Clear history
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
