import test from 'node:test'
import assert from 'node:assert/strict'
import { FUND_SAMPLE, planCommunityFund, fundAmount, fundSummary } from '../../src/lib/communityFund.js'
const sample = () => structuredClone(FUND_SAMPLE)
test('distinguishes collection gap from underfunded service budget', () => {
  const r = planCommunityFund(sample())
  assert.equal(r.netDues, 1100000); assert.equal(r.received, 1050000)
  assert.equal(r.outstanding, 150000); assert.equal(r.credits, 100000)
  assert.equal(r.closingCash, 850000); assert.equal(r.unrestricted, 750000)
  assert.equal(r.remaining, 1300000); assert.equal(r.fundingGap, 550000); assert.equal(r.structuralGap, 400000)
})
test('full collection does not repair an insufficient agreed budget', () => {
  const s = sample(); s.members[1].received = '3000'
  const r = planCommunityFund(s); assert.equal(r.outstanding, 0); assert.equal(r.fundingGap, 400000)
})
test('extra receipts stay protected instead of artificially closing the budget gap', () => {
  const s = sample(); s.members[1].received = '10000'
  const r = planCommunityFund(s); assert.equal(r.credits, 800000); assert.equal(r.structuralGap, 400000); assert.equal(r.fundingGap, 400000)
})
test('partial expenses do not get deducted twice', () => {
  const s = sample(); s.expenses[0].paid = '6000'
  const r = planCommunityFund(s); assert.equal(r.fundingGap, 550000); assert.equal(r.remaining, 1200000); assert.equal(r.closingCash, 750000)
})
test('paid expense above approval, duplicate members and excess reduction fail', () => {
  const a = sample(); a.expenses[0].paid = '20000'; assert.throws(() => planCommunityFund(a))
  const b = sample(); b.members[1].id = b.members[0].id; assert.throws(() => planCommunityFund(b))
  const c = sample(); c.members[0].waived = '3001'; assert.throws(() => planCommunityFund(c))
})
test('negative unrestricted cash remains visible for reconciliation', () => {
  const s = sample(); s.opening = '0'; s.members.forEach(r => { r.received = '0' })
  assert.equal(planCommunityFund(s).reconcile, true)
})
test('zero dues and receipt create no invented outstanding balance', () => {
  const s = sample(); s.members = [{ id: 'X', agreed: '0', waived: '0', received: '10' }]
  const r = planCommunityFund(s); assert.equal(r.outstanding, 0); assert.equal(r.credits, 1000); assert.equal(r.members[0].status, 'No amount due')
})
test('decimal money is exact and malformed inputs are rejected', () => {
  assert.equal(fundAmount('0.29'), 29); assert.equal(fundAmount('100.01'), 10001)
  for (const n of ['', '-1', 'NaN', '1.001', '1,000', '1e5', '100000000']) assert.throws(() => fundAmount(n))
  const s = sample(); s.period = '2026-13'; assert.throws(() => planCommunityFund(s))
})
test('English and Urdu summaries never include member references', () => {
  const r = planCommunityFund(sample())
  for (const language of ['en','ur']) { const s = fundSummary(r, language); assert.ok(!s.includes('UNIT-A')); assert.ok(s.includes('5,500.00')); assert.ok(s.includes('4,000.00')) }
})

test('a budget surplus can absorb some outstanding contributions', () => {
  const r = planCommunityFund({ ...sample(), opening: '0',
    members: [{ id: 'A', agreed: '300', waived: '0', received: '100' }],
    expenses: [{ id: 'COST', approved: '200', paid: '0' }],
  })
  assert.equal(r.outstanding, 20000)
  assert.equal(r.fundingGap, 10000)
  assert.equal(r.structuralGap, 0)
})

test('positive closing cash can still mean protected excess has been spent', () => {
  const r = planCommunityFund({ ...sample(), opening: '0',
    members: [{ id: 'A', agreed: '100', waived: '0', received: '150' }],
    expenses: [{ id: 'COST', approved: '120', paid: '120' }],
  })
  assert.equal(r.closingCash, 3000)
  assert.equal(r.credits, 5000)
  assert.equal(r.unrestricted, -2000)
  assert.equal(r.remaining, 0)
  assert.equal(r.fundingGap, 2000)
  assert.equal(r.reconcile, true)
})

