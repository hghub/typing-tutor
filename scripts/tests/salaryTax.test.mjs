import test from 'node:test'
import assert from 'node:assert/strict'
import { estimateSalaryTax } from '../../src/lib/salaryTax.js'

// Independent expected amounts from the published TY 2027 table, not from rule objects.
for (const [income, expected] of [[0, 0], [600000, 0], [1200000, 6000], [2200000, 116000],
  [3200000, 316000], [4100000, 541000], [5600000, 976000], [7000000, 1424000], [10000000, 2474000], [12000000, 3174000]]) {
  test(`TY 2027 annual salary ${income} gives tax ${expected}`, () => {
    assert.ok(Math.abs(estimateSalaryTax(income).tax - expected) < 1e-7)
  })
}
test('fractional rupees immediately above every boundary remain in a valid slab', () => {
  for (const [boundary, rate] of [[600000, .01], [1200000, .11], [2200000, .20], [3200000, .25], [4100000, .29], [5600000, .32], [7000000, .35]]) {
    const before = estimateSalaryTax(boundary).tax
    assert.ok(Math.abs(estimateSalaryTax(boundary + .5).tax - before - rate * .5) < 1e-7)
  }
})
test('historical salaried surcharge applies strictly above 10 million only', () => {
  assert.equal(estimateSalaryTax(10000000, 2026).surcharge, 0)
  const r = estimateSalaryTax(12000000, 2026)
  assert.equal(r.baseTax, 3381000)
  assert.equal(r.surcharge, 304290)
  assert.equal(r.tax, 3685290)
})
test('TY 2027 removes salaried surcharge and reports effective rate after tax', () => {
  const r = estimateSalaryTax(12000000)
  assert.equal(r.surcharge, 0)
  assert.equal(r.effectiveRate, r.tax / 12000000)
  assert.equal(r.averageMonthlyTax * 12, r.tax)
  assert.equal(r.annualNet + r.tax, 12000000)
})
test('unsupported years and invalid or out-of-scope incomes fail explicitly', () => {
  for (const value of ['', undefined, NaN, Infinity, -1, 100000001]) assert.throws(() => estimateSalaryTax(value), RangeError)
  assert.throws(() => estimateSalaryTax(1000000, 2025), RangeError)
})
