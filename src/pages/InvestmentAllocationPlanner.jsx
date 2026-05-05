import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
import FreshnessBanner from '../components/decision/FreshnessBanner'
import {
  DecisionHero,
  SectionCard,
  FieldsGrid,
  Field,
  NumberInput,
  SelectInput,
  SliderInput,
  MetricGrid,
  MetricCard,
  RecommendationBanner,
  ActionCallout,
  BulletList,
  ScoreBars,
  CollapsibleSection,
} from '../components/decision/DecisionBlocks'
import { clamp, fmtCurrency, fmtPercent, fmtNumber, round } from '../lib/decision'

const ACCENT = '#0f766e'

const GOAL_PROFILES = {
  preserve: {
    label: 'Capital preservation first',
    base: { liquidity: 30, income: 40, balanced: 18, equity: 2, gold: 5, usd: 5 },
  },
  income: {
    label: 'Stable income with moderate growth',
    base: { liquidity: 16, income: 38, balanced: 24, equity: 8, gold: 7, usd: 7 },
  },
  balanced: {
    label: 'Balanced long-term growth',
    base: { liquidity: 10, income: 22, balanced: 30, equity: 22, gold: 8, usd: 8 },
  },
  growth: {
    label: 'Long-term growth',
    base: { liquidity: 8, income: 12, balanced: 22, equity: 40, gold: 10, usd: 8 },
  },
  aggressive: {
    label: 'Growth-heavy with volatility tolerance',
    base: { liquidity: 5, income: 8, balanced: 15, equity: 57, gold: 8, usd: 7 },
  },
}

const DEBT_PRESSURE = {
  low: { label: 'Low', drag: 0 },
  moderate: { label: 'Moderate', drag: 1 },
  high: { label: 'High', drag: 2 },
}

const STABILITY = {
  unstable: { label: 'Unstable income', drag: 2 },
  normal: { label: 'Normal', drag: 1 },
  stable: { label: 'Stable income', drag: 0 },
}

const FX_PREF = {
  low: { label: 'Low', target: 4 },
  medium: { label: 'Some hedge', target: 7 },
  high: { label: 'Strong hedge', target: 10 },
}

const GOLD_PREF = {
  low: { label: 'Low', target: 5 },
  medium: { label: 'Moderate', target: 8 },
  high: { label: 'Strong', target: 12 },
}

const AMOUNT_PRESETS = [
  { label: '20 lakh', value: 2000000 },
  { label: '50 lakh', value: 5000000 },
  { label: '1 crore', value: 10000000 },
  { label: '5 crore', value: 50000000 },
  { label: '10 crore', value: 100000000 },
  { label: '15 crore', value: 150000000 },
]

const STRATEGY_PRESETS = [
  {
    id: 'retirement',
    label: 'Retirement corpus',
    note: 'Long horizon, growth with discipline',
    values: {
      goal: 'growth',
      horizonYears: 15,
      riskTolerance: 4,
      emergencyMonthsCovered: 6,
      monthlyWithdrawalNeed: 0,
      nextMajorGoalYears: 8,
      debtPressure: 'low',
      incomeStability: 'stable',
      fxPreference: 'medium',
      goldPreference: 'medium',
    },
  },
  {
    id: 'income',
    label: 'Monthly income needed',
    note: 'Defensive mix for cash support',
    values: {
      goal: 'income',
      horizonYears: 8,
      riskTolerance: 2,
      emergencyMonthsCovered: 6,
      monthlyWithdrawalNeed: 150000,
      nextMajorGoalYears: 4,
      debtPressure: 'moderate',
      incomeStability: 'normal',
      fxPreference: 'low',
      goldPreference: 'medium',
    },
  },
  {
    id: 'business-owner',
    label: 'Business owner surplus',
    note: 'Liquidity discipline before growth',
    values: {
      goal: 'balanced',
      horizonYears: 7,
      riskTolerance: 3,
      emergencyMonthsCovered: 4,
      monthlyWithdrawalNeed: 0,
      nextMajorGoalYears: 3,
      debtPressure: 'moderate',
      incomeStability: 'unstable',
      fxPreference: 'medium',
      goldPreference: 'low',
    },
  },
  {
    id: 'house-later',
    label: 'House purchase later',
    note: 'Protect medium-term capital',
    values: {
      goal: 'preserve',
      horizonYears: 4,
      riskTolerance: 2,
      emergencyMonthsCovered: 6,
      monthlyWithdrawalNeed: 0,
      nextMajorGoalYears: 2,
      debtPressure: 'low',
      incomeStability: 'stable',
      fxPreference: 'low',
      goldPreference: 'low',
    },
  },
  {
    id: 'education',
    label: 'Children education fund',
    note: 'Balanced with a defined end-date',
    values: {
      goal: 'balanced',
      horizonYears: 9,
      riskTolerance: 3,
      emergencyMonthsCovered: 6,
      monthlyWithdrawalNeed: 0,
      nextMajorGoalYears: 6,
      debtPressure: 'low',
      incomeStability: 'stable',
      fxPreference: 'medium',
      goldPreference: 'low',
    },
  },
  {
    id: 'family-office',
    label: 'Larger family corpus',
    note: 'Multi-goal, lower concentration, more structure',
    values: {
      goal: 'balanced',
      horizonYears: 12,
      riskTolerance: 3,
      emergencyMonthsCovered: 9,
      monthlyWithdrawalNeed: 250000,
      nextMajorGoalYears: 4,
      debtPressure: 'low',
      incomeStability: 'stable',
      fxPreference: 'high',
      goldPreference: 'medium',
      goalMode: 'multi',
    },
  },
]

