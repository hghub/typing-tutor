import { useState, useEffect, useCallback } from 'react'
import SharePanel from '../components/SharePanel'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { supabase } from '../utils/supabase'

const ACCENT = '#8b5cf6'
const STORAGE_KEY = 'typely_measurements'
const SESSION_KEY = 'typely_session_id'

const PRESETS = [
  { name: 'Body Weight',     icon: '⚖️',  metrics: [{ name: 'Weight', unit: 'kg' }] },
  { name: 'Blood Pressure',  icon: '🩺',  metrics: [{ name: 'Systolic', unit: 'mmHg' }, { name: 'Diastolic', unit: 'mmHg' }, { name: 'Pulse', unit: 'bpm' }] },
  { name: 'Room Dimensions', icon: '📐',  metrics: [{ name: 'Length', unit: 'm' }, { name: 'Width', unit: 'm' }, { name: 'Height', unit: 'm' }] },
  { name: 'Temperature',     icon: '🌡️', metrics: [{ name: 'Temperature', unit: '°C' }] },
  { name: 'Custom',          icon: '📏',  metrics: [] },
]

const EMOJI_OPTIONS = ['📏','⚖️','🩺','📐','🌡️','💪','🏃','🩸','💊','🏠','🌿','📊','💧','🧪','🔬','📈']

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, id) }
  return id
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"trackers":[],"entries":[]}') }
  catch { return { trackers: [], entries: [] } }
}

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fmtDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m-1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Recovery Code ─────────────────────────────────────────────────────────────
function RecoveryCodeBox({ colors }) {
  const [copied, setCopied] = useState(false)
  const [val, setVal] = useState('')
  const [msg, setMsg] = useState('')
  const code = getSessionId()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 600, color: colors.textSecondary }}>🔑 Recovery Code</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <code style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.12)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: colors.text, wordBreak: 'break-all' }}>{code}</code>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', border: `1px solid ${ACCENT}44`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="Paste code to restore on this device…" value={val} onChange={e => setVal(e.target.value)}
          style={{ fontSize: '0.72rem', flex: 1, minWidth: 200, padding: '0.25rem 0.5rem', borderRadius: '0.4rem', border: `1px solid ${ACCENT}44`, background: 'transparent', color: colors.text, outline: 'none' }} />
        <button onClick={() => {
          const v = val.trim()
          if (!v) return
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) { setMsg('Invalid code format.'); return }
          localStorage.setItem(SESSION_KEY, v); setMsg('Applied! Reload to fetch your data.')
        }} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', border: `1px solid ${ACCENT}44`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          Restore
        </button>
      </div>
      {msg && <p style={{ margin: 0, fontSize: '0.72rem', color: ACCENT }}>{msg}</p>}
    </div>
  )
}

// ── Tracker Form Modal ────────────────────────────────────────────────────────
function TrackerFormModal({ onSave, onClose, initial, colors }) {
  const [name, setName]     = useState(initial?.name || '')
  const [icon, setIcon]     = useState(initial?.icon || '📏')
  const [metrics, setMetrics] = useState(initial?.metrics || [])
  const [preset, setPreset] = useState(null)
  const [errors, setErrors] = useState({})

  function applyPreset(p) {
    setPreset(p.name)
    setName(p.name === 'Custom' ? '' : p.name)
    setIcon(p.icon)
    setMetrics(p.metrics.map(m => ({ ...m })))
  }

  function addMetric() { setMetrics(m => [...m, { name: '', unit: '' }]) }
  function updateMetric(i, key, val) { setMetrics(m => m.map((x, idx) => idx === i ? { ...x, [key]: val } : x)) }
  function removeMetric(i) { setMetrics(m => m.filter((_, idx) => idx !== i)) }

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (metrics.length === 0) e.metrics = 'Add at least one metric'
    metrics.forEach((m, i) => { if (!m.name.trim()) e[`metric_${i}`] = 'Metric name required' })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ name: name.trim(), icon, metrics: metrics.map(m => ({ name: m.name.trim(), unit: m.unit.trim() })) })
  }

  const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.05)', color: colors.text, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: colors.card, borderRadius: '1rem', border: `1px solid ${ACCENT}33`, padding: '1.5rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 1rem', color: colors.text, fontSize: '1rem' }}>{initial ? '✏️ Edit Tracker' : '➕ New Tracker'}</h3>

        {/* Presets */}
        {!initial && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={labelStyle}>Quick Start Preset</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: '2rem', border: `1px solid ${preset === p.name ? ACCENT : 'rgba(139,92,246,0.2)'}`, background: preset === p.name ? `${ACCENT}20` : 'transparent', color: colors.text, cursor: 'pointer' }}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icon */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={labelStyle}>Icon</p>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setIcon(e)}
                style={{ width: 32, height: 32, borderRadius: '0.4rem', border: `1px solid ${icon === e ? ACCENT : 'rgba(139,92,246,0.15)'}`, background: icon === e ? `${ACCENT}20` : 'transparent', cursor: 'pointer', fontSize: '1rem' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Tracker Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Body Weight, Room A, Blood Pressure…" style={inputStyle} />
          {errors.name && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.name}</p>}
        </div>

        {/* Metrics */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Metrics {metrics.length > 0 && `(${metrics.length})`}</span>
            <button onClick={addMetric} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', border: `1px solid ${ACCENT}44`, background: `${ACCENT}15`, color: ACCENT, cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>+ Add Metric</button>
          </p>
          {errors.metrics && <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', color: '#ef4444' }}>{errors.metrics}</p>}
          {metrics.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 2 }}>
                <input value={m.name} onChange={e => updateMetric(i, 'name', e.target.value)} placeholder="Metric name (e.g. Weight)" style={inputStyle} />
                {errors[`metric_${i}`] && <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: '#ef4444' }}>{errors[`metric_${i}`]}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <input value={m.unit} onChange={e => updateMetric(i, 'unit', e.target.value)} placeholder="Unit (e.g. kg)" style={inputStyle} />
              </div>
              <button onClick={() => removeMetric(i)} style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', marginTop: 1 }}>✕</button>
            </div>
          ))}
          {metrics.length === 0 && <p style={{ fontSize: '0.78rem', color: colors.textSecondary, fontStyle: 'italic' }}>No metrics yet. Add one above or pick a preset.</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Tracker</button>
        </div>
      </div>
    </div>
  )
}

