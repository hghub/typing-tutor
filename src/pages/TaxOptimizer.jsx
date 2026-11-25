import { useState } from 'react'
import { Link } from 'react-router-dom'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DecisionHero, SectionCard, FieldsGrid, Field, NumberInput, SelectInput, MetricGrid, MetricCard } from '../components/decision/DecisionBlocks'
import { downloadDemo } from '../lib/downloadDemo'
import { TAX_CREDIT_SOURCE, TAX_CREDIT_PERIOD, TAX_CREDIT_REVIEW, TAX_CREDIT_SAMPLE, planTaxCredit, taxCreditSummary } from '../lib/taxCredit'
import './TaxOptimizer.css'
const empty = { ...TAX_CREDIT_SAMPLE, taxableIncome: '', taxBeforeCredits: '', payment: '' }
const fmt = n => `PKR ${(n / 100).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export default function TaxOptimizer() {
  const { colors } = useTheme()
  const [input, setInput] = useState({ ...empty })
  const [status, setStatus] = useState('')
  const [synthetic, setSynthetic] = useState(false)
  let report, error
  try { report = planTaxCredit(input) } catch (e) { error = e.message }
  const update = (key, value) => { setStatus(''); setInput(prev => ({ ...prev, [key]: value, ...(['kind', 'relationship', 'payment'].includes(key) ? { eligibilityConfirmed: false } : {}), ...(['taxableIncome', 'taxBeforeCredits'].includes(key) ? { basisConfirmed: false } : {}) })) }
  async function copy() {
    try { await navigator.clipboard.writeText(taxCreditSummary(input, report)); setStatus('Scenario copied.') } catch { setStatus('Copy unavailable. Use Download scenario instead.') }
  }
  const accent = '#059669'
  return <ToolLayout toolId="tax-optimizer"><div className="tax-credit-planner" style={{ '--credit-card': colors.card, '--credit-border': colors.border, color: colors.text }}>
    <DecisionHero colors={colors} accent={accent} eyebrow="PAKISTAN · ONE CREDIT AT A TIME" title="Tax Credit Planner" description="Check the arithmetic for a reviewed pension contribution or qualifying donation. See the contribution limit and illustrative credit without an automatic investment recommendation." />
    <SectionCard colors={colors} accent={accent} title="Set the income period and evidence">
      <p><strong>{TAX_CREDIT_PERIOD}</strong>. This planner does not determine your tax year, taxable income, assessed tax or eligibility. Enter reviewed amounts for the same year. Special tax years, companies, AOP-member adjustments and other credits need a separate assessment.</p>
      <p>The former life-insurance allocation has been removed. The FBR consolidation amended through 30 June 2026 marks section 62 as omitted by Finance Act 2022. Historical footnotes reproduce the old provision; they do not restore it.</p>
      <div className="tax-credit-actions"><button type="button" onClick={() => { setInput({ ...TAX_CREDIT_SAMPLE }); setSynthetic(true); setStatus('Synthetic amounts loaded. Confirm assumptions separately to calculate.') }}>Load synthetic example</button><button type="button" onClick={() => { setInput({ ...empty }); setSynthetic(false); setStatus('Inputs cleared.') }}>Clear inputs</button></div>
      {synthetic && <p className="tax-credit-notice">Synthetic example amounts only. Checking a box below represents an example assumption; it does not verify a real taxpayer or claim.</p>}
      <FieldsGrid>
        <Field label="Credit scenario"><SelectInput colors={colors} value={input.kind} onChange={e => update('kind', e.target.value)}><option value="pension">Section 63 — approved pension contribution</option><option value="donation">Section 61 — qualifying cash donation</option></SelectInput></Field>
        {input.kind === 'donation' && <Field label="Recipient relationship"><SelectInput colors={colors} value={input.relationship} onChange={e => update('relationship', e.target.value)}><option value="unrelated">Non-associate recipient only</option><option value="associate">Associate recipient only</option><option value="mixed">Mixed or unknown — not modelled</option></SelectInput></Field>}
        <Field label="Taxable income B (PKR/year)" hint="Reviewed taxable income, not gross salary or total receipts."><NumberInput colors={colors} value={input.taxableIncome} min="0.01" max="100000000" step="0.01" onChange={e => update('taxableIncome', e.target.value)} /></Field>
        <Field label="Tax before Part X credits A (PKR/year)" hint="Reviewed assessed tax base for the selected credit, not tax already withheld or a refund balance."><NumberInput colors={colors} value={input.taxBeforeCredits} min="0" max="100000000" step="0.01" onChange={e => update('taxBeforeCredits', e.target.value)} /></Field>
        <Field label="Contribution or donation (PKR/year)" hint="Qualifying payment for the same year; enter 0 explicitly if none."><NumberInput colors={colors} value={input.payment} min="0" max="100000000" step="0.01" onChange={e => update('payment', e.target.value)} /></Field>
      </FieldsGrid>
      <label className="tax-credit-check"><input type="checkbox" checked={input.basisConfirmed} onChange={e => update('basisConfirmed', e.target.checked)} /><span>For this scenario, the income and pre-credit tax bases and normal tax year have been checked (or intentionally assumed for a synthetic example).</span></label>
      <div className="tax-credit-notice">{input.kind === 'pension' ? 'Section 63: confirm eligible-person status, qualifying salary/business income, an approved pension fund under the VPS Rules and payment in the year. Transfers of existing employment/annuity/occupational scheme balances do not qualify. The historical age uplift is not applied.' : 'Section 61: confirm the recipient qualifies under subsection (1), the relationship, payment year and evidence. The consolidated text requires cash donations to be paid by crossed cheque drawn on a bank. This version excludes other payment methods, non-cash property and mixed associate/non-associate donations.'}</div>
      <label className="tax-credit-check"><input type="checkbox" checked={input.eligibilityConfirmed} onChange={e => update('eligibilityConfirmed', e.target.checked)} /><span>I have checked the selected scenario's eligibility and evidence conditions, or am deliberately assuming them for a synthetic example. Rafiqy has not verified them.</span></label>
      <p>Inputs stay in this calculator's page memory and reset on reload. No taxpayer documents, names or identifiers are requested, saved or uploaded by this calculator. Feedback and other site features are separate.</p>
    </SectionCard>
    <SectionCard colors={colors} accent={accent} title="Inspect this one-credit scenario">
      {error ? <p role="alert">{error} Results and exports remain unavailable.</p> : <>
        <MetricGrid><MetricCard colors={colors} label="Illustrative credit" value={fmt(report.credit)} sub="(Reviewed tax A ÷ taxable income B) × capped payment C" /><MetricCard colors={colors} label="Tax after this one credit" value={fmt(report.taxAfter)} sub="Before other credits, withholding, payments and filing adjustments" /><MetricCard colors={colors} label="Cash committed" value={fmt(report.payment)} sub="Contribution/donation amount, not reduced by an assumed cash refund" /></MetricGrid>
        <p>Contribution cap: <strong>{report.capPct}% × B = {fmt(report.cap)}</strong>. Payment used in the formula C: <strong>{fmt(report.eligible)}</strong>. Payment above this model's cap: <strong>{fmt(report.excess)}</strong>.</p>
        <p>Arithmetic: ({fmt(report.tax)} ÷ {fmt(report.income)}) × {fmt(report.eligible)} = {fmt(report.credit)}. The contribution cap is rounded down and the credit rounded half-up to a paisa for this illustration, not prescribed return rounding.</p>
        <p>This is a credit calculation, not a deduction from taxable income. A contribution remains invested/committed money or a donation; tax reduction is not spendable cash, investment profit, a guaranteed refund or a reason to buy an unsuitable product. No optimal split is recommended. Section 65 generally excludes refund/carryforward of unused Part X credit, subject to its separate AOP-member provisions outside this tool.</p>
        <div className="tax-credit-actions"><button type="button" onClick={copy}>Copy scenario</button><button type="button" onClick={() => { downloadDemo('rafiqy-tax-credit-scenario.txt', taxCreditSummary(input, report)); setStatus('Scenario download requested.') }}>Download scenario</button></div>
      </>}
      <p role="status">{status}</p>
    </SectionCard>
    <SectionCard colors={colors} accent={accent} title={`Primary source checked ${TAX_CREDIT_REVIEW}`}>
      <p><a href={TAX_CREDIT_SOURCE} target="_blank" rel="noopener noreferrer">FBR Income Tax Ordinance — amended through 30 June 2026</a>: section 61 printed pages 120–121 (PDF 139–140), omission of section 62 printed page 122 (PDF 141), section 63 printed pages 123–124 (PDF 142–143), and section 65 printed pages 128–129 (PDF 147–148). These are consolidation and review dates, not a claim that all provisions first took effect in 2026. Check subsequent changes and your actual tax treatment before filing.</p>
      <p>The implemented contribution caps are 20% for section 63 and, for an individual in this single-recipient-category scenario, 30% for a non-associate donation or 15% for an associate donation under section 61. Those are limits on amount C, not percentages of tax saved. No section 62 insurance credit, Zakat deduction, housing, senior/teacher benefit, special-year treatment or combined-return calculation is provided.</p>
      <p><Link to="/blog/decision-support/how-tax-shield-optimizer-helps-you-see-what-actually-saves-tax">Read the credit calculation guide →</Link> · <Link to="/tools/tax-calculator">Separate salary base-tax estimate →</Link></p>
    </SectionCard>
  </div></ToolLayout>
}