const BUCKET_COPY = {
  liquidity: {
    title: 'Safety & liquidity',
    role: 'Emergency top-up, near-term goals, and money you cannot afford to expose to market swings.',
    examples: {
      conventional: 'Money market funds, bank savings, high-quality short-term deposits.',
      shariah: 'Islamic money market funds, Shariah-compliant cash management, near-cash reserves.',
    },
  },
  income: {
    title: 'Income & stability',
    role: 'Low- to medium-volatility bucket for income generation and capital stability.',
    examples: {
      conventional: 'Income funds, sovereign-income categories, short-duration fixed-income products.',
      shariah: 'Islamic income funds, Sukuk-oriented categories, Shariah-compliant income exposure.',
    },
  },
  balanced: {
    title: 'Balanced growth',
    role: 'Middle bucket for users who want growth but not an equity-only ride.',
    examples: {
      conventional: 'Balanced funds, asset-allocation funds, conservative/moderate fund-of-funds.',
      shariah: 'Islamic balanced / asset-allocation / Shariah-compliant fund-of-funds categories.',
    },
  },
  equity: {
    title: 'Long-term growth',
    role: 'Highest-growth bucket, but also the one that can swing hardest in the short run.',
    examples: {
      conventional: 'Equity funds, VPS equity exposure for long horizons, broad stock-market allocations.',
      shariah: 'Islamic equity funds, Shariah-compliant stock exposure, VPS Shariah equity categories.',
    },
  },
  gold: {
    title: 'Gold hedge',
    role: 'Diversification and inflation / currency-stress hedge, not the core of the whole plan.',
    examples: {
      conventional: 'Physical gold, gold savings exposure, or gold-linked hedging bucket.',
      shariah: 'Physical gold or Shariah-acceptable gold exposure where available and appropriate.',
    },
  },
  usd: {
    title: 'FX hedge',
    role: 'Protection bucket for users with future foreign-currency needs, not a default bet for everyone.',
    examples: {
      conventional: 'USD-linked reserve planning, FCY exposure, or foreign-currency need-matching.',
      shariah: 'Shariah-compliant foreign-currency need-matching where appropriate.',
    },
  },
}

const CATEGORY_REFERENCE = {
  conventional: [
    { category: 'Money Market', role: 'Safety / liquidity', risk: 'Low', fit: 'Emergency reserve, near-cash parking, very short horizon' },
    { category: 'Income', role: 'Income / stability', risk: 'Low to medium', fit: 'Lower-volatility compounding and defensive allocation' },
    { category: 'Fixed Rate / Return', role: 'Stability with defined-return style structures', risk: 'Very low to moderate', fit: 'Users prioritizing predictability over growth' },
    { category: 'Asset Allocation / Balanced / Fund of Funds', role: 'Balanced growth', risk: 'Medium', fit: 'Mixed-goal users who need some growth without full equity concentration' },
    { category: 'Dedicated Equity', role: 'Long-term growth', risk: 'High', fit: 'Long horizon capital that can tolerate sharp drawdowns' },
  ],
  shariah: [
    { category: 'Shariah Compliant Money Market', role: 'Safety / liquidity', risk: 'Low', fit: 'Islamic near-cash reserve and emergency allocation' },
    { category: 'Islamic Income / Sukuk-oriented', role: 'Income / stability', risk: 'Low to medium', fit: 'Shariah-compliant stability and lower-volatility compounding' },
    { category: 'Shariah Compliant Asset Allocation', role: 'Balanced growth', risk: 'Medium', fit: 'Mixed-goal Shariah portfolio needing some growth with internal balance' },
    { category: 'Shariah Compliant Fund of Funds', role: 'Balanced to growth depending on mandate', risk: 'Medium to high', fit: 'Users wanting diversified Shariah exposure via managed mix' },
    { category: 'Shariah Compliant Dedicated Equity', role: 'Long-term growth', risk: 'High', fit: 'Patient capital with genuine tolerance for volatility' },
  ],
}

function cloneAlloc(alloc) {
  return Object.fromEntries(Object.entries(alloc).map(([key, value]) => [key, Number(value) || 0]))
}

function shiftWeight(alloc, fromKeys, toKeys, amount) {
  let remaining = amount
  for (const key of fromKeys) {
    if (remaining <= 0) break
    const move = Math.min(alloc[key], remaining)
    alloc[key] -= move
    remaining -= move
  }
  const addEach = amount / toKeys.length
  toKeys.forEach((key) => {
    alloc[key] += addEach
  })
}

function normalizeAllocation(alloc) {
  const total = Object.values(alloc).reduce((sum, value) => sum + value, 0) || 1
  const normalized = Object.fromEntries(
    Object.entries(alloc).map(([key, value]) => [key, round((value / total) * 100, 1)]),
  )
  const diff = round(100 - Object.values(normalized).reduce((sum, value) => sum + value, 0), 1)
  normalized.balanced = round(normalized.balanced + diff, 1)
  return normalized
}

function normalizeGoalShares(rawShares) {
  const total = Math.max(1, rawShares.near + rawShares.medium + rawShares.long)
  return {
    near: round((rawShares.near / total) * 100, 1),
    medium: round((rawShares.medium / total) * 100, 1),
    long: round((rawShares.long / total) * 100, 1),
  }
}

