import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import PakistanFriendlyGuide from '../components/PakistanFriendlyGuide'
import { useTheme } from '../hooks/useTheme'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { ActionCallout, CollapsibleSection } from '../components/decision/DecisionBlocks'

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

function calcAffordablePrincipal(targetEmi, annualRate, months) {
  if (!targetEmi || !annualRate || !months) return 0
  let low = 0
  let high = targetEmi * months * 2
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2
    const emi = calcEMI(mid, annualRate, months)
    if (emi > targetEmi) high = mid
    else low = mid
  }
  return Math.round(low)
}

function simulateEarlyPayoff(principal, annualRate, months, lumpSum, payoffMonth) {
  if (!principal || !annualRate || !months || !lumpSum || !payoffMonth) return null
  const r = annualRate / 100 / 12
  const emi = calcEMI(principal, annualRate, months)
  if (!emi) return null

  let balance = principal
  let totalInterest = 0
  let monthsUsed = 0

  while (balance > 1 && monthsUsed < months + 120) {
    monthsUsed += 1
    const interest = balance * r
    const principalPaid = Math.min(balance, emi - interest)
    balance = Math.max(0, balance - principalPaid)
    totalInterest += interest

    if (monthsUsed === payoffMonth) {
      balance = Math.max(0, balance - lumpSum)
    }
  }

  return { totalInterest, monthsUsed }
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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

function Input({ label, value, onChange, type = 'number', min, max, step, suffix, prefix, hint, isDark, colors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '160px' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.muted }}>{label}</label>
      {hint && <div style={{ fontSize: '0.74rem', color: colors.muted, lineHeight: 1.45 }}>{hint}</div>}
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

function Tip({ children, colors, isDark }) {
  return (
    <div style={{
      background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.08)',
      border: `1px solid ${isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.18)'}`,
      borderRadius: '0.85rem',
      padding: '0.8rem 0.95rem',
      fontSize: '0.78rem',
      lineHeight: 1.6,
      color: colors.muted,
    }}>
      <strong style={{ color: colors.text }}>Simple tip:</strong> {children}
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
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [cashBufferMonths, setCashBufferMonths] = useState('3')
  const [urgency, setUrgency] = useState('normal')
  const [assetPrice, setAssetPrice] = useState('')
  const [cashAvailable, setCashAvailable] = useState('')
  const [prepayMonth, setPrepayMonth] = useState('')
  const [prepayAmount, setPrepayAmount] = useState('')
  const [currency, setCurrency] = useState('PKR')
  const [showTable, setShowTable] = useState(false)
  const [tableRows, setTableRows] = useState(12)
  const [copyState, setCopyState] = useState('idle')

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
  const assetGap = useMemo(() => {
    const price = Number(assetPrice) || 0
    const cash = Number(cashAvailable) || 0
    return price > 0 ? Math.max(0, price - cash) : null
  }, [assetPrice, cashAvailable])
  const emiToIncomePct = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    if (!emi || !income) return null
    return (emi / income) * 100
  }, [emi, monthlyIncome])
  const surplusAfterExpenses = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    const expenses = Number(monthlyExpenses) || 0
    if (!income) return null
    return Math.max(0, income - expenses)
  }, [monthlyIncome, monthlyExpenses])
  const targetSafeEmi = useMemo(() => {
    const income = Number(monthlyIncome) || 0
    if (!income) return null
    const expenses = Number(monthlyExpenses) || 0
    const freeCash = Math.max(0, income - expenses)
    return Math.max(0, Math.min(income * 0.28, freeCash * 0.65))
  }, [monthlyIncome, monthlyExpenses])
  const recommendedMaxBorrow = useMemo(() => {
    if (!targetSafeEmi || !rate || !months) return null
    return calcAffordablePrincipal(targetSafeEmi, Number(rate), months)
  }, [targetSafeEmi, rate, months])
  const affordabilityText = useMemo(() => {
    if (emiToIncomePct === null) return 'Add monthly income if you want an affordability signal.'
    if (emiToIncomePct <= 20) return 'Comfortable range for many households if other debts are low.'
    if (emiToIncomePct <= 35) return 'Manageable, but the loan will meaningfully shape your monthly flexibility.'
    if (emiToIncomePct <= 45) return 'Tight. One weak month or extra expense can create pressure.'
    return 'High-risk EMI burden. Rework rate, tenure, or financed amount before committing.'
  }, [emiToIncomePct])
  const tenureOptions = useMemo(() => {
    const principalNum = Number(principal)
    const rateNum = Number(rate)
    if (!principalNum || !rateNum) return []
    return [
      { label: '3 years', months: 36 },
      { label: '5 years', months: 60 },
      { label: '7 years', months: 84 },
      { label: '10 years', months: 120 },
      { label: '15 years', months: 180 },
    ]
      .filter((item) => item.months >= 12)
      .map((item) => {
        const optionEmi = calcEMI(principalNum, rateNum, item.months)
        const optionTotal = optionEmi ? optionEmi * item.months : 0
        const optionInterest = optionTotal - principalNum
        return { ...item, emi: optionEmi, interest: optionInterest }
      })
  }, [principal, rate])
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
  const earlyPayoff = useMemo(() => {
    const lump = Number(prepayAmount) || 0
    const payoffAt = Number(prepayMonth) || 0
    if (!lump || !payoffAt || !totalInterest) return null
    const simulated = simulateEarlyPayoff(Number(principal), Number(rate), months, lump, payoffAt)
    if (!simulated) return null
    return {
      ...simulated,
      interestSaved: Math.max(0, totalInterest - simulated.totalInterest),
      monthsSaved: Math.max(0, months - simulated.monthsUsed),
    }
  }, [prepayAmount, prepayMonth, principal, rate, months, totalInterest])
  const decision = useMemo(() => {
    const issues = []
    const actions = []
    let title = 'This loan can be workable if the assumptions hold'
    let body = 'The current EMI and interest burden are not automatically bad, but they still need to fit your income stability, emergency cushion, and actual need for the purchase.'
    let accent = '#06b6d4'

    if (assetGap !== null && assetGap > 0 && Math.abs(assetGap - Number(principal)) > Math.max(5000, assetGap * 0.05)) {
      issues.push('Your entered loan amount does not closely match the gap between asset price and available cash.')
      actions.push('Align the loan amount with the actual gap after your down payment.')
    }
    if (emiToIncomePct !== null && emiToIncomePct > 35) {
      title = 'This loan looks aggressive under your current income'
      body = 'The EMI is taking a large share of income, which increases the chance that one weak month, emergency, or expense shock will push the loan from manageable to stressful.'
      accent = '#ef4444'
      issues.push('EMI is above the usual comfort zone for many households.')
      actions.push('Borrow less, increase down payment, or shorten the need by delaying the purchase.')
    } else if (emiToIncomePct !== null && emiToIncomePct > 25) {
      title = 'This loan may work, but it needs discipline'
      body = 'The EMI is not automatically unsafe, but it will meaningfully reduce monthly flexibility. The decision becomes much better if you have stable income and a real emergency cushion.'
      accent = '#f59e0b'
      actions.push('Check whether a modestly smaller loan keeps the same purchase within safer limits.')
    }
    if (interestPct !== null && Number(interestPct) > 60) {
      issues.push('Total interest is very large relative to what you are borrowing.')
      actions.push('Test a shorter tenure and compare whether the higher EMI is worth the lower total cost.')
    }
    if (recommendedMaxBorrow && Number(principal) > recommendedMaxBorrow * 1.05) {
      issues.push('The current loan is above the safer borrowing range implied by your income and expenses.')
      actions.push(`A safer max borrowing range under these assumptions is around ${fmt(recommendedMaxBorrow, currency)}.`)
    }
    if ((Number(cashBufferMonths) || 0) < 3) {
      issues.push('Emergency cushion looks thin for taking on a fixed monthly loan obligation.')
      actions.push('Build at least a few months of emergency buffer before stretching the loan.')
    }
    if (urgency === 'low') {
      actions.push('Because the purchase is not urgent, compare this against saving first and borrowing less later.')
    }
    if (earlyPayoff?.interestSaved > 0) {
      actions.push(`If you can prepay ${fmt(Number(prepayAmount), currency)} around month ${prepayMonth}, you may save about ${fmt(Math.round(earlyPayoff.interestSaved), currency)} in interest.`)
    }

    if (actions.length === 0) {
      actions.push('Verify the bank rate, fees, and prepayment penalty before deciding.')
      actions.push('Use the amortization schedule to understand where interest is concentrated.')
      actions.push('Borrow only for the part of the purchase that adds real value to your life or work.')
    }

    return { title, body, accent, issues, actions: actions.slice(0, 4) }
  }, [assetGap, principal, emiToIncomePct, interestPct, recommendedMaxBorrow, cashBufferMonths, urgency, earlyPayoff, prepayAmount, prepayMonth, currency])

  const summaryText = useMemo(() => {
    if (!emi) return ''
    return [
      'Rafiqy Loan Decision Summary',
      `Loan amount: ${fmt(Math.round(Number(principal)), currency)}`,
      `Rate: ${Number(rate)}% annually`,
      `Tenure: ${months} months`,
      `Monthly EMI: ${fmt(Math.round(emi), currency)}`,
      `Total interest: ${fmt(Math.round(totalInterest), currency)}`,
      targetSafeEmi ? `Safer EMI zone under your numbers: around ${fmt(Math.round(targetSafeEmi), currency)} / month` : null,
      recommendedMaxBorrow ? `Safer max borrowing estimate: ${fmt(recommendedMaxBorrow, currency)}` : null,
      earlyPayoff?.interestSaved ? `Possible early-payoff interest saving: ${fmt(Math.round(earlyPayoff.interestSaved), currency)}` : null,
      `Decision note: ${decision.title}`,
      `Next step: ${decision.actions[0] || 'Verify the real bank offer and compare a smaller loan.'}`,
    ].filter(Boolean).join('\n')
  }, [emi, principal, currency, rate, months, totalInterest, targetSafeEmi, recommendedMaxBorrow, earlyPayoff, decision])

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 1800)
    }
  }

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
            Decide how much to borrow, for how long, and whether the loan is worth its real cost
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
        <PakistanFriendlyGuide toolId="loan-emi" />
        <Tip colors={colors} isDark={isDark}>
          “Amortization” just means the month-by-month breakup of each installment into bank interest and actual loan repayment. You do not need the formula to use the tool well.
        </Tip>

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
              hint="This is the amount you want to borrow from the bank, not the full item price."
              isDark={isDark} colors={colors} />
            <Input label="Annual Interest Rate" value={rate} onChange={setRate}
              min={0.1} max={100} step={0.1} suffix="%"
              hint="Use the lender's quoted yearly rate. Even a small rate drop can save meaningful money."
              isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Tenure (Years)" value={tenureYears} onChange={setTenureYears}
              min={0} max={30} step={1} suffix="yrs"
              hint="Longer tenure lowers EMI but usually increases wasted interest."
              isDark={isDark} colors={colors} />
            <Input label="Tenure (Extra Months)" value={tenureMonths} onChange={setTenureMonths}
              min={0} max={11} step={1} suffix="mo" isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Monthly Income (optional)" value={monthlyIncome} onChange={setMonthlyIncome}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              hint="Needed if you want the tool to judge affordability, not just calculate EMI."
              isDark={isDark} colors={colors} />
            <Input label="Monthly fixed expenses (optional)" value={monthlyExpenses} onChange={setMonthlyExpenses}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              hint="Think rent, bills, school fees, other debt, and must-pay commitments."
              isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Item / asset price (optional)" value={assetPrice} onChange={setAssetPrice}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              hint="Add this if you want help deciding whether you are borrowing too much of the purchase price."
              isDark={isDark} colors={colors} />
            <Input label="Cash available now (optional)" value={cashAvailable} onChange={setCashAvailable}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              hint="Use this for down payment, own contribution, or money you can safely put in upfront."
              isDark={isDark} colors={colors} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="Emergency buffer in months" value={cashBufferMonths} onChange={setCashBufferMonths}
              min={0} max={24} step={1} suffix="months"
              hint="Roughly how many months of essential expenses you could cover if income suddenly stopped."
              isDark={isDark} colors={colors} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.muted }}>How urgent is the purchase?</label>
              <div style={{ fontSize: '0.74rem', color: colors.muted, lineHeight: 1.45 }}>Urgency matters because a non-urgent purchase is easier to delay, save for, and borrow less on later.</div>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={{
                width: '100%', padding: '0.55rem 0.75rem',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${colors.border}`, borderRadius: '0.6rem', color: colors.text,
                fontSize: '0.95rem', fontFamily: FONT, outline: 'none',
              }}>
                <option value="high">High urgency</option>
                <option value="normal">Normal urgency</option>
                <option value="low">Low urgency</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Input label="If I prepay later, how much?" value={prepayAmount} onChange={setPrepayAmount}
              min={0} step={10000} prefix={currency === 'PKR' ? 'Rs' : '$'}
              hint="Optional: enter a future lump sum if you think you may close part of the loan early."
              isDark={isDark} colors={colors} />
            <Input label="Prepay at month number" value={prepayMonth} onChange={setPrepayMonth}
              min={1} max={months || 360} step={1} suffix="month"
              hint="Example: month 12 means one year after the loan starts."
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
            <ActionCallout
              title={decision.title}
              body={decision.body}
              accent={decision.accent}
              colors={colors}
              actions={decision.actions}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <StatCard label="Monthly EMI" value={fmt(Math.round(emi), currency)}
                color={accentColor} isDark={isDark} colors={colors} />
              <StatCard label="Total Payment" value={fmt(Math.round(totalPayment), currency)}
                sub={`Principal + Interest`} color="#8b5cf6" isDark={isDark} colors={colors} />
              <StatCard label="Total Interest" value={fmt(Math.round(totalInterest), currency)}
                sub={`${interestPct}% of principal`} color="#f97316" isDark={isDark} colors={colors} />
              <StatCard label="EMI vs Income" value={emiToIncomePct !== null ? `${emiToIncomePct.toFixed(1)}%` : 'Add income'}
                sub={affordabilityText} color="#10b981" isDark={isDark} colors={colors} />
              <StatCard label="Safer max borrow" value={recommendedMaxBorrow ? fmt(recommendedMaxBorrow, currency) : 'Add income'}
                sub={targetSafeEmi ? `Based on about ${fmt(Math.round(targetSafeEmi), currency)}/mo being safer` : 'Needs income and expenses'} color="#14b8a6" isDark={isDark} colors={colors} />
              <StatCard label="Free cash after expenses" value={surplusAfterExpenses !== null ? fmt(Math.round(surplusAfterExpenses), currency) : 'Add expenses'}
                sub="This is the space from which your EMI must realistically come." color="#ec4899" isDark={isDark} colors={colors} />
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

            {tenureOptions.length > 0 && (
              <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: colors.text, marginBottom: '0.25rem' }}>Which tenure looks efficient?</div>
                <div style={{ fontSize: '0.76rem', color: colors.muted, lineHeight: 1.55, marginBottom: '0.8rem' }}>
                  This compares the same borrowing amount across common tenures so you can see when a “comfortable EMI” starts becoming expensive over time.
                </div>
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {tenureOptions.map((option) => (
                    <div key={option.label} style={{ border: `1px solid ${colors.border}`, borderRadius: '0.8rem', padding: '0.8rem 0.9rem', background: colors.card }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 800, color: colors.text }}>{option.label}</div>
                        <div style={{ color: accentColor, fontWeight: 700 }}>{fmt(Math.round(option.emi), currency)}/mo</div>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: colors.muted, marginTop: '0.25rem' }}>
                        Total interest: <strong style={{ color: colors.text }}>{fmt(Math.round(option.interest), currency)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {earlyPayoff && (
              <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.15rem 1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ color: colors.text, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  If you close part of the loan early
                </div>
                <div style={{ color: colors.muted, fontSize: '0.82rem', lineHeight: 1.65, marginBottom: '0.8rem' }}>
                  Based on a lump-sum prepayment of <strong style={{ color: colors.text }}>{fmt(Number(prepayAmount), currency)}</strong> in month <strong style={{ color: colors.text }}>{prepayMonth}</strong>, this is the likely effect if the lender allows prepayment without major penalty.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                  <StatCard label="Interest saved" value={fmt(Math.round(earlyPayoff.interestSaved), currency)} color="#22c55e" isDark={isDark} colors={colors} />
                  <StatCard label="Months saved" value={`${earlyPayoff.monthsSaved} mo`} sub={`New payoff: ${earlyPayoff.monthsUsed} months`} color="#8b5cf6" isDark={isDark} colors={colors} />
                </div>
                <div style={{ marginTop: '0.8rem' }}>
                  <Tip colors={colors} isDark={isDark}>
                    If your bank charges a prepayment penalty, compare that penalty against the interest saved. Early payoff is only attractive when the saving clearly beats the fee.
                  </Tip>
                </div>
              </div>
            )}

            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '1rem', padding: '1.1rem 1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ color: colors.text, fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                How to use this result
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: colors.muted, lineHeight: 1.7, fontSize: '0.82rem' }}>
                <li>Use monthly EMI to judge cashflow pressure, not just whether the bank may approve you.</li>
                <li>Use total interest to judge whether a “comfortable EMI” is actually costing you too much extra money.</li>
                <li>Use the safer max borrowing estimate as a guardrail, not as free permission to borrow up to that exact number.</li>
                <li>For property decisions, use this together with Rent vs Buy instead of comparing rent against EMI alone.</li>
              </ul>
              {annualEMI && (
                <div style={{ marginTop: '0.7rem', fontSize: '0.78rem', color: colors.muted }}>
                  Annual repayment burden: <strong style={{ color: colors.text }}>{fmt(Math.round(annualEMI), currency)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.9rem' }}>
                <button type="button" onClick={copySummary} style={{ padding: '0.55rem 0.9rem', borderRadius: '0.75rem', border: `1px solid ${copyState === 'error' ? '#ef4444' : accentColor}`, background: copyState === 'copied' ? '#dcfce7' : `${accentColor}12`, color: copyState === 'error' ? '#ef4444' : accentColor, fontWeight: 700, cursor: 'pointer' }}>
                  {copyState === 'copied' ? 'Summary copied' : copyState === 'error' ? 'Copy failed' : 'Copy loan summary'}
                </button>
                <button type="button" onClick={() => downloadText('loan-decision-summary.txt', summaryText)} style={{ padding: '0.55rem 0.9rem', borderRadius: '0.75rem', border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, fontWeight: 700, cursor: 'pointer' }}>
                  Download summary
                </button>
              </div>
            </div>

            <CollapsibleSection
              title="Why the recommendation looks this way"
              summary="Open this if you want the reasoning behind the headline recommendation in plain language."
              colors={colors}
              defaultOpen
            >
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: colors.muted, lineHeight: 1.7, fontSize: '0.82rem' }}>
                {decision.issues.length > 0 ? decision.issues.map((item) => <li key={item}>{item}</li>) : <li>The current numbers do not raise any obvious major warning, but you should still verify fees and rate type.</li>}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection
              title="Simple guide for first-time borrowers"
              summary="These notes are here so technical terms do not get in the way of the decision."
              colors={colors}
            >
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: colors.muted, lineHeight: 1.7, fontSize: '0.82rem' }}>
                <li><strong style={{ color: colors.text }}>Principal</strong> means the amount you borrow from the bank.</li>
                <li><strong style={{ color: colors.text }}>Interest</strong> is the bank's price for lending you that money.</li>
                <li><strong style={{ color: colors.text }}>Tenure</strong> is simply how long you keep the loan running.</li>
                <li><strong style={{ color: colors.text }}>Amortization schedule</strong> is the month-by-month table that shows how much of each EMI goes to interest and how much reduces the actual loan.</li>
                <li><strong style={{ color: colors.text }}>Prepayment</strong> means paying a chunk early to reduce future interest, if your lender allows it at a sensible cost.</li>
              </ul>
            </CollapsibleSection>

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
