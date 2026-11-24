// Scenario arithmetic only: no live tariffs, market prices or battery dispatch model.
export const SOLAR_SAMPLE = Object.freeze({ monthlyLoad: 600, systemKw: 5, sunHours: 5, deratePct: 80, selfUsePct: 60, importRate: 40, exportRate: 0, exportMode: 'none', quote: 800000, connectionCost: 50000, batteryCost: 0, annualMaintenance: 10000, degradationPct: 0.5, replacementYear: 10, replacementCost: 0 })
const bounds = { monthlyLoad: [0, 1000000], systemKw: [0.1, 1000], sunHours: [0.1, 12], deratePct: [1, 100], selfUsePct: [0, 100], importRate: [0, 1000], exportRate: [0, 1000], quote: [1, 1e9], connectionCost: [0, 1e9], batteryCost: [0, 1e9], annualMaintenance: [0, 1e8], degradationPct: [0, 20], replacementYear: [1, 30], replacementCost: [0, 1e9] }
export function planSolar(input) {
  const label = key => ({ monthlyLoad: 'Monthly electricity use', systemKw: 'PV capacity', sunHours: 'Peak sun hours', deratePct: 'Output after losses', selfUsePct: 'Self-use percentage', importRate: 'Avoidable import charge', exportRate: 'Export rate', quote: 'PV quote', connectionCost: 'Additional connection cost', batteryCost: 'Additional battery cost', annualMaintenance: 'Annual maintenance', degradationPct: 'Annual generation decline', replacementYear: 'Replacement year', replacementCost: 'Replacement cost' })[key]
  const p = {}
  for (const [key, [lo, hi]] of Object.entries(bounds)) {
    if (input[key] === '' || input[key] == null || !['number', 'string'].includes(typeof input[key]) || String(input[key]).trim() === '') throw new Error(`Enter ${label(key)}; use 0 explicitly where appropriate.`)
    const n = Number(input[key])
    if (!Number.isFinite(n) || n < lo || n > hi) throw new Error(`${label(key)} must be between ${lo} and ${hi}.`)
    p[key] = n
  }
  if (!Number.isInteger(p.replacementYear)) throw new Error('Replacement year must be a whole year.')
  if (!['none', 'net-billing'].includes(input.exportMode)) throw new Error('Existing-agreement billing is not modelled. Confirm your agreement with the licensee.')
  const upfront = p.quote + p.connectionCost + p.batteryCost
  const energy = year => {
    const generation = p.systemKw * p.sunHours * 30 * p.deratePct / 100 * (1 - p.degradationPct / 100) ** (year - 1)
    const selfUsed = Math.min(p.monthlyLoad, generation * p.selfUsePct / 100)
    const surplus = generation - selfUsed
    const exported = input.exportMode === 'net-billing' ? surplus : 0
    const curtailed = surplus - exported
    const selfSavings = selfUsed * p.importRate
    const exportCredit = exported * p.exportRate
    return { generation, selfUsed, exported, curtailed, selfSavings, exportCredit }
  }
  let cumulative = -upfront
  const years = []
  for (let year = 1; year <= 30; year++) {
    const e = energy(year)
    const replacement = year === p.replacementYear ? p.replacementCost : 0
    const net = 12 * (e.selfSavings + e.exportCredit) - p.annualMaintenance - replacement
    cumulative += net
    years.push({ year, net, cumulative, replacement })
  }
  // End-of-year recovery must remain recovered through the model horizon;
  // a later replacement can undo an earlier apparent crossing.
  const recovery = years.find((row, i) => row.cumulative >= 0 && years.slice(i).every(later => later.cumulative >= 0))
  return { ...energy(1), upfront, firstYearNet: years[0].net, recoveryYear: recovery?.year ?? null, years, finalNet: cumulative }
}
export function solarSummary(input, r) {
  return ['Rafiqy solar scenario — illustrative, not a quote or electricity bill', 'Policy review: 24 November 2026. New net-billing scenario or no export value; existing-agreement billing excluded.', ...Object.entries(input).map(([key, value]) => `${key}: ${value}`), `Upfront PKR: ${r.upfront}`, `Monthly generation kWh: ${r.generation.toFixed(2)}`, `Monthly self-use kWh: ${r.selfUsed.toFixed(2)}`, `Monthly export kWh: ${r.exported.toFixed(2)}`, `Monthly unvalued/curtailed surplus kWh: ${r.curtailed.toFixed(2)}`, `Monthly avoided energy charge PKR: ${r.selfSavings.toFixed(2)}`, `Monthly export credit PKR: ${r.exportCredit.toFixed(2)}`, `First-year net benefit PKR: ${r.firstYearNet.toFixed(2)}`, `End-of-year cost recovery sustained through year 30: ${r.recoveryYear ?? 'not reached'}`, `30-year nominal net after upfront PKR: ${r.finalNet.toFixed(2)}`, 'One 30-day month repeated twelve times with flat load/sun/self-use assumptions; annual generation degradation. Replacement cost in selected year. No financing, discounting, inflation, hourly dispatch, bill taxes/fixed charges or future tariff changes. Battery price is included but backup and extra self-use are not simulated. Validate quotes, sanctioned load, roof design, agreement and export rate with installer/licensee.'].join('\n')
}
