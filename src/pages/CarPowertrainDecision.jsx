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
  ComparisonBars,
} from '../components/decision/DecisionBlocks'
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  annualToMonthly,
  costScoresFromTotals,
  weightedScore,
  confidenceFromGap,
  topTwoByLowest,
  round,
} from '../lib/decision'

const ACCENT = '#38bdf8'

const EV_BASELINES = {
  analysisYears: 5,
  fuelEfficiency: { petrol: 12, hybrid: 22 },
  evKmPerKwh: 6,
  maintenancePerYear: { petrol: 120000, hybrid: 150000, ev: 80000 },
  resaleFactor: { petrol: 0.55, hybrid: 0.6, ev: 0.5 },
}

const SCENARIO_PRESETS = [
  { id: 'city-commuter', label: 'City commuter', note: 'High city use, moderate daily km', values: { dailyKm: 45, cityDrivingRatio: 80, chargingAvailability: 'home_only', loadSheddingHours: 2 } },
  { id: 'high-mileage', label: 'High-mileage driver', note: 'Running cost matters most', values: { dailyKm: 90, cityDrivingRatio: 60, chargingAvailability: 'public_available', loadSheddingHours: 1 } },
  { id: 'second-car', label: 'Family second car', note: 'Lower usage, convenience matters', values: { dailyKm: 20, cityDrivingRatio: 85, chargingAvailability: 'home_only', loadSheddingHours: 2 } },
  { id: 'charging-constrained', label: 'Charging constrained', note: 'EV risk stays higher', values: { dailyKm: 40, cityDrivingRatio: 70, chargingAvailability: 'limited', loadSheddingHours: 4 } },
]

