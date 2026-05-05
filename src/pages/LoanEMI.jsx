import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

const FONT = 'system-ui,-apple-system,sans-serif'
const LOAN_PRESETS = [
  { id: 'car', label: 'Car loan', principal: 2500000, rate: 18, years: 5, months: 0 },
  { id: 'home', label: 'Home loan', principal: 12000000, rate: 16, years: 15, months: 0 },
  { id: 'personal', label: 'Personal loan', principal: 800000, rate: 24, years: 3, months: 0 },
]

const fmt = (n, currency) => {
  if (n === null || isNaN(n)) return '—'
  return currency === 'USD'
    ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : 'Rs ' + n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function calcEMI(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return null
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function buildAmortization(principal, annualRate, months) {
  const r = annualRate / 100 / 12
  const emi = calcEMI(principal, annualRate, months)
  if (!emi) return []
  const rows = []
  let balance = principal
  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    const principalPaid = emi - interest
    balance = Math.max(0, balance - principalPaid)
    rows.push({ month: i, emi, principal: principalPaid, interest, balance })
  }
  return rows
}

function StatCard({ label, value, sub, color, isDark, colors }) {
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: '0.875rem', padding: '1.25rem', flex: 1, minWidth: '140px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 800, color, fontFamily: FONT }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: colors.muted, marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

function Input({ label, value, onChange, type = 'number', min, max, step, suffix, prefix, isDark, colors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '160px' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.muted }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: '0.75rem', fontSize: '0.85rem', color: colors.muted, pointerEvents: 'none' }}>{prefix}</span>}
        <input
          type={type} value={value} min={min} max={max} step={step}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: `0.55rem ${suffix ? '2.5rem' : '0.75rem'} 0.55rem ${prefix ? '2.25rem' : '0.75rem'}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${colors.border}`, borderRadius: '0.6rem', color: colors.text,
            fontSize: '0.95rem', fontFamily: FONT, outline: 'none',
          }}
        />
        {suffix && <span style={{ position: 'absolute', right: '0.75rem', fontSize: '0.8rem', color: colors.muted, pointerEvents: 'none' }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function LoanEMI() {
  const { isDark, colors } = useTheme()
  const [preset, setPreset] = useState('car')
  const [principal, setPrincipal] = useState(1000000)
  const [rate, setRate] = useState(18)
  const [tenureYears, setTenureYears] = useState(3)
  const [tenureMonths, setTenureMonths] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [currency, setCurrency] = useState('PKR')
  const [showTable, setShowTable] = useState(false)
  const [tableRows, setTableRows] = useState(12)

  function applyPreset(nextId) {
    const selected = LOAN_PRESETS.find((item) => item.id === nextId)
    if (!selected) return
    setPreset(nextId)
    setPrincipal(selected.principal)
    setRate(selected.rate)
    setTenureYears(selected.years)
    setTenureMonths(selected.months)
  }

  const months = useMemo(() => (Number(tenureYears) * 12) + Number(tenureMonths), [tenureYears, tenureMonths])
  const emi = useMemo(() => calcEMI(Number(principal), Number(rate), months), [principal, rate, months])
  const totalPayment = useMemo(() => emi ? emi * months : null, [emi, months])
  const totalInterest = useMemo(() => totalPayment ? totalPayment - Number(principal) : null, [totalPayment, principal])
  const interestPct = useMemo(() => totalInterest && principal ? ((totalInterest / Number(principal)) * 100).toFixed(1) : null, [totalInterest, principal])
  const table = useMemo(() => showTable ? buildAmortization(Number(principal), Number(rate), months) : [], [showTable, principal, rate, months])
  const annualEMI = useMemo(() => emi ? emi * 12 : null, [emi])
  const emiToIncomePct = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    if (!emi || !income) return null
    return (emi / income) * 100
  }, [emi, monthlyIncome])
  const affordabilityText = useMemo(() => {
    if (emiToIncomePct === null) return 'Add monthly income if you want an affordability signal.'
    if (emiToIncomePct <= 20) return 'Comfortable range for many households if other debts are low.'
    if (emiToIncomePct <= 35) return 'Manageable, but the loan will meaningfully shape your monthly flexibility.'
    if (emiToIncomePct <= 45) return 'Tight. One weak month or extra expense can create pressure.'
    return 'High-risk EMI burden. Rework rate, tenure, or financed amount before committing.'
  }, [emiToIncomePct])
  const whatIf = useMemo(() => {
    const basePrincipal = Number(principal)
    const baseRate = Number(rate)
    if (!basePrincipal || !baseRate || !months) return []
    const reducedRate = Math.max(0.1, baseRate - 2)
    const lowerRateEmi = calcEMI(basePrincipal, reducedRate, months)
    const lowerPrincipal = basePrincipal * 0.8
    const lowerPrincipalEmi = calcEMI(lowerPrincipal, baseRate, months)
    const shorterMonths = Math.max(12, months - 12)
    const shorterTenureEmi = calcEMI(basePrincipal, baseRate, shorterMonths)
    return [
      {
        label: `If rate drops to ${reducedRate}%`,
        emi: lowerRateEmi,
        note: `Saves about ${fmt(Math.round((emi || 0) - (lowerRateEmi || 0)), currency)} per month.`,
        color: '#22c55e',
      },
      {
        label: 'If financed amount drops 20%',
        emi: lowerPrincipalEmi,
        note: `Equivalent to a bigger down payment or smaller loan size.`,
        color: '#06b6d4',
      },
      {
        label: `If you shorten tenure by 12 months`,
        emi: shorterTenureEmi,
        note: `Higher monthly EMI, but lower total interest drag.`,
        color: '#f97316',
      },
    ]
  }, [principal, rate, months, emi, currency])

  const accentColor = '#3b82f6'

  return (
    <ToolLayout toolId="loan-emi">
      <div style={{ fontFamily: FONT, maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 0.35rem',
            background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>🏦 Loan EMI Calculator</h1>
          <p style={{ color: colors.muted, margin: 0, fontSize: '0.9rem' }}>
            Calculate monthly payments &amp; full amortization schedule for any loan
          </p>
        </div>

        <div style={{ background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)', border: `1px solid ${isDark ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.18)'}`, borderRadius: '1rem', padding: '1rem 1.15rem', marginBottom: '1.25rem' }}>
          <div style={{ color: colors.text, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
            What this tool is really for
          </div>
          <div style={{ color: colors.muted, fontSize: '0.82rem', lineHeight: 1.65 }}>
            Use this before taking a home loan, car loan, or personal loan. It helps you answer three things clearly:
            <strong style={{ color: colors.text }}> what will I pay every month, how much total interest will I lose, and how would the decision improve if rate, tenure, or financed amount changed?</strong>
          </div>
        </div>

        {/* Currency Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['PKR', 'USD'].map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              padding: '0.35rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600,
              background: currency === c ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
              color: currency === c ? '#fff' : colors.muted,
              transition: 'all 0.15s',
            }}>{c}</button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Start from a common loan type
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {LOAN_PRESETS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyPreset(item.id)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    border: `1px solid ${preset === item.id ? accentColor : colors.border}`,
                    background: preset === item.id ? accentColor : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    color: preset === item.id ? '#fff' : colors.text,
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <Input label="Loan Amount" value={principal} onChange={setPrincipal}
              min={1} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              isDark={isDark} colors={colors} />
            <Input label="Annual Interest Rate" value={rate} onChange={setRate}
              min={0.1} max={100} step={0.1} suffix="%" isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Tenure (Years)" value={tenureYears} onChange={setTenureYears}
              min={0} max={30} step={1} suffix="yrs" isDark={isDark} colors={colors} />
            <Input label="Tenure (Extra Months)" value={tenureMonths} onChange={setTenureMonths}
              min={0} max={11} step={1} suffix="mo" isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Monthly Income (optional)" value={monthlyIncome} onChange={setMonthlyIncome}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              isDark={isDark} colors={colors} />
          </div>
          {months > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: colors.muted }}>
              📅 Total tenure: <strong style={{ color: colors.text }}>{months} months</strong>
              {tenureYears > 0 && tenureMonths > 0 && ` (${tenureYears}y ${tenureMonths}mo)`}
            </div>
          )}
        </div>

        {/* Results */}
        {emi && months > 0 ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <StatCard label="Monthly EMI" value={fmt(Math.round(emi), currency)}
                color={accentColor} isDark={isDark} colors={colors} />
              <StatCard label="Total Payment" value={fmt(Math.round(totalPayment), currency)}
                sub={`Principal + Interest`} color="#8b5cf6" isDark={isDark} colors={colors} />
              <StatCard label="Total Interest" value={fmt(Math.round(totalInterest), currency)}
                sub={`${interestPct}% of principal`} color="#f97316" isDark={isDark} colors={colors} />
              <StatCard label="EMI vs Income" value={emiToIncomePct !== null ? `${emiToIncomePct.toFixed(1)}%` : 'Add income'}
                sub={affordabilityText} color="#10b981" isDark={isDark} colors={colors} />
            </div>

            {/* Visual breakdown bar */}
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: colors.muted, marginBottom: '0.5rem' }}>
                <span style={{ color: accentColor }}>■ Principal {fmt(Math.round(Number(principal)), currency)}</span>
                <span style={{ color: '#f97316' }}>■ Interest {fmt(Math.round(totalInterest), currency)}</span>
              </div>
              <div style={{ height: '12px', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                <div style={{
                  width: `${(Number(principal) / totalPayment) * 100}%`,
                  background: `linear-gradient(to right, ${accentColor}, #60a5fa)`,
                  transition: 'width 0.4s ease',
                }} />
                <div style={{ flex: 1, background: `linear-gradient(to right, #f97316, #fb923c)` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: colors.muted, marginTop: '0.4rem' }}>
                <span>{((Number(principal) / totalPayment) * 100).toFixed(0)}% principal</span>
                <span>{interestPct}% interest burden</span>
              </div>
            </div>

            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.7rem' }}>
                What changes this loan the most?
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {whatIf.map((item) => (
                  <div key={item.label} style={{ flex: 1, minWidth: '180px', border: `1px solid ${colors.border}`, borderRadius: '0.85rem', padding: '0.95rem', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <div style={{ color: colors.muted, fontSize: '0.76rem', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ color: item.color, fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {fmt(Math.round(item.emi), currency)}/mo
                    </div>
                    <div style={{ color: colors.muted, fontSize: '0.74rem', lineHeight: 1.55 }}>
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.1rem 1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ color: colors.text, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                How to use this result
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: colors.muted, lineHeight: 1.7, fontSize: '0.82rem' }}>
                <li>Use monthly EMI to judge cashflow pressure.</li>
                <li>Use total interest to judge whether a “comfortable EMI” is actually expensive overall.</li>
                <li>Use the what-if cards to see whether a better rate, smaller financed amount, or shorter tenure improves the decision enough to wait or renegotiate.</li>
                <li>For property decisions, use this together with Rent vs Buy rather than comparing rent against EMI alone.</li>
              </ul>
              {annualEMI && (
                <div style={{ marginTop: '0.7rem', fontSize: '0.78rem', color: colors.muted }}>
                  Annual repayment burden: <strong style={{ color: colors.text }}>{fmt(Math.round(annualEMI), currency)}</strong>
                </div>
              )}
            </div>

            {/* Amortization toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={() => setShowTable(t => !t)} style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.6rem', cursor: 'pointer',
                background: showTable ? accentColor : (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'),
                color: showTable ? '#fff' : accentColor, border: `1px solid ${showTable ? accentColor : 'rgba(59,130,246,0.3)'}`,
                fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s',
              }}>
                {showTable ? '▲ Hide' : '▼ Show'} Amortization Schedule
              </button>
            </div>

            {showTable && table.length > 0 && (
              <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Month' ? 'center' : 'right', color: colors.muted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.slice(0, tableRows).map((row, i) => (
                        <tr key={row.month} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'center', color: colors.muted, fontWeight: 600 }}>{row.month}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: colors.text, fontWeight: 600 }}>{fmt(Math.round(row.emi), currency)}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: accentColor }}>{fmt(Math.round(row.principal), currency)}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#f97316' }}>{fmt(Math.round(row.interest), currency)}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: colors.muted }}>{fmt(Math.round(row.balance), currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tableRows < months && (
                  <div style={{ padding: '0.875rem 1rem', textAlign: 'center', borderTop: `1px solid ${colors.border}` }}>
                    <button onClick={() => setTableRows(r => Math.min(r + 12, months))} style={{
                      padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: FONT,
                      fontSize: '0.8rem', fontWeight: 600, color: accentColor,
                      background: 'transparent', border: `1px solid rgba(59,130,246,0.3)`,
                    }}>
                      Load more ({months - tableRows} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: colors.muted, fontSize: '0.9rem' }}>
            Enter loan details above to see your EMI calculation
          </div>
        )}

        <DisclaimerBlock type="professional" overrideBodyEn="📊 Uses the standard reducing-balance (diminishing balance) method — the same formula used by banks. Each month's interest is calculated on the remaining principal, not the original amount. This is more accurate than flat-rate EMI." />
      </div>
    </ToolLayout>
  )
}
