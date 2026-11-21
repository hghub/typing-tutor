import { useToolLanguage } from '../hooks/useToolLanguage'
import { UrduRentView } from '../components/UrduToolViews'
import { useMemo, useState } from 'react'
import './RentVsBuyPakistan.css'
import ToolLayout from '../components/ToolLayout'
import DisclaimerBlock from '../components/DisclaimerBlock'
import { useTheme } from '../hooks/useTheme'
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
import { fmtCurrency } from '../lib/decision'
import { CITY_PRESETS, SCENARIO_PRESETS, rentVsBuyDecision } from '../lib/rentVsBuy'

const ACCENT = '#14b8a6'

export default function RentVsBuyPakistan() {
  const { colors } = useTheme()
  const { isUrdu } = useToolLanguage()
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

  const summaryText = isUrdu ? [
    'رفیقی: کرایہ یا خریداری کا خلاصہ',
    `مکان کی قیمت: ${fmtCurrency(propertyPrice)}؛ ماہانہ کرایہ: ${fmtCurrency(monthlyRent)}؛ قیام: ${yearsToStay} سال`,
    `ماڈل کا رجحان: ${result.recommendation === 'Buy' ? 'خریداری' : 'کرایہ'}`,
    `خریداری کی خالص متوقع لاگت: ${fmtCurrency(result.buyNetCost)}؛ کرایے کی خالص لاگت: ${fmtCurrency(result.rentNetCost)}`,
    `ماہانہ قسط: ${fmtCurrency(result.emi)}؛ ابتدائی ادائیگی: ${fmtCurrency(result.downPayment)}`,
    'اعداد مفروضوں پر مبنی ہیں؛ اصل ریٹ، فیس، نقد ذخیرہ، قیام اور قیمتوں کی غیر یقینی صورتِ حال الگ تصدیق کریں۔ یہ مالی مشورہ یا یقینی نتیجہ نہیں۔',
  ].join('\n') : [
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

  if (isUrdu) return <ToolLayout toolId="rent-vs-buy-pakistan"><UrduRentView {...{ colors, city, applyCity, applyScenario, result, copySummary, downloadSummary, copyState }} values={{ propertyPrice, monthlyRent, yearsToStay, downPaymentPct, annualMarkupRate, mortgageYears, annualRentGrowth, annualHomeGrowth, annualMaintenancePct, propertyTaxPct, transferCostPct, investmentReturnPct }} setters={{ propertyPrice: value => { markCustom(); setPropertyPrice(value) }, monthlyRent: value => { markCustom(); setMonthlyRent(value) }, yearsToStay: value => { markCustom(); setYearsToStay(value) }, downPaymentPct: value => { markCustom(); setDownPaymentPct(value) }, annualMarkupRate: value => { markCustom(); setAnnualMarkupRate(value) }, mortgageYears: value => { markCustom(); setMortgageYears(value) }, annualRentGrowth: value => { markCustom(); setAnnualRentGrowth(value) }, annualHomeGrowth: value => { markCustom(); setAnnualHomeGrowth(value) }, annualMaintenancePct: value => { markCustom(); setAnnualMaintenancePct(value) }, propertyTaxPct: value => { markCustom(); setPropertyTaxPct(value) }, transferCostPct: value => { markCustom(); setTransferCostPct(value) }, investmentReturnPct: value => { markCustom(); setInvestmentReturnPct(value) } }} /></ToolLayout>
  return (
    <ToolLayout toolId="rent-vs-buy-pakistan">
      <DecisionHero
        accent={ACCENT}
        title="Rent vs Buy Pakistan Analyzer"
        eyebrow="Decision system"
        description="Compare renting and buying with Pakistan-style assumptions: down payment, markup, transfer costs, rent growth, property appreciation, maintenance, and the opportunity cost of your capital."
        colors={colors}
      />
      <SectionCard title="Illustrative assumptions, not live market rates" accent={ACCENT} colors={colors}>
        <p style={{ margin: 0, lineHeight: 1.65 }}>Method and wording reviewed 17 November 2026. City presets are editable examples, not verified city averages, bank offers or current tax rates. Replace them with dated quotes and costs for your own property. No scheduled market-data refresh is connected.</p>
        <p style={{ marginBottom: 0, lineHeight: 1.65 }}>This simplified model invests a fixed, nonnegative first-year monthly cost gap. It does not adjust that contribution as rent rises or after the mortgage ends, fund rent-side deficits, or model investment tax and fees. Scores are heuristic weights, not probabilities. A break-even year is not calculated.</p>
        <a href="https://www.bankalfalah.com/personal-banking/loans/hybrid-home-finance/" target="_blank" rel="noopener noreferrer">Example lender product terms (not a rate feed)</a>
      </SectionCard>
      <PakistanFriendlyGuide toolId="rent-vs-buy-pakistan" />

      <div className="rent-buy-layout">
        <SectionCard title="Scenario inputs" subtitle="Start with an illustrative city example, then enter your own dated quotes and assumptions." accent={ACCENT} colors={colors}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text, fontWeight: 700, marginBottom: '0.55rem', fontSize: '0.88rem' }}>Start from an illustrative housing scenario</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.55rem' }}>
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
            <Field label="City preset" hint="Loads illustrative assumptions, not verified city rates. Replace every rate with your own evidence.">
              <SelectInput colors={colors} value={city} onChange={(e) => { markCustom(); applyCity(e.target.value) }}>
                {Object.entries(CITY_PRESETS).map(([value, preset]) => <option key={value} value={value}>{preset.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Property price (PKR)" hint="Enter the negotiated property price excluding transaction costs, which are modelled separately.">
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
                <Field label="Transfer + selling friction" hint="This same assumed percentage is charged on purchase price at entry and projected sale value at exit. It is not a statutory tax rate.">
                  <SliderInput colors={colors} accent={ACCENT} value={transferCostPct} onChange={(e) => { markCustom(); setTransferCostPct(Number(e.target.value)) }} min={3} max={10} step={0.25} suffix="%" />
                </Field>
              </FieldsGrid>
            </SectionCard>
        </SectionCard>

        <div className="rent-buy-results" style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.recommendation === 'Buy' ? '#22c55e' : '#06b6d4'}
            title={`${result.recommendation} looks stronger under the current assumptions`}
            body={result.reasons[0]}
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
            <MetricCard label="Owner upfront cash" value={fmtCurrency(result.downPayment)} sub="This is the cash that gets locked immediately before recurring costs." accent="#f59e0b" colors={colors} />
            <MetricCard label="Rent-side invested reserve" value={fmtCurrency(result.rentInvestedValue)} sub="Uses the fixed first-year monthly gap throughout; future returns are uncertain." accent="#14b8a6" colors={colors} />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.7rem' }}>
              {[
                { href: '/blog/decision-support/rent-vs-buy-calculator-pakistan-guide', label: 'Rent vs Buy Pakistan Guide', note: 'The full decision framework behind the tool' },
                { href: '/blog/decision-support/should-i-buy-a-house-or-keep-renting-in-pakistan', label: 'Should I Buy a House or Keep Renting?', note: 'A clean first-pass decision for primary residence' },
                { href: '/blog/decision-support/home-loan-vs-rent-in-pakistan', label: 'Home Loan vs Rent in Pakistan', note: 'Why EMI-only thinking is too shallow' },
                { href: '/blog/decision-support/how-long-should-you-stay-before-buying-a-house-in-pakistan', label: 'How Long Should You Stay Before Buying?', note: 'Use stay horizon to avoid the wrong purchase timing' },
                { href: '/blog/decision-support/what-down-payment-makes-buying-safer-in-pakistan', label: 'What Down Payment Makes Buying Safer?', note: 'Liquidity discipline before ownership' },
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