function carDecision(inputs) {
  const annualKm = (Number(inputs.dailyKm) || 0) * 365
  const fuelCosts = {
    petrol: (annualKm / EV_BASELINES.fuelEfficiency.petrol) * inputs.petrolPricePerLitre,
    hybrid: (annualKm / EV_BASELINES.fuelEfficiency.hybrid) * inputs.petrolPricePerLitre,
    ev: (annualKm / EV_BASELINES.evKmPerKwh) * inputs.electricityPricePerKwh,
  }
  const runningCosts = {
    petrol: (fuelCosts.petrol + EV_BASELINES.maintenancePerYear.petrol) * EV_BASELINES.analysisYears,
    hybrid: (fuelCosts.hybrid + EV_BASELINES.maintenancePerYear.hybrid) * EV_BASELINES.analysisYears,
    ev: (fuelCosts.ev + EV_BASELINES.maintenancePerYear.ev) * EV_BASELINES.analysisYears,
  }
  const baseTco = {
    petrol: inputs.carPricePetrol + runningCosts.petrol - inputs.carPricePetrol * EV_BASELINES.resaleFactor.petrol,
    hybrid: inputs.carPriceHybrid + runningCosts.hybrid - inputs.carPriceHybrid * EV_BASELINES.resaleFactor.hybrid,
    ev: inputs.carPriceEv + runningCosts.ev - inputs.carPriceEv * EV_BASELINES.resaleFactor.ev,
  }

  let adjustedEv = baseTco.ev
  if (inputs.chargingAvailability === 'limited') adjustedEv *= 1.15
  if (inputs.loadSheddingHours > 3) adjustedEv *= 1.1
  let adjustedHybrid = baseTco.hybrid
  if (inputs.cityDrivingRatio > 0.6) adjustedHybrid *= 0.95

  const tco = {
    petrol: round(baseTco.petrol),
    hybrid: round(adjustedHybrid),
    ev: round(adjustedEv),
  }

  const costScores = costScoresFromTotals(tco)
  const convenience = {
    petrol: 90,
    hybrid: 85,
    ev: inputs.chargingAvailability === 'public_available' ? 80 : inputs.chargingAvailability === 'home_only' ? 68 : 40,
  }
  const risk = {
    petrol: 84,
    hybrid: 72,
    ev: inputs.loadSheddingHours > 4 ? 45 : inputs.chargingAvailability === 'limited' ? 48 : 58,
  }
  const totalScores = {
    petrol: weightedScore({ cost: costScores.petrol, convenience: convenience.petrol, risk: risk.petrol }, { cost: 0.6, convenience: 0.25, risk: 0.15 }),
    hybrid: weightedScore({ cost: costScores.hybrid, convenience: convenience.hybrid, risk: risk.hybrid }, { cost: 0.6, convenience: 0.25, risk: 0.15 }),
    ev: weightedScore({ cost: costScores.ev, convenience: convenience.ev, risk: risk.ev }, { cost: 0.6, convenience: 0.25, risk: 0.15 }),
  }

  const [best, second] = topTwoByLowest(tco)
  let recommendation = best[0]
  if (recommendation === 'ev' && convenience.ev < 50) recommendation = 'hybrid'
  const confidence = confidenceFromGap(best[1], second[1])

  const monthlyCosts = {
    petrol: annualToMonthly(fuelCosts.petrol + EV_BASELINES.maintenancePerYear.petrol),
    hybrid: annualToMonthly(fuelCosts.hybrid + EV_BASELINES.maintenancePerYear.hybrid),
    ev: annualToMonthly(fuelCosts.ev + EV_BASELINES.maintenancePerYear.ev),
  }

  const higherPetrol = inputs.petrolPricePerLitre * 1.15
  const higherPetrolTco = {
    petrol: round(inputs.carPricePetrol + ((((annualKm / EV_BASELINES.fuelEfficiency.petrol) * higherPetrol) + EV_BASELINES.maintenancePerYear.petrol) * EV_BASELINES.analysisYears) - inputs.carPricePetrol * EV_BASELINES.resaleFactor.petrol),
    hybrid: round(inputs.carPriceHybrid + ((((annualKm / EV_BASELINES.fuelEfficiency.hybrid) * higherPetrol) + EV_BASELINES.maintenancePerYear.hybrid) * EV_BASELINES.analysisYears) - inputs.carPriceHybrid * EV_BASELINES.resaleFactor.hybrid),
  }

  const evWithBetterCharging = (() => {
    const betterBase = baseTco.ev
    const betterAdjusted = inputs.loadSheddingHours > 3 ? betterBase * 1.1 : betterBase
    return round(betterAdjusted)
  })()

  const higherDailyKm = Math.round((Number(inputs.dailyKm) || 0) * 1.5)
  const higherAnnualKm = higherDailyKm * 365
  const higherUsageTco = {
    petrol: round(inputs.carPricePetrol + ((((higherAnnualKm / EV_BASELINES.fuelEfficiency.petrol) * inputs.petrolPricePerLitre) + EV_BASELINES.maintenancePerYear.petrol) * EV_BASELINES.analysisYears) - inputs.carPricePetrol * EV_BASELINES.resaleFactor.petrol),
    hybrid: round(inputs.carPriceHybrid + ((((higherAnnualKm / EV_BASELINES.fuelEfficiency.hybrid) * inputs.petrolPricePerLitre) + EV_BASELINES.maintenancePerYear.hybrid) * EV_BASELINES.analysisYears) - inputs.carPriceHybrid * EV_BASELINES.resaleFactor.hybrid),
    ev: round((inputs.chargingAvailability === 'limited' ? baseTco.ev * 1.15 : baseTco.ev) + ((((higherAnnualKm - annualKm) / EV_BASELINES.evKmPerKwh) * inputs.electricityPricePerKwh) * EV_BASELINES.analysisYears)),
  }

  let decisionTitle = 'Compare the tradeoffs closely'
  let decisionBody = 'The lowest-cost option is not always the easiest ownership experience, so convenience and charging reality still matter.'
  let decisionTrack = 'Use this as a planning filter before narrowing down exact models.'
  const actionSteps = []

  if (recommendation === 'hybrid') {
    decisionTitle = 'Hybrid is the safer all-round decision today'
    decisionBody = 'Your scenario benefits from lower running cost than petrol without taking on the charging fragility of a full EV.'
    decisionTrack = 'This is usually the most robust answer when city driving is high but infrastructure confidence is not.'
    actionSteps.push('Compare a few hybrid models rather than forcing a petrol-or-EV binary.')
    actionSteps.push('Do not overpay a large premium if your daily kilometres are still modest.')
    actionSteps.push('If home charging improves later, rerun the case before your next upgrade cycle.')
  } else if (recommendation === 'ev') {
    decisionTitle = 'EV can work if your charging setup is truly dependable'
    decisionBody = 'Your numbers support EV ownership, but that win relies on consistent charging and a realistic view of convenience.'
    decisionTrack = 'This is a strong case only if you can actually live the charging routine you are assuming.'
    actionSteps.push('Price home-charging installation and backup reality, not just the vehicle sticker.')
    actionSteps.push('Stress-test the case against weaker resale assumptions before committing.')
    actionSteps.push('If load shedding worsens materially, hybrid may become the safer compromise.')
  } else {
    decisionTitle = 'Petrol still makes the most practical sense for now'
    decisionBody = 'Your current mileage, charging limitations, or vehicle-price premium do not justify moving away from petrol yet.'
    decisionTrack = 'This does not mean EV or hybrid are bad overall. It means they are not winning under your present use pattern.'
    actionSteps.push('Avoid paying a large upfront premium if your daily use is still light.')
    actionSteps.push('Watch fuel-price movement and rerun the scenario when your usage changes.')
    actionSteps.push('If you move to heavier city driving later, hybrid often becomes the first upgrade to test.')
  }

  const sensitivity = [
    {
      label: 'If petrol rises another 15%',
      impact: `Petrol ${fmtCurrency(higherPetrolTco.petrol)} · Hybrid ${fmtCurrency(higherPetrolTco.hybrid)}`,
      detail: 'Fuel-price pressure usually strengthens hybrid and EV relative to petrol.',
      tone: '#f59e0b',
    },
    {
      label: 'If EV charging becomes fully dependable',
      impact: `EV 5y TCO ${fmtCurrency(evWithBetterCharging)}`,
      detail: 'Better charging removes one of the biggest hidden penalties in the EV case.',
      tone: '#8b5cf6',
    },
    {
      label: `If driving jumps to ${higherDailyKm} km/day`,
      impact: `Petrol ${fmtCurrency(higherUsageTco.petrol)} · Hybrid ${fmtCurrency(higherUsageTco.hybrid)} · EV ${fmtCurrency(higherUsageTco.ev)}`,
      detail: 'Higher usage compounds running-cost differences much faster than most buyers expect.',
      tone: '#22c55e',
    },
  ]

  const reasons = []
  if (recommendation === 'hybrid') {
    reasons.push('Hybrid is the safest balance when city driving is high but charging reliability or load shedding weakens the EV case.')
  } else if (recommendation === 'ev') {
    reasons.push('EV wins only when energy cost savings remain strong and your charging setup is reliable enough to avoid convenience penalties.')
  } else {
    reasons.push('Petrol still wins when daily mileage is lower, EV charging is weak, or the upfront hybrid/EV price premium takes too long to recover.')
  }
  reasons.push(`5-year TCO range: Petrol ${fmtCurrency(tco.petrol)}, Hybrid ${fmtCurrency(tco.hybrid)}, EV ${fmtCurrency(tco.ev)}.`)
  reasons.push(`Estimated monthly running cost: Petrol ${fmtCurrency(monthlyCosts.petrol)}, Hybrid ${fmtCurrency(monthlyCosts.hybrid)}, EV ${fmtCurrency(monthlyCosts.ev)}.`)
  if (inputs.dailyKm < 20) reasons.push('Below roughly 20 km/day, the price premium for hybrid or EV often becomes harder to justify.')
  if (inputs.loadSheddingHours > 3) reasons.push('Higher load shedding reduces EV convenience and pushes the recommendation toward hybrid unless home charging remains dependable.')

  return {
    annualKm,
    tco,
    monthlyCosts,
    totalScores,
    recommendation,
    confidence,
    reasons,
    costScores,
    convenience,
    risk,
    decisionTitle,
    decisionBody,
    decisionTrack,
    actionSteps,
    sensitivity,
  }
}

