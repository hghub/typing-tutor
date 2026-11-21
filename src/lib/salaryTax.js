// Base salary-tax estimates only. Do not reuse for business or mixed income.
// TY 2027: FBR Circular 02 of 2026-27, 8 Sep 2026, page 4, items 7 and 8.
// TY 2026: Finance Act 2025 salaried table and section 4AB.
export const SALARY_TAX_VERIFIED = '2026-11-16'
export const SALARY_TAX_SOURCE = 'https://download1.fbr.gov.pk/Docs/202698139527880CircularNo.2of2026-27.pdf'
export const MAX_SALARY_INCOME = 100_000_000 // Higher-income/super-tax cases need separate treatment.

export const SALARY_YEARS = {
  2027: {
    label: 'TY 2027 · FY 2026–27', period: '1 July 2026 – 30 June 2027', act: 'Finance Act 2026', surcharge: 0,
    // Each row is [upper limit, lower threshold, fixed tax, marginal rate].
    slabs: [[600000, 0, 0, 0], [1200000, 600000, 0, .01], [2200000, 1200000, 6000, .11],
      [3200000, 2200000, 116000, .20], [4100000, 3200000, 316000, .25],
      [5600000, 4100000, 541000, .29], [7000000, 5600000, 976000, .32], [Infinity, 7000000, 1424000, .35]],
  },
  2026: {
    label: 'TY 2026 · FY 2025–26', period: '1 July 2025 – 30 June 2026', act: 'Finance Act 2025', surcharge: .09,
    slabs: [[600000, 0, 0, 0], [1200000, 600000, 0, .01], [2200000, 1200000, 6000, .11],
      [3200000, 2200000, 116000, .23], [4100000, 3200000, 346000, .30], [Infinity, 4100000, 616000, .35]],
  },
}

export function estimateSalaryTax(annualIncome, year = 2027) {
  const rules = SALARY_YEARS[year]
  if (!rules) throw new RangeError('Choose a supported tax year.')
  if (typeof annualIncome !== 'number' || !Number.isFinite(annualIncome) || annualIncome < 0 || annualIncome > MAX_SALARY_INCOME) {
    throw new RangeError('Enter annual taxable salary between PKR 0 and 100 million. Higher-income cases need a separate assessment.')
  }
  const [, threshold, fixed, rate] = rules.slabs.find(([upper]) => annualIncome <= upper)
  const baseTax = fixed + (annualIncome - threshold) * rate
  const surcharge = annualIncome > 10_000_000 ? baseTax * rules.surcharge : 0
  const tax = baseTax + surcharge
  return { tax, baseTax, surcharge, effectiveRate: annualIncome ? tax / annualIncome : 0,
    marginalRate: rate, threshold, fixed, annualNet: annualIncome - tax, averageMonthlyTax: tax / 12 }
}
