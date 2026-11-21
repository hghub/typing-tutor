import test from 'node:test'
import assert from 'node:assert/strict'
import { rentVsBuyDecision } from '../../src/lib/rentVsBuy.js'
import { remainingLoanBalance } from '../../src/lib/decision.js'

const base = { city: 'karachi', propertyPrice: 12000000, monthlyRent: 10000, yearsToStay: 5, downPaymentPct: 25, annualMarkupRate: 12, mortgageYears: 10, annualRentGrowth: 0, annualHomeGrowth: 0, annualMaintenancePct: 1.2, propertyTaxPct: 0.6, transferCostPct: 5, investmentReturnPct: 0 }
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} != ${expected}`)

test('annual holding costs become monthly costs, independently of stay horizon', () => {
  const five = rentVsBuyDecision(base)
  const eight = rentVsBuyDecision({ ...base, yearsToStay: 8 })
  // Annual maintenance 144000 + holding cost 72000 = 18000 per month.
  near(five.monthlySavingsVsBuy, five.emi + 18000 - 10000)
  near(eight.monthlySavingsVsBuy, five.monthlySavingsVsBuy)
  near(five.rentInvestedValue, 3600000 + (five.emi + 8000) * 60)
})
test('mortgage cash payments stop at maturity in the main and shorter-stay cases', () => {
  const r = rentVsBuyDecision({ ...base, yearsToStay: 15, mortgageYears: 5 })
  near(r.totalEmiPaid, r.emi * 60)
  near(r.remainingBalance, 0)
  // For the 13-year sensitivity: downpayment + 60 EMIs + holding + entry - sale proceeds.
  const shortBuy = 3000000 + r.emi * 60 + 216000 * 13 + 600000 - 11400000
  assert.ok(r.sensitivity[2].impact.includes(Math.round(shortBuy).toLocaleString('en-PK')))
})
test('lower-markup sensitivity uses its own outstanding loan balance', () => {
  const r = rentVsBuyDecision(base)
  const low = rentVsBuyDecision({ ...base, annualMarkupRate: 10 })
  const expected = low.buyNetCost
  // Compare the formatted sensitivity against an independently run lower-rate scenario.
  assert.equal(r.sensitivity[0].impact, new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(expected))
  assert.notEqual(remainingLoanBalance(9000000, 10, 10, 60), r.remainingBalance)
})
test('zero financing and a rent gap produce no invented monthly investment', () => {
  const r = rentVsBuyDecision({ ...base, downPaymentPct: 100, annualMaintenancePct: 0, propertyTaxPct: 0 })
  near(r.emi, 0)
  near(r.monthlySavingsVsBuy, 0)
  near(r.rentInvestedValue, 12600000)
  assert.equal(r.breakEvenYears, null)
})
