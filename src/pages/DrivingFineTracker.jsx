import { useState, useCallback, useMemo, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../utils/supabase'

const ACCENT = '#f97316'
const STORAGE_KEY = 'typely_driving_fines'
const SESSION_KEY = 'typely_session_id'
const SUSPENSION_THRESHOLD = 20

const VIOLATIONS = [
  { id: 'signal-jump',    label: 'Signal Jumping',           points: 4, defaultFine: 1000,  icon: '🚦' },
  { id: 'speeding-minor', label: 'Speeding (minor)',          points: 2, defaultFine: 500,   icon: '💨' },
  { id: 'speeding-major', label: 'Speeding (major)',          points: 4, defaultFine: 2000,  icon: '⚡' },
  { id: 'wrong-lane',     label: 'Wrong Lane / One-Way',      points: 3, defaultFine: 1000,  icon: '↩️' },
  { id: 'no-seatbelt',    label: 'No Seatbelt',               points: 2, defaultFine: 500,   icon: '🔒' },
  { id: 'phone-driving',  label: 'Phone While Driving',       points: 3, defaultFine: 1000,  icon: '📱' },
  { id: 'wrong-parking',  label: 'Wrong Parking',             points: 1, defaultFine: 500,   icon: '🅿️' },
  { id: 'no-license',     label: 'Driving Without License',   points: 6, defaultFine: 5000,  icon: '📄' },
  { id: 'drunk-driving',  label: 'Reckless / Drunk Driving',  points: 8, defaultFine: 10000, icon: '🚨' },
  { id: 'overloading',    label: 'Overloading',               points: 2, defaultFine: 1000,  icon: '⚖️' },
  { id: 'tint',           label: 'Illegal Window Tint',       points: 1, defaultFine: 500,   icon: '🪟' },
  { id: 'other',          label: 'Other Violation',           points: 2, defaultFine: 500,   icon: '⚠️' },
]

const TIPS = [
  { icon: '🚦', text: 'Signal jumping carries 4 points — one of the most common violations in Pakistan. Always check signals before intersections.' },
  { icon: '📸', text: 'Keep a photo of your license in Google Drive — saves time and hassle if stopped by traffic police.' },
  { icon: '🖥️', text: 'Lahore, Karachi, and Islamabad traffic police now share challan data digitally — violations follow you across cities.' },
]

function getRiskLevel(points) {
  if (points <= 5)  return { label: 'Clean',             icon: '🟢', color: '#22c55e', bg: '#dcfce7', desc: 'No risk — keep it up!' }
  if (points <= 10) return { label: 'Caution',           icon: '🟡', color: '#eab308', bg: '#fef9c3', desc: 'Review your driving habits.' }
  if (points <= 15) return { label: 'At Risk',           icon: '🟠', color: '#f97316', bg: '#ffedd5', desc: 'Warning level reached.' }
  if (points <= 20) return { label: 'High Risk',         icon: '🔴', color: '#ef4444', bg: '#fee2e2', desc: 'Possible suspension warning.' }
  return             { label: 'Critical',                icon: '🚨', color: '#dc2626', bg: '#fef2f2', desc: 'License suspension likely.' }
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
}

function monthKey(iso) {
  return iso ? iso.slice(0, 7) : ''
}

function fmtPKR(n) {
  return `PKR ${Number(n).toLocaleString('en-PK')}`
}

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function loadFines() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

function saveFines(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function RecoveryCodeBox({ colors }) {
  const [copied, setCopied] = useState(false)
  const [restoreVal, setRestoreVal] = useState('')
  const [restoreMsg, setRestoreMsg] = useState('')
  const code = getSessionId()

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRestore() {
    const v = restoreVal.trim()
    if (!v) return
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRe.test(v)) { setRestoreMsg('Invalid code format.'); return }
    localStorage.setItem(SESSION_KEY, v)
    setRestoreMsg('Code applied! Reload the page to fetch your data.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <code style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.12)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: colors.text, letterSpacing: '0.03em', wordBreak: 'break-all' }}>{code}</code>
        <button onClick={handleCopy} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Paste recovery code to restore on this device…"
          value={restoreVal}
          onChange={e => setRestoreVal(e.target.value)}
          style={{ fontSize: '0.72rem', flex: 1, minWidth: 200, padding: '0.25rem 0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.3)', background: 'transparent', color: colors.text, outline: 'none' }}
        />
        <button onClick={handleRestore} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
          Restore
        </button>
      </div>
      {restoreMsg && <p style={{ margin: 0, fontSize: '0.72rem', color: '#f59e0b' }}>{restoreMsg}</p>}
    </div>
  )
}

function violationMeta(id) {
  return VIOLATIONS.find((v) => v.id === id) || VIOLATIONS[VIOLATIONS.length - 1]
}

// ── SVG Arc Gauge ─────────────────────────────────────────────────────────────

function RiskGauge({ points, riskLevel }) {
  const pct = Math.min(points / SUSPENSION_THRESHOLD, 1)
  const R = 70
  const cx = 90
  const cy = 90
  const startAngle = -210
  const sweepTotal = 240
  const toRad = (deg) => (deg * Math.PI) / 180

  function arcPath(startDeg, endDeg, r) {
    const s = toRad(startDeg)
    const e = toRad(endDeg)
    const x1 = cx + r * Math.cos(s)
    const y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e)
    const y2 = cy + r * Math.sin(e)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const trackEnd = startAngle + sweepTotal
  const fillEnd = startAngle + sweepTotal * pct

  return (
    <svg viewBox="0 0 180 110" style={{ width: '220px', overflow: 'visible' }} aria-label={`Risk gauge: ${points} points`}>
      {/* Track */}
      <path
        d={arcPath(startAngle, trackEnd, R)}
        fill="none"
        strokeWidth="10"
        stroke="rgba(120,120,120,0.18)"
        strokeLinecap="round"
      />
      {/* Fill */}
      {pct > 0 && (
        <path
          d={arcPath(startAngle, fillEnd, R)}
          fill="none"
          strokeWidth="10"
          stroke={riskLevel.color}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      )}
      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="26" fontWeight="800" fill={riskLevel.color}>
        {points}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">
        pts / {SUSPENSION_THRESHOLD}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" fill="#94a3b8">
        suspension threshold
      </text>
    </svg>
  )
}

// ── Violation Form Modal ───────────────────────────────────────────────────────

function ViolationModal({ editItem, onSave, onClose, colors }) {
  const today = todayISO()
  const [date, setDate]                   = useState(editItem?.date || today)
  const [violationType, setViolationType] = useState(editItem?.violation_type || '')
  const [location, setLocation]           = useState(editItem?.location || '')
  const [fineAmount, setFineAmount]       = useState(editItem?.fine_amount != null ? String(editItem.fine_amount) : '')
  const [paid, setPaid]                   = useState(editItem?.paid ?? false)
  const [notes, setNotes]                 = useState(editItem?.notes || '')
  const [error, setError]                 = useState('')

  const selectedViolation = useMemo(() => VIOLATIONS.find((v) => v.id === violationType), [violationType])

  function handleViolationChange(id) {
    setViolationType(id)
    const v = VIOLATIONS.find((x) => x.id === id)
    if (v) setFineAmount(String(v.defaultFine))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!date) { setError('Please select a date.'); return }
    if (!violationType) { setError('Please select a violation type.'); return }
    setError('')
    onSave({
      date,
      violation_type: violationType,
      location: location.trim(),
      fine_amount: parseFloat(fineAmount) || 0,
      risk_points: selectedViolation?.points ?? 2,
      paid,
      notes: notes.trim(),
    })
  }

  const inputStyle = {
    background: colors.input,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    color: colors.text,
    padding: '0.55rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: colors.card,
        borderRadius: '1rem',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>
            {editItem ? '✏️ Edit Violation' : '➕ Log Violation'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: '1.2rem', padding: '0.2rem', lineHeight: 1 }}
            aria-label="Close"
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Date */}
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
          </div>

          {/* Violation type */}
          <div>
            <label style={labelStyle}>Violation Type *</label>
            <select value={violationType} onChange={(e) => handleViolationChange(e.target.value)} style={inputStyle} required>
              <option value="">— Select violation —</option>
              {VIOLATIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.icon} {v.label} (+{v.points} pts, PKR {v.defaultFine.toLocaleString()})
                </option>
              ))}
            </select>
            {selectedViolation && (
              <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{
                  background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, color: ACCENT,
                  borderRadius: '9999px', padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
                }}>+{selectedViolation.points} risk pts</span>
                <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>will be added to your 12-month total</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Gulberg, Lahore"
              style={inputStyle}
            />
          </div>

          {/* Fine amount */}
          <div>
            <label style={labelStyle}>Fine Amount (PKR)</label>
            <input
              type="number"
              value={fineAmount}
              min="0"
              onChange={(e) => setFineAmount(e.target.value)}
              placeholder="500"
              style={inputStyle}
            />
          </div>

          {/* Paid toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setPaid((p) => !p)}
              style={{
                width: '44px', height: '24px', borderRadius: '9999px', border: 'none',
                background: paid ? '#22c55e' : colors.inputBorder,
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
              aria-pressed={paid}
            >
              <span style={{
                position: 'absolute', top: '2px',
                left: paid ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
            <span style={{ fontSize: '0.875rem', color: colors.text, fontWeight: 500 }}>
              {paid ? '✅ Fine paid' : '⏳ Fine unpaid'}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.6rem 0.85rem', color: '#b91c1c', fontSize: '0.83rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: `1px solid ${colors.inputBorder}`,
                background: 'transparent', color: colors.text, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
              }}
            >Cancel</button>
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '0.5rem', border: 'none',
                background: ACCENT, color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700,
              }}
            >{editItem ? 'Save Changes' : 'Log Violation'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Violation Card ─────────────────────────────────────────────────────────────

function ViolationCard({ fine, onEdit, onDelete, onMarkPaid, colors }) {
  const meta = violationMeta(fine.violation_type)
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${fine.paid ? colors.border : '#fbbf2455'}`,
      borderLeft: `4px solid ${fine.paid ? '#22c55e' : ACCENT}`,
      borderRadius: '0.75rem',
      padding: '1rem 1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{meta.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>{meta.label}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.1rem' }}>
              {formatDate(fine.date)}{fine.location ? ` · ${fine.location}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <span style={{
            background: fine.paid ? '#dcfce7' : '#fff7ed',
            color: fine.paid ? '#166534' : '#9a3412',
            border: `1px solid ${fine.paid ? '#86efac' : '#fdba74'}`,
            borderRadius: '9999px',
            padding: '0.15rem 0.6rem',
            fontSize: '0.7rem',
            fontWeight: 700,
          }}>{fine.paid ? '✅ Paid' : '⏳ Unpaid'}</span>
          <span style={{
            background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`,
            color: ACCENT, borderRadius: '9999px',
            padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 700,
          }}>+{fine.risk_points} pts</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: fine.paid ? colors.textSecondary : '#ea580c' }}>
          {fmtPKR(fine.fine_amount)}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {!fine.paid && (
            <button
              onClick={() => onMarkPaid(fine.id)}
              style={{
                background: '#dcfce7', border: '1px solid #86efac', color: '#166534',
                borderRadius: '0.4rem', padding: '0.25rem 0.7rem',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              }}
            >✅ Mark Paid</button>
          )}
          <button
            onClick={() => onEdit(fine)}
            style={{
              background: 'transparent', border: `1px solid ${colors.inputBorder}`,
              color: colors.textSecondary, borderRadius: '0.4rem',
              padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
            }}
          >✏️</button>
          <button
            onClick={() => onDelete(fine.id)}
            style={{
              background: 'transparent', border: '1px solid #fca5a5',
              color: '#ef4444', borderRadius: '0.4rem',
              padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
            }}
          >🗑</button>
        </div>
      </div>

      {fine.notes && (
        <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textSecondary, fontStyle: 'italic' }}>"{fine.notes}"</p>
      )}
    </div>
  )
}

// ── Points bar chart (last 6 months) ─────────────────────────────────────────

function PointsChart({ fines, colors }) {
  const months = useMemo(() => {
    const result = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-PK', { month: 'short' })
      const pts = fines.filter((f) => f.date && f.date.startsWith(key)).reduce((s, f) => s + (f.risk_points || 0), 0)
      result.push({ key, label, pts })
    }
    return result
  }, [fines])

  const maxPts = Math.max(...months.map((m) => m.pts), 1)

  return (
    <div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Risk Points — Last 6 Months
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '80px' }}>
        {months.map((m) => (
          <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: ACCENT, fontWeight: 700 }}>{m.pts > 0 ? m.pts : ''}</span>
            <div style={{
              width: '100%',
              height: `${Math.max((m.pts / maxPts) * 60, m.pts > 0 ? 6 : 2)}px`,
              background: m.pts > 0 ? ACCENT : colors.border,
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.4s ease',
            }} />
            <span style={{ fontSize: '0.68rem', color: colors.textSecondary }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Violation type breakdown ───────────────────────────────────────────────────

function ViolationBreakdown({ fines, colors }) {
  const counts = useMemo(() => {
    const map = {}
    fines.forEach((f) => {
      map[f.violation_type] = (map[f.violation_type] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [fines])

  if (counts.length === 0) return null
  const max = counts[0][1]

  return (
    <div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Top Violations
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {counts.map(([id, count]) => {
          const meta = violationMeta(id)
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem', width: '22px', textAlign: 'center', flexShrink: 0 }}>{meta.icon}</span>
              <span style={{ fontSize: '0.78rem', color: colors.text, width: '130px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.label}</span>
              <div style={{ flex: 1, background: colors.border, borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: ACCENT, borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: ACCENT, fontWeight: 700, width: '18px', textAlign: 'right', flexShrink: 0 }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DrivingFineTracker() {
  const { isDark, colors } = useTheme()
  const [fines, setFines] = useState(loadFines)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [cityFilter, setCityFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)

  // Sync to Supabase on mount
  useEffect(() => {
    async function fetchFromSupabase() {
      const sid = getSessionId()
      setSyncing(true)
      try {
        const { data, error } = await supabase
          .from('driving_fines')
          .select('*')
          .eq('user_id', sid)
          .order('date', { ascending: false })
        if (!error && data && data.length > 0) {
          setFines(data)
          saveFines(data)
        }
      } catch { /* offline — use localStorage */ }
      finally { setSyncing(false) }
    }
    fetchFromSupabase()
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const twelveMonthsAgo = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 1)
    return d.toISOString().split('T')[0]
  }, [])

  const recentFines  = useMemo(() => fines.filter((f) => f.date >= twelveMonthsAgo), [fines, twelveMonthsAgo])
  const totalPoints  = useMemo(() => recentFines.reduce((s, f) => s + (f.risk_points || 0), 0), [recentFines])
  const riskLevel    = useMemo(() => getRiskLevel(totalPoints), [totalPoints])
  const totalFines   = useMemo(() => fines.reduce((s, f) => s + (f.fine_amount || 0), 0), [fines])
  const unpaidFines  = useMemo(() => fines.filter((f) => !f.paid), [fines])
  const unpaidTotal  = useMemo(() => unpaidFines.reduce((s, f) => s + (f.fine_amount || 0), 0), [unpaidFines])

  // City filter
  const cities = useMemo(() => {
    const set = new Set(fines.map((f) => f.location?.trim()).filter(Boolean))
    return [...set]
  }, [fines])

  const filteredFines = useMemo(() => {
    if (cityFilter === 'all') return fines
    return fines.filter((f) => f.location?.trim() === cityFilter)
  }, [fines, cityFilter])

  // Group by month
  const groupedFines = useMemo(() => {
    const sorted = [...filteredFines].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const groups = {}
    sorted.forEach((f) => {
      const mk = monthKey(f.date)
      if (!groups[mk]) groups[mk] = { label: f.date ? monthLabel(f.date) : 'Unknown', items: [] }
      groups[mk].items.push(f)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredFines])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (formData) => {
    const sid = getSessionId()
    if (editItem) {
      // Update
      const updated = { ...editItem, ...formData }
      const newList = fines.map((f) => (f.id === editItem.id ? updated : f))
      setFines(newList)
      saveFines(newList)
      try {
        await supabase.from('driving_fines').update({ ...formData }).eq('id', editItem.id).eq('user_id', sid)
      } catch { /* ignore */ }
    } else {
      // Insert
      const newFine = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: sid,
        created_at: new Date().toISOString(),
        ...formData,
      }
      const newList = [newFine, ...fines]
      setFines(newList)
      saveFines(newList)
      try {
        await supabase.from('driving_fines').insert([newFine])
      } catch { /* ignore */ }
    }
    setShowModal(false)
    setEditItem(null)
  }, [fines, editItem])

  const handleDelete = useCallback(async (id) => {
    const newList = fines.filter((f) => f.id !== id)
    setFines(newList)
    saveFines(newList)
    try {
      const sid = getSessionId()
      await supabase.from('driving_fines').delete().eq('id', id).eq('user_id', sid)
    } catch { /* ignore */ }
  }, [fines])

  const handleMarkPaid = useCallback(async (id) => {
    const newList = fines.map((f) => (f.id === id ? { ...f, paid: true } : f))
    setFines(newList)
    saveFines(newList)
    try {
      const sid = getSessionId()
      await supabase.from('driving_fines').update({ paid: true }).eq('id', id).eq('user_id', sid)
    } catch { /* ignore */ }
  }, [fines])

  const handleEdit = useCallback((fine) => {
    setEditItem(fine)
    setShowModal(true)
  }, [])

  // ── Styles ────────────────────────────────────────────────────────────────

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.875rem',
    padding: '1.5rem',
  }

  const sectionTitle = {
    fontSize: '1rem',
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 1.25rem',
  }

  return (
    <ToolLayout toolId="driving-fines">
      {/* ── Page heading ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: colors.text, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🚗 Driving Fine & License Risk Tracker
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Track Pakistan traffic violations, monitor your license risk points, and never miss an unpaid challan.
        </p>
        {syncing && (
          <span style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.35rem', display: 'inline-block' }}>⟳ Syncing…</span>
        )}
      </div>

      {/* ── Risk Dashboard ── */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem', background: isDark ? '#1e293b' : '#fff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          {/* Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <RiskGauge points={totalPoints} riskLevel={riskLevel} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: riskLevel.bg, borderRadius: '9999px',
              padding: '0.35rem 1rem', marginTop: '-0.25rem',
            }}>
              <span style={{ fontSize: '1rem' }}>{riskLevel.icon}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: riskLevel.color }}>{riskLevel.label}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: colors.textSecondary, textAlign: 'center' }}>
              {riskLevel.desc}
            </span>
          </div>

          {/* Stats grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', minWidth: '240px' }}>
            {[
              { label: 'Total Fines', value: fmtPKR(totalFines), icon: '💰', color: colors.text },
              { label: 'Unpaid Fines', value: fmtPKR(unpaidTotal), icon: '⚠️', color: unpaidTotal > 0 ? '#ef4444' : '#22c55e' },
              { label: 'Violations', value: fines.length, icon: '📋', color: colors.text },
              { label: 'Points This Year', value: `${totalPoints} / ${SUSPENSION_THRESHOLD}`, icon: '🎯', color: riskLevel.color },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '0.6rem', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.72rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspension warning bar */}
        {totalPoints > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '0.35rem' }}>
              <span>0 pts</span>
              <span style={{ color: riskLevel.color, fontWeight: 600 }}>{totalPoints} pts in last 12 months</span>
              <span>{SUSPENSION_THRESHOLD} pts — suspension</span>
            </div>
            <div style={{ height: '8px', background: colors.border, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min((totalPoints / SUSPENSION_THRESHOLD) * 100, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, #22c55e, ${riskLevel.color})`,
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Unpaid fines alert ── */}
      {unpaidFines.length > 0 && (
        <div style={{
          background: isDark ? '#451a03' : '#fff7ed',
          border: `1px solid ${isDark ? '#9a3412' : '#fdba74'}`,
          borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span style={{ fontWeight: 700, color: isDark ? '#fed7aa' : '#9a3412', fontSize: '0.95rem' }}>
              You have {unpaidFines.length} unpaid fine{unpaidFines.length > 1 ? 's' : ''} totalling {fmtPKR(unpaidTotal)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {unpaidFines.slice(0, 5).map((f) => {
              const meta = violationMeta(f.violation_type)
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: isDark ? '#fed7aa' : '#92400e' }}>
                    {meta.icon} {meta.label} — {formatDate(f.date)} — {fmtPKR(f.fine_amount)}
                  </span>
                  <button
                    onClick={() => handleMarkPaid(f.id)}
                    style={{
                      background: '#22c55e', border: 'none', color: '#fff',
                      borderRadius: '0.4rem', padding: '0.3rem 0.8rem',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >✅ Mark Paid</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      {fines.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={cardStyle}><PointsChart fines={fines} colors={colors} /></div>
          <div style={cardStyle}><ViolationBreakdown fines={fines} colors={colors} /></div>
        </div>
      )}

      {/* ── Violations timeline ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 style={{ ...sectionTitle, margin: 0 }}>📋 Violations Log</h2>
          <button
            onClick={() => { setEditItem(null); setShowModal(true) }}
            style={{
              background: ACCENT, border: 'none', color: '#fff',
              borderRadius: '0.6rem', padding: '0.55rem 1.25rem',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <span>➕</span> Log Violation
          </button>
        </div>

        {/* City filter chips */}
        {cities.length > 1 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['all', ...cities].map((c) => (
              <button
                key={c}
                onClick={() => setCityFilter(c)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  border: `1.5px solid ${cityFilter === c ? ACCENT : colors.inputBorder}`,
                  background: cityFilter === c ? ACCENT : colors.input,
                  color: cityFilter === c ? '#fff' : colors.text,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: cityFilter === c ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {c === 'all' ? '🗺 All Cities' : `📍 ${c}`}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {fines.length === 0 ? (
          <div style={{
            ...cardStyle,
            textAlign: 'center', padding: '3rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          }}>
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.text, margin: 0 }}>
              No violations logged yet — that's the goal!
            </h3>
            <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: 0 }}>
              Use this tracker to log any Pakistan traffic challans and monitor your license risk.
            </p>
            <button
              onClick={() => { setEditItem(null); setShowModal(true) }}
              style={{
                background: ACCENT, border: 'none', color: '#fff',
                borderRadius: '0.6rem', padding: '0.65rem 1.5rem',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              }}
            >➕ Add First Violation</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {groupedFines.map(([mk, group]) => (
              <div key={mk}>
                <div style={{
                  fontSize: '0.78rem', fontWeight: 700,
                  color: colors.textSecondary,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '0.3rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                  marginBottom: '0.75rem',
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {group.items.map((fine) => (
                    <ViolationCard
                      key={fine.id}
                      fine={fine}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onMarkPaid={handleMarkPaid}
                      colors={colors}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tips panel ── */}
      <div style={{ ...cardStyle, background: isDark ? '#1e293b' : '#fff7ed', border: `1px solid ${isDark ? '#334155' : '#fdba74'}` }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.text, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          💡 Pakistan Driving Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>{tip.icon}</span>
              <span style={{ fontSize: '0.85rem', color: colors.text, lineHeight: 1.55 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div style={{
        background: isDark ? '#1e293b' : '#f8fafc',
        border: `1px solid ${colors.border}`,
        borderRadius: '0.6rem',
        padding: '0.75rem 1rem',
        fontSize: '0.78rem',
        color: colors.textSecondary,
        marginTop: '1.25rem',
        lineHeight: 1.6,
      }}>
        ⚠️ Risk point thresholds are approximate guidelines based on Pakistan Traffic Police rules. Always consult official sources for legal advice regarding license suspension.
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <ViolationModal
          editItem={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null) }}
          colors={colors}
        />
      )}

      {/* ── Disclaimers ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
          <span>💾</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
              <strong style={{ color: colors.text }}>Data is device-specific.</strong>{' '}
              Your records are tied to this browser on this device. Switching browsers, clearing cache, or using a different device will show a blank slate. Save your Recovery Code below to restore access from another device.
            </p>
            <RecoveryCodeBox colors={colors} />
          </div>
        </div>
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
          <span>🔌</span>
          <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: colors.text }}>Manual entry only.</strong>{' '}
            No official traffic police API is currently available in Pakistan for automated chalan lookup. All records are entered manually. Live integration will be added if/when an official API becomes available.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
