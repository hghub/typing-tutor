import { useState, useMemo, useEffect, useCallback } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#8b5cf6'
const CURRENCIES = [
  { code: 'PKR', symbol: 'PKR' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
  { code: 'AED', symbol: 'AED' },
  { code: 'SAR', symbol: 'SAR' },
]
const TAX_PRESETS = ['0', '5', '13', '16']
const PAYMENT_KEY = 'rafiqy_bill_splitter_payment'
const SCENARIOS = [
  { id: 'restaurant', icon: '🍽️', label: 'Restaurant' },
  { id: 'household', icon: '🏠', label: 'Household' },
  { id: 'travel',     icon: '✈️', label: 'Travel'     },
  { id: 'other',      icon: '💡', label: 'Other'      },
]

let personCounter = 3
let expenseCounter = 0
function uid() { return ++expenseCounter }

function fmtNum(n) {
  return Math.abs(n).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function fmtAmt(n, sym) { return `${sym}\u202f${fmtNum(n)}` }

function roundUp(n, step) {
  if (step === 0) return n
  return Math.ceil(n / step) * step
}

/* ── Greedy settlement algorithm ── */
function calcSettlements(people, expenses) {
  const paid = {}
  people.forEach(p => (paid[p.id] = 0))
  expenses.forEach(e => { if (paid[e.paidById] !== undefined) paid[e.paidById] += e.amount })
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const share = people.length > 0 ? total / people.length : 0
  const net = {}
  people.forEach(p => (net[p.id] = (paid[p.id] || 0) - share))
  const debtors = people.filter(p => net[p.id] < -0.005).map(p => ({ ...p, amount: net[p.id] })).sort((a, b) => a.amount - b.amount)
  const creditors = people.filter(p => net[p.id] > 0.005).map(p => ({ ...p, amount: net[p.id] })).sort((a, b) => b.amount - a.amount)
  const transactions = []
  let d = 0, c = 0
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(-debtors[d].amount, creditors[c].amount)
    transactions.push({ from: debtors[d].name, to: creditors[c].name, amount })
    debtors[d].amount += amount
    creditors[c].amount -= amount
    if (Math.abs(debtors[d].amount) < 0.005) d++
    if (Math.abs(creditors[c].amount) < 0.005) c++
  }
  return { total, share, paid, net, transactions }
}

/* ── Shared sub-components ── */
function SI({ colors, ...props }) {
  return (
    <input {...props} style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
      color: colors.text, fontSize: '0.9rem', outline: 'none',
      width: '100%', boxSizing: 'border-box', ...props.style,
    }} />
  )
}
function SS({ colors, children, ...props }) {
  return (
    <select {...props} style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
      color: colors.text, fontSize: '0.9rem', outline: 'none', cursor: 'pointer', ...props.style,
    }}>{children}</select>
  )
}
function Lbl({ text, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {text && <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>{text}</label>}
      {children}
    </div>
  )
}
function Card({ children, colors, style = {} }) {
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', ...style }}>
      {children}
    </div>
  )
}
function OptToggle({ label, open, onToggle, colors }) {
  return (
    <button onClick={onToggle} style={{
      background: open ? `${ACCENT}18` : 'transparent',
      border: `1px solid ${open ? ACCENT : colors.border}`,
      borderRadius: '2rem', padding: '0.3rem 0.9rem',
      color: open ? ACCENT : colors.textSecondary,
      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      transition: 'all 0.15s',
    }}>
      {open ? '✕' : '+'} {label}
    </button>
  )
}