export default function CarPowertrainDecision() {
  const { colors } = useTheme()
  const [scenarioPreset, setScenarioPreset] = useState('custom')
  const [copyState, setCopyState] = useState('idle')
  const [dailyKm, setDailyKm] = useState(40)
  const [cityDrivingRatio, setCityDrivingRatio] = useState(70)
  const [petrolPricePerLitre, setPetrolPricePerLitre] = useState(300)
  const [electricityPricePerKwh, setElectricityPricePerKwh] = useState(50)
  const [carPricePetrol, setCarPricePetrol] = useState(5000000)
  const [carPriceHybrid, setCarPriceHybrid] = useState(8000000)
  const [carPriceEv, setCarPriceEv] = useState(9000000)
  const [chargingAvailability, setChargingAvailability] = useState('home_only')
  const [loadSheddingHours, setLoadSheddingHours] = useState(2)

  function applyScenario(presetId) {
    const preset = SCENARIO_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    setScenarioPreset(presetId)
    setDailyKm(preset.values.dailyKm)
    setCityDrivingRatio(preset.values.cityDrivingRatio)
    setChargingAvailability(preset.values.chargingAvailability)
    setLoadSheddingHours(preset.values.loadSheddingHours)
  }

  function markCustom() {
    setScenarioPreset('custom')
  }

  const result = useMemo(() => carDecision({
    dailyKm,
    cityDrivingRatio: cityDrivingRatio / 100,
    petrolPricePerLitre,
    electricityPricePerKwh,
    carPricePetrol,
    carPriceHybrid,
    carPriceEv,
    chargingAvailability,
    loadSheddingHours,
  }), [
    dailyKm, cityDrivingRatio, petrolPricePerLitre, electricityPricePerKwh,
    carPricePetrol, carPriceHybrid, carPriceEv, chargingAvailability, loadSheddingHours,
  ])

  const displayName = result.recommendation === 'hybrid' ? 'Hybrid preferred' : result.recommendation === 'ev' ? 'EV preferred' : 'Petrol preferred'
  const summaryText = [
    'Rafiqy Petrol vs Hybrid vs EV Pakistan Summary',
    `Daily driving: ${dailyKm} km`,
    `City driving: ${cityDrivingRatio}%`,
    `Charging availability: ${chargingAvailability}`,
    `Load shedding: ${loadSheddingHours} hours/day`,
    `Recommendation: ${displayName}`,
    `Petrol 5y TCO: ${fmtCurrency(result.tco.petrol)}`,
    `Hybrid 5y TCO: ${fmtCurrency(result.tco.hybrid)}`,
    `EV 5y TCO: ${fmtCurrency(result.tco.ev)}`,
    `Decision path: ${result.decisionTitle}`,
    `Action steps: ${result.actionSteps.join(' | ')}`,
  ].join('\n')

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
    link.download = 'rafiqy-vehicle-decision-summary.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout toolId="car-powertrain-decision">
      <DecisionHero
        accent={ACCENT}
        title="Petrol vs Hybrid vs EV Pakistan"
        eyebrow="Decision system"
        description="Compare total cost of ownership, convenience, charging reality, and risk over five years. This is designed for Pakistan conditions, not generic global assumptions."
        colors={colors}
      />
      <FreshnessBanner
        colors={colors}
        accent={ACCENT}
        lastUpdated="May 2026"
        cadence="Monthly for fuel, electricity and maintenance assumptions"
        refreshed="Fuel price baseline, electricity tariff baseline, efficiency and maintenance defaults"
        estimated="Actual model-specific prices, resale, and charger installation costs may vary significantly"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: '1rem' }}>
        <SectionCard title="Ownership scenario" subtitle="Use your expected usage, local energy costs, and vehicle prices." accent={ACCENT} colors={colors}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text, fontWeight: 700, marginBottom: '0.55rem', fontSize: '0.88rem' }}>Start from a real-life driving pattern</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.55rem' }}>
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
            <Field label="Daily driving distance" hint="Use your normal weekly average. This is one of the biggest drivers of the result.">
              <SliderInput colors={colors} accent={ACCENT} value={dailyKm} onChange={(e) => { markCustom(); setDailyKm(Number(e.target.value)) }} min={5} max={120} suffix=" km" />
            </Field>
            <Field label="City driving ratio" hint="Higher city use usually strengthens hybrid and EV relative to petrol.">
              <SliderInput colors={colors} accent={ACCENT} value={cityDrivingRatio} onChange={(e) => { markCustom(); setCityDrivingRatio(Number(e.target.value)) }} min={10} max={95} suffix="%" />
            </Field>
            <Field label="Petrol price per litre (PKR)" hint="Use current local pump pricing, then pressure-test with a higher fuel scenario.">
              <NumberInput colors={colors} value={petrolPricePerLitre} onChange={(e) => { markCustom(); setPetrolPricePerLitre(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Electricity price per kWh (PKR)" hint="Use your effective at-home charging rate, not a best-case off-peak fantasy unless you really have it.">
              <NumberInput colors={colors} value={electricityPricePerKwh} onChange={(e) => { markCustom(); setElectricityPricePerKwh(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Petrol car price (PKR)" hint="Use the actual model price you would pay, including normal delivery premium if relevant.">
              <NumberInput colors={colors} value={carPricePetrol} onChange={(e) => { markCustom(); setCarPricePetrol(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Hybrid car price (PKR)" hint="Compare like-for-like segment vehicles as closely as possible.">
              <NumberInput colors={colors} value={carPriceHybrid} onChange={(e) => { markCustom(); setCarPriceHybrid(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="EV price (PKR)" hint="If home charger install is extra, include it mentally or increase the EV price here.">
              <NumberInput colors={colors} value={carPriceEv} onChange={(e) => { markCustom(); setCarPriceEv(Number(e.target.value) || 0) }} />
            </Field>
            <Field label="Charging availability" hint="Be honest. ‘Limited’ is better than pretending public charging is dependable for you.">
              <SelectInput colors={colors} value={chargingAvailability} onChange={(e) => { markCustom(); setChargingAvailability(e.target.value) }}>
                <option value="home_only">Home only</option>
                <option value="public_available">Home + public charging</option>
                <option value="limited">Limited / unreliable</option>
              </SelectInput>
            </Field>
            <Field label="Load shedding" hint="This mainly affects EV practicality and charging confidence, not just electricity cost.">
              <SliderInput colors={colors} accent={ACCENT} value={loadSheddingHours} onChange={(e) => { markCustom(); setLoadSheddingHours(Number(e.target.value)) }} min={0} max={8} suffix=" hours/day" />
            </Field>
          </FieldsGrid>
        </SectionCard>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <RecommendationBanner
            accent={result.recommendation === 'hybrid' ? '#22c55e' : result.recommendation === 'ev' ? '#8b5cf6' : '#f97316'}
            title={displayName}
            body={result.reasons[0]}
            confidence={result.confidence}
            colors={colors}
          />
          <MetricGrid>
            <MetricCard label="Annual distance" value={`${fmtNumber(result.annualKm, 0)} km`} sub="Driving volume strongly changes the winning option." accent={ACCENT} colors={colors} />
            <MetricCard label="Petrol 5y TCO" value={fmtCurrency(result.tco.petrol)} sub={`Monthly run cost: ${fmtCurrency(result.monthlyCosts.petrol)}`} accent="#f97316" colors={colors} />
            <MetricCard label="Hybrid 5y TCO" value={fmtCurrency(result.tco.hybrid)} sub={`Monthly run cost: ${fmtCurrency(result.monthlyCosts.hybrid)}`} accent="#22c55e" colors={colors} />
            <MetricCard label="EV 5y TCO" value={fmtCurrency(result.tco.ev)} sub={`Monthly run cost: ${fmtCurrency(result.monthlyCosts.ev)}`} accent="#8b5cf6" colors={colors} />
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

          <SectionCard title="Decision trace" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
          </SectionCard>

          <SectionCard title="See the ownership gap clearly" subtitle="Shorter bars are better here because the chart compares projected 5-year total cost of ownership." accent={ACCENT} colors={colors}>
            <ComparisonBars
              colors={colors}
              items={[
                { label: 'Petrol', value: result.tco.petrol, display: fmtCurrency(result.tco.petrol), color: '#f97316', note: `Monthly running cost: ${fmtCurrency(result.monthlyCosts.petrol)}` },
                { label: 'Hybrid', value: result.tco.hybrid, display: fmtCurrency(result.tco.hybrid), color: '#22c55e', note: `Monthly running cost: ${fmtCurrency(result.monthlyCosts.hybrid)}` },
                { label: 'EV', value: result.tco.ev, display: fmtCurrency(result.tco.ev), color: '#8b5cf6', note: `Monthly running cost: ${fmtCurrency(result.monthlyCosts.ev)}` },
              ]}
            />
          </SectionCard>

          <SectionCard title="What changes the answer?" subtitle="Use these scenario shifts to see whether the recommendation is durable." accent={ACCENT} colors={colors}>
            <MetricGrid min={220}>
              {result.sensitivity.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.impact} sub={item.detail} accent={item.tone} colors={colors} />
              ))}
            </MetricGrid>
          </SectionCard>

          <SectionCard title="Score comparison" subtitle="Cost is weighted most heavily. Convenience and risk keep the recommendation realistic." accent={ACCENT} colors={colors}>
            <ScoreBars
              scores={{
                'Petrol score': result.totalScores.petrol,
                'Hybrid score': result.totalScores.hybrid,
                'EV score': result.totalScores.ev,
              }}
              colors={colors}
            />
          </SectionCard>

          <SectionCard title="Which path fits which user?" subtitle="The cheapest answer and the least frustrating answer are not always the same." accent={ACCENT} colors={colors}>
            <BulletList
              items={[
                'Petrol often fits lower-mileage users, weak charging setups, and buyers who do not want to pay a large upfront premium yet.',
                'Hybrid usually fits high city-driving users who want a meaningful running-cost improvement without depending on charging infrastructure.',
                'EV fits best when daily usage is meaningful, home charging is dependable, and you can honestly live the charging routine for years.',
                'If the result is close, convenience, resale confidence, and charging resilience deserve more weight than hype.',
              ]}
              colors={colors}
            />
          </SectionCard>

          <SectionCard title="What to verify next" subtitle="Do this before turning the recommendation into a vehicle purchase." accent={ACCENT} colors={colors}>
            <BulletList
              items={[
                'Use real on-road prices, not idealized brochure pricing.',
                'If you are testing EV, cost the charger install and backup reality honestly.',
                'Check whether your daily usage is stable or whether this decision is being based on a temporary commute pattern.',
                'For hybrid and EV, compare resale behavior and service support in the specific model class you are considering.',
                'Rerun the scenario when fuel or electricity pricing shifts materially, because those changes can move the result faster than people expect.',
              ]}
              colors={colors}
            />
          </SectionCard>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DisclaimerBlock
          type="financial"
          overrideBodyEn="Fuel prices, electricity tariffs, maintenance costs, resale, and model prices move regularly. Treat this as a planning engine and refresh the base assumptions monthly for best results."
        />
      </div>
    </ToolLayout>
  )
}
