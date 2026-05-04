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
  }
}

export default function CarPowertrainDecision() {
  const { colors } = useTheme()
  const [dailyKm, setDailyKm] = useState(40)
  const [cityDrivingRatio, setCityDrivingRatio] = useState(70)
  const [petrolPricePerLitre, setPetrolPricePerLitre] = useState(300)
  const [electricityPricePerKwh, setElectricityPricePerKwh] = useState(50)
  const [carPricePetrol, setCarPricePetrol] = useState(5000000)
  const [carPriceHybrid, setCarPriceHybrid] = useState(8000000)
  const [carPriceEv, setCarPriceEv] = useState(9000000)
  const [chargingAvailability, setChargingAvailability] = useState('home_only')
  const [loadSheddingHours, setLoadSheddingHours] = useState(2)

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
          <FieldsGrid>
            <Field label="Daily driving distance">
              <SliderInput colors={colors} accent={ACCENT} value={dailyKm} onChange={(e) => setDailyKm(Number(e.target.value))} min={5} max={120} suffix=" km" />
            </Field>
            <Field label="City driving ratio">
              <SliderInput colors={colors} accent={ACCENT} value={cityDrivingRatio} onChange={(e) => setCityDrivingRatio(Number(e.target.value))} min={10} max={95} suffix="%" />
            </Field>
            <Field label="Petrol price per litre (PKR)">
              <NumberInput colors={colors} value={petrolPricePerLitre} onChange={(e) => setPetrolPricePerLitre(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Electricity price per kWh (PKR)">
              <NumberInput colors={colors} value={electricityPricePerKwh} onChange={(e) => setElectricityPricePerKwh(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Petrol car price (PKR)">
              <NumberInput colors={colors} value={carPricePetrol} onChange={(e) => setCarPricePetrol(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Hybrid car price (PKR)">
              <NumberInput colors={colors} value={carPriceHybrid} onChange={(e) => setCarPriceHybrid(Number(e.target.value) || 0)} />
            </Field>
            <Field label="EV price (PKR)">
              <NumberInput colors={colors} value={carPriceEv} onChange={(e) => setCarPriceEv(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Charging availability">
              <SelectInput colors={colors} value={chargingAvailability} onChange={(e) => setChargingAvailability(e.target.value)}>
                <option value="home_only">Home only</option>
                <option value="public_available">Home + public charging</option>
                <option value="limited">Limited / unreliable</option>
              </SelectInput>
            </Field>
            <Field label="Load shedding">
              <SliderInput colors={colors} accent={ACCENT} value={loadSheddingHours} onChange={(e) => setLoadSheddingHours(Number(e.target.value))} min={0} max={8} suffix=" hours/day" />
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

          <SectionCard title="Decision trace" accent={ACCENT} colors={colors}>
            <BulletList items={result.reasons} colors={colors} />
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
