import { useState, useEffect, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { supabase } from '../utils/supabase'

const STORAGE_KEY = 'typely_planner'
const ACCENT = '#3b82f6'
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

const PRIORITIES = [
  { value: 'high',   label: 'High',   emoji: '🔴', color: '#ef4444' },
  { value: 'medium', label: 'Medium', emoji: '🟡', color: '#f59e0b' },
  { value: 'low',    label: 'Low',    emoji: '🟢', color: '#10b981' },
]

const CATEGORIES = ['Work', 'Personal', 'Health', 'Other']

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function offsetDate(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDisplay(date) {
  const today = new Date()
  const yesterday = offsetDate(today, -1)
  const tomorrow = offsetDate(today, 1)
  const key = toDateKey(date)
  if (key === toDateKey(today)) return 'Today'
  if (key === toDateKey(yesterday)) return 'Yesterday'
  if (key === toDateKey(tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatShortDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function newTask(overrides = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: '',
    done: false,
    priority: 'medium',
    time: '',
    category: '',
    ...overrides,
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriorityBadge({ value }) {
  const p = PRIORITIES.find(x => x.value === value) || PRIORITIES[1]
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem',
      borderRadius: '999px', background: `${p.color}22`, color: p.color,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {p.emoji} {p.label}
    </span>
  )
}

function CategoryTag({ value, colors }) {
  if (!value) return null
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem',
      borderRadius: '999px', background: `${ACCENT}18`, color: ACCENT,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  )
}

function TaskCard({ task, index, total, colors, isDark, onToggle, onMoveUp, onMoveDown, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
        padding: '0.75rem 0.875rem',
        background: task.done
          ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
          : colors.surface,
        border: `1px solid ${hovered && !task.done ? ACCENT + '55' : colors.border}`,
        borderRadius: '0.75rem',
        transition: 'border-color 0.15s, background 0.15s',
        opacity: task.done ? 0.65 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        title={task.done ? 'Mark incomplete' : 'Mark complete'}
        style={{
          flexShrink: 0, marginTop: '0.1rem',
          width: 20, height: 20,
          borderRadius: '50%',
          border: `2px solid ${task.done ? ACCENT : colors.inputBorder}`,
          background: task.done ? ACCENT : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', padding: 0,
        }}
      >
        {task.done && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.9rem', color: colors.text, fontWeight: 500,
          textDecoration: task.done ? 'line-through' : 'none',
          wordBreak: 'break-word', lineHeight: 1.4,
        }}>
          {task.text}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem', alignItems: 'center' }}>
          <PriorityBadge value={task.priority} />
          <CategoryTag value={task.category} colors={colors} />
          {task.time && (
            <span style={{ fontSize: '0.68rem', color: colors.muted, fontWeight: 500 }}>
              🕐 {task.time}
            </span>
          )}
        </div>
      </div>

      {/* Actions (always visible on hover, or always visible on touch) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
      }}>
        <button onClick={onMoveUp} disabled={index === 0} title="Move up" style={{
          width: 22, height: 22, border: `1px solid ${colors.border}`, borderRadius: '0.35rem',
          background: 'transparent', cursor: index === 0 ? 'not-allowed' : 'pointer',
          color: index === 0 ? colors.muted : colors.textSecondary,
          fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>▲</button>
        <button onClick={onMoveDown} disabled={index === total - 1} title="Move down" style={{
          width: 22, height: 22, border: `1px solid ${colors.border}`, borderRadius: '0.35rem',
          background: 'transparent', cursor: index === total - 1 ? 'not-allowed' : 'pointer',
          color: index === total - 1 ? colors.muted : colors.textSecondary,
          fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>▼</button>
      </div>

      <button onClick={onDelete} title="Delete task" style={{
        flexShrink: 0, width: 22, height: 22, border: 'none', background: 'transparent',
        cursor: 'pointer', color: colors.muted, fontSize: '0.8rem', padding: 0,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyPlanner() {
  const { isDark, colors } = useTheme()
  const { prefs } = usePreferences()
  const [syncing, setSyncing] = useState(false)

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [allData, setAllData] = useState(loadAll)
  const [showWeekly, setShowWeekly] = useState(false)

  // Add-task form state
  const [newText, setNewText] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newTime, setNewTime] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const dateKey = toDateKey(currentDate)
  const tasks = allData[dateKey] || []

  // Persist whenever allData changes
  useEffect(() => {
    saveAll(allData)
  }, [allData])

  useEffect(() => {
    if (!prefs.cloudSync) return
    async function fetchFromSupabase() {
      const sid = getSessionId()
      setSyncing(true)
      try {
        const { data, error } = await supabase.from('daily_planner').select('*').eq('user_id', sid)
        if (!error && data && data.length > 0) {
          const merged = {}
          data.forEach(row => { merged[row.date_key] = row.tasks || [] })
          setAllData(merged)
          saveAll(merged)
        }
      } catch { /* offline */ }
      finally { setSyncing(false) }
    }
    fetchFromSupabase()
  }, [prefs.cloudSync])

  const updateTasks = useCallback((key, updater) => {
    setAllData(prev => {
      const current = prev[key] || []
      const next = typeof updater === 'function' ? updater(current) : updater
      if (next.length === 0) {
        const copy = { ...prev }
        delete copy[key]
        return copy
      }
      return { ...prev, [key]: next }
    })
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────

  const addTask = useCallback(async () => {
    const text = newText.trim()
    if (!text) return
    const task = newTask({ text, priority: newPriority, time: newTime.trim(), category: newCategory })
    updateTasks(dateKey, prev => [...prev, task])
    setNewText('')
    setNewTime('')
    setNewCategory('')
    setNewPriority('medium')
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        const current = allData[dateKey] ? [...allData[dateKey], task] : [task]
        await supabase.from('daily_planner').upsert([{ user_id: sid, date_key: dateKey, tasks: current }], { onConflict: 'user_id,date_key' })
      } catch { /* ignore */ }
    }
  }, [newText, newPriority, newTime, newCategory, dateKey, updateTasks, prefs.cloudSync, allData])

  const toggleTask = useCallback(async (id) => {
    const newTasks = (allData[dateKey] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
    updateTasks(dateKey, () => newTasks)
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('daily_planner').upsert([{ user_id: sid, date_key: dateKey, tasks: newTasks }], { onConflict: 'user_id,date_key' })
      } catch { /* ignore */ }
    }
  }, [dateKey, updateTasks, prefs.cloudSync, allData])

  const deleteTask = useCallback(async (id) => {
    const newTasks = (allData[dateKey] || []).filter(t => t.id !== id)
    updateTasks(dateKey, () => newTasks)
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        if (newTasks.length === 0) {
          await supabase.from('daily_planner').delete().eq('user_id', sid).eq('date_key', dateKey)
        } else {
          await supabase.from('daily_planner').upsert([{ user_id: sid, date_key: dateKey, tasks: newTasks }], { onConflict: 'user_id,date_key' })
        }
      } catch { /* ignore */ }
    }
  }, [dateKey, updateTasks, prefs.cloudSync, allData])

  const moveTask = useCallback((index, direction) => {
    updateTasks(dateKey, prev => {
      const arr = [...prev]
      const target = index + direction
      if (target < 0 || target >= arr.length) return prev
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
  }, [dateKey, updateTasks])

  const clearCompleted = useCallback(async () => {
    const newTasks = (allData[dateKey] || []).filter(t => !t.done)
    updateTasks(dateKey, () => newTasks)
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        if (newTasks.length === 0) {
          await supabase.from('daily_planner').delete().eq('user_id', sid).eq('date_key', dateKey)
        } else {
          await supabase.from('daily_planner').upsert([{ user_id: sid, date_key: dateKey, tasks: newTasks }], { onConflict: 'user_id,date_key' })
        }
      } catch { /* ignore */ }
    }
  }, [dateKey, updateTasks, prefs.cloudSync, allData])

  const copyYesterdayPending = useCallback(async () => {
    const yesterdayKey = toDateKey(offsetDate(currentDate, -1))
    const yesterdayTasks = allData[yesterdayKey] || []
    const pending = yesterdayTasks
      .filter(t => !t.done)
      .map(t => ({ ...t, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, done: false }))
    if (!pending.length) return
    const current = allData[dateKey] || []
    const existingTexts = new Set(current.map(t => t.text.toLowerCase()))
    const toAdd = pending.filter(t => !existingTexts.has(t.text.toLowerCase()))
    updateTasks(dateKey, prev => {
      const existingTxts = new Set(prev.map(t => t.text.toLowerCase()))
      return [...prev, ...pending.filter(t => !existingTxts.has(t.text.toLowerCase()))]
    })
    if (prefs.cloudSync && toAdd.length > 0) {
      try {
        const sid = getSessionId()
        const finalTasks = [...current, ...toAdd]
        await supabase.from('daily_planner').upsert([{ user_id: sid, date_key: dateKey, tasks: finalTasks }], { onConflict: 'user_id,date_key' })
      } catch { /* ignore */ }
    }
  }, [currentDate, allData, dateKey, updateTasks, prefs.cloudSync])

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), items: allData })
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `typely-planner-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }, [allData])

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const items = parsed.items || parsed
        if (!items || typeof items !== 'object' || Array.isArray(items)) { alert('Invalid backup file'); return }
        setAllData(prev => {
          const merged = { ...items }
          Object.keys(prev).forEach(key => {
            if (!merged[key]) merged[key] = prev[key]
            else {
              const existingIds = new Set(merged[key].map(t => t.id))
              const toAdd = prev[key].filter(t => !existingIds.has(t.id))
              merged[key] = [...merged[key], ...toAdd]
            }
          })
          saveAll(merged)
          return merged
        })
      } catch { alert('Invalid backup file') }
    }
    reader.readAsText(file)
  }, [])

  // ── Stats ────────────────────────────────────────────────────────────────

  const doneCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

  // ── Weekly data (Mon–Sun of current week containing currentDate) ──────────

  const weekDays = (() => {
    const days = []
    const d = new Date(currentDate)
    // Go back to Monday
    const day = d.getDay() // 0=Sun
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    for (let i = 0; i < 7; i++) {
      const date = new Date(d)
      const key = toDateKey(date)
      const t = allData[key] || []
      days.push({ date, key, done: t.filter(x => x.done).length, total: t.length })
      d.setDate(d.getDate() + 1)
    }
    return days
  })()

  // ── Handlers ─────────────────────────────────────────────────────────────

  const goToDate = (d) => setCurrentDate(d)
  const goToToday = () => setCurrentDate(new Date())

  const handleDatePickerChange = (e) => {
    if (!e.target.value) return
    const [y, m, day] = e.target.value.split('-').map(Number)
    setCurrentDate(new Date(y, m - 1, day))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask()
  }

  // ── Styles helpers ────────────────────────────────────────────────────────

  const btnBase = {
    padding: '0.4rem 0.8rem', borderRadius: '0.55rem', border: `1px solid ${colors.border}`,
    background: 'transparent', color: colors.textSecondary, cursor: 'pointer',
    fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
  }

  const inputStyle = {
    background: colors.input, border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.55rem', color: colors.text, fontFamily: FONT,
    fontSize: '0.875rem', outline: 'none', padding: '0.5rem 0.75rem',
    transition: 'border-color 0.15s',
  }

  const selectStyle = {
    ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
    paddingRight: '1.5rem',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center',
  }

  return (
    <ToolLayout toolId="daily-planner">
      <div style={{ fontFamily: FONT, maxWidth: 680, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.3rem',
                background: `linear-gradient(to right, ${ACCENT}, #6366f1)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                📋 Daily Planner
              </h1>
              <p style={{ color: colors.muted, margin: 0, fontSize: '0.85rem' }}>
                Plan your day, track progress, build momentum.
              </p>

            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={handleExport} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>⬇️ Export Backup</button>
              <label style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
                ⬆️ Import Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* ── Date Navigation ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}>
          <button
            onClick={() => goToDate(offsetDate(currentDate, -1))}
            style={btnBase}
            title="Previous day"
          >◀</button>

          <div style={{
            flex: 1, minWidth: 160, textAlign: 'center',
            fontWeight: 700, fontSize: '1rem', color: colors.text,
          }}>
            {formatDisplay(currentDate)}
            <span style={{ fontSize: '0.72rem', color: colors.muted, display: 'block', fontWeight: 500 }}>
              {formatShortDay(currentDate)}
            </span>
          </div>

          <button
            onClick={() => goToDate(offsetDate(currentDate, 1))}
            style={btnBase}
            title="Next day"
          >▶</button>

          <button
            onClick={goToToday}
            style={{
              ...btnBase,
              background: toDateKey(currentDate) === toDateKey(new Date()) ? ACCENT : 'transparent',
              color: toDateKey(currentDate) === toDateKey(new Date()) ? '#fff' : colors.textSecondary,
              border: `1px solid ${toDateKey(currentDate) === toDateKey(new Date()) ? ACCENT : colors.border}`,
            }}
          >Today</button>

          <input
            type="date"
            value={dateKey}
            onChange={handleDatePickerChange}
            style={{
              ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem',
              colorScheme: isDark ? 'dark' : 'light',
            }}
            title="Pick a date"
          />

          <button
            onClick={() => setShowWeekly(s => !s)}
            style={{
              ...btnBase,
              background: showWeekly ? `${ACCENT}22` : 'transparent',
              color: showWeekly ? ACCENT : colors.textSecondary,
              border: `1px solid ${showWeekly ? ACCENT + '55' : colors.border}`,
            }}
            title="Toggle weekly summary"
          >📊 Week</button>
        </div>

        {/* ── Weekly Summary ──────────────────────────────────────────────── */}
        {showWeekly && (
          <div style={{
            background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: '1rem', padding: '1rem', marginBottom: '1.25rem',
          }}>
            <div style={{
              fontSize: '0.73rem', fontWeight: 700, color: colors.muted,
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
            }}>
              Weekly Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.4rem' }}>
              {weekDays.map(({ date, key, done, total }) => {
                const isActive = key === dateKey
                const isToday = key === toDateKey(new Date())
                return (
                  <button
                    key={key}
                    onClick={() => { setCurrentDate(date); setShowWeekly(false) }}
                    title={formatShortDay(date)}
                    style={{
                      padding: '0.5rem 0.25rem', borderRadius: '0.6rem', cursor: 'pointer',
                      background: isActive ? ACCENT : isToday ? `${ACCENT}18` : 'transparent',
                      border: `1px solid ${isActive ? ACCENT : isToday ? ACCENT + '44' : colors.border}`,
                      color: isActive ? '#fff' : colors.text,
                      fontFamily: FONT, textAlign: 'center', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: isActive ? 0.85 : undefined, color: isActive ? '#fff' : colors.muted }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, margin: '0.15rem 0' }}>
                      {date.getDate()}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      color: isActive ? 'rgba(255,255,255,0.85)' : (done > 0 && done === total && total > 0 ? '#10b981' : colors.muted),
                    }}>
                      {total === 0 ? '—' : `${done}/${total}`}
                    </div>
                    {total > 0 && (
                      <div style={{
                        marginTop: '0.2rem', height: 3, borderRadius: 99,
                        background: isActive ? 'rgba(255,255,255,0.3)' : colors.border, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${Math.round((done / total) * 100)}%`,
                          background: isActive ? '#fff' : ACCENT, borderRadius: 99, transition: 'width 0.3s',
                        }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Day Stats ───────────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1px solid ${colors.border}`,
          borderRadius: '0.875rem', padding: '0.875rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT }}>{doneCount}</span>
            <span style={{ fontSize: '1rem', color: colors.muted, fontWeight: 500 }}> / {totalCount}</span>
            <div style={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 600 }}>tasks done</div>
          </div>

          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: colors.muted, fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '0.72rem', color: ACCENT, fontWeight: 700 }}>{progressPct}%</span>
            </div>
            <div style={{
              height: 8, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progressPct}%`, background: ACCENT,
                borderRadius: 99, transition: 'width 0.4s cubic-bezier(.4,0,.2,1)',
                backgroundImage: progressPct === 100 ? 'linear-gradient(to right,#3b82f6,#10b981)' : undefined,
              }} />
            </div>
          </div>

          {progressPct === 100 && totalCount > 0 && (
            <span style={{ fontSize: '1.1rem' }} title="All done! 🎉">🎉</span>
          )}
        </div>

        {/* ── Add Task Form ───────────────────────────────────────────────── */}
        <div style={{
          background: colors.surface, border: `1px solid ${colors.border}`,
          borderRadius: '1rem', padding: '1rem', marginBottom: '1.25rem',
        }}>
          <div style={{
            fontSize: '0.73rem', fontWeight: 700, color: colors.muted,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
          }}>
            Add Task
          </div>

          {/* Task text */}
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: '0.6rem' }}
          />

          {/* Row 2: priority + time + category */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            {/* Priority */}
            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                style={{ ...selectStyle }}
                title="Priority"
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}
              title="Optional time"
            />

            {/* Category */}
            <div style={{ position: 'relative', flex: '1 1 120px' }}>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                style={{ ...selectStyle, width: '100%' }}
                title="Category"
              >
                <option value="">No category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={addTask}
            disabled={!newText.trim()}
            style={{
              padding: '0.55rem 1.5rem', borderRadius: '0.6rem', border: 'none',
              background: newText.trim() ? ACCENT : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
              color: newText.trim() ? '#fff' : colors.muted,
              cursor: newText.trim() ? 'pointer' : 'not-allowed',
              fontFamily: FONT, fontWeight: 700, fontSize: '0.875rem',
              transition: 'all 0.15s',
              boxShadow: newText.trim() ? `0 2px 12px ${ACCENT}44` : 'none',
            }}
          >
            + Add Task
          </button>
        </div>

        {/* ── Action Bar ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <button
            onClick={copyYesterdayPending}
            style={btnBase}
            title="Copy yesterday's incomplete tasks to today"
          >
            📥 Copy Yesterday's Pending
          </button>

          {tasks.some(t => t.done) && (
            <button
              onClick={clearCompleted}
              style={{ ...btnBase, color: '#ef4444', borderColor: '#ef444433' }}
              title="Remove all completed tasks"
            >
              🗑 Clear Completed
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: colors.muted }}>
            {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ── Task List ───────────────────────────────────────────────────── */}
        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: colors.muted, fontSize: '0.9rem',
            background: colors.surface, border: `1px dashed ${colors.border}`,
            borderRadius: '1rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
            <div style={{ fontWeight: 600 }}>No tasks for this day</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>Add a task above, or copy from yesterday.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Pending tasks first, then completed */}
            {[...tasks.filter(t => !t.done), ...tasks.filter(t => t.done)].map((task, idx, arr) => {
              const originalIndex = tasks.indexOf(task)
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={originalIndex}
                  total={tasks.length}
                  colors={colors}
                  isDark={isDark}
                  onToggle={() => toggleTask(task.id)}
                  onMoveUp={() => moveTask(originalIndex, -1)}
                  onMoveDown={() => moveTask(originalIndex, 1)}
                  onDelete={() => deleteTask(task.id)}
                />
              )
            })}
          </div>
        )}

      </div>
    </ToolLayout>

  )
}
