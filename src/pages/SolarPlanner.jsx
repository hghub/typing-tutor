import { useState } from 'react'
import './SolarPlanner.css'
import { Link } from 'react-router-dom'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DecisionHero, SectionCard, FieldsGrid, Field, NumberInput, SelectInput, MetricGrid, MetricCard } from '../components/decision/DecisionBlocks'
import { deleteSolarDraft, loadSolarDraft, saveSolarDraft } from '../lib/solarDraft'
import { downloadDemo } from '../lib/downloadDemo'
import { SOLAR_SAMPLE, planSolar, solarSummary } from '../lib/solarPlanner'
import { SOLAR_REVIEW_DATE, SOLAR_SOURCES, SOLAR_POLICY_NOTES } from '../data/solarPolicy'
const fields = [
  ['monthlyLoad', 'Monthly electricity use (kWh)', 'Use measured units, not bill amount divided by an assumed tariff.'],
  ['systemKw', 'Quoted PV capacity (kW)', 'A comparison input, not a roof or electrical design.'],
  ['sunHours', 'Daily peak sun hours', 'Illustrative until replaced with a site-specific seasonal yield estimate.'],
  ['deratePct', 'Output after losses (%)', 'Allow for heat, dust, wiring, inverter and other losses.'],
  ['selfUsePct', 'Generation used on site (%)', 'Hourly coincidence matters; monthly load only caps this estimate.'],
  ['importRate', 'Avoidable import energy charge (PKR/kWh)', 'Exclude fixed charges and other amounts that solar will not avoid.'],
  ['exportRate', 'Export credit rate (PKR/kWh)', 'No current rate supplied. Verify with your licensee; ignored in no-export mode.'],
  ['quote', 'PV installation quote (PKR)', 'Enter complete installed cost, including applicable taxes. Exclude the next two separate items.'],
  ['connectionCost', 'Additional approval / meter / connection cost (PKR)', 'Only costs not already included in the installation quote. Zero requires confirmation.'],
  ['batteryCost', 'Additional battery cost (PKR)', 'Only cost not already included. No automatic backup or extra savings assumed.'],
  ['annualMaintenance', 'Annual maintenance budget (PKR)', 'Held constant; include your expected servicing costs.'],
  ['degradationPct', 'Annual generation decline (%)', 'A user assumption, not an IEC guaranteed degradation rate.'],
  ['replacementYear', 'Replacement expense year (1–30)', 'Whole year; expense counted at year end.'],
  ['replacementCost', 'Replacement expense (PKR)', 'For example inverter/battery replacement; zero explicitly if excluded.'],
]
const fmt = n => Math.round(n).toLocaleString('en-PK')
export default function SolarPlanner() {
  const { colors } = useTheme()
  const [input, setInput] = useState({ ...SOLAR_SAMPLE })
  const [status, setStatus] = useState('')
  const [draftBusy, setDraftBusy] = useState(false)
  const [draftStatus, setDraftStatus] = useState('')
  async function manageDraft(action) {
    setDraftBusy(true)
    setDraftStatus('')
    try {
      if (action === 'save') {
        await saveSolarDraft(input)
        setDraftStatus('Draft saved in this browser.')
      } else if (action === 'load') {
        const draft = await loadSolarDraft()
        if (draft) {
          setInput(draft)
          setStatus('')
        }
        setDraftStatus(draft ? 'Draft reopened.' : 'No draft saved in this browser.')
      } else {
        await deleteSolarDraft()
        setDraftStatus('Saved draft deleted. Your current inputs are still open.')
      }
    } catch {
      setDraftStatus('Could not access the draft. Check browser storage settings and try again.')
    } finally {
      setDraftBusy(false)
    }
  }
  let report, error
  try { report = planSolar(input) } catch (e) { error = e.message }
  const update = (key, value) => { setStatus(''); setInput(prev => ({ ...prev, [key]: value })) }
  const accent = '#b97707'
  async function copy() {
    try { await navigator.clipboard.writeText(solarSummary(input, report)); setStatus('Scenario copied.') } catch { setStatus('Copy unavailable. Use Download scenario instead.') }
  }
  return <ToolLayout toolId="solar-planner"><div className="solar-planner" style={{ '--solar-border': colors.border, '--solar-card': colors.card, display: 'grid', gap: '1rem', minWidth: 0, overflowWrap: 'anywhere', color: colors.text }}>
    <DecisionHero colors={colors} accent={accent} eyebrow="PAKISTAN · QUOTE-BASED PLANNING" title="Compare solar costs with the electricity you can use" description="Separate avoided import charges, export credit and all entered upfront costs. Test your installer quote without treating an estimated saving as a guaranteed bill reduction." />
    <SectionCard colors={colors} accent={accent} title="Start with an illustrative scenario">
      <p>Every starting number is synthetic, including price, sunlight and tariff inputs. Replace it with evidence before using the result. The form starts with the example on each visit. Use the optional draft controls to reopen your own figures.</p>
      <button type="button" onClick={() => { setInput({ ...SOLAR_SAMPLE }); setStatus('Illustrative scenario restored.') }}>Reset illustrative scenario</button>
      <Field label="Export treatment"><SelectInput colors={colors} value={input.exportMode} onChange={e => update('exportMode', e.target.value)}><option value="none">No export value — surplus unvalued / curtailed</option><option value="net-billing">New net-billing estimate — verify export rate</option></SelectInput></Field>
      <p>Existing pre-9 February 2026 agreement? Confirm its protected billing terms and expiry with the licensee. Neither mode models legacy net metering. No-export value is a financial assumption, not permission to connect or bypass approval.</p>
      <FieldsGrid>{fields.map(([key, label, hint]) => <Field key={key} label={label} hint={hint}><NumberInput colors={colors} value={input[key]} min={['systemKw', 'sunHours'].includes(key) ? 0.1 : ['quote', 'replacementYear', 'deratePct'].includes(key) ? 1 : 0} step={key === 'replacementYear' ? 1 : 'any'} onChange={e => update(key, e.target.value)} /></Field>)}</FieldsGrid>
    </SectionCard>
    <SectionCard colors={colors} accent={accent} title="Draft on this device">
      <p>Save one scenario in this browser profile. Saving replaces the previous draft. Reopening replaces the form values. On a shared device, anyone using this profile can reopen the draft.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        <button type="button" disabled={draftBusy || !report} onClick={() => manageDraft('save')}>Save on this device</button>
        <button type="button" disabled={draftBusy} onClick={() => manageDraft('load')}>Reopen saved draft</button>
        <button type="button" disabled={draftBusy} onClick={() => manageDraft('delete')}>Delete saved draft</button>
      </div>
      <p role="status">{draftStatus}</p>
    </SectionCard>
    <SectionCard colors={colors} accent={accent} title="Scenario result">
      {error ? <p role="alert">{error} Results and exports are unavailable until inputs are valid.</p> : <>
        <MetricGrid><MetricCard colors={colors} label="Total entered upfront cost" value={`PKR ${fmt(report.upfront)}`} sub="PV quote + additional connection + additional battery" /><MetricCard colors={colors} label="First-year net benefit" value={`PKR ${fmt(report.firstYearNet)}`} sub="Annual energy value less maintenance and any year-one replacement" /><MetricCard colors={colors} label="Sustained cost recovery" value={report.recoveryYear ? `End of year ${report.recoveryYear}` : 'Not reached in 30 years'} sub="Nominal cumulative net stays nonnegative through year 30" /></MetricGrid>
        <p>Monthly generation: <strong>{fmt(report.generation)} kWh</strong>. Used on site: <strong>{fmt(report.selfUsed)} kWh</strong>. Exported: <strong>{fmt(report.exported)} kWh</strong>. Unvalued / curtailed surplus: <strong>{fmt(report.curtailed)} kWh</strong>.</p>
        <p>Avoided monthly energy charge: <strong>PKR {fmt(report.selfSavings)}</strong>. Separate estimated export credit: <strong>PKR {fmt(report.exportCredit)}</strong>. These are energy values, not a predicted final bill or guaranteed cash receipt.</p>
        <p>30-year nominal net after upfront costs: PKR {fmt(report.finalNet)}. One 30-day monthly load, sun and self-use pattern repeated for 12 months; generation declines annually. Maintenance and the selected replacement are deducted. No financing, discounting, inflation, future tariff changes or full electricity-bill calculation.</p>
        <p>Battery cost is included only as a cost. This model does not simulate charging losses, usable capacity, backup hours or an increase in self-consumption. Use a measured load profile and qualified design for those decisions.</p>
        <details><summary>Annual cashflow audit</summary><div style={{ overflowX: 'auto' }}><table><caption>PKR, nominal end-of-year totals</caption><thead><tr><th>Year</th><th>Net benefit</th><th>Replacement included</th><th>Cumulative after upfront</th></tr></thead><tbody>{report.years.map(r => <tr key={r.year}><td>{r.year}</td><td>{fmt(r.net)}</td><td>{fmt(r.replacement)}</td><td>{fmt(r.cumulative)}</td></tr>)}</tbody></table></div></details>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}><button type="button" onClick={copy}>Copy scenario</button><button type="button" onClick={() => { downloadDemo('rafiqy-solar-scenario.txt', solarSummary(input, report)); setStatus('Scenario download requested.') }}>Download scenario</button></div>
      </>}
      <p role="status">{status}</p>
    </SectionCard>
    <SectionCard colors={colors} accent={accent} title={`Policy context reviewed ${SOLAR_REVIEW_DATE}`}>
      {SOLAR_POLICY_NOTES.map(note => <p key={note}>{note}</p>)}
      <p>No live tariff, market price, tax rate, installer ranking or approval guarantee is supplied. Check the applicable agreement, sanctioned load, site constraints and written connection estimate before purchase.</p>
      <ul>{SOLAR_SOURCES.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
      <Link to="/blog/decision-support/solar-planner-pakistan">Read the solar planning guide →</Link>
    </SectionCard>
  </div></ToolLayout>
}
