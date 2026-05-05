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
  BulletList,
  ScoreBars,
} from '../components/decision/DecisionBlocks'
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  calcEMI,
  remainingLoanBalance,
  futureValue,
  growingSeriesPayment,
  costScoresFromTotals,
  weightedScore,
  confidenceFromGap,
  topTwoByLowest,
  round,
} from '../lib/decision'

const ACCENT = '#14b8a6'

const CITY_PRESETS = {
  karachi: { label: 'Karachi', annualHomeGrowth: 12, annualRentGrowth: 11, propertyTaxPct: 0.2, transferCostPct: 7, maintenancePct: 1.1, markupRate: 18 },
  lahore: { label: 'Lahore', annualHomeGrowth: 11, annualRentGrowth: 10, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.5 },
  islamabad: { label: 'Islamabad', annualHomeGrowth: 10, annualRentGrowth: 9, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.25 },
  rawalpindi: { label: 'Rawalpindi', annualHomeGrowth: 10, annualRentGrowth: 9, propertyTaxPct: 0.18, transferCostPct: 6.5, maintenancePct: 1.0, markupRate: 17.25 },
  other: { label: 'Other city', annualHomeGrowth: 9, annualRentGrowth: 8, propertyTaxPct: 0.15, transferCostPct: 6, maintenancePct: 0.9, markupRate: 17 },
}