test('all expenses marked paid cannot hide a negative cash reconciliation', () => {
  const s = sample()
  s.expenses.forEach(row => { row.paid = row.approved })
  const r = planCommunityFund(s)
  assert.equal(r.remaining, 0)
  assert.equal(r.closingCash, -450000)
  assert.equal(r.unrestricted, -550000)
  assert.equal(r.fundingGap, 550000)
  assert.equal(r.reconcile, true)
})

test('cash and contribution conservation hold across partial, reduced and excess receipts', () => {
  for (const opening of ['0', '0.29', '10']) {
    for (const agreed of ['0', '0.29', '5']) {
      for (const waived of ['0', agreed]) {
        for (const received of ['0', '0.01', '0.29', '7']) {
          for (const paid of ['0', '0.29', '8']) {
            const r = planCommunityFund({ ...sample(), opening,
              members: [{ id: 'A', agreed, waived, received }],
              expenses: [{ id: 'COST', approved: '8', paid }],
            })
            const m = r.members[0]
            assert.equal(m.agreed, m.waived + m.allocated + m.outstanding)
            assert.equal(m.received, m.allocated + m.credit)
            assert.equal(r.opening + r.received, r.paid + r.unrestricted + r.credits)
            assert.equal(r.approved, r.paid + r.remaining)
            assert.equal(r.fundingGap - r.uncommittedAfterExpenses, r.remaining - r.unrestricted)
            assert.equal(r.reconcile, r.unrestricted < 0)
            for (const value of [r.netDues, r.received, r.closingCash, r.fundingGap]) assert.ok(Number.isSafeInteger(value))
          }
        }
      }
    }
  }
})

test('largest supported row counts and amounts stay exact', () => {
  const r = planCommunityFund({ ...sample(), opening: '99999999.99',
    members: Array.from({ length: 50 }, (_, i) => ({ id: `A-${i}`, agreed: '99999999.99', waived: '0', received: '99999999.99' })),
    expenses: Array.from({ length: 20 }, (_, i) => ({ id: `COST-${i}`, approved: '99999999.99', paid: '99999999.99' })),
  })
  assert.equal(r.received, 499999999950)
  assert.equal(r.closingCash, 309999999969)
  assert.equal(r.uncommittedAfterExpenses, 309999999969)
  assert.equal(r.fundingGap, 0)
})

test('row order does not change totals and planning never mutates its input', () => {
  const s = sample(), before = structuredClone(s)
  const a = planCommunityFund(s)
  assert.deepEqual(s, before)
  s.members.reverse(); s.expenses.reverse()
  const b = planCommunityFund(s)
  for (const key of ['opening', 'received', 'netDues', 'outstanding', 'credits', 'approved', 'paid', 'remaining', 'closingCash', 'unrestricted', 'fundingGap', 'structuralGap']) assert.equal(a[key], b[key], key)
})

test('aggregate summaries carry cash reconciliation and show warnings before amounts', () => {
  const r = planCommunityFund(sample())
  const en = fundSummary(r), ur = fundSummary(r, 'ur')
  for (const text of [en, ur]) {
    for (const value of ['5,000.00', '11,000.00', '10,500.00', '9,500.00', '1,000.00', '20,000.00', '7,000.00', '8,500.00', '7,500.00', '13,000.00']) assert.ok(text.includes(value), value)
    for (const row of [...r.members, ...r.expenses]) assert.ok(!text.includes(row.id))
  }
  assert.match(en.split('\n')[1], /not independently verified/)
  assert.ok(!en.includes('Confirmed receipts'))
  assert.ok(!ur.includes('تصدیق شدہ وصولی'))
  assert.ok(ur.includes('\u2066PKR 8,500.00\u2069'))
  const negative = sample(); negative.opening = '0'; negative.members.forEach(row => { row.received = '0' })
  const report = planCommunityFund(negative)
  assert.match(fundSummary(report).split('\n')[1], /RECONCILE RECORDS FIRST/)
  assert.match(fundSummary(report).split('\n')[1], /not independently verified/)
  assert.match(fundSummary(report, 'ur').split('\n')[1], /پہلے حساب کی جانچ/)
  assert.ok(fundSummary(report).includes('PKR -7,000.00'))
})
