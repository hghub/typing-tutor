import { useState, useMemo, useRef, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import {
  SLABS_2526, calcFullTax, optimizeShields,
  VPS_MAX_RATE, CHARITY_MAX_RATE, LIFE_INS_MAX_RATE, LIFE_INS_CAP_ABS,
} from '../data/taxData'

const fmt = (n) => Math.round(n).toLocaleString('en-PK')
const fmtPct = (n) => (n * 100).toFixed(1) + '%'

/* ── Animated counter hook ── */
function useAnimatedNumber(target, duration = 600) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const from = value
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(function step(now) {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * ease))
      if (p < 1) raf.current = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf.current)
  }, [target]) // eslint-disable-line
  return value
}

/* ── Donut chart component ── */
function DonutChart({ segments, size = 140 }) {
  const r = 50, cx = 70, cy = 70, strokeW = 18
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let offset = 0
  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
      {total > 0 && segments.map((seg, i) => {
        const dash = (seg.value / total) * circ
        const gap = circ - dash
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dasharray 0.5s ease' }}
          />
        )
        offset += dash
        return el
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Optimal</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">Split</text>
    </svg>
  )
}

/* ── Bar comparison component ── */
function ScenarioBar({ label, saving, max, color, isDark, colors }) {
  const pct = max > 0 ? (saving / max) * 100 : 0
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.78rem', color: colors.textSecondary, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}><strong>PKR {fmt(saving)}</strong></span>
      </div>
      <div style={{ height: '6px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color, borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

export default function TaxOptimizer() {
  const { isDark, colors } = useTheme()
  const [monthlySalary, setMonthlySalary] = useState('')
  const [annualBonus, setAnnualBonus] = useState('')
  const [budget, setBudget] = useState('')

  const annualIncome = useMemo(() => {
    const sal = parseFloat(monthlySalary) || 0
    const bonus = parseFloat(annualBonus) || 0
    return sal * 12 + bonus
  }, [monthlySalary, annualBonus])

  const baseTax = useMemo(() =>
    calcFullTax({ annualIncome, slabs: SLABS_2526 }).tax,
    [annualIncome]
  )

  const budgetVal = useMemo(() => parseFloat(budget) || 0, [budget])

  const opt = useMemo(() =>
    annualIncome > 0 && budgetVal > 0
      ? optimizeShields(annualIncome, baseTax, budgetVal)
      : null,
    [annualIncome, baseTax, budgetVal]
  )

  const animSaving = useAnimatedNumber(opt?.totalSaving ?? 0)
  const animAfterTax = useAnimatedNumber(opt ? baseTax - opt.totalSaving : baseTax)

  const fieldStyle = {
    width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: `1px solid ${colors.border}`, borderRadius: '0.5rem',
    padding: '0.65rem 0.85rem', color: colors.text, fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: colors.textSecondary, marginBottom: '0.3rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }
  const cardStyle = {
    background: colors.card, border: `1px solid ${colors.border}`,
    borderRadius: '0.9rem', padding: '1.25rem',
  }

  const shieldSegments = opt ? [
    { value: opt.vps,       color: '#6366f1', label: 'VPS' },
    { value: opt.insurance, color: '#10b981', label: 'Insurance' },
    { value: opt.charity,   color: '#f59e0b', label: 'Charity' },
    { value: opt.unshielded,color: 'rgba(148,163,184,0.3)', label: 'Unshielded' },
  ].filter(s => s.value > 0) : []

  const maxScenario = opt
    ? Math.max(opt.scenarios.optimal.saving, 1)
    : 1

  const budgetMax = annualIncome > 0
    ? Math.round((VPS_MAX_RATE + CHARITY_MAX_RATE + Math.min(LIFE_INS_MAX_RATE, LIFE_INS_CAP_ABS / annualIncome)) * annualIncome)
    : 5_000_000

  return (
    <ToolLayout toolId="tax-optimizer">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0,
            background: 'linear-gradient(to right, #10b981, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', letterSpacing: '-0.02em',
          }}>
            🧠 Tax Shield Optimizer
          </h1>

        </div>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0, maxWidth: '620px' }}>
          Enter your salary and available budget. The optimizer runs a deterministic constraint solver to find the exact allocation across VPS, Life Insurance, and Charity that maximises your legal tax credit — something no AI can reliably do.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: '1.5rem' }}>

        {/* ── Left: Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={cardStyle}>
            <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Income Details
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Monthly Gross Salary (PKR)</label>
                <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)}
                  placeholder="e.g. 200000" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
              <div>
                <label style={labelStyle}>Annual Bonus / Arrears (PKR)</label>
                <input type="number" value={annualBonus} onChange={e => setAnnualBonus(e.target.value)}
                  placeholder="e.g. 0" style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = colors.border} />
              </div>
              {annualIncome > 0 && (
                <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                  Annual Income: PKR {fmt(annualIncome)} · Base Tax: PKR {fmt(baseTax)}
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              💰 Available Budget for Tax Shields
            </p>
            <p style={{ margin: '0 0 0.9rem', fontSize: '0.78rem', color: colors.textSecondary }}>
              How much can you invest/donate this year?
            </p>
            <div>
              <label style={labelStyle}>Budget (PKR/year)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 500000" style={fieldStyle}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = colors.border} />
            </div>
            {annualIncome > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <label style={labelStyle}>Or drag the slider</label>
                <input type="range" min={0} max={budgetMax} step={10000}
                  value={budgetVal} onChange={e => setBudget(e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: colors.textSecondary, marginTop: '0.2rem' }}>
                  <span>PKR 0</span>
                  <span>PKR {fmt(budgetMax)} (max eligible)</span>
                </div>
              </div>
            )}
          </div>

          {/* Shield limits reference */}
          <div style={cardStyle}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📋 Legal Limits Reference
            </p>
            {[
              { icon: '🏦', label: 'VPS (Section 63)', cap: annualIncome > 0 ? `PKR ${fmt(annualIncome * VPS_MAX_RATE)}` : '20% of income', pct: '20% of income', color: '#6366f1' },
              { icon: '🛡️', label: 'Life Insurance (Section 62)', cap: annualIncome > 0 ? `PKR ${fmt(Math.min(annualIncome * LIFE_INS_MAX_RATE, LIFE_INS_CAP_ABS))}` : 'up to PKR 20L', pct: '20% of income, max PKR 20L', color: '#10b981' },
              { icon: '🤲', label: 'Charity NPO (Section 61)', cap: annualIncome > 0 ? `PKR ${fmt(annualIncome * CHARITY_MAX_RATE)}` : '30% of income', pct: '30% of income', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.55rem 0.7rem', borderRadius: '0.5rem', marginBottom: '0.4rem',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: s.color }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary }}>{s.pct}</p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color }}>{s.cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {!opt ? (
            <div style={{ ...cardStyle, padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧠</div>
              <p style={{ color: colors.textSecondary, margin: '0 0 0.5rem', fontWeight: 600 }}>Enter your salary and budget</p>
              <p style={{ color: colors.textSecondary, fontSize: '0.82rem', margin: 0 }}>The optimizer will calculate the exact split that maximises your tax savings.</p>
            </div>
          ) : (
            <>
              {/* Big savings card */}
              <div style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      💡 Maximum Tax Savings
                    </p>
                    <p style={{ margin: '0 0 0.15rem', fontSize: '2.2rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>
                      PKR {fmt(animSaving)}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: colors.textSecondary }}>
                      Tax reduces from <strong style={{ color: colors.text }}>PKR {fmt(baseTax)}</strong> → <strong style={{ color: '#10b981' }}>PKR {fmt(animAfterTax)}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase' }}>ROI</p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#06b6d4' }}>
                      {budgetVal > 0 ? fmtPct(opt.totalSaving / budgetVal) : '—'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary }}>per PKR invested</p>
                  </div>
                </div>
              </div>

              {/* Allocation split */}
              <div style={cardStyle}>
                <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🎯 Optimal Allocation
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <DonutChart segments={shieldSegments} size={130} />
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    {[
                      { label: 'VPS / Pension', value: opt.vps, color: '#6366f1', icon: '🏦', section: 'Sec 63' },
                      { label: 'Life Insurance', value: opt.insurance, color: '#10b981', icon: '🛡️', section: 'Sec 62' },
                      { label: 'Charity (NPO)', value: opt.charity, color: '#f59e0b', icon: '🤲', section: 'Sec 61' },
                      ...(opt.unshielded > 0 ? [{ label: 'Over cap (no credit)', value: opt.unshielded, color: '#64748b', icon: '⚠️', section: '' }] : []),
                    ].map((seg, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.45rem 0', borderBottom: `1px solid ${colors.border}`,
                      }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: colors.textSecondary, flex: 1 }}>{seg.icon} {seg.label} {seg.section && <span style={{ fontSize: '0.68rem', color: seg.color }}>({seg.section})</span>}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: seg.color }}>PKR {fmt(seg.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scenario comparison */}
              <div style={cardStyle}>
                <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📊 Scenario Comparison
                </p>
                {Object.values(opt.scenarios).map((sc, i) => (
                  <ScenarioBar key={i} label={sc.label} saving={sc.saving}
                    max={maxScenario}
                    color={sc.label === 'Optimal Mix' ? '#10b981' : '#6366f1'}
                    isDark={isDark} colors={colors} />
                ))}
                <div style={{
                  marginTop: '0.75rem', padding: '0.7rem 0.9rem',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '0.5rem', fontSize: '0.78rem', color: '#10b981', fontWeight: 600,
                }}>
                  ✅ Optimal Mix saves <strong>PKR {fmt(opt.totalSaving - Math.max(opt.scenarios.vpsOnly.saving, opt.scenarios.charOnly.saving, opt.scenarios.insOnly.saving))}</strong> more than the single best alternative
                </div>
              </div>

              {/* What-if note */}
              {opt.unshielded > 0 && (
                <div style={{
                  padding: '0.85rem 1rem',
                  background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem',
                  fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1.6,
                }}>
                  ⚠️ <strong>PKR {fmt(opt.unshielded)}</strong> of your budget exceeds all legal shield caps and earns no tax credit. Consider redirecting to a higher-yield investment instead.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginTop: '2rem', ...cardStyle }}>
        <p style={{ margin: '0 0 0.9rem', fontSize: '0.72rem', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🔬 How the Optimizer Works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { step: '1', title: 'Calculates base tax', detail: 'Applies Finance Act 2025 slabs + surcharge to your income.', color: '#6366f1' },
            { step: '2', title: 'Derives avg tax rate', detail: 'avgRate = tax ÷ income. This is the legal rate applied to tax credits.', color: '#10b981' },
            { step: '3', title: 'Fills shields by cap', detail: 'Allocates budget: VPS (20%) → Insurance (20%, max 2M) → Charity (30%).', color: '#f59e0b' },
            { step: '4', title: 'Computes credit', detail: 'credit = eligible amount × avgRate. Deterministic — same answer every time.', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '0.75rem', borderRadius: '0.6rem',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{s.step}</div>
              <p style={{ margin: '0 0 0.2rem', fontSize: '0.82rem', fontWeight: 700, color: colors.text }}>{s.title}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.5 }}>{s.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '0.75rem', border: `1px solid ${colors.border}` }}>
        <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textSecondary, lineHeight: 1.7 }}>
          ⚠️ <strong>Disclaimer:</strong> Results are estimates based on Finance Act 2025 average tax rate method. Actual credits require FBR-approved institutions for VPS/NPO, and crossed-cheque payments. Consult a certified tax practitioner (RTP or CA) before filing.
        </p>
      </div>
    </ToolLayout>
  )
}
