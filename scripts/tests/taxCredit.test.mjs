import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { TAX_CREDIT_SAMPLE, TAX_CREDIT_SOURCE, planTaxCredit, taxCreditSummary } from '../../src/lib/taxCredit.js'
const sample = { ...TAX_CREDIT_SAMPLE, basisConfirmed: true, eligibilityConfirmed: true }
test('reviewed example uses average assessed-tax basis, not a marginal rate or salary slab', () => {
  const r = planTaxCredit(sample)
  assert.equal(r.credit, 2760000); assert.equal(r.taxAfter, 24840000)
  assert.equal(r.payment, 30000000); assert.equal(r.cap, 60000000)
})
test('pension, non-associate and associate donation caps differ with exact over-cap amounts', () => {
  for (const [kind, relationship, cap, credit] of [['pension', 'unrelated', 60000000, 5520000], ['donation', 'unrelated', 90000000, 8280000], ['donation', 'associate', 45000000, 4140000]]) {
    const r = planTaxCredit({ ...sample, payment: '1000000', kind, relationship })
    assert.equal(r.eligible, cap); assert.equal(r.credit, credit)
    assert.equal(r.excess + r.eligible, 100000000)
  }
})
test('zero tax and explicit zero contributions produce zero credit, not refunds', () => {
  assert.equal(planTaxCredit({ ...sample, taxBeforeCredits: '0' }).credit, 0)
  const r = planTaxCredit({ ...sample, payment: '0', eligibilityConfirmed: false })
  assert.equal(r.credit, 0); assert.equal(r.taxAfter, r.tax)
})
test('unknown or unsupported cases and missing confirmation cannot produce eligibility or credits', () => {
  for (const patch of [{ basisConfirmed: false }, { basisConfirmed: 'true' }, { eligibilityConfirmed: false }, { kind: 'insurance' }, { kind: 'donation', relationship: 'mixed' }, { kind: 'donation', relationship: '' }, { taxableIncome: '0' }, { taxBeforeCredits: '3000001' }]) assert.throws(() => planTaxCredit({ ...sample, ...patch }))
})
test('invalid, blank, excessive and non-money inputs are rejected rather than silently zeroed', () => {
  for (const key of ['taxableIncome', 'taxBeforeCredits', 'payment']) for (const value of ['', ' ', null, undefined, NaN, Infinity, true, '-1', '1e6', '1.001', '100000001', '5abc', '0'.repeat(1000), [], {}]) assert.throws(() => planTaxCredit({ ...sample, [key]: value }))
})
test('integer arithmetic preserves money and conservative cap rounding across 144 scenarios', () => {
  let checked = 0
  for (const income of ['1.01', '1000.07', '100000000']) for (const tax of ['0', '0.01', '0.50', '1.01']) for (const payment of ['0', '0.01', '0.99', '100000000']) for (const [kind, relationship] of [['pension', 'unrelated'], ['donation', 'unrelated'], ['donation', 'associate']]) {
    const r = planTaxCredit({ ...sample, taxableIncome: income, taxBeforeCredits: tax, payment, kind, relationship })
    assert.equal(r.credit + r.taxAfter, r.tax)
    assert.equal(r.eligible + r.excess, r.payment)
    assert.ok(r.credit <= r.tax && r.credit >= 0)
    assert.equal(r.cap, Number(BigInt(r.income) * BigInt(r.capPct) / 100n))
    checked++
  }
  assert.equal(checked, 144)
  const r = planTaxCredit({ ...sample, taxableIncome: '1.00', taxBeforeCredits: '0.05', payment: '0.10' })
  assert.equal(r.credit, 1) // half a paisa rounds up for the illustration
})
test('report preserves assumptions and discloses boundaries without mutating input', () => {
  const before = JSON.stringify(sample); const r = planTaxCredit(sample); const text = taxCreditSummary(sample, r)
  assert.ok(text.includes('PKR 27600.00')); assert.ok(text.includes('PKR 248400.00'))
  assert.ok(text.includes('1 July 2026–30 June 2027')); assert.ok(text.includes('not verified by Rafiqy'))
  assert.ok(text.includes('No withholding adjustment')); assert.ok(text.includes(TAX_CREDIT_SOURCE))
  assert.equal(JSON.stringify(sample), before)
})
test('insurance credit and obsolete automatic split have no surviving exported engine or UI path', async () => {
  const legacy = await import('../../src/data/taxData.js')
  assert.equal(legacy.optimizeShields, undefined); assert.equal(legacy.calcInsuranceShield, undefined)
  assert.equal(legacy.LIFE_INS_MAX_RATE, undefined)
  const page = await readFile(new URL('../../src/pages/TaxOptimizer.jsx', import.meta.url), 'utf8')
  assert.ok(!page.includes("from '../data/taxData'"))
})
