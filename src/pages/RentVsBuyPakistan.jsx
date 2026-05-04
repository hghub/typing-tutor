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
            <Field label="City preset">
              <SelectInput colors={colors} value={city} onChange={(e) => applyCity(e.target.value)}>
                {Object.entries(CITY_PRESETS).map(([value, preset]) => <option key={value} value={value}>{preset.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Property price (PKR)">
              <NumberInput colors={colors} value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly rent (PKR)">
              <NumberInput colors={colors} value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Stay horizon">
              <SliderInput colors={colors} accent={ACCENT} value={yearsToStay} onChange={(e) => setYearsToStay(Number(e.target.value))} min={2} max={15} suffix=" years" />
            </Field>
            <Field label="Down payment">
              <SliderInput colors={colors} accent={ACCENT} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} min={10} max={50} suffix="%" />
            </Field>
            <Field label="Mortgage markup">
              <SliderInput colors={colors} accent={ACCENT} value={annualMarkupRate} onChange={(e) => setAnnualMarkupRate(Number(e.target.value))} min={10} max={24} step={0.25} suffix="%" />
            </Field>
            <Field label="Mortgage tenure">
              <SliderInput colors={colors} accent={ACCENT} value={mortgageYears} onChange={(e) => setMortgageYears(Number(e.target.value))} min={5} max={25} suffix=" years" />
            </Field>
            <Field label="Alternative investment return">
              <SliderInput colors={colors} accent={ACCENT} value={investmentReturnPct} onChange={(e) => setInvestmentReturnPct(Number(e.target.value))} min={6} max={22} step={0.5} suffix="%" />
            </Field>
          </FieldsGrid>

          <SectionCard title="Market assumptions" accent={ACCENT} colors={colors}>
            <FieldsGrid>
              <Field label="Annual rent growth">
                <SliderInput colors={colors} accent={ACCENT} value={annualRentGrowth} onChange={(e) => setAnnualRentGrowth(Number(e.target.value))} min={3} max={18} step={0.5} suffix="%" />
              </Field>
              <Field label="Annual home price growth">
                <SliderInput colors={colors} accent={ACCENT} value={annualHomeGrowth} onChange={(e) => setAnnualHomeGrowth(Number(e.target.value))} min={3} max={18} step={0.5} suffix="%" />
              </Field>
              <Field label="Maintenance cost">
                <SliderInput colors={colors} accent={ACCENT} value={annualMaintenancePct} onChange={(e) => setAnnualMaintenancePct(Number(e.target.value))} min={0.3} max={2.5} step={0.1} suffix="%" />
              </Field>
              <Field label="Property tax / holding cost">
                <SliderInput colors={colors} accent={ACCENT} value={propertyTaxPct} onChange={(e) => setPropertyTaxPct(Number(e.target.value))} min={0} max={1} step={0.05} suffix="%" />
              </Field>
              <Field label="Transfer + selling friction">
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

          <SectionCard title="Why the recommendation changed" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
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
