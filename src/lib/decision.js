export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function round(value, decimals = 0) {
  const factor = 10 ** decimals
  return Math.round((Number(value) || 0) * factor) / factor
}

export function fmtCurrency(value, currency = 'PKR', maximumFractionDigits = 0) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount)
}

export function fmtNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('en-PK', { maximumFractionDigits }).format(Number(value) || 0)
}

export function fmtPercent(value, maximumFractionDigits = 1) {
  return `${round((Number(value) || 0) * 100, maximumFractionDigits)}%`
}

export function monthlyRate(annualRatePct) {
  return (Number(annualRatePct) || 0) / 100 / 12
}

export function annualToMonthly(value) {
  return (Number(value) || 0) / 12
}

export function calcEMI(principal, annualRatePct, years) {
  const p = Number(principal) || 0
  const n = Math.max(1, Math.round((Number(years) || 0) * 12))
  const r = monthlyRate(annualRatePct)
  if (p <= 0) return 0
  if (r === 0) return p / n
  return (p * r * (1 + r) ** n) / ((1 + r) ** n - 1)
}

export function remainingLoanBalance(principal, annualRatePct, years, monthsPaid) {
  const p = Number(principal) || 0
  const n = Math.max(1, Math.round((Number(years) || 0) * 12))
  const m = clamp(Math.round(Number(monthsPaid) || 0), 0, n)
  const r = monthlyRate(annualRatePct)
  if (p <= 0) return 0
  if (r === 0) return Math.max(0, p - (p / n) * m)
  const emi = calcEMI(p, annualRatePct, years)
  return p * (1 + r) ** m - emi * (((1 + r) ** m - 1) / r)
}

export function futureValue(principal, annualReturnPct, years, monthlyContribution = 0) {
  const p = Number(principal) || 0
  const contribution = Number(monthlyContribution) || 0
  const n = Math.max(1, Math.round((Number(years) || 0) * 12))
  const r = monthlyRate(annualReturnPct)
  if (r === 0) return p + contribution * n
  const principalGrowth = p * (1 + r) ** n
  const contributionGrowth = contribution * (((1 + r) ** n - 1) / r)
  return principalGrowth + contributionGrowth
}

export function growingSeriesPayment(startMonthly, annualGrowthPct, years) {
  const start = Number(startMonthly) || 0
  const growth = (Number(annualGrowthPct) || 0) / 100
  const yearCount = Math.max(1, Math.round(Number(years) || 0))
  let total = 0
  for (let year = 0; year < yearCount; year += 1) {
    total += start * 12 * (1 + growth) ** year
  }
  return total
}

export function costScoresFromTotals(items) {
  const pairs = Object.entries(items)
  const values = pairs.map(([, value]) => Number(value) || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) {
    return Object.fromEntries(pairs.map(([key]) => [key, 80]))
  }
  return Object.fromEntries(
    pairs.map(([key, value]) => {
      const normalized = 100 - (((Number(value) || 0) - min) / (max - min)) * 100
      return [key, round(normalized, 1)]
    }),
  )
}

export function weightedScore(parts, weights) {
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1
  const total = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + ((Number(parts[key]) || 0) * weight)
  }, 0)
  return round(total / totalWeight, 1)
}

export function confidenceFromGap(bestValue, nextValue) {
  const best = Number(bestValue) || 0
  const next = Number(nextValue) || 0
  if (best <= 0 || next <= 0) return 0.5
  const gap = Math.abs(next - best) / next
  return round(clamp(0.45 + gap * 1.8, 0.5, 0.95), 2)
}

export function topTwoByLowest(items) {
  return Object.entries(items)
    .sort((a, b) => (a[1] || 0) - (b[1] || 0))
    .slice(0, 2)
}