/* ══════════════════════════════════════════════════════
   QUICK BILL SPLIT TAB
══════════════════════════════════════════════════════ */
function QuickSplit({ colors, isDark }) {
  const [currency,    setCurrency]    = useState('PKR')
  const [scenario,    setScenario]    = useState('restaurant')
  const [subtotal,    setSubtotal]    = useState('')
  const [count,       setCount]       = useState(2)
  const [title,       setTitle]       = useState('')

  // Optional layers
  const [showTax,     setShowTax]     = useState(false)
  const [taxMode,     setTaxMode]     = useState('16')
  const [customTax,   setCustomTax]   = useState('')
  const [showTip,     setShowTip]     = useState(false)
  const [tipMode,     setTipMode]     = useState('10')
  const [customTip,   setCustomTip]   = useState('')
  const [showUnequal, setShowUnequal] = useState(false)
  const [shares,      setShares]      = useState([{ name: 'You', pct: '' }, { name: 'Friend', pct: '' }])
  const [showRound,   setShowRound]   = useState(false)
  const [roundStep,   setRoundStep]   = useState('10')
  const [showPayment, setShowPayment] = useState(false)
  const [payment,     setPayment]     = useState({ name: '', bank: '', account: '', mobile: '' })
  const [copied,      setCopied]      = useState(false)
  const [paidStatus,  setPaidStatus]  = useState(new Set())
  const [activeHistoryId, setActiveHistoryId] = useState(null)
  const [splitHistory,setSplitHistory]= useState([])
  const [showHistory, setShowHistory] = useState(false)

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? 'PKR'
  const scen = SCENARIOS.find(s => s.id === scenario)

  // Load saved payment info + split history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PAYMENT_KEY) || '{}')
      if (saved.name || saved.bank) setPayment(saved)
    } catch {}
    try {
      setSplitHistory(JSON.parse(localStorage.getItem('rafiqy_bill_history') || '[]'))
    } catch {}
  }, [])

  function savePayment(updated) {
    setPayment(updated)
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(updated))
  }

  // Sync shares array length to count
  useEffect(() => {
    setShares(prev => {
      const arr = Array.from({ length: count }, (_, i) => ({
        name: prev[i]?.name ?? (i === 0 ? 'You' : `Person ${i + 1}`),
        pct: prev[i]?.pct ?? '',
      }))
      return arr
    })
  }, [count])

  const taxPct = useMemo(() => {
    if (!showTax) return 0
    if (taxMode === 'custom') return parseFloat(customTax) || 0
    return parseFloat(taxMode) || 0
  }, [showTax, taxMode, customTax])

  const tipPct = useMemo(() => {
    if (!showTip) return 0
    if (tipMode === 'custom') return parseFloat(customTip) || 0
    return parseFloat(tipMode) || 0
  }, [showTip, tipMode, customTip])

  const sub = parseFloat(subtotal) || 0
  const taxAmt = sub * taxPct / 100
  const tipAmt = (sub + taxAmt) * tipPct / 100
  const total = sub + taxAmt + tipAmt

  const pctSum = shares.reduce((s, sh) => s + (parseFloat(sh.pct) || 0), 0)
  const pctValid = showUnequal ? Math.abs(pctSum - 100) < 0.5 : true

  const perPerson = useMemo(() => {
    if (total <= 0 || count < 1) return []
    if (!showUnequal) {
      const raw = total / count
      const step = parseInt(roundStep) || 0
      const val = showRound ? roundUp(raw, step) : raw
      return Array.from({ length: count }, (_, i) => ({ name: shares[i]?.name || `Person ${i+1}`, raw, val }))
    }
    return shares.map(sh => {
      const raw = total * (parseFloat(sh.pct) || 0) / 100
      const step = parseInt(roundStep) || 0
      const val = showRound ? roundUp(raw, step) : raw
      return { name: sh.name, raw, val }
    })
  }, [total, count, showUnequal, shares, showRound, roundStep])

  function buildMessage() {
    const lines = []
    lines.push(`${scen.icon} ${title || scen.label + ' Bill Split'}`)
    lines.push('─────────────────────')
    if (showTax && taxPct > 0) {
      lines.push(`Subtotal: ${fmtAmt(sub, sym)}`)
      lines.push(`Tax/Service (${taxPct}%): +${fmtAmt(taxAmt, sym)}`)
    }
    if (showTip && tipPct > 0) {
      lines.push(`Tip (${tipPct}%): +${fmtAmt(tipAmt, sym)}`)
    }
    lines.push(`Total Bill: ${fmtAmt(total, sym)}`)
    lines.push(`Split: ${count} ${count === 1 ? 'person' : 'people'}`)
    lines.push('')
    if (!showUnequal) {
      const pp = perPerson[0]
      if (pp) {
        lines.push(`Each pays: ${fmtAmt(pp.val, sym)}${showRound && pp.val !== pp.raw ? ` (rounded from ${fmtAmt(pp.raw, sym)})` : ''}`)
      }
    } else {
      lines.push('Individual shares:')
      perPerson.forEach(p => lines.push(`  ${p.name}: ${fmtAmt(p.val, sym)}`))
    }
    const hasPayment = payment.name || payment.bank || payment.account || payment.mobile
    if (hasPayment) {
      lines.push('')
      lines.push('Please transfer to:')
      if (payment.bank)    lines.push(`🏦 Bank: ${payment.bank}`)
      if (payment.name)    lines.push(`👤 Name: ${payment.name}`)
      if (payment.account) lines.push(`💳 Account: ${payment.account}`)
      if (payment.mobile)  lines.push(`📱 Mobile: ${payment.mobile}`)
    }
    lines.push('')
    lines.push('Generated via Rafiqy.app/tools/budget-splitter')
    return lines.join('\n')
  }

  function saveToHistory(paid = paidStatus) {
    const id = activeHistoryId ?? Date.now()
    const entry = {
      id, date: new Date().toLocaleDateString('en-PK'),
      // display fields
      title: title || scen.label + ' Bill Split', total: fmtAmt(total, sym),
      scenario: scen.icon, count,
      // full snapshot for reload
      currency, scenarioId: scenario, subtotal, rawTitle: title,
      showTax, taxMode, customTax,
      showTip, tipMode, customTip,
      showUnequal, shares, showRound, roundStep,
      // paid tracking
      paidStatus: [...paid],
      perPersonNames: perPerson.map(p => p.name),
    }
    setActiveHistoryId(id)
    const updated = [entry, ...splitHistory.filter(h => h.id !== id)].slice(0, 5)
    setSplitHistory(updated)
    localStorage.setItem('rafiqy_bill_history', JSON.stringify(updated))
  }

  function togglePaid(i) {
    setPaidStatus(prev => {
      const s = new Set(prev)
      s.has(i) ? s.delete(i) : s.add(i)
      if (activeHistoryId) {
        const updated = splitHistory.map(h =>
          h.id === activeHistoryId ? { ...h, paidStatus: [...s] } : h
        )
        setSplitHistory(updated)
        localStorage.setItem('rafiqy_bill_history', JSON.stringify(updated))
      }
      return s
    })
  }

  function loadFromHistory(h) {
    setCurrency(h.currency ?? 'PKR')
    setScenario(h.scenarioId ?? 'restaurant')
    setSubtotal(h.subtotal ?? '')
    setCount(h.count ?? 2)
    setTitle(h.rawTitle ?? '')
    setShowTax(h.showTax ?? false)
    setTaxMode(h.taxMode ?? '16')
    setCustomTax(h.customTax ?? '')
    setShowTip(h.showTip ?? false)
    setTipMode(h.tipMode ?? '10')
    setCustomTip(h.customTip ?? '')
    setShowUnequal(h.showUnequal ?? false)
    setShares(h.shares ?? [{ name: 'You', pct: '' }, { name: 'Friend', pct: '' }])
    setShowRound(h.showRound ?? false)
    setRoundStep(h.roundStep ?? '10')
    setPaidStatus(new Set(h.paidStatus ?? []))
    setActiveHistoryId(h.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function remindPerson(p) {
    const lines = [`Hey ${p.name}! 👋`, `Your share for "${title || scen.label}" is: ${fmtAmt(p.val, sym)}`]
    const hasPayment = payment.name || payment.bank || payment.account || payment.mobile
    if (hasPayment) {
      lines.push('', 'Please transfer to:')
      if (payment.bank)    lines.push(`🏦 Bank: ${payment.bank}`)
      if (payment.name)    lines.push(`👤 Name: ${payment.name}`)
      if (payment.account) lines.push(`💳 Account: ${payment.account}`)
      if (payment.mobile)  lines.push(`📱 Mobile: ${payment.mobile}`)
    }
    lines.push('', 'via Rafiqy.app')
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  function copyRequest() {
    navigator.clipboard.writeText(buildMessage()).then(() => {
      setCopied(true)
      saveToHistory()
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function shareWhatsApp() {
    saveToHistory()
    window.open(`https://wa.me/?text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener,noreferrer')
  }

  const canCompute = sub > 0 && count >= 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Core inputs ── */}
      <Card colors={colors}>
        {/* Scenario + currency row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenario(s.id)} style={{
                background: scenario === s.id ? `${ACCENT}18` : 'transparent',
                border: `1px solid ${scenario === s.id ? ACCENT : colors.border}`,
                borderRadius: '2rem', padding: '0.3rem 0.75rem',
                color: scenario === s.id ? ACCENT : colors.textSecondary,
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>{s.icon} {s.label}</button>
            ))}
          </div>
          <SS colors={colors} value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 'auto' }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
          </SS>
        </div>

        {/* Optional title */}
        <div style={{ marginBottom: '1rem' }}>
          <SI colors={colors} placeholder={`Label (optional) — e.g. "Dinner at Kolachi"`} value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Amount + count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <Lbl text={`Total Amount (${currency})`}>
            <SI colors={colors} type="number" min="0" placeholder="e.g. 5000" value={subtotal}
              onChange={e => setSubtotal(e.target.value)} style={{ fontSize: '1.1rem', fontWeight: 700 }} />
          </Lbl>
          <Lbl text="People">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button onClick={() => setCount(c => Math.max(2, c - 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}>−</button>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', minWidth: 24, textAlign: 'center', color: ACCENT }}>{count}</span>
              <button onClick={() => setCount(c => Math.min(50, c + 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}>+</button>
            </div>
          </Lbl>
        </div>
      </Card>

      {/* ── Optional layer toggles ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <OptToggle label="GST / Tax / Service"   open={showTax}     onToggle={() => setShowTax(v => !v)}     colors={colors} />
        <OptToggle label="Tip"                   open={showTip}     onToggle={() => setShowTip(v => !v)}     colors={colors} />
        <OptToggle label="Unequal split"          open={showUnequal} onToggle={() => setShowUnequal(v => !v)} colors={colors} />
        <OptToggle label="Round up"               open={showRound}   onToggle={() => setShowRound(v => !v)}   colors={colors} />
        <OptToggle label="Payment details"        open={showPayment} onToggle={() => setShowPayment(v => !v)} colors={colors} />
      </div>

      {/* ── GST panel ── */}
      {showTax && (
        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>GST / Tax / Service Charge</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: taxMode === 'custom' ? '0.75rem' : 0 }}>
            {TAX_PRESETS.map(p => (
              <button key={p} onClick={() => setTaxMode(p)} style={{
                padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: taxMode === p ? ACCENT : 'transparent',
                border: `1px solid ${taxMode === p ? ACCENT : colors.border}`,
                color: taxMode === p ? '#fff' : colors.text,
              }}>{p === '0' ? 'None' : `${p}%`}</button>
            ))}
            <button onClick={() => setTaxMode('custom')} style={{
              padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              background: taxMode === 'custom' ? ACCENT : 'transparent',
              border: `1px solid ${taxMode === 'custom' ? ACCENT : colors.border}`,
              color: taxMode === 'custom' ? '#fff' : colors.text,
            }}>Custom %</button>
          </div>
          {taxMode === 'custom' && (
            <SI colors={colors} type="number" min="0" max="100" placeholder="Enter %" value={customTax}
              onChange={e => setCustomTax(e.target.value)} style={{ maxWidth: 120, marginTop: '0.75rem' }} />
          )}
          {sub > 0 && taxPct > 0 && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: colors.textSecondary }}>
              Tax: <strong style={{ color: colors.text }}>{fmtAmt(taxAmt, sym)}</strong> · Total: <strong style={{ color: ACCENT, fontSize: '0.95rem' }}>{fmtAmt(total, sym)}</strong>
            </p>
          )}
        </Card>
      )}

      {/* ── Tip panel ── */}
      {showTip && (
        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tip</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['5', '10', '15', '20'].map(p => (
              <button key={p} onClick={() => setTipMode(p)} style={{
                padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: tipMode === p ? ACCENT : 'transparent',
                border: `1px solid ${tipMode === p ? ACCENT : colors.border}`,
                color: tipMode === p ? '#fff' : colors.text,
              }}>{p}%</button>
            ))}
            <button onClick={() => setTipMode('custom')} style={{
              padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              background: tipMode === 'custom' ? ACCENT : 'transparent',
              border: `1px solid ${tipMode === 'custom' ? ACCENT : colors.border}`,
              color: tipMode === 'custom' ? '#fff' : colors.text,
            }}>Custom %</button>
          </div>
          {tipMode === 'custom' && (
            <SI colors={colors} type="number" min="0" max="100" placeholder="Enter tip %" value={customTip}
              onChange={e => setCustomTip(e.target.value)} style={{ maxWidth: 120, marginTop: '0.75rem' }} />
          )}
          {sub > 0 && tipPct > 0 && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: colors.textSecondary }}>
              Tip: <strong style={{ color: colors.text }}>{fmtAmt(tipAmt, sym)}</strong>
            </p>
          )}
        </Card>
      )}

      {/* ── Unequal split panel ── */}
      {showUnequal && (
        <Card colors={colors}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom Split (%)</p>
            <span style={{ fontSize: '0.75rem', color: pctValid ? '#10b981' : '#ef4444', fontWeight: 700 }}>
              {pctSum.toFixed(0)}% {pctValid ? '✓' : '≠ 100%'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {shares.map((sh, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', alignItems: 'center' }}>
                <SI colors={colors} placeholder={`Person ${i + 1}`} value={sh.name}
                  onChange={e => setShares(prev => prev.map((s, j) => j === i ? { ...s, name: e.target.value } : s))} />
                <div style={{ position: 'relative' }}>
                  <SI colors={colors} type="number" min="0" max="100" placeholder="%" value={sh.pct}
                    onChange={e => setShares(prev => prev.map((s, j) => j === i ? { ...s, pct: e.target.value } : s))}
                    style={{ paddingRight: '1.6rem', textAlign: 'right' }} />
                  <span style={{ position: 'absolute', right: '0.55rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: colors.textSecondary, pointerEvents: 'none' }}>%</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => {
            const equal = (100 / count).toFixed(1)
            setShares(prev => prev.map(s => ({ ...s, pct: equal })))
          }} style={{ marginTop: '0.75rem', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer' }}>
            Auto-fill equal %
          </button>
        </Card>
      )}

      {/* ── Round up panel ── */}
      {showRound && (
        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Round Up Each Share To</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['10', '50', '100', '500'].map(s => (
              <button key={s} onClick={() => setRoundStep(s)} style={{
                padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: roundStep === s ? ACCENT : 'transparent',
                border: `1px solid ${roundStep === s ? ACCENT : colors.border}`,
                color: roundStep === s ? '#fff' : colors.text,
              }}>Nearest {s}</button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Payment details panel ── */}
      {showPayment && (
        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Details <span style={{ fontSize: '0.7rem', fontWeight: 400, color: colors.textSecondary, textTransform: 'none' }}>— saved to your browser only</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { key: 'name',    label: 'Account Title',       placeholder: 'e.g. Haider Raza' },
              { key: 'bank',    label: 'Bank / Wallet',        placeholder: 'e.g. Meezan Bank, SadaPay, EasyPaisa' },
              { key: 'account', label: 'Account / IBAN',       placeholder: 'e.g. 0123 4567 8901 or PK36MEZN...' },
              { key: 'mobile',  label: 'Mobile (JazzCash/EP)', placeholder: 'e.g. 03xx-xxxxxxx' },
            ].map(f => (
              <Lbl key={f.key} text={f.label}>
                <SI colors={colors} placeholder={f.placeholder} value={payment[f.key]}
                  onChange={e => savePayment({ ...payment, [f.key]: e.target.value })} />
              </Lbl>
            ))}
          </div>
        </Card>
      )}

      {/* ── Result ── */}
      {canCompute && (
        <Card colors={colors} style={{ border: `1.5px solid ${ACCENT}55`, background: isDark ? `${ACCENT}0a` : `${ACCENT}06` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {scen.icon} Result
            </p>
            {paidStatus.size > 0 && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: paidStatus.size === count ? '#10b981' : colors.textSecondary, background: paidStatus.size === count ? '#10b98115' : colors.bg, border: `1px solid ${paidStatus.size === count ? '#10b98144' : colors.border}`, borderRadius: '2rem', padding: '0.15rem 0.6rem' }}>
                {paidStatus.size}/{count} paid{paidStatus.size === count ? ' 🎉' : ''}
              </span>
            )}
          </div>

          {/* Summary line */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {showTax && taxPct > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtotal</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.text }}>{fmtAmt(sub, sym)}</p>
              </div>
            )}
            {showTax && taxPct > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax ({taxPct}%)</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>+{fmtAmt(taxAmt, sym)}</p>
              </div>
            )}
            {showTip && tipPct > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tip ({tipPct}%)</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>+{fmtAmt(tipAmt, sym)}</p>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.text }}>{fmtAmt(total, sym)}</p>
            </div>
          </div>

          {/* Per-person breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
            {perPerson.map((p, i) => {
              const isPaid = paidStatus.has(i)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.85rem', background: isPaid ? '#10b98110' : colors.bg, borderRadius: '0.6rem', border: `1px solid ${isPaid ? '#10b98144' : colors.border}`, transition: 'all 0.2s' }}>
                  <button
                    onClick={() => togglePaid(i)}
                    title={isPaid ? 'Mark unpaid' : 'Mark as paid'}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isPaid ? '#10b981' : colors.border}`, background: isPaid ? '#10b981' : 'transparent', cursor: 'pointer', fontSize: '0.65rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', lineHeight: 1 }}>
                    {isPaid ? '✓' : ''}
                  </button>
                  <span style={{ fontWeight: 600, color: isPaid ? colors.textSecondary : colors.text, fontSize: '0.9rem', flex: 1, textDecoration: isPaid ? 'line-through' : 'none' }}>{p.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isPaid ? '#10b981' : ACCENT }}>{fmtAmt(p.val, sym)}</span>
                    {showRound && p.val !== p.raw && (
                      <span style={{ fontSize: '0.7rem', color: colors.textSecondary, display: 'block' }}>actual {fmtAmt(p.raw, sym)}</span>
                    )}
                  </div>
                  <button onClick={() => remindPerson(p)} title="Send personal WhatsApp reminder" style={{ background: '#22c55e18', border: '1px solid #22c55e44', borderRadius: '0.4rem', color: '#22c55e', cursor: 'pointer', padding: '0.25rem 0.45rem', fontSize: '0.78rem', flexShrink: 0 }}>📱</button>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={copyRequest} style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              background: copied ? '#10b981' : ACCENT, border: 'none', color: '#fff', minWidth: 120,
            }}>{copied ? '✅ Copied!' : '📋 Copy Request'}</button>
            <button onClick={shareWhatsApp} style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              background: '#22c55e', border: 'none', color: '#fff', minWidth: 120,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </button>
          </div>
        </Card>
      )}
      {/* ── Recent splits history ── */}
      {splitHistory.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(v => !v)} style={{ background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '2rem', padding: '0.3rem 0.9rem', color: colors.textSecondary, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            📂 Saved Bills ({splitHistory.length}) {showHistory ? '▲' : '▼'}
          </button>
          {showHistory && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {splitHistory.map(h => {
                const isActive = h.id === activeHistoryId
                const paidArr = h.paidStatus ?? []
                const names = h.perPersonNames ?? Array.from({ length: h.count }, (_, i) => i === 0 ? 'You' : `Person ${i+1}`)
                return (
                  <div key={h.id} style={{ background: colors.card, border: `1.5px solid ${isActive ? ACCENT : colors.border}`, borderRadius: '0.75rem', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.85rem', borderBottom: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: '1.1rem' }}>{h.scenario}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: isActive ? ACCENT : colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary }}>{h.date} · {h.count} people · {h.total}</p>
                      </div>
                      {isActive
                        ? <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}44`, borderRadius: '2rem', padding: '0.15rem 0.5rem', flexShrink: 0 }}>Active</span>
                        : <button onClick={() => loadFromHistory(h)} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, borderRadius: '0.4rem', color: ACCENT, cursor: 'pointer', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>Load ↩</button>
                      }
                    </div>
                    {/* Per-person paid toggles */}
                    <div style={{ padding: '0.5rem 0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {names.map((name, i) => {
                        const paid = paidArr.includes(i)
                        return (
                          <button key={i} onClick={() => {
                            const updated = splitHistory.map(entry => {
                              if (entry.id !== h.id) return entry
                              const cur = new Set(entry.paidStatus ?? [])
                              cur.has(i) ? cur.delete(i) : cur.add(i)
                              const newPaid = [...cur]
                              if (isActive) setPaidStatus(new Set(newPaid))
                              return { ...entry, paidStatus: newPaid }
                            })
                            setSplitHistory(updated)
                            localStorage.setItem('rafiqy_bill_history', JSON.stringify(updated))
                          }} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            background: paid ? '#10b98118' : 'transparent',
                            border: `1px solid ${paid ? '#10b98155' : colors.border}`,
                            color: paid ? '#10b981' : colors.textSecondary,
                          }}>
                            <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${paid ? '#10b981' : colors.border}`, background: paid ? '#10b981' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', lineHeight: 1, flexShrink: 0 }}>{paid ? '✓' : ''}</span>
                            {name}
                          </button>
                        )
                      })}
                      <span style={{ fontSize: '0.7rem', color: colors.textSecondary, alignSelf: 'center', marginLeft: 'auto' }}>
                        {paidArr.length}/{h.count} paid
                      </span>
                    </div>
                  </div>
                )
              })}
              <button onClick={() => { setSplitHistory([]); setActiveHistoryId(null); localStorage.removeItem('rafiqy_bill_history') }} style={{ background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '0.4rem', padding: '0.25rem 0.65rem', fontSize: '0.72rem', color: colors.textSecondary, cursor: 'pointer', alignSelf: 'flex-end' }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   GROUP EXPENSES TAB
══════════════════════════════════════════════════════ */
function GroupExpenses({ colors }) {
  const [currency,      setCurrency]      = useState('PKR')
  const [people,        setPeople]        = useState([{ id: 1, name: 'You' }, { id: 2, name: 'Friend 1' }, { id: 3, name: 'Friend 2' }])
  const [newPersonName, setNewPersonName] = useState('')
  const [expenses,      setExpenses]      = useState([])
  const [expDesc,       setExpDesc]       = useState('')
  const [expAmount,     setExpAmount]     = useState('')
  const [expPaidBy,     setExpPaidBy]     = useState(1)
  const [copyMsg,       setCopyMsg]       = useState('')

  const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? 'PKR'

  const addPerson = useCallback(() => {
    const name = newPersonName.trim()
    if (!name) return
    personCounter++
    setPeople(prev => [...prev, { id: personCounter, name }])
    setNewPersonName('')
  }, [newPersonName])

  const removePerson = useCallback((id) => {
    setPeople(prev => prev.length <= 2 ? prev : prev.filter(p => p.id !== id))
    setExpenses(prev => prev.filter(e => e.paidById !== id))
  }, [])

  const addExpense = useCallback(() => {
    const amount = parseFloat(expAmount)
    if (!expDesc.trim() || isNaN(amount) || amount <= 0) return
    setExpenses(prev => [...prev, { id: uid(), description: expDesc.trim(), amount, paidById: expPaidBy }])
    setExpDesc('')
    setExpAmount('')
  }, [expDesc, expAmount, expPaidBy])

  const removeExpense = useCallback((id) => setExpenses(prev => prev.filter(e => e.id !== id)), [])

  const settlement = useMemo(() => calcSettlements(people, expenses), [people, expenses])
  const personName = id => people.find(p => p.id === id)?.name ?? 'Unknown'

  function exportText() {
    const lines = [
      `🧳 Group Expense Summary — ${new Date().toLocaleDateString('en-PK')}`,
      ``,
      `Total: ${fmtAmt(settlement.total, sym)} · Fair share: ${fmtAmt(settlement.share, sym)} each`,
      ``,
      `Balances:`,
      ...people.map(p => {
        const net = settlement.net[p.id] ?? 0
        return `  ${p.name}: ${net >= -0.005 ? `gets back ${fmtAmt(net, sym)}` : `owes ${fmtAmt(-net, sym)}`}`
      }),
      ``,
      `Settlements:`,
      ...(settlement.transactions.length === 0
        ? ['  ✅ All settled!']
        : settlement.transactions.map(t => `  ${t.from} → ${t.to}: ${fmtAmt(t.amount, sym)}`)),
      ``,
      `Generated via Rafiqy.app/tools/budget-splitter`,
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card colors={colors}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>👥 People</p>
            <SS colors={colors} value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 'auto' }}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
            </SS>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {people.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: `${ACCENT}11`, borderRadius: '0.5rem', border: `1px solid ${ACCENT}33` }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem', color: colors.text }}>{p.name}</span>
                {people.length > 2 && (
                  <button onClick={() => removePerson(p.id)} style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: '0.4rem', color: '#ef4444', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.75rem' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <SI colors={colors} placeholder="Person's name…" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPerson()} style={{ flex: 1 }} />
            <button onClick={addPerson} disabled={!newPersonName.trim()} style={{ background: newPersonName.trim() ? ACCENT : colors.border, border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: newPersonName.trim() ? 'pointer' : 'not-allowed', padding: '0.5rem 0.85rem', fontWeight: 600, fontSize: '0.875rem' }}>+ Add</button>
          </div>
        </Card>

        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💸 Add Expense</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Lbl text="Description">
              <SI colors={colors} placeholder="e.g. Hotel, Petrol, Dinner…" value={expDesc} onChange={e => setExpDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExpense()} />
            </Lbl>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <Lbl text={`Amount (${currency})`}>
                <SI colors={colors} type="number" min="0" placeholder="0" value={expAmount} onChange={e => setExpAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExpense()} />
              </Lbl>
              <Lbl text="Paid by">
                <SS colors={colors} value={expPaidBy} onChange={e => setExpPaidBy(Number(e.target.value))} style={{ width: '100%' }}>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </SS>
              </Lbl>
            </div>
            <button onClick={addExpense} disabled={!expDesc.trim() || !expAmount || parseFloat(expAmount) <= 0} style={{ background: expDesc.trim() && expAmount && parseFloat(expAmount) > 0 ? ACCENT : colors.border, border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', padding: '0.55rem', fontWeight: 600, fontSize: '0.875rem' }}>Add Expense</button>
          </div>
        </Card>

        {expenses.length > 0 && (
          <Card colors={colors}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🧾 Expenses ({expenses.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '16rem', overflowY: 'auto' }}>
              {expenses.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.65rem', background: colors.bg, borderRadius: '0.5rem', border: `1px solid ${colors.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary }}>{fmtAmt(e.amount, sym)} · {personName(e.paidById)}</p>
                  </div>
                  <button onClick={() => removeExpense(e.id)} style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: '0.4rem', color: '#ef4444', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.75rem', flexShrink: 0 }}>🗑</button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT — Settlement */}
      <div>
        <Card colors={colors}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📊 Settlement</p>
          {expenses.length === 0 ? (
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>Add at least one expense to see the settlement.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {[{ label: 'Total', val: settlement.total, color: ACCENT }, { label: 'Per Person', val: settlement.share, color: '#10b981' }].map(m => (
                  <div key={m.label} style={{ background: `${m.color}15`, border: `1px solid ${m.color}44`, borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.68rem', fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: colors.text }}>{fmtAmt(m.val, sym)}</p>
                  </div>
                ))}
              </div>

              <div>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase' }}>Balances</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {people.map(p => {
                    const net = settlement.net[p.id] ?? 0
                    const isPos = net >= -0.005
                    const c = isPos ? '#10b981' : '#ef4444'
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '0.45rem 0.65rem', background: colors.bg, borderRadius: '0.5rem', border: `1px solid ${colors.border}`, gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, flex: 1, fontSize: '0.85rem', color: colors.text }}>{p.name}</span>
                        <span style={{ fontSize: '0.72rem', color: colors.textSecondary }}>paid {fmtAmt(settlement.paid[p.id] ?? 0, sym)}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c, background: `${c}18`, border: `1px solid ${c}44`, borderRadius: '0.3rem', padding: '0.1rem 0.4rem' }}>
                          {isPos ? '+' : '−'}{fmtAmt(Math.abs(net), sym)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase' }}>Who pays whom</p>
                {settlement.transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '0.65rem', background: '#10b98115', borderRadius: '0.5rem', border: '1px solid #10b98133', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>✅ All settled!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {settlement.transactions.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', background: `${ACCENT}0d`, borderRadius: '0.5rem', border: `1px solid ${ACCENT}33`, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.85rem' }}>{t.from}</span>
                        <span style={{ color: colors.textSecondary, fontSize: '0.78rem' }}>pays</span>
                        <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem' }}>{t.to}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 800, color: ACCENT, fontSize: '0.9rem', background: `${ACCENT}18`, padding: '0.15rem 0.5rem', borderRadius: '0.35rem' }}>{fmtAmt(t.amount, sym)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={exportText} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, borderRadius: '0.5rem', color: ACCENT, cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, alignSelf: 'flex-start' }}>
                {copyMsg ? `✅ ${copyMsg}` : '📋 Copy Summary'}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function BudgetSplitter() {
  const { isDark, colors } = useTheme()
  const [tab, setTab] = useState('quick')

  const tabStyle = (t) => ({
    padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', border: 'none',
    background: tab === t ? ACCENT : 'transparent',
    color: tab === t ? '#fff' : colors.textSecondary,
    outline: tab !== t ? `1px solid ${colors.border}` : 'none',
    transition: 'all 0.15s',
  })

  return (
    <ToolLayout toolId="budget-splitter">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.3rem', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${ACCENT}, #06b6d4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          🤝 Bill Splitter
        </h1>
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
          Split restaurant bills, household expenses, or travel costs — no sign-up needed.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle('quick')} onClick={() => setTab('quick')}>⚡ Quick Split</button>
        <button style={tabStyle('group')} onClick={() => setTab('group')}>🧳 Group Expenses</button>
      </div>

      {tab === 'quick' ? <QuickSplit colors={colors} isDark={isDark} /> : <GroupExpenses colors={colors} />}
    </ToolLayout>
  )
}

