// Deliberately bounded mapping interpreter; never evaluates uploaded/generated code.
export const MIGRATION_SAMPLES = {
  customer: { name: 'Customer response mapping', mappings: [{ source: 'id', target: 'customerId', fallback: 'UNKNOWN' }, { source: 'name', target: 'displayName', fallback: 'Guest' }], unsupported: [], fixtures: [ { name: 'Normal customer', input: { id: 'C-101', name: 'Sample Buyer' } }, { name: 'Missing name', input: { id: 'C-102' } }, { name: 'Explicit null', input: { id: 'C-103', name: null } }, { name: 'Empty string stays empty', input: { id: 'C-104', name: '' } }, { name: 'False and zero stay intact', input: { id: 0, name: false } } ] },
  unsupported: { name: 'Order flow with operational gaps', mappings: [{ source: 'id', target: 'orderId', fallback: 'UNKNOWN' }], unsupported: ['Custom payment connector', 'Retry / idempotency behaviour', 'Secret and environment configuration'], fixtures: [{ name: 'Normal order', input: { id: 'O-201' } }, { name: 'Null order reference', input: { id: null } }] },
}
const keyPattern = /^[A-Za-z][A-Za-z0-9]{0,39}$/
export function validateMapping(spec) {
  if (!spec || !Array.isArray(spec.mappings) || !spec.mappings.length || spec.mappings.length > 20) throw new Error('Use 1–20 mappings.')
  const targets = new Set()
  for (const m of spec.mappings) {
    if (!keyPattern.test(m.source) || !keyPattern.test(m.target) || ['constructor', 'prototype', '__proto__'].includes(m.source) || ['constructor', 'prototype', '__proto__'].includes(m.target) || typeof m.fallback !== 'string' || m.fallback.length > 100 || targets.has(m.target)) throw new Error('Mappings require unique simple target keys, simple source keys and short string defaults.')
    targets.add(m.target)
  }
}
export function mapFixture(input, mappings, nullSafe) {
  const result = {}
  for (const m of mappings) {
    const value = Object.hasOwn(input, m.source) ? input[m.source] : undefined
    result[m.target] = nullSafe ? (value ?? m.fallback) : (value === undefined ? m.fallback : value)
  }
  return result
}
export function parseFixtures(text) {
  if (text.length > 12000) throw new Error('Fixture JSON is limited to 12,000 characters.')
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Enter a valid JSON array of named fixtures.') }
  if (!Array.isArray(data) || data.length < 1 || data.length > 20) throw new Error('Use 1–20 synthetic fixtures.')
  for (const f of data) {
    if (!f || typeof f.name !== 'string' || !f.name.trim() || f.name.length > 100 || !f.input || typeof f.input !== 'object' || Array.isArray(f.input) || Object.values(f.input).some(v => v !== null && !['string', 'number', 'boolean'].includes(typeof v))) throw new Error('Each fixture needs a short name and a flat input object containing scalar values.')
  }
  return data
}
export function runMigrationEvidence(spec, fixtures, nullSafe = false) {
  validateMapping(spec)
  const checks = fixtures.map((f, i) => {
    const expected = mapFixture(f.input, spec.mappings, true)
    const actual = mapFixture(f.input, spec.mappings, nullSafe)
    const differences = spec.mappings.filter(m => !Object.is(expected[m.target], actual[m.target])).map(m => ({ field: m.target, expected: expected[m.target], actual: actual[m.target] }))
    return { id: i, name: f.name, input: f.input, expected, actual, differences, pass: differences.length === 0 }
  })
  return { scope: 'Synthetic browser interpreter checks only; no Mule/Ballerina runtime or compiler executed.', checks, passed: checks.filter(c => c.pass).length, total: checks.length, blockers: [...spec.unsupported], verdict: checks.some(c => !c.pass) ? 'Contract differences found' : spec.unsupported.length ? 'Fixture checks pass; manual gaps remain' : 'Fixture checks pass; runtime validation still required', compiler: 'Not run', runtime: 'Not run', model: 'Not connected' }
}
export function migrationSnippets(spec, nullSafe) {
  validateMapping(spec)
  const source = '%dw 2.0\noutput application/json\n---\n{\n' + spec.mappings.map(m => `  ${m.target}: payload.${m.source} default ${JSON.stringify(m.fallback)}`).join(',\n') + '\n}'
  const target = '// Illustrative Ballerina template; NOT compiled or runtime-tested.\nfunction mapPayload(map<json> payload) returns map<json> {\n  return {\n' + spec.mappings.map(m => `    ${m.target}: ${nullSafe ? `(payload["${m.source}"] is () ? ${JSON.stringify(m.fallback)} : payload["${m.source}"])` : `payload["${m.source}"] // Deliberate missing null-default handling`}`).join(',\n') + '\n  };\n}'
  return { source, target }
}
