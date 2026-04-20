import { useState } from 'react'
import jsPDF from 'jspdf'
import ToolLayout from '../components/ToolLayout'

// ── Pakistan peak sun hours (daily kWh/m²) — verified sources ────────────────
const CITIES = [
  { name: 'Karachi',        sun: 5.5 },
  { name: 'Hyderabad',      sun: 5.5 },
  { name: 'Sukkur',         sun: 6.0 },
  { name: 'Multan',         sun: 5.5 },
  { name: 'Lahore',         sun: 5.0 },
  { name: 'Faisalabad',     sun: 5.0 },
  { name: 'Gujranwala',     sun: 5.0 },
  { name: 'Islamabad',      sun: 4.8 },
  { name: 'Rawalpindi',     sun: 4.8 },
  { name: 'Peshawar',       sun: 5.0 },
  { name: 'Quetta',         sun: 6.0 },
  { name: 'Other / Rural',  sun: 5.0 },
]

const DEFAULT_APPLIANCES = [
  { id: 'ac',       icon: '❄️',  name: 'AC (1.5 ton)',      watts: 1500, hours: 8,   qty: 1 },
  { id: 'fan',      icon: '💨',  name: 'Ceiling Fan',        watts: 75,   hours: 18,  qty: 3 },
  { id: 'fridge',   icon: '🧊',  name: 'Refrigerator',       watts: 150,  hours: 24,  qty: 1 },
  { id: 'lights',   icon: '💡',  name: 'LED Lights (×10)',   watts: 100,  hours: 5,   qty: 1 },
  { id: 'tv',       icon: '📺',  name: 'LED TV 40"',          watts: 80,   hours: 5,   qty: 1 },
  { id: 'washing',  icon: '🫧',  name: 'Washing Machine',    watts: 500,  hours: 1,   qty: 1 },
  { id: 'pump',     icon: '🚿',  name: 'Water Pump',         watts: 750,  hours: 2,   qty: 1 },
  { id: 'computer', icon: '💻',  name: 'Computer / Laptop',  watts: 150,  hours: 4,   qty: 1 },
  { id: 'micro',    icon: '📡',  name: 'Microwave / Iron',   watts: 1000, hours: 0.5, qty: 1 },
  { id: 'router',   icon: '📶',  name: 'Router / CCTV',      watts: 50,   hours: 24,  qty: 1 },
]

// ── 2026 Pakistan solar defaults (all user-adjustable) ───────────────────────
// Panel prices: PKR 32–47/W (Tier-1). Full installed (incl. inverter, structure,
// wiring, labour, 10% GST on panels — Finance Act 2025): PKR 130–200/W
// Source: sheikhxsolarcorp, checkprice.pk, solarsystemprice.pk — April 2026
const DEFAULTS = {
  importTariff:    50,   // PKR/unit effective (base + GST + surcharges avg)
  buybackRate:     11,   // PKR/unit — NEPRA net billing, confirmed Dec 2025 (NEPRA Prosumer Regs)
  costLowPW:       130,  // PKR/W full installed — economy (Tier-1 panels, local inverter)
  costHighPW:      200,  // PKR/W full installed — premium (Growatt/Solis + Tier-1 N-type)
  selfConsume:     60,   // % of solar generation used on-site vs exported
  derate:          0.80, // derating: dust, heat, cable + inverter losses
}

const DATA_DATE    = 'April 2026'

// ── Net billing registration costs (one-time, on top of system cost) ─────────
// Includes: DISCO application fee + bi-directional AMI/AMR solar meter + inspection
// NOTE: The standard white/AMI meters being rolled out for regular customers
//       are NOT solar meters. Net billing requires a separate bi-directional
//       AMI meter even if your home already has a smart meter.
// IESCO (Rawalpindi/Islamabad): meter PKR 52,000 (propakistani, Nov 2025)
// LESCO (Lahore): meter PKR 70,000 — doubled, private purchase banned (techjuice, greentechnewsme)
// Other DISCOs: ~PKR 35,000–55,000
// + Application/processing fee: PKR 5,000–15,000
// + Inspection: PKR 5,000–10,000
const NB_FEE_LO = 55000    // PKR — IESCO zone approx total
const NB_FEE_HI = 90000    // PKR — LESCO zone approx total (meter 70k + fees)

// DISCO meter costs by region (for display)
const DISCO_METERS = [
  { disco: 'LESCO',  region: 'Lahore / Punjab',             meter: 70000, note: 'AMI meter doubled — must buy from LESCO, no private purchase' },
  { disco: 'IESCO',  region: 'Rawalpindi / Islamabad',      meter: 52000, note: 'AMR meter — public backlash, policy still rolling out' },
  { disco: 'FESCO',  region: 'Faisalabad',                  meter: 45000, note: 'Estimate — confirm with FESCO before applying' },
  { disco: 'MEPCO',  region: 'Multan / South Punjab',       meter: 45000, note: 'Estimate — confirm with MEPCO before applying' },
  { disco: 'HESCO',  region: 'Hyderabad / Sindh',           meter: 40000, note: 'Estimate — confirm with HESCO before applying' },
  { disco: 'SEPCO',  region: 'Sukkur / North Sindh',        meter: 40000, note: 'Estimate — confirm with SEPCO before applying' },
  { disco: 'PESCO',  region: 'Peshawar / KPK',              meter: 40000, note: 'Estimate — confirm with PESCO before applying' },
  { disco: 'QESCO',  region: 'Quetta / Balochistan',        meter: 40000, note: 'Estimate — confirm with QESCO before applying' },
]

// ── Battery options — April 2026 (global lithium prices -15-18% from 2025) ──
const BATTERIES = [
  { brand: 'Knox',      cap: '6.1 kWh',  lo: 225000, hi: 280000, note: 'Budget pick — strong local warranty',          flag: '🏆 Best Value' },
  { brand: 'PylonTech', cap: '5.1 kWh',  lo: 255000, hi: 310000, note: 'Global #1 — most installer-supported',         flag: '🌐 Most Popular' },
  { brand: 'Narada',    cap: '4.8 kWh',  lo: 240000, hi: 380000, note: 'Chinese OEM — wide price range by seller',      flag: '' },
  { brand: 'Dyness',    cap: '5.1 kWh',  lo: 270000, hi: 330000, note: 'Premium safety, BMS built-in',                  flag: '' },
]
const BATT_LO = Math.min(...BATTERIES.map(b => b.lo))  // 225,000
const BATT_HI = Math.max(...BATTERIES.map(b => b.hi))  // 380,000

function fmt(n)    { return Math.round(n).toLocaleString('en-PK') }
function fmtDec(n) { return n.toFixed(1) }

