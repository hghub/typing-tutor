import { useState, useEffect, useCallback, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { supabase } from '../utils/supabase'

const STORAGE_KEY = 'typely_habits'
const ACCENT = '#10b981'
const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

const SESSION_KEY = 'typely_session_id'

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
]

const PRESET_EMOJIS = [
  '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '✍️',
  '🎯', '🧠', '🎵', '🌿', '🚴', '🏋️', '🙏', '⭐',
]

const FREQ_OPTIONS = [
  { id: 'daily', label: 'Every day' },
  { id: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { id: 'weekends', label: 'Weekends (Sat–Sun)' },
  { id: 'custom', label: 'Custom days' },
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayKey() {
  return toDateKey(new Date())
}

function isScheduledDay(habit, date) {
  const d = date instanceof Date ? date : new Date(date)
  const dow = d.getDay() // 0=Sun
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekdays') return dow >= 1 && dow <= 5
  if (habit.frequency === 'weekends') return dow === 0 || dow === 6
  if (habit.frequency === 'custom') return (habit.customDays || []).includes(dow)
  return false
}

function computeStreaks(habit) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completions = habit.completions || {}

  let current = 0
  let longest = 0
  let running = 0

  // Walk backwards from today
  const cursor = new Date(today)
  // Find when habit was created
  const createdAt = habit.createdAt ? new Date(habit.createdAt) : new Date(0)
  createdAt.setHours(0, 0, 0, 0)

  // Current streak: unbroken run of completed scheduled days ending today (or yesterday if today not yet done)
  let checkingCurrent = true
  for (let i = 0; i < 365; i++) {
    const key = toDateKey(cursor)
    const scheduled = isScheduledDay(habit, cursor)
    const done = !!completions[key]

    if (cursor < createdAt) break

    if (scheduled) {
      const isPast = cursor < today
      const isToday = cursor.getTime() === today.getTime()

      if (checkingCurrent) {
        if (done) {
          current++
        } else if (isToday) {
          // Today not yet done — streak still intact from yesterday
        } else if (isPast) {
          checkingCurrent = false
        }
      }
    }

    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak: scan all days from creation
  const allDays = []
  const scan = new Date(createdAt)
  while (scan <= today) {
    allDays.push(new Date(scan))
    scan.setDate(scan.getDate() + 1)
  }

  let streak = 0
  for (const d of allDays) {
    if (isScheduledDay(habit, d)) {
      if (completions[toDateKey(d)]) {
        streak++
        if (streak > longest) longest = streak
      } else {
        const isPast = d < today
        if (isPast) streak = 0
      }
    }
  }

  return { current, longest }
}

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 88, stroke = 7, color = ACCENT, bg = 'rgba(255,255,255,0.07)', label }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}
          fill="#fff"
          fontSize={size < 60 ? 11 : 15}
          fontWeight={700}
          fontFamily={FONT}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      {label && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: size }}>{label}</span>}
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function HabitHeatmap({ habit, year, month, colors }) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const today = todayKey()
  const completions = habit.completions || {}

  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = toDateKey(date)
    const scheduled = isScheduledDay(habit, date)
    const done = !!completions[key]
    const isFuture = key > today
    cells.push({ d, key, scheduled, done, isFuture })
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '4px',
      }}>
        {DAY_NAMES_SHORT.map((n, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.6rem', color: colors.muted, fontWeight: 600 }}>{n}</div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
      }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} />
          let bg = colors.border
          if (cell.isFuture) bg = 'transparent'
          else if (cell.done) bg = habit.color || ACCENT
          else if (cell.scheduled) bg = colors.surface
          const isToday = cell.key === today
          return (
            <div
              key={cell.key}
              title={`${cell.d}: ${cell.done ? 'Done' : cell.scheduled ? 'Missed' : 'Not scheduled'}`}
              style={{
                aspectRatio: '1',
                borderRadius: '3px',
                background: bg,
                border: isToday ? `1.5px solid ${habit.color || ACCENT}` : `1px solid ${cell.done ? 'transparent' : colors.border}`,
                opacity: cell.isFuture ? 0.2 : 1,
                transition: 'background 0.2s',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyStats({ habit, colors }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completions = habit.completions || {}

  // Compute completion rate per day-of-week over last 30 days
  const counts = Array(7).fill(0)
  const scheduled = Array(7).fill(0)

  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    if (isScheduledDay(habit, d)) {
      scheduled[dow]++
      if (completions[toDateKey(d)]) counts[dow]++
    }
  }

  const rates = counts.map((c, i) => scheduled[i] > 0 ? c / scheduled[i] : null)
  const maxRate = Math.max(...rates.filter(r => r !== null), 0.01)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '56px' }}>
      {rates.map((rate, dow) => {
        const barH = rate !== null ? Math.max(4, (rate / maxRate) * 48) : 0
        return (
          <div key={dow} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <div
              title={rate !== null ? `${DAY_NAMES[dow]}: ${Math.round(rate * 100)}%` : `${DAY_NAMES[dow]}: not scheduled`}
              style={{
                width: '100%',
                height: `${barH}px`,
                background: rate !== null ? (habit.color || ACCENT) : colors.surface,
                borderRadius: '3px 3px 0 0',
                opacity: rate !== null ? (0.4 + rate * 0.6) : 0.2,
                transition: 'height 0.3s ease',
              }}
            />
            <span style={{ fontSize: '0.58rem', color: colors.muted }}>{DAY_NAMES_SHORT[dow]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
function HabitModal({ habit, onSave, onClose, colors }) {
  const [name, setName] = useState(habit?.name || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '⭐')
  const [color, setColor] = useState(habit?.color || ACCENT)
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily')
  const [customDays, setCustomDays] = useState(habit?.customDays || [1, 2, 3, 4, 5])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const toggleDay = (dow) => {
    setCustomDays(prev => prev.includes(dow) ? prev.filter(d => d !== dow) : [...prev, dow])
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: habit?.id || genId(),
      name: name.trim(),
      emoji,
      color,
      frequency,
      customDays: frequency === 'custom' ? customDays : [],
      completions: habit?.completions || {},
      archived: habit?.archived || false,
      createdAt: habit?.createdAt || new Date().toISOString(),
    })
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }

  const modal = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    fontFamily: FONT,
  }

  const label = { fontSize: '0.8rem', color: colors.textSecondary, marginBottom: '0.3rem', display: 'block', fontWeight: 600 }
  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.inputBorder}`,
    background: colors.input,
    color: colors.text,
    fontSize: '0.9rem',
    fontFamily: FONT,
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: colors.text, fontWeight: 700 }}>
          {habit ? '✏️ Edit Habit' : '➕ New Habit'}
        </h2>

        {/* Name */}
        <div>
          <span style={label}>Habit name</span>
          <input
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning run"
            maxLength={50}
            autoFocus
          />
        </div>

        {/* Emoji */}
        <div>
          <span style={label}>Emoji icon</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              style={{
                fontSize: '1.6rem', width: '2.8rem', height: '2.8rem',
                borderRadius: '0.5rem', border: `1px solid ${colors.inputBorder}`,
                background: colors.input, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >{emoji}</button>
            <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>Tap to pick</span>
          </div>
          {showEmojiPicker && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem',
              background: colors.surface, borderRadius: '0.5rem', padding: '0.5rem',
              border: `1px solid ${colors.border}`,
            }}>
              {PRESET_EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => { setEmoji(em); setShowEmojiPicker(false) }}
                  style={{
                    fontSize: '1.4rem', width: '2.2rem', height: '2.2rem',
                    borderRadius: '0.4rem', border: em === emoji ? `2px solid ${ACCENT}` : '1px solid transparent',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{em}</button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <span style={label}>Color</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '2rem', height: '2rem', borderRadius: '50%',
                  background: c, border: c === color ? `3px solid ${colors.text}` : `2px solid transparent`,
                  cursor: 'pointer', outline: c === color ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <span style={label}>Frequency</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {FREQ_OPTIONS.map(opt => (
              <label
                key={opt.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  cursor: 'pointer', padding: '0.45rem 0.7rem',
                  borderRadius: '0.4rem',
                  background: frequency === opt.id ? `${color}22` : 'transparent',
                  border: `1px solid ${frequency === opt.id ? color : colors.border}`,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="freq"
                  value={opt.id}
                  checked={frequency === opt.id}
                  onChange={() => setFrequency(opt.id)}
                  style={{ accentColor: color }}
                />
                <span style={{ fontSize: '0.85rem', color: colors.text }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {frequency === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              {DAY_NAMES.map((name, dow) => (
                <button
                  key={dow}
                  onClick={() => toggleDay(dow)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '0.4rem',
                    border: `1.5px solid ${customDays.includes(dow) ? color : colors.border}`,
                    background: customDays.includes(dow) ? color : colors.input,
                    color: customDays.includes(dow) ? '#fff' : colors.text,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: FONT,
                  }}
                >{name}</button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`, background: 'transparent',
              color: colors.text, cursor: 'pointer', fontSize: '0.85rem', fontFamily: FONT,
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: '0.5rem',
              border: 'none', background: name.trim() ? color : colors.border,
              color: '#fff', cursor: name.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT,
              transition: 'background 0.15s',
            }}
          >Save</button>
        </div>
      </div>
    </div>
  )
}

