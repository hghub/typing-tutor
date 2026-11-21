import test from 'node:test'
import assert from 'node:assert/strict'
import { salarySlipTotals } from '../../src/lib/salarySlip.js'
const sample = () => ({ month: '2026-11', basic: '200000', hra: '30000', medical: '10000', conveyance: '10000', otherAllowance: '0', tax: '23000', eobi: '0', customDeduction: '10000' })
test('slip reconciles entered payroll deductions without inferring liability', () => {
  assert.deepEqual(salarySlipTotals(sample()), { grossSalary: 250000, monthlyTax: 23000, employeeEobi: 0, totalDeductions: 33000, netSalary: 217000 })
  assert.equal(salarySlipTotals({ ...sample(), tax: '0', eobi: '600' }).netSalary, 239400)
})
test('tax and EOBI each require an explicit value including zero', () => {
  for (const key of ['tax', 'eobi']) for (const value of ['', undefined, null]) assert.throws(() => salarySlipTotals({ ...sample(), [key]: value }), /enter an amount/)
})
test('fractional rupees remain exact through gross and deductions', () => {
  const r = salarySlipTotals({ ...sample(), basic: '0.29', hra: '0.01', medical: '0', conveyance: '0', tax: '0.10', customDeduction: '0.01' })
  assert.equal(r.grossSalary, 0.30); assert.equal(r.totalDeductions, 0.11); assert.equal(r.netSalary, 0.19)
})
test('invalid, excessive and incomplete amounts or periods block a draft', () => {
  for (const value of ['-1', 'NaN', 'Infinity', '1e5', '1,000', '0.001', '100000000', '']) assert.throws(() => salarySlipTotals({ ...sample(), basic: value }))
  for (const month of ['', '2026-00', '2026-13', '2026-1', '2026-11<script>']) assert.throws(() => salarySlipTotals({ ...sample(), month }))
  assert.throws(() => salarySlipTotals({ ...sample(), tax: '250000.01', customDeduction: '0' }), /exceed gross/)
})
test('zero net pay is allowed and calculation never changes source inputs', () => {
  const s = { ...sample(), tax: '250000', customDeduction: '0' }, before = structuredClone(s)
  assert.equal(salarySlipTotals(s).netSalary, 0); assert.deepEqual(s, before)
})