function calcResults({ bill, cityObj, loadshed, appliances, selected, netBilling,
                       selfConsumePct, importTariff, buybackRate, costLoPW, costHiPW }) {
  const sunHours    = cityObj.sun
  const safeTariff  = importTariff > 0 ? importTariff : DEFAULTS.importTariff  // guard ÷0

  // ── Load ──────────────────────────────────────────────────────────────────
  const anySelected       = Object.values(selected).some(Boolean)
  const dailyFromBill     = bill / safeTariff / 30
  let dailyFromAppliances = 0
  appliances.forEach(a => {
    if (selected[a.id]) dailyFromAppliances += (a.watts * a.hours * a.qty) / 1000
  })
  const dailyKwh = anySelected ? dailyFromAppliances : dailyFromBill
  const actualMonthlyUsage = dailyKwh * 30   // physical kWh used per month

  // ── System sizing ─────────────────────────────────────────────────────────
  const rawKw   = dailyKwh / sunHours / DEFAULTS.derate
  const sysKw   = Math.max(1, Math.round(rawKw * 2) / 2)
  const sysKwLo = Math.max(1, sysKw - 0.5)
  const sysKwHi = sysKw + 0.5

  // ── Cost range (economy = smaller system, premium = larger system) ─────────
  const costLo     = sysKwLo * 1000 * costLoPW
  const costHi     = sysKwHi * 1000 * costHiPW
  const avgInstall = sysKw  * 1000 * (costLoPW + costHiPW) / 2  // for payback

  // ── Monthly generation ────────────────────────────────────────────────────
  const monthlyGen = sysKw * sunHours * 30 * DEFAULTS.derate   // kWh/month

  // ── 2026 Net Billing savings model ────────────────────────────────────────
  // Self-consumption capped at actual monthly usage — cannot use more than load
  const selfConsumedRaw = monthlyGen * (selfConsumePct / 100)
  const selfConsumedKwh = Math.min(selfConsumedRaw, actualMonthlyUsage)
  const exportedKwh     = monthlyGen - selfConsumedKwh

  const selfSavings   = Math.min(selfConsumedKwh * safeTariff, bill)
  const exportRevenue = netBilling ? exportedKwh * buybackRate : 0
  const totalSavings  = Math.min(selfSavings + exportRevenue, bill)
  const annualSavings = totalSavings * 12
  const postSolarBill = Math.max(0, bill - selfSavings - exportRevenue)

  // ── Payback ───────────────────────────────────────────────────────────────
  const nbFeeAvg   = (NB_FEE_LO + NB_FEE_HI) / 2
  const nbFee      = netBilling ? nbFeeAvg : 0
  const avgCost    = avgInstall + nbFee
  const paybackYrs = annualSavings > 0 ? avgCost / annualSavings : 0

  // ── Battery ───────────────────────────────────────────────────────────────
  const needsBattery = loadshed >= 4 || bill >= 25000

  // ── Verdict — based on payback period ─────────────────────────────────────
  let verdict, verdictColor, verdictIcon
  if      (bill < 5000)      { verdict = 'Not Ideal (Low Bill)';   verdictColor = '#f87171'; verdictIcon = '❌' }
  else if (paybackYrs <= 0)  { verdict = 'Insufficient Data';      verdictColor = '#f87171'; verdictIcon = '❌' }
  else if (paybackYrs <= 5)  { verdict = 'Strongly Recommended';   verdictColor = '#22c55e'; verdictIcon = '✅' }
  else if (paybackYrs <= 8)  { verdict = 'Recommended';            verdictColor = '#86efac'; verdictIcon = '✅' }
  else if (paybackYrs <= 12) { verdict = 'Worth Considering';      verdictColor = '#fbbf24'; verdictIcon = '⚠️' }
  else                       { verdict = 'Long Payback (>12 yrs)'; verdictColor = '#f87171'; verdictIcon = '❌' }

  // ── Expert: Why this verdict (factors) ───────────────────────────────────
  const verdictFactors = []
  // Factor 1: Payback
  if (paybackYrs > 0 && paybackYrs <= 5)
    verdictFactors.push({ icon:'✅', color:'#86efac', text: `${fmtDec(paybackYrs)}-year payback — system pays for itself well before panels degrade (25yr life)` })
  else if (paybackYrs > 0 && paybackYrs <= 8)
    verdictFactors.push({ icon:'✅', color:'#86efac', text: `${fmtDec(paybackYrs)}-year payback — solid return over the 25-year panel life` })
  else if (paybackYrs > 0 && paybackYrs <= 12)
    verdictFactors.push({ icon:'⚠️', color:'#fbbf24', text: `${fmtDec(paybackYrs)}-year payback — profitable long-term but slow to recover; rising tariffs help` })
  else if (paybackYrs > 12)
    verdictFactors.push({ icon:'❌', color:'#f87171', text: `${fmtDec(paybackYrs)}-year payback — panel degradation and tech changes may reduce net gain` })
  // Factor 2: Self-consumption rate
  if (selfConsumePct >= 65)
    verdictFactors.push({ icon:'✅', color:'#86efac', text: `High self-consumption (${selfConsumePct}%) — most solar used at home at PKR ${importTariff}/unit, the highest-value use case` })
  else if (selfConsumePct >= 45)
    verdictFactors.push({ icon:'🔹', color:'#7dd3fc', text: `Moderate self-consumption (${selfConsumePct}%) — ${100-selfConsumePct}% exported at PKR ${buybackRate}/unit; shifting usage to daytime hours improves ROI` })
  else
    verdictFactors.push({ icon:'⚠️', color:'#fbbf24', text: `Low self-consumption (${selfConsumePct}%) — ${100-selfConsumePct}% exported earns only PKR ${buybackRate}/unit vs PKR ${importTariff} if self-used. A smaller system may be smarter` })
  // Factor 3: Bill size
  if (bill >= 25000)
    verdictFactors.push({ icon:'✅', color:'#86efac', text: `High bill (PKR ${fmt(bill)}/month) — large savings pool makes solar very attractive despite net billing changes` })
  else if (bill >= 10000)
    verdictFactors.push({ icon:'🔹', color:'#7dd3fc', text: `Moderate bill (PKR ${fmt(bill)}/month) — decent savings pool; tariff hikes make it better each year` })
  else
    verdictFactors.push({ icon:'⚠️', color:'#fbbf24', text: `Lower bill (PKR ${fmt(bill)}/month) — modest absolute savings today; tariffs historically rising 18–22%/yr in Pakistan` })
  // Factor 4: Net billing cost vs benefit
  if (netBilling && exportRevenue > 0) {
    const exportAnnual   = exportRevenue * 12
    const nbBreakEvenYrs = exportAnnual > 0 ? Math.round(nbFeeAvg / exportAnnual * 10) / 10 : 99
    if (nbBreakEvenYrs <= 3)
      verdictFactors.push({ icon:'✅', color:'#86efac', text: `Net billing fee (~PKR ${fmt(nbFeeAvg)}) recovers from export credits in just ${nbBreakEvenYrs} yrs — worth applying` })
    else if (nbBreakEvenYrs <= 6)
      verdictFactors.push({ icon:'🔹', color:'#7dd3fc', text: `Net billing fee (~PKR ${fmt(nbFeeAvg)}) recovers in ~${nbBreakEvenYrs} yrs of export credits — borderline; see option comparison below` })
    else
      verdictFactors.push({ icon:'⚠️', color:'#fbbf24', text: `Net billing fee (~PKR ${fmt(nbFeeAvg)}) takes ${nbBreakEvenYrs}+ yrs to recover from export revenue — smaller system without NB may beat this` })
  }

  // ── Expert: Alternative scenario (self-consumption only, no NB fee) ───────
  // Size system to generate ONLY what the user self-consumes — no wasted export,
  // no net billing fee, simpler approval. Best for low self-consumption households.
  const altSysKwRaw  = selfConsumedKwh / (sunHours * 30 * DEFAULTS.derate)
  const altSysKw     = Math.max(1, Math.round(altSysKwRaw * 2) / 2)
  const altMonthlyGen   = altSysKw * sunHours * 30 * DEFAULTS.derate
  const altMonthlySave  = Math.min(altMonthlyGen * safeTariff, bill)
  const altAnnualSave   = altMonthlySave * 12
  const altCostLo       = Math.max(1, altSysKw - 0.5) * 1000 * costLoPW
  const altCostHi       = (altSysKw + 0.5) * 1000 * costHiPW
  const altAvgCost      = altSysKw * 1000 * (costLoPW + costHiPW) / 2
  const altPaybackNum   = altAnnualSave > 0 ? altAvgCost / altAnnualSave : 0
  const altPaybackFmt   = altPaybackNum > 0 ? fmtDec(altPaybackNum) : '—'
  // 10-year net return (total savings minus upfront cost)
  const tenYrFull  = Math.round(annualSavings * 10 - avgCost)
  const tenYrAlt   = Math.round(altAnnualSave  * 10 - altAvgCost)
  const altIsBetter    = tenYrAlt > tenYrFull
  const showAltCompare = netBilling && (sysKw - altSysKw >= 1)

  // ── Expert: Personalized tips based on inputs ─────────────────────────────
  const expertTips = []
  if (selfConsumePct < 45 && netBilling)
    expertTips.push(`🕐 Shift AC, washing machine and iron to 10am–4pm (peak solar hours). Even moving from ${selfConsumePct}% to 60% self-consumption could cut payback by ${fmtDec(Math.max(0, paybackYrs - altPaybackNum))} years — no extra cost.`)
  if (loadshed >= 6)
    expertTips.push(`⚡ ${loadshed}-hr load-shedding: on-grid inverters go dead when the grid fails. Battery is NOT optional here — budget PKR ${fmt(BATT_LO)}–${fmt(BATT_HI)} for a 5–6 kWh LiFePO₄ unit in addition to the solar system.`)
  else if (loadshed >= 4)
    expertTips.push(`🔋 ${loadshed}-hr load-shedding: battery keeps fans, lights, and router running during outages. It also converts PKR ${buybackRate}/unit exported energy into PKR ${importTariff}/unit self-use — can improve payback by 1–2 years.`)
  if (netBilling && exportedKwh > selfConsumedKwh) {
    const convertibleKwh = Math.min(exportedKwh, 150)
    expertTips.push(`💡 You export ${exportedKwh} kWh/month at PKR ${buybackRate}/unit. A 5 kWh battery could convert ~${convertibleKwh} kWh/month into self-use at PKR ${importTariff}/unit — saving an extra PKR ${fmt(convertibleKwh * (safeTariff - buybackRate))}/month.`)
  }
  if (sysKw >= 10)
    expertTips.push(`📋 Systems ≥10 kW require DISCO approval and may need a transformer upgrade. Confirm feasibility with your DISCO's engineering department BEFORE signing any contract.`)
  if (bill < 8000 && bill >= 5000)
    expertTips.push(`📈 Your bill is modest today, but Pakistan electricity tariffs have risen 18–22%/yr since 2022. At that rate your bill doubles in 3–4 years — solar you install today locks in today's cost permanently.`)
  if (sysKw >= 5 && loadshed <= 2)
    expertTips.push(`☀️ Low load-shedding area: battery is optional for now. Ask for a hybrid inverter — it costs PKR 20–30k more but lets you add a battery later without replacing the inverter.`)

  return {
    dailyKwh: fmtDec(dailyKwh),
    sysKw, sysKwLo, sysKwHi,
    costLo, costHi,
    monthlyGen: Math.round(monthlyGen),
    selfConsumedKwh: Math.round(selfConsumedKwh),
    exportedKwh: Math.round(exportedKwh),
    selfSavings, exportRevenue, totalSavings, annualSavings,
    postSolarBill,
    paybackYrs: paybackYrs > 0 ? fmtDec(paybackYrs) : '—',
    needsBattery,
    verdict, verdictColor, verdictIcon,
    // Expert intelligence
    verdictFactors,
    altSysKw, altCostLo, altCostHi, altPaybackFmt, altMonthlySave, altAnnualSave,
    tenYrFull, tenYrAlt, altIsBetter, showAltCompare,
    expertTips,
  }
}

