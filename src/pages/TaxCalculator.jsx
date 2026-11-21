import { useToolLanguage } from '../hooks/useToolLanguage'
import { UrduTaxView } from '../components/UrduToolViews'
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DecisionHero, SectionCard, FieldsGrid, Field, NumberInput, SelectInput, MetricGrid, MetricCard } from '../components/decision/DecisionBlocks'
import { estimateSalaryTax, SALARY_YEARS, SALARY_TAX_SOURCE, SALARY_TAX_VERIFIED } from '../lib/salaryTax'
import './TaxCalculator.css'

const ACCENT = '#f97316'
const fmt = n => new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(n)
const pct = n => `${(n * 100).toFixed(2)}%`

export default function TaxCalculator() {
  const { colors } = useTheme()
  const { isUrdu } = useToolLanguage()
  const [year, setYear] = useState(2027)
  const [salary, setSalary] = useState('')
  const [bonus, setBonus] = useState('')
  const rules = SALARY_YEARS[year]
  let result, error
  const monthly = salary === '' ? 0 : Number(salary)
  const extra = bonus === '' ? 0 : Number(bonus)
  const annual = monthly * 12 + extra
  try {
    if (!Number.isFinite(monthly) || monthly < 0 || !Number.isFinite(extra) || extra < 0) throw new RangeError('Salary and bonus must be valid non-negative numbers.')
    result = estimateSalaryTax(annual, year)
  } catch (e) { error = e.message }
  const previous = result && year === 2027 ? estimateSalaryTax(annual, 2026) : null
  if (isUrdu) return <ToolLayout toolId="tax-calculator"><UrduTaxView {...{ colors, year, setYear, salary, setSalary, bonus, setBonus, result, previous, annual, error, rules }} source={SALARY_TAX_SOURCE} verified={SALARY_TAX_VERIFIED} /></ToolLayout>
  return (
    <ToolLayout toolId="tax-calculator">
      <DecisionHero colors={colors} accent={ACCENT} eyebrow="Pakistan · salary-only estimate"
        title="How much salary tax should you budget?"
        description="Choose the income period, enter taxable salary and bonus, and see the annual tax and average monthly amount before personal credits or adjustments." />
      <div className="salary-tax-layout">
        <SectionCard colors={colors} accent={ACCENT} title="Income and tax year">
          <Field label="Tax year" hint="Use the year for when the income was earned, not when you open this page.">
            <SelectInput colors={colors} value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2027, 2026].map(y => <option key={y} value={y}>{SALARY_YEARS[y].label}</option>)}
            </SelectInput>
          </Field>
          <p>{rules.period} · {rules.act}</p>
          <FieldsGrid>
            <Field label="Monthly taxable salary (PKR)" hint="Assumes the same monthly amount for all 12 months. Exclude exempt amounts only after checking eligibility.">
              <NumberInput colors={colors} min={0} max={100000000 / 12} step="any" placeholder="e.g. 250000" value={salary} onChange={e => setSalary(e.target.value)} />
            </Field>
            <Field label="Additional taxable annual bonus (PKR)" hint="Leave blank for zero. Do not include a bonus twice.">
              <NumberInput colors={colors} min={0} max={100000000} step="any" placeholder="e.g. 100000" value={bonus} onChange={e => setBonus(e.target.value)} />
            </Field>
          </FieldsGrid>
          <p>Use this version when the income entered is entirely taxable salary. Business, freelance, mixed-income and special-regime cases require a separate calculation.</p>
          <p>Your inputs stay in this page's memory. This calculator does not submit a return or send salary details to a database.</p>
        </SectionCard>
        <SectionCard colors={colors} accent={ACCENT} title={`Estimate · ${rules.label}`}>
          {error ? <p role="alert" style={{ color: ACCENT }}>{error}</p> : salary === '' && bonus === '' ? <p>Enter salary or a bonus to see your estimate.</p> : <>
            <MetricGrid>
              <MetricCard colors={colors} accent={ACCENT} label="Annual income tax" value={`PKR ${fmt(result.tax)}`} sub="Before credits, rebates, withholding adjustments and other deductions" />
              <MetricCard colors={colors} accent="#06b6d4" label="Average monthly tax" value={`PKR ${fmt(result.averageMonthlyTax)}`} sub="Annual tax ÷ 12; actual payroll deductions can differ" />
              <MetricCard colors={colors} accent="#14b8a6" label="Average after-tax income" value={`PKR ${fmt(result.annualNet / 12)}`} sub="Includes annual bonus spread over 12 months; excludes EOBI and other payroll deductions" />
            </MetricGrid>
            <p>Annual taxable salary: <strong>PKR {fmt(annual)}</strong>. Effective rate: {pct(result.effectiveRate)}. Marginal slab rate: {pct(result.marginalRate)}.</p>
            <details><summary>Show the calculation</summary>
              <p>Base tax = PKR {fmt(result.fixed)} + {pct(result.marginalRate)} × (PKR {fmt(annual)} − PKR {fmt(result.threshold)}) = PKR {fmt(result.baseTax)}.</p>
              <p>Salary surcharge: PKR {fmt(result.surcharge)}. {year === 2027 ? 'The 9% salaried surcharge was withdrawn by Finance Act 2026.' : 'For this historical year, 9% of base tax applies when annual taxable salary exceeds PKR 10 million.'}</p>
            </details>
            {previous && <p>The same income under TY 2026 rules: PKR {fmt(previous.tax)} tax before credits. Difference: PKR {fmt(previous.tax - result.tax)} less under TY 2027 rules. This compares rules on identical income, not your actual year-to-year payslips.</p>}
          </>}
        </SectionCard>
      </div>
      <SectionCard colors={colors} accent={ACCENT} title={`Salary slabs · ${rules.label}`}>
        <div className="salary-tax-table" tabIndex={0} role="region" aria-label="Salary tax slab table, scroll horizontally if needed">
          <table><thead><tr><th scope="col">Annual taxable salary (PKR)</th><th scope="col">Tax calculation</th></tr></thead>
            <tbody>{rules.slabs.map(([upper, lower, fixed, rate]) => <tr key={upper}>
              <td>{lower === 0 ? `Up to ${fmt(upper)}` : upper === Infinity ? `Above ${fmt(lower)}` : `Above ${fmt(lower)} to ${fmt(upper)}`}</td>
              <td>{rate === 0 ? '0' : `${fmt(fixed)} + ${pct(rate)} of the amount above ${fmt(lower)}`}</td>
            </tr>)}</tbody></table>
        </div>
        <p>A higher slab rate applies to the amount above its threshold. Crossing a slab does not apply that rate to your entire salary.</p>
      </SectionCard>
      <SectionCard colors={colors} accent={ACCENT} title="Check the scope before relying on the result">
        <p>This is a base salary-tax estimate. Personal credits, senior/teacher concessions, pension and donation eligibility, exempt allowances, tax already paid, special regimes and payroll adjustments are not applied. Do not treat an unavailable credit as a current entitlement. Annual taxable income above PKR 100 million is outside this calculator's scope.</p>
        <p>FY 2026–27 rules were checked on {SALARY_TAX_VERIFIED} against <a href={SALARY_TAX_SOURCE} target="_blank" rel="noopener noreferrer">FBR Circular 02 of 2026–27</a>, dated 8 September 2026, page 4, items 7–8. Historical rules: <a href="https://download1.fbr.gov.pk/Docs/2025881983148210Income-Tax-Ordinance%2C-2001-Amended-upto-31.07.2025.pdf" target="_blank" rel="noopener noreferrer">FBR's July 2025 ordinance</a>. The law and your circumstances govern the final liability.</p>
        <a href="/blog/decision-support/pakistan-income-tax-calculator">Read the salary-tax guide →</a>
        <p>Unofficial planning tool; not affiliated with or approved by FBR. Verify final filing and withholding with your payroll team or qualified tax adviser.</p>
      </SectionCard>
    </ToolLayout>
  )
}