// ── Habit Detail Panel ────────────────────────────────────────────────────────
function HabitDetail({ habit, onClose, onEdit, onArchive, onDelete, colors }) {
  const [heatYear, setHeatYear] = useState(new Date().getFullYear())
  const [heatMonth, setHeatMonth] = useState(new Date().getMonth())
  const { current, longest } = useMemo(() => computeStreaks(habit), [habit])

  const monthLabel = new Date(heatYear, heatMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (heatMonth === 0) { setHeatMonth(11); setHeatYear(y => y - 1) }
    else setHeatMonth(m => m - 1)
  }
  const nextMonth = () => {
    const now = new Date()
    if (heatYear > now.getFullYear() || (heatYear === now.getFullYear() && heatMonth >= now.getMonth())) return
    if (heatMonth === 11) { setHeatMonth(0); setHeatYear(y => y + 1) }
    else setHeatMonth(m => m + 1)
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999, padding: '1rem',
  }

  const panel = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '92vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: FONT,
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={panel}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{habit.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: colors.text }}>{habit.name}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                {FREQ_OPTIONS.find(f => f.id === habit.frequency)?.label}
                {habit.archived && ' · Archived'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: colors.muted }}>✕</button>
        </div>

        {/* Streak counters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: '🔥 Current Streak', value: `${current} day${current !== 1 ? 's' : ''}` },
            { label: '🏆 Longest Streak', value: `${longest} day${longest !== 1 ? 's' : ''}` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: colors.surface, borderRadius: '0.75rem',
              padding: '0.85rem 1rem', border: `1px solid ${colors.border}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', color: colors.textSecondary, marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: habit.color || ACCENT }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Weekly stats */}
        <div style={{ background: colors.surface, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.75rem' }}>
            📊 Day-of-week rate (last 30 days)
          </div>
          <WeeklyStats habit={habit} colors={colors} />
        </div>

        {/* Heatmap */}
        <div style={{ background: colors.surface, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary }}>🗓 Monthly Heatmap</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={prevMonth} style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: '0.3rem', cursor: 'pointer', color: colors.text, padding: '2px 8px', fontSize: '0.8rem' }}>‹</button>
              <span style={{ fontSize: '0.78rem', color: colors.text, minWidth: '110px', textAlign: 'center' }}>{monthLabel}</span>
              <button onClick={nextMonth} style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: '0.3rem', cursor: 'pointer', color: colors.text, padding: '2px 8px', fontSize: '0.8rem' }}>›</button>
            </div>
          </div>
          <HabitHeatmap habit={habit} year={heatYear} month={heatMonth} colors={colors} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.68rem', color: colors.muted }}>Less</span>
            {[0.15, 0.4, 0.65, 0.85, 1].map(op => (
              <div key={op} style={{ width: '11px', height: '11px', borderRadius: '2px', background: habit.color || ACCENT, opacity: op }} />
            ))}
            <span style={{ fontSize: '0.68rem', color: colors.muted }}>More</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={onEdit}
            style={{
              flex: 1, padding: '0.55rem', borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`, background: 'transparent',
              color: colors.text, cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600,
            }}
          >✏️ Edit</button>
          <button
            onClick={onArchive}
            style={{
              flex: 1, padding: '0.55rem', borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`, background: 'transparent',
              color: habit.archived ? ACCENT : colors.textSecondary,
              cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600,
            }}
          >{habit.archived ? '📤 Unarchive' : '📦 Archive'}</button>
          <button
            onClick={onDelete}
            style={{
              flex: 1, padding: '0.55rem', borderRadius: '0.5rem',
              border: '1px solid #ef4444', background: 'transparent',
              color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600,
            }}
          >🗑 Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Check Circle ──────────────────────────────────────────────────────────────