const ACCENT = '#f59e0b'
const FONT   = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

export default function SolarPlanner() {
  const [step, setStep]             = useState(1)
  const [bill, setBill]             = useState('')
  const [cityIdx, setCityIdx]       = useState(0)
  const [loadshed, setLoadshed]     = useState(4)
  const [netBilling, setNetBilling] = useState(true)
  const [selfConsume, setSelfConsume] = useState(60)
  const [showAdv, setShowAdv]       = useState(false)
  const [importTariff, setImportTariff] = useState(DEFAULTS.importTariff)
  const [buybackRate, setBuybackRate]   = useState(DEFAULTS.buybackRate)
  const [costLoPW, setCostLoPW]         = useState(DEFAULTS.costLowPW)
  const [costHiPW, setCostHiPW]         = useState(DEFAULTS.costHighPW)
  const [appliances, setAppliances]     = useState(DEFAULT_APPLIANCES)
  const [selected, setSelected]         = useState({})
  const [results, setResults]           = useState(null)
  const [copied, setCopied]             = useState(false)

  const billNum = parseFloat(bill) || 0

  function toggleAppliance(id) { setSelected(s => ({ ...s, [id]: !s[id] })) }
  function changeQty(id, delta) {
    setAppliances(p => p.map(a => a.id === id ? { ...a, qty: Math.max(1, a.qty + delta) } : a))
  }
  function changeHours(id, val) {
    setAppliances(p => p.map(a =>
      a.id === id ? { ...a, hours: Math.max(0.5, Math.min(24, parseFloat(val) || 0.5)) } : a
    ))
  }

  function goToStep3() {
    const r = calcResults({
      bill: billNum, cityObj: CITIES[cityIdx], loadshed, appliances, selected,
      netBilling, selfConsumePct: selfConsume,
      importTariff, buybackRate, costLoPW, costHiPW,
    })
    setResults(r)
    setStep(3)
  }

  function copyText() {
    if (!results) return
    const r = results
    const policyLabel = netBilling ? `Net Billing (PKR ${buybackRate}/unit export)` : 'No net billing'
    const text = [
      `\u2600\uFE0F Solar Planning Estimate \u2014 Rafiqy Solar Planner`,
      `Generated: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Data: Pakistan market rates ${DATA_DATE}`,
      ``,
      `\uD83D\uDCCD City: ${CITIES[cityIdx].name}`,
      `\uD83D\uDCA1 Monthly Bill: PKR ${fmt(billNum)}`,
      `\u26A1 Est. Daily Usage: ${r.dailyKwh} kWh/day`,
      `\uD83C\uDF10 Policy: ${policyLabel} | Self-consumption: ${selfConsume}%`,
      ``,
      `\uD83D\uDD06 Recommended System: ${r.sysKwLo}\u2013${r.sysKwHi} kW (on-grid)`,
      `\uD83D\uDCB0 Installation: PKR ${fmt(r.costLo)}\u2013${fmt(r.costHi)}`,
      ``,
      `Monthly breakdown:`,
      `  \u26A1 Generation: ${r.monthlyGen} kWh`,
      `  \uD83C\uDFE0 Self-consumed: ${r.selfConsumedKwh} kWh \u00D7 PKR ${importTariff} = PKR ${fmt(r.selfSavings)}`,
      `  \uD83D\uDCE4 Exported: ${r.exportedKwh} kWh \u00D7 PKR ${buybackRate} = PKR ${fmt(r.exportRevenue)}`,
      `  \uD83D\uDCC9 Total savings: ~PKR ${fmt(r.totalSavings)}/month`,
      `  \uD83E\uDDFE Post-solar bill: ~PKR ${fmt(r.postSolarBill)}/month`,
      ``,
      `\uD83D\uDCC6 Payback: ~${r.paybackYrs} years`,
      `\uD83D\uDD0B Battery (5\u20136 kWh LiFePO\u2084): PKR ${fmt(BATT_LO)}\u2013${fmt(BATT_HI)} extra \u2014 ${r.needsBattery ? 'Recommended' : 'Optional'}`,
      ``,
      `${r.verdictIcon} Verdict: ${r.verdict}`,
      ``,
      `\u26A0\uFE0F Planning estimates based on ${DATA_DATE} Pakistan market data.`,
      `NEPRA net billing (Dec 2025): export = PKR ${buybackRate}/unit \u2014 verify with your DISCO.`,
      `10% GST on imported panels (Finance Act 2025) included in cost estimate.`,
      ``,
      `\uD83C\uDF10 rafiqy.app/tools/solar-planner`
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function generatePDF() {
    if (!results) return
    const r = results
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const W = 210, M = 16, CW = W - M * 2
    let y = 0

    // Helpers
    const fc  = (rr, g, b) => doc.setFillColor(rr, g, b)
    const tc  = (rr, g, b) => doc.setTextColor(rr, g, b)
    const dc  = (rr, g, b) => doc.setDrawColor(rr, g, b)
    const box = (x, yy, w, h, fill, strokeC, lw = 0.3) => {
      if (fill)   { doc.setFillColor(...fill);   }
      if (strokeC){ doc.setDrawColor(...strokeC); doc.setLineWidth(lw) }
      doc.rect(x, yy, w, h, fill && strokeC ? 'FD' : fill ? 'F' : 'D')
    }
    const strip = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/gu, '').replace(/^[•\-\s]+/, '').trim()

    // Verdict color RGB
    const vc = results.verdictColor === '#22c55e' ? [22, 163, 74]
             : results.verdictColor === '#4ade80' ? [74, 222, 128]
             : results.verdictColor === '#fbbf24' ? [245, 158, 11]
             : results.verdictColor === '#f87171' ? [220, 38, 38]
             : [6, 182, 212]

    // ── HEADER ──────────────────────────────────────────────────────────
    box(0, 0, W, 28, [15, 23, 42])
    doc.setFontSize(17); doc.setFont('helvetica', 'bold'); tc(255, 255, 255)
    doc.text('Solar Assessment Report', M, 11)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); tc(6, 182, 212)
    doc.text('rafiqy.app/tools/solar-planner', M, 17.5)
    tc(148, 163, 184)
    const genDate = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Generated: ${genDate}  |  Data: Pakistan solar market ${DATA_DATE}`, M, 23.5)
    y = 34

    // ── INPUTS SUMMARY ──────────────────────────────────────────────────
    box(M, y, CW, 9, [241, 245, 249], [226, 232, 240])
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); tc(51, 65, 85)
    const pol = netBilling ? `Net Billing @ PKR ${buybackRate}/unit` : 'Self-consumption only'
    doc.text(`City: ${CITIES[cityIdx].name}   |   Bill: PKR ${fmt(billNum)}/month   |   Policy: ${pol}   |   Self-consumption: ${selfConsume}%   |   Loadshedding: ${loadshed}h`, M + 3, y + 5.8)
    y += 13

    // ── VERDICT ─────────────────────────────────────────────────────────
    box(M, y, CW, 17, [248, 250, 252], vc, 1.2)
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); tc(...vc)
    doc.text(results.verdict, M + 4, y + 8)
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); tc(100, 116, 139)
    doc.text(`Is solar worth it?  |  ${CITIES[cityIdx].name}  |  PKR ${fmt(billNum)}/month  |  ${netBilling ? 'Net Billing (NEPRA Dec 2025)' : 'No grid export'}`, M + 4, y + 13)
    y += 21

    // ── WHY THIS VERDICT ────────────────────────────────────────────────
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); tc(30, 41, 59)
    doc.text('Why this verdict?', M, y); y += 4
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    results.verdictFactors.slice(0, 4).forEach(f => {
      tc(71, 85, 105)
      const lines = doc.splitTextToSize('• ' + strip(f.text), CW - 4)
      doc.text(lines, M + 2, y)
      y += lines.length * 3.6
    })
    y += 4

    // ── KEY METRICS (2-col grid) ─────────────────────────────────────────
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); tc(30, 41, 59)
    doc.text('Key Results', M, y); y += 4
    const colW = (CW - 3) / 2
    const metrics = [
      { label: 'System Size',     value: `${r.sysKwLo}-${r.sysKwHi} kW`,             sub: 'On-grid, Tier-1 panels' },
      { label: 'Install Cost',    value: `PKR ${fmt(r.costLo)}-${fmt(r.costHi)}`,     sub: 'Economy-Premium (battery separate)' },
      { label: 'Monthly Savings', value: `~PKR ${fmt(r.totalSavings)}`,               sub: `${r.monthlyGen} kWh/month generated` },
      { label: 'Post-Solar Bill', value: `~PKR ${fmt(r.postSolarBill)}`,              sub: r.postSolarBill < 1000 ? 'Near-zero bill!' : `Down from PKR ${fmt(billNum)}` },
      { label: 'Payback Period',  value: `~${r.paybackYrs} years`,                   sub: 'Net billing model (2026)' },
      { label: 'Annual Savings',  value: `PKR ${fmt(r.annualSavings)}`,              sub: 'After payback: free energy' },
    ]
    metrics.forEach((m, i) => {
      const col = i % 2
      const x = M + col * (colW + 3)
      box(x, y, colW, 16, [248, 250, 252], [226, 232, 240])
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); tc(100, 116, 139)
      doc.text(m.label, x + 3, y + 5)
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); tc(15, 23, 42)
      doc.text(m.value, x + 3, y + 10.5)
      doc.setFontSize(6); doc.setFont('helvetica', 'normal'); tc(148, 163, 184)
      doc.text(m.sub, x + 3, y + 14.5)
      if (col === 1) y += 18
    })
    y += 22

    // ── MONTHLY BREAKDOWN ───────────────────────────────────────────────
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); tc(30, 41, 59)
    doc.text('Monthly Savings Breakdown', M, y); y += 4
    const rows = [
      [`Self-consumed (${selfConsume}%)`, `${r.selfConsumedKwh} kWh x PKR ${importTariff}/unit`, `PKR ${fmt(r.selfSavings)}`],
      ...(netBilling ? [[`Exported (${100-selfConsume}%)`, `${r.exportedKwh} kWh x PKR ${buybackRate}/unit`, `PKR ${fmt(r.exportRevenue)}`]] : []),
      ['Total Monthly Savings', '', `PKR ${fmt(r.totalSavings)}`],
    ]
    rows.forEach((row, i) => {
      const isT = i === rows.length - 1
      box(M, y, CW, 7, isT ? [240, 253, 244] : [248, 250, 252], isT ? [134, 239, 172] : [226, 232, 240])
      doc.setFontSize(isT ? 7.5 : 7); doc.setFont('helvetica', isT ? 'bold' : 'normal')
      tc(...(isT ? [22, 163, 74] : [30, 41, 59]))
      doc.text(row[0], M + 3, y + 4.8)
      tc(100, 116, 139); doc.setFont('helvetica', 'normal')
      doc.text(row[1], M + CW * 0.44, y + 4.8)
      tc(...(isT ? [6, 182, 212] : [30, 41, 59])); doc.setFont('helvetica', 'bold')
      doc.text(row[2], M + CW - 2, y + 4.8, { align: 'right' })
      y += 7
    })
    y += 3
    if (netBilling) {
      doc.setFontSize(6.5); doc.setFont('helvetica', 'italic'); tc(100, 116, 139)
      doc.text(`Net billing smart meter (one-time): ~PKR ${fmt(NB_FEE_LO)}-${fmt(NB_FEE_HI)} — included in payback calculation. Varies by DISCO.`, M, y)
      y += 6
    }

    // ── BATTERY ─────────────────────────────────────────────────────────
    y += 2
    const battText = r.needsBattery
      ? `Battery: RECOMMENDED (${loadshed}h loadshedding) — LiFePO4 5-6 kWh adds PKR ${fmt(BATT_LO)}-${fmt(BATT_HI)} extra. Also converts low-value export (PKR ${buybackRate}/unit) into high-value self-use (PKR ${importTariff}/unit).`
      : `Battery: Optional — LiFePO4 5-6 kWh: PKR ${fmt(BATT_LO)}-${fmt(BATT_HI)} extra. Can be retrofitted later. Adds backup during loadshedding and boosts self-consumption.`
    const battLines = doc.splitTextToSize(battText, CW - 2)
    box(M, y - 2, CW, battLines.length * 3.8 + 5, [255, 251, 235], [253, 230, 138])
    doc.setFontSize(7); doc.setFont('helvetica', r.needsBattery ? 'bold' : 'normal')
    tc(120, 80, 15)
    doc.text(battLines, M + 3, y + 2)
    y += battLines.length * 3.8 + 7

    // ── NEW PAGE if needed ───────────────────────────────────────────────
    if (y > 240) { doc.addPage(); y = 16 }

    // ── EXPERT TIPS ─────────────────────────────────────────────────────
    if (r.expertTips.length > 0) {
      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); tc(30, 41, 59)
      doc.text('Expert Tips for Your Situation', M, y); y += 4
      doc.setFontSize(6.8); doc.setFont('helvetica', 'normal')
      r.expertTips.slice(0, 4).forEach(tip => {
        tc(71, 85, 105)
        const lines = doc.splitTextToSize('• ' + strip(tip), CW - 4)
        doc.text(lines, M + 2, y)
        y += lines.length * 3.5 + 1
      })
      y += 3
    }

    // ── HOW WE CALCULATED ───────────────────────────────────────────────
    if (y < 258) {
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); tc(148, 163, 184)
      const calc = `How calculated: Load ${r.dailyKwh} kWh/day / ${CITIES[cityIdx].sun} peak sun hrs / 0.80 derate = ${r.sysKw} kW. Generation: ${r.sysKw} kW x ${CITIES[cityIdx].sun} hrs x 30 days x 0.80 = ${r.monthlyGen} kWh/month.`
      const cLines = doc.splitTextToSize(calc, CW)
      doc.text(cLines, M, y); y += cLines.length * 3.5 + 3
    }

    // ── DISCLAIMER ──────────────────────────────────────────────────────
    const dY = Math.max(y + 2, 267)
    const disc = `Disclaimer: Planning estimates only — based on verified Pakistan market data (${DATA_DATE}). NEPRA net billing export rate (PKR ${buybackRate}/unit) set Dec 2025 — verify with your DISCO before proceeding. 10% GST on imported panels (Finance Act 2025) included. Get 2-3 installer quotes before investing. These are estimates, not a guarantee of savings.`
    const dLines = doc.splitTextToSize(disc, CW - 4)
    box(M, dY - 2, CW, dLines.length * 3.6 + 6, [255, 251, 235], [253, 230, 138])
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); tc(120, 80, 15)
    doc.text(dLines, M + 2, dY + 3)

    // ── FOOTER ──────────────────────────────────────────────────────────
    box(0, 286, W, 11, [15, 23, 42])
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); tc(6, 182, 212)
    doc.text('rafiqy.app/tools/solar-planner', M, 292.5)
    tc(148, 163, 184)
    doc.text('Free tools for Pakistan. Accurate. No ads. No signup.', W - M, 292.5, { align: 'right' })

    const fname = `solar-estimate-${CITIES[cityIdx].name.toLowerCase().replace(/[\s/]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fname)
  }

 const card = { background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '0.75rem' }
  const btn  = { background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: FONT }
  const outlineBtn = { ...btn, background: 'transparent', color: '#94a3b8', border: '1px solid #334155' }
  const numInput = { width: '5rem', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#f1f5f9', fontFamily: FONT, fontSize: '0.9rem', textAlign: 'right' }

  return (
    <ToolLayout toolId="solar-planner">
      <div style={{ fontFamily: FONT, maxWidth: '720px', margin: '0 auto', padding: '1rem' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)',
            fontWeight: 800,
            margin: '0 0 0.35rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ☀️ Solar Planner
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Estimate solar system size &amp; savings for Pakistan homes — based on April 2026 market rates
          </p>
        </div>

        {/* Freshness badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#14532d20', border: '1px solid #14532d60', color: '#86efac', fontSize: '0.72rem', fontWeight: 600, borderRadius: '20px', padding: '0.2rem 0.7rem' }}>✅ Data: {DATA_DATE}</span>
          <span style={{ background: '#7f1d1d20', border: '1px solid #7f1d1d60', color: '#fca5a5', fontSize: '0.72rem', fontWeight: 600, borderRadius: '20px', padding: '0.2rem 0.7rem' }}>⚠️ Net Billing policy (Dec 2025)</span>
          <span style={{ background: '#1e3a5f20', border: '1px solid #1e3a5f60', color: '#7dd3fc', fontSize: '0.72rem', fontWeight: 600, borderRadius: '20px', padding: '0.2rem 0.7rem' }}>🇵🇰 Pakistan on-grid rates</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: step >= s ? ACCENT : '#334155', color: step >= s ? '#000' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{s}</div>
              <span style={{ color: step >= s ? '#e2e8f0' : '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                {s === 1 ? 'Bill & Settings' : s === 2 ? 'Appliances' : 'Results'}
              </span>
              {s < 3 && <span style={{ color: '#475569', margin: '0 0.2rem' }}>›</span>}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>☀️ Bill, Location & Policy</h2>

            <div style={{ background: '#7f1d1d18', border: '1px solid #7f1d1d60', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '0.625rem', display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📢</span>
              <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.6 }}>
                <strong>NEPRA Policy (Dec 2025):</strong> Net metering replaced by <strong>net billing</strong>. Exported solar earns only <strong>PKR 11/unit</strong> (was PKR 25–27). Confirmed: NEPRA Prosumer Regulations.
              </div>
            </div>
            <div style={{ background: '#1e3a5f18', border: '1px solid #1e3a5f60', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🧾</span>
              <div style={{ fontSize: '0.78rem', color: '#7dd3fc', lineHeight: 1.6 }}>
                <strong>Budget FY2025-26:</strong> New <strong>10% GST on imported solar panels</strong> (was 0%, Finance Act 2025). May rise to 18%. Already included in our PKR 130–200/W estimate.
              </div>
            </div>

            <div style={card}>
              <label style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>Monthly Electricity Bill (PKR)</label>
              <input
                type="number" value={bill} onChange={e => setBill(e.target.value)}
                placeholder="e.g. 15000" min="0"
                style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '1.05rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#f1f5f9', fontFamily: FONT, boxSizing: 'border-box', marginBottom: '0.5rem' }}
              />
              {billNum > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                  ~{Math.round(billNum / importTariff)} units/month · effective ~PKR {importTariff}/unit
                </div>
              )}

              <label style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>City</label>
              <select value={cityIdx} onChange={e => setCityIdx(Number(e.target.value))}
                style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#f1f5f9', fontFamily: FONT, boxSizing: 'border-box', marginBottom: '1rem', cursor: 'pointer' }}>
                {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name} — {c.sun} peak sun hrs/day</option>)}
              </select>

              <label style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>Daily Load-shedding</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[0,2,4,6,8,10].map(h => (
                  <button key={h} onClick={() => setLoadshed(h)} style={{ padding: '0.45rem 0.875rem', borderRadius: '8px', cursor: 'pointer', border: loadshed === h ? `2px solid ${ACCENT}` : '1px solid #334155', background: loadshed === h ? '#451a03' : '#1e293b', color: loadshed === h ? ACCENT : '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>
                    {h === 0 ? 'None' : `${h} hrs`}
                  </button>
                ))}
              </div>

              {/* Net Billing */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.625rem' }}>🌐 Net Billing (NEPRA 2026)</div>
                <div onClick={() => setNetBilling(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  <Toggle on={netBilling} />
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>{netBilling ? 'Net Billing enabled' : 'No grid export (off-grid / battery only)'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{netBilling ? `Exported units credited at PKR 11/unit (NEPRA Dec 2025) · One-time fee: ~PKR ${fmt(NB_FEE_LO)}–${fmt(NB_FEE_HI)} (app + smart meter)` : 'All solar used on-site; nothing exported'}</div>
                  </div>
                </div>
                {netBilling && (
                  <>
                    <label style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '0.3rem' }}>Self-consumption — % of your solar used at home vs exported</label>
                    <input type="range" min="20" max="90" step="5" value={selfConsume}
                      onChange={e => setSelfConsume(Number(e.target.value))}
                      style={{ width: '100%', accentColor: ACCENT, marginBottom: '0.25rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      <span>20% (mostly away)</span>
                      <span style={{ color: ACCENT, fontWeight: 700 }}>{selfConsume}% self-consumed</span>
                      <span>90% (home all day)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.875rem' }}>
                      💡 AC users home in daytime → 70–80%. Office workers away 9–5 → 30–40%. Fridge+fans only → 40–50%.
                    </div>

                    {/* DISCO meter cost table */}
                    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.75rem', border: '1px solid #1e3a5f' }}>
                      <div style={{ color: '#7dd3fc', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        📟 One-time Net Billing Fee by DISCO (verified April 2026)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                        ⚠️ Even if your home already has a new white/AMI meter — net billing requires a <strong style={{ color: '#94a3b8' }}>separate bi-directional solar meter</strong>. You must pay for it.
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {DISCO_METERS.map(d => (
                          <div key={d.disco} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 700 }}>{d.disco}</span>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}> · {d.region}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: d.note.includes('Estimate') ? '#fbbf24' : '#f87171', fontSize: '0.78rem', fontWeight: 700 }}>
                                PKR {fmt(d.meter)} {d.note.includes('Estimate') ? '(est.)' : '✓'}
                              </span>
                              <div style={{ color: '#475569', fontSize: '0.65rem', maxWidth: '220px' }}>{d.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ color: '#334155', fontSize: '0.68rem', marginTop: '0.5rem' }}>
                        Meter cost + application + inspection ≈ PKR {fmt(NB_FEE_LO)}–{fmt(NB_FEE_HI)} total. Included in payback calculation.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Advanced rates */}
            <div style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowAdv(v => !v)} style={{ ...outlineBtn, padding: '0.5rem 1rem', fontSize: '0.82rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚙️ Advanced: Adjust Rates & Costs</span>
                <span style={{ fontSize: '0.7rem' }}>{showAdv ? '▲ Hide' : '▼ Show'}</span>
              </button>
              {showAdv && (
                <div style={{ ...card, marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <AdvField label="Import tariff (PKR/unit)" hint="Effective rate incl. GST + surcharges" value={importTariff} onChange={setImportTariff} numInput={numInput} />
                  <AdvField label="Export/buyback rate (PKR/unit)" hint="NEPRA net billing: PKR 11/unit (Dec 2025)" value={buybackRate} onChange={setBuybackRate} numInput={numInput} />
                  <AdvField label="Economy build (PKR/W)" hint="Fully installed: Tier-1 panels + local inverter + labor" value={costLoPW} onChange={setCostLoPW} numInput={numInput} />
                  <AdvField label="Premium build (PKR/W)" hint="Fully installed: N-type bifacial + Growatt/Solis + labor" value={costHiPW} onChange={setCostHiPW} numInput={numInput} />
                  <div style={{ gridColumn: '1/-1' }}>
                    <button onClick={() => { setImportTariff(DEFAULTS.importTariff); setBuybackRate(DEFAULTS.buybackRate); setCostLoPW(DEFAULTS.costLowPW); setCostHiPW(DEFAULTS.costHighPW) }}
                      style={{ ...outlineBtn, padding: '0.4rem 0.875rem', fontSize: '0.78rem' }}>
                      ↩ Reset to {DATA_DATE} defaults (PKR {DEFAULTS.costLowPW}–{DEFAULTS.costHighPW}/W)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ ...btn, opacity: billNum > 0 ? 1 : 0.4 }} onClick={() => billNum > 0 && setStep(2)} disabled={billNum <= 0}>
                Next: Add Appliances →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '0.4rem', fontSize: '1.2rem' }}>🔌 Select Your Appliances</h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem', marginTop: 0 }}>
              Toggle what you use daily — improves accuracy. Skip to use bill-only estimate.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {appliances.map(a => {
                const on = !!selected[a.id]
                return (
                  <div key={a.id} style={{ background: on ? '#172554' : '#1e293b', border: `1px solid ${on ? '#3b82f6' : '#334155'}`, borderRadius: '10px', padding: '0.75rem 1rem', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => toggleAppliance(a.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.35rem' }}>{a.icon}</span>
                        <div>
                          <div style={{ color: on ? '#e2e8f0' : '#94a3b8', fontWeight: 600, fontSize: '0.875rem' }}>{a.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{a.watts}W</div>
                        </div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: on ? '#3b82f6' : '#334155', border: `2px solid ${on ? '#3b82f6' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', flexShrink: 0 }}>{on ? '✓' : ''}</div>
                    </div>
                    {on && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '0.2rem' }}>Qty</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <button onClick={e => { e.stopPropagation(); changeQty(a.id, -1) }} style={smallBtn}>−</button>
                            <span style={{ color: '#e2e8f0', minWidth: 18, textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{a.qty}</span>
                            <button onClick={e => { e.stopPropagation(); changeQty(a.id, +1) }} style={smallBtn}>+</button>
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '0.2rem' }}>Hrs/day</div>
                          <input type="number" value={a.hours} min="0.5" max="24" step="0.5"
                            onChange={e => changeHours(a.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '3.5rem', padding: '0.2rem 0.35rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#f1f5f9', fontFamily: FONT, fontSize: '0.82rem' }} />
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                          {((a.watts * a.hours * a.qty) / 1000).toFixed(1)} kWh/day
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={outlineBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={btn} onClick={goToStep3}>Calculate Results →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTS ── */}
        {step === 3 && results && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.2rem' }}>📊 Your Solar Estimate</h2>
              <span style={{ color: '#475569', fontSize: '0.72rem' }}>{DATA_DATE} market rates</span>
            </div>

            {/* Verdict */}
            <div style={{ ...card, border: `1px solid ${results.verdictColor}40`, background: `${results.verdictColor}10`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.25rem', flexShrink: 0 }}>{results.verdictIcon}</span>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.15rem' }}>Is Solar Worth It? (2026 net billing)</div>
                <div style={{ color: results.verdictColor, fontWeight: 700, fontSize: '1.2rem' }}>{results.verdict}</div>
                <div style={{ color: '#64748b', fontSize: '0.77rem', marginTop: '0.2rem' }}>
                  PKR {fmt(billNum)}/month · {CITIES[cityIdx].name} · {selfConsume}% self-consumption · {netBilling ? `export @PKR ${buybackRate}/unit` : 'no export'}
                </div>
              </div>
            </div>

            {/* Why this verdict */}
            <div style={{ ...card, background: '#0f1c2e', border: '1px solid #1e3a5f' }}>
              <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.6rem' }}>🧠 Why "{results.verdict}"?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {results.verdictFactors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.82rem', flexShrink: 0, lineHeight: '1.5' }}>{f.icon}</span>
                    <span style={{ color: f.color, fontSize: '0.78rem', lineHeight: 1.6 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {[
                { icon: '🔆', label: 'System Size',    value: `${results.sysKwLo}–${results.sysKwHi} kW`,             sub: 'On-grid, Tier-1 panels' },
                { icon: '💰', label: 'Install Cost',    value: `PKR ${fmt(results.costLo)}–${fmt(results.costHi)}`,     sub: `Panels + inverter + labor (battery separate) · ${netBilling ? `+PKR ${fmt(NB_FEE_LO)}–${fmt(NB_FEE_HI)} NB fee` : 'No NB fee'}` },
                { icon: '📉', label: 'Monthly Savings', value: `~PKR ${fmt(results.totalSavings)}`,                     sub: `${results.monthlyGen} kWh generated` },
                { icon: '🧾', label: 'Post-Solar Bill', value: `~PKR ${fmt(results.postSolarBill)}`,                    sub: results.postSolarBill < 1000 ? '🎉 Near-zero bill!' : `Down from PKR ${fmt(billNum)}` },
                { icon: '📆', label: 'Payback Period',  value: `~${results.paybackYrs} yrs`,                           sub: 'Net billing model (2026)' },
                { icon: '💹', label: 'Annual Savings',  value: `PKR ${fmt(results.annualSavings)}`,                     sub: 'After payback: free energy' },
              ].map(m => (
                <div key={m.label} style={{ ...card, marginBottom: 0 }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{m.icon}</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.15rem' }}>{m.label}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{m.value}</div>
                  <div style={{ color: '#475569', fontSize: '0.7rem', lineHeight: 1.4 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Savings breakdown */}
            <div style={{ ...card, background: '#0c1a2e', border: '1px solid #1e3a5f' }}>
              <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>📋 Monthly Savings Breakdown (2026 Net Billing)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Row label={`🏠 Self-consumed (${selfConsume}%)`} detail={`${results.selfConsumedKwh} kWh × PKR ${importTariff}/unit`} value={`PKR ${fmt(results.selfSavings)}`} color="#86efac" />
                {netBilling && (
                  <Row label={`📤 Exported (${100-selfConsume}%)`} detail={`${results.exportedKwh} kWh × PKR ${buybackRate}/unit`} value={`PKR ${fmt(results.exportRevenue)}`} color="#7dd3fc" />
                )}
                <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Total Monthly Savings</span>
                  <span style={{ color: ACCENT, fontWeight: 700, fontSize: '1rem' }}>PKR {fmt(results.totalSavings)}</span>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569', background: '#0f172a', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                💡 Under old net metering (pre-2025), your export would earn ~PKR 27/unit → estimated old savings: PKR {fmt(results.exportedKwh * 27 + results.selfSavings)}. Now only PKR {fmt(results.totalSavings)}. Self-consumption is your best strategy.
              </div>
            </div>

            {/* Right-sizing tip replaced by Options Comparison below */}

            {/* Options Comparison — shown when net billing + smaller alt system is meaningful */}
            {results.showAltCompare && (
              <div style={{ ...card, background: '#0c1a2e', border: '1px solid #1e3a5f' }}>
                <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>📊 Compare Your Two Best Options</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {/* Option A */}
                  <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.75rem', border: '1px solid #1e3a5f' }}>
                    <div style={{ color: '#7dd3fc', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Option A (current)</div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full System + Net Billing</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <OptRow k="System" v={`${results.sysKwLo}–${results.sysKwHi} kW`} />
                      <OptRow k="Install" v={`PKR ${fmt(results.costLo)}–${fmt(results.costHi)}`} />
                      <OptRow k="NB fee" v={`PKR ${fmt(NB_FEE_LO)}–${fmt(NB_FEE_HI)}`} warn />
                      <OptRow k="Monthly savings" v={`PKR ${fmt(results.totalSavings)}`} />
                      <OptRow k="Payback" v={`${results.paybackYrs} yrs`} warn={parseFloat(results.paybackYrs) > 6} />
                      <OptRow k="10-yr net gain" v={`PKR ${fmt(results.tenYrFull)}`} good={!results.altIsBetter} warn={results.altIsBetter} />
                    </div>
                  </div>
                  {/* Option B */}
                  <div style={{ background: '#0f172a', borderRadius: '8px', padding: '0.75rem', border: results.altIsBetter ? '1px solid #22c55e60' : '1px solid #1e3a5f' }}>
                    <div style={{ color: results.altIsBetter ? '#86efac' : '#64748b', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Option B {results.altIsBetter ? '⭐ Better ROI' : ''}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>Self-Consumption Only</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <OptRow k="System" v={`${results.altSysKw} kW (smaller)`} good />
                      <OptRow k="Install" v={`PKR ${fmt(results.altCostLo)}–${fmt(results.altCostHi)}`} good />
                      <OptRow k="NB fee" v="None needed" good />
                      <OptRow k="Monthly savings" v={`PKR ${fmt(results.altMonthlySave)}`} />
                      <OptRow k="Payback" v={`${results.altPaybackFmt} yrs`} good={parseFloat(results.altPaybackFmt) < parseFloat(results.paybackYrs)} />
                      <OptRow k="10-yr net gain" v={`PKR ${fmt(results.tenYrAlt)}`} good={results.altIsBetter} />
                    </div>
                  </div>
                </div>
                <div style={{ background: results.altIsBetter ? '#14532d20' : '#1e3a5f20', borderRadius: '6px', padding: '0.625rem 0.75rem', fontSize: '0.78rem', lineHeight: 1.6, color: results.altIsBetter ? '#86efac' : '#7dd3fc' }}>
                  {results.altIsBetter
                    ? `💡 Option B earns PKR ${fmt(results.tenYrAlt - results.tenYrFull)} more over 10 years despite lower monthly savings — because lower upfront cost (no NB fee, smaller system) compounds faster. Best if you can't shift usage to daytime.`
                    : `✅ Option A earns PKR ${fmt(results.tenYrFull - results.tenYrAlt)} more over 10 years — net billing makes sense for your usage pattern. The PKR ${fmt((NB_FEE_LO + NB_FEE_HI) / 2)} fee is justified by your export revenue and self-consumption level.`
                  }
                </div>
              </div>
            )}

            {/* Battery card */}
            <div style={{ ...card, border: `1px solid ${results.needsBattery ? '#fbbf2440' : '#33415560'}`, background: results.needsBattery ? '#451a0318' : '#1e293b' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🔋</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Battery Storage — {results.needsBattery ? '⚠️ Recommended' : 'Optional'}</div>
                    <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, background: '#451a0330', borderRadius: '6px', padding: '0.1rem 0.4rem' }}>PKR {fmt(BATT_LO)}–{fmt(BATT_HI)} (5–6 kWh)</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.35rem 0 0.6rem', lineHeight: 1.6 }}>
                    {results.needsBattery
                      ? `${loadshed} hrs load-shedding: on-grid inverter = no power during outages. Battery keeps fans, lights & router running. Also converts export (PKR ${buybackRate}/unit) into self-use (PKR ${importTariff}/unit) — faster payback.`
                      : `Minimal load-shedding. Battery optional — increases self-consumption and adds backup. Can be retrofitted later.`}
                  </p>
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.4rem', fontWeight: 600 }}>April 2026 market prices (LiFePO₄, verified — down 15–18% from 2025):</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {BATTERIES.map(b => (
                        <div key={b.brand} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{b.brand}</span>
                            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{b.cap}</span>
                            {b.flag && <span style={{ background: '#14532d30', color: '#86efac', fontSize: '0.65rem', borderRadius: '4px', padding: '0.1rem 0.3rem' }}>{b.flag}</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700 }}>PKR {fmt(b.lo)}–{fmt(b.hi)}</span>
                            <span style={{ color: '#475569', fontSize: '0.65rem' }}>{b.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized expert tips */}
            {results.expertTips.length > 0 && (
              <div style={{ ...card, background: '#161f2e', border: '1px solid #2d3f55' }}>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.6rem' }}>💬 Expert Tips for Your Situation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {results.expertTips.map((tip, i) => (
                    <div key={i} style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.65, background: '#0f172a', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quote checklist — collapsible */}
            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 What to ask your installer before signing</span>
                <span style={{ fontSize: '0.72rem', color: '#475569' }}>tap to expand ▼</span>
              </summary>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { q: 'Panel brand & model?', a: 'JA Solar, LONGi, Canadian Solar, or Jinko preferred. Ask for NEPRA-approved list. Avoid no-brand.' },
                    { q: 'Panel type?', a: 'Mono-PERC is minimum standard. N-type bifacial gives 5–10% more output — worth paying for in Pakistan heat.' },
                    { q: 'Inverter brand & warranty?', a: 'Growatt, Solis, Sofar = reliable with local service centres. Insist on 5yr minimum (10yr preferred) warranty in writing.' },
                    { q: 'Is net billing application included?', a: 'Many quotes exclude DISCO paperwork, NEPRA license, and meter procurement. Clarify what\'s included before comparing prices.' },
                    { q: 'Who handles DISCO smart meter?', a: 'Installer should coordinate with DISCO. LESCO meter costs PKR 70k and must be bought from LESCO — no private purchase allowed.' },
                    { q: 'Panel warranty terms?', a: '10-year product warranty + 25-year linear power output warranty. Get it in writing. Verify the manufacturer warranty, not just the installer warranty.' },
                    { q: 'Remote monitoring access?', a: 'Ask for SolarmanPV or Growatt ShinePhone app access. You should be able to see live generation from your phone.' },
                    { q: 'Hybrid inverter or pure on-grid?', a: 'Hybrid costs PKR 20–30k more but supports future battery addition without replacing the inverter. Strongly recommended.' },
                    { q: 'AEDB registered installer?', a: 'Alternative Energy Development Board registration is a baseline legitimacy check. Ask for their registration number.' },
                    { q: 'Payment terms?', a: 'Never pay more than 20–30% upfront. Pay majority on equipment delivery, balance on system commissioning and DISCO approval.' },
                  ].map((item, i) => (
                    <div key={i} style={{ borderBottom: i < 9 ? '1px solid #1e293b' : 'none', paddingBottom: i < 9 ? '0.5rem' : 0 }}>
                      <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.15rem' }}>❓ {item.q}</div>
                      <div style={{ color: '#64748b', fontSize: '0.74rem', lineHeight: 1.55 }}>→ {item.a}</div>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#334155', fontSize: '0.7rem', marginTop: '0.75rem' }}>
                  Always get at least 3 written quotes. The cheapest quote often has hidden costs (excluded NB application, cheap panels, no warranty support).
                </div>
              </div>
            </details>

            {/* Calc transparency */}
            <div style={{ ...card, background: '#0f172a', border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.8 }}>
                📐 <strong style={{ color: '#94a3b8' }}>How we calculated:</strong><br />
                Load: {results.dailyKwh} kWh/day ÷ {CITIES[cityIdx].sun} sun hrs ÷ 0.80 derate = <strong style={{ color: '#e2e8f0' }}>{results.sysKw} kW recommended</strong><br />
                Generation: {results.sysKw} kW × {CITIES[cityIdx].sun} hrs × 30 days × 0.80 = <strong style={{ color: '#e2e8f0' }}>{results.monthlyGen} kWh/month</strong><br />
                Self-consumed (capped at actual usage): {results.selfConsumedKwh} kWh × PKR {importTariff} = PKR {fmt(results.selfSavings)}<br />
                {netBilling ? `Exported (generation − self-consumed): ${results.exportedKwh} kWh × PKR ${buybackRate} = PKR ${fmt(results.exportRevenue)}` : 'No export (net billing off)'}<br />
                Cost range: {results.sysKwLo}kW×PKR {costLoPW}/W to {results.sysKwHi}kW×PKR {costHiPW}/W = PKR {fmt(results.costLo)}–{fmt(results.costHi)}<br />
                Payback uses mid-size ({results.sysKw}kW) at avg PKR {Math.round((costLoPW+costHiPW)/2)}/W{netBilling ? ` + PKR ${fmt(NB_FEE_LO)}–${fmt(NB_FEE_HI)} net billing fee (IESCO–LESCO)` : ''}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#451a0318', border: '1px solid #451a0340', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <p style={{ color: '#92400e', fontSize: '0.75rem', margin: 0, lineHeight: 1.6 }}>
                ⚠️ Planning estimates based on verified Pakistan market data ({DATA_DATE}). NEPRA net billing export rate (PKR {buybackRate}/unit) set Dec 2025 — verify with your DISCO. 10% GST on imported panels (Finance Act 2025). Get 2–3 installer quotes before investing.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button style={outlineBtn} onClick={() => { setStep(1); setResults(null) }}>← Start Over</button>
              <button style={{ ...btn, background: copied ? '#22c55e' : ACCENT }} onClick={copyText}>
                {copied ? '✓ Copied!' : '📋 Copy Estimate'}
              </button>
              <button style={{ ...outlineBtn, color: '#7dd3fc', border: '1px solid #1e3a5f' }} onClick={generatePDF}>
                📄 Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

function Toggle({ on }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: '10px', background: on ? '#22c55e' : '#334155', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 18 : 2, transition: 'left 0.2s' }} />
    </div>
  )
}

function Row({ label, detail, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</div>
        <div style={{ color: '#475569', fontSize: '0.72rem' }}>{detail}</div>
      </div>
      <span style={{ color, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{value}</span>
    </div>
  )
}

function AdvField({ label, hint, value, onChange, numInput }) {
  return (
    <div>
      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min="0" style={numInput} />
      <div style={{ color: '#475569', fontSize: '0.68rem', marginTop: '0.2rem' }}>{hint}</div>
    </div>
  )
}

function OptRow({ k, v, good, warn }) {
  const color = good ? '#86efac' : warn ? '#fbbf24' : '#94a3b8'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
      <span style={{ color: '#475569', fontSize: '0.72rem' }}>{k}</span>
      <span style={{ color, fontSize: '0.72rem', fontWeight: good || warn ? 700 : 400, textAlign: 'right' }}>{v}</span>
    </div>
  )
}

const smallBtn = { width: 22, height: 22, borderRadius: '4px', background: '#334155', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: 0 }
