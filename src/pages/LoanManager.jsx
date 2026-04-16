import { useState, useEffect, useCallback, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#f59e0b'
const LS_KEY = 'typely_loans'

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmtPKR(n) {
  return 'PKR\u202f' + Math.round(n).toLocaleString('en-PK')
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysElapsed(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function daysUntilDue(iso) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function paidAmount(loan) {
  return (loan.payments || []).reduce((s, p) => s + p.amount, 0)
}

function remainingAmount(loan) {
  return Math.max(0, loan.amount - paidAmount(loan))
}

function loanStatus(loan) {
  if (loan.settled) return 'settled'
  const paid = paidAmount(loan)
  if (paid > 0 && paid < loan.amount) return 'partial'
  return 'active'
}

function loadLoans() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLoans(loans) {
  localStorage.setItem(LS_KEY, JSON.stringify(loans))
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const config = {
    settled:  { bg: '#10b98122', color: '#10b981', label: '✓ Settled' },
    partial:  { bg: '#f59e0b22', color: '#f59e0b', label: '◑ Partial' },
    active:   { bg: '#3b82f622', color: '#3b82f6', label: '● Active'  },
  }
  const { bg, color, label } = config[status] || config.active
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.6rem',
      background: bg, color,
      borderRadius: '2rem',
      fontSize: '0.7rem', fontWeight: 700,
      letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  )
}

function ProgressBar({ paid, total }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0
  return (
    <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.4rem' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: pct >= 100 ? '#10b981' : ACCENT,
        borderRadius: '4px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

/* ── Payment Modal ──────────────────────────────────────────────────────── */
function PaymentModal({ loan, colors, isDark, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]     = useState('')
  const [err, setErr]       = useState('')

  const remaining = remainingAmount(loan)

  function handleSubmit(e) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setErr('Enter a valid amount')
    if (amt > remaining) return setErr(`Max payable is ${fmtPKR(remaining)}`)
    onSave({ amount: amt, date, note: note.trim() })
    onClose()
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }
  const modal = {
    background: colors.card, borderRadius: '1rem',
    padding: '1.75rem', width: '100%', maxWidth: '420px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  }
  const inp = {
    width: '100%', padding: '0.6rem 0.75rem',
    background: colors.input, border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem', color: colors.text, fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const label = { display: 'block', fontSize: '0.78rem', color: colors.textSecondary, marginBottom: '0.3rem', fontWeight: 600 }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: colors.text }}>
            💸 Record Payment — <span style={{ color: ACCENT }}>{loan.person}</span>
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '0.6rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: colors.textSecondary }}>
          Original: <strong style={{ color: colors.text }}>{fmtPKR(loan.amount)}</strong>
          &nbsp;·&nbsp;Paid: <strong style={{ color: '#10b981' }}>{fmtPKR(paidAmount(loan))}</strong>
          &nbsp;·&nbsp;Remaining: <strong style={{ color: ACCENT }}>{fmtPKR(remaining)}</strong>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={label}>Payment Amount (PKR) *</label>
            <input style={inp} type="number" min="1" max={remaining} step="0.01"
              placeholder={`Max ${fmtPKR(remaining)}`}
              value={amount} onChange={e => { setAmount(e.target.value); setErr('') }} required />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} type="button"
                  onClick={() => { setAmount(String(Math.round(remaining * pct / 100))); setErr('') }}
                  style={{
                    padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: 600,
                    background: isDark ? '#1e293b' : '#f1f5f9', color: colors.textSecondary,
                    border: `1px solid ${colors.border}`, borderRadius: '0.35rem', cursor: 'pointer',
                  }}>
                  {pct}%
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={label}>Payment Date *</label>
            <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={label}>Note (optional)</label>
            <input style={inp} type="text" placeholder="e.g. Cash via JazzCash" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          {err && <p style={{ margin: 0, color: '#ef4444', fontSize: '0.78rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.55rem 1.1rem', borderRadius: '0.5rem', border: `1px solid ${colors.border}`, background: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button type="submit"
              style={{ padding: '0.55rem 1.25rem', borderRadius: '0.5rem', background: ACCENT, color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Payment History Modal ──────────────────────────────────────────────── */
function HistoryModal({ loan, colors, isDark, onClose, onDeletePayment }) {
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }
  const modal = {
    background: colors.card, borderRadius: '1rem',
    padding: '1.75rem', width: '100%', maxWidth: '460px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: '90vh', overflowY: 'auto',
  }
  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: colors.text }}>
            📋 Payment History — <span style={{ color: ACCENT }}>{loan.person}</span>
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>

        {loan.payments.length === 0 ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>No payments recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {loan.payments.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '0.6rem', gap: '0.5rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.92rem' }}>{fmtPKR(p.amount)}</div>
                  <div style={{ fontSize: '0.74rem', color: colors.textSecondary, marginTop: '0.1rem' }}>
                    {fmtDate(p.date)}{p.note ? ` · ${p.note}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => onDeletePayment(i)}
                  title="Delete payment"
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem 0.4rem', borderRadius: '0.3rem', flexShrink: 0 }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '0.6rem', fontSize: '0.82rem', color: colors.textSecondary, display: 'flex', justifyContent: 'space-between' }}>
          <span>Total paid</span>
          <strong style={{ color: '#10b981' }}>{fmtPKR(paidAmount(loan))}</strong>
        </div>
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button onClick={onClose}
            style={{ padding: '0.5rem 1.1rem', borderRadius: '0.5rem', border: `1px solid ${colors.border}`, background: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Loan Card ──────────────────────────────────────────────────────────── */
function LoanCard({ loan, colors, isDark, onPayment, onSettle, onDelete, onViewHistory }) {
  const status     = loanStatus(loan)
  const paid       = paidAmount(loan)
  const remaining  = remainingAmount(loan)
  const elapsed    = daysElapsed(loan.date)
  const dueDays    = daysUntilDue(loan.dueDate)
  const isOverdue  = dueDays !== null && dueDays < 0 && !loan.settled

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${isOverdue ? '#ef444444' : colors.border}`,
      borderLeft: `3px solid ${isOverdue ? '#ef4444' : status === 'settled' ? '#10b981' : ACCENT}`,
      borderRadius: '0.85rem',
      padding: '1.1rem 1.2rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: `${ACCENT}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: ACCENT,
          }}>
            {loan.person.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {loan.person}
            </div>
            <div style={{ fontSize: '0.72rem', color: colors.textSecondary }}>
              {loan.type === 'lent' ? 'Lent on' : 'Borrowed on'} {fmtDate(loan.date)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: colors.text }}>{fmtPKR(loan.amount)}</div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Progress bar */}
      {paid > 0 && <ProgressBar paid={paid} total={loan.amount} />}

      {/* Balance row */}
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: colors.textSecondary, flexWrap: 'wrap' }}>
        {paid > 0 && <span>Paid: <strong style={{ color: '#10b981' }}>{fmtPKR(paid)}</strong></span>}
        {!loan.settled && remaining > 0 && <span>Remaining: <strong style={{ color: ACCENT }}>{fmtPKR(remaining)}</strong></span>}
        <span>{elapsed === 0 ? 'Today' : `${elapsed}d ago`}</span>
        {loan.dueDate && (
          <span style={{ color: isOverdue ? '#ef4444' : dueDays <= 3 ? '#f59e0b' : colors.textSecondary }}>
            Due: {isOverdue ? `${Math.abs(dueDays)}d overdue` : dueDays === 0 ? 'Due today' : `${dueDays}d left`}
          </span>
        )}
      </div>

      {/* Note */}
      {loan.note && (
        <div style={{ fontSize: '0.77rem', color: colors.textSecondary, fontStyle: 'italic', paddingLeft: '0.25rem', borderLeft: `2px solid ${colors.border}`, marginTop: '0.1rem' }}>
          {loan.note}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
        {!loan.settled && remaining > 0 && (
          <button onClick={() => onPayment(loan)}
            style={{
              padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 600,
              background: ACCENT, color: '#000', border: 'none', borderRadius: '0.4rem', cursor: 'pointer',
            }}>
            💰 Record Payment
          </button>
        )}
        {!loan.settled && (
          <button onClick={() => onSettle(loan.id)}
            style={{
              padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 600,
              background: '#10b98122', color: '#10b981', border: '1px solid #10b98144', borderRadius: '0.4rem', cursor: 'pointer',
            }}>
            ✓ Mark Settled
          </button>
        )}
        {loan.payments.length > 0 && (
          <button onClick={() => onViewHistory(loan)}
            style={{
              padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 600,
              background: 'none', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: '0.4rem', cursor: 'pointer',
            }}>
            📋 History ({loan.payments.length})
          </button>
        )}
        <button onClick={() => onDelete(loan.id)}
          style={{
            padding: '0.35rem 0.7rem', fontSize: '0.76rem',
            background: 'none', color: '#ef444499', border: `1px solid #ef444422`, borderRadius: '0.4rem', cursor: 'pointer',
            marginLeft: 'auto',
          }}>
          🗑
        </button>
      </div>
    </div>
  )
}

/* ── Add Loan Form ──────────────────────────────────────────────────────── */
function AddLoanForm({ activeTab, colors, isDark, onAdd }) {
  const emptyForm = { person: '', amount: '', date: new Date().toISOString().slice(0, 10), dueDate: '', note: '' }
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen]  = useState(false)
  const [err, setErr]    = useState({})

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErr(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.person.trim()) e.person = 'Name is required'
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount'
    if (!form.date) e.date = 'Date is required'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) return setErr(errors)
    onAdd({
      id: Date.now().toString(),
      type: activeTab,
      person: form.person.trim(),
      amount: parseFloat(form.amount),
      date: form.date,
      dueDate: form.dueDate || null,
      note: form.note.trim(),
      payments: [],
      settled: false,
    })
    setForm(emptyForm)
    setOpen(false)
    setErr({})
  }

  const inp = (extra = {}) => ({
    width: '100%', padding: '0.6rem 0.75rem',
    background: colors.input, border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem', color: colors.text, fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
    ...extra,
  })
  const lbl = { display: 'block', fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '0.3rem', fontWeight: 600 }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      width: '100%', padding: '0.85rem 1rem',
      background: `${ACCENT}11`, border: `1.5px dashed ${ACCENT}55`,
      borderRadius: '0.85rem', cursor: 'pointer',
      color: ACCENT, fontSize: '0.88rem', fontWeight: 600,
      justifyContent: 'center', transition: 'background 0.2s',
    }}>
      <span style={{ fontSize: '1.1rem' }}>+</span>
      Add {activeTab === 'lent' ? 'Loan I Gave' : 'Loan I Owe'}
    </button>
  )

  return (
    <div style={{
      background: colors.card, border: `1px solid ${ACCENT}44`,
      borderRadius: '0.85rem', padding: '1.25rem 1.35rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: colors.text }}>
          {activeTab === 'lent' ? '🤝 New Loan Given' : '💼 New Loan Received'}
        </h3>
        <button onClick={() => { setOpen(false); setErr({}) }}
          style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label style={lbl}>Person Name *</label>
            <input style={inp(err.person ? { borderColor: '#ef4444' } : {})}
              placeholder={activeTab === 'lent' ? 'Who did you lend to?' : 'Who lent you?'}
              value={form.person} onChange={e => set('person', e.target.value)} />
            {err.person && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{err.person}</span>}
          </div>

          <div>
            <label style={lbl}>Amount (PKR) *</label>
            <input style={inp(err.amount ? { borderColor: '#ef4444' } : {})}
              type="number" min="1" step="0.01" placeholder="e.g. 5000"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
            {err.amount && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{err.amount}</span>}
          </div>

          <div>
            <label style={lbl}>Date *</label>
            <input style={inp(err.date ? { borderColor: '#ef4444' } : {})}
              type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            {err.date && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{err.date}</span>}
          </div>

          <div>
            <label style={lbl}>Due Date (optional)</label>
            <input style={inp()} type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Note (optional)</label>
            <input style={inp()} type="text" placeholder="e.g. for wedding expenses"
              value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" onClick={() => { setOpen(false); setErr({}) }}
            style={{ padding: '0.55rem 1.1rem', borderRadius: '0.5rem', border: `1px solid ${colors.border}`, background: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '0.85rem' }}>
            Cancel
          </button>
          <button type="submit"
            style={{ padding: '0.55rem 1.35rem', borderRadius: '0.5rem', background: ACCENT, color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
            + Add Loan
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function LoanManager() {
  const { isDark, colors } = useTheme()
  const [loans, setLoans]             = useState(loadLoans)
  const [activeTab, setActiveTab]     = useState('lent')
  const [filter, setFilter]           = useState('all')
  const [sortBy, setSortBy]           = useState('newest')
  const [paymentFor, setPaymentFor]   = useState(null)
  const [historyFor, setHistoryFor]   = useState(null)

  useEffect(() => { saveLoans(loans) }, [loans])

  /* ── Actions ── */
  const addLoan = useCallback(loan => {
    setLoans(ls => [loan, ...ls])
  }, [])

  const recordPayment = useCallback((loanId, payment) => {
    setLoans(ls => ls.map(l => {
      if (l.id !== loanId) return l
      const newPayments = [...l.payments, payment]
      const totalPaid   = newPayments.reduce((s, p) => s + p.amount, 0)
      return { ...l, payments: newPayments, settled: totalPaid >= l.amount }
    }))
  }, [])

  const deletePayment = useCallback((loanId, idx) => {
    setLoans(ls => ls.map(l => {
      if (l.id !== loanId) return l
      const newPayments = l.payments.filter((_, i) => i !== idx)
      const totalPaid   = newPayments.reduce((s, p) => s + p.amount, 0)
      return { ...l, payments: newPayments, settled: totalPaid >= l.amount }
    }))
    setHistoryFor(prev => {
      if (!prev || prev.id !== loanId) return prev
      const updated = loans.find(l => l.id === loanId)
      if (!updated) return prev
      return { ...updated, payments: updated.payments.filter((_, i) => i !== idx) }
    })
  }, [loans])

  const settleLoan = useCallback(id => {
    setLoans(ls => ls.map(l => l.id === id ? { ...l, settled: true } : l))
  }, [])

  const deleteLoan = useCallback(id => {
    if (window.confirm('Delete this loan? This cannot be undone.')) {
      setLoans(ls => ls.filter(l => l.id !== id))
    }
  }, [])

  /* ── Derived data ── */
  const { totalLent, totalBorrowed, netOwed } = useMemo(() => {
    const tl = loans.filter(l => l.type === 'lent' && !l.settled).reduce((s, l) => s + remainingAmount(l), 0)
    const tb = loans.filter(l => l.type === 'borrowed' && !l.settled).reduce((s, l) => s + remainingAmount(l), 0)
    return { totalLent: tl, totalBorrowed: tb, netOwed: tl - tb }
  }, [loans])

  const visibleLoans = useMemo(() => {
    let list = loans.filter(l => l.type === activeTab)

    if (filter === 'active')  list = list.filter(l => !l.settled)
    if (filter === 'settled') list = list.filter(l =>  l.settled)

    list = [...list].sort((a, b) => {
      if (sortBy === 'newest')  return new Date(b.date) - new Date(a.date)
      if (sortBy === 'oldest')  return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount')  return b.amount - a.amount
      if (sortBy === 'overdue') {
        const oa = a.dueDate && !a.settled ? daysUntilDue(a.dueDate) : Infinity
        const ob = b.dueDate && !b.settled ? daysUntilDue(b.dueDate) : Infinity
        return oa - ob
      }
      return 0
    })

    return list
  }, [loans, activeTab, filter, sortBy])

  /* ── Styles ── */
  const tab = (id) => ({
    flex: 1, padding: '0.65rem 1rem', fontWeight: 700, fontSize: '0.88rem',
    cursor: 'pointer', transition: 'all 0.2s',
    border: 'none', borderRadius: '0.6rem',
    background: activeTab === id ? ACCENT : 'none',
    color: activeTab === id ? '#000' : colors.textSecondary,
  })

  const pillBtn = (active, color = ACCENT) => ({
    padding: '0.3rem 0.75rem', fontSize: '0.76rem', fontWeight: 600,
    cursor: 'pointer', borderRadius: '2rem', transition: 'all 0.15s',
    border: `1px solid ${active ? color : colors.border}`,
    background: active ? `${color}22` : 'none',
    color: active ? color : colors.textSecondary,
  })

  const summaryCard = (label, value, color, icon) => (
    <div style={{
      flex: '1 1 150px', background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.85rem', padding: '1rem 1.2rem',
      display: 'flex', flexDirection: 'column', gap: '0.3rem',
    }}>
      <div style={{ fontSize: '0.72rem', color: colors.textSecondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>{fmtPKR(Math.abs(value))}</div>
    </div>
  )

  return (
    <ToolLayout toolId="loan-manager">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Page title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤝</span> Loan Manager
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: colors.textSecondary, fontSize: '0.85rem' }}>
            Track money you've lent and borrowed — privately, offline, in PKR.
          </p>
        </div>

        {/* Summary bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {summaryCard('Total Lent (outstanding)', totalLent, '#f97316', '📤')}
          {summaryCard('Total Borrowed (outstanding)', totalBorrowed, '#3b82f6', '📥')}
          <div style={{
            flex: '1 1 150px', background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.85rem', padding: '1rem 1.2rem',
            display: 'flex', flexDirection: 'column', gap: '0.3rem',
          }}>
            <div style={{ fontSize: '0.72rem', color: colors.textSecondary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{netOwed >= 0 ? '📊' : '⚠️'}</span>
              Net Position
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: netOwed >= 0 ? '#10b981' : '#ef4444' }}>
              {netOwed >= 0 ? '+' : '−'}{fmtPKR(Math.abs(netOwed))}
            </div>
            <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
              {netOwed >= 0 ? 'others owe you more' : 'you owe more'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem',
          background: isDark ? '#1e293b' : '#f1f5f9',
          borderRadius: '0.75rem', padding: '0.3rem',
          marginBottom: '1.25rem',
        }}>
          <button style={tab('lent')} onClick={() => setActiveTab('lent')}>
            📤 I Lent
            {loans.filter(l => l.type === 'lent' && !l.settled).length > 0 && (
              <span style={{
                marginLeft: '0.4rem', background: activeTab === 'lent' ? '#00000033' : `${ACCENT}33`,
                color: activeTab === 'lent' ? '#000' : ACCENT,
                borderRadius: '2rem', padding: '0.05rem 0.45rem', fontSize: '0.72rem',
              }}>
                {loans.filter(l => l.type === 'lent' && !l.settled).length}
              </span>
            )}
          </button>
          <button style={tab('borrowed')} onClick={() => setActiveTab('borrowed')}>
            📥 I Borrowed
            {loans.filter(l => l.type === 'borrowed' && !l.settled).length > 0 && (
              <span style={{
                marginLeft: '0.4rem', background: activeTab === 'borrowed' ? '#00000033' : `${ACCENT}33`,
                color: activeTab === 'borrowed' ? '#000' : ACCENT,
                borderRadius: '2rem', padding: '0.05rem 0.45rem', fontSize: '0.72rem',
              }}>
                {loans.filter(l => l.type === 'borrowed' && !l.settled).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters & Sort */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'active', 'settled'].map(f => (
              <button key={f} style={pillBtn(filter === f)} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 600 }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '0.3rem 0.6rem', fontSize: '0.76rem', fontWeight: 600,
                background: colors.input, border: `1px solid ${colors.inputBorder}`,
                borderRadius: '0.45rem', color: colors.text, cursor: 'pointer', outline: 'none',
              }}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount">Amount ↓</option>
              <option value="overdue">Overdue first</option>
            </select>
          </div>
        </div>

        {/* Add form */}
        <div style={{ marginBottom: '1.1rem' }}>
          <AddLoanForm activeTab={activeTab} colors={colors} isDark={isDark} onAdd={addLoan} />
        </div>

        {/* Loan list */}
        {visibleLoans.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: colors.textSecondary, fontSize: '0.88rem',
            background: colors.card, borderRadius: '0.85rem', border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>
              {activeTab === 'lent' ? '📤' : '📥'}
            </div>
            <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: colors.text }}>
              No {filter !== 'all' ? filter + ' ' : ''}loans {activeTab === 'lent' ? 'given' : 'received'} yet
            </div>
            {filter !== 'all'
              ? <div>Try switching to "All" to see all entries.</div>
              : <div>Use the form above to record your first loan.</div>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visibleLoans.map(loan => (
              <LoanCard
                key={loan.id}
                loan={loan}
                colors={colors}
                isDark={isDark}
                onPayment={l => setPaymentFor(l)}
                onSettle={settleLoan}
                onDelete={deleteLoan}
                onViewHistory={l => setHistoryFor(l)}
              />
            ))}
          </div>
        )}

        {/* Footer count */}
        {visibleLoans.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: colors.textSecondary, marginTop: '1rem' }}>
            Showing {visibleLoans.length} loan{visibleLoans.length !== 1 ? 's' : ''}
          </p>
        )}

        <DisclaimerBlock type="financial" overrideBodyEn="All loan records are stored only in this browser's local storage. No data leaves your device. Clearing browser storage will erase all records — export or screenshot important entries." />
      </div>

      {/* Modals */}
      {paymentFor && (
        <PaymentModal
          loan={paymentFor}
          colors={colors}
          isDark={isDark}
          onClose={() => setPaymentFor(null)}
          onSave={payment => {
            recordPayment(paymentFor.id, payment)
            setPaymentFor(null)
          }}
        />
      )}
      {historyFor && (
        <HistoryModal
          loan={loans.find(l => l.id === historyFor.id) || historyFor}
          colors={colors}
          isDark={isDark}
          onClose={() => setHistoryFor(null)}
          onDeletePayment={idx => deletePayment(historyFor.id, idx)}
        />
      )}
    </ToolLayout>
  )
}