// ── Entry Form Modal ──────────────────────────────────────────────────────────
function EntryFormModal({ tracker, onSave, onClose, colors }) {
  const [date, setDate]     = useState(todayStr())
  const [values, setValues] = useState({})
  const [note, setNote]     = useState('')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!date) e.date = 'Date is required'
    tracker.metrics.forEach(m => {
      if (values[m.name] === '' || values[m.name] === undefined) e[m.name] = 'Required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ logged_at: date, values, note: note.trim() })
  }

  const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.05)', color: colors.text, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: colors.card, borderRadius: '1rem', border: `1px solid ${ACCENT}33`, padding: '1.5rem', width: '100%', maxWidth: 440 }}>
        <h3 style={{ margin: '0 0 1rem', color: colors.text, fontSize: '1rem' }}>📝 Log Entry — {tracker.icon} {tracker.name}</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          {errors.date && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.date}</p>}
        </div>

        {tracker.metrics.map(m => (
          <div key={m.name} style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>{m.name}{m.unit ? ` (${m.unit})` : ''}</label>
            <input type="number" step="any" value={values[m.name] ?? ''} onChange={e => setValues(v => ({ ...v, [m.name]: e.target.value }))}
              placeholder={`Enter ${m.name.toLowerCase()}…`} style={inputStyle} />
            {errors[m.name] && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors[m.name]}</p>}
          </div>
        ))}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Note (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any context for this reading…" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Entry</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MeasurementTracker() {
  const { colors } = useTheme()
  const { prefs }  = usePreferences()

  const [trackers, setTrackers] = useState([])
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [useLocal, setUseLocal] = useState(false)

  const [selectedTracker, setSelectedTracker] = useState(null)
  const [showTrackerForm, setShowTrackerForm] = useState(false)
  const [editingTracker,  setEditingTracker]  = useState(null)
  const [showEntryForm,   setShowEntryForm]   = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState(null) // { type: 'tracker'|'entry', id }

  const userId = getSessionId()

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    if (useLocal || !prefs.cloudSync) {
      const d = loadLocal()
      const userTrackers = d.trackers.filter(t => t.user_id === userId)
      setTrackers(userTrackers)
      setEntries(d.entries.filter(e => userTrackers.some(t => t.id === e.tracker_id)))
      setLoading(false)
      return
    }
    try {
      const [{ data: tr, error: e1 }, { data: en, error: e2 }] = await Promise.all([
        supabase.from('measurement_trackers').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('measurement_entries').select('*').eq('user_id', userId).order('logged_at', { ascending: false }),
      ])
      if (e1 || e2) throw new Error(e1?.message || e2?.message)
      setTrackers(tr || [])
      setEntries(en || [])
    } catch {
      setUseLocal(true)
      const d = loadLocal()
      const userTrackers = d.trackers.filter(t => t.user_id === userId)
      setTrackers(userTrackers)
      setEntries(d.entries.filter(e => userTrackers.some(t => t.id === e.tracker_id)))
    }
    setLoading(false)
  }, [userId, prefs.cloudSync, useLocal])

  useEffect(() => { loadData() }, [loadData])

  // keep selectedTracker in sync when trackers list updates
  useEffect(() => {
    if (selectedTracker) {
      const updated = trackers.find(t => t.id === selectedTracker.id)
      if (updated) setSelectedTracker(updated)
    }
  }, [trackers])

  // ── Save Tracker ─────────────────────────────────────────────────────────
  async function handleSaveTracker(data) {
    const isEdit = !!editingTracker
    const id = isEdit ? editingTracker.id : crypto.randomUUID()
    const row = { id, user_id: userId, name: data.name, icon: data.icon, metrics: data.metrics, created_at: isEdit ? editingTracker.created_at : new Date().toISOString() }

    // Local
    const d = loadLocal()
    if (isEdit) {
      d.trackers = d.trackers.map(t => t.id === id ? row : t)
    } else {
      d.trackers.push(row)
    }
    saveLocal(d)
    setTrackers(prev => isEdit ? prev.map(t => t.id === id ? row : t) : [...prev, row])

    // Cloud
    if (!useLocal && prefs.cloudSync) {
      try {
        if (isEdit) {
          await supabase.from('measurement_trackers').update({ name: row.name, icon: row.icon, metrics: row.metrics }).eq('id', id)
        } else {
          await supabase.from('measurement_trackers').insert(row)
        }
      } catch {}
    }

    setEditingTracker(null)
    setShowTrackerForm(false)
  }

  // ── Save Entry ────────────────────────────────────────────────────────────
  async function handleSaveEntry(data) {
    const tracker = selectedTracker
    const id = crypto.randomUUID()
    const row = { id, tracker_id: tracker.id, user_id: userId, logged_at: data.logged_at, values: data.values, note: data.note, created_at: new Date().toISOString() }

    // Local
    const d = loadLocal()
    d.entries.push(row)
    saveLocal(d)
    setEntries(prev => [row, ...prev])

    // Cloud
    if (!useLocal && prefs.cloudSync) {
      try { await supabase.from('measurement_entries').insert(row) } catch {}
    }

    setShowEntryForm(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteConfirm) return
    const d = loadLocal()

    if (deleteConfirm.type === 'tracker') {
      const tid = deleteConfirm.id
      d.trackers = d.trackers.filter(t => t.id !== tid)
      d.entries  = d.entries.filter(e => e.tracker_id !== tid)
      saveLocal(d)
      setTrackers(prev => prev.filter(t => t.id !== tid))
      setEntries(prev => prev.filter(e => e.tracker_id !== tid))
      if (selectedTracker?.id === tid) setSelectedTracker(null)
      if (!useLocal && prefs.cloudSync) {
        try {
          await supabase.from('measurement_entries').delete().eq('tracker_id', tid)
          await supabase.from('measurement_trackers').delete().eq('id', tid)
        } catch {}
      }
    } else {
      const eid = deleteConfirm.id
      d.entries = d.entries.filter(e => e.id !== eid)
      saveLocal(d)
      setEntries(prev => prev.filter(e => e.id !== eid))
      if (!useLocal && prefs.cloudSync) {
        try { await supabase.from('measurement_entries').delete().eq('id', eid) } catch {}
      }
    }
    setDeleteConfirm(null)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const trackerEntries = selectedTracker ? entries.filter(e => e.tracker_id === selectedTracker.id) : []
  const entryCount = (tid) => entries.filter(e => e.tracker_id === tid).length

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = {
    background: colors.card,
    borderRadius: '0.875rem',
    border: `1px solid ${colors.border}`,
    padding: '1.25rem',
  }

  return (
    <ToolLayout
      title="Measurement Tracker"
      icon="📏"
      tagline="Track any measurement over time"
      accentColor={ACCENT}
    >
      <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Trackers List or Detail ───────────────────────────────────────── */}
        {!selectedTracker ? (
          /* Grid of trackers */
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '1rem' }}>Your Trackers</h2>
              <button onClick={() => setShowTrackerForm(true)}
                style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                + New Tracker
              </button>
            </div>

            {loading ? (
              <p style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Loading…</p>
            ) : trackers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📏</div>
                <p style={{ color: colors.textSecondary, margin: '0 0 1rem', fontSize: '0.88rem' }}>No trackers yet. Create one to start logging measurements.</p>
                <button onClick={() => setShowTrackerForm(true)}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Create Your First Tracker
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {trackers.map(t => (
                  <div key={t.id} onClick={() => setSelectedTracker(t)}
                    style={{ borderRadius: '0.75rem', border: `1px solid ${ACCENT}33`, background: `${ACCENT}08`, padding: '1rem', cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = `${ACCENT}33`}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{t.icon}</div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: colors.text, fontSize: '0.88rem' }}>{t.name}</p>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: colors.textSecondary }}>
                      {t.metrics.map(m => m.name + (m.unit ? ` (${m.unit})` : '')).join(' · ')}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: ACCENT }}>{entryCount(t.id)} entries →</p>
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                      <button onClick={e => { e.stopPropagation(); setEditingTracker(t); setShowTrackerForm(true) }}
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '0.3rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>✏️</button>
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'tracker', id: t.id }) }}
                        style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '0.3rem', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tracker Detail — entries */
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedTracker(null)}
                style={{ padding: '0.3rem 0.7rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.82rem' }}>
                ← Back
              </button>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '1rem', flex: 1 }}>{selectedTracker.icon} {selectedTracker.name}</h2>
              <button onClick={() => { setEditingTracker(selectedTracker); setShowTrackerForm(true) }}
                style={{ padding: '0.3rem 0.7rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.82rem' }}>
                ✏️ Edit
              </button>
              <button onClick={() => setShowEntryForm(true)}
                style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                + Log Entry
              </button>
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: colors.textSecondary }}>
              Metrics: {selectedTracker.metrics.map(m => `${m.name}${m.unit ? ` (${m.unit})` : ''}`).join(' · ')}
            </p>

            {loading ? (
              <p style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Loading…</p>
            ) : trackerEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: colors.textSecondary, margin: '0 0 1rem', fontSize: '0.88rem' }}>No entries yet. Log your first measurement!</p>
                <button onClick={() => setShowEntryForm(true)}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Log First Entry
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: colors.textSecondary, fontWeight: 600, whiteSpace: 'nowrap' }}>Date</th>
                      {selectedTracker.metrics.map(m => (
                        <th key={m.name} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: colors.textSecondary, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {m.name}{m.unit ? ` (${m.unit})` : ''}
                        </th>
                      ))}
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: colors.textSecondary, fontWeight: 600 }}>Note</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: colors.textSecondary, fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackerEntries.map((e, idx) => (
                      <tr key={e.id} style={{ borderBottom: `1px solid ${colors.border}`, background: idx % 2 === 0 ? 'transparent' : `${ACCENT}05` }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: colors.text, whiteSpace: 'nowrap' }}>{fmtDate(e.logged_at)}</td>
                        {selectedTracker.metrics.map(m => (
                          <td key={m.name} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: colors.text, fontVariantNumeric: 'tabular-nums' }}>
                            {e.values?.[m.name] ?? '—'}
                          </td>
                        ))}
                        <td style={{ padding: '0.5rem 0.75rem', color: colors.textSecondary, fontSize: '0.78rem' }}>{e.note || ''}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                          <button onClick={() => setDeleteConfirm({ type: 'entry', id: e.id })}
                            style={{ fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: '0.3rem', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Share / Export ── */}
      {trackers.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <SharePanel
            filename="measurements.pdf"
            textSummary={trackers.map(tr => tr.name + ': ' + (entries.filter(e => e.tracker_id === tr.id).length) + ' entries').join('\n')}
            getBlob={async () => {
              const { default: jsPDF } = await import('jspdf')
              const pdf = new jsPDF()
              pdf.setFontSize(16); pdf.text('Measurement Tracker', 14, 18)
              let y = 30; pdf.setFontSize(10)
              trackers.forEach(tr => {
                if (y > 260) { pdf.addPage(); y = 18 }
                const trEntries = entries.filter(e => e.tracker_id === tr.id)
                pdf.setFontSize(11); pdf.text((tr.icon || '') + ' ' + tr.name, 14, y); y += 7
                pdf.setFontSize(9)
                trEntries.slice(-10).forEach(e => {
                  if (y > 270) { pdf.addPage(); y = 18 }
                  pdf.text('  ' + (e.recorded_at || e.date || '') + '  ' + (tr.metrics || []).map(m => m.label + ': ' + (e.values?.[m.id] || '')).join('  '), 14, y)
                  y += 6
                })
                y += 4
              })
              return pdf.output('arraybuffer')
            }}
          />
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showTrackerForm && (
        <TrackerFormModal
          initial={editingTracker}
          onSave={handleSaveTracker}
          onClose={() => { setShowTrackerForm(false); setEditingTracker(null) }}
          colors={colors}
        />
      )}

      {showEntryForm && selectedTracker && (
        <EntryFormModal
          tracker={selectedTracker}
          onSave={handleSaveEntry}
          onClose={() => setShowEntryForm(false)}
          colors={colors}
        />
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: colors.card, borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem', width: '100%', maxWidth: 360 }}>
            <h3 style={{ margin: '0 0 0.75rem', color: colors.text, fontSize: '1rem' }}>
              {deleteConfirm.type === 'tracker' ? '🗑️ Delete Tracker?' : '🗑️ Delete Entry?'}
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: colors.textSecondary, fontSize: '0.85rem' }}>
              {deleteConfirm.type === 'tracker' ? 'This will permanently delete the tracker and all its entries.' : 'This entry will be permanently deleted.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
