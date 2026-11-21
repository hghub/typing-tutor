import {
  fmtCurrency,
  fmtPercent,
  calcEMI,
  remainingLoanBalance,
  futureValue,
  growingSeriesPayment,
  costScoresFromTotals,
  weightedScore,
  confidenceFromGap,
  topTwoByLowest,
} from './decision.js'

export const CITY_PRESETS = {
  karachi: { label: 'Karachi', annualHomeGrowth: 12, annualRentGrowth: 11, propertyTaxPct: 0.2, transferCostPct: 7, maintenancePct: 1.1, markupRate: 18 },
  lahore: { label: 'Lahore', annualHomeGrowth: 11, annualRentGrowth: 10, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.5 },
  islamabad: { label: 'Islamabad', annualHomeGrowth: 10, annualRentGrowth: 9, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.25 },
  rawalpindi: { label: 'Rawalpindi', annualHomeGrowth: 10, annualRentGrowth: 9, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.25 },
  other: { label: 'Other city', annualHomeGrowth: 9, annualRentGrowth: 8, propertyTaxPct: 0.15, transferCostPct: 6, maintenancePct: 0.9, markupRate: 17 },
}

export const SCENARIO_PRESETS = [
  { id: 'young-professional', label: 'Young professional', note: 'Short stay, flexibility matters', city: 'karachi', propertyPrice: 25000000, monthlyRent: 90000, yearsToStay: 4, downPaymentPct: 20, mortgageYears: 15, investmentReturnPct: 14 },
  { id: 'family-settle', label: 'Family settle-down', note: 'Longer stay, ownership case stronger', city: 'lahore', propertyPrice: 42000000, monthlyRent: 140000, yearsToStay: 9, downPaymentPct: 30, mortgageYears: 15, investmentReturnPct: 13 },
  { id: 'wait-and-save', label: 'Wait and save', note: 'Higher-financing-cost example', city: 'islamabad', propertyPrice: 50000000, monthlyRent: 170000, yearsToStay: 5, downPaymentPct: 20, mortgageYears: 15, investmentReturnPct: 15 },
]

