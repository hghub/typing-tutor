// Synthetic, delimiter-based purchase-order workflow. No OCR, LLM or network calls.
export const CATALOG = [
  { sku: 'BOX-L-W', name: 'Large white takeaway box', aliases: ['large takeaway box', 'white large box'], unit: 'each', price: 0.4 },
  { sku: 'BOX-L-K', name: 'Large kraft takeaway box', aliases: ['large takeaway box', 'kraft large box'], unit: 'each', price: 0.45 },
  { sku: 'CUP-12', name: '12oz paper cup', aliases: ['paper cup 12oz', '12oz cup'], unit: 'each', price: 0.12 },
]
export const ORDER_SAMPLES = {
  exceptions: 'PO: DEMO-1042\nCustomer: Example Kitchens (synthetic)\nCurrency: USD\nItem | Quantity | Unit | Unit price\nlarge takeaway box | 200 | each | 0.40\n12oz cup | 500 | each | 0.10\nDeclared subtotal: 130.00',
  clean: 'PO: DEMO-1043\nCustomer: Sample Cafe (synthetic)\nCurrency: USD\nItem | Quantity | Unit | Unit price\nBOX-L-W | 100 | each | 0.40\nCUP-12 | 250 | each | 0.12\nDeclared subtotal: 70.00',
  duplicate: 'PO: DEMO-1001\nCustomer: Sample Cafe (synthetic)\nCurrency: USD\nItem | Quantity | Unit | Unit price\nCUP-12 | 100 | each | 0.12\nDeclared subtotal: 12.00',
}
export const RECORDED_ORDER_REFS = ['DEMO-1001']
const norm = s => s.trim().toLowerCase()
const cents = n => Math.round(n * 100)
const moneyPattern = /^\d+(?:\.\d{1,2})?$/
export function parseOrder(text) {
  if (typeof text !== 'string' || text.length > 12000) throw new Error('Use at most 12,000 characters of synthetic text.')
  const lines = text.split(/\r?\n/)
  const read = label => {
    const matches = lines.map((line, i) => ({ line, number: i + 1 })).filter(x => x.line.startsWith(`${label}:`))
    if (matches.length !== 1 || !matches[0].line.split(':').slice(1).join(':').trim()) throw new Error(`Exactly one ${label}: field is required.`)
    return matches[0].line.slice(label.length + 1).trim()
  }
  const reference = read('PO'), customer = read('Customer'), currency = read('Currency')
  if (!/^[A-Z0-9-]{1,40}$/.test(reference)) throw new Error('PO reference must use 1–40 uppercase letters, digits or hyphens.')
  if (currency !== 'USD') throw new Error('This synthetic catalogue supports USD only; no currency conversion is performed.')
  const declared = read('Declared subtotal')
  if (!moneyPattern.test(declared) || Number(declared) > 1e8) throw new Error('Declared subtotal must be a nonnegative amount with at most two decimals.')
  const header = lines.findIndex(l => l.trim() === 'Item | Quantity | Unit | Unit price')
  if (header < 0) throw new Error('Keep the exact four-column Item | Quantity | Unit | Unit price header.')
  const rows = []
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim() || i === header || /^(PO|Customer|Currency|Declared subtotal):/.test(lines[i])) continue
    if (i < header || !lines[i].includes('|')) throw new Error(`Unsupported text at line ${i + 1}; use the sample layout.`)
    const parts = lines[i].split('|').map(s => s.trim())
    if (parts.length !== 4 || !parts[0] || !/^\d+$/.test(parts[1]) || Number(parts[1]) < 1 || Number(parts[1]) > 1e6 || !parts[2] || !moneyPattern.test(parts[3]) || Number(parts[3]) > 1e6) throw new Error(`Line ${i + 1}: provide a description, positive whole quantity, unit and valid unit price.`)
    rows.push({ id: i + 1, evidence: lines[i], description: parts[0], quantity: Number(parts[1]), unit: parts[2], price: Number(parts[3]) })
  }
  if (!rows.length || rows.length > 20) throw new Error('Provide between 1 and 20 item lines.')
  return { reference, customer, currency, declaredCents: cents(Number(declared)), rows }
}
export function candidatesFor(row) {
  return CATALOG.filter(p => norm(p.sku) === norm(row.description) || norm(p.name) === norm(row.description) || p.aliases.some(a => norm(a) === norm(row.description)))
}
export function reviewOrder(order, choices = {}) {
  const problems = []
  if (RECORDED_ORDER_REFS.includes(order.reference)) problems.push('Reference already exists in the synthetic order ledger. Resolve the duplicate before export.')
  const rows = order.rows.map(row => {
    const candidates = candidatesFor(row)
    const choice = choices[row.id] || {}
    const product = CATALOG.find(p => p.sku === choice.sku) || (candidates.length === 1 ? candidates[0] : null)
    const issues = []
    if (!product) issues.push(candidates.length ? 'Choose which product the customer intended.' : 'No catalogue match. Select a product only after verifying the intended item.')
    if (product && norm(row.unit) !== norm(product.unit)) issues.push(`Unit mismatch: catalogue uses ${product.unit}. Correct the source or confirm a unit conversion outside this demo.`)
    const priceMismatch = product && cents(row.price) !== cents(product.price)
    if (priceMismatch && (!choice.acceptPrice || !choice.reason?.trim() || choice.reason.trim().length < 8)) issues.push('Quoted price differs from catalogue. Record a reason and explicitly accept this synthetic exception.')
    if (product && !candidates.some(p => p.sku === product.sku) && (!choice.reason?.trim() || choice.reason.trim().length < 8)) issues.push('Manual product mapping requires a verification note of at least eight characters.')
    return { ...row, candidates, product, issues, priceMismatch, reason: choice.reason?.trim() || '', acceptedPrice: !!choice.acceptPrice, lineCents: cents(row.price) * row.quantity }
  })
  const subtotalCents = rows.reduce((sum, r) => sum + r.lineCents, 0)
  if (subtotalCents !== order.declaredCents) problems.push('Declared subtotal does not match item arithmetic. Correct the source text before export.')
  return { ...order, rows, subtotalCents, problems, ready: !problems.length && rows.every(r => !r.issues.length) }
}
// Quote every value; neutralize formula prefixes for spreadsheet export.
export function safeCsvCell(value) {
  const s = String(value)
  return '"' + (/^[\s]*[=+\-@\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
}
export function exportOrderCsv(review, approved) {
  if (!review.ready || !approved) throw new Error('Resolve all exceptions and approve this exact draft before exporting.')
  const table = [['status', 'reference', 'customer', 'currency', 'source_line', 'sku', 'quantity', 'unit', 'unit_price', 'line_total', 'review_note'], ...review.rows.map(r => ['SYNTHETIC DRAFT — NOT SENT', review.reference, review.customer, review.currency, r.id, r.product.sku, r.quantity, r.unit, r.price.toFixed(2), (r.lineCents / 100).toFixed(2), r.reason])]
  return table.map(row => row.map(safeCsvCell).join(',')).join('\r\n')
}
