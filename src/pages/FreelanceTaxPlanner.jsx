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
  const stressRevenue = inputs.averageMonthlyRevenue * 0.8
  const stressOwnerPay = Math.max(
    0,
    stressRevenue - inputs.monthlyBusinessCosts - taxReserveMonthly - opsReserveMonthly - emergencyContribution,
  )
  const strongerReservePct = Math.min(25, inputs.reservePct + 5)
  const strongerOpsReserve = inputs.averageMonthlyRevenue * (strongerReservePct / 100)
  const fasterBuildMonths = Math.max(3, inputs.buildMonths - 3)
  const fasterEmergencyContribution = Math.max(0, emergencyTarget - inputs.currentEmergencyFund) / Math.max(1, fasterBuildMonths)

  const healthScore = weightedScore(
    {
      reserve: Math.min(100, (opsReserveMonthly / Math.max(1, inputs.averageMonthlyRevenue * 0.15)) * 100),
      tax: Math.min(100, (taxReserveMonthly / Math.max(1, annualTax / 12)) * 100),
      runway: Math.min(100, (runwayMonths / inputs.emergencyMonths) * 100),
    },
    { reserve: 0.35, tax: 0.35, runway: 0.3 },
  )

  let decisionTitle = 'Protect your tax and runway before lifestyle inflation'
  let decisionBody = 'Freelance income only becomes truly usable after you separate taxes, operating reserve, and household runway from the top line.'
  let decisionTrack = 'This planner is strongest when it changes behavior, not just when it produces a neat reserve number.'
  const actionSteps = []

  if (healthScore >= 75) {
    decisionTitle = 'Your reserve structure looks healthy'
    decisionBody = 'You have a workable balance between tax reserve, business reserve, and personal runway. That creates room to grow more safely.'
    decisionTrack = 'The next discipline is staying consistent when a few strong months make overspending feel harmless.'
    actionSteps.push('Keep the reserve rule active even in unusually good months.')
    actionSteps.push('Raise owner pay only after reserve targets stay healthy for several months in a row.')
    actionSteps.push('Review tax assumptions again if your revenue mix or filing structure changes.')
  } else if (healthScore >= 58) {
    decisionTitle = 'The business is workable, but reserves are still thin'
    decisionBody = 'You are not in danger yet, but your current setup is more exposed to delayed clients, tax shock, or one weak quarter than it should be.'
    decisionTrack = 'The most important move now is not growth spending. It is reserve discipline.'
    actionSteps.push('Protect tax reserve before increasing personal withdrawals.')
    actionSteps.push('Bring runway closer to the target before adding large new fixed costs.')
    actionSteps.push('Use a separate account or wallet for tax and reserve buckets so the money does not blur together.')
  } else {
    decisionTitle = 'Cash protection should come before expansion'
    decisionBody = 'Right now the business is too exposed to revenue volatility or year-end tax shock. Acting as if all inflow is spendable will keep pressure high.'
    decisionTrack = 'Your next step is to stabilize owner pay and reserves, not to optimize for growth optics.'
    actionSteps.push('Cut owner withdrawals until tax and emergency buffers stop being fragile.')
    actionSteps.push('Delay discretionary business spending if it weakens runway further.')
    actionSteps.push('If income is volatile, use the 80% stress case as the more honest planning baseline.')
  }

  const sensitivity = [
    {
      label: 'If revenue drops 20% for a rough month',
      impact: fmtCurrency(stressOwnerPay),
      detail: 'This is the owner pay left if a normal month weakens materially but reserve discipline stays intact.',
      tone: stressOwnerPay > 0 ? '#f59e0b' : '#ef4444',
    },
    {
      label: `If operating reserve rises to ${strongerReservePct}%`,
      impact: fmtCurrency(strongerOpsReserve),
      detail: 'A stronger operating reserve improves resilience but reduces immediate owner pay.',
      tone: '#06b6d4',
    },
    {
      label: `If you build the runway in ${fasterBuildMonths} months`,
      impact: fmtCurrency(fasterEmergencyContribution),
      detail: 'Faster reserve building increases near-term pressure but reduces long-term fragility sooner.',
      tone: '#0ea5e9',
    },
  ]

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
    decisionTitle,
    decisionBody,
    decisionTrack,
    actionSteps,
    sensitivity,
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
      <PakistanFriendlyGuide toolId="freelance-tax-planner" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Freelance planning inputs" subtitle="These numbers should reflect your normal month, not your best month." accent={ACCENT} colors={colors}>
          <FieldsGrid>
            <Field label="Average monthly revenue (PKR)" hint="Use a normal sustainable month, not your best month or your most recent lucky month.">
              <NumberInput colors={colors} value={averageMonthlyRevenue} onChange={(e) => setAverageMonthlyRevenue(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly business costs (PKR)" hint="Include tools, subscriptions, contractors, ads, coworking, and any recurring business spend.">
              <NumberInput colors={colors} value={monthlyBusinessCosts} onChange={(e) => setMonthlyBusinessCosts(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Monthly home / family costs (PKR)" hint="This should reflect the amount your household actually needs to stay stable.">
              <NumberInput colors={colors} value={monthlyHomeCosts} onChange={(e) => setMonthlyHomeCosts(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Operating reserve target" hint="Higher volatility usually means you should lean toward the upper end.">
              <SliderInput colors={colors} accent={ACCENT} value={reservePct} onChange={(e) => setReservePct(Number(e.target.value))} min={5} max={30} suffix="%" />
            </Field>
            <Field label="Emergency runway target" hint="Six months is a strong baseline; unstable client mixes may justify more.">
              <SliderInput colors={colors} accent={ACCENT} value={emergencyMonths} onChange={(e) => setEmergencyMonths(Number(e.target.value))} min={3} max={12} suffix=" months" />
            </Field>
            <Field label="Current emergency fund (PKR)" hint="Count only real liquid reserve, not money already mentally spent elsewhere.">
              <NumberInput colors={colors} value={currentEmergencyFund} onChange={(e) => setCurrentEmergencyFund(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Months to build reserves" hint="Shorter build windows increase pressure now but reduce fragility sooner.">
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
          <ActionCallout
            title="What you should do next"
            body={result.decisionTrack}
            accent={result.healthScore >= 75 ? '#22c55e' : result.healthScore >= 58 ? '#f59e0b' : '#ef4444'}
            colors={colors}
            actions={result.actionSteps.slice(0, 3)}
          />
          <MetricGrid>
            <MetricCard label="Monthly tax reserve" value={fmtCurrency(result.taxReserveMonthly)} sub={`Approx annual tax: ${fmtCurrency(result.annualTax)}`} accent="#ef4444" colors={colors} />
            <MetricCard label="Operating reserve" value={fmtCurrency(result.opsReserveMonthly)} sub={`${reservePct}% of average monthly revenue`} accent="#06b6d4" colors={colors} />
            <MetricCard label="Emergency top-up" value={fmtCurrency(result.emergencyContribution)} sub={`To reach ${emergencyMonths} months of runway over ${buildMonths} months.`} accent="#0ea5e9" colors={colors} />
            <MetricCard label="Suggested owner pay" value={fmtCurrency(result.suggestedOwnerPay)} sub={`Current runway: ${round(result.runwayMonths, 1)} months`} accent={ACCENT} colors={colors} />
          </MetricGrid>

          <SectionCard title="Decision path" subtitle={result.decisionTrack} accent={ACCENT} colors={colors}>
            <div style={{ color: colors.text, fontSize: '1.02rem', fontWeight: 700 }}>{result.decisionTitle}</div>
            <p style={{ margin: 0, color: colors.textSecondary, lineHeight: 1.65 }}>{result.decisionBody}</p>
            <BulletList items={result.actionSteps} colors={colors} />
          </SectionCard>

          <CollapsibleSection
            title="Reserve logic"
            summary="Open this if you want to see why the reserve structure ended up where it did."
            colors={colors}
          >
            <BulletList items={result.reasons} colors={colors} />
          </CollapsibleSection>

          <SectionCard title="Pressure-test the plan" subtitle="These checks show how sensitive your cash discipline is to a rougher month or stricter reserve policy." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <CollapsibleSection
            title="Financial health score"
            summary="Open this if you want the reserve-health signal without relying only on the headline recommendation."
            colors={colors}
          >
            <ScoreBars scores={{ 'Reserve health': result.healthScore }} colors={colors} />
          </CollapsibleSection>
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

