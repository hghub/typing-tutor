import test from 'node:test'
import assert from 'node:assert/strict'
import { SOLAR_SAMPLE, planSolar, solarSummary } from '../../src/lib/solarPlanner.js'
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`)
test('synthetic quote reconciles energy and all entered costs', () => {
  const r = planSolar(SOLAR_SAMPLE)
  near(r.generation, 600); near(r.selfUsed, 360); near(r.curtailed, 240)
  near(r.exported, 0); near(r.selfSavings, 14400); near(r.upfront, 850000); near(r.firstYearNet, 162800)
  near(r.finalNet, r.years.reduce((n, row) => n + row.net, -r.upfront))
  assert.equal(r.recoveryYear, 6)
})
test('load cap and export or curtailment conserve generation across scenarios', () => {
  for (const monthlyLoad of [0, 100, 600, 10000]) for (const selfUsePct of [0, 60, 100]) for (const exportMode of ['none', 'net-billing']) {
    const r = planSolar({ ...SOLAR_SAMPLE, monthlyLoad, selfUsePct, exportMode, exportRate: 10 })
    near(r.selfUsed + r.exported + r.curtailed, r.generation)
    assert.ok(r.selfUsed <= monthlyLoad)
    near(r.exportCredit, r.exported * 10)
    if (exportMode === 'none') near(r.exportCredit, 0)
  }
})
test('quote extras and replacement are counted once; no invented battery benefit', () => {
  const a = planSolar(SOLAR_SAMPLE)
  const b = planSolar({ ...SOLAR_SAMPLE, batteryCost: 200000, replacementCost: 100000, replacementYear: 10 })
  near(b.upfront - a.upfront, 200000); near(b.selfUsed, a.selfUsed)
  near(a.years[9].net - b.years[9].net, 100000)
  near(a.finalNet - b.finalNet, 300000)
})
test('no-benefit and unrecoverable cases do not return a fictional payback', () => {
  assert.equal(planSolar({ ...SOLAR_SAMPLE, importRate: 0 }).recoveryYear, null)
  assert.equal(planSolar({ ...SOLAR_SAMPLE, quote: 1e9 }).recoveryYear, null)
  const r = planSolar({ ...SOLAR_SAMPLE, quote: 1000, connectionCost: 0, replacementCost: 1e9, replacementYear: 30 })
  assert.ok(r.years[0].cumulative > 0); assert.equal(r.recoveryYear, null)
})
test('zero degradation gives auditable flat benefit and replacement at year one', () => {
  const r = planSolar({ ...SOLAR_SAMPLE, degradationPct: 0, replacementYear: 1, replacementCost: 5000 })
  near(r.firstYearNet, 157800); near(r.years[1].net, 162800)
  near(r.finalNet, 30 * 162800 - 5000 - 850000)
  assert.ok(planSolar(SOLAR_SAMPLE).finalNet < planSolar({ ...SOLAR_SAMPLE, degradationPct: 0 }).finalNet)
})
test('blank, nonfinite, unsupported regime and invalid bounds suppress results', () => {
  for (const key of Object.keys(SOLAR_SAMPLE).filter(k => k !== 'exportMode')) for (const value of ['', ' ', null, NaN, Infinity, true, -1]) assert.throws(() => planSolar({ ...SOLAR_SAMPLE, [key]: value }))
  for (const patch of [{ selfUsePct: 101 }, { deratePct: 0 }, { replacementYear: 2.5 }, { systemKw: 0 }, { exportMode: 'legacy' }]) assert.throws(() => planSolar({ ...SOLAR_SAMPLE, ...patch }))
})
test('summary carries every assumption, limits and matching results without mutation', () => {
  const p = { ...SOLAR_SAMPLE }; const before = JSON.stringify(p); const r = planSolar(p)
  const text = solarSummary(p, r)
  for (const key of Object.keys(p)) assert.ok(text.includes(`${key}: ${p[key]}`))
  assert.ok(text.includes('850000')); assert.ok(text.includes('not a quote')); assert.ok(text.includes('existing-agreement billing excluded'))
  assert.equal(JSON.stringify(p), before)
})

test('all eight paired guides retain complete canonical official PDF links after markdown generation', async () => {
  const { SOLAR_SOURCES } = await import('../../src/data/solarPolicy.js')
  const slugs = ['solar-planner-pakistan', '5kw-solar-system-price-in-pakistan', '10kw-solar-system-price-in-pakistan', 'how-much-solar-do-i-need-for-a-20000-bill-in-pakistan', 'how-much-solar-do-i-need-for-a-30000-bill-in-pakistan', 'smaller-solar-system-vs-net-billing-pakistan', 'should-you-add-a-battery-to-solar-in-pakistan', 'hybrid-vs-on-grid-solar-in-pakistan']
  for (const slug of slugs) {
    const { default: html } = await import(`../../src/data/blogContent/decision-support/${slug}.js`)
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => decodeURIComponent(m[1]))
    for (const source of SOLAR_SOURCES) assert.ok(hrefs.includes(decodeURIComponent(source.url)), `${slug}: missing full ${source.label} link`)
    assert.ok(hrefs.includes('/tools/solar-planner'))
    assert.ok(html.includes('24 November 2026'))
    assert.ok(!html.includes('December 2025'))
  }
})
