import test from 'node:test'
import assert from 'node:assert/strict'
import { planStock, STOCK_SAMPLES } from '../../src/lib/stockPlanner.js'

const base = { name: 'Test', onHand: 120, reserved: 20, dailyUse: 20, leadDays: 7, safetyDays: 2, reviewDays: 3, onOrder: 0, arrivalDays: 0, packSize: 12, minimumOrder: 24, unitCost: 180, shelfDays: 0 }
test('subtracts committed stock and rounds demand to supplier packs', () => {
  const r = planStock(base)
  assert.equal(r.available, 100)
  assert.equal(r.target, 240)
  assert.equal(r.quantity, 144)
  assert.equal(r.cost, 25920)
  assert.equal(r.status, 'Critical')
})
test('a late confirmed order is counted once but cannot mask an early stockout', () => {
  const r = planStock({ ...base, onOrder: 200, arrivalDays: 8 })
  assert.equal(r.quantity, 0)
  assert.equal(r.status, 'Critical')
  assert.equal(r.lateIncoming, true)
  assert.equal(r.projectedCover, 5)
})
test('a timely delivery bridges the gap', () => {
  const r = planStock({ ...base, onOrder: 200, arrivalDays: 4 })
  assert.equal(r.projectedCover, 15)
  assert.equal(r.status, 'Covered')
})
test('zero usage creates no speculative order', () => {
  const r = planStock({ ...base, dailyUse: 0 })
  assert.equal(r.coverDays, null)
  assert.equal(r.status, 'Check usage')
  assert.equal(r.quantity, 0)
  assert.ok(r.warnings.length)
})
test('minimum order can create an expiry risk that needs review', () => {
  const r = planStock({ ...base, onHand: 1, reserved: 0, dailyUse: 1, minimumOrder: 24, shelfDays: 5 })
  assert.equal(r.quantity, 24)
  assert.equal(r.shelfRisk, true)
})
test('overcommitted stock is visible rather than negative available stock', () => {
  const r = planStock({ ...base, reserved: 150 })
  assert.equal(r.available, 0)
  assert.equal(r.status, 'Critical')
  assert.match(r.warnings[0], /exceeds/)
})
test('does not order when available stock equals the target', () => assert.equal(planStock({ ...base, onHand: 260 }).quantity, 0))
test('fractional pack quantities do not accumulate rounding errors', () => assert.equal(planStock({ ...base, dailyUse: 0.1, onHand: 0, reserved: 0, minimumOrder: 0, packSize: 0.1 }).quantity, 1.2))
test('rejects blank, nonfinite, negative and zero pack inputs', () => {
  for (const value of ['', NaN, Infinity, -1]) assert.throws(() => planStock({ ...base, dailyUse: value }), RangeError)
  assert.throws(() => planStock({ ...base, packSize: 0 }), RangeError)
})
test('all demonstration datasets produce finite outputs', () => {
  for (const rows of Object.values(STOCK_SAMPLES)) for (const row of rows) {
    const r = planStock(row)
    assert.ok(Number.isFinite(r.quantity) && Number.isFinite(r.cost))
  }
})