function rentVsBuyDecision(inputs) {
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
  const totalEmiPaid = emi * monthsInView
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
  const monthlySavingsVsBuy = Math.max(0, emi + ownerMaintenance / 12 + ownerTax / 12 - monthlyRent)
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
  const breakEvenYears = annualHomeGrowth > annualRentGrowth
    ? round((transferCostPct + downPaymentPct / 2) / Math.max(1, annualHomeGrowth - annualRentGrowth), 1)
    : null

  const betterMarkupRate = Math.max(8, annualMarkupRate - 2)
  const betterMarkupEmi = calcEMI(financedAmount, betterMarkupRate, mortgageYears)
  const betterMarkupOwnerCashOut = downPayment + betterMarkupEmi * monthsInView + ownerMaintenance + ownerTax + propertyPrice * (transferCostPct / 100)
  const betterMarkupBuyNetCost = betterMarkupOwnerCashOut - saleProceeds

  const lowerGrowthAppreciated = propertyPrice * (1 + Math.max(0, annualHomeGrowth - 3) / 100) ** yearsToStay
  const lowerGrowthSaleProceeds = lowerGrowthAppreciated - (lowerGrowthAppreciated * (transferCostPct / 100)) - remainingBalance
  const lowerGrowthBuyNetCost = ownerCashOut - lowerGrowthSaleProceeds

  const shortStayYears = Math.max(2, yearsToStay - 2)
  const shortStayMonths = Math.max(12, Math.round(shortStayYears * 12))
  const shortStayEmiPaid = emi * shortStayMonths
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
    reasons.push(`Property appreciation baseline is ${fmtPercent(annualHomeGrowth / 100)} per year in ${cityPreset.label}, which outpaces the rent-growth baseline of ${fmtPercent(annualRentGrowth / 100)}.`)
  } else {
    reasons.push(`Renting keeps your upfront capital free. Investing the down payment and avoided buying costs grows to about ${fmtCurrency(rentInvestedValue)} over ${yearsToStay} years.`)
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

export default function RentVsBuyPakistan() {
  const { colors } = useTheme()
  const [city, setCity] = useState('karachi')
  const [propertyPrice, setPropertyPrice] = useState(35000000)
  const [monthlyRent, setMonthlyRent] = useState(120000)
  const [yearsToStay, setYearsToStay] = useState(7)
  const [downPaymentPct, setDownPaymentPct] = useState(25)
  const [annualMarkupRate, setAnnualMarkupRate] = useState(CITY_PRESETS.karachi.markupRate)
  const [mortgageYears, setMortgageYears] = useState(15)
  const [annualRentGrowth, setAnnualRentGrowth] = useState(CITY_PRESETS.karachi.annualRentGrowth)
  const [annualHomeGrowth, setAnnualHomeGrowth] = useState(CITY_PRESETS.karachi.annualHomeGrowth)
  const [annualMaintenancePct, setAnnualMaintenancePct] = useState(CITY_PRESETS.karachi.maintenancePct)
  const [propertyTaxPct, setPropertyTaxPct] = useState(CITY_PRESETS.karachi.propertyTaxPct)
  const [transferCostPct, setTransferCostPct] = useState(CITY_PRESETS.karachi.transferCostPct)
  const [investmentReturnPct, setInvestmentReturnPct] = useState(14)

  function applyCity(nextCity) {
    const preset = CITY_PRESETS[nextCity]
    setCity(nextCity)
    setAnnualMarkupRate(preset.markupRate)
    setAnnualRentGrowth(preset.annualRentGrowth)
    setAnnualHomeGrowth(preset.annualHomeGrowth)
    setAnnualMaintenancePct(preset.maintenancePct)
    setPropertyTaxPct(preset.propertyTaxPct)
    setTransferCostPct(preset.transferCostPct)
  }

  const result = useMemo(() => rentVsBuyDecision({
    city,
    propertyPrice,
    monthlyRent,
    yearsToStay,
    downPaymentPct,
    annualMarkupRate,
    mortgageYears,
    annualRentGrowth,
    annualHomeGrowth,
    annualMaintenancePct,
    propertyTaxPct,
    transferCostPct,
    investmentReturnPct,
  }), [
    city, propertyPrice, monthlyRent, yearsToStay, downPaymentPct, annualMarkupRate,
    mortgageYears, annualRentGrowth, annualHomeGrowth, annualMaintenancePct,
    propertyTaxPct, transferCostPct, investmentReturnPct,
  ])

  return (
    <ToolLayout toolId="rent-vs-buy-pakistan">
      <DecisionHero
        accent={ACCENT}
        title="Rent vs Buy Pakistan Analyzer"
        eyebrow="Decision system"
        description="Compare renting and buying with Pakistan-style assumptions: down payment, markup, transfer costs, rent growth, property appreciation, maintenance, and the opportunity cost of your capital."
        colors={colors}
      />
      <FreshnessBanner
        colors={colors}
        accent={ACCENT}
        lastUpdated="May 2026"
        cadence="Monthly for markup assumptions, quarterly for city baselines"
        refreshed="City presets, markup defaults, maintenance and transfer-friction assumptions"
        estimated="Property appreciation and rent-growth assumptions still vary by micro-market and area"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Scenario inputs" subtitle="Start with a city preset, then adjust assumptions to match your actual situation." accent={ACCENT} colors={colors}>
          <FieldsGrid>
            <Field label="City preset" hint="Loads default growth, markup, and friction assumptions. Override them if your area behaves differently.">
              <SelectInput colors={colors} value={city} onChange={(e) => applyCity(e.target.value)}>
                {Object.entries(CITY_PRESETS).map(([value, preset]) => <option key={value} value={value}>{preset.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Property price (PKR)" hint="Use the actual all-in purchase price you would negotiate, not an aspirational listing.">
              <NumberInput colors={colors} value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly rent (PKR)" hint="Use the rent for a genuinely comparable home, not a smaller or older alternative.">
              <NumberInput colors={colors} value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Stay horizon" hint="This is the biggest swing factor. If you may move early, do not overstate it.">
              <SliderInput colors={colors} accent={ACCENT} value={yearsToStay} onChange={(e) => setYearsToStay(Number(e.target.value))} min={2} max={15} suffix=" years" />
            </Field>
            <Field label="Down payment" hint="Keep emergency liquidity separate. A strong buy case can still be dangerous if cash is fully locked up.">
              <SliderInput colors={colors} accent={ACCENT} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} min={10} max={50} suffix="%" />
            </Field>
            <Field label="Mortgage markup" hint="Use an actual bank range when possible. A 1–2% change can materially alter the answer.">
              <SliderInput colors={colors} accent={ACCENT} value={annualMarkupRate} onChange={(e) => setAnnualMarkupRate(Number(e.target.value))} min={10} max={24} step={0.25} suffix="%" />
            </Field>
            <Field label="Mortgage tenure" hint="Longer tenure lowers EMI but usually increases total financing cost.">
              <SliderInput colors={colors} accent={ACCENT} value={mortgageYears} onChange={(e) => setMortgageYears(Number(e.target.value))} min={5} max={25} suffix=" years" />
            </Field>
            <Field label="Alternative investment return" hint="This represents what your down payment and transaction cash could earn elsewhere. Stay realistic.">
              <SliderInput colors={colors} accent={ACCENT} value={investmentReturnPct} onChange={(e) => setInvestmentReturnPct(Number(e.target.value))} min={6} max={22} step={0.5} suffix="%" />
            </Field>
          </FieldsGrid>

          <SectionCard title="Market assumptions" accent={ACCENT} colors={colors}>
            <FieldsGrid>
              <Field label="Annual rent growth" hint="Use a market average, not one unusually aggressive landlord increase.">
                <SliderInput colors={colors} accent={ACCENT} value={annualRentGrowth} onChange={(e) => setAnnualRentGrowth(Number(e.target.value))} min={3} max={18} step={0.5} suffix="%" />
              </Field>
              <Field label="Annual home price growth" hint="This is the easiest assumption to overestimate. Test a lower case too.">
                <SliderInput colors={colors} accent={ACCENT} value={annualHomeGrowth} onChange={(e) => setAnnualHomeGrowth(Number(e.target.value))} min={3} max={18} step={0.5} suffix="%" />
              </Field>
              <Field label="Maintenance cost" hint="Apartments and older houses usually need more than people budget initially.">
                <SliderInput colors={colors} accent={ACCENT} value={annualMaintenancePct} onChange={(e) => setAnnualMaintenancePct(Number(e.target.value))} min={0.3} max={2.5} step={0.1} suffix="%" />
              </Field>
              <Field label="Property tax / holding cost" hint="Include recurring ownership friction, not only formal tax.">
                <SliderInput colors={colors} accent={ACCENT} value={propertyTaxPct} onChange={(e) => setPropertyTaxPct(Number(e.target.value))} min={0} max={1} step={0.05} suffix="%" />
              </Field>
              <Field label="Transfer + selling friction" hint="Registry, agent cuts, legal work, and resale friction should all live here.">
                <SliderInput colors={colors} accent={ACCENT} value={transferCostPct} onChange={(e) => setTransferCostPct(Number(e.target.value))} min={3} max={10} step={0.25} suffix="%" />
              </Field>
            </FieldsGrid>
          </SectionCard>
        </SectionCard>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.recommendation === 'Buy' ? '#22c55e' : '#06b6d4'}
            title={`${result.recommendation} looks stronger under the current assumptions`}
            body={result.reasons[0]}
            confidence={result.confidence}
            colors={colors}
          />
          <MetricGrid>
            <MetricCard label="Buy net cost" value={fmtCurrency(result.buyNetCost)} sub={`Owner net worth: ${fmtCurrency(result.ownerNetWorth)}`} accent="#22c55e" colors={colors} />
            <MetricCard label="Rent net cost" value={fmtCurrency(result.rentNetCost)} sub={`Invested reserve: ${fmtCurrency(result.rentInvestedValue)}`} accent="#06b6d4" colors={colors} />
            <MetricCard label="Monthly EMI" value={fmtCurrency(result.emi)} sub={`Down payment: ${fmtCurrency(result.downPayment)}`} accent={ACCENT} colors={colors} />
            <MetricCard label="Break-even horizon" value={result.breakEvenYears ? `${result.breakEvenYears} yrs` : 'Watch assumptions'} sub="Longer stays usually improve the buy case." accent="#8b5cf6" colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision path" subtitle={result.decisionTrack} accent={ACCENT} colors={colors}>
            <div style={{ color: colors.text, fontSize: '1.02rem', fontWeight: 700 }}>{result.decisionTitle}</div>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.65 }}>{result.decisionBody}</p>
            <BulletList items={result.actionSteps} colors={colors} />
          </SectionCard>

          <SectionCard title="Why the recommendation changed" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
          </SectionCard>

          <SectionCard title="What flips the answer?" subtitle="These sensitivity checks show how fragile or durable the decision is." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <SectionCard title="Decision scores" subtitle="Cost dominates the score. Flexibility and resilience adjust the final ranking." accent={ACCENT} colors={colors}>
            <ScoreBars scores={{ 'Buy score': result.finalScores.buy, 'Rent score': result.finalScores.rent }} colors={colors} />
          </SectionCard>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DisclaimerBlock
          type="professional"
          overrideBodyEn="This analyzer uses planning assumptions for markup, appreciation, rent growth, taxes, and selling friction. It helps compare scenarios, not guarantee property returns or lending outcomes."
        />
      </div>
    </ToolLayout>
  )
}
