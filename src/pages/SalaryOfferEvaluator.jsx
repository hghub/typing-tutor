import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
import { calcFullTax, SLABS_2526 } from '../data/taxData'
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
  fmtPercent,
  costScoresFromTotals,
  weightedScore,
  confidenceFromGap,
  topTwoByLowest,
  round,
} from '../lib/decision'

const ACCENT = '#6366f1'

const CITY_COSTS = {
  karachi: { label: 'Karachi', baselineMonthlySpend: 135000, commuteFactor: 1.1 },
  lahore: { label: 'Lahore', baselineMonthlySpend: 125000, commuteFactor: 1.0 },
  islamabad: { label: 'Islamabad', baselineMonthlySpend: 145000, commuteFactor: 0.95 },
  rawalpindi: { label: 'Rawalpindi', baselineMonthlySpend: 112000, commuteFactor: 1.0 },
  remote: { label: 'Remote / lower-cost city', baselineMonthlySpend: 90000, commuteFactor: 0.75 },
}

function evaluateOffer(inputs) {
  const annualGross = inputs.monthlyGross * 12 + inputs.annualBonus
  const tax = calcFullTax({ annualIncome: annualGross, slabs: SLABS_2526 }).tax
  const netAnnualCash = annualGross - tax - inputs.monthlyCommuteCost * 12
  const annualBenefitValue = (inputs.employerMedical + inputs.employerFuel + inputs.otherBenefits) * 12
  const annualPensionValue = inputs.monthlyGross * (inputs.providentFundPct / 100) * 12
  const totalAnnualValue = netAnnualCash + annualBenefitValue + annualPensionValue + inputs.relocationSupport

  const cityBaseline = CITY_COSTS[inputs.city].baselineMonthlySpend * 12
  const discretionaryAnnual = totalAnnualValue - cityBaseline
  const lifestyleScore = round(Math.max(20, Math.min(100, 50 + (discretionaryAnnual / cityBaseline) * 40)))
  const flexibilityScore = inputs.remoteDaysPerWeek >= 3 ? 86 : inputs.remoteDaysPerWeek >= 1 ? 72 : 58
  const progressionScore = inputs.learningBudget >= 15000 ? 78 : inputs.learningBudget >= 5000 ? 68 : 56
  const totalScores = {
    offer: weightedScore(
      { cost: lifestyleScore, flexibility: flexibilityScore, growth: progressionScore },
      { cost: 0.55, flexibility: 0.2, growth: 0.25 },
    ),
    current: weightedScore(
      { cost: inputs.currentValueScore, flexibility: inputs.currentFlexibilityScore, growth: inputs.currentGrowthScore },
      { cost: 0.55, flexibility: 0.2, growth: 0.25 },
    ),
  }

  const comparisonCosts = {
    offer: -totalAnnualValue,
    current: -inputs.currentAnnualValue,
  }
  const [best, second] = topTwoByLowest(comparisonCosts)
  const confidence = confidenceFromGap(Math.abs(best[1]), Math.abs(second[1]))
  const recommendation = totalScores.offer >= totalScores.current ? 'Take the offer' : 'Stay / renegotiate'

  const reasons = []
  reasons.push(`Estimated take-home after salary tax and commute is ${fmtCurrency(netAnnualCash)} per year.`)
  reasons.push(`When employer-paid benefits, provident fund support, and relocation value are included, the offer is worth about ${fmtCurrency(totalAnnualValue)} annually.`)
  if (discretionaryAnnual > 0) {
    reasons.push(`Against a ${CITY_COSTS[inputs.city].label} living-cost baseline, you still keep about ${fmtCurrency(discretionaryAnnual)} per year for saving, investing, or family goals.`)
  } else {
    reasons.push(`Against the selected city-cost baseline, the offer leaves very little buffer. That weakens the switch case unless the role has much stronger future upside.`)
  }
  if (recommendation === 'Stay / renegotiate') reasons.push('The model suggests pushing for a higher base, stronger medical cover, or more remote days before switching.')

  return {
    annualGross,
    tax,
    netAnnualCash,
    annualBenefitValue,
    annualPensionValue,
    totalAnnualValue,
    discretionaryAnnual,
    totalScores,
    recommendation,
    confidence,
    reasons,
    lifestyleScore,
    flexibilityScore,
    progressionScore,
  }
}

