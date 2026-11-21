import test from 'node:test'
import assert from 'node:assert/strict'
import { planFreelanceReserves } from '../../src/lib/freelanceReserves.js'
const base = { averageMonthlyRevenue: 450000, monthlyBusinessCosts: 70000, monthlyHomeCosts: 180000, annualTaxBudget: 120000, reservePct: 15, emergencyMonths: 6, currentEmergencyFund: 450000, buildMonths: 12 }
test('allocates a separately supplied budget and reconciles cash left for withdrawals', () => {
  const r = planFreelanceReserves(base)
  assert.equal(r.taxReserveMonthly, 10000)
  assert.equal(r.emergencyTarget, 1080000)
  assert.equal(r.emergencyContribution, 52500)
  assert.equal(r.opsReserveMonthly, 67500)
  assert.equal(r.ownerPay, 250000)
  assert.equal(r.ownerPay + 70000 + 10000 + 67500 + 52500, 450000)
  assert.equal(r.runwayMonths, 2.5)
})
test('tax funding is not inferred from revenue or salary slabs', () => {
  assert.equal(planFreelanceReserves({ ...base, averageMonthlyRevenue: 900000 }).taxReserveMonthly, 10000)
  assert.equal(planFreelanceReserves({ ...base, annualTaxBudget: 0 }).taxReserveMonthly, 0)
  assert.throws(() => planFreelanceReserves({ ...base, annualTaxBudget: undefined }), RangeError)
})
test('unfunded allocations remain visible when withdrawal capacity reaches zero', () => {
  const r = planFreelanceReserves({ ...base, averageMonthlyRevenue: 100000 })
  assert.equal(r.ownerPay, 0)
  assert.equal(r.deficit, 47500)
  assert.equal(r.householdGap, 180000)
})
test('stress scenario holds baseline allocations fixed without pretending to recalculate tax', () => {
  const r = planFreelanceReserves(base)
  assert.equal(r.stressOwnerPay, 160000)
  assert.equal(r.stressDeficit, 0)
  assert.equal(planFreelanceReserves({ ...base, averageMonthlyRevenue: 100000 }).stressDeficit, 67500)
})
test('funded targets need no top-up and zero household costs do not create fake runway', () => {
  assert.equal(planFreelanceReserves({ ...base, currentEmergencyFund: 1100000 }).emergencyContribution, 0)
  const r = planFreelanceReserves({ ...base, monthlyHomeCosts: 0 })
  assert.equal(r.runwayMonths, null)
  assert.equal(r.householdGap, 0)
})
test('rejects incomplete, negative and nonfinite cash inputs or invalid planning periods', () => {
  for (const v of ['', NaN, Infinity, -1]) assert.throws(() => planFreelanceReserves({ ...base, annualTaxBudget: v }), RangeError)
  assert.throws(() => planFreelanceReserves({ ...base, reservePct: 101 }), RangeError)
  assert.throws(() => planFreelanceReserves({ ...base, buildMonths: 0 }), RangeError)
})
