import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'

const FONT = 'system-ui,-apple-system,sans-serif'
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
  const [principal, setPrincipal] = useState(1000000)
  const [rate, setRate] = useState(18)
  const [tenureYears, setTenureYears] = useState(3)
  const [tenureMonths, setTenureMonths] = useState(0)
  const [currency, setCurrency] = useState('PKR')
  const [showTable, setShowTable] = useState(false)
  const [tableRows, setTableRows] = useState(12)

  const months = useMemo(() => (Number(tenureYears) * 12) + Number(tenureMonths), [tenureYears, tenureMonths])
  const emi = useMemo(() => calcEMI(Number(principal), Number(rate), months), [principal, rate, months])
  const totalPayment = useMemo(() => emi ? emi * months : null, [emi, months])
  const totalInterest = useMemo(() => totalPayment ? totalPayment - Number(principal) : null, [totalPayment, principal])
  const interestPct = useMemo(() => totalInterest && principal ? ((totalInterest / Number(principal)) * 100).toFixed(1) : null, [totalInterest, principal])
  const table = useMemo(() => showTable ? buildAmortization(Number(principal), Number(rate), months) : [], [showTable, principal, rate, months])

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
