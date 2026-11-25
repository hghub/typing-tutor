// Narrow scenario arithmetic, not a tax assessment, eligibility check or allocation advice.
export const TAX_CREDIT_SOURCE = 'https://download1.fbr.gov.pk/Docs/2026724177725705IncomeTaxOrdinanace2001.pdf'
export const TAX_CREDIT_PERIOD = 'TY 2027 · 1 July 2026–30 June 2027 (normal tax year)'
export const TAX_CREDIT_REVIEW = '25 November 2026'
export const TAX_CREDIT_SAMPLE = Object.freeze({ taxableIncome: '3000000', taxBeforeCredits: '276000', payment: '300000', kind: 'pension', relationship: 'unrelated', basisConfirmed: false, eligibilityConfirmed: false })
const labels = { taxableIncome: 'Taxable income', taxBeforeCredits: 'Tax before Part X credits', payment: 'Contribution or donation' }
function amount(input, key) {
  const value = input[key]
  if (!['string', 'number'].includes(typeof value) || String(value).length > 14 || !/^\d+(\.\d{1,2})?$/.test(String(value))) throw new Error(`${labels[key]} requires an amount with up to two decimals. Enter 0 explicitly when applicable.`)
  const [whole, fraction = ''] = String(value).split('.')
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (minor > 10000000000n) throw new Error(`${labels[key]} must not exceed PKR 100 million in this planner.`)
  return minor
}
export function planTaxCredit(input) {
  const income = amount(input, 'taxableIncome'), tax = amount(input, 'taxBeforeCredits'), payment = amount(input, 'payment')
  if (income <= 0n) throw new Error('Taxable income must be greater than zero.')
  if (tax > income) throw new Error('Tax before credits cannot exceed taxable income in this limited scenario.')
  if (!['pension', 'donation'].includes(input.kind)) throw new Error('Choose a supported pension or donation scenario. Insurance is excluded.')
  if (input.basisConfirmed !== true) throw new Error('Confirm the reviewed tax and taxable-income bases for the selected normal tax year.')
  if (payment > 0n && input.eligibilityConfirmed !== true) throw new Error('Confirm eligibility assumptions for this scenario before calculating a credit.')
  if (input.kind === 'donation' && !['unrelated', 'associate'].includes(input.relationship)) throw new Error('Choose one reviewed donation relationship. Mixed or unknown relationships require a separate assessment.')
  const capPct = input.kind === 'pension' ? 20 : input.relationship === 'associate' ? 15 : 30
  const cap = income * BigInt(capPct) / 100n
  const eligible = payment < cap ? payment : cap
  // Half-up rounding to the nearest paisa for this planning illustration only.
  const calculated = (tax * eligible + income / 2n) / income
  const credit = calculated < tax ? calculated : tax
  return { income: Number(income), tax: Number(tax), payment: Number(payment), capPct, cap: Number(cap), eligible: Number(eligible), excess: Number(payment - eligible), credit: Number(credit), taxAfter: Number(tax - credit) }
}
export function taxCreditSummary(input, r) {
  const money = n => `PKR ${(n / 100).toFixed(2)}`
  return ['Rafiqy tax-credit scenario — not a return, eligibility determination or refund calculation', TAX_CREDIT_PERIOD, `Source reviewed: ${TAX_CREDIT_REVIEW}; FBR consolidation amended through 30 June 2026`, `Scenario: ${input.kind === 'pension' ? 'Section 63 approved pension contribution' : `Section 61 donation (${input.relationship})`}`, 'Eligibility and common tax/income bases are user-confirmed assumptions, not verified by Rafiqy.', `Taxable income B: ${money(r.income)}`, `Tax before Part X credits A: ${money(r.tax)}`, `Entered payment: ${money(r.payment)}`, `Contribution cap (${r.capPct}% of B): ${money(r.cap)}`, `Amount used in credit formula C: ${money(r.eligible)}`, `Payment above model cap: ${money(r.excess)}`, `Illustrative credit (A / B) × C: ${money(r.credit)}`, `Tax after this one credit: ${money(r.taxAfter)}`, 'Contribution remains a cash commitment; the credit is not cash received or an investment return. No withholding adjustment, other credits, refund, carryforward, product allocation or filing certification. Contribution cap rounded down and credit rounded half-up to paisa for planning, not prescribed filing rounding. Normal individual scenario only; no mixed donations, non-cash gifts, AOP-member or special-year treatment.', `Primary source: ${TAX_CREDIT_SOURCE}`].join('\n')
}
