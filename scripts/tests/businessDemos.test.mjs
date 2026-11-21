import test from 'node:test'
import assert from 'node:assert/strict'
import { CATALOG, ORDER_SAMPLES, parseOrder, reviewOrder, exportOrderCsv, safeCsvCell } from '../../src/lib/orderReview.js'
import { MIGRATION_SAMPLES, parseFixtures, runMigrationEvidence, migrationSnippets, validateMapping } from '../../src/lib/migrationEvidence.js'

test('clean order reconciles exact money and exports only with approval', () => {
  const r = reviewOrder(parseOrder(ORDER_SAMPLES.clean))
  assert.equal(r.ready, true); assert.equal(r.subtotalCents, 7000)
  assert.throws(() => exportOrderCsv(r, false), /approve/)
  const csv = exportOrderCsv(r, true)
  assert.match(csv, /SYNTHETIC DRAFT/); assert.match(csv, /CUP-12/); assert.match(csv, /30.00/)
})
test('ambiguous product and price mismatch both block export until reviewed', () => {
  const order = parseOrder(ORDER_SAMPLES.exceptions), [box, cup] = order.rows
  const blocked = reviewOrder(order)
  assert.equal(blocked.rows[0].candidates.length, 2); assert.equal(blocked.ready, false)
  assert.throws(() => exportOrderCsv(blocked, true), /Resolve/)
  const ready = reviewOrder(order, { [box.id]: { sku: 'BOX-L-W' }, [cup.id]: { acceptPrice: true, reason: 'Synthetic contract price confirmed' } })
  assert.equal(ready.ready, true); assert.equal(ready.subtotalCents, 13000)
  assert.equal(ready.rows[1].price, 0.1)
})
test('accepting a price without an adequate reason cannot clear the exception', () => {
  const o = parseOrder(ORDER_SAMPLES.exceptions)
  assert.equal(reviewOrder(o, { [o.rows[0].id]: { sku: 'BOX-L-W' }, [o.rows[1].id]: { acceptPrice: true, reason: 'ok' } }).ready, false)
})
test('duplicates and incorrect subtotals cannot be approved away', () => {
  const dup = reviewOrder(parseOrder(ORDER_SAMPLES.duplicate))
  assert.equal(dup.ready, false); assert.match(dup.problems[0], /ledger/)
  const wrong = reviewOrder(parseOrder(ORDER_SAMPLES.clean.replace('70.00', '71.00')))
  assert.equal(wrong.ready, false); assert.match(wrong.problems[0], /arithmetic/)
})
test('units require actual source correction; a mapping note cannot invent a conversion', () => {
  const o = parseOrder(ORDER_SAMPLES.clean.replace('100 | each', '100 | carton'))
  const r = reviewOrder(o, { [o.rows[0].id]: { sku: 'BOX-L-W', reason: 'Synthetic check done' } })
  assert.equal(r.ready, false); assert.match(r.rows[0].issues[0], /Unit mismatch/)
})
test('unknown product needs an explicit catalogue mapping and verification note', () => {
  const o = parseOrder(ORDER_SAMPLES.clean.replace('BOX-L-W', 'mystery box')), id = o.rows[0].id
  assert.equal(reviewOrder(o).ready, false)
  assert.equal(reviewOrder(o, { [id]: { sku: CATALOG[0].sku } }).ready, false)
  assert.equal(reviewOrder(o, { [id]: { sku: CATALOG[0].sku, reason: 'Synthetic customer confirmation' } }).ready, true)
})
test('parser rejects malformed, negative, nonfinite, excess precision and mixed currency data', () => {
  for (const text of [ORDER_SAMPLES.clean.replace('100 | each', '-1 | each'), ORDER_SAMPLES.clean.replace('0.40', 'Infinity'), ORDER_SAMPLES.clean.replace('0.40', '0.401'), ORDER_SAMPLES.clean.replace('Currency: USD', 'Currency: PKR'), ORDER_SAMPLES.clean + '\nPO: DUP', ORDER_SAMPLES.clean + '\nunrecognized text']) assert.throws(() => parseOrder(text))
})
test('CSV quotes separators and neutralizes spreadsheet formula prefixes', () => {
  assert.equal(safeCsvCell('=1+1'), '"\'=1+1"')
  assert.equal(safeCsvCell('  @SUM(A1)'), '"\'  @SUM(A1)"')
  assert.equal(safeCsvCell('a,"b"'), '"a,""b"""')
})
test('incomplete mapping fails explicit null but preserves false, zero and empty string', () => {
  const s = MIGRATION_SAMPLES.customer, r = runMigrationEvidence(s, s.fixtures)
  assert.equal(r.passed, 4); assert.equal(r.total, 5)
  assert.deepEqual(r.checks[2].differences, [{ field: 'displayName', expected: 'Guest', actual: null }])
  assert.deepEqual(r.checks[4].actual, { customerId: 0, displayName: false })
  assert.equal(r.checks[3].actual.displayName, '')
})
test('corrected mapping agrees on declared fixtures but does not claim compilation', () => {
  const s = MIGRATION_SAMPLES.customer, r = runMigrationEvidence(s, s.fixtures, true)
  assert.equal(r.passed, 5); assert.equal(r.compiler, 'Not run'); assert.equal(r.runtime, 'Not run'); assert.equal(r.model, 'Not connected')
  assert.match(r.verdict, /runtime validation still required/)
})
test('manual gaps survive passing mapping checks', () => {
  const s = MIGRATION_SAMPLES.unsupported, r = runMigrationEvidence(s, s.fixtures, true)
  assert.equal(r.passed, 2); assert.equal(r.blockers.length, 3); assert.match(r.verdict, /manual gaps remain/)
})
test('fixtures reject malformed or executable-shaped content without evaluating it', () => {
  for (const s of ['console.log(1)', '[]', '[{"name":"x","input":[]}]', '[{"name":"x","input":{"nested":{}}}]', 'x'.repeat(12001)]) assert.throws(() => parseFixtures(s))
  assert.equal(parseFixtures(JSON.stringify(MIGRATION_SAMPLES.customer.fixtures)).length, 5)
})
test('mapping templates are bounded and refuse duplicate or dangerous keys', () => {
  assert.throws(() => validateMapping({ mappings: [{ source: 'constructor', target: 'id', fallback: '' }] }))
  assert.throws(() => validateMapping({ mappings: [{ source: 'a', target: 'id', fallback: '' }, { source: 'b', target: 'id', fallback: '' }] }))
  const snippets = migrationSnippets(MIGRATION_SAMPLES.customer, true)
  assert.match(snippets.source, /payload.name default "Guest"/)
  assert.match(snippets.target, /NOT compiled/)
  assert.match(snippets.target, /is \(\)/)
})
