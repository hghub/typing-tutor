import { useToolLanguage } from '../hooks/useToolLanguage'
import { UrduReserveView } from '../components/UrduToolViews'
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DecisionHero, SectionCard, FieldsGrid, Field, NumberInput, MetricGrid, MetricCard } from '../components/decision/DecisionBlocks'
import { planFreelanceReserves } from '../lib/freelanceReserves'
import './FreelanceTaxPlanner.css'

const ACCENT = '#f97316'
const fmt = n => `PKR ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(n)}`
const FIELDS = [
  ['averageMonthlyRevenue', 'Monthly cash collected (PKR)', 'Use sustainable receipts, not unpaid invoices or your best month.'],
  ['monthlyBusinessCosts', 'Monthly business cash costs (PKR)', 'Include recurring operating payments; tax deductibility is not assessed.'],
  ['monthlyHomeCosts', 'Monthly household cash need (PKR)', 'Used to compare owner withdrawals and calculate household runway.'],
  ['annualTaxBudget', 'Annual tax cash budget to fund (PKR)', 'Required: enter a separately assessed tax funding amount. Account for amounts already paid or withheld with your adviser. Enter 0 explicitly only if that is your chosen budget.'],
  ['reservePct', 'Operating reserve allocation (%)', 'Your scenario choice, not a recommended universal percentage.'],
  ['emergencyMonths', 'Household runway target (months)', 'Your chosen target; business continuity needs may require a separate fund.'],
  ['currentEmergencyFund', 'Current uncommitted household reserve (PKR)', 'Exclude money already allocated to tax, business payments or other obligations.'],
  ['buildMonths', 'Months to build the household reserve', 'The monthly top-up spreads the remaining target over this period.'],
]

export default function FreelanceTaxPlanner() {
  const { colors } = useTheme()
  const { isUrdu } = useToolLanguage()
  const [inputs, setInputs] = useState({ averageMonthlyRevenue: '450000', monthlyBusinessCosts: '70000', monthlyHomeCosts: '180000', annualTaxBudget: '', reservePct: '15', emergencyMonths: '6', currentEmergencyFund: '450000', buildMonths: '12' })
  let result, error
  const needsTaxBudget = inputs.annualTaxBudget === ''
  try {
    if (!needsTaxBudget) result = planFreelanceReserves(Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value === '' ? NaN : Number(value)])))
  } catch (e) { error = e.message }
  if (isUrdu) return <ToolLayout toolId="freelance-tax-planner"><UrduReserveView {...{ colors, inputs, setInputs, result, error, needsTaxBudget }} /></ToolLayout>
  return (
    <ToolLayout toolId="freelance-tax-planner">
      <DecisionHero accent={ACCENT} colors={colors} title="Freelance Tax Budget and Reserve Planner" eyebrow="Cash-flow scenario · no salary-tax assumption"
        description="Separate business costs, an explicitly entered tax budget, operating reserves and household runway before deciding what you can withdraw." />
      <p style={{ marginBottom: '1rem' }}>Starts with illustrative cash-flow inputs. Enter your own tax budget to calculate results. This tool does not determine freelance tax liability or apply salary-tax slabs. Calculations stay in page memory.</p>
      <div className="freelance-reserve-layout">
        <SectionCard title="Cash-flow assumptions" colors={colors} accent={ACCENT}>
          <FieldsGrid>{FIELDS.map(([key, label, hint]) => <Field key={key} label={label} hint={hint}>
            <NumberInput colors={colors} min={key === 'buildMonths' ? 1 : 0} max={key === 'reservePct' ? 100 : key === 'emergencyMonths' ? 24 : key === 'buildMonths' ? 120 : 1e9} step="any" value={inputs[key]} placeholder={key === 'annualTaxBudget' ? 'Enter your assessed funding budget' : undefined} onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))} />
          </Field>)}</FieldsGrid>
        </SectionCard>
        <SectionCard title="Monthly allocation scenario" colors={colors} accent={ACCENT}>
          {needsTaxBudget ? <p role="status">Enter an annual tax cash budget first. No tax rate or zero-tax assumption has been selected for you.</p> : error ? <p role="alert" style={{ color: ACCENT }}>{error}</p> : <>
            <MetricGrid>
              <MetricCard colors={colors} accent="#06b6d4" label="Monthly tax funding" value={fmt(result.taxReserveMonthly)} sub="Entered annual tax budget ÷ 12; not calculated tax liability" />
              <MetricCard colors={colors} accent="#14b8a6" label="Operating reserve" value={fmt(result.opsReserveMonthly)} sub={`${inputs.reservePct}% of baseline cash collected`} />
              <MetricCard colors={colors} accent="#0ea5e9" label="Household reserve top-up" value={fmt(result.emergencyContribution)} sub={`Target fund: ${fmt(result.emergencyTarget)}`} />
              <MetricCard colors={colors} accent={ACCENT} label="Cash left for owner withdrawals" value={fmt(result.ownerPay)} sub="After business costs and these allocations; other obligations are not modelled" />
            </MetricGrid>
            {result.deficit > 0 && <p role="status">Allocation shortfall: <strong>{fmt(result.deficit)}/month</strong>. Zero owner withdrawals does not fund the full plan; revise costs, targets or income assumptions.</p>}
            {result.householdGap > 0 && <p>Owner-withdrawal capacity is <strong>{fmt(result.householdGap)}</strong> below your entered monthly household need.</p>}
            <p>Current household runway: {result.runwayMonths === null ? 'not calculated because household costs are zero' : `${result.runwayMonths.toFixed(1)} months at the entered household costs`}. This is not a business-survival prediction.</p>
            <details><summary>Show the allocation</summary><p>Monthly tax funding = annual budget ÷ 12. Operating reserve = receipts × chosen percentage. Household target = monthly household costs × target months. Monthly top-up = max(0, target − existing fund) ÷ build months. Owner cash = max(0, receipts − business costs − these allocations); any negative balance is reported separately.</p></details>
            <h3>What if receipts drop 20%?</h3>
            <p>Keeping business costs and all baseline reserve allocations fixed leaves <strong>{fmt(result.stressOwnerPay)}</strong> for owner withdrawals and an allocation shortfall of <strong>{fmt(result.stressDeficit)}</strong>. This is a cash stress scenario, not a tax recalculation or probability forecast.</p>
          </>}
        </SectionCard>
      </div>
      <SectionCard title="Keep the tax assessment separate" colors={colors} accent={ACCENT}>
        <p>Confirm the applicable income category, earning period, payments already made and funding dates with your tax adviser. Reserve money is a cash allocation, not an expense deduction or evidence that tax is fully paid. This tool does not calculate tax on revenue, profit, exports or salary.</p>
        <p>The twelve-month split does not reproduce statutory instalment or filing deadlines. Adjust your actual cash plan for payments due sooner, seasonal receipts and changes in circumstances. No confidence score, tax-saving claim or statutory freelancer rate is implied.</p>
        <p>Official Pakistan tax texts: <a href="https://fbr.gov.pk/Categ/Income-Tax-Ordinance/326" target="_blank" rel="noopener noreferrer">FBR Income Tax Ordinance collection</a>. Reference index checked 16 November 2026; it lists a consolidation through 30 June 2026. Check applicable amendments for your own earning period.</p>
        <a href="/blog/decision-support/how-much-tax-should-freelancers-reserve-in-pakistan">Read the freelance reserve guide →</a>
      </SectionCard>
    </ToolLayout>
  )
}