function buildAllocation(inputs) {
  const base = cloneAlloc(GOAL_PROFILES[inputs.goal].base)
  const investableAmount = Number(inputs.amount) || 0
  const emergencyTargetMonths = 6
  const emergencyGapAmount = Math.max(0, (emergencyTargetMonths - inputs.emergencyMonthsCovered) * inputs.monthlyEssentialSpend)
  const emergencyGapPct = investableAmount > 0 ? clamp((emergencyGapAmount / investableAmount) * 100, 0, 45) : 0

  if (inputs.riskTolerance <= 2) {
    shiftWeight(base, ['equity', 'balanced'], ['income', 'liquidity'], inputs.riskTolerance === 1 ? 18 : 10)
  } else if (inputs.riskTolerance >= 4) {
    shiftWeight(base, ['liquidity', 'income'], ['equity', 'balanced'], inputs.riskTolerance === 5 ? 16 : 8)
  }

  if (inputs.horizonYears <= 3) {
    shiftWeight(base, ['equity', 'balanced'], ['liquidity', 'income'], 24)
  } else if (inputs.horizonYears <= 5) {
    shiftWeight(base, ['equity', 'balanced'], ['liquidity', 'income'], 12)
  } else if (inputs.horizonYears >= 10) {
    shiftWeight(base, ['liquidity', 'income'], ['equity', 'balanced'], 8)
  }

  if (inputs.nextMajorGoalYears <= 3) {
    shiftWeight(base, ['equity', 'balanced'], ['liquidity', 'income'], 10)
  }

  if (inputs.goalMode === 'multi') {
    shiftWeight(base, ['equity'], ['liquidity', 'income', 'balanced'], 8)
  }

  if (inputs.debtPressure === 'high') {
    shiftWeight(base, ['equity', 'balanced'], ['liquidity', 'income'], 10)
  } else if (inputs.debtPressure === 'moderate') {
    shiftWeight(base, ['equity'], ['income'], 4)
  }

  if (inputs.incomeStability === 'unstable') {
    shiftWeight(base, ['equity', 'balanced'], ['liquidity', 'income'], 10)
  } else if (inputs.incomeStability === 'normal') {
    shiftWeight(base, ['equity'], ['income'], 3)
  }

  if (emergencyGapPct > base.liquidity) {
    shiftWeight(base, ['equity', 'balanced', 'income'], ['liquidity'], emergencyGapPct - base.liquidity)
  }

  const annualWithdrawalRatio = investableAmount > 0 ? (inputs.monthlyWithdrawalNeed * 12) / investableAmount : 0
  if (annualWithdrawalRatio >= 0.08) {
    shiftWeight(base, ['equity', 'balanced'], ['income', 'liquidity'], 12)
  } else if (annualWithdrawalRatio >= 0.04) {
    shiftWeight(base, ['equity'], ['income', 'liquidity'], 6)
  }

  const goldTarget = GOLD_PREF[inputs.goldPreference].target
  const usdTarget = FX_PREF[inputs.fxPreference].target
  if (base.gold < goldTarget) shiftWeight(base, ['balanced', 'equity', 'income'], ['gold'], goldTarget - base.gold)
  if (base.usd < usdTarget) shiftWeight(base, ['balanced', 'equity', 'income'], ['usd'], usdTarget - base.usd)

  const allocation = normalizeAllocation(base)
  const buckets = Object.fromEntries(
    Object.entries(allocation).map(([key, pct]) => [key, round((pct / 100) * investableAmount)]),
  )

  const scores = {
    stability: round(allocation.liquidity * 0.95 + allocation.income * 0.8 + allocation.balanced * 0.45 + allocation.equity * 0.15 + allocation.gold * 0.35 + allocation.usd * 0.5, 1),
    growth: round(allocation.equity * 0.95 + allocation.balanced * 0.65 + allocation.income * 0.2 + allocation.gold * 0.25 + allocation.usd * 0.15, 1),
    liquidity: round(allocation.liquidity * 1 + allocation.income * 0.7 + allocation.balanced * 0.25 + allocation.usd * 0.35, 1),
    inflation: round(allocation.equity * 0.65 + allocation.balanced * 0.55 + allocation.gold * 0.9 + allocation.usd * 0.8 + allocation.income * 0.25, 1),
  }

  const deployNow = Math.max(0, investableAmount - Math.max(emergencyGapAmount, buckets.liquidity))
  const growthBucketAmount = buckets.balanced + buckets.equity
  const hedgeBucketAmount = buckets.gold + buckets.usd
  const monthlyContributionAnnual = inputs.monthlyContribution * 12
  const incomeNeedCovered = inputs.monthlyWithdrawalNeed > 0
    ? Math.min(1, ((buckets.liquidity + buckets.income) / Math.max(1, inputs.monthlyWithdrawalNeed * 24)))
    : 1
  const goalShares = normalizeGoalShares(inputs.goalShares || { near: 20, medium: 30, long: 50 })
  const goalBuckets = {
    near: round((goalShares.near / 100) * investableAmount),
    medium: round((goalShares.medium / 100) * investableAmount),
    long: round((goalShares.long / 100) * investableAmount),
  }

  let decisionTitle = 'Use multiple buckets, not one single investment'
  let decisionBody = 'Your money should not all do one job. Some of it must protect liquidity, some should produce stability, and only the longer-horizon portion should carry real market risk.'
  let decisionTrack = 'The strongest plans separate safety from growth before chasing return.'
  const actionSteps = []

  if (inputs.emergencyMonthsCovered < emergencyTargetMonths) {
    decisionTitle = 'Protect liquidity first, then deploy the rest'
    decisionBody = 'Your emergency reserve is still below a six-month baseline, so part of this corpus should stay boring and liquid before you push harder into growth.'
    decisionTrack = 'This is not wasted return. It is what keeps the rest of the portfolio from being liquidated at the wrong time.'
    actionSteps.push('Top up emergency liquidity first before treating the full amount as investable risk capital.')
  } else if (inputs.horizonYears >= 10 && inputs.riskTolerance >= 4 && inputs.monthlyWithdrawalNeed === 0) {
    decisionTitle = 'Your plan can afford a meaningful growth bucket'
    decisionBody = 'You have enough horizon and enough tolerance to let a larger portion work for long-term growth instead of keeping too much capital idle.'
    decisionTrack = 'The discipline here is staying diversified and not mistaking one strong market phase for a reason to abandon liquidity rules.'
    actionSteps.push('Keep the growth bucket diversified across categories rather than trying to find one “best” product.')
  } else if (annualWithdrawalRatio >= 0.04) {
    decisionTitle = 'This portfolio must serve cash needs, not just growth ambition'
    decisionBody = 'Because you expect monthly withdrawals from the corpus, the portfolio needs more stability and income support than a pure long-term growth plan.'
    decisionTrack = 'Withdrawal pressure can break a portfolio faster than bad intentions if too much is left in volatile buckets.'
    actionSteps.push('Keep at least part of your near-term spending need in liquidity and income buckets instead of forcing equity to fund monthly withdrawals.')
  } else {
    actionSteps.push('Treat this as a bucket plan, not a one-product decision.')
  }

  actionSteps.push('Review the split again if your time horizon, debt pressure, or foreign-currency need changes materially.')
  actionSteps.push('Use regulated fund categories and clear product mandates before mapping money into actual instruments.')
  if (inputs.shariahPreference === 'yes') {
    actionSteps.push('Stay inside Shariah-compliant money market, income, balanced, and equity categories when implementing the plan.')
  }

  const reasons = [
    `Out of ${fmtCurrency(investableAmount)}, the model keeps ${fmtCurrency(buckets.liquidity)} in immediate-liquidity style assets and ${fmtCurrency(buckets.income)} in stability / income buckets before pushing harder into growth.`,
    `Longer-horizon capital is spread across balanced and equity-style buckets instead of forcing one all-or-nothing bet.`,
    `Gold and FX hedge together hold ${fmtCurrency(hedgeBucketAmount)} because inflation protection and currency stress matter, but should not dominate the full plan unless your real need justifies it.`,
  ]
  if (emergencyGapAmount > 0) reasons.push(`Your current emergency reserve appears short by about ${fmtCurrency(emergencyGapAmount)} versus a six-month baseline.`)
  if (inputs.nextMajorGoalYears <= 3) reasons.push('A meaningful near-term goal pulled the plan toward more liquidity and income so the portfolio is not forced to sell risk assets too early.')
  if (annualWithdrawalRatio >= 0.04) reasons.push(`Expected annual withdrawals equal about ${fmtPercent(annualWithdrawalRatio, 1)} of the corpus, so the plan shifted away from pure growth.`)

  const sensitivity = [
    {
      label: 'If your horizon drops to 3 years',
      impact: `${Math.max(0, round(allocation.equity - 8, 1))}% equity-style exposure`,
      detail: 'A shorter horizon should usually reduce the pure-growth bucket and lift liquidity / income instead.',
      tone: '#f59e0b',
    },
    {
      label: 'If emergency reserve reaches 6 months',
      impact: fmtCurrency(Math.max(0, emergencyGapAmount)),
      detail: 'That amount becomes easier to deploy into longer-horizon buckets instead of staying near-cash.',
      tone: '#22c55e',
    },
    {
      label: 'If monthly withdrawals fall to zero',
      impact: `${Math.max(0, round(allocation.equity + allocation.balanced, 1))}% long-horizon bucket`,
      detail: 'Lower withdrawal pressure usually allows more patient compounding and less forced stability.',
      tone: '#06b6d4',
    },
  ]

  return {
    allocation,
    buckets,
    goalShares,
    goalBuckets,
    scores,
    emergencyGapAmount,
    annualWithdrawalRatio,
    monthlyContributionAnnual,
    deployNow,
    growthBucketAmount,
    hedgeBucketAmount,
    incomeNeedCovered,
    reasons,
    decisionTitle,
    decisionBody,
    decisionTrack,
    actionSteps,
    sensitivity,
  }
}

