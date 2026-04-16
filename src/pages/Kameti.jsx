import { useState, useEffect, useRef, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const STORAGE_KEY = 'kameti_v1'
const ACCENT = '#8b5cf6'
const FONT = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL  = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function fmtPKR(n) {
  return 'PKR\u00a0' + Number(n).toLocaleString('en-US')
}

function addMonthsTo(startMonth, startYear, n) {
  const total = (startMonth - 1) + n
  return { month: (total % 12) + 1, year: startYear + Math.floor(total / 12) }
}

function monthLabel(m, y)      { return MONTHS_FULL[m - 1]  + ' ' + y }
function shortMonthLabel(m, y) { return MONTHS_SHORT[m - 1] + ' ' + y }

function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

const BLANK = {
  name: '',
  contribution: 5000,
  startMonth: new Date().getMonth() + 1,
  startYear: new Date().getFullYear(),
  members: [],      // [{id, name}] — array index = turn / round index
  myMemberId: null,
  payments: {},     // `${roundIdx}-${memberId}` → boolean
}

// ─── stat card sub-component ──────────────────────────────────────────────────
function StatCard({ label, icon, value, sub, color, colors, isDark, highlight }) {
  return (
    <div style={{
      flex: 1, minWidth: '140px',
      background: highlight
        ? (isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.04)')
        : colors.surface,
      border: `1px solid ${highlight ? color + '55' : colors.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: '0.875rem',
      padding: '0.875rem 1rem',
    }}>
      <div style={{
        fontSize: '0.7rem', fontWeight: 700, color: colors.muted,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem',
      }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 800, color, lineHeight: 1.25 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: colors.muted, marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Kameti() {
  const { isDark, colors } = useTheme()

  // Detect read-only (shared link) before any state init
  const readOnly = useMemo(() => {
    try { return !!new URLSearchParams(window.location.search).get('state') }
    catch { return false }
  }, [])

  const [state, setState] = useState(() => {
    // Try URL param first (shared link → read-only)
    try {
      const params  = new URLSearchParams(window.location.search)
      const encoded = params.get('state')
      if (encoded) return { ...BLANK, ...JSON.parse(atob(encoded)) }
    } catch { /* ignore */ }
    // Then localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...BLANK, ...JSON.parse(saved) }
    } catch { /* ignore */ }
    return BLANK
  })

  const [view,          setView]          = useState(() =>
    state.name && state.members.length >= 2 ? 'main' : 'setup'
  )
  const [newName,       setNewName]       = useState('')
  const [dragIdx,       setDragIdx]       = useState(null)
  const [copied,        setCopied]        = useState(false)
  const [expandedRound, setExpandedRound] = useState(null)

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (readOnly) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
    catch { /* ignore */ }
  }, [state, readOnly])

  // ── Derived helpers ────────────────────────────────────────────────────────
  const now      = new Date()
  const curMonth = now.getMonth() + 1
  const curYear  = now.getFullYear()
  const totalRounds = state.members.length

  function roundDate(idx) {
    return addMonthsTo(state.startMonth, state.startYear, idx)
  }

  function roundStatus(idx) {
    const { month, year } = roundDate(idx)
    if (year < curYear  || (year === curYear && month < curMonth)) return 'past'
    if (year === curYear && month === curMonth)                    return 'current'
    return 'future'
  }

  function payKey(ri, memberId) { return `${ri}-${memberId}` }

  function isPaid(ri, memberId) {
    return !!((state.payments || {})[payKey(ri, memberId)])
  }

  function togglePayment(ri, memberId) {
    if (readOnly) return
    const key = payKey(ri, memberId)
    setState(s => ({
      ...s,
      payments: { ...(s.payments || {}), [key]: !(s.payments || {})[key] },
    }))
  }

  function roundPaidCount(ri) {
    return state.members.filter(m => isPaid(ri, m.id)).length
  }

  // First non-past round index
  const nextRoundIdx = (() => {
    for (let i = 0; i < totalRounds; i++) {
      if (roundStatus(i) !== 'past') return i
    }
    return Math.max(0, totalRounds - 1)
  })()

  const myMemberIdx = state.members.findIndex(m => m.id === state.myMemberId)

  // ── Handlers ───────────────────────────────────────────────────────────────
  function addMember() {
    const name = newName.trim()
    if (!name) return
    setState(s => ({ ...s, members: [...s.members, { id: genId(), name }] }))
    setNewName('')
  }

  function removeMember(id) {
    setState(s => ({
      ...s,
      members:    s.members.filter(m => m.id !== id),
      myMemberId: s.myMemberId === id ? null : s.myMemberId,
    }))
  }

  function shuffleOrder() {
    setState(s => {
      const arr = [...s.members]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return { ...s, members: arr }
    })
  }

  // HTML5 drag-and-drop reorder
  const dragIdxRef = useRef(null)
  function onDragStart(idx) { dragIdxRef.current = idx; setDragIdx(idx) }
  function onDragOver(e, idx) {
    e.preventDefault()
    const from = dragIdxRef.current
    if (from === null || from === idx) return
    setState(s => {
      const arr = [...s.members]
      const [item] = arr.splice(from, 1)
      arr.splice(idx, 0, item)
      return { ...s, members: arr }
    })
    dragIdxRef.current = idx
    setDragIdx(idx)
  }
  function onDragEnd() { dragIdxRef.current = null; setDragIdx(null) }

  function share() {
    try {
      const url = window.location.origin + '/tools/kameti?state=' + btoa(JSON.stringify(state))
      navigator.clipboard.writeText(url)
    } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function reset() {
    if (!window.confirm('Reset this kameti? All data will be lost.')) return
    setState(BLANK)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setView('setup')
  }

  // ── Shared style helpers ───────────────────────────────────────────────────
  const IS = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.6rem',
    color: colors.text,
    fontSize: '0.9rem',
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const BP = {
    background: ACCENT, color: '#fff', border: 'none',
    borderRadius: '0.6rem', padding: '0.55rem 1.25rem',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
    fontFamily: FONT, whiteSpace: 'nowrap',
  }

  const BS = (col = ACCENT) => ({
    background: 'transparent', color: col,
    border: `1px solid ${col}`, borderRadius: '0.6rem',
    padding: '0.4rem 0.875rem', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.8rem',
    fontFamily: FONT, whiteSpace: 'nowrap',
  })

  const CARD = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '1rem',
    padding: '1.25rem',
  }

  const LABEL = {
    display: 'block', fontSize: '0.8rem',
    fontWeight: 600, color: colors.muted,
    marginBottom: '0.3rem',
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP VIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (view === 'setup') {
    const canStart = state.members.length >= 2
    const previewEnd = canStart
      ? roundDate(state.members.length - 1)
      : null

    return (
      <ToolLayout toolId="kameti">
        <div style={{ fontFamily: FONT, maxWidth: 640, margin: '0 auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.35rem',
              background: `linear-gradient(135deg, ${ACCENT}, #a78bfa)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>🤝 Kameti Tracker</h1>
            <p style={{ color: colors.muted, margin: 0, fontSize: '0.875rem' }}>
              Track your savings circle — who pays, who collects, and when
            </p>
          </div>

          {/* ── Committee details ── */}
          <div style={{ ...CARD, marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
              📋 Committee Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <div>
                <label style={LABEL}>Committee Name</label>
                <input
                  style={IS}
                  placeholder="e.g. Family Kameti 2025"
                  value={state.name}
                  onChange={e => setState(s => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div>
                <label style={LABEL}>Monthly Contribution per Member (PKR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', color: colors.muted,
                    fontSize: '0.82rem', pointerEvents: 'none',
                  }}>PKR</span>
                  <input
                    type="number" min={100} step={500}
                    style={{ ...IS, paddingLeft: '3.25rem' }}
                    value={state.contribution}
                    onChange={e => setState(s => ({ ...s, contribution: Math.max(1, Number(e.target.value)) }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={LABEL}>Start Month</label>
                  <select
                    style={IS}
                    value={state.startMonth}
                    onChange={e => setState(s => ({ ...s, startMonth: Number(e.target.value) }))}
                  >
                    {MONTHS_FULL.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '110px' }}>
                  <label style={LABEL}>Start Year</label>
                  <select
                    style={IS}
                    value={state.startYear}
                    onChange={e => setState(s => ({ ...s, startYear: Number(e.target.value) }))}
                  >
                    {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview banner */}
              {canStart && previewEnd && (
                <div style={{
                  padding: '0.65rem 0.875rem',
                  background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.07)',
                  borderRadius: '0.5rem', fontSize: '0.82rem', color: ACCENT, fontWeight: 600,
                }}>
                  💰 Pot = {fmtPKR(state.contribution * state.members.length)} &nbsp;·&nbsp;
                  {monthLabel(state.startMonth, state.startYear)} → {monthLabel(previewEnd.month, previewEnd.year)}
                </div>
              )}
            </div>
          </div>

          {/* ── Members & turn order ── */}
          <div style={{ ...CARD, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
                👥 Members &amp; Turn Order
                <span style={{ marginLeft: '0.5rem', fontWeight: 400, color: colors.muted, fontSize: '0.82rem' }}>
                  ({state.members.length})
                </span>
              </h2>
              {state.members.length >= 2 && (
                <button style={BS()} onClick={shuffleOrder}>🔀 Randomize</button>
              )}
            </div>

            {/* Add member */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <input
                style={{ ...IS, flex: 1 }}
                placeholder="Enter name and press Add (or Enter)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMember()}
              />
              <button style={BP} onClick={addMember}>+ Add</button>
            </div>

            {state.members.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '1.5rem', color: colors.muted,
                fontSize: '0.85rem', borderRadius: '0.6rem',
                border: `1px dashed ${colors.border}`,
              }}>
                Add at least 2 members to create a kameti
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {state.members.map((m, idx) => {
                    const rd = roundDate(idx)
                    return (
                      <div
                        key={m.id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={e => onDragOver(e, idx)}
                        onDragEnd={onDragEnd}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          background: dragIdx === idx
                            ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.09)')
                            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                          border: `1px solid ${dragIdx === idx ? ACCENT : colors.border}`,
                          borderRadius: '0.5rem',
                          cursor: 'grab',
                          transition: 'border-color 0.12s, background 0.12s',
                          userSelect: 'none',
                        }}
                      >
                        {/* Drag handle */}
                        <span style={{ color: colors.muted, fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>⠿</span>

                        {/* Turn number */}
                        <span style={{
                          width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: ACCENT + '22', color: ACCENT,
                          fontSize: '0.7rem', fontWeight: 800,
                        }}>{idx + 1}</span>

                        {/* Name */}
                        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: colors.text }}>
                          {m.name}
                        </span>

                        {/* Scheduled month */}
                        <span style={{ fontSize: '0.75rem', color: colors.muted, flexShrink: 0 }}>
                          {shortMonthLabel(rd.month, rd.year)}
                        </span>

                        {/* "Set as me" toggle */}
                        <button
                          onClick={() => setState(s => ({
                            ...s,
                            myMemberId: s.myMemberId === m.id ? null : m.id,
                          }))}
                          style={{
                            padding: '0.15rem 0.55rem', borderRadius: '999px',
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 700, fontFamily: FONT,
                            background: state.myMemberId === m.id
                              ? ACCENT
                              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                            color: state.myMemberId === m.id ? '#fff' : colors.muted,
                            transition: 'all 0.15s', flexShrink: 0,
                          }}
                        >
                          {state.myMemberId === m.id ? '⭐ Me' : 'Set me'}
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeMember(m.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: isDark ? '#f87171' : '#ef4444',
                            fontSize: '1.15rem', padding: '0 0.1rem', lineHeight: 1, fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >×</button>
                      </div>
                    )
                  })}
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.73rem', color: colors.muted, textAlign: 'center' }}>
                  Drag rows to reorder turns · Click "Set me" to mark your position
                </p>
              </>
            )}
          </div>

          {/* Launch button */}
          {canStart && (
            <button
              style={{ ...BP, width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.75rem' }}
              onClick={() => {
                if (!state.name.trim()) setState(s => ({ ...s, name: 'My Kameti' }))
                setView('main')
              }}
            >
              Launch Kameti →
            </button>
          )}
        </div>
      </ToolLayout>
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN VIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const nextCollector      = state.members[nextRoundIdx]
  const nextRdDate         = roundDate(nextRoundIdx)
  const roundsRemaining    = totalRounds - nextRoundIdx
  const myRoundDate        = myMemberIdx >= 0 ? roundDate(myMemberIdx) : null
  const monthsToMyTurn     = myMemberIdx >= 0 ? myMemberIdx - nextRoundIdx : null
  const myTurnStatus       = myMemberIdx < 0 ? null : roundStatus(myMemberIdx)

  // Overall progress: how many rounds are fully past
  const completedRounds = (() => {
    let n = 0
    for (let i = 0; i < totalRounds; i++) {
      if (roundStatus(i) === 'past') n++
    }
    return n
  })()

  return (
    <ToolLayout toolId="kameti">
      <div style={{ fontFamily: FONT, maxWidth: 820, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 800, margin: '0 0 0.2rem',
              background: `linear-gradient(135deg, ${ACCENT}, #a78bfa)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              🤝 {state.name || 'Kameti'}
            </h1>
            <p style={{ color: colors.muted, margin: 0, fontSize: '0.82rem' }}>
              {fmtPKR(state.contribution)}/month · {totalRounds} members ·{' '}
              Started {monthLabel(state.startMonth, state.startYear)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {readOnly && (
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: ACCENT,
              }}>👁 Read-only</span>
            )}
            {!readOnly && (
              <>
                <button style={BS()} onClick={share}>
                  {copied ? '✓ Link copied!' : '🔗 Share'}
                </button>
                <button style={BS(colors.muted)} onClick={() => setView('setup')}>✏️ Edit</button>
                <button style={BS('#ef4444')} onClick={reset}>🗑</button>
              </>
            )}
          </div>
        </div>

        {/* ── Overall progress bar ── */}
        <div style={{ ...CARD, padding: '0.875rem 1.125rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: colors.muted, marginBottom: '0.45rem' }}>
            <span>Overall Progress</span>
            <span style={{ color: ACCENT }}>{completedRounds} / {totalRounds} rounds done</span>
          </div>
          <div style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              width: totalRounds > 0 ? `${(completedRounds / totalRounds) * 100}%` : '0%',
              background: `linear-gradient(to right, ${ACCENT}, #a78bfa)`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '1.5rem' }}>
          <StatCard
            label="Total Pot" icon="💰"
            value={fmtPKR(state.contribution * totalRounds)}
            sub={`${fmtPKR(state.contribution)} × ${totalRounds} members`}
            color={ACCENT} colors={colors} isDark={isDark}
          />
          <StatCard
            label="Next Collection" icon="📅"
            value={nextCollector?.name ?? '—'}
            sub={monthLabel(nextRdDate.month, nextRdDate.year)}
            color="#10b981" colors={colors} isDark={isDark}
          />
          <StatCard
            label="Rounds Left" icon="⏳"
            value={roundsRemaining}
            sub={`${completedRounds} of ${totalRounds} completed`}
            color="#f59e0b" colors={colors} isDark={isDark}
          />
          {myMemberIdx >= 0 && myRoundDate && (
            <StatCard
              label="My Turn" icon="⭐"
              value={
                myTurnStatus === 'past'    ? 'Collected! ✓' :
                myTurnStatus === 'current' ? '🎉 RIGHT NOW' :
                monthLabel(myRoundDate.month, myRoundDate.year)
              }
              sub={
                myTurnStatus === 'past'    ? `Was ${shortMonthLabel(myRoundDate.month, myRoundDate.year)}` :
                myTurnStatus === 'current' ? "It's your collection month!" :
                monthsToMyTurn === 1       ? 'Next month!' :
                `in ${monthsToMyTurn} months`
              }
              color={myTurnStatus === 'current' ? '#10b981' : ACCENT}
              colors={colors} isDark={isDark}
              highlight={myTurnStatus === 'current'}
            />
          )}
        </div>

        {/* ── Monthly schedule ── */}
        <div style={{ ...CARD, padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.875rem 1.25rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
              📆 Monthly Schedule
            </h2>
            <span style={{ fontSize: '0.78rem', color: colors.muted }}>
              Click a row to mark payments
            </span>
          </div>

          <div style={{ maxHeight: '540px', overflowY: 'auto' }}>
            {Array.from({ length: totalRounds }).map((_, ri) => {
              const collector  = state.members[ri]
              const rd         = roundDate(ri)
              const status     = roundStatus(ri)
              const isMe       = collector?.id === state.myMemberId
              const paidCount  = roundPaidCount(ri)
              const allPaid    = paidCount === totalRounds
              const isExpanded = expandedRound === ri

              const rowBg = status === 'current'
                ? (isDark ? 'rgba(139,92,246,0.09)' : 'rgba(139,92,246,0.05)')
                : isMe
                ? (isDark ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.025)')
                : 'transparent'

              return (
                <div key={ri} style={{
                  borderBottom: ri < totalRounds - 1 ? `1px solid ${colors.border}` : 'none',
                  background: rowBg,
                }}>
                  {/* ── Collapsed row ── */}
                  <div
                    onClick={() => setExpandedRound(isExpanded ? null : ri)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 1.25rem',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {/* Status circle */}
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 800,
                      background:
                        status === 'current'              ? ACCENT :
                        status === 'past' && allPaid      ? '#10b981' :
                        status === 'past'                 ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') :
                        (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      color: status === 'current' || (status === 'past' && allPaid) ? '#fff' : colors.muted,
                      border: (status === 'current' || (status === 'past' && allPaid))
                        ? 'none'
                        : `1px solid ${colors.border}`,
                    }}>
                      {status === 'past' && allPaid ? '✓' : ri + 1}
                    </div>

                    {/* Month label */}
                    <div style={{ width: '7.5rem', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.875rem', fontWeight: 700,
                        color: status === 'current' ? ACCENT : status === 'past' ? colors.muted : colors.text,
                      }}>
                        {MONTHS_SHORT[rd.month - 1]} {rd.year}
                      </div>
                      {status === 'current' && (
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: ACCENT, letterSpacing: '0.05em' }}>
                          ● CURRENT
                        </div>
                      )}
                    </div>

                    {/* Collector name */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.875rem', fontWeight: isMe ? 700 : 600,
                        color: isMe ? ACCENT : status === 'past' ? colors.muted : colors.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {isMe && '⭐ '}{collector?.name ?? 'Unknown'}
                      </span>
                      {isMe && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem',
                          borderRadius: '999px', flexShrink: 0,
                          background: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.12)',
                          color: ACCENT,
                        }}>YOU</span>
                      )}
                    </div>

                    {/* Pot size & payment status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: '0.1rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text }}>
                        {fmtPKR(state.contribution * totalRounds)}
                      </span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: allPaid ? '#10b981' : paidCount > 0 ? '#f59e0b' : colors.muted,
                      }}>
                        {paidCount}/{totalRounds} paid
                      </span>
                    </div>

                    {/* Expand chevron */}
                    <span style={{
                      color: colors.muted, fontSize: '0.7rem', flexShrink: 0,
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>▼</span>
                  </div>

                  {/* ── Expanded payment panel ── */}
                  {isExpanded && (
                    <div style={{
                      padding: '0.875rem 1.25rem 1.125rem',
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                    }}>
                      <div style={{ marginBottom: '0.6rem', fontSize: '0.78rem', fontWeight: 600, color: colors.muted }}>
                        Contributions for {monthLabel(rd.month, rd.year)}
                        {readOnly ? ' (read-only)' : ' — click to toggle paid/unpaid:'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {state.members.map(member => {
                          const paid        = isPaid(ri, member.id)
                          const isCollector = member.id === collector?.id
                          return (
                            <button
                              key={member.id}
                              onClick={() => togglePayment(ri, member.id)}
                              disabled={readOnly}
                              title={`${member.name}: ${paid ? 'Paid ✓' : 'Not paid'}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.3rem 0.7rem', borderRadius: '999px',
                                border: `1px solid ${
                                  paid            ? '#10b981' :
                                  isCollector     ? ACCENT + '60' :
                                  colors.border
                                }`,
                                background: paid
                                  ? (isDark ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.09)')
                                  : isCollector
                                  ? (isDark ? 'rgba(139,92,246,0.09)' : 'rgba(139,92,246,0.05)')
                                  : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                cursor: readOnly ? 'default' : 'pointer',
                                fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                                color: paid ? '#10b981' : isCollector ? ACCENT : colors.text,
                                transition: 'all 0.14s',
                              }}
                            >
                              <span style={{ fontSize: '0.75rem' }}>{paid ? '✓' : '○'}</span>
                              <span>{member.name}</span>
                              {isCollector && <span style={{ fontSize: '0.7rem' }}>🏆</span>}
                              <span style={{ fontSize: '0.7rem', opacity: 0.75, color: colors.muted }}>
                                {fmtPKR(state.contribution)}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Payment progress bar */}
                      <div style={{ marginTop: '0.875rem' }}>
                        <div style={{
                          height: '5px',
                          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                          borderRadius: '999px', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: '999px',
                            width: totalRounds > 0 ? `${(paidCount / totalRounds) * 100}%` : '0%',
                            background: allPaid ? '#10b981' : ACCENT,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginTop: '0.35rem', fontSize: '0.72rem', color: colors.muted,
                        }}>
                          <span>{paidCount} of {totalRounds} members paid</span>
                          <span style={{ color: allPaid ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                            {fmtPKR(paidCount * state.contribution)} / {fmtPKR(state.contribution * totalRounds)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Turn order summary ── */}
        <div style={{ ...CARD, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.text }}>
              👥 Member Turn Order
            </h2>
            {!readOnly && (
              <button style={BS()} onClick={() => setView('setup')}>✏️ Reorder</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {state.members.map((m, idx) => {
              const rd        = roundDate(idx)
              const status    = roundStatus(idx)
              const isMe      = m.id === state.myMemberId
              const paidCount = roundPaidCount(idx)
              const allPaid   = paidCount === totalRounds

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.45rem 0.75rem', borderRadius: '0.5rem',
                    background: isMe
                      ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)')
                      : status === 'current'
                      ? (isDark ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.03)')
                      : 'transparent',
                    border: `1px solid ${isMe ? ACCENT + '40' : 'transparent'}`,
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Status dot */}
                  <span style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800,
                    background:
                      status === 'current'             ? ACCENT :
                      status === 'past' && allPaid     ? '#10b981' :
                      status === 'past'                ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') :
                      (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    color: (status === 'current' || (status === 'past' && allPaid)) ? '#fff' : colors.muted,
                  }}>
                    {status === 'past' && allPaid ? '✓' : idx + 1}
                  </span>

                  {/* Name */}
                  <span style={{
                    flex: 1, fontSize: '0.875rem', fontWeight: isMe ? 700 : 600,
                    color: isMe ? ACCENT : status === 'past' ? colors.muted : colors.text,
                  }}>
                    {m.name}{isMe ? ' (me)' : ''}
                  </span>

                  {/* Date */}
                  <span style={{
                    fontSize: '0.78rem', flexShrink: 0,
                    color: status === 'current' ? ACCENT : status === 'past' ? colors.muted : colors.textSecondary,
                  }}>
                    {shortMonthLabel(rd.month, rd.year)}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    fontSize: '0.63rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                    borderRadius: '999px', flexShrink: 0,
                    background:
                      status === 'current' ? (isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.12)') :
                      status === 'past'    ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') :
                      (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    color: status === 'current' ? ACCENT : colors.muted,
                  }}>
                    {status === 'current' ? 'NOW' : status === 'past' ? `${paidCount}/${totalRounds}` : 'upcoming'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Info footer ── */}
        <div style={{ fontSize: '0.78rem', color: colors.muted, textAlign: 'center', paddingBottom: '1rem' }}>
          💡 Each member pays {fmtPKR(state.contribution)} monthly · Collector receives {fmtPKR(state.contribution * totalRounds)} · All data saved locally
        </div>
      </div>
    </ToolLayout>
  )
}
