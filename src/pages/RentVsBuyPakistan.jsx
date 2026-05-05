import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
import FreshnessBanner from '../components/decision/FreshnessBanner'
import PakistanFriendlyGuide from '../components/PakistanFriendlyGuide'
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
  ComparisonBars,
  CollapsibleSection,
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

const SCENARIO_PRESETS = [
  { id: 'young-professional', label: 'Young professional', note: 'Short stay, flexibility matters', city: 'karachi', propertyPrice: 25000000, monthlyRent: 90000, yearsToStay: 4, downPaymentPct: 20, mortgageYears: 15, investmentReturnPct: 14 },
  { id: 'family-settle', label: 'Family settle-down', note: 'Longer stay, ownership case stronger', city: 'lahore', propertyPrice: 42000000, monthlyRent: 140000, yearsToStay: 9, downPaymentPct: 30, mortgageYears: 15, investmentReturnPct: 13 },
  { id: 'wait-and-save', label: 'Wait and save', note: 'Markup pressure is too high right now', city: 'islamabad', propertyPrice: 50000000, monthlyRent: 170000, yearsToStay: 5, downPaymentPct: 20, mortgageYears: 15, investmentReturnPct: 15 },
]

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
  const [scenarioPreset, setScenarioPreset] = useState('custom')
  const [copyState, setCopyState] = useState('idle')
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

  function applyScenario(presetId) {
    const preset = SCENARIO_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    setScenarioPreset(presetId)
    applyCity(preset.city)
    setPropertyPrice(preset.propertyPrice)
    setMonthlyRent(preset.monthlyRent)
    setYearsToStay(preset.yearsToStay)
    setDownPaymentPct(preset.downPaymentPct)
    setMortgageYears(preset.mortgageYears)
    setInvestmentReturnPct(preset.investmentReturnPct)
  }

  function markCustom() {
    setScenarioPreset('custom')
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

  const summaryText = [
    'Rafiqy Rent vs Buy Pakistan Summary',
    `City: ${result.cityLabel}`,
    `Property price: ${fmtCurrency(propertyPrice)}`,
    `Monthly rent: ${fmtCurrency(monthlyRent)}`,
    `Stay horizon: ${yearsToStay} years`,
    `Recommendation: ${result.recommendation}`,
    `Buy net cost: ${fmtCurrency(result.buyNetCost)}`,
    `Rent net cost: ${fmtCurrency(result.rentNetCost)}`,
    `Monthly EMI: ${fmtCurrency(result.emi)}`,
    `Down payment: ${fmtCurrency(result.downPayment)}`,
    result.breakEvenYears ? `Break-even horizon: ${result.breakEvenYears} years` : null,
    `Decision path: ${result.decisionTitle}`,
    `Action steps: ${result.actionSteps.join(' | ')}`,
  ].filter(Boolean).join('\n')

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

  function downloadSummary() {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rafiqy-rent-vs-buy-summary.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

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
      <PakistanFriendlyGuide toolId="rent-vs-buy-pakistan" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Scenario inputs" subtitle="Start with a city preset, then adjust assumptions to match your actual situation." accent={ACCENT} colors={colors}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text, fontWeight: 700, marginBottom: '0.55rem', fontSize: '0.88rem' }}>Start from a real-life housing scenario</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.55rem' }}>
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyScenario(preset.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '0.9rem',
                    border: `1px solid ${scenarioPreset === preset.id ? ACCENT : colors.border}`,
                    background: scenarioPreset === preset.id ? `${ACCENT}14` : colors.card,
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
            <Field label="City preset" hint="Loads default growth, markup, and friction assumptions. Override them if your area behaves differently.">
              <SelectInput colors={colors} value={city} onChange={(e) => { markCustom(); applyCity(e.target.value) }}>
                {Object.entries(CITY_PRESETS).map(([value, preset]) => <option key={value} value={value}>{preset.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Property price (PKR)" hint="Use the actual all-in purchase price you would negotiate, not an aspirational listing.">
              <NumberInput colors={colors} value={propertyPrice} onChange={(e) => { markCustom(); setPropertyPrice(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Monthly rent (PKR)" hint="Use the rent for a genuinely comparable home, not a smaller or older alternative.">
              <NumberInput colors={colors} value={monthlyRent} onChange={(e) => { markCustom(); setMonthlyRent(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Stay horizon" hint="This is the biggest swing factor. If you may move early, do not overstate it.">
              <SliderInput colors={colors} accent={ACCENT} value={yearsToStay} onChange={(e) => { markCustom(); setYearsToStay(Number(e.target.value)) }} min={2} max={15} suffix=" years" />
            </Field>
            <Field label="Down payment" hint="Keep emergency liquidity separate. A strong buy case can still be dangerous if cash is fully locked up.">
              <SliderInput colors={colors} accent={ACCENT} value={downPaymentPct} onChange={(e) => { markCustom(); setDownPaymentPct(Number(e.target.value)) }} min={10} max={50} suffix="%" />
            </Field>
            <Field label="Mortgage markup" hint="Use an actual bank range when possible. A 1–2% change can materially alter the answer.">
              <SliderInput colors={colors} accent={ACCENT} value={annualMarkupRate} onChange={(e) => { markCustom(); setAnnualMarkupRate(Number(e.target.value)) }} min={10} max={24} step={0.25} suffix="%" />
            </Field>
            <Field label="Mortgage tenure" hint="Longer tenure lowers EMI but usually increases total financing cost.">
              <SliderInput colors={colors} accent={ACCENT} value={mortgageYears} onChange={(e) => { markCustom(); setMortgageYears(Number(e.target.value)) }} min={5} max={25} suffix=" years" />
            </Field>
            <Field label="Alternative investment return" hint="This represents what your down payment and transaction cash could earn elsewhere. Stay realistic.">
              <SliderInput colors={colors} accent={ACCENT} value={investmentReturnPct} onChange={(e) => { markCustom(); setInvestmentReturnPct(Number(e.target.value)) }} min={6} max={22} step={0.5} suffix="%" />
            </Field>
          </FieldsGrid>

          <SectionCard title="Market assumptions" accent={ACCENT} colors={colors}>
            <FieldsGrid>
                <Field label="Annual rent growth" hint="Use a market average, not one unusually aggressive landlord increase.">
                  <SliderInput colors={colors} accent={ACCENT} value={annualRentGrowth} onChange={(e) => { markCustom(); setAnnualRentGrowth(Number(e.target.value)) }} min={3} max={18} step={0.5} suffix="%" />
                </Field>
                <Field label="Annual home price growth" hint="This is the easiest assumption to overestimate. Test a lower case too.">
                  <SliderInput colors={colors} accent={ACCENT} value={annualHomeGrowth} onChange={(e) => { markCustom(); setAnnualHomeGrowth(Number(e.target.value)) }} min={3} max={18} step={0.5} suffix="%" />
                </Field>
                <Field label="Maintenance cost" hint="Apartments and older houses usually need more than people budget initially.">
                  <SliderInput colors={colors} accent={ACCENT} value={annualMaintenancePct} onChange={(e) => { markCustom(); setAnnualMaintenancePct(Number(e.target.value)) }} min={0.3} max={2.5} step={0.1} suffix="%" />
                </Field>
                <Field label="Property tax / holding cost" hint="Include recurring ownership friction, not only formal tax.">
                  <SliderInput colors={colors} accent={ACCENT} value={propertyTaxPct} onChange={(e) => { markCustom(); setPropertyTaxPct(Number(e.target.value)) }} min={0} max={1} step={0.05} suffix="%" />
                </Field>
                <Field label="Transfer + selling friction" hint="Registry, agent cuts, legal work, and resale friction should all live here.">
                  <SliderInput colors={colors} accent={ACCENT} value={transferCostPct} onChange={(e) => { markCustom(); setTransferCostPct(Number(e.target.value)) }} min={3} max={10} step={0.25} suffix="%" />
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
          <ActionCallout
            title="What you should do next"
            body={result.decisionTrack}
            accent={result.recommendation === 'Buy' ? '#22c55e' : '#06b6d4'}
            colors={colors}
            actions={result.actionSteps.slice(0, 3)}
          />
          <MetricGrid>
            <MetricCard label="Buy net cost" value={fmtCurrency(result.buyNetCost)} sub={`Owner net worth: ${fmtCurrency(result.ownerNetWorth)}`} accent="#22c55e" colors={colors} />
            <MetricCard label="Rent net cost" value={fmtCurrency(result.rentNetCost)} sub={`Invested reserve: ${fmtCurrency(result.rentInvestedValue)}`} accent="#06b6d4" colors={colors} />
            <MetricCard label="Monthly EMI" value={fmtCurrency(result.emi)} sub={`Down payment: ${fmtCurrency(result.downPayment)}`} accent={ACCENT} colors={colors} />
            <MetricCard label="Break-even horizon" value={result.breakEvenYears ? `${result.breakEvenYears} yrs` : 'Watch assumptions'} sub="Longer stays usually improve the buy case." accent="#0ea5e9" colors={colors} />
            <MetricCard label="Owner upfront cash" value={fmtCurrency(result.downPayment)} sub="This is the cash that gets locked immediately before recurring costs." accent="#f59e0b" colors={colors} />
            <MetricCard label="Rent-side invested reserve" value={fmtCurrency(result.rentInvestedValue)} sub="Shows what the down payment and monthly gap can become if you stay disciplined." accent="#14b8a6" colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision path" subtitle={result.decisionTrack} accent={ACCENT} colors={colors}>
            <div style={{ color: colors.text, fontSize: '1.02rem', fontWeight: 700 }}>{result.decisionTitle}</div>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.65 }}>{result.decisionBody}</p>
            <BulletList items={result.actionSteps} colors={colors} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={copySummary} style={{ padding: '0.55rem 0.9rem', borderRadius: '0.75rem', border: `1px solid ${copyState === 'error' ? '#ef4444' : ACCENT}`, background: copyState === 'copied' ? '#dcfce7' : `${ACCENT}12`, color: copyState === 'error' ? '#ef4444' : ACCENT, fontWeight: 700, cursor: 'pointer' }}>
                {copyState === 'copied' ? 'Summary copied' : copyState === 'error' ? 'Copy failed' : 'Copy plan summary'}
              </button>
              <button type="button" onClick={downloadSummary} style={{ padding: '0.55rem 0.9rem', borderRadius: '0.75rem', border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, fontWeight: 700, cursor: 'pointer' }}>
                Download summary
              </button>
            </div>
          </SectionCard>

          <CollapsibleSection
            title="Why the recommendation changed"
            summary="Open this if you want the main reasons behind the result, not just the headline recommendation."
            colors={colors}
          >
            <BulletList items={result.reasons} colors={colors} />
          </CollapsibleSection>

          <SectionCard title="See the cost gap clearly" subtitle="Shorter bars are financially better here because this chart compares projected net cost under your assumptions." accent={ACCENT} colors={colors}>
            <ComparisonBars
              colors={colors}
              items={[
                { label: 'Buy path', value: Math.max(0, result.buyNetCost), display: fmtCurrency(result.buyNetCost), color: '#22c55e', note: `Owner net worth at exit: ${fmtCurrency(result.ownerNetWorth)}` },
                { label: 'Rent path', value: Math.max(0, result.rentNetCost), display: fmtCurrency(result.rentNetCost), color: '#06b6d4', note: `Invested reserve at exit: ${fmtCurrency(result.rentInvestedValue)}` },
              ]}
            />
          </SectionCard>

          <SectionCard title="What flips the answer?" subtitle="These sensitivity checks show how fragile or durable the decision is." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <CollapsibleSection
            title="Decision scores"
            summary="Cost drives most of the result. Open this if you want to see how flexibility and resilience adjusted the final ranking."
            colors={colors}
          >
            <ScoreBars scores={{ 'Buy score': result.finalScores.buy, 'Rent score': result.finalScores.rent }} colors={colors} />
          </CollapsibleSection>

          <CollapsibleSection
            title="What to verify next"
            summary="Use this before acting on the result. It keeps the tool from turning into false certainty."
            colors={colors}
            defaultOpen
          >
            <BulletList
              items={[
                'Check two or three actual bank markup offers instead of trusting a generic financing assumption.',
                'Use comparable rent for a genuinely similar home, not a smaller or lower-quality alternative.',
                'Pressure-test appreciation. If the buy case only works with optimistic growth, it is weaker than it looks.',
                'Separate emotional comfort from this specific property decision. A bad property at the wrong financing cost is still a bad deal.',
                'If you rent, treat the monthly gap and down-payment reserve as investable capital, not spending money.',
              ]}
              colors={colors}
            />
          </CollapsibleSection>

          <SectionCard
            title="Plan your next step"
            subtitle="Use these scenario guides if you want to test the decision from a more specific angle before talking to a bank, broker, or family."
            accent={ACCENT}
            colors={colors}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem' }}>
              {[
                { href: '/blog/rent-vs-buy-calculator-pakistan-guide', label: 'Rent vs Buy Pakistan Guide', note: 'The full decision framework behind the tool' },
                { href: '/blog/should-i-buy-a-house-or-keep-renting-in-pakistan', label: 'Should I Buy a House or Keep Renting?', note: 'A clean first-pass decision for primary residence' },
                { href: '/blog/home-loan-vs-rent-in-pakistan', label: 'Home Loan vs Rent in Pakistan', note: 'Why EMI-only thinking is too shallow' },
                { href: '/blog/how-long-should-you-stay-before-buying-a-house-in-pakistan', label: 'How Long Should You Stay Before Buying?', note: 'Use stay horizon to avoid the wrong purchase timing' },
                { href: '/blog/what-down-payment-makes-buying-safer-in-pakistan', label: 'What Down Payment Makes Buying Safer?', note: 'Liquidity discipline before ownership' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    borderRadius: '0.9rem',
                    padding: '0.85rem 0.9rem',
                  }}
                >
                  <div style={{ color: colors.text, fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.45, marginBottom: '0.25rem' }}>
                    {item.label}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '0.76rem', lineHeight: 1.55 }}>
                    {item.note}
                  </div>
                </a>
              ))}
            </div>
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