function BucketCard({ bucketKey, pct, amount, shariahPreference, colors }) {
  const bucket = BUCKET_COPY[bucketKey]
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.95rem',
      padding: '0.95rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div style={{ color: colors.text, fontWeight: 800 }}>{bucket.title}</div>
        <div style={{ color: ACCENT, fontWeight: 800 }}>{pct}%</div>
      </div>
      <div style={{ color: colors.text, fontSize: '1rem', fontWeight: 700 }}>{fmtCurrency(amount)}</div>
      <div style={{ color: colors.textSecondary, lineHeight: 1.55, fontSize: '0.82rem' }}>{bucket.role}</div>
      <div style={{ color: colors.textSecondary, lineHeight: 1.55, fontSize: '0.78rem' }}>
        <strong style={{ color: colors.text }}>Possible implementation bucket:</strong>{' '}
        {shariahPreference === 'yes' ? bucket.examples.shariah : bucket.examples.conventional}
      </div>
    </div>
  )
}

export default function InvestmentAllocationPlanner() {
  const { colors } = useTheme()
  const [strategyPreset, setStrategyPreset] = useState('custom')
  const [amount, setAmount] = useState(2000000)
  const [monthlyContribution, setMonthlyContribution] = useState(50000)
  const [monthlyEssentialSpend, setMonthlyEssentialSpend] = useState(180000)
  const [horizonYears, setHorizonYears] = useState(7)
  const [goal, setGoal] = useState('balanced')
  const [riskTolerance, setRiskTolerance] = useState(3)
  const [emergencyMonthsCovered, setEmergencyMonthsCovered] = useState(3)
  const [monthlyWithdrawalNeed, setMonthlyWithdrawalNeed] = useState(0)
  const [nextMajorGoalYears, setNextMajorGoalYears] = useState(5)
  const [debtPressure, setDebtPressure] = useState('moderate')
  const [incomeStability, setIncomeStability] = useState('normal')
  const [goalMode, setGoalMode] = useState('single')
  const [goalShares, setGoalShares] = useState({ near: 20, medium: 30, long: 50 })
  const [shariahPreference, setShariahPreference] = useState('yes')
  const [fxPreference, setFxPreference] = useState('medium')
  const [goldPreference, setGoldPreference] = useState('medium')
  const [copyState, setCopyState] = useState('idle')

  const applyPreset = (presetId) => {
    const preset = STRATEGY_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    setStrategyPreset(presetId)
    setGoal(preset.values.goal)
    setHorizonYears(preset.values.horizonYears)
    setRiskTolerance(preset.values.riskTolerance)
    setEmergencyMonthsCovered(preset.values.emergencyMonthsCovered)
    setMonthlyWithdrawalNeed(preset.values.monthlyWithdrawalNeed)
    setNextMajorGoalYears(preset.values.nextMajorGoalYears)
    setDebtPressure(preset.values.debtPressure)
    setIncomeStability(preset.values.incomeStability)
    setGoalMode(preset.values.goalMode || 'single')
    setGoalShares(preset.values.goalMode === 'multi' ? { near: 25, medium: 35, long: 40 } : { near: 20, medium: 30, long: 50 })
    setFxPreference(preset.values.fxPreference)
    setGoldPreference(preset.values.goldPreference)
  }

  const markCustom = () => {
    setStrategyPreset('custom')
  }

  const result = useMemo(() => buildAllocation({
    amount,
    monthlyContribution,
    monthlyEssentialSpend,
    horizonYears,
    goal,
    riskTolerance,
    emergencyMonthsCovered,
    monthlyWithdrawalNeed,
    nextMajorGoalYears,
    debtPressure,
    incomeStability,
    goalMode,
    goalShares,
    shariahPreference,
    fxPreference,
    goldPreference,
  }), [
    amount,
    monthlyContribution,
    monthlyEssentialSpend,
    horizonYears,
    goal,
    riskTolerance,
    emergencyMonthsCovered,
    monthlyWithdrawalNeed,
    nextMajorGoalYears,
    debtPressure,
    incomeStability,
    goalMode,
    goalShares,
    shariahPreference,
    fxPreference,
    goldPreference,
  ])

  const confidence = clamp(0.56 + (horizonYears >= 7 ? 0.08 : 0) + (riskTolerance === 3 ? 0.04 : 0) + (emergencyMonthsCovered >= 6 ? 0.08 : 0), 0.55, 0.9)
  const recommendation = result.emergencyGapAmount > 0
    ? 'Top up safety first, then invest the rest'
    : result.annualWithdrawalRatio >= 0.04
      ? 'Use a stability-led multi-bucket allocation'
      : horizonYears >= 10 && riskTolerance >= 4
        ? 'Use a growth-capable diversified allocation'
        : 'Use a balanced multi-bucket allocation'

  const summaryText = [
    'Rafiqy Investment Allocation Planner Summary',
    `Investable amount: ${fmtCurrency(amount)}`,
    `Monthly contribution: ${fmtCurrency(monthlyContribution)}`,
    `Goal style: ${GOAL_PROFILES[goal].label}`,
    `Goal structure: ${goalMode === 'multi' ? 'Multiple goals / family portfolio' : 'Single primary goal'}`,
    goalMode === 'multi' ? `Goal split: Near-term ${result.goalShares.near}% (${fmtCurrency(result.goalBuckets.near)}), Medium-term ${result.goalShares.medium}% (${fmtCurrency(result.goalBuckets.medium)}), Long-term ${result.goalShares.long}% (${fmtCurrency(result.goalBuckets.long)})` : null,
    `Recommendation: ${recommendation}`,
    `Safety bucket: ${result.allocation.liquidity}% (${fmtCurrency(result.buckets.liquidity)})`,
    `Income bucket: ${result.allocation.income}% (${fmtCurrency(result.buckets.income)})`,
    `Balanced growth: ${result.allocation.balanced}% (${fmtCurrency(result.buckets.balanced)})`,
    `Equity growth: ${result.allocation.equity}% (${fmtCurrency(result.buckets.equity)})`,
    `Gold hedge: ${result.allocation.gold}% (${fmtCurrency(result.buckets.gold)})`,
    `FX hedge: ${result.allocation.usd}% (${fmtCurrency(result.buckets.usd)})`,
    `Decision path: ${result.decisionTitle}`,
    `Notes: ${result.actionSteps.join(' | ')}`,
  ].filter(Boolean).join('\n')

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  const downloadSummary = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rafiqy-investment-plan-summary.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout toolId="investment-allocation-planner">
      <DecisionHero
        accent={ACCENT}
        title="Investment Allocation Planner Pakistan"
        eyebrow="Decision system"
        description="Turn a lump sum like 20 lakh, 1 crore, 5 crore, or even 15 crore into a structured allocation plan. Decide how much should stay liquid, how much should go into stability, how much can go into long-term growth, and how much deserves gold or FX hedge treatment."
        colors={colors}
      />
      <FreshnessBanner
        colors={colors}
        accent={ACCENT}
        lastUpdated="May 2026"
        cadence="Monthly for category assumptions, quarterly for planning heuristics, event-driven for policy changes"
        refreshed="Pakistan mutual-fund category framing, risk-bucket logic, and Shariah-compliant mapping structure"
        estimated="This planner gives allocation guidance by bucket and category, not exact product advice or guaranteed returns"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Portfolio inputs" subtitle="This planner works best when the inputs reflect your real life, not your ideal mood." accent={ACCENT} colors={colors}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAmount(preset.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '999px',
                  border: `1px solid ${amount === preset.value ? ACCENT : colors.border}`,
                  background: amount === preset.value ? `${ACCENT}18` : colors.card,
                  color: amount === preset.value ? ACCENT : colors.textSecondary,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text, fontWeight: 700, marginBottom: '0.55rem', fontSize: '0.88rem' }}>Start from a real-life strategy</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.55rem' }}>
              {STRATEGY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '0.9rem',
                    border: `1px solid ${strategyPreset === preset.id ? ACCENT : colors.border}`,
                    background: strategyPreset === preset.id ? `${ACCENT}14` : colors.card,
                    color: colors.text,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', marginBottom: '0.2rem' }}>{preset.label}</div>
                  <div style={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.45 }}>{preset.note}</div>
                </button>
              ))}
            </div>
          </div>
          <FieldsGrid>
            <Field label="Investable amount (PKR)" hint="Use the actual lump sum available now, whether it is 20 lakh, 1 crore, 5 crore, or more.">
              <NumberInput colors={colors} value={amount} onChange={(e) => { markCustom(); setAmount(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Monthly contribution (PKR)" hint="Optional, but useful if you will keep adding money after the lump sum.">
              <NumberInput colors={colors} value={monthlyContribution} onChange={(e) => { markCustom(); setMonthlyContribution(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Monthly essential spend (PKR)" hint="Needed to judge whether your emergency reserve is already strong enough.">
              <NumberInput colors={colors} value={monthlyEssentialSpend} onChange={(e) => { markCustom(); setMonthlyEssentialSpend(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Primary goal style" hint="Start with the role of the money: safety, income, balance, or growth.">
              <SelectInput colors={colors} value={goal} onChange={(e) => { markCustom(); setGoal(e.target.value) }}>
                {Object.entries(GOAL_PROFILES).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Time horizon" hint="Longer horizons justify more patient growth risk. Shorter horizons usually should not.">
              <SliderInput colors={colors} accent={ACCENT} value={horizonYears} onChange={(e) => { markCustom(); setHorizonYears(Number(e.target.value)) }} min={1} max={20} suffix=" years" />
            </Field>
            <Field label="Risk tolerance" hint="1 means you hate volatility. 5 means you can tolerate deep market swings for longer-term upside.">
              <SliderInput colors={colors} accent={ACCENT} value={riskTolerance} onChange={(e) => { markCustom(); setRiskTolerance(Number(e.target.value)) }} min={1} max={5} />
            </Field>
            <Field label="Emergency reserve already covered" hint="If you do not already have a healthy emergency fund, the portfolio must respect that first.">
              <SliderInput colors={colors} accent={ACCENT} value={emergencyMonthsCovered} onChange={(e) => { markCustom(); setEmergencyMonthsCovered(Number(e.target.value)) }} min={0} max={12} suffix=" months" />
            </Field>
            <Field label="Expected monthly withdrawals from this corpus" hint="If you need monthly cash from the money, the plan should lean more defensive.">
              <NumberInput colors={colors} value={monthlyWithdrawalNeed} onChange={(e) => { markCustom(); setMonthlyWithdrawalNeed(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Next major goal / purchase" hint="Nearer goals usually justify less equity-style exposure.">
              <SliderInput colors={colors} accent={ACCENT} value={nextMajorGoalYears} onChange={(e) => { markCustom(); setNextMajorGoalYears(Number(e.target.value)) }} min={1} max={10} suffix=" years" />
            </Field>
            <Field label="Debt pressure" hint="High-cost debt and financial pressure usually justify more caution, not more aggression.">
              <SelectInput colors={colors} value={debtPressure} onChange={(e) => { markCustom(); setDebtPressure(e.target.value) }}>
                {Object.entries(DEBT_PRESSURE).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Income stability" hint="Unstable income means the portfolio should help absorb life pressure, not amplify it.">
              <SelectInput colors={colors} value={incomeStability} onChange={(e) => { markCustom(); setIncomeStability(e.target.value) }}>
                {Object.entries(STABILITY).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Goal structure" hint="A portfolio serving multiple family or business goals usually needs more internal safety than a single clean objective.">
              <SelectInput colors={colors} value={goalMode} onChange={(e) => { markCustom(); setGoalMode(e.target.value) }}>
                <option value="single">Single primary goal</option>
                <option value="multi">Multiple goals / family portfolio</option>
              </SelectInput>
            </Field>
            <Field label="Shariah preference" hint="This changes the category mapping, not just the wording.">
              <SelectInput colors={colors} value={shariahPreference} onChange={(e) => { markCustom(); setShariahPreference(e.target.value) }}>
                <option value="yes">Shariah-compliant only</option>
                <option value="no">Conventional allowed</option>
              </SelectInput>
            </Field>
            <Field label="USD hedge preference" hint="Useful mainly when you expect future foreign-currency needs or currency-stress concern.">
              <SelectInput colors={colors} value={fxPreference} onChange={(e) => { markCustom(); setFxPreference(e.target.value) }}>
                {Object.entries(FX_PREF).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Gold hedge preference" hint="Gold is a hedge bucket, not automatically the core of the whole portfolio.">
              <SelectInput colors={colors} value={goldPreference} onChange={(e) => { markCustom(); setGoldPreference(e.target.value) }}>
                {Object.entries(GOLD_PREF).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
          </FieldsGrid>
          {goalMode === 'multi' && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem', border: `1px solid ${colors.border}`, background: colors.card }}>
              <div style={{ color: colors.text, fontWeight: 800, marginBottom: '0.35rem' }}>Multi-goal split planner</div>
              <div style={{ color: colors.textSecondary, fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '0.9rem' }}>
                Split the corpus by job first. This does not replace the allocation engine. It tells the engine how much of the overall money is really serving near-term, medium-term, and long-horizon objectives.
              </div>
              <MetricGrid min={220}>
                <Field label={`Near-term goals (${fmtCurrency(round((goalShares.near / 100) * amount))})`} hint="House purchase reserve, tuition due soon, business cash need, or anything within roughly 1–3 years.">
                  <SliderInput colors={colors} accent={ACCENT} value={goalShares.near} onChange={(e) => { markCustom(); setGoalShares((prev) => ({ ...prev, near: Number(e.target.value) })) }} min={0} max={100} suffix="%" />
                </Field>
                <Field label={`Medium-term goals (${fmtCurrency(round((goalShares.medium / 100) * amount))})`} hint="Goals with a 3–7 year time frame where some growth is useful but deep drawdown risk must stay controlled.">
                  <SliderInput colors={colors} accent={ACCENT} value={goalShares.medium} onChange={(e) => { markCustom(); setGoalShares((prev) => ({ ...prev, medium: Number(e.target.value) })) }} min={0} max={100} suffix="%" />
                </Field>
                <Field label={`Long-term growth (${fmtCurrency(round((goalShares.long / 100) * amount))})`} hint="Capital with the strongest patience window. This is the part that can most honestly carry higher-growth risk.">
                  <SliderInput colors={colors} accent={ACCENT} value={goalShares.long} onChange={(e) => { markCustom(); setGoalShares((prev) => ({ ...prev, long: Number(e.target.value) })) }} min={0} max={100} suffix="%" />
                </Field>
              </MetricGrid>
              <div style={{ color: colors.textSecondary, fontSize: '0.76rem', marginTop: '0.5rem' }}>
                The planner normalizes these shares to 100% internally, so they work even if your raw sliders do not sum perfectly.
              </div>
            </div>
          )}
        </SectionCard>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.emergencyGapAmount > 0 ? '#f59e0b' : recommendation.includes('growth') ? '#22c55e' : ACCENT}
            title={recommendation}
            body={result.decisionBody}
            confidence={confidence}
            colors={colors}
          />
          <ActionCallout
            title="What you should do next"
            body={result.decisionTrack}
            accent={result.emergencyGapAmount > 0 ? '#f59e0b' : recommendation.includes('growth') ? '#22c55e' : ACCENT}
            colors={colors}
            actions={result.actionSteps.slice(0, 3)}
          />

          <MetricGrid>
            <MetricCard label="Deployable now" value={fmtCurrency(result.deployNow)} sub="Amount that can realistically work after respecting safety needs." accent="#22c55e" colors={colors} />
            <MetricCard label="Safety bucket" value={fmtCurrency(result.buckets.liquidity)} sub={`${result.allocation.liquidity}% in liquidity-style allocation`} accent="#06b6d4" colors={colors} />
            <MetricCard label="Growth bucket" value={fmtCurrency(result.growthBucketAmount)} sub={`${round(result.allocation.balanced + result.allocation.equity, 1)}% across balanced + equity`} accent={ACCENT} colors={colors} />
            <MetricCard label="Hedge bucket" value={fmtCurrency(result.hedgeBucketAmount)} sub={`${round(result.allocation.gold + result.allocation.usd, 1)}% across gold + FX hedge`} accent="#8b5cf6" colors={colors} />
            <MetricCard label="Annual additions" value={fmtCurrency(result.monthlyContributionAnnual)} sub="Useful when you will keep feeding the plan over time." accent="#f59e0b" colors={colors} />
            <MetricCard label="Reserve strength" value={`${fmtNumber(emergencyMonthsCovered, 0)} months`} sub={result.emergencyGapAmount > 0 ? `Still short by ${fmtCurrency(result.emergencyGapAmount)}` : 'Emergency baseline is already in stronger shape.'} accent={result.emergencyGapAmount > 0 ? '#ef4444' : '#22c55e'} colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision path" subtitle={result.decisionTrack} accent={ACCENT} colors={colors}>
            <div style={{ color: colors.text, fontSize: '1.02rem', fontWeight: 700 }}>{result.decisionTitle}</div>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.65 }}>{result.decisionBody}</p>
            <BulletList items={result.actionSteps} colors={colors} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={copySummary}
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${copyState === 'error' ? '#ef4444' : ACCENT}`,
                  background: copyState === 'copied' ? '#dcfce7' : `${ACCENT}12`,
                  color: copyState === 'error' ? '#ef4444' : ACCENT,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copyState === 'copied' ? 'Summary copied' : copyState === 'error' ? 'Copy failed' : 'Copy plan summary'}
              </button>
              <button
                type="button"
                onClick={downloadSummary}
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  background: colors.card,
                  color: colors.text,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download summary
              </button>
            </div>
          </SectionCard>

          <CollapsibleSection
            title="Why this split?"
            summary="Open this if you want the main reasons behind the recommended allocation."
            colors={colors}
          >
            <BulletList items={result.reasons} colors={colors} />
          </CollapsibleSection>

          <SectionCard title="Pressure-test the allocation" subtitle="These checks show what should change if your horizon, liquidity, or spending pressure changes." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <SectionCard title="Portfolio character" subtitle="A strong plan balances stability, growth, liquidity, and inflation defense instead of blindly maximizing one score." accent={ACCENT} colors={colors}>
            <ScoreBars
              scores={{
                Stability: result.scores.stability,
                Growth: result.scores.growth,
                Liquidity: result.scores.liquidity,
                'Inflation defense': result.scores.inflation,
              }}
              colors={colors}
            />
          </SectionCard>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
        <SectionCard
          title="Suggested allocation"
          subtitle={`This is a multi-bucket plan for ${fmtCurrency(amount)}. For most users, splitting across different roles is smarter than putting everything into one product or one story.`}
          accent={ACCENT}
          colors={colors}
        >
          <MetricGrid min={220}>
            {Object.entries(result.allocation).map(([key, pct]) => (
              <BucketCard
                key={key}
                bucketKey={key}
                pct={pct}
                amount={result.buckets[key]}
                shariahPreference={shariahPreference}
                colors={colors}
              />
            ))}
          </MetricGrid>
        </SectionCard>

        <SectionCard
          title="How to implement this in the real world"
          subtitle="Use categories and mandates first. Then shortlist actual products with proper due diligence."
          accent={ACCENT}
          colors={colors}
        >
          <BulletList
            items={[
              'Start with the role of each bucket: liquidity, income, balanced growth, equity growth, gold hedge, and FX hedge.',
              shariahPreference === 'yes'
                ? 'When you shortlist products, stay within Shariah-compliant money market, income, balanced, and equity categories.'
                : 'When you shortlist products, compare regulated categories like money market, income, balanced, asset allocation, and equity before picking exact products.',
              'For Pakistan mutual-fund implementation, use SECP-regulated structures and MUFAP category / risk-profile screens rather than chasing generic social-media return claims.',
              'If you have a near-term house purchase, tuition, or business need, ring-fence that capital before trying to maximize return.',
              'If your emergency fund is still weak, your first “investment” may simply be fixing the reserve structure.',
            ]}
            colors={colors}
          />
        </SectionCard>

        <CollapsibleSection
          title="Tax-aware implementation notes"
          summary="Open this before implementation if taxes, filer status, or product structure may change your practical net outcome."
          colors={colors}
        >
          <BulletList
            items={[
              'Different products can carry different tax treatment on dividends, gains, holding structures, and filing status, so do not compare two buckets on return alone.',
              'For income-focused users, post-tax cashflow matters more than headline yield. A high displayed payout is not automatically superior after tax and fee drag.',
              'For larger corpuses, documentation quality, filer status, and account structure can materially affect the practical net outcome.',
              'Re-check product-level tax treatment whenever policy changes, filing status changes, or you move from one category into another.',
              'Use this planner to decide the role of the money first. Then validate current tax treatment on the actual shortlisted product before you allocate capital.',
            ]}
            colors={colors}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Pakistan category mapping"
          summary="This is the bridge from allocation logic to the regulated buckets you would shortlist next."
          colors={colors}
          defaultOpen
        >
          <MetricGrid min={240}>
            {Object.entries(result.allocation)
              .filter(([, pct]) => pct > 0)
              .map(([key, pct]) => (
                <div
                  key={key}
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.95rem',
                    padding: '0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ color: colors.text, fontWeight: 800 }}>{BUCKET_COPY[key].title}</div>
                    <div style={{ color: ACCENT, fontWeight: 800 }}>{pct}%</div>
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.55 }}>{BUCKET_COPY[key].role}</div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.78rem', lineHeight: 1.55 }}>
                    <strong style={{ color: colors.text }}>Shortlist style:</strong>{' '}
                    {shariahPreference === 'yes' ? BUCKET_COPY[key].examples.shariah : BUCKET_COPY[key].examples.conventional}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.76rem', lineHeight: 1.55 }}>
                    <strong style={{ color: colors.text }}>What to compare:</strong>{' '}
                    category mandate, risk profile, fee drag, liquidity rules, concentration policy, and whether it actually fits this bucket’s job.
                  </div>
                </div>
              ))}
          </MetricGrid>
        </CollapsibleSection>

        <CollapsibleSection
          title="Current Pakistan category reference"
          summary="Open this when you want the category landscape behind the mapping, before comparing actual funds."
          colors={colors}
        >
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(shariahPreference === 'yes' ? CATEGORY_REFERENCE.shariah : CATEGORY_REFERENCE.conventional).map((row) => (
              <div key={row.category} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.7fr 1.4fr', gap: '0.75rem', padding: '0.85rem 0.95rem', borderRadius: '0.9rem', border: `1px solid ${colors.border}`, background: colors.card }}>
                <div>
                  <div style={{ color: colors.text, fontWeight: 800, marginBottom: '0.15rem' }}>{row.category}</div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.78rem' }}>{row.role}</div>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                  <strong style={{ color: colors.text }}>Role:</strong> {row.role}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                  <strong style={{ color: colors.text }}>Risk:</strong> {row.risk}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong style={{ color: colors.text }}>Best fit:</strong> {row.fit}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <SectionCard
          title="Where this planner is especially useful"
          subtitle="The same decision engine works for smaller and larger portfolios because the job of the money matters more than the headline amount."
          accent={ACCENT}
          colors={colors}
        >
          <BulletList
            items={[
              'A first serious lump sum like 20 lakh or 50 lakh where the biggest risk is putting everything into one story.',
              'A 1–5 crore family corpus where emergency structure, growth, and medium-term goals need to coexist.',
              'A 5–15 crore portfolio where concentration risk, liquidity planning, and bucket discipline become even more important.',
              'Business owners parking surplus cash that may later be needed for operations, property, or expansion.',
              'Households that want Shariah-compliant implementation guidance without pretending one product solves every need.',
            ]}
            colors={colors}
          />
        </SectionCard>

        <CollapsibleSection
          title="Shortlisting checklist"
          summary="Use this when you start comparing actual products so you do not get distracted by headline returns."
          colors={colors}
          defaultOpen
        >
          <BulletList
            items={[
              'Check whether the product mandate truly matches the job of the bucket you are filling.',
              'Compare fee drag and expense ratio before comparing recent return numbers.',
              'Check liquidity terms and exit friction if the bucket is meant to protect flexibility.',
              'Watch concentration risk: one manager, one issuer, or one story should not dominate the whole corpus.',
              'For larger corpuses, separate family spending reserve, strategic growth capital, and optional hedge buckets explicitly instead of blending them emotionally.',
              'Revisit tax treatment, documentation, and Shariah screening before final implementation.',
            ]}
            colors={colors}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Rebalancing guidance"
          summary="A good allocation needs calm maintenance rules. Open this when you want the upkeep framework."
          colors={colors}
        >
          <BulletList
            items={[
              'Review the allocation at least every 6 to 12 months even if markets are calm.',
              'Rebalance sooner if one bucket drifts materially away from its intended role or if the corpus changes sharply after a large contribution or withdrawal.',
              'Re-check the structure after life changes: house purchase plan, education commitment, business stress, retirement timeline shift, or family obligation jump.',
              'Do not rebalance based only on headlines or market excitement. Rebalance when the role of the money or the weight of the buckets changes.',
              'For multi-goal portfolios, review both layers: the goal split itself and the allocation inside the overall plan.',
            ]}
            colors={colors}
          />
        </CollapsibleSection>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DisclaimerBlock
          type="financial"
          overrideBodyEn="This planner provides allocation guidance by risk bucket and category only. It does not recommend exact products, securities, or guaranteed returns. Verify current product risk, fees, tax treatment, and suitability with a licensed adviser before investing."
        />
      </div>
    </ToolLayout>
  )
}