export function rentVsBuyDecision(inputs) {
  const cityPreset = CITY_PRESETS[inputs.city]
  const propertyPrice = Number(inputs.propertyPrice) || 0
  const monthlyRent = Number(inputs.monthlyRent) || 0
  const yearsToStay = Number(inputs.yearsToStay) || 0
  const downPaymentPct = Number(inputs.downPaymentPct) || 0
  const annualMarkupRate = Number(inputs.annualMarkupRate) || 0
  const mortgageYears = Number(inputs.mortgageYears) || 0
  const annualRentGrowth = Number(inputs.annualRentGrowth) || 0
  const annualHomeGrowth = Number(inputs.annualHomeGrowth) || 0
  const annualMaintenancePct = Number(inputs.annualMaintenancePct) || 0
  const propertyTaxPct = Number(inputs.propertyTaxPct) || 0
  const transferCostPct = Number(inputs.transferCostPct) || 0
  const investmentReturnPct = Number(inputs.investmentReturnPct) || 0

  const downPayment = propertyPrice * (downPaymentPct / 100)
  const financedAmount = Math.max(0, propertyPrice - downPayment)
  const emi = calcEMI(financedAmount, annualMarkupRate, mortgageYears)
  const monthsInView = Math.max(12, Math.round(yearsToStay * 12))
  const paymentMonths = Math.min(monthsInView, Math.round(mortgageYears * 12))
  const totalEmiPaid = emi * paymentMonths
  const remainingBalance = remainingLoanBalance(financedAmount, annualMarkupRate, mortgageYears, monthsInView)
  const appreciatedValue = propertyPrice * (1 + annualHomeGrowth / 100) ** yearsToStay
  const sellingCost = appreciatedValue * (transferCostPct / 100)
  const ownerMaintenance = propertyPrice * (annualMaintenancePct / 100) * yearsToStay
  const ownerTax = propertyPrice * (propertyTaxPct / 100) * yearsToStay
  const ownerCashOut = downPayment + totalEmiPaid + ownerMaintenance + ownerTax + propertyPrice * (transferCostPct / 100)
  const saleProceeds = appreciatedValue - sellingCost - remainingBalance
  const buyNetCost = ownerCashOut - saleProceeds
  const ownerNetWorth = saleProceeds

  const rentingCashOut = growingSeriesPayment(monthlyRent, annualRentGrowth, yearsToStay)
  const investmentPrincipal = downPayment + propertyPrice * (transferCostPct / 100)
  // Simplification: invest a fixed, nonnegative first-year monthly cost gap.
  const monthlySavingsVsBuy = Math.max(0, emi + propertyPrice * (annualMaintenancePct + propertyTaxPct) / 100 / 12 - monthlyRent)
  const rentInvestedValue = futureValue(investmentPrincipal, investmentReturnPct, yearsToStay, monthlySavingsVsBuy)
  const rentNetCost = rentingCashOut - rentInvestedValue
  const renterNetWorth = rentInvestedValue

  const totals = { buy: buyNetCost, rent: rentNetCost }
  const [best, second] = topTwoByLowest(totals)
  const costScores = costScoresFromTotals(totals)
  const scores = {
    buy: {
      cost: costScores.buy,
      flexibility: yearsToStay >= 7 ? 74 : yearsToStay >= 5 ? 63 : 45,
      resilience: cityPreset.annualHomeGrowth >= annualRentGrowth ? 76 : 61,
    },
    rent: {
      cost: costScores.rent,
      flexibility: yearsToStay <= 5 ? 88 : yearsToStay <= 7 ? 74 : 56,
      resilience: investmentReturnPct >= annualHomeGrowth ? 72 : 60,
    },
  }
  const finalScores = {
    buy: weightedScore(scores.buy, { cost: 0.6, flexibility: 0.2, resilience: 0.2 }),
    rent: weightedScore(scores.rent, { cost: 0.6, flexibility: 0.2, resilience: 0.2 }),
  }

  const recommendation = finalScores.buy >= finalScores.rent ? 'Buy' : 'Rent'
  const confidence = confidenceFromGap(best[1], second[1])
  // No validated crossover search is implemented; do not display a heuristic as break-even.
  const breakEvenYears = null

  const betterMarkupRate = Math.max(8, annualMarkupRate - 2)
  const betterMarkupEmi = calcEMI(financedAmount, betterMarkupRate, mortgageYears)
  const betterMarkupOwnerCashOut = downPayment + betterMarkupEmi * paymentMonths + ownerMaintenance + ownerTax + propertyPrice * (transferCostPct / 100)
  const betterMarkupBalance = remainingLoanBalance(financedAmount, betterMarkupRate, mortgageYears, monthsInView)
  const betterMarkupBuyNetCost = betterMarkupOwnerCashOut - (appreciatedValue - sellingCost - betterMarkupBalance)

  const lowerGrowthAppreciated = propertyPrice * (1 + Math.max(0, annualHomeGrowth - 3) / 100) ** yearsToStay
  const lowerGrowthSaleProceeds = lowerGrowthAppreciated - (lowerGrowthAppreciated * (transferCostPct / 100)) - remainingBalance
  const lowerGrowthBuyNetCost = ownerCashOut - lowerGrowthSaleProceeds

  const shortStayYears = Math.max(2, yearsToStay - 2)
  const shortStayMonths = Math.max(12, Math.round(shortStayYears * 12))
  const shortStayEmiPaid = emi * Math.min(shortStayMonths, Math.round(mortgageYears * 12))
  const shortStayBalance = remainingLoanBalance(financedAmount, annualMarkupRate, mortgageYears, shortStayMonths)
  const shortStayValue = propertyPrice * (1 + annualHomeGrowth / 100) ** shortStayYears
  const shortStaySaleProceeds = shortStayValue - shortStayValue * (transferCostPct / 100) - shortStayBalance
  const shortStayBuyNetCost = downPayment + shortStayEmiPaid + propertyPrice * (annualMaintenancePct / 100) * shortStayYears + propertyPrice * (propertyTaxPct / 100) * shortStayYears + propertyPrice * (transferCostPct / 100) - shortStaySaleProceeds
  const shortStayRentNetCost = growingSeriesPayment(monthlyRent, annualRentGrowth, shortStayYears) - futureValue(investmentPrincipal, investmentReturnPct, shortStayYears, monthlySavingsVsBuy)

  let decisionTitle = 'Compare both paths carefully'
  let decisionBody = 'The current assumptions are close enough that your stay horizon, markup, and opportunity cost of capital matter more than one headline number.'
  let decisionTrack = 'Before committing, check how easily the decision flips when financing or appreciation assumptions move.'
  const actionSteps = []

  if (recommendation === 'Buy' && confidence >= 0.75) {
    decisionTitle = 'Buying looks defendable if you stay the course'
    decisionBody = 'Your current assumptions support ownership, but the buy case depends on holding long enough to absorb transfer friction and markup.'
    decisionTrack = 'The key risk is not monthly affordability alone. It is whether you actually remain in the property long enough.'
    actionSteps.push('Stress-test the deal against a lower appreciation assumption before finalizing.')
    actionSteps.push('Preserve emergency liquidity even after the down payment.')
    actionSteps.push('Use this result to challenge broker or bank optimism, not to skip due diligence.')
  } else if (recommendation === 'Buy') {
    decisionTitle = 'Buying can work, but only with disciplined assumptions'
    decisionBody = 'The buy case is present, but it is not wide enough to ignore financing pressure or the risk of moving earlier than planned.'
    decisionTrack = 'A slightly better markup or a longer horizon may be what makes ownership clearly stronger.'
    actionSteps.push('Try negotiating markup or increasing down payment before signing.')
    actionSteps.push('If you may move in under five years, renting may still be safer.')
    actionSteps.push('Do not treat emotional comfort as proof that the numbers are strong enough.')
  } else if (yearsToStay <= 5) {
    decisionTitle = 'Renting is likely the smarter near-term move'
    decisionBody = 'Your stay horizon is short enough that transaction friction, down-payment lockup, and resale uncertainty weaken the ownership case.'
    decisionTrack = 'This is especially true if your job, city, or family needs may still change.'
    actionSteps.push('Keep capital liquid while your location and timeline remain uncertain.')
    actionSteps.push('Re-run the scenario if your expected stay horizon extends materially.')
    actionSteps.push('Use the monthly savings and down payment gap as an investing discipline, not as idle cash.')
  } else {
    decisionTitle = 'Rent now or renegotiate the buy case'
    decisionBody = 'Under the current assumptions, renting preserves optionality and capital more effectively than buying.'
    decisionTrack = 'The decision may improve if markup falls, down payment rises, or the property candidate itself becomes more attractive.'
    actionSteps.push('Test the same property with a stronger financing offer before deciding it is unaffordable.')
    actionSteps.push('Separate the desire to own from the quality of this specific property decision.')
    actionSteps.push('Watch whether appreciation assumptions are doing too much work in the buy case.')
  }

  const sensitivity = [
    {
      label: `If markup drops to ${betterMarkupRate}%`,
      impact: fmtCurrency(betterMarkupBuyNetCost),
      detail: `Buy-side net cost changes by ${fmtCurrency(buyNetCost - betterMarkupBuyNetCost)} under a modestly better financing case.`,
      tone: betterMarkupBuyNetCost < buyNetCost ? '#86efac' : '#fbbf24',
    },
    {
      label: `If appreciation is 3 points lower`,
      impact: fmtCurrency(lowerGrowthBuyNetCost),
      detail: `This shows how much of the buy case depends on property-growth optimism in ${cityPreset.label}.`,
      tone: lowerGrowthBuyNetCost > buyNetCost ? '#fbbf24' : '#86efac',
    },
    {
      label: `If you move in ${shortStayYears} years instead`,
      impact: recommendation === 'Buy'
        ? `Buy ${fmtCurrency(shortStayBuyNetCost)} vs Rent ${fmtCurrency(shortStayRentNetCost)}`
        : `Rent ${fmtCurrency(shortStayRentNetCost)} vs Buy ${fmtCurrency(shortStayBuyNetCost)}`,
      detail: 'Stay horizon is usually the fastest way to flip a property decision.',
      tone: shortStayBuyNetCost < shortStayRentNetCost ? '#86efac' : '#fbbf24',
    },
  ]

  const reasons = []
  if (recommendation === 'Buy') {
    reasons.push(`Projected owner net worth after ${yearsToStay} years is ${fmtCurrency(ownerNetWorth)} versus ${fmtCurrency(renterNetWorth)} if you rent and invest the difference.`)
    reasons.push(`Illustrative property appreciation is ${fmtPercent(annualHomeGrowth / 100)} per year in ${cityPreset.label}, compared with the rent-growth assumption of ${fmtPercent(annualRentGrowth / 100)}.`)
  } else {
    reasons.push(`Renting keeps your upfront capital free. Investing the down payment, avoided buying costs and a fixed first-year monthly gap grows to about ${fmtCurrency(rentInvestedValue)} over ${yearsToStay} years.`)
    reasons.push(`Your planned stay is ${yearsToStay} years, which may be too short to absorb transfer costs, maintenance, and markup efficiently.`)
  }
  reasons.push(`Monthly mortgage estimate is ${fmtCurrency(emi)}. Initial down payment requirement is ${fmtCurrency(downPayment)}.`)
  if (breakEvenYears) reasons.push(`A rough break-even horizon under these assumptions is about ${breakEvenYears} years.`)

  return {
    cityLabel: cityPreset.label,
    downPayment,
    emi,
    totalEmiPaid,
    remainingBalance,
    appreciatedValue,
    buyNetCost,
    rentNetCost,
    ownerNetWorth,
    renterNetWorth,
    rentingCashOut,
    rentInvestedValue,
    monthlySavingsVsBuy,
    recommendation,
    confidence,
    finalScores,
    reasons,
    breakEvenYears,
    decisionTitle,
    decisionBody,
    decisionTrack,
    actionSteps,
    sensitivity,
  }
}

