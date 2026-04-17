import { useState, useCallback, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const ACCENT = '#8b5cf6'
const CURRENCIES = [
  { code: 'PKR', symbol: 'PKR', label: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
]

let personCounter = 3
let expenseCounter = 0

function uid() {
  return ++expenseCounter
}

function fmt(n, symbol) {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${symbol}\u202f${formatted}`
}

/* ── Greedy minimum-transactions settlement algorithm ─────────────────── */
function calcSettlements(people, expenses) {
  const paid = {}
  people.forEach((p) => (paid[p.id] = 0))
  expenses.forEach((e) => {
    if (paid[e.paidById] !== undefined) paid[e.paidById] += e.amount
  })

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const share = people.length > 0 ? total / people.length : 0

  const net = {}
  people.forEach((p) => (net[p.id] = (paid[p.id] || 0) - share))

  const debtors = people
    .filter((p) => net[p.id] < -0.005)
    .map((p) => ({ id: p.id, name: p.name, amount: net[p.id] }))
    .sort((a, b) => a.amount - b.amount)

  const creditors = people
    .filter((p) => net[p.id] > 0.005)
    .map((p) => ({ id: p.id, name: p.name, amount: net[p.id] }))
    .sort((a, b) => b.amount - a.amount)

  const transactions = []
  let d = 0
  let c = 0

  while (d < debtors.length && c < creditors.length) {
    const debt = -debtors[d].amount
    const credit = creditors[c].amount
    const amount = Math.min(debt, credit)

    transactions.push({
      from: debtors[d].name,
      to: creditors[c].name,
      amount,
    })

    debtors[d].amount += amount
    creditors[c].amount -= amount

    if (Math.abs(debtors[d].amount) < 0.005) d++
    if (Math.abs(creditors[c].amount) < 0.005) c++
  }

  return { total, share, paid, net, transactions }
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function SectionCard({ title, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h2 style={{
        margin: 0,
        fontSize: '1rem',
        fontWeight: 700,
        color: ACCENT,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function InputRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

function StyledInput({ colors, ...props }) {
  return (
    <input
      {...props}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style,
      }}
    />
  )
}

function StyledSelect({ colors, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: colors.text,
        fontSize: '0.9rem',
        outline: 'none',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

function IconButton({ onClick, title, children, colors, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: danger ? '#ef444422' : `${ACCENT}22`,
        border: `1px solid ${danger ? '#ef444444' : `${ACCENT}44`}`,
        borderRadius: '0.4rem',
        color: danger ? '#ef4444' : ACCENT,
        cursor: 'pointer',
        padding: '0.3rem 0.55rem',
        fontSize: '0.85rem',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function PrimaryButton({ onClick, children, disabled, colors }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? colors.border : ACCENT,
        border: 'none',
        borderRadius: '0.5rem',
        color: disabled ? colors.textSecondary : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0.55rem 1.1rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */

export default function BudgetSplitter() {
  const { isDark, colors } = useTheme()

  const [people, setPeople] = useState([
    { id: 1, name: 'You' },
    { id: 2, name: 'Friend 1' },
    { id: 3, name: 'Friend 2' },
  ])
  const [newPersonName, setNewPersonName] = useState('')

  const [expenses, setExpenses] = useState([])
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expPaidBy, setExpPaidBy] = useState(1)

  const [currency, setCurrency] = useState('PKR')
  const [copyMsg, setCopyMsg] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? 'PKR'

  /* People actions */
  const addPerson = useCallback(() => {
    const name = newPersonName.trim()
    if (!name) return
    personCounter++
    setPeople((prev) => [...prev, { id: personCounter, name }])
    setNewPersonName('')
  }, [newPersonName])

  const removePerson = useCallback((id) => {
    setPeople((prev) => {
      if (prev.length <= 2) return prev
      return prev.filter((p) => p.id !== id)
    })
    setExpenses((prev) => prev.filter((e) => e.paidById !== id))
    setExpPaidBy((prev) => (prev === id ? people[0]?.id ?? 1 : prev))
  }, [people])

  /* Expense actions */
  const addExpense = useCallback(() => {
    const amount = parseFloat(expAmount)
    if (!expDesc.trim() || isNaN(amount) || amount <= 0) return
    setExpenses((prev) => [
      ...prev,
      { id: uid(), description: expDesc.trim(), amount, paidById: expPaidBy },
    ])
    setExpDesc('')
    setExpAmount('')
  }, [expDesc, expAmount, expPaidBy])

  const removeExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  /* Settlement */
  const settlement = useMemo(
    () => calcSettlements(people, expenses),
    [people, expenses]
  )

  /* Export */
  const exportText = useCallback(() => {
    const lines = [
      `🧳 Trip Expense Summary — ${new Date().toLocaleDateString('en-PK')}`,
      `Currency: ${currency}`,
      ``,
      `Total: ${fmt(settlement.total, currencySymbol)}`,
      `Fair share per person: ${fmt(settlement.share, currencySymbol)}`,
      ``,
      `--- Balances ---`,
      ...people.map((p) => {
        const paid = settlement.paid[p.id] ?? 0
        const net = settlement.net[p.id] ?? 0
        const sign = net >= 0 ? '+' : ''
        return `${p.name}: paid ${fmt(paid, currencySymbol)}, net ${sign}${fmt(Math.abs(net), currencySymbol)}${net < 0 ? ' (owes)' : ' (gets back)'}`
      }),
      ``,
      `--- Settlements ---`,
      ...(settlement.transactions.length === 0
        ? ['Everyone is already settled!']
        : settlement.transactions.map(
            (t) => `${t.from} → ${t.to}: ${fmt(t.amount, currencySymbol)}`
          )),
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    }).catch(() => {
      setCopyMsg('Failed')
      setTimeout(() => setCopyMsg(''), 2000)
    })
  }, [settlement, people, currency, currencySymbol])

  const personName = (id) => people.find((p) => p.id === id)?.name ?? 'Unknown'

  return (
    <ToolLayout toolId="budget-splitter">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🧳</span>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.text }}>
            Trip Expense Splitter
          </h1>
          {/* Currency selector */}
          <StyledSelect
            colors={colors}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ marginLeft: 'auto' }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </StyledSelect>
        </div>
        <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
          Add friends, log expenses and instantly see who owes whom — no sign-up needed.
        </p>
      </div>

      {/* Two-column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        gap: '1.25rem',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>

          {/* People panel */}
          <SectionCard title="👥 People" colors={colors}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {people.map((p) => (
                <div key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  background: `${ACCENT}11`,
                  borderRadius: '0.5rem',
                  border: `1px solid ${ACCENT}33`,
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, flex: 1, color: colors.text }}>
                    {p.name}
                  </span>
                  {people.length > 2 && (
                    <IconButton
                      onClick={() => removePerson(p.id)}
                      title="Remove person"
                      colors={colors}
                      danger
                    >
                      ✕
                    </IconButton>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <StyledInput
                colors={colors}
                placeholder="Person's name…"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPerson()}
                style={{ flex: 1 }}
              />
              <PrimaryButton onClick={addPerson} disabled={!newPersonName.trim()} colors={colors}>
                + Add
              </PrimaryButton>
            </div>
          </SectionCard>

          {/* Add Expense panel */}
          <SectionCard title="💸 Add Expense" colors={colors}>
            <InputRow label="Description">
              <StyledInput
                colors={colors}
                placeholder="e.g. Hotel, Petrol, Dinner…"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExpense()}
              />
            </InputRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <InputRow label={`Amount (${currency})`}>
                <StyledInput
                  colors={colors}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                />
              </InputRow>
              <InputRow label="Paid by">
                <StyledSelect
                  colors={colors}
                  value={expPaidBy}
                  onChange={(e) => setExpPaidBy(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </StyledSelect>
              </InputRow>
            </div>

            <PrimaryButton
              onClick={addExpense}
              disabled={!expDesc.trim() || !expAmount || parseFloat(expAmount) <= 0}
              colors={colors}
            >
              Add Expense
            </PrimaryButton>
          </SectionCard>

          {/* Expense list */}
          {expenses.length > 0 && (
            <SectionCard title={`🧾 Expenses (${expenses.length})`} colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '18rem', overflowY: 'auto' }}>
                {expenses.map((e) => (
                  <div key={e.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    background: colors.bg,
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.description}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary }}>
                        {fmt(e.amount, currencySymbol)} · paid by {personName(e.paidById)}
                      </p>
                    </div>
                    <IconButton onClick={() => removeExpense(e.id)} title="Delete expense" colors={colors} danger>
                      🗑
                    </IconButton>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* RIGHT COLUMN — Settlement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          <SectionCard title="📊 Settlement" colors={colors}>
            {expenses.length === 0 ? (
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Add at least one expense to see the settlement.
              </p>
            ) : (
              <>
                {/* Summary stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}>
                  <div style={{
                    background: `${ACCENT}15`,
                    border: `1px solid ${ACCENT}44`,
                    borderRadius: '0.75rem',
                    padding: '0.85rem',
                    textAlign: 'center',
                  }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Total Cost
                    </p>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: colors.text }}>
                      {fmt(settlement.total, currencySymbol)}
                    </p>
                  </div>
                  <div style={{
                    background: `#10b98115`,
                    border: `1px solid #10b98144`,
                    borderRadius: '0.75rem',
                    padding: '0.85rem',
                    textAlign: 'center',
                  }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Per Person
                    </p>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: colors.text }}>
                      {fmt(settlement.share, currencySymbol)}
                    </p>
                  </div>
                </div>

                {/* Per-person balances */}
                <div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Balances
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {people.map((p) => {
                      const paid = settlement.paid[p.id] ?? 0
                      const net = settlement.net[p.id] ?? 0
                      const isPositive = net >= -0.005
                      const netColor = isPositive ? '#10b981' : '#ef4444'
                      return (
                        <div key={p.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem 0.7rem',
                          background: colors.bg,
                          borderRadius: '0.5rem',
                          border: `1px solid ${colors.border}`,
                          gap: '0.5rem',
                        }}>
                          <span style={{ fontWeight: 600, flex: 1, fontSize: '0.875rem', color: colors.text }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                            paid {fmt(paid, currencySymbol)}
                          </span>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: netColor,
                            background: `${netColor}18`,
                            border: `1px solid ${netColor}44`,
                            borderRadius: '0.35rem',
                            padding: '0.15rem 0.45rem',
                          }}>
                            {isPositive ? '+' : '−'}{fmt(Math.abs(net), currencySymbol)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Transactions */}
                <div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Who pays whom
                  </p>
                  {settlement.transactions.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      background: `#10b98115`,
                      borderRadius: '0.6rem',
                      border: `1px solid #10b98133`,
                      color: '#10b981',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}>
                      ✅ Everyone is settled!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {settlement.transactions.map((t, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 0.85rem',
                          background: `${ACCENT}0d`,
                          borderRadius: '0.6rem',
                          border: `1px solid ${ACCENT}33`,
                          flexWrap: 'wrap',
                        }}>
                          <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.875rem' }}>
                            {t.from}
                          </span>
                          <span style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>pays</span>
                          <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.875rem' }}>
                            {t.to}
                          </span>
                          <span style={{
                            marginLeft: 'auto',
                            fontWeight: 800,
                            color: ACCENT,
                            fontSize: '0.925rem',
                            background: `${ACCENT}18`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '0.4rem',
                          }}>
                            {fmt(t.amount, currencySymbol)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}
                <button
                  onClick={exportText}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${ACCENT}`,
                    borderRadius: '0.5rem',
                    color: ACCENT,
                    cursor: 'pointer',
                    padding: '0.55rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    alignSelf: 'flex-start',
                  }}
                >
                  {copyMsg ? `✅ ${copyMsg}` : '📋 Copy Summary'}
                </button>
              </>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Analytics toggle */}
      {expenses.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setShowAnalytics(v => !v)}
            style={{
              padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 700,
              background: showAnalytics ? `${ACCENT}22` : colors.card,
              border: `1.5px solid ${ACCENT}55`,
              borderRadius: '2rem', cursor: 'pointer', color: ACCENT,
              transition: 'all 0.2s',
            }}
          >
            📊 {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      )}

      {/* Analytics panel */}
      {showAnalytics && expenses.length > 0 && (
        <div style={{
          marginTop: '1.25rem', background: colors.card,
          border: `1px solid ${colors.border}`, borderRadius: '1rem',
          padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            📊 Analytics
          </h2>

          {/* Per-person spending bar chart */}
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Per-Person Spending</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {people
                .map(p => ({ ...p, paid: settlement.paid[p.id] ?? 0 }))
                .sort((a, b) => b.paid - a.paid)
                .map(p => {
                  const maxPaid = Math.max(...people.map(pp => settlement.paid[pp.id] ?? 0), 1)
                  const pct = (p.paid / maxPaid) * 100
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '80px', textAlign: 'right', fontSize: '0.78rem', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.name}</span>
                      <div style={{ flex: 1, background: colors.border, borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: ACCENT, height: '100%', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: colors.text, fontWeight: 600, flexShrink: 0, minWidth: '70px', textAlign: 'right' }}>{fmt(p.paid, currencySymbol)}</span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Net balance bar chart */}
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance per Person</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(() => {
                const maxAbs = Math.max(...people.map(p => Math.abs(settlement.net[p.id] ?? 0)), 1)
                return people
                  .map(p => ({ ...p, net: settlement.net[p.id] ?? 0 }))
                  .sort((a, b) => b.net - a.net)
                  .map(p => {
                    const pct = (Math.abs(p.net) / maxAbs) * 50
                    const isPos = p.net >= -0.005
                    const barColor = isPos ? '#10b981' : '#ef4444'
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '80px', textAlign: 'right', fontSize: '0.78rem', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.name}</span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '18px', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: colors.border }} />
                          <div style={{
                            position: 'absolute',
                            left: isPos ? '50%' : `${50 - pct}%`,
                            width: `${pct}%`,
                            height: '100%',
                            background: barColor,
                            borderRadius: isPos ? '0 4px 4px 0' : '4px 0 0 4px',
                            transition: 'all 0.4s ease',
                            opacity: 0.8,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor, flexShrink: 0, minWidth: '70px', textAlign: 'right' }}>
                          {isPos ? '+' : '−'}{fmt(Math.abs(p.net), currencySymbol)}
                        </span>
                      </div>
                    )
                  })
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                <span style={{ fontSize: '0.72rem', color: colors.textSecondary }}>gets back</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} />
                <span style={{ fontSize: '0.72rem', color: colors.textSecondary }}>owes</span>
              </div>
            </div>
          </div>

          {/* Settlement visualization */}
          {settlement.transactions.length > 0 && (
            <div>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settlement Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {settlement.transactions.map((t, i) => {
                  const maxTxn = Math.max(...settlement.transactions.map(tx => tx.amount), 1)
                  const pct = (t.amount / maxTxn) * 100
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span>
                          <strong style={{ color: '#ef4444' }}>{t.from}</strong>
                          <span style={{ color: colors.textSecondary }}> → </span>
                          <strong style={{ color: '#10b981' }}>{t.to}</strong>
                        </span>
                        <strong style={{ color: ACCENT }}>{fmt(t.amount, currencySymbol)}</strong>
                      </div>
                      <div style={{ background: colors.border, borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: ACCENT, height: '100%', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