export default function SalaryOfferEvaluator() {
  const { colors } = useTheme()
  const [city, setCity] = useState('karachi')
  const [monthlyGross, setMonthlyGross] = useState(320000)
  const [annualBonus, setAnnualBonus] = useState(300000)
  const [monthlyCommuteCost, setMonthlyCommuteCost] = useState(18000)
  const [remoteDaysPerWeek, setRemoteDaysPerWeek] = useState(2)
  const [employerMedical, setEmployerMedical] = useState(12000)
  const [employerFuel, setEmployerFuel] = useState(10000)
  const [otherBenefits, setOtherBenefits] = useState(5000)
  const [providentFundPct, setProvidentFundPct] = useState(8)
  const [learningBudget, setLearningBudget] = useState(8000)
  const [relocationSupport, setRelocationSupport] = useState(100000)
  const [currentAnnualValue, setCurrentAnnualValue] = useState(3600000)
  const [currentValueScore, setCurrentValueScore] = useState(65)
  const [currentFlexibilityScore, setCurrentFlexibilityScore] = useState(60)
  const [currentGrowthScore, setCurrentGrowthScore] = useState(58)

  const result = useMemo(() => evaluateOffer({
    city,
    monthlyGross,
    annualBonus,
    monthlyCommuteCost,
    remoteDaysPerWeek,
    employerMedical,
    employerFuel,
    otherBenefits,
    providentFundPct,
    learningBudget,
    relocationSupport,
    currentAnnualValue,
    currentValueScore,
    currentFlexibilityScore,
    currentGrowthScore,
  }), [
    city, monthlyGross, annualBonus, monthlyCommuteCost, remoteDaysPerWeek,
    employerMedical, employerFuel, otherBenefits, providentFundPct,
    learningBudget, relocationSupport, currentAnnualValue,
    currentValueScore, currentFlexibilityScore, currentGrowthScore,
  ])

  return (
    <ToolLayout toolId="salary-offer-evaluator">
      <DecisionHero
        accent={ACCENT}
        title="Salary Offer Evaluator Pakistan"
        eyebrow="Decision system"
        description="Turn a salary offer into an actual decision. Compare after-tax income, commute, benefits, provident fund support, remote flexibility, and city living-cost pressure."
        colors={colors}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="New offer inputs" subtitle="Model the full value of the offer, not just the headline monthly salary." accent={ACCENT} colors={colors}>
          <FieldsGrid>
            <Field label="Target city">
              <SelectInput colors={colors} value={city} onChange={(e) => setCity(e.target.value)}>
                {Object.entries(CITY_COSTS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Monthly gross salary (PKR)">
              <NumberInput colors={colors} value={monthlyGross} onChange={(e) => setMonthlyGross(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Annual bonus (PKR)">
              <NumberInput colors={colors} value={annualBonus} onChange={(e) => setAnnualBonus(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly commute cost (PKR)">
              <NumberInput colors={colors} value={monthlyCommuteCost} onChange={(e) => setMonthlyCommuteCost(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Remote days per week">
              <SliderInput colors={colors} accent={ACCENT} value={remoteDaysPerWeek} onChange={(e) => setRemoteDaysPerWeek(Number(e.target.value))} min={0} max={5} suffix=" days" />
            </Field>
            <Field label="Employer medical cover value / month">
              <NumberInput colors={colors} value={employerMedical} onChange={(e) => setEmployerMedical(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Fuel / travel allowance / month">
              <NumberInput colors={colors} value={employerFuel} onChange={(e) => setEmployerFuel(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Other benefits / month">
              <NumberInput colors={colors} value={otherBenefits} onChange={(e) => setOtherBenefits(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Provident fund support">
              <SliderInput colors={colors} accent={ACCENT} value={providentFundPct} onChange={(e) => setProvidentFundPct(Number(e.target.value))} min={0} max={15} suffix="%" />
            </Field>
            <Field label="Learning budget / month">
              <NumberInput colors={colors} value={learningBudget} onChange={(e) => setLearningBudget(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Relocation support (one-time PKR)">
              <NumberInput colors={colors} value={relocationSupport} onChange={(e) => setRelocationSupport(Number(e.target.value) || 0)} />
            </Field>
          </FieldsGrid>

          <SectionCard title="Current-role benchmark" accent={ACCENT} colors={colors}>
            <FieldsGrid>
              <Field label="Current annual value (PKR)">
                <NumberInput colors={colors} value={currentAnnualValue} onChange={(e) => setCurrentAnnualValue(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Current role value score">
                <SliderInput colors={colors} accent={ACCENT} value={currentValueScore} onChange={(e) => setCurrentValueScore(Number(e.target.value))} min={35} max={95} suffix="/100" />
              </Field>
              <Field label="Current flexibility score">
                <SliderInput colors={colors} accent={ACCENT} value={currentFlexibilityScore} onChange={(e) => setCurrentFlexibilityScore(Number(e.target.value))} min={20} max={95} suffix="/100" />
              </Field>
              <Field label="Current growth score">
                <SliderInput colors={colors} accent={ACCENT} value={currentGrowthScore} onChange={(e) => setCurrentGrowthScore(Number(e.target.value))} min={20} max={95} suffix="/100" />
              </Field>
            </FieldsGrid>
          </SectionCard>
        </SectionCard>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.recommendation === 'Take the offer' ? '#22c55e' : '#f59e0b'}
            title={result.recommendation}
            body={result.reasons[0]}
            confidence={result.confidence}
            colors={colors}
          />
          <MetricGrid>
            <MetricCard label="Annual gross" value={fmtCurrency(result.annualGross)} sub={`Estimated salary tax: ${fmtCurrency(result.tax)}`} accent={ACCENT} colors={colors} />
            <MetricCard label="Take-home after commute" value={fmtCurrency(result.netAnnualCash)} sub="Cash available before employer-paid benefits." accent="#22c55e" colors={colors} />
            <MetricCard label="Benefits + PF value" value={fmtCurrency(result.annualBenefitValue + result.annualPensionValue + relocationSupport)} sub="Medical, fuel, other benefits, provident fund, and relocation." accent="#06b6d4" colors={colors} />
            <MetricCard label="Discretionary buffer" value={fmtCurrency(result.discretionaryAnnual)} sub={`Versus ${CITY_COSTS[city].label} baseline living costs.`} accent="#8b5cf6" colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision trace" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
          </SectionCard>

          <SectionCard title="Offer vs current-role score" subtitle="The offer score combines affordability, flexibility, and growth support." accent={ACCENT} colors={colors}>
            <ScoreBars scores={{ 'Offer score': result.totalScores.offer, 'Current role score': result.totalScores.current }} colors={colors} />
          </SectionCard>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DisclaimerBlock
          type="tax"
          overrideBodyEn="This evaluator uses current salaried tax logic and baseline living-cost assumptions. Verify final compensation structure, payroll deductions, and benefit wording before making a switch."
        />
      </div>
    </ToolLayout>
  )
}
