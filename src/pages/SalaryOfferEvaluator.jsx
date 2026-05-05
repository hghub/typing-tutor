import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
import { calcFullTax, SLABS_2526 } from '../data/taxData'
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
  CollapsibleSection,
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

const ACCENT = '#06b6d4'

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

  const higherBaseGross = (inputs.monthlyGross * 1.1) * 12 + inputs.annualBonus
  const higherBaseTax = calcFullTax({ annualIncome: higherBaseGross, slabs: SLABS_2526 }).tax
  const higherBaseNet = higherBaseGross - higherBaseTax - inputs.monthlyCommuteCost * 12
  const higherBaseTotal = higherBaseNet + annualBenefitValue + annualPensionValue + inputs.relocationSupport

  const lowerCommuteNet = annualGross - tax - Math.max(0, inputs.monthlyCommuteCost - 10000) * 12
  const lowerCommuteTotal = lowerCommuteNet + annualBenefitValue + annualPensionValue + inputs.relocationSupport

  const moreRemoteScore = weightedScore(
    { cost: lifestyleScore, flexibility: Math.min(92, flexibilityScore + 12), growth: progressionScore },
    { cost: 0.55, flexibility: 0.2, growth: 0.25 },
  )

  let decisionTitle = 'Check the total package, not the headline salary'
  let decisionBody = 'A better monthly number can still be a weak switch if commute, benefits, city cost, and flexibility are doing too much damage.'
  let decisionTrack = 'This decision should become clearer when you isolate what would need to change for the offer to feel genuinely better.'
  const actionSteps = []

  if (recommendation === 'Take the offer' && confidence >= 0.75) {
    decisionTitle = 'The offer looks genuinely stronger overall'
    decisionBody = 'The full package holds up after tax, commute, and employer-paid value are included. This is not just a cosmetic salary jump.'
    decisionTrack = 'Your main remaining work is validating contract wording and execution risk, not proving the economics from scratch.'
    actionSteps.push('Confirm how the employer actually structures bonus, medical cover, and provident fund in payroll.')
    actionSteps.push('If relocation is involved, check whether the first 3–6 months still feel financially comfortable.')
    actionSteps.push('Keep the current-role benchmark visible so you do not overvalue prestige alone.')
  } else if (recommendation === 'Take the offer') {
    decisionTitle = 'The offer can work, but tighten the terms'
    decisionBody = 'The switch looks positive, but not so decisively that you should ignore commute burden, remote flexibility, or benefit wording.'
    decisionTrack = 'This is a good case for accepting only after you clean up one or two weak parts of the package.'
    actionSteps.push('Push for better remote flexibility, commute support, or stronger medical cover before signing.')
    actionSteps.push('Do not let a one-time relocation amount distract from weaker recurring economics.')
    actionSteps.push('Ask payroll how the actual monthly take-home will look after deductions.')
  } else {
    decisionTitle = 'Renegotiate or stay unless the package improves'
    decisionBody = 'Under the current assumptions, the offer does not create enough financial or practical improvement to justify the switch confidently.'
    decisionTrack = 'The fastest path to a yes is usually a better base, lower commute burden, or a more flexible working pattern.'
    actionSteps.push('Use this result as negotiation support, not as a final emotional rejection.')
    actionSteps.push('Target the one variable that most improves your annual value: base pay, benefits, or remote days.')
    actionSteps.push('If the employer cannot improve the package, the current role may still be the stronger position.')
  }

  const sensitivity = [
    {
      label: 'If base salary is 10% higher',
      impact: fmtCurrency(higherBaseTotal),
      detail: `That would add about ${fmtCurrency(higherBaseTotal - totalAnnualValue)} to effective annual value after tax.`,
      tone: '#22c55e',
    },
    {
      label: 'If monthly commute drops by PKR 10,000',
      impact: fmtCurrency(lowerCommuteTotal),
      detail: 'Commute drag quietly compounds over the year and often matters more than expected.',
      tone: '#06b6d4',
    },
    {
      label: 'If you get 2 more remote days',
      impact: `${moreRemoteScore}/100 offer score`,
      detail: 'Flexibility can materially improve the quality of the switch even when cash changes only a little.',
      tone: '#0ea5e9',
    },
  ]

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
    decisionTitle,
    decisionBody,
    decisionTrack,
    actionSteps,
    sensitivity,
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
      <FreshnessBanner
        colors={colors}
        accent={ACCENT}
        lastUpdated="May 2026"
        cadence="Monthly for tax-year-sensitive logic, quarterly for city-cost baselines"
        refreshed="Current salaried tax logic, baseline city-cost assumptions, and benefit modeling defaults"
        estimated="Your actual payroll structure, allowances, and employer wording may change the final result"
      />
      <PakistanFriendlyGuide toolId="salary-offer-evaluator" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="New offer inputs" subtitle="Model the full value of the offer, not just the headline monthly salary." accent={ACCENT} colors={colors}>
          <FieldsGrid>
            <Field label="Target city" hint="This affects living-cost pressure. Use the city where the role will actually operate.">
              <SelectInput colors={colors} value={city} onChange={(e) => setCity(e.target.value)}>
                {Object.entries(CITY_COSTS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Monthly gross salary (PKR)" hint="Use the contractual salary before tax, not the expected take-home.">
              <NumberInput colors={colors} value={monthlyGross} onChange={(e) => setMonthlyGross(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Annual bonus (PKR)" hint="Only include bonus if it is realistic and not purely discretionary.">
              <NumberInput colors={colors} value={annualBonus} onChange={(e) => setAnnualBonus(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly commute cost (PKR)" hint="Include fuel, ride-hailing, parking, tolls, and the real burden of the route.">
              <NumberInput colors={colors} value={monthlyCommuteCost} onChange={(e) => setMonthlyCommuteCost(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Remote days per week" hint="Use what is actually approved, not what you hope the team culture will allow.">
              <SliderInput colors={colors} accent={ACCENT} value={remoteDaysPerWeek} onChange={(e) => setRemoteDaysPerWeek(Number(e.target.value))} min={0} max={5} suffix=" days" />
            </Field>
            <Field label="Employer medical cover value / month" hint="Estimate the practical value to you, not the marketing value on paper.">
              <NumberInput colors={colors} value={employerMedical} onChange={(e) => setEmployerMedical(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Fuel / travel allowance / month" hint="Use recurring support only. Ignore one-off verbal promises.">
              <NumberInput colors={colors} value={employerFuel} onChange={(e) => setEmployerFuel(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Other benefits / month" hint="Internet, phone, meal support, or anything that reliably reduces your own spend.">
              <NumberInput colors={colors} value={otherBenefits} onChange={(e) => setOtherBenefits(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Provident fund support" hint="Employer contribution adds real annual value even if it is less visible than salary.">
              <SliderInput colors={colors} accent={ACCENT} value={providentFundPct} onChange={(e) => setProvidentFundPct(Number(e.target.value))} min={0} max={15} suffix="%" />
            </Field>
            <Field label="Learning budget / month" hint="Use the real value you can access, not a vague line item.">
              <NumberInput colors={colors} value={learningBudget} onChange={(e) => setLearningBudget(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Relocation support (one-time PKR)" hint="Useful, but do not let a one-time amount hide weak recurring economics.">
              <NumberInput colors={colors} value={relocationSupport} onChange={(e) => setRelocationSupport(Number(e.target.value) || 0)} />
            </Field>
          </FieldsGrid>

          <SectionCard title="Current-role benchmark" accent={ACCENT} colors={colors}>
            <FieldsGrid>
              <Field label="Current annual value (PKR)" hint="Use your honest current total package, not just base salary.">
                <NumberInput colors={colors} value={currentAnnualValue} onChange={(e) => setCurrentAnnualValue(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Current role value score" hint="A rough quality score for what the current role is worth to you overall.">
                <SliderInput colors={colors} accent={ACCENT} value={currentValueScore} onChange={(e) => setCurrentValueScore(Number(e.target.value))} min={35} max={95} suffix="/100" />
              </Field>
              <Field label="Current flexibility score" hint="Think commute, schedule control, remote days, and energy cost to your life.">
                <SliderInput colors={colors} accent={ACCENT} value={currentFlexibilityScore} onChange={(e) => setCurrentFlexibilityScore(Number(e.target.value))} min={20} max={95} suffix="/100" />
              </Field>
              <Field label="Current growth score" hint="Rate how much the current role helps you grow over the next 1–2 years.">
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
          <ActionCallout
            title="What you should do next"
            body={result.decisionTrack}
            accent={result.recommendation === 'Take the offer' ? '#22c55e' : '#f59e0b'}
            colors={colors}
            actions={result.actionSteps.slice(0, 3)}
          />
          <MetricGrid>
            <MetricCard label="Annual gross" value={fmtCurrency(result.annualGross)} sub={`Estimated salary tax: ${fmtCurrency(result.tax)}`} accent={ACCENT} colors={colors} />
            <MetricCard label="Take-home after commute" value={fmtCurrency(result.netAnnualCash)} sub="Cash available before employer-paid benefits." accent="#22c55e" colors={colors} />
            <MetricCard label="Benefits + PF value" value={fmtCurrency(result.annualBenefitValue + result.annualPensionValue + relocationSupport)} sub="Medical, fuel, other benefits, provident fund, and relocation." accent="#06b6d4" colors={colors} />
            <MetricCard label="Discretionary buffer" value={fmtCurrency(result.discretionaryAnnual)} sub={`Versus ${CITY_COSTS[city].label} baseline living costs.`} accent="#0ea5e9" colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision path" subtitle={result.decisionTrack} accent={ACCENT} colors={colors}>
            <div style={{ color: colors.text, fontSize: '1.02rem', fontWeight: 700 }}>{result.decisionTitle}</div>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.65 }}>{result.decisionBody}</p>
            <BulletList items={result.actionSteps} colors={colors} />
          </SectionCard>

          <CollapsibleSection
            title="Decision trace"
            summary="Open this if you want to see the main assumptions behind the result."
            colors={colors}
          >
            <BulletList items={result.reasons} colors={colors} />
          </CollapsibleSection>

          <SectionCard title="What would improve the offer most?" subtitle="These checks show which lever has the biggest impact before you accept or reject." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <CollapsibleSection
            title="Offer vs current-role score"
            summary="Open this if you want the weighted comparison behind the recommendation."
            colors={colors}
          >
            <ScoreBars scores={{ 'Offer score': result.totalScores.offer, 'Current role score': result.totalScores.current }} colors={colors} />
          </CollapsibleSection>
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

