import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import {
  SLABS_2526, SLABS_2425,
  calcFullTax, calcVPSShield, calcCharityShield, slabProximity,
  PETROL_PRICE_PER_LITRE, TEACHER_CREDIT_DISCONTINUED_TY,
} from '../data/taxData'

const fmt = (n) => Math.round(n).toLocaleString('en-PK')
const fmtPct = (n) => (n * 100).toFixed(1) + '%'

function InfoBox({ children, color = '#f97316', isDark }) {
  return (
    <div style={{
      background: `${color}12`,
      border: `1px solid ${color}44`,
      borderRadius: '0.75rem',
      padding: '0.9rem 1rem',
      fontSize: '0.85rem',
      lineHeight: 1.6,
      color: isDark ? '#e2e8f0' : '#1e293b',
    }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, sub, color, isDark, colors }) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${color}44`,
      borderRadius: '0.75rem',
      padding: '1rem',
      textAlign: 'center',
    }}>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color }}>{value}</p>
      {sub && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: colors.textSecondary }}>{sub}</p>}
    </div>
  )
}

export default function TaxCalculator() {
  const { isDark, colors } = useTheme()

  const [monthlySalary, setMonthlySalary] = useState('')
  const [annualBonus, setAnnualBonus] = useState('')
  const [age, setAge] = useState('')
  const [isTeacher, setIsTeacher] = useState(false)
  const [vpsInvestment, setVpsInvestment] = useState('')
  const [charityAmount, setCharityAmount] = useState('')
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const annualIncome = useMemo(() => {
    const sal = parseFloat(monthlySalary) || 0
    const bonus = parseFloat(annualBonus) || 0
    return sal * 12 + bonus
  }, [monthlySalary, annualBonus])

  const result2526 = useMemo(() => calcFullTax({
    annualIncome,
    age: parseInt(age) || 0,
    isTeacher,
    slabs: SLABS_2526,
  }), [annualIncome, age, isTeacher])

  const result2425 = useMemo(() => calcFullTax({
    annualIncome,
    age: parseInt(age) || 0,
    isTeacher,
    slabs: SLABS_2425,
  }), [annualIncome, age, isTeacher])

  const vps = useMemo(() => {
    const inv = parseFloat(vpsInvestment) || 0
    return inv > 0 ? calcVPSShield(annualIncome, result2526.tax, inv, parseInt(age) || 0) : null
  }, [vpsInvestment, annualIncome, result2526.tax, age])

  const charity = useMemo(() => {
    const don = parseFloat(charityAmount) || 0
    return don > 0 ? calcCharityShield(annualIncome, result2526.tax, don) : null
  }, [charityAmount, annualIncome, result2526.tax])

  const proximity = useMemo(() => annualIncome > 0 ? slabProximity(annualIncome) : null, [annualIncome])

  const petrolLitres = useMemo(() => Math.round(result2526.tax / PETROL_PRICE_PER_LITRE), [result2526.tax])
  const taxDiff = result2526.tax - result2425.tax

  const hasResult = annualIncome > 0

  const fieldStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.6rem 0.8rem',
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <ToolLayout toolId="tax-calculator">
      {/* Disclaimer popup */}
      {showDisclaimer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1100, padding: '1rem',
        }}>
          <div style={{
            background: isDark ? '#0f172a' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '1.25rem', padding: '1.75rem',
            maxWidth: '480px', width: '100%',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.75rem', color: colors.text, fontSize: '1.1rem', fontWeight: 700 }}>
              Important Disclaimer
            </h2>
            <p style={{ margin: '0 0 1rem', color: colors.textSecondary, fontSize: '0.85rem', lineHeight: 1.7 }}>
              This tool is for <strong>educational and informational purposes only</strong>. It is not affiliated with the FBR or any government agency. Calculations are based on the Finance Act 2025 and are <strong>estimates only</strong>. This does not constitute professional tax or financial advice.
            </p>
            <p style={{ margin: '0 0 1.25rem', color: colors.textSecondary, fontSize: '0.85rem', lineHeight: 1.7 }}>
              Please consult a <strong>certified tax practitioner (RTP) or CA</strong> before filing your returns.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              style={{
                width: '100%', padding: '0.7rem',
                background: 'linear-gradient(to right, #f97316, #f59e0b)',
                color: '#fff', border: 'none', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              I Understand — Let's Calculate
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800,
          background: 'linear-gradient(to right, #f97316, #f59e0b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', margin: '0 0 0.4rem', letterSpacing: '-0.02em',
        }}>
          🧮 Pakistan Tax Calculator
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Finance Act 2025 · FY 2025-26 · Salaried individuals ·{' '}
          <button onClick={() => setShowDisclaimer(true)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: '0.9rem', padding: 0, textDecoration: 'underline' }}>
            Disclaimer
          </button>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: '1.5rem' }}>

        {/* ── Left: Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Income */}
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Income Details
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Monthly Gross Salary (PKR)</label>
                <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)}
                  placeholder="e.g. 150000" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
              <div>
                <label style={labelStyle}>Annual Bonus / Arrears (PKR)</label>
                <input type="number" value={annualBonus} onChange={e => setAnnualBonus(e.target.value)}
                  placeholder="e.g. 0" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
              {annualIncome > 0 && (
                <div style={{ padding: '0.6rem 0.8rem', background: isDark ? 'rgba(249,115,22,0.1)' : 'rgba(249,115,22,0.06)', borderRadius: '0.5rem', fontSize: '0.82rem', color: '#f97316', fontWeight: 600 }}>
                  Annual Taxable Income: PKR {fmt(annualIncome)}
                </div>
              )}
            </div>
          </div>

          {/* Personal */}
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Personal Details (for rebates)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 35" style={{ ...fieldStyle, maxWidth: '120px' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textSecondary }}>
                  Age ≥ 60 qualifies for 50% senior citizen rebate
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: colors.text }}>
                <input type="checkbox" checked={isTeacher} onChange={e => setIsTeacher(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#f97316' }} />
                <span>Full-time teacher or researcher <span style={{ color: '#f97316', fontSize: '0.75rem' }}>(25% credit — NOT available FY 2025-26)</span></span>
              </label>
              {isTeacher && (
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(249,115,22,0.1)', borderRadius: '0.5rem', fontSize: '0.78rem', color: '#f97316', lineHeight: 1.5 }}>
                  ⚠️ The 25% teacher/researcher rebate was <strong>not extended</strong> to Tax Year 2026 (FY 2025-26). It applied for TY 2023–2025 only. Result shown includes this credit for reference only.
                </div>
              )}
            </div>
          </div>

          {/* Shields */}
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🛡 Tax Shields (Optional)
            </p>
            <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: colors.textSecondary }}>Enter amounts to see how much tax you can save legally.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>VPS / Pension Investment (PKR/yr)</label>
                <input type="number" value={vpsInvestment} onChange={e => setVpsInvestment(e.target.value)}
                  placeholder={`Up to ${(parseInt(age) || 0) >= 40 ? '22' : '20'}% of income`} style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
              <div>
                <label style={labelStyle}>Charity / FBR-approved NPO Donation (PKR)</label>
                <input type="number" value={charityAmount} onChange={e => setCharityAmount(e.target.value)}
                  placeholder="Up to 30% of income" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!hasResult ? (
            <div style={{
              background: colors.card, border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem', padding: '3rem 2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🧮</div>
              <p style={{ color: colors.textSecondary, margin: 0 }}>Enter your monthly salary to see your tax estimate.</p>
            </div>
          ) : (
            <>
              {/* Main stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <StatCard label="Annual Tax" value={`PKR ${fmt(result2526.tax)}`} sub={`Monthly: PKR ${fmt(result2526.tax / 12)}`} color="#f97316" isDark={isDark} colors={colors} />
                <StatCard label="Effective Rate" value={fmtPct(result2526.effectiveRate)} sub={`Marginal: see slabs`} color="#8b5cf6" isDark={isDark} colors={colors} />
                <StatCard label="Take-Home (Annual)" value={`PKR ${fmt(annualIncome - result2526.tax)}`} sub={`Monthly: PKR ${fmt((annualIncome - result2526.tax) / 12)}`} color="#10b981" isDark={isDark} colors={colors} />
                <StatCard label="⛽ Petrol Equiv." value={`${fmt(petrolLitres)} L`} sub={`@ PKR ${PETROL_PRICE_PER_LITRE}/L`} color="#06b6d4" isDark={isDark} colors={colors} />
              </div>

              {/* Slab breakdown */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1.1rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tax Slab Breakdown (FY 2025-26)</p>
                {SLABS_2526.map((s, i) => {
                  const active = annualIncome >= s.min && (s.max === Infinity ? true : annualIncome <= s.max)
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.4rem 0.6rem', borderRadius: '0.4rem', marginBottom: '0.2rem',
                      background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                      border: active ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: active ? '#f97316' : colors.textSecondary, fontWeight: active ? 700 : 400 }}>
                        {active ? '▶ ' : ''}{s.label}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: active ? '#f97316' : colors.textSecondary, fontWeight: 600 }}>
                        {s.rate === 0 ? 'Nil' : `${(s.rate * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  )
                })}
                {result2526.surcharge > 0 && (
                  <InfoBox color="#ef4444" isDark={isDark}>
                    ⚠️ <strong>Surcharge applied:</strong> PKR {fmt(result2526.surcharge)} (9% surcharge — income exceeds PKR 10 million)
                  </InfoBox>
                )}
              </div>

              {/* Rebates */}
              {(result2526.seniorRebate > 0 || result2526.teacherCredit > 0) && (
                <InfoBox color="#10b981" isDark={isDark}>
                  {result2526.seniorRebate > 0 && <div>🎖 <strong>Senior Citizen Rebate:</strong> PKR {fmt(result2526.seniorRebate)} saved (50% rebate for age ≥ 60)</div>}
                  {result2526.teacherCredit > 0 && <div>🎓 <strong>Teacher Credit:</strong> PKR {fmt(result2526.teacherCredit)} saved (25% credit)</div>}
                </InfoBox>
              )}

              {/* Shields */}
              {(vps || charity) && (
                <div style={{ background: colors.card, border: `1px solid #10b98144`, borderRadius: '0.75rem', padding: '1.1rem' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🛡 Your Tax Shields</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {vps && (
                      <InfoBox color="#10b981" isDark={isDark}>
                        💰 <strong>VPS Shield:</strong> Invest PKR {fmt(vps.capped)} → save <strong>PKR {fmt(vps.saving)}</strong> in tax.
                        {vps.capped < parseFloat(vpsInvestment) && <span style={{ color: '#f59e0b' }}> (Capped at 20% of income: PKR {fmt(vps.maxInvestment)})</span>}
                      </InfoBox>
                    )}
                    {charity && (
                      <InfoBox color="#10b981" isDark={isDark}>
                        🤲 <strong>Charity Shield:</strong> Donate PKR {fmt(charity.capped)} → get PKR {fmt(charity.credit)} credit. Net out-of-pocket: <strong>PKR {fmt(charity.netCost)}</strong>.
                        {charity.capped < parseFloat(charityAmount) && <span style={{ color: '#f59e0b' }}> (Capped at 30% of income: PKR {fmt(charity.maxDonation)})</span>}
                      </InfoBox>
                    )}
                  </div>
                </div>
              )}

              {/* Slab proximity */}
              {proximity && (
                <InfoBox color="#f59e0b" isDark={isDark}>
                  📊 <strong>Slab Alert:</strong> You are <strong>PKR {fmt(proximity.gap)}</strong> away from the next tax bracket ({(proximity.nextSlabRate * 100).toFixed(0)}%). A raise beyond this point will increase your marginal tax rate.
                </InfoBox>
              )}

              {/* Year comparison */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '1.1rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Year-Over-Year Comparison</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary, fontWeight: 600 }}>FY 2024-25</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: colors.text }}>PKR {fmt(result2425.tax)}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(249,115,22,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#f97316', fontWeight: 600 }}>FY 2025-26</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#f97316' }}>PKR {fmt(result2526.tax)}</p>
                  </div>
                </div>
                {taxDiff !== 0 && (
                  <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: taxDiff < 0 ? '#10b981' : '#ef4444', fontWeight: 600, textAlign: 'center' }}>
                    {taxDiff < 0
                      ? `✅ You save PKR ${fmt(Math.abs(taxDiff))} more this year vs last year`
                      : `⚠️ You pay PKR ${fmt(taxDiff)} more this year vs last year`}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '0.75rem', border: `1px solid ${colors.border}` }}>
        <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary, lineHeight: 1.7 }}>
          ⚠️ <strong>Disclaimer:</strong> This tool is for educational and informational purposes only. It is not affiliated with the Federal Board of Revenue (FBR) or any government agency. Calculations are based on the Finance Act 2025 and are estimates. This does not constitute professional tax or financial advice. Please consult a certified tax practitioner (RTP) or CA before filing your returns.
        </p>
      </div>
    </ToolLayout>
  )
}