function CheckCircle({ done, color, size = 52, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `2.5px solid ${done ? color : 'rgba(148,163,184,0.4)'}`,
        background: done ? color : 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: done ? Math.round(size * 0.45) : 0,
        transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
        transform: done ? 'scale(1.05)' : 'scale(1)',
        flexShrink: 0,
        outline: 'none',
        boxShadow: done ? `0 0 0 3px ${color}33` : 'none',
      }}
    >
      {done ? '✓' : ''}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HabitTracker() {
  const { colors } = useTheme()
  const { prefs } = usePreferences()
  const [syncing, setSyncing] = useState(false)
  const [habits, setHabits] = useState(loadHabits)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [detailHabit, setDetailHabit] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  // Persist to localStorage on every change
  useEffect(() => {
    saveHabits(habits)
    // Keep detailHabit in sync if it's being viewed
    if (detailHabit) {
      const updated = habits.find(h => h.id === detailHabit.id)
      if (updated) setDetailHabit(updated)
      else setDetailHabit(null)
    }
  }, [habits]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!prefs.cloudSync) return
    async function fetchFromSupabase() {
      const sid = getSessionId()
      setSyncing(true)
      try {
        const { data, error } = await supabase.from('habits').select('*').eq('user_id', sid)
        if (!error && data && data.length > 0) { setHabits(data); saveHabits(data) }
      } catch { /* offline */ }
      finally { setSyncing(false) }
    }
    fetchFromSupabase()
  }, [prefs.cloudSync])

  const today = todayKey()

  const todayHabits = useMemo(() => {
    const now = new Date()
    return habits.filter(h => !h.archived && isScheduledDay(h, now))
  }, [habits])

  const archivedHabits = useMemo(() => habits.filter(h => h.archived), [habits])

  const todayDoneCount = useMemo(
    () => todayHabits.filter(h => h.completions?.[today]).length,
    [todayHabits, today]
  )

  const todayPct = todayHabits.length > 0 ? todayDoneCount / todayHabits.length : 0

  const toggleToday = useCallback(async (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    const completions = { ...habit.completions }
    if (completions[today]) delete completions[today]
    else completions[today] = true
    setHabits(prev => prev.map(h => h.id !== habitId ? h : { ...h, completions }))
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('habits').update({ completions }).eq('id', habitId).eq('user_id', sid)
      } catch { /* ignore */ }
    }
  }, [today, habits, prefs.cloudSync])

  const saveHabit = useCallback(async (data) => {
    setHabits(prev => {
      const idx = prev.findIndex(h => h.id === data.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = data
        return next
      }
      return [...prev, data]
    })
    setShowModal(false)
    setEditingHabit(null)
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('habits').upsert([{ ...data, user_id: sid }], { onConflict: 'id,user_id' })
      } catch { /* ignore */ }
    }
  }, [prefs.cloudSync])

  const archiveToggle = useCallback(async (id) => {
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    const archived = !habit.archived
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived } : h))
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('habits').update({ archived }).eq('id', id).eq('user_id', sid)
      } catch { /* ignore */ }
    }
  }, [habits, prefs.cloudSync])

  const deleteHabit = useCallback(async (id) => {
    if (!window.confirm('Delete this habit and all its data?')) return
    setHabits(prev => prev.filter(h => h.id !== id))
    setDetailHabit(null)
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('habits').delete().eq('id', id).eq('user_id', sid)
      } catch { /* ignore */ }
    }
  }, [prefs.cloudSync])

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), items: habits })
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `typely-habits-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }, [habits])

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const items = parsed.items || parsed
        if (!Array.isArray(items)) { alert('Invalid backup file'); return }
        setHabits(prev => {
          const ids = new Set(prev.map(x => x.id))
          const newOnes = items.filter(x => !ids.has(x.id))
          const merged = [...prev, ...newOnes]
          saveHabits(merged)
          return merged
        })
      } catch { alert('Invalid backup file') }
    }
    reader.readAsText(file)
  }, [])

  const openEdit = (habit) => {
    setEditingHabit(habit)
    setDetailHabit(null)
    setShowModal(true)
  }

  // Streak data for today-view
  const streakMap = useMemo(() => {
    const map = {}
    todayHabits.forEach(h => { map[h.id] = computeStreaks(h) })
    return map
  }, [todayHabits])

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    container: {
      maxWidth: '640px',
      margin: '0 auto',
      padding: '1.25rem 1rem 3rem',
      fontFamily: FONT,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: '0.78rem',
      fontWeight: 700,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: '0.75rem',
    },
    card: {
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.875rem',
      padding: '1rem 1.1rem',
    },
  }

  return (
    <ToolLayout toolId="habit-tracker">
      <div style={s.container}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: colors.text }}>
                🌱 Habit Tracker
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.83rem', color: colors.textSecondary }}>
                Build streaks, one day at a time
              </p>

            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={handleExport} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>⬇️ Export Backup</button>
              <label style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
                ⬆️ Import Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
              <button
                onClick={() => { setEditingHabit(null); setShowModal(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.6rem 1.1rem', borderRadius: '0.6rem',
                  border: 'none', background: ACCENT, color: '#fff',
                  cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700,
                  fontFamily: FONT, boxShadow: `0 2px 8px ${ACCENT}55`,
                }}
              >+ Add Habit</button>
            </div>
          </div>
        </div>

        {habits.filter(h => !h.archived).length === 0 ? (
          /* ── Empty state ── */
          <div style={{
            ...s.card, textAlign: 'center', padding: '3rem 1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{ fontSize: '3.5rem' }}>🌱</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: colors.text }}>No habits yet</div>
            <div style={{ fontSize: '0.85rem', color: colors.textSecondary, maxWidth: '280px' }}>
              Add your first habit and start building a streak today!
            </div>
            <button
              onClick={() => { setEditingHabit(null); setShowModal(true) }}
              style={{
                padding: '0.65rem 1.4rem', borderRadius: '0.6rem',
                border: 'none', background: ACCENT, color: '#fff',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, fontFamily: FONT,
              }}
            >+ Create First Habit</button>
          </div>
        ) : (
          <>
            {/* ── Today's Overview ── */}
            <div style={{ ...s.card, marginBottom: '1.25rem', background: `linear-gradient(135deg, ${ACCENT}22 0%, ${colors.card} 60%)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <ProgressRing pct={todayPct} size={80} stroke={7} color={ACCENT} bg={colors.border} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Today's Progress
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: colors.text, lineHeight: 1.1, marginTop: '0.2rem' }}>
                    {todayDoneCount} <span style={{ fontSize: '1rem', fontWeight: 500, color: colors.textSecondary }}>/ {todayHabits.length}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: '0.15rem' }}>
                    {todayDoneCount === todayHabits.length && todayHabits.length > 0
                      ? '🎉 All done! Amazing!'
                      : `${todayHabits.length - todayDoneCount} habit${todayHabits.length - todayDoneCount !== 1 ? 's' : ''} remaining`}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Today's Habits ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={s.sectionTitle}>📅 Today — {new Date().toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              {todayHabits.length === 0 ? (
                <div style={{ ...s.card, color: colors.textSecondary, fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
                  No habits scheduled for today 🎉
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {todayHabits.map(habit => {
                    const done = !!habit.completions?.[today]
                    const { current } = streakMap[habit.id] || { current: 0 }
                    return (
                      <div
                        key={habit.id}
                        style={{
                          ...s.card,
                          display: 'flex', alignItems: 'center', gap: '0.9rem',
                          padding: '0.85rem 1rem',
                          background: done ? `${habit.color || ACCENT}11` : colors.card,
                          border: `1px solid ${done ? (habit.color || ACCENT) + '44' : colors.border}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <CheckCircle
                          done={done}
                          color={habit.color || ACCENT}
                          size={48}
                          onClick={() => toggleToday(habit.id)}
                        />
                        <div
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                          onClick={() => setDetailHabit(habit)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{habit.emoji}</span>
                            <span style={{
                              fontWeight: 600, fontSize: '0.95rem', color: colors.text,
                              textDecoration: done ? 'line-through' : 'none',
                              opacity: done ? 0.65 : 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{habit.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                            {current > 0 && (
                              <span style={{ fontSize: '0.73rem', color: habit.color || ACCENT, fontWeight: 600 }}>
                                🔥 {current} day streak
                              </span>
                            )}
                            <span style={{ fontSize: '0.7rem', color: colors.muted }}>
                              {FREQ_OPTIONS.find(f => f.id === habit.frequency)?.label}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setDetailHabit(habit)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: colors.muted, fontSize: '1.1rem', padding: '0.2rem',
                            flexShrink: 0,
                          }}
                          title="View details"
                        >›</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── All Active Habits Overview ── */}
            {habits.filter(h => !h.archived).length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={s.sectionTitle}>📈 All Habits</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {habits.filter(h => !h.archived).map(habit => {
                    const { current, longest } = computeStreaks(habit)
                    return (
                      <div
                        key={habit.id}
                        onClick={() => setDetailHabit(habit)}
                        style={{
                          ...s.card,
                          cursor: 'pointer',
                          padding: '0.9rem',
                          borderLeft: `3px solid ${habit.color || ACCENT}`,
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${habit.color || ACCENT}22` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.35rem' }}>{habit.emoji}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: habit.color || ACCENT }}>{current}</div>
                            <div style={{ fontSize: '0.62rem', color: colors.muted }}>streak</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.text }}>{longest}</div>
                            <div style={{ fontSize: '0.62rem', color: colors.muted }}>best</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Archived ── */}
            {archivedHabits.length > 0 && (
              <div>
                <button
                  onClick={() => setShowArchived(v => !v)}
                  style={{
                    background: 'none', border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem', padding: '0.45rem 0.9rem',
                    color: colors.textSecondary, cursor: 'pointer',
                    fontSize: '0.8rem', fontFamily: FONT, marginBottom: '0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  📦 {showArchived ? 'Hide' : 'Show'} archived ({archivedHabits.length})
                </button>
                {showArchived && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {archivedHabits.map(habit => (
                      <div
                        key={habit.id}
                        style={{
                          ...s.card,
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          opacity: 0.6,
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{habit.emoji}</span>
                        <span style={{ flex: 1, fontSize: '0.88rem', color: colors.text }}>{habit.name}</span>
                        <button
                          onClick={() => archiveToggle(habit.id)}
                          style={{
                            background: 'none', border: `1px solid ${ACCENT}`,
                            borderRadius: '0.4rem', padding: '0.25rem 0.65rem',
                            color: ACCENT, cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT,
                          }}
                        >Restore</button>
                        <button
                          onClick={() => setDetailHabit(habit)}
                          style={{
                            background: 'none', border: `1px solid ${colors.border}`,
                            borderRadius: '0.4rem', padding: '0.25rem 0.65rem',
                            color: colors.textSecondary, cursor: 'pointer', fontSize: '0.75rem', fontFamily: FONT,
                          }}
                        >View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={saveHabit}
          onClose={() => { setShowModal(false); setEditingHabit(null) }}
          colors={colors}
        />
      )}

      {detailHabit && (
        <HabitDetail
          habit={detailHabit}
          colors={colors}
          onClose={() => setDetailHabit(null)}
          onEdit={() => openEdit(detailHabit)}
          onArchive={() => { archiveToggle(detailHabit.id); setDetailHabit(null) }}
          onDelete={() => deleteHabit(detailHabit.id)}
        />
      )}

      <div style={{ maxWidth: '640px', margin: '1.5rem auto 0', padding: '0 1rem 3rem' }}>
      </div>
    </ToolLayout>
  )
}
