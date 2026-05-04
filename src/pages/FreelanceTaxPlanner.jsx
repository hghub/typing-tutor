import { useMemo, useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
import { calcFullTax, SLABS_2526 } from '../data/taxData'
import FreshnessBanner from '../components/decision/FreshnessBanner'
import {
  DecisionHero,
  SectionCard,
  FieldsGrid,
  Field,
  NumberInput,
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
  weightedScore,
  round,
} from '../lib/decision'

const ACCENT = '#f97316'

function planFreelanceReserves(inputs) {
  const annualRevenue = inputs.averageMonthlyRevenue * 12
  const annualTax = calcFullTax({ annualIncome: annualRevenue, slabs: SLABS_2526 }).tax
  const annualBusinessCosts = inputs.monthlyBusinessCosts * 12
  const annualHomeCosts = inputs.monthlyHomeCosts * 12
  const emergencyTarget = annualHomeCosts * (inputs.emergencyMonths / 12)
  const taxReserveMonthly = annualTax / 12
  const opsReserveMonthly = inputs.averageMonthlyRevenue * (inputs.reservePct / 100)
  const emergencyContribution = Math.max(0, emergencyTarget - inputs.currentEmergencyFund) / Math.max(1, inputs.buildMonths)
  const suggestedOwnerPay = Math.max(
    0,
    inputs.averageMonthlyRevenue - inputs.monthlyBusinessCosts - taxReserveMonthly - opsReserveMonthly - emergencyContribution,
  )
  const runwayMonths = inputs.currentEmergencyFund / Math.max(1, inputs.monthlyHomeCosts)

  const healthScore = weightedScore(
    {
      reserve: Math.min(100, (opsReserveMonthly / Math.max(1, inputs.averageMonthlyRevenue * 0.15)) * 100),
      tax: Math.min(100, (taxReserveMonthly / Math.max(1, annualTax / 12)) * 100),
      runway: Math.min(100, (runwayMonths / inputs.emergencyMonths) * 100),
    },
    { reserve: 0.35, tax: 0.35, runway: 0.3 },
  )

  const reasons = [
    `Estimated annual taxable revenue is ${fmtCurrency(annualRevenue)} with an approximate annual salary-style tax equivalent of ${fmtCurrency(annualTax)}.`,
    `A baseline monthly tax reserve of ${fmtCurrency(taxReserveMonthly)} keeps the annual liability from landing as one large shock.`,
    `An operating reserve of ${fmtCurrency(opsReserveMonthly)} helps smooth client delays, FX swings, and dry months.`,
  ]
  if (runwayMonths < inputs.emergencyMonths) {
    reasons.push(`Your current emergency runway is only ${round(runwayMonths, 1)} months. Keep building until it reaches at least ${inputs.emergencyMonths} months.`)
  } else {
    reasons.push(`Emergency runway already covers about ${round(runwayMonths, 1)} months, which gives the business more resilience.`)
  }

  return {
    annualRevenue,
    annualTax,
    taxReserveMonthly,
    opsReserveMonthly,
    emergencyTarget,
    emergencyContribution,
    suggestedOwnerPay,
    runwayMonths,
    healthScore,
    reasons,
  }
}

export default function FreelanceTaxPlanner() {
  const { colors } = useTheme()
  const [averageMonthlyRevenue, setAverageMonthlyRevenue] = useState(450000)
  const [monthlyBusinessCosts, setMonthlyBusinessCosts] = useState(70000)
  const [monthlyHomeCosts, setMonthlyHomeCosts] = useState(180000)
  const [reservePct, setReservePct] = useState(15)
  const [emergencyMonths, setEmergencyMonths] = useState(6)
  const [currentEmergencyFund, setCurrentEmergencyFund] = useState(450000)
  const [buildMonths, setBuildMonths] = useState(12)

  const result = useMemo(() => planFreelanceReserves({
    averageMonthlyRevenue,
    monthlyBusinessCosts,
    monthlyHomeCosts,
    reservePct,
    emergencyMonths,
    currentEmergencyFund,
    buildMonths,
  }), [
    averageMonthlyRevenue,
    monthlyBusinessCosts,
    monthlyHomeCosts,
    reservePct,
    emergencyMonths,
    currentEmergencyFund,
    buildMonths,
  ])

  const recommendation = result.healthScore >= 75
    ? 'Reserve plan looks healthy'
    : result.healthScore >= 58
      ? 'Tighten reserves before increasing spending'
      : 'Protect cash before scaling expenses'

  return (
    <ToolLayout toolId="freelance-tax-planner">
      <DecisionHero
        accent={ACCENT}
        title="Freelance Tax and Reserve Planner"
        eyebrow="Decision system"
        description="Decide how much to pay yourself, how much to reserve for tax, and how much to hold back for unstable months. Built for Pakistan freelancers who need cash discipline, not vague advice."
        colors={colors}
      />
      <FreshnessBanner
        colors={colors}
        accent={ACCENT}
        lastUpdated="May 2026"
        cadence="Monthly for tax assumptions, quarterly for planning heuristics"
        refreshed="Current tax baseline and reserve-planning defaults"
        estimated="Actual freelancer filing treatment may differ based on business structure and documented expenses"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Freelance planning inputs" subtitle="These numbers should reflect your normal month, not your best month." accent={ACCENT} colors={colors}>
          <FieldsGrid>
            <Field label="Average monthly revenue (PKR)">
              <NumberInput colors={colors} value={averageMonthlyRevenue} onChange={(e) => setAverageMonthlyRevenue(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly business costs (PKR)">
              <NumberInput colors={colors} value={monthlyBusinessCosts} onChange={(e) => setMonthlyBusinessCosts(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly home / family costs (PKR)">
              <NumberInput colors={colors} value={monthlyHomeCosts} onChange={(e) => setMonthlyHomeCosts(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Operating reserve target">
              <SliderInput colors={colors} accent={ACCENT} value={reservePct} onChange={(e) => setReservePct(Number(e.target.value))} min={5} max={30} suffix="%" />
            </Field>
            <Field label="Emergency runway target">
              <SliderInput colors={colors} accent={ACCENT} value={emergencyMonths} onChange={(e) => setEmergencyMonths(Number(e.target.value))} min={3} max={12} suffix=" months" />
            </Field>
            <Field label="Current emergency fund (PKR)">
              <NumberInput colors={colors} value={currentEmergencyFund} onChange={(e) => setCurrentEmergencyFund(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Months to build reserves">
              <SliderInput colors={colors} accent={ACCENT} value={buildMonths} onChange={(e) => setBuildMonths(Number(e.target.value))} min={3} max={24} suffix=" months" />
            </Field>
          </FieldsGrid>
        </SectionCard>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.healthScore >= 75 ? '#22c55e' : result.healthScore >= 58 ? '#f59e0b' : '#ef4444'}
            title={recommendation}
            body={result.reasons[0]}
            confidence={Math.max(0.55, Math.min(0.92, result.healthScore / 100))}
            colors={colors}
          />
          <MetricGrid>
            <MetricCard label="Monthly tax reserve" value={fmtCurrency(result.taxReserveMonthly)} sub={`Approx annual tax: ${fmtCurrency(result.annualTax)}`} accent="#ef4444" colors={colors} />
            <MetricCard label="Operating reserve" value={fmtCurrency(result.opsReserveMonthly)} sub={`${reservePct}% of average monthly revenue`} accent="#06b6d4" colors={colors} />
            <MetricCard label="Emergency top-up" value={fmtCurrency(result.emergencyContribution)} sub={`To reach ${emergencyMonths} months of runway over ${buildMonths} months.`} accent="#8b5cf6" colors={colors} />
            <MetricCard label="Suggested owner pay" value={fmtCurrency(result.suggestedOwnerPay)} sub={`Current runway: ${round(result.runwayMonths, 1)} months`} accent={ACCENT} colors={colors} />
          </MetricGrid>

          <SectionCard title="Reserve logic" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
          </SectionCard>

          <SectionCard title="Financial health score" subtitle="A balanced planner protects tax, operations, and personal runway together." accent={ACCENT} colors={colors}>
            <ScoreBars scores={{ 'Reserve health': result.healthScore }} colors={colors} />
          </SectionCard>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DisclaimerBlock
          type="tax"
          overrideBodyEn="Freelancers may be taxed differently depending on filing structure, declared expenses, and business setup. Use this for reserve planning and cash discipline, then confirm final treatment with your tax adviser."
        />
      </div>
    </ToolLayout>
  )
}
